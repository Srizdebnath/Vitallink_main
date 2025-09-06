import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    const user = await prisma.user.findFirst({
      where: { email, status: 'UNVERIFIED' },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found or already verified.' }, { status: 404 });
    }
    if (!user.otp || !user.otpExpiresAt) {
      return NextResponse.json({ message: 'OTP not set for this user.' }, { status: 400 });
    }
    if (user.otpExpiresAt < new Date()) {
      return NextResponse.json({ message: 'OTP has expired. Please register again to get a new one.' }, { status: 400 });
    }
    if (user.otp !== otp) {
      return NextResponse.json({ message: 'Invalid OTP.' }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'VERIFIED',
        otp: null,
        otpExpiresAt: null,
      },
    });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return NextResponse.json({ message: 'Account verified successfully!', token }, { status: 200 });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  }
}