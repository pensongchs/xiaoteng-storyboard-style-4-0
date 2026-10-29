import {STYLE40 as S} from '../参数';
import React from 'react';
import {Img,interpolate,staticFile} from 'remotion';
import {F,p,Reveal,labelWidth,textStyle} from './Style40';
import {Capsule,FrostSurface,SolidEnter} from './Frost40';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

/** 001: Thomas-Cabrit原版三层蓝色立体数字、16°俯角及左右摇摆。 */
export const Number001=({g,at,value,x,y}:{g:number;at:number;value:string;x:number;y:number})=>{
 if(g<F(at))return null;
 const t=(g-F(at))/48,rx=16+2*Math.sin(t*Math.PI),ry=-18*Math.cos(t*Math.PI*2);
 return <Reveal {...{g,at}} motion="pop" style={{position:'absolute',left:x,top:y,width:190,height:255,perspective:900}}>
  <div data-library="001" style={{position:'absolute',inset:0,transformStyle:'preserve-3d',transform:`rotateX(${rx}deg) rotateY(${ry}deg)`}}>
   <div style={{position:'absolute',inset:0,borderRadius:26,border:'1px solid #007bff29',background:'radial-gradient(circle at 40% 35%,#007bff24,transparent 62%)',transform:'translateZ(-80px)'}}/>
   {[-70,-34,0].map((z,i)=><div key={z} style={{position:'absolute',inset:0,display:'grid',placeItems:'center',fontFamily:'BFTitle',fontSize:230,fontWeight:900,lineHeight:1,letterSpacing:-6,
    opacity:[.18,.42,.98][i],transform:`translateZ(${z}px)`,filter:i<2?`blur(${i===0?1:.4}px)`:'drop-shadow(0 10px 22px #0009)',
    WebkitTextStroke:'1px #007bffc7',background:'linear-gradient(90deg,#007bff2e,#007bffeb 35%,#00b4ffb3 60%,#007bff38)',backgroundClip:'text',WebkitBackgroundClip:'text',color:'transparent'}}>
    <span {...(i===2?{'data-safe-text':'001-number'}:{'aria-hidden':true})}>{value}</span>
   </div>)}
  </div>
 </Reveal>;
};

/** 004: 原版银、金、浅蓝滑块，按口播而非鼠标选中。 */
export const Selector004=({g,times,labels,x,y,w=1108}:{g:number;times:number[];labels:[string,string,string];x:number;y:number;w?:number})=>{
 if(g<F(times[0]))return null;
 const active=Math.max(0,times.filter(t=>g>=F(t)).length-1),q=p(g,times[active],15);
 const pos=active===0?0:active-1+q;
 const colors=[['#c0c0c055','#e0e0e0'],['#ffd70055','#ffcc00'],['#d0e7ff55','#a0d8ff']];
 const selected=colors[active];
 return <SolidEnter g={g} at={times[0]} style={{position:'absolute',left:x,top:y,width:w,height:88,borderRadius:16}}>
  <div data-library="004" data-textbox="004-selector" style={{position:'absolute',inset:0,borderRadius:16,background:'#14171d',
   boxShadow:'inset 1px 1px 4px #ffffff33,inset -1px -1px 6px #0005,0 4px 12px #0005',overflow:'hidden'}}>
   <div style={{position:'absolute',left:0,top:0,bottom:0,width:w/3,borderRadius:16,transform:`translateX(${pos*100}%)`,background:`linear-gradient(135deg,${selected[0]},${selected[1]})`,boxShadow:`0 0 18px ${selected[1]}80,inset 0 0 10px #ffffff66`}}/>
   {labels.map((word,i)=>g>=F(times[i])&&<div key={word} style={{position:'absolute',left:i*w/3,top:0,width:w/3,height:88,display:'grid',placeItems:'center',...textStyle(31,i===active?'#161b22':'#e5e5e5')}}>
    <span data-safe-text="004-option">{word}</span>
   </div>)}
  </div>
 </SolidEnter>;
};

/** 035: 青色电弧与实色磨砂卡共用轮廓，零均值扰动围绕边框运动。 */
export const Electric035=({g,at,secondAt,x,y,w,h,title,body}:{g:number;at:number;secondAt:number;x:number;y:number;w:number;h:number;title:string;body:string})=>{
 if(g<F(at))return null;
 const r=30,n=280,per=2*(w+h-4*r)+2*Math.PI*r,age=g-F(at);
 const point=(v:number)=>{let d=v*per;const seg=[w-2*r,Math.PI*r/2,h-2*r,Math.PI*r/2,w-2*r,Math.PI*r/2,h-2*r,Math.PI*r/2];let k=0;while(k<7&&d>seg[k])d-=seg[k++];const t=d/seg[k],a=t*Math.PI/2;return k===0?[r+t*(w-2*r),0]:k===1?[w-r+r*Math.cos(-Math.PI/2+a),r+r*Math.sin(-Math.PI/2+a)]:k===2?[w,r+t*(h-2*r)]:k===3?[w-r+r*Math.cos(a),h-r+r*Math.sin(a)]:k===4?[w-r-t*(w-2*r),h]:k===5?[r+r*Math.cos(Math.PI/2+a),h-r+r*Math.sin(Math.PI/2+a)]:k===6?[0,h-r-t*(h-2*r)]:[r+r*Math.cos(Math.PI+a),r+r*Math.sin(Math.PI+a)];};
 const jitter=(q:number,seed:number)=>1.35*Math.sin(q*Math.PI*2*47+age*.71+seed)+.75*Math.sin(q*Math.PI*2*83-age*.43+seed*2)+.4*Math.sin(q*Math.PI*2*127+age*.93+seed*3);
 const d=Array.from({length:n+1},(_,i)=>{const q=i/n,[xx,yy]=point(q);return `${i?'L':'M'}${(xx+jitter(q,0)).toFixed(2)} ${(yy+jitter(q,2)).toFixed(2)}`;}).join(' ')+'Z';
 return <SolidEnter {...{g,at}} box="electric-text" style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:r}}>
  <FrostSurface hue={1} r={r}/>
  <svg data-library="035" data-electric-outline width={w+48} height={h+48} style={{position:'absolute',left:-24,top:-24,overflow:'visible'}}>
   <g transform="translate(24 24)" fill="none" stroke="#7df9ff">
    <rect width={w} height={h} rx={r} opacity=".18" strokeWidth="8" style={{filter:'blur(8px)'}}/>
    <rect width={w} height={h} rx={r} strokeWidth="1" opacity=".4"/>
    <path d={d} strokeWidth="4" opacity=".35" style={{filter:'blur(4px)'}}/><path d={d} strokeWidth="1.2"/>
   </g>
  </svg>
  <div style={{position:'absolute',inset:0,padding:'37px 36px',boxSizing:'border-box',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
   <div data-safe-text="electric-title" style={{...textStyle(39,'#e9feff'),whiteSpace:'nowrap'}}>{title}</div>
   <div style={{height:1,background:'#7df9ff25'}}/>
   <Reveal g={g} at={secondAt} style={{...textStyle(35,'#e9feff'),whiteSpace:'nowrap'}}><span data-safe-text="electric-body">{body}</span></Reveal>
  </div>
 </SolidEnter>;
};

/** 032: 保留原版景深、22°倾斜、220px递进与前卡淡出。 */
export const Carousel032=({g,items,assetRoot}:{g:number;items:{label:string;file:string;atMs:number;hue?:number}[];assetRoot:string})=>{
 const labels=items.map(x=>x.label),times=items.map(x=>x.atMs);
 const active=Math.max(0,times.filter(t=>g>=F(t)).length-1);
 const q=p(g,times[active],10),pos=active===0?0:active-1+q;
 return <>
  <Reveal g={g} at={times[0]} style={{position:'absolute',left:370,top:220,width:815,height:430,perspective:1400,perspectiveOrigin:'50% 50%',overflow:'hidden'}}>
   <div data-library="032" data-gallery-stage style={{position:'absolute',inset:0,transformStyle:'preserve-3d'}}>
    {labels.map((label,i)=>{
     if(g<F(times[i]))return null;
     const d=i-pos,back=Math.max(0,d),opacity=d<0?Math.max(0,1+d):1;
     if(opacity<.001)return null;
     return <div data-gallery-photo key={label} style={{position:'absolute',left:'50%',top:'50%',width:620,height:390,borderRadius:22,overflow:'hidden',background:'#0b0d12',
      boxShadow:'0 30px 60px -20px #000a,0 8px 20px -10px #0008',
      transform:`translate(-50%,-50%) translateX(${90*d}px) translateZ(${-220*d}px) rotateY(${22*Math.min(1,Math.max(0,d))}deg)`,
      opacity,filter:`brightness(${Math.max(.15,1-back*.2)}) blur(${back*1.5}px)`,zIndex:Math.round(2000-d*20)}}>
      <Img src={staticFile(assetRoot+'/'+items[i].file)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,#05060a88,transparent 46%)'}}/>
     </div>;
    })}
   </div>
  </Reveal>
  <div data-gallery-label>{labels.map((label,i)=>i===active&&<Capsule key={label} g={g} at={times[i]} label={label} x={72} y={330} w={290} size={41} form="pill" hue={items[i].hue??2}/>)}</div>
  {g>=F(times[0])&&<div style={{position:'absolute',left:72,top:470,display:'flex',gap:10}}>
   {labels.map((label,i)=><div key={label} style={{height:7,width:i===active?26:8,borderRadius:10,background:i===active?'#fff':'#ffffff44'}}/>)}
  </div>}
 </>;
};

/** 049: 原版紫色四角框移动，当前短语清晰，已讲短语降焦。 */
export const Focus049=({g,times,labels}:{g:number;times:number[];labels:[string,string]})=>{
 const size=45,gap=14;
 const active=g>=F(times[1])?1:0,q=active?p(g,times[1],15):1;
 const widths=labels.map(t=>labelWidth(t,size));
 const y=active?interpolate(q,[0,1],[285,455],clamp):285;
 const w=active?interpolate(q,[0,1],[widths[0],widths[1]],clamp):widths[0];
 return <div data-library="049">
  {labels.map((label,i)=>g>=F(times[i])&&<Reveal key={label} g={g} at={times[i]} style={{position:'absolute',left:91,top:285+i*170,...textStyle(size,'#fff'),fontWeight:700,textShadow:'0 2px 10px #000b',filter:i===active?'none':'blur(5px)'}}>
   <span data-safe-text="049-word">{label}</span>
  </Reveal>)}
  <svg data-six-line-gap="049-focus-corners" width={w+gap*2} height="88" style={{position:'absolute',left:91-gap,top:y-12,overflow:'visible',opacity:p(g,times[0])}}>
   <path d={`M0 18V0H18 M${w+gap*2-18} 0H${w+gap*2}V18 M0 70V88H18 M${w+gap*2-18} 88H${w+gap*2}V70`}
    fill="none" stroke="#5227FF" strokeWidth="4" strokeLinecap="round"/>
  </svg>
 </div>;
};
