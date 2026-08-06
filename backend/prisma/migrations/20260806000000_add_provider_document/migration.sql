-- CreateTable
CREATE TABLE "ProviderDocument" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderDocument_providerId_idx" ON "ProviderDocument"("providerId");

-- AddForeignKey
ALTER TABLE "ProviderDocument" ADD CONSTRAINT "ProviderDocument_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
