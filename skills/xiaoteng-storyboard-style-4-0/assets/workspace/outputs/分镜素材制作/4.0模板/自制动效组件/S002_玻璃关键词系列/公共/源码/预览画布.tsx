import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {SceneBackground,TypeScene,useGlassFonts,useGlassAudit} from './核心';
import type {KeywordCardProps} from './调用接口';
export const ItemPreview:React.FC<{variant:number;Card:React.ComponentType<KeywordCardProps>}>=({variant,Card})=>{
 const frame=useCurrentFrame(),ready=useGlassFonts(),globalFrame=105+variant*135+frame;
 useGlassAudit(ready,0);
 return <AbsoluteFill style={{background:'#081522',fontFamily:'GlassCN',color:'#f7fbff'}}><div data-archive-frame={variant*135+frame} data-glass-scene style={{position:'absolute',width:1280,height:720,transform:'scale(1.5)',transformOrigin:'0 0',overflow:'hidden'}}><SceneBackground frame={globalFrame}/>{ready&&<TypeScene variant={variant} frame={frame} globalFrame={globalFrame} Card={Card}/>}</div></AbsoluteFill>;
};
