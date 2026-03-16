/*
  Warnings:

  - A unique constraint covering the columns `[tableId,seatNumber]` on the table `Guest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "seatNumber" INTEGER;

-- CreateIndex
CREATE INDEX "Guest_seatNumber_idx" ON "Guest"("seatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_tableId_seatNumber_key" ON "Guest"("tableId", "seatNumber");
