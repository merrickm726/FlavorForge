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
            creator: true,
            creatorId: true
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