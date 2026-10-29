const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const BASE=path.resolve(__dirname,'../..'),LIBRARY=path.resolve(BASE,'../动效素材库');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const demand=(ok,msg)=>{if(!ok)throw new Error(msg);};
function validatePlan(c,minimum=5){
 if(c.verification===true&&c.entryPoint===path.resolve(BASE,'4.0模板/示例/复用验证.tsx'))return null;
 demand(typeof c.motionLibraryFile==='string','每期必须提供motionLibraryFile，登记至少'+minimum+'种本地动效');
 const file=path.resolve(BASE,c.motionLibraryFile),plan=JSON.parse(fs.readFileSync(file,'utf8')),ids=new Set();
 demand(Array.isArray(plan.items),'动效调用清单缺少items');
 for(const item of plan.items){
  demand(/^\d{3}$/.test(item.id)&&!ids.has(item.id),'动效编号无效或重复：'+item.id);ids.add(item.id);
  const scene=c.scenes.find(s=>s.id===item.scene);
  demand(scene&&item.atMs>=scene.startMs&&item.endMs>item.atMs&&item.endMs<=scene.endMs,'动效触发或结束时间超出镜头：'+item.id);
  demand(typeof item.source==='string'&&!path.isAbsolute(item.source)&&!item.source.split(/[\\/]/).includes('..'),'动效原始来源路径无效：'+item.id);
  demand(item.source.split(/[\\/]/)[0].startsWith(item.id+'_'),'动效编号与原始素材文件夹不符：'+item.id);
  const source=path.resolve(LIBRARY,item.source);
  demand(source.startsWith(LIBRARY+path.sep)&&fs.existsSync(source)&&fs.statSync(source).isFile(),'本地动效源码缺失：'+item.id);
 }
 demand(ids.size>=minimum,'每期至少实际调用'+minimum+'种不同本地动效，当前仅登记'+ids.size+'种');
 return plan;
}
function verifyLibrary(c,referenceFile,minimum=5){
 const plan=validatePlan(c,minimum);if(!plan)return null;
 const file=path.join(c.internalDir,'动效可见性检查.json'),old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
 const records=fs.readFileSync(referenceFile,'utf8').split('\n').filter(Boolean).map(JSON.parse),parts=[];
 for(const v of c.videos){
  const sha256=hash(path.join(c.outputDir,v.file)),previous=old?.parts?.find(p=>p.id===v.id&&p.sha256===sha256),items=new Map();
  for(const item of previous?.items??[])items.set(item.id,{id:item.id,samples:new Map((item.samples??[]).map(s=>[s.frame+'|'+s.state,s]))});
  for(const row of records.filter(r=>r.part===v.id))for(const lib of row.libraries??[]){
   const item=items.get(lib.id)??{id:lib.id,samples:new Map()};
   item.samples.set(row.frame+'|'+lib.state,{frame:row.frame,state:lib.state});items.set(lib.id,item);
  }
  parts.push({id:v.id,sha256,items:[...items.values()].map(i=>({id:i.id,samples:[...i.samples.values()].sort((a,b)=>a.frame-b.frame)}))});
 }
 const observed=plan.items.map(item=>{
  const owner=c.videos.find(v=>c.scenes.some(s=>s.id===item.scene&&s.startMs>=v.startMs&&s.endMs<=v.endMs));
  const seen=parts.find(p=>p.id===owner.id)?.items.find(i=>i.id===item.id);
  const first=Math.ceil(item.atMs*.03)-Math.ceil(owner.startMs*.03),end=Math.ceil(item.endMs*.03)-Math.ceil(owner.startMs*.03);
  const samples=seen?.samples.filter(s=>s.frame>=first&&s.frame<end)??[],frames=new Set(samples.map(s=>s.frame)),states=new Set(samples.map(s=>s.state));
  return {id:item.id,part:owner.id,observedFrames:frames.size,stateCount:states.size,passed:frames.size>=2&&states.size>=2};
 });
 const distinctStyles=observed.filter(x=>x.passed).length;
 demand(distinctStyles>=minimum,'成片可见且有状态变化的本地动效不足'+minimum+'种：'+observed.filter(x=>!x.passed).map(x=>x.id).join('、'));
 const result={passed:true,minimum,distinctStyles,observed,parts};fs.writeFileSync(file,JSON.stringify(result,null,2));return result;
}
module.exports={validatePlan,verifyLibrary};
