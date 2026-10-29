import {STYLE40} from './参数';
export const frame40=(ms:number)=>{if(!Number.isFinite(ms))throw new Error('必须使用毫秒数值时间码');return Math.ceil(ms*(STYLE40.output.fps/1000));};
