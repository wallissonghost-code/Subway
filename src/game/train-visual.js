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
const params=new URLSearchParams(location.search);
const QA_MODE=params.has('qa')&&!params.has('assets');
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
   o.visible=true;
   o.frustumCulled=false;
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
 root.updateMatrixWorld(true);
 return root;
}

function createPlaceholder(variant='normal'){
 const d=DIMENSIONS[variant]||DIMENSIONS.normal;
 const g=new THREE.Group();
 const bodyMat=new THREE.MeshStandardMaterial({color:variant==='ramp'?0x101820:0x16202a,roughness:.72,metalness:.2});
 const accentMat=new THREE.MeshStandardMaterial({color:0x5cff73,emissive:0x153d20,emissiveIntensity:.8,roughness:.45});
 const body=new THREE.Mesh(new THREE.BoxGeometry(d.width*.92,d.height*.8,d.depth*.84),bodyMat);body.position.y=d.height*.4;
 g.add(body);
 if(variant==='ramp'){
  const ramp=new THREE.Mesh(new THREE.BoxGeometry(d.width*.86,.24,d.depth*.44),accentMat);ramp.rotation.x=-Math.PI*.16;ramp.position.set(0,d.height*.2,d.depth*.43);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(d.width*.86,.18,d.depth*.42),accentMat);roof.position.set(0,d.height*.83,-d.depth*.17);
  g.add(ramp,roof);
 }else{
  const front=new THREE.Mesh(new THREE.BoxGeometry(d.width*.82,d.height*.6,.18),accentMat);front.position.set(0,d.height*.42,d.depth*.42);g.add(front);
 }
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});
 g.userData.isTrainPlaceholder=true;
 return g;
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
 holder.userData.loadFailed=false;
 const placeholder=createPlaceholder(variant);
 holder.add(placeholder);
 holder.userData.placeholder=placeholder;
 if(QA_MODE)return holder;

 loadTemplate(variant).then(template=>{
  if(!template){holder.userData.loadFailed=true;return}
  const model=template.clone(true);
  holder.add(model);
  holder.userData.model=model;
  holder.userData.modelReady=true;
  holder.remove(placeholder);
 }).catch(()=>{holder.userData.loadFailed=true});
 return holder;
}

export function setTrainVisualLane(root,lane,view='front'){
 if(!root)return;
 root.userData.trainLane=lane;
 root.userData.trainView=view;
}

export function getTrainVisualStatus(root){
 if(!root)return{ready:false,failed:true,placeholder:false,meshes:0};
 let meshes=0;root.traverse(o=>{if(o.isMesh&&o.visible)meshes++});
 return{ready:root.userData.modelReady===true,failed:root.userData.loadFailed===true,placeholder:!!root.userData.placeholder?.parent,meshes,variant:root.userData.trainVariant||'normal'};
}
export function updateTrainVisualPerspective(){/* GLB real: sem troca de frame */}
export const TRAIN_DIMENSIONS=DIMENSIONS.normal;
export const RAMP_TRAIN_DIMENSIONS=DIMENSIONS.ramp;
