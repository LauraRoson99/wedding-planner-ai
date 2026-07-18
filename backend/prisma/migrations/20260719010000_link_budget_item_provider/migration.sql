-- AlterTable
ALTER TABLE "BudgetItem" ADD COLUMN "providerId" TEXT;

-- CreateIndex
CREATE INDEX "BudgetItem_providerId_idx" ON "BudgetItem"("providerId");

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
