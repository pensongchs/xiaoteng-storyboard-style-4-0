import AeroShards from './AeroShards';

export default function AeroShardsExample() {
  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <AeroShards
        shardColor="#896ABD"
        accentColor="#A855F7"
        placement="full"
        material="glass"
        markers="plus"
        count={1300}
        depthOfField={0.75}
        vignette={0.3}
        mouseInteraction
        pulseOnClick
        holdToGather
        lightMode={false}
        shardSize={1}
        spread={1}
        twist={1}
        billow={1}
        speed={1}
        scale={1}
        glow={0.35}
        grain={0.06}
        intro
        mouseStrength={0.6}
        parallax={0.5}
        paused={false}
      />
    </div>
  );
}
