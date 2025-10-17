import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const transaction = await prisma.transactions.delete({
      where: {
        id: transactionId,
      },
    });

    console.log('Transaction deleted:', transaction);
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
