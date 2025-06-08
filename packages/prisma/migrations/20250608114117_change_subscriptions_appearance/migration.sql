/*
  Warnings:

  - You are about to drop the column `icon` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `appearance_logo_icon` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appearance_mode` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppearanceMode" AS ENUM ('LOGO', 'ICON');

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "icon",
DROP COLUMN "logo",
ADD COLUMN     "appearance_logo_icon" TEXT NOT NULL,
ADD COLUMN     "appearance_mode" "AppearanceMode" NOT NULL;
