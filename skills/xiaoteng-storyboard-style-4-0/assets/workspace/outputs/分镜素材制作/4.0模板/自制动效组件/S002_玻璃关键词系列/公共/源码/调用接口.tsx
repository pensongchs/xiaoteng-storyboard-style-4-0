import React from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
import {AssetRootContext,DEFAULT_ASSET_ROOT,FrostedTextBox,GlassContent,KeywordIllustration,Motion,animationStyle,motionByType,useGlassFonts,useGlassAudit} from './核心';
export type KeywordCardProps={frame?:number;atMs?:number;durationInFrames?:number;content?:Partial<GlassContent>;accent?:string;tone?:'neutral'|'info'|'risk'|'positive'|'premium'|'focus';illustration?:KeywordIllustration;x?:number;y?:number;size?:number;assetRoot?:string;animate?:boolean;motion?:Motion};
export const semanticColors={neutral:'#dce7f3',info:'#40b9ff',risk:'#ff6988',positive:'#77dfac',premium:'#e0be8b',focus:'#ba90ff'};
export function makeKeywordCard(variant:number){
 const Card:React.FC<KeywordCardProps>=(props)=>{
  const clock=useCurrentFrame(),{fps}=useVideoConfig(),ready=useGlassFonts();
  const frame=(props.frame??clock)-Math.ceil((props.atMs??0)*fps/1000),duration=props.durationInFrames??135;
  useGlassAudit(ready,0);
  if(!ready||frame<0||frame>=duration)return null;
  const changed=props.content!==undefined;
  const content=changed?{title:'',body:'',lines:[],highlight:'',tag:'',number:'01',columns:[],...props.content}:undefined;
  if(changed){
   if(variant===8&&!content!.lines.length)throw Error('关键词清单需提供content.lines');
   if(variant===11&&!content!.columns.length)throw Error('并列关键词需提供content.columns');
   if(![8,11].includes(variant)&&!content!.title.trim())throw Error('请提供本期关键词content.title');
   if(variant===5&&!content!.lines.length)throw Error('双行关键词需提供第二行content.lines');
  }
  const illustration=props.illustration??(changed?{kind:'none'}:undefined);
  const accent=props.accent??(props.tone?semanticColors[props.tone]:changed?semanticColors.neutral:undefined);
  const node=<FrostedTextBox variant={variant} frame={frame} content={content} illustration={illustration} accent={accent} x={props.x} y={props.y} size={props.size}/>;
  return <AssetRootContext.Provider value={props.assetRoot??DEFAULT_ASSET_ROOT}>{props.animate===false?node:<div style={{position:'absolute',inset:0,fontFamily:'GlassCN',color:'#f7fbff',...animationStyle(frame,props.motion??motionByType[variant],duration)}}>{node}</div>}</AssetRootContext.Provider>;
 };
 return Card;
}
