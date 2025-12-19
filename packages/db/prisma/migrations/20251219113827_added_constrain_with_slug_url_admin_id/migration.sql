/*
  Warnings:

  - A unique constraint covering the columns `[slug,adminId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Room_slug_adminId_key" ON "public"."Room"("slug", "adminId");
