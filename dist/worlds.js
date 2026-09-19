// Hand-built voxel dioramas. All four occupy the same 5.4 × 5.4 footprint.
export function buildSeasonWorld(season, blossom, random) {
 const blocks=[],rotors=[];const winter=season===3,autumn=season===2;
 const pick=a=>a[Math.floor(random()*a.length)];
 function box(x,y,z,w,h,d,color,rz=0){blocks.push({x,y,z,w,h,d,color,rz});}
 const stone=['#7e7775','#97847c','#b19881'],snow=['#e6eff2','#f7f7f0','#d0e2e9'];
 function flower(x,z,color,y=.12){box(x,y+.13,z,.035,.26,.035,'#5e8b55');for(const [a,b] of [[-.045,0],[.045,0],[0,-.045],[0,.045]])box(x+a,y+.29,z+b,.066,.045,.066,color);box(x,y+.31,z,.035,.03,.035,'#efd27f');}
 function broadTree(x,z,h,colors,r=.62){
  box(x,h*.36,z,.19,h*.72,.19,'#795340');box(x-.14,h*.62,z,.40,.13,.14,'#8d6550');
  if(season===0&&r>.65){for(const side of [-1,1])box(x+side*.23,h*.75,z,.55,.11,.13,'#8d6550');}
  for(let a=-r;a<=r;a+=.13)for(let b=-r;b<=r;b+=.13)for(let c=-r*.66;c<=r*.66;c+=.13){if((a/r)**2+(b/r)**2+(c/(r*.75))**2>1.03||random()<.06)continue;const contour=season===0&&r>.65?.12*Math.sin(a*6)+.12*Math.cos(b*5):0;box(x+a,h+c+contour,z+b,.13,.13,.13,pick(colors));if(random()<.07)box(x+a+.015,h+c+.085,z+b,.065,.045,.065,pick(colors));}
 }
 function pine(x,z,h,decorated=false,y=0){
  box(x,y+h*.42,z,.13,h*.84,.13,'#7d6654');
  for(let tier=0;tier<7;tier++){const width=(1-tier/8)*h*.50,yy=y+h*.28+tier*h*.10;box(x,yy,z,width,.14,width,winter?'#517e70':'#4c8658');box(x,yy+.09,z,width*.89,.055,width*.89,winter?pick(snow):'#71995a');
   if(decorated){const edge=width*.44;for(const side of [-1,1]){box(x+side*edge,yy-.015,z+edge,.065,.075,.065,['#eac27d','#ca8398','#aabbe2'][tier%3]);}}}
  if(decorated){const ytop=y+h*1.03;box(x,ytop,z,.07,.33,.07,'#f6d58c');box(x,ytop,z,.27,.07,.07,'#f9df99');box(x,ytop,z,.16,.16,.075,'#f2c878');}
 }
 function cabin(x,z,w,d,wall,roof,y=0,moss=false){
  const h=w*.74;box(x,y+.08,z,w+.12,.16,d+.12,'#8b8277');
  for(let row=0;row<9;row++)box(x,y+.18+row*h/9,z,w,h/9*.86,d,row%2?wall:'#ae956e');
  // Corner timbers and window frames make these buildings legible at small sizes.
  for(const side of [-1,1]){box(x+side*(w/2-.055),y+h*.54,z+d/2,.10,h,.06,'#755d4d');box(x+side*w*.28,y+h*.64,z+d/2+.035,w*.19,h*.27,.06,winter||autumn?'#f2be76':'#9fcac4');box(x+side*w*.28,y+h*.64,z+d/2+.07,.025,h*.29,.02,'#eee0b9');}
  for(const side of [-1,1]){box(x+w/2+.025,y+h*.62,z+side*d*.25,.055,h*.29,d*.23,winter||autumn?'#efc889':'#a1c7b9');box(x+w/2+.06,y+h*.62,z+side*d*.25,.018,h*.31,.028,'#eee0b9');}
  box(x,y+h*.34,z+d/2+.06,w*.21,h*.58,.07,'#65534c');box(x+.045,y+h*.35,z+d/2+.11,.025,.025,.015,'#e6be77');
  for(let j=0;j<10;j++){const rw=w*1.22-j*w*.112,yy=y+h+.11+j*.073;box(x,yy,z,rw,.08,d*1.22,roof);for(let k=0;k<Math.ceil(d/.14);k++){if((k+j)%2)box(x+rw/2-.04,yy+.05,z-d*.55+k*.14,.075,.025,.13,winter?'#f6f8f6':moss?'#a6b675':'#be684a');}}
  if(moss)for(let i=0;i<30;i++){const xx=(random()-.5)*w*.8,zz=(random()-.5)*d;box(x+xx,y+h+.81-Math.abs(xx)*.65,z+zz,.15,.06,.16,pick(['#719252','#90ab62','#a3b56e']));}
  box(x-w*.27,y+h+.59,z-d*.25,.20,.66,.22,winter?'#8e8173':'#9b7b67');
  for(let i=0;i<5;i++)box(x-w*.27+i*.045,y+h+1.0+i*.13,z-d*.25,.15+i*.014,.12,.15+i*.012,winter?'#e4edf0':'#e0e4d5');
  box(x,y+.12,z+d*.68,w*.62,.12,d*.34,'#b7ad91');box(x,y+.02,z+d*.86,w*.68,.10,.18,'#cdc5ae');
 }
 function bridge(x,z,width=.9){for(let i=0;i<9;i++)box(x-width/2+i*width/8,.19,z,width/8*.92,.08,.40,'#b68d60');for(const side of [-1,1]){box(x,.43,z+side*.24,width,.045,.04,'#d1af7d');for(const dx of [-width/2,width/2])box(x+dx,.31,z+side*.24,.05,.37,.05,'#90704e');}}
 function lamp(x,z,y=.1){box(x,y+.34,z,.045,.68,.045,'#4c6570');box(x,y+.74,z,.15,.20,.15,'#f4ce8e');box(x,y+.87,z,.21,.05,.21,'#61727a');}
 function pumpkin(x,z,s=.24){box(x,s*.48,z,s,s*.8,s*.86,'#d88b42');box(x,s*.93,z,.04,.07,.045,'#6d6d42');for(const dx of [-s*.22,s*.22])box(x+dx,s*.58,z+s*.44,s*.13,s*.13,.016,'#ffd993');box(x,s*.3,z+s*.44,s*.35,.02,.02,'#ffe0a1');}
 function path(z0,z1,xfn,y=.13){for(let z=z0;z<z1;z+=.17)box(xfn(z),y,z,.39+(random()-.5)*.08,.045,.155,winter?pick(['#d1e0e6','#bfced8','#e1e9e9']):pick(['#c3c1ab','#dbd3b7','#aea98d']));}
 // A consistent outer footprint, with finer tiles and varied edge topography.
 box(0,-.25,0,5.4,.36,5.4,season===1?'#218d9d':winter?'#9fcedc':autumn?'#766775':'#6b8053');
 const step=.15;
 for(let ix=0;ix<36;ix++)for(let iz=0;iz<36;iz++){
  const x=-2.625+ix*step,z=-2.625+iz*step,r=Math.hypot(x/2.38,z/2.38);
  let color,y=.015,h=.13;
  if(season===1){const wobble=.06*Math.sin(z*4)+.04*Math.cos(x*5);color=r>1.04+wobble?pick(['#348fa4','#3c9ead','#278398']):r>.93+wobble?pick(['#67c6b1','#58bba7','#73cdbc']):r>.78+wobble?pick(['#ecd385','#eedc99','#ddc77f']):pick(['#a8ba6d','#bdc97b','#92b266']);y=r>.93+wobble?-.055:.02;}
  else if(winter){const ice=((x+1.62)/.71)**2+((z-1.60)/.70)**2<1;color=ice?pick(['#87c0d3','#a5d4e0','#b4dce6']):pick(snow);if(z<-1.90){y=.10+Math.floor(random()*3)*.11;h=y+.12;}}
  else{const stream=Math.abs(x-(-1.9+Math.sin(z*1.9)*.19))<.23;const c=season===0?['#7ba971','#88b47b','#6b9c66']:['#afa26e','#c3ae73','#a99767'];color=stream?pick(['#65a9b0','#87bfbb','#5599a5']):pick(c);y=stream?-.04:.015;}
  box(x,y,z,.15,h,.15,color);
  if(autumn&&(ix===0||iz===0||ix===35||iz===35)){const dep=.2+random()*.42;box(x,-.35-dep/2,z,.15,dep,.15,pick(stone));}
 }
 // Fine tufts, tiny pebbles, and meadow flowers form a rich but quiet ground layer.
 for(let i=0;i<1400;i++){const x=(random()-.5)*5.1,z=(random()-.5)*5.1;if(Math.abs(x)<.58&&z>.3)continue;if(season===1&&Math.hypot(x/2.38,z/2.38)>.76)continue;if(season!==1&&season!==3&&x<-1.6)continue;box(x,.10,z,.027,.05+random()*.07,.027,winter?pick(snow):autumn?pick(['#83784f','#c2a56b']):pick(['#74a361','#adc887','#639657']));}
 if(season===0){
  cabin(.58,-1.12,1.65,1.28,'#b5a37a','#8c9d62',0,true);
  broadTree(-1.0,-.24,2.28,['#efc4cc',blossom,'#e2b0c0','#f1d6d7'],.80);
  broadTree(-1.88,-1.43,1.62,['#538b79','#6aa58b','#80b39a'],.50);
  pine(1.98,-.74,1.26);pine(1.90,-1.91,1.36);
  bridge(-1.87,1.07,.9);path(.20,2.6,z=>.08+Math.sin(z*2)*.17);
  // Mossy wishing well, an arched cottage trellis, and a blossom meadow.
  for(let i=0;i<8;i++){const a=i*Math.PI/4;box(-1.05+Math.cos(a)*.22,.24,.54+Math.sin(a)*.22,.16,.35,.16,'#969f94');}
  box(-1.05,.13,.54,.28,.03,.28,'#55949d');for(const dx of [-.28,.28])box(-1.05+dx,.58,.54,.06,.79,.06,'#88705c');for(let i=0;i<5;i++)box(-1.05,.99-i*.055,.54,(.13+i*.13),.065,.62,'#7c9075');
  for(let i=0;i<62;i++){const x=(random()-.5)*4.8,z=.5+random()*1.95;if(Math.abs(x)<.65||x<-1.6)continue;flower(x,z,pick(['#d897ae','#eaca74','#e6c5dc','#c98286']));}
  for(let i=0;i<16;i++)box(.64+Math.sin(i*.7)*.7,1.9-i*.08,-.35,.075,.10,.06,'#77a068');
 } else if(season===1){
  // Stilt cottage with tiled terracotta roof and a broad sun deck.
  cabin(.36,-1.12,1.65,1.15,'#d09b6b','#b65c43',.25,false);
  box(.35,.26,-.13,2.0,.11,.85,'#c58d5d');for(let x=-.48;x<1.3;x+=.3)box(x,.325,-.13,.24,.018,.82,'#e0ad78');
  for(const x of [-.52,1.2])for(const z of [-.55,.25])box(x,.05,z,.08,.42,.08,'#865e43');
  for(let j=0;j<4;j++)box(.3,.24-j*.06,.34+j*.15,.47,.06,.15,'#d3ad7b');
  function palm(x,z,h){for(let i=0;i<15;i++)box(x+i*.014,h*i/15,z,.14,h/15+.012,.14,i%2?'#a58656':'#907247');for(let k=0;k<8;k++)for(let j=0;j<6;j++){const a=k*Math.PI/4,r=.12+j*.15;box(x+.2+Math.cos(a)*r,h+.17-j*j*.015,z+Math.sin(a)*r,.18,.075,.18,j%2?'#6f9950':'#4d8455');}}
  palm(-1.28,-.58,2.2);palm(1.71,-1.28,1.98);
  path(.65,1.9,z=>.15+Math.sin(z*2)*.13,.10);
  // Parasol, a woven lounger, a cooler, and a tiny lemonade pitcher.
  box(-1.10,.61,1.10,.04,1.22,.04,'#b6a079');for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++){if(Math.abs(x)+Math.abs(z)>4)continue;box(-1.10+x*.13,1.30-(Math.abs(x)+Math.abs(z))*.052,1.10+z*.13,.14,.06,.14,(x+z)%2?'#e7b379':'#f7e6b8');}
  for(let i=0;i<7;i++)box(-1.14,.18+i*.026,1.27+i*.077,.37,.045,.062,i%2?'#619fa9':'#f1e7c9');
  box(-.84,.12,1.93,.23,.20,.22,'#cf8175');box(-.84,.24,1.93,.25,.05,.24,'#f5e4ca');
  // Jetty and a miniature sailing boat along the back-left turquoise coast.
  bridge(2.13,-1.09,.88);box(-2.05,.02,-1.5,.37,.12,.70,'#ad6448');box(-2.05,.48,-1.5,.035,.90,.035,'#ab9270');for(let j=0;j<6;j++)box(-2.05+.10-j*.015,.72-j*.09,-1.50,.035,.08,.12+j*.062,'#f2e7c8');
  for(const dx of [-.21,.21])box(1.96+dx,.025,.82,.10,.09,.40,'#e89987');for(const dz of [-.19,.19])box(1.96,.025,.82+dz,.34,.09,.10,'#f1d09b');
  for(let i=0;i<28;i++){const a=random()*Math.PI*2,r=2.0+random()*.20;box(Math.cos(a)*r,.10,Math.sin(a)*r,.06,.026,.04,'#fff0c8');}
 } else if(autumn){
  // Haunted windmill anchors an ochre orchard and a cascading stream.
  const mx=.22,mz=-.95;box(mx,.98,mz,.86,1.96,.78,'#c5b48c');for(let i=0;i<6;i++)box(mx,1.98+i*.115,mz,1.17-i*.16,.13,1.06-i*.14,'#775269');
  for(const dx of [-.35,.35])box(mx+dx,.97,mz+.405,.065,1.85,.025,'#785e53');box(mx,.31,mz+.423,.23,.56,.03,'#615064');for(const dx of [-.23,.23])box(mx+dx,1.10,mz+.43,.15,.23,.027,'#f0c177');
  const rotorStart=blocks.length,pivot={x:mx,y:1.97,z:mz+.65};
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.25;for(let j=1;j<=8;j++){const r=j*.13;box(mx+Math.sin(a)*r,1.97+Math.cos(a)*r,pivot.z,.065,.14,.06,'#9e7958',-a);if(j>3)box(mx+Math.sin(a)*r+Math.cos(a)*.12,1.97+Math.cos(a)*r-Math.sin(a)*.12,pivot.z,.23,.047,.045,'#dbbc80',-a);}}
  rotors.push({start:rotorStart,end:blocks.length,...pivot});box(mx,1.97,pivot.z+.06,.14,.14,.14,'#68505a');
  for(const [x,z,h,c] of [[-1.11,-1.12,1.8,['#d49b48','#e4b359','#c88243']],[1.69,-1.18,1.7,['#d77c4b','#e99c57','#b86644']],[-.99,1.31,1.15,['#d3ad59','#e2bd70','#b99046']],[1.83,.79,1.23,['#be6a47','#d7874c','#e8a95f']]])broadTree(x,z,h,c,.44);
  bridge(-1.84,.4,.88);path(.12,2.6,z=>.12+Math.sin(z*2)*.16);
  for(let i=0;i<8;i++)box(-1.90+i*.057,-.10-random()*.50,2.62,.058,.60+random()*.60,.08,pick(['#73b4b5','#9dccc4','#b5d8c8']));
  for(const [x,z] of [[.91,1.35],[-.52,2.12],[1.21,.3],[-1.32,-.2]])pumpkin(x,z,.22+random()*.06);
  for(const [x,y,z] of [[-2.1,1.04,.95],[1.4,1.42,.35]]){box(x,y,z,.22,.29,.19,'#e2d9df');box(x,y+.16,z,.14,.07,.16,'#efe6e7');for(const dx of [-.052,.052])box(x+dx,y+.015,z+.105,.032,.042,.018,'#5b4864');}
  for(const x of [1.65,2.1]){box(x,.22,1.9,.19,.36,.12,'#8e8890');box(x,.40,1.9,.14,.04,.12,'#a6a0a2');}
  lamp(.86,1.92);lamp(-.67,.6);
 } else {
  // Ice terraces, warmly lit cabins, a festive evergreen, and a frozen pond.
  cabin(-1.20,-1.48,1.04,.90,'#a48b72','#e6edef',.12);cabin(1.39,-1.28,1.08,.91,'#ba9e7c','#f1f3ef',.14);
  pine(-.18,-.27,2.83,true,.06);pine(-2.02,-.37,1.54);pine(2.1,-.23,1.41);pine(-2.14,-1.92,1.45);
  for(let i=0;i<22;i++){const x=-2.50+i*.23;box(x,-.14,-2.62,.17,.27+random()*.22,.10,pick(['#aed3e0','#cce4e9','#97c2d4']));}
  path(.40,2.65,z=>.18+Math.sin(z*2)*.11,.105);bridge(-1.69,1.60,.78);
  const sx=1.40,sz=.65;box(sx,.28,sz,.45,.46,.42,'#e5eef0');box(sx,.63,sz,.34,.28,.31,'#f3f5ef');box(sx,.89,sz,.25,.24,.24,'#edf4f3');for(const dx of [-.054,.054])box(sx+dx,.92,sz+.13,.033,.033,.016,'#3e525c');box(sx,.865,sz+.18,.045,.045,.12,'#d99557');box(sx,.754,sz,.36,.06,.34,'#c17480');box(sx+.09,.63,sz+.18,.065,.22,.035,'#bd6b76');box(sx,1.03,sz,.35,.04,.32,'#486674');box(sx,1.12,sz,.21,.16,.21,'#52717c');for(const side of [-1,1])box(sx+side*.28,.62,sz,.28,.04,.04,'#9b7c62');
  for(const dx of [-.16,.16])box(-1.05+dx,.12,.55,.04,.06,.66,'#a4866d');for(let j=0;j<6;j++)box(-1.05,.21,.25+j*.10,.38,.05,.075,'#bf7380');
  for(const [x,z,c] of [[.60,-.13,'#b06e7f'],[.83,-.31,'#84adb0'],[.48,-.46,'#d1b67d']]){box(x,.16,z,.21,.25,.20,c);box(x,.3,z,.23,.035,.22,c);box(x,.17,z+.105,.037,.26,.012,'#f1ddb0');}
  for(const [x,z] of [[-.55,1.87],[.75,1.73],[-.58,.45],[.86,.33]])lamp(x,z);
  for(let i=0;i<16;i++)box(-1.62+i*.23,.18,2.13,.022,.26,.022,'#b6cbd2');box(.1,.32,2.13,3.44,.025,.025,'#dae5e4');
 }
 return {blocks,rotors,groundHeight:(x,z)=>season===1?.11:.10};
}
