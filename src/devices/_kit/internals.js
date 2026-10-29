/* =============================================================
   拆解内构件工具库（参数化程序化部件 + 参数化贴图）
   供各设备配置复用：传入尺寸/文字/配色，产出统一质感的部件 Group。
============================================================= */
import * as THREE from 'three';
import {
  makeTex, box, addMesh,
  matDark, matSilver, matGold, matBlackGloss, matGlass
} from '../../engine/materials.js';

const ZH_FONT = '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
/* float64 安全的 Lehmer LCG：s*48271 < 2^53，不会像 Math.imul 一样溢出为负 */
const rnd = (s => () => (s = (s * 48271) % 2147483647) / 2147483647)(987654321);

/* ================= 参数化贴图 ================= */

/** PCB 电路板贴图：label 主丝印 / sub 副丝印 / hue 板色 */
export function pcbTex(label, sub, color = '#0a3021'){
  return makeTex(512, 512, (g)=>{
    g.fillStyle = color; g.fillRect(0,0,512,512);
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2;
    for(let i=0;i<26;i++){
      let x = rnd()*512, y = rnd()*512;
      g.beginPath(); g.moveTo(x,y);
      for(let j=0;j<3;j++){
        if(rnd()>.5) x = Math.min(512, Math.max(0, x+(rnd()-.5)*220));
        else y = Math.min(512, Math.max(0, y+(rnd()-.5)*220));
        g.lineTo(x,y);
      }
      g.stroke();
      g.fillStyle = 'rgba(201,163,74,.8)'; g.fillRect(x-3,y-3,7,7);
    }
    for(let i=0;i<40;i++){
      g.fillStyle = `rgba(200,215,230,${.12+rnd()*.1})`;
      g.beginPath(); g.arc(rnd()*512, rnd()*512, 3+rnd()*5, 0, Math.PI*2); g.fill();
    }
    g.fillStyle = 'rgba(225,238,248,.78)'; g.font = '600 20px '+ZH_FONT;
    g.fillText(label, 18, 34);
    if(sub){ g.font = '500 14px '+ZH_FONT; g.fillStyle = 'rgba(225,238,248,.42)'; g.fillText(sub, 18, 496); }
  });
}

/** 电池标签贴图 */
export function batteryLabelTex({ brand='LI-ION', capacity='4000 mAh', model='B-BAT-01', rating='3.85V' }){
  return makeTex(512, 384, (g)=>{
    g.fillStyle = '#16181d'; g.fillRect(0,0,512,384);
    g.fillStyle = '#21252d'; g.fillRect(0,0,512,84);
    for(let i=-3;i<16;i++){ g.fillStyle = i%2 ? '#d9b23c' : '#16181d'; g.save(); g.translate(i*36,0); g.transform(1,0,.5,1,0,0); g.fillRect(0,0,18,14); g.restore(); }
    g.fillStyle = '#eef4fa'; g.font = '800 96px '+ZH_FONT; g.fillText(capacity.replace(' mAh',''), 36, 196);
    g.font = '600 38px '+ZH_FONT; g.fillStyle = '#8fa2b6'; g.fillText('mAh', 60 + capacity.replace(' mAh','').length*52, 196);
    g.font = '500 24px '+ZH_FONT; g.fillStyle = '#6c7d90'; g.fillText('Li-ion 充电电池 · 典型值', 36, 250);
    g.fillStyle = '#45e0ff'; g.font = '600 22px '+ZH_FONT; g.fillText(brand, 36, 316);
    g.fillStyle = '#e8edf2'; g.fillRect(320, 264, 140, 70);
    g.fillStyle = '#101216';
    let x = 330;
    while(x < 446){ const w = 2+Math.random()*5; g.fillRect(x, 272, w, 46); x += w+2+Math.random()*5; }
    g.font = '500 12px '+ZH_FONT; g.fillStyle = '#30343c'; g.fillText(model, 334, 348);
    g.strokeStyle = 'rgba(140,160,180,.5)'; g.lineWidth = 3;
    g.strokeRect(368, 116, 96, 54);
    g.font = '500 17px '+ZH_FONT; g.fillStyle = '#8fa2b6'; g.fillText('⏻ '+rating, 376, 149);
  });
}

/** 无线充电线圈贴图 */
export function coilTex(){
  return makeTex(256, 256, (g)=>{
    g.clearRect(0,0,256,256);
    g.strokeStyle = '#c98a3e'; g.lineWidth = 5;
    for(let r=14; r<120; r+=10){
      g.globalAlpha = .55 + (r%20===4?.3:0);
      g.beginPath(); g.arc(128,128,r,0,Math.PI*2); g.stroke();
    }
    g.globalAlpha = 1;
  });
}

/** 扬声器开孔贴图 */
export function speakerTex(){
  return makeTex(192, 96, (g)=>{
    g.clearRect(0,0,192,96);
    g.fillStyle = 'rgba(2,4,7,.95)';
    for(let r=0;r<3;r++) for(let c=0;c<8;c++){ g.beginPath(); g.arc(16+c*23, 16+r*32, 6, 0, Math.PI*2); g.fill(); }
  });
}

/** 石墨烯/铜箔散热贴图 */
export function thermalTex(base = '#a86030'){
  return makeTex(256, 256, (g)=>{
    g.fillStyle = base; g.fillRect(0,0,256,256);
    for(let i=0;i<70;i++){
      g.strokeStyle = `rgba(240,170,110,${.04+Math.random()*.1})`;
      g.lineWidth = 1+Math.random()*2;
      const y = Math.random()*256;
      g.beginPath(); g.moveTo(0,y); g.lineTo(256, y+(Math.random()-.5)*8); g.stroke();
    }
  });
}

/* ================= 参数化部件构建器 ================= */
const pcbTexCache = new Map();
function getTex(key, fn){ if(!pcbTexCache.has(key)) pcbTexCache.set(key, fn()); return pcbTexCache.get(key); }

/** 电池 */
export function battery(g, { w=4, h=3, d=0.5, label, capacity='4000 mAh', model, rating='3.85V' }){
  addMesh(g, box(w, h, d, 0.06), new THREE.MeshPhysicalMaterial({ color:0x24262b, metalness:.55, roughness:.5, clearcoat:.3 }));
  const tex = getTex('bat:'+capacity+model, ()=>batteryLabelTex({ brand: label||'LI-ION', capacity, model, rating }));
  addMesh(g, new THREE.PlaneGeometry(w*.86, h*.86), new THREE.MeshStandardMaterial({ map:tex, roughness:.55, metalness:.08 }), 0, 0, d/2+.002);
  for(let i=-1;i<=1;i++) addMesh(g, box(.14,.3,.08,.02), matGold(), i*w*.3, h/2-.12, d/2-.04);
}

/** 主板：pcb 底板 + SoC 屏蔽罩 + 存储 + PMIC + 排线座 */
export function mainboard(g, { w=5.4, h=3.4, soc=[-1.2,.7], ram=[.9,.8], label='MAIN BOARD', sub='', pcb='#0a3021', smalls=14 }){
  const tex = getTex('pcb:'+label, ()=>pcbTex(label, sub, pcb));
  const mat = new THREE.MeshStandardMaterial({ map:tex, metalness:.45, roughness:.6 });
  addMesh(g, box(w, h, .14, .03), mat);
  addMesh(g, box(w*.32, h*.32, .22, .04), matSilver(), soc[0], soc[1], .14);
  addMesh(g, box(w*.26, h*.26, .16, .04), matBlackGloss(), ram[0], ram[1], .12);
  addMesh(g, box(w*.22, h*.16, .14, .03), matBlackGloss(), -soc[0]*.5, -h*.28, .11);
  for(let i=0;i<smalls;i++){
    const cols = [0xc9a34a, 0x8f98a3, 0x22262d];
    addMesh(g, box(.12+rnd()*.14, .08+rnd()*.1, .07, .012),
      new THREE.MeshStandardMaterial({ color:cols[i%3], metalness:.7, roughness:.4 }),
      (rnd()-.5)*w*.86, (rnd()-.5)*h*.86, .1);
  }
  for(const [x,y] of [[-w*.45,-h*.42],[w*.45,-h*.42],[-w*.45,h*.42],[w*.45,h*.42]])
    addMesh(g, new THREE.CylinderGeometry(.09,.09,.05,14), matSilver(), x, y, .08);
}

/** 金属屏蔽罩 */
export function shield(g, w=4.6, h=2.8, d=.16){
  addMesh(g, box(w, h, d, .05), new THREE.MeshStandardMaterial({ color:0xb9c2cc, metalness:.95, roughness:.32 }));
  for(let i=0;i<5;i++) addMesh(g, box(w*.9, .03, .02, 0), matSilver(), 0, -h*.35+i*h*.18, d/2+.002);
}

/** 散热模块：均热板 + 热管 + 翅片 */
export function thermal(g, w=5, h=3, pipes=2){
  const tex = getTex('thermal', ()=>thermalTex());
  const mat = new THREE.MeshStandardMaterial({ map:tex, metalness:.95, roughness:.36, envMapIntensity:.9 });
  addMesh(g, box(w, h, .1, .04), mat);
  for(let i=0;i<pipes;i++)
    addMesh(g, new THREE.TorusGeometry(h*.42, .09, 10, 48), mat, -w*.22+i*w*.45, 0, .1).scale.set(1, 1.6, .5);
  for(let i=0;i<8;i++) addMesh(g, box(w*.92, .05, .34, .01), mat, 0, -h*.4+i*h*.115, .2);
}

/** 轴流风扇：外框 + 转子 */
export function fan(g, r=1.6, d=.5){
  addMesh(g, new THREE.CylinderGeometry(r, r, d, 40), new THREE.MeshStandardMaterial({ color:0x1c1f26, metalness:.4, roughness:.6 }), 0,0,0, Math.PI/2);
  const rotor = new THREE.Group();
  addMesh(rotor, new THREE.CylinderGeometry(r*.16, r*.16, d*1.1, 24), matDark(), 0,0,0, Math.PI/2);
  for(let i=0;i<11;i++){
    const blade = addMesh(rotor, box(r*.72, r*.34, .04, .015), new THREE.MeshPhysicalMaterial({ color:0x2a2f38, metalness:.5, roughness:.42, side:THREE.DoubleSide }),
      0,0,0);
    blade.rotation.z = i/11*Math.PI*2;
    blade.rotation.x = Math.PI/2.6;
    blade.position.set(Math.cos(i/11*Math.PI*2)*r*.42, Math.sin(i/11*Math.PI*2)*r*.42, 0);
    blade.rotateOnAxis(new THREE.Vector3(0,1,0), .5);
  }
  rotor.position.z = d*.18;
  g.add(rotor);
  addMesh(g, new THREE.TorusGeometry(r*.98, .05, 10, 48), matSilver(), 0,0,d*.4);
  return rotor;
}

/** 扬声器单元 */
export function speakerBox(g, w=1.6, h=1.2, d=.5){
  addMesh(g, box(w, h, d, .05), matDark());
  const tex = getTex('spk', speakerTex);
  addMesh(g, new THREE.PlaneGeometry(w*.8, h*.8), new THREE.MeshBasicMaterial({ map:tex, transparent:true }), 0,0,d/2+.003);
  addMesh(g, new THREE.CylinderGeometry(Math.min(w,h)*.3, Math.min(w,h)*.3, .1, 24), matSilver(), 0,0,d*.2, Math.PI/2);
}

/** 后置摄像头模组：多层镜筒 + 传感器 */
export function cameraModule(g, r=.9, h=.9, ring=true){
  addMesh(g, box(r*2.3, r*2.3, .12, .04), new THREE.MeshStandardMaterial({ color:0x10151c, metalness:.5, roughness:.5 }));
  addMesh(g, new THREE.CylinderGeometry(r*.94, r*1.02, h*.7, 36), matDark(), 0,0,h*.3, Math.PI/2);
  if(ring) addMesh(g, new THREE.TorusGeometry(r*.96, .05, 10, 40), matSilver(), 0,0,h*.62);
  addMesh(g, new THREE.CylinderGeometry(r*.8, r*.86, h*.3, 36), new THREE.MeshPhysicalMaterial({ color:0x0b1220, metalness:.2, roughness:.15, clearcoat:1 }), 0,0,h*.75, Math.PI/2);
  addMesh(g, new THREE.CylinderGeometry(r*.3, r*.3, .04, 24), new THREE.MeshBasicMaterial({ color:0x04070c }), 0,0,h*.9, Math.PI/2);
}

/** 无线充电线圈 */
export function chargeCoil(g, r=1.5){
  const tex = getTex('coil', coilTex);
  addMesh(g, new THREE.CylinderGeometry(r, r, .06, 40), new THREE.MeshStandardMaterial({ map:tex, color:0xb98a4e, metalness:.8, roughness:.45 }), 0,0,0, Math.PI/2);
  addMesh(g, box(r*1.7, r*1.7, .04, .02), new THREE.MeshStandardMaterial({ color:0x35393f, metalness:.4, roughness:.7 }), 0,0,-.05);
}

/** 振动马达（LRA） */
export function taptic(g, w=1.4, h=.9, d=.35){
  addMesh(g, box(w, h, d, .05), new THREE.MeshStandardMaterial({ color:0x2e333b, metalness:.7, roughness:.4 }));
  addMesh(g, box(w*.7, h*.3, .04, .015), matSilver(), 0, h*.2, d/2+.002);
  addMesh(g, box(.3,.24,.06,.02), matGold(), w*.32, -h*.24, d/2);
}

/** FPC 排线 */
export function flex(g, w=2.6, h=.5, bend=0){
  const mat = new THREE.MeshStandardMaterial({ color:0xc88a3a, metalness:.55, roughness:.5 });
  if(!bend){
    addMesh(g, box(w, h, .04, .015), mat);
  } else {
    const shape = new THREE.Shape();
    shape.moveTo(-w/2, 0); shape.lineTo(w/2, 0);
    shape.lineTo(w/2, .1); shape.lineTo(-w/2+bend, .1+h);
    shape.lineTo(-w/2+bend-.12, .1+h); shape.lineTo(-w/2-.1, .1); shape.lineTo(-w/2, 0);
    addMesh(g, new THREE.ExtrudeGeometry(shape, { depth:.035, bevelEnabled:false }), mat);
  }
}

/** 无线耳机动圈单元 */
export function driver(g, r=1.1){
  addMesh(g, new THREE.CylinderGeometry(r, r, .16, 36), new THREE.MeshStandardMaterial({ color:0x30353d, metalness:.7, roughness:.4 }), 0,0,0, Math.PI/2);
  addMesh(g, new THREE.TorusGeometry(r*.8, .1, 10, 36), matGold(), 0,0,.08);
  addMesh(g, new THREE.SphereGeometry(r*.7, 24, 16), new THREE.MeshPhysicalMaterial({ color:0x14171c, metalness:.3, roughness:.3 }), 0,0,.05).scale.z = .4;
  addMesh(g, new THREE.CylinderGeometry(r*.98, r*.9, .08, 36), new THREE.MeshPhysicalMaterial({ color:0x0d1116, roughness:.85 }), 0,0,-.1, Math.PI/2);
}

/** 屏幕面板层（黑玻璃 + 可选自发光贴图） */
export function displayPanel(g, w, h, d=.12, tex){
  addMesh(g, box(w, h, d, .03), matBlackGloss());
  if(tex) addMesh(g, new THREE.PlaneGeometry(w*.96, h*.96), new THREE.MeshStandardMaterial({ color:0x0a0f14, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:.9, roughness:.25 }), 0,0,d/2+.002);
  addMesh(g, box(w*.4, .18, .02, .008), matGold(), w*.28, -h*.42, d/2);
}

/** SIM 卡托 */
export function simTray(g, w=1.1, h=.4){
  addMesh(g, box(w, h, .18, .04), matSilver());
  addMesh(g, new THREE.CylinderGeometry(.05,.05,.2,10), matSilver(), w*.36, 0, 0, 0,0,Math.PI/2);
  addMesh(g, box(w*.5, .05, .02, 0), new THREE.MeshStandardMaterial({ color:0x5c646e, metalness:.8, roughness:.4 }), 0, h*.28, .09);
}

/** USB-C 端口小板 */
export function portPcb(g, w=1.6, h=1.1){
  const tex = getTex('pcb:port', ()=>pcbTex('USB-C FPC', 'TYPE-C 2.0'));
  addMesh(g, box(w, h, .1, .02), new THREE.MeshStandardMaterial({ map:tex, metalness:.45, roughness:.6 }));
  addMesh(g, box(w*.7, h*.4, .12, .03), matSilver(), 0, 0, .1);
}

/** 石墨贴片 */
export function graphite(g, w, h){
  addMesh(g, box(w, h, .03, .01), new THREE.MeshStandardMaterial({ color:0x3a3f46, metalness:.85, roughness:.55, side:THREE.DoubleSide }));
}

/** 螺丝组（装饰用小件） */
export function screws(g, pts, r=.06){
  for(const [x,y,z] of pts) addMesh(g, new THREE.CylinderGeometry(r, r, .04, 12), matSilver(), x, y, z, Math.PI/2);
}
