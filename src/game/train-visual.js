import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import{GLTFLoader}from'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const MODELS={
 normal:'./assets/trains/Meshy_AI_Not_Train_0905225724_texture.glb',
 ramp:'./assets/trains/Meshy_AI_Neon_Velocity_Carrier_0905231253_texture.glb'
};
const DIMENSIONS={
 normal:{width:2.72,height:5.7,depth:9.1,roofY:5.7},
 ramp:{width:2.72,height:5.7,depth:9.6,roofY:5.7}
};
const MODEL_YAW=Math.PI;
const QA_MODE=new URLSearchParams(location.search).has('qa');
const templatePromises=new Map();

function prepareMaterial(material){
 if(!material)return material;
 const m=material.clone();
 if(m.map){m.map.colorSpace=THREE.SRGBColorSpace;m.map.needsUpdate=true}
 if(m.emissiveMap){m.emissiveMap.colorSpace=THREE.SRGBColorSpace;m.emissiveMap.needsUpdate=true}
 m.needsUpdate=true;
 return m;
}

function prepareModel(scene,variant='normal'){
 const dims=DIMENSIONS[variant]||DIMENSIONS.normal;
 const root=scene.clone(true);
 root.traverse(o=>{
  if(o.isMesh){
   o.castShadow=true;
   o.receiveShadow=true;
   if(Array.isArray(o.material))o.material=o.material.map(prepareMaterial);
   else if(o.material)o.material=prepareMaterial(o.material);
  }
 });

 let box=new THREE.Box3().setFromObject(root),size=new THREE.Vector3();box.getSize(size);
 if(size.x>size.z*1.2){root.rotation.y=Math.PI/2;box=new THREE.Box3().setFromObject(root);box.getSize(size)}
 root.rotation.y+=MODEL_YAW;

 box=new THREE.Box3().setFromObject(root);box.getSize(size);
 const byHeight=dims.height/Math.max(.001,size.y);
 const byWidth=dims.width/Math.max(.001,size.x);
 const byDepth=dims.depth/Math.max(.001,size.z);
 const scale=Math.min(byHeight,byWidth*1.08,byDepth*1.08);
 root.scale.multiplyScalar(scale);

 box=new THREE.Box3().setFromObject(root);
 const center=new THREE.Vector3();box.getCenter(center);
 root.position.x-=center.x;
 root.position.z-=center.z;
 root.position.y-=box.min.y;
 return root;
}

function loadTemplate(variant='normal'){
 if(QA_MODE)return Promise.resolve(null);
 if(templatePromises.has(variant))return templatePromises.get(variant);
 const url=MODELS[variant]||MODELS.normal;
 const promise=new Promise((resolve,reject)=>{
  new GLTFLoader().load(url,gltf=>resolve(prepareModel(gltf.scene,variant)),undefined,reject);
 }).catch(e=>{console.error(`[train-glb:${variant}]`,e);return null});
 templatePromises.set(variant,promise);
 return promise;
}

export function createTrainVisual(lane,{view='front',variant='normal'}={}){
 const holder=new THREE.Group();
 holder.userData.trainLane=lane;
 holder.userData.trainView=view;
 holder.userData.trainVariant=variant;
 holder.userData.modelReady=QA_MODE;
 if(QA_MODE)return holder;
 loadTemplate(variant).then(template=>{
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
export const TRAIN_DIMENSIONS=DIMENSIONS.normal;
export const RAMP_TRAIN_DIMENSIONS=DIMENSIONS.ramp;
