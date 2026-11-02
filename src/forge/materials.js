/* 机械锻造所 · 材质体系（V3.0 任务书 §4.3：有限、统一、可复用；每次调用返回新实例——
   引擎按部件收集 emissive 材质做选中高亮，共享实例会跨部件连带发光，故 forge 材质一律逐件新建） */

import * as THREE from 'three';

const std = (opts) => new THREE.MeshStandardMaterial(opts);

export const FORGE_MATS = {
  /* 铸造灰铁：缸体 / 壳体 */
  castIron: (tint = 0) => std({ color: new THREE.Color(0x4a4f55).offsetHSL(0, 0, tint), metalness: .35, roughness: .62 }),
  /* 铸铝：歧管 / 盖罩（metalness 收敛防夜景 bloom 过曝） */
  castAlu: (tint = 0) => std({ color: new THREE.Color(0xa9b0b6).offsetHSL(0, 0, tint), metalness: .55, roughness: .52 }),
  /* 锻钢：曲轴 / 连杆 */
  forgedSteel: () => std({ color: 0x8d969e, metalness: .82, roughness: .4 }),
  /* 精加工钢：轴颈 / 缸套内壁（粗糙度提高防镜面热斑） */
  machinedSteel: () => std({ color: 0xb9c1c8, metalness: .85, roughness: .32 }),
  /* 镀铬：外露杆件 */
  chrome: () => std({ color: 0xdfe6ea, metalness: 1, roughness: .12 }),
  /* 橡胶：减振垫 / 密封 */
  rubber: () => std({ color: 0x22262a, metalness: 0, roughness: .92 }),
  /* 工程塑料 */
  plastic: (color = 0x2e3338) => std({ color, metalness: .05, roughness: .55 }),
  /* 陶瓷（火花塞） */
  ceramic: () => std({ color: 0xe8e4da, metalness: 0, roughness: .3 }),
  /* 涂装表面（随设备 accent 换肤，禁止大面积发光） */
  paint: (color) => std({ color, metalness: .3, roughness: .42 }),
  /* 铜 / 黄铜：轴瓦 / 接头 */
  brass: () => std({ color: 0xb08d57, metalness: .9, roughness: .38 }),
};
