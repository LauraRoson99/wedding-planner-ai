-- CreateEnum
CREATE TYPE "ProviderCategory" AS ENUM ('VENUE', 'CATERING', 'PHOTOGRAPHY', 'VIDEO', 'MUSIC', 'FLORIST', 'DECORATION', 'TRANSPORT', 'BEAUTY', 'DRESS', 'SUIT', 'INVITATIONS', 'HONEYMOON', 'CEREMONY', 'OTHER');

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('CONTACTED', 'QUOTED', 'BOOKED', 'CONFIRMED', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProviderCategory" NOT NULL DEFAULT 'OTHER',
    "status" "ProviderStatus" NOT NULL DEFAULT 'CONTACTED',
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "estimatedPrice" DOUBLE PRECISION,
    "finalPrice" DOUBLE PRECISION,
    "notes" TEXT,
    "weddingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Provider_weddingId_idx" ON "Provider"("weddingId");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
