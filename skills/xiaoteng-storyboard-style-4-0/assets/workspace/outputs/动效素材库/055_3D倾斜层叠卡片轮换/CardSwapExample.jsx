import CardSwap, { Card } from './CardSwap';

const items = [
  { title: 'Golden hour', image: '/photos/sky.jpg' },
  { title: 'Canola field', image: '/photos/field.jpg' },
  { title: 'The pier', image: '/photos/pier.jpg' },
  { title: 'Pink drift', image: '/photos/clouds.jpg' }
];

export default function CardSwapExample() {
  return (
    <>
      <div style={{ height: 600 }}>
        <CardSwap
          items={items}
          delay={4000}
          cardDistance={60}
          verticalDistance={70}
          depth={90}
          skewAmount={6}
          visibleCards={4}
          cardRadius={18}
          delay={4000}
          speed={1}
          bounce={0.35}
          parallax={0.5}
          hoverSpread={0.12}
          dim={0.5}
          autoplay
          pauseOnHover
          draggable
        />
      </div>

      <div style={{ height: 600 }}>
        <CardSwap width={420} height={300}>
          <Card>Your content</Card>
          <Card>Your content</Card>
          <Card>Your content</Card>
        </CardSwap>
      </div>
    </>
  );
}
