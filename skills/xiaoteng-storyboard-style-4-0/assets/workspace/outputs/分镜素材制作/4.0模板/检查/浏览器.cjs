const fs=require('node:fs'),path=require('node:path');
const {ensureBrowser,openBrowser}=require('@remotion/renderer');
module.exports.open=async()=>{
 const state=await ensureBrowser({chromeMode:'headless-shell',...(process.env.REMOTION_BROWSER_EXECUTABLE?{browserExecutable:process.env.REMOTION_BROWSER_EXECUTABLE}:{}),logLevel:'error'});
 if(!('path'in state))throw Error('未找到兼容的无头浏览器');let executable=state.path;
 if(process.platform!=='win32'){
  const dir=path.resolve(__dirname,'../../../../.runtime');fs.mkdirSync(dir,{recursive:true});
  const wrapper=path.join(dir,'browser.sh'),quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
  fs.writeFileSync(wrapper,'#!/bin/sh\nexec '+quote(executable)+' --disable-gpu-compositing --disable-gpu-rasterization --disable-oop-rasterization --run-all-compositor-stages-before-draw --disable-threaded-animation --disable-threaded-scrolling --disable-partial-raster "$@"\n',{mode:0o755});executable=wrapper;
 }
 return openBrowser('chrome',{browserExecutable:executable,chromeMode:'headless-shell',chromiumOptions:{gl:'angle'},logLevel:'error'});
};
