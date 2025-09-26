import { BaseShape } from "./BaseShape";

export class TextShape extends BaseShape {
    startX: number;
    startY: number;
    text: string;
    fontSize: number;
    maxWidth: number;
    height: number;
    ctx: CanvasRenderingContext2D;
    fontFamily: string;
    initialWidth: number;
    initialHeight: number;
    originalFontSize: number;

    constructor(startX: number, startY: number, text: string, fontSize: number, color: string, maxWidth: number, ctx: CanvasRenderingContext2D, fontFamily: string = "cursive") {
        super(color);
        this.startX = startX;
        this.startY = startY;
        this.text = text;
        this.fontSize = fontSize;
        this.maxWidth = maxWidth;
        this.height = 0;
        this.ctx = ctx;
        this.fontFamily = fontFamily;
        this.initialWidth = this.maxWidth;
        this.initialHeight = this.height;
        this.originalFontSize = this.fontSize;

        this.updateHeight(ctx);
    }

    // add/update height when creating or updating shape 
    // usefull for easier access for handle creation in resizing and moving
    private computeLines(ctx: CanvasRenderingContext2D): string[] {
        ctx.save();
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;

        const lineHeight = this.fontSize * 1.2;
        const lines: string[] = [];

        const paragraphs = this.text.split("\n");

        for (const para of paragraphs) {
            let line = "";
            const words = para.includes(" ") ? para.split(/\s+/) : [para];

            for (const word of words) {
                let testLine = line === "" ? word : line + " " + word;
                const testWidth = ctx.measureText(testLine).width;

                if (testWidth > this.maxWidth && line === "") {
                    // break long word character by character
                    let subLine = "";
                    for (const char of word) {
                        const testSubLine = subLine + char;
                        if (ctx.measureText(testSubLine).width > this.maxWidth) {
                            lines.push(subLine);
                            subLine = char;
                        } else {
                            subLine = testSubLine;
                        }
                    }
                    line = subLine;
                } else if (testWidth > this.maxWidth) {
                    lines.push(line)
                    line = word;
                } else {
                    line = testLine;
                }
            }

            if (line !== "") {
                lines.push(line);
            }

            lines.push("");
        }

        ctx.restore();
        return lines.filter(l => l !== "" || lines.length > 1);
    }

    updateHeight(ctx: CanvasRenderingContext2D): void {
        const lineHeight = this.fontSize * 1.2;
        const lines = this.computeLines(ctx);
        this.height = lines.length * lineHeight;
    }

    // draw with dynamic word wrapping
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.font = `100 ${this.fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = this.color;
        ctx.textBaseline = "top";
        ctx.textAlign = "left";

        const lineHeight = this.fontSize * 1.2;
        let y = this.startY;

        const lines = this.computeLines(ctx);

        for (const line of lines) {
            if (line !== "") {
                ctx.fillText(line, this.startX, y, this.maxWidth);
            }
            y += lineHeight;
        }

        ctx.restore();

        // draw resize handlers only if selected
        if (this.selected) {
            this.getAllHandle().forEach(h => {
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
                ctx.strokeRect(h.x - 4, h.y - 4, 8, 8);
            });

            ctx.strokeStyle = "white";
            const padding = 10;
            ctx.strokeRect(this.startX - padding, this.startY - padding, this.maxWidth + padding, this.height + padding);
        }
    }

    isPointerInside(x: number, y: number): boolean {
        return x >= this.startX && x <= this.startX + this.maxWidth && y >= this.startY && y <= this.startY + this.height;
    }

    // get all handles positions
    getAllHandle() {
        let { startX, startY, maxWidth, height } = this;
        const padding = 10;
        let x = startX - padding;
        let y = startY - padding;
        maxWidth += padding;
        height += padding;

        return [
            { name: "top-left", x: x, y: y },
            { name: "top-center", x: x + maxWidth / 2, y: y },
            { name: "top-right", x: x + maxWidth, y: y },
            { name: "left-center", x: x, y: y + height / 2 },
            { name: "right-center", x: x + maxWidth, y: y + height / 2 },
            { name: "bottom-left", x: x, y: y + height },
            { name: "bottom-center", x: x + maxWidth / 2, y: y + height },
            { name: "bottom-right", x: x + maxWidth, y: y + height }
        ]
    }

    getHandleAt(x: number, y: number): string | null {
        return this.getAllHandle().find(h => Math.abs(x - h.x) <= 5 && Math.abs(y - h.y) <= 5)?.name || null;
    }

    move(dx: number, dy: number): void {
        this.startX = this.startX + dx;
        this.startY = this.startY + dy;
    }

    setInitialStage(): void {
        this.initialWidth = this.maxWidth;
        this.initialHeight = this.height;
        this.originalFontSize = this.fontSize;
    }

    resize(handle: string, x: number, y: number): void {
        const PADDING = 10;
        const MIN_WIDTH = 40 + 2 * PADDING;
        const MIN_HEIGHT = 20 + 2 * PADDING;
        let fixedX: number, fixedY: number;

        switch (handle) {
            case "top-left":
                fixedX = this.startX + this.initialWidth;
                fixedY = this.startY + this.initialHeight;
                break;
            case "top-right":
                fixedX = this.startX;
                fixedY = this.startY + this.initialHeight;
                break;
            case "bottom-left":
                fixedX = this.startX + this.initialWidth;
                fixedY = this.startY;
                break;
            case "bottom-right":
                fixedX = this.startX;
                fixedY = this.startY;
                break;
            case "top-center":
                fixedX = this.startX;
                fixedY = this.startY + this.initialHeight;
                break;
            case "bottom-center":
                fixedX = this.startX;
                fixedY = this.startY;
                break;
            case "left-center":
                fixedX = this.startX + this.initialWidth;
                fixedY = this.startY + this.initialHeight / 2;
                break;
            case "right-center":
                fixedX = this.startX;
                fixedY = this.startY + this.initialHeight / 2;
                break;
            default: return;
        }

        let prevHeight: number = this.initialHeight || 1;
        let newHeight: number = Math.max(MIN_HEIGHT, Math.abs(y - fixedY));
        let scaleH: number = newHeight / prevHeight;

        switch (handle) {
            case "top-left":
                this.startX = Math.min(x, fixedX);
                this.startY = Math.min(y, fixedY);
                this.maxWidth = Math.max(MIN_WIDTH, Math.abs(x - fixedX));
                break;

            case "top-center":
                this.startY = Math.min(y, fixedY);
                break;

            case "top-right":
                this.startY = Math.min(y, fixedY);
                this.maxWidth = Math.max(MIN_WIDTH, Math.abs(x - fixedX));
                break;

            case "bottom-left":
                this.startX = Math.min(x, fixedX);
                this.maxWidth = Math.max(MIN_WIDTH, Math.abs(x - fixedX));
                break;

            case "bottom-right":
                this.maxWidth = Math.max(MIN_WIDTH, Math.abs(x - fixedX));
                break;

            case "bottom-center":
                // handle by scaleH outside the switch statement
                break;

            case "left-center":
                this.startX = Math.min(x, fixedX);
                this.maxWidth = Math.max(MIN_WIDTH, Math.abs(x - fixedX));
                break;

            case "right-center":
                this.maxWidth = Math.max(MIN_WIDTH, Math.abs(x - fixedX));
                break;
        }

        // increase font height with every handle exept left-center, right-center cause height is dynamically calculated
        if (handle !== "left-center" && handle !== "right-center") {
            this.fontSize = Math.max(1, this.originalFontSize * scaleH);
        }

        // recompute height based on font size and text wrapping
        this.updateHeight(this.ctx);
    }
}