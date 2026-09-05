import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import JSZip from'https://esm.sh/jszip@3.10.1';

const FRAME_BY_VIEW={left:'frame_001.png',right:'frame_002.png',rearLeft:'frame_005.png',rearRight:'frame_006.png',front:'frame_007.png',top:'frame_008.png'};
let texturesPromise=null;

function viewForLane(lane){return lane===0?'left':lane===2?'right':'front'}

async function loadTextures(){
 const res=await fetch('./Trem.zip');
 if(!res.ok)throw new Error(`Falha ao carregar Trem.zip: ${res.status}`);
 const zip=await JSZip.loadAsync(await res.arrayBuffer());
 const loader=new THREE.TextureLoader();
 const out={};
 for(const[name,file]of Object.entries(FRAME_BY_VIEW)){
  const entry=zip.file(file);if(!entry)continue;
  const blob=await entry.async('blob');const url=URL.createObjectURL(blob);
  out[name]=await new Promise((resolve,reject)=>loader.load(url,t=>{t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;URL.revokeObjectURL(url);resolve(t)},undefined,e=>{URL.revokeObjectURL(url);reject(e)}));
 }
 return out;
}

export function preloadTrainTextures(){return texturesPromise??=(loadTextures().catch(e=>{console.warn('[train-sprites]',e);return{}}))}

export function createTrainSprite(lane=1){
 const material=new THREE.SpriteMaterial({color:0xffffff,transparent:true,depthWrite:false});
 const sprite=new THREE.Sprite(material);sprite.scale.set(4.4,5.3,1);sprite.position.y=2.35;
 const api={
  object:sprite,
  async setView(view=viewForLane(lane)){
   const textures=await preloadTrainTextures();const tex=textures[view]||textures.front||textures.left||textures.right;if(tex)material.map=tex;material.needsUpdate=true;
  },
  setLane(nextLane){lane=nextLane;api.setView(viewForLane(lane))},
  setDirection(direction='toward'){
   if(direction==='away')api.setView(lane===0?'rearLeft':lane===2?'rearRight':'top');else api.setView(viewForLane(lane));
  }
 };
 api.setView();return api;
}
