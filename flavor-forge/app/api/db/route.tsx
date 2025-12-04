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
    const recipe = await prisma.recipe.findMany({
        
    });

    if (!recipe) {
        return NextResponse.json({ error: 'Recipes not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, recipe });
  } 
  catch (error: any) {
    console.error('Error finding user recipe:', error);
    return NextResponse.json({ error: 'Failed to find user recipes' }, { status: 500 });
  }
}