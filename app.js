
const APP_VERSION='1.0.0';
const STORAGE_KEY='neon_config_v1';
const NOTES_KEY='neon_capture_v1';

const MODULES=['OPS','PRAWO','MARKET','RADAR','NAUKA','LAB'];
const LINK_SLOTS=[
  ['PANEL','Panel główny'],
  ['LOUNGE','NEON Lounge'],
  ['OPS_MAIN','Ops + Nauka'],
  ['PRAWO_MAIN','Prawo — główny'],
  ['PRAWO_PRACA','Porady prawa pracy'],
  ['PRAWO_ADMIN','Zajęcia administracyjne'],
  ['MARKET_MAIN','Market — główny'],
  ['MARKET_1730','US Desk 17:30'],
  ['PORTFEL','Portfel inwestycyjny'],
  ['RADAR_MAIN','Mega Deal Radar'],
  ['NAUKA_MAIN','Nauka / Ops'],
  ['LAB_MAIN','NEON Lab']
];

let STATUS=null;
let swReg=null;

function $(id){return document.getElementById(id)}
function toast(msg){
  const t=$('toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),2400);
}
function tick(){
  const n=new Date();
  $('clock').textContent=n.toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'});
  $('date').textContent=n.toLocaleDateString('pl-PL',{weekday:'short',day:'2-digit',month:'2-digit'});
}
function normalizeUrl(raw){
  let s=(raw||'').trim();
  if(!s) return '';
  if(!/^https?:\/\//i.test(s)) s='https://'+s;
  try{
    const u=new URL(s);
    if(u.protocol!=='https:') return '';
    const h=u.hostname.toLowerCase();
    if(!(h==='chatgpt.com'||h==='www.chatgpt.com'||h==='chat.openai.com')) return '';
    return u.href;
  }catch(e){return ''}
}
function getConfig(){
  try{
    const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    return {schema:1,links:x.links||{},updated_at:x.updated_at||null};
  }catch(e){return {schema:1,links:{},updated_at:null}}
}
function setConfig(cfg){
  const payload={schema:1,links:cfg.links||{},updated_at:new Date().toISOString()};
  localStorage.setItem(STORAGE_KEY,JSON.stringify(payload));
  const verify=getConfig();
  return JSON.stringify(verify.links)===JSON.stringify(payload.links);
}
function slotForModule(m){
  return ({OPS:'OPS_MAIN',PRAWO:'PRAWO_MAIN',MARKET:'MARKET_MAIN',RADAR:'RADAR_MAIN',NAUKA:'NAUKA_MAIN',LAB:'LAB_MAIN'})[m];
}
function openSlot(slot){
  const u=normalizeUrl(getConfig().links[slot]);
  if(!u){ openLinks(slot); return; }
  location.href=u;
}
function ageText(iso){
  if(!iso)return 'MANUAL';
  const ms=Math.max(0,Date.now()-new Date(iso).getTime()),m=Math.floor(ms/60000);
  if(m<2)return 'NOW'; if(m<60)return `${m}m`; const h=Math.floor(m/60); if(h<24)return `${h}h`; return `${Math.floor(h/24)}d`;
}
function freshness(m){
  if(m.state==='MANUAL')return {txt:'MANUAL',cls:''};
  if(m.state==='READY')return {txt:'READY',cls:'good'};
  if(m.state==='WEEKEND')return {txt:'WEEKEND',cls:'warn'};
  if(m.state==='PARTIAL')return {txt:`PARTIAL · ${ageText(m.last_run)}`,cls:'warn'};
  const h=m.last_run?(Date.now()-new Date(m.last_run))/3600000:999;
  if(h<=3)return {txt:`FRESH · ${ageText(m.last_run)}`,cls:'good'};
  if(h<=12)return {txt:`AGED · ${ageText(m.last_run)}`,cls:'warn'};
  return {txt:`STALE · ${ageText(m.last_run)}`,cls:'bad'};
}
function fmtNext(iso){
  if(!iso)return '';
  return new Date(iso).toLocaleString('pl-PL',{weekday:'short',hour:'2-digit',minute:'2-digit'});
}
function moduleCard(name,m){
  const f=freshness(m),slot=slotForModule(name),cfg=getConfig(),has=!!normalizeUrl(cfg.links[slot]),next=fmtNext(m.next_expected);
  return `<article class="card">
    <div class="cardHead"><h3>${name}</h3><span class="badge ${f.cls}">${f.txt}</span></div>
    <div class="headline">${m.headline||'—'}</div>
    <div class="sub">${m.detail||''}${next?`<br>Następny: ${next}`:''}</div>
    <div class="cardActions">
      <button class="action primary" onclick="openSlot('${slot}')">${has?'OTWÓRZ CZAT':'USTAW CZAT'}</button>
      <a class="action" href="${m.source_url||'#'}" target="_blank" rel="noopener">ŹRÓDŁO</a>
    </div>
  </article>`;
}
function renderStatus(data){
  STATUS=data;
  const snap=new Date(data.snapshot_at);
  $('snapshotLine').textContent=`Snapshot ${snap.toLocaleString('pl-PL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · freshness liczony teraz`;
  const mods=data.modules;
  $('moduleGrid').innerHTML=MODULES.map(k=>moduleCard(k,mods[k])).join('');
  $('moduleGrid2').innerHTML=$('moduleGrid').innerHTML;
  const ops=freshness(mods.OPS),market=freshness(mods.MARKET),radar=freshness(mods.RADAR);
  $('top1').textContent=`OPS · ${ops.txt}`;$('top1s').textContent=mods.OPS.headline;
  $('top2').textContent=`MARKET · ${market.txt}`;$('top2s').textContent=mods.MARKET.headline;
  $('top3').textContent=`RADAR · ${radar.txt}`;$('top3s').textContent=mods.RADAR.headline;
  $('systemStamp').textContent='v'+data.version;
  const s=data.system||{};$('sysAuto').textContent=s.automations||'—';$('sysExp').textContent=s.experiments||'—';$('sysDelivery').textContent=s.delivery||'—';$('sysWrite').textContent=s.writeback||'—';$('sysSync').textContent=s.sync_mode||'—';
  const problems=MODULES.filter(k=>['bad','warn'].includes(freshness(mods[k]).cls)).length;
  $('healthText').textContent=problems?`${problems} moduły wymagają uwagi / weryfikacji`:'System bez widocznych problemów';
  $('healthDot').style.background=problems?'var(--warn)':'var(--good)';
  const mw=data.market_windows||{};
  $('marketWindows').innerHTML=['10:00','14:00','17:30','20:00'].map(k=>{const x=mw[k]||{};return `<div class="mw"><b>${k}</b><small>${x.state||'—'}${x.last?` · ${ageText(x.last)}`:''}</small></div>`}).join('');
  $('diagSnapshot').textContent=snap.toLocaleString('pl-PL');
  updateDiagnostics();
}
async function loadStatus(){
  try{
    const r=await fetch(`status.json?t=${Date.now()}`,{cache:'no-store'}); if(!r.ok)throw 0;
    renderStatus(await r.json());
  }catch(e){
    $('snapshotLine').textContent='STATUS UNAVAILABLE · użyj linków modułów';
    $('healthText').textContent='Nie udało się pobrać status.json';
    $('healthDot').style.background='var(--bad)';
  }
}
function renderLinkFields(focus){
  const cfg=getConfig();
  $('linkFields').innerHTML=LINK_SLOTS.map(([key,label])=>{
    const val=cfg.links[key]||'',ok=!!normalizeUrl(val);
    return `<div class="field">
      <label><span>${label}</span><span class="fieldStatus ${val?(ok?'ok':'bad'):''}" id="st-${key}">${val?(ok?'✓ zapisany':'BŁĘDNY'):'PUSTY'}</span></label>
      <input data-link="${key}" value="${val.replace(/"/g,'&quot;')}" placeholder="chatgpt.com/c/...">
      <div class="inlineBtns"><button type="button" data-test="${key}">TEST</button><button type="button" data-clear="${key}">WYCZYŚĆ</button></div>
    </div>`;
  }).join('');
  $('linkFields').querySelectorAll('input[data-link]').forEach(i=>i.addEventListener('input',()=>{
    const st=$('st-'+i.dataset.link),u=normalizeUrl(i.value); st.textContent=i.value.trim()?(u?'✓ poprawny':'BŁĘDNY'):'PUSTY';st.className='fieldStatus '+(i.value.trim()?(u?'ok':'bad'):'');
  }));
  $('linkFields').querySelectorAll('button[data-test]').forEach(b=>b.addEventListener('click',()=>{
    const i=$('linkFields').querySelector(`input[data-link="${b.dataset.test}"]`),u=normalizeUrl(i.value); if(!u)return toast('Najpierw wklej poprawny link ChatGPT'); window.open(u,'_blank','noopener');
  }));
  $('linkFields').querySelectorAll('button[data-clear]').forEach(b=>b.addEventListener('click',()=>{const i=$('linkFields').querySelector(`input[data-link="${b.dataset.clear}"]`);i.value='';i.dispatchEvent(new Event('input'))}));
  if(focus){const i=$('linkFields').querySelector(`input[data-link="${focus}"]`);if(i)setTimeout(()=>{i.scrollIntoView({block:'center'});i.focus()},180)}
}
function openLinks(focus){renderLinkFields(focus);$('linksModal').classList.add('open')}
function closeLinks(){$('linksModal').classList.remove('open')}
function saveLinks(){
  const links={};let invalid=[];
  $('linkFields').querySelectorAll('input[data-link]').forEach(i=>{
    const raw=i.value.trim(); if(!raw)return;
    const u=normalizeUrl(raw); if(u)links[i.dataset.link]=u; else invalid.push(i.dataset.link);
  });
  if(invalid.length)return toast('Błędny link: '+invalid.join(', '));
  const ok=setConfig({links}); if(!ok)return toast('Błąd zapisu localStorage');
  const verify=getConfig();
  if(Object.keys(verify.links).length!==Object.keys(links).length)return toast('Weryfikacja zapisu nie powiodła się');
  closeLinks(); if(STATUS)renderStatus(STATUS); toast(`✓ ZAPISANO ${Object.keys(links).length} LINKÓW`);
}
function getNotes(){try{return JSON.parse(localStorage.getItem(NOTES_KEY)||'[]')}catch(e){return []}}
function setNotes(n){localStorage.setItem(NOTES_KEY,JSON.stringify(n.slice(0,30)));renderNotes();updateDiagnostics()}
function renderNotes(){
  const n=getNotes();$('captureInbox').innerHTML=n.length?n.map(x=>`<div class="note">
    <div class="noteTop"><span>${x.category}</span><span>${new Date(x.ts).toLocaleString('pl-PL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span></div>
    <div class="noteText">${escapeHtml(x.text)}</div>
    <div class="noteBtns"><button data-copy="${x.id}">KOPIUJ</button><button data-open="${x.id}">OTWÓRZ CZAT</button><button data-del="${x.id}">USUŃ</button></div>
  </div>`).join(''):'<div class="footerNote">Inbox pusty.</div>';
  $('captureInbox').querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>{const x=n.find(z=>z.id===b.dataset.copy);navigator.clipboard?.writeText(x.text);toast('Skopiowano')}));
  $('captureInbox').querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{const x=n.find(z=>z.id===b.dataset.open);const slot=slotForModule(x.category)||'LOUNGE';navigator.clipboard?.writeText(x.text);toast('Tekst skopiowany · otwieram czat');setTimeout(()=>openSlot(slot),350)}));
  $('captureInbox').querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>setNotes(n.filter(z=>z.id!==b.dataset.del))));
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function saveCapture(){
  const t=$('captureText').value.trim();if(!t)return toast('Wpisz treść');
  const n=getNotes();n.unshift({id:String(Date.now()),ts:new Date().toISOString(),category:$('captureCategory').value,text:t});setNotes(n);$('captureText').value='';toast('✓ ZAPISANO LOKALNIE');
}
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
  document.querySelectorAll('.nav button[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  scrollTo({top:0,behavior:'smooth'});
}
function updateDiagnostics(){
  const cfg=getConfig(),notes=getNotes();
  $('diagLinks').textContent=`${Object.keys(cfg.links).length} saved`;
  $('diagNotes').textContent=`${notes.length} items`;
  $('diagSW').textContent=navigator.serviceWorker?.controller?'ACTIVE':'PENDING';
  $('diagOnline').textContent=navigator.onLine?'ONLINE':'OFFLINE';
  $('diagStandalone').textContent=matchMedia('(display-mode: standalone)').matches?'PWA / standalone':'browser';
  try{localStorage.setItem('__neon_test','1');localStorage.removeItem('__neon_test');$('diagStorage').textContent='OK'}catch(e){$('diagStorage').textContent='ERROR'}
}
async function checkUpdate(manual=false){
  try{
    const r=await fetch(`version.json?t=${Date.now()}`,{cache:'no-store'});const v=await r.json();$('diagRemoteVersion').textContent=v.version||'—';
    if(v.version && v.version!==APP_VERSION){$('updateBar').classList.add('show');if(manual)toast('Nowa wersja dostępna')}
    else if(manual)toast('Masz najnowszą wersję');
    swReg?.update();
  }catch(e){if(manual)toast('Nie udało się sprawdzić aktualizacji')}
}
function openBackup(mode){
  const cfg={config:getConfig(),notes:getNotes(),exported_at:new Date().toISOString(),schema:1};
  $('backupModal').classList.add('open');
  if(mode==='export'){
    $('backupTitle').textContent='NEON // EXPORT';$('backupHint').textContent='Skopiuj backup ustawień prywatnych i Capture.';$('backupText').value=JSON.stringify(cfg,null,2);$('backupAction').textContent='KOPIUJ';
    $('backupAction').onclick=()=>{navigator.clipboard?.writeText($('backupText').value);toast('Backup skopiowany')};
  }else{
    $('backupTitle').textContent='NEON // RESTORE';$('backupHint').textContent='Wklej wcześniej wyeksportowany JSON.';$('backupText').value='';$('backupAction').textContent='IMPORTUJ';
    $('backupAction').onclick=()=>{try{const x=JSON.parse($('backupText').value);if(!x.config||!Array.isArray(x.notes))throw 0;setConfig(x.config);setNotes(x.notes);$('backupModal').classList.remove('open');if(STATUS)renderStatus(STATUS);toast('✓ PRZYWRÓCONO')}catch(e){toast('Nieprawidłowy backup')}};
  }
}

tick();setInterval(tick,30000);
loadStatus();setInterval(loadStatus,60000);
renderNotes();updateDiagnostics();checkUpdate(false);
window.addEventListener('online',updateDiagnostics);window.addEventListener('offline',updateDiagnostics);

document.querySelectorAll('.nav button[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.querySelectorAll('[data-open-slot]').forEach(b=>b.addEventListener('click',()=>openSlot(b.dataset.openSlot)));
$('openLinksBtn').addEventListener('click',()=>openLinks());
$('modulesSetupBtn').addEventListener('click',()=>openLinks());
$('systemLinksBtn').addEventListener('click',()=>openLinks());
$('cancelLinks').addEventListener('click',closeLinks);$('saveLinks').addEventListener('click',saveLinks);$('linksModal').addEventListener('click',e=>{if(e.target===$('linksModal'))closeLinks()});
$('refreshBtn').addEventListener('click',()=>{loadStatus();toast('Odświeżam status')});
$('saveCapture').addEventListener('click',saveCapture);
$('backupBtn').addEventListener('click',()=>openBackup('export'));$('restoreBtn').addEventListener('click',()=>openBackup('import'));$('backupCancel').addEventListener('click',()=>$('backupModal').classList.remove('open'));
$('checkUpdateBtn').addEventListener('click',()=>checkUpdate(true));$('applyUpdate').addEventListener('click',async()=>{await swReg?.update();location.reload()});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').then(reg=>{
    swReg=reg;updateDiagnostics();
    reg.addEventListener('updatefound',()=>{
      const nw=reg.installing;if(!nw)return;
      nw.addEventListener('statechange',()=>{if(nw.state==='installed'&&navigator.serviceWorker.controller)$('updateBar').classList.add('show')});
    });
  }).catch(()=>updateDiagnostics());
}
