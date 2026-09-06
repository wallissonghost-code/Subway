import{GAME_CONFIG as C}from'../config.js';
import{state,resetRun,backToLobby}from'./state.js';
import{getNearby,resetWorld}from'./scene.js';
let onGameOver=()=>{},onUpdate=()=>{},qaCollisionBypass=false;
export function configureRunner(hooks={}){onGameOver=hooks.onGameOver||onGameOver;onUpdate=hooks.onUpdate||onUpdate}
export function startRun(){resetWorld();resetRun();onUpdate(state)}
export function returnLobby(){backToLobby();resetWorld();onUpdate(state)}
export function moveLeft(){if(state.mode!=='running'||state.paused)return false;state.targetLane=Math.max(0,state.targetLane-1);return true}
export function moveRight(){if(state.mode!=='running'||state.paused)return false;state.targetLane=Math.min(2,state.targetLane+1);return true}
export function jump(){if(state.mode!=='running'||state.paused||state.y>.05||state.sliding)return false;state.vy=C.jumpVelocity;return true}
export function slide(){if(state.mode!=='running'||state.paused||state.y>.08)return false;state.sliding=true;state.slideLeft=C.slideDuration;return true}
export function togglePause(){if(state.mode!=='running')return false;state.paused=!state.paused;onUpdate(state);return true}
export function setQACollisionBypass(enabled=false){qaCollisionBypass=enabled===true;return qaCollisionBypass}
export function updateRunner(dt){
 if(state.mode!=='running'||state.paused||!state.alive)return;
 state.speed=Math.min(C.maxSpeed,state.speed+C.acceleration*dt);state.distance+=state.speed*dt;state.score+=state.speed*dt*state.multiplier*4;
 if(state.vy!==0||state.y>0){state.vy-=C.gravity*dt;state.y+=state.vy*dt;if(state.y<=0){state.y=0;state.vy=0}}
 if(state.sliding){state.slideLeft-=dt;if(state.slideLeft<=0){state.sliding=false;state.slideLeft=0}}
 const near=getNearby();
 for(const coin of near.coins){if(coin.taken)continue;const z=coin.z+near.worldZ;if(Math.abs(z)<.75&&coin.lane===state.targetLane&&state.y<1.5){coin.taken=true;coin.mesh.visible=false;state.coins++;state.score+=25*state.multiplier}}
 if(!qaCollisionBypass){for(const o of near.obstacles){const z=o.z+near.worldZ;if(Math.abs(z)<=Math.max(.38,o.radius||0)&&o.lane===state.targetLane){if(o.type==='ramp')continue;if(o.type==='jump'&&state.y>.78)continue;if(o.type==='block'&&o.roofY&&near.surfaceY>o.roofY*.62)continue;crash();break}}}
 onUpdate(state);
}
function crash(){state.alive=false;state.mode='gameover';state.score=Math.floor(state.score);onUpdate(state);onGameOver(state)}
export function getRunnerSnapshot(){const near=getNearby();return{mode:state.mode,paused:state.paused,alive:state.alive,lane:state.targetLane,y:state.y,surfaceY:near.surfaceY||0,sliding:state.sliding,speed:state.speed,distance:state.distance,score:state.score,coins:state.coins,multiplier:state.multiplier,qaCollisionBypass}}
export const runnerActions={start_run:startRun,lane_left:moveLeft,lane_right:moveRight,jump,slide,pause:togglePause};
