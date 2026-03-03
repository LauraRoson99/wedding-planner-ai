-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED');

-- CreateEnum
CREATE TYPE "DietType" AS ENUM ('NONE', 'VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'OTHER');

-- CreateEnum
CREATE TYPE "GuestRole" AS ENUM ('PRIMARY', 'COMPANION');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('ADULT', 'CHILD', 'BABY');

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "ageGroup" "AgeGroup" NOT NULL DEFAULT 'ADULT',
ADD COLUMN     "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "diet" "DietType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "dietNotes" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "GuestRole" NOT NULL DEFAULT 'PRIMARY',
ADD COLUMN     "rsvp" "RsvpStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Guest_parentId_idx" ON "Guest"("parentId");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
