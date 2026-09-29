const cfg=window.TERMOMETRO_CONFIG||{};
const valid=cfg.SUPABASE_URL&&cfg.SUPABASE_URL.startsWith("https://")&&cfg.SUPABASE_PUBLISHABLE_KEY&&!cfg.SUPABASE_PUBLISHABLE_KEY.startsWith("COLE_");
const db=valid?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY):null;
let period="today", allRows=[];

const fmtPct=(n,total)=>total?Math.round(n*100/total)+"%":"0%";
const periodStart=()=>{
  const d=new Date(); d.setHours(0,0,0,0);
  if(period==="today") return d;
  d.setDate(d.getDate()-Number(period)+1); return d;
};
async function load(){
  if(!db){$("loginMsg").textContent="Configure o Supabase em config.js.";return;}
  const {data,error}=await db.from("termometro_respostas").select("sector,score,reason,created_at").gte("created_at",periodStart().toISOString()).order("created_at",{ascending:false});
  if(error){console.error(error); $("loginMsg").textContent=error.message; return;}
  allRows=data||[]; render();
}
const $=id=>document.getElementById(id);
function render(){
  const rows=allRows,n=rows.length;
  const avg=n?rows.reduce((s,r)=>s+r.score,0)/n:0;
  $("overall").textContent=n?avg.toFixed(1)+"/5":"—";
  const pos=rows.filter(r=>r.score>=4).length, neu=rows.filter(r=>r.score===3).length, neg=rows.filter(r=>r.score<=2).length;
  $("positive").textContent=fmtPct(pos,n);$("neutral").textContent=fmtPct(neu,n);$("negative").textContent=fmtPct(neg,n);
  $("nTotal").textContent=n+" respostas";$("nPositive").textContent=pos+" respostas";$("nNeutral").textContent=neu+" respostas";$("nNegative").textContent=neg+" respostas";
  const counts=[5,4,3,2,1].map(score=>({score,n:rows.filter(r=>r.score===score).length}));
  $("generalBars").innerHTML=counts.map(x=>bar("Nota "+x.score,x.n,n)).join("");
  $("distribution").innerHTML=[
    ["Positivo",pos],["Neutro",neu],["Negativo",neg]
  ].map(x=>bar(x[0],x[1],n)).join("");
  const map={}; rows.forEach(r=>{map[r.sector]??=[];map[r.sector].push(r)});
  $("sectors").innerHTML=Object.entries(map).sort((a,b)=>avgOf(b[1])-avgOf(a[1])).map(([s,rs])=>{
    const a=avgOf(rs); return `<div class="sector"><b>${esc(s)}</b><div class="track"><div class="fill" style="width:${a/5*100}%"></div></div><strong>${a.toFixed(1)}</strong><span>${rs.length} resp.</span></div>`;
  }).join("")||"<p class='muted'>Sem respostas no período.</p>";
  const rm={};rows.forEach(r=>{if(r.reason)rm[r.reason]=(rm[r.reason]||0)+1});
  $("reasons").innerHTML=Object.entries(rm).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>bar(x[0],x[1],n)).join("")||"<p class='muted'>Nenhum motivo informado.</p>";
  $("alerts").innerHTML=Object.entries(map).map(([s,rs])=>[s,avgOf(rs),rs.length]).filter(x=>x[2]>=5&&x[1]<3.2).sort((a,b)=>a[1]-b[1]).map(x=>`<div class="barrow"><b>${esc(x[0])}</b><div class="muted">Índice ${x[1].toFixed(1)} com ${x[2]} respostas.</div></div>`).join("")||"<p class='muted'>Nenhum alerta com o critério atual.</p>";
}
function avgOf(rs){return rs.reduce((s,r)=>s+r.score,0)/rs.length}
function bar(label,val,total){return `<div class="barrow"><div class="barhead"><span>${esc(label)}</span><b>${val}${total?" ("+fmtPct(val,total)+")":""}</b></div><div class="track"><div class="fill" style="width:${total?val/total*100:0}%"></div></div></div>`}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$("loginBtn").onclick=async()=>{
  if(!db){$("loginMsg").textContent="Configure primeiro o Supabase em config.js.";return;}
  const {error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  if(error){$("loginMsg").textContent="E-mail ou senha inválidos.";return;}
  $("login").classList.add("hidden");$("app").classList.remove("hidden");load();
};
$("logout").onclick=async()=>{await db.auth.signOut();location.reload()};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");period=b.dataset.period;load()});
if(db) db.auth.getSession().then(({data})=>{if(data.session){$("login").classList.add("hidden");$("app").classList.remove("hidden");load()}});
