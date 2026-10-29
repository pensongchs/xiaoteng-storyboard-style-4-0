const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const {toViteFileUrl}=await import(pathToFileURL(path.resolve(__dirname,'../outputs/分镜素材制作/scripts/vite-file-url.mjs')));
 const cases=[['/Users/student/我的 视频.mp4','/@fs/Users/student/'],['C:\\Users\\student\\我的 视频.mp4','/@fs/C:/Users/student/'],['D:/学习目录/My Video.mp4','/@fs/D:/']];
 for(const [file,prefix]of cases){const url=toViteFileUrl(file,'abc123');assert(url.startsWith(prefix));assert(!url.includes(' '));assert(!url.includes('\\'));assert(url.endsWith('?v=abc123'));assert(decodeURIComponent(url.split('?')[0]).endsWith(file.replaceAll('\\','/').replace(/^[A-Za-z]:/,m=>m)));}
 console.log('Windows与POSIX路径、中文、空格和SHA缓存参数检查通过');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
