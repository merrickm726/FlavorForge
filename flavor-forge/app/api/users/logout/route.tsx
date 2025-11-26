import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

/*
 * POST Route for User LOGOUT
 * Clears login cookie
 * Returns true and a message indicating log out
 */

export async function POST() {

    const res = NextResponse.json(
        { success: true, message: "Logged out" },
        { status: 200 }
    );

    // Clear the login cookie
    res.cookies.set({
        name: "session",
        value: "",
        path: "/",
        maxAge: 0,
    });

    return res;
}
