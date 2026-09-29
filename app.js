const sectors = [
  "Administração","Esporte / Academia","Segurança","Bar / Restaurante",
  "Infraestrutura","Eventos","Comunicação / Marketing / Tecnologia",
  "RH","Financeiro","Compras","Central de Atendimento","Outros"
];
const reasons = [
  "Equipe","Liderança","Comunicação","Organização","Estrutura / materiais",
  "Escala","Distribuição de tarefas","Remuneração / benefícios","Sobrecarga","Outro"
];
const climateLabels = {5:"Muito bom",4:"Bom",3:"Normal",2:"Ruim",1:"Muito ruim"};

let state = {sector:null, value:null, reason:null};

const $ = id => document.getElementById(id);
const pages = [...document.querySelectorAll(".page")];
function showStep(id){
  document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"));
  $("step-"+id).classList.add("active");
}
function showPage(id){
  pages.forEach(p=>p.classList.toggle("active",p.id===id));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
  if(id==="dashboard") renderDashboard();
  if(id==="historico") renderHistory();
}
function getData(){
  try{return JSON.parse(localStorage.getItem("cabana_clima")||"[]")}catch{return []}
}
function saveData(data){localStorage.setItem("cabana_clima",JSON.stringify(data))}
function addResponse(){
  const data=getData();
  data.push({
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random()),
    date:new Date().toISOString(),
    sector:state.sector,
    value:state.value,
    reason:state.reason
  });
  saveData(data);
}
function seedData(){
  if(getData().length) return;
  const now=new Date();
  const arr=[];
  const values=[5,4,4,5,3,4,5,2,4,3,5,4,4,3,5,4,2,4,5,3];
  for(let i=0;i<70;i++){
    const d=new Date(now); d.setDate(d.getDate()-Math.floor(Math.random()*30));
    const sector=sectors[i%sectors.length];
    const value=values[i%values.length];
    arr.push({id:"demo-"+i,date:d.toISOString(),sector,value,reason:value<=3?reasons[(i+2)%reasons.length]:null});
  }
  saveData(arr);
}
function populate(){
  $("sectorGrid").innerHTML=sectors.map(s=>`<button data-sector="${s}">${s}</button>`).join("");
  $("reasonGrid").innerHTML=reasons.map(r=>`<button data-reason="${r}">${r}</button>`).join("");
  document.querySelectorAll("[data-sector]").forEach(b=>b.onclick=()=>{
    state.sector=b.dataset.sector; showStep("climate");
  });
  document.querySelectorAll(".climate").forEach(b=>b.onclick=()=>{
    state.value=Number(b.dataset.value);
    state.reason=null;
    showStep("reason");
  });
  document.querySelectorAll("[data-reason]").forEach(b=>b.onclick=()=>{
    state.reason=b.dataset.reason;
    addResponse(); showStep("thanks");
    setTimeout(resetTablet,2200);
  });
}
function resetTablet(){state={sector:null,value:null,reason:null};showStep("start")}
$("startBtn").onclick=()=>showStep("sector");
$("finishBtn").onclick=()=>{addResponse();showStep("thanks");setTimeout(resetTablet,2200)};
document.querySelectorAll(".back").forEach(b=>b.onclick=()=>showStep(b.dataset.back));
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  renderDashboard(b.dataset.period);
});
$("clearBtn").onclick=()=>{
  if(confirm("Apagar todos os dados locais deste protótipo?")){localStorage.removeItem("cabana_clima");renderHistory();renderDashboard();}
};

function filtered(period="today"){
  const data=getData(), now=new Date();
  if(period==="today") return data.filter(x=>new Date(x.date).toDateString()===now.toDateString());
  const days=Number(period); const cutoff=new Date(now); cutoff.setDate(cutoff.getDate()-days+1);
  return data.filter(x=>new Date(x.date)>=cutoff);
}
function avg(a){return a.length?a.reduce((s,x)=>s+x.value,0)/a.length:0}
function pct(n,d){return d?Math.round(n/d*100):0}
function trendFor(sector,data){
  const now=new Date(), recent=[], old=[];
  data.forEach(x=>{
    if(x.sector!==sector)return;
    const days=(now-new Date(x.date))/86400000;
    if(days<=7)recent.push(x); else if(days<=14)old.push(x);
  });
  const a=avg(recent),b=avg(old);
  if(!recent.length||!old.length)return ["flat","→"];
  if(a>b+.15)return ["up","↑"];
  if(a<b-.15)return ["down","↓"];
  return ["flat","→"];
}
function renderDashboard(period="today"){
  const data=filtered(period);
  const positive=data.filter(x=>x.value>=4).length;
  const neutral=data.filter(x=>x.value===3).length;
  const negative=data.filter(x=>x.value<=2).length;
  $("kpis").innerHTML=[
    ["Índice geral",avg(data).toFixed(1)+"/5",`${data.length} respostas`],
    ["Clima positivo",pct(positive,data.length)+"%",`${positive} respostas`],
    ["Clima neutro",pct(neutral,data.length)+"%",`${neutral} respostas`],
    ["Clima negativo",pct(negative,data.length)+"%",`${negative} respostas`]
  ].map(x=>`<div class="kpi"><div class="label">${x[0]}</div><div class="value">${x[1]}</div><div class="sub">${x[2]}</div></div>`).join("");
  $("responseCount").textContent=`${data.length} respostas no período`;
  const rows=sectors.map(s=>{
    const a=data.filter(x=>x.sector===s); const t=trendFor(s,getData());
    return `<tr><td>${s}</td><td><strong>${a.length?avg(a).toFixed(1):"—"}</strong></td><td>${a.length}</td><td>${a.length?`<span class="badge ${t[0]}">${t[1]}</span>`:"—"}</td></tr>`;
  }).join("");
  $("sectorTable").innerHTML=`<table><thead><tr><th>Setor</th><th>Índice</th><th>Respostas</th><th>Tendência</th></tr></thead><tbody>${rows}</tbody></table>`;
  const dist=[5,4,3,2,1].map(v=>({label:climateLabels[v],n:data.filter(x=>x.value===v).length}));
  $("distribution").innerHTML=dist.map(x=>`<div class="bar-row"><div class="bar-top"><span>${x.label}</span><strong>${pct(x.n,data.length)}%</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(x.n,data.length)}%"></div></div></div>`).join("");
  const rr=reasons.map(r=>({label:r,n:data.filter(x=>x.reason===r).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,8);
  $("reasons").innerHTML=rr.length?rr.map(x=>`<div class="bar-row"><div class="bar-top"><span>${x.label}</span><strong>${pct(x.n,data.length)}%</strong></div><div class="bar-bg"><div class="bar-fill" style="width:${pct(x.n,data.length)}%"></div></div></div>`).join(""):"<p class='hint'>Ainda não há motivos registrados.</p>";
}
function renderHistory(){
  const data=getData().sort((a,b)=>new Date(b.date)-new Date(a.date));
  $("historyTable").innerHTML=`<table><thead><tr><th>Data/hora</th><th>Setor</th><th>Clima</th><th>Motivo</th></tr></thead><tbody>${
    data.slice(0,200).map(x=>`<tr><td>${new Date(x.date).toLocaleString("pt-BR")}</td><td>${x.sector}</td><td>${climateLabels[x.value]}</td><td>${x.reason||"—"}</td></tr>`).join("")
  }</tbody></table>`;
}
seedData(); populate(); renderDashboard(); renderHistory();
