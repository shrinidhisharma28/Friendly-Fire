import { useEffect, useRef } from "react";
import "./ShapeGrid.css";

const SHAPES = ["circle", "square", "triangle", "cross"];

function makeShape(shape, size, color, opacity) {
    const el = document.createElement("div");
    el.className = `sg-shape sg-${shape}`;
    el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        opacity: ${opacity};
        --sg-color: ${color};
        position: absolute;
    `;
    return el;
}

export default function ShapeGrid({
    numShapes = 80,
    colors = ["#F97316", "#3B82F6", "#8B5CF6"],
    minSize = 8,
    maxSize = 22,
    minOpacity = 0.04,
    maxOpacity = 0.14,
    className = "",
    style = {}
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = "";
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;

        // Grid layout with jitter
        const cols = Math.ceil(Math.sqrt(numShapes * (w / h)));
        const rows = Math.ceil(numShapes / cols);
        const cellW = w / cols;
        const cellH = h / rows;

        let count = 0;
        for (let r = 0; r < rows && count < numShapes; r++) {
            for (let c = 0; c < cols && count < numShapes; c++) {
                const size = minSize + Math.random() * (maxSize - minSize);
                const opacity = minOpacity + Math.random() * (maxOpacity - minOpacity);
                const color = colors[Math.floor(Math.random() * colors.length)];
                const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

                const el = makeShape(shape, size, color, opacity);
                const x = c * cellW + Math.random() * cellW;
                const y = r * cellH + Math.random() * cellH;
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                container.appendChild(el);
                count++;
            }
        }

        return () => { container.innerHTML = ""; };
    }, [numShapes, colors, minSize, maxSize, minOpacity, maxOpacity]);

    return (
        <div
            ref={containerRef}
            className={`shape-grid-container ${className}`}
            style={style}
        />
    );
}
