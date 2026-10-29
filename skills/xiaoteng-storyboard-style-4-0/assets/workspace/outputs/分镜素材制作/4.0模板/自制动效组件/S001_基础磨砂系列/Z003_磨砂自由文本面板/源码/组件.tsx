import React from 'react';
import {spring} from 'remotion';
import {STYLE40 as S} from './参数';
import {F,fitLabel,fittedSize,textStyle,clean,cleanNode} from './基础';
const palettes=[
 {accent:'#F59E0B',edge:'#FDBA74',text:'#FFEDD5',base:'26,21,17'},
 {accent:'#3B82F6',edge:'#60A5FA',text:'#E5F0FF',base:'15,25,40'},
 {accent:'#CBD5E1',edge:'#F8FAFC',text:'#F8FAFC',base:'24,29,38'},
 {accent:'#6366F1',edge:'#A78BFA',text:'#EDE9FE',base:'26,23,44'},
 {accent:'#EF4444',edge:'#F87171',text:'#FECACA',base:'38,17,23'},
];
const palette=(hue:number)=>palettes[((hue%5)+5)%5];
export const FrostSurface=({hue=2,r=30}:{hue?:number;r?:number})=>{
 const c=palette(hue);
 return <div data-frost-surface style={{position:'absolute',inset:0,borderRadius:r,overflow:'hidden',pointerEvents:'none',
  backgroundColor:`rgb(${c.base})`,
  border:`1px solid ${c.edge}b3`,boxSizing:'border-box',
  boxShadow:`inset 0 1px 2px #ffffff60,inset 0 -1px 1px #ffffff12,0 12px 26px -12px #000b,0 0 12px ${c.accent}20`}}>
  <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse at 12% 0%,${c.accent}25,transparent 64%),linear-gradient(160deg,#ffffff0e,transparent 55%)`}}/>
 </div>;
};
export const SolidEnter=({g,at,children,style={},box,motion='rise'}:{g:number;at:number;children:React.ReactNode;style?:React.CSSProperties;box?:string;motion?:'rise'|'from-left'|'from-right'})=>{
 if(g<F(at))return null;
 const s=spring({frame:g-F(at),fps:S.output.fps,config:S.motion.revealSpring});
 const transform=motion==='from-left'?`translateX(${-S.motion.reveal.side*(1-s)}px)`:motion==='from-right'?`translateX(${S.motion.reveal.side*(1-s)}px)`:`translateY(${S.motion.reveal.rise*(1-s)}px)`;
 return <div data-solid-enter data-textbox={box} style={{...style,opacity:1,transform,transformOrigin:'50% 50%'}}>{children}</div>;
};
export const GlassPanel=({g,at,x,y,w,h,children,r=30,hue=2}:{g:number;at:number;x:number;y:number;w:number;h:number;children:React.ReactNode;r?:number;hue?:number})=> <SolidEnter {...{g,at}} box="frost-panel" motion="from-left" style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:r}}><FrostSurface hue={hue} r={r}/><div style={{position:'absolute',inset:0}}>{cleanNode(children)}</div></SolidEnter>;
