import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();

    if (!input.id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.planned_amount !== undefined) updateData.planned_amount = input.planned_amount;
    if (input.is_budgeted !== undefined) updateData.is_budgeted = input.is_budgeted;
    if (input.is_monthly !== undefined) updateData.is_monthly = input.is_monthly;

    const category = await prisma.categories.update({
      where: {
        id: input.id,
      },
      data: updateData,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update category' },
      { status: 500 }
    );
  }
}
