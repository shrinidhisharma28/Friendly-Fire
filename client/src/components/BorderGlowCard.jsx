import BorderGlow from './BorderGlow';

function BorderGlowCard(){

return (

<BorderGlow
  edgeSensitivity={30}
  glowColor="40 80 80"
  backgroundColor="#120F17"
  borderRadius={28}
  glowRadius={40}
  glowIntensity={1}
  coneSpread={25}
  animated={false}
  colors={['#c084fc', '#f472b6', '#38bdf8']}
/>
)
}

export default BorderGlowCard;