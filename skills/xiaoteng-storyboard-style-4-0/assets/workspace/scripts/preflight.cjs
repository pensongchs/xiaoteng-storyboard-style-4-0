const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),group=path.join(root,'outputs/分镜素材制作'),template=path.join(group,'4.0模板');
const {readContract}=require(path.join(template,'检查/公共.cjs'));
const {open,withProps}=require(path.join(template,'渲染.cjs'));
const {renderStill}=require('@remotion/renderer');
(async()=>{
 const c=readContract(path.join(group,'分镜规划/学员示例/镜头契约.json')),{url,browser,comps}=await open(c);
 const frames=process.argv[2]?process.argv[2].split(',').map(Number):[108,269,465,831,990,1179,1401,1555,1611,1791,116,117,118,120],errors=[];
 try{for(const frame of frames){await renderStill({serveUrl:url,composition:withProps(comps[0]),frame,output:path.join(c.internalDir,`预览_${frame}.png`),imageFormat:'png',puppeteerInstance:browser,logLevel:'error',onBrowserLog:log=>{if(log.text?.startsWith('SIX_LAYOUT '))errors.push(JSON.parse(log.text.slice(11)));}});if(errors.length)throw Error('排版检查失败：'+JSON.stringify(errors.slice(0,3)));console.log('预览',frame);}}
 finally{await browser.close({silent:true});}
 fs.writeFileSync(path.join(c.internalDir,'预览检查.json'),JSON.stringify({passed:true,frames},null,2));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
