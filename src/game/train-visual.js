import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const ATLAS_URL=new URL('../../assets/trains/train_atlas.png',import.meta.url).href;
const atlas=new THREE.TextureLoader().load(ATLAS_URL);
atlas.colorSpace=THREE.SRGBColorSpace;
atlas.magFilter=THREE.LinearFilter;
atlas.minFilter=THREE.LinearMipmapLinearFilter;

const frameCache=new Map();
function frameTexture(frame){
 const n=Math.max(1,Math.min(8,Number(frame)||7));
 if(frameCache.has(n))return frameCache.get(n);
 const tex=atlas.clone();
 const idx=n-1,col=idx%4,row=Math.floor(idx/4);
 tex.repeat.set(.25,.5);
 tex.offset.set(col*.25,row===0?.5:0);
 tex.needsUpdate=true;
 frameCache.set(n,tex);
 return tex;
}

function frameFor(lane,view='front'){
 const l=Math.max(0,Math.min(2,lane|0));
 if(view==='rear')return l===0?5:l===2?6:5;
 if(view==='side')return l===0?3:l===2?4:7;
 if(view==='top')return 8;
 return l===0?1:l===2?2:7;
}

export function createTrainVisual(lane,{view='front',width=4.6,height=4.6}={}){
 const material=new THREE.MeshBasicMaterial({
  map:frameTexture(frameFor(lane,view)),transparent:true,alphaTest:.02,depthWrite:false,side:THREE.DoubleSide,toneMapped:false
 });
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
 mesh.position.set(0,2.15,3.05);
 mesh.renderOrder=2;
 mesh.userData.trainView=view;
 mesh.userData.trainLane=lane;
 return mesh;
}

export function setTrainVisualLane(mesh,lane,view=mesh?.userData?.trainView||'front'){
 if(!mesh?.material)return;
 mesh.userData.trainLane=lane;
 mesh.userData.trainView=view;
 mesh.material.map=frameTexture(frameFor(lane,view));
 mesh.material.needsUpdate=true;
}
