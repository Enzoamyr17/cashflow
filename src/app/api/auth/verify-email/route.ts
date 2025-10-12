import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { getUserById } from '@/server/users';

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.verification_code || !user.verification_code_expires) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(user.verification_code_expires);

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if code matches
    if (user.verification_code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark email as verified and clear verification code
    await prisma.users.update({
      where: { id: userId },
      data: {
        email_verified: true,
        verification_code: null,
        verification_code_expires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify email' },
      { status: 500 }
    );
  }
}
