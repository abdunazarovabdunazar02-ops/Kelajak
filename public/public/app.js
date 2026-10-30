(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const api=async(p,b)=>{const r=await fetch("/api/"+p,b?{method:"POST",headers:{"content-type":"application/json","x-req":"1"},body:JSON.stringify(b)}:{cache:"no-store"});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.e||"Xatolik");return j};
const LV=s=>s>=4000?5:s>=3000?4:s>=2000?3:s>=1000?2:1,lv=c=>c.manual||LV(c.score);
const fmt=n=>Number(n).toLocaleString("uz-UZ").replace(/,/g," ");
const bdg=l=>`<span class="bd l${l}">${l}-darajali</span>`;
let D=null,tab=0,rf="",at=0,ed=null;
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ---------- animations ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
$$("main section > div > *, main article").forEach((e,i)=>{e.classList.add("rv");e.style.transitionDelay=(i%4)*70+"ms";io.observe(e)});
const count=(el,to)=>{const t=String(to);if(reduce||!/^\d+$/.test(t)){el.textContent=t;return}const s=performance.now(),d=1000;const f=n=>{const k=Math.min(1,(n-s)/d);el.textContent=fmt(Math.round(+t*(1-Math.pow(1-k,3))));k<1&&requestAnimationFrame(f)};requestAnimationFrame(f)};

/* ---------- public rendering ---------- */
const groups=(key)=>{const m={};D.coords.forEach(c=>{const k=key(c);m[k.n]=m[k.n]||{n:k.n,s:k.s,v:0};m[k.n].v+=c.score});return Object.values(m)};
function ranking(){
  if(tab==3)return D.coords.filter(c=>!rf||c.region==rf).map(c=>({n:c.name,s:c.region+" · "+c.district,v:c.score,l:lv(c)}));
  if(tab==0)return groups(c=>({n:c.region,s:"Viloyat"}));
  if(tab==1)return groups(c=>({n:c.district+" ("+c.region+")",s:c.region})).filter(g=>!rf||g.s==rf);
  return groups(c=>({n:c.school||"Maktab kiritilmagan",s:"Kengash (maktab bo‘yicha)"}));
}
function renderRank(){
  const sec=$("#reytinglar"),btns=$$("button",sec).slice(0,4);
  btns.forEach((b,i)=>{b.style.cssText+=i==tab?";background:#41347F;color:#fff":";background:#fff;color:#41347F"});
  let sel=$("#rf");const tbl=$("table",sec).closest("div");
  if(!sel){sel=document.createElement("select");sel.id="rf";sel.style.cssText="border:1px solid #9D91D2;border-radius:12px;padding:8px 12px;background:#fff;color:#41347F;margin:0 0 12px";sel.onchange=()=>{rf=sel.value;renderRank()};tbl.parentElement.insertBefore(sel,tbl)}
  sel.innerHTML='<option value="">Barcha viloyatlar</option>'+Object.keys(D.reg).map(r=>`<option ${r==rf?"selected":""}>${esc(r)}</option>`).join("");
  sel.style.display=tab==1||tab==3?"block":"none";
  const L=ranking().sort((a,b)=>b.v-a.v),max=Math.max(1,...L.map(x=>x.v)),arts=$$("article",$$(":scope > div > div",sec)[2]||sec).slice(0,3);
  const pod=[1,0,2];
  $$("article",sec).filter(a=>a.querySelector("h3")&&/^\d$/.test(a.firstElementChild?.textContent.trim())).slice(0,3).forEach((a,i)=>{
    const x=L[pod[i]];a.style.display=x?"":"none";if(!x)return;
    a.firstElementChild.textContent=pod[i]+1;const p=$$("p",a);p[0].textContent=x.s;$("h3",a).textContent=x.n;p[1].textContent=fmt(x.v)+" ball";
    const bar=$$("div",a).pop();bar.style.width=(x.v/max*100)+"%";bar.style.transition="width 1s";a.classList.remove("sw");void a.offsetWidth;a.classList.add("sw")});
  const tb=$("tbody",sec);
  tb.innerHTML=L.length?L.slice(3).map((x,i)=>`<tr class="sw" style="border-top:1px solid #D0C8EF"><td class="p-3 font-semibold">${String(i+4).padStart(2,"0")}</td><td class="p-3">${esc(x.n)}<div style="font-size:12px;opacity:.7">${esc(x.s)}</div></td><td class="p-3">${fmt(x.v)} ball</td><td class="p-3">${x.l?bdg(x.l):"Faol"}</td></tr>`).join(""):`<tr><td colspan="4" class="p-6 text-center">Ma’lumot hali kiritilmagan</td></tr>`;
}
function renderPublic(){
  const C=D.coords,s=D.stats,sv=(k,a)=>s[k]!==""&&s[k]!=null?s[k]:a;
  const vals=[sv("students",C.length),sv("regions",new Set(C.map(c=>c.region)).size),sv("councils",new Set(C.map(c=>c.school).filter(Boolean)).size),sv("projects",0)];
  $$("#statistika article").forEach((a,i)=>{const p=$("p",a);if(vals[i]!=null&&p.dataset.v!=vals[i]){p.dataset.v=vals[i];count(p,vals[i])}});
  const hp=$$("#bosh p").find(p=>/^[0\d ]+$/.test(p.textContent.trim()));if(hp&&hp.dataset.v!=vals[0]){hp.dataset.v=vals[0];count(hp,vals[0])}
  const u=$$("#statistika span").find(x=>/sana|\d{2}:\d{2}/.test(x.textContent));if(u)u.textContent=new Date(D.t).toLocaleString("uz-UZ");
  renderRank();
  const box=$("#elonlar article")?.parentElement;
  if(box){box.innerHTML=D.posts.length?D.posts.map(p=>`<article class="sw bg-card border border-border rounded-3xl p-6 flex flex-col gap-3"><p class="text-xs font-semibold opacity-70">${new Date(p.date).toLocaleDateString("uz-UZ")}</p><h3 class="text-xl font-bold">${esc(p.title)}</h3><p>${esc(p.sum)}</p><a href="#" data-post="${p.id}" class="font-semibold">Batafsil →</a></article>`).join(""):`<p class="col-span-full p-6">Hozircha e’lonlar yo‘q</p>`}
  const A=$$("#qoshilish a").pop();if(A){if(D.joinUrl){A.href=D.joinUrl;A.target="_blank";A.rel="noopener noreferrer"}else A.href="#aloqa"}
  $$("#aloqa a[href]").filter(a=>a.querySelector("iconify-icon")).forEach(a=>{const k=["Telegram","Instagram","YouTube","Facebook","TikTok","Veb-sayt"].find(k=>a.textContent.trim().startsWith(k));if(!k)return;const u=D.links[k];a.lastChild.textContent=k;if(u){a.href=u;a.target="_blank";a.rel="noopener noreferrer";a.style.display=""}else a.style.display="none"});
}
$$("#reytinglar button").slice(0,4).forEach((b,i)=>b.onclick=()=>{tab=i;renderRank()});
document.addEventListener("click",e=>{const a=e.target.closest("[data-post]");if(a){e.preventDefault();const p=D.posts.find(x=>x.id==a.dataset.post);if(p)show(`<h2>${esc(p.title)}</h2><p style="opacity:.7;font-size:13px">${new Date(p.date).toLocaleDateString("uz-UZ")}</p><div style="white-space:pre-wrap;line-height:1.7;margin:12px 0">${esc(p.body||p.sum)}</div><button class="g" data-x>Yopish</button>`)}});
const mb=$("header button");if(mb)mb.onclick=()=>{const n=$("header nav"),o=n.dataset.o!="1";n.dataset.o=o?1:0;n.style.cssText=o?"display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:#fff;padding:16px;gap:14px;border-bottom:1px solid #9D91D2;animation:sw .3s both":"";};
$$("header nav a").forEach(a=>a.addEventListener("click",()=>{const n=$("header nav");if(n.dataset.o=="1")mb.click()}));
$$("header a").filter(a=>a.textContent.includes("Ro‘yxatdan")).forEach(a=>a.onclick=e=>{e.preventDefault();openAdmin()});

/* ---------- overlay / admin ---------- */
const ov=document.body.appendChild(Object.assign(document.createElement("div"),{id:"adm"}));
ov.onclick=e=>{if(e.target==ov||e.target.dataset.x!=null)ov.classList.remove("on")};
function show(h){ov.innerHTML=`<div class="bx">${h}</div>`;ov.classList.add("on")}
const toast=m=>{const t=document.body.appendChild(Object.assign(document.createElement("div"),{id:"tst",textContent:m}));setTimeout(()=>t.remove(),2800)};
async function openAdmin(){try{await load()}catch{}D?.admin?adminView():show(`<h2>Administrator kirishi</h2><p style="font-size:14px;margin-bottom:10px">Faqat ruxsat etilgan administrator uchun.</p><label>Parol</label><input id="pw" type="password" autocomplete="current-password"><div style="margin-top:12px;display:flex;gap:8px"><button id="lg">Kirish</button><button class="g" data-x>Bekor qilish</button></div>`);
  const b=$("#lg");if(b){const go=async()=>{try{await api("login",{password:$("#pw").value});await load();adminView()}catch(e){toast(e.message)}};b.onclick=go;$("#pw").onkeydown=e=>e.key=="Enter"&&go();$("#pw").focus()}}
const op=async(o,ok="Saqlandi")=>{try{await api("op",o);await load();adminView();toast(ok);return 1}catch(e){toast(e.message);if(/Kirish/.test(e.message)){D.admin=false;openAdmin()}}};
const opts=(a,v)=>a.map(x=>`<option ${x==v?"selected":""}>${esc(x)}</option>`).join("");
function adminView(){
  const T=["Koordinatorlar","Postlar","Sozlamalar","Tarix"];let h=`<h2>Boshqaruv paneli</h2><div class="tabs">${T.map((t,i)=>`<button class="${i==at?"":"g"}" data-t="${i}">${t}</button>`).join("")}<button class="d" data-out>Chiqish</button><button class="g" data-x>Yopish</button></div>`;
  if(at==0){const dl=(D.reg[$("#cr")?.value||Object.keys(D.reg)[0]]||"").split(",");
    h+=`<div class="grid"><div><label>Ism familiya</label><input id="cn"></div><div><label>Viloyat</label><select id="cr">${opts(Object.keys(D.reg))}</select></div><div><label>Tuman/shahar</label><input id="cd" list="dl"><datalist id="dl">${dl.map(x=>`<option value="${esc(x)}">`).join("")}</datalist></div><div><label>Maktab</label><input id="cs"></div><div><label>Yo‘nalish</label>${D.dirs.length?`<select id="cy"><option></option>${opts(D.dirs)}</select>`:`<input id="cy" placeholder="Sozlamalarda ro‘yxat kiriting">`}</div></div><button data-add>Koordinator qo‘shish</button>
    <div class="grid" style="margin-top:14px"><div><label>Qidiruv</label><input id="qs" placeholder="Ism, viloyat, tuman"></div><div><label>Ball sababi (ixtiyoriy)</label><input id="rs"></div></div><div id="cl"></div>`}
  if(at==1){const p=D.posts.find(x=>x.id==ed)||{};h+=`<label>Sarlavha</label><input id="pt" value="${esc(p.title)}"><label>Qisqa izoh</label><input id="ps" value="${esc(p.sum)}"><label>To‘liq matn</label><textarea id="pb" rows="7">${esc(p.body)}</textarea><label><input type="checkbox" id="pp" style="width:auto" ${p.pub?"checked":""}> Saytda e’lon qilish (aks holda qoralama)</label><div style="margin:10px 0;display:flex;gap:8px"><button data-sp>Saqlash</button>${ed?'<button class="g" data-ne>Yangi post</button>':""}</div>${D.posts.map(x=>`<div class="row"><div class="n"><b>${esc(x.title)}</b><br><small>${x.pub?"E’lon qilingan":"Qoralama"}</small></div><button class="g" data-ep="${x.id}">Tahrirlash</button><button class="d" data-dp="${x.id}">O‘chirish</button></div>`).join("")}`}
  if(at==2){const s=D.stats,L=D.links;h+=`<p style="font-size:13px;margin-bottom:6px">Statistika: bo‘sh qoldirilsa avtomatik hisoblanadi (loyihalar — qo‘lda).</p><div class="grid">${[["students","Faol o‘quvchilar"],["regions","Viloyatlar"],["councils","Kengashlar"],["projects","Loyihalar"]].map(([k,n])=>`<div><label>${n}</label><input data-s="${k}" value="${esc(s[k])}" inputmode="numeric"></div>`).join("")}</div><div class="grid">${["Telegram","Instagram","YouTube","Facebook","TikTok","Veb-sayt"].map(k=>`<div><label>${k} havolasi</label><input data-l="${k}" value="${esc(L[k])}" placeholder="https://"></div>`).join("")}<div><label>Ariza (qo‘shilish) havolasi</label><input id="ju" value="${esc(D.joinUrl)}" placeholder="https://"></div></div><label>Yo‘nalishlar (vergul bilan)</label><textarea id="dr" rows="2">${esc(D.dirs.join(", "))}</textarea><div style="margin-top:10px"><button data-ss>Saqlash</button></div>`}
  if(at==3)h+=(D.hist||[]).slice(0,60).map(x=>`<div class="row"><div class="n"><b>${esc(x.name)}</b> — ${{add:"+",sub:"",lvl:"daraja",del:"o‘chirildi"}[x.type]||""}${x.delta||""} → ${x.now} ball<br><small>${new Date(x.t).toLocaleString("uz-UZ")} ${esc(x.reason)}</small></div></div>`).join("")||"<p>Tarix bo‘sh</p>";
  $(".bx",ov)?ov.firstElementChild.innerHTML=h:show(h);if(at==0)list()}
function list(){const q=($("#qs")?.value||"").toLowerCase(),L=D.coords.filter(c=>(c.name+c.region+c.district).toLowerCase().includes(q)).sort((a,b)=>b.score-a.score).slice(0,100);
  $("#cl").innerHTML=L.map(c=>`<div class="row" data-id="${c.id}"><div class="n"><b>${esc(c.name)}</b> ${bdg(lv(c))}<br><small>${esc(c.region)} · ${esc(c.district)} · ${esc(c.school)}</small></div><b>${fmt(c.score)}</b><input type="number" min="1" placeholder="Ball"><button data-p="1">+</button><button class="d" data-p="-1">−</button><select data-lv><option value="0">Avto</option>${[1,2,3,4,5].map(n=>`<option ${c.manual==n?"selected":""} value="${n}">${n}</option>`).join("")}</select><button class="d" data-del>✕</button></div>`).join("")||"<p>Koordinatorlar yo‘q</p>"}
ov.addEventListener("input",e=>{if(e.target.id=="qs")list();if(e.target.id=="cr")adminViewKeep()});
function adminViewKeep(){const v={n:$("#cn").value,r:$("#cr").value,s:$("#cs").value};adminView();$("#cn").value=v.n;$("#cr").value=v.r;$("#cs").value=v.s;adminViewDl()}
function adminViewDl(){$("#dl").innerHTML=D.reg[$("#cr").value].split(",").map(x=>`<option value="${esc(x)}">`).join("")}
ov.addEventListener("click",async e=>{const t=e.target,d=t.dataset,row=t.closest("[data-id]");if(!D?.admin)return;
  if(d.t!=null){at=+d.t;ed=null;adminView()}
  else if(d.out!=null){await api("logout",{});D.admin=false;ov.classList.remove("on");toast("Chiqildi")}
  else if(d.add!=null)op({op:"addCoord",name:$("#cn").value,region:$("#cr").value,district:$("#cd").value,school:$("#cs").value,dir:$("#cy").value},"Koordinator qo‘shildi");
  else if(d.p&&row){const v=parseInt($("input",row).value,10);if(!v||v<1)return toast("Ball kiriting (butun son)");op({op:"points",id:row.dataset.id,delta:v*d.p,reason:$("#rs").value})}
  else if(d.del!=null&&row){if(confirm("Koordinator o‘chirilsinmi? Tarix saqlanadi."))op({op:"delCoord",id:row.dataset.id},"O‘chirildi")}
  else if(d.sp!=null)op({op:"post",pid:ed,title:$("#pt").value,sum:$("#ps").value,body:$("#pb").value,pub:$("#pp").checked}).then(ok=>ok&&(ed=null,adminView()));
  else if(d.ep){ed=d.ep;adminView()}else if(d.ne!=null){ed=null;adminView()}
  else if(d.dp){if(confirm("Post o‘chirilsinmi?"))op({op:"delPost",pid:d.dp},"O‘chirildi")}
  else if(d.ss!=null){const stats={},links={};$$("[data-s]",ov).forEach(i=>stats[i.dataset.s]=i.value);$$("[data-l]",ov).forEach(i=>links[i.dataset.l]=i.value);op({op:"settings",stats,links,joinUrl:$("#ju").value,dirs:$("#dr").value})}});
ov.addEventListener("change",e=>{if(e.target.matches("[data-lv]"))op({op:"level",id:e.target.closest("[data-id]").dataset.id,level:+e.target.value},"Daraja yangilandi")});

/* ---------- load + live refresh ---------- */
async function load(){D=await api("data");renderPublic()}
load().catch(()=>{});
setInterval(()=>{if(!document.hidden&&!ov.classList.contains("on"))load().catch(()=>{})},30000);
})();
