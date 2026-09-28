const CACHE='neon-mobile-v2.0.0';
const STATIC=['./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});
async function networkFirst(req){
  try{
    const res=await fetch(req,{cache:'no-store'});
    const c=await caches.open(CACHE); c.put(req,res.clone());
    return res;
  }catch(e){
    return (await caches.match(req)) || (await caches.match('./index.html')) || new Response('Offline',{status:503});
  }
}
async function cacheFirst(req){
  const hit=await caches.match(req);
  if(hit) return hit;
  const res=await fetch(req);
  const c=await caches.open(CACHE); c.put(req,res.clone());
  return res;
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin) return;
  if(u.pathname.endsWith('/index.html') || u.pathname.endsWith('/status.json') || u.pathname.endsWith('/version.json') || u.pathname.endsWith('/market-intel.json') || u.pathname.endsWith('/manifest.json') || u.pathname.endsWith('/neon-mobile/')){
    e.respondWith(networkFirst(e.request));
  } else {
    e.respondWith(cacheFirst(e.request));
  }
});
self.addEventListener('message',e=>{
  if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting();
});