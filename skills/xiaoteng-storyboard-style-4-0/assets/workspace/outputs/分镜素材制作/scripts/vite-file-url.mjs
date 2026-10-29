export function toViteFileUrl(filePath,sha256){
 const normalized=filePath.replaceAll('\\','/');
 const escaped=normalized.split('/').map(part=>/^[A-Za-z]:$/.test(part)?part:encodeURIComponent(part)).join('/');
 return '/@fs'+(escaped.startsWith('/')?'':'/')+escaped+'?v='+encodeURIComponent(sha256);
}
