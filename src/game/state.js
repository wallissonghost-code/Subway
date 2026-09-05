import{GAME_CONFIG as C}from'../config.js';
export const state={mode:'lobby',lane:1,targetLane:1,y:0,vy:0,sliding:false,slideLeft:0,speed:C.baseSpeed,distance:0,score:0,coins:0,multiplier:1,alive:true,paused:false,lastTime:0};
export function resetRun(){Object.assign(state,{mode:'running',lane:1,targetLane:1,y:0,vy:0,sliding:false,slideLeft:0,speed:C.baseSpeed,distance:0,score:0,coins:0,multiplier:1,alive:true,paused:false,lastTime:performance.now()})}
export function backToLobby(){state.mode='lobby';state.paused=false;state.alive=true;state.speed=C.baseSpeed;state.distance=0;state.score=0;state.coins=0;state.multiplier=1;state.y=0;state.vy=0;state.lane=1;state.targetLane=1;state.sliding=false;state.slideLeft=0}
