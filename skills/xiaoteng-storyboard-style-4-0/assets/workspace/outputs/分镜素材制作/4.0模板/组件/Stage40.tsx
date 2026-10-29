import React, {useLayoutEffect} from 'react';
import {AbsoluteFill,Img,OffthreadVideo,Freeze,interpolate,random,useCurrentFrame} from 'remotion';
import {STYLE40 as S} from '../参数';
import {Style40Fonts,FramePaintGate,LayoutAudit,ThemeContext,F} from './Style40';
import {AssetContext,BackdropContext,LibraryBackground} from './Glass40';
import {staticFile} from 'remotion';

/** 内容层采用最终成片的统一变换；背景不缩放，不给整片叠加蓝色滤镜。 */
export const Style40Frame=({g,index=0,assetRoot,texture,background,backgroundKind='036',softPhoto=false,children}:{g:number;index?:number;assetRoot:string;texture:string;background?:string;backgroundKind?:'036'|'038';softPhoto?:boolean;children:React.ReactNode})=>{
 if(!assetRoot||!texture)throw new Error('必须提供正式素材目录与玻璃取样纹理');
 const picture=background&&/\.(png|jpe?g|webp)$/i.test(background);
 return <AssetContext.Provider value={assetRoot}><Style40Fonts><AbsoluteFill style={{background:S.colors.ink,overflow:'hidden'}}>
 <div data-six-plane data-six-source-frame={g} style={{position:'absolute',left:0,top:0,width:S.canvas.width,height:S.canvas.height,transform:`scale(${S.canvas.scale})`,transformOrigin:'top left',fontFamily:S.type.family}}>
 <BackdropContext.Provider value={{g,texture,index}}>
 {background?(picture?<Img src={staticFile(assetRoot+'/'+background)} style={{position:'absolute',inset:0,width:1280,height:720,objectFit:'cover',transform:softPhoto?`scale(${S.background.photoZoom})`:undefined,filter:softPhoto?`brightness(${S.background.photoDim})`:undefined}}/>:<OffthreadVideo src={staticFile(assetRoot+'/'+background)} muted style={{position:'absolute',inset:0,width:1280,height:720,objectFit:'cover'}}/>):<LibraryBackground g={g} index={index} kind={backgroundKind}/>}
 <AbsoluteFill style={{background:background?S.background.photoOverlay:S.background.graphicOverlay}}/>
 <ThemeContext.Provider value={index}><div data-six-content style={{position:'absolute',left:S.canvas.foreground.x,top:S.canvas.foreground.y,width:1280,height:720,transform:`scale(${S.canvas.foreground.scale})`,transformOrigin:'top left'}}>{children}</div></ThemeContext.Provider>
 </BackdropContext.Provider></div><LayoutAudit frame={g}/><FramePaintGate frame={g}/>
 </AbsoluteFill></Style40Fonts></AssetContext.Provider>;
};

export const phase40=(g:number,startMs:number,endMs:number,enterFrames=18,exitFrames=0)=>{
 const start=F(startMs),end=F(endMs);if(end<=start||enterFrames+exitFrames>end-start)throw new Error('动作无法在真实时长内完成');
 return g<start||g>=end?'hidden':g<start+enterFrames?'enter':exitFrames&&g>=end-exitFrames?'exit':'hold';
};
/** 默认切镜沿用本期硬切；需要段内换组时显式分配退出时长，不能叠两套信息。 */
export const Timed40=({g,startMs,endMs,enterFrames=18,exitFrames=0,children}:{g:number;startMs:number;endMs:number;enterFrames?:number;exitFrames?:number;children:React.ReactNode})=>{
 const phase=phase40(g,startMs,endMs,enterFrames,exitFrames);if(phase==='hidden')return null;
 const opacity=phase==='exit'?interpolate(g,[F(endMs)-exitFrames,F(endMs)],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}):1;
 return <div data-style40-phase={phase} style={{position:'absolute',inset:0,opacity}}>{children}</div>;
};
export const useSourceFrame40=(startMs:number)=>useCurrentFrame()+F(startMs);
export const seeded40=(seed:string,index:number)=>random(seed+':'+index);

/** 冻结画面沿用末帧，输出时钟保持连续。 */
const OutputClock40=({frame,children}:{frame:number;children:React.ReactNode})=>{
 useLayoutEffect(()=>{
  const plane=document.querySelector<HTMLElement>('[data-six-source-frame]');
  if(!plane)return;
  const previous=plane.dataset.sixSourceFrame;
  plane.dataset.sixSourceFrame=String(frame);
  plane.querySelectorAll<HTMLElement>('[data-six-raster]').forEach(el=>{
   if(el.dataset.sixRasterReady===previous)el.dataset.sixRasterReady=String(frame);
  });
  if(document.documentElement.dataset.style40AuditSource===previous)
   document.documentElement.dataset.style40AuditSource=String(frame);
 });
 return <>{children}</>;
};

/** 正文沿用源时长，尾部冻结完整末帧，输出时钟继续前进。 */
export const HoldLastFrame40=({sourceStartMs,sourceEndMs,outputStartMs,children}:{sourceStartMs:number;sourceEndMs:number;outputStartMs:number;children:React.ReactNode})=>{
 const local=useCurrentFrame(),normal=F(sourceEndMs)-F(sourceStartMs);
 if(normal<1)throw new Error('源段落时长无效');
 return <OutputClock40 frame={F(outputStartMs)+local}><Freeze frame={normal-1} active={local>=normal}>{children}</Freeze></OutputClock40>;
};
