import { NextRequest, NextResponse } from 'next/server';
import { updateCategory } from '@/server/categories';
import { UpdateCategoryInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();

    const category = await updateCategory(input as UpdateCategoryInput);

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update category' },
      { status: 500 }
    );
  }
}
