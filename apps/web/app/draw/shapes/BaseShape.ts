
export abstract class BaseShape {
    protected color: string

    constructor(color: string) {
        this.color = color;
    }

    getColor(): string {
        return this.color;
    }

    setColor(newColor: string) {
        return this.color = newColor;
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
}