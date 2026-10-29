"""核对每帧编码参考、静止文字缺失、卡片隔帧消失及后期字幕安全区。"""
from pathlib import Path
from collections import deque
import argparse,base64,hashlib,json,subprocess
import numpy as np
RENDERS=None
REFERENCE=None

def read_exact(stream,size):
    chunks=[];length=0
    while length<size:
        chunk=stream.read(size-length)
        if not chunk:break
        chunks.append(chunk);length+=len(chunk)
    return b''.join(chunks)

def stable(a,b):
    return a and b and max(abs(x-y) for x,y in zip(a['rect'],b['rect']))<.12 and a.get('color')==b.get('color')

def roi(image,rect,inset=0):
    x,y,w,h=rect
    x0=max(0,int(x/2)+inset);y0=max(0,int(y/2)+inset)
    x1=min(960,int((x+w)/2)-inset);y1=min(540,int((y+h)/2)-inset)
    return image[y0:y1,x0:x1]

def inspect_window(items,anomalies):
    if len(items)<3:return
    before,current=items[0],items[1]
    if current['meta'].get('transitions'):return  # 已登记的遮挡转场另验；编码前后像素仍逐帧核对
    for length in range(1,min(6,len(items)-2)+1):
        after=items[length+1]
        dg1=np.abs(current['grid']-before['grid']).mean(2)
        dg2=np.abs(current['grid']-after['grid']).mean(2)
        bridge=np.abs(before['grid']-after['grid']).mean(2)
        risk=np.minimum(dg1,dg2)
        if not np.any((risk>3)&(bridge<risk*.45)):continue
        for kind in ('texts','boxes'):
            old={x['key']:x for x in before['meta'].get(kind,[])}
            new={x['key']:x for x in after['meta'].get(kind,[])}
            for item in current['meta'].get(kind,[]):
                if not stable(item,old.get(item['key'])) or not stable(item,new.get(item['key'])):continue
                a=roi(before['image'],item['rect'],0 if kind=='texts' else 7)
                b=roi(current['image'],item['rect'],0 if kind=='texts' else 7)
                c=roi(after['image'],item['rect'],0 if kind=='texts' else 7)
                if a.size<30:continue
                if kind=='texts':
                    color=np.array(item['color'],np.float32)
                    na=np.abs(a.astype(np.float32)-color).mean(2)<25
                    nc=np.abs(c.astype(np.float32)-color).mean(2)<25
                    missing=na&nc&(np.abs(b.astype(np.float32)-color).mean(2)>45)
                    count=int(missing.sum());ink=int((na&nc).sum())
                    bad=count>=max(10,int(ink*.035))
                    score=count
                else:
                    means=[x.mean((0,1)) for x in (a,b,c)]
                    da=np.abs(means[1]-means[0]).mean();dc=np.abs(means[1]-means[2]).mean();outer=np.abs(means[0]-means[2]).mean()
                    bad=min(da,dc)>4 and outer<min(da,dc)*.4
                    score=round(float(min(da,dc)),2)
                if bad:
                    key=(current['meta']['frame'],kind,item['key'])
                    if key not in anomalies:anomalies[key]={'frame':key[0],'seconds':round(key[0]/30,3),'kind':kind,'text':item['key'],'length':length,'score':score,'rect':item['rect']}

def check_part(part,records):
    expected=part['durationFrames'];assert set(records)==set(range(expected)),f"{part['name']}的逐帧参考不完整"
    file=RENDERS/part['file']
    video_hash=subprocess.check_output(['ffmpeg','-v','error','-i',str(file),'-map','0:v:0','-c:v','copy','-f','hash','-hash','sha256','-']).decode().strip()
    reference_hash=hashlib.sha256(json.dumps(records,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
    code_hash=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    cache=Path(__import__('tempfile').gettempdir())/'student-video-quality-cache';cache.mkdir(exist_ok=True);cache_file=cache/(part['id']+'.json')
    key=[video_hash,reference_hash,code_hash]
    if cache_file.exists():
        saved=json.loads(cache_file.read_text())
        if saved['key']==key:return saved['result']
    process=subprocess.Popen(['ffmpeg','-v','error','-i',str(file),'-vf','format=rgb24','-pix_fmt','rgb24','-f','rawvideo','-'],stdout=subprocess.PIPE)
    windows=deque();anomalies={};encoding=[];unsafe=[];maximum=0.;total=0.;n=0
    xs=np.array([int((gx+(sx+.5)/5)*30) for gx in range(64) for sx in range(5)])
    ys=np.array([int((gy+(sy+.5)/5)*30) for gy in range(36) for sy in range(5)])
    while True:
        raw=read_exact(process.stdout,1920*1080*3)
        if not raw:break
        assert len(raw)==1920*1080*3,'视频解码帧不完整'
        assert n in records,'成片超过已验证的帧数'
        full=np.frombuffer(raw,np.uint8).reshape(1080,1920,3)
        image=full[::2,::2]
        # 与采集端使用完全相同的浮点坐标，避免稀疏取样在字缘偏移一像素。
        grid=full[ys[:,None],xs[None,:]].reshape(36,5,64,5,3).mean((1,3)).astype(np.float32)
        ref=np.frombuffer(base64.b64decode(records[n]['grid']),np.uint8).reshape(36,64,3).astype(np.float32)
        delta=np.abs(grid-ref).mean(2);peak=float(delta.max());mean=float(delta.mean());maximum=max(maximum,peak);total+=mean
        if peak>16 or mean>3:encoding.append({'frame':n,'maxTileDifference':round(peak,3),'meanDifference':round(mean,3)})
        for item in records[n].get('texts',[])+records[n].get('boxes',[]):
            if item['rect'][1]+item['rect'][3]>901:unsafe.append({'frame':n,'key':item['key'],'bottom':round(item['rect'][1]+item['rect'][3],2)})
        windows.append({'image':image,'grid':grid,'meta':records[n]})
        if len(windows)>=8:inspect_window(list(windows),anomalies);windows.popleft()
        n+=1
    while len(windows)>=3:inspect_window(list(windows),anomalies);windows.popleft()
    assert process.wait()==0 and n==expected,(n,expected)
    result={'file':part['file'],'videoPacketHash':video_hash,'frames':n,'referenceFrames':len(records),'encodingReference':{'meanTileDifference':round(total/n,3),'maximumTileDifference':round(maximum,3),'anomalies':encoding},'isolatedJumpCandidates':list(anomalies.values()),'subtitleSafeArea':{'topPixels':900,'violations':unsafe},'passed':not encoding and not anomalies and not unsafe}
    cache_file.write_text(json.dumps({'key':key,'result':result},ensure_ascii=False))
    return result

def verify(parts,reference,renders):
    global REFERENCE,RENDERS
    REFERENCE=Path(reference);RENDERS=Path(renders)
    data={p['id']:{} for p in parts}
    for line in REFERENCE.open():
        if not line.endswith('\n'):continue
        row=json.loads(line)
        if row['part'] not in data:continue
        previous=data[row['part']].get(row['frame'])
        assert not previous or previous['sha256']==row['sha256'],'相同时间码的像素参考冲突'
        data[row['part']][row['frame']]=row
    results=[]
    for part in parts:
        result=check_part(part,data[part['id']]);results.append(result)
        print(part['name'],'连续性',result['passed'],flush=True)
    return {'results':results,'passed':all(r['passed'] for r in results)}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('parts');parser.add_argument('reference');parser.add_argument('renders');parser.add_argument('output');args=parser.parse_args()
    report=verify(json.loads(Path(args.parts).read_text()),args.reference,args.renders)
    Path(args.output).write_text(json.dumps(report,ensure_ascii=False,indent=2))
    if not report['passed']:raise SystemExit('画面稳定性检查未通过，禁止正式交付')
