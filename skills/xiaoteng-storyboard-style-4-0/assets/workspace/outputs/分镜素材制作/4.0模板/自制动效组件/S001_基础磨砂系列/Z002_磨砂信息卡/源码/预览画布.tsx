import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {STYLE40 as S} from './参数';
import {SixFonts,FramePaintGate,LayoutAudit} from './绘制';
export const PreviewCanvas=({id,title,children}:{id:string;title:string;children:React.ReactNode})=>{
 const g=useCurrentFrame();
 return <SixFonts><AbsoluteFill style={{background:S.colors.ink,overflow:'hidden'}}>
  <div data-six-plane data-six-source-frame={g} style={{position:'absolute',left:0,top:0,width:S.canvas.width,height:S.canvas.height,transform:'scale('+S.canvas.scale+')',transformOrigin:'top left',fontFamily:S.type.family}}>
   <div data-six-content style={{position:'absolute',left:S.canvas.foreground.x,top:S.canvas.foreground.y,width:1280,height:720,transform:'scale('+S.canvas.foreground.scale+')',transformOrigin:'top left'}}>
    <div style={{position:'absolute',left:S.canvas.left+S.type.heading.offsetX,top:62,color:S.colors.sand,fontSize:20,fontWeight:700}}>{id} · 自制动效组件</div>
    <div data-safe-text="preview-title" style={{position:'absolute',left:S.canvas.left+S.type.heading.offsetX,top:106,color:'#F8FAFC',fontSize:48,fontWeight:700,lineHeight:1.2}}>{title}</div>
    {children}
   </div>
  </div><LayoutAudit frame={g}/><FramePaintGate frame={g}/>
 </AbsoluteFill></SixFonts>;
};
