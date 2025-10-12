import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { verifyPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

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

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Password not set for this account' },
        { status: 400 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Convert Prisma types to JSON-serializable format
    const userResponse = {
      id: user.id,
      user_code: user.user_code,
      name: user.name,
      email: user.email,
      email_verified: user.email_verified,
      password_hash: user.password_hash,
      verification_code: user.verification_code,
      verification_code_expires: user.verification_code_expires?.toISOString() || null,
      starting_balance: Number(user.starting_balance),
      created_at: user.created_at.toISOString(),
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}
