import React,{useLayoutEffect,useRef,useReducer} from 'react';
import {Sequence,interpolate} from 'remotion';
import {Style40Frame,useSourceFrame40} from '../../4.0模板/组件/Stage40';
import {Heading40,F,textStyle,p} from '../../4.0模板/组件/Style40';
import {Selector004,Electric035,Focus049} from '../../4.0模板/组件/LibraryContent40';
import {Capsule} from '../../4.0模板/自制动效组件/S001_基础磨砂系列/Z001_磨砂短句标签/源码/组件';
import {PearlCard} from '../../4.0模板/自制动效组件/S001_基础磨砂系列/Z002_磨砂信息卡/源码/组件';
import {Z004} from '../../4.0模板/自制动效组件/S002_玻璃关键词系列/Z004_基础关键词框/源码/组件';
import {Z005} from '../../4.0模板/自制动效组件/S002_玻璃关键词系列/Z005_渐变重点框/源码/组件';
import {Z008} from '../../4.0模板/自制动效组件/S002_玻璃关键词系列/Z008_侧标强调框/源码/组件';
import {Z011} from '../../4.0模板/自制动效组件/S002_玻璃关键词系列/Z011_书签关键词框/源码/组件';
import {Z014} from '../../4.0模板/自制动效组件/S002_玻璃关键词系列/Z014_底部关键词条/源码/组件';
import {Z016} from '../../4.0模板/自制动效组件/S002_玻璃关键词系列/Z016_图片关键词框/源码/组件';
import type {KeywordCardProps} from '../../4.0模板/自制动效组件/S002_玻璃关键词系列/公共/源码/调用接口';
import data from './StudentDemoData.json';
import {SceneTransitions40,CarouselCaption40} from '../../4.0模板/组件/StudentExtras40';

type Unit=typeof data.units[number];
const C={white:'#F8FAFC',gold:'#f2bd72',green:'#91cbb2',red:'#f7a18d',dim:'#d4d3cc'};
const cards:Record<string,React.ComponentType<KeywordCardProps>>={Z004,Z005,Z008,Z011,Z014,Z016};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

/** 将归档卡片接入4.0字面和排版检查，保留归档实现及原始动作。 */
const SelfAuditBridge=({g,children}:{g:number;children:React.ReactNode})=>{
 const ref=useRef<HTMLDivElement>(null),[,update]=useReducer((v:number)=>v+1,0);
 const mark=()=>ref.current?.querySelectorAll<HTMLElement>('[data-self-unit]').forEach(unit=>{
  unit.querySelectorAll<HTMLElement>('[data-glass-card]').forEach(n=>n.dataset.textbox='self-'+unit.dataset.selfUnit);
  unit.querySelectorAll<HTMLElement>('[data-glass-text],[data-safe-text]').forEach(n=>n.dataset.safeText='self-'+unit.dataset.selfUnit);
 });
 useLayoutEffect(()=>{mark();},[g]);
 useLayoutEffect(()=>{const node=ref.current;if(!node)return;const observer=new MutationObserver(()=>{mark();update();});observer.observe(node,{childList:true,subtree:true});mark();return()=>observer.disconnect();},[]);
 return <div ref={ref} style={{position:'absolute',inset:0}}><style>{'[data-self-unit] [data-glass-text],[data-self-unit] [data-glass-label]{font-family:BFBody!important}'}</style>{children}</div>;
};

const SelfUnit=({g,u}:{g:number;u:Unit})=>{
 if(g<F(u.atMs)||g>=F(u.endMs))return null;
 const age=g-F(u.atMs),content=u.content;
 let node:React.ReactNode;
 if(u.component==='Z001')node=<Capsule g={g} at={u.atMs} label={content.title} x={u.x} y={u.y} w={u.w??600} size={u.size} hue={u.hue??2} form={u.id==='S05'?'ribbon':'tile'}/>;
 else if(u.component==='Z002')node=<PearlCard g={g} at={u.atMs} x={u.x} y={u.y} w={u.w??510} h={u.h??220} title={content.title} body={content.body} hue={u.hue??2}/>;
 else{const Card=cards[u.component];if(!Card)throw Error('组件编号不存在：'+u.component);
  node=<Card frame={age} durationInFrames={F(u.endMs)-F(u.atMs)+17} content={content} x={u.x} y={u.y} size={u.size} accent={u.accent??C.dim} illustration={(u.illustration??{kind:'none'}) as KeywordCardProps['illustration']} assetRoot='系列素材/S002_玻璃关键词系列'/>;
 }
 return <div data-self-unit={u.id} data-self-component={u.component} style={{position:'absolute',inset:0}}>{node}</div>;
};

const Home=({x,y,scale=1,color=C.gold,opacity=1}:{x:number;y:number;scale?:number;color?:string;opacity?:number})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
 <path d="M-68 0 0-53 68 0V92H-68Z" fill="#1b2027" stroke={color} strokeWidth="2"/>
 <path d="M-82 0 0-65 82 0" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
 <rect x="-43" y="21" width="24" height="27" rx="3" fill={color} opacity=".23"/><rect x="19" y="21" width="24" height="27" rx="3" fill={color} opacity=".23"/>
 <rect x="-15" y="51" width="30" height="41" rx="3" fill={color} opacity=".5"/>
</g>;

const Divergence=({g}:{g:number})=>{
 const at=data.mg[0].atMs,q=p(g,at,34),r=p(g,8180,26);if(g<F(at))return null;
 return <svg data-mg-unit="M01" width="1280" height="720" style={{position:'absolute',inset:0}}>
  <defs><marker id="dual-up" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill={C.green}/></marker><marker id="dual-down" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 8 4 0 8Z" fill={C.red}/></marker></defs>
  <ellipse cx="853" cy="612" rx="255" ry="30" fill="#080a0e80"/>
  <Home x={720} y={435-70*q} scale={1.1} color={C.green}/><Home x={1010} y={420+65*r} scale={.9} color={C.red} opacity={.65+.35*r}/>
  <path d="M625 515Q588 390 650 285" fill="none" stroke={C.green} strokeWidth="6" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-q} markerEnd={q>.9?'url(#dual-up)':undefined}/>
  {g>=F(8180)&&<path d="M1060 300Q1152 405 1100 552" fill="none" stroke={C.red} strokeWidth="6" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-r} markerEnd={r>.9?'url(#dual-down)':undefined}/>}
 </svg>;
};

const TradingChart=({g}:{g:number})=>{
 const times=data.times.numbers,values=[-13.2,10.7],colors=[C.red,C.green],zero=850,unit=17;
 return <div data-mg-unit="M02" style={{position:'absolute',inset:0}}>
  {g>=F(19000)&&<svg width="1280" height="720" style={{position:'absolute',inset:0}}>
   {[595,850,1105].map((x,i)=><line key={x} x1={x} x2={x} y1="315" y2="595" stroke={i===1?'#ffffff77':'#ffffff22'} strokeWidth={i===1?2:1} strokeDasharray={i===1?undefined:'3 8'}/>)}
  </svg>}
  {values.map((target,i)=>{
   if(g<F(times[i]))return null;
   const q=interpolate(g,[F(times[i]),F(times[i])+30],[0,1],clamp),amount=target*q,y=330+i*150,color=colors[i];
   return <React.Fragment key={i}>
    <div style={{position:'absolute',left:415,top:y+2,...textStyle(58,color),fontFamily:'Arial',fontWeight:700,letterSpacing:-1}}><span data-safe-text={'metric-'+i}>{(target<0?'-':'+')+(Math.round(Math.abs(amount)*10)/10).toFixed(1)+'%'}</span></div>
    <svg width="1280" height="720" style={{position:'absolute',inset:0}}>
     <rect x="595" y={y+80} width="510" height="26" rx="9" fill="#ffffff0c"/>
     <rect x={Math.min(zero,zero+amount*unit)} y={y+80} width={Math.abs(amount)*unit} height="26" rx="8" fill={color}/>
     <circle cx={zero+amount*unit} cy={y+93} r="6" fill={C.white} stroke={color} strokeWidth="3"/>
     <path d={`M385 ${y+54}H403`} stroke={color} strokeWidth="2"/>
    </svg>
   </React.Fragment>;
  })}
  {g>=F(19000)&&<>{['-15%','0%','+15%'].map((t,i)=><div key={t} style={{position:'absolute',left:[573,834,1076][i],top:605,...textStyle(23,C.dim),fontFamily:'Arial',fontWeight:400}}><span data-safe-text="chart-tick">{t}</span></div>)}<div style={{position:'absolute',left:72,top:650,...textStyle(22,C.dim),fontWeight:400}}><span data-safe-text="chart-source">来源：国家统计局、住房城乡建设部</span></div></>}
 </div>;
};

const Escrow=({g}:{g:number})=>{
 const at=data.mg[2].atMs;if(g<F(at))return null;const q=p(g,at,28),x=270+660*q;
 return <svg data-mg-unit="M03" width="1280" height="720" style={{position:'absolute',inset:0}}>
  <path d="M285 620H930" stroke={C.gold} strokeOpacity=".4" strokeWidth="3" strokeDasharray="5 8"/>
  <g transform="translate(230 601)"><rect width="52" height="38" rx="9" fill="#1b2027" stroke={C.gold}/><circle cx="26" cy="19" r="10" stroke={C.gold} fill="none" strokeWidth="2"/></g>
  <rect x={x} y="611" width="15" height="15" rx="4" fill={C.gold} opacity={1-.45*q}/>
  <g transform="translate(940 592)"><path d="M0 20 30 0 60 20ZM6 54H54M12 24V48M30 24V48M48 24V48" fill="#1b2027" stroke={C.green} strokeWidth="3" strokeLinecap="round"/><circle cx="71" cy="42" r="17" fill="#172723" stroke={C.green}/><path d="m62 42 6 6 12-13" fill="none" stroke={C.green} strokeWidth="3" strokeDasharray="1" pathLength="1" strokeDashoffset={1-q}/></g>
 </svg>;
};


const ChoiceRail=({g}:{g:number})=>{
 const at=data.mg[3].atMs;if(g<F(at))return null;const q=p(g,at,25),r=p(g,data.times.cases,16);
 return <svg data-mg-unit="M05" width="1280" height="720" style={{position:'absolute',inset:0}}>
  <path d="M445 457V485Q445 520 485 520H795Q830 520 830 485V457" fill="none" stroke={C.gold} strokeOpacity=".65" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1-q}/>
  <circle cx="640" cy="520" r={12+9*q} fill="#25231e" stroke={C.gold} strokeWidth="2"/>
  {g>=F(data.times.cases)&&[-1,0,1].map(i=><g key={i} opacity={r}><path d={`M640 541Q640 572 ${640+i*110} 594`} stroke={C.gold} strokeWidth="2" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1-r}/><circle cx={640+i*110} cy="604" r="9" fill={C.gold}/></g>)}
 </svg>;
};

const Content=({g,id}:{g:number;id:string})=><>
 {data.units.filter(u=>u.scene===id).map(u=><SelfUnit key={u.id} g={g} u={u}/>)}
 {id==='opening'&&<Focus049 g={g} times={data.times.focus} labels={['新房','二手房']}/>}
 {id==='division'&&<Divergence g={g}/>}
 {id==='data'&&<TradingChart g={g}/>}
 {id==='activity'&&<Electric035 g={g} at={data.times.electric[0]} secondAt={data.times.electric[1]} x={72} y={365} w={750} h={235} title="二手房" body="交易更活跃"/>}
 {id==='policy'&&<><Selector004 g={g} times={data.times.selector} labels={['有序推进','现房销售','资金监管']} x={72} y={210}/><Escrow g={g}/></>}
 {id==='quality'&&<><CarouselCaption40 g={g} assetRoot={data.assetRoot} items={data.carousel.items}/></>}
 {id==='choice'&&<ChoiceRail g={g}/>}
</>;

export const StudentDemo=()=>{
 const g=useSourceFrame40(0);
 return <>{data.scenes.map((s,i)=><Sequence key={s.id} from={F(s.startMs)} durationInFrames={F(s.endMs)-F(s.startMs)} layout="none">
  <Style40Frame g={g} index={s.index} assetRoot={data.assetRoot} texture="neutral" background={s.id==='quality'?'quality-backdrop.jpg':s.background??undefined} backgroundKind="036">
   <Heading40 g={g} at={s.startMs} label={`${String(i+1).padStart(2,'0')} / 画面为示意`} title={s.heading}/>
   <SelfAuditBridge g={g}><Content g={g} id={s.id}/></SelfAuditBridge>
  </Style40Frame>
 </Sequence>)}<SceneTransitions40 g={g} transitions={data.transitions}/></>;
};
