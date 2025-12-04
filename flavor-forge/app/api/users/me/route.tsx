import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

/*
 * GET Route for User ME (current user)
 * Checks for and validates stored session cookie
 * If successful, returns true and the user json
 * Otherwise, returns false and error status
 */

export async function GET(req: NextRequest) {
  try {

    // Get session value from cookies
    const session = req.cookies.get('session')?.value;

    // Session not found. User is not logged in
    if (!session) {
      return NextResponse.json(
        { error: 'Not Authenticated' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: session },
      include: {
        favorites: true,
        recipes: true,
      }
    });

    // Didn't find user, error
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password before returning
    const { password: _, ...safeUser } = user;

    return NextResponse.json(safeUser);
  }
  catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch current user' },
      { status: 500 }
    );
  }
}