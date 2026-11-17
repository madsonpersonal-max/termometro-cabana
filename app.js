const cfg=window.TERMOMETRO_CONFIG||{};
const valid=cfg.SUPABASE_URL&&cfg.SUPABASE_URL.startsWith("https://")&&cfg.SUPABASE_PUBLISHABLE_KEY;
const db=valid?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}):null;
const questions=[
{id:"member",title:"Você é associado do Cabana Clube?",type:"single",options:["Sim, titular","Sim, dependente","Não, sou visitante"]},
{id:"frequency",title:"Com que frequência você utiliza nosso restaurante?",type:"single",options:["Diariamente","2 a 3 vezes por semana","Uma vez por semana","Algumas vezes por mês","Raramente","É minha primeira visita"]},
{id:"choice_factors",title:"O que mais influencia sua escolha de restaurante?",type:"multi",max:3,options:["Qualidade da comida","Preço","Variedade do cardápio","Churrasco","Ambiente","Localização","Comodidade"]},
{id:"food_preference",title:"Qual tipo de alimentação você mais aprecia?",type:"multi",max:3,options:["Comida caseira","Churrasco","Peixes","Massas","Frango","Comida regional paraense","Alimentação saudável"]},
{id:"meats",title:"Quais carnes gostaria de encontrar com mais frequência?",type:"multi",options:["Picanha","Alcatra","Contra-filé","Maminha","Frango","Carne suína","Peixes","Outras"]},
{id:"buffet_items",title:"O que não pode faltar no nosso buffet?",type:"multi",max:4,options:["Arroz e feijão","Massas","Pratos regionais","Legumes","Guarnições variadas","Farofas","Acompanhamentos especiais"]},
{id:"salad_rating",title:"Como você avalia a variedade de saladas?",type:"single",options:["Excelente","Boa","Regular","Ruim","Precisa melhorar bastante"]},
{id:"buffet_variety",title:"Como avalia a variedade dos pratos oferecidos?",type:"single",options:["Excelente","Boa","Regular","Ruim","Muito ruim"]},
{id:"quality_ratings",title:"Como você avalia cada aspecto do nosso buffet?",type:"ratings",items:["Sabor da comida","Qualidade das carnes","Temperatura dos alimentos","Apresentação do buffet","Reposição dos alimentos","Higiene e organização"]},
{id:"price_fair",title:"Como você considera o preço atual por quilo?",type:"single",options:["Muito justo","Justo","Um pouco caro","Muito caro","Não sei informar"]},
{id:"improvements",title:"O que poderia melhorar no restaurante?",type:"multi",options:["Mais opções de churrasco","Mais variedade de pratos","Mais opções de saladas","Melhorar a qualidade dos alimentos","Melhorar a apresentação do buffet","Rever o preço por quilo","Melhorar o ambiente"]},
{id:"special_days",title:"Quais dias ou opções especiais despertariam seu interesse?",type:"multi",options:["Dia do churrasco","Dia do peixe","Feijoada","Comida regional paraense","Festival de massas","Comida caseira especial","Buffet temático"]},
{id:"return_reasons",title:"O que faria você frequentar mais vezes o restaurante?",type:"multi",options:["Preços mais atrativos","Mais variedade","Melhor qualidade da alimentação","Promoções especiais","Cardápio semanal divulgado antecipadamente","Mais opções de churrasco","Ambiente mais agradável"]},
{id:"low_frequency_reason",title:"Se você vem pouco ou deixou de frequentar, qual o principal motivo?",type:"single",optional:true,options:["Preço","Cardápio pouco variado","Qualidade da alimentação","Falta de opções que me agradam","Horário de funcionamento","Prefiro outros restaurantes","Não costumo almoçar fora","Outro motivo"]},
{id:"suggestion",title:"O que você gostaria de encontrar no Restaurante Cabana Clube?",type:"text",optional:true,placeholder:"Deixe sua sugestão (opcional)..."}
];
const answers={};let index=0;const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.add("hidden"));$(id).classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});}
function renderQuestion(){const q=questions[index];$("progressText").textContent="Pergunta "+(index+1)+" de "+questions.length;$("progressFill").style.width=((index+1)/questions.length*100)+"%";let html="<h2>"+q.title+"</h2>";
if(q.type==="single"||q.type==="multi"){html+='<p class="helper">'+(q.type==="multi"?"Selecione suas opções"+(q.max?" (até "+q.max+")":""):"Escolha uma opção")+"</p><div class='answer-options'>";html+=q.options.map(o=>'<button type="button" class="answer-option '+((q.type==="multi"?(answers[q.id]||[]).includes(o):answers[q.id]===o)?"selected":"")+'" data-value="'+o.replace(/"/g,"&quot;")+'">'+o+"</button>").join("")+"</div>";}
if(q.type==="ratings"){html+='<p class="helper">Toque em uma nota de 1 a 5 para cada item.</p><div class="rating-list">'+q.items.map(item=>'<div class="rating-row"><b>'+item+'</b><div class="rating-buttons">'+[1,2,3,4,5].map(n=>'<button type="button" data-item="'+item+'" data-rating="'+n+'" class="'+(answers[q.id]?.[item]===n?"selected":"")+'">'+n+"</button>").join("")+"</div></div>").join("")+"</div><p class='helper'>1 = Muito ruim · 5 = Excelente</p>";}
if(q.type==="text")html+='<textarea id="suggestionInput" rows="4" maxlength="600" placeholder="'+q.placeholder+'">'+(answers[q.id]||"")+"</textarea>";
$("questionArea").innerHTML=html;$("back").disabled=index===0;$("next").textContent=index===questions.length-1?"ENVIAR RESPOSTAS":"CONTINUAR";$("skip").classList.toggle("hidden",!q.optional);
}
$("begin").onclick=()=>{show("questionScreen");renderQuestion();};
$("questionArea").addEventListener("click",e=>{const opt=e.target.closest("[data-value]");if(opt){const q=questions[index],v=opt.dataset.value;if(q.type==="single")answers[q.id]=v;else{const arr=answers[q.id]||[];const at=arr.indexOf(v);if(at>=0)arr.splice(at,1);else if(!q.max||arr.length<q.max)arr.push(v);answers[q.id]=arr;}renderQuestion();return;}const rating=e.target.closest("[data-rating]");if(rating){answers[questions[index].id]??={};answers[questions[index].id][rating.dataset.item]=Number(rating.dataset.rating);renderQuestion();}});
function capture(){const q=questions[index];if(q.type==="text")answers[q.id]=$("suggestionInput").value.trim();}
function validAnswer(){const q=questions[index];capture();if(q.optional)return true;if(q.type==="single")return !!answers[q.id];if(q.type==="multi")return Array.isArray(answers[q.id])&&answers[q.id].length>0;if(q.type==="ratings")return q.items.every(x=>answers[q.id]?.[x]);if(q.type==="text")return !!answers[q.id];return true;}
$("next").onclick=async()=>{if(!validAnswer()){alert("Selecione uma resposta para continuar.");return;}if(index<questions.length-1){index++;renderQuestion();window.scrollTo(0,0);}else await submit();};
$("back").onclick=()=>{capture();if(index>0){index--;renderQuestion();}};
$("skip").onclick=()=>{capture();index++;renderQuestion();};
async function submit(){if(!db){$("errorText").textContent="A configuração do banco não foi encontrada. Avise a administração.";show("errorScreen");return;}show("sending");const payload={answers,respondent_type:answers.member||"Não informado"};const{error}=await db.from("restaurante_pesquisa_respostas").insert(payload);if(error){console.error(error);$("errorText").textContent="Não foi possível registrar: "+error.message;show("errorScreen");return;}show("thanks");}
$("retry").onclick=submit;