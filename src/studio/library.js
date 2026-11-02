/* 创作工作室 · 本地作品库（V5.0.8 PERSONAL GALLERY 基础切片）
   IndexedDB 存 GLB 二进制 + 元数据：保存/列表/读取/删除/改名/备份导出导入。
   纯浏览器本地持久化——依赖浏览器存储，清理站点数据会丢失作品（UI 如实警示，
   提供全量备份导出/导入作为独立恢复通道）。 */

const DB_NAME = 'gewu-studio';
const DB_VERSION = 1;
const STORE = 'works';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const st = db.createObjectStore(STORE, { keyPath: 'id' });
        st.createIndex('ts', 'ts');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error('IndexedDB 打开失败：' + req.error));
  });
}

const tx = (db, mode) => db.transaction(STORE, mode).objectStore(STORE);

/* 记录主键：非加密用途，但用 UUID 避免任何可预测性歧义（安全扫描口径） */
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : 'w' + Date.now().toString(36) + '-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36));

export async function listWorks() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').getAll();
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.ts - a.ts));
    req.onerror = () => reject(new Error('作品列表读取失败'));
  });
}

/* glbData: ArrayBuffer；meta: { meshes, tris, note }——存档时如实记录导入体检口径 */
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
    /* IDB 里存的是 Blob（结构化克隆）——统一转 ArrayBuffer 再编码 */
    const buf = data.arrayBuffer ? await data.arrayBuffer() : data;
    const u8 = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
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
  const unb64 = (s) => {
    const bin = atob(s);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8.buffer;
  };
  const db = await openDb();
  let n = 0;
  for (const w of data.works) {
    if (!w.glbB64) continue;
    await new Promise((resolve, reject) => {
      const rec = { id: w.id || newId(), name: String(w.name || '恢复作品').slice(0, 60), ts: w.ts || Date.now(), glb: unb64(w.glbB64), meta: w.meta || {} };
      const req = tx(db, 'readwrite').put(rec);
      req.onsuccess = resolve;
      req.onerror = () => reject(new Error('恢复失败：' + w.name));
    });
    n++;
  }
  return n;
}
