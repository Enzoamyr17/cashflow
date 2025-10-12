import { NextRequest, NextResponse } from 'next/server';
import { updateTransaction } from '@/server/transactions';
import { UpdateTransactionInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();

    const transaction = await updateTransaction(input as UpdateTransactionInput);

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
