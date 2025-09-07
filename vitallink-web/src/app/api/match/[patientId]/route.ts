
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
interface JwtPayload {
  userId: string;
  role: string; 
}


const bloodCompatibility: { [key: string]: string[] } = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); }
    const token = authHeader.split(' ')[1];
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (decoded.role !== 'MEDICAL_PROFESSIONAL' && decoded.role !== 'ADMIN') { return NextResponse.json({ message: 'Forbidden' }, { status: 403 }); }

    const { patientId } = await params;
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    const verifiedDonors = await prisma.donorProfile.findMany({
      where: { status: 'VERIFIED' },
      include: { user: { select: { fullName: true, email: true } } }
    });
    
    const potentialMatches = verifiedDonors.filter(donor => {
      const organMatch = donor.organsToDonate?.some(organ => 
        organ.toLowerCase().includes(patient.organNeeded.toLowerCase())
      );
      const compatibleBloodTypes = bloodCompatibility[patient.bloodType] || [];
      const bloodMatch = donor.bloodType && compatibleBloodTypes.includes(donor.bloodType);
      return organMatch && bloodMatch;
    });

    return NextResponse.json({ matches: potentialMatches }, { status: 200 });
  } catch (error) {
    console.error('Error finding matches:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}