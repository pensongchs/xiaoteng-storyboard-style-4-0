import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const skill=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),source=path.join(skill,'assets/workspace');
const target=process.argv[2]&&path.resolve(process.argv[2]),resume=process.argv.includes('--resume');
if(!target||target===source||target.startsWith(source+path.sep))throw Error('请指定独立学员工程目录');
const marker=path.join(target,'.student-template.json');
if(fs.existsSync(target)&&fs.readdirSync(target).length){if(!resume||!fs.existsSync(marker)||JSON.parse(fs.readFileSync(marker)).skill!=='xiaoteng-storyboard-style-4-0')throw Error('目标目录非空；请新建目录，续接本学员工程时使用--resume');}
fs.mkdirSync(target,{recursive:true});
fs.cpSync(source,target,{recursive:true,force:false,errorOnExist:false,filter:src=>{const parts=path.relative(source,src).split(path.sep);return !parts.some(p=>['node_modules','.runtime','.git','review-sessions','renders','内部检查'].includes(p))&&!parts.includes('fonts');}});
fs.writeFileSync(marker,JSON.stringify({skill:'xiaoteng-storyboard-style-4-0',version:'1.0.0'},null,2)+'\n');
console.log('学员工程已准备：'+target);
