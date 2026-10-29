const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto');
const {root,systemInfo,dependencyStatus,resolveTool}=require('./runtime.cjs');
function run(file,args,cwd=root){const r=cp.spawnSync(file,args,{cwd,stdio:'inherit',windowsHide:true});if(r.status!==0)throw Error('准备失败：'+file+'，请修复后重试');}
function npmCi(cwd){
 const cli=process.env.npm_execpath;
 if(cli&&fs.existsSync(cli)&&/npm-cli\.js$/.test(cli))return run(process.execPath,[cli,'ci','--include=dev','--include=optional','--no-audit','--no-fund'],cwd);
 if(process.platform==='win32')return run(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm ci --include=dev --include=optional --no-audit --no-fund'],cwd);
 run('npm',['ci','--include=dev','--include=optional','--no-audit','--no-fund'],cwd);
}
function prepareDependencies(){
 if(!dependencyStatus().length){console.log('复用当前工程依赖');return;}
 const home=process.env.CODEX_HOME||path.join(os.homedir(),'.codex'),helper=path.join(home,'shared-node-dependencies/ensure.mjs');
 if(fs.existsSync(helper)){run(process.execPath,[helper,root]);return;}
 // 无全局管理器时，也按锁文件、Node主版本、系统和架构复用同一运行组。
 const key=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'package-lock.json'))).update(JSON.stringify({manager:'npm',node:process.versions.node.split('.')[0],platform:process.platform,arch:process.arch})).digest('hex');
 const group=path.join(home,'shared-node-dependencies/runtimes','student-'+key),modules=path.join(group,'node_modules'),marker=path.join(group,'ready.json'),local=path.join(root,'node_modules');
 const existing=fs.lstatSync(local,{throwIfNoEntry:false});
 if(existing&&!existing.isSymbolicLink())throw Error('当前 node_modules 版本不符；请在新工程执行准备，或先处理本地依赖目录');
 if(!fs.existsSync(marker)){
  fs.mkdirSync(group,{recursive:true});const guard=path.join(group,'preparing');
  try{fs.mkdirSync(guard);}catch{throw Error('相同依赖正在准备；请稍后重试。若上次中断，确认没有安装进程后再清理：'+guard);}
  try{for(const file of ['package.json','package-lock.json'])fs.copyFileSync(path.join(root,file),path.join(group,file));npmCi(group);fs.writeFileSync(marker,JSON.stringify({key,...systemInfo()},null,2));}
  finally{fs.rmdirSync(guard);}
 }
 if(!fs.existsSync(modules))throw Error('共享运行组不完整：'+group);
 if(existing)fs.unlinkSync(local);
 fs.symlinkSync(modules,local,process.platform==='win32'?'junction':'dir');
 console.log('复用共享依赖：'+modules);
}
async function main(){
 console.log('系统识别：'+JSON.stringify(systemInfo()));
 if(Number(process.versions.node.split('.')[0])<22)throw Error('需要 Node.js 22 以上，建议使用24');
 if(process.platform==='win32'&&process.arch!=='x64')throw Error('当前固定版本需要 Windows x64 的 Node.js，请先使用 x64 运行环境');
 prepareDependencies();
 const missing=dependencyStatus();if(missing.length)throw Error('依赖版本未匹配：'+missing.join('、'));
 for(const name of ['ffmpeg','ffprobe'])console.log(name+'：'+resolveTool(name));
 run(process.execPath,[path.join(__dirname,'prepare.cjs')]);
 const browser=await require('../outputs/分镜素材制作/4.0模板/检查/浏览器.cjs').prepare();
 console.log('浏览器：'+browser.path+'（'+browser.type+'）');
 run(process.execPath,[path.join(__dirname,'doctor.cjs')]);
 console.log('准备完成，后续可直接运行渲染命令');
}
module.exports={prepareDependencies};
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
