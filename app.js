const sectors = [
  "Administração","Esporte / Academia","Segurança","Bar / Restaurante",
  "Infraestrutura","Eventos","Comunicação / Marketing / Tecnologia",
  "RH","Financeiro","Compras","Central de Atendimento","Outros"
];
const reasons = [
  "Equipe","Liderança","Comunicação","Organização","Estrutura / materiais",
  "Escala","Distribuição de tarefas","Remuneração / benefícios","Sobrecarga","Outro"
];
let state={sector:null,value:null,reason:null};
const $=id=>document.getElementById(id);
function showStep(id){document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"));$("step-"+id).classList.add("active")}
function getData(){try{return JSON.parse(localStorage.getItem("cabana_clima")||"[]")}catch{return []}}
function saveData(d){localStorage.setItem("cabana_clima",JSON.stringify(d))}
function addResponse(){
  const d=getData();
  d.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),date:new Date().toISOString(),sector:state.sector,value:state.value,reason:state.reason});
  saveData(d);
}
function populate(){
  $("sectorGrid").innerHTML=sectors.map(s=>`<button data-sector="${s}">${s}</button>`).join("");
  $("reasonGrid").innerHTML=reasons.map(r=>`<button data-reason="${r}">${r}</button>`).join("");
  document.querySelectorAll("[data-sector]").forEach(b=>b.onclick=()=>{state.sector=b.dataset.sector;showStep("climate")});
  document.querySelectorAll(".climate").forEach(b=>b.onclick=()=>{state.value=Number(b.dataset.value);state.reason=null;showStep("reason")});
  document.querySelectorAll("[data-reason]").forEach(b=>b.onclick=()=>{state.reason=b.dataset.reason;finish()});
}
function finish(){addResponse();showStep("thanks");setTimeout(()=>{state={sector:null,value:null,reason:null};showStep("start")},2200)}
$("startBtn").onclick=()=>showStep("sector");
$("finishBtn").onclick=finish;
document.querySelectorAll(".back").forEach(b=>b.onclick=()=>showStep(b.dataset.back));
populate();
