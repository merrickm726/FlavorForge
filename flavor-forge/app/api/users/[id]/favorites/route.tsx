import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


/*
 * GET Route for a specific user's favorited recipes
 * Returns favorited recipes in a json
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const { id } = await params;

    // Validate ID
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch favorites
    const favorites = await prisma.savedRecipe.findMany({
      where: { userId: id },
      include: { recipe: true },
    });

    return NextResponse.json({ success: true, favorites }, { status: 200 });
  } 
  catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

/*
 * POST Route for a specific user's favorited recipes
 * Body must contain the recipe id to add!!!!
 * Returns favorited recipes in a json
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { recipeId } = body;

    if (!userId || !recipeId) {
      return NextResponse.json(
        { error: 'User ID and recipe ID are required' },
        { status: 400 }
      );
    }

    // Add favorite
    const favorite = await prisma.savedRecipe.create({
      data: {
        userId,
        recipeId,
      },
      include: { recipe: true },
    });

    return NextResponse.json({ success: true, favorite }, { status: 201 });
  }
  catch (error: any) {
    console.error('Error adding favorite:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Recipe already favorited' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

/*
 * DELETE Route for a specific user's favorited recipes
 * Body must contain the recipe id to delete!!!!
 * Returns favorited recipes in a json
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { recipeId } = body;

    if (!userId || !recipeId) {
      return NextResponse.json(
        { error: 'User ID and recipe ID are required' },
        { status: 400 }
      );
    }

    // Remove favorite
    await prisma.savedRecipe.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    return NextResponse.json(
      { success: true, message: 'Favorite removed' },
      { status: 200 }
    );
  }
  catch (error: any) {
    console.error('Error removing favorite:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
