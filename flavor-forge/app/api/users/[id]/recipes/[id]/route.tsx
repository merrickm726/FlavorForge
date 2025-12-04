import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/*
 * DELETE Route for User Recipes (using user id)
 * Validates user id
 * If valid, returns true and the user recipe json
 * Otherwise, returns false and error status
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, recipeID: string }> }) {
  try {
    const { id, recipeID } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!recipeID) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    // Find recipe to ensure it exists
    const recipe = await prisma.recipe.findFirst({
        where: {
        id: recipeID,
        creatorId: id,
        },
    });

    if (!recipe) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    await prisma.recipe.delete({
        where: {
        id: recipeID
        },
    });

    return NextResponse.json({ success: true, recipe });
  } 
  catch (error: any) {
    console.error('Error deleting user recipe:', error);
    return NextResponse.json({ error: 'Failed to delete user recipe' }, { status: 500 });
  }
}