import { NextRequest, NextResponse } from 'next/server';
import { deleteTransaction } from '@/server/transactions';

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    await deleteTransaction(transactionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
