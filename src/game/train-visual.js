import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import JSZip from'https://esm.sh/jszip@3.10.1';

const FRONT_FILE='frame_007.png';
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
function standard(color,roughness=.72){return new THREE.MeshStandardMaterial({color,roughness,metalness:.08})}
function box(w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),standard(color));m.castShadow=true;m.receiveShadow=true;return m}

export function createTrainVisual(lane,{view='front'}={}){
 const root=new THREE.Group();root.userData.trainLane=lane;root.userData.trainView=view;
 const body=box(TRAIN_W,TRAIN_H,TRAIN_D,0xe43f35);body.position.y=TRAIN_H/2;root.add(body);
 const roof=box(TRAIN_W*1.02,.32,TRAIN_D*.96,0xa8ce34);roof.position.y=TRAIN_H+.08;root.add(roof);
 const lower=box(TRAIN_W*1.01,.48,TRAIN_D*.98,0x32435d);lower.position.y=.3;root.add(lower);
 const sideMat=standard(0x1688c9,.5);
 for(const side of[-1,1])for(let i=0;i<4;i++){const w=new THREE.Mesh(new THREE.PlaneGeometry(.72,.86),sideMat);w.position.set(side*(TRAIN_W/2+.006),3.05,-2.45+i*1.62);w.rotation.y=side>0?-Math.PI/2:Math.PI/2;root.add(w)}
 const frontMat=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.04,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const g=new THREE.PlaneGeometry(1,1);g.translate(0,.5,0);const front=new THREE.Mesh(g,frontMat);front.renderOrder=2;front.scale.set(FRONT_SIZE,FRONT_SIZE,1);front.position.set(0,-(FRONT_BOTTOM/IMAGE_SIZE)*FRONT_SIZE-.01,TRAIN_D/2+.035);front.visible=false;root.add(front);root.userData.front=front;
 getFrontTexture().then(tex=>{if(!tex)return;front.material.map=tex;front.material.needsUpdate=true;front.visible=true});
 return root;
}

export function setTrainVisualLane(root,lane,view='front'){
 if(!root)return;root.userData.trainLane=lane;root.userData.trainView=view;
}
export function updateTrainVisualPerspective(){/* fixed 3D train: no frame swapping by distance */}
export const TRAIN_DIMENSIONS={width:TRAIN_W,height:TRAIN_H,depth:TRAIN_D,roofY:TRAIN_H};
