import ChromaGrid from './ChromaGrid'

const items = [
  {
    image: '/photos/field.jpg',
    title: 'Canola Field',
    subtitle: 'Midday',
    accent: '#ffd23f'
  },
  {
    image: '/photos/pier.jpg',
    title: 'The Pier',
    subtitle: 'Clear sky',
    accent: '#3fb8ff',
    url: 'https://example.com'
  }
];

<ChromaGrid items={items} columns={3} radius={260}
    reveal="spotlight"
    columns={3}
    minCardWidth={180}
    gap={12}
    radius={260}
    aspectRatio="3 / 2"
    cardRadius={22}
    showInfo
    frame={false}
    softness={0.6}
    damping={0.45}
    fadeOut={0.6}
    grayscale={1}
    dim={0.12}
    glow={0.5}
    borderGlow={1}
/>
