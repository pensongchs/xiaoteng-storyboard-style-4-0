const {test}=require('node:test'),assert=require('node:assert/strict'),cp=require('node:child_process'),path=require('node:path'),fs=require('node:fs'),os=require('node:os'),crypto=require('node:crypto');
const {chooseConcurrency,renderOptions,root,dependencyStatus,resolveTool}=require('./runtime.cjs');
test('低内存与低核心数机器减少并发，明确参数可覆盖默认',()=>{
 const ample={cpuThreads:8,totalMemoryGB:16,freeMemoryGB:6};
 assert.equal(chooseConcurrency(undefined,ample),2);
 for(const change of [{totalMemoryGB:8},{freeMemoryGB:2},{cpuThreads:2}])assert.equal(chooseConcurrency(undefined,{...ample,...change}),1);
 assert.equal(chooseConcurrency(1,ample),1);
 for(const value of [0,3,1.5,'abc',''])assert.throws(()=>chooseConcurrency(value,ample));
});
test('段落和并发选项可以共同使用，错误选项及时失败',()=>{
 assert.deepEqual(renderOptions(['Part-A','--concurrency=1']),{ids:['Part-A'],concurrency:1});
 assert.throws(()=>renderOptions(['--strcit']));
});
test('版本匹配的现有依赖可直接复用',()=>assert.deepEqual(dependencyStatus(),[]));
test('明确指定的工具路径优先，失效时不暗中替换',t=>{
 const saved=process.env.FFMPEG_PATH;process.env.FFMPEG_PATH=path.join(root,'test tools','ffmpeg');
 t.mock.method(cp,'spawnSync',()=>({status:1}));
 assert.throws(()=>resolveTool('ffmpeg'),/指定的工具不可用/);t.mock.restoreAll();
 t.mock.method(cp,'spawnSync',(file,args)=>({status:file===process.env.FFMPEG_PATH&&args[0]==='-version'?0:1}));
 try{assert.equal(resolveTool('ffmpeg'),process.env.FFMPEG_PATH);}finally{if(saved===undefined)delete process.env.FFMPEG_PATH;else process.env.FFMPEG_PATH=saved;t.mock.restoreAll();}
});
test('没有系统 FFmpeg、Python、NumPy 时，日常 doctor 仍可使用 Remotion 自带工具',()=>{
 const env={...process.env,PATH:'',PYTHON:path.join(root,'missing-python'),FFMPEG_PATH:'',FFPROBE_PATH:''};
 const normal=cp.spawnSync(process.execPath,[path.join(__dirname,'doctor.cjs')],{env,encoding:'utf8'});
 assert.equal(normal.status,0,normal.stdout+normal.stderr);
});
test('新工程复用已准备的相同系统运行组，不触发安装；同时准备时及时提示',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'style40-reuse-')),project=path.join(temp,'学习 工程'),codex=path.join(temp,'codex');
 try{
  fs.mkdirSync(path.join(project,'scripts'),{recursive:true});
  for(const file of ['package.json','package-lock.json','scripts/runtime.cjs','scripts/setup.cjs'])fs.copyFileSync(path.join(root,file),path.join(project,file));
  const key=crypto.createHash('sha256').update(fs.readFileSync(path.join(project,'package-lock.json'))).update(JSON.stringify({manager:'npm',node:process.versions.node.split('.')[0],platform:process.platform,arch:process.arch})).digest('hex');
  const group=path.join(codex,'shared-node-dependencies/runtimes','student-'+key);fs.mkdirSync(group,{recursive:true});
  fs.symlinkSync(path.join(root,'node_modules'),path.join(group,'node_modules'),process.platform==='win32'?'junction':'dir');fs.writeFileSync(path.join(group,'ready.json'),JSON.stringify({key}));
  const args=['-e','require(process.argv[1]).prepareDependencies()',path.join(project,'scripts/setup.cjs')],env={...process.env,CODEX_HOME:codex};
  const reused=cp.spawnSync(process.execPath,args,{env,encoding:'utf8'});assert.equal(reused.status,0,reused.stderr);assert.match(reused.stdout,/复用共享依赖/);assert(fs.lstatSync(path.join(project,'node_modules')).isSymbolicLink());
  fs.unlinkSync(path.join(project,'node_modules'));fs.unlinkSync(path.join(group,'ready.json'));fs.mkdirSync(path.join(group,'preparing'));
  const busy=cp.spawnSync(process.execPath,args,{env,encoding:'utf8'});assert.notEqual(busy.status,0);assert.match(busy.stderr,/相同依赖正在准备/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});

test('排版几何识别相交框，允许相邻与取整误差',()=>{
 require('../outputs/分镜素材制作/4.0模板/检查/公共.cjs');
 const {overlaps40}=require('../outputs/分镜素材制作/4.0模板/组件/LayoutGeometry40.ts');
 const a={left:0,right:100,top:0,bottom:80};
 assert.equal(overlaps40(a,{left:60,right:160,top:20,bottom:90}),true);
 assert.equal(overlaps40(a,{left:100,right:200,top:0,bottom:80}),false);
 assert.equal(overlaps40(a,{left:99,right:199,top:0,bottom:80}),false);
 assert.equal(overlaps40(a,{left:20,right:80,top:90,bottom:120}),false);
});
