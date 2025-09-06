import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: string;
  role: Role;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
    const decoded = verify(token, jwtSecret) as JwtPayload;

    // ** SERVER-SIDE SECURITY CHECK **
    if (decoded.role !== 'MEDICAL_PROFESSIONAL') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // If authorized, fetch all users with the DONOR role and their profiles
    const donors = await prisma.user.findMany({
      where: {
        role: Role.DONOR,
      },
      select: { // Only select the data we need to send to the client
        id: true,
        fullName: true,
        email: true,
        donorProfile: {
          select: {
            bloodType: true,
          },
        },
      },
    });

    return NextResponse.json({ donors }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}