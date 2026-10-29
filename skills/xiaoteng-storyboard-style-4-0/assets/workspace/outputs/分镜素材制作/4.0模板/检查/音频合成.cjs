const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {resolveTool}=require('../../../../scripts/runtime.cjs');
function muxAudio(c,v){
 if(!c.audioFile)return;
 const video=path.join(c.outputDir,v.file),temp=path.join(c.internalDir,'音频合成-'+v.id+'.mp4');
 try{
  cp.execFileSync(resolveTool('ffmpeg'),['-v','error','-y','-i',video,'-ss',(v.sourceStartMs/1000).toFixed(6),'-t',((v.sourceEndMs-v.sourceStartMs)/1000).toFixed(6),'-i',c.audioFile,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-af','apad','-t',(v.durationFrames/30).toFixed(6),'-movflags','+faststart',temp],{stdio:'inherit',windowsHide:true});
  fs.renameSync(temp,video);
 }finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
}
module.exports={muxAudio};
