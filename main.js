// Simple SPA nav
const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
function showPage(id){
  pages.forEach(p=>{p.classList.toggle('active', p.id===id)});
  navBtns.forEach(b=>b.classList.toggle('active', b.dataset.target===id));
  // reveal animations for newly active page
  setTimeout(()=>runReveal(),80);
}
navBtns.forEach(b=>b.addEventListener('click', ()=>{
  const t=b.dataset.target; showPage(t);
}));

// reveal on scroll
const reveals = () => document.querySelectorAll('.reveal');
function runReveal(){
  const els = reveals();
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{ if(ent.isIntersecting){ ent.target.classList.add('visible'); io.unobserve(ent.target); } });
  },{threshold:0.12});
  els.forEach(el=>{ if(!el.classList.contains('visible')) io.observe(el); });
}
runReveal();

// CONTACT simple fake submit
document.getElementById('contact-form').addEventListener('submit', e=>{
  e.preventDefault(); alert('Thanks! Message sent (demo).'); e.target.reset();
});

// PROJECT cards — add small tilt/parallax effect on pointer move
document.querySelectorAll('.proj').forEach(card=>{
  card.addEventListener('mousemove', e=>{
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotate(${x*6}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', ()=> card.style.transform='');
});

// TODO list logic with localStorage
const TASK_KEY = 'portfolio_todos_v1';
const todoListEl = document.getElementById('todo-list');
const newTaskInput = document.getElementById('new-task');
function loadTasks(){
  const raw = localStorage.getItem(TASK_KEY); return raw? JSON.parse(raw):[];
}
function saveTasks(arr){ localStorage.setItem(TASK_KEY, JSON.stringify(arr)); }
function renderTasks(){
  const tasks = loadTasks(); todoListEl.innerHTML='';
  tasks.forEach((t,i)=>{
    const div=document.createElement('div'); div.className='task'+(t.done? ' done':'');
    const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=t.done; chk.addEventListener('change', ()=>{ t.done=chk.checked; saveTasks(tasks); renderTasks(); });
    const span=document.createElement('div'); span.style.flex=1; span.textContent=t.text;
    const del=document.createElement('button'); del.textContent='✕'; del.style.border='0'; del.style.background='transparent'; del.style.cursor='pointer'; del.addEventListener('click', ()=>{ tasks.splice(i,1); saveTasks(tasks); renderTasks(); });
    div.appendChild(chk); div.appendChild(span); div.appendChild(del); todoListEl.appendChild(div);
  });
}
document.getElementById('add-task').addEventListener('click', ()=>{
  const v=newTaskInput.value.trim(); if(!v) return; const arr=loadTasks(); arr.push({text:v,done:false}); saveTasks(arr); newTaskInput.value=''; renderTasks();
});
document.getElementById('clear-tasks').addEventListener('click', ()=>{ if(confirm('Clear all tasks?')){ localStorage.removeItem(TASK_KEY); renderTasks(); }});
// allow pressing Enter to add task
newTaskInput.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('add-task').click(); }});
renderTasks();

// SETTINGS — theme color picks and bg image
const primaryPick = document.getElementById('primary-color');
const accentPick = document.getElementById('accent-color');
const bgUpload = document.getElementById('bg-upload');
const clearBg = document.getElementById('clear-bg');
const SAVE_KEY = 'portfolio_settings_v1';

function applySettings(s){
  if(!s) return; 
  document.documentElement.style.setProperty('--primary', s.primary||getComputedStyle(document.documentElement).getPropertyValue('--primary'));
  document.documentElement.style.setProperty('--accent', s.accent||getComputedStyle(document.documentElement).getPropertyValue('--accent'));
  if(s.bg) document.body.style.setProperty('--bg-image', `url(${s.bg})`); 
  else document.body.style.setProperty('--bg-image', 'none');
}
function loadSettings(){ const raw = localStorage.getItem(SAVE_KEY); return raw? JSON.parse(raw):null; }
function saveSettings(s){ localStorage.setItem(SAVE_KEY, JSON.stringify(s)); }

// wire picks live
primaryPick.addEventListener('input', e=> {
  document.documentElement.style.setProperty('--primary', e.target.value);
});
accentPick.addEventListener('input', e=> {
  document.documentElement.style.setProperty('--accent', e.target.value);
});

bgUpload.addEventListener('change', e=>{
  const file = e.target.files && e.target.files[0]; if(!file) return;
  const reader = new FileReader(); 
  reader.onload = ev=>{
    const url = ev.target.result; 
    document.body.style.setProperty('--bg-image', `url(${url})`);
    // Save immediately when image is uploaded
    const cur = loadSettings() || {}; 
    cur.bg = url; 
    saveSettings(cur);
  }; 
  reader.readAsDataURL(file);
});

clearBg.addEventListener('click', ()=>{ 
  document.body.style.setProperty('--bg-image','none'); 
  const cur = loadSettings()||{}; 
  delete cur.bg; 
  saveSettings(cur); 
});

// Fixed save theme button - now properly preserves background image
document.getElementById('save-theme').addEventListener('click', ()=>{
  const cur = loadSettings() || {};
  const s = {
    primary: primaryPick.value,
    accent: accentPick.value,
    bg: cur.bg // Preserve existing background image
  };
  saveSettings(s);
  alert('Preferences saved.');
});

// apply saved settings on load
const saved = loadSettings(); 
if(saved){ 
  primaryPick.value = saved.primary || primaryPick.value; 
  accentPick.value = saved.accent || accentPick.value; 
  applySettings(saved); 
}

// small settings quick open
document.getElementById('open-settings-small').addEventListener('click', ()=> showPage('settings'));

// allow programmatically open To-do via the 4th icon
document.getElementById('todo-open').addEventListener('click', ()=> showPage('todo'));

// initial reveal run for home
setTimeout(()=>runReveal(),200);

// Persist active page between reloads (optional)
const LAST_PAGE = 'portfolio_lastpage_v1';
function setLastPage(id){ localStorage.setItem(LAST_PAGE, id); }
function getLastPage(){ return localStorage.getItem(LAST_PAGE); }
// update storage on nav
navBtns.forEach(b=>b.addEventListener('click', ()=> setLastPage(b.dataset.target)));
const lp = getLastPage(); if(lp) showPage(lp);