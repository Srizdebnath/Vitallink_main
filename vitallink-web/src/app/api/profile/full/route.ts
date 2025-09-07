// File: src/app/api/profile/full/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

interface JwtPayload { userId: string; }

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Fetch the user and include their donor profile in one query
    const userProfile = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        fullName: true,
        donorProfile: {
          select: {
            bloodType: true,
            donationType: true,
            status: true,
          }
        }
      }
    });

    if (!userProfile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: userProfile }, { status: 200 });

  } catch (error) {
    console.error('Error fetching full profile:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}