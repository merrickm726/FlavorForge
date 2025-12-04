import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/*
 * GET ALL Route for User Recipes
 * Returns true and the user submitted recipes
 * Otherwise, returns false and error status
 */
export async function GET(req: NextRequest) {
  try {

    // Find recipe to ensure it exists
    const recipes = await prisma.recipe.findMany({
        select: {
            id: true,
            title: true,
            instructions: true,
            image: true,
            ingredients: true,
        }
    });

    if (!recipes) {
        return NextResponse.json({ error: 'User Recipes not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, recipes });
  } 
  catch (error: any) {
    console.error('Error finding user recipe:', error);
    return NextResponse.json({ error: 'Failed to find user recipes' }, { status: 500 });
  }
}

/*
 * DELETE Route for User Recipes
 * recipeId to delete passed through request body
 * Returns true and a confirmation message
 * Otherwise, returns false and error status
 */
export async function DELETE(req: NextRequest) {
  try {

    // Read recipeID from body of req
    const body = await req.json();
    const { recipeID } = body;

    if (!recipeID) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    // Find recipe to ensure it exists
    const recipe = await prisma.recipe.findFirst({
        where: {
        id: recipeID,
        },
    });

    // Recipe not found
    if (!recipe) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Delete recipe
    await prisma.ingredient.deleteMany({
      where: { recipeId: recipeID },
    });

    // Then delete recipe
    await prisma.recipe.delete({
      where: { id: recipeID },
    });

    return NextResponse.json({ success: true, messsage: "recipe deleted" });
  } 
  catch (error: any) {
    console.error('Error deleting user recipe:', error);
    return NextResponse.json({ error: 'Failed to delete user recipe' }, { status: 500 });
  }
}