import Threads from './Threads';

export default function ThreadsExample() {
  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Threads
        color="#ffffff"
        lineCount={90}
        thickness={0.6}
        softness={1.3}
        amplitude={1.7}
        distance={0.4}
        waves={1.05}
        speed={0.6}
        split={0.04}
        fray={0.5}
        angle={25}
        taper={0.85}
        brightness={1.4}
        parting={0}
        enableMouseInteraction
        fade={0}
        opacity={1}
        seed={0}
      />
    </div>
  );
}
