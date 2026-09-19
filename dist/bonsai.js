import * as THREE from './vendor/three.module.js';
// The foliage is planted directly in the QR footprint. The camera reveals it;
// no voxel sorting or replacement QR mesh is involved.
export function buildBonsai(qr,season,blossom){
 const group=new THREE.Group(),wood=new THREE.Group();group.add(wood);
 const n=qr.getModuleCount(),unit=5.6/(n+8),dummy=new THREE.Object3D(),pieces=[];
 let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const palette=season===4?[.68,.84,1,1.12].map(f=>{const c=new THREE.Color(blossom);c.multiplyScalar(f);return c.getStyle();}):season===0?[blossom,'#dfa6cd','#efc9e5','#c98fbd']:season===1?['#599333','#73a746','#8ab954','#497f32']:season===2?['#bf7132','#dda345','#a64f2f','#d48a36']:['#8ac9e7','#b3e0f3','#72b2d2','#d0ecf7'];
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:1,transparent:true});
 const voxels=new Map(),step=.065;
 const barkColors=['#65432f','#765039','#895b3b','#986944','#543b2d'];
 function voxel(x,y,z,color,size=step){const key=[Math.round(x/step),Math.round(y/step),Math.round(z/step)].join(':');voxels.set(key,{x:Math.round(x/step)*step,y:Math.round(y/step)*step,z:Math.round(z/step)*step,color,size});}
 function limb(points,radius){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  for(let j=0;j<=100;j++){const t=j/100,c=curve.getPoint(t),r=radius*Math.pow(1-t,.8)+.027;
   for(let x=-r;x<=r;x+=step)for(let y=-r;y<=r;y+=step)for(let z=-r;z<=r;z+=step){if(x*x+y*y+z*z>r*r)continue;voxel(c.x+x,c.y+y,c.z+z,barkColors[Math.floor(random()*barkColors.length)]);}}
 }
 limb([[.28,.10,.12],[.05,.48,.10],[-.42,.92,.02],[-.55,1.22,-.08],[-.18,1.62,-.16],[.17,2.04,-.22],[.04,2.70,-.35]],.27);
 const crowns=[[-1.24,1.72,.24,.72,.25,.57],[1.04,1.99,.25,.76,.28,.55],[-.86,2.36,-.62,.69,.29,.51],[.79,2.57,-.62,.67,.27,.52],[-.10,2.96,-.42,.74,.30,.57],[-1.45,2.08,-.36,.43,.21,.38],[.02,2.22,.68,.55,.23,.42]];
 for(const [x,y,z]of crowns)limb([[-.4,1.25,-.08],[x*.45,y-.45,z*.5],[x,y-.10,z]],.105);
 // Gnarled surface roots spread into the moss instead of a radial spoke shape.
 for(let i=0;i<5;i++){const a=i*1.3;limb([[.24,.22,.1],[.18+Math.cos(a)*.28,.11,Math.sin(a)*.25],[Math.cos(a+.22)*.63,.015,Math.sin(a+.22)*.44]],.085);}
 // A pale deadwood strip twists around the living trunk.
 for(let i=0;i<25;i++){const t=i/24;voxel(-.40+Math.sin(t*4)*.21,.65+t*.9,.17,'#c5b69a',.045);}
 function voxelMesh(items,parent){
  const geometry=new THREE.BoxGeometry(1,1,1),normal=geometry.attributes.normal,shades=[];
  for(let i=0;i<normal.count;i++){const v=normal.getY(i)>.5?1:normal.getX(i)>.5?.72:normal.getZ(i)>.5?.86:.61;shades.push(v,v,v);}geometry.setAttribute('color',new THREE.Float32BufferAttribute(shades,3));
  const mesh=new THREE.InstancedMesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true}),items.length);
  items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(0,0,0);dummy.scale.set(v.w||v.size,v.h||v.size,v.d||v.size);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new THREE.Color(v.color));});parent.add(mesh);return mesh;
 }
 voxelMesh([...voxels.values()],wood);

 const pad=new THREE.Mesh(new THREE.BoxGeometry(n*unit+.035,.11,n*unit+.035),['#bcb8ae','#c5c1b6','#f6f1e7','#bcb8ae','#c5c1b6','#bcb8ae'].map(color=>new THREE.MeshBasicMaterial({color})));pad.position.y=-.3125;group.add(pad);
 // A complete inset stone mosaic makes the QR visible between the planted modules.
 const paving=[];
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){
  const dark=qr.isDark(r,c),variation=(r*13+c*7)%3;
  paving.push({x:(c-(n-1)/2)*unit,y:-.24,z:(r-(n-1)/2)*unit,w:unit*.98,h:.035,d:unit*.98,color:dark?['#b4b19e','#bfbcab','#aaa996'][variation]:['#eeeade','#e8e4d8','#f2eee4'][variation]});
 }
 voxelMesh(paving,wood);
 const pot=new THREE.Group();wood.add(pot);
 // A shallow glazed ochre tray with a dark recessed soil bed and small feet.
 const tray=[];function tile(x,y,z,w,h,d,color){tray.push({x,y,z,w,h,d,color});}
 tile(0,-.10,0,2.05,.14,1.5,'#906335');tile(0,-.012,0,1.87,.035,1.32,'#4b4030');
 for(const side of [-1,1]){tile(0,.015,side*.75,2.15,.19,.09,'#ba8743');tile(side*1.03,.015,0,.09,.19,1.5,'#a7763b');tile(0,.115,side*.75,2.19,.045,.12,'#d3a45a');tile(side*1.03,.115,0,.12,.045,1.5,'#c6954b');for(const x of [-.72,.72])tile(x,-.21,side*.48,.22,.12,.20,'#6a5235');}
 for(let x=-.87;x<.9;x+=.065)for(let z=-.60;z<.64;z+=.065){const mound=Math.max(0,1-Math.hypot((x-.15)/.9,z/.65));if(random()<.88)tile(x,.025+mound*.09,z,.066,.03+random()*.035,.066,['#6c8c44','#829b4e','#57783b'][Math.floor(random()*3)]);}
 voxelMesh(tray,wood);

 for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c)){
  const x=(c-(n-1)/2)*unit,z=(r-(n-1)/2)*unit;
  const finder=(r<8&&c<8)||(r<8&&c>=n-8)||(r>=n-8&&c<8);
  const canopy=!finder&&Math.hypot(x/1.85,z/1.7)<1;
  // Stone top is -.2225; each turf block rests directly on that surface.
  let height=-.2115;
  if(canopy){const peaks=[[-1.05,.25,1.85],[.95,.3,2.0],[-.72,-.72,2.45],[.65,-.8,2.55],[-.05,-.4,3.02]];let best=Infinity;for(const [px,pz,py]of peaks){const distance=Math.hypot(x-px,z-pz);if(distance<best){best=distance;height=py-Math.floor(distance/.24)*.065;}}}
  for(let a=0;a<3;a++)for(let b=0;b<3;b++){
   const color=new THREE.Color(canopy?palette[Math.floor(random()*palette.length)]:season===3?'#99b2a5':['#5b9038','#79a744','#8b9846'][Math.floor(random()*3)]);
   const scan=color.clone(),hsl={};scan.getHSL(hsl);scan.setHSL(hsl.h,Math.max(.25,hsl.s),Math.min(.10,hsl.l));
   pieces.push({canopy,x:x+(a-1)*unit/3,z:z+(b-1)*unit/3,y:height+(canopy?random()*.085:0),w:unit/3*1.003,h:canopy?.055:.022,color,scan});
  }
 }
 const leaves=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial(),pieces.length);
 pieces.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.w,p.h,p.w);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,p.color);});group.add(leaves);
 // Fine folded leaves and tapered grass blades soften the QR support tiles.
 const detail=new THREE.Group();group.add(detail);
 const leafGeo=new THREE.BufferGeometry();leafGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.5,-.32,0,0,0,.13,.5, 0,0,-.5,0,.13,.5,.32,0,0],3));leafGeo.setAttribute('color',new THREE.Float32BufferAttribute([.83,.83,.83,.9,.9,.9,1,1,1, .7,.7,.7,1,1,1,.8,.8,.8],3));leafGeo.computeVertexNormals();
 const leafParts=pieces.filter(v=>v.canopy),grassParts=pieces.filter(v=>!v.canopy);
 const crownVoxels=[];
 for(const [cx,cy,cz,rx,ry,rz]of crowns){for(let x=-rx;x<=rx;x+=.075)for(let z=-rz;z<=rz;z+=.075)for(let y=-ry;y<=ry;y+=.075){const r=(x/rx)**2+(y/ry)**2+(z/rz)**2;if(r>1+random()*.10||random()<.08)continue;crownVoxels.push({x:cx+x,y:cy+y,z:cz+z,size:.073+random()*.012,color:palette[Math.floor(random()*palette.length)]});}}
 const fine=voxelMesh(crownVoxels,detail);
 const grassGeo=new THREE.BufferGeometry();grassGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.014,0,0,.014,0,0,.022,.12,.015],3));grassGeo.computeVertexNormals();
 const grassMaterial=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,transparent:true});
 const grass=new THREE.InstancedMesh(grassGeo,grassMaterial,grassParts.length*3);
 grassParts.forEach((v,i)=>{for(let j=0;j<3;j++){dummy.position.set(v.x+(random()-.5)*v.w,v.y+v.h/2-.002,v.z+(random()-.5)*v.w);dummy.rotation.set(0,random()*6.28,(random()-.5)*.45);dummy.scale.setScalar(.45+random()*.7);dummy.updateMatrix();grass.setMatrixAt(i*3+j,dummy.matrix);grass.setColorAt(i*3+j,v.color);}});detail.add(grass);
 const fallingMaterial=new THREE.MeshBasicMaterial({color:season===3?'#e4eceb':palette[1],side:THREE.DoubleSide,transparent:true});
 const falling=new THREE.InstancedMesh(leafGeo.clone(),fallingMaterial,24),drifters=Array.from({length:24},()=>({origin:leafParts[Math.floor(random()*leafParts.length)],phase:random(),speed:.045+random()*.035,spin:random()*6.28}));falling.frustumCulled=false;group.add(falling);
 const color=new THREE.Color();let previous=-1,lastTime=null,time=0;
 return {group,pieces,falling,setColor(hex){
  const base=new THREE.Color(hex),shades=[.68,.84,1,1.12].map(f=>base.clone().multiplyScalar(f));
  for(let i=0;i<fine.count;i++)fine.setColorAt(i,shades[i%4]);fine.instanceColor.needsUpdate=true;
  pieces.forEach((v,i)=>{if(!v.canopy)return;v.color.copy(shades[i%4]);const hsl={};v.color.getHSL(hsl);v.scan.setHSL(hsl.h,Math.max(.25,hsl.s),Math.min(.10,hsl.l));});
  fallingMaterial.color.copy(shades[1]);previous=-1;
 },update(p,t=0,reduced=false){
  const dt=lastTime===null?0:Math.min(.05,Math.max(0,(t-lastTime)/1000));lastTime=t;if(!reduced&&p===0)time+=dt;
  falling.visible=!reduced&&p<.5;fallingMaterial.opacity=1-THREE.MathUtils.smoothstep(p,0,.5);
  if(falling.visible){drifters.forEach((v,i)=>{const cycle=(time*v.speed+v.phase)%1,origin=v.origin;dummy.position.set(origin.x+Math.sin(cycle*7+v.spin)*.18+cycle*.2,origin.y*(1-cycle)+.02,origin.z+Math.cos(cycle*5+v.spin)*.16);dummy.rotation.set(cycle*8+v.spin,cycle*6,Math.sin(cycle*10)*.6);const size=.07*Math.min(1,cycle*15,(1-cycle)*15);dummy.scale.set(size,season===3?.2:.5,size*1.5);dummy.updateMatrix();falling.setMatrixAt(i,dummy.matrix);});falling.instanceMatrix.needsUpdate=true;}
  if(p===previous)return;previous=p;const fade=THREE.MathUtils.smoothstep(p,.35,.9);wood.traverse(o=>{if(o.material)o.material.opacity=1-fade;});wood.visible=p<.9;
  detail.visible=p<.9;fine.material.opacity=grassMaterial.opacity=1-fade;
  const tint=THREE.MathUtils.smoothstep(p,.35,1);pieces.forEach((v,i)=>leaves.setColorAt(i,color.copy(v.color).lerp(v.scan,tint)));leaves.instanceColor.needsUpdate=true;
 }};
}
