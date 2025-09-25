import { ShapeTypes } from "../constant";
import { getContent } from "./http";
import { Arrow } from "./shapes/Arrow";
import { BaseShape } from "./shapes/BaseShape";
import { Ellipse } from "./shapes/Ellipse";
import { Line } from "./shapes/Line";
import { Pen } from "./shapes/Pen";
import { Rectangle } from "./shapes/Rectangle";
import { TextShape } from "./shapes/TextShape";

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

    // for text shape
    dragStartX: number = 0;
    dragStartY: number = 0;
    dragEndX: number = 0;


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
        this.createTextInput = this.createTextInput.bind(this);

        this.addEventListeners();
        this.websocketConnection();
    }

    // get roomshape form the BE and render then on canvas
    async getCanvasContent() {
        this.shapes = await getContent(this.roomId, this.ctx);
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
                case ShapeTypes.ELLIPSE:
                    shape = new Ellipse(payload.startX, payload.startY, payload.radiusX, payload.radiusY, payload.color);
                    break;
                case ShapeTypes.LINE:
                    shape = new Line(payload.startX, payload.startY, payload.endX, payload.endY, payload.color);
                    break;
                case ShapeTypes.ARROW:
                    shape = new Arrow(payload.startX, payload.startY, payload.endX, payload.endY, payload.color);
                    break;
                case ShapeTypes.PEN:
                    shape = new Pen(payload.points, payload.color);
                    break;
                case ShapeTypes.TEXT:
                    shape = new TextShape(payload.startX, payload.startY, payload.text, payload.fontSize, payload.color, payload.maxWidth, this.ctx);
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

        if (this.selectedShapeType === ShapeTypes.TEXT) {
            const rect = this.canvas.getBoundingClientRect();
            this.dragStartX = e.clientX - rect.left;
            this.dragStartY = e.clientY - rect.top;
        }

        // check if user click on any shape if yes mark it selected
        for (const shape of this.shapes) {
            // check handle first
            const handle = shape.getHandleAt(e.offsetX, e.offsetY);
            if (handle) {
                shape.setSelected(true);
                this.selectedShape = shape;
                this.selectedHandle = handle;
                this.drawShapes();
                return;
            }

            // if not on handle, check shape body
            if (shape.isPointerInside(e.offsetX, e.offsetY)) {
                shape.setSelected(true);
                this.selectedShape = shape;
                this.drawShapes();
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
            // this.startX = e.offsetX;
            // this.startY = e.offsetY;
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

        else if (this.selectedShapeType === ShapeTypes.ELLIPSE) {
            const centerX = (e.offsetX + this.startX) / 2;
            const centerY = (e.offsetY + this.startY) / 2;

            // Half the width/height gives you radii
            const radiusX = Math.abs(e.offsetX - this.startX) / 2;
            const radiusY = Math.abs(e.offsetY - this.startY) / 2;

            this.ctx.beginPath();
            this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
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

        else if (this.selectedShapeType === ShapeTypes.ARROW) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.stroke();

            // drawing the arrow head
            const angle = Math.atan2(e.offsetY - this.startY, e.offsetX - this.startX);
            const headLength = 10; // length of arrow left/right line
            const headAngle = Math.PI / 6; // 30 degree

            //
            const leftAngle = angle - headAngle;
            const rightAngle = angle + headAngle;
            const leftX = e.offsetX - headLength * Math.cos(leftAngle);
            const leftY = e.offsetY - headLength * Math.sin(leftAngle);
            const rightX = e.offsetX - headLength * Math.cos(rightAngle);
            const rightY = e.offsetY - headLength * Math.sin(rightAngle);

            // draw the head
            this.ctx.beginPath();
            this.ctx.moveTo(leftX, leftY);
            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.moveTo(rightX, rightY);
            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.stroke();
        }

        else if (this.selectedShapeType === ShapeTypes.TEXT) {
            const rect = this.canvas.getBoundingClientRect();
            this.dragEndX = e.clientX - rect.left;

            // Redraw canvas to clear old temporary rectangle
            this.drawShapes();

            // Draw temporary outline rectangle with fixed height
            const tempWidth = this.dragEndX - this.dragStartX;
            const tempHeight = 16 * 1.2; // one line height
            this.ctx.strokeStyle = this.selectedColor;
            this.ctx.strokeRect(this.dragStartX, this.dragStartY, tempWidth, tempHeight);
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

        else if (this.selectedShapeType === ShapeTypes.ELLIPSE) {
            const centerX = (e.offsetX + this.startX) / 2
            const centerY = (e.offsetY + this.startY) / 2
            const radiusX = Math.abs(e.offsetX - this.startX) / 2;
            const radiusY = Math.abs(e.offsetY - this.startY) / 2;

            this.shapes.push(new Ellipse(centerX, centerY, radiusX, radiusY, this.selectedColor));

            chatPayload.message = { type: ShapeTypes.ELLIPSE, startX: centerX, startY: centerY, radiusX, radiusY, color: this.selectedColor };
        }

        else if (this.selectedShapeType === ShapeTypes.LINE) {
            this.shapes.push(new Line(this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor));

            chatPayload.message = { type: ShapeTypes.LINE, startX: this.startX, startY: this.startY, endX: e.offsetX, endY: e.offsetY, color: this.selectedColor };
        }

        else if (this.selectedShapeType === ShapeTypes.ARROW) {
            this.shapes.push(new Arrow(this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor));

            chatPayload.message = { type: ShapeTypes.ARROW, startX: this.startX, startY: this.startY, endX: e.offsetX, endY: e.offsetY, color: this.selectedColor };
        }

        else if (this.selectedShapeType === ShapeTypes.PEN) {
            if (!this.drawing) return;
            this.penPath.push({ x: e.offsetX, y: e.offsetY });

            this.shapes.push(new Pen(this.penPath, this.selectedColor));

            chatPayload.message = { type: ShapeTypes.PEN, points: this.penPath, color: this.selectedColor };
            this.drawing = false;
        }

        else if (this.selectedShapeType === ShapeTypes.TEXT) {
            const rect = this.canvas.getBoundingClientRect();
            this.dragEndX = e.clientX - rect.left;

            // Determine width of the input box
            const width = Math.max(this.dragEndX - this.dragStartX);

            if (width <= 2) {
                // Click case
                this.createTextInput(this.dragStartX, this.dragStartY);
            } else {
                // Drag case
                this.createTextInput(this.dragStartX, this.dragStartY, this.dragEndX);
            }

            this.dragStartX = 0;
            this.dragStartY = 0;
            this.dragEndX = 0;
        }

        if (Object.keys(chatPayload.message).length > 0) this.socket?.send(JSON.stringify(chatPayload));
        this.drawShapes();
        this.clicked = false;
        this.selectedShape = null;
        this.selectedHandle = null;
    }

    createTextInput(startX: number, startY: number, endX?: number): void {
        const container = this.canvas.parentElement!;
        container.style.position = "relative";

        const fontSize = 16;
        const fontFamily = "Helvetica";

        // Use canvas offset relative to parent container for exact alignment
        const rect = this.canvas.getBoundingClientRect();
        const domX = rect.left + startX;
        const domY = rect.top + startY;

        // Determine width of textarea
        let maxWidth: number;
        if (endX !== undefined) {
            maxWidth = Math.min(endX - startX, this.canvas.width - startX);
        } else {
            maxWidth = this.canvas.width - startX;
        }

        // Create textarea element and styled it
        const textarea = document.createElement("textarea");
        textarea.style.position = "absolute";
        textarea.style.left = `${domX}px`;
        textarea.style.top = `${domY}px`;
        textarea.style.width = `${maxWidth}px`;
        textarea.style.minHeight = `${fontSize * 1.2}px`;
        textarea.style.fontSize = `${fontSize}px`;
        textarea.style.fontFamily = fontFamily;
        textarea.style.color = this.selectedColor || "white";
        textarea.style.border = "none";
        textarea.style.outline = "none";
        textarea.style.padding = "0";
        textarea.style.margin = "0";
        textarea.style.background = "transparent";
        textarea.style.lineHeight = `${fontSize * 1.2}px`;
        textarea.style.resize = "none";
        textarea.style.overflow = "hidden";
        textarea.style.boxSizing = "content-box";
        textarea.style.zIndex = "1000";

        container.appendChild(textarea);

        // Auto-grow height based on content
        const updateHeight = () => {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        };

        textarea.addEventListener("input", updateHeight);
        updateHeight();

        // Focus after render
        requestAnimationFrame(() => textarea.focus());

        // Commit text function
        const commit = () => {
            textarea.removeEventListener("blur", commit);

            if (textarea.value !== "") {
                const textShape =
                    new TextShape(startX, startY, textarea.value, fontSize, this.selectedColor, maxWidth, this.ctx);
                textShape.updateHeight(this.ctx);
                this.shapes.push(textShape);

                const chatPayload = {
                    type: "chat",
                    roomId: this.roomId,
                    message: { type: ShapeTypes.TEXT, startX: startX, startY: startY, text: textarea.value, fontSize: fontSize, maxWidth: maxWidth, color: this.selectedColor }
                }

                this.socket?.send(JSON.stringify(chatPayload));
            }
            textarea.remove();

            this.drawShapes();
        };

        // Commit on Esc
        textarea.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape") {
                ev.preventDefault();
                commit();
            }
        });

        // Commit on blur
        textarea.addEventListener("blur", commit);
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