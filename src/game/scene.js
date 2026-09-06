import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import{GAME_CONFIG as C}from'../config.js';
import{state}from'./state.js';
import{createTrackSystem}from'./track.js';
import{createTrainVisual,setTrainVisualLane,getTrainVisualStatus,getTrainSurfaceY,TRAIN_DIMENSIONS,RAMP_TRAIN_DIMENSIONS}from'./train-visual.js';
import{createChaseCamera}from'./camera-controller.js';
const canvas=document.getElementById('gameCanvas');
export const scene=new THREE.Scene();scene.background=new THREE.Color(0x79cdf5);scene.fog=new THREE.Fog(0x9ed6ef,25,95);
export const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,160);camera.position.set(0,5.2,9.5);camera.lookAt(0,1,-8);
export const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
scene.add(new THREE.HemisphereLight(0xffffff,0x5a4936,2));const sun=new THREE.DirectionalLight(0xfff1d7,2.2);sun.position.set(-8,16,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const mat=(color,roughness=.78)=>new THREE.MeshStandardMaterial({color,roughness});
function box(w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.castShadow=true;m.receiveShadow=true;return m}
export const world=new THREE.Group();scene.add(world);
const track=createTrackSystem();world.add(track.root);
const player=new THREE.Group();const torso=box(.82,1.05,.48,0x19a7ce);torso.position.y=1.22;const head=new THREE.Mesh(new THREE.SphereGeometry(.38,18,14),mat(0xf1b27d));head.position.y=1.98;head.castShadow=true;const cap=box(.72,.18,.58,0xef4444);cap.position.set(0,2.28,.02);const legL=box(.25,.7,.28,0x334155),legR=legL.clone();legL.position.set(-.22,.52,0);legR.position.set(.22,.52,0);player.add(torso,head,cap,legL,legR);player.position.set(0,0,0);scene.add(player);
const chaseCamera=createChaseCamera(camera,player);
const pursuer=new THREE.Group();const pbody=box(1,1.25,.58,0x243b64);pbody.position.y=1.2;const phead=new THREE.Mesh(new THREE.SphereGeometry(.4,16,12),mat(0xd69a68));phead.position.y=2.05;const dog=box(.9,.55,1.15,0x8b5b36);dog.position.set(1.05,.38,.45);pursuer.add(pbody,phead,dog);pursuer.position.set(0,0,2.7);scene.add(pursuer);
const obstacleRoot=new THREE.Group();world.add(obstacleRoot);const obstacles=[];
function makeTrain(lane,z){const group=new THREE.Group();const hitbox=box(TRAIN_DIMENSIONS.width,TRAIN_DIMENSIONS.height,TRAIN_DIMENSIONS.depth,0x111111);hitbox.position.y=TRAIN_DIMENSIONS.height/2;hitbox.visible=false;const visual=createTrainVisual(lane,{view:'front',variant:'normal'});group.add(hitbox,visual);group.position.set(C.laneX[lane],0,z);obstacleRoot.add(group);obstacles.push({mesh:group,lane,z,initialZ:z,type:'block',radius:TRAIN_DIMENSIONS.depth/2,trainVisual:visual,roofY:TRAIN_DIMENSIONS.roofY,depth:TRAIN_DIMENSIONS.depth})}
function makeRampTrain(lane,z){const d=RAMP_TRAIN_DIMENSIONS;const group=new THREE.Group();const hitbox=box(d.width,d.height,d.depth,0x111111);hitbox.position.y=d.height/2;hitbox.visible=false;const visual=createTrainVisual(lane,{view:'front',variant:'ramp'});group.add(hitbox,visual);group.position.set(C.laneX[lane],0,z);obstacleRoot.add(group);obstacles.push({mesh:group,lane,z,initialZ:z,type:'ramp',radius:d.depth/2,trainVisual:visual,roofY:d.roofY,depth:d.depth})}
function makeBarrier(lane,z){const b=box(1.7,.72,.28,0xef4444);b.position.set(C.laneX[lane],.48,z);obstacleRoot.add(b);obstacles.push({mesh:b,lane,z,initialZ:z,type:'jump',radius:.58})}
makeTrain(0,-28);makeBarrier(1,-17);makeTrain(2,-43);makeRampTrain(1,-58);makeTrain(1,-67);makeBarrier(0,-79);makeTrain(2,-93);
const coins=[];for(let i=0;i<36;i++){const lane=i%9<3?0:i%9<6?1:2;const z=-8-i*3.4;const coin=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.08,20),new THREE.MeshStandardMaterial({color:0xffcf32,metalness:.45,roughness:.35}));coin.rotation.x=Math.PI/2;coin.position.set(C.laneX[lane],.85,z);coin.castShadow=true;world.add(coin);coins.push({mesh:coin,lane,z,initialZ:z,taken:false})}
let frames=0,lastRenderAt=performance.now(),maxFrameDt=0,surfaceY=0;
function supportSurfaceHeight(){
 if(state.mode!=='running')return 0;
 let best=0;
 for(const o of obstacles){
  if(o.lane!==state.targetLane||!o.roofY)continue;
  const wz=o.z+world.position.z,d=o.depth||TRAIN_DIMENSIONS.depth,half=d/2;
  if(wz<-half||wz>half)continue;
  const roofY=getTrainSurfaceY(o.trainVisual,o.roofY);
  if(o.type==='ramp'){
   const rampLen=d*.58;
   const progress=THREE.MathUtils.clamp((wz+half)/rampLen,0,1);
   best=Math.max(best,roofY*progress);
  }else if(o.type==='block'&&surfaceY>=Math.min(1.15,roofY*.28)){
   best=Math.max(best,roofY);
  }
 }
 return best;
}
export function updateScene(dt){
 frames++;lastRenderAt=performance.now();maxFrameDt=Math.max(maxFrameDt,dt);
 if(state.paused){renderer.render(scene,camera);return}
 const targetX=C.laneX[state.targetLane],delta=targetX-player.position.x;player.position.x=THREE.MathUtils.damp(player.position.x,targetX,28,dt);player.rotation.z=THREE.MathUtils.damp(player.rotation.z,THREE.MathUtils.clamp(-delta*.12,-.16,.16),18,dt);
 const targetSurface=supportSurfaceHeight();
 if(targetSurface>0){
  const maxRise=12*dt;
  const desired=Math.min(targetSurface,surfaceY+maxRise);
  surfaceY=THREE.MathUtils.damp(surfaceY,desired,26,dt);
 }else if(state.y<=.05)surfaceY=0;
 else surfaceY=THREE.MathUtils.damp(surfaceY,0,18,dt);
 player.position.y=state.y+surfaceY;player.scale.y=state.sliding?.62:1;
 const run=state.mode==='running',t=performance.now()*.012;legL.rotation.x=run?Math.sin(t)*.8:0;legR.rotation.x=run?Math.sin(t+Math.PI)*.8:0;
 if(run){world.position.z+=state.speed*dt;track.update(world.position.z);for(const c of coins){c.mesh.rotation.z+=dt*5;const wz=c.z+world.position.z;if(wz>12){c.z-=122.4;c.mesh.position.z=c.z;c.mesh.visible=true;c.taken=false}}for(const o of obstacles){const wz=o.z+world.position.z;if(wz>16){o.z-=116;o.mesh.position.z=o.z}}pursuer.position.z=THREE.MathUtils.damp(pursuer.position.z,6.3,1.5,dt)}else{pursuer.position.z=2.7;world.position.z=0;surfaceY=0}
 chaseCamera.update(dt,{...state,y:state.y+surfaceY});renderer.render(scene,camera);
}
export function getNearby(){return{obstacles,coins,worldZ:world.position.z,playerX:player.position.x,surfaceY}}
export function stageObstacleForQA({lane=1,type='block',distance=1.5}={}){const o=obstacles.find(x=>x.type===type)||obstacles[0];if(!o)return false;o.lane=Math.max(0,Math.min(2,lane));o.z=-Math.abs(distance)-world.position.z;o.mesh.position.x=C.laneX[o.lane];o.mesh.position.z=o.z;if(o.trainVisual)setTrainVisualLane(o.trainVisual,o.lane,'front');return true}
export function getSceneMetrics(){const trains=obstacles.filter(o=>o.trainVisual).map(o=>getTrainVisualStatus(o.trainVisual));return{frames,lastRenderAt,maxFrameDt,worldZ:world.position.z,surfaceY,trains,track:track.snapshot(world.position.z),renderer:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}}}
export function resetWorld(){world.position.z=0;surfaceY=0;track.reset();player.position.x=C.laneX[1];player.position.y=0;player.rotation.z=0;chaseCamera.reset();for(const o of obstacles){o.z=o.initialZ;o.mesh.position.z=o.initialZ;o.mesh.position.x=C.laneX[o.lane];if(o.trainVisual)setTrainVisualLane(o.trainVisual,o.lane,'front')}for(const c of coins){c.z=c.initialZ;c.mesh.position.z=c.initialZ;c.taken=false;c.mesh.visible=true}}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}addEventListener('resize',resize,{passive:true});