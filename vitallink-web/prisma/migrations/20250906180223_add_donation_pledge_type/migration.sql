-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DonorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bloodType" TEXT,
    "address" TEXT,
    "organsToDonate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "donationType" TEXT NOT NULL DEFAULT 'AFTER_DEATH',
    "userId" TEXT NOT NULL,
    CONSTRAINT "DonorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DonorProfile" ("address", "bloodType", "id", "organsToDonate", "status", "userId") SELECT "address", "bloodType", "id", "organsToDonate", "status", "userId" FROM "DonorProfile";
DROP TABLE "DonorProfile";
ALTER TABLE "new_DonorProfile" RENAME TO "DonorProfile";
CREATE UNIQUE INDEX "DonorProfile_userId_key" ON "DonorProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
