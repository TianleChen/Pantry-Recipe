import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, quantity, unit, location, expirationDate, notes } = body;

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: {
        ...(name && { name, normalizedName: name.toLowerCase() }),
        ...(category && { category }),
        ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
        ...(unit && { unit }),
        ...(location && { location }),
        ...(expirationDate !== undefined && {
          expirationDate: expirationDate ? new Date(expirationDate) : null,
        }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('PATCH /api/ingredients/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update ingredient' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.ingredient.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/ingredients/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete ingredient' }, { status: 500 });
  }
}
