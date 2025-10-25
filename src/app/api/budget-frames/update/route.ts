import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';
import { Decimal } from '@/generated/prisma/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const { id, name, start_date, end_date, starting_balance } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Budget frame ID is required.' }, { status: 400 });
    }

    const updateData: {
      name?: string;
      start_date?: Date;
      end_date?: Date;
      starting_balance?: Decimal;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (start_date !== undefined) updateData.start_date = new Date(start_date);
    if (end_date !== undefined) updateData.end_date = new Date(end_date);
    if (starting_balance !== undefined) updateData.starting_balance = new Decimal(starting_balance);

    const budgetFrame = await prisma.budget_frames.update({
      where: { id },
      data: updateData,
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
    console.error('Error updating budget frame:', error);
    return NextResponse.json({ error: 'Failed to update budget frame' }, { status: 500 });
  }
}
