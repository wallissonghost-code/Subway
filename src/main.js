import{state}from'./game/state.js';
import{updateScene}from'./game/scene.js';
import{configureRunner,updateRunner}from'./game/runner.js';
import{installInput}from'./game/input.js';
import{initPanelBridge}from'./live/panel-bridge.js';
import{initUI,syncUI}from'./ui.js';
configureRunner({onUpdate:syncUI,onGameOver:syncUI});
installInput(document.getElementById('gameCanvas'));initUI();initPanelBridge();syncUI(state);
if(new URLSearchParams(location.search).has('qa'))import('./qa/runtime.js').catch(console.error);
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;updateRunner(dt);updateScene(dt);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
