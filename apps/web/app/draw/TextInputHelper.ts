import { Camera } from "./Camera";

export function createTextInput(
    canvas: HTMLCanvasElement,
    worldStartX: number,
    worldStartY: number,
    camera: Camera,
    color: string,
    worldEndX?: number
): Promise<any | null> {
    return new Promise<any | null>((resolve) => {
        {
            const container = canvas.parentElement!;
            if (getComputedStyle(container).position === "static") {
                container.style.position = "relative";
            }

            // convert world coords to pages css coords using camera
            const { left: cssLeftPage, top: cssTopPage, rect, scaleX } = camera.worldToClient(worldStartX, worldStartY, canvas);

            // container rect so we can position relative to it
            let containerRect = container.getBoundingClientRect();
            let cssLeft = cssLeftPage - containerRect.left;
            let cssTop = cssTopPage - containerRect.top;

            const fontFamily = "cursive"; // hardcoded for now
            const fontSizeInternal = 16;
            const fontSizeCSS = (fontSizeInternal * camera.zoom) / scaleX;

            // Determine width of textarea
            let maxWidthWorld: number;
            const MIN_CSS_WIDTH = 10;
            const PAGE_RIGHT_PADDING = 0;

            if (typeof worldEndX !== "undefined") {
                maxWidthWorld = Math.abs(worldEndX - worldStartX); // drag case
            } else {
                const availableCss = Math.max(0, containerRect.right - cssLeftPage - PAGE_RIGHT_PADDING);
                const chosenCss = Math.max(MIN_CSS_WIDTH, availableCss);
                maxWidthWorld = (chosenCss * scaleX) / camera.zoom;
            }

            // Guarantee positive
            if (!isFinite(maxWidthWorld) || maxWidthWorld <= 0) {
                maxWidthWorld = (200 * scaleX) / Math.max(0.001, camera.zoom);
            }

            const chooseMaxWidth = (maxWidthWorld * camera.zoom) / scaleX;
            const WidthCss = Math.max(MIN_CSS_WIDTH, Math.floor(chooseMaxWidth));

            // Create textarea element and styled it
            const textarea = document.createElement("textarea");
            textarea.style.position = "absolute";
            textarea.style.left = `${cssLeft}px`;
            textarea.style.top = `${cssTop - fontSizeCSS * 0.2}px`;
            textarea.style.width = `${WidthCss}px`;
            textarea.style.minHeight = `${fontSizeCSS * 1.2}px`;
            textarea.style.fontSize = `${fontSizeCSS}px`;
            textarea.style.fontWeight = "100";
            textarea.style.fontFamily = fontFamily;
            textarea.style.color = color || "white";
            textarea.style.border = "none";
            textarea.style.outline = "none";
            textarea.style.padding = "0";
            textarea.style.margin = "0";
            textarea.style.background = "transparent";
            textarea.style.lineHeight = `${fontSizeCSS * 1.2}px`;
            textarea.style.resize = "none";
            textarea.style.overflow = "hidden";
            textarea.style.boxSizing = "content-box";
            textarea.style.zIndex = "1000";

            container.appendChild(textarea);

            // Recompute cssLeft/cssTop relative to up-to-date container rect
            containerRect = container.getBoundingClientRect();
            cssLeft = cssLeftPage - containerRect.left;
            cssTop = cssTopPage - containerRect.top;
            textarea.style.left = `${cssLeft}px`;
            textarea.style.top = `${cssTop - fontSizeCSS * 0.2}px`;

            // clamp helper: keep textarea inside container horizontally
            const clampIntoContainer = () => {
                const taRect = textarea.getBoundingClientRect();
                const overflowRight = taRect.right - containerRect.right;
                if (overflowRight > 0) {
                    // shift left so it fits; keep at least a small margin
                    const shiftLeft = Math.min(overflowRight + 6, cssLeft);
                    cssLeft = Math.max(4, cssLeft - shiftLeft);
                    textarea.style.left = `${cssLeft}px`;
                }
                // ensure not off the left edge
                if (cssLeft < 4) {
                    cssLeft = 4;
                    textarea.style.left = `${cssLeft}px`;
                }
            };

            // Auto-grow height based on content
            const updateHeight = () => {
                textarea.style.height = "auto";
                textarea.style.height = textarea.scrollHeight + "px";

                clampIntoContainer();
            };


            const cleanup = () => {
                textarea.removeEventListener("input", updateHeight);
                textarea.removeEventListener("keydown", onKeyDown);
                textarea.removeEventListener("blur", commit);
            }

            // Commit text function
            const commit = () => {
                cleanup();
                textarea.remove();

                let shapeProp = null;
                if (textarea.value.trim() !== "") {
                    shapeProp = {
                        startX: worldStartX,
                        startY: worldStartY,
                        value: textarea.value,
                        fontSize: fontSizeInternal,
                        color,
                        maxWidth: maxWidthWorld
                    };
                }

                resolve(shapeProp);
            };

            const onInput = () => {
                updateHeight();
            }

            // Commit on Esc and Ctr/Cmd + enter
            const onKeyDown = (ev: KeyboardEvent) => {
                if (ev.key === "Escape") {
                    ev.preventDefault();
                    commit();
                }
                if ((ev.key === "Enter") && (ev.ctrlKey || ev.metaKey)) {
                    ev.preventDefault();
                    commit();
                }
            }

            // adding event listeners
            textarea.addEventListener("input", onInput);
            textarea.addEventListener("keydown", onKeyDown);
            textarea.addEventListener("blur", commit);

            updateHeight();
            clampIntoContainer();
            requestAnimationFrame(() => textarea.focus());
        }
    })
}