import { ShapeTypes } from "../constant";
import { getContent } from "./http";
import { BaseShape } from "./shapes/BaseShape";
import { Circle } from "./shapes/Circle";
import { Line } from "./shapes/Line";
import { Pen } from "./shapes/Pen";
import { Rectangle } from "./shapes/Rectangle";

export class Drawer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    socket: WebSocket;
    roomId: string;
    selectedShapeType: string;
    selectedColor: string;
    shapes: BaseShape[] = [];

    // for creating new shape
    startX: number = 0;
    startY: number = 0;
    clicked: boolean = false;
    drawing: boolean = false;
    penPath: { x: number, y: number }[] = [];

    // for selecting/resizing
    selectedShape: BaseShape | null = null; // represent selected shape to move or resize
    selectedHandle: string | null = null;


    constructor(canvas: HTMLCanvasElement, socket: WebSocket, roomId: string, selectedShapeType: string, selectedColor: string) {
        this.canvas = canvas;
        this.socket = socket;
        this.roomId = roomId;
        this.selectedColor = selectedColor;
        this.selectedShapeType = selectedShapeType;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Cannot get canvas context");
        this.ctx = ctx;

        this.getCanvasContent();

        // bind once
        this.handleDown = this.handleDown.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleUp = this.handleUp.bind(this);

        this.addEventListeners();
        this.websocketConnection();
    }

    // get roomshape form the BE and render then on canvas
    async getCanvasContent() {
        this.shapes = await getContent(this.roomId);
        this.drawShapes();
    }

    // render shapes on the canvas
    drawShapes() {
        // clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw all the content again
        this.shapes.forEach((shape) => {
            // console.log("shape -> ", shape);
            shape.draw(this.ctx);
        });
    }

    // get real-time content (shapes) via websocket
    websocketConnection() {
        this.socket.onmessage = (message) => {
            const payload = JSON.parse(message.data);
            console.log("payload -> ", payload);

            let shape: BaseShape | null = null;
            switch (payload.type) {
                case ShapeTypes.RECTANGLE:
                    shape = new Rectangle(payload.startX, payload.startY, payload.width, payload.height, payload.color);
                    break;
                case ShapeTypes.CIRCLE:
                    shape = new Circle(payload.startX, payload.startY, payload.radius, payload.color);
                    break;
                case ShapeTypes.LINE:
                    shape = new Line(payload.startX, payload.startY, payload.endX, payload.endY, payload.color);
                    break;
                case ShapeTypes.PEN:
                    shape = new Pen(payload.points, payload.color);
                    break;
                default:
                    console.log("Unknown shape received from websocket, shape:", payload);
            }

            if (shape) {
                this.shapes.push(shape);
                this.drawShapes();
            }
        }
    }

    handleDown(e: MouseEvent) {
        console.log("mouse down");
        this.clicked = true;
        this.startX = e.offsetX;
        this.startY = e.offsetY;

        // Deselect all if clicked on empty space
        this.shapes.forEach(shape => shape.setSelected(false));
        this.selectedShape = null;
        this.selectedHandle = null;

        // check if user click on any shape if yes mark it selected
        for (const shape of this.shapes) {
            if (shape.isPointerInside(e.offsetX, e.offsetY)) {
                shape.setSelected(true);
                this.selectedShape = shape;

                // check if click was on a handle of this shape
                const handle = shape.getHandleAt(e.offsetX, e.offsetY);
                if (handle) {
                    this.selectedHandle = handle;
                }

                this.drawShapes(); // redraw to show handles
                return;
            }
        }

        // otherwise start creating new shapes
        if (this.selectedShapeType === ShapeTypes.PEN) {
            this.penPath = [];
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.penPath.push({ x: this.startX, y: this.startY });
            this.drawing = true;
        }
    }

    handleMove(e: MouseEvent) {
        if (!this.clicked) return;

        // If shape and handle selected we can resize
        if (this.selectedShape && this.selectedHandle) {
            this.selectedShape.resize(this.selectedHandle, e.offsetX, e.offsetY);
            this.startX = e.offsetX;
            this.startY = e.offsetY;
            this.drawShapes();
            return;
        }

        // If a shape is selected but no handle, we can move shape
        if (this.selectedShape && !this.selectedHandle) {
            const dx = e.offsetX - this.startX;
            const dy = e.offsetY - this.startY;
            this.selectedShape.move(dx, dy);
            this.startX = e.offsetX;
            this.startY = e.offsetY;
            this.drawShapes();
            return;
        }

        // otherwise draw the shapes progress
        const width = e.offsetX - this.startX;
        const height = e.offsetY - this.startY;

        if (this.selectedShapeType !== ShapeTypes.PEN) {
            this.drawShapes();
        }
        this.ctx.strokeStyle = this.selectedColor;

        if (this.selectedShapeType === ShapeTypes.RECTANGLE) {
            this.ctx.strokeRect(this.startX, this.startY, width, height);
        }

        else if (this.selectedShapeType === ShapeTypes.CIRCLE) {
            const centerX = (e.offsetX + this.startX) / 2
            const centerY = (e.offsetY + this.startY) / 2
            const radius = Math.sqrt(width * width + height * height) / 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }

        else if (this.selectedShapeType === ShapeTypes.LINE) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.stroke();
        }

        else if (this.selectedShapeType === ShapeTypes.PEN) {
            if (!this.drawing) return;
            this.penPath.push({ x: e.offsetX, y: e.offsetY });
            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.lineCap = "butt";
            this.ctx.stroke();
        }
    }

    handleUp(e: MouseEvent) {
        if (!this.clicked) return;

        // If we were resizing or moving, just finish the action
        if (this.selectedShape) {
            this.selectedHandle = null;
            this.selectedShape = null; // optional: keep selection if you want
            this.clicked = false;
            this.drawShapes();
            return;
        }

        const width = e.offsetX - this.startX;
        const height = e.offsetY - this.startY;

        let chatPayload = {
            type: "chat",
            roomId: this.roomId,
            message: {}
        }

        if (this.selectedShapeType === ShapeTypes.RECTANGLE) {

            this.shapes.push(new Rectangle(this.startX, this.startY, width, height, this.selectedColor));

            chatPayload.message = { type: ShapeTypes.RECTANGLE, startX: this.startX, startY: this.startY, width, height, color: this.selectedColor }
        }

        else if (this.selectedShapeType === ShapeTypes.CIRCLE) {
            const centerX = (e.offsetX + this.startX) / 2
            const centerY = (e.offsetY + this.startY) / 2
            const radius = Math.sqrt(width * width + height * height) / 2;

            this.shapes.push(new Circle(centerX, centerY, radius, this.selectedColor));

            chatPayload.message = { type: ShapeTypes.CIRCLE, startX: centerX, startY: centerY, radius, color: this.selectedColor };
        }

        else if (this.selectedShapeType === ShapeTypes.LINE) {
            this.shapes.push(new Line(this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor));

            chatPayload.message = { type: ShapeTypes.LINE, startX: this.startX, startY: this.startY, endX: e.offsetX, endY: e.offsetY, color: this.selectedColor };
        }

        else if (this.selectedShapeType === ShapeTypes.PEN) {
            if (!this.drawing) return;
            this.penPath.push({ x: e.offsetX, y: e.offsetY });

            this.shapes.push(new Pen(this.penPath, this.selectedColor));

            chatPayload.message = { type: ShapeTypes.PEN, points: this.penPath, color: this.selectedColor };
            this.drawing = false;
        }

        this.socket?.send(JSON.stringify(chatPayload));
        this.drawShapes();
        this.clicked = false;
        this.selectedShape = null;
        this.selectedHandle = null;
    }

    addEventListeners() {
        this.canvas.addEventListener("mousedown", this.handleDown);
        this.canvas.addEventListener("mousemove", this.handleMove);
        this.canvas.addEventListener("mouseup", this.handleUp);
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.handleDown);
        this.canvas.removeEventListener("mousemove", this.handleMove);
        this.canvas.removeEventListener("mouseup", this.handleUp);
    }
}