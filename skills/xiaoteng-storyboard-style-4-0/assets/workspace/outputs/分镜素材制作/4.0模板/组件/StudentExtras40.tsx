import React,{useLayoutEffect} from 'react';
import {Img,staticFile,interpolate,cancelRender} from 'remotion';
import {F,p,textStyle} from './Style40';
import {SolidEnter} from './Frost40';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
type Transition={atMs:number;kind:string;frames:number};
/** 在既有时间线上遮挡切换，保持源毫秒、帧数和关键词时序。 */
export const SceneTransitions40=({g,transitions}:{g:number;transitions:Transition[]})=><>{transitions.map((t,i)=>{
 const boundary=F(t.atMs),half=Math.floor(t.frames/2),age=g-boundary;if(age< -half||age>half)return null;
 const before=age<0,q=before?(age+half)/half:age/half;
 const clip=t.kind==='iris'?`circle(${(before?q:1-q)*2400}px at 50% 50%)`:before?`inset(0 ${(1-q)*100}% 0 0)`:`inset(0 0 0 ${q*100}%)`;
 return <div key={i} data-scene-transition={t.kind} data-transition-at={t.atMs} style={{position:'absolute',inset:0,zIndex:1000,clipPath:clip,background:'linear-gradient(125deg,#15191f,#3b332b 48%,#1c252b)',pointerEvents:'none'}}><div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(125deg,transparent 0 140px,#f3ddba08 141px 142px,transparent 143px 280px)'}}/><div style={{position:'absolute',left:before?q*1920:q*1920,top:0,bottom:0,width:3,background:'#f2bd7280'}}/></div>;
})}</>;
type Item={file:string;label:string;description:string;atMs:number};
/** 保留032的景深和翻转运动，图片与对应文字各有独立区域。 */
export const CarouselCaption40=({g,items,assetRoot}:{g:number;items:Item[];assetRoot:string})=>{
 if(items.length<2||items.some(i=>!i.description.trim()))throw Error('轮播至少两张图片，每张需有说明文字');
 useLayoutEffect(()=>{const stage=document.querySelector('[data-carousel-stage]'),caption=document.querySelector('[data-carousel-caption]');if(!stage||!caption)return;const clip=stage.getBoundingClientRect(),b=caption.getBoundingClientRect();const overlap=(r:{left:number;right:number;top:number;bottom:number},t:DOMRect)=>r.left<t.right-1&&r.right>t.left+1&&r.top<t.bottom-1&&r.bottom>t.top+1;const zones=Array.from(stage.querySelectorAll<HTMLElement>('[data-carousel-photo]')).filter(n=>Number(getComputedStyle(n).opacity)>.05).map(n=>{const r=n.getBoundingClientRect();return {left:Math.max(clip.left,r.left),right:Math.min(clip.right,r.right),top:Math.max(clip.top,r.top),bottom:Math.min(clip.bottom,r.bottom)};}).filter(r=>r.right>r.left&&r.bottom>r.top);if(zones.some(a=>overlap(a,b)))cancelRender(new Error('实际图片与说明区重叠'));document.querySelectorAll<HTMLElement>('[data-self-unit] [data-textbox]').forEach(card=>{const r=card.getBoundingClientRect();if(zones.some(a=>overlap(a,r))||overlap(r,b))cancelRender(new Error('文字卡片与图片或说明区重叠'));});caption.querySelectorAll<HTMLElement>('[data-safe-text]').forEach(n=>{if(n.scrollWidth>caption.clientWidth+1)cancelRender(new Error('轮播说明太长，请换行或调整布局'));});},[g]);
 const active=Math.max(0,items.filter(i=>g>=F(i.atMs)).length-1),q=p(g,items[active].atMs,10),pos=active===0?0:active-1+q;
 if(g<F(items[0].atMs))return null;
 return <>
  <SolidEnter g={g} at={items[0].atMs} style={{position:'absolute',left:495,top:215,width:700,height:380,perspective:1400,overflow:'hidden'}}>
   <div data-library="032" data-carousel-stage style={{position:'absolute',inset:0,transformStyle:'preserve-3d'}}>{items.map((item,i)=>{
    if(g<F(item.atMs))return null;const d=i-pos,opacity=d<0?Math.max(0,1+d):1;if(opacity<.001)return null;
    return <div key={item.file} data-carousel-photo style={{position:'absolute',left:'50%',top:'50%',width:620,height:338,borderRadius:22,overflow:'hidden',boxShadow:'0 30px 60px -20px #000a',transform:`translate(-50%,-50%) translateX(${90*d}px) translateZ(${-220*d}px) rotateY(${22*Math.min(1,Math.max(0,d))}deg)`,opacity,filter:`brightness(${Math.max(.15,1-Math.max(0,d)*.2)}) blur(${Math.max(0,d)*1.5}px)`,zIndex:Math.round(2000-d*20)}}><Img src={staticFile(assetRoot+'/'+item.file)} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>;
   })}</div>
  </SolidEnter>
  <div data-carousel-caption style={{position:'absolute',left:530,top:608,width:620}}>
   <div data-safe-text="carousel-label" style={{...textStyle(30,'#F8FAFC'),whiteSpace:'nowrap'}}>{items[active].label}</div>
   <div data-safe-text="carousel-description" style={{...textStyle(22,'#E2E8F0'),fontWeight:400,marginTop:8,whiteSpace:'nowrap'}}>{items[active].description}</div>
  </div>
 </>;
};
