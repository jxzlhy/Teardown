/* =============================================================
   设备工厂：把紧凑的设备声明补全为引擎需要的完整配置
   - 自动生成 labelOffsets / assembledPos 缺省
   - postLoad 工具：anchorInside（把程序化内构件锚定到实机部件包围盒）
   - explode 默认方向（ex 未声明时按部件包围盒相对整机中心外推）
============================================================= */
import * as THREE from 'three';

/** 生成 postLoad：把若干程序化部件锚定到实机部件包围盒内/外的指定位置 */
export function anchorParts(map){
  /* map: { procPartId: { ref: 'realPartId'|'@device', dx,dy,dz } } */
  return ({ partsById })=>{
    for(const [pid, cfg] of Object.entries(map)){
      const p = partsById[pid]; if(!p) continue;
      let c;
      if(cfg.ref === '@device'){
        const fb = new THREE.Box3();
        for(const q of Object.values(partsById)) fb.expandByObject(q.group);
        c = fb.getCenter(new THREE.Vector3());
      } else {
        const ref = partsById[cfg.ref]; if(!ref) continue;
        const bb = new THREE.Box3().setFromObject(ref.group);
        if(bb.isEmpty()) continue;
        c = bb.getCenter(new THREE.Vector3());
      }
      p.base.set(c.x + (cfg.dx||0), c.y + (cfg.dy||0), c.z + (cfg.dz||0));
      p.group.position.copy(p.base);
    }
  };
}

/** 组合多个 postLoad */
export function composePostLoad(...fns){
  return (ctx)=>{ for(const f of fns){ if(f) try{ f(ctx); }catch(e){ console.warn('postLoad part failed', e); } } };
}

/**
 * 设备工厂：
 * spec 里必须给出 id/name/en/category/tagline/description/specs/accent/targetWidth/glb
 * parts: 部件数据数组（含 zh/en/tag/desc/specs + 可选 ex:[x,y,z]）
 * parts 里 real: true 的必须在 realPartIds 声明（GLB 网格归入）
 * 缺省 explode offset：真实部件 [0,1.4,0.6]，程序化按 kind 提示
 */
export function makeDevice(spec){
  const parts = spec.parts.map(pd => ({
    offset: pd.ex || [0, 1.5, 0.8],
    ...pd,
  }));
  const labelOffsets = {};
  for(const pd of parts) labelOffsets[pd.id] = pd.lo || [0, 1.1, 0];
  const assembledPos = {};
  for(const pd of parts) assembledPos[pd.id] = pd.pos || [0, 0, 0];
  /* 未映射网格的落点必须真实存在，否则网格会挂到未注册部件而消失 */
  const ids = new Set(parts.map(pd => pd.id));
  const unmappedTo = spec.unmappedTo
    || ['shell', 'body', 'case', 'frame', 'cabinet', 'chassis', 'housing', 'console'].find(id => ids.has(id))
    || (spec.realPartIds || []).find(id => ids.has(id))
    || parts[0]?.id;
  return {
    draco: false,
    frontAxis: '+z',
    orientationProbe: null,
    unmappedTo,
    mapping: {},
    builders: {},
    tick: null,
    ...spec,
    parts,
    labelOffsets,
    assembledPos,
  };
}

/** 常用分类默认 explode 距离系数 */
export const EX = {
  phone: {
    display:  [0, 0.3, 3.2], 'back-cover': [0, -0.2, -3.2], frame: [0, 0, 2.2],
    camera:   [1.6, 2.6, 1.6], 'camera-island': [1.6, 2.6, 1.6],
    battery:  [-1.4, -2.4, 1.2], mainboard: [0, 2.8, 0.6], subboard: [-1.8, -2.6, 0.8],
    coil:     [0.4, -2.6, -1.2], speaker: [1.8, -2.8, -0.6], taptic: [-2.4, 1.4, 1.2],
    sim:      [-2.6, -1.2, 1.6], logo: [0, -1.6, -2.0], thermal: [0, 3.2, -0.4],
  },
};
