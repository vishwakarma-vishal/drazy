import RoomContent from "@/app/component/RoomContent";
import Link from "next/link";

export default async function Room({ params }:
    {
        params: {
            roomId: string;
            slug: string
        }
    }
) {
    const roomId = (await params).roomId;
    console.log("roomId", roomId);

    return (
        <div>
            <Link href="/dashboard">Dashboard</Link>
            <RoomContent roomId={roomId}></RoomContent>
        </div>
    );

}