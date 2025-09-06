
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
  
      const medicalUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!medicalUser || !medicalUser.hospitalId) {
        return NextResponse.json({ message: 'Forbidden: User is not associated with a hospital.' }, { status: 403 });
      }
  
      
      const patients = await prisma.patient.findMany({
        where: {
          hospitalId: medicalUser.hospitalId,
        },
        orderBy: {
          medicalUrgency: 'desc', 
        }
      });
  
      return NextResponse.json({ patients }, { status: 200 });
  
    } catch (error) {
      console.error('Error fetching patients:', error);
      return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
  }

export async function POST(request: NextRequest) {
  try {
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;

    
    const medicalUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!medicalUser || medicalUser.role !== 'MEDICAL_PROFESSIONAL' || !medicalUser.hospitalId) {
      return NextResponse.json({ message: 'Forbidden: User is not an authorized medical professional with an assigned hospital.' }, { status: 403 });
    }

   
    const body = await request.json();
    const { fullName, bloodType, organNeeded, medicalUrgency } = body;

    
    if (!fullName || !bloodType || !organNeeded || !medicalUrgency) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    
    const newPatient = await prisma.patient.create({
      data: {
        fullName,
        bloodType,
        organNeeded,
        medicalUrgency: parseInt(medicalUrgency, 10), 
        hospitalId: medicalUser.hospitalId, 
      },
    });

    return NextResponse.json({ message: 'Patient added successfully', patient: newPatient }, { status: 201 });

  } catch (error) {
    console.error('Error adding patient:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}