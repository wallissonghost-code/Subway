import*as THREE from'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import{GAME_CONFIG as C}from'../config.js';

const CHUNK_LENGTH=54,CHUNK_COUNT=5,TOTAL_LENGTH=CHUNK_LENGTH*CHUNK_COUNT;
const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
function box(w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.castShadow=true;m.receiveShadow=true;return m}

export function createTrackSystem(){
 const root=new THREE.Group(),chunks=[];
 for(let i=0;i<CHUNK_COUNT;i++){
  const g=new THREE.Group();g.position.z=-i*CHUNK_LENGTH;
  const ground=box(12,.35,CHUNK_LENGTH+.4,0x525966);ground.position.set(0,-.22,-CHUNK_LENGTH/2);g.add(ground);
  for(const x of C.laneX){
   for(const off of[-.65,.65]){const rail=box(.12,.08,CHUNK_LENGTH+.4,0xb7c0c8);rail.position.set(x+off,.04,-CHUNK_LENGTH/2);g.add(rail)}
   for(let z=-1;z>-CHUNK_LENGTH;z-=2.2){const tie=box(1.7,.07,.23,0x67492f);tie.position.set(x,.01,z);g.add(tie)}
  }
  for(let z=-6;z>-CHUNK_LENGTH;z-=14){for(const side of[-1,1]){const h=5+((i*7+Math.abs(z)*3+side*5)%6);const b=box(5.5,h,8,side<0?0xf08c46:0x4f79c8);b.position.set(side*8.8,h/2-.1,z);g.add(b)}}
  root.add(g);chunks.push(g);
 }
 function update(worldZ){
  for(const g of chunks){const front=g.position.z+worldZ;if(front>CHUNK_LENGTH)g.position.z-=TOTAL_LENGTH}
 }
 function reset(){chunks.forEach((g,i)=>g.position.z=-i*CHUNK_LENGTH)}
 function snapshot(worldZ){return{chunkLength:CHUNK_LENGTH,chunkCount:CHUNK_COUNT,totalLength:TOTAL_LENGTH,fronts:chunks.map(g=>g.position.z+worldZ)}}
 return{root,update,reset,snapshot};
}
