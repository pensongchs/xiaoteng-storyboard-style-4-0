import React from 'react';
import {AbsoluteFill,Composition,registerRoot} from 'remotion';
import {Z007} from './Z007_序号关键词框/源码/组件';
import {Z008} from './Z008_侧标强调框/源码/组件';
import {Z012} from './Z012_关键词清单框/源码/组件';
import {Z013} from './Z013_组合重点框/源码/组件';
import {Z018} from './Z018_斜切重点框/源码/组件';
import {SceneBackground,useGlassFonts} from './公共/源码/核心';
const Probe:React.FC<{caseIndex:number}>=({caseIndex})=>{
 const ready=useGlassFonts();
 const cards=[
  <Z008 frame={70} content={{title:'现金流压力',highlight:'压力'}} tone="risk" illustration={{kind:'none'}}/>,
  <Z013 frame={70} content={{title:'居住舒适',body:'空间 · 动线',tag:'居住'}} tone="positive" illustration={{kind:'graphic',symbol:'home'}}/>,
  <Z007 frame={70} content={{title:'区域选择',number:'02'}} tone="info" illustration={{kind:'graphic',symbol:'location'}}/>,
  <Z018 frame={70} content={{title:'谨慎选择'}} tone="focus" illustration={{kind:'none'}}/>,
  <Z012 frame={70} content={{lines:['通勤','采光','预算']}} tone="neutral"/>,
 ];
 return <AbsoluteFill style={{background:'#081522',fontFamily:'GlassCN',color:'#f7fbff'}}><div data-glass-scene style={{position:'absolute',width:1280,height:720,transform:'scale(1.5)',transformOrigin:'0 0'}}><SceneBackground frame={0}/>{ready&&cards[caseIndex]}</div></AbsoluteFill>;
};
registerRoot(()=> <Composition id="S002-Parameters" component={Probe} width={1920} height={1080} fps={30} durationInFrames={1} defaultProps={{caseIndex:0}}/>);
