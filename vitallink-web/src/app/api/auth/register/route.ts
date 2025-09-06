import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';


export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();
    const hashedPassword = await hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: 'Error creating user',
    }, { status: 500 });
  }
}