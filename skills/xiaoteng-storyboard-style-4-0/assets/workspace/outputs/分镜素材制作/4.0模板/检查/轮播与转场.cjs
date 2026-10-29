const fs=require('node:fs'),path=require('node:path');
module.exports.validate=c=>{
 const demand=(ok,msg)=>{if(!ok)throw Error(msg);};
 const carousel=c.carousel;demand(carousel&&['032','033','043','055','057'].includes(carousel.kind),'每期必须调用一个本地图片轮播动效');
 const scene=c.scenes.find(s=>s.id===carousel.scene);demand(scene&&carousel.items?.length>=2,'轮播需要指定镜头并提供至少两张图片');
 const seen=new Set();let last=-Infinity;
 for(const item of carousel.items){demand(item.file&&item.label?.trim()&&item.description?.trim(),'轮播图片、标签和说明必须一一对应');demand(!seen.has(item.file),'轮播图片重复');seen.add(item.file);demand(item.atMs>=scene.startMs&&item.atMs<scene.endMs&&item.atMs>=last,'轮播时间超出镜头或倒序');last=item.atMs;demand(scene.assets.includes(item.file),'轮播图片未登记到镜头素材');}
 for(const v of c.videos){const scenes=c.scenes.filter(s=>s.startMs>=v.startMs&&s.endMs<=v.endMs);for(const s of scenes.slice(1)){const t=c.transitions?.find(t=>t.atMs===s.startMs);demand(t&&['wipe','iris'].includes(t.kind)&&Number.isInteger(t.frames)&&t.frames>=6&&t.frames<=20,'每个不同画面边界必须配置6至20帧的转场');}}
};
module.exports.verify=(c,file)=>{
 const records=fs.readFileSync(file,'utf8').trim().split('\n').map(JSON.parse);
 const transitions=c.transitions.map(t=>{const rows=records.flatMap(r=>(r.transitions??[]).filter(x=>x.atMs===t.atMs));return {atMs:t.atMs,frames:rows.length,states:new Set(rows.map(r=>r.state)).size};});
 if(transitions.some(t=>t.frames<2||t.states<2))throw Error('部分转场没有实际呈现或缺少运动');
 const items=c.carousel.items.map(item=>({file:item.file,description:item.description,visibleFrames:records.filter(r=>r.carousel?.description?.trim()===item.description.trim()).length}));
 if(items.some(i=>i.visibleFrames<2))throw Error('轮播图片没有对应可见说明');
 return {passed:true,transitions,carousel:{kind:c.carousel.kind,items}};
};
