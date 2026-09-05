import{moveLeft,moveRight,jump,slide}from'./runner.js';
let sx=0,sy=0,active=false;
export function installInput(target=document){
 target.addEventListener('touchstart',e=>{if(!e.touches?.length)return;active=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
 target.addEventListener('touchend',e=>{if(!active)return;active=false;const t=e.changedTouches?.[0];if(!t)return;const dx=t.clientX-sx,dy=t.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<28)return;if(Math.abs(dx)>Math.abs(dy)){dx<0?moveLeft():moveRight()}else{dy<0?jump():slide()}},{passive:true});
 addEventListener('keydown',e=>{if(e.key==='ArrowLeft')moveLeft();if(e.key==='ArrowRight')moveRight();if(e.key==='ArrowUp'||e.key===' ')jump();if(e.key==='ArrowDown')slide()});
}
