import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const { userId, budgetFrameId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // If budgetFrameId is provided, get single budget frame
    if (budgetFrameId) {
      const budgetFrame = await prisma.budget_frames.findUnique({
        where: {
          id: budgetFrameId,
          user_id: userId, // Ensure user owns this budget
        },
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
            },
            orderBy: {
              created_at: 'asc'
            }
          }
        }
      });

      if (!budgetFrame) {
        return NextResponse.json({ error: 'Budget frame not found' }, { status: 404 });
      }

      return NextResponse.json({ budgetFrame });
    }

    // Otherwise, get all budget frames for user
    const budgetFrames = await prisma.budget_frames.findMany({
      where: {
        user_id: userId,
      },
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
      },
      orderBy: {
        start_date: 'desc'
      }
    });

    return NextResponse.json({ budgetFrames });
  } catch (error) {
    console.error('Error fetching budget frames:', error);
    return NextResponse.json({ error: 'Failed to fetch budget frames' }, { status: 500 });
  }
}
