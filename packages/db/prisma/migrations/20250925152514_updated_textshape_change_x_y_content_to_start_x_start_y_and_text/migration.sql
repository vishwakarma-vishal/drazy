/*
  Warnings:

  - You are about to drop the column `content` on the `TextShape` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `TextShape` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `TextShape` table. All the data in the column will be lost.
  - Added the required column `startX` to the `TextShape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startY` to the `TextShape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `TextShape` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."TextShape" DROP COLUMN "content",
DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "startX" INTEGER NOT NULL,
ADD COLUMN     "startY" INTEGER NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL;
