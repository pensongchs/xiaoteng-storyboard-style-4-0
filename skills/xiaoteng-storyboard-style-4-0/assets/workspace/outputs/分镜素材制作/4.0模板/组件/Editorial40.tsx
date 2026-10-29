import {STYLE40 as S} from '../参数';
import React from 'react';
import {spring,interpolate} from 'remotion';
import {F,p,linear,fitLabel,textStyle} from './Style40';
import {Capsule} from './Frost40';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
/** 宽实心箭头从卡片边缘展开，卡片同步作升降反馈。 */
export const SolidTrend40=({g,at,label,y,up}:{g:number;at:number;label:string;y:number;up:boolean})=>{
 const shape=fitLabel(label,41,570),age=g-F(at),settle=spring({frame:Math.max(0,age),fps:30,config:S.motion.labelSpring});
 if(age<0)return null;
 const q=p(g,at+150,33),color=up?'#72E0AE':'#FFA18B',lift=(up?-7:7)*q;
 const cy=y+shape.height/2+18*(1-settle)+lift,a=72+shape.width+30,end=1112,ey=cy+(up?-64:64);
 const b=a+160,c=end-200,base=end-64,id=up?'rising-solid':'falling-solid';
 const arrow=`M${a} ${cy-14} C${b} ${cy-14},${c} ${ey-14},${base} ${ey-14} L${base} ${ey-34} L${end} ${ey} L${base} ${ey+34} L${base} ${ey+14} C${c} ${ey+14},${b} ${cy+14},${a} ${cy+14} Q${a-14} ${cy},${a} ${cy-14}Z`;
 return <div data-trend-link={id}>
  <div style={{position:'absolute',inset:0,transform:`translateY(${lift}px)`}}>
   <Capsule {...{g,at,label}} x={72} y={y} w={570} size={41} form="pill" hue={up?1:4}/>
   <div style={{position:'absolute',left:72,top:y+18*(1-settle),width:shape.width,height:shape.height,borderRadius:shape.height/2,pointerEvents:'none',boxShadow:`inset 0 0 0 2px ${color}a8,0 0 ${18*q}px ${color}35`,opacity:q}}/>
  </div>
  <svg width="1280" height="660" style={{position:'absolute',inset:0,overflow:'visible'}}>
   <defs><clipPath id={id}><rect x={a-14} y="0" width={(end-a+14)*q} height="660"/></clipPath></defs>
   <g clipPath={`url(#${id})`}><path data-six-line-gap="solid-trend-arrow" d={arrow} fill={color} style={{filter:'drop-shadow(0 5px 7px #0008)'}}/></g>
  </svg>
 </div>;
};

export const ConclusionStamp40=({g,at,label,x=855,y=568}:{g:number;at:number;label:string;x?:number;y?:number})=>{
 if(g<F(at))return null;
 const age=g-F(at),scale=interpolate(age,[0,5,8,12,18],[1.3,1.06,.93,1.015,1],clamp),color=S.colors.green;
 return <div data-textbox="activity-stamp" data-stamp-phase={age<18?'impact':'held'} style={{position:'absolute',left:x,top:y,width:340,height:92,transform:`rotate(-8deg) scale(${scale})`,transformOrigin:'50% 50%',opacity:linear(g,at,3),filter:'drop-shadow(0 3px 3px #0009)'}}>
  <svg width="340" height="92" style={{position:'absolute',inset:0}} fill="none" stroke={color}>
   <rect x="4" y="4" width="332" height="84" rx="7" strokeWidth="4"/><rect x="11" y="11" width="318" height="70" rx="3" strokeWidth="1.2"/>
   {Array.from({length:26},(_,i)=><path key={i} d={`M${18+(i*67%304)} ${i%2?5:87}l${1+i%3} ${i%2?2:-2}`} stroke="#192522" strokeWidth="2.5"/>)}
  </svg>
  <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',padding:'23px 36px',boxSizing:'border-box',...textStyle(30,color),letterSpacing:1,fontWeight:700,whiteSpace:'nowrap'}}><span data-safe-text="activity-conclusion">{label}</span></div>
 </div>;
};

