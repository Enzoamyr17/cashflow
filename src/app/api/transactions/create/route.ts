import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { Decimal } from '@/generated/prisma/runtime/library';
import { PaymentMethod } from '@/types';

export async function POST(request: NextRequest) {
  const { newTransaction: { user_id, category_id, type, amount, method, notes, date } } = await request.json();

  console.log(user_id, category_id, type, amount, method, notes, date);

  if (!user_id || !category_id || !type || !amount || !method || !date) {
    return NextResponse.json({ error: 'New transaction is required' }, { status: 400 });
  } 

  try {
    const transaction = await prisma.transactions.create({
      data: {
        user_id: user_id,
        category_id: category_id,
        type: type,
        amount: new Decimal(amount),
        method: method as PaymentMethod,
        notes: notes || null,
        date: new Date(date),
      }
    });
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
