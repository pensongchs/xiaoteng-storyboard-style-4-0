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
type CapsuleProps={g:number;at:number;label:string;x?:number;y?:number;w?:number;tone?:string;size?:number;form?:'pill'|'tile'|'oval'|'tab'|'ribbon'|'lens';hue?:number;id?:string};
export const Capsule=({g,at,label,x=72,y=324,w=600,tone='#F8FAFC',size=32,form='tile',hue=2}:CapsuleProps)=>{
 const shape=fitLabel(label,size,Math.min(w,S.canvas.right-x));
 if(g<F(at))return null;
 const h=shape.height+(form==='oval'?16:form==='tile'?10:0),r=['pill','oval','lens'].includes(form)?h/2:30;
 const age=g-F(at),settle=spring({frame:age,fps:30,config:S.motion.labelSpring});
 const transform=form==='tile'?`translateX(${-26*(1-settle)}px) rotate(${-1.4*(1-settle)}deg)`:
  form==='tab'||form==='ribbon'?`translateX(${24*(1-settle)}px)`:`translateY(${18*(1-settle)}px)`;
 const c=palette(hue);
 return <div data-textbox="frost-label" style={{position:'absolute',left:x,top:y,width:shape.width,height:h,borderRadius:r,
  opacity:1,transform,transformOrigin:'50% 50%'}}>
  <FrostSurface hue={hue} r={r}/>
  {(form==='ribbon'||form==='tile')&&<div style={{position:'absolute',left:19,top:h/2-11,width:4,height:22,borderRadius:3,background:c.accent,boxShadow:`0 0 9px ${c.accent}55`}}/>}
  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'23px 38px',boxSizing:'border-box',textAlign:'center',
   ...textStyle(shape.fontSize,tone),fontWeight:700,lineHeight:shape.lineHeight,whiteSpace:shape.lines>1?'pre-line':'nowrap',textShadow:'0 2px 5px #0008'}}>
   <span data-safe-text="frost-label">{shape.text}</span>
  </div>
 </div>;
};
