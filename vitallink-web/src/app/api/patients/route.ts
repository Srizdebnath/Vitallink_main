// File: src/app/api/patients/route.ts

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
      // 1. Authenticate and get user info
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
  
      // 2. Fetch all patients from that user's hospital
      const patients = await prisma.patient.findMany({
        where: {
          hospitalId: medicalUser.hospitalId,
        },
        orderBy: {
          medicalUrgency: 'desc', // Show most urgent patients first
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
    // 1. Authenticate the user and check their role
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // 2. Find the logged-in medical professional to get their hospital ID
    const medicalUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!medicalUser || medicalUser.role !== 'MEDICAL_PROFESSIONAL' || !medicalUser.hospitalId) {
      return NextResponse.json({ message: 'Forbidden: User is not an authorized medical professional with an assigned hospital.' }, { status: 403 });
    }

    // 3. Get the patient data from the request body
    const body = await request.json();
    const { fullName, bloodType, organNeeded, medicalUrgency } = body;

    // Basic validation
    if (!fullName || !bloodType || !organNeeded || !medicalUrgency) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // 4. Create the new patient in the database
    const newPatient = await prisma.patient.create({
      data: {
        fullName,
        bloodType,
        organNeeded,
        medicalUrgency: parseInt(medicalUrgency, 10), // Ensure urgency is an integer
        hospitalId: medicalUser.hospitalId, // Link patient to the user's hospital
      },
    });

    return NextResponse.json({ message: 'Patient added successfully', patient: newPatient }, { status: 201 });

  } catch (error) {
    console.error('Error adding patient:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}