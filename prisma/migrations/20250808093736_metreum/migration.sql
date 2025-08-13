/*
  Warnings:

  - Made the column `tableNumber` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "customerName" DROP NOT NULL,
ALTER COLUMN "tableNumber" SET NOT NULL;
