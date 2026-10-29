import SpecularButton from './SpecularButton';

<SpecularButton
  size="lg"
  radius={18}
  tint="#ffffff"
  tintOpacity={0.04}
  textColor="#f5f5f5"
  lineColor="#ffffff"
  baseColor="#525252"
  intensity={1}
  idleIntensity={0.35}
  shineSize={10}
  shineFade={34}
  thickness={1.2}
  glow={1}
  followMouse
  proximity={250}
  onClick={() => console.log('clicked')}
>
  Get Started
</SpecularButton>
