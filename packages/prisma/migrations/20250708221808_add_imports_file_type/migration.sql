/*
  Warnings:

  - The `filetype` column on the `imports` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('CSV', 'PDF');

-- AlterTable
ALTER TABLE "imports" DROP COLUMN "filetype",
ADD COLUMN     "filetype" "FileType" NOT NULL DEFAULT 'CSV';
