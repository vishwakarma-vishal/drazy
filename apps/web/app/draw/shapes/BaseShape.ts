
export abstract class BaseShape {
    protected color: string;
    protected selected: boolean = false;

    constructor(color: string) {
        this.color = color;
    }

    getColor(): string {
        return this.color;
    }

    setColor(newColor: string) {
        return this.color = newColor;
    }

    isSelected(): boolean {
        return this.selected;
    }

    setSelected(value: boolean): void{
        this.selected = value;
    }

    // to create
    abstract draw(ctx: CanvasRenderingContext2D): void;

    // for movement
    abstract isPointerInside(x: number, y: number): boolean;
    abstract getHandleAt(x: number, y: number): string | null;
    abstract move(dx: number, dy: number): void;
    abstract resize(handle: string, x:number, y: number): void;
}