import React, {useEffect, useLayoutEffect, useState} from 'react';
import {AbsoluteFill, Img, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';

export const DEFAULT_ASSET_ROOT='系列素材/S002_玻璃关键词系列';
export const AssetRootContext=React.createContext(DEFAULT_ASSET_ROOT);
export type KeywordIllustration={kind:'none'}|{kind:'graphic';symbol:'route'|'location'|'home'|'guard'}|{kind:'image';src:string};

export const COLLECTION = {fps:30, width:1920, height:1080, intro:105, scene:135, palette:180, motions:270, outro:120, frames:2700};
export const GLASS_COLORS = ['#40b9ff','#ff6988','#ffb552','#77dfac','#ba90ff','#e0be8b','#dce7f3'];
export const GLASS_NAMES = ['基础关键词框','渐变重点框','图标关键词框','序号关键词框','侧标强调框','双行关键词框','对话短语框','书签关键词框','关键词清单框','组合重点框','底部关键词条','并列关键词框','图片关键词框','极简描边框','斜切重点框'];
const details = [
 ['单组关键词','居中排版','淡入上滑'],['核心关键词','细渐变亮边','缩放弹出'],['对象关键词','轻量图标','从左滑入'],['步骤关键词','小序号标记','缩放弹出'],['风险关键词','克制侧色条','从右滑入'],
 ['两组关键词','主次层级','模糊转清晰'],['态度短语','简洁气泡','淡入上滑'],['分类关键词','细书签标记','从左滑入'],['并列关键词','依次进入','淡入上滑'],['核心与关联词','简洁组合','缩放弹出'],
 ['结论关键词','横向留白','从左滑入'],['三组关键词','等距对齐','淡入上滑'],['图片与关键词','轻量标识','从右滑入'],['单组关键词','极简亮边','模糊转清晰'],['强调关键词','细斜切轮廓','掠光扫过'],
];

const clamp = (v:number)=>Math.max(0,Math.min(1,v));
const mix = (f:number,a:number,b:number)=>clamp((f-a)/(b-a));
const rgba = (hex:string,a:number)=>`rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;
export type Motion = 'rise'|'pop'|'left'|'right'|'focus'|'sweep'|'float';
export const motionByType:Motion[] = ['rise','pop','left','pop','right','focus','rise','left','rise','pop','left','rise','right','focus','sweep'];

export function useGlassFonts(){
  const [handle] = useState(()=>delayRender('加载磨砂框中文字体'));
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    let alive=true;
    const faces=[new FontFace('GlassCN',`url(${staticFile('fonts/AlibabaHealthFont2.0CN-45R.ttf')})`,{weight:'400'}),new FontFace('GlassCN',`url(${staticFile('fonts/AlibabaHealthFont2.0CN-85B.ttf')})`,{weight:'700'})];
    Promise.all(faces.map(async face=>{await face.load();document.fonts.add(face);})).then(()=>{if(alive){setReady(true);continueRender(handle);}}).catch(cancelRender);
    return ()=>{alive=false;};
  },[handle]);
  return ready;
}

export const SceneBackground:React.FC<{frame:number}> = ()=>{const assetRoot=React.useContext(AssetRootContext);return <AbsoluteFill><Img src={staticFile(assetRoot+'/场景背景.png')} style={{width:1280,height:720}}/></AbsoluteFill>;};

const Icon:React.FC<{kind?:'home'|'check'|'picture';size?:number;color?:string}> = ({kind='home',size=38,color='white'})=><svg width={size} height={size} viewBox="0 0 48 48" fill="none">
  {kind==='home'?<><path d="M5 22 24 6l19 16" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 21v21h11V29h8v13h9V21L24 9Z" fill={color}/></>:kind==='check'?<path d="m10 24 9 9 20-22" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>:<><rect x="3" y="5" width="42" height="38" rx="7" stroke={color} strokeWidth="3"/><path d="m7 37 12-17 8 10 7-9 9 16" fill={color}/><circle cx="33" cy="15" r="4" fill={color}/></>}
</svg>;


type PanelProps = {x:number;y:number;w:number;h:number;frame:number;accent?:string;outline?:boolean;path?:string;mini?:boolean;children?:React.ReactNode;sweep?:number};
const Panel:React.FC<PanelProps>=({x,y,w,h,frame,accent='#c8e6fa',outline=false,path,mini=false,children,sweep=-1})=>{
  const assetRoot=React.useContext(AssetRootContext);
  const clip=path?`path('${path}')`:undefined;
  return <div data-glass-card style={{position:'absolute',left:x,top:y,width:w,height:h,filter:'drop-shadow(0 15px 22px rgba(0,0,0,.32))'}}>
    <div style={{position:'absolute',inset:0,borderRadius:24,clipPath:clip,overflow:'hidden',background:outline?'rgba(140,170,196,.06)':'rgba(125,159,186,.22)'}}>
      {!mini&&<Img src={staticFile(`${assetRoot}/${outline?'背景轻磨砂':'背景磨砂'}.png`)} style={{position:'absolute',width:1280,height:720,left:-x,top:-y,opacity:outline?.2:.45}}/>}
      <AbsoluteFill style={{background:outline?'linear-gradient(135deg,#d2f0ff07,#b7d5f50d)':'linear-gradient(135deg,rgba(81,103,126,.48),rgba(28,41,57,.8) 65%,rgba(92,113,135,.3))'}}/>
      <AbsoluteFill style={{background:`radial-gradient(ellipse at 12% 0%,${rgba(accent,.13)},transparent 64%)`}}/>
      {!mini&&<AbsoluteFill style={{backgroundImage:`url("${staticFile(assetRoot+'/磨砂颗粒.png')}")`,opacity:.055,mixBlendMode:'soft-light'}}/>}
      {sweep>=0&&sweep<=1&&<div style={{position:'absolute',left:-280+(w+400)*sweep,top:-h,width:160,height:h*3,transform:'rotate(24deg)',background:'linear-gradient(90deg,transparent,#effaff45,transparent)'}}/>}
    </div>
    {path?<svg width={w} height={h} style={{position:'absolute',inset:0,overflow:'visible'}}><path d={path} fill="none" stroke={tint(accent,.55)} strokeWidth="1" opacity=".58"/></svg>:<AbsoluteFill style={{borderRadius:24,border:`1px solid ${rgba(tint(accent,.55),.5)}`,boxShadow:`inset 0 1px 2px #ffffff38,inset 0 -1px 1px ${rgba(accent,.15)},0 0 12px ${rgba(accent,.035)}`}}/>}
    <div style={{position:'absolute',inset:0,borderRadius:path?undefined:24,clipPath:clip,overflow:'hidden'}}>{children}</div>
  </div>;
};

const Text:React.FC<{children:React.ReactNode;size?:number;muted?:boolean;style?:React.CSSProperties}> = ({children,size=30,muted=false,style={}})=><div data-glass-text style={{fontSize:size,lineHeight:1.32,fontWeight:muted?400:700,color:muted?'#dae6f0':'#fbfdff',letterSpacing:.4,textShadow:'0 2px 8px #0514225e',...style}}>{children}</div>;
const Reveal:React.FC<{f:number;delay?:number;children:React.ReactNode}> = ({f,delay=12,children})=><div style={{opacity:mix(f,delay,delay+9),transform:`translateY(${(1-mix(f,delay,delay+12))*7}px)`}}>{children}</div>;
const tint=(hex:string,white=.58)=>'#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-white)+255*white).toString(16).padStart(2,'0')).join('');
const Badge:React.FC<{accent:string;children:React.ReactNode;size?:number}> = ({accent,children,size=54})=><div data-glass-label style={{width:size,height:size,boxSizing:'border-box',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',background:`linear-gradient(145deg,${rgba(accent,.22)},${rgba(accent,.065)})`,border:`1px solid ${rgba(tint(accent,.55),.38)}`,boxShadow:'inset 0 1px 2px #ffffff1c',color:tint(accent,.75),fontSize:size*.43,fontWeight:700}}>{children}</div>;

type TextBlock={lines:string[];width:number;height:number;size:number;weight:number;lineHeight:number};
let measureContext:CanvasRenderingContext2D|null=null;
/** 使用已经加载的实际字面测宽；框体由最长行、行数和统一内距决定。 */
function fitBlock(text:string,size:number,maxWidth=660,weight=700):TextBlock{
  if(!document.fonts.check(`${weight} ${size}px GlassCN`))throw Error('中文字体尚未加载，不能计算文本框尺寸');
  measureContext??=document.createElement('canvas').getContext('2d');
  if(!measureContext)throw Error('文字测量不可用');
  measureContext.font=`${weight} ${size}px GlassCN`;
  const width=(line:string)=>measureContext!.measureText(line).width+Math.max(0,Array.from(line).length-1)*.4;
  const lines:string[]=[];
  for(const paragraph of text.split('\n')){
    let line='';
    for(const char of Array.from(paragraph)){
      if(line&&width(line+char)>maxWidth){lines.push(line.trimEnd());line=char.trimStart();}else line+=char;
    }
    if(line||!paragraph)lines.push(line);
  }
  const lineHeight=weight===700?1.25:1.35;
  return {lines,width:Math.ceil(Math.max(0,...lines.map(width)))+2,height:Math.ceil(lines.length*size*lineHeight),size,weight,lineHeight};
}
const BlockText:React.FC<{block:TextBlock;accent:string;highlight?:string;muted?:boolean}>=({block,accent,highlight,muted=false})=><Text size={block.size} muted={muted} style={{width:block.width,height:block.height,lineHeight:block.lineHeight,fontWeight:block.weight,color:muted?'#dce8f2':'#f9fcff'}}>{block.lines.map((line,i)=><span key={i} style={{display:'block',whiteSpace:'pre'}}>{highlight&&line.includes(highlight)?line.split(highlight).map((part,j)=><React.Fragment key={j}>{j>0&&<span style={{color:tint(accent,.63)}}>{highlight}</span>}{part}</React.Fragment>):line}</span>)}</Text>;

export type GlassContent={title:string;body:string;lines:string[];highlight:string;tag:string;number:string;columns:string[][];icon?:'home'|'check'|'picture';rowSymbols?:('route'|'sun'|'home')[]};
export const samples:Partial<GlassContent>[]=[
 {title:'居住舒适'},
 {title:'核心地段',highlight:'核心'},
 {title:'生活配套'},
 {title:'通勤半径',number:'01'},
 {title:'预算边界',highlight:'预算'},
 {title:'地段优先',lines:['户型适配'],highlight:'地段'},
 {title:'住得舒服',highlight:'舒服'},
 {title:'选房逻辑'},
 {lines:['通勤','采光','户型']},
 {title:'居住价值',body:'地段 · 配套',tag:'重点',highlight:'价值'},
 {title:'生活优先'},
 {columns:[['地段'],['户型'],['预算']]},
 {title:'居住品质'},
 {title:'长期价值'},
 {title:'稳健选择',highlight:'稳健'},
];
const typeColors=[6,4,0,0,1,3,4,5,0,0,5,6,3,6,4];

const KeywordGlyph:React.FC<{kind:'route'|'sun'|'home';color:string}>=({kind,color})=><svg width="27" height="27" viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{kind==='sun'?<><circle cx="16" cy="16" r="6"/>{Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return <path key={i} d={`M${16+Math.cos(a)*10} ${16+Math.sin(a)*10}L${16+Math.cos(a)*13} ${16+Math.sin(a)*13}`}/>;})}</>:kind==='home'?<><path d="m4 14 12-10 12 10M7 13v15h18V13M14 28v-9h5v9"/></>:<><circle cx="7" cy="7" r="3"/><circle cx="25" cy="25" r="3"/><path d="M10 7h10a5 5 0 0 1 0 10H12a4 4 0 0 0 0 8h10"/></>}</svg>;
const SemanticGraphic:React.FC<{kind:'route'|'location'|'home'|'guard';accent:string;frame:number;x:number;y:number;w:number;h:number}>=({kind,accent,frame,x,y,w,h})=>{
 const p=mix(frame,22,52),edge=tint(accent,.48);
 if(kind==='guard')return <div data-glass-illustration style={{position:'absolute',left:x,top:y,width:w,height:h,opacity:mix(frame,16,30)}}><svg width="100%" height="100%" viewBox="0 0 240 200" fill="none"><path d="M120 20 184 48V102C184 145 154 171 120 184 86 171 56 145 56 102V48Z" fill={rgba(accent,.12)} stroke={edge} strokeWidth="3"/><path d="m87 99 23 24 45-53" stroke={edge} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-Math.min(1,Math.max(0,(frame-16)/17))}/><circle cx="120" cy="103" r="53" stroke={rgba(edge,.2)} strokeWidth="1"/></svg></div>;
 return <div data-glass-illustration style={{position:'absolute',left:x,top:y,width:w,height:h,opacity:mix(frame,16,30)}}><svg width="100%" height="100%" viewBox="0 0 240 200" fill="none">
  {kind==='route'?<><rect x="12" y="17" width="216" height="166" rx="23" fill={rgba(accent,.035)} stroke={rgba(edge,.14)}/><path d="M42 18v164M93 18v164M144 18v164M195 18v164M12 60h216M12 110h216M12 160h216" stroke={rgba(edge,.08)}/><path d="M48 147C93 147 69 94 115 94H160Q187 94 187 57" stroke={edge} strokeWidth="4" strokeLinecap="round" strokeDasharray="260" strokeDashoffset={260*(1-p)}/><circle cx="48" cy="147" r="8" fill={accent}/><circle cx="48" cy="147" r="16" stroke={rgba(edge,.3)}/><path d="M187 32c-14 0-24 10-24 24 0 18 24 38 24 38s24-20 24-38c0-14-10-24-24-24Z" fill={rgba(accent,.35)} stroke={edge} strokeWidth="2"/><circle cx="187" cy="55" r="7" fill={edge}/></>:kind==='location'?<><path d="m20 140 100-49 100 49-100 48Z" fill={rgba(accent,.06)} stroke={rgba(edge,.3)}/><path d="m45 140 75-36 75 36-75 36Zm25-12 99 48M95 115l99 48M70 164l99-48M45 152l99-48" stroke={rgba(edge,.14)}/><path d="M120 24c-26 0-45 19-45 44 0 34 45 77 45 77s45-43 45-77c0-25-19-44-45-44Z" fill={rgba(accent,.24)} stroke={edge} strokeWidth="2"/><path d="m99 66 21-18 21 18M105 64v28h30V64M116 92V75h9v17" stroke={edge} strokeWidth="3" strokeLinejoin="round"/><circle cx="120" cy="145" r={8+10*p} fill={rgba(accent,.16)}/></>:<><circle cx="190" cy="39" r="20" fill="#f2d8a82a" stroke="#f2d8a86b"/><path d="m42 92 77-55 77 55" stroke={edge} strokeWidth="5" strokeLinejoin="round"/><path d="M57 82v87h124V82L119 38Z" fill={rgba(accent,.09)} stroke={rgba(edge,.4)} strokeWidth="2"/><rect x="77" y="103" width="36" height="38" rx="3" fill="#f2d8a81c" stroke="#f2d8a88a"/><path d="M95 103v38M77 122h36" stroke="#f2d8a875"/><rect x="133" y="103" width="26" height="66" rx="3" stroke={edge} strokeWidth="2"/><path d="M33 174h174" stroke={rgba(edge,.35)} strokeWidth="2"/><path d="M35 169v-32m0 16c-22 0-23-22-23-22 20-1 23 13 23 13m0 12c21 0 22-22 22-22-20-1-22 13-22 13" stroke="#9ed8bb" strokeWidth="3" strokeLinecap="round"/></>}
 </svg></div>;
};

const Artwork:React.FC<{illustration:KeywordIllustration;frame:number;x:number;y:number;w:number;h:number;accent:string}>=({illustration,frame,x,y,w,h,accent})=>{
 if(illustration.kind==='none')return null;
 if(illustration.kind==='graphic')return <SemanticGraphic kind={illustration.symbol} accent={accent} frame={frame} x={x} y={y} w={w} h={h}/>;
 const src=/^(https?:|data:)/.test(illustration.src)?illustration.src:staticFile(illustration.src);
 return <div data-glass-illustration style={{position:'absolute',left:x,top:y,width:w,height:h,opacity:mix(frame,16,36)}}><Img src={src} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>;
};
const defaultArtwork:Record<number,KeywordIllustration>={3:{kind:'graphic',symbol:'route'},4:{kind:'graphic',symbol:'guard'},5:{kind:'graphic',symbol:'location'},6:{kind:'graphic',symbol:'home'},9:{kind:'graphic',symbol:'home'},12:{kind:'graphic',symbol:'home'},14:{kind:'graphic',symbol:'route'}};

/** 关键词为主体；中型强调框与大型语义卡片混合，辅助图形按文字主题选择。 */
export const FrostedTextBox:React.FC<{variant:number;frame:number;globalFrame?:number;accent?:string;mini?:boolean;staticContent?:boolean;content?:Partial<GlassContent>;animate?:boolean;illustration?:KeywordIllustration;x?:number;y?:number;size?:number}>=({variant,frame,globalFrame=frame,accent:customAccent,mini=false,staticContent=false,content,illustration,x:positionX,y:positionY,size})=>{
  const f=staticContent?90:frame,accent=customAccent??GLASS_COLORS[typeColors[variant]];
  const c={title:'',body:'',lines:[],highlight:'',tag:'',number:'01',columns:[],...samples[variant],...content} as GlassContent;
  const art=illustration??defaultArtwork[variant]??{kind:'none'};
  const sizes=[52,56,52,52,64,56,64,52,48,64,56,52,60,52,64];
  const px=48,py=28,title=fitBlock(c.title,size??sizes[variant],620);
  let w=title.width+px*2,h=title.height+py*2,path:string|undefined,outline=false;
  let children:React.ReactNode;
  const keyword=(left=px,top=py,block=title,highlight=c.highlight)=><div style={{position:'absolute',left,top}}><Reveal f={f}><BlockText block={block} accent={accent} highlight={highlight}/></Reveal></div>;
  if(variant===0||variant===1){
    children=<>{variant===1&&<div style={{position:'absolute',left:0,right:0,top:0,height:3,background:`linear-gradient(90deg,transparent,${accent},#9cddff,transparent)`,boxShadow:`0 2px 12px ${rgba(accent,.35)}`}}/>}{keyword()}</>;
  }else if(variant===2){
    const badgeSize=64;w=title.width+badgeSize+22+64;h=Math.max(h,badgeSize+44);
    children=<><div style={{position:'absolute',left:24,top:(h-badgeSize)/2}}><Badge accent={accent} size={badgeSize}>{content&&!c.icon?<span style={{fontSize:25,letterSpacing:1}}>···</span>:<Icon kind={c.icon??'home'} size={30} color={tint(accent,.72)}/>}</Badge></div>{keyword(24+badgeSize+22,(h-title.height)/2)}</>;
  }else if(variant===3){
    w=Math.max(620,title.width+270+104);h=222;
    children=<><div style={{position:'absolute',left:40,top:32}}><Badge accent={accent} size={52}>{c.number}</Badge></div>{keyword(40,112)}<Artwork illustration={art} accent={accent} frame={f} x={w-240} y={22} w={205} h={178}/></>;
  }else if(variant===4){
    w=Math.max(700,title.width+240+160);h=280;
    children=<><div style={{position:'absolute',left:24,top:42,bottom:42,width:5,borderRadius:3,background:accent,boxShadow:`0 0 10px ${rgba(accent,.2)}`}}/>{keyword(58,(h-title.height)/2)}<div style={{position:'absolute',left:60,top:196,width:60*mix(f,27,49),height:2,background:rgba(accent,.65)}}/><Artwork illustration={art} accent={accent} frame={f} x={w-268} y={15} w={238} h={250}/></>;
  }else if(variant===5){
    const second=fitBlock(c.lines[0]??'',42,600),textH=title.height+18+second.height;
    w=Math.max(640,Math.max(title.width,second.width)+330);h=266;
    children=<>{keyword(52,(h-textH)/2)}<div style={{position:'absolute',left:52,top:(h-textH)/2+title.height+18}}><Reveal f={f} delay={25}><BlockText block={second} accent={accent} muted/></Reveal></div><Artwork illustration={art} accent={accent} frame={f} x={w-244} y={28} w={212} h={210}/></>;
  }else if(variant===6){
    w=Math.max(720,title.width+420);h=290;const mainH=h;h+=18;
    path=`M28 1 H${w-28} Q${w-1} 1 ${w-1} 28 V${mainH-28} Q${w-1} ${mainH-1} ${w-28} ${mainH-1} H109 L82 ${h-3} Q76 ${h+1} 76 ${h-9} V${mainH-1} H28 Q1 ${mainH-1} 1 ${mainH-28} V28 Q1 1 28 1 Z`;
    children=<>{keyword(58,(mainH-title.height)/2)}<Artwork illustration={art} accent={accent} frame={f} x={w-300} y={12} w={270} h={266}/></>;
  }else if(variant===7){
    const ribbonW=26,ribbonH=53;w=title.width+px*2+30;
    children=<><svg data-glass-label width={ribbonW} height={ribbonH} style={{position:'absolute',left:24,top:(h-ribbonH)/2}}><defs><linearGradient id="bookmark" x2="1" y2="1"><stop stopColor={tint(accent,.35)}/><stop offset="1" stopColor={accent}/></linearGradient></defs><path d={`M4 1H${ribbonW-4}Q${ribbonW-1} 1 ${ribbonW-1} 4V${ribbonH-2}L${ribbonW/2} ${ribbonH-11} 1 ${ribbonH-2}V4Q1 1 4 1Z`} fill="url(#bookmark)" stroke={tint(accent,.6)} strokeWidth=".8"/></svg>{keyword(76,py)}</>;
  }else if(variant===8){
    const rows=c.lines.map(t=>fitBlock(t,48,500)),contentW=Math.max(...rows.map(b=>b.width));
    w=Math.max(336,contentW+170);h=rows.reduce((n,b)=>n+b.height,0)+(rows.length-1)*16+64;
    const groupW=contentW+46;let top=32;
    children=rows.map((b,i)=>{const y=top;top+=b.height+16;return <div key={i} style={{position:'absolute',left:(w-groupW)/2,top:y}}><Reveal f={f} delay={12+i*13}><div style={{display:'flex',alignItems:'center',gap:19}}>{content&&!c.rowSymbols?.[i]?<div style={{width:27,height:27,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{width:6,height:6,borderRadius:'50%',background:tint(accent,.45)}}/></div>:<KeywordGlyph kind={c.rowSymbols?.[i]??(['route','sun','home'] as const)[i%3]} color={tint(accent,.45)}/>}<BlockText block={b} accent={accent}/></div></Reveal></div>;});
  }else if(variant===9){
    const related=fitBlock(c.body,28,600,400),tag=fitBlock(c.tag,18,100),hasRelated=Boolean(c.body),textH=tag.height+10+20+title.height+(hasRelated?14+related.height:0);
    w=Math.max(730,Math.max(title.width,related.width)+425);h=Math.max(296,textH+72);
    const top=(h-textH)/2;
    children=<><div style={{position:'absolute',left:55,top}}><Reveal f={f}><div data-glass-label style={{padding:'5px 10px',borderRadius:6,boxShadow:`inset 0 0 0 1px ${rgba(accent,.25)}`,background:rgba(accent,.075)}}><BlockText block={tag} accent={accent} muted/></div></Reveal></div>{keyword(54,top+tag.height+30)}{hasRelated&&<div style={{position:'absolute',left:57,top:top+tag.height+30+title.height+14}}><Reveal f={f} delay={24}><BlockText block={related} accent={accent} muted/></Reveal></div>}<Artwork illustration={art} accent={accent} frame={f} x={w-280} y={14} w={254} h={h-28}/></>;
  }else if(variant===10){
    w=title.width+152;h=title.height+62;
    children=<><div style={{position:'absolute',left:28,top:(h-28)/2,width:4,height:28,borderRadius:2,background:accent}}/>{keyword(76,31)}</>;
  }else if(variant===11){
    const columns=c.columns.map(col=>fitBlock(col[0]??'',52,300)),columnW=Math.max(180,Math.max(...columns.map(b=>b.width))+84);
    w=columnW*columns.length;h=Math.max(...columns.map(b=>b.height))+76;
    children=columns.map((b,i)=><div key={i} style={{position:'absolute',left:i*columnW,top:38,width:columnW,height:h-76,borderLeft:i?'1px solid #d6edff2a':undefined}}><div style={{position:'absolute',left:(columnW-b.width)/2,top:0}}><Reveal f={f} delay={12+i*10}><BlockText block={b} accent={accent}/></Reveal></div></div>);
  }else if(variant===12){
    w=Math.max(650,title.width+365);h=242;
    children=<>{keyword(54,(h-title.height)/2)}<Artwork illustration={art} accent={accent} frame={f} x={w-244} y={18} w={218} h={206}/></>;
  }else if(variant===13){
    outline=true;w=title.width+108;h=title.height+60;children=keyword(54,30);
  }else{
    const cut=25;w=Math.max(740,title.width+436);h=284;
    path=`M${cut+12} 1H${w-13}Q${w+2} 1 ${w-4} 15L${w-cut-2} ${h-12}Q${w-cut-7} ${h-1} ${w-cut-18} ${h-1}H14Q-1 ${h-1} 5 ${h-16}L${cut+1} 13Q${cut+5} 1 ${cut+12} 1Z`;
    children=<>{keyword(65,(h-title.height)/2)}<div style={{position:'absolute',left:68,top:198,opacity:mix(f,42,56)}}><svg width="29" height="29" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill={rgba(accent,.12)} stroke={rgba(accent,.4)}/><path d="m9 16 5 5 10-11" fill="none" stroke={tint(accent,.6)} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div><Artwork illustration={art} accent={accent} frame={f} x={w-280} y={14} w={238} h={256}/></>;
  }
  if(art.kind==='none'&&defaultArtwork[variant]){
    w=title.width+px*2;h=title.height+py*2;path=undefined;
    children=keyword();
    if(variant===3){const bs=52;w+=bs+22;h=Math.max(h,bs+40);children=<><div style={{position:'absolute',left:24,top:(h-bs)/2}}><Badge accent={accent} size={bs}>{c.number}</Badge></div>{keyword(24+bs+22,(h-title.height)/2)}</>;}
    if(variant===4)children=<><div style={{position:'absolute',left:20,top:30,bottom:30,width:4,borderRadius:3,background:accent}}/>{keyword()}</>;
    if(variant===5){const second=fitBlock(c.lines[0]??'',42,600),ch=title.height+18+second.height;w=Math.max(title.width,second.width)+px*2;h=ch+py*2;children=<>{keyword((w-title.width)/2,py)}<div style={{position:'absolute',left:(w-second.width)/2,top:py+title.height+18}}><Reveal f={f} delay={25}><BlockText block={second} accent={accent} muted/></Reveal></div></>;}
    if(variant===6){const mh=h;h+=18;path=`M24 1H${w-24}Q${w-1} 1 ${w-1} 24V${mh-24}Q${w-1} ${mh-1} ${w-24} ${mh-1}H100L75 ${h-2}V${mh-1}H24Q1 ${mh-1} 1 ${mh-24}V24Q1 1 24 1Z`;}
    if(variant===9){const tag=c.tag?fitBlock(c.tag,18,200):null,body=c.body?fitBlock(c.body,28,600,400):null;const th=tag?tag.height+30:0,bh=body?body.height+14:0;w=Math.max(title.width,tag?tag.width+20:0,body?body.width:0)+px*2;h=title.height+th+bh+py*2;children=<>{tag&&<div style={{position:'absolute',left:px,top:py}}><Reveal f={f}><BlockText block={tag} accent={accent} muted/></Reveal></div>}{keyword(px,py+th)}{body&&<div style={{position:'absolute',left:px,top:py+th+title.height+14}}><Reveal f={f} delay={24}><BlockText block={body} accent={accent} muted/></Reveal></div>}</>;}
    if(variant===14){w=title.width+132;const cut=25;path=`M${cut+12} 1H${w-13}Q${w+2} 1 ${w-4} 15L${w-cut-2} ${h-12}Q${w-cut-7} ${h-1} ${w-cut-18} ${h-1}H14Q-1 ${h-1} 5 ${h-16}L${cut+1} 13Q${cut+5} 1 ${cut+12} 1Z`;children=keyword(66,py);}
  }
  w=Math.ceil(w);h=Math.ceil(h);
  const x=positionX??(1280-w)/2,y=positionY??(variant===10?468:(720-h)/2);
  const scale=mini?Math.min(184/w,72/h):1;
  const miniStyle:React.CSSProperties|undefined=mini?{position:'absolute',transform:`translate(${(214-w*scale)/2-x*scale}px,${(88-h*scale)/2-y*scale}px) scale(${scale})`,transformOrigin:'0 0'}:undefined;
  return <div style={miniStyle}><Panel x={x} y={y} w={w} h={h} frame={globalFrame} accent={accent} mini={mini} path={path} outline={outline} sweep={variant===14?mix(f,14,51):-1}>{children}</Panel></div>;
};

export function animationStyle(f:number,motion:Motion,duration:number):React.CSSProperties{
  const enter=spring({frame:f,fps:30,config:{damping:motion==='pop'?15:22,stiffness:180,mass:.8},durationInFrames:28});
  const out=mix(f,duration-17,duration-1),p=1-enter;
  const x=motion==='left'?-65*p:motion==='right'?65*p:0;
  const y=motion==='rise'?28*p:motion==='float'?Math.sin(f/18)*5:0;
  const scale=motion==='pop'?.84+.16*enter:1;
  return {opacity:mix(f,0,8)*(1-out),transform:`translate(${x}px,${y-out*9}px) scale(${scale})`,filter:motion==='focus'?`blur(${(1-mix(f,0,23))*13}px)`:undefined,transformOrigin:'640px 355px'};
}

const Header:React.FC<{eyebrow:string;title:string;subtitle?:string;right?:string}> = ({eyebrow,title,subtitle,right})=><>
  <div style={{position:'absolute',left:73,top:46,color:'#a8d6f4',fontSize:15,letterSpacing:3,fontWeight:700}}>{eyebrow}</div>
  <div style={{position:'absolute',left:72,top:83,fontSize:43,fontWeight:700,letterSpacing:1}}>{title}</div>
  {subtitle&&<div style={{position:'absolute',left:74,top:153,fontSize:20,color:'#b9cbdc'}}>{subtitle}</div>}
  {right&&<div style={{position:'absolute',right:74,top:52,padding:'8px 16px',border:'1px solid #8cb6d34d',borderRadius:30,fontSize:17,color:'#c6e2f7'}}>{right}</div>}
</>;

const MiniCard:React.FC<{variant:number;frame:number}> = ({variant,frame})=><div style={{position:'absolute',left:0,top:35,width:214,height:88}}><FrostedTextBox variant={variant} frame={90} globalFrame={frame} mini staticContent/></div>;

const Overview:React.FC<{frame:number;ending?:boolean}> = ({frame,ending=false})=><>
  <Header eyebrow="KEYWORD GLASS / COMPONENTS" title={ending?'15 款框型，逐款挑选':'磨砂玻璃文本框'} subtitle={ending?'按编号反馈，即可调整你选中的组件。':'15 款框型  ·  7 组配色  ·  6 种动效'} right={ending?'合集审查':'组件样式预览'}/>
  {GLASS_NAMES.map((name,i)=>{const x=73+(i%5)*230,y=220+Math.floor(i/5)*142;return <div key={name} style={{position:'absolute',left:x,top:y,width:214,height:128,opacity:ending?1:mix(frame,i*2,15+i*2),transform:`translateY(${ending?0:(1-mix(frame,i*2,15+i*2))*12}px)`,background:'#799fc410',border:'1px solid #94c8e427',borderRadius:13}}><div style={{position:'absolute',left:12,top:10,fontSize:15,fontWeight:700,color:'#e9f5ff'}}><span style={{color:'#8fd6ff',marginRight:8}}>{String(i+1).padStart(2,'0')}</span>{name}</div><MiniCard variant={i} frame={frame}/></div>;})}
</>;

export const TypeScene:React.FC<{variant:number;frame:number;globalFrame:number;Card?:React.ComponentType<any>}> = ({variant,frame,globalFrame,Card=FrostedTextBox})=><>
  <Header eyebrow="KEYWORD GLASS / FORM" title={`${String(variant+1).padStart(2,'0')}  ${GLASS_NAMES[variant]}`} subtitle={details[variant][0]} right={`${String(variant+1).padStart(2,'0')} / 15`}/>
  <div style={{position:'absolute',inset:0,...animationStyle(frame,motionByType[variant],135)}}><Card variant={variant} frame={frame} globalFrame={globalFrame} animate={false}/></div>
  <div style={{position:'absolute',left:0,right:0,top:639,display:'flex',justifyContent:'center',gap:8}}>{GLASS_NAMES.map((_,i)=><div key={i} style={{height:3,width:i===variant?26:7,borderRadius:3,background:i===variant?'#a9c5da':i<variant?'#627e92':'#344a5b88'}}/>)}</div>
</>;

const PaletteScene:React.FC<{frame:number;globalFrame:number}> = ({frame,globalFrame})=>{
  const names=['蓝色科技','红色醒目','橙色活力','绿色清新','紫色高级','金色质感','黑白简约'];
  const descriptions=['通用 · 专业','警示 · 重要','强调 · 行动','正向 · 增长','品质 · 科技','高端 · 品质','通用 · 稳重'];
  const blocks=names.map((name,i)=>({title:fitBlock(name,22,180),body:fitBlock(descriptions[i],17,180,400)}));
  const widths=blocks.map(b=>Math.max(b.title.width,b.body.width)+40),spacing=22;
  const total=widths.reduce((sum,w)=>sum+w,0)+spacing*6;
  let left=(1280-total)/2;
  return <><Header eyebrow="FROSTED GLASS / COLOR" title="同一种材质，七种表达" subtitle="文字与强调色协调，标签与框体一起适配。" right="配色审查"/>
    {blocks.map((b,i)=>{const x=left,w=widths[i],h=b.title.height+b.body.height+9+42;left+=w+spacing;return <div key={i} style={{opacity:mix(frame,i*5,i*5+12)}}><Panel x={x} y={(720-h)/2} w={w} h={h} frame={globalFrame} accent={GLASS_COLORS[i]}><div style={{position:'absolute',inset:0,background:`linear-gradient(125deg,${rgba(GLASS_COLORS[i],.4)},${rgba(GLASS_COLORS[i],.05)})`}}/><div style={{position:'absolute',left:0,top:0,bottom:0,width:5,background:GLASS_COLORS[i]}}/><div style={{position:'absolute',left:20,top:21}}><BlockText block={b.title} accent={GLASS_COLORS[i]} highlight={names[i]}/><div style={{marginTop:9}}><BlockText block={b.body} accent={GLASS_COLORS[i]} muted/></div></div></Panel></div>;})}
  </>;
};

const MotionsScene:React.FC<{frame:number;globalFrame:number}> = ({frame,globalFrame})=>{
  const modes:Motion[]=['rise','pop','left','focus','sweep','float'];
  const block=fitBlock('核心地段',32,314);
  return <><Header eyebrow="FROSTED GLASS / MOTION" title="六种动效，完整看一遍" subtitle="进入、停留、退出；第二轮会自动重播。" right="动效审查"/>
    {['淡入上滑','缩放弹出','左右滑入','模糊转清晰','掠光扫过','轻微浮动'].map((name,i)=>{const col=i%3,row=Math.floor(i/3),x=74+col*384,y=234+row*201;const f=(frame+135)%135,mode=i===2&&frame>=135?'right':modes[i];return <div key={name} style={{position:'absolute',left:x,top:y,width:362,height:179}}><div style={{position:'absolute',left:0,top:0,fontSize:20,fontWeight:700,color:'#d6ebfa'}}><span style={{color:'#80d0ff',marginRight:12}}>{String(i+1).padStart(2,'0')}</span>{name}</div><div style={{position:'absolute',top:50,left:0,width:block.width+44,height:block.height+44,...animationStyle(f,mode,135),transformOrigin:'181px 45px'}}><Panel x={0} y={0} w={block.width+44} h={block.height+44} frame={globalFrame} mini sweep={mode==='sweep'?mix(f,14,55):-1}><div style={{position:'absolute',left:22,top:22}}><BlockText block={block} accent={GLASS_COLORS[0]} highlight="核心"/></div></Panel></div></div>;})}
  </>;
};

export function useGlassAudit(ready:boolean,frame:number){
  useLayoutEffect(()=>{
    if(!ready)return;
    const errors:string[]=[];

    const opacity=(n:Element)=>{let result=1;for(let p:Element|null=n;p&&p!==document.body;p=p.parentElement)result*=Number(getComputedStyle(p).opacity);return result;};
    document.querySelectorAll<HTMLElement>('[data-glass-card]').forEach(card=>{
      if(opacity(card)<.01)return;
      const b=card.getBoundingClientRect(),scale=b.width/card.offsetWidth,padding=8*scale;
      const labels=Array.from(card.querySelectorAll<HTMLElement>('[data-glass-label],[data-glass-illustration]'));
      for(const label of labels){const r=label.getBoundingClientRect();if(r.left<b.left+padding-1||r.right>b.right-padding+1||r.top<b.top+padding-1||r.bottom>b.bottom-padding+1)errors.push('标签或说明图形超出框体内距');}
      card.querySelectorAll<HTMLElement>('[data-glass-text]').forEach(node=>{
        if(opacity(node)<.01)return;
        const range=document.createRange();range.selectNodeContents(node);const r=range.getBoundingClientRect();
        if(r.left<b.left+padding-1||r.right>b.right-padding+1||r.top<b.top+padding-1||r.bottom>b.bottom-padding+1)errors.push((node.textContent??'')+'超出文本框内距');
        if(node.scrollWidth>node.clientWidth+1)errors.push((node.textContent??'')+'文字横向溢出');
        for(const label of labels){if(label.contains(node))continue;const l=label.getBoundingClientRect();if(r.left<l.right-1&&r.right>l.left+1&&r.top<l.bottom-1&&r.bottom>l.top+1)errors.push((node.textContent??'')+'与标签或说明图形重叠');}
      });
    });
    if(errors.length)cancelRender(new Error(errors.join('；')));
  },[frame,ready]);
}

export const FrostedTextSizingCheck:React.FC<{variant:number;sample:'short'|'long'}>=({variant,sample})=>{
  const ready=useGlassFonts();useGlassAudit(ready,70);
  const content:Partial<GlassContent>=sample==='short'?{title:'通勤',body:'',highlight:''}:{title:'居住舒适程度',body:'',highlight:'舒适'};
  return <AbsoluteFill style={{background:'#081522',fontFamily:'GlassCN',color:'#f7fbff'}}><div data-glass-scene style={{position:'absolute',width:1280,height:720,transform:'scale(1.5)',transformOrigin:'0 0'}}><SceneBackground frame={0}/>{ready&&<><Header eyebrow="FROSTED GLASS / FIT" title={`${String(variant+1).padStart(2,'0')} ${GLASS_NAMES[variant]}`} subtitle={sample==='short'?'两字关键词':'六字关键词'}/><FrostedTextBox variant={variant} frame={70} content={content}/></>}</div></AbsoluteFill>;
};

export const FrostedTextCollection:React.FC=()=>{
  const frame=useCurrentFrame(),ready=useGlassFonts();
  useGlassAudit(ready,frame);
  let content:React.ReactNode;
  const typesEnd=105+15*135,paletteEnd=typesEnd+180,motionsEnd=paletteEnd+270;
  if(frame<105)content=<Overview frame={frame}/>;
  else if(frame<typesEnd){const local=frame-105,variant=Math.floor(local/135);content=<TypeScene variant={variant} frame={local%135} globalFrame={frame}/>;}
  else if(frame<paletteEnd)content=<PaletteScene frame={frame-typesEnd} globalFrame={frame}/>;
  else if(frame<motionsEnd)content=<MotionsScene frame={frame-paletteEnd} globalFrame={frame}/>;
  else content=<Overview frame={frame-motionsEnd} ending/>;
  return <AbsoluteFill style={{background:'#081522',fontFamily:'GlassCN',color:'#f7fbff'}}><div data-glass-scene style={{position:'absolute',width:1280,height:720,transform:'scale(1.5)',transformOrigin:'0 0',overflow:'hidden'}}><SceneBackground frame={frame}/>{ready?content:null}</div></AbsoluteFill>;
};
