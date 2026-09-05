import{startRun,returnLobby,togglePause}from'./game/runner.js';
import{state}from'./game/state.js';
import{connectPanel}from'./live/panel-bridge.js';
const $=id=>document.getElementById(id);
let toastTimer=0,sound=true;
export function initUI(){
 $('playButton')?.addEventListener('click',()=>startRun());
 $('retryButton')?.addEventListener('click',()=>startRun());
 $('homeButton')?.addEventListener('click',()=>returnLobby());
 $('pauseButton')?.addEventListener('click',()=>{togglePause();$('pauseButton').textContent=state.paused?'▶':'Ⅱ'});
 $('settingsButton')?.addEventListener('click',()=>openSettings());
 $('closeSettings')?.addEventListener('click',()=>closeSettings());
 $('settingsModal')?.addEventListener('click',e=>{if(e.target===$('settingsModal'))closeSettings()});
 $('connectPanel')?.addEventListener('click',async()=>{if(await connectPanel())setTimeout(closeSettings,350)});
 $('soundToggle')?.addEventListener('click',()=>{sound=!sound;$('soundToggle').textContent=sound?'LIGADO':'DESLIGADO';$('soundToggle').style.background=sound?'#22c55e':'#64748b'});
 addEventListener('railrush-live-status',e=>{const d=e.detail||{},row=document.querySelector('.connection-status');row?.classList.toggle('online',!!d.connected);$('transportStatus').textContent=d.transport||'offline'});
 addEventListener('railrush-live-action',e=>{const d=e.detail||{};showToast(`${d.user?'@'+d.user+' · ':''}Live+: ${d.action}`)});
}
export function syncUI(s=state){
 const lobby=$('lobby'),hud=$('hud'),over=$('gameOver');
 lobby?.classList.toggle('hidden',s.mode!=='lobby');hud?.classList.toggle('hidden',s.mode!=='running');over?.classList.toggle('hidden',s.mode!=='gameover');
 $('score').textContent=String(Math.floor(s.score)).padStart(5,'0');$('coins').textContent=`${s.coins} ◉`;$('multiplier').textContent=`x${s.multiplier}`;
 if(s.mode==='gameover'){$('finalScore').textContent=Math.floor(s.score);$('finalDistance').textContent=`${Math.floor(s.distance)} m`;$('finalCoins').textContent=`${s.coins} moedas`}
}
export function openSettings(){$('settingsModal')?.classList.add('show');$('settingsModal')?.setAttribute('aria-hidden','false')}
export function closeSettings(){$('settingsModal')?.classList.remove('show');$('settingsModal')?.setAttribute('aria-hidden','true')}
export function showToast(text){const el=$('actionToast');if(!el)return;clearTimeout(toastTimer);el.textContent=text;el.classList.add('show');toastTimer=setTimeout(()=>el.classList.remove('show'),1300)}
