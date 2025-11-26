import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

/*
 * POST Route for User GET (using id)
 * Validates user id
 * If valid, returns true and the user json
 * Otherwise, returns false and error status
 */

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    // Get ID from params
    const { id } = await params;

    // Validate required fields
    if (!id) {
       
    return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user, using select to specifically avoid returning passwords
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            favorites: true,
            reviews: true,
            recipes: true,
        },
    });


    // If user not found return error
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error finding user:', error);

    return NextResponse.json(
      { error: 'Failed to find user' },
      { status: 500 }
    );
  }
}