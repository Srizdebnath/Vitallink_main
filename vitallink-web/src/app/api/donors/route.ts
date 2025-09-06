// File: src/app/api/donors/route.ts

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
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.role !== 'MEDICAL_PROFESSIONAL' && decoded.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const pendingDonors = await prisma.user.findMany({
      where: {
        role: 'DONOR',
        donorProfile: {
          status: 'PENDING_VERIFICATION',
        },
      },
      // THIS IS THE CORRECTED PART
      select: {
        id: true,
        fullName: true,
        email: true,
        donorProfile: {
          select: {
            bloodType: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      }
    });

    return NextResponse.json({ pendingDonors }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}