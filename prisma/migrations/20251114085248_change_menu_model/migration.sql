/*
  Warnings:

  - You are about to drop the column `stock` on the `Menu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Menu" DROP COLUMN "stock",
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true;
