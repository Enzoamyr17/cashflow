import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const { userCode } = await request.json();

    if (!userCode || userCode.trim() === '') {
      return NextResponse.json(
        { error: 'User code is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await prisma.users.findUnique({
      where: { user_code: userCode },
    });

    if (!user) {
      // Create new user
      user = await prisma.users.create({
        data: { user_code: userCode },
      });
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
