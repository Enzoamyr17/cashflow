import { NextRequest, NextResponse } from 'next/server';
import { getBudgetSummary } from '@/server/analytics';

export async function POST(request: NextRequest) {
  try {
    const { userId, startDate, endDate, userStartingBalance, userCreatedAt } = await request.json();

    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'User ID, start date, and end date are required' },
        { status: 400 }
      );
    }

    const summary = await getBudgetSummary(
      userId,
      startDate,
      endDate,
      userStartingBalance,
      userCreatedAt
    );

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch budget summary' },
      { status: 500 }
    );
  }
}
