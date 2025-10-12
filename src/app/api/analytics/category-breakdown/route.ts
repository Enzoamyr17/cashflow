import { NextRequest, NextResponse } from 'next/server';
import { getCategoryBreakdownForBudget } from '@/server/analytics';

export async function POST(request: NextRequest) {
  try {
    const { userId, startDate, endDate } = await request.json();

    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'User ID, start date, and end date are required' },
        { status: 400 }
      );
    }

    const breakdown = await getCategoryBreakdownForBudget(userId, startDate, endDate);

    return NextResponse.json({ breakdown });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch category breakdown' },
      { status: 500 }
    );
  }
}
