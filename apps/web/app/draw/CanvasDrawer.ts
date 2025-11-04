import { ShapeTypes } from "../constant";
import { fetchShapes } from "./ShapeService";
import { ShapeFactory } from "./ShapeFactory";
import { BaseShape } from "./shapes/BaseShape";
import { TextShape } from "./shapes/TextShape";
import { createTextInput } from "./TextInputHelper";
import { Rectangle } from "./shapes/Rectangle";
import { Ellipse } from "./shapes/Ellipse";
import { Line } from "./shapes/Line";
import { Arrow } from "./shapes/Arrow";
import { Pen } from "./shapes/Pen";
import { devLogger } from "../utils/logger";
import { confirmStatusAndUpdateId, updateShapeWithId } from "./SyncUpdate";
import { generateTempId } from "./Utils";

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

    // to protect unnecessary update broadcast
    isMoved: boolean = false;


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
            shape.draw(this.ctx);
        });
    }

    // get roomshape form the BE and render then on canvas
    private async getCanvasContent() {
        this.shapes = await fetchShapes(this.roomId, this.ctx);
        this.drawShapes();
    }

    // get real-time content (shapes) via websocket
    private websocketConnection() {
        this.socket.onmessage = (message) => {
            const payload = JSON.parse(message.data);

            const { type, action, shape } = payload;

            // create status-pending
            if (type === "shape" && action === "create") {
                let newShape: BaseShape | null = this.shapeFactory.createShapeFromPayload(payload);

                if (newShape) {
                    this.shapes.push(newShape);
                }
            }

            // db confirm status-confim
            if (type === "shape" && action === "confirm") {
                confirmStatusAndUpdateId(this.shapes, payload);
            }

            // update 
            if (type === "shape" && action === "update") {
                updateShapeWithId(this.shapes, payload);
            }

            if (type === "shape" && action === "delete") {
                const { id, tempId } = payload;
                console.log(`Received, id->${id}, tempId->${tempId}`);

                this.shapes = this.shapes.filter(s => {
                    console.log(`id->${s.getId()}, tempId->${s.getTempId()}`)
                    const idMatch = id && s.getId() === id;
                    const tempIdMatch = tempId && s.getTempId() === tempId;
                    console.log(`idMatch:${idMatch}, tempIdMatch:${tempIdMatch}`);
                    return !(idMatch || tempIdMatch);
                });
            }

            this.drawShapes();
        }
    }

    // helper- create shape payload add it into the shapes and send it via websocket
    private finalizeShape(payload: any) {
        const { action } = payload;

        if (action === "create") {
            // create shape object
            const newShape = this.shapeFactory.createShapeFromPayload(payload);
            if (newShape instanceof TextShape) newShape.updateHeight(this.ctx);

            if (newShape) {
                // apply locally
                this.shapes.push(newShape);
                this.drawShapes();

                // send updates immediately
                this.socket?.send(JSON.stringify(payload));
            }
        }

        if (action === "update") {
            // send updates immediately
            this.socket?.send(JSON.stringify(payload));
        }

        if (action === "delete") {
            const deletedShape = this.selectedShape;
            this.shapes = this.shapes.filter(s => {
                const idMatch = deletedShape?.getId() && s.getId() === deletedShape.getId();
                const tempIdMatch = deletedShape?.getTempId() && s.getTempId() === deletedShape.getTempId();
                return !(idMatch || tempIdMatch); // remove only if either matches
            });
            this.drawShapes();
            this.socket?.send(JSON.stringify(payload));
        }
    }

    handleDown = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = e.offsetX;
        this.startY = e.offsetY;
        this.isMoved = false;

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
            this.isMoved = true;
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

        // prevent broacasting message when user only clicked on empty space or on a shape to select it
        const dx = e.offsetX - this.startX;
        const dy = e.offsetY - this.startY;
        const moveThreshold = 2; // pixels
        const isSameSpot = (dx * dx + dy * dy) <= (moveThreshold * moveThreshold);

        let shouldBlock = false;

        if (isSameSpot && !this.isMoved && this.selectedHandle !== "delete") {
            if (this.selectedShapeType === ShapeTypes.TEXT) {
                // Block only if clicking on an existing text shape (selecting it)
                shouldBlock = Boolean(this.selectedShape);
            } else {
                // Block empty-space or same-spot clicks
                shouldBlock = true;
            }
        }

        // devLogger.info("CanvasDrawer", "handleUp", `shouldBlock=${shouldBlock}`, {
        //     isSameSpot,
        //     isMoved: this.isMoved,
        //     selectedHandle: this.selectedHandle,
        //     selectedShapeType: this.selectedShapeType,
        //     selectedShape: !!this.selectedShape,
        // });


        if (shouldBlock) {
            this.clicked = false;
            return;
        }

        const shapeTempId = generateTempId();
        if (!shapeTempId) {
            // add logout functinality here
            devLogger.warn("Helper", "updateShapeWithId", "user is not logged in, logging out...");
        }

        const action = this.selectedShape ? (this.selectedHandle === "delete" ? "delete" : "update") : "create";
        const id = this.selectedShape ? this.selectedShape.getId() : "";
        const tempId = this.selectedShape ? this.selectedShape.getTempId() : shapeTempId;

        const payload = {
            type: "shape",
            roomId: this.roomId,
            action: action,
            id: id,
            tempId: tempId,
            shape: {}
        }

        const width = e.offsetX - this.startX;
        const height = e.offsetY - this.startY;

        // creating payload
        if (this.selectedShape && this.selectedHandle !== "delete") {
            // for update (move, resize)
            if (this.selectedShape instanceof Rectangle) {
                payload.shape = { type: ShapeTypes.RECTANGLE, startX: this.selectedShape.startX, startY: this.selectedShape.startY, width: this.selectedShape.width, height: this.selectedShape.height, color: this.selectedShape.getColor() }
            }
            else if (this.selectedShape instanceof Ellipse) {
                payload.shape = { type: ShapeTypes.ELLIPSE, startX: this.selectedShape.startX, startY: this.selectedShape.startY, radiusX: this.selectedShape.radiusX, radiusY: this.selectedShape.radiusY, color: this.selectedShape.getColor() };
            }
            else if (this.selectedShape instanceof Line) {
                payload.shape = { type: ShapeTypes.LINE, startX: this.selectedShape.startX, startY: this.selectedShape.startY, endX: this.selectedShape.endX, endY: this.selectedShape.endY, color: this.selectedShape.getColor() };
            }
            else if (this.selectedShape instanceof Arrow) {
                payload.shape = { type: ShapeTypes.ARROW, startX: this.selectedShape.startX, startY: this.selectedShape.startY, endX: this.selectedShape.endX, endY: this.selectedShape.endY, color: this.selectedShape.getColor() };
            }
            else if (this.selectedShape instanceof Pen) {
                payload.shape = { type: ShapeTypes.PEN, points: this.selectedShape.points, color: this.selectedShape.getColor() };
            }
            else if (this.selectedShape instanceof TextShape) {
                payload.shape = { type: ShapeTypes.TEXT, startX: this.selectedShape.startX, startY: this.selectedShape.startY, text: this.selectedShape.text, fontSize: this.selectedShape.fontSize, maxWidth: this.selectedShape.maxWidth, color: this.selectedShape.getColor() }
            }
            else {
                devLogger.warn("Helper", "updateShapeWithId", "Unknown shape selected, shape", this.selectedShape);
            }
        } else if (!this.selectedShape) {
            // for new shape
            switch (this.selectedShapeType) {
                case (ShapeTypes.RECTANGLE): {
                    payload.shape = {
                        type: ShapeTypes.RECTANGLE, startX: this.startX, startY: this.startY, width: width, height: height, color: this.selectedColor
                    }
                    break;
                }

                case (ShapeTypes.ELLIPSE): {
                    const radiusX = Math.abs(e.offsetX - this.startX) / 2;
                    const radiusY = Math.abs(e.offsetY - this.startY) / 2;

                    payload.shape = { type: ShapeTypes.ELLIPSE, startX: this.startX, startY: this.startY, radiusX, radiusY, color: this.selectedColor };
                    break;
                }

                case (ShapeTypes.LINE): {
                    payload.shape = { type: ShapeTypes.LINE, startX: this.startX, startY: this.startY, endX: e.offsetX, endY: e.offsetY, color: this.selectedColor };
                    break;
                }

                case (ShapeTypes.ARROW): {
                    payload.shape = { type: ShapeTypes.ARROW, startX: this.startX, startY: this.startY, endX: e.offsetX, endY: e.offsetY, color: this.selectedColor };
                    break;
                }

                case (ShapeTypes.PEN): {
                    if (!this.drawing) return;
                    this.penPath.push({ x: e.offsetX, y: e.offsetY });

                    payload.shape = { type: ShapeTypes.PEN, points: this.penPath, color: this.selectedColor };
                    this.drawing = false;
                    break;
                }

                case (ShapeTypes.TEXT): {
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
                    break;
                }

                default: {
                    devLogger.warn("Helper", "updateShapeWithId", "Unknow shapeType selected, selectedShapeType", this.selectedShapeType);
                }
            }
        } else {
            // delete shape
            if (this.selectedShape instanceof Rectangle) {
                payload.shape = { type: ShapeTypes.RECTANGLE }
            }
            else if (this.selectedShape instanceof Ellipse) {
                payload.shape = { type: ShapeTypes.ELLIPSE };
            }
            else if (this.selectedShape instanceof Line) {
                payload.shape = { type: ShapeTypes.LINE };
            }
            else if (this.selectedShape instanceof Arrow) {
                payload.shape = { type: ShapeTypes.ARROW };
            }
            else if (this.selectedShape instanceof Pen) {
                payload.shape = { type: ShapeTypes.PEN };
            }
            else if (this.selectedShape instanceof TextShape) {
                payload.shape = { type: ShapeTypes.TEXT }
            }
            else {
                devLogger.warn("Helper", "updateShapeWithId", "Unknown shape selected, shape", this.selectedShape);
            }
        }

        if (Object.keys(payload.shape).length > 0) {
            this.finalizeShape(payload);
        }

        this.clicked = false;
        this.isMoved = false;
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