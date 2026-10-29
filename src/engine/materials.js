/* 设备无关的材质工厂与几何辅助（从 1.0 移植） */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function makeTex(w, h, draw){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* 圆角矩形轮廓（Shape） */
export function roundedRectShape(w, h, r, cx = 0, cy = 0){
  const s = new THREE.Shape();
  const x = cx - w/2, y = cy - h/2;
  s.moveTo(x+r, y);
  s.lineTo(x+w-r, y); s.absarc(x+w-r, y+r, r, -Math.PI/2, 0, false);
  s.lineTo(x+w, y+h-r); s.absarc(x+w-r, y+h-r, r, 0, Math.PI/2, false);
  s.lineTo(x+r, y+h); s.absarc(x+r, y+h-r, r, Math.PI/2, Math.PI, false);
  s.lineTo(x, y+r); s.absarc(x+r, y+r, r, Math.PI, Math.PI*1.5, false);
  return s;
}

export function box(w, h, d, r = 0.08){
  return r > 0 ? new RoundedBoxGeometry(w, h, d, 4, Math.min(r, Math.min(w,h,d)/2*0.99)) : new THREE.BoxGeometry(w, h, d);
}

export function addMesh(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0){
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  parent.add(m); return m;
}

export const matShell      = () => new THREE.MeshPhysicalMaterial({ color:0x363b42, metalness:0.9, roughness:0.38, clearcoat:0.55, clearcoatRoughness:0.3, envMapIntensity:0.9 });
export const matDark       = () => new THREE.MeshPhysicalMaterial({ color:0x14171c, metalness:0.82, roughness:0.48, envMapIntensity:0.6 });
export const matSilver     = () => new THREE.MeshPhysicalMaterial({ color:0xc3cad2, metalness:1, roughness:0.28, envMapIntensity:1.1 });
export const matRed        = () => new THREE.MeshPhysicalMaterial({ color:0xd8382c, metalness:0.35, roughness:0.42, envMapIntensity:0.7 });
export const matRubber     = () => new THREE.MeshStandardMaterial({ color:0x23262c, metalness:0.12, roughness:0.78 });
export const matGlass      = () => new THREE.MeshPhysicalMaterial({ color:0xdceeff, metalness:0, roughness:0.05, transmission:0.94, ior:1.5, thickness:0.35, clearcoat:1, clearcoatRoughness:0.06, envMapIntensity:0.7 });
export const matLensCoat   = () => new THREE.MeshPhysicalMaterial({ color:0x7fa8e8, metalness:0, roughness:0.08, transmission:0.75, ior:1.62, thickness:0.9, envMapIntensity:0.85 });
export const matBlackGloss = () => new THREE.MeshPhysicalMaterial({ color:0x07090d, metalness:0.25, roughness:0.14, clearcoat:1, clearcoatRoughness:0.08, envMapIntensity:1.0 });
export const matGold       = () => new THREE.MeshPhysicalMaterial({ color:0xd8b45f, metalness:1, roughness:0.3, envMapIntensity:1.1 });

/* 屏幕：黑底 + 自发光 UI 贴图 */
export function matScreen(tex){
  return new THREE.MeshStandardMaterial({ color:0x0a0f14, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:0.95, roughness:0.25, metalness:0.1 });
}
