const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,esModuleInterop:true,resolveJsonModule:true}}).outputText,f);
require.extensions['.tsx']=require.extensions['.ts'];
const TEMPLATE=path.resolve(__dirname,'..'),BASE=path.resolve(TEMPLATE,'..'),PROJECT=path.join(BASE,'remotion-test'),ROOT=path.resolve(BASE,'../..');
const {STYLE40:S}=require(path.join(TEMPLATE,'参数.ts'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const {frame40:F,cueAt40:cueAt}=require('../组件/Clock40.ts');
const resolveBase=p=>path.isAbsolute(p)?p:path.resolve(BASE,p);
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const demand=(ok,msg)=>{if(!ok)throw new Error(msg);};
function cmapGlyphs(file){
 const b=fs.readFileSync(file);let cmap=0;for(let i=0;i<b.readUInt16BE(4);i++){const at=12+i*16;if(b.toString('ascii',at,at+4)==='cmap')cmap=b.readUInt32BE(at+8);}demand(cmap,'字体无Unicode映射');
 let format4,format12;for(let i=0;i<b.readUInt16BE(cmap+2);i++){const at=cmap+4+i*8,platform=b.readUInt16BE(at),encoding=b.readUInt16BE(at+2);if(platform!==0&&!(platform===3&&[1,10].includes(encoding)))continue;const start=cmap+b.readUInt32BE(at+4),format=b.readUInt16BE(start);if(format===12)format12=start;if(format===4)format4=start;}
 return code=>{if(format12){const n=b.readUInt32BE(format12+12);let lo=0,hi=n-1;while(lo<=hi){const m=(lo+hi)>>1,at=format12+16+m*12,a=b.readUInt32BE(at),z=b.readUInt32BE(at+4);if(code<a)hi=m-1;else if(code>z)lo=m+1;else return b.readUInt32BE(at+8)+code-a!==0;}}
  if(code>65535||!format4)return false;const n=b.readUInt16BE(format4+6)/2,end=format4+14,start=end+n*2+2,delta=start+n*2,offset=delta+n*2;for(let i=0;i<n;i++){if(code>b.readUInt16BE(end+i*2))continue;if(code<b.readUInt16BE(start+i*2))return false;const d=b.readInt16BE(delta+i*2),o=b.readUInt16BE(offset+i*2);if(!o)return ((code+d)&65535)!==0;const g=b.readUInt16BE(offset+i*2+o+(code-b.readUInt16BE(start+i*2))*2);return g!==0&&((g+d)&65535)!==0;}return false;};
}
function pythonExecutable(){
 const cp=require('node:child_process');let launcher=null;if(process.platform==='win32'){const r=cp.spawnSync('py',['-3','-c','import sys;print(sys.executable)'],{encoding:'utf8'});if(r.status===0)launcher=r.stdout.trim();}for(const p of [process.env.PYTHON,path.join(ROOT,'.runtime/python',process.platform==='win32'?'Scripts/python.exe':'bin/python'),launcher,...(process.platform==='win32'?['python','python3']:['python3','python'])].filter(Boolean)){const r=cp.spawnSync(p,['-c','import sys,numpy;print(sys.version_info.major)'],{encoding:'utf8'});if(r.status===0)return p;}throw Error('需要Python3与NumPy，请先运行工程准备检查');
}
function runtimeCheck(){
 const lock=json(path.join(ROOT,'package.json'));
 for(const name of ['remotion','@remotion/renderer','@remotion/bundler','react','react-dom','typescript','pngjs'])demand(require(name+'/package.json').version===lock.dependencies[name],'依赖版本不符：'+name);
 const cp=require('node:child_process');for(const tool of ['ffmpeg','ffprobe'])demand(cp.spawnSync(tool,['-version']).status===0,'缺少工具：'+tool);
 pythonExecutable();
 const expected=json(path.join(TEMPLATE,'资源锁.json'));
 for(const font of expected.fonts){const file=path.join(PROJECT,'public/fonts',font.file);demand(fs.existsSync(file)&&sha(file)===font.sha256,'字体缺失或摘要变化：'+font.file);}
 for(const item of expected.assets)demand(fs.existsSync(resolveBase(item.path))&&sha(resolveBase(item.path))===item.sha256,'公共素材缺失或变化：'+item.path);
}

function sourceAudit(entry,seen=new Set()){
 demand(entry!==path.join(PROJECT,'src/StreetNoiseStyle.tsx'),'其他期的专用风格实现不能作为当前4.0模板调用');
 if(seen.has(entry)||/\.json$/.test(entry))return;seen.add(entry);const code=fs.readFileSync(entry,'utf8');
 demand(!/Math\.random\s*\(|Date\.now\s*\(|animation\s*:|transition\s*:/.test(code),'画面必须使用帧驱动和固定种子：'+entry);
 for(const m of code.matchAll(/from\s*['"](\.[^'"]+)['"]/g)){const stem=path.resolve(path.dirname(entry),m[1]),p=[stem,stem+'.tsx',stem+'.ts',stem+'.json',path.join(stem,'index.tsx')].find(x=>fs.existsSync(x)&&fs.statSync(x).isFile());demand(p,'源码引用不存在：'+m[1]);sourceAudit(p,seen);}
}
function readContract(file,{allowCoreChange=false}={}){
 const inputFile=resolveBase(file),redirect=json(inputFile);if(redirect.$ref)return readContract(path.resolve(path.dirname(inputFile),redirect.$ref),{allowCoreChange});const c=redirect;demand(c.styleId===S.id,'契约未使用当前唯一风格');demand(typeof c.title==='string'&&c.title.trim(),'缺少期名');demand(c.assetRoot&&!c.assetRoot.includes('..')&&!/^(https?:|\/)/.test(c.assetRoot),'素材目录必须是母工程public中的正式相对路径');
 c.entryPoint=resolveBase(c.entryPoint);c.outputDir=resolveBase(c.outputDir);c.internalDir=resolveBase(c.internalDir);c.cuesFile=resolveBase(c.cuesFile);
 for(const p of[c.entryPoint,c.cuesFile])demand(fs.existsSync(p),'文件不存在：'+p);
 demand(c.outputDir.startsWith(path.join(PROJECT,'renders')+path.sep)||c.verification===true&&c.outputDir===path.join(BASE,'分镜规划/模板组件验证')&&c.entryPoint===path.join(TEMPLATE,'示例/复用验证.tsx'),'成片目录不在本工程内');
 demand(c.internalDir.startsWith(BASE+path.sep),'内部目录越界');
 const cues=json(c.cuesFile);demand(Array.isArray(cues)&&cues.length,'字幕必须包含毫秒时间码');
 let last=-Infinity;for(const q of cues){demand(Number.isFinite(q.startMs)&&q.endMs>q.startMs&&q.startMs>=last,'字幕时间码无效或倒序');last=q.startMs;demand(Array.isArray(q.tokens)&&q.tokens.length,'必须保留真实词元，禁止猜测触发时间');let prev=q.startMs;for(const t of q.tokens){demand(t.startMs>=q.startMs&&t.endMs<=q.endMs+.001&&t.endMs>=t.startMs&&t.startMs>=prev,'词元时间超出字幕或倒序');prev=t.startMs;}demand(q.tokens.map(t=>t.text).join('')===q.text,'字幕text与tokens不一致');}
 const ids=new Set();last=-Infinity;demand(Array.isArray(c.videos)&&c.videos.length,'缺少交付段落');for(const v of c.videos){demand(/^[A-Za-z0-9_-]+$/.test(v.id)&&!ids.has(v.id),'合成ID无效或重复');ids.add(v.id);demand(v.startMs>=last&&v.endMs>v.startMs,'段落重叠或时间无效');last=v.endMs;v.durationFrames=F(v.endMs)-F(v.startMs);demand(!v.frames||v.frames===v.durationFrames,'帧数与首尾时间码不一致');demand(!/[\/\\]/.test(v.name),'文件名不能含路径');v.file=v.name+'.mp4';}
 if(!c.verification)for(const v of c.videos){demand(Number.isFinite(v.sourceStartMs)&&v.sourceEndMs>v.sourceStartMs,'缺少保留原时码的sourceStartMs/sourceEndMs');v.holdFrames??=S.timing.tailHoldFrames;demand(Number.isInteger(v.holdFrames)&&v.holdFrames>=0&&v.durationFrames===F(v.sourceEndMs)-F(v.sourceStartMs)+v.holdFrames,'源时长与末帧保持时长不符');}
 demand(Array.isArray(c.scenes)&&c.scenes.length,'缺少内容镜头');last=-Infinity;const owners=new Map(),texts=[];
 for(const scene of c.scenes){demand(scene.startMs>=last&&scene.endMs>scene.startMs,'新旧场景交接重叠或时间倒序');last=scene.endMs;demand(c.videos.some(v=>scene.startMs>=v.startMs&&scene.endMs<=v.endMs),'镜头超出段落');demand(Array.isArray(scene.screenText),'缺少屏显文字');texts.push(...scene.screenText);
  for(const beat of scene.beats??[]){demand(beat.atMs>=scene.startMs&&beat.atMs<scene.endMs,'对象触发超出镜头');if(beat.cueIndex!==undefined)demand(Math.abs(beat.atMs-cueAt(cues,beat.cueIndex,beat.word))<.001,'对象没有匹配真实词元时间');demand(beat.completeMs>=beat.atMs&&beat.completeMs<=scene.endMs,'动作未在镜头内完成');if(beat.untilMs!==undefined)demand(beat.untilMs>=beat.completeMs&&beat.untilMs<=scene.endMs,'停留/退场边界无效');}
  for(const name of scene.assets??[]){demand(!path.isAbsolute(name)&&!name.includes('..'),'素材路径无效');const p=path.join(PROJECT,'public',c.assetRoot,name);demand(fs.existsSync(p)&&fs.statSync(p).isFile(),'正式素材缺失：'+p);if(!name.startsWith('glass/')){const h=sha(p);demand(!owners.has(h)||owners.get(h)===scene.id,'不同语义镜头重复使用素材：'+name);owners.set(h,scene.id);}}
 }
 for(const v of c.videos){const list=c.scenes.filter(s=>s.startMs>=v.startMs&&s.endMs<=v.endMs);demand(list.length&&F(list[0].startMs)===F(v.startMs)&&F(list.at(-1).endMs)===F(v.endMs),'镜头未覆盖段落首尾');for(let i=1;i<list.length;i++)demand(F(list[i-1].endMs)===F(list[i].startMs),'段内存在未覆盖的空白帧');}
 const regularGlyph=cmapGlyphs(path.join(PROJECT,'public/fonts/AlibabaHealthFont2.0CN-45R.ttf'));
 const hasGlyph=cmapGlyphs(path.join(PROJECT,'public/fonts/AlibabaHealthFont2.0CN-85B.ttf'));const missing=[...new Set(texts.join(''))].filter(ch=>!/^\s$/.test(ch)&&(!hasGlyph(ch.codePointAt(0))||!regularGlyph(ch.codePointAt(0))));demand(!missing.length,'正式字体缺少字形：'+missing.join(''));
 sourceAudit(c.entryPoint);
 const baseline=json(path.join(TEMPLATE,'资源锁.json'));if(!allowCoreChange){demand(baseline.core?.length,'模板尚未完成验证锁定');for(const item of baseline.core)demand(sha(resolveBase(item.path))===item.sha256,'公共风格代码变化，须先复验：'+item.path);}
 if(c.reference){const ref=json(resolveBase(baseline.referenceManifest));demand(c.title===ref.episode&&c.entryPoint===resolveBase(ref.entryPoint)&&inputFile===resolveBase(ref.contract),'新期不能使用基准豁免');}
 require('./动效库.cjs').validatePlan(c,S.library.minimumDistinct);
 require('./轮播与转场.cjs').validate(c);
 c.cues=cues;return c;
}
module.exports={S,TEMPLATE,BASE,PROJECT,ROOT,F,sha,json,demand,resolveBase,cmapGlyphs,cueAt,runtimeCheck,readContract,pythonExecutable};
