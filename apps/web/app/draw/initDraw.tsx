import axios from "axios";

type shapeType = "RECTANGLE" | "CIRCLE";

type shape = {
    type: shapeType,
    startX: number,
    startY: number,
    width: number,
    height: number,
    color: string
}

let shapes: shape[] = [];

const getContent = async (roomId: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.HTTP_BACKEND_URL}/room/${roomId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = response.data.content;

        data.forEach((item : any) => {
            if (item.rectangle) {
                const prop: shape = item.rectangle;
                shapes.push({ type: "RECTANGLE", startX: prop.startX, startY: prop.startY, width: prop.width, height: prop.height, color: prop.color });
            }
        });
        draw(canvas, ctx);

        console.log("Response-> ", response);
    } catch (error) {
        console.log("error", error);
    }
}

const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
        console.log("shape -> ", shape);
        if (shape.type === "RECTANGLE") {
            ctx.strokeStyle = shape.color || "green";
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
        }
    });
}

export const initDraw = ({ canvas, socket, roomId }: { canvas: HTMLCanvasElement, socket: WebSocket, roomId: string }) => {
    let ctx = canvas.getContext("2d");
    if (!ctx) return;

    getContent(roomId, canvas, ctx);
    draw(canvas, ctx);

    let startX: number = 0;
    let startY: number = 0;
    let clicked: boolean = false;

    const handleDown = (e: MouseEvent) => {
        startX = e.offsetX;
        startY = e.offsetY;
        clicked = true;
    }

    const handleMove = (e: MouseEvent) => {
        if (!clicked) return;

        const width = e.offsetX - startX;
        const height = e.offsetY - startY;

        draw(canvas, ctx);
        ctx.strokeRect(startX, startY, width, height);
    }

    const handleUp = (e: MouseEvent) => {
        if (!clicked) return;

        const width = e.offsetX - startX;
        const height = e.offsetY - startY;

        shapes.push({ type: "RECTANGLE", startX, startY, width, height, color: "green" });
        let tringle = { type: "chat", roomId: roomId, message: { type: "RECTANGLE", startX, startY, width, height, color: "green" } }
        socket?.send(JSON.stringify(tringle));
        draw(canvas, ctx);
        clicked = false;
    }

    socket.onmessage = (message) => {
        const payload = message.data;
        console.log("payload -> ", payload);
        shapes.push(JSON.parse(payload));
        draw(canvas, ctx);
    }

    canvas.addEventListener("mousedown", handleDown);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseup", handleUp);

    return () => {
        canvas.removeEventListener("mousedown", handleDown);
        canvas.removeEventListener("mousemove", handleMove);
        canvas.removeEventListener("mouseup", handleUp);
    }
}