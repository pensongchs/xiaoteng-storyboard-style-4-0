import React from 'react';
import {STYLE40 as S} from '../参数';
import {continueRender,delayRender,cancelRender,staticFile} from 'remotion';
import {glassVertex,glassFragment,plasmaVolume,plasmaComposite,wavesField,wavesMark,specularFragment} from './Shaders40';

// 原库 036 / 037 / 038 / 042 的着色器按视频帧驱动；不使用网页时钟。
export const AssetContext=React.createContext<string|null>(null);
export const BackdropContext=React.createContext({g:0,texture:'intro',index:0});
type GPU={gl:WebGL2RenderingContext;vao:WebGLVertexArrayObject;programs:Map<string,WebGLProgram>;textures:WebGLTexture[];output:HTMLCanvasElement};
let sharedGPU:GPU|undefined;
const blurred=new WeakMap<HTMLCanvasElement,{g:number;canvas:HTMLCanvasElement}>();
const images=new Map<string,Promise<HTMLImageElement>>();
const picture=(url:string)=>{if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('玻璃取样素材加载失败：'+url));im.src=url;}));return images.get(url)!;};
const program=(gpu:GPU,fragment:string)=>{
 if(gpu.programs.has(fragment))return gpu.programs.get(fragment)!;
 const gl=gpu.gl,pr=gl.createProgram()!;
 for(const [type,code] of [[gl.VERTEX_SHADER,glassVertex],[gl.FRAGMENT_SHADER,fragment]] as const){const sh=gl.createShader(type)!;gl.shaderSource(sh,code);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh)??'shader');gl.attachShader(pr,sh);gl.deleteShader(sh);}
 gl.bindAttribLocation(pr,0,'aPosition');gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr)??'link');gpu.programs.set(fragment,pr);return pr;
};
const getGPU=(canvas:HTMLCanvasElement)=>{
 if(!sharedGPU){
  const work=document.createElement('canvas');
  const gl=work.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true})!;if(!gl)throw new Error('当前渲染器不支持玻璃材质');
  const vao=gl.createVertexArray()!,buf=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);sharedGPU={gl,vao,programs:new Map(),textures:[],output:canvas};
 }
 // 所有材质共用一个离屏GPU画布，结果复制到独立二维画面；避免多上下文丢失。
 const gpu=sharedGPU,work=gpu.gl.canvas as HTMLCanvasElement;if(work.width!==canvas.width)work.width=canvas.width;if(work.height!==canvas.height)work.height=canvas.height;gpu.output=canvas;return gpu;
};
const useProgram=(gpu:GPU,fragment:string)=>{const pr=program(gpu,fragment);gpu.gl.useProgram(pr);return (name:string)=>gpu.gl.getUniformLocation(pr,name);};
const texture=(gpu:GPU,slot:number,source?:TexImageSource,w=1,h=1)=>{
 const {gl}=gpu;gl.activeTexture(gl.TEXTURE0+slot);let t=gpu.textures[slot];if(!t){t=gl.createTexture()!;gpu.textures[slot]=t;}gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 if(source)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);return t;
};
// CPU像素拥有独立内存，避免复用WebGL画布后旧纹理仍被延迟合成。
const draw=(gpu:GPU,w:number,h:number)=>{
 const gl=gpu.gl;gl.viewport(0,0,w,h);gl.bindVertexArray(gpu.vao);gl.drawArrays(gl.TRIANGLES,0,3);
 if(gl.getParameter(gl.FRAMEBUFFER_BINDING)!==null)return;
 gl.finish();if(gl.isContextLost())throw new Error('材质绘制上下文失效');
 const raw=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
 if(gl.getError()!==gl.NO_ERROR)throw new Error('材质像素读取失败');
 const ctx=gpu.output.getContext('2d',{willReadFrequently:true})!,pixels=ctx.createImageData(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const from=((h-1-y)*w+x)*4,to=(y*w+x)*4,alpha=raw[from+3];
  pixels.data[to]=alpha?Math.min(255,Math.round(raw[from]*255/alpha)):0;
  pixels.data[to+1]=alpha?Math.min(255,Math.round(raw[from+1]*255/alpha)):0;
  pixels.data[to+2]=alpha?Math.min(255,Math.round(raw[from+2]*255/alpha)):0;
  pixels.data[to+3]=alpha;
 }
 ctx.putImageData(pixels,0,0);
 gpu.output.dataset.sixRasterReady=gpu.output.closest<HTMLElement>('[data-six-source-frame]')?.dataset.sixSourceFrame??'';
};
const dispose=(_canvas:HTMLCanvasElement|null)=>{};

export const LibraryBackground=({g,index,kind}:{g:number;index:number;kind:'036'|'038'})=>{
 const ref=React.useRef<HTMLCanvasElement>(null);
 React.useLayoutEffect(()=>{
  const canvas=ref.current!;const gpu=getGPU(canvas),gl=gpu.gl,t=g/S.output.fps*.32+index*1.71;
  if(kind==='036'){
   const tw=480,th=270;texture(gpu,0,undefined,tw,th);const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,gpu.textures[0],0);
   const u=useProgram(gpu,plasmaVolume);gl.uniform2f(u('uView'),1280,720);gl.uniform2f(u('uScale'),1280/tw,720/th);gl.uniform1f(u('uZoom'),1.15);gl.uniform1f(u('uTime'),t);gl.uniform1f(u('uTwist'),.85);gl.uniform1f(u('uWave'),.34);gl.uniform1f(u('uSharpness'),55);gl.uniform2f(u('uOrbit'),.11*Math.sin(t*.22),.06*Math.cos(t*.17));gl.uniform1f(u('uDither'),0);draw(gpu,tw,th);
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);const c=useProgram(gpu,plasmaComposite),base=[166/255,163/255,184/255];gl.uniform1i(c('uVolume'),0);gl.uniform2f(c('uResolution'),960,540);gl.uniform3fv(c('uColor'),base);gl.uniform3fv(c('uHighlight'),base.map(v=>v+(1-v)*.85));gl.uniform3f(c('uInk'),.1,.09,.12);gl.uniform1f(c('uGain'),4.1);gl.uniform1f(c('uShine'),.025);gl.uniform1f(c('uPresence'),1);gl.uniform1f(c('uGrain'),.012);gl.uniform1f(c('uFade'),0);gl.uniform1f(c('uOpacity'),.58);gl.uniform1f(c('uTime'),t);gl.uniform1f(c('uLightMode'),0);gl.uniform3f(c('uHeat'),480,270,0);draw(gpu,960,540);gl.deleteFramebuffer(fb);
  }else{
   const pitch=index%2?12:10,cols=Math.ceil(960/pitch)+1,rows=Math.ceil(540/pitch)+2;
   texture(gpu,0,undefined,cols,rows);const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,gpu.textures[0],0);texture(gpu,1,undefined);
   const u=useProgram(gpu,wavesField),dir=(index*17+20)*Math.PI/180;
   gl.uniform2f(u('uSize'),960,540);gl.uniform1f(u('uDpr'),1);gl.uniform2f(u('uOrigin'),0,0);gl.uniform2f(u('uPitch'),pitch,pitch);gl.uniform1i(u('uWave'),index%3===0?1:0);gl.uniform1f(u('uTime'),t);gl.uniform1f(u('uUnit'),520);gl.uniform2f(u('uHeading'),Math.cos(dir),Math.sin(dir));gl.uniform1f(u('uAmp'),1);gl.uniform1f(u('uDepth'),.82);gl.uniform3f(u('uLight'),-.6,-.5,.62);gl.uniform1f(u('uShine'),.8);gl.uniform1f(u('uContrast'),1.2);gl.uniform1f(u('uInk'),0);gl.uniform1f(u('uOpacity'),.72);gl.uniform1i(u('uFade'),1);gl.uniform1f(u('uFadeSize'),.55);gl.uniform1f(u('uAppear'),1);gl.uniform1i(u('tRipple'),1);gl.uniform1f(u('uRipple'),0);draw(gpu,cols,rows);
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,gpu.textures[0]);const c=useProgram(gpu,wavesMark);gl.uniform1i(c('tField'),0);gl.uniform1i(c('tAtlas'),1);gl.uniform2f(c('uOrigin'),0,0);gl.uniform2f(c('uPitch'),pitch,pitch);gl.uniform2f(c('uGrid'),cols,rows);gl.uniform1i(c('uPattern'),index%4===0?2:0);gl.uniform1f(c('uMarkSize'),.95);gl.uniform1f(c('uStroke'),1.1);gl.uniform3f(c('uColor'),1,1,1);gl.uniform3f(c('uAccent'),1,1,1);gl.uniform4f(c('uBackground'),.065,.06,.075,1);gl.uniform3f(c('uAtlas'),1,1,0);draw(gpu,960,540);gl.deleteFramebuffer(fb);
  }
 },[g,index,kind]);
 React.useEffect(()=>{const el=ref.current;return()=>dispose(el);},[]);
 return <canvas ref={ref} data-six-background={kind} data-six-raster="background" data-library={kind} width={960} height={540} style={{position:'absolute',inset:0,width:1280,height:720}}/>;
};

// 037: 原始 RGB 色散折射内核及位移图；取样材质单独渲染，文字始终在清晰平面。
export const LiquidSurface=({w,h,r=S.glass.radius as number,tint=S.glass.tint as string}:{w:number;h:number;r?:number;tint?:string})=>{
 const root=React.useContext(AssetContext);if(!root)throw new Error('缺少正式素材目录');
 const {g,texture:photo,index}=React.useContext(BackdropContext),ref=React.useRef<HTMLCanvasElement>(null);
 const handle=React.useMemo(()=>delayRender('液态玻璃取样'),[g,photo,w,h]);
 React.useLayoutEffect(()=>{
  let active=true;
  const map=`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="r" x1="100%" x2="0%"><stop stop-color="#0000"/><stop offset="1" stop-color="red"/></linearGradient><linearGradient id="b" x2="0%" y2="100%"><stop stop-color="#0000"/><stop offset="1" stop-color="blue"/></linearGradient><filter id="s"><feGaussianBlur stdDeviation="5"/></filter></defs><rect width="100%" height="100%" fill="black"/><rect width="100%" height="100%" rx="${r}" fill="url(#r)"/><rect width="100%" height="100%" rx="${r}" fill="url(#b)" style="mix-blend-mode:screen"/><rect x="${h*.035}" y="${h*.035}" width="${w-h*.07}" height="${h*.93}" rx="${r}" fill="hsl(0 0% 50% / .93)" filter="url(#s)"/></svg>`;
  Promise.all([picture(staticFile(root+'/glass/'+photo+'.jpg')),picture('data:image/svg+xml,'+encodeURIComponent(map))]).then(([im,dm])=>{
   if(!active)return;const el=ref.current!,gpu=getGPU(el),gl=gpu.gl;gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,0);
   const live=el.closest('[data-six-plane]')!.querySelector<HTMLCanvasElement>('[data-six-background]');
   let sample:TexImageSource=im;
   if(live){let cache=blurred.get(live);if(!cache||cache.g!==g){const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;const ctx=canvas.getContext('2d')!;ctx.filter='blur(9px)';ctx.drawImage(live,-18,-18,676,396);cache={g,canvas};blurred.set(live,cache);}sample=cache.canvas;}
   texture(gpu,0,sample);texture(gpu,1,dm);const u=useProgram(gpu,glassFragment),plane=el.closest('[data-six-plane]')!.getBoundingClientRect(),rect=el.getBoundingClientRect();
   gl.uniform1i(u('uBackdrop'),0);gl.uniform1i(u('uMap'),1);gl.uniform2f(u('uCanvas'),el.width,el.height);gl.uniform2f(u('uSize'),w,h);gl.uniform2f(u('uOrigin'),(rect.left-plane.left)/plane.width,(rect.top-plane.top)/plane.height);gl.uniform2f(u('uStep'),1/1280,1/720);gl.uniform3f(u('uScale'),-38,-28,-18);gl.uniform2i(u('uChannel'),0,2);gl.uniform1f(u('uSpread'),0);gl.uniform1f(u('uLod'),0);gl.uniform1f(u('uSaturation'),S.glass.saturation);draw(gpu,el.width,el.height);continueRender(handle);
  }).catch(cancelRender);
  return()=>{active=false;continueRender(handle);};
 },[g,photo,w,h,r,handle,root]);
 React.useEffect(()=>{const el=ref.current;return()=>dispose(el);},[]);
 const t=g/150+index*.64,lx=22+16*Math.sin(t),ly=12+12*Math.cos(t*.73);
 return <div data-library="037" style={{position:'absolute',inset:0,borderRadius:r,overflow:'hidden',pointerEvents:'none',boxShadow:S.glass.shadow,border:S.glass.border,boxSizing:'border-box'}}>
  <canvas ref={ref} data-six-raster="glass" width={Math.ceil(w)} height={Math.ceil(h)} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:S.glass.opacity}}/>
  <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse at ${lx}% ${ly}%,#ffffff35,transparent 74%),radial-gradient(ellipse at ${80-lx*.3}% 105%,${tint}55,transparent 82%),linear-gradient(145deg,${tint}44,${tint}22 72%,#17171a24)`,opacity:1}}/>
  <div style={{position:'absolute',inset:0,borderRadius:r,background:`radial-gradient(ellipse 85% 90% at ${lx}% 0%,#ffffff1f,transparent 74%),radial-gradient(ellipse 80% 110% at 95% ${70-ly}%,${tint}2b,transparent 82%)`,boxShadow:`inset 0 0 ${h*.18}px #ffffff08`}}/>
 </div>;
};

export const SpecularRim=({g,w,h,r=S.glass.radius as number}:{g:number;w:number;h:number;r?:number})=>{
 const ref=React.useRef<HTMLCanvasElement>(null);
 React.useLayoutEffect(()=>{const canvas=ref.current!,gpu=getGPU(canvas),gl=gpu.gl,u=useProgram(gpu,specularFragment);gl.uniform2f(u('uCenter'),w/2+24,h/2+24);gl.uniform2f(u('uHalf'),w/2,h/2);gl.uniform1f(u('uRadius'),r);gl.uniform1f(u('uPx'),1);gl.uniform1f(u('uSpot'),(g/S.output.fps*.35/(Math.PI*2))%1);gl.uniform2f(u('uEntry'),w*.28,h*.13);gl.uniform3f(u('uLineColor'),1,1,1);gl.uniform3f(u('uBaseColor'),.322,.322,.322);gl.uniform1f(u('uIntensity'),.8);gl.uniform2f(u('uWindow'),10/360,34/360);gl.uniform1f(u('uThickness'),1.2);gl.uniform1f(u('uGlow'),1);draw(gpu,w+48,h+48);},[g,w,h,r]);
 React.useEffect(()=>{const el=ref.current;return()=>dispose(el);},[]);
 return <canvas ref={ref} data-six-raster="rim" data-library="042" width={w+48} height={h+48} style={{position:'absolute',left:-24,top:-24,width:w+48,height:h+48,pointerEvents:'none'}}/>;
};
