/*
  Warnings:

  - You are about to drop the column `logoIcon` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `logoIcon` on the `Subcategory` table. All the data in the column will be lost.
  - Added the required column `icon` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `Subcategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "logoIcon",
ADD COLUMN     "icon" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subcategory" DROP COLUMN "logoIcon",
ADD COLUMN     "icon" TEXT NOT NULL;
