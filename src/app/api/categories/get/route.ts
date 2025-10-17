import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';


export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const categories = await prisma.categories.findMany({
      where:{
        user_id: userId,
      },
      select:{
            id: true,
            name: true,
            color: true,
            is_budgeted: true,
          }
        });

    if (categories.length === 0) {
      return NextResponse.json({ error: 'No categories found for user:' + userId }, { status: 404 });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
