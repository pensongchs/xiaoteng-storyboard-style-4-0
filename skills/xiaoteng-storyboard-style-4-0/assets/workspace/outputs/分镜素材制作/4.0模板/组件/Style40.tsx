import React from 'react';
import {Capsule as FrostCapsule,PearlCard as FrostCard,FrostSurface,SolidEnter} from './Frost40';
import {LiquidSurface,SpecularRim,AssetContext} from './Glass40';
import {STYLE40 as S} from '../参数';
import {frame40} from './Clock40';
import {overlaps40 as overlaps} from './LayoutGeometry40';
import {Easing, Img, interpolate, spring, staticFile, delayRender, continueRender, cancelRender} from 'remotion';

export const F=frame40;
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const p=(g:number,at:number,n=S.motion.revealFrames as number)=>interpolate(g,[F(at),F(at)+n],[0,1],{...clamp,easing:Easing.bezier(...S.motion.ease)});
export const linear=(g:number,at:number,n=S.motion.linearFrames as number)=>interpolate(g,[F(at),F(at)+n],[0,1],clamp);
export const ThemeContext=React.createContext(0);
export const colors=S.accents;
const palettes=S.glassTints;
export const clean=(s:string)=>s.replace(/[，,]/g,' ').replace(/ {2,}/g,' ');
export const cleanNode=(node:React.ReactNode):React.ReactNode=>typeof node==='string'?clean(node):Array.isArray(node)?node.map(cleanNode):React.isValidElement<{children?:React.ReactNode}>(node)?React.cloneElement(node,{},cleanNode(node.props.children)):node;
export const textStyle=(size:number=S.type.bodySize,color:string=S.colors.white):React.CSSProperties=>({fontFamily:S.type.family,fontWeight:S.type.bodyWeight,fontSize:size,lineHeight:S.type.lineHeight,color,whiteSpace:'pre-line'});
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
const widthCache=new Map<string,number>();
let measuringContext:CanvasRenderingContext2D|null|undefined;
export const labelWidth=(label:string,size:number,weight=700,family='BFBody')=>{
 const value=clean(label),key=[value,size,weight,family].join('|');
 if(widthCache.has(key))return widthCache.get(key)!;
 if(typeof document==='undefined')return Array.from(value).reduce((n,c)=>n+((c.codePointAt(0)??0)>255?size:size*.64),0);
 measuringContext??=document.createElement('canvas').getContext('2d');
 if(!measuringContext)throw new Error('无法测量文字');
 measuringContext.font=`${weight} ${size}px ${family}`;
 const width=measuringContext.measureText(value).width;
 widthCache.set(key,width);return width;
};
export const fittedSize=(label:string,preferred:number,available:number)=>{
 if(!Number.isFinite(preferred)||!Number.isFinite(available)||preferred<=0||available<=0)throw new Error('字号或可用宽度无效');
 const raw=Math.max(...label.split('\n').map(line=>labelWidth(line,preferred)));
 const result=Math.min(preferred,Math.floor(preferred*Math.max(1,available)/Math.max(1,raw)*.97));
 if(result<Math.max(S.type.minimumSize,Math.floor(preferred*S.type.minimumFitRatio)))throw new Error('文字过长：请分句、换行或调整布局，不能继续缩字：'+label);
 return result;
};
export const fitLabel=(label:string,size:number,maxWidth:number)=>{
 const value=clean(label),limit=maxWidth-(S.label.paddingX*2+S.label.extraWidth);
 let lines=value.split('\n');
 if(lines.length===1&&labelWidth(value,size)>limit/S.label.minWrapRatio){
  const words=value.split(' ');if(words.length===1)throw new Error('长文本请按语义加空格或换行：'+value);
  lines=[];let row='';for(const word of words){const next=row?row+' '+word:word;if(row&&labelWidth(next,size)>limit){lines.push(row);row=word;}else row=next;}if(row)lines.push(row);
 }
 if(lines.length>S.label.maxLines)throw new Error('文本框超过三行，请拆分信息：'+value);
 const width=Math.min(maxWidth,Math.max(S.label.minWidth,Math.ceil(Math.max(...lines.map(l=>labelWidth(l,size)))+(S.label.paddingX*2+S.label.extraWidth))));
 const fontSize=Math.min(...lines.map(l=>fittedSize(l,size,width-(S.label.paddingX*2+S.label.extraWidth)))),lineHeight=S.label.lineHeight;
 if(fontSize<S.label.minFontSize)throw new Error('文本框字号过小，请分句或加宽：'+value);
 return {width,height:Math.ceil(fontSize*lineHeight*lines.length+(S.label.paddingY*2)),radius:Math.min(46,(fontSize*lineHeight+(S.label.paddingY*2))/2),fontSize,lineHeight,text:lines.join('\n'),lines:lines.length};
};
export const Reveal=({g,at,children,style={},box,motion='rise'}:{g:number;at:number;children:React.ReactNode;style?:React.CSSProperties;box?:string;motion?:'rise'|'from-left'|'from-right'|'pop'|'settle'})=>{
 if(g<F(at))return null;
 const t=p(g,at),s=spring({frame:g-F(at),fps:S.output.fps,config:S.motion.revealSpring});
 // 文字与卡面保持同一平面，不给整组文字添加离屏滤镜。
 const transform=motion==='from-left'?`translateX(${-S.motion.reveal.side*(1-s)}px)`:motion==='from-right'?`translateX(${S.motion.reveal.side*(1-s)}px)`:motion==='pop'?`translateY(${S.motion.reveal.popY*(1-s)}px) scale(${S.motion.reveal.popScale+.14*s})`:motion==='settle'?`translateY(${S.motion.reveal.settleY*(1-s)}px) scale(${S.motion.reveal.settleScale+.04*s})`:`translateY(${S.motion.reveal.rise*(1-s)}px)`;
 return <div data-textbox={box} style={{...style,opacity:t,transform,transformOrigin:'50% 50%'}}>{cleanNode(children)}</div>;
};
export const Head=({g,at,children,x=S.canvas.left as number,y=S.type.heading.y as number,size=S.type.heading.size as number,tone=S.colors.white as string,withKicker=false}:{g:number;at:number;children:React.ReactNode;x?:number;y?:number;size?:number;tone?:string;withKicker?:boolean})=>{
 if(y===S.type.heading.y&&(size<S.type.heading.range[0]||size>S.type.heading.range[1]))throw new Error('主标题字号超出固定范围，请调整断句和布局');
 const i=React.useContext(ThemeContext),col=colors[i%colors.length],label=typeof children==='string'?children:undefined,available=S.canvas.right-x,fontSize=label?Math.min(...label.split('\n').map(line=>fittedSize(line,size,available))):size;
 if(y===S.type.heading.y&&fontSize<S.type.heading.range[0])throw new Error('主标题不能缩成正文大小，请换行或调整布局');
 return <Reveal g={g} at={at} style={{position:'absolute',left:x,top:y,maxWidth:available,fontFamily:S.type.family,fontWeight:S.type.heading.weight,fontSize,lineHeight:S.type.heading.lineHeight,letterSpacing:S.type.heading.letterSpacing,whiteSpace:'pre-line',color:tone,textShadow:S.type.heading.shadow}}>
  {y===S.type.heading.y&&<div data-six-line-gap="heading" style={{position:'absolute',left:0,top:withKicker?S.type.accentLine.withKickerOffset:S.type.accentLine.offset,width:S.type.accentLine.width*p(g,at,S.type.accentLine.frames),height:S.type.accentLine.height,borderRadius:S.type.accentLine.radius,background:col,boxShadow:`0 2px 14px ${col}55`}}/>}<span data-safe-text="heading">{children}</span>
 </Reveal>;
};
export const Kicker=({g,at,label}:{g:number;at:number;label:string})=>{
 const idx=React.useContext(ThemeContext),col=colors[idx%colors.length],parts=label.split(' / ');
 return <Reveal g={g} at={at} style={{position:'absolute',left:S.canvas.left,top:S.type.kicker.y,display:'flex',alignItems:'center',gap:S.type.kicker.gap,...textStyle(S.type.kicker.size),letterSpacing:S.type.kicker.letterSpacing}}>
  <span data-six-kicker data-safe-text="kicker" style={{padding:S.type.kicker.padding,color:'#161615',background:col,borderRadius:S.type.kicker.radius,boxShadow:S.type.kicker.shadow,fontWeight:S.type.kicker.weight}}>{parts[0]}</span>{parts[1]&&<span style={{color:'#fffdf6',textShadow:'0 2px 8px #000'}}>{parts[1]}</span>}
 </Reveal>;
};

// 本期自绘材质组件；不冒充库项。原版库项单独在下方按原色适配。
export type GlassForm='pill'|'tile'|'oval'|'tab'|'ribbon'|'lens';
export const Capsule=({g,at,label,x=S.canvas.left as number,y=324,w=600,id='plain',tone=S.colors.white as string,size=S.type.bodySize as number,form,hue}:{g:number;at:number;label:string;x?:number;y?:number;w?:number;id?:string;tone?:string;size?:number;form?:GlassForm;hue?:number})=>{
 if(!['plain','003','040','010','053','042'].includes(id))throw new Error('当前文本组件不支持此动效编号：'+id+'，请使用真实适配器');
 const theme=React.useContext(ThemeContext),col=palettes[(hue??theme+Math.floor(y/100))%palettes.length];
 const shape=fitLabel(label,size,Math.min(w,S.canvas.right-x));
 if(g<F(at))return null;
 if(id==='003')return <GlowButton {...{g,at,label,x,y,w:Math.min(w,S.canvas.right-x),size}}/>;
 if(id==='040')return <FuseLabel {...{g,at,label,x,y,w:Math.min(w,S.canvas.right-x),size}}/>;
 if(id==='010')return <AcidBadge {...{g,at,label,x,y,w:Math.max(260,shape.width),size}}/>;
 if(id==='053')return <ArrowButton {...{g,at,label,x,y,w:Math.min(w,labelWidth(label,size)+172,S.canvas.right-x),size}}/>;
 return <FrostCapsule {...{g,at,label,x,y,w,tone,size,form,hue}}/>;
};

export const GlassPanel=({g,at,x,y,w,h,children,r=30,hue=2}:{g:number;at:number;x:number;y:number;w:number;h:number;children:React.ReactNode;r?:number;hue?:number})=> <SolidEnter {...{g,at}} box="frost-panel" motion="from-left" style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:r}}><FrostSurface hue={hue} r={r}/><div style={{position:'absolute',inset:0}}>{cleanNode(children)}</div></SolidEnter>;

// 003 原版 #2e8eff / #1a1a1a，0.3秒发光激活，不更改配色。
export const GlowButton=({g,at,label,x,y,w,size=31}:{g:number;at:number;label:string;x:number;y:number;w:number;size?:number})=>{
 if(g<F(at))return null;const t=p(g,at),hover=p(g,at+150,9),h=86,fontSize=fittedSize(label,size,w-116);
 return <div data-library="003" data-textbox="003" style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:24,background:`linear-gradient(to bottom right,#2e8eff 0%,rgba(46,142,255,0) 30%),rgba(46,142,255,${.2+.5*hover})`,boxShadow:`0 0 ${10*hover}px rgba(46,142,255,.5),0 16px 22px -17px #000`,opacity:t,transform:`translateY(${15*(1-t)}px)`,display:'grid',placeItems:'center'}}>
  <div style={{position:'absolute',inset:3,padding:'0 31px',boxSizing:'border-box',borderRadius:21,background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',gap:16,...textStyle(fontSize,'#ffffff'),whiteSpace:'nowrap'}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" style={{flexShrink:0}}><circle cx="12" cy="7" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2Z"/></svg><span data-safe-text="003">{clean(label)}</span></div>
 </div>;
};
// 040 原版橙色引线、深灰表面与缩放按压，文字持续清晰，按帧自动触发。
export const FuseLabel=({g,at,label,x,y,w,size=34}:{g:number;at:number;label:string;x:number;y:number;w:number;size?:number})=>{
 if(g<F(at))return null;
 const t=p(g,at,12),armed=p(g,at+190,6),burn=linear(g,at+190,120),h=96,press=interpolate(g-F(at),[0,3,7,12],[1,.97,1,1],clamp),fontSize=fittedSize(label,size,w-124);
 return <div data-library="040" data-textbox="040" style={{position:'absolute',left:x,top:y,width:w,height:h,background:'#27272a',color:'#f5f5f5',borderRadius:48,boxShadow:'inset 0 1px #ffffff24,0 18px 32px -17px #000a',opacity:t,transform:`translateY(${12*(1-t)}px) scale(${press})`}}>
  <div style={{position:'absolute',inset:0,padding:'0 36px',boxSizing:'border-box',display:'flex',gap:18,alignItems:'center',justifyContent:'center',...textStyle(fontSize,'#f5f5f5'),whiteSpace:'nowrap'}}><svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#f5f5f5" strokeWidth="2" style={{flexShrink:0,transform:`rotate(${-70*(1-armed)}deg)`}}><path d="M10 6L4 10l6 4M4 10h12a8 8 0 1 1-5 14"/></svg><span data-safe-text="040">{clean(label)}</span></div>
  <svg width={w} height={h} style={{position:'absolute',inset:0,overflow:'visible',opacity:armed,filter:'drop-shadow(0 0 3px #f5a52499)',pointerEvents:'none'}}><rect x="1.3" y="1.3" width={w-2.6} height={h-2.6} rx="46.7" fill="none" stroke="#f5a524" strokeWidth="2.6" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={-burn}/></svg>
 </div>;
};
// 信息卡默认沿用正式不透明磨砂面。
export const PearlCard=(props:React.ComponentProps<typeof FrostCard>)=><FrostCard {...props}/>;
export const AcidBadge=({g,at,label,x,y,w,size}:{g:number;at:number;label:string;x:number;y:number;w:number;size:number})=>{
 const t=p(g,at),fontSize=fittedSize(label,size,w-64);return <Reveal {...{g,at}} box="010" style={{position:'absolute',left:x,top:y,width:w,height:92,borderRadius:43,border:'1px solid #b6d322',background:'radial-gradient(120% 90% at 20% 0%,#dcf853 0%,#d3f23f 55%,#b6d322 100%)',boxShadow:`0 0 0 1px #d3f23f47,0 ${14+4*t}px 40px -12px #d3f23f8c`,display:'flex',alignItems:'center',justifyContent:'center',gap:14,...textStyle(fontSize,'#14181a'),padding:'0 32px',boxSizing:'border-box',whiteSpace:'nowrap'}}><span data-library="010" data-safe-text="010">{clean(label)}</span></Reveal>;
};
export const ArrowButton=({g,at,label,x,y,w,size}:{g:number;at:number;label:string;x:number;y:number;w:number;size:number})=>{
 const t=p(g,at+350,24),fontSize=fittedSize(label,size,w-156);return <SolidEnter {...{g,at}} style={{position:'absolute',left:x,top:y,width:w,height:106,borderRadius:53-41*t,background:'#212121',boxShadow:`0 0 0 ${2*(1-t)}px greenyellow`,overflow:'hidden'}}>
  <div data-library="053" style={{position:'absolute',left:'50%',top:'50%',width:20+w*1.7*t,height:20+w*1.7*t,borderRadius:'50%',background:'greenyellow',transform:'translate(-50%,-50%)',opacity:t}}/>
  <div data-textbox="053" style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',...textStyle(fontSize,t>.6?'#212121':'greenyellow'),padding:'0 66px',boxSizing:'border-box',whiteSpace:'nowrap',transform:`translateX(${-12+24*t}px)`}}><span data-safe-text="053">{clean(label)}</span></div><span style={{position:'absolute',right:22-w*.3*t,top:22,fontSize:42,color:t>.6?'#212121':'greenyellow'}}>→</span><span style={{position:'absolute',left:-w*.25+(w*.25+16)*t,top:22,fontSize:42,color:'#212121'}}>→</span>
 </SolidEnter>;
};

export const Model=({g,at,file,x,y,w,h,zoom=1}:{g:number;at:number;file:string;x:number;y:number;w:number;h:number;zoom?:number})=>{const root=React.useContext(AssetContext);if(!root)throw new Error('缺少正式素材目录');return <Reveal {...{g,at}} style={{position:'absolute',left:x,top:y,width:w,height:h}}><div style={{position:'absolute',left:'17%',right:'12%',height:36,bottom:25,borderRadius:'50%',background:'#0009',filter:'blur(25px)'}}/><Img src={staticFile(root+'/'+file)} style={{width:'100%',height:'100%',objectFit:'contain',transform:`translateY(${S.motion.model.y*Math.sin(g/S.motion.model.yPeriod)}px) scale(${zoom*(1+S.motion.model.zoom*Math.sin(g/S.motion.model.zoomPeriod))})`}}/></Reveal>;};
export const PhotoCard=({g,at,file,x,y,w,h,label}:{g:number;at:number;file:string;x:number;y:number;w:number;h:number;label?:string})=>{
 const root=React.useContext(AssetContext);if(!root)throw new Error('缺少正式素材目录');const t=p(g,at,S.motion.photo.frames);return <Reveal {...{g,at}} motion="from-right" style={{position:'absolute',left:x,top:y,width:w,height:h}}>
  <div data-textbox="photo" style={{position:'absolute',inset:0,overflow:'hidden',borderRadius:30,border:'1px solid #ffffff55',transform:`translateX(${S.motion.photo.slide*(1-t)}px)`,boxShadow:'inset 0 1px #fff5,0 12px 26px -20px #0008'}}><Img src={staticFile(root+'/'+file)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${S.motion.photo.baseZoom+S.motion.photo.zoomAmplitude*Math.sin(g/S.motion.photo.zoomPeriod)})`}}/>{label&&<><div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,#101113d9,transparent 55%)'}}/><div data-safe-text="photo" style={{position:'absolute',left:28,right:28,bottom:28,...textStyle(fittedSize(label,27,w-56)),whiteSpace:'nowrap'}}>{clean(label)}</div></>}</div>
 </Reveal>;
};

// 只等待浏览器完成当前帧绘制；所有动画位置仍由视频帧决定。
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
  const settled=(node:Element)=>{let alpha=1;for(let parent:Element|null=node;parent;parent=parent.parentElement)alpha*=Number(getComputedStyle(parent).opacity);return visible(node)&&alpha>.97;};
  const boxes=Array.from(document.querySelectorAll<HTMLElement>('[data-textbox]')).filter(settled).map(node=>({node,rect:node.getBoundingClientRect()})).filter(x=>x.rect.width>1&&x.rect.height>1);
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
   const a=boxes[i],b=boxes[j];if(a.node.contains(b.node)||b.node.contains(a.node))continue;
   if(overlaps(a.rect,b.rect))errors.push({text:(a.node.textContent??'')+' / '+b.node.textContent,kind:'textbox-overlap',edge:[a.rect.x,a.rect.y,b.rect.x,b.rect.y]});
  }
  for(const node of Array.from(document.querySelectorAll<HTMLElement>('[data-safe-text]')).filter(settled)){
   const range=document.createRange();range.selectNodeContents(node);const r=range.getBoundingClientRect();if(!r.width||!r.height)continue;
   for(const box of boxes)if(!box.node.contains(node)&&!node.contains(box.node)&&overlaps(r,box.rect))errors.push({text:node.textContent??'',kind:'text-box-overlap',edge:[r.x,r.y,box.rect.x,box.rect.y]});
  }
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

export {SixFonts as Style40Fonts};

/** 标签与主标题配套调用，沿用已经修正的线框间距。 */
export const Heading40=({g,at,label,title,headAt=at}:{g:number;at:number;label:string;title:string;headAt?:number})=><div style={{position:'absolute',inset:0,transform:`translateX(${S.type.heading.offsetX}px)`}}><Kicker g={g} at={at} label={label}/><Head g={g} at={headAt} withKicker>{title}</Head></div>;
