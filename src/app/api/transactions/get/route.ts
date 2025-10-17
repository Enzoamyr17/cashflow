import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';


export async function POST(request: NextRequest) {
  try {
    const { userId, filterStartDate, filterEndDate, type, categoryId, isBudgetPage = false } = await request.json();

    // return NextResponse.json({ userId, filterStartDate, filterEndDate, type, categoryId }, { status: 200 });
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const whereClause: any = {
      user_id: userId,
      date: {
        gte: new Date(filterStartDate),
        lte: new Date(filterEndDate + 'T23:59:59.999Z'),
      },
    };

    if (type) whereClause.type = type;
    if (categoryId) whereClause.category_id = categoryId;

    if (!isBudgetPage) {
      whereClause.OR = [
        { is_planned: true, is_completed: true },
        { is_planned: false, is_completed: false },
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
