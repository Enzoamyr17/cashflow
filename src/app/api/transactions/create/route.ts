import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { Decimal } from '@/generated/prisma/runtime/library';
import { PaymentMethod } from '@/types';

export async function POST(request: NextRequest) {
  const { newTransaction: { user_id, category_id, budget_frame_id, type, amount, method, notes, date, is_completed = false, is_planned = false } } = await request.json();

  console.log(user_id, category_id, budget_frame_id, type, amount, method, notes, date);

  if(!user_id){
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }
  if(!category_id){
    return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
  }
  if(!type){
    return NextResponse.json({ error: 'Type is required.' }, { status: 400 });
  }
  if(!amount){
    return NextResponse.json({ error: 'Amount is required.' }, { status: 400 });
  }
  if(!method){
    return NextResponse.json({ error: 'Method is required.' }, { status: 400 });
  }
  if(!date){
    return NextResponse.json({ error: 'Date is required.' }, { status: 400 });
  }

  try {
    const transaction = await prisma.transactions.create({
      data: {
        user_id: user_id,
        category_id: category_id,
        budget_frame_id: budget_frame_id || null,
        type: type,
        amount: new Decimal(amount),
        method: method as PaymentMethod,
        notes: notes || null,
        date: new Date(date),
        is_completed: is_completed,
        is_planned: is_planned,
      }
    });
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
