import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import JSZip from'https://esm.sh/jszip@3.10.1';

const FILES={1:'frame_001.png',2:'frame_002.png',3:'frame_003.png',4:'frame_004.png',5:'frame_005.png',6:'frame_006.png',7:'frame_007.png',8:'frame_008.png'};
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
function frameFor(lane,view='front'){
 const l=Math.max(0,Math.min(2,lane|0));
 if(view==='rear')return l===0?5:l===2?6:5;
 if(view==='side')return l===0?3:l===2?4:7;
 if(view==='top')return 8;
 return l===0?1:l===2?2:7;
}
async function applyFrame(mesh,lane,view){
 const frame=frameFor(lane,view),textures=await getTextures(),tex=textures[frame]||textures[7];
 if(!mesh?.material||!tex)return;
 mesh.material.map=tex;mesh.material.needsUpdate=true;mesh.visible=true;
}
export function createTrainVisual(lane,{view='front',width=4.6,height=4.6}={}){
 const material=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.02,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
 mesh.position.set(0,2.15,3.05);mesh.renderOrder=2;mesh.visible=false;mesh.userData.trainView=view;mesh.userData.trainLane=lane;
 applyFrame(mesh,lane,view);return mesh;
}
export function setTrainVisualLane(mesh,lane,view=mesh?.userData?.trainView||'front'){
 if(!mesh?.material)return;
 mesh.userData.trainLane=lane;mesh.userData.trainView=view;applyFrame(mesh,lane,view);
}
