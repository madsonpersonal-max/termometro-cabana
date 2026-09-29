const cfg = window.TERMOMETRO_CONFIG || {};
const valid = cfg.SUPABASE_URL && cfg.SUPABASE_URL.startsWith("https://") &&
             cfg.SUPABASE_PUBLISHABLE_KEY && !cfg.SUPABASE_PUBLISHABLE_KEY.startsWith("COLE_");
const db = valid ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY) : null;

const sectors = [
  "Administração","Esporte / Academia","Segurança","Bar / Restaurante",
  "Infraestrutura","Eventos","Comunicação / Marketing / Tecnologia","RH",
  "Financeiro","Compras","Central de Atendimento","Outros"
];
const reasons = [
  "Equipe","Liderança","Comunicação","Organização","Estrutura/materiais",
  "Escala","Distribuição de tarefas","Remuneração/benefícios","Sobrecarga","Outro"
];

const $ = id => document.getElementById(id);
let sector = null, score = null;

function renderOptions() {
  $("sectorGrid").innerHTML = sectors.map(s => `<button class="option" data-sector="${s}">${s}</button>`).join("");
  $("reasonGrid").innerHTML = reasons.map(r => `<button class="option" data-reason="${r}">${r}</button>`).join("");
}
renderOptions();

$("startBtn").onclick = () => {
  $("startBtn").classList.add("hidden");
  $("survey").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
};

$("sectorGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-sector]"); if (!b) return;
  sector = b.dataset.sector;
  $("climateStep").classList.remove("hidden");
  [...$("sectorGrid").children].forEach(x=>x.classList.remove("selected"));
  b.classList.add("selected");
});

$("climateStep").addEventListener("click", e => {
  const b = e.target.closest("[data-score]"); if (!b) return;
  score = Number(b.dataset.score);
  [...$("climateStep").querySelectorAll("[data-score]")].forEach(x=>x.classList.remove("selected"));
  b.classList.add("selected");
  $("reasonStep").classList.remove("hidden");
});

async function save(reason=null) {
  if (!db) {
    $("saveStatus").textContent = "Configuração do banco ainda não foi concluída.";
    return;
  }
  const {error} = await db.from("termometro_respostas").insert({
    sector, score, reason
  });
  if (error) {
    console.error(error);
    $("saveStatus").textContent = "Não foi possível registrar agora. Tente novamente.";
    return;
  }
  $("survey").classList.add("hidden");
  $("thanks").classList.remove("hidden");
  setTimeout(reset, 4500);
}
$("reasonGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-reason]"); if (!b) return;
  save(b.dataset.reason);
});
$("skipReason").onclick = () => save(null);

function reset() {
  sector=null; score=null;
  $("thanks").classList.add("hidden");
  $("startBtn").classList.remove("hidden");
  $("survey").classList.add("hidden");
  $("climateStep").classList.add("hidden");
  $("reasonStep").classList.add("hidden");
  $("saveStatus").textContent="";
  document.querySelectorAll(".selected").forEach(x=>x.classList.remove("selected"));
}
