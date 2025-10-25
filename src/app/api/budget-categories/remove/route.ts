import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const { budgetCategoryId } = await request.json();

    if (!budgetCategoryId) {
      return NextResponse.json({ error: 'Budget category ID is required.' }, { status: 400 });
    }

    await prisma.budget_categories.delete({
      where: { id: budgetCategoryId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing category from budget:', error);
    return NextResponse.json({ error: 'Failed to remove category from budget' }, { status: 500 });
  }
}
