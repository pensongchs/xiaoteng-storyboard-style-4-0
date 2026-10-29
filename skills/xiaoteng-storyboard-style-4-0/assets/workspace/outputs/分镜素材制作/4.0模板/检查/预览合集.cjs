const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),{PNG}=require('pngjs');
const {resolveTool}=require('../../../../scripts/runtime.cjs');
function previewFrames(c,v){
 const frames=new Set(),add=(ms,scene)=>{
  let first=0,last=v.durationFrames-1;
  if(scene){
   const enter=c.transitions?.find(t=>t.atMs===scene.startMs),exit=c.transitions?.find(t=>t.atMs===scene.endMs);
   first=Math.ceil(scene.startMs*.03)-Math.ceil(v.startMs*.03)+(enter?Math.floor(enter.frames/2)+2:0);
   last=Math.ceil(scene.endMs*.03)-Math.ceil(v.startMs*.03)-1-(exit?Math.floor(exit.frames/2)+2:0);
  }
  frames.add(Math.max(0,Math.min(v.durationFrames-1,Math.max(first,Math.min(last,Math.ceil(ms*.03)-Math.ceil(v.startMs*.03))))));
 };
 for(const s of c.scenes.filter(s=>s.startMs>=v.startMs&&s.endMs<=v.endMs)){
  add(s.startMs+(s.endMs-s.startMs)*.55,s);
  const complete=Math.max(s.startMs,...(s.beats??[]).map(b=>b.completeMs||b.atMs));
  add(Math.min(s.endMs-100,Math.max(complete+250,s.endMs-400)),s);
 }
 for(let i=0;i<(c.carousel?.items.length||0);i++){
  const item=c.carousel.items[i],s=c.scenes.find(s=>s.id===c.carousel.scene),end=c.carousel.items[i+1]?.atMs??s.endMs;
  if(item.atMs>=v.startMs&&item.atMs<v.endMs)add(item.atMs+(end-item.atMs)*.8,s);
 }
 if(!frames.size)for(let i=0;i<12;i++)frames.add(Math.floor((v.durationFrames-1)*i/11));
 const list=[...frames].sort((a,b)=>a-b).filter((f,i,all)=>!i||f-all[i-1]>=6);return list.length<=24?list:Array.from({length:24},(_,i)=>list[Math.round(i*(list.length-1)/23)]);
}
const glyphs={0:['111','101','101','101','101','101','111'],1:['010','110','010','010','010','010','111'],2:['111','001','001','111','100','100','111'],3:['111','001','001','111','001','001','111'],4:['101','101','101','111','001','001','001'],5:['111','100','100','111','001','001','111'],6:['111','100','100','111','101','101','111'],7:['111','001','001','010','010','010','010'],8:['111','101','101','111','101','101','111'],9:['111','101','101','111','001','001','111'],':':['0','1','1','0','1','1','0'],'.':['0','0','0','0','0','1','1'],' ':['00','00','00','00','00','00','00']};
function label(png,text,x,y){for(const ch of text){const rows=glyphs[ch];if(!rows)continue;for(let gy=0;gy<7;gy++)for(let gx=0;gx<rows[gy].length;gx++)if(rows[gy][gx]==='1')for(let dy=0;dy<3;dy++)for(let dx=0;dx<3;dx++){const at=((y+gy*3+dy)*png.width+x+gx*3+dx)*4;png.data[at]=png.data[at+1]=png.data[at+2]=240;}x+=(rows[0].length+1)*3;}}
function createContactSheet(c,v){
 const frames=previewFrames(c,v),cols=Math.min(3,frames.length),w=640,h=360,footer=34,gap=12;
 const png=new PNG({width:cols*(w+gap)+gap,height:Math.ceil(frames.length/cols)*(h+footer+gap)+gap});
 for(let i=0;i<png.data.length;i+=4){png.data[i]=png.data[i+1]=png.data[i+2]=24;png.data[i+3]=255;}
 const video=path.join(c.outputDir,v.file);
 frames.forEach((frame,index)=>{
  const bytes=cp.execFileSync(resolveTool('ffmpeg'),['-v','error','-ss',(frame/30).toFixed(6),'-i',video,'-vf',`scale=${w}:${h}:flags=lanczos`,'-frames:v','1','-f','image2pipe','-vcodec','png','pipe:1'],{maxBuffer:8e6,windowsHide:true});
  const tile=PNG.sync.read(bytes),x=gap+(index%cols)*(w+gap),y=gap+Math.floor(index/cols)*(h+footer+gap);
  PNG.bitblt(tile,png,0,0,w,h,x,y);
  const ms=Math.round(frame/30*1000),clock=String(Math.floor(ms/60000)).padStart(2,'0')+':'+String(Math.floor(ms/1000)%60).padStart(2,'0')+'.'+String(ms%1000).padStart(3,'0');
  label(png,String(index+1).padStart(2,'0')+'  '+clock,x+12,y+h+6);
 });
 const file=path.join(c.outputDir,v.name+'-预览合集.png');fs.writeFileSync(file,PNG.sync.write(png));
 console.log('预览合集：'+file);return {file,frames,thumbnailSize:[w,h],columns:cols,sourceVideo:v.file,reviewed:false};
}
module.exports={previewFrames,createContactSheet};
