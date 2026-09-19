// Shared links and typed links must pass the same checks before QR generation.
export function safeDestination(raw){
 if(typeof raw!=='string'||raw.length>600||/[\u0000-\u001f\u007f]/.test(raw))throw Error('Invalid URL');
 const u=new URL(raw);
 if(!['https:','http:'].includes(u.protocol)||!u.hostname.includes('.')||u.username||u.password||u.href.length>600)throw Error('Invalid URL');
 return u.href;
}
export function readSharedState(search='',hash=''){
 let raw=search.length<=8192?search:'';
 try{if(hash.startsWith('#bonsai=')&&hash.length<=8192)raw=decodeURIComponent(hash.slice(8));}catch{return new URLSearchParams();}
 const params=new URLSearchParams(raw);
 try{if(params.has('q')){const q=params.get('q');if(q.length>6000)throw Error();const data=JSON.parse(decodeURIComponent(atob(q.replace(/-/g,'+').replace(/_/g,'/'))));if(!Array.isArray(data)||data.length!==3)throw Error();const [color,tint,url]=data;if(!Number.isInteger(color)||color<0||color>4||typeof tint!=='string'||!/^#[0-9a-f]{6}$/i.test(tint))throw Error();params.set('season',String(color));params.set('blossom',tint);params.set('url',safeDestination(url));}
 if(params.has('url'))params.set('url',safeDestination(params.get('url')));
 }catch{return new URLSearchParams();}
 return params;
}
