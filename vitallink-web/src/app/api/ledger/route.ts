import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/prisma'; 

interface JwtPayload {
  userId: string;
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

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return NextResponse.json({ message: 'Forbidden: User not found' }, { status: 403 });
    }
    const ledgerPath = path.join(process.cwd(), 'data', 'ledger.json');
    const fileContent = await fs.readFile(ledgerPath, 'utf-8');
    const ledger = JSON.parse(fileContent);

    
    return NextResponse.json({ ledger }, { status: 200 });

  } catch (error: unknown) {
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      console.warn('Ledger file not found, returning empty array.');
      return NextResponse.json({ ledger: [] }, { status: 200 });
    }
    
    console.error('Error fetching ledger:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}