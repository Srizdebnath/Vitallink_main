import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordsMatch = await compare(password, user.password);

    if (!passwordsMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    return NextResponse.json({ token, message: 'Login successful' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}