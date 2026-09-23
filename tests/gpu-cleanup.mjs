import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../dist/vendor/three.module.js';
import {buildBonsai} from '../dist/bonsai.js';
import qrcode from '../dist/vendor/qrcode.js';

// Exercise the actual application cleanup with real Three.js disposal events.
const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const context=vm.createContext({});
vm.runInContext(source.slice(source.indexOf('function disposeGroup('),source.indexOf('function makeQR(')),context);
const disposeGroup=context.disposeGroup;
function observe(root){
 const resources=new Map();
 root.traverse(o=>{
  const owned=[...(o.isInstancedMesh?[o]:[]),o.geometry,...(Array.isArray(o.material)?o.material:[o.material])];
  for(const resource of owned){
   if(!resource||resources.has(resource))continue;
   resources.set(resource,0);
   resource.addEventListener('dispose',()=>resources.set(resource,resources.get(resource)+1));
  }
 });
 return ()=>{for(const count of resources.values())assert.equal(count,1,'Each owned resource must be disposed exactly once');};
}
const root=new THREE.Group(),geometry=new THREE.BoxGeometry(),material=new THREE.MeshBasicMaterial();
const nested=new THREE.Group();root.add(nested);
nested.add(new THREE.InstancedMesh(geometry,[material,material],3));
root.add(new THREE.InstancedMesh(geometry,material,2));
const checkShared=observe(root);disposeGroup(root);assert.equal(root.children.length,0);checkShared();
disposeGroup(root);checkShared();
let totalMeshes=0;
for(let i=0;i<20;i++){
 const qr=qrcode(0,'M');qr.addData('https://bonsaiqr.com/?test='+i);qr.make();
 const bonsai=buildBonsai(qr,i%5,'#a777bb');root.add(bonsai.group);
 bonsai.update(0,0,false);bonsai.update(1,1500,false);
 const check=observe(root);
 bonsai.group.traverse(o=>{if(o.isInstancedMesh)totalMeshes++;});
 disposeGroup(root);check();assert.equal(root.children.length,0);
}
console.log(`Passed nested/shared-resource cleanup and 20 bonsai rebuilds (${totalMeshes} instance meshes disposed).`);
