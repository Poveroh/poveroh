-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onBoardingAt" TIMESTAMP(3),
ADD COLUMN     "onBoardingStep" INTEGER NOT NULL DEFAULT 1;
