import React from 'react';
import {STYLE40 as S} from './参数';
import {frame40} from './时钟';
export const F=frame40;
export const clean=(s:string)=>s.replace(/[，,]/g,' ').replace(/ {2,}/g,' ');
export const cleanNode=(node:React.ReactNode):React.ReactNode=>typeof node==='string'?clean(node):Array.isArray(node)?node.map(cleanNode):React.isValidElement<{children?:React.ReactNode}>(node)?React.cloneElement(node,{},cleanNode(node.props.children)):node;
export const textStyle=(size:number=S.type.bodySize,color:string=S.colors.white):React.CSSProperties=>({fontFamily:S.type.family,fontWeight:S.type.bodyWeight,fontSize:size,lineHeight:S.type.lineHeight,color,whiteSpace:'pre-line'});
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
