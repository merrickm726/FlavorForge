import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // make sure prisma client is exported from lib/prisma

/*
 * GET Route for User Reviews (using user id)
 * Validates user id
 * If valid, returns true and the user reviews json
 * Otherwise, returns false and error status
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Validate user id
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { userId: id },
      include: {
        recipe: true, 
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, reviews });
  } 
  catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}


/*
 * POST Route for User Reviews (using user id)
 * Validates user id
 * If valid, returns true and the user reviews json
 * Otherwise, returns false and error status
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { recipeId, text, rating } = body;

    // Validate required fields
    if (!recipeId || !text || rating === undefined) {
      return NextResponse.json({ error: 'recipeId, text, and rating are required' }, { status: 400 });
    }

    // Check that recipe exists
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: id,
        recipeId,
        text,
        rating,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  }
  catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
