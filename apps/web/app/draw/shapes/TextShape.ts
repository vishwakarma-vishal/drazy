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

    resize(handle: string, x: number, y: number): void {
        let fixedX: number, fixedY: number;

        switch (handle) {
            case "top-left":
                fixedX = this.startX + this.maxWidth;
                fixedY = this.startY + this.height;
                break;
            case "top-right":
                fixedX = this.startX;
                fixedY = this.startY + this.height;
                break;
            case "bottom-left":
                fixedX = this.startX + this.maxWidth;
                fixedY = this.startY;
                break;
            case "bottom-right":
                fixedX = this.startX;
                fixedY = this.startY;
                break;

            // Edge-center handles: fixed edge opposite to moving edge
            case "top-center":
                fixedX = this.startX;
                fixedY = this.startY + this.height;
                break;
            case "right-center":
                fixedX = this.startX;
                fixedY = this.startY;
                break;
            case "bottom-center":
                fixedX = this.startX;
                fixedY = this.startY;
                break;
            case "left-center":
                fixedX = this.startX + this.maxWidth;
                fixedY = this.startY;
                break;
            default:
                return;
        }

        // Update position and width
        if (handle !== "bottom-center" && handle !== "top-center") {
            let originalMaxWidth = this.maxWidth;
            this.maxWidth = Math.max(10, Math.abs(x - fixedX));
            this.startX = Math.min(fixedX, x);

            // Scale font proportionally to width
            const scaleW = this.maxWidth / originalMaxWidth;
            this.fontSize = Math.max(1, this.fontSize * scaleW);
        } else {
            // Scale font proportionally
            let originalHeight = this.height;
            this.height = Math.max(10, Math.abs(y - fixedY));
            this.startY = Math.min(fixedY, y);

            // Scale font proportionally to height
            const scaleH = this.height / originalHeight;
            this.fontSize = Math.max(1, this.fontSize * scaleH);
        }

        // Update height dynamically
        this.updateHeight(this.ctx);
    }
}