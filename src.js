import foods from "./foods.json";
import "./style.css";

const STORE="nourish_zero_v2";
let entries=JSON.parse(localStorage.getItem(STORE)||"[]");
let draft=[];
let caloriesShown=false;
const app=document.querySelector("#app");
const todayKey=()=>new Date().toLocaleDateString("en-CA");
const dateLabel=()=>new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nfmt=x=>x==null?"—":(Math.round(x*10)/10).toString();
function save(){localStorage.setItem(STORE,JSON.stringify(entries));render();}
function findFood(text){
 const q=text.toLowerCase().trim();
 return foods.find(f=>f.aliases.some(a=>q===a||q.includes(a)))||foods.find(f=>f.name.toLowerCase().includes(q));
}
function parseEntry(raw){
 // Recognises a small number of common quantity expressions and common food names.
 const bits=raw.split(/,| and | with /i).map(x=>x.trim()).filter(Boolean);
 return bits.map(bit=>{
   const f=findFood(bit); if(!f)return {label:bit,food:null,grams:100,confidence:"low"};
   const m=bit.match(/(\d+(?:\.\d+)?)\s*(g|grams?|ml|millilitres?)\b/i);
   const count=bit.match(/\b(one|two|three|four|five|half|a)\b/i);
   let grams=m?Number(m[1]):100;
   if(!m&&count){const c=count[1].toLowerCase();grams=({one:50,two:100,three:150,four:200,five:250,half:75,a:50})[c]||100;}
   return {label:f.name,food:f,grams,confidence:m?"medium":"low"};
 });
}
function calculate(lines){
 const result={};const fields=["kcal","protein","carbs","sugars","fibre","fat","sat","iron","calcium","magnesium","potassium","zinc","folate","b12","vitc","vitd","vitA"];
 fields.forEach(k=>result[k]=0);
 lines.forEach(line=>{if(!line.food)return;fields.forEach(k=>result[k]+=(line.food[k]||0)*line.grams/100);});
 return result;
}
function addDraft(){
 const text=document.querySelector("#foodText").value.trim();
 if(!text){alert("Please describe what you ate.");return;}
 const lines=parseEntry(text);
 draft.push({id:crypto.randomUUID(),meal:document.querySelector("#meal").value,text,lines,createdAt:new Date().toISOString()});
 document.querySelector("#foodText").value="";
 render();
}
function render(){
 const day=entries.filter(e=>new Date(e.createdAt).toLocaleDateString("en-CA")===todayKey());
 app.innerHTML=`
 <header><div class="brand"><div><h1>nourish.</h1><p>Your personal nutrition journal</p></div><span class="leaf">❧</span></div><div class="eyebrow">YOUR PRIVATE FOOD DIARY</div><div class="date">${dateLabel()}</div></header>
 <nav><button class="active" data-tab="diary">Diary</button><button data-tab="nutrition">Nutrition</button><button data-tab="insights">Insights</button></nav>
 <main>
 <section id="diary" class="screen active">
 <h2>Your food diary</h2><p class="sub">A gentle record of what you eat. No weight goals, no judgement.</p>
 <div class="card"><h3>Add a food entry</h3><label>MEAL</label><select id="meal"><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option><option>Drink</option></select>
 <label>WHAT DID YOU EAT?</label><textarea id="foodText" placeholder="For example: 40g porridge oats, 150ml milk and one banana. Separate foods with commas or 'and'."></textarea>
 <p class="hint">For better estimates, include amounts in grams or millilitres. You can edit every ingredient and quantity before saving.</p>
 <button class="primary" id="parse">Add ingredients to review</button></div>
 ${draft.length?`<div class="card"><h3>Review your ingredients</h3><p class="sub">Check the matches and quantities. Unknown foods are left uncalculated rather than guessed.</p>${draft.map(d=>`<div class="draft"><b>${esc(d.meal)}</b><p>${esc(d.text)}</p>${d.lines.map((l,i)=>`<div class="ingredient"><div><b>${esc(l.label)}</b><small>${l.food?`Matched food · ${l.confidence} quantity confidence`:"No database match — not included in totals"}</small></div><input aria-label="Grams" type="number" min="0" step="1" value="${l.grams}" data-draft="${d.id}" data-index="${i}"><span>g</span></div>`).join("")}<button class="primary" data-save="${d.id}">Confirm and save entry</button></div>`).join("")}</div>`:""}
 <div class="section"><h3>Today's entries</h3><span class="tag">${day.length} recorded</span></div>
 ${day.length?day.slice().reverse().map(e=>`<div class="card entry"><div class="entrytop"><b>${esc(e.meal)}</b><button class="delete" data-delete="${e.id}">Delete</button></div><p>${esc(e.text)}</p><small>${e.lines.filter(x=>x.food).length} database matches · ${e.lines.filter(x=>!x.food).length} unmatched foods</small></div>`).join(""):`<div class="card empty">Your diary is ready. Add an entry whenever it feels useful.</div>`}
 </section>
 <section id="nutrition" class="screen"><h2>Nutritional overview</h2><p class="sub">Daily estimates from confirmed database matches. Missing matches are not counted as zero.</p>
 <div class="card energy"><div><b>Energy information</b><p class="hint">Hidden unless you choose to reveal it.</p></div><button class="soft" id="togglecal">${caloriesShown?"Hide":"Reveal calories"}</button><div id="calval" class="calval" style="display:${caloriesShown?"block":"none"}">${nfmt(sum(day,"kcal"))} kcal estimated</div></div>
 <h3>Macronutrients</h3><div class="grid">${tile("Protein","protein","g",day)}${tile("Carbohydrate","carbs","g",day)}${tile("Sugars","sugars","g",day)}${tile("Total fat","fat","g",day)}${tile("Saturated fat","sat","g",day)}</div>
 <h3>Fibre</h3><div class="card"><div class="big">${nfmt(sum(day,"fibre"))} g</div><p class="hint">Estimated from matched foods only. No daily target is imposed.</p></div>
 <h3>Vitamins</h3><div class="grid">${tile("Vitamin A","vitA","µg",day)}${tile("Vitamin C","vitc","mg",day)}${tile("Vitamin D","vitd","µg",day)}${tile("Folate","folate","µg",day)}${tile("Vitamin B12","b12","µg",day)}</div>
 <h3>Minerals</h3><div class="grid">${tile("Iron","iron","mg",day)}${tile("Calcium","calcium","mg",day)}${tile("Magnesium","magnesium","mg",day)}${tile("Potassium","potassium","mg",day)}${tile("Zinc","zinc","mg",day)}</div>
 <p class="hint">This starter food table covers a limited set of foods and nutrients. It is not yet the complete UK CoFID dataset.</p></section>
 <section id="insights" class="screen"><h2>Patterns, not perfection</h2><p class="sub">A record to help you and your clinician understand your diet.</p><div class="card"><h3>How estimates work</h3><p>Foods matched to the starter database are calculated using per-100g values scaled to your confirmed quantity. Unmatched ingredients are listed but excluded from totals.</p><p class="hint">This is a limited demonstration dataset, not a complete or clinically validated nutrient analysis. AI recognition is intentionally not claimed in this zero-cost version.</p></div>
 <div class="card"><h3>Your data stays on this device</h3><p class="hint">Diary entries are stored in this browser's local storage. Clearing browser data or changing devices can remove them. Export a backup regularly.</p><button class="primary" id="export">Export diary backup</button><button class="soft" id="importbtn">Import backup</button><input id="importfile" type="file" accept="application/json" hidden><button class="deleteall" id="clear">Delete all diary data</button></div></section>
 <footer>nourish. · A little care, every day.<br>No weight tracking. No food guilt.</footer></main>`;
 document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id===b.dataset.tab));});
 document.querySelector("#parse").onclick=addDraft;
 document.querySelectorAll("[data-draft]").forEach(inp=>inp.onchange=()=>{const d=draft.find(x=>x.id===inp.dataset.draft);if(d)d.lines[Number(inp.dataset.index)].grams=Math.max(0,Number(inp.value)||0);});
 document.querySelectorAll("[data-save]").forEach(btn=>btn.onclick=()=>{const d=draft.find(x=>x.id===btn.dataset.save);if(d){entries.push({...d,confirmed:true});draft=draft.filter(x=>x.id!==d.id);save();}});
 document.querySelectorAll("[data-delete]").forEach(btn=>btn.onclick=()=>{entries=entries.filter(x=>x.id!==btn.dataset.delete);save();});
 const tc=document.querySelector("#togglecal");if(tc)tc.onclick=()=>{caloriesShown=!caloriesShown;render();document.querySelector('[data-tab="nutrition"]').click();};
 const ex=document.querySelector("#export");if(ex)ex.onclick=()=>download(JSON.stringify(entries,null,2),"nourish-backup.json");
 const im=document.querySelector("#importbtn");if(im)im.onclick=()=>document.querySelector("#importfile").click();
 const file=document.querySelector("#importfile");if(file)file.onchange=async()=>{try{const parsed=JSON.parse(await file.files[0].text());if(Array.isArray(parsed)){entries=parsed;save();}}catch{alert("That backup file could not be read.");}};
 const cl=document.querySelector("#clear");if(cl)cl.onclick=()=>{if(confirm("Delete all entries from this device?")){entries=[];save();}};
}
function sum(day,k){let total=0,any=false;day.forEach(e=>e.lines.forEach(l=>{if(l.food){total+=(l.food[k]||0)*l.grams/100;any=true;}}));return any?total:null;}
function tile(label,key,unit,day){return `<div class="tile"><small>${label}</small><b>${nfmt(sum(day,key))}</b><span>${unit}</span></div>`;}
function download(data,name){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([data],{type:"application/json"}));a.href=u;a.download=name;a.click();URL.revokeObjectURL(u);}
if("serviceWorker" in navigator)navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(()=>{});
render();
