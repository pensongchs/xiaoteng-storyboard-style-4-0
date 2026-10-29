import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GlassPanel} from './组件';
import {textStyle} from './基础';
import {PreviewCanvas} from './预览画布';
export const Preview=({Component=GlassPanel}:{Component?:React.ComponentType<React.ComponentProps<typeof GlassPanel>>})=>{
 const g=useCurrentFrame();
 return <PreviewCanvas id="Z003" title="磨砂自由文本面板">{g<144&&<>
  <Component g={g} at={300} x={72} y={260} w={1060} h={220} hue={2}>
   <div style={{padding:32}}><div data-safe-text="panel-title" style={{...textStyle(34,'#F8FAFC'),fontWeight:700}}>先核对日常通勤</div><div data-safe-text="panel-body" style={{marginTop:18,...textStyle(26,'#E2E8F0'),fontWeight:400}}>再比较生活配套与现场体验</div></div>
  </Component>
  <Component g={g} at={1500} x={72} y={510} w={650} h={88} r={30} hue={0}>
   <div data-safe-text="panel-reminder" style={{padding:'26px 32px',...textStyle(26,'#F8FAFC'),fontWeight:700,lineHeight:1.3}}>重要提醒：换个时段再看</div>
  </Component>
 </>}</PreviewCanvas>;
};
