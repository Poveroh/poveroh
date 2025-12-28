-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Timezone" ADD VALUE 'AFRICA_WEST_CENTRAL';
ALTER TYPE "Timezone" ADD VALUE 'AMERICA_QUITO';
ALTER TYPE "Timezone" ADD VALUE 'AMERICA_GUADALAJARA';
ALTER TYPE "Timezone" ADD VALUE 'ASIA_ASTANA';
ALTER TYPE "Timezone" ADD VALUE 'ASIA_CHENNAI';
ALTER TYPE "Timezone" ADD VALUE 'ASIA_HANOI';
ALTER TYPE "Timezone" ADD VALUE 'ASIA_ISLAMABAD';
ALTER TYPE "Timezone" ADD VALUE 'ASIA_MUMBAI';
ALTER TYPE "Timezone" ADD VALUE 'ASIA_NEW_DELHI';
ALTER TYPE "Timezone" ADD VALUE 'ASIA_ABU_DHABI';
ALTER TYPE "Timezone" ADD VALUE 'ASIA_OSAKA';
ALTER TYPE "Timezone" ADD VALUE 'ASIA_SAPPORO';
ALTER TYPE "Timezone" ADD VALUE 'EUROPE_EDINBURGH';
ALTER TYPE "Timezone" ADD VALUE 'EUROPE_ST_PETERSBURG';
ALTER TYPE "Timezone" ADD VALUE 'PACIFIC_WELLINGTON';
