const fs=require('node:fs'),path=require('node:path');
const BASE=path.resolve(__dirname,'../..'),LIBRARY=path.resolve(BASE,'../动效素材库');
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
module.exports={validatePlan};
