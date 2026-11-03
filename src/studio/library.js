/* 创作工作室 · 本地作品库（V5.0.8 PERSONAL GALLERY 基础切片）
   IndexedDB 存 GLB 二进制 + 元数据：保存/列表/读取/删除/改名/备份导出导入。
   纯浏览器本地持久化——依赖浏览器存储，清理站点数据会丢失作品（UI 如实警示，
   提供全量备份导出/导入作为独立恢复通道）。
   审计 RS-14 三项整改：
   ① 连接治理——整页复用一个连接（旧实现每次操作新开且永不 close），
     onversionchange（他处升级/删库）主动关闭复位，onblocked 如实拒绝；
   ② 恢复原子化——单事务整体提交，同 id 已存在的作品跳过（旧实现逐条 put，
     中途失败留半套，且可被备份文件里的任意 id 覆盖既有作品）；
   ③ base64 分块编解码——块长对齐（编码块长为 3 的倍数 / 解码块长为 4 的倍数），
     不再为 btoa/atob 生成整包二进制串（大作品库导出曾是堆尖峰）。 */

const DB_NAME = 'gewu-studio';
const DB_VERSION = 1;
const STORE = 'works';

let _db = null;

function openDb() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const st = db.createObjectStore(STORE, { keyPath: 'id' });
        st.createIndex('ts', 'ts');
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => {
        try { db.close(); } catch { /* 已关闭则忽略 */ }
        if (_db === db) _db = null;
      };
      _db = db;
      resolve(db);
    };
    req.onerror = () => reject(new Error('IndexedDB 打开失败：' + req.error));
    req.onblocked = () => reject(new Error('IndexedDB 被其他标签页占用（可能开着旧版页面），关闭后重试'));
  });
}

const tx = (db, mode) => db.transaction(STORE, mode).objectStore(STORE);

/* 记录主键：非加密用途，但用 UUID 避免任何可预测性歧义（安全扫描口径） */
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : 'w' + Date.now().toString(36) + '-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36));

/* 备份文件带来的 id 只接受安全字符集，其余一律换发新 id（防注入怪键） */
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

export async function listWorks() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.ts - a.ts));
    req.onerror = () => reject(new Error('作品列表读取失败'));
  });
}

/* glbData: Blob/ArrayBuffer；meta: { meshes, tris, note }——存档时如实记录导入体检口径 */
export async function saveWork({ id, name, glbData, meta }) {
  const bytes = glbData && (glbData.size ?? glbData.byteLength);
  if (!bytes) throw new Error('没有可保存的模型数据');
  const db = await openDb();
  const rec = {
    id: id || newId(),
    name: String(name || '未命名作品').slice(0, 60),
    ts: Date.now(),
    glb: glbData,                      // 保存**当前编辑后**的场景导出（与导出 GLB 同源）
    meta: meta || {},
  };
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').put(rec);
    req.onsuccess = () => resolve({ id: rec.id, name: rec.name, ts: rec.ts });
    req.onerror = () => reject(new Error(req.error && /quota/i.test(String(req.error)) ? '浏览器存储空间不足（配额超限），作品未保存' : '作品保存失败：' + req.error));
  });
}

export async function getWork(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(new Error('作品读取失败'));
  });
}

export async function renameWork(id, name) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const st = tx(db, 'readwrite');
    const req = st.get(id);
    req.onsuccess = () => {
      const rec = req.result;
      if (!rec) { reject(new Error('作品不存在')); return; }
      rec.name = String(name || rec.name).slice(0, 60);
      const put = st.put(rec);
      put.onsuccess = () => resolve(rec.name);
      put.onerror = () => reject(new Error('改名失败'));
    };
    req.onerror = () => reject(new Error('作品读取失败'));
  });
}

export async function deleteWork(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(new Error('删除失败'));
  });
}

/* —— 备份：全部作品 → 单 JSON（base64 二进制段）—— */
export async function exportBackup() {
  const works = await listWorks();
  const b64 = async (data) => {
    /* IDB 里存的是 Blob（结构化克隆）——统一转 ArrayBuffer 再分块编码（RS-14③） */
    const buf = data.arrayBuffer ? await data.arrayBuffer() : data;
    return u8ToB64(new Uint8Array(buf));
  };
  const out = [];
  for (const w of works) {
    out.push({ id: w.id, name: w.name, ts: w.ts, meta: w.meta, glbB64: await b64(w.glb) });
  }
  return {
    fmt: 'gewu-studio-backup/1',
    exportedAt: new Date().toISOString(),
    works: out,
  };
}

export async function importBackup(data) {
  if (!data || data.fmt !== 'gewu-studio-backup/1' || !Array.isArray(data.works)) {
    throw new Error('不是有效的格物馆作品库备份文件');
  }
  const db = await openDb();

  /* 既有 id 集合：同 id 已存在的**跳过**而非覆盖（RS-14②）——
     旧实现会被备份文件里的任意 id 静默覆盖用户现有作品 */
  const existing = new Set(await new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').getAllKeys();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(new Error('读取既有作品清单失败'));
  }));

  const recs = [];
  const usedInBatch = new Set();
  let skipped = 0;
  for (const w of data.works) {
    if (!w.glbB64) continue;
    /* 同 id 已存在（无论库里还是本批次前文）：跳过而非覆盖 */
    if (typeof w.id === 'string' && (existing.has(w.id) || usedInBatch.has(w.id))) { skipped++; continue; }
    const id = (typeof w.id === 'string' && SAFE_ID.test(w.id)) ? w.id : newId();
    usedInBatch.add(id);
    recs.push({
      id,
      name: String(w.name || '恢复作品').slice(0, 60),
      ts: Number.isFinite(w.ts) ? w.ts : Date.now(),
      glb: b64ToBlob(w.glbB64),
      meta: w.meta && typeof w.meta === 'object' ? w.meta : {},
    });
  }
  if (!recs.length) return { restored: 0, skipped };

  /* 单事务整体提交：任何一条失败即整体回滚，不留半套恢复结果 */
  return new Promise((resolve, reject) => {
    const st = tx(db, 'readwrite');
    for (const rec of recs) st.put(rec);
    st.transaction.oncomplete = () => resolve({ restored: recs.length, skipped });
    st.transaction.onabort = () => reject(new Error('恢复已整体回滚：' + (st.transaction.error && st.transaction.error.message || '写入失败')));
    st.transaction.onerror = () => reject(new Error('恢复已整体回滚：' + (st.transaction.error && st.transaction.error.message || '写入失败')));
  });
}

/* —— base64 分块编解码（RS-14③） ——
   编码块长 32766 = 3×10922：整除 3 的块各自 btoa 后可直接拼接（无中间 padding），
   不再生成与原文件等大的二进制串；解码块长 32768 = 4 的倍数：
   合法 base64 的 padding 只出现在末尾，按 4 对齐切块后逐块 atob 恒安全，
   解码产物直接并入 Blob（loadWork 走 arrayBuffer()，Blob 与旧 ArrayBuffer 记录兼容）。 */
const ENC_CHUNK = 32766;   // 3 的倍数
const DEC_CHUNK = 32768;   // 4 的倍数

function u8ToB64(u8) {
  let out = '';
  for (let i = 0; i < u8.length; i += ENC_CHUNK) {
    out += btoa(String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + ENC_CHUNK, u8.length))));
  }
  return out;
}

function b64ToBlob(s) {
  const parts = [];
  for (let i = 0; i < s.length; i += DEC_CHUNK) {
    const bin = atob(s.slice(i, i + DEC_CHUNK));
    const u8 = new Uint8Array(bin.length);
    for (let j = 0; j < bin.length; j++) u8[j] = bin.charCodeAt(j);
    parts.push(u8);
  }
  return new Blob(parts, { type: 'model/gltf-binary' });
}
