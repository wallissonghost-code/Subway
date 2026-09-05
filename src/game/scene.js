import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import{GAME_CONFIG as C}from'../config.js';
import{state}from'./state.js';
import{createTrackSystem}from'./track.js';
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
const pursuer=new THREE.Group();const pbody=box(1,1.25,.58,0x243b64);pbody.position.y=1.2;const phead=new THREE.Mesh(new THREE.SphereGeometry(.4,16,12),mat(0xd69a68));phead.position.y=2.05;const dog=box(.9,.55,1.15,0x8b5b36);dog.position.set(1.05,.38,.45);pursuer.add(pbody,phead,dog);pursuer.position.set(0,0,2.7);scene.add(pursuer);
const obstacleRoot=new THREE.Group();world.add(obstacleRoot);const obstacles=[];
function makeTrain(lane,z,color=0xe15a47){const group=new THREE.Group();const train=box(1.95,2.8,7.5,color);train.position.y=1.38;const window=box(1.45,.65,.08,0x9bdcff);window.position.set(0,1.85,3.78);group.add(train,window);group.position.set(C.laneX[lane],0,z);obstacleRoot.add(group);obstacles.push({mesh:group,lane,z,type:'block',radius:3.75})}
function makeBarrier(lane,z){const b=box(1.7,.72,.28,0xef4444);b.position.set(C.laneX[lane],.48,z);obstacleRoot.add(b);obstacles.push({mesh:b,lane,z,type:'jump',radius:.58})}
makeTrain(0,-28,0xf17c45);makeBarrier(1,-17);makeTrain(2,-43,0x4aa1b7);makeBarrier(0,-56);makeTrain(1,-70,0xd96262);
const coins=[];for(let i=0;i<36;i++){const lane=i%9<3?0:i%9<6?1:2;const z=-8-i*3.4;const coin=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.08,20),new THREE.MeshStandardMaterial({color:0xffcf32,metalness:.45,roughness:.35}));coin.rotation.x=Math.PI/2;coin.position.set(C.laneX[lane],.85,z);coin.castShadow=true;world.add(coin);coins.push({mesh:coin,lane,z,taken:false})}
let frames=0,lastRenderAt=performance.now(),maxFrameDt=0;
export function updateScene(dt){
 frames++;lastRenderAt=performance.now();maxFrameDt=Math.max(maxFrameDt,dt);
 if(state.paused){renderer.render(scene,camera);return}
 const targetX=C.laneX[state.targetLane],delta=targetX-player.position.x;player.position.x=THREE.MathUtils.damp(player.position.x,targetX,28,dt);player.rotation.z=THREE.MathUtils.damp(player.rotation.z,THREE.MathUtils.clamp(-delta*.12,-.16,.16),18,dt);player.position.y=state.y;player.scale.y=state.sliding?.62:1;
 const run=state.mode==='running',t=performance.now()*.012;legL.rotation.x=run?Math.sin(t)*.8:0;legR.rotation.x=run?Math.sin(t+Math.PI)*.8:0;
 if(run){world.position.z+=state.speed*dt;track.update(world.position.z);for(const c of coins){c.mesh.rotation.z+=dt*5;const wz=c.z+world.position.z;if(wz>12){c.z-=122.4;c.mesh.position.z=c.z;c.mesh.visible=true;c.taken=false}}for(const o of obstacles){const wz=o.z+world.position.z;if(wz>16){o.z-=100;o.mesh.position.z=o.z}}pursuer.position.z=THREE.MathUtils.damp(pursuer.position.z,6.3,1.5,dt);camera.fov=THREE.MathUtils.damp(camera.fov,64+Math.min(8,(state.speed-C.baseSpeed)*.4),4,dt)}else{pursuer.position.z=2.7;camera.fov=THREE.MathUtils.damp(camera.fov,58,4,dt);world.position.z=0}
 camera.position.y=THREE.MathUtils.damp(camera.position.y,5.2+state.y*.28,5,dt);camera.updateProjectionMatrix();renderer.render(scene,camera);
}
export function getNearby(){return{obstacles,coins,worldZ:world.position.z,playerX:player.position.x}}
export function stageObstacleForQA({lane=1,type='block',distance=1.5}={}){const o=obstacles.find(x=>x.type===type)||obstacles[0];if(!o)return false;o.lane=Math.max(0,Math.min(2,lane));o.z=-Math.abs(distance)-world.position.z;o.mesh.position.x=C.laneX[o.lane];o.mesh.position.z=o.z;return true}
export function getSceneMetrics(){return{frames,lastRenderAt,maxFrameDt,worldZ:world.position.z,track:track.snapshot(world.position.z),renderer:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}}}
export function resetWorld(){world.position.z=0;track.reset();player.position.x=C.laneX[1];player.rotation.z=0;for(const c of coins){c.taken=false;c.mesh.visible=true}}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}addEventListener('resize',resize,{passive:true});
