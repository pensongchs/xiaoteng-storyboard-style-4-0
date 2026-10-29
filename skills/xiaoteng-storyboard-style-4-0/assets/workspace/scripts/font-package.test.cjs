const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto');
const {root}=require('./runtime.cjs'),digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
test('新工程离线接入随包字体与使用说明，重复准备复用相同文件',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'style40-fonts-')),skill=path.join(temp,'skill'),source=path.join(skill,'assets/workspace'),project=path.join(temp,'学员 工程');
 try{
  fs.mkdirSync(path.join(skill,'scripts'),{recursive:true});fs.copyFileSync(path.resolve(root,'../../scripts/init-project.mjs'),path.join(skill,'scripts/init-project.mjs'));
  fs.mkdirSync(path.join(source,'scripts'),{recursive:true});for(const file of ['prepare.cjs','font-sources.json'])fs.copyFileSync(path.join(root,'scripts',file),path.join(source,'scripts',file));
  fs.cpSync(path.join(root,'resources'),path.join(source,'resources'),{recursive:true});fs.mkdirSync(path.join(source,'outputs/分镜素材制作/4.0模板/自制动效组件/S002_玻璃关键词系列/公共/素材'),{recursive:true});
  cp.execFileSync(process.execPath,[path.join(skill,'scripts/init-project.mjs'),project]);
  const prepare=()=>cp.execFileSync(process.execPath,['-e',"global.fetch=()=>{throw Error('字体准备不得联网')};require(process.argv[1]).prepare()",path.join(project,'scripts/prepare.cjs')]);
  prepare();const manifest=JSON.parse(fs.readFileSync(path.join(project,'scripts/font-sources.json'))),resources=[...manifest.files,manifest.license];
  for(const f of resources)for(const dir of ['resources/template-fonts','outputs/分镜素材制作/remotion-test/public/fonts','outputs/分镜素材制作/public/fonts'])assert.equal(digest(path.join(project,dir,f.file)),f.sha256);
  const file=path.join(project,'outputs/分镜素材制作/remotion-test/public/fonts',manifest.files[0].file),mtime=fs.statSync(file).mtimeMs;prepare();assert.equal(fs.statSync(file).mtimeMs,mtime);
  fs.unlinkSync(file);prepare();assert.equal(digest(file),manifest.files[0].sha256);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
