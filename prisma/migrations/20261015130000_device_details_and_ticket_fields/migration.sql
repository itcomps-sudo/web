-- CreateEnum
CREATE TYPE "TicketSource" AS ENUM ('PORTAL', 'PHONE', 'TEXT', 'EMAIL', 'WALK_IN', 'MANUAL');

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "antivirus" TEXT,
ADD COLUMN     "backupStatus" TEXT,
ADD COLUMN     "cpu" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rustdeskId" TEXT,
ADD COLUMN     "warrantyEndsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SupportMessage" ADD COLUMN     "internal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "source" "TicketSource" NOT NULL DEFAULT 'PORTAL',
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "ticketNo" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_ticketNo_key" ON "SupportTicket"("ticketNo");
