import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if already favorited
    const existing = await prisma.favoriteRecipe.findUnique({
      where: { recipeId: id },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already favorited' },
        { status: 400 }
      );
    }

    const favorite = await prisma.favoriteRecipe.create({
      data: { recipeId: id },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('POST /api/favorites/[id] error:', error);
    return NextResponse.json({ error: 'Failed to favorite recipe' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.favoriteRecipe.delete({
      where: { recipeId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/favorites/[id] error:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
