-- CreateTable
CREATE TABLE "DonorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bloodType" TEXT,
    "address" TEXT,
    "organsToDonate" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "DonorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DonorProfile_userId_key" ON "DonorProfile"("userId");
