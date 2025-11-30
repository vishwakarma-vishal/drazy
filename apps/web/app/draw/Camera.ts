

export class Camera {
  x: number = 0; // starting pan
  y: number = 0; // strating pan
  zoom: number = 1;

  apply(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, this.x, this.y);
  }

  clientToWorld(clientX: number, clientY: number, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasLocalX = (clientX - rect.left) * scaleX;
    const canvasLocalY = (clientY - rect.top) * scaleY;

    const worldX = canvasLocalX - this.x;
    const worldY = canvasLocalY - this.y;

    return { worldX, worldY, canvasLocalX, canvasLocalY, rect, scaleX, scaleY };
  }

  worldToClient(worldX: number, worldY: number, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasInternalX = worldX + this.x;
    const canvasInternalY = worldY + this.y;

    const cssLeft = canvasInternalX / scaleX + rect.left;
    const cssTop = canvasInternalY / scaleY + rect.top;

    return { left: cssLeft, top: cssTop, rect, scaleX, scaleY };
  }
}
