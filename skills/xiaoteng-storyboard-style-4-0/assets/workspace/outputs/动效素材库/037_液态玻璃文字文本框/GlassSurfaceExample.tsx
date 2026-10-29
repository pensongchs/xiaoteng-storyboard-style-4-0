import GlassSurface from './GlassSurface';

<GlassSurface
  width={320}
  height={76}
  borderRadius={38}
  distortionScale={-180}
  displace={0.5}
  backgroundOpacity={0.1}
>
  <span>Your content</span>
</GlassSurface>

<GlassSurface shape="/logo.svg" width={280} height={280} />

const photo = useRef(null);

<img ref={photo} src="/photo.jpg" alt="" />
<GlassSurface backdrop={photo} width={320} height={76} borderRadius={38}
  borderWidth={0.07}
  brightness={50}
  opacity={0.93}
  blur={11}
  saturation={1}
  redOffset={0}
  greenOffset={10}
  blueOffset={20}
  refraction
  renderer="auto"
/>
