import assert from 'node:assert/strict';
import {safeDestination,readSharedState} from '../dist/link-safety.js';
for(const value of ['javascript:alert(1)','data:text/html,test','file:///etc/passwd','https://user:password@example.com','https://example.com/'+ 'x'.repeat(600),'https://example.com/\nfoo'])assert.throws(()=>safeDestination(value));
assert.equal(safeDestination('https://example.com/a?x=1#b'),'https://example.com/a?x=1#b');
for(const [palette,color,url]of [[4,'#abcdef','https://example.com/a?x=1&b=2#z'],[0,'#e8b0be','https://example.com/']]){
 const q=btoa(encodeURIComponent(JSON.stringify([palette,color,url]))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 for(const state of [readSharedState('?q='+q),readSharedState('','#bonsai='+encodeURIComponent('q='+q))]){assert.equal(state.get('url'),url);assert.equal(state.get('blossom'),color);}
}
for(const raw of ['?q=bad','?url=javascript%3Aalert(1)','?url='+encodeURIComponent('https://example.com/'+ 'x'.repeat(601))])assert.equal(readSharedState(raw).has('url'),false);
assert.equal(readSharedState('','#bonsai=%invalid').has('url'),false);
assert.equal(readSharedState('?url='+encodeURIComponent('https://example.com/')).get('url'),'https://example.com/');
console.log('Passed unsafe URL, malformed/oversized share and legacy/new share-link checks.');
