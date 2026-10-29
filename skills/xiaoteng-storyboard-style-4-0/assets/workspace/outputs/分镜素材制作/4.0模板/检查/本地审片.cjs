const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),net=require('node:net'),crypto=require('node:crypto');
const BASE=path.resolve(__dirname,'../..'),ROOT=path.resolve(BASE,'../..');
const identity=crypto.createHash('sha256').update(ROOT).digest('hex');
const matches=async port=>{try{const r=await fetch(`http://127.0.0.1:${port}/__review_identity`,{signal:AbortSignal.timeout(800)});return r.ok&&(await r.json()).id===identity;}catch{return false;}};
const free=port=>new Promise(resolve=>{const s=net.createServer();s.once('error',()=>resolve(false));s.listen(port,'127.0.0.1',()=>s.close(()=>resolve(true)));});
async function ensureService(){
 const ports=process.env.REVIEW_PORT?[Number(process.env.REVIEW_PORT)]:Array.from({length:13},(_,i)=>4328+i);
 for(const port of ports){if(await matches(port))return `http://127.0.0.1:${port}/`;if(!await free(port))continue;
  const dir=path.join(ROOT,'.runtime');fs.mkdirSync(dir,{recursive:true});const log=fs.openSync(path.join(dir,'review.log'),'a');
  const child=cp.spawn(process.execPath,[path.join(path.dirname(require.resolve('vite/package.json')),'bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:BASE,detached:true,stdio:['ignore',log,log]});child.unref();fs.closeSync(log);
  for(let n=0;n<40;n++){await new Promise(r=>setTimeout(r,250));if(await matches(port))return `http://127.0.0.1:${port}/`;}
 }throw Error('本地审片服务未启动，请查看工程.runtime/review.log');
}
function show(url){if(process.env.NO_OPEN==='1')return;const command=process.platform==='darwin'?['open',[url]]:process.platform==='win32'?['cmd',['/c','start','',url]]:['xdg-open',[url]];cp.spawn(command[0],command[1],{detached:true,stdio:'ignore'}).unref();}
async function loadReview(c){
 const videos=c.videos.map(v=>path.join(c.outputDir,v.file));
 cp.execFileSync(process.execPath,[path.join(BASE,'scripts/create-review-session.mjs'),...videos,'--title',c.title],{cwd:BASE,stdio:'inherit'});
 const url=await ensureService();let manifest;
 for(let n=0;n<20;n++){const response=await fetch(url+'review-sessions/current.json?v='+Date.now(),{cache:'no-store'});if(response.ok&&response.headers.get('content-type')?.includes('application/json')){const candidate=await response.json();if(candidate.title===c.title&&candidate.videos?.length===videos.length){manifest=candidate;break;}}await new Promise(r=>setTimeout(r,150));}
 if(!manifest)throw Error('审片会话不匹配或尚未载入');
 for(let i=0;i<videos.length;i++){if(manifest.videos[i].sourcePath!==videos[i]||!manifest.videos[i].videoUrl.startsWith('/@fs/'))throw Error('审片必须直接链接原视频');const r=await fetch(new URL(manifest.videos[i].videoUrl,url),{method:'HEAD',cache:'no-store'});if(!r.ok||Number(r.headers.get('content-length'))!==fs.statSync(videos[i]).size)throw Error('审片文件不可读取');}
 const page=url+'?session='+encodeURIComponent(manifest.createdAt);show(page);console.log('本地审片台：'+page);return {url:page,paths:videos};
}
module.exports={ensureService,loadReview,show};
