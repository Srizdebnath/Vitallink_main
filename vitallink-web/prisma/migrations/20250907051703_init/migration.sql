-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('DONOR', 'MEDICAL_PROFESSIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."DonorStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DonationType" AS ENUM ('ALIVE', 'AFTER_DEATH');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'DONOR',
    "status" "public"."AccountStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hospitalId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DonorProfile" (
    "id" TEXT NOT NULL,
    "bloodType" TEXT,
    "address" TEXT,
    "organsToDonate" TEXT[],
    "status" "public"."DonorStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "donationType" "public"."DonationType" NOT NULL DEFAULT 'AFTER_DEATH',
    "userId" TEXT NOT NULL,

    CONSTRAINT "DonorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Patient" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "organNeeded" TEXT NOT NULL,
    "medicalUrgency" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hospitalId" TEXT NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DonorProfile_userId_key" ON "public"."DonorProfile"("userId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DonorProfile" ADD CONSTRAINT "DonorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Patient" ADD CONSTRAINT "Patient_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
