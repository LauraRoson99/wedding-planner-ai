-- AlterTable
ALTER TABLE "Guest" ADD COLUMN "rsvpToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Guest_rsvpToken_key" ON "Guest"("rsvpToken");
