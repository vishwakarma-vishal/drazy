-- DropForeignKey
ALTER TABLE "public"."Arrow" DROP CONSTRAINT "Arrow_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ellipse" DROP CONSTRAINT "Ellipse_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Line" DROP CONSTRAINT "Line_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Rectangle" DROP CONSTRAINT "Rectangle_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stroke" DROP CONSTRAINT "Stroke_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TextShape" DROP CONSTRAINT "TextShape_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rectangle" ADD CONSTRAINT "Rectangle_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ellipse" ADD CONSTRAINT "Ellipse_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Line" ADD CONSTRAINT "Line_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Arrow" ADD CONSTRAINT "Arrow_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TextShape" ADD CONSTRAINT "TextShape_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stroke" ADD CONSTRAINT "Stroke_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
