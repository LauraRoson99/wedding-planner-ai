-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "invitationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invitationSentAt" TIMESTAMP(3);
