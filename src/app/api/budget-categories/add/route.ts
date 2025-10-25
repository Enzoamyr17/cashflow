import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { Decimal } from '@/generated/prisma/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const { budget_frame_id, category_id, planned_amount, is_monthly } = await request.json();

    if (!budget_frame_id) {
      return NextResponse.json({ error: 'Budget frame ID is required.' }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const budgetCategory = await prisma.budget_categories.create({
      data: {
        budget_frame_id,
        category_id,
        planned_amount: new Decimal(planned_amount || 0),
        is_monthly: is_monthly || false,
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        }
      }
    });

    return NextResponse.json({ budgetCategory });
  } catch (error) {
    console.error('Error adding category to budget:', error);
    return NextResponse.json({ error: 'Failed to add category to budget' }, { status: 500 });
  }
}
