const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),resolved=new Map();
const systemInfo=()=>({platform:process.platform,arch:process.arch,node:process.versions.node,cpuThreads:os.availableParallelism?.()||os.cpus().length,totalMemoryGB:Math.round(os.totalmem()/2**30),freeMemoryGB:Math.round(os.freemem()/2**30)});
function dependencyStatus(){
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')),missing=[];
 for(const [name,expected] of Object.entries({...pkg.dependencies,...pkg.devDependencies})){
  try{if(JSON.parse(fs.readFileSync(path.join(root,'node_modules',name,'package.json'),'utf8')).version!==expected)missing.push(name);}catch{missing.push(name);}
 }
 if(!missing.length){
  try{
   const wanted=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8')).packages,installed=JSON.parse(fs.readFileSync(path.join(root,'node_modules/.package-lock.json'),'utf8')).packages;
   const matches=(list,value)=>!list||(!list.includes('!'+value)&&(!list.some(x=>!x.startsWith('!'))||list.includes(value)));
   for(const [key,record]of Object.entries(wanted)){
    if(!key||!matches(record.os,process.platform)||!matches(record.cpu,process.arch)||record.optional&&!installed[key])continue;
    if(record.version!==installed[key]?.version||record.integrity!==installed[key]?.integrity)missing.push(key);
   }
  }catch{missing.push('依赖锁文件状态');}
  try{const file=require('@remotion/renderer').RenderInternals.getExecutablePath({type:'compositor',indent:false,logLevel:'error',binariesDirectory:null});if(!fs.existsSync(file))throw Error();}catch{missing.push('Remotion本机编码器');}
 }
 return missing;
}
function resolveTool(name){
 if(!['ffmpeg','ffprobe'].includes(name))throw Error('未知工具：'+name);
 if(resolved.has(name))return resolved.get(name);
 const override=process.env[name.toUpperCase()+'_PATH'];
 const native=process.platform==='darwin'?['/opt/homebrew/bin/'+name,'/usr/local/bin/'+name]:process.platform==='win32'?[path.join(process.env.LOCALAPPDATA||os.homedir(),'Microsoft/WinGet/Links',name+'.exe'),path.join(process.env.ProgramData||'C:\\ProgramData','chocolatey/bin',name+'.exe')]:['/usr/bin/'+name];
 let bundled;
 try{bundled=require('@remotion/renderer').RenderInternals.getExecutablePath({type:name,indent:false,logLevel:'error',binariesDirectory:null});}catch{}
 for(const candidate of [...new Set(override?[override]:[name,...native,bundled].filter(Boolean))]){
  if(cp.spawnSync(candidate,['-version'],{stdio:'ignore',windowsHide:true}).status===0){resolved.set(name,candidate);return candidate;}
 }
 throw Error(override?'指定的工具不可用：'+override:'缺少可用的'+name+'；请先运行 npm run setup，检查当前系统的 Remotion 依赖是否完整');
}
function chooseConcurrency(requested,info=systemInfo()){
 if(requested!==undefined){const value=Number(requested);if(!Number.isInteger(value)||value<1||value>2)throw Error('并发数只支持 1 或 2');return value;}
 return info.cpuThreads<4||info.totalMemoryGB<=8||info.freeMemoryGB<3?1:2;
}
function renderOptions(args){
 let concurrency;
 const ids=[];
 for(const arg of args){
  if(arg.startsWith('--concurrency='))concurrency=arg.slice(14);
  else if(arg.startsWith('--'))throw Error('未知渲染选项：'+arg);
  else ids.push(arg);
 }
 return {ids,concurrency:chooseConcurrency(concurrency)};
}
module.exports={root,systemInfo,dependencyStatus,resolveTool,chooseConcurrency,renderOptions};
