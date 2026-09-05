import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import{GAME_CONFIG as C}from'../config.js';

const BASE={xFollow:.28,y:5.15,z:9.45,lookY:1.18,lookZ:-8.4};

export function createChaseCamera(camera,player){
 const lookTarget=new THREE.Vector3(0,BASE.lookY,BASE.lookZ);
 const desiredLook=new THREE.Vector3();

 function reset(){
  camera.position.set(0,BASE.y,BASE.z);
  camera.fov=58;
  lookTarget.set(0,BASE.lookY,BASE.lookZ);
  camera.lookAt(lookTarget);
  camera.updateProjectionMatrix();
 }

 function update(dt,state){
  const running=state.mode==='running';
  const slideDrop=state.sliding?.16:0;
  const speedRatio=running?Math.max(0,(state.speed-C.baseSpeed)/(C.maxSpeed-C.baseSpeed)):0;

  // Lateral follow is intentionally partial: the runner moves strongly,
  // while the camera follows only a fraction so lane changes stay readable
  // without making the whole screen sway.
  const targetCamX=running?player.position.x*BASE.xFollow:0;
  const targetCamY=BASE.y+player.position.y*.52-slideDrop;
  const targetCamZ=BASE.z-speedRatio*.22;
  camera.position.x=THREE.MathUtils.damp(camera.position.x,targetCamX,6.5,dt);
  camera.position.y=THREE.MathUtils.damp(camera.position.y,targetCamY,6.2,dt);
  camera.position.z=THREE.MathUtils.damp(camera.position.z,targetCamZ,4.5,dt);

  desiredLook.set(
   running?player.position.x*.18:0,
   BASE.lookY+player.position.y*.36-slideDrop*.45,
   BASE.lookZ-speedRatio*.9
  );
  lookTarget.x=THREE.MathUtils.damp(lookTarget.x,desiredLook.x,7.5,dt);
  lookTarget.y=THREE.MathUtils.damp(lookTarget.y,desiredLook.y,7,dt);
  lookTarget.z=THREE.MathUtils.damp(lookTarget.z,desiredLook.z,5,dt);
  camera.lookAt(lookTarget);

  const targetFov=running?64+Math.min(7,(state.speed-C.baseSpeed)*.34):58;
  camera.fov=THREE.MathUtils.damp(camera.fov,targetFov,4.2,dt);
  camera.updateProjectionMatrix();
 }

 reset();
 return{update,reset};
}
