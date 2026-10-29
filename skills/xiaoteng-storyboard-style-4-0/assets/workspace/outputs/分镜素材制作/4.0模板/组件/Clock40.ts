import {STYLE40} from '../参数';
export type Cue40={text:string;startMs:number;endMs:number;precision?:string;tokens:readonly {text:string;startMs:number;endMs:number}[]};
export const frame40=(ms:number)=>{if(!Number.isFinite(ms))throw new Error('必须使用毫秒数值时间码');return Math.ceil(ms*(STYLE40.output.fps/1000));};
export const cueAt40=(cues:readonly Cue40[],index:number,word?:string)=>{
 const cue=cues[index];if(!cue)throw new Error('字幕编号不存在：'+index);if(!word)return cue.startMs;
 if(cue.precision==='sentence')throw new Error('只有句级时码，不能伪造词语触发时间：'+word);
 const full=cue.tokens.map(t=>t.text).join(''),pos=full.indexOf(word);if(pos<0)throw new Error('触发词不在字幕中：'+word);
 let length=0;for(const token of cue.tokens){if(length+token.text.length>pos)return token.startMs;length+=token.text.length;}
 throw new Error('无法定位词元：'+word);
};
