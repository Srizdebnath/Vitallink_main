
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { recordConsentOnLedger } from '@/lib/blockchain';

interface JwtPayload {
  userId: string;
}


export async function GET(request: NextRequest) {
  try {
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

   
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
    const decoded = verify(token, jwtSecret) as JwtPayload;
    const userId = decoded.userId;

   
    const donorProfile = await prisma.donorProfile.findUnique({
      where: { userId },
    });

    
    if (!donorProfile) {
        return NextResponse.json({ profile: null }, { status: 200 });
    }

    const profileWithOrgansArray = {
        ...donorProfile,
        organsToDonate: donorProfile.organsToDonate ? donorProfile.organsToDonate.split(',') : [],
    };
    
    
    return NextResponse.json({ profile: profileWithOrgansArray }, { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
    const decoded = verify(token, jwtSecret) as JwtPayload;
    const userId = decoded.userId;
    
    const body = await request.json();
    const { bloodType, address, organsToDonate } = body;
    const organsString = organsToDonate.join(',');

   
    const updatedProfile = await prisma.donorProfile.upsert({
      where: { userId },
      update: { bloodType, address, organsToDonate: organsString },
      create: { userId, bloodType, address, organsToDonate: organsString },
    });

    
    await recordConsentOnLedger({
      userId: userId,
      consent: true, 
      profileData: { bloodType, address, organsToDonate }, 
    });

    return NextResponse.json({ profile: updatedProfile, message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}