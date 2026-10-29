import React from 'react';
import {useCurrentFrame} from 'remotion';
import {PearlCard} from './组件';
import {PreviewCanvas} from './预览画布';
export const Preview=({Component=PearlCard}:{Component?:React.ComponentType<React.ComponentProps<typeof PearlCard>>})=>{
 const g=useCurrentFrame();
 return <PreviewCanvas id="Z002" title="磨砂信息卡">{g<144&&['通勤路线','生活配套','现场噪声'].map((title,i)=><Component key={title} g={g} at={300+i*600} x={72+i*383} y={290} w={340} h={230} title={title} body={['核对早晚高峰','检查日常便利','换个时段再看'][i]} hue={[0,1,4][i]}/>)}</PreviewCanvas>;
};
