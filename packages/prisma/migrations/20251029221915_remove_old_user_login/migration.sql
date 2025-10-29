/*
  Warnings:

  - You are about to drop the `UserLogin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserLogin" DROP CONSTRAINT "UserLogin_userId_fkey";

-- DropTable
DROP TABLE "public"."UserLogin";
