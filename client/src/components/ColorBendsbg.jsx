import ColorBends from './ColorBends';

function ColourBends ({
    speed=0.4,
    intensity=1.5,
    colors=["#F97316"],
    noise=0
}){    

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
)

}

export default ColourBends;