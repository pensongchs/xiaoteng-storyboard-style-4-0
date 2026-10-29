const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const {resolveTool}=require('./runtime.cjs'),{muxAudio}=require('../outputs/分镜素材制作/4.0模板/检查/音频合成.cjs'),{createContactSheet,previewFrames}=require('../outputs/分镜素材制作/4.0模板/检查/预览合集.cjs'),{PNG}=require('pngjs');
test('预览帧覆盖各镜头与轮播状态，保持真实时钟且不超过成片边界',()=>{
 const c={scenes:[{startMs:10000,endMs:14000,beats:[{completeMs:13999}]}],carousel:{scene:'one',items:[{atMs:10000},{atMs:12000}]}};c.scenes[0].id='one';c.transitions=[{atMs:10000,frames:12},{atMs:14000,frames:12}];
 const frames=previewFrames(c,{startMs:10000,endMs:14000,durationFrames:120});
 assert(frames.every(f=>f>=8&&f<=111));assert(frames.some(f=>f<60));assert(frames.some(f=>f>=60));assert.deepEqual(frames,[...new Set(frames)].sort((a,b)=>a-b));
});
test('声音按源时间裁取，段尾补静音，视频码流保持不变，并能从成片生成合集图',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'style40-media-')),ffmpeg=resolveTool('ffmpeg'),exec=args=>cp.execFileSync(ffmpeg,['-v','error','-y',...args],{maxBuffer:8e6});
 try{
  const c={outputDir:dir,internalDir:dir,audioFile:path.join(dir,'原始 录音.wav'),scenes:[{startMs:0,endMs:1500,beats:[]}]},v={id:'Test',file:'fixture.mp4',name:'预览测试',sourceStartMs:1000,sourceEndMs:2000,startMs:0,endMs:1500,durationFrames:45},video=path.join(dir,v.file);
  exec(['-f','lavfi','-i','color=c=black:s=32x32:r=30:d=1.5','-an','-c:v','libx264','-preset','ultrafast',video]);
  exec(['-f','lavfi','-i','aevalsrc=if(between(t\\,1\\,2)\\,0.3*sin(2*PI*880*t)\\,0):s=48000:d=3',c.audioFile]);
  const hash=()=>exec(['-i',video,'-map','0:v:0','-c:v','copy','-f','hash','-hash','sha256','-']).toString();const before=hash();
  muxAudio(c,v);assert.equal(hash(),before);
  const pcm=exec(['-i',video,'-map','0:a:0','-ac','1','-ar','8000','-f','s16le','-']);
  const rms=(start,end)=>{let sum=0,count=0;for(let i=start*8000;i<end*8000;i++){sum+=(pcm.readInt16LE(i*2)/32768)**2;count++;}return Math.sqrt(sum/count);};
  assert(rms(.1,.8)>.1);assert(rms(1.15,1.45)<.001);assert(Math.abs(pcm.length/16000-1.5)<.05);
  const sheet=createContactSheet(c,v),png=PNG.sync.read(fs.readFileSync(sheet.file));assert.equal(sheet.frames.length,2);assert.equal(png.width,1316);assert.equal(png.height,418);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
