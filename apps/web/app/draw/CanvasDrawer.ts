import { ShapeTypes } from "../constant";
import { fetchShapes } from "./ShapeService";
import { ShapeFactory } from "./ShapeFactory";
import { BaseShape } from "./shapes/BaseShape";
import { TextShape } from "./shapes/TextShape";
import { createTextInput } from "./TextInputHelper";
import { confirmStatusAndUpdateId, generateTempId, updateShapeWithId } from "./Helper";
import { Rectangle } from "./shapes/Rectangle";

export class CanvasDrawer {
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

    // classes to modularize the drawer
    shapeFactory: ShapeFactory;


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
        this.addEventListeners();
        this.websocketConnection();

        this.shapeFactory = new ShapeFactory(this.ctx);
    }

    // render shapes on the canvas
    private drawShapes() {
        // clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw all the content again
        this.shapes.forEach((shape) => {
            // console.log("shape -> ", shape);
            shape.draw(this.ctx);
        });
    }

    // get roomshape form the BE and render then on canvas
    private async getCanvasContent() {
        this.shapes = await fetchShapes(this.roomId, this.ctx);
        // console.log("intial shapes -> ", this.shapes);
        this.drawShapes();
    }

    // get real-time content (shapes) via websocket
    private websocketConnection() {
        this.socket.onmessage = (message) => {
            const payload = JSON.parse(message.data);
            console.log("payload -> ", payload);

            // create status-pending
            if (payload.type === "shape" && payload.action === "create") {
                let shape: BaseShape | null = this.shapeFactory.createShapeFromPayload(payload.shape);
                console.log("receiver: before shape snapshot ->", JSON.parse(JSON.stringify(shape)));

                if (shape) {
                    this.shapes.push(shape);
                }
            }

            // db confirm status-confim
            if (payload.type === "shape" && payload.action === "confirm") {
                confirmStatusAndUpdateId(this.shapes, payload);
            }

            // update 
            if (payload.type === "shape" && payload.action === "update") {
                updateShapeWithId(this.shapes, payload);
            }

            this.drawShapes();
        }
    }

    // helper- create shape payload add it into the shapes and send it via websocket
    private finalizeShape(payload: any) {
        if (payload.action === "create") {
            const shape = this.shapeFactory.createShapeFromPayload(payload.shape);
            if (shape instanceof TextShape) shape.updateHeight(this.ctx);

            if (shape) {
                console.log("sender:before shape snapshot ->", JSON.parse(JSON.stringify(shape)));
                this.shapes.push(shape);
                this.socket?.send(JSON.stringify(payload));
            }
            this.drawShapes();
        }

        if (payload.action === "update") {
            this.socket?.send(JSON.stringify(payload));
        }
    }

    handleDown = (e: MouseEvent) => {
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

    handleMove = (e: MouseEvent) => {
        if (!this.clicked) return;

        // If shape and handle selected we can resize
        if (this.selectedShape && this.selectedHandle) {
            if (this.selectedShape instanceof TextShape) {
                this.selectedShape.setInitialStage();
            }
            this.selectedShape.resize(this.selectedHandle, e.offsetX, e.offsetY);
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
            this.shapeFactory.rectanglePreview(this.startX, this.startY, width, height, this.selectedColor);
        }

        else if (this.selectedShapeType === ShapeTypes.ELLIPSE) {
            const centerX = (e.offsetX + this.startX) / 2;
            const centerY = (e.offsetY + this.startY) / 2;

            // Half the width/height gives you radii
            const radiusX = Math.abs(e.offsetX - this.startX) / 2;
            const radiusY = Math.abs(e.offsetY - this.startY) / 2;

            this.shapeFactory.ellipsePreview(centerX, centerY, radiusX, radiusY, this.selectedColor);
        }

        else if (this.selectedShapeType === ShapeTypes.LINE) {
            this.shapeFactory.linePreview(this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor);
        }

        else if (this.selectedShapeType === ShapeTypes.PEN) {
            if (!this.drawing) return;
            this.penPath.push({ x: e.offsetX, y: e.offsetY });
            this.shapeFactory.penPreview(e.offsetX, e.offsetY, this.selectedColor);
        }

        else if (this.selectedShapeType === ShapeTypes.ARROW) {
            this.shapeFactory.arrowPreview(this.startX, this.startY, e.offsetX, e.offsetY, this.selectedColor);
        }

        else if (this.selectedShapeType === ShapeTypes.TEXT) {
            const rect = this.canvas.getBoundingClientRect();
            this.dragEndX = e.clientX - rect.left;

            // Draw temporary outline rectangle with fixed height
            const tempWidth = this.dragEndX - this.dragStartX;
            const tempHeight = 16 * 1.2; // one line height

            this.shapeFactory.textInputBoxPreview(this.dragStartX, this.dragStartY, tempWidth, tempHeight, this.selectedColor);
        }
    }

    handleUp = (e: MouseEvent) => {
        if (!this.clicked) return;
        const payload = {
            type: "shape",
            roomId: this.roomId,
            action: "create",
            shape: {}
        }

        const shapeTempId = generateTempId();
        if (!shapeTempId) {
            // add logout functinality here
            console.log("user is not logged in, logging out...");
        }

        // If we were resizing or moving, just finish the action
        if (this.selectedShape) {
            // finilize the update sync with backend
            if (this.selectedShape instanceof Rectangle) {
                const payload = {
                    type: "shape",
                    roomId: this.roomId,
                    action: "update",
                    id: this.selectedShape.id,
                    tempId: this.selectedShape.tempId,
                    updates: {}
                }

                payload.updates = { type: this.selectedShapeType, startX: this.selectedShape.startX, startY: this.selectedShape.startY, width: this.selectedShape.width, height: this.selectedShape.height, color: this.selectedShape.getColor() }

                this.finalizeShape(payload);
            }

            this.selectedHandle = null;
            this.selectedShape = null; // optional: keep selection if you want
            this.clicked = false;
            this.drawShapes();
            return;
        }

        const width = e.offsetX - this.startX;
        const height = e.offsetY - this.startY;

        if (this.selectedShapeType === ShapeTypes.RECTANGLE) {
            payload.shape = { type: ShapeTypes.RECTANGLE, id: "", tempId: shapeTempId, status: "pending", startX: this.startX, startY: this.startY, width, height, color: this.selectedColor }
        }

        else if (this.selectedShapeType === ShapeTypes.ELLIPSE) {
            const radiusX = Math.abs(e.offsetX - this.startX) / 2;
            const radiusY = Math.abs(e.offsetY - this.startY) / 2;

            payload.shape = { type: ShapeTypes.ELLIPSE, startX: this.startX, startY: this.startY, radiusX, radiusY, color: this.selectedColor };
        }

        else if (this.selectedShapeType === ShapeTypes.LINE) {

            payload.shape = { type: ShapeTypes.LINE, startX: this.startX, startY: this.startY, endX: e.offsetX, endY: e.offsetY, color: this.selectedColor };
        }

        else if (this.selectedShapeType === ShapeTypes.ARROW) {

            payload.shape = { type: ShapeTypes.ARROW, startX: this.startX, startY: this.startY, endX: e.offsetX, endY: e.offsetY, color: this.selectedColor };
        }

        else if (this.selectedShapeType === ShapeTypes.PEN) {
            if (!this.drawing) return;
            this.penPath.push({ x: e.offsetX, y: e.offsetY });

            payload.shape = { type: ShapeTypes.PEN, points: this.penPath, color: this.selectedColor };
            this.drawing = false;
        }

        else if (this.selectedShapeType === ShapeTypes.TEXT) {
            const rect = this.canvas.getBoundingClientRect();
            this.dragEndX = e.clientX - rect.left;

            // Determine width of the input box
            const dragWidth = Math.abs(this.dragEndX - this.dragStartX);

            let promise: Promise<any | null>;
            if (dragWidth <= 2) {
                // Click case
                promise = createTextInput(this.canvas, this.dragStartX, this.dragStartY, this.selectedColor);
            } else {
                // Drag case
                promise = createTextInput(this.canvas, this.dragStartX, this.dragStartY, this.selectedColor, this.dragEndX);
            }

            promise.then((shapeProp) => {
                if (!shapeProp) return;

                payload.shape = { type: ShapeTypes.TEXT, startX: shapeProp.startX, startY: shapeProp.startY, text: shapeProp.value, fontSize: shapeProp.fontSize, maxWidth: shapeProp.maxWidth, color: shapeProp.color }

                this.finalizeShape(payload);

                this.dragStartX = 0;
                this.dragStartY = 0;
                this.dragEndX = 0;
            });
        }

        if (Object.keys(payload.shape).length > 0) {
            this.finalizeShape(payload);
        }

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