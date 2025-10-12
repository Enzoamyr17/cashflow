import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { hashPassword, validatePasswordStrength } from '@/lib/password';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';
import { getUserByEmail, getUserById } from '@/server/users';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, password } = await request.json();

    if (!userId || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message || 'Invalid password' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: 'Email is already in use by another account' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setMinutes(verificationExpires.getMinutes() + 15);

    // Update user with new credentials
    await prisma.users.update({
      where: { id: userId },
      data: {
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        email_verified: false,
        verification_code: verificationCode,
        verification_code_expires: verificationExpires,
      },
    });

    // Get user name for email
    const user = await getUserById(userId);

    // Send verification email
    await sendVerificationEmail(email, verificationCode, user?.name || undefined);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Error updating credentials:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update credentials' },
      { status: 500 }
    );
  }
}
