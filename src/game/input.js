import{moveLeft,moveRight,jump,slide}from'./runner.js';
let sx=0,sy=0,active=false,consumed=false;
const SWIPE_THRESHOLD=14;
function executeSwipe(x,y){
 if(!active||consumed)return false;
 const dx=x-sx,dy=y-sy,ax=Math.abs(dx),ay=Math.abs(dy);
 if(Math.max(ax,ay)<SWIPE_THRESHOLD)return false;
 consumed=true;
 if(ax>ay){dx<0?moveLeft():moveRight()}else{dy<0?jump():slide()}
 return true;
}
export function installInput(target=document){
 target.addEventListener('touchstart',e=>{if(!e.touches?.length)return;const t=e.touches[0];active=true;consumed=false;sx=t.clientX;sy=t.clientY},{passive:true});
 target.addEventListener('touchmove',e=>{if(!active||consumed||!e.touches?.length)return;const t=e.touches[0];executeSwipe(t.clientX,t.clientY)},{passive:true});
 target.addEventListener('touchend',e=>{if(!active)return;const t=e.changedTouches?.[0];if(t&&!consumed)executeSwipe(t.clientX,t.clientY);active=false;consumed=false},{passive:true});
 target.addEventListener('touchcancel',()=>{active=false;consumed=false},{passive:true});
 addEventListener('keydown',e=>{if(e.key==='ArrowLeft')moveLeft();if(e.key==='ArrowRight')moveRight();if(e.key==='ArrowUp'||e.key===' ')jump();if(e.key==='ArrowDown')slide()});
}
