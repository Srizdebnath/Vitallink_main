// File: src/app/api/auth/register-medical/route.ts
// This is almost identical to the normal register route

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();
    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: Role.MEDICAL_PROFESSIONAL, // <-- THE ONLY CHANGE
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Medical professional account created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({
      message: 'Error creating user',
    }, { status: 500 });
  }
}