import React from 'react';
import {staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import {STYLE40 as S} from './参数';
let fontReady:Promise<void>|undefined;
export const SixFonts=({children}:{children:React.ReactNode})=>{
 const [handle]=React.useState(()=>delayRender('加载本期字体'));
 const [ready,setReady]=React.useState(false);
 React.useEffect(()=>{
  fontReady??=Promise.all(S.fonts.map(async({family,weight,file:name})=>{const face=new FontFace(family,`url("${staticFile('fonts/'+name)}")`,{weight});await face.load();document.fonts.add(face);})).then(()=>document.fonts.ready).then(()=>undefined);
  let active=true;
  fontReady.then(()=>{if(active)setReady(true);}).catch(cancelRender);
  return ()=>{active=false;};
 },[handle]);
 React.useLayoutEffect(()=>{if(ready)continueRender(handle);},[ready,handle]);
 return ready?<>{children}</>:null;
};
export const FramePaintGate=({frame}:{frame:number})=>{
 const handle=React.useMemo(()=>delayRender('等待当前帧材质与文字绘制完成'),[frame]);
 React.useLayoutEffect(()=>{
  let active=true;const rafs:number[]=[];
  Promise.all(Array.from(document.images).map(im=>im.decode().then(()=>{if(!im.naturalWidth)throw new Error('图片为空：'+im.src);}))).then(()=>{
   if(!active)return;document.documentElement.getBoundingClientRect();
   const paint=(remaining:number)=>{
    if(!active)return;
    const ready=Array.from(document.querySelectorAll<HTMLCanvasElement>('[data-six-raster]')).every(canvas=>canvas.dataset.sixRasterReady===canvas.closest<HTMLElement>('[data-six-source-frame]')?.dataset.sixSourceFrame);
    if(!remaining&&ready){continueRender(handle);return;}
    rafs.push(requestAnimationFrame(()=>paint(Math.max(0,remaining-1))));
   };paint(S.guards.paintFrames);
  }).catch(cancelRender);
  return()=>{active=false;rafs.forEach(cancelAnimationFrame);continueRender(handle);};
 },[frame,handle]);return null;
};
export const LayoutAudit=({frame}:{frame:number})=>{
 React.useLayoutEffect(()=>{
  const errors:{text:string;kind:string;edge:number[]}[]=[];
  document.querySelectorAll<HTMLElement>('[data-safe-text]').forEach(node=>{
   let alpha=1;for(let p:Element|null=node;p;p=p.parentElement){const st=getComputedStyle(p);if(st.visibility==='hidden'||st.display==='none')return;alpha*=Number(st.opacity);}if(alpha<.05)return;
   const box=node.closest<HTMLElement>('[data-textbox]');if(!box)return;
   const boxRect=box.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(node);
   const r=range.getBoundingClientRect(),scale=boxRect.width/box.offsetWidth;
   if(!r.width||!r.height||!boxRect.width)return;
   const edge=[r.left-boxRect.left,boxRect.right-r.right,r.top-boxRect.top,boxRect.bottom-r.bottom].map(n=>Math.round(n/scale*10)/10);
   if(edge[0]<S.guards.textPaddingX||edge[1]<S.guards.textPaddingX||edge[2]<S.guards.textPaddingY||edge[3]<S.guards.textPaddingY)errors.push({text:node.textContent??'',kind:node.dataset.safeText??'',edge});
  });
  document.querySelectorAll<HTMLElement>('[data-safe-text]').forEach(node=>{
   let alpha=1;for(let p:Element|null=node;p;p=p.parentElement){const st=getComputedStyle(p);if(st.visibility==='hidden'||st.display==='none')return;alpha*=Number(st.opacity);}if(alpha<.97)return;
   const family=getComputedStyle(node).fontFamily.split(',')[0].replace(/["']/g,'').trim().toLowerCase();if(!S.fonts.some(f=>f.family.toLowerCase()===family))errors.push({text:node.textContent??'',kind:'font-family',edge:[]});
   const range=document.createRange();range.selectNodeContents(node);const r=range.getBoundingClientRect();if(!r.width||!r.height)return;
   if(r.left<20||r.right>S.output.width-20||r.top<20||r.bottom>S.output.height-S.canvas.subtitlePixels+1)errors.push({text:node.textContent??'',kind:'text-safe-area',edge:[r.left,r.top,r.right,r.bottom]});
  });
  const plane=document.querySelector<HTMLElement>('[data-six-plane]')?.getBoundingClientRect();
  if(plane)document.querySelectorAll<HTMLElement>('[data-textbox]').forEach(box=>{
   if(!box.closest('[data-six-content]'))return;
   const r=box.getBoundingClientRect(),bottom=(r.bottom-plane.top)/plane.height*720;
   if(bottom>S.canvas.subtitleTop+.5)errors.push({text:box.textContent??'',kind:'subtitle-safe-area',edge:[Math.round(bottom*10)/10]});
  });
  const visible=(node:Element)=>{let alpha=1;for(let parent:Element|null=node;parent;parent=parent.parentElement){const s=getComputedStyle(parent);if(s.visibility==='hidden'||s.display==='none')return false;alpha*=Number(s.opacity);}return alpha>.05;};
  document.querySelectorAll<HTMLElement>('[data-six-line-gap]').forEach(line=>{
   if(!visible(line))return;
   const root=line.closest<HTMLElement>('[data-six-content]');if(!root)return;
   const r=line.getBoundingClientRect(),scale=root.getBoundingClientRect().width/root.offsetWidth,pad=S.guards.lineGap*scale;
   root.querySelectorAll<HTMLElement>('[data-six-kicker],[data-textbox]').forEach(box=>{
    if(!visible(box))return;const b=box.getBoundingClientRect();
    if(r.width+r.height>0&&r.right>b.left-pad&&r.left<b.right+pad&&r.bottom>b.top-pad&&r.top<b.bottom+pad)errors.push({text:box.textContent??'',kind:'line-box-gap',edge:[Math.round((r.top-b.bottom)/scale*10)/10]});
   });
  });
  const source=document.querySelector<HTMLElement>('[data-six-source-frame]')?.dataset.sixSourceFrame;
  document.documentElement.dataset.style40AuditSource=source??'';
  document.documentElement.dataset.style40AuditErrors=JSON.stringify(errors);
  if(errors.length)console.error('SIX_LAYOUT '+JSON.stringify({frame,errors}));
 });return null;
};
