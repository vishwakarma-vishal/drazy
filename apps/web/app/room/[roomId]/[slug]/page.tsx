import RoomContent from "@/app/component/RoomContent";

export default async function Room({ params }:
    {
        params: {
            roomId: string;
            slug: string
        }
    }
) {
    const roomId = (await params).roomId;

    return (
        <div>
            <RoomContent roomId={roomId}></RoomContent>
        </div>
    );

}