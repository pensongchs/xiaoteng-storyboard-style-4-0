const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');let failed=false;
for(const name of ['remotion','@remotion/renderer','@remotion/bundler','react','react-dom','typescript','pngjs','vite']){
 try{const version=require(name+'/package.json').version,expected=require(path.join(root,'package.json')).dependencies[name];if(version!==expected)throw Error('版本不一致');console.log(name,version);}catch{console.error('需要准备Node依赖：'+name);failed=true;}}
for(const name of ['ffmpeg','ffprobe'])if(cp.spawnSync(name,['-version']).status!==0){console.error('缺少：'+name);failed=true;}
try{const {runtimeCheck}=require('../outputs/分镜素材制作/4.0模板/检查/公共.cjs');runtimeCheck();}catch(e){console.error(e.message);failed=true;}
if(failed)process.exitCode=1;else console.log('运行环境、字体和公共素材检查通过');
