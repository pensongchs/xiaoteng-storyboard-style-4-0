import Folder from './Folder'

const items = [
  { title: 'Brand guidelines' },
  { title: 'Launch plan' },
  { image: '/photos/pier.jpg', title: 'The pier' }
];

<Folder
  label="Projects"
  items={items}
  onItemClick={(item, index) => console.log(item, index)}
/>

<Folder mode="book" variant="glass" color="#7aa7ff" label="Photos" items={items}
  mode="flap"
  variant="solid"
  layout="spread"
  color="#3d8bff"
  paperColor="#ffffff"
  tabPosition="right"
  openOn="click"
  size={1.3}
  frost={0.25}
  tilt={0.5}
  speed={1}
  bounce={0.4}
  peek
  intro
  draggable
  zoomOnClick
  theme="dark"
/>
