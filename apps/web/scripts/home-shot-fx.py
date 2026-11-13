# 사용법: python3 scripts/home-shot-fx.py public/home/flow2x  (화면 이미지 교체 뒤 다시 실행)
# 원본 화면 위 움직임 스펙(수동 영역) → 언어별 fx.json (덮개 색·글자 줄·게이지 길이는 언어별 이미지에서 자동 측정)
import sys, os, json
import numpy as np
from PIL import Image
F=(7,93)  # 화면 안쪽 가로
def R(y0,y1,x0=F[0],x1=F[1]): return [x0,y0,x1-x0,y1-y0]
SPEC={
 '01-5':[('auto',R(23,88.2))],
 '01-3':[('auto',R(19.5,88.2))],
 '03-1':[('auto',R(18.5,77),None,{'chart':('wipe',64)})],
 '04-2':[('pop',R(13.4,23,38,62),None,{'ring':1}),('auto',R(24.5,86.2))],
 '05-4':[('auto',R(16.5,97.5),None,{'chart':('rise',46)})],
 '04-6':[('auto',R(12.5,90))],
 '05-2':[('scan',R(6,74,6,94)),('tags',R(7.4,73.8,6,94)),('up',R(75.8,85.2))],
 '05-8':[('up',R(17.5,24.5)),('up',R(25.5,59.5)),('up',R(60,97),[('wipe',R(67,84.5,10,90))])],
 '05-10':[('auto',R(16.5,97.5),None,{'chart':('rise',49)})],
 '06-1':[('auto',R(15,88.8))],
 '07-2':[('pop',R(24.4,40.4,33,67),None,{'ring':1}),('auto',R(41,87))]+[('pulse',[c-3.4,67.3,6.8,3.6],None,{'round':1,'at':1.3+n*.16}) for n,c in enumerate((16.1,27.6,39,50.3,61.6,72.9))],
 '07-3':[('auto',R(15,80.5))],
 '07-7':[('auto',R(16.5,92.5))],
}
ADV={'tags':0,'up':.14,'pop':.22,'bar':.12,'wipe':.55,'rise':.45,'scan':.9,'pulse':.2}
def quant(px):
    k=px[:,0]*65536+px[:,1]*256+px[:,2]
    u,c=np.unique(k,return_counts=True); m=u[c.argmax()]; return '#%06x'%m, np.array([m>>16,(m>>8)&255,m&255])
def box(a,r):
    H,W=a.shape[:2]; x,y,w,h=r
    return int(round(W*x/100)),int(round(H*y/100)),int(round(W*(x+w)/100)),int(round(H*(y+h)/100))
def ring(a,r,p=7):
    x0,y0,x1,y1=box(a,r); H,W=a.shape[:2]
    parts=[a[max(0,y0-p):y0,x0:x1],a[y1:min(H,y1+p),x0:x1],a[y0:y1,max(0,x0-p):x0],a[y0:y1,x1:min(W,x1+p)]]
    return quant(np.concatenate([q.reshape(-1,3) for q in parts if q.size]))
def P(v,t): return round(v/t*100,3)
def runs(m,gap=0,minlen=1):
    out=[];s=None;last=None
    for i,v in enumerate(m):
        if v:
            if s is None: s=i
            elif i-last-1>gap: out.append((s,last)); s=i
            last=i
    if s is not None: out.append((s,last))
    return [r for r in out if r[1]-r[0]+1>=minlen]
def lines(a,r):
    H,W=a.shape[:2]; x0,y0,x1,y1=box(a,r); blk=a[y0:y1,x0:x1]
    hexc,loc=quant(blk.reshape(-1,3)); ink=np.abs(blk-loc).sum(2)>45
    L=[]
    for (r0,r1) in runs(ink.sum(1)>0,gap=3,minlen=8):
        cols=np.where(ink[r0:r1+1].any(0))[0]
        ya,yb=max(0,r0-6),min(blk.shape[0],r1+7); lc=quant(blk[ya:yb].reshape(-1,3))[0]
        L.append([P(x0+cols.min()-5,W),P(y0+ya,H),P(cols.max()-cols.min()+11,W),P(yb-ya,H),lc])
    return hexc,L
def bars(a,r):
    H,W=a.shape[:2]; x0,y0,x1,y1=box(a,r); blk=a[y0:y1,x0:x1]
    sat=(blk.max(2)-blk.min(2))>80
    out=[]
    for (r0,r1) in runs(sat.sum(1)>30,gap=1,minlen=6):
        if r1-r0+1>30: continue
        cols=runs(sat[r0:r1+1].mean(0)>0.5,gap=4,minlen=40)
        if not cols: continue
        c0,c1=max(cols,key=lambda t:t[1]-t[0])
        b=bar1(blk,r0,r1,c0,c1,x0,y0,W,H)
        if b: out.append(b)
    return out
def bar1(blk,r0,r1,c0,c1,x0,y0,W,H):
    def side(seg):
        if not seg.size: return None
        c,v=quant(seg.reshape(-1,3)); return c if (abs(v[0]-v[1])<12 and abs(v[1]-v[2])<12 and 60<v[0]<120) else None
    L=side(blk[r0:r1+1, max(0,c0-60):max(0,c0-3)]); Rr=side(blk[r0:r1+1, c1+4:c1+60])
    if not (L or Rr): return None
    rtl = bool(L and not Rr)
    tr = L if rtl else (Rr or '#565656')
    return {'r':[P(x0+c0,W),P(y0+r0-1,H),P(c1-c0+2,W),P(r1-r0+3,H)],'c':tr,'rtl':rtl}
def tags(a,r):
    H,W=a.shape[:2]; x0,y0,x1,y1=box(a,r); blk=a[y0:y1,x0:x1]
    wm=(blk.min(2)>232)
    out=[]
    for (r0,r1) in runs(wm.sum(1)>40,gap=2,minlen=18):
        for (c0,c1) in runs(wm[r0:r1+1].mean(0)>0.35,gap=12,minlen=40):
            out.append([P(x0+c0-2,W),P(y0+r0-2,H),P(c1-c0+5,W),P(r1-r0+5,H)])
    return out
def snap(a,r):
    H,W=a.shape[:2]; x0,y0,x1,y1=box(a,r)
    bgc=np.array([int(GBG[1:3],16),int(GBG[3:5],16),int(GBG[5:7],16)])
    clean=lambda y: (np.abs(a[y,x0:x1]-bgc).sum(1)>10).sum()<=2
    lim=int(H*.06)
    ya=next((y for y in range(y0,max(0,y0-lim),-1) if clean(y)),y0)
    yb=next((y for y in range(y1,min(H-1,y1+lim)) if clean(y)),y1)
    return [r[0],P(ya,H),r[2],P(yb-ya,H)]
def autos(a,r,opt):
    H,W=a.shape[:2]; x0,y0,x1,y1=box(a,r)
    bgc=np.array([int(GBG[1:3],16),int(GBG[3:5],16),int(GBG[5:7],16)])
    d=(np.abs(a[y0:y1,x0:x1]-bgc).sum(2)>10)
    bands=runs(d.sum(1)>3,gap=6,minlen=5)
    chart=opt.get('chart'); ci=None
    if chart:
        cand=[(i,b) for i,b in enumerate(bands) if (b[1]-b[0])>H*.1 and abs((y0+(b[0]+b[1])/2)/H*100-chart[1])<10]
        if cand: ci=max(cand,key=lambda t:t[1][1]-t[1][0])[0]
    items=[]
    for i,(b0,b1) in enumerate(bands):
        rr=[r[0],P(y0+b0-3,H),r[2],P(b1-b0+7,H)]
        if i==ci: items.append((chart[0],[8,rr[1],84,rr[3]])); continue
        blk=a[y0+b0:y0+b1+1,x0:x1]; cc,cv=quant(blk.reshape(-1,3))
        card=np.abs(cv-bgc).sum()>8; hh=(b1-b0)/H
        sat=((blk.max(2)-blk.min(2))>80).sum(1)>30
        if not card and hh>.06 and sat.sum()<3: items.append(('lines',rr)); continue
        kids=[('bars',None)]
        if card and hh>.09 and sat.sum()<3: kids.append(('lines',[r[0]+3,P(y0+b0+10,H),r[2]-6,P(b1-b0-18,H)]))
        items.append(('up',rr,kids,{'nosnap':1}))
    return items
def compile_one(a,items,t0,parent=None):
    out=[]; t=t0
    exp=[]
    for it in items:
        if it[0]=='auto': exp+=autos(a,it[1],it[3] if len(it)>3 else {})
        else: exp.append(it)
    for it in exp:
        k,r=it[0],it[1]; kids=it[2] if len(it)>2 and it[2] else []; opt=it[3] if len(it)>3 else {}
        if k=='up' and parent is None and not opt.get('ring') and not opt.get('nosnap'): r=snap(a,r)
        st=opt.get('at',t); o={'k':k,'r':r,'t':round(st,2)}
        if opt.get('round'): o['round']=1
        if k in('up','pop','wipe','rise'):
            o['c']=(GBG if k=='up' and not opt.get('ring') else ring(a,r)[0]) if k in('up','pop') else quant(a[box(a,r)[1]:box(a,r)[3],box(a,r)[0]:box(a,r)[2]].reshape(-1,3))[0]
        adv=ADV.get(k,.2)
        if k=='lines':
            c,L=lines(a,r); o['c']=c; o['L']=L; adv=.1+len(L)*.11
        if k=='bars':
            for n,b in enumerate(bars(a,parent['r'])):
                out.append({'k':'bar','t':round(st+n*.12,2),**b})
            t=st+.15; continue
        if k=='tags':
            o['k']='pulses'; o['T']=tags(a,r); adv=.2+len(o['T'])*.18
        if kids:
            o['kids'],kt=compile_one(a,kids,st+.3,o); adv=max(adv,kt-st)
        out.append(o)
        if 'at' not in opt: t=st+adv
    return out,t
root=sys.argv[1]
for loc in sorted(os.listdir(root)):
    d=f'{root}/{loc}'
    if not os.path.isdir(d): continue
    res={}
    for code,items in SPEC.items():
        a=np.asarray(Image.open(f'{d}/{code}.webp').convert('RGB')).astype(int)
        global GBG; GBG=quant(a[int(a.shape[0]*.1):int(a.shape[0]*.95),60:-60].reshape(-1,3))[0]
        res[code],_=compile_one(a,items,.15)
        def tmax(v): return max([x['t'] for x in v]+[tmax(x['kids']) for x in v if x.get('kids')])
        def scale(v,f):
            for x in v:
                x['t']=round(x['t']*f,2)
                if x.get('kids'): scale(x['kids'],f)
        m=tmax(res[code])
        if m>3.0: scale(res[code],3.0/m)
    json.dump(res,open(f'{d}/fx.json','w'),separators=(',',':'))
print('ok')
