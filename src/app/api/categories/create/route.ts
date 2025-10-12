import { NextRequest, NextResponse } from 'next/server';
import { createCategory } from '@/server/categories';
import { CreateCategoryInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, input } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const category = await createCategory(userId, input as CreateCategoryInput);

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    );
  }
}
