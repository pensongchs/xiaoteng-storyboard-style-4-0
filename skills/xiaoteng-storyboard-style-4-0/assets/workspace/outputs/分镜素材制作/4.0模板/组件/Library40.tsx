import React from 'react';
import {Electric035} from './LibraryContent40';
import {Img,staticFile,interpolate} from 'remotion';
import {F,p,linear,Reveal,textStyle,fittedSize} from './Style40';
import {AssetContext} from './Glass40';
export const Electric40=({g,at,x,y,w,h}:{g:number;at:number;x:number;y:number;w:number;h:number})=>{
 if(g<F(at))return null;
 const rand=(x:number)=>{const n=Math.sin(x*12.9898)*43758.5453;return n-Math.floor(n);};
 const noise=(x:number,y:number)=>{const a=Math.floor(x),b=Math.floor(y),u=x-a,v=y-b,ux=u*u*(3-2*u),uy=v*v*(3-2*v);return rand(a+b*57)*(1-ux)*(1-uy)+rand(a+1+b*57)*ux*(1-uy)+rand(a+(b+1)*57)*(1-ux)*uy+rand(a+1+(b+1)*57)*ux*uy;};
 const fractal=(x:number,seed:number)=>{let v=0,amp=.12,freq=10;for(let i=0;i<7;i++){v+=amp*(noise(freq*x+seed*100,(g-F(at))/30*freq*.04)-.5)*(i===0?0:1);freq*=1.6;amp*=.7;}return v*60;};
 const n=280,r=30,per=2*(w+h-4*r)+2*Math.PI*r;
 const point=(v:number)=>{let d=v*per;const segments=[w-2*r,Math.PI*r/2,h-2*r,Math.PI*r/2,w-2*r,Math.PI*r/2,h-2*r,Math.PI*r/2];let k=0;while(k<7&&d>segments[k])d-=segments[k++];const t=d/segments[k],ang=t*Math.PI/2;return k===0?[r+t*(w-2*r),0]:k===1?[w-r+r*Math.cos(-Math.PI/2+ang),r+r*Math.sin(-Math.PI/2+ang)]:k===2?[w,r+t*(h-2*r)]:k===3?[w-r+r*Math.cos(ang),h-r+r*Math.sin(ang)]:k===4?[w-r-t*(w-2*r),h]:k===5?[r+r*Math.cos(Math.PI/2+ang),h-r+r*Math.sin(Math.PI/2+ang)]:k===6?[0,h-r-t*(h-2*r)]:[r+r*Math.cos(Math.PI+ang),r+r*Math.sin(Math.PI+ang)];};
 const d=Array.from({length:n+1},(_,i)=>{const q=i/n,[xx,yy]=point(q);return `${i?'L':'M'}${(xx+fractal(q*8,0)).toFixed(2)} ${(yy+fractal(q*8,1)).toFixed(2)}`;}).join(' ')+'Z';
 return <svg data-library="035" width={w+80} height={h+80} style={{position:'absolute',left:x-40,top:y-40,overflow:'visible',opacity:p(g,at)}}><g transform="translate(40 40)" fill="none" stroke="#7df9ff"><rect width={w} height={h} rx={r} opacity=".18" strokeWidth="8" style={{filter:'blur(8px)'}}/><path d={d} strokeWidth="4" opacity=".35" style={{filter:'blur(4px)'}}/><path d={d} strokeWidth="1.2"/></g></svg>;
};

export const ElectricText40=Electric035;

export const Stamp40=({g,at,label,x,y,color,angle}:{g:number;at:number;label:string;x:number;y:number;color:string;angle:number})=>{
 if(g<F(at))return null;
 const age=g-F(at),scale=interpolate(age,[0,5,8,12,18],[1.65,1.06,.93,1.015,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),alpha=linear(g,at,5);
 return <div data-textbox="verdict-stamp" style={{position:'absolute',left:x,top:y,width:212,height:101,opacity:alpha,transform:`rotate(${angle}deg) scale(${scale})`,transformOrigin:'50% 50%'}}>
 <svg width="212" height="101" viewBox="0 0 212 101" style={{position:'absolute',inset:0}}><rect x="5" y="5" width="202" height="91" rx="13" fill={color+'14'} stroke={color} strokeWidth="4"/><rect x="13" y="13" width="186" height="75" rx="7" fill="none" stroke={color} strokeWidth="1.2" opacity=".8"/>{Array.from({length:32},(_,i)=><circle key={i} cx={18+(i*53%176)} cy={i%2?7+(i%4)*.9:94-(i%3)*.7} r={.8+(i%3)*.4} fill="#15201b"/>)}</svg>
 <div data-safe-text="stamp-verdict" style={{position:'absolute',inset:0,display:'grid',placeItems:'center',...textStyle(48,color),letterSpacing:9,paddingLeft:9,boxSizing:'border-box'}}> {label} </div>
 </div>;
};


export const FlipCard40=({g,flipAt,x,y,w,frontFile,frontTitle,backTitle,frontHeight=310,backHeight}:{g:number;flipAt:number;x:number;y:number;w:number;frontFile:string;frontTitle:string;backTitle:string;frontHeight?:number;backHeight?:number})=>{
 const root=React.useContext(AssetContext);if(!root)throw new Error('缺少正式素材目录');
 const lines=backTitle.split('\n');if(lines.length>3)throw new Error('翻面卡文字超过三行，请拆分');
 const backSize=Math.min(...lines.map(l=>fittedSize(l,39,w-70))),target=backHeight??Math.ceil(lines.length*backSize*1.4+84.8),flip=p(g,flipAt,12),compact=p(g,flipAt,12),height=frontHeight-(frontHeight-target)*compact;
 const backTitleOpacity=linear(g,flipAt+400,6);
 return <div data-library="048" style={{position:'absolute',left:x,top:y+(frontHeight-target)/2*compact,width:w,height,perspective:1400}}><div style={{position:'relative',width:'100%',height:'100%',transformStyle:'preserve-3d',transform:`rotateY(${180*flip}deg)`}}>
  <div style={{position:'absolute',inset:0,borderRadius:25,overflow:'hidden',backfaceVisibility:'hidden',border:'1px solid #ffffff55'}}><Img src={staticFile(root+'/'+frontFile)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`translateX(${5*Math.sin(g/60)}px) scale(1.04)`}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,#191612bb,transparent 80%)'}}/><div data-safe-text="flip-front-title" style={{position:'absolute',left:27,bottom:28,...textStyle(fittedSize(frontTitle,35,w-54))}}>{frontTitle}</div></div>
  <div data-textbox="flip-back" style={{position:'absolute',inset:0,borderRadius:30,backfaceVisibility:'hidden',transform:'rotateY(180deg)',background:'radial-gradient(ellipse at 8% 0%,#f5f7e9,transparent 75%),linear-gradient(145deg,#dce9df,#b4c6bb)',border:'1px solid #edf5e8bb',boxShadow:'inset 0 1px #ffffffcc,0 16px 38px -30px #0007',display:'grid',placeItems:'center',padding:'30px 35px',boxSizing:'border-box'}}><div style={{...textStyle(backSize,'#293d34'),lineHeight:1.4,textAlign:'center',opacity:backTitleOpacity}}><span data-safe-text="flip-back-title">{backTitle}</span></div></div>
 </div></div>;
};
