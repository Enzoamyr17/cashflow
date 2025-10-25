import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';


export async function POST(request: NextRequest) {
  try {
    const { userId, filterStartDate, filterEndDate, type, categoryId, budgetFrameId, isBudgetPage = false } = await request.json();

    // return NextResponse.json({ userId, filterStartDate, filterEndDate, type, categoryId }, { status: 200 });
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const whereClause: Record<string, unknown> = {
      user_id: userId,
    };

    // Add date filtering if provided
    if (filterStartDate && filterEndDate) {
      const startDate = new Date(filterStartDate);
      const endDate = new Date(filterEndDate);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (type) whereClause.type = type;
    if (categoryId) whereClause.category_id = categoryId;
    if (budgetFrameId) whereClause.budget_frame_id = budgetFrameId;

    if (!isBudgetPage) {
      // Dashboard should show:
      // - Regular transactions (is_planned: false, is_completed: false)
      // - Completed transactions (is_completed: true, regardless of is_planned)
      whereClause.OR = [
        { is_planned: false, is_completed: false },
        { is_completed: true },
      ];
    }

    const transactions = await prisma.transactions.findMany({
      where: whereClause,
      include:{
        categories:{
          select:{
            id: true,
            name: true,
            color: true,
            is_budgeted: true,
          }
        }
      }
    });

    if (transactions.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({error: error instanceof Error ? error.message : 'Failed to fetch transactions'}, { status: 500 });
  }
}
