const crypto=require('node:crypto');
const fs=require('node:fs');
const {PNG}=require('pngjs');
const {S}=require('./公共.cjs');
delete process.env.DISABLE_FROM_SURFACE;
const defaultReferenceFile=require('node:path').join(require('node:os').tmpdir(),'student-style40-frame-reference.ndjson');
const sampleGrid=png=>{
 const cols=64,rows=36,cw=png.width/cols,ch=png.height/rows,out=Buffer.alloc(cols*rows*3);
 for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){
  const sums=[0,0,0];
  for(let sy=0;sy<5;sy++)for(let sx=0;sx<5;sx++){
   const y=Math.min(png.height-1,Math.floor((gy+(sy+.5)/5)*ch)),x=Math.min(png.width-1,Math.floor((gx+(sx+.5)/5)*cw)),at=(y*png.width+x)*4;
   sums[0]+=png.data[at];sums[1]+=png.data[at+1];sums[2]+=png.data[at+2];
  }
  const i=(gy*cols+gx)*3;for(let c=0;c<3;c++)out[i+c]=Math.round(sums[c]/25);
 }
 return out;
};
module.exports.attachStableCapture=(browser,{referenceFile=defaultReferenceFile,replacingParts=null}={})=>{
 let retained=[];
 if(replacingParts&&fs.existsSync(referenceFile))retained=fs.readFileSync(referenceFile,'utf8').split('\n').filter(Boolean).map(JSON.parse).filter(row=>!replacingParts.includes(row.part));
 fs.writeFileSync(referenceFile,retained.map(row=>JSON.stringify(row)+'\n').join(''));let timeline=null;
 const stats={method:'独立像素材质、专用无头渲染器PNG采集、同帧逐像素一致性校验、编码前画面参考',verifiedFrames:0,captureAttempts:0,retriedFrames:0,maxAttempts:0,failedFrames:0,requiredIdenticalCaptures:S.guards.identicalCaptures,referenceFile,retainedVerifiedFrames:retained.length};
 stats.startPart=part=>{timeline={id:part.id,sourceStartFrame:Math.ceil(part.startMs*.03)};};
 const original=browser._createPageInContext.bind(browser);
 browser._createPageInContext=async args=>{
  const page=await original(args),client=page._client(),send=client.send.bind(client);
  client.send=async(method,params,...rest)=>{
   if(method!=='Page.captureScreenshot')return send(method,params,...rest);
   let previousData=null,identical=0;
   for(let attempt=1;attempt<=S.guards.maxCaptureAttempts;attempt++){
    const result=await send(method,{...params,format:'png',quality:undefined,fromSurface:true,optimizeForSpeed:true},...rest);
    stats.captureAttempts++;
    identical=result.value.data===previousData?identical+1:1;
    if(identical>=S.guards.identicalCaptures){
     const png=PNG.sync.read(Buffer.from(result.value.data,'base64'));
     if(Math.abs(png.width/png.height-params.clip.width/params.clip.height)>.001||(timeline&&(png.width!==1920||png.height!==1080)))throw new Error(`采集尺寸异常 ${png.width}x${png.height}`);
     const currentHash=crypto.createHash('sha256').update(png.data).digest('hex');
     const grid=sampleGrid(png);let min=255,max=0;for(let i=0;i<grid.length;i+=3){min=Math.min(min,grid[i]);max=Math.max(max,grid[i]);}
     if(max-min<3)throw new Error('采集画面缺少可见内容，已阻止空画面进入编码');
     stats.verifiedFrames++;stats.maxAttempts=Math.max(stats.maxAttempts,attempt);if(attempt>3)stats.retriedFrames++;
     if(timeline){
      const meta=await page.evaluate(()=>{
       const opacity=node=>{let value=1;for(let p=node;p&&p!==document.body;p=p.parentElement)value*=Number(getComputedStyle(p).opacity);return value;};
       const rect=node=>{const r=node.getBoundingClientRect();return [r.x,r.y,r.width,r.height].map(v=>Math.round(v*100)/100);};
       const texts=Array.from(document.querySelectorAll('[data-safe-text]')).filter(n=>opacity(n)>.97).map(n=>{
        const range=document.createRange();range.selectNodeContents(n);const r=range.getBoundingClientRect(),color=getComputedStyle(n).color.match(/[\d.]+/g)?.slice(0,3).map(Number);
        return {key:n.getAttribute('data-safe-text')+'|'+n.textContent,rect:[r.x,r.y,r.width,r.height].map(v=>Math.round(v*100)/100),color};
       }).filter(n=>n.rect[2]>1&&n.rect[3]>1&&n.color);
       const boxes=Array.from(document.querySelectorAll('[data-textbox]')).filter(n=>opacity(n)>.97).map(n=>({key:n.getAttribute('data-textbox')+'|'+n.textContent,rect:rect(n)}));
       const sourceFrame=Number(document.querySelector('[data-six-source-frame]')?.getAttribute('data-six-source-frame'));
       const errors=document.documentElement.dataset.style40AuditErrors;
       if(errors===undefined||Number(document.documentElement.dataset.style40AuditSource)!==sourceFrame)throw new Error('本帧排版检查尚未完成');
       if(JSON.parse(errors).length)throw new Error('排版/线框间距检查失败：'+errors);
       const libraries=Array.from(document.querySelectorAll('[data-library]')).filter(n=>opacity(n)>.05).map(n=>{
        const nodes=[n,...n.querySelectorAll('svg,img,canvas,[data-safe-text]')].filter(x=>opacity(x)>.05).map(x=>x.getBoundingClientRect()).filter(r=>r.width>1&&r.height>1);
        if(!nodes.length)return null;
        const html=n.outerHTML;let h=2166136261;for(let i=0;i<html.length;i++){h^=html.charCodeAt(i);h=Math.imul(h,16777619);}
        return {id:n.getAttribute('data-library'),state:(h>>>0).toString(16)};
       }).filter(Boolean);
       const transitions=Array.from(document.querySelectorAll('[data-scene-transition]')).map(n=>({atMs:Number(n.getAttribute('data-transition-at')),kind:n.getAttribute('data-scene-transition'),state:n.getAttribute('style')}));
       const carousel=document.querySelector('[data-carousel-caption]');
       return {sourceFrame,texts,boxes,libraries,transitions,carousel:carousel?{label:carousel.querySelector('[data-safe-text=carousel-label]')?.textContent,description:carousel.querySelector('[data-safe-text=carousel-description]')?.textContent}:null};
      });
     fs.appendFileSync(referenceFile,JSON.stringify({part:timeline.id,frame:meta.sourceFrame-timeline.sourceStartFrame,sha256:currentHash,grid:grid.toString('base64'),texts:meta.texts,boxes:meta.boxes,libraries:meta.libraries,transitions:meta.transitions,carousel:meta.carousel})+'\n');
     }
     return result;
    }
    previousData=result.value.data;
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   }
   stats.failedFrames++;throw new Error('同帧像素不一致，已阻止编码与交付');
  };
  return page;
 };
 return stats;
};
