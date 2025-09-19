import axios from "axios";
import { Shape, ShapeTypes } from "../constant";
import { GiSharpAxe } from "react-icons/gi";

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
            else if (item.circle) {
                const prop = item.circle;
                shapes.push({ type: ShapeTypes.CIRCLE, startX: prop.startX, startY: prop.startY, radius: prop.radius, color: prop.color });
            }
            else if (item.line) {
                const prop = item.line;
                shapes.push({ type: ShapeTypes.LINE, startX: prop.startX, startY: prop.startY, endX: prop.endX, endY: prop.endY, color: prop.color });
            } 
            else if (item.stroke) {
                const prop = item.stroke;
                shapes.push({type: ShapeTypes.PEN, points: JSON.parse(prop.points), color: prop.color})
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
        ctx.strokeStyle = shape.color || selectedColor;

        if (shape.type === ShapeTypes.RECTANGLE) {
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
        }

        else if (shape.type === ShapeTypes.CIRCLE) {
            ctx.beginPath();
            ctx.arc(shape.startX, shape.startY, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        else if (shape.type === ShapeTypes.LINE) {
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();
        }

        else if (shape.type === ShapeTypes.PEN) {
            const penPath = shape.points;

            ctx.beginPath();
            ctx.moveTo(penPath[0].x, penPath[0].y);

            for (let i = 1; i < penPath.length; i++) {
                ctx.lineTo(penPath[i].x, penPath[i].y);
            }
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

    let drawing: boolean = false;

    let penPath: { x: number, y: number }[] = [];

    const handleDown = (e: MouseEvent) => {
        startX = e.offsetX;
        startY = e.offsetY;

        if (selectedShape === ShapeTypes.PEN) {
            penPath = [];
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            penPath.push({ x: startX, y: startY });
            drawing = true;
        }

        clicked = true;
    }

    const handleMove = (e: MouseEvent) => {
        if (!clicked) return;

        const width = e.offsetX - startX;
        const height = e.offsetY - startY;

        if (selectedShape !== ShapeTypes.PEN) {
            draw(canvas, ctx, selectedColor);
        }
        ctx.strokeStyle = selectedColor;

        if (selectedShape === ShapeTypes.RECTANGLE) {
            ctx.strokeRect(startX, startY, width, height);
        }

        else if (selectedShape === ShapeTypes.CIRCLE) {
            const centerX = (e.offsetX + startX) / 2
            const centerY = (e.offsetY + startY) / 2
            const radius = Math.sqrt(width * width + height * height) / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        else if (selectedShape === ShapeTypes.LINE) {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }

        else if (selectedShape === ShapeTypes.PEN) {
            if (!drawing) return;
            penPath.push({ x: e.offsetX, y: e.offsetY });
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.lineCap = "butt";
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
            const centerX = (e.offsetX + startX) / 2
            const centerY = (e.offsetY + startY) / 2
            const radius = Math.sqrt(width * width + height * height) / 2;

            shapes.push({ type: ShapeTypes.CIRCLE, startX: centerX, startY: centerY, radius, color: selectedColor });

            chatPayload.message = { type: ShapeTypes.CIRCLE, startX: centerX, startY: centerY, radius, color: selectedColor };
        }

        else if (selectedShape === ShapeTypes.LINE) {
            shapes.push({ type: ShapeTypes.LINE, startX, startY, endX: e.offsetX, endY: e.offsetY, color: selectedColor });

            chatPayload.message = { type: ShapeTypes.LINE, startX, startY, endX: e.offsetX, endY: e.offsetY, color: selectedColor };
        }

        else if (selectedShape === ShapeTypes.PEN) {
            if (!drawing) return;
            penPath.push({ x: e.offsetX, y: e.offsetY });
            shapes.push({ type: ShapeTypes.PEN, points: penPath, color: selectedColor });

            chatPayload.message = { type: ShapeTypes.PEN, points: penPath, color: selectedColor };
            drawing = false;
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