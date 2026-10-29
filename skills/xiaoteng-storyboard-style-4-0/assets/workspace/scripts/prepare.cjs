const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'outputs/分镜素材制作/remotion-test/public');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function copyIfChanged(source,dest){
 if(fs.existsSync(dest)&&digest(fs.readFileSync(source))===digest(fs.readFileSync(dest)))return;
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest);
}
function prepare(){
 const source=JSON.parse(fs.readFileSync(path.join(__dirname,'font-sources.json'),'utf8')),bundled=path.join(root,source.bundledDirectory),resources=[...source.files,...(source.license?[source.license]:[])];
 for(const f of resources){
  const file=path.join(bundled,f.file);
  if(!fs.existsSync(file)||digest(fs.readFileSync(file))!==f.sha256)throw Error('随包字体或使用说明缺失、摘要不符，请重新取得完整Skill：'+f.file);
  copyIfChanged(file,path.join(pub,'fonts',f.file));
  copyIfChanged(file,path.join(root,'outputs/分镜素材制作/public/fonts',f.file));
 }
 const materials=path.join(root,'outputs/分镜素材制作/4.0模板/自制动效组件/S002_玻璃关键词系列/公共/素材'),dest=path.join(pub,'系列素材/S002_玻璃关键词系列');
 fs.mkdirSync(dest,{recursive:true});for(const file of fs.readdirSync(materials))if(/\.(png|svg|jpe?g)$/.test(file))copyIfChanged(path.join(materials,file),path.join(dest,file));
 console.log('随包字体与系列公共素材准备完成');
}
module.exports={prepare};
if(require.main===module)try{prepare();}catch(e){console.error(e.message);process.exitCode=1;}
