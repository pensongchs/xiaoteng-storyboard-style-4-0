const fs=require('node:fs'),path=require('node:path');
const{demand}=require('./检查/公共.cjs');
const[input,output]=process.argv.slice(2);demand(input&&output,'用法：准备输入.cjs 输入.srt 输出.json');
const text=fs.readFileSync(input,'utf8').replace(/^\uFEFF/,'').replace(/\r/g,'');
const ms=t=>{const m=t.match(/^(\d+):(\d+):(\d+)[,.](\d{3})$/);demand(m,'SRT时间格式无效：'+t);return ((Number(m[1])*60+Number(m[2]))*60+Number(m[3]))*1000+Number(m[4]);};
const cues=text.trim().split(/\n\s*\n/).map(block=>{const lines=block.split('\n'),i=lines.findIndex(l=>l.includes('-->'));demand(i>=0,'SRT缺少时码');const[a,b]=lines[i].split('-->').map(s=>s.trim().split(/\s+/)[0]),startMs=ms(a),endMs=ms(b),text=lines.slice(i+1).join('\n');demand(text&&endMs>startMs,'字幕为空或结束早于开始');return{text,startMs,endMs,precision:'sentence',tokens:[{text,startMs,endMs}]};});
fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});fs.writeFileSync(output,JSON.stringify(cues,null,2));console.log('已保留'+cues.length+'条句级时码；未推算词级时间');
