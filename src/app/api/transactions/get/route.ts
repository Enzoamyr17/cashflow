import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/server/transactions';
import { TransactionType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, filters } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const transactions = await getTransactions(userId, filters as {
      type?: TransactionType;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      isPlanned?: boolean;
      isCompleted?: boolean;
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
