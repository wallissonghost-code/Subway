import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import JSZip from'https://esm.sh/jszip@3.10.1';

const FRONT_FILE='frame_007.png';
// Physical dimensions stay available to scene/collision code, but the bulky
// colored proxy body is no longer rendered. The PNG is the visible train.
const TRAIN_W=2.08,TRAIN_H=5.05,TRAIN_D=7.5;
const FRONT_SIZE=5.18,IMAGE_SIZE=444,FRONT_BOTTOM=16;
let texturePromise=null;

async function loadFrontTexture(){
 const res=await fetch('./Trem.zip');if(!res.ok)throw new Error(`Trem.zip HTTP ${res.status}`);
 const zip=await JSZip.loadAsync(await res.arrayBuffer());const entry=zip.file(FRONT_FILE);if(!entry)throw new Error(`${FRONT_FILE} ausente`);
 const blob=await entry.async('blob'),url=URL.createObjectURL(blob),loader=new THREE.TextureLoader();
 return new Promise((resolve,reject)=>loader.load(url,t=>{t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;URL.revokeObjectURL(url);resolve(t)},undefined,e=>{URL.revokeObjectURL(url);reject(e)}));
}
function getFrontTexture(){return texturePromise??=(loadFrontTexture().catch(e=>{console.warn('[train-visual]',e);return null}))}

export function createTrainVisual(lane,{view='front'}={}){
 const root=new THREE.Group();root.userData.trainLane=lane;root.userData.trainView=view;

 const frontMat=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.04,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const g=new THREE.PlaneGeometry(1,1);g.translate(0,.5,0);
 const front=new THREE.Mesh(g,frontMat);
 front.renderOrder=2;
 front.scale.set(FRONT_SIZE,FRONT_SIZE,1);
 // Bottom-anchor the art so the wheels remain on the rail. Keep the visual
 // slightly ahead of the invisible physical body to avoid z-fighting.
 front.position.set(0,-(FRONT_BOTTOM/IMAGE_SIZE)*FRONT_SIZE-.01,TRAIN_D/2+.035);
 front.visible=false;
 root.add(front);
 root.userData.front=front;

 getFrontTexture().then(tex=>{if(!tex)return;front.material.map=tex;front.material.needsUpdate=true;front.visible=true});
 return root;
}

export function setTrainVisualLane(root,lane,view='front'){
 if(!root)return;root.userData.trainLane=lane;root.userData.trainView=view;
}
export function updateTrainVisualPerspective(){/* fixed front art: no distance frame swapping */}
export const TRAIN_DIMENSIONS={width:TRAIN_W,height:TRAIN_H,depth:TRAIN_D,roofY:TRAIN_H};
