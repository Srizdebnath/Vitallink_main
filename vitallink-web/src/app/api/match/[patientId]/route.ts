// File: src/app/api/match/[patientId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

interface JwtPayload { /* ... */ }

// A simple blood type compatibility map
const bloodCompatibility: { [key: string]: string[] } = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'], // Universal donor
};

export async function GET(request: NextRequest, { params }: { params: { patientId: string } }) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    // ... (add the same authentication and role check as other medical APIs)
    if (!authHeader?.startsWith('Bearer ')) { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (decoded.role !== 'MEDICAL_PROFESSIONAL' && decoded.role !== 'ADMIN') { return NextResponse.json({ message: 'Forbidden' }, { status: 403 }); }

    // 2. Get patient data
    const patient = await prisma.patient.findUnique({
      where: { id: params.patientId },
    });

    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    // 3. Find all verified donors
    const verifiedDonors = await prisma.donorProfile.findMany({
      where: {
        status: 'VERIFIED',
      },
      include: { // Also fetch the user's name
        user: {
          select: { fullName: true, email: true }
        }
      }
    });
    
    // 4. Perform the matching logic in memory
    const potentialMatches = verifiedDonors.filter(donor => {
      // Check 1: Does the donor's organ list contain the needed organ? (Case-insensitive)
      const organMatch = donor.organsToDonate?.toLowerCase().includes(patient.organNeeded.toLowerCase());
      
      // Check 2: Is the blood type compatible?
      const compatibleDonors = bloodCompatibility[patient.bloodType] || [];
      const bloodMatch = donor.bloodType && compatibleDonors.includes(donor.bloodType);

      return organMatch && bloodMatch;
    });

    return NextResponse.json({ matches: potentialMatches }, { status: 200 });

  } catch (error) {
    console.error('Error finding matches:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}