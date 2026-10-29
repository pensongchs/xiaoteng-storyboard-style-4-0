const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'outputs/分镜素材制作/remotion-test/public');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function extract(zip,suffix){
 let eocd=-1;for(let i=zip.length-22;i>=Math.max(0,zip.length-65558);i--)if(zip.readUInt32LE(i)===0x06054b50){eocd=i;break;}
 if(eocd<0)throw Error('字体包不是有效ZIP');let p=zip.readUInt32LE(eocd+16);
 for(let i=0;i<zip.readUInt16LE(eocd+10);i++){
  if(zip.readUInt32LE(p)!==0x02014b50)throw Error('字体ZIP目录损坏');
  const method=zip.readUInt16LE(p+10),size=zip.readUInt32LE(p+20),n=zip.readUInt16LE(p+28),extra=zip.readUInt16LE(p+30),comment=zip.readUInt16LE(p+32),offset=zip.readUInt32LE(p+42),name=zip.toString('utf8',p+46,p+46+n);
  if(name.endsWith('/'+suffix)||name===suffix||(suffix.startsWith('.')&&name.endsWith(suffix))){const start=offset+30+zip.readUInt16LE(offset+26)+zip.readUInt16LE(offset+28),body=zip.subarray(start,start+size);return method===0?body:method===8?zlib.inflateRawSync(body):(()=>{throw Error('字体压缩方式不支持');})();}p+=46+n+extra+comment;
 }throw Error('字体包内未找到：'+suffix);
}
(async()=>{
 const source=JSON.parse(fs.readFileSync(path.join(__dirname,'font-sources.json'),'utf8')),fontDir=path.join(pub,'fonts');fs.mkdirSync(fontDir,{recursive:true});
 const resources=[...source.files,...(source.license?[source.license]:[])];
 const needed=resources.filter(f=>!fs.existsSync(path.join(fontDir,f.file))||digest(fs.readFileSync(path.join(fontDir,f.file)))!==f.sha256);
 if(needed.length){console.log('下载官方字体依赖');const response=await fetch(source.url);if(!response.ok)throw Error('字体下载失败：'+response.status);const zip=Buffer.from(await response.arrayBuffer());if(digest(zip)!==source.sha256)throw Error('官方字体包摘要变化，请核验来源后更新清单');for(const f of needed){const bytes=extract(zip,f.suffix||f.file);if(digest(bytes)!==f.sha256)throw Error('字体摘要不符：'+f.file);fs.writeFileSync(path.join(fontDir,f.file),bytes);}}
 const materials=path.join(root,'outputs/分镜素材制作/4.0模板/自制动效组件/S002_玻璃关键词系列/公共/素材'),dest=path.join(pub,'系列素材/S002_玻璃关键词系列');fs.mkdirSync(dest,{recursive:true});for(const file of fs.readdirSync(materials))if(/\.(png|svg|jpe?g)$/.test(file))fs.copyFileSync(path.join(materials,file),path.join(dest,file));
 const reviewFonts=path.join(root,'outputs/分镜素材制作/public/fonts');fs.mkdirSync(reviewFonts,{recursive:true});for(const f of resources)fs.copyFileSync(path.join(fontDir,f.file),path.join(reviewFonts,f.file));
 console.log('字体与系列公共素材准备完成');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
