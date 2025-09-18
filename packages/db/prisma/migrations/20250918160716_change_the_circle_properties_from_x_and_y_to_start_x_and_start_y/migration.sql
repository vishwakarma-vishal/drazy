/*
  Warnings:

  - You are about to drop the column `x` on the `Circle` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `Circle` table. All the data in the column will be lost.
  - Added the required column `startX` to the `Circle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startY` to the `Circle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Circle" DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "startX" INTEGER NOT NULL,
ADD COLUMN     "startY" INTEGER NOT NULL;
