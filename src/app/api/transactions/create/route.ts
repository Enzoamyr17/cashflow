import { NextRequest, NextResponse } from 'next/server';
import { createTransaction } from '@/server/transactions';
import { CreateTransactionInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, input } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const transaction = await createTransaction(userId, input as CreateTransactionInput);

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
