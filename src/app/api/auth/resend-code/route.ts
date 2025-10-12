import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';
import { getUserById } from '@/server/users';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
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

    if (!user.email) {
      return NextResponse.json(
        { error: 'No email address found for this user' },
        { status: 400 }
      );
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setMinutes(verificationExpires.getMinutes() + 15);

    // Update user with new verification code
    await prisma.users.update({
      where: { id: userId },
      data: {
        verification_code: verificationCode,
        verification_code_expires: verificationExpires,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode, user.name || undefined);

    return NextResponse.json({
      success: true,
      message: 'Verification code resent successfully',
    });
  } catch (error) {
    console.error('Error resending code:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resend code' },
      { status: 500 }
    );
  }
}
