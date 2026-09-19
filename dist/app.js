import { buildBonsai } from './bonsai.js';
import * as THREE from './vendor/three.module.js';
import { buildSeasonWorld } from './worlds.js';
const $=s=>document.querySelector(s), canvas=$('#tree'), hint=$('#hint'), input=$('#url');
let season=0, blossom='#e8b0be', revealed=false, progress=0, qr, value='https://example.com/', timer;
let sharedState=location.search;try{if(location.hash?.startsWith('#bonsai='))sharedState=decodeURIComponent(location.hash.slice(8));}catch{}const params=new URLSearchParams(sharedState);try{if(params.has('q')){const [color,tint,url]=JSON.parse(decodeURIComponent(atob(params.get('q').replace(/-/g,'+').replace(/_/g,'/'))));params.set('season',String(color));params.set('blossom',tint);params.set('url',url);}}catch{}let sceneMode='tree';let islandGroups=[]; if(params.has('url')){try{let u=new URL(params.get('url'));if(['https:','http:'].includes(u.protocol))value=u.href;}catch{}}if(['0','1','2','3','4'].includes(params.get('season')))season=Number(params.get('season'));if(/^#[0-9a-f]{6}$/i.test(params.get('blossom')||''))blossom=params.get('blossom');input.value=value;
let sharedView=false;try{sharedView=params.has('url')&&new URL(params.get('url')).href===value;}catch{}
if(sharedView){document.body.classList.add('shared-view');$('#visitor-actions').hidden=false;$('#visit-link').href=value;$('#visit-link').title=value;}

let bonsai;
let renderer,scene,camera,root,foliage,trunk,ground,petals=[],matrixSize=25;
const palettes=[['#eab0bf','#e990b0','#f4c7d3','#d77599'],['#7da94a','#91bd55','#b6cf6d','#5c913a'],['#d28535','#e4a345','#a8532d','#c56332']];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed=438;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function disposeGroup(group){while(group.children.length){const o=group.children[0];group.remove(o);o.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){(Array.isArray(x.material)?x.material:[x.material]).forEach(m=>m.dispose());}});}}
function makeQR(){qr=qrcode(0,'M');qr.addData(value);qr.make();matrixSize=qr.getModuleCount();}
function leafGeometry(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,.11,.025,.085,.26,0,0,.11,-.018,-.085],3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return g;}
function branch(a,b,r){const d=new THREE.Vector3().subVectors(b,a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r*.6,r,d.length(),7),new THREE.MeshStandardMaterial({color:'#806040',roughness:1}));mesh.position.copy(a).addScaledVector(d,.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());mesh.castShadow=true;trunk.add(mesh);}
// Scan-safe seasonal colors for the floating islands and fallback download.
function moduleColor(row,col){
 const n=matrixSize, x=(col-(n-1)/2)/(n/2), z=(row-(n-1)/2)/(n/2);
 const finder=(row<7&&col<7)||(row<7&&col>=n-7)||(row>=n-7&&col<7);
 const grass=finder||Math.hypot(x,z)>.93;
 const noise=((row*31+col*17)%13)/13;
 const color=new THREE.Color(season===3?'#3e647d':sceneMode==='islands'?(season===2?'#957038':'#468557'):grass?'#548d30':season===0?blossom:season===1?'#6e9b3c':'#bb6a30');
 const hsl={};color.getHSL(hsl);color.setStyle(`hsl(${hsl.h*360},${(grass?.46:Math.max(.34,hsl.s))*100}%,${(grass?.25+noise*.045:.29+noise*.055)*100}%)`);
 return {color,grass,x,z};
}
const voxelSeasons=[
 {grass:['#729c63','#8eaf72','#5d8656'],leaves:['#e7b3bd','#f3c9cd','#d79da9','#f6d6d7'],water:['#658e98','#82a7ad','#527883'],soil:'#84634c'},
 {grass:['#648b4d','#82a95c','#547943'],leaves:['#77a74f','#93bb61','#608f43','#a6c97a'],water:['#4f8c9c','#6ba7b6','#3d788b'],soil:'#7c6045'},
 {grass:['#615d57','#7b6b58','#51564c'],leaves:['#d8853d','#e9ae50','#b96235','#e5a06d'],water:['#678b8e','#8ba6a4','#537478'],soil:'#866349'},
 {grass:['#e0e8e9','#edf0eb','#c5d7de'],leaves:['#e7eff2','#f6f7f2','#ccdce6','#dce7ef'],water:['#aecdd9','#c7e0e6','#9dbdcd'],soil:'#796e65'}
];
function grow(){
 if(!renderer)return;if(sceneMode==='islands'){growIslands();return;}
 disposeGroup(root);bonsai=buildBonsai(qr,season,blossom);root.add(bonsai.group);return;
 seed=712;disposeGroup(root);const winter=season===3,autumn=season===2;
 trunk=new THREE.Group();ground=new THREE.Group();foliage=new THREE.Group();root.add(ground,trunk,foliage);
 const {blocks,rotors}=buildSeasonWorld(season,blossom,random);
 function block(x,y,z,w,h,d,color){blocks.push({x,y,z,w,h,d,color});}
 // A small voxel rabbit beside the path, facing toward the viewer.
 const bunnyStart=blocks.length,butterflies=[];const bx=.73,bz=.18;block(bx,.23,bz,.35,.34,.43,'#e8e8de');block(bx,.40,bz+.24,.30,.29,.26,'#f5f4e9');
 for(const dx of [-.095,.095]){block(bx+dx,.67,bz+.24,.07,.32,.075,'#f2eee4');block(bx+dx,.68,bz+.284,.035,.20,.018,'#d8b1ad');block(bx+dx,.09,bz+.22,.13,.10,.23,'#eeece0');block(bx+dx,.44,bz+.378,.033,.045,.022,'#333936');}
 block(bx,.35,bz+.39,.045,.035,.025,'#d7978f');block(bx,.29,bz-.26,.14,.15,.13,'#f5f3e8');
 const bunnyEnd=blocks.length;for(let i=bunnyStart;i<bunnyEnd;i++)blocks[i].y+=.10;
 // Little airborne voxel butterflies; winter swaps them for drifting snow.
 if(!winter){for(const [x,y,z,c] of [[-1.90,2.17,.10,'#dba75b'],[1.43,2.56,-.65,'#a5c5a5'],[1.73,1.80,.10,'#bba1d0']]){const start=blocks.length;block(x,y,z,.045,.21,.045,autumn?'#42364e':'#786040');for(const side of [-1,1]){block(x+side*.105,y+.04,z,.15,.16,.045,autumn?'#554267':c);block(x+side*.075,y-.09,z,.09,.10,.045,autumn?'#443650':c);}butterflies.push({start,end:blocks.length,x,y,z,phase:butterflies.length*2.1});}}
 else{for(let i=0;i<55;i++)block((random()-.5)*4.9,.4+random()*3.4,(random()-.5)*4.8,.028,.028,.028,'#f6faff');}
 // Long links need more modules; split existing terrain voxels without changing its shape.
 let darkCount=0;for(let r=0;r<matrixSize;r++)for(let c=0;c<matrixSize;c++)if(qr.isDark(r,c))darkCount++;
 while(blocks.length<darkCount){const i=blocks.findIndex(b=>!b.rz&&b.w>.01);const b=blocks[i];const half=b.w/2;blocks[i]={...b,x:b.x-half/2,w:half};blocks.push({...b,x:b.x+half/2,w:half});}
 // One instanced cube mesh keeps the detailed diorama lightweight.
 const cube=new THREE.BoxGeometry(1,1,1),norm=cube.attributes.normal,shades=[];
 for(let i=0;i<norm.count;i++){const shade=norm.getY(i)>.5?1:norm.getY(i)<-.5?.52:norm.getX(i)>.5?.75:norm.getZ(i)>.5?.88:.65;shades.push(shade,shade,shade);}cube.setAttribute('color',new THREE.Float32BufferAttribute(shades,3));
 const garden=new THREE.InstancedMesh(cube,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true}),blocks.length),dummy=new THREE.Object3D();
 blocks.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.rotation.set(0,0,b.rz||0);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();garden.setMatrixAt(i,dummy.matrix);garden.setColorAt(i,new THREE.Color(b.color));});
 garden.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 garden.userData.wildlife={blocks,rotors,bunnyStart,bunnyEnd,butterflies,time:0,lastTime:null,dummy:new THREE.Object3D(),point:new THREE.Vector3()};
 const tileSize=5.6/(matrixSize+8),cells=[];for(let r=0;r<matrixSize;r++)for(let c=0;c<matrixSize;c++)if(qr.isDark(r,c))cells.push({r,c,px:(c-(matrixSize-1)/2)*tileSize,pz:(r-(matrixSize-1)/2)*tileSize});
 // Partition each QR cell among the original voxels: no replacement mesh or fade.
 const ordered=blocks.map((b,i)=>i).sort((a,b)=>blocks[a].z-blocks[b].z||blocks[a].x-blocks[b].x);
 const targets=new Array(blocks.length);let cursor=0;
 cells.forEach((cell,j)=>{
  const count=Math.floor((j+1)*blocks.length/cells.length)-Math.floor(j*blocks.length/cells.length);
  function partition(ids,x,z,w,d){
   if(ids.length===1){const i=ids[0],color=new THREE.Color(blocks[i].color),hsl={};color.getHSL(hsl);color.setHSL(hsl.h,Math.max(.25,hsl.s),Math.min(.10,hsl.l));targets[i]={position:new THREE.Vector3(x,.015,z),scale:new THREE.Vector3(w,.035,d),color};return;}
   const k=Math.floor(ids.length/2),ratio=k/ids.length;
   if(w>=d){partition(ids.slice(0,k),x-w*(1-ratio)/2,z,w*ratio,d);partition(ids.slice(k),x+w*ratio/2,z,w*(1-ratio),d);}
   else{partition(ids.slice(0,k),x,z-d*(1-ratio)/2,w,d*ratio);partition(ids.slice(k),x,z+d*ratio/2,w,d*(1-ratio));}
  }
  partition(ordered.slice(cursor,cursor+count),cell.px,cell.pz,tileSize,tileSize);cursor+=count;
 });
 // Match nearby source and destination regions recursively to avoid crisscrossing streams.
 const packed=targets.slice(),indices=blocks.map((_,i)=>i);
 function matchRegions(source,destination){
  if(source.length===1){targets[source[0]]=destination[0];return;}
  const xs=destination.map(t=>t.position.x),zs=destination.map(t=>t.position.z);
  const axis=Math.max(...xs)-Math.min(...xs)>=Math.max(...zs)-Math.min(...zs)?'x':'z';
  source.sort((a,b)=>blocks[a][axis]-blocks[b][axis]);destination.sort((a,b)=>a.position[axis]-b.position[axis]);
  const middle=Math.floor(source.length/2);matchRegions(source.slice(0,middle),destination.slice(0,middle));matchRegions(source.slice(middle),destination.slice(middle));
 }
 matchRegions(indices,packed);
 garden.userData.morph={targets,source:null,last:-1,matrix:new THREE.Matrix4(),position:new THREE.Vector3(),scale:new THREE.Vector3(),quaternion:new THREE.Quaternion(),identity:new THREE.Quaternion(),color:new THREE.Color()};
 garden.frustumCulled=false;
 foliage.add(garden);foliage.userData.leaves=garden;foliage.userData.blockCount=blocks.length;

 const base=new THREE.Mesh(new THREE.BoxGeometry(5.6,.04,5.6),new THREE.MeshBasicMaterial({color:'#f6f1e7'}));base.position.y=-.05;ground.add(base);base.visible=false;ground.userData.decor=new THREE.Group();ground.add(ground.userData.decor);
}
// Islands are assembled from the QR footprint itself. Neighboring land cells
// share an elevation, while their tapered rock undersides hang in open space.
function growIslands(){
 seed=816;disposeGroup(root);islandGroups=[];
 const size=5.6/(matrixSize+8), patches=new Map(), allCells=[];
 function patchKey(r,c){
  if(r<7&&c<7)return 'corner-a';if(r<7&&c>=matrixSize-7)return 'corner-b';if(r>=matrixSize-7&&c<7)return 'corner-c';
  return Math.floor(r/5)+':'+Math.floor(c/5);
 }
 for(let r=0;r<matrixSize;r++)for(let c=0;c<matrixSize;c++)if(qr.isDark(r,c)){
  const key=patchKey(r,c);if(!patches.has(key))patches.set(key,[]);
  patches.get(key).push({r,c,x:(c-(matrixSize-1)/2)*size,z:(r-(matrixSize-1)/2)*size});
 }
 const dummy=new THREE.Object3D();
 for(const [key,cells] of patches){
  const group=new THREE.Group(),detail=new THREE.Group();group.add(detail);root.add(group);
  const elevation=key==='corner-a'?1.4:key==='corner-b'?2.5:key==='corner-c'?1.1:.85+random()*1.9;
  group.position.y=elevation;group.userData.baseY=elevation;group.userData.phase=random()*Math.PI*2;group.userData.detail=detail;islandGroups.push(group);
  const tops=new THREE.InstancedMesh(new THREE.BoxGeometry(size*1.002,.075,size*1.002),new THREE.MeshBasicMaterial(),cells.length);
  const display=[],scan=[];
  const vertices=[],colors=[];
  const rockPalette=['#68677e','#8b8796','#a49da8','#777b8a'];
  cells.forEach((cell,i)=>{
   dummy.position.set(cell.x,0,cell.z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(1);dummy.updateMatrix();tops.setMatrixAt(i,dummy.matrix);
   const lush=new THREE.Color(season===3?'#dae8ed':season===2?'#bb9550':'#80ad67').multiplyScalar(.8+random()*.28);display.push(lush);scan.push(moduleColor(cell.r,cell.c).color);tops.setColorAt(i,lush);
   allCells.push({...cell,y:elevation});
   const h=.4+random()*.5,half=size/2;const top=[[-half,0,-half],[half,0,-half],[half,0,half],[-half,0,half]], tip=[cell.x+size*(random()-.5)*.3,-h,cell.z+size*(random()-.5)*.3];
   for(let side=0;side<4;side++){
    const a=top[side],b=top[(side+1)%4],color=new THREE.Color(rockPalette[(side+i)%4]);
    for(const point of [[cell.x+a[0],-.035,cell.z+a[2]],[cell.x+b[0],-.035,cell.z+b[2]],tip]){vertices.push(...point);colors.push(color.r,color.g,color.b);}
   }
  });
  const rockGeo=new THREE.BufferGeometry();rockGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));rockGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));rockGeo.computeVertexNormals();
  const rock=new THREE.Mesh(rockGeo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));group.add(rock,tops);group.userData.tops=tops;group.userData.display=display;group.userData.scan=scan;group.userData.cells=cells;
  const grassGeo=new THREE.BufferGeometry();grassGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.01,0,0,.01,0,0,.015,.11,0],3));grassGeo.computeVertexNormals();
  const grasses=new THREE.InstancedMesh(grassGeo,new THREE.MeshBasicMaterial({color:season===3?'#f0f4f5':season===2?'#d3b566':'#a4cc7c',side:THREE.DoubleSide}),cells.length*12);
  cells.forEach((cell,i)=>{for(let j=0;j<12;j++){dummy.position.set(cell.x+(random()-.5)*size*.8,.04,cell.z+(random()-.5)*size*.8);dummy.rotation.set(0,random()*6.28,(random()-.5)*.4);dummy.scale.setScalar(.6+random()*.6);dummy.updateMatrix();grasses.setMatrixAt(i*12+j,dummy.matrix);}});detail.add(grasses);
  // Small flowering shrubs make the elevated land feel inhabited.
  cells.filter((_,i)=>i%7===0).forEach(cell=>{
   const shrub=new THREE.Mesh(new THREE.IcosahedronGeometry(size*.33,1),new THREE.MeshBasicMaterial({color:season===3?'#e6f0f3':season===0?blossom:season===1?'#5c9251':'#d18648'}));shrub.position.set(cell.x,size*.32+.06,cell.z);shrub.scale.y=1.3;detail.add(shrub);
  });
 }
 root.userData.islandCells=allCells;
}
function animateIslands(t,p){
 const settle=THREE.MathUtils.smoothstep(p,.65,1),color=new THREE.Color();
 for(const group of islandGroups){group.position.y=group.userData.baseY+(reduce?0:Math.sin(t*.00065+group.userData.phase)*.08*(1-p));group.userData.detail.visible=p<.97;
  const {tops,display,scan}=group.userData;for(let i=0;i<tops.count;i++)tops.setColorAt(i,color.copy(display[i]).lerp(scan[i],settle));tops.instanceColor.needsUpdate=true;
 }
}
function resize(){
 const w=$('main').clientWidth,mainHeight=$('main').clientHeight;
 // Reserve separate space for the header and controls instead of overlaying them.
 const top=78,bottom=$('.controls').offsetTop-12,h=Math.max(180,bottom-top);
 $('#scene').style.top=top+'px';$('#scene').style.height=h+'px';renderer.setSize(w,h,false);
 const range=Math.max(6.6,8.2*h/w);camera.left=-range*w/h/2;camera.right=range*w/h/2;camera.top=range/2;camera.bottom=-range/2;camera.updateProjectionMatrix();
}
// Route stays on dry land, clear of ponds, the trunk, and the fence.
const bunnyRoute=[[.55,.66],[.70,1.08],[.29,1.62],[-.22,1.31],[-.34,.89],[.12,.64]];
function animateWildlife(t,p){
 const mesh=foliage.userData.leaves,w=mesh.userData.wildlife;if(!w)return;
 const dt=w.lastTime===null?0:Math.min(.05,Math.max(0,(t-w.lastTime)/1000));w.lastTime=t;
 if(reduce||p>.05||document.hidden)return;w.time+=dt;
 const {blocks,dummy,point}=w,seconds=w.time,legDuration=4.8,leg=Math.floor(seconds/legDuration)%bunnyRoute.length;
 const a=bunnyRoute[leg],b=bunnyRoute[(leg+1)%bunnyRoute.length],local=seconds%legDuration,moveDuration=3.2,u=Math.min(1,local/moveDuration);
 const distance=Math.hypot(b[0]-a[0],b[1]-a[1]),hops=Math.max(3,Math.round(distance/.24)),hop=u<1?Math.abs(Math.sin(u*Math.PI*hops))*.12:0;
 const yaw=Math.atan2(b[0]-a[0],b[1]-a[1]),x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u;
 for(let i=w.bunnyStart;i<w.bunnyEnd;i++){
  const block=blocks[i];point.set(block.x-.73,block.y,block.z-.18);
  // Ear twitches while the rabbit pauses to look around.
  if(u===1&&block.y>.6)point.x+=Math.sin(seconds*6)*.013;
  const px=point.x*Math.cos(yaw)+point.z*Math.sin(yaw),pz=-point.x*Math.sin(yaw)+point.z*Math.cos(yaw);
  dummy.position.set(x+px,point.y+hop,z+pz);dummy.rotation.set(0,yaw,0);dummy.scale.set(block.w,block.h,block.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
 }
 for(const insect of w.butterflies){
  const phase=seconds*.68+insect.phase,dx=Math.cos(phase)*.36,dz=Math.sin(phase)*.28,dy=Math.sin(seconds*1.45+insect.phase)*.15;
  const heading=-phase*.45,flap=Math.sin(seconds*19+insect.phase)*1.05;
  for(let i=insect.start;i<insect.end;i++){
   const block=blocks[i],side=Math.sign(block.x-insect.x),wing=side*flap,lx=(block.x-insect.x)*Math.cos(wing),lz=-(block.x-insect.x)*Math.sin(wing);
   dummy.position.set(insect.x+dx+lx*Math.cos(heading)+lz*Math.sin(heading),block.y+dy,insect.z+dz-lx*Math.sin(heading)+lz*Math.cos(heading));dummy.rotation.set(0,heading+wing,Math.sin(phase)*.12);dummy.scale.set(block.w,block.h,block.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  }
 }
 for(const rotor of w.rotors||[]){const angle=seconds*.25;for(let i=rotor.start;i<rotor.end;i++){const b=blocks[i],dx=b.x-rotor.x,dy=b.y-rotor.y;dummy.position.set(rotor.x+dx*Math.cos(angle)-dy*Math.sin(angle),rotor.y+dx*Math.sin(angle)+dy*Math.cos(angle),b.z);dummy.rotation.set(0,0,(b.rz||0)+angle);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}}
 mesh.instanceMatrix.needsUpdate=true;
}
function animateGarden(t,p){
 const mesh=foliage.userData.leaves,m=mesh.userData.morph;
 if(p===0){
  if(m.source){m.source.forEach((s,i)=>{m.matrix.compose(s.position,s.quaternion,s.scale);mesh.setMatrixAt(i,m.matrix);mesh.setColorAt(i,s.color);});mesh.instanceColor.needsUpdate=true;mesh.instanceMatrix.needsUpdate=true;m.source=null;}
  animateWildlife(t,0);m.last=0;return;
 }
 if(!m.source)m.source=mesh.userData.wildlife.blocks.map((b,i)=>{mesh.getMatrixAt(i,m.matrix);const position=new THREE.Vector3(),quaternion=new THREE.Quaternion(),scale=new THREE.Vector3();m.matrix.decompose(position,quaternion,scale);return {position,quaternion,scale,color:new THREE.Color(b.color)};});
 if(m.last===p)return;m.last=p;
 const colorProgress=THREE.MathUtils.smoothstep(p,.25,1);
 m.source.forEach((s,i)=>{const target=m.targets[i];
  m.position.copy(s.position).lerp(target.position,p);
  m.scale.copy(s.scale).lerp(target.scale,p);
  m.quaternion.copy(s.quaternion).slerp(m.identity,p);
  m.matrix.compose(m.position,m.quaternion,m.scale);mesh.setMatrixAt(i,m.matrix);
  mesh.setColorAt(i,m.color.copy(s.color).lerp(target.color,colorProgress));
 });
 mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;
}
let lastFrameTime=null;
function frame(t){
 requestAnimationFrame(frame);const target=revealed?1:0;
 const dt=lastFrameTime===null?0:Math.min(50,Math.max(0,t-lastFrameTime));lastFrameTime=t;
 // A finite, frame-rate-independent turn with zero velocity and acceleration at either end.
 progress=reduce?target:THREE.MathUtils.clamp(progress+(target?1:-1)*dt/1500,0,1);
 const p=progress*progress*progress*(progress*(progress*6-15)+10);
 const azimuth=Math.atan2(8,9)*(1-p),elevation=THREE.MathUtils.lerp(.37,Math.PI/2-.000001,p);
 const focus=(sceneMode==='islands'?1.3:1.35)*(1-p),radius=13;
 camera.position.set(radius*Math.sin(azimuth)*Math.cos(elevation),focus+radius*Math.sin(elevation),radius*Math.cos(azimuth)*Math.cos(elevation));
 camera.lookAt(0,focus,0);
 root.rotation.y=THREE.MathUtils.lerp(-.12,Math.PI/2,p);
 if(sceneMode==='islands'){animateIslands(t,p);renderer.render(scene,camera);return;}
 bonsai.update(p,t,reduce);

 renderer.render(scene,camera);
}
makeQR();try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor('#f6f1e7');scene=new THREE.Scene();scene.add(new THREE.HemisphereLight('#ffffff','#b2ae8e',2.8));let sun=new THREE.DirectionalLight('#fff9dd',3);sun.position.set(-3,8,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.normalBias=.03;scene.add(sun);camera=new THREE.OrthographicCamera();camera.near=.1;camera.far=100;root=new THREE.Group();scene.add(root);const plane=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.07}));plane.rotation.x=-Math.PI/2;plane.position.y=-1.4;plane.receiveShadow=true;scene.add(plane);grow();resize();addEventListener('resize',resize);requestAnimationFrame(frame);}catch(e){console.warn('3D unavailable',e);renderer=null;$('#scene').hidden=true;$('#fallback').hidden=false;$('#fallback').innerHTML=qr.createImgTag(7,28,'Your scannable QR code');hint.textContent='Scan to open your link';}
function updateSceneLabels(){const name=sceneMode==='tree'?'bonsai':'islands';hint.textContent=!renderer?'Scan to open your link':revealed?'Scan the QR code · tap to return':`Tap the ${name} to see QR code`;$('#scene').setAttribute('aria-label',revealed?`Return to ${name}`:'Reveal QR code');$('#share').setAttribute('aria-label','Share '+name);}
function toggle(){if(!renderer)return;revealed=!revealed;updateSceneLabels();}
function setMode(mode){if(mode===sceneMode)return;sceneMode=mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===sceneMode)));grow();updateSceneLabels();if(renderer)resize();}
document.querySelectorAll('[data-mode]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mode===sceneMode));b.onclick=()=>setMode(b.dataset.mode);});updateSceneLabels();
$('#scene').onclick=toggle;hint.onclick=toggle;
function update(){clearTimeout(timer);let next=input.value.trim();try{if(!/^https?:\/\//i.test(next))next='https://'+next;const u=new URL(next);if(!['https:','http:'].includes(u.protocol)||!u.hostname.includes('.'))throw Error();if(next.length>600){$('#error').textContent='Please use a link shorter than 600 characters.';return;}value=u.href;makeQR();grow();$('#error').textContent='';if(!renderer)$('#fallback').innerHTML=qr.createImgTag(7,28,'Your scannable QR code');}catch{$('#error').textContent='Enter a valid website address, like example.com.';}}
input.oninput=()=>{clearTimeout(timer);timer=setTimeout(update,650);};$('#link-form').onsubmit=e=>{e.preventDefault();update();input.blur();};
function setSeason(){document.querySelectorAll('[data-season]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.season)===season)));$('#swatches').hidden=false;$('#custom-color').value=season===4?blossom:$('#custom-color').value;$('.custom-swatch').classList.toggle('selected',season===4);document.querySelectorAll('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.palette)===season)));if(renderer)resize();}
document.querySelectorAll('[data-season]').forEach(b=>b.onclick=()=>{season=Number(b.dataset.season);setSeason();grow();});document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{blossom=b.dataset.color;season=Number(b.dataset.palette||0);setSeason();grow();});setSeason();
$('#custom-color').onchange=e=>{blossom=e.target.value;season=4;setSeason();grow();};
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),3000);}
function bonsaiLink(){
 const u=new URL('https://magic-tree-jv.jvoyles255.chatgpt.site/');
 const code=btoa(encodeURIComponent(JSON.stringify([season,blossom,value]))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 u.searchParams.set('q',code);return u.href;
}
function prepareShare(){if(input.value.trim()!==value)update();if($('#error').textContent)return null;const link=bonsaiLink();$('#bonsai-link').value=link;return link;}
$('#share').onclick=e=>{e.stopPropagation();if(!$('#share-menu').hidden){$('#share-menu').hidden=true;return;}if(!prepareShare())return;$('#share-menu').hidden=false;$('#copy').innerHTML='<span aria-hidden="true">↗</span>Copy Link';$('#bonsai-link').hidden=true;};
document.addEventListener('click',e=>{if(!e.target.closest('#share-menu')&&!e.target.closest('#share'))$('#share-menu').hidden=true;});
$('#bonsai-link').onclick=()=>$('#bonsai-link').select();
$('#copy').onclick=async()=>{
 const link=prepareShare();if(!link)return;let copied=false;
 try{await navigator.clipboard.writeText(link);copied=true;}catch{
  const field=$('#bonsai-link');field.hidden=false;field.focus();field.select();
  try{copied=document.execCommand('copy');}catch{}
 }
 if(copied){$('#bonsai-link').hidden=true;$('#share-menu').hidden=true;$('#share').focus();toast('Link copied!');}
 else{toast('Copy the selected link');}
};
for(const [id,base,param] of [['#share-x','https://twitter.com/intent/tweet','url'],['#share-facebook','https://www.facebook.com/sharer/sharer.php','u'],['#share-whatsapp','https://wa.me/','text']]){
 $(id).onclick=()=>{const link=prepareShare();if(!link)return;const target=new URL(base);target.searchParams.set(param,id==='#share-whatsapp'?'A little bonsai for you 🌿 '+link:link);if(id==='#share-x')target.searchParams.set('text','A little bonsai for you 🌿');window.open(target.href,'_blank','noopener,noreferrer');$('#share-menu').hidden=true;};
}
function downloadTileColor(r,c){
 const n=qr.getModuleCount(),finder=(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
 const edge=Math.min(r,c,n-1-r,n-1-c)<2,noise=(r*31+c*17)%5;
 const greens=['#50852f','#648d39','#78843d','#477c2c','#718d40'];
 const colors=[['#a95c87','#b56894','#98557d','#ae648d','#a36387'],['#508638','#699047','#56863b','#47782f','#658c40'],['#ad6834','#b77b3d','#a25c2f','#b16e35','#a97536'],['#4386a5','#5296b3','#397d9c','#4a8ead','#538eaa']];
 if(season===4&&!finder&&!edge){const color=new THREE.Color(blossom),hsl={};color.getHSL(hsl);color.setHSL(hsl.h,Math.max(.25,hsl.s),.045+noise*.008);return '#'+color.getHexString();}
 const hex=(finder||edge?greens:colors[season])[noise];return '#'+hex.slice(1).match(/../g).map(v=>Math.round(parseInt(v,16)*.72).toString(16).padStart(2,'0')).join('');
}
$('#download').onclick=()=>{
 const c=document.createElement('canvas'),n=qr.getModuleCount();c.width=1920;c.height=1080;
 const ctx=c.getContext('2d');ctx.fillStyle='#f6f1e7';ctx.fillRect(0,0,c.width,c.height);
 const scale=Math.max(1,Math.floor(600/n)),size=n*scale,left=Math.floor((c.width-size)/2),top=Math.floor((c.height-size)/2);
 for(let r=0;r<n;r++)for(let col=0;col<n;col++){
  ctx.fillStyle=qr.isDark(r,col)?downloadTileColor(r,col):['#eeeae0','#e9e5db','#f0ece3'][(r*7+col*11)%3];
  ctx.fillRect(left+col*scale,top+r*scale,scale,scale);
 }
 const a=document.createElement('a');a.download='BonsaiQR.png';a.href=c.toDataURL('image/png');a.click();$('#share-menu').hidden=true;toast('QR artwork downloaded');
};
$('#info').onclick=()=>$('#about').showModal();$('#close-about').onclick=()=>$('#about').close();document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#share-menu').hidden=true;});
