import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Capsule} from './组件';
import {PreviewCanvas} from './预览画布';
export const Preview=({Component=Capsule}:{Component?:React.ComponentType<React.ComponentProps<typeof Capsule>>})=>{
 const g=useCurrentFrame();
 const forms=['tile','pill','oval','tab','ribbon','lens'] as const;
 const labels=['矩形标签','胶囊标签','椭圆标签','侧入标签','色条标签','透镜标签'];
 return <PreviewCanvas id="Z001" title="磨砂短句标签">{g<144&&forms.map((form,i)=><Component key={form} g={g} at={300+i*300} label={labels[i]} x={72+(i%3)*383} y={275+Math.floor(i/3)*170} w={340} size={32} hue={[0,1,2,3,4,2][i]} form={form}/>)}</PreviewCanvas>;
};
