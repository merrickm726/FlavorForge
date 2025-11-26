import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
