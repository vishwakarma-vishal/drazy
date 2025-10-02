
// responsible for creating text input dom element and draw it on the canvas
// after commit the text input disappers and the text in converted into textshape object
export function createTextInput(
    canvas: HTMLCanvasElement,
    startX: number,
    startY: number,
    color: string,
    endX?: number
): Promise<any | null> {
    return new Promise<any | null>((resolve) => {
        {
            const container = canvas.parentElement!;
            container.style.position = "relative";

            const fontSize = 16;
            const fontFamily = "Helvetica";

            // Use canvas offset relative to parent container for exact alignment
            const rect = canvas.getBoundingClientRect();
            const domX = rect.left + startX;
            const domY = rect.top + startY;

            // Determine width of textarea
            let maxWidth: number;
            if (endX !== undefined) {
                maxWidth = Math.min(Math.abs(endX - startX), canvas.width - startX);
            } else {
                maxWidth = canvas.width - startX;
            }

            // Create textarea element and styled it
            const textarea = document.createElement("textarea");
            textarea.style.position = "absolute";
            textarea.style.left = `${domX}px`;
            textarea.style.top = `${domY}px`;
            textarea.style.width = `${maxWidth}px`;
            textarea.style.minHeight = `${fontSize * 1.2}px`;
            textarea.style.fontSize = `${fontSize}px`;
            textarea.style.fontFamily = fontFamily;
            textarea.style.color = color || "white";
            textarea.style.border = "none";
            textarea.style.outline = "none";
            textarea.style.padding = "0";
            textarea.style.margin = "0";
            textarea.style.background = "transparent";
            textarea.style.lineHeight = `${fontSize * 1.2}px`;
            textarea.style.resize = "none";
            textarea.style.overflow = "hidden";
            textarea.style.boxSizing = "content-box";
            textarea.style.zIndex = "1000";

            container.appendChild(textarea);

            // Auto-grow height based on content
            const updateHeight = () => {
                textarea.style.height = "auto";
                textarea.style.height = textarea.scrollHeight + "px";
            };

            textarea.addEventListener("input", updateHeight);
            updateHeight();

            // Focus after render
            requestAnimationFrame(() => textarea.focus());

            // Commit text function
            const commit = () => {
                textarea.removeEventListener("blur", commit);
                textarea.remove();

                let shapeProp = null;
                if (textarea.value.trim() !== "") {
                    shapeProp = { startX, startY, value: textarea.value, fontSize, color, maxWidth };
                    console.log("shapeprop ", shapeProp);
                }

                resolve(shapeProp);
            };

            // Commit on Esc
            textarea.addEventListener("keydown", (ev) => {
                if (ev.key === "Escape") {
                    ev.preventDefault();
                    commit();
                }
            });

            // Commit on blur
            textarea.addEventListener("blur", commit);
        }
    })
}