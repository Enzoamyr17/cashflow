import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { Decimal } from '@/generated/prisma/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const { user_id, name, start_date, end_date, starting_balance, categories } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Budget name is required.' }, { status: 400 });
    }
    if (!start_date) {
      return NextResponse.json({ error: 'Start date is required.' }, { status: 400 });
    }
    if (!end_date) {
      return NextResponse.json({ error: 'End date is required.' }, { status: 400 });
    }

    // Create budget frame with categories in a transaction
    const budgetFrame = await prisma.budget_frames.create({
      data: {
        user_id,
        name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        starting_balance: new Decimal(starting_balance || 0),
        budget_categories: categories ? {
          create: categories.map((cat: {
            category_id: string;
            planned_amount: number;
            is_monthly: boolean;
          }) => ({
            category_id: cat.category_id,
            planned_amount: new Decimal(cat.planned_amount || 0),
            is_monthly: cat.is_monthly || false,
          }))
        } : undefined
      },
      include: {
        budget_categories: {
          include: {
            categories: {
              select: {
                id: true,
                name: true,
                color: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ budgetFrame });
  } catch (error) {
    console.error('Error creating budget frame:', error);
    return NextResponse.json({ error: 'Failed to create budget frame' }, { status: 500 });
  }
}
