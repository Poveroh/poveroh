/*
  Warnings:

  - Changed the type of `remember_period` on the `subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RememberPeriod" AS ENUM ('SAME_DAY', 'THREE_DAYS', 'SEVEN_DAYS', 'FOURTEEN_DAYS', 'THIRTY_DAYS', 'NINETY_DAYS');

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "remember_period",
ADD COLUMN     "remember_period" "RememberPeriod" NOT NULL;

-- DropEnum
DROP TYPE "RememberPeriodType";
