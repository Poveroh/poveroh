/*
  Warnings:

  - You are about to drop the `currencies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `currency` to the `amounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY');

-- DropForeignKey
ALTER TABLE "amounts" DROP CONSTRAINT "amounts_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_current_id_fkey";

-- AlterTable
ALTER TABLE "amounts" ADD COLUMN     "currency" "Currency" NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "currency" "Currency" NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "currencies";
