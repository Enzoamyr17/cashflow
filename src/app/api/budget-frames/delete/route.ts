import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const { budgetFrameId } = await request.json();

    if (!budgetFrameId) {
      return NextResponse.json({ error: 'Budget frame ID is required.' }, { status: 400 });
    }

    // Delete budget frame (cascade will handle budget_categories and set transactions.budget_frame_id to null)
    await prisma.budget_frames.delete({
      where: { id: budgetFrameId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget frame:', error);
    return NextResponse.json({ error: 'Failed to delete budget frame' }, { status: 500 });
  }
}
