import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: string;
  role: Role;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.role !== 'ADMIN' && decoded.role !== 'MEDICAL_PROFESSIONAL') {
      return NextResponse.json({ message: 'Forbidden: Access denied' }, { status: 403 });
    }

    const { id: donorUserId } = await params;

    const updatedDonorProfile = await prisma.donorProfile.update({
      where: {
        userId: donorUserId,
      },
      data: {
        status: 'VERIFIED', 
      },
    });

    return NextResponse.json({ 
      message: 'Donor approved successfully', 
      donorProfile: updatedDonorProfile 
    }, { status: 200 });

  } catch (error) {
    console.error('Error approving donor:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}