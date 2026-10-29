import PulseHeart from './PulseHeart';

<PulseHeart
  count={1204}
  defaultLiked={false}
  onChange={(liked, count) => console.log(liked, count)}
  showCount
  icon="heart"
  idleOutline
  size={40}
  corner={32}
  likedColor="#ff4d6d"
  idleColor="#8b8b93"
  pillColor="#232326"
  textColor="#f5f5f5"
  duration={560}
  dotSize={0.3}
  overshoot={1.7}
  beat={3}
  rollDuration={350}
  disabled={false}
/>
