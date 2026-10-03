(()=>{
const $=s=>document.querySelector(s),Q=s=>document.querySelectorAll(s);
const E=(t,h)=>{const e=document.createElement(t);e.innerHTML=h||'';return e};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const loc=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const gap=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);
let V=null,M={},q=[],qi=0,ri=0,rr=0,playing=false;
const A=new Audio();

document.head.appendChild(E('style',`
[data-dir=ltr] footer{flex-direction:row-reverse}
.w.m{text-decoration:underline dotted var(--accent) 2px;text-underline-offset:.3em}
.w.hid:not(.r).m{text-decoration:none}
.w.pl{background:var(--tint);border-radius:.18em}
#aud{display:none}#aud.on{display:flex}
dialog hr{border:0;border-top:1px solid var(--line)}
dialog .row button[data-p]{min-height:34px}
.mk{position:absolute;right:100%;margin-right:5px;direction:ltr;text-align:right;white-space:nowrap;font:calc(var(--fs,40px)*.4)/1.15 Khatt,serif;color:var(--accent)}
.g{font:26px Khatt,serif;display:inline-block;min-width:1.6em;text-align:center;color:var(--ink)}
.ar{font:28px/1.9 Khatt,serif;direction:rtl;color:var(--ink)!important}
`));

/* ---------- colours and page direction ---------- */
const PRE={Light:['#e8eeeb','#ffffff','#14231f','#0e5a4a'],Sepia:['#e9dcc3','#f6ecd6','#3b2f1e','#7a4a1c'],Dark:['#0d1513','#15201d','#e6efe9','#5fc3a6'],Black:['#000000','#000000','#e8e8e8','#5fc3a6']};
const cur=()=>{const g=k=>getComputedStyle(document.documentElement).getPropertyValue('--'+k).trim();return{bg:g('bg'),paper:g('paper'),ink:g('ink'),accent:g('accent')}};
function theme(){
  const r=document.documentElement.style,T=H.S.theme,ltr=H.S.dir=='ltr';
  ['bg','paper','ink','accent'].forEach(k=>T?r.setProperty('--'+k,T[k]):r.removeProperty('--'+k));
  [['--mask',18],['--tint',12]].forEach(([p,n])=>T?r.setProperty(p,'color-mix(in srgb,'+T.ink+' '+n+'%,transparent)'):r.removeProperty(p));
  document.documentElement.dataset.dir=ltr?'ltr':'ar';
  $('#nx').textContent=ltr?'Next page \u25B6':'\u25C0 Next page';
  $('#pv').textContent=ltr?'\u25C0 Previous page':'Previous page \u25B6';
  const c=cur();$('#cb').value=c.bg;$('#cp').value=c.paper;$('#ct').value=c.ink;$('#dr').value=ltr?'ltr':'ar';
}
const dlg=$('#dlg');
dlg.insertBefore(E('div',`<h2>Display</h2>
<div class="row"><label>Theme <select id="th"><option value="">Auto (device)</option>${Object.keys(PRE).map(k=>`<option>${k}</option>`).join('')}</select></label></div>
<div class="row"><label>Screen <input type="color" id="cb"></label><label>Page <input type="color" id="cp"></label><label>Text <input type="color" id="ct"></label></div>
<div class="row"><label>Page turning <select id="dr"><option value="ar">Arabic: next page on the left</option><option value="ltr">Left to right: next page on the right</option></select></label></div>
<h2>Signs guide</h2><p><span class="g">\\u06D8</span> Stop here (م)</p><p><span class="g">\\u06D9</span> Do not stop (لا)</p><p><span class="g">\\u06D7</span> Stopping is better (قلے)</p><p><span class="g">\\u06D6</span> Continuing is better (صلے)</p><p><span class="g">\\u06DA</span> Stop or continue, both fine (ج)</p><p><span class="g">\\u0615</span> Stopping is fine (ط)</p><p><span class="g">\\u06DB</span> Stop at one of the two dots, not both (معانقہ)</p><p><span class="g">\\u06E9</span> Sajdah: prostration</p><p><span class="g">\\u0639</span> Ruku ends here; the number counts rukus in the surah</p><h2>Mutashabihat</h2><p id="mst"></p>
<div class="row"><label>Import JSON <input type="file" id="mi" accept=".json,application/json"></label></div>`),dlg.children[0]);
$('#th').onchange=e=>{const v=e.target.value;H.S.theme=v?{bg:PRE[v][0],paper:PRE[v][1],ink:PRE[v][2],accent:PRE[v][3]}:null;H.save();theme()};
['cb','cp','ct'].forEach((id,i)=>$('#'+id).oninput=e=>{const T=H.S.theme||cur();T[['bg','paper','ink'][i]]=e.target.value;H.S.theme=T;H.save();theme()});
$('#dr').onchange=e=>{H.S.dir=e.target.value;H.save();theme()};

/* ---------- verse index ---------- */
function build(){
  V={};
  H.D.pages.forEach((L,i)=>L.forEach(l=>{
    if(l[0])return;let[s,a]=l[3].split(':').map(Number);
    l[2].split(' ').forEach(w=>{const k=s+':'+a,v=V[k]||(V[k]={p:i+1,t:[]});if(w.charCodeAt(0)!=0x6dd)v.t.push(w);else a++});
  }));
}
const pk=()=>[...new Set([...Q('.page .w[data-v]')].map(w=>w.dataset.v))].sort((a,b)=>{const[x,y]=a.split(':'),[u,v]=b.split(':');return x-u||y-v});
const nm=k=>H.D.surahs[k.split(':')[0]-1]+' '+k;

/* ---------- mutashabihat ---------- */
const norm=k=>{const m=String(k).match(/(\d+)\D+(\d+)/);return m?+m[1]+':'+ +m[2]:null};
function setM(j){
  let gs=Array.isArray(j)?j:Array.isArray(j.groups)?j.groups:Array.isArray(j.data)?j.data:Object.entries(j).map(([k,v])=>[k].concat(v));
  M={};let n=0;
  gs.forEach(g=>{
    let ks=Array.isArray(g)?g:(g.verses||g.ayahs||g.keys||g.refs||[]),note=Array.isArray(g)?'':(g.note||g.text||g.title||'');
    ks=ks.map(norm).filter(Boolean);n++;
    ks.forEach(k=>(M[k]=M[k]||[]).push({ks,note}));
  });
  $('#mst').textContent=n+' groups loaded, '+Object.keys(M).length+' ayahs marked.';
  V&&hook();
}
$('#mst').textContent='None loaded. Import your JSON below.';
$('#mi').onchange=e=>{const f=e.target.files[0];if(!f)return;
  f.text().then(t=>{setM(JSON.parse(t));try{localStorage.setItem('hifzM',t)}catch(x){}}).catch(()=>{$('#mst').textContent='That file could not be read. Check the JSON format.'})};
try{const t=localStorage.getItem('hifzM');
  if(t)setM(JSON.parse(t));else fetch('data/mutashabihat.json').then(r=>r.ok?r.json():0).then(j=>j&&setM(j)).catch(()=>{})}catch(x){}
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
md.onclick=e=>{const b=e.target.closest('button');if(!b)return;md.close();if(b.dataset.p)H.go(b.dataset.p)};
$('main').addEventListener('click',e=>{
  const w=e.target.closest('.w');if(!w||w.classList.contains('hid')||!w.dataset.v)return;
  if(H.S.sim!==false&&M[w.dataset.v]&&V)show(w.dataset.v);
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

/* ---------- header buttons ---------- */
const bar=$('.ctl');
[['plan','Plan'],['aub','Audio'],['sim','Similar ayahs'],['two','Two pages']].forEach(([id,t])=>{const b=E('button',t);b.id=id;bar.appendChild(b)});
$('#plan').onclick=()=>{planUI();pd.showModal()};
$('#aub').onclick=()=>{const on=$('#aud').classList.toggle('on');$('#aub').setAttribute('aria-pressed',on);if(!on&&playing)stop();dispatchEvent(new Event('resize'))};
$('#sim').setAttribute('aria-pressed',H.S.sim!==false);
$('#sim').onclick=()=>{H.S.sim=H.S.sim===false;H.save();$('#sim').setAttribute('aria-pressed',H.S.sim!==false);hook()};

$('#two').setAttribute('aria-pressed',!!H.S.two);
$('#two').onclick=()=>{H.S.two=!H.S.two;H.save();$('#two').setAttribute('aria-pressed',!!H.S.two);H.render()};
/* ---------- margin marks: ruku and sajdah ---------- */
const SAJ=new Set(['7:206','13:15','16:50','17:109','19:58','22:18','22:77','25:60','27:26','32:15','38:24','41:38','53:62','84:21','96:19']);
let R={};
function setR(j){const a=Array.isArray(j)?j:(j.ruku||j.rukus||[]),c={};R={};a.map(norm).filter(Boolean).forEach(k=>{const s=k.split(':')[0];R[k]=c[s]=(c[s]||0)+1});V&&hook()}
try{fetch('data/ruku.json').then(r=>r.ok?r.json():0).then(j=>j&&setR(j)).catch(()=>{})}catch(x){}
function marks(){
  Q('.mk').forEach(m=>m.remove());
  Q('.page .w[data-v]').forEach(w=>{
    if(w.textContent.charCodeAt(0)!=0x6dd)return;
    const k=w.dataset.v,t=[R[k]?'\u0639'+R[k]:'',SAJ.has(k)?'\u06E9':''].filter(Boolean).join('<br>');
    if(!t)return;
    const m=E('span',t);m.className='mk';w.parentNode.appendChild(m);
  });
}
window.hook=()=>{
  if(!V)build();
  theme();fillAud();mark();marks();
  Q('.page .w[data-v]').forEach(w=>w.classList.toggle('m',H.S.sim!==false&&!!M[w.dataset.v]));
};
if(H.D)hook();
})();
