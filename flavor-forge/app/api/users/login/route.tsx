import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

/*
 * POST Route for User LOGIN
 * Validates data and compared provided data with database data
 * If successful, returns true and the user json
 * Otherwise, returns false and error status
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user profile via email
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            favorites: {
            include: { recipe: true }
        },
        reviews: true,
        recipes: true,
      }
    });

    // Email not found. User does not exist or typo
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare given password and hashed password in DB
    const passValid = await bcrypt.compare(password, user.password);
    if(!passValid){
        return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
        );
    }

    // Remove password before returning user JSON
    const { password: _, ...safeUser } = user;

    // Create and return session cookie
    const res = NextResponse.json(
      { success: true, user: safeUser},
      { status: 200 }
    );

    // Store user id in cookie (HttpOnly so JS can't access it)
    res.cookies.set({
      name: 'session',
      value: user.id.toString(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return res;
  }
  catch (error: any) {
    
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}