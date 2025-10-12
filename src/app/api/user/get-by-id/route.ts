import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
