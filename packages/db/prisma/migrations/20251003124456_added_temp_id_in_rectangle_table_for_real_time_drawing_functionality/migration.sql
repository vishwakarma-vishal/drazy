/*
  Warnings:

  - Added the required column `tempId` to the `Rectangle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Rectangle" ADD COLUMN     "tempId" TEXT NOT NULL;
