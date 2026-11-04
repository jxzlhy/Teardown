/* =============================================================
   GLB 获取层：Cache Storage 持久缓存 + 低优先级预取 + 流式进度
   所有 GLB 均为单文件自包含（纹理内嵌），可整包缓存、直接 parse。
   - prefetchGlb(url)：大厅卡片 hover 预热，二次进入零请求
   - fetchGlb(url, onProgress, signal)：优先命中缓存，未命中流式下载并回填缓存
   - 同一 URL 的并发请求合并为一次网络下载；所有订阅者都被取消时中止请求
============================================================= */
import { assetUrl } from '../lib/url.js';
import { planEviction } from './cache-policy.js';

const CACHE_NAME = 'teardown-glb-v1';
const META_KEY = 'teardown-glb-meta-v1';   // url → { at, size }，用于 LRU 淘汰
const inflight = new Map();   // url → { promise, subs, controller }

function cacheOk(){
  try{ return typeof caches !== 'undefined'; }catch{ return false; }
}

function readMeta(){
  try{
    const obj = JSON.parse(localStorage.getItem(META_KEY) || '{}');
    return obj && typeof obj === 'object' ? obj : {};
  }catch{ return {}; }
}

/* 记录最近使用时间与体积；localStorage 不可用时退化为不限额 */
function remember(url, size){
  try{
    const meta = readMeta();
    const prev = meta[url] || {};
    meta[url] = { at: Date.now(), size: size || prev.size || 0 };
    localStorage.setItem(META_KEY, JSON.stringify(meta));
    return meta;
  }catch{ return null; }
}

async function trimCache(keepUrl){
  if(!cacheOk()) return;
  const meta = readMeta();
  const plan = planEviction(meta, undefined, keepUrl);
  if(!plan.evict.length) return;
  const c = await caches.open(CACHE_NAME);
  for(const url of plan.evict){
    try{ await c.delete(url); }catch{}
    delete meta[url];
  }
  try{ localStorage.setItem(META_KEY, JSON.stringify(meta)); }catch{}
}

async function loadBuffer(url, onProgress, signal, priority){
  if(cacheOk()){
    try{
      const c = await caches.open(CACHE_NAME);
      const hit = await c.match(url);
      if(hit){
        const buf = await hit.arrayBuffer();
        remember(url, buf.byteLength);   // 命中即刷新 LRU 时间
        lastSource = 'cache';
        onProgress && onProgress(buf.byteLength, buf.byteLength);
        return buf;
      }
    }catch{}
  }
  lastSource = 'network';
  const init = { signal };
  if(priority) init.priority = priority;
  const res = await fetch(url, init);
  if(!res.ok) throw new Error('GLB HTTP ' + res.status + ' · ' + url);
  const total = +res.headers.get('content-length') || 0;
  /* 流式读取：边下边报进度，完成后回填 Cache Storage */
  if(res.body && typeof res.body.getReader === 'function' && total){
    const reader = res.body.getReader();
    const chunks = []; let loaded = 0;
    for(;;){
      const { done, value } = await reader.read();
      if(done) break;
      chunks.push(value); loaded += value.length;
      onProgress && onProgress(loaded, total);
    }
    const buf = new Uint8Array(loaded);
    let off = 0; for(const ch of chunks){ buf.set(ch, off); off += ch.length; }
    if(cacheOk()){
      try{
        const c = await caches.open(CACHE_NAME);
        await c.put(url, new Response(buf, { headers: {
          'content-type': res.headers.get('content-type') || 'model/gltf-binary',
          'content-length': String(loaded),
        } }));
        remember(url, loaded);
        await trimCache(url).catch(()=>{});
      }catch{}
    }
    return buf.buffer;
  }
  const buf = await res.arrayBuffer();
  onProgress && onProgress(buf.byteLength, buf.byteLength);
  if(cacheOk()){
    try{
      const c = await caches.open(CACHE_NAME);
      await c.put(url, new Response(buf));
      remember(url, buf.byteLength);
      await trimCache(url).catch(()=>{});
    }catch{}
  }
  return buf;
}

function join(url, onProgress, signal, priority){
  let entry = inflight.get(url);
  if(!entry){
    const subs = new Set();
    if(onProgress) subs.add(onProgress);
    const controller = new AbortController();
    const promise = loadBuffer(url, (loaded, total)=>{
      for(const fn of subs) fn(loaded, total);
    }, controller.signal, priority).finally(()=>inflight.delete(url));
    entry = { promise, subs, controller };
    inflight.set(url, entry);
  }else if(onProgress){
    entry.subs.add(onProgress);
  }
  const done = ()=>{ if(onProgress) entry.subs.delete(onProgress); };
  if(signal){
    if(signal.aborted){ done(); if(!entry.subs.size) entry.controller.abort(); }
    else signal.addEventListener('abort', ()=>{
      done();
      if(!entry.subs.size) entry.controller.abort();   // 无人等待时才真正中止网络
    }, { once: true });
  }
  return entry.promise.finally(done);
}

export async function prefetchGlb(url){
  try{
    await join(assetUrl(url), ()=>{}, null, 'low');
    return true;
  }catch{ return false; }
}

export function fetchGlb(url, onProgress, signal){
  return join(assetUrl(url), onProgress, signal, null);
}

/* 最近一次 loadBuffer 的来源（'cache' | 'network'）——AURORA PHASE 4 装载打点用。
   观测性字段：并发合并/切台竞态下反映的是完成那次装载的实际来源，不作业务判定。 */
let lastSource = 'network';
export function lastFetchSource(){ return lastSource; }
