import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { Decimal } from '@/generated/prisma/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const { id, planned_amount, is_monthly } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Budget category ID is required.' }, { status: 400 });
    }

    const updateData: {
      planned_amount?: Decimal;
      is_monthly?: boolean;
    } = {};
    if (planned_amount !== undefined) updateData.planned_amount = new Decimal(planned_amount);
    if (is_monthly !== undefined) updateData.is_monthly = is_monthly;

    const budgetCategory = await prisma.budget_categories.update({
      where: { id },
      data: updateData,
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
    console.error('Error updating budget category:', error);
    return NextResponse.json({ error: 'Failed to update budget category' }, { status: 500 });
  }
}
