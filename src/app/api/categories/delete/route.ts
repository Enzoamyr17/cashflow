import { NextRequest, NextResponse } from 'next/server';
import { deleteCategory } from '@/server/categories';

export async function POST(request: NextRequest) {
  try {
    const { categoryId } = await request.json();

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await deleteCategory(categoryId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete category' },
      { status: 500 }
    );
  }
}
