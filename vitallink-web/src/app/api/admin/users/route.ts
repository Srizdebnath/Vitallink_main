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

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Access denied' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc', 
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        donorProfile: {
          select: {
            bloodType: true,
          }
        }
      }
    });

    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}