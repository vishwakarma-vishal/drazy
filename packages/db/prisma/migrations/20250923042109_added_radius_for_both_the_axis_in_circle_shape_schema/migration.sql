/*
  Warnings:

  - You are about to drop the column `radius` on the `Circle` table. All the data in the column will be lost.
  - Added the required column `radiusX` to the `Circle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `radiusY` to the `Circle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Circle" DROP COLUMN "radius",
ADD COLUMN     "radiusX" INTEGER NOT NULL,
ADD COLUMN     "radiusY" INTEGER NOT NULL;
