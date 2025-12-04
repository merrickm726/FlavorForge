import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/*
 * GET Route for User Recipes (using user id)
 * Validates user id
 * If valid, returns true and the user recipes json
 * Otherwise, returns false and error status
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Validate user id
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const recipes = await prisma.recipe.findMany({
      where: { creatorId: id },
      include: {
        ingredients: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, recipes });
  } catch (error: any) {
    console.error('Error fetching user recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch user recipes' }, { status: 500 });
  }
}

/*
 * POST Route for User Recipes (using user id)
 * Validates user id
 * If valid, returns true and the user recipe json
 * Otherwise, returns false and error status
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { title, instructions, image, ingredients } = body;

    if (!title) {
      return NextResponse.json({ error: 'Recipe title is required' }, { status: 400 });
    }

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        title,
        instructions: instructions || null,
        image: image || null,
        creatorId: id,
        ingredients: {
          create: ingredients?.map((ing: { name: string; amount?: string }) => ({
            name: ing.name,
            amount: ing.amount || null,
          })) || [],
        },
      },
      include: {
        ingredients: true,
      },
    });

    return NextResponse.json({ success: true, recipe }, { status: 201 });
  } 
  catch (error: any) {
    console.error('Error creating user recipe:', error);
    return NextResponse.json({ error: 'Failed to create user recipe' }, { status: 500 });
  }
}
