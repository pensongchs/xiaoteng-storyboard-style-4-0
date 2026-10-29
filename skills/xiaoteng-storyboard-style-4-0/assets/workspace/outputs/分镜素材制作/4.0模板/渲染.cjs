const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {S,TEMPLATE,BASE,PROJECT,ROOT,F,sha,json,resolveBase,demand,runtimeCheck,readContract}=require('./检查/公共.cjs');
const {bundle}=require('@remotion/bundler');const {getCompositions,openBrowser,renderMedia,renderStill}=require('@remotion/renderer');
const {PNG}=require('pngjs');const {attachStableCapture}=require('./检查/稳定采集.cjs');
const PYTHON=require('./检查/公共.cjs').pythonExecutable();
const withProps=(composition,inputProps={})=>({...composition,props:{...composition.props,...inputProps,auditLayout:true}});
function mediaCheck(v,dir){
 const file=path.join(dir,v.file),meta=jsonProbe(file),video=meta.streams.find(s=>s.codec_type==='video');
 demand(video&&video.width===S.output.width&&video.height===S.output.height&&video.r_frame_rate==='30/1'&&Number(video.nb_read_frames)===v.durationFrames,'规格或总帧数不符：'+v.file);demand(!meta.streams.some(s=>s.codec_type==='audio'),'成片含有音轨：'+v.file);
 const result=cp.spawnSync('ffmpeg',['-hide_banner','-i',file,'-vf','blackdetect=d=0.1:pix_th=0.02:pic_th=0.98','-an','-f','null','-'],{encoding:'utf8',maxBuffer:3e6});demand(result.status===0&&!result.stderr.includes('black_start:'),'解码或黑帧检查不通过：'+v.file);return {file:v.file,frames:v.durationFrames,sha256:sha(file),decode:true,blackFrames:0,audio:false};
}
function jsonProbe(file){return JSON.parse(cp.execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',file],{encoding:'utf8'}));}
function compare(reference,actual){
 const a=PNG.sync.read(fs.readFileSync(reference)),b=PNG.sync.read(fs.readFileSync(actual));demand(a.width===b.width&&a.height===b.height,'基准画面尺寸不同');let total=0,peak=0;
 for(let gy=0;gy<36;gy++)for(let gx=0;gx<64;gx++){let sum=0;for(let y=gy*30;y<(gy+1)*30;y++)for(let x=gx*30;x<(gx+1)*30;x++){const at=(y*a.width+x)*4;for(let k=0;k<3;k++)sum+=Math.abs(a.data[at+k]-b.data[at+k]);}const mean=sum/(30*30*3);peak=Math.max(peak,mean);total+=sum;}
 const mean=total/(a.width*a.height*3);demand(mean<1.6&&peak<16,`画面与最终成片不同：mean=${mean.toFixed(3)} peak=${peak.toFixed(3)}`);return {mean,peak};
}
async function open(c){
 runtimeCheck();fs.mkdirSync(c.internalDir,{recursive:true});const config=path.join(c.internalDir,'类型检查配置-'+process.pid+'.json');fs.writeFileSync(config,JSON.stringify({extends:path.join(PROJECT,'tsconfig.json'),include:[c.entryPoint]},null,2));try{cp.execFileSync(process.execPath,[path.join(path.dirname(require.resolve('typescript/package.json')),'bin/tsc'),'--project',config],{stdio:'inherit'});}finally{fs.unlinkSync(config);}const url=await bundle({entryPoint:c.entryPoint,publicDir:path.join(PROJECT,'public'),onProgress:()=>{}});
 const browser=await require('./检查/浏览器.cjs').open();
 const comps=await getCompositions(url,{puppeteerInstance:browser,logLevel:'error'});
 for(const v of c.videos){const comp=comps.find(x=>x.id===v.id);demand(comp&&comp.width===S.output.width&&comp.height===S.output.height&&comp.fps===S.output.fps&&comp.durationInFrames===v.durationFrames,'合成入口与真实时间码不符：'+v.id);}
 return {url,browser,comps};
}
async function render(c,selected,{review=true}={}){
 fs.mkdirSync(c.outputDir,{recursive:true});fs.mkdirSync(c.internalDir,{recursive:true});
 const parts=selected?.length?c.videos.filter(v=>selected.includes(v.id)):c.videos;demand(parts.length=== (selected?.length||c.videos.length),'请求的段落ID不存在');
 const {url,browser,comps}=await open(c),reference=path.join(c.internalDir,'逐帧参考.ndjson');
 const stats=attachStableCapture(browser,{referenceFile:reference,replacingParts:parts.map(v=>v.id)}),errors=[];let last=Date.now();
 try{for(const v of parts){stats.startPart(v);await renderMedia({serveUrl:url,composition:withProps(comps.find(x=>x.id===v.id),v.inputProps),inputProps:{...v.inputProps,auditLayout:true},outputLocation:path.join(c.outputDir,v.file),codec:S.output.codec,crf:S.output.crf,pixelFormat:S.output.pixelFormat,imageFormat:S.output.imageFormat,x264Preset:'fast',concurrency:S.output.concurrency,muted:true,enforceAudioTrack:false,puppeteerInstance:browser,logLevel:'error',onBrowserLog:log=>{if(log.text?.startsWith('SIX_LAYOUT ')){const item=JSON.parse(log.text.slice(11));if(item.errors.length)errors.push(item);}},onProgress:({progress})=>{if(Date.now()-last>20000){console.log(v.name,Math.round(progress*100)+'%');last=Date.now();}}});demand(!errors.length,'排版/线框间距检查失败：'+JSON.stringify(errors.slice(0,3)));console.log('已完整输出',v.name);}}
 finally{stats.totalVerifiedFrames=stats.verifiedFrames+stats.retainedVerifiedFrames;fs.writeFileSync(path.join(c.internalDir,'画面合成检查.json'),JSON.stringify(stats,null,2));await browser.close({silent:true});}
 demand(!stats.failedFrames&&stats.requiredIdenticalCaptures===S.guards.identicalCaptures,'画面一致性未通过');
 if(!c.reference){
  const normalize=s=>s.replace(/[，,\s]+/g,' ').trim(),seen=new Map();
  for(const line of fs.readFileSync(reference,'utf8').split('\n').filter(Boolean)){const row=JSON.parse(line),v=c.videos.find(v=>v.id===row.part);if(!v)continue;const g=row.frame+F(v.startMs);for(const t of row.texts){const text=normalize(t.key.slice(t.key.indexOf('|')+1));if(!seen.has(text))seen.set(text,[]);seen.get(text).push(g);}}
  for(const scene of c.scenes.filter(s=>parts.some(v=>s.startMs>=v.startMs&&s.endMs<=v.endMs))){
   const frames=text=>(seen.get(normalize(text))??[]).filter(g=>g>=F(scene.startMs)&&g<F(scene.endMs));
   for(const text of scene.screenText)demand(frames(text).length,'屏显文字未在规定镜头出现：'+text);
   for(const beat of scene.beats??[]){if(!beat.text)continue;const list=frames(beat.text);demand(list.length&&Math.min(...list)>=F(beat.atMs),'文字提前出现或未出现：'+beat.text);if(beat.untilMs!==undefined)demand(Math.max(...list)<=F(beat.untilMs),'文字超出停留/退出边界：'+beat.text);}
  }
 }
 const partsFile=path.join(c.internalDir,'段落时间表.json');fs.writeFileSync(partsFile,JSON.stringify(parts,null,2));
 const stabilityFile=path.join(c.internalDir,'连续性检查.json');cp.execFileSync(PYTHON,[path.join(TEMPLATE,'检查/成片连续性.py'),partsFile,reference,c.outputDir,stabilityFile],{stdio:'inherit'});
 const checked=parts.map(v=>mediaCheck(v,c.outputDir));
 // 更新同一期的部分段落时，未改段落必须与本次之前的已验证hash一致。
 const resultFile=path.join(c.internalDir,'检查结果.json'),old=fs.existsSync(resultFile)?json(resultFile):null;
 for(const v of c.videos.filter(v=>!parts.includes(v))){const oldVideo=old?.videos?.find(x=>x.file===v.file);demand(oldVideo&&sha(path.join(c.outputDir,v.file))===oldVideo.sha256,'未重渲染段落缺少可核验的最终记录：'+v.file);checked.push(oldVideo);}
 const library=require('./检查/动效库.cjs').verifyLibrary(c,reference,S.library.minimumDistinct);
 const compositionRules=require('./检查/轮播与转场.cjs').verify(c,reference);
 fs.writeFileSync(path.join(c.internalDir,'轮播与转场检查.json'),JSON.stringify(compositionRules,null,2));
 fs.writeFileSync(resultFile,JSON.stringify({title:c.title,styleId:S.id,passed:true,sourceClock:'ceil(ms*(30/1000))',fonts:S.fonts,layoutErrors:errors,videos:c.videos.map(v=>checked.find(x=>x.file===v.file)),stability:json(stabilityFile),library,userAcceptance:false},null,2));
 if(review)await require('./检查/本地审片.cjs').loadReview(c);
 return checked;
}
async function main(){const [mode,file,...ids]=process.argv.slice(2);
 if(mode==='check'){runtimeCheck();const c=readContract(file);console.log('契约通过',c.title,c.videos.length+'段');return;}
 if(mode==='render'){const c=readContract(file);await render(c,ids);console.log('已完成并载入本机审片台');return;}
 throw new Error('用法：渲染.cjs check|render 契约.json [合成ID...]');}
module.exports={withProps,render,mediaCheck,compare,open};
if(require.main===module)main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
