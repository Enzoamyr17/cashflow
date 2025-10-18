import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { Decimal } from '@/generated/prisma/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();

    if (!input.id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (input.category_id !== undefined) updateData.category_id = input.category_id;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.amount !== undefined) updateData.amount = new Decimal(input.amount);
    if (input.method !== undefined) updateData.method = input.method;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.date !== undefined) updateData.date = new Date(input.date);
    if (input.is_planned !== undefined) updateData.is_planned = input.is_planned;
    if (input.is_completed !== undefined) updateData.is_completed = input.is_completed;

    const transaction = await prisma.transactions.update({
      where: {
        id: input.id,
      },
      data: updateData,
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
