/*
  Warnings:

  - Added the required column `maxWidth` to the `TextShape` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."TextShape" ADD COLUMN     "maxWidth" INTEGER NOT NULL;
