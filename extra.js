(()=>{
const $=s=>document.querySelector(s),Q=s=>document.querySelectorAll(s);
const E=(t,h)=>{const e=document.createElement(t);e.innerHTML=h||'';return e};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const loc=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const gap=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);
let P={},PH={},V=null,M={},q=[],qi=0,ri=0,rr=0,playing=false;
const A=new Audio();

document.head.appendChild(E('style',`
.w.m{text-decoration:underline dotted var(--accent) 2px;text-underline-offset:.3em}
.w.hid:not(.r).m{text-decoration:none}
.w.pl{background:var(--tint);border-radius:.18em}
#aud{display:none}#aud.on{display:flex}
dialog hr{border:0;border-top:1px solid var(--line)}
dialog .row button[data-p]{min-height:34px}
.mk{position:absolute;direction:rtl;white-space:nowrap;font:calc(var(--fs,40px)*.38)/1.1 Khatt,serif;color:var(--accent);z-index:3;pointer-events:none;min-width:1.6em}
.mk.out-left{right:100%;margin-right:7px;text-align:right}
.mk.out-right{left:100%;margin-left:7px;text-align:left}
.g{font:26px Khatt,serif;display:inline-block;min-width:1.6em;text-align:center;color:var(--ink)}
.df{color:#d9534f;font-weight:700}
.dim{opacity:.5}
.ar.sm{font-size:24px}
.key{font-size:.8rem}
.wg{display:flex;flex-wrap:wrap;direction:rtl;gap:6px}
.wc{text-align:center;border:1px solid var(--line);border-radius:8px;padding:4px 8px;min-width:64px}
.wc.sel{background:var(--tint);border-color:var(--accent)}
.wc .a{font:26px/1.8 Khatt,serif;color:var(--ink)}
.wc small{display:block;font-size:.8rem;line-height:1.3;color:var(--muted)}
.wc .u{direction:rtl;font-size:.95rem;color:var(--ink)}
.wc .e{direction:ltr}
.wc.big{display:inline-block;padding:8px 18px}.wc.big .a{font-size:40px}.wc.big small{font-size:1rem}
.ur{direction:rtl;font-size:1.15rem;line-height:1.9;color:var(--ink)!important}
input[type=checkbox]{min-height:auto;width:20px;height:20px}
.hl{background:var(--tint);color:var(--accent);border-radius:.2em}
dialog{max-height:88vh;overflow:auto}
.theme-item{display:block;width:100%;text-align:left;margin:7px 0;padding:10px;min-height:auto;white-space:normal}.theme-item b{display:block;color:var(--ink);font-weight:650}.theme-item span,.theme-item small{display:block;margin-top:4px;color:var(--muted);line-height:1.4}.theme-item small{font-size:.78rem}.theme-item:hover{border-color:var(--accent);background:var(--tint)}
.ar{font:28px/1.9 Khatt,serif;direction:rtl;color:var(--ink)!important}
`));

/* ---------- colours and page direction ---------- */
const PRE={Light:['#e8eeeb','#ffffff','#14231f','#0e5a4a'],Sepia:['#e9dcc3','#f6ecd6','#3b2f1e','#7a4a1c'],Dark:['#0d1513','#15201d','#e6efe9','#5fc3a6'],Black:['#000000','#000000','#e8e8e8','#5fc3a6']};
const cur=()=>{const g=k=>getComputedStyle(document.documentElement).getPropertyValue('--'+k).trim();return{bg:g('bg'),paper:g('paper'),ink:g('ink'),accent:g('accent')}};
function theme(){
  const r=document.documentElement.style,T=H.S.theme,ltr=false;
  ['bg','paper','ink','accent'].forEach(k=>T?r.setProperty('--'+k,T[k]):r.removeProperty('--'+k));
  [['--mask',18],['--tint',12]].forEach(([p,n])=>T?r.setProperty(p,'color-mix(in srgb,'+T.ink+' '+n+'%,transparent)'):r.removeProperty(p));
  document.documentElement.dataset.dir='ar';
  $('#nx').textContent=ltr?'Next page \u25B6':'\u25C0 Next page';
  $('#pv').textContent=ltr?'\u25C0 Previous page':'Previous page \u25B6';
  const c=cur();$('#cb').value=c.bg;$('#cp').value=c.paper;$('#ct').value=c.ink;
}
const dlg=$('#dlg');
dlg.insertBefore(E('div',`<h2>Meanings</h2><p>Tap a word to see these.</p><div class="row"><label><input type="checkbox" id="lwu"> Word: Urdu</label><label><input type="checkbox" id="lwe"> Word: English</label><label><input type="checkbox" id="ltu"> Translation: Urdu</label><label><input type="checkbox" id="lte"> Translation: English</label></div>`),dlg.children[0]);
['wu','we','tu','te'].forEach(id=>{const c=$('#l'+id);c.checked=(H.S.lg||{})[id]!=0;c.onchange=()=>{H.S.lg=Object.assign({wu:1,we:1,tu:1,te:1},H.S.lg||{});H.S.lg[id]=c.checked?1:0;H.save()}});
dlg.insertBefore(E('div',`<h2>Display</h2>
<div class="row"><label>Theme <select id="th"><option value="">Auto (device)</option>${Object.keys(PRE).map(k=>`<option>${k}</option>`).join('')}</select></label></div>
<div class="row"><label>Screen <input type="color" id="cb"></label><label>Page <input type="color" id="cp"></label><label>Text <input type="color" id="ct"></label></div>
<h2>Signs guide</h2><p><span class="g">\u06D8</span> Stop here (م)</p><p><span class="g">\u06D9</span> Do not stop (لا)</p><p><span class="g">\u06D7</span> Stopping is better (قلے)</p><p><span class="g">\u06D6</span> Continuing is better (صلے)</p><p><span class="g">\u06DA</span> Stop or continue, both fine (ج)</p><p><span class="g">\u0615</span> Stopping is fine (ط)</p><p><span class="g">\u06DB</span> Stop at one of the two dots, not both (معانقہ)</p><p><span class="g">\u06E9</span> Sajdah: prostration</p><p><span class="g">\u0639</span> Ruku ends here; the number counts rukus in the surah</p><h2>Mutashabihat</h2><p id="mst"></p>
<div class="row"><label>Import JSON <input type="file" id="mi" accept=".json,application/json"></label></div>`),dlg.children[0]);
$('#th').onchange=e=>{const v=e.target.value;H.S.theme=v?{bg:PRE[v][0],paper:PRE[v][1],ink:PRE[v][2],accent:PRE[v][3]}:null;H.save();theme()};
['cb','cp','ct'].forEach((id,i)=>$('#'+id).oninput=e=>{const T=H.S.theme||cur();T[['bg','paper','ink'][i]]=e.target.value;H.S.theme=T;H.save();theme()});

/* ---------- verse index ---------- */
function build(){
  V={};let ck='',cc=0;
  H.D.pages.forEach((L,i)=>L.forEach(l=>{
    if(l[0])return;let[s,a]=l[3].split(':').map(Number);
    if(l[3]!=ck){ck=l[3];cc=0}
    l[4]=l[2].split(' ').map(w=>{const k=s+':'+a,v=V[k]||(V[k]={p:i+1,t:[]});
      if(w.charCodeAt(0)!=0x6dd){v.t.push(w);return ++cc}
      a++;cc=0;ck=s+':'+a;return 0});
  }));
}
function tag(){
  [[H.el,H.page],[$('#page2'),H.page+1]].forEach(([pe,pn])=>{
    if(pe.hidden)return;const ls=pe.querySelectorAll('.page-frame > .line');
    H.D.pages[pn-1].forEach((l,i)=>{if(l[0]||!ls[i])return;ls[i].querySelectorAll('.w').forEach((w,j)=>{w.dataset.i=l[4][j]})});
  });
}
const pk=()=>[...new Set([...Q('.page .w[data-v]')].map(w=>w.dataset.v))].sort((a,b)=>{const[x,y]=a.split(':'),[u,v]=b.split(':');return x-u||y-v});
const nm=k=>H.D.surahs[k.split(':')[0]-1]+' '+k;

/* ---------- mutashabihat ---------- */
const norm=k=>{const m=String(k).match(/(\d+)\D+(\d+)/);return m?+m[1]+':'+ +m[2]:null};
function setP(j){
  PH=j.phrases;P={};
  Object.entries(PH).forEach(([id,o])=>Object.entries(o).forEach(([k,rs])=>rs.forEach(r=>(P[k]=P[k]||[]).push([r[0],r[1],id]))));
  $('#mst').textContent=Object.keys(PH).length+' phrases loaded, '+Object.keys(P).length+' ayahs marked.';
  V&&hook();
}
const cov=(k,i)=>(P[k]||[]).filter(r=>i>=r[0]&&i<=r[1]);
const srt=(a,b)=>{const[x,y]=a.split(':'),[u,v]=b.split(':');return x-u||y-v};
function setM(j){
  const f0=j&&!Array.isArray(j)?Object.values(j)[0]:0;
  if(f0&&f0.ayah)j={phrases:Object.fromEntries(Object.entries(j).map(([i,o])=>[i,o.ayah]))};
  if(j&&j.phrases)return setP(j);
  let gs=Array.isArray(j)?j:Array.isArray(j.groups)?j.groups:Array.isArray(j.data)?j.data:Object.entries(j).map(([k,v])=>[k].concat(v));
  M={};let n=0;
  gs.forEach(g=>{
    let ks=Array.isArray(g)?g:(g.verses||g.ayahs||g.keys||g.refs||[]),note=Array.isArray(g)?'':(g.note||g.text||g.title||'');
    ks=ks.map(norm).filter(Boolean);if(ks.length<2)return;n++;
    ks.forEach(k=>(M[k]=M[k]||[]).push({ks,note}));
  });
  if(!n){$('#mst').textContent='No usable data in that file. The built-in mutashabihat data is used instead.';return}
  $('#mst').textContent=n+' groups loaded, '+Object.keys(M).length+' ayahs marked.';
  V&&hook();
}
$('#mst').textContent='None loaded. Import your JSON below.';
$('#mi').onchange=e=>{const f=e.target.files[0];if(!f)return;
  f.text().then(t=>{setM(JSON.parse(t));if(Object.keys(M).length)try{localStorage.setItem('hifzM',t)}catch(x){}}).catch(()=>{$('#mst').textContent='That file could not be read. Check the JSON format.'})};
fetch('data/mutashabihat.json').then(r=>r.ok?r.json():Promise.reject()).then(j=>{setM(j);try{localStorage.removeItem('hifzM')}catch(e){}})
  .catch(()=>{try{const t=localStorage.getItem('hifzM');if(t)setM(JSON.parse(t))}catch(e){}});
const md=E('dialog');document.body.appendChild(md);
function show(k){
  const t=x=>V[x]?esc(V[x].t.join(' ')):'';
  let h=`<h2>${nm(k)}</h2><p class="ar">${t(k)}</p>`;
  M[k].forEach(g=>{
    if(g.note)h+=`<p>${esc(g.note)}</p>`;
    g.ks.filter(x=>x!=k).forEach(x=>{h+=`<hr><p><b>${nm(x)}</b>, page ${V[x]?V[x].p:'?'} <button data-p="${V[x]?V[x].p:1}">Go to page</button></p><p class="ar">${t(x)}</p>`});
  });
  md.innerHTML=h+'<div class="row"><button data-x>Close</button></div>';md.showModal();
}
let LP=null;
function lcs(A,B){const n=A.length,m=B.length,d=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)d[i][j]=A[i-1]==B[j-1]?d[i-1][j-1]+1:Math.max(d[i-1][j],d[i][j-1]);
  const r=new Array(m).fill(false);let i=n,j=m;
  while(i&&j){if(A[i-1]==B[j-1]){r[j-1]=true;i--;j--}else if(d[i-1][j]>=d[i][j-1])i--;else j--}
  return r}
const sn=w=>w.normalize('NFD').replace(/[\p{M}\u0640\u06DD-\u06E9]/gu,'');
function showP(k,rs,all){
  all=all||{};LP={k,rs,all};
  rs=[...rs].sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]));
  const inr=(rg,i)=>rg.some(r=>i>=r[0]&&i<=r[1]);
  const tok=(x,rg,ref)=>{const t=V[x]?V[x].t:[];let m=[];
    if(ref){m=lcs(ref,t.slice(rg[0][0]-1,rg[0][1]).map(sn))}
    return t.map((w,i)=>{
      if(!inr(rg,i+1))return ref?'<span class="dim">'+w+'</span>':w;
      if(ref&&!m[i+1-rg[0][0]])return '<span class="df">'+w+'</span>';
      return '<span class="hl">'+w+'</span>'}).join(' ')};
  let h=`<h2>${nm(k)}</h2><p class="ar sm">${tok(k,rs.map(r=>[r[0],r[1]]))}</p>
<p class="key"><span class="hl">same words</span> <span class="df">different words</span> <span class="dim">outside the shared phrase</span></p>`;
  const seen={};
  rs.forEach(r=>{
    if(seen[r[2]])return;seen[r[2]]=1;
    const o=PH[r[2]],ks=Object.keys(o).filter(x=>x!=k).sort(srt),ph=V[k].t.slice(r[0]-1,r[1]),A=ph.map(sn),lim=all[r[2]]?ks.length:12;
    h+=`<hr><p><b>${ph.join(' ')}</b><br>also appears in ${ks.length} other place${ks.length==1?'':'s'}:</p>`;
    ks.slice(0,lim).forEach(x=>{h+=`<p><b>${nm(x)}</b>, page ${V[x]?V[x].p:'?'} <button data-p="${V[x]?V[x].p:1}">Go to page</button></p><p class="ar sm">${tok(x,o[x],A)}</p>`});
    if(ks.length>lim)h+=`<p><button data-m="${r[2]}">Show all ${ks.length}</button></p>`;
  });
  md.innerHTML=h+'<div class="row"><button data-x>Close</button></div>';
  if(!md.open)md.showModal();
}
md.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.m){LP.all[b.dataset.m]=1;return showP(LP.k,LP.rs,LP.all)}
  md.close();if(b.dataset.p)H.go(b.dataset.p)};
/* ---------- tap a word: meanings and translations ---------- */
let MN=null,LW=null;
const MG={'2:181':3,'8:6':4,'13:37':8,'72:16':1};
const mj=(k,i)=>MG[k]&&i>MG[k]?i-1:i;
const wd=E('dialog');document.body.appendChild(wd);
const loadMN=()=>MN?Promise.resolve(MN):fetch('data/meanings.json').then(r=>r.json()).then(j=>MN=j);
const LG=()=>H.S.lg=Object.assign({wu:1,we:1,tu:1,te:1},H.S.lg||{});
function showW(k,i){
  if(!MN){
    wd.innerHTML='<p>Loading meanings...</p>';if(!wd.open)wd.showModal();
    return loadMN().then(()=>showW(k,i)).catch(()=>{wd.innerHTML='<p>Could not load the meanings. Connect to the internet once and try again.</p><div class="row"><button data-x>Close</button></div>'});
  }
  LW={k,i};const g=LG(),T=V[k].t,J=i?mj(k,i):0,n=MN.we[k].length,AK=Object.keys(V),ix=AK.indexOf(k);
  const cells=[];for(let j=1;j<=n;j++)cells.push(T.filter((_,x)=>mj(k,x+1)==j).join(' '));
  const mean=j=>(g.wu?`<small class="u">${esc(MN.wu[k][j-1]||'')}</small>`:'')+(g.we?`<small class="e">${esc(MN.we[k][j-1]||'')}</small>`:'');
  let h=`<h2>${nm(k)}${J?', word '+J:''}</h2>`;
  if(J)h+=`<div class="wc sel big"><div class="a">${cells[J-1]}</div>${mean(J)}</div>`;
  h+=`<p class="key">Word by word</p><div class="wg">${cells.map((a,x)=>`<div class="wc${x+1==J?' sel':''}"><div class="a">${a}</div>${mean(x+1)}</div>`).join('')}</div>`;
  if(g.tu)h+=`<hr><p class="key">Urdu translation (Fateh Muhammad Jalandhari)</p><p class="ur">${esc(MN.tu[k])}</p>`;
  if(g.te)h+=`<hr><p class="key">English translation (M.A.S. Abdel Haleem)</p><p>${esc(MN.te[k])}</p>`;
  const c=J?cov(k,i):[];
  if(c.length){const s=new Set(c.flatMap(r=>Object.keys(PH[r[2]]).filter(y=>y!=k)));h+=`<hr><div class="row"><button data-sim>Mutashabihat: ${s.size} other place${s.size==1?'':'s'}</button></div>`}
  h+=`<hr><div class="row"><button data-n="-1"${ix<1?' disabled':''}>Previous ayah</button><button data-n="1"${ix>=AK.length-1?' disabled':''}>Next ayah</button><button data-p="${V[k].p}">Go to page</button><button data-x>Close</button></div>`;
  wd.innerHTML=h;if(!wd.open)wd.showModal();
}
wd.onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.n){const AK=Object.keys(V);return showW(AK[AK.indexOf(LW.k)+ +b.dataset.n],0)}
  wd.close();
  if(b.dataset.sim)showP(LW.k,cov(LW.k,LW.i));
  if(b.dataset.p)H.go(b.dataset.p)};
$('main').addEventListener('click',e=>{
  const w=e.target.closest('.w');if(!w||w.classList.contains('hid')||!w.dataset.v||!V)return;
  const k=w.dataset.v,i=+w.dataset.i;
  if(H.S.mean!==false)return showW(k,i);
  if(H.S.sim===false)return;const c=cov(k,i);if(c.length)showP(k,c);else if(M[k])show(k);
});

/* ---------- daily plan: Sabaq, Sabqi, Manzil ---------- */
const pd=E('dialog');pd.innerHTML=`<h2>Today's plan</h2><div id="pb"></div><hr><h2>Plan settings</h2>
<div class="row"><label>New pages a day <input id="pn" type="number" min="1" max="10" style="width:64px"></label>
<label>Sabqi: last <input id="pk" type="number" min="1" max="60" style="width:64px"> days</label>
<label>Manzil pages a day <input id="pm" type="number" min="0" max="40" style="width:64px"></label></div>
<div class="row"><label>Start new pages at page <input id="ps" type="number" min="1" max="548" style="width:72px"></label>
<label><select id="pr"><option value="1">Moving forward</option><option value="-1">Moving backward (like Juz 30 first)</option></select></label></div>
<div class="row"><button data-x>Close</button></div>`;
document.body.appendChild(pd);
function plan(){
  const P=H.S.plan=Object.assign({n:1,k:7,m:5,start:1,dir:1,mp:0,day:null},H.S.plan||{}),t=loc(),d=H.S.done;
  if(!P.day||P.day.d!=t){
    const sab=[];let p=P.start;
    while(sab.length<P.n&&p>=1&&p<=548){if(!d[p])sab.push(p);p+=P.dir}
    const mem=Object.keys(d).map(Number).sort((a,b)=>a-b);
    const rec=mem.filter(x=>d[x]!=t&&gap(d[x],t)<=P.k),old=mem.filter(x=>gap(d[x],t)>P.k),man=[];
    for(let i=0;i<Math.min(P.m,old.length);i++)man.push(old[(P.mp+i)%old.length]);
    P.day={d:t,sab,rec,man,oc:old.length};
  }
  return P;
}
function planUI(){
  const P=plan(),D=P.day;
  const sec=(k,t,desc,a)=>`<p><b>${t}</b>: ${desc}</p><div class="row">${a.length?a.map(p=>`<button data-p="${p}">p. ${p}</button>`).join(''):'<span>Nothing today.</span>'}${a.length?`<button data-d="${k}" ${D[k]?'disabled':''}>${D[k]?'Done':'Mark done'}</button>`:''}</div>`;
  $('#pb').innerHTML=sec('s','Sabaq','new lesson',D.sab)+sec('q','Sabqi','recent revision',D.rec)+sec('m','Manzil','older revision',D.man);
  $('#pn').value=P.n;$('#pk').value=P.k;$('#pm').value=P.m;$('#ps').value=P.start;$('#pr').value=P.dir;
}
pd.onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.x!==undefined)return pd.close();
  if(b.dataset.p){pd.close();return H.go(b.dataset.p)}
  if(b.dataset.d){
    const P=plan(),k=b.dataset.d;
    if(k=='s')P.day.sab.forEach(p=>H.S.done[p]=loc());
    if(k=='m')P.mp=(P.mp+P.day.man.length)%Math.max(1,P.day.oc);
    P.day[k]=1;H.save();planUI();H.render();
  }
};
pd.onchange=e=>{
  const P=plan(),g=id=>Math.max(0,parseInt($('#'+id).value)||0);
  P.n=Math.max(1,g('pn'));P.k=Math.max(1,g('pk'));P.m=g('pm');P.start=Math.min(548,Math.max(1,g('ps')));P.dir=parseInt($('#pr').value);
  P.day=null;H.save();planUI();
};

/* ---------- audio: Sheikh Shuraym, repeat ---------- */
const url=k=>{const[s,a]=k.split(':');return 'https://everyayah.com/data/Saood_ash-Shuraym_128kbps/'+s.padStart(3,'0')+a.padStart(3,'0')+'.mp3'};
const rep=id=>$('#'+id).value;
function mark(){
  Q('.w.pl').forEach(w=>w.classList.remove('pl'));
  if(playing&&q[qi])Q('.w[data-v="'+q[qi]+'"]').forEach(w=>w.classList.add('pl'));
}
function say(t){$('#as').textContent=t||''}
function stop(m){A.pause();playing=false;$('#ap').textContent='Play';mark();say(m)}
function next(){
  A.src=url(q[qi]);A.play().catch(()=>stop('Could not play. Check your internet connection.'));
  mark();say(q[qi]+'  (ayah '+(qi+1)+' of '+q.length+')');
}
A.onerror=()=>playing&&stop('Could not load the audio. Check your internet connection.');
A.onended=()=>{
  ri++;if(ri<+rep('ae'))return next();
  ri=0;qi++;if(qi<q.length)return next();
  qi=0;rr++;if(rep('ar2')=='0'||rr<+rep('ar2'))return next();
  stop('Finished.');
};
const hd=$('header');
hd.appendChild(E('div',`<select id="af" aria-label="From ayah"></select><select id="at" aria-label="To ayah"></select>
<label>Each ayah <select id="ae"><option>1</option><option>2</option><option>3</option><option selected>5</option><option>10</option></select>x</label>
<label>Whole range <select id="ar2"><option>1</option><option>2</option><option>3</option><option>5</option><option>10</option><option value="0">Endless</option></select>x</label>
<button id="ap">Play</button><span id="as" role="status"></span>`)).className='ctl';
hd.lastChild.id='aud';
function fillAud(){
  if(playing)return;
  const ks=pk(),o=ks.map(k=>`<option>${k}</option>`).join('');
  $('#af').innerHTML=o;$('#at').innerHTML=o;$('#at').selectedIndex=ks.length-1;
}
$('#ap').onclick=()=>{
  if(playing)return stop();
  const ks=pk();let f=ks.indexOf(rep('af')),t=ks.indexOf(rep('at'));if(f<0)f=0;if(t<f)t=f;
  q=ks.slice(f,t+1);qi=ri=rr=0;playing=true;$('#ap').textContent='Stop';next();
};

/* ---------- themes and matching ayahs data ---------- */
let THEMES=[], SIM={};
const td=E('dialog');
td.id='themeDlg';
td.innerHTML=`<h2>Quran themes</h2>
<p>Browse the thematic ranges in the uploaded Ayah Themes database, or search by theme or keyword.</p>
<div class="row"><input id="themeSearch" type="search" placeholder="Search themes (English)" style="flex:1;min-width:220px"><button id="themeSearchBtn">Search</button></div>
<p id="themeStatus" role="status"></p><div id="themeResults"></div>
<div class="row"><button data-close-theme>Close</button></div>`;
document.body.appendChild(td);
const sd=E('dialog');
sd.id='similarDlg';
sd.innerHTML=`<h2>Similar ayahs</h2><p id="similarStatus"></p><div id="similarResults"></div><div class="row"><button data-close-sim>Close</button></div>`;
document.body.appendChild(sd);
function loadExploreData(){
  return Promise.all([
    THEMES.length?Promise.resolve(THEMES):fetch('data/themes.json').then(r=>r.json()).then(j=>(THEMES=j)),
    Object.keys(SIM).length?Promise.resolve(SIM):fetch('data/similar-ayahs.json').then(r=>r.json()).then(j=>(SIM=j))
  ]);
}
function themeItem(t){
  const sn=H.D.surahs[t.surah-1]||('Surah '+t.surah);
  const range=`${sn}, ayah ${t.from}${t.to!==t.from?'–'+t.to:''}`;
  const pages=t.endPage&&t.endPage!==t.page?`Pages ${t.page}–${t.endPage}`:`Page ${t.page||'?'}`;
  return `<button class="theme-item" data-theme-page="${t.page||1}"><b>${esc(t.theme)}</b><span>${esc(range)} · ${pages}</span>${t.keywords?`<small>Keyword: ${esc(t.keywords)}</small>`:''}</button>`;
}
function renderThemes(q=''){
  const out=$('#themeResults'),status=$('#themeStatus');out.innerHTML='';
  const n=normSearch(q);
  let arr=THEMES.filter(t=>!n||normSearch(t.theme).includes(n)||normSearch(t.keywords).includes(n));
  if(!n&&H.page){
    const current=arr.filter(t=>t.page&&t.endPage&&H.page>=t.page&&H.page<=t.endPage);
    const rest=arr.filter(t=>!current.includes(t));
    status.textContent=current.length?`${current.length} theme${current.length===1?'':'s'} covering page ${H.page}`:'No theme range starts on this page; showing the theme index.';
    arr=current.concat(rest);
  }else status.textContent=`${arr.length} matching theme${arr.length===1?'':'s'}`;
  arr.slice(0,80).forEach(t=>{out.insertAdjacentHTML('beforeend',themeItem(t))});
  if(arr.length>80)out.insertAdjacentHTML('beforeend',`<p>Showing first 80 results. Refine your search for more.</p>`);
}
function showThemes(){
  loadExploreData().then(()=>{renderThemes($('#themeSearch').value||'');if(!td.open)td.showModal()}).catch(()=>{ $('#themeStatus').textContent='Could not load the theme data.';if(!td.open)td.showModal()});
}
td.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.closeTheme!==undefined)return td.close();if(b.dataset.themePage){td.close();H.go(+b.dataset.themePage)}};
$('#themeSearchBtn').onclick=()=>renderThemes($('#themeSearch').value);
$('#themeSearch').addEventListener('keydown',e=>{if(e.key==='Enter')renderThemes(e.target.value)});
function showSimilar(){
  const keys=pk(),out=$('#similarResults'),status=$('#similarStatus');out.innerHTML='';
  loadExploreData().then(()=>{
    let rows=[];keys.forEach(k=>(SIM[k]||[]).slice(0,8).forEach(x=>rows.push([k,x])));
    rows.sort((a,b)=>b[1].score-a[1].score||b[1].coverage-a[1].coverage);
    status.textContent=rows.length?`Top matches for ayahs on page ${H.page}. Matches are ranked by the supplied score.`:'No matching ayahs were found for this page.';
    rows.slice(0,60).forEach(([src,x])=>{
      const b=E('button',`<b>${esc(nm(src))}</b> ↔ <b>${esc(nm(x.ayah))}</b><span>Score ${x.score} · ${x.coverage}% coverage · ${x.words} matching words · page ${V[x.ayah]?V[x.ayah].p:'?'}</span>`);
      b.className='theme-item';b.dataset.simPage=V[x.ayah]?V[x.ayah].p:1;b.dataset.simAyah=x.ayah;out.appendChild(b);
    });
    if(!sd.open)sd.showModal();
  }).catch(()=>{status.textContent='Could not load the matching-ayah data.';if(!sd.open)sd.showModal()});
}
sd.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.closeSim!==undefined)return sd.close();if(b.dataset.simPage){sd.close();H.go(+b.dataset.simPage)}};
/* ---------- header buttons ---------- */
const bar=$('.ctl');
[['mean','Meanings'],['plan','Plan'],['aub','Audio'],['sim','Mutashabihat'],['themes','Themes'],['similar','Similar ayahs'],['two','Two pages']].forEach(([id,t])=>{const b=E('button',t);b.id=id;bar.appendChild(b)});
$('#plan').onclick=()=>{planUI();pd.showModal()};
$('#aub').onclick=()=>{const on=$('#aud').classList.toggle('on');$('#aub').setAttribute('aria-pressed',on);if(!on&&playing)stop();dispatchEvent(new Event('resize'))};
$('#sim').setAttribute('aria-pressed',H.S.sim!==false);
$('#sim').onclick=()=>{H.S.sim=H.S.sim===false;H.save();$('#sim').setAttribute('aria-pressed',H.S.sim!==false);hook()};
$('#themes').onclick=showThemes;
$('#similar').onclick=showSimilar;

$('#mean').setAttribute('aria-pressed',H.S.mean!==false);
$('#mean').onclick=()=>{H.S.mean=H.S.mean===false;H.save();$('#mean').setAttribute('aria-pressed',H.S.mean!==false)};
$('#two').setAttribute('aria-pressed',!!H.S.two);
$('#two').onclick=()=>{H.S.two=!H.S.two;H.save();$('#two').setAttribute('aria-pressed',!!H.S.two);H.render()};
/* ---------- margin marks: ruku and sajdah ---------- */
const SAJ=new Set(['7:206','13:15','16:50','17:109','19:58','22:18','22:77','25:60','27:26','32:15','38:24','41:38','53:62','84:21','96:19']);
let R={},RB={};
function setR(j){const a=Array.isArray(j)?j:(j.ruku||j.rukus||[]),c={};R={};a.map(norm).filter(Boolean).forEach(k=>{const s=k.split(':')[0];R[k]=c[s]=(c[s]||0)+1});V&&hook()}
try{fetch('data/ruku.json').then(r=>r.ok?r.json():0).then(j=>j&&setR(j)).catch(()=>{})}catch(x){}
function setRub(j){
  RB={};const add=(k,t)=>RB[k]=(RB[k]?RB[k]+'<br>':'')+t;
  j.rub.forEach((k,i)=>{const r=i+1,q=(r-1)%4;
    add(k,'\u06DE<br>'+(r%8==1?'\u062C\u0632\u0621 '+((r-1>>3)+1):q==0?'\u062D\u0632\u0628 '+((r-1>>2)+1):['','\u0631\u0628\u0639','\u0646\u0635\u0641','\u00BE'][q]))});
  j.manzil.forEach((k,i)=>add(k,'\u0645\u0646\u0632\u0644 '+(i+1)));
  V&&hook();
}
try{fetch('data/rub.json').then(r=>r.ok?r.json():0).then(j=>j&&setRub(j)).catch(()=>{})}catch(x){}
function marks(){
  Q('.mk').forEach(m=>m.remove());
  Q('.page').forEach(pe=>{
    const pn=pe===H.el?H.page:H.page+1;
    const side=(pn%2===1)?'right':'left';
    const cls=side==='right'?'out-right':'out-left';
    pe.querySelectorAll('.w[data-i="1"]').forEach(w=>{
      const t=RB[w.dataset.v];if(!t)return;
      const m=E('span',t);m.className='mk '+cls;w.parentNode.appendChild(m);
    });
    pe.querySelectorAll('.w[data-v]').forEach(w=>{
      if(w.textContent.charCodeAt(0)!=0x6dd)return;
      const k=w.dataset.v;
      const t=[R[k]?'\u0639'+R[k]:'',SAJ.has(k)?'\u06E9':''].filter(Boolean).join('<br>');
      if(!t)return;
      const m=E('span',t);m.className='mk '+cls;w.parentNode.appendChild(m);
    });
  });
}

window.hook=()=>{
  if(!V)build();
  theme();fillAud();mark();tag();marks();
  Q('.page .w[data-v]').forEach(w=>w.classList.toggle('m',H.S.sim!==false&&(!!M[w.dataset.v]||cov(w.dataset.v,+w.dataset.i).length>0)));
};
if(H.D)hook();
})();
