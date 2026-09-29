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
function trend(sector,period){
 const all=data(),now=new Date();
 const current=[],previous=[];
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
 renderSectors(d,period);
 renderReasons(d);
 renderBands(d);
 renderAlerts(d,period);
}
function renderGeneralChart(d){
 if(!d.length){$("generalChart").innerHTML='<div class="empty">Ainda não há respostas no período.</div>';return}
 const days={};
 d.forEach(x=>{const dt=new Date(x.date);const key=dt.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});if(!days[key])days[key]=[];days[key].push(x)});
 let labels=Object.keys(days).slice(-14);if(labels.length===1)labels=[labels[0],labels[0]];
 const W=760,H=250,padL=42,padR=18,padT=18,padB=32,max=100,min=0;
 const points=(type)=>labels.map((l,i)=>{const arr=days[l]||[];let n=0; if(type==='pos')n=arr.filter(x=>Number(x.value)>=4).length; if(type==='neu')n=arr.filter(x=>Number(x.value)===3).length;if(type==='neg')n=arr.filter(x=>Number(x.value)<=2).length;return {x:padL+i*((W-padL-padR)/Math.max(labels.length-1,1)),y:padT+(max-(arr.length?pct(n,arr.length):0))*(H-padT-padB)/max,v:arr.length?pct(n,arr.length):0}});
 const poly=(pts,cls)=>`<polyline points="${pts.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="${cls}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
 const grid=[0,25,50,75,100].map(v=>{const y=padT+(100-v)*(H-padT-padB)/100;return `<line x1="${padL}" x2="${W-padR}" y1="${y}" y2="${y}" stroke="#e7ece9"/><text x="5" y="${y+4}" font-size="10" fill="#6d7c77">${v}%</text>`}).join('');
 const xlabels=labels.map((l,i)=>{const x=padL+i*((W-padL-padR)/Math.max(labels.length-1,1));return `<text x="${x}" y="${H-8}" text-anchor="middle" font-size="10" fill="#6d7c77">${l}</text>`}).join('');
 $("generalChart").innerHTML=`<svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}${poly(points('pos'),'#2e7d5a')}${poly(points('neu'),'#8a9892')}${poly(points('neg'),'#b94b3d')}${xlabels}</svg>`;
}
function renderDistribution(d){
 $("distribution").innerHTML=[5,4,3,2,1].map(v=>{const n=d.filter(x=>Number(x.value)===v).length;return `<div class="bar-row"><div class="bar-top"><span>${climateLabels[v]}</span><strong>${pct(n,d.length)}%</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(n,d.length)}%"></div></div></div>`}).join("");
}
function renderSectors(d,period){
 $("sectorGrid").innerHTML=sectors.map(s=>{const a=d.filter(x=>x.sector===s),score=avg(a),t=trend(s,period);return `<div class="sector-card"><div class="top"><div><div class="sector-name">${s}</div><div class="sector-meta">${a.length} resposta${a.length===1?'':'s'}</div></div><div class="sector-score">${a.length?score.toFixed(1):'—'}</div></div><div class="sector-bar"><i style="width:${a.length?(score/5)*100:0}%"></i></div><div class="sector-meta">${a.length?`<span class="badge ${t[0]}">${t[1]} tendência</span>`:'Dados insuficientes'}</div></div>`}).join("");
}
function renderReasons(d){
 const rr=reasons.map(r=>({label:r,n:d.filter(x=>x.reason===r).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,6);
 $("reasons").innerHTML=rr.length?rr.map(x=>`<div class="bar-row"><div class="bar-top"><span>${x.label}</span><strong>${pct(x.n,d.length)}%</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(x.n,d.length)}%"></div></div></div>`).join(""):"<p class='muted'>Ainda não há motivos registrados.</p>";
}
function renderBands(d){
 const bands=[['Muito bom / Bom',d.filter(x=>Number(x.value)>=4).length],['Normal',d.filter(x=>Number(x.value)===3).length],['Ruim / Muito ruim',d.filter(x=>Number(x.value)<=2).length]];
 $("climateBands").innerHTML=bands.map(x=>`<div class="bar-row"><div class="bar-top"><span>${x[0]}</span><strong>${pct(x[1],d.length)}%</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(x[1],d.length)}%"></div></div></div>`).join("");
}
function renderAlerts(d,period){
 const valid=sectors.map(s=>{const a=d.filter(x=>x.sector===s);return {s,a,score:avg(a)}}).filter(x=>x.a.length>=5).sort((a,b)=>a.score-b.score);
 if(!valid.length){$("alerts").innerHTML='<div class="alert-box">Aguardando respostas suficientes para gerar alertas confiáveis.</div>';return}
 const low=valid.filter(x=>x.score<3.5).slice(0,3),high=valid.filter(x=>x.score>=4.2).slice(-2);
 let html='';
 low.forEach(x=>html+=`<div class="alert-box" style="margin-bottom:9px"><strong>${x.s}</strong><br>Índice ${x.score.toFixed(1)}/5 no período de ${periodLabel(period).toLowerCase()}.</div>`);
 if(!html) html='<div class="alert-box">Nenhum alerta de queda abaixo do limite definido no período.</div>';
 $("alerts").innerHTML=html;
}
function history(){const d=data().sort((a,b)=>new Date(b.date)-new Date(a.date));$("historyTable").innerHTML=`<table><thead><tr><th>Data/hora</th><th>Setor</th><th>Clima</th><th>Motivo</th></tr></thead><tbody>${d.slice(0,300).map(x=>`<tr><td>${new Date(x.date).toLocaleString("pt-BR")}</td><td>${x.sector}</td><td>${climateLabels[x.value]}</td><td>${x.reason||"—"}</td></tr>`).join("")}</tbody></table>`}
$("loginBtn").onclick=()=>{if($("password").value==="cabana2026"){sessionStorage.setItem("cabana_admin","1");$("adminLogin").style.display="none";$("adminApp").style.display="block";render()}else $("error").textContent="Senha incorreta."};
if(sessionStorage.getItem("cabana_admin")==="1"){$("adminLogin").style.display="none";$('adminApp').style.display="block";render()}
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.period)});
$("histBtn").onclick=()=>{$("dashboardView").style.display="none";$('historyView').style.display="block";$('dashBtn').classList.remove("active");$('histBtn').classList.add("active");history()};
$("dashBtn").onclick=()=>{$('historyView').style.display="none";$('dashboardView').style.display="block";$('histBtn').classList.remove("active");$('dashBtn').classList.add("active");render()};
$("logoutBtn").onclick=()=>{sessionStorage.removeItem("cabana_admin");location.reload()};
