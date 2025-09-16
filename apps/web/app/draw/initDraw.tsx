
type shapeType = "RECTANGLE"

type shape = {
    type: shapeType,
    startX: number,
    startY: number,
    width: number,
    height: number
}

let shapes: shape[] = [];

const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
        if (shape.type === "RECTANGLE") {
            ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
        }
    });
}

export const initDraw = (canvas: HTMLCanvasElement) => {
    let ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "green";

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

        shapes.push({ type: "RECTANGLE", startX, startY, width, height });
        draw(canvas, ctx);
        clicked = false;
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