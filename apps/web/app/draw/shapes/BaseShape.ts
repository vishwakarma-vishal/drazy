
export abstract class BaseShape {
    protected color: string;
    protected selected: boolean = false;
    // for real time communication/consitency
    protected id: string;
    protected tempId: string;
    protected status: string; // pending, confirmed, deleted

    constructor(color: string, id: string, tempId: string, status: string) {
        this.id = id;
        this.tempId = tempId;
        this.status = status;
        this.color = color;
    }

    // getters
    getColor(): string {
        return this.color;
    }

    isSelected(): boolean {
        return this.selected;
    }

    getId(): string {
        return this.id;
    }

    getTempId(): string {
        return this.tempId;
    }

    getStatus(): string {
        return this.status;
    }

    // setters
    setColor(newColor: string): void {
        this.color = newColor;
    }

    setSelected(value: boolean): void {
        this.selected = value;
    }

    setId(id: string): void {
        this.id = id;
    }

    setTempId(tempId: string): void {
        this.tempId = tempId;
    }

    setStatus(status: string): void {
        this.status = status;
    }

    // to create
    abstract draw(ctx: CanvasRenderingContext2D): void;

    // for movement
    abstract isPointerInside(x: number, y: number): boolean;
    abstract getHandleAt(x: number, y: number): string | null;
    abstract move(dx: number, dy: number): void;
    abstract resize(handle: string, x: number, y: number): void;
}