-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM ('VENUE', 'CATERING', 'DRESS', 'SUIT', 'PHOTO_VIDEO', 'MUSIC', 'DECORATION', 'FLOWERS', 'TRANSPORT', 'INVITATIONS', 'HONEYMOON', 'BEAUTY', 'CEREMONY', 'GIFTS', 'OTHER');

-- CreateEnum
CREATE TYPE "BudgetItemStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "BudgetCategory" NOT NULL DEFAULT 'OTHER',
    "estimatedAmount" DOUBLE PRECISION NOT NULL,
    "actualAmount" DOUBLE PRECISION,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "BudgetItemStatus" NOT NULL DEFAULT 'PLANNED',
    "dueDate" TIMESTAMP(3),
    "paymentDate" TIMESTAMP(3),
    "supplier" TEXT,
    "notes" TEXT,
    "weddingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Budget_weddingId_key" ON "Budget"("weddingId");

-- CreateIndex
CREATE INDEX "Budget_weddingId_idx" ON "Budget"("weddingId");

-- CreateIndex
CREATE INDEX "BudgetItem_weddingId_idx" ON "BudgetItem"("weddingId");

-- CreateIndex
CREATE INDEX "BudgetItem_category_idx" ON "BudgetItem"("category");

-- CreateIndex
CREATE INDEX "BudgetItem_status_idx" ON "BudgetItem"("status");

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
