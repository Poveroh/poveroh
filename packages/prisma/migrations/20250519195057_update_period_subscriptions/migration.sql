/*
  Warnings:

  - You are about to drop the column `remember_number` on the `subscriptions` table. All the data in the column will be lost.
  - Changed the type of `remember_period` on the `subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RememberPeriodType" AS ENUM ('SAME_DAY', 'THREE_DAYS', 'SEVEN_DAYS', 'FOURTEEN_DAYS', 'THIRTY_DAYS', 'NINETY_DAYS');

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "remember_number",
ALTER COLUMN "cycle_number" SET DATA TYPE TEXT,
DROP COLUMN "remember_period",
ADD COLUMN     "remember_period" "RememberPeriodType" NOT NULL;
