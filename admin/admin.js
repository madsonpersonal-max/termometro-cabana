const sectors=["Administração","Esporte / Academia","Segurança","Bar / Restaurante","Infraestrutura","Eventos","Comunicação / Marketing / Tecnologia","RH","Financeiro","Compras","Central de Atendimento","Outros"];
const climateLabels={5:"Muito bom",4:"Bom",3:"Normal",2:"Ruim",1:"Muito ruim"};
const reasons=["Equipe","Liderança","Comunicação","Organização","Estrutura / materiais","Escala","Distribuição de tarefas","Remuneração / benefícios","Sobrecarga","Outro"];
const $=id=>document.getElementById(id);
const data=()=>{try{return JSON.parse(localStorage.getItem("cabana_clima")||"[]")}catch{return []}};
function avg(a){return a.length?a.reduce((s,x)=>s+Number(x.value||0),0)/a.length:0}
function pct(n,d){return d?Math.round(n/d*100):0}
function filtered(period="today"){
 const d=data(),now=new Date();
 if(period==="today") return d.filter(x=>new Date(x.date).toDateString()===now.toDateString());
 const c=new Date(now);c.setHours(0,0,0,0);c.setDate(c.getDate()-Number(period)+1);
 return d.filter(x=>new Date(x.date)>=c);
}
function periodLabel(p){return p==="today"?"Hoje":`Últimos ${p} dias`}
function trend(sector){
 const all=data(),now=new Date(),current=[],previous=[];
 all.forEach(x=>{if(x.sector!==sector)return;const dt=new Date(x.date);const days=(now-dt)/86400000;if(days<=7)current.push(x);else if(days<=14)previous.push(x)});
 if(!current.length||!previous.length)return ["flat","→"];
 const a=avg(current),b=avg(previous);return a>b+.15?["up","↑"]:a<b-.15?["down","↓"]:["flat","→"];
}
function render(period="today"){
 const d=filtered(period),pos=d.filter(x=>Number(x.value)>=4).length,neu=d.filter(x=>Number(x.value)===3).length,neg=d.filter(x=>Number(x.value)<=2).length;
 $("generalPeriod").textContent=periodLabel(period);
 $("kpis").innerHTML=[
  ["Índice geral",d.length?avg(d).toFixed(1)+"/5":"—",`${d.length} respostas`],
  ["Clima positivo",pct(pos,d.length)+"%",`${pos} respostas`],
  ["Clima neutro",pct(neu,d.length)+"%",`${neu} respostas`],
  ["Clima negativo",pct(neg,d.length)+"%",`${neg} respostas`]
 ].map(x=>`<div class="kpi"><div class="label">${x[0]}</div><div class="value">${x[1]}</div><div class="sub">${x[2]}</div></div>`).join("");
 $("responseCount").textContent=`${d.length} respostas`;
 renderGeneralChart(d);
 renderDistribution(d);
 renderSectors(d);
 renderReasons(d);
 renderBands(d);
 renderAlerts(d,period);
}
function renderGeneralChart(d){
 if(!d.length){$("generalChart").innerHTML='<div class="empty">Ainda não há respostas no período.</div>';return}
 const grouped={};
 d.forEach(x=>{const dt=new Date(x.date);const key=dt.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});if(!grouped[key])grouped[key]=[];grouped[key].push(x)});
 let labels=Object.keys(grouped).slice(-10);
 if(labels.length===1)labels=[labels[0]];
 const rows=labels.map(label=>{const a=grouped[label];return {label,pos:pct(a.filter(x=>Number(x.value)>=4).length,a.length),neu:pct(a.filter(x=>Number(x.value)===3).length,a.length),neg:pct(a.filter(x=>Number(x.value)<=2).length,a.length)}});
 $("generalChart").innerHTML=`<div class="stack-chart">${rows.map(r=>`<div class="stack-col"><div class="stack-total">${Math.max(r.pos,r.neu,r.neg)}%</div><div class="stack-bar"><i class="s-pos" style="height:${r.pos}%"></i><i class="s-neu" style="height:${r.neu}%"></i><i class="s-neg" style="height:${r.neg}%"></i></div><div class="stack-label">${r.label}</div></div>`).join("")}</div>`;
}
function renderDistribution(d){
 $("distribution").innerHTML=[5,4,3,2,1].map(v=>{const n=d.filter(x=>Number(x.value)===v).length;return `<div class="bar-row"><div class="bar-top"><span>${climateLabels[v]}</span><strong>${pct(n,d.length)}% <small>(${n})</small></strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(n,d.length)}%"></div></div></div>`}).join("");
}
function renderSectors(d){
 const active=sectors.map(s=>{const a=d.filter(x=>x.sector===s);return {s,a,score:avg(a)}}).filter(x=>x.a.length);
 const inactive=sectors.filter(s=>!d.some(x=>x.sector===s));
 if(!active.length){$("sectorGrid").innerHTML='<div class="empty">Ainda não há respostas por setor no período.</div>';return}
 active.sort((a,b)=>b.score-a.score);
 $("sectorGrid").innerHTML=active.map(x=>{const t=trend(x.s);return `<div class="sector-card"><div class="top"><div><div class="sector-name">${x.s}</div><div class="sector-meta">${x.a.length} resposta${x.a.length===1?'':'s'}</div></div><div class="sector-score">${x.score.toFixed(1)}</div></div><div class="sector-bar"><i style="width:${(x.score/5)*100}%"></i></div><div class="sector-meta"><span class="badge ${t[0]}">${t[1]} tendência</span></div></div>`}).join("");
}
function renderReasons(d){
 const rr=reasons.map(r=>({label:r,n:d.filter(x=>x.reason===r).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,6);
 $("reasons").innerHTML=rr.length?rr.map(x=>`<div class="bar-row"><div class="bar-top"><span>${x.label}</span><strong>${pct(x.n,d.length)}%</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(x.n,d.length)}%"></div></div></div>`).join(""):"<p class='muted'>Ainda não há motivos registrados.</p>";
}
function renderBands(d){
 const bands=[["Muito bom / Bom",d.filter(x=>Number(x.value)>=4).length],["Normal",d.filter(x=>Number(x.value)===3).length],["Ruim / Muito ruim",d.filter(x=>Number(x.value)<=2).length]];
 $("climateBands").innerHTML=bands.map(x=>`<div class="bar-row"><div class="bar-top"><span>${x[0]}</span><strong>${pct(x[1],d.length)}%</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(x[1],d.length)}%"></div></div></div>`).join("");
}
function renderAlerts(d,period){
 const valid=sectors.map(s=>{const a=d.filter(x=>x.sector===s);return {s,a,score:avg(a)}}).filter(x=>x.a.length>=5);
 const low=valid.filter(x=>x.score<3.5).sort((a,b)=>a.score-b.score).slice(0,3);
 $("alerts").innerHTML=low.length?low.map(x=>`<div class="alert-box" style="margin-bottom:9px"><strong>${x.s}</strong><br>Índice ${x.score.toFixed(1)}/5 em ${periodLabel(period).toLowerCase()}.</div>`).join(""):"<div class=\"alert-box\">Nenhum alerta gerencial no período ou ainda não há respostas suficientes.</div>";
}
function history(){const d=data().sort((a,b)=>new Date(b.date)-new Date(a.date));$("historyTable").innerHTML=`<table><thead><tr><th>Data/hora</th><th>Setor</th><th>Clima</th><th>Motivo</th></tr></thead><tbody>${d.slice(0,300).map(x=>`<tr><td>${new Date(x.date).toLocaleString("pt-BR")}</td><td>${x.sector}</td><td>${climateLabels[x.value]}</td><td>${x.reason||"—"}</td></tr>`).join("")}</tbody></table>`}
$("loginBtn").onclick=()=>{if($("password").value==="cabana2026"){sessionStorage.setItem("cabana_admin","1");$("adminLogin").style.display="none";$("adminApp").style.display="block";render()}else $("error").textContent="Senha incorreta."};
if(sessionStorage.getItem("cabana_admin")==="1"){$("adminLogin").style.display="none";$("adminApp").style.display="block";render()}
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.period)});
$("histBtn").onclick=()=>{$("dashboardView").style.display="none";$('historyView').style.display="block";$('dashBtn').classList.remove("active");$('histBtn').classList.add("active");history()};
$("dashBtn").onclick=()=>{$('historyView').style.display="none";$('dashboardView').style.display="block";$('histBtn').classList.remove("active");$('dashBtn').classList.add("active");render()};
$("logoutBtn").onclick=()=>{sessionStorage.removeItem("cabana_admin");location.reload()};
