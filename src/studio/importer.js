/* 创作工作室 · 导入管线（V5.0.1 MODEL IMPORT）
   File/ArrayBuffer → 守卫（格式/体积/解析/空场景）→ GLTFLoader.parse → 结构报告。
   纯前端本地运行：文件不离开浏览器，不引用任何外部服务。
   报告结构（结构报告 ≠ UI 状态，供 viewer/diagnostics 共用）：
   { root, nodes[], meshes[], materials[], textures, animations[], stats, missingResources[] } */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { assetUrl } from '../lib/url.js';

export const DEFAULT_CAP_MB = 256;

/* 错误码分类（UI 据此给出可读文案，不吞真实原因） */
export const ERR = {
  FORMAT: 'ERR_FORMAT',       // 非 .glb/.gltf
  SIZE: 'ERR_SIZE',           // 超出体积上限
  READ: 'ERR_READ',           // 文件读取失败
  PARSE: 'ERR_PARSE',         // GLB/JSON 结构损坏
  RESOURCES: 'ERR_RESOURCES', // .gltf 外部依赖缺失（bin 无法解析时）
  EMPTY: 'ERR_EMPTY',         // 场景内没有任何网格
  UNKNOWN: 'ERR_UNKNOWN',
};

const GLB_MAGIC = 0x46546c67; // 'glTF'

let _draco = null;

/* 把掉落的文件组转成统一输入：{ name, size, read():Promise<ArrayBuffer> } */
function normalizeInput(files) {
  return [...files].map((f) => {
    if (typeof f.read === 'function') return f;
    return { name: f.name || '未命名', size: f.size ?? 0, read: () => f.arrayBuffer() };
  });
}

async function importFrom(inputs, capMB) {
  const missing = new Set();
  const blobMap = new Map();
  const blobUrls = [];

  /* 体积守卫：读取前先拒，避免把超大文件拉进内存 */
  const cap = capMB * 1024 * 1024;
  for (const f of inputs) {
    if (f.size > cap) {
      throw Object.assign(new Error(`文件「${f.name}」${(f.size / 1048576).toFixed(1)}MB 超过当前上限 ${capMB}MB`), { code: ERR.SIZE });
    }
  }

  const roots = inputs.filter((f) => /\.(glb|gltf)$/i.test(f.name));
  if (!roots.length) {
    throw Object.assign(new Error(`未找到 .glb / .gltf 主文件（共 ${inputs.length} 个文件）`), { code: ERR.FORMAT });
  }
  const root = roots.find((f) => /\.glb$/i.test(f.name)) || roots[0];

  /* 资源表：.gltf 外部 bin/贴图按文件名匹配 blob URL；未命中记录为缺失 */
  const manager = new THREE.LoadingManager();
  for (const f of inputs) {
    const url = URL.createObjectURL(new Blob([await f.read()]));
    blobMap.set(f.name, url);
    blobUrls.push(url);
  }
  manager.setURLModifier((url) => {
    const base = decodeURIComponent(url).split(/[\\/]/).pop();
    if (blobMap.has(base)) return blobMap.get(base);
    if (!/^(data:|blob:)/.test(url)) missing.add(decodeURIComponent(url));
    return url;
  });

  const loader = new GLTFLoader(manager);
  /* 馆内 GLB 资产为 draco 压缩（webp→draco 管线）：解码器路径与主引擎同约定，
     模块级单例复用 worker 池（每次 new 都会新建池，切文件必须复用） */
  if (!_draco) {
    _draco = new DRACOLoader();
    _draco.setDecoderPath(import.meta.env.DEV
      ? '/node_modules/three/examples/jsm/libs/draco/'
      : assetUrl('/assets/draco/'));
  }
  loader.setDRACOLoader(_draco);
  let data = await root.read().catch((e) => { throw Object.assign(new Error(`读取「${root.name}」失败：${e}`), { code: ERR.READ }); });

  if (/\.gltf$/i.test(root.name)) {
    const text = new TextDecoder().decode(data);
    try { JSON.parse(text); } catch (e) {
      throw Object.assign(new Error(`「${root.name}」不是合法 JSON：${String(e.message || e).slice(0, 120)}`), { code: ERR.PARSE });
    }
    data = text;
  } else {
    if (data.byteLength < 12 || new DataView(data).getUint32(0, true) !== GLB_MAGIC) {
      throw Object.assign(new Error(`「${root.name}」不是合法 GLB（文件头不符，可能已损坏或被改名）`), { code: ERR.PARSE });
    }
  }

  let gltf;
  try {
    gltf = await new Promise((resolve, reject) => loader.parse(data, '', resolve, reject));
  } catch (e) {
    const msg = String(e && e.message || e);
    /* 走到这里时格式/魔数/JSON 合法性已过：parse 拒绝即结构解析失败（ERR_PARSE），
       仅当资源缺失证据存在时才归因为 ERR_RESOURCES */
    if (missing.size) {
      throw Object.assign(new Error(`解析失败，疑似缺少外部资源：${[...missing].slice(0, 3).join('、')}`), { code: ERR.RESOURCES, cause: msg.slice(0, 200) });
    }
    throw Object.assign(new Error(msg), { code: ERR.PARSE });
  }

  const report = buildReport(gltf, root, missing);
  if (!report.meshes.length) {
    throw Object.assign(new Error(`「${root.name}」解析成功，但场景中没有任何网格（可能是纯灯光/相机/空场景文件）`), { code: ERR.EMPTY });
  }
  report.missingResources = [...missing].filter((u) => !blobMap.has(u.split(/[\\/]/).pop()));
  for (const u of blobUrls) URL.revokeObjectURL(u);
  return report;
}

function buildReport(gltf, rootFile, missing) {
  const scene = gltf.scene || gltf.scenes[0];
  const nodes = [];
  const meshes = [];
  const matMap = new Map();
  const nodesByPath = new Map();
  let vertTotal = 0, triTotal = 0, meshCount = 0;

  scene.updateMatrixWorld(true);

  const walk = (obj, depth, path) => {
    const isMesh = obj.isMesh;
    const row = {
      id: nodes.length, name: obj.name || '', depth, isMesh,
      type: obj.type, path,
      childCount: obj.children.length,
    };
    nodes.push(row);
    nodesByPath.set(path, obj);

    if (isMesh) {
      meshCount++;
      const geo = obj.geometry;
      const prims = 1;
      const verts = geo && geo.attributes.position ? geo.attributes.position.count : 0;
      const tris = geo ? (geo.index ? geo.index.count / 3 : (verts / 3)) : 0;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      vertTotal += verts; triTotal += Math.round(tris);
      const entry = {
        name: obj.name || '(未命名网格)', path, ref: obj,
        verts, tris: Math.round(tris), prims,
        hasNormals: !!(geo && geo.attributes.normal),
        materials: mats.map((m) => registerMaterial(m, matMap)),
      };
      meshes.push(entry);
      obj.userData.__studioPath = path;
    }
    obj.children.forEach((c, i) => walk(c, depth + 1, `${path}/${i}:${c.name || c.type}`));
  };
  walk(scene, 0, 'scene');

  const materials = [...matMap.values()];
  const texCount = materials.reduce((n, m) => n + m.textureCount, 0);

  const stats = {
    file: rootFile.name, fileSize: rootFile.size,
    nodeCount: nodes.length, meshCount, vertTotal, triTotal,
    materialCount: materials.length, textureCount: texCount,
    animationCount: (gltf.animations || []).length,
  };

  /* 尺寸：模型原始单位（不缩放不重定位——工作台如实呈现导入状态） */
  const bbox = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3(), center = new THREE.Vector3();
  if (isFinite(bbox.min.x)) { bbox.getSize(size); bbox.getCenter(center); }
  stats.bbox = {
    ok: isFinite(bbox.min.x),
    size: size.toArray().map((n) => +n.toFixed(4)),
    center: center.toArray().map((n) => +n.toFixed(4)),
  };

  const animations = (gltf.animations || []).map((c) => ({
    name: c.name || '(未命名)', duration: +c.duration.toFixed(2), tracks: c.tracks.length, ref: c,
  }));

  return { root: scene, nodes, nodesByPath, meshes, materials, animations, stats, missingResources: [] };
}

function registerMaterial(m, matMap) {
  if (!m) return { name: '(无材质)', type: '—', textureCount: 0, transparent: false, ref: null };
  if (matMap.has(m.uuid)) return matMap.get(m.uuid);
  let texN = 0;
  for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap']) if (m[k]) texN++;
  const row = { name: m.name || '(未命名材质)', type: m.type, textureCount: texN, transparent: !!m.transparent, ref: m };
  matMap.set(m.uuid, row);
  return row;
}

export { importFrom, normalizeInput };
