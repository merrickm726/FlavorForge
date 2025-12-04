import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

/*
 * GET Route for User (using id)
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


/*
 * PUT Route for User (using id)
 * Validates user id
 * If valid, returns true and the updated user json
 * Otherwise, returns false and error status
 */

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    // Get ID from params
    const { id } = await params;

    // Get updated data from body
    const body = await req.json();
    const { name, password, email, role} = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate that user exists
    const user = await prisma.user.findUnique({
        where: { id },
    });

    // If user not found return error
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find user, using select to specifically avoid returning passwords
    const updated = await prisma.user.update({
        where: { id },
        data: body,
    });

    // If user not found return error
    if (!updated) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password if provided
    let hashedPassword = undefined;
    if(password){
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? undefined,
        password: hashedPassword,
        role: role ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, updatedUser },
      { status: 201 }
    );

  }
  catch (error: any) {
    console.error('Error updating user:', error);

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/*
 * DELETE Route for User (using id)
 * Validates user id
 * If valid, returns true and a success message
 * Otherwise, returns false and error status
 */

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Validate that user exists
    const user = await prisma.user.findUnique({
        where: { id },
    });

    // If user not found return error
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find user, delete
    const updated = await prisma.user.delete({
        where: { id },
    });

    // If user not deleted return error
    if (!updated) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User Deleted Successfully" },
      { status: 201 }
    );

  }
  catch (error: any) {
    console.error('Error deleting user:', error);

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
