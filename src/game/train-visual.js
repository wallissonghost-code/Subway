import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import JSZip from'https://esm.sh/jszip@3.10.1';

const FILES={1:'frame_001.png',2:'frame_002.png',3:'frame_003.png',4:'frame_004.png',5:'frame_005.png',6:'frame_006.png',7:'frame_007.png',8:'frame_008.png'};
const CALIBRATION={
 1:{bottom:38,x:-.03,scale:.98},2:{bottom:37,x:.03,scale:.98},
 3:{bottom:66,x:-.02,scale:.94},4:{bottom:57,x:.02,scale:.94},
 5:{bottom:55,x:-.02,scale:.96},6:{bottom:48,x:.02,scale:.96},
 7:{bottom:16,x:0,scale:.90},8:{bottom:16,x:0,scale:.86}
};
const IMAGE_SIZE=444;
const BASE_SIZE=3.45;
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
function calibrate(mesh,frame){
 const c=CALIBRATION[frame]||CALIBRATION[7];
 const size=BASE_SIZE*c.scale;
 mesh.scale.set(size,size,1);
 mesh.position.x=c.x;
 // Geometry is anchored at its bottom edge. Compensate the transparent
 // pixels below the wheels so the visible train actually sits on the rail.
 mesh.position.y=-(c.bottom/IMAGE_SIZE)*size+.03;
 mesh.position.z=3.20;
}
async function applyFrame(mesh,lane,view){
 const frame=frameFor(lane,view),textures=await getTextures(),tex=textures[frame]||textures[7];
 if(!mesh?.material||!tex)return;
 mesh.material.map=tex;mesh.material.needsUpdate=true;mesh.userData.trainFrame=frame;calibrate(mesh,frame);mesh.visible=true;
}
export function createTrainVisual(lane,{view='front'}={}){
 const material=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.04,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const geometry=new THREE.PlaneGeometry(1,1);
 // Anchor the plane at its lower edge instead of its center.
 geometry.translate(0,.5,0);
 const mesh=new THREE.Mesh(geometry,material);
 mesh.position.set(0,0,3.20);mesh.renderOrder=1;mesh.visible=false;mesh.userData.trainView=view;mesh.userData.trainLane=lane;
 applyFrame(mesh,lane,view);return mesh;
}
export function setTrainVisualLane(mesh,lane,view=mesh?.userData?.trainView||'front'){
 if(!mesh?.material)return;
 mesh.userData.trainLane=lane;mesh.userData.trainView=view;applyFrame(mesh,lane,view);
}
