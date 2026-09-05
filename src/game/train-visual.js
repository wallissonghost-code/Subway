import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import JSZip from'https://esm.sh/jszip@3.10.1';

const FILES={1:'frame_001.png',2:'frame_002.png',3:'frame_003.png',4:'frame_004.png',5:'frame_005.png',6:'frame_006.png',7:'frame_007.png',8:'frame_008.png'};
const CALIBRATION={
 1:{bottom:38,x:-.05,scale:.92},2:{bottom:37,x:.05,scale:.92},
 3:{bottom:66,x:-.03,scale:.88},4:{bottom:57,x:.03,scale:.88},
 5:{bottom:55,x:-.03,scale:.90},6:{bottom:48,x:.03,scale:.90},
 7:{bottom:16,x:0,scale:1.05},8:{bottom:16,x:0,scale:.86}
};
const IMAGE_SIZE=444;
const BASE_SIZE=3.48;
const FRONT_Z=3.58;
const DIAGONAL_START_Z=-24;
let texturesPromise=null;

async function loadTextures(){
 const res=await fetch('./Trem.zip');
 if(!res.ok)throw new Error(`Trem.zip HTTP ${res.status}`);
 const zip=await JSZip.loadAsync(await res.arrayBuffer());
 const loader=new THREE.TextureLoader();
 const textures={};
 for(const[id,file]of Object.entries(FILES)){
  const entry=zip.file(file);if(!entry)continue;
  const blob=await entry.async('blob');const url=URL.createObjectURL(blob);
  textures[id]=await new Promise((resolve,reject)=>loader.load(url,t=>{t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;URL.revokeObjectURL(url);resolve(t)},undefined,e=>{URL.revokeObjectURL(url);reject(e)}));
 }
 return textures;
}
function getTextures(){return texturesPromise??=(loadTextures().catch(e=>{console.warn('[train-visual]',e);return{}}))}
function frameFor(lane,view='front',worldZ=-100){
 const l=Math.max(0,Math.min(2,lane|0));
 if(view==='front'){
  // Longe da câmera, a frente reta lê melhor. Quando um trem lateral se
  // aproxima, usamos o ângulo correspondente para acompanhar a perspectiva.
  if(worldZ<DIAGONAL_START_Z||l===1)return 7;
  return l===0?1:2;
 }
 if(view==='rear')return l===0?5:l===2?6:5;
 if(view==='side')return l===0?3:l===2?4:7;
 if(view==='top')return 8;
 return 7;
}
function calibrate(mesh,frame){
 const c=CALIBRATION[frame]||CALIBRATION[7];
 const size=BASE_SIZE*c.scale;
 mesh.scale.set(size,size,1);
 mesh.position.x=c.x;
 // O plano é ancorado pela borda inferior; compensamos apenas a margem
 // transparente abaixo das rodas para o trem permanecer apoiado no trilho.
 mesh.position.y=-(c.bottom/IMAGE_SIZE)*size-.015;
 mesh.position.z=FRONT_Z;
}
async function applyFrame(mesh,lane,view,worldZ=-100){
 const frame=frameFor(lane,view,worldZ);
 if(mesh.userData.trainFrame===frame&&mesh.material?.map)return;
 mesh.userData.trainFrame=frame;
 const textures=await getTextures(),tex=textures[frame]||textures[7];
 if(!mesh?.material||!tex)return;
 mesh.material.map=tex;mesh.material.needsUpdate=true;calibrate(mesh,frame);mesh.visible=true;
}
export function createTrainVisual(lane,{view='front'}={}){
 const material=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.04,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const geometry=new THREE.PlaneGeometry(1,1);geometry.translate(0,.5,0);
 const mesh=new THREE.Mesh(geometry,material);
 mesh.position.set(0,0,FRONT_Z);mesh.renderOrder=1;mesh.visible=false;mesh.userData.trainView=view;mesh.userData.trainLane=lane;mesh.userData.trainFrame=0;
 applyFrame(mesh,lane,view,-100);return mesh;
}
export function setTrainVisualLane(mesh,lane,view=mesh?.userData?.trainView||'front',worldZ=-100){
 if(!mesh?.material)return;
 mesh.userData.trainLane=lane;mesh.userData.trainView=view;applyFrame(mesh,lane,view,worldZ);
}
export function updateTrainVisualPerspective(mesh,lane,worldZ,view=mesh?.userData?.trainView||'front'){
 if(!mesh?.material)return;
 applyFrame(mesh,lane,view,worldZ);
}
