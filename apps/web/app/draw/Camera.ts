import { MIN_ZOOM, MAX_ZOOM } from "../constants/zoom";

export class Camera {
  x: number = 0; // starting pan
  y: number = 0; // strating pan
  zoom: number = 1;

  // zoom limit 
  minZoom = MIN_ZOOM;
  maxZoom = MAX_ZOOM;

  apply(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(this.zoom, 0, 0, this.zoom, this.x, this.y);
  }

  // keep zoom within the limit
  private clampZoom(z: number) {
    return Math.max(this.minZoom, Math.min(this.maxZoom, z));
  }

  clientToWorld(clientX: number, clientY: number, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasLocalX = (clientX - rect.left) * scaleX;
    const canvasLocalY = (clientY - rect.top) * scaleY;

    const worldX = (canvasLocalX - this.x) / this.zoom;
    const worldY = (canvasLocalY - this.y) / this.zoom;

    return { worldX, worldY, canvasLocalX, canvasLocalY, rect, scaleX, scaleY };
  }

  worldToClient(worldX: number, worldY: number, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasInternalX = worldX * this.zoom + this.x;
    const canvasInternalY = worldY * this.zoom + this.y;

    const cssLeft = canvasInternalX / scaleX + rect.left;
    const cssTop = canvasInternalY / scaleY + rect.top;

    return { left: cssLeft, top: cssTop, rect, scaleX, scaleY };
  }

  // zoom at a given point (clientX, clientY)
  // anchors is the world point under (clientX, clientY)
  zoomAround(clientX: number, clientY: number, canvas: HTMLCanvasElement, factor: number) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // canvas internal coords where the pointer is
    const clientAnchorX = (clientX - rect.left) * scaleX;
    const clientAnchorY = (clientY - rect.top) * scaleY;

    // world coordinate under the cursor before zoom
    const worldAnchorX = (clientAnchorX - this.x) / this.zoom;
    const worldAnchorY = (clientAnchorY - this.y) / this.zoom;

    const newZoom = this.clampZoom(this.zoom * factor);

    // compute new offsets so that worldBefore maps to same canvasLocal
    // canvasLocal = worldBefore * newZoom + newX  => newX = canvasLocal - worldBefore * newZoom
    const newPanX = clientAnchorX - worldAnchorX * newZoom;
    const newPanY = clientAnchorY - worldAnchorY * newZoom;

    this.zoom = newZoom;
    this.x = newPanX;
    this.y = newPanY;
  }

  // zoom using viewport center points as anchor
  zoomAtCenter(factor: number, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const centerClientX = rect.left + rect.width / 2;
    const centerClientY = rect.top + rect.height / 2;
    this.zoomAround(centerClientX, centerClientY, canvas, factor);
  }

  setZoom(z: number) {
    this.zoom = this.clampZoom(z);
  }
}
