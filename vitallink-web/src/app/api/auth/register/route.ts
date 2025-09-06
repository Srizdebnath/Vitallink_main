import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { randomInt } from 'crypto';

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();

    
    const existingUser = await prisma.user.findFirst({
      where: { email, status: 'VERIFIED' },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }
    
   
    const otp = randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    const hashedPassword = await hash(password, 10);
    
    
    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        fullName,
        otp,
        otpExpiresAt,
        status: 'UNVERIFIED',
      },
      create: {
        email,
        password: hashedPassword,
        fullName,
        otp,
        otpExpiresAt,
        status: 'UNVERIFIED',
      },
    });

    
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return NextResponse.json({ message: 'Could not send verification email. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Registration successful. Please check your email for a verification code.' }, { status: 200 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  }
}