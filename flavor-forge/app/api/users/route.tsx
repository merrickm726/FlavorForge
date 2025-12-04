import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/*
 * GET Route for User (returns ALL users)
 * Returns true and the json containing all users
 * On error, returns false and error status
 */

export async function GET(req: NextRequest) {
  try {

    // Return all users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            favorites: true,
            recipes: true,
        }
    });


    return NextResponse.json(
      { success: true, users },
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