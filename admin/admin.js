const sectors=["Administração","Esporte / Academia","Segurança","Bar / Restaurante","Infraestrutura","Eventos","Comunicação / Marketing / Tecnologia","RH","Financeiro","Compras","Central de Atendimento","Outros"];
const climateLabels={5:"Muito bom",4:"Bom",3:"Normal",2:"Ruim",1:"Muito ruim"};
const reasons=["Equipe","Liderança","Comunicação","Organização","Estrutura / materiais","Escala","Distribuição de tarefas","Remuneração / benefícios","Sobrecarga","Outro"];
const $=id=>document.getElementById(id);
const data=()=>{try{return JSON.parse(localStorage.getItem("cabana_clima")||"[]")}catch{return []}};
function avg(a){return a.length?a.reduce((s,x)=>s+x.value,0)/a.length:0}
function pct(n,d){return d?Math.round(n/d*100):0}
function filtered(period="today"){const d=data(),now=new Date();if(period==="today")return d.filter(x=>new Date(x.date).toDateString()===now.toDateString());const c=new Date(now);c.setDate(c.getDate()-Number(period)+1);return d.filter(x=>new Date(x.date)>=c)}
function trend(sector){const now=new Date(),r=[],o=[];data().forEach(x=>{if(x.sector!==sector)return;const days=(now-new Date(x.date))/86400000;if(days<=7)r.push(x);else if(days<=14)o.push(x)});if(!r.length||!o.length)return["flat","→"];const a=avg(r),b=avg(o);return a>b+.15?["up","↑"]:a<b-.15?["down","↓"]:["flat","→"]}
function render(period="today"){
 const d=filtered(period),pos=d.filter(x=>x.value>=4).length,neu=d.filter(x=>x.value===3).length,neg=d.filter(x=>x.value<=2).length;
 $("kpis").innerHTML=[["Índice geral",avg(d).toFixed(1)+"/5",`${d.length} respostas`],["Clima positivo",pct(pos,d.length)+"%",`${pos} respostas`],["Clima neutro",pct(neu,d.length)+"%",`${neu} respostas`],["Clima negativo",pct(neg,d.length)+"%",`${neg} respostas`]].map(x=>`<div class="kpi"><div class="label">${x[0]}</div><div class="value">${x[1]}</div><div class="sub">${x[2]}</div></div>`).join("");
 $("responseCount").textContent=`${d.length} respostas no período`;
 $("sectorTable").innerHTML=`<table><thead><tr><th>Setor</th><th>Índice</th><th>Respostas</th><th>Tendência</th></tr></thead><tbody>${sectors.map(s=>{const a=d.filter(x=>x.sector===s),t=trend(s);return `<tr><td>${s}</td><td><strong>${a.length?avg(a).toFixed(1):"—"}</strong></td><td>${a.length}</td><td>${a.length?`<span class="badge ${t[0]}">${t[1]}</span>`:"—"}</td></tr>`}).join("")}</tbody></table>`;
 $("distribution").innerHTML=[5,4,3,2,1].map(v=>{const n=d.filter(x=>x.value===v).length;return `<div class="bar-row"><div class="bar-top"><span>${climateLabels[v]}</span><strong>${pct(n,d.length)}%</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(n,d.length)}%"></div></div></div>`}).join("");
 const rr=reasons.map(r=>({label:r,n:d.filter(x=>x.reason===r).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,8);
 $("reasons").innerHTML=rr.length?rr.map(x=>`<div class="bar-row"><div class="bar-top"><span>${x.label}</span><strong>${pct(x.n,d.length)}%</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(x.n,d.length)}%"></div></div></div>`).join(""):"<p style='color:#6d7c77'>Ainda não há motivos registrados.</p>";
}
function history(){const d=data().sort((a,b)=>new Date(b.date)-new Date(a.date));$("historyTable").innerHTML=`<table><thead><tr><th>Data/hora</th><th>Setor</th><th>Clima</th><th>Motivo</th></tr></thead><tbody>${d.slice(0,300).map(x=>`<tr><td>${new Date(x.date).toLocaleString("pt-BR")}</td><td>${x.sector}</td><td>${climateLabels[x.value]}</td><td>${x.reason||"—"}</td></tr>`).join("")}</tbody></table>`}
$("loginBtn").onclick=()=>{if($("password").value==="cabana2026"){sessionStorage.setItem("cabana_admin","1");$("adminLogin").style.display="none";$("adminApp").style.display="block";render()}else $("error").textContent="Senha incorreta."};
if(sessionStorage.getItem("cabana_admin")==="1"){$("adminLogin").style.display="none";$("adminApp").style.display="block";render()}
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.period)});
$("histBtn").onclick=()=>{$("dashboardView").style.display="none";$("historyView").style.display="block";$("dashBtn").classList.remove("active");$("histBtn").classList.add("active");history()};
$("dashBtn").onclick=()=>{$("historyView").style.display="none";$("dashboardView").style.display="block";$("histBtn").classList.remove("active");$("dashBtn").classList.add("active");render()};
$("logoutBtn").onclick=()=>{sessionStorage.removeItem("cabana_admin");location.reload()};
