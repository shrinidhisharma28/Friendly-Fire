// ColorBendsbg.jsx — DEPRECATED: Use ColorBends directly with your own props.
// This shim is kept to avoid breaking any remaining imports.
import ColorBends from './ColorBends';

export default function ColorBendsBg({
    speed = 0.4,
    intensity = 1.5,
    colors = ["#F97316"],
    noise = 0
}) {
    return (
        <ColorBends
            colors={colors}
            rotation={-55}
            speed={speed}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            noise={noise}
            parallax={0.5}
            iterations={1}
            intensity={intensity}
            bandWidth={5}
            transparent
            autoRotate={-3}
        />
    );
}
