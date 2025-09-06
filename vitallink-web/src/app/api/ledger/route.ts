// File: src/app/api/ledger/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma'; // We'll use prisma just to verify the user exists

interface JwtPayload {
  userId: string;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Optional but good practice: ensure the user still exists in the database
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return NextResponse.json({ message: 'Forbidden: User not found' }, { status: 403 });
    }

    // 2. Read the ledger file
    const ledgerPath = path.join(process.cwd(), 'data', 'ledger.json');
    const fileContent = await fs.readFile(ledgerPath, 'utf-8');
    const ledger = JSON.parse(fileContent);

    // 3. Send the ledger data to the client
    return NextResponse.json({ ledger }, { status: 200 });

  } catch (error: any) {
    // Handle specific errors, like the file not existing yet
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      console.warn('Ledger file not found, returning empty array.');
      return NextResponse.json({ ledger: [] }, { status: 200 });
    }
    // Handle JWT or other server errors
    console.error('Error fetching ledger:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}