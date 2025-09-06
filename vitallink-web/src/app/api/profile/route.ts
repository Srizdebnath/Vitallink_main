// File: src/app/api/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { recordConsentOnLedger } from '@/lib/blockchain';



// A helper type for our decoded JWT payload
interface JwtPayload {
  userId: string;
}

// --- GET Handler: Fetch user's donor profile ---
export async function GET(request: NextRequest) {
  try {
    // 1. Get the token from the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // 2. Verify the token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
    const decoded = verify(token, jwtSecret) as JwtPayload;
    const userId = decoded.userId;

    // 3. Fetch the donor profile from the database
    const donorProfile = await prisma.donorProfile.findUnique({
      where: { userId },
    });

    // If no profile exists yet for the user, return null
    if (!donorProfile) {
        return NextResponse.json({ profile: null }, { status: 200 });
    }

    // 4. MODIFICATION: Convert the comma-separated string back to an array
    const profileWithOrgansArray = {
        ...donorProfile,
        organsToDonate: donorProfile.organsToDonate ? donorProfile.organsToDonate.split(',') : [],
    };
    
    // 5. Return the modified profile object
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

    // 1. Save to the primary database (Prisma)
    const updatedProfile = await prisma.donorProfile.upsert({
      where: { userId },
      update: { bloodType, address, organsToDonate: organsString },
      create: { userId, bloodType, address, organsToDonate: organsString },
    });

    // 2. **INTEGRATION STEP**: Record the action on our simulated blockchain
    await recordConsentOnLedger({
      userId: userId,
      consent: true, // Assuming saving the profile implies consent
      profileData: { bloodType, address, organsToDonate }, // Pass the raw data to be hashed
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