// File: src/app/api/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';



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
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
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


// --- POST Handler: Create or Update user's donor profile ---
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user (same as GET)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header missing' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.userId;
    
    // 2. Get the new profile data from the request body
    const body = await request.json();
    const { bloodType, address, organsToDonate } = body; // `organsToDonate` is an array here from the frontend

    // 3. MODIFICATION: Join the array into a single comma-separated string before saving
    const organsString = organsToDonate.join(',');

    // 4. Use Prisma's `upsert` to create or update the profile
    const updatedProfile = await prisma.donorProfile.upsert({
      where: { userId }, // How to find the record
      update: { // What to update if it exists
        bloodType,
        address,
        organsToDonate: organsString,
      },
      create: { // What to create if it doesn't exist
        userId,
        bloodType,
        address,
        organsToDonate: organsString,
      },
    });

    // 5. Return the updated profile (no need to modify here, frontend will refetch on next load)
    return NextResponse.json({ profile: updatedProfile, message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}