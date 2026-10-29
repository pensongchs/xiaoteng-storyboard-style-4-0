const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {S,PROJECT,sha,json,demand,runtimeCheck,readContract}=require('./检查/公共.cjs');
const {bundle}=require('@remotion/bundler');
const {getCompositions,renderMedia,makeCancelSignal}=require('@remotion/renderer');
const {resolveTool,chooseConcurrency,renderOptions,systemInfo}=require('../../../scripts/runtime.cjs');
const {createContactSheet}=require('./检查/预览合集.cjs');
const {muxAudio}=require('./检查/音频合成.cjs');
const withProps=(composition,inputProps={})=>({...composition,props:{...composition.props,...inputProps,auditLayout:true}});
function mediaCheck(v,dir,{audioFile}={}){
 const file=path.join(dir,v.file),meta=JSON.parse(cp.execFileSync(resolveTool('ffprobe'),['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8',windowsHide:true})),video=meta.streams.find(s=>s.codec_type==='video');
 demand(video&&video.width===S.output.width&&video.height===S.output.height&&video.r_frame_rate==='30/1'&&Number(video.nb_frames)===v.durationFrames,'规格或总帧数不符：'+v.file);
 const audio=meta.streams.find(s=>s.codec_type==='audio');
 demand(Boolean(audio)===Boolean(audioFile),audioFile?'成片缺少原始声音：'+v.file:'纯画面示例含有音轨：'+v.file);
 if(audio)demand(Math.abs(Number(audio.duration)-v.durationFrames/30)<.12,'音画总时长不符：'+v.file);
 return {file:v.file,frames:v.durationFrames,sha256:sha(file),audio:Boolean(audio),...(audioFile?{audioSourceSha256:sha(audioFile),sourceStartMs:v.sourceStartMs,sourceEndMs:v.sourceEndMs}:{})};
}
async function open(c){
 runtimeCheck();fs.mkdirSync(c.internalDir,{recursive:true});
 const config=path.join(c.internalDir,'类型检查配置-'+process.pid+'.json');
 fs.writeFileSync(config,JSON.stringify({extends:path.join(PROJECT,'tsconfig.json'),include:[c.entryPoint]},null,2));
 try{cp.execFileSync(process.execPath,[path.join(path.dirname(require.resolve('typescript/package.json')),'bin/tsc'),'--project',config],{stdio:'inherit'});}finally{fs.unlinkSync(config);}
 const url=await bundle({entryPoint:c.entryPoint,publicDir:path.join(PROJECT,'public'),onProgress:()=>{}}),browser=await require('./检查/浏览器.cjs').open();
 try{
  const comps=await getCompositions(url,{puppeteerInstance:browser,logLevel:'error'});
  for(const v of c.videos){const comp=comps.find(x=>x.id===v.id);demand(comp&&comp.width===S.output.width&&comp.height===S.output.height&&comp.fps===S.output.fps&&comp.durationInFrames===v.durationFrames,'合成入口与真实时间码不符：'+v.id);}
  return {url,browser,comps};
 }catch(e){await browser.close({silent:true});throw e;}
}
async function render(c,selected,{review=true,concurrency}={}){
 const started=performance.now(),workers=chooseConcurrency(concurrency),system=systemInfo(),timings=[],errors=[];
 console.log('并发：'+workers+'，系统：'+system.platform+'/'+system.arch);
 fs.mkdirSync(c.outputDir,{recursive:true});fs.mkdirSync(c.internalDir,{recursive:true});
 const parts=selected?.length?c.videos.filter(v=>selected.includes(v.id)):c.videos;
 demand(parts.length===(selected?.length||c.videos.length),'请求的段落ID不存在');
 const resultFile=path.join(c.internalDir,'检查结果.json'),old=fs.existsSync(resultFile)?json(resultFile):null,retained=[];
 for(const v of c.videos.filter(v=>!parts.includes(v))){const previous=old?.videos?.find(x=>x.file===v.file);demand(previous&&sha(path.join(c.outputDir,v.file))===previous.sha256,'未重渲染段落缺少对应文件的检查记录：'+v.file);demand(c.audioFile?previous.audioSourceSha256===sha(c.audioFile)&&previous.sourceStartMs===v.sourceStartMs&&previous.sourceEndMs===v.sourceEndMs:!previous.audio,'音频或源时间发生变化，需重渲染该段：'+v.file);retained.push(previous);}
 const {url,browser,comps}=await open(c),prepared=performance.now();let last=Date.now();
 try{for(const v of parts){
  const partStart=performance.now(),{cancel,cancelSignal}=makeCancelSignal();
  try{await renderMedia({serveUrl:url,composition:withProps(comps.find(x=>x.id===v.id),v.inputProps),inputProps:{...v.inputProps,auditLayout:true},outputLocation:path.join(c.outputDir,v.file),codec:S.output.codec,crf:S.output.crf,pixelFormat:S.output.pixelFormat,imageFormat:S.output.imageFormat,x264Preset:'fast',concurrency:workers,muted:true,enforceAudioTrack:false,puppeteerInstance:browser,cancelSignal,logLevel:'error',onBrowserLog:log=>{
   if(log.text?.startsWith('SIX_LAYOUT ')){const item=JSON.parse(log.text.slice(11));if(item.errors.length){errors.push(item);cancel();}}
  },onProgress:({progress})=>{if(Date.now()-last>20000){console.log(v.name,Math.round(progress*100)+'%');last=Date.now();}}});}
  catch(e){if(errors.length)throw Error('排版重叠或文字越框：'+JSON.stringify(errors.slice(0,3)));throw e;}
  timings.push({id:v.id,seconds:Number(((performance.now()-partStart)/1000).toFixed(3))});console.log('已完整输出',v.name);
 }}finally{await browser.close({silent:true});}
 for(const v of parts)muxAudio(c,v);
 const checked=[...parts.map(v=>mediaCheck(v,c.outputDir,c)),...retained],previewSheets=c.videos.map(v=>createContactSheet(c,v));
 fs.writeFileSync(resultFile,JSON.stringify({title:c.title,styleId:S.id,passed:true,sourceClock:'ceil(ms*(30/1000))',fonts:S.fonts,layoutErrors:errors,videos:c.videos.map(v=>checked.find(x=>x.file===v.file)),previewSheets,performance:{system,concurrency:workers,preparationSeconds:Number(((prepared-started)/1000).toFixed(3)),parts:timings,totalSeconds:Number(((performance.now()-started)/1000).toFixed(3))},previewReview:false,userAcceptance:false},null,2));
 if(review)await require('./检查/本地审片.cjs').loadReview(c);
 return checked;
}
async function main(){const [mode,file,...args]=process.argv.slice(2),options=renderOptions(args);
 if(mode==='check'){runtimeCheck();const c=readContract(file);console.log('契约通过',c.title,c.videos.length+'段');return;}
 if(mode==='render'){await render(readContract(file),options.ids,options);console.log('已完成并载入本机审片台');return;}
 throw Error('用法：渲染.cjs check|render 契约.json [合成ID...] [--concurrency=1|2]');
}
module.exports={withProps,render,mediaCheck,open};
if(require.main===module)main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
