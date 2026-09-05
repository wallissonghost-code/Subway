import{startRun,returnLobby,togglePause}from'./game/runner.js';
import{state}from'./game/state.js';
import{connectPanel}from'./live/panel-bridge.js';
const $=id=>document.getElementById(id);
let toastTimer=0,sound=true;
function setPauseIcon(){$('pauseButton').textContent=state.paused?'▶':'Ⅱ'}
function pauseAndOpen(){if(state.mode!=='running')return;if(!state.paused)togglePause();setPauseIcon();openSettings()}
function resumeAndClose(){if(state.mode==='running'&&state.paused)togglePause();setPauseIcon();closeSettings()}
export function initUI(){
 $('playButton')?.addEventListener('click',()=>startRun());
 $('retryButton')?.addEventListener('click',()=>startRun());
 $('homeButton')?.addEventListener('click',()=>returnLobby());
 $('pauseButton')?.addEventListener('click',pauseAndOpen);
 $('resumeButton')?.addEventListener('click',resumeAndClose);
 $('closeSettings')?.addEventListener('click',resumeAndClose);
 $('connectPanel')?.addEventListener('click',async()=>{await connectPanel()});
 $('soundToggle')?.addEventListener('click',()=>{sound=!sound;$('soundToggle').textContent=sound?'LIGADO':'DESLIGADO';$('soundToggle').style.background=sound?'#22c55e':'#64748b'});
 addEventListener('railrush-live-status',e=>{const d=e.detail||{},row=document.querySelector('.connection-status');row?.classList.toggle('online',!!d.connected);$('transportStatus').textContent=d.transport||'offline'});
 addEventListener('railrush-live-action',e=>{const d=e.detail||{};showToast(`${d.user?'@'+d.user+' · ':''}Live+: ${d.action}`)});
}
export function syncUI(s=state){
 const lobby=$('lobby'),hud=$('hud'),over=$('gameOver');
 lobby?.classList.toggle('hidden',s.mode!=='lobby');hud?.classList.toggle('hidden',s.mode!=='running');over?.classList.toggle('hidden',s.mode!=='gameover');
 $('score').textContent=String(Math.floor(s.score)).padStart(5,'0');$('coins').textContent=`${s.coins} ◉`;$('multiplier').textContent=`x${s.multiplier}`;setPauseIcon();
 if(s.mode==='gameover'){$('finalScore').textContent=Math.floor(s.score);$('finalDistance').textContent=`${Math.floor(s.distance)} m`;$('finalCoins').textContent=`${s.coins} moedas`;closeSettings()}
}
export function openSettings(){$('settingsModal')?.classList.add('show');$('settingsModal')?.setAttribute('aria-hidden','false')}
export function closeSettings(){$('settingsModal')?.classList.remove('show');$('settingsModal')?.setAttribute('aria-hidden','true')}
export function showToast(text){const el=$('actionToast');if(!el)return;clearTimeout(toastTimer);el.textContent=text;el.classList.add('show');toastTimer=setTimeout(()=>el.classList.remove('show'),1300)}
