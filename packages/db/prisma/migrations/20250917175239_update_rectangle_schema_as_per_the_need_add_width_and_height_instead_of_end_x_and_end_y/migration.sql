/*
  Warnings:

  - You are about to drop the column `endX` on the `Rectangle` table. All the data in the column will be lost.
  - You are about to drop the column `endY` on the `Rectangle` table. All the data in the column will be lost.
  - Added the required column `height` to the `Rectangle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Rectangle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Rectangle" DROP COLUMN "endX",
DROP COLUMN "endY",
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;
