import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';


export async function POST(request: NextRequest) {
  try {
    const { userId, filterStartDate, filterEndDate, type, categoryId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const transactions = await prisma.transactions.findMany({
      where:{
        user_id: userId,
        AND: [
          {
            date: {
              gte: new Date(filterStartDate),
              lte: new Date(filterEndDate + 'T23:59:59.999Z'),
            },
          },
          {
            type: type,
          },
          {
            category_id: categoryId,
          },
        ],
        OR: [
          {
            is_planned: true,
            is_completed: true,
          },
          {
            is_planned: false,
            is_completed: false,
          }
        ]
      },
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
