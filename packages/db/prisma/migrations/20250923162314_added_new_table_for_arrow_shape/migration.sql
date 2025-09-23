-- CreateTable
CREATE TABLE "public"."Arrow" (
    "id" TEXT NOT NULL,
    "startX" INTEGER NOT NULL,
    "startY" INTEGER NOT NULL,
    "endX" INTEGER NOT NULL,
    "endY" INTEGER NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Arrow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Arrow" ADD CONSTRAINT "Arrow_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
