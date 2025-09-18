import axios from "axios";
import { Shape, ShapeTypes } from "../constant";

let shapes: Shape[] = [];

const getContent = async (roomId: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, selectedColor: string) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.HTTP_BACKEND_URL}/room/${roomId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = response.data.content;

        data.forEach((item: any) => {
            if (item.rectangle) {
                const prop = item.rectangle;
                shapes.push({ type: ShapeTypes.RECTANGLE, startX: prop.startX, startY: prop.startY, width: prop.width, height: prop.height, color: prop.color });
            }
            if (item.circle) {
                const prop = item.circle;
                shapes.push({ type: ShapeTypes.CIRCLE, startX: prop.startX, startY: prop.startY, radius: prop.radius, color: prop.color });
            }
        });
        draw(canvas, ctx, selectedColor);

        console.log("Response-> ", response);
    } catch (error) {
        console.log("error", error);
    }
}

const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, selectedColor: string) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
        // console.log("shape -> ", shape);
        if (shape.type === ShapeTypes.RECTANGLE) {
            ctx.strokeStyle = shape.color || selectedColor;
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
        }

        else if (shape.type === ShapeTypes.CIRCLE) {
            ctx.strokeStyle = shape.color || selectedColor;
            ctx.beginPath();
            ctx.arc(shape.startX, shape.startY, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    });
}

export const initDraw = ({ canvas, socket, roomId, selectedShape, selectedColor }: { canvas: HTMLCanvasElement, socket: WebSocket, roomId: string, selectedShape: string, selectedColor: string }) => {
    let ctx = canvas.getContext("2d");
    if (!ctx) return;

    getContent(roomId, canvas, ctx, selectedColor);
    draw(canvas, ctx, selectedColor);

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

        if (selectedShape === ShapeTypes.RECTANGLE) {
            draw(canvas, ctx, selectedColor);
            ctx.strokeStyle = selectedColor;
            ctx.strokeRect(startX, startY, width, height);
        }

        else if (selectedShape === ShapeTypes.CIRCLE) {
            const radius = Math.sqrt(width * width + height * height);

            draw(canvas, ctx, selectedColor);
            ctx.strokeStyle = selectedColor;

            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    const handleUp = (e: MouseEvent) => {
        if (!clicked) return;

        const width = e.offsetX - startX;
        const height = e.offsetY - startY;

        let chatPayload = {
            type: "chat",
            roomId: roomId,
            message: {}
        }

        if (selectedShape === ShapeTypes.RECTANGLE) {

            shapes.push({ type: ShapeTypes.RECTANGLE, startX, startY, width, height, color: selectedColor });

            chatPayload.message = { type: ShapeTypes.RECTANGLE, startX, startY, width, height, color: selectedColor }
        }

        else if (selectedShape === ShapeTypes.CIRCLE) {
            const radius = Math.sqrt(width * width + height * height);

            shapes.push({ type: ShapeTypes.CIRCLE, startX, startY, radius, color: selectedColor });

            chatPayload.message = { type: ShapeTypes.CIRCLE, startX, startY, radius, color: selectedColor };
        }

        socket?.send(JSON.stringify(chatPayload));
        draw(canvas, ctx, selectedColor);
        clicked = false;
    }

    socket.onmessage = (message) => {
        const payload = message.data;
        // console.log("payload -> ", payload);
        shapes.push(JSON.parse(payload));
        draw(canvas, ctx, selectedColor);
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