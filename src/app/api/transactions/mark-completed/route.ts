import { NextRequest, NextResponse } from 'next/server';
import { markTransactionCompleted } from '@/server/transactions';

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const transaction = await markTransactionCompleted(transactionId);

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error marking transaction as completed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark transaction as completed' },
      { status: 500 }
    );
  }
}
