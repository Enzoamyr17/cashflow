import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { hashPassword } from '@/lib/password';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate inputs
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || email.trim() === '') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!password || password.trim() === '') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user with this email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Generate unique user code
    let userCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      userCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await prisma.users.findUnique({
        where: { user_code: userCode },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique user code. Please try again.' },
        { status: 500 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await prisma.users.create({
      data: {
        user_code: userCode!,
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        email_verified: false,
        verification_code: verificationCode,
        verification_code_expires: verificationExpires,
        starting_balance: 0,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(normalizedEmail, verificationCode, name.trim());
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // User is created, but email failed - still return success
      // They can resend verification later
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification code.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
