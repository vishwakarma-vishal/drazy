/*
  Warnings:

  - You are about to drop the `Circle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Circle" DROP CONSTRAINT "Circle_id_fkey";

-- DropTable
DROP TABLE "public"."Circle";

-- CreateTable
CREATE TABLE "public"."Ellipse" (
    "id" TEXT NOT NULL,
    "startX" INTEGER NOT NULL,
    "startY" INTEGER NOT NULL,
    "radiusX" INTEGER NOT NULL,
    "radiusY" INTEGER NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Ellipse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Ellipse" ADD CONSTRAINT "Ellipse_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
