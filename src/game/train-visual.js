import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import{GLTFLoader}from'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const MODEL_URL='./assets/trains/trem_not_3d.glb';
const TRAIN_W=2.18,TRAIN_H=5.05,TRAIN_D=7.5;
const MODEL_YAW=Math.PI;
let templatePromise=null;

function prepareModel(scene){
 const root=scene.clone(true);
 root.traverse(o=>{
  if(o.isMesh){
   o.castShadow=true;
   o.receiveShadow=true;
   if(o.material){
    o.material=o.material.clone();
    if(o.material.map)o.material.map.colorSpace=THREE.SRGBColorSpace;
   }
  }
 });

 // Alguns exportadores entregam o trem ao longo do eixo X. Normalizamos o
 // comprimento para o eixo Z usado pela pista antes de calcular a escala.
 let box=new THREE.Box3().setFromObject(root),size=new THREE.Vector3();box.getSize(size);
 if(size.x>size.z*1.2){root.rotation.y=Math.PI/2;box=new THREE.Box3().setFromObject(root);box.getSize(size)}
 root.rotation.y+=MODEL_YAW;

 box=new THREE.Box3().setFromObject(root);box.getSize(size);
 const byHeight=TRAIN_H/Math.max(.001,size.y);
 const byWidth=TRAIN_W/Math.max(.001,size.x);
 const byDepth=TRAIN_D/Math.max(.001,size.z);
 // Prioriza a altura visual desejada, mas impede o modelo de invadir faixas
 // vizinhas ou ficar mais comprido que a hitbox física.
 const scale=Math.min(byHeight,byWidth*1.08,byDepth*1.08);
 root.scale.multiplyScalar(scale);

 box=new THREE.Box3().setFromObject(root);
 const center=new THREE.Vector3();box.getCenter(center);
 // Centro do modelo preso ao eixo da faixa e rodas apoiadas em Y=0.
 root.position.x-=center.x;
 root.position.z-=center.z;
 root.position.y-=box.min.y;
 return root;
}

function loadTemplate(){
 if(templatePromise)return templatePromise;
 templatePromise=new Promise((resolve,reject)=>{
  new GLTFLoader().load(MODEL_URL,gltf=>resolve(prepareModel(gltf.scene)),undefined,reject);
 }).catch(e=>{console.error('[train-glb]',e);return null});
 return templatePromise;
}

export function createTrainVisual(lane,{view='front'}={}){
 const holder=new THREE.Group();
 holder.userData.trainLane=lane;
 holder.userData.trainView=view;
 holder.userData.modelReady=false;
 loadTemplate().then(template=>{
  if(!template)return;
  const model=template.clone(true);
  holder.add(model);
  holder.userData.model=model;
  holder.userData.modelReady=true;
 });
 return holder;
}

export function setTrainVisualLane(root,lane,view='front'){
 if(!root)return;
 root.userData.trainLane=lane;
 root.userData.trainView=view;
}

export function updateTrainVisualPerspective(){/* GLB real: sem troca de frame */}
export const TRAIN_DIMENSIONS={width:TRAIN_W,height:TRAIN_H,depth:TRAIN_D,roofY:TRAIN_H};
