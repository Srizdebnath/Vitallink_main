// File: src/app/api/admin/users/route.ts

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
    // 1. Authenticate the user and check their role
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // ** SECURITY CHECK: Only Admins can access this route **
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Access denied' }, { status: 403 });
    }

    // 2. Fetch all users from the database if authorized
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc', // Show newest users first
      },
      // Use `select` to explicitly choose which fields to return
      // CRITICAL: This prevents the password hash from ever being sent to the client
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