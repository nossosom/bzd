const C='bzd-v9',SH='bzd-share';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','agenda.html','../manifest.webmanifest','icon-192.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==SH).map(x=>caches.delete(x)))));self.clients.claim()});
async function inflate(u8,m){if(m===0)return new TextDecoder().decode(u8);return await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text()}
async function unzip(buf){const dv=new DataView(buf),u=new Uint8Array(buf);let e=buf.byteLength-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)return '';
  const n=dv.getUint16(e+10,true);let o=dv.getUint32(e+16,true),out=[];
  for(let i=0;i<n;i++){if(dv.getUint32(o,true)!==0x02014b50)break;const m=dv.getUint16(o+10,true),cs=dv.getUint32(o+20,true),nl=dv.getUint16(o+28,true),xl=dv.getUint16(o+30,true),cl=dv.getUint16(o+32,true),lo=dv.getUint32(o+42,true);
    const name=new TextDecoder().decode(u.subarray(o+46,o+46+nl));o+=46+nl+xl+cl;
    if(/\.txt$/i.test(name)){const st=lo+30+dv.getUint16(lo+26,true)+dv.getUint16(lo+28,true);out.push(await inflate(u.subarray(st,st+cs),m))}}
  return out.join('\n')}
async function compartilhar(req){let t=[];try{const f=await req.formData();['title','text','url'].forEach(k=>{const v=f.get(k);if(v)t.push(v)});
  for(const a of f.getAll('arq')){if(!a||!a.size)continue;const b=await a.arrayBuffer(),h=new Uint8Array(b,0,4);
    if(h[0]===0x50&&h[1]===0x4b)t.push(await unzip(b));else t.push(new TextDecoder().decode(b))}}catch(e){t.push('')}
  const c=await caches.open(SH);await c.put('share.txt',new Response(t.join('\n')));return Response.redirect('agenda.html?shared=1',303)}
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(/^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const cp=x.clone();caches.open(C).then(c=>c.put(e.request,cp));return x})));return}if(u.origin!==location.origin)return;
  if(e.request.method==='POST'&&u.pathname.endsWith('/compartilhar')){e.respondWith(compartilhar(e.request));return}
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
