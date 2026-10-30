/* =============================================================
   设备配置：DJI Osmo Action 4（AC203）
   外观用官方 GLB 网格，内构件程序化；屏幕带实时 UI。
============================================================= */
import * as THREE from 'three';
import {
  makeTex, box, addMesh, roundedRectShape,
  matShell, matDark, matSilver, matRed, matRubber, matGlass,
  matBlackGloss, matGold, matScreen
} from '../engine/materials.js';
import { paintPreviewScene } from '../engine/previewScene.js';

const W = 7.05, H = 4.44, D = 3.28;
const LENS_X = 1.72;
const ZH_FONT = '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';

/* ================= 程序化贴图 ================= */
const pcbTex = makeTex(512, 512, (g)=>{
  g.fillStyle='#0a3021'; g.fillRect(0,0,512,512);
  g.strokeStyle='#155238'; g.lineWidth=3;
  let rnd = (s=>()=> (s=Math.imul(48271,s)%2147483647)/2147483647)(7);
  for(let i=0;i<34;i++){
    let x=rnd()*512, y=rnd()*512;
    g.beginPath(); g.moveTo(x,y);
    for(let j=0;j<3;j++){
      if(rnd()>.5) x=Math.min(512,Math.max(0,x+(rnd()-.5)*220)); else y=Math.min(512,Math.max(0,y+(rnd()-.5)*220));
      g.lineTo(x,y);
    }
    g.stroke();
    g.fillStyle='#c9a34a'; g.fillRect(x-3,y-3,7,7);
  }
  g.fillStyle='rgba(220,235,245,.75)'; g.font='600 17px '+ZH_FONT;
  g.fillText('DJI · OSMO ACTION 4', 20, 30);
  g.font='500 13px '+ZH_FONT; g.fillStyle='rgba(220,235,245,.4)';
  g.fillText('MAIN BOARD  REV 2.0', 20, 494);
});

const copperTex = makeTex(256, 256, (g)=>{
  g.fillStyle='#a86030'; g.fillRect(0,0,256,256);
  for(let i=0;i<70;i++){
    g.strokeStyle=`rgba(240,170,110,${0.04+Math.random()*0.1})`;
    g.lineWidth=1+Math.random()*2;
    const y=Math.random()*256;
    g.beginPath(); g.moveTo(0,y); g.lineTo(256,y+(Math.random()-.5)*8); g.stroke();
  }
});

const djiTex = makeTex(256, 96, (g)=>{
  g.clearRect(0,0,256,96);
  g.fillStyle='rgba(235,242,248,.92)';
  g.font='800 56px '+ZH_FONT; g.textAlign='center'; g.textBaseline='middle';
  g.save(); g.translate(128,50); g.transform(1,0,-0.12,1,0,0);
  g.fillText('DJI', 0, 0); g.restore();
});

const speakerTex = makeTex(192, 96, (g)=>{
  g.clearRect(0,0,192,96);
  g.fillStyle='rgba(2,4,7,.95)';
  for(let r=0;r<3;r++) for(let c=0;c<8;c++){
    g.beginPath(); g.arc(16+c*23, 16+r*32, 6, 0, Math.PI*2); g.fill();
  }
});

const coatingTex = makeTex(256, 256, (g)=>{
  const rg = g.createRadialGradient(128,128,8,128,128,126);
  rg.addColorStop(0,'#0a1430'); rg.addColorStop(0.35,'#1c3f8f');
  rg.addColorStop(0.55,'#3f6fd8'); rg.addColorStop(0.72,'#7a5fc0');
  rg.addColorStop(0.88,'#22304a'); rg.addColorStop(1,'#05070c');
  g.fillStyle = rg; g.fillRect(0,0,256,256);
  g.strokeStyle='rgba(140,190,255,.5)'; g.lineWidth=3;
  for(let i=0;i<3;i++){ g.beginPath(); g.arc(128,150,60+i*28,Math.PI*1.15,Math.PI*1.85); g.stroke(); }
});

const batteryTex = makeTex(512, 384, (g)=>{
  g.fillStyle='#14161b'; g.fillRect(0,0,512,384);
  g.fillStyle='#20242c'; g.fillRect(0,0,512,86);
  for(let i=-3;i<16;i++){ g.fillStyle=i%2?'#d9b23c':'#14161b'; g.save(); g.translate(i*36,0); g.transform(1,0,0.5,1,0,0); g.fillRect(0,0,18,14); g.restore(); }
  g.fillStyle='#eef4fa'; g.font='800 108px '+ZH_FONT; g.fillText('1770', 36, 196);
  g.font='600 40px '+ZH_FONT; g.fillStyle='#8fa2b6'; g.fillText('mAh', 268, 196);
  g.font='500 24px '+ZH_FONT; g.fillStyle='#6c7d90'; g.fillText('Li-ion 充电电池 · 典型值', 36, 252);
  g.fillStyle='#45e0ff'; g.font='600 22px '+ZH_FONT; g.fillText('OSMO ACTION', 36, 320);
  g.fillStyle='#e8edf2'; g.fillRect(330, 268, 130, 66);
  g.fillStyle='#101216';
  let x = 338;
  while(x < 448){ const w = 2 + Math.random()*5; g.fillRect(x, 274, w, 44); x += w + 2 + Math.random()*5; }
  g.font='500 12px '+ZH_FONT; g.fillStyle='#30343c'; g.fillText('SN 8F7K2C40A1', 344, 330);
  g.strokeStyle='#d9b23c'; g.lineWidth=4; g.beginPath();
  g.moveTo(478, 292); g.lineTo(496, 324); g.lineTo(460, 324); g.closePath(); g.stroke();
  g.fillStyle='#d9b23c'; g.fillRect(476, 300, 5, 14); g.fillRect(476, 317, 5, 5);
  g.strokeStyle='rgba(140,160,180,.5)'; g.lineWidth=3;
  g.strokeRect(366, 118, 96, 54);
  g.font='500 18px '+ZH_FONT; g.fillStyle='#8fa2b6'; g.fillText('⏻ Li-ion 3.8V', 374, 151);
});

/* ================= 双屏实时 UI（含虚假取景场景） ================= */
const scrFrontC = document.createElement('canvas'); scrFrontC.width=512; scrFrontC.height=384;
const scrRearC  = document.createElement('canvas'); scrRearC.width=768; scrRearC.height=453;
const scrFrontTex = new THREE.CanvasTexture(scrFrontC); scrFrontTex.colorSpace = THREE.SRGBColorSpace;
const scrRearTex  = new THREE.CanvasTexture(scrRearC);  scrRearTex.colorSpace = THREE.SRGBColorSpace;

let recSeconds = 0, recOn = true;
const fmtRec = s => '00:'+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');

/* 黄昏海岸取景场景（静态，预渲染一次；画家函数在 engine/previewScene.js） */
const sceneC = document.createElement('canvas'); sceneC.width=768; sceneC.height=453;
paintPreviewScene(sceneC.getContext('2d'), 768, 453);

function drawFrontScreen(){
  const g = scrFrontC.getContext('2d'), W=512, H=384;
  g.drawImage(sceneC, -69, 0, 651, 384);
  g.fillStyle='rgba(3,6,10,.42)'; g.fillRect(0,0,W,H);
  const blink = recOn && (Math.floor(performance.now()/500)%2===0);
  g.font='600 30px '+ZH_FONT;
  if(blink){ g.fillStyle='#ff5252'; g.beginPath(); g.arc(34,38,10,0,Math.PI*2); g.fill(); }
  g.fillStyle='#eaf3fa'; g.textAlign='center';
  g.fillText('4K · 120', W/2, 48);
  g.textAlign='right'; g.fillStyle='#9fdcf2'; g.fillText('87%', W-22, 46);
  g.strokeStyle='#9fdcf2'; g.lineWidth=3; g.strokeRect(W-104, 24, 54, 26); g.fillRect(W-50,31,7,12);
  g.fillStyle='#45e0ff'; g.fillRect(W-102, 26, 34, 22);
  g.textAlign='center'; g.fillStyle='#f2f8fd';
  g.font='300 96px '+ZH_FONT; g.fillText(fmtRec(recSeconds), W/2, 196);
  g.font='500 24px '+ZH_FONT; g.fillStyle='#7d94a8'; g.fillText('ROCKSTEADY 3.0', W/2, 246);
  const modes=['视频','照片','延时'];
  modes.forEach((m,i)=>{
    const x=26+i*158, y=296, w=140, h=58, act=i===0;
    if(act){ g.fillStyle='rgba(69,224,255,.18)'; g.fillRect(x,y,w,h); g.strokeStyle='#45e0ff'; }
    else g.strokeStyle='rgba(125,148,163,.4)';
    g.lineWidth=2; g.strokeRect(x,y,w,h);
    g.fillStyle=act?'#45e0ff':'#8fa2b6'; g.font='500 26px '+ZH_FONT; g.textAlign='center';
    g.fillText(m, x+w/2, y+38);
  });
  scrFrontTex.needsUpdate = true;
}

function drawRearScreen(){
  const g = scrRearC.getContext('2d'), W=768, H=453;
  g.drawImage(sceneC,0,0);
  g.strokeStyle='rgba(120,180,220,.16)'; g.lineWidth=1;
  for(let i=1;i<3;i++){
    g.beginPath(); g.moveTo(W*i/3,0); g.lineTo(W*i/3,H); g.stroke();
    g.beginPath(); g.moveTo(0,H*i/3); g.lineTo(W,H*i/3); g.stroke();
  }
  g.strokeStyle='#45e0ff'; g.lineWidth=3;
  const bx=W/2-46, by=H/2-34, bw=92, bh=68, L=20;
  [[bx,by,1,1],[bx+bw,by,-1,1],[bx,by+bh,1,-1],[bx+bw,by+bh,-1,-1]].forEach(([x,y,dx,dy])=>{
    g.beginPath(); g.moveTo(x+dx*L,y); g.lineTo(x,y); g.lineTo(x,y+dy*L); g.stroke();
  });
  g.font='600 26px '+ZH_FONT; g.fillStyle='#eaf3fa'; g.textAlign='left';
  g.fillText('4K/60', 28, 44); g.font='500 20px '+ZH_FONT; g.fillStyle='#7d94a8'; g.fillText('16:9', 28, 74);
  g.textAlign='right'; g.font='600 24px '+ZH_FONT; g.fillStyle='#eaf3fa';
  g.fillText('ISO 800', W-28, 44); g.font='500 22px '+ZH_FONT; g.fillStyle='#7d94a8'; g.fillText('1/60', W-28, 76);
  g.fillStyle='rgba(69,224,255,.14)'; g.fillRect(24, H-66, 232, 42);
  g.strokeStyle='rgba(69,224,255,.6)'; g.lineWidth=2; g.strokeRect(24, H-66, 232, 42);
  g.fillStyle='#45e0ff'; g.font='500 22px '+ZH_FONT; g.textAlign='left';
  g.fillText('ROCKSTEADY', 40, H-37);
  const blink = recOn && (Math.floor(performance.now()/500)%2===0);
  g.textAlign='right';
  if(blink){ g.fillStyle='#ff5252'; g.beginPath(); g.arc(W-214,H-45,8,0,Math.PI*2); g.fill(); }
  g.fillStyle= blink?'#ff8a8a':'#7d94a8'; g.font='600 24px '+ZH_FONT;
  g.fillText(fmtRec(recSeconds), W-28, H-37);
  scrRearTex.needsUpdate = true;
}
drawFrontScreen(); drawRearScreen();
let lastHalf = 0;
function tick(){
  if(performance.now()-lastHalf > 500){
    lastHalf = performance.now(); recSeconds++;
    drawFrontScreen(); drawRearScreen();
  }
}

/* ================= 程序化部件构建器 ================= */
const builders = {
  shell(g){
    const bodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(W, H, 0.85), {
      depth: 2.86, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 3, curveSegments: 36
    });
    bodyGeo.translate(0, 0, -1.43);
    addMesh(g, bodyGeo, matShell());
    const panel = roundedRectShape(6.6, 4.0, 0.55);
    const scrHole = roundedRectShape(3.2, 2.6, 0.16, -1.75, 0.35);
    const lensHole = new THREE.Path(); lensHole.absarc(LENS_X, 0, 1.70, 0, Math.PI*2, true);
    panel.holes.push(scrHole, lensHole);
    const panelGeo = new THREE.ExtrudeGeometry(panel, {
      depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 32
    });
    addMesh(g, panelGeo, matBlackGloss()).position.z = 1.44;
    for(let i=0;i<4;i++) addMesh(g, new THREE.CylinderGeometry(0.035,0.035,0.06,10), matDark(), -2.45+i*0.22, H/2, 0.45);
    addMesh(g, new THREE.PlaneGeometry(0.9,0.5), new THREE.MeshBasicMaterial({ map:speakerTex, transparent:true }), W/2+0.005, -1.25, 0.35, 0, Math.PI/2, 0);
    addMesh(g, new THREE.PlaneGeometry(0.55,0.21), new THREE.MeshBasicMaterial({ map:djiTex, transparent:true, opacity:0.9 }), 0.6, H/2+0.002, 0.1, -Math.PI/2, 0, Math.PI);
    const usb = addMesh(g, new THREE.CylinderGeometry(0.13,0.13,0.2,24), matDark(), -W/2-0.05, -0.1, 0.55, 0,0,Math.PI/2);
    usb.scale.set(1,1.9,1);
    addMesh(g, box(0.12,0.4,1.0,0.04), matSilver(), -W/2-0.01, -0.1, 0.55, 0,0,Math.PI/2);
    addMesh(g, box(1.6,0.06,0.5,0.02), matGold(), 0, -H/2+0.08, 0.2);
  },
  'cover-glass'(){},   // 官方模型装载后在 postLoad 里按镜头尺寸重建
  lens(g){
    addMesh(g, new THREE.CylinderGeometry(1.32,1.38,0.5,48), matSilver(), 0,0,-0.18, Math.PI/2);
    addMesh(g, new THREE.CylinderGeometry(1.60,1.66,1.18,56), matDark(), 0,0,0.35, Math.PI/2);
    for(let i=0;i<44;i++){
      const a = i/44*Math.PI*2;
      const t = addMesh(g, box(0.09,0.055,0.52,0.012), matDark(), Math.cos(a)*1.645, Math.sin(a)*1.645, 0.28);
      t.rotation.z = a + Math.PI/2;
    }
    addMesh(g, new THREE.TorusGeometry(1.655,0.045,14,72), matSilver(), 0,0,0.90);
    addMesh(g, new THREE.TorusGeometry(1.655,0.045,14,72), matSilver(), 0,0,-0.06);
    addMesh(g, new THREE.CylinderGeometry(1.44,1.55,0.12,56), matDark(), 0,0,0.96, Math.PI/2);
    addMesh(g, new THREE.CircleGeometry(1.26,48), new THREE.MeshStandardMaterial({ map:coatingTex, emissive:0xffffff, emissiveMap:coatingTex, emissiveIntensity:0.16, roughness:0.18, metalness:0.05 }), 0,0,0.78);
    const e1 = addMesh(g, new THREE.SphereGeometry(1.26,48,32), new THREE.MeshPhysicalMaterial({ color:0x7fa8e8, metalness:0, roughness:0.08, transmission:0.75, ior:1.62, thickness:0.9, envMapIntensity:0.85 }), 0,0,0.78);
    e1.scale.z = 0.16;
    const e2 = addMesh(g, new THREE.SphereGeometry(0.72,40,28), matGlass(), 0,0,0.45); e2.scale.z = 0.22;
    addMesh(g, new THREE.CylinderGeometry(0.55,0.55,0.07,32), matBlackGloss(), 0,0,0.14, Math.PI/2);
    addMesh(g, new THREE.CylinderGeometry(0.20,0.20,0.03,24), new THREE.MeshBasicMaterial({ color:0x010208 }), 0,0,0.18, Math.PI/2);
  },
  sensor(g){
    addMesh(g, box(1.9,1.9,0.12,0.05), new THREE.MeshStandardMaterial({ map:pcbTex, metalness:0.45, roughness:0.6 }));
    addMesh(g, box(1.42,1.42,0.08,0.03), new THREE.MeshStandardMaterial({ color:0x241d16, roughness:0.6 }), 0,0,0.08);
    const die = addMesh(g, box(1.12,1.12,0.1,0.02), matGold(), 0,0,0.15);
    die.material.roughness = 0.18;
    addMesh(g, box(1.7,0.5,0.05,0.02), matGold(), 0,-1.2,0.02);
    addMesh(g, box(0.9,1.4,0.04,0.015), new THREE.MeshStandardMaterial({ color:0xc06a26, roughness:0.7 }), 0,-1.85,-0.14, -0.38,0,0);
    addMesh(g, box(1.0,0.4,0.12,0.03), matDark(), 0,-2.42,-0.38, -0.38,0,0);
  },
  'front-screen'(g){
    addMesh(g, box(3.3,2.7,0.16,0.1), matBlackGloss());
    addMesh(g, new THREE.PlaneGeometry(2.72,2.04), matScreen(scrFrontTex), 0,0,0.085);
  },
  mainboard(g){
    addMesh(g, box(5.7,3.7,0.14,0.08), new THREE.MeshStandardMaterial({ map:pcbTex, metalness:0.45, roughness:0.6 }));
    addMesh(g, box(1.7,1.4,0.24,0.04), matSilver(), -1.35,0.75,0.12);
    addMesh(g, box(1.4,1.05,0.2,0.04), matSilver(), -1.1,-0.9,0.11);
    addMesh(g, box(1.25,1.25,0.18,0.03), matBlackGloss(), 1.05,0.55,0.11);
    addMesh(g, box(0.9,0.32,0.2,0.04), matBlackGloss(), 2.25,-1.25,0.11);
    for(let i=0;i<9;i++) addMesh(g, box(0.06,0.16,0.02,0.005), matGold(), 2.88, -1.35+i*0.21, 0.01);
    for(const [x,y] of [[-2.6,-1.6],[2.6,-1.6],[-2.6,1.6],[2.6,1.6]])
      addMesh(g, new THREE.CylinderGeometry(0.11,0.11,0.06,16), matSilver(), x,y,0.09);
    const guards=[[-1.35,0.75,0.95,0.8],[-1.1,-0.9,0.8,0.65],[1.05,0.55,0.75,0.75],[2.25,-1.25,0.55,0.28]];
    const cols=[0xc9a34a,0x8f98a3,0x22262d];
    for(let i=0;i<24;i++){
      const x=(Math.random()-0.5)*5.3, y=(Math.random()-0.5)*3.3;
      if(guards.some(([gx,gy,gw,gh])=>Math.abs(x-gx)<gw && Math.abs(y-gy)<gh)) continue;
      if(Math.abs(x)>2.45 && Math.abs(y)>1.4) continue;
      addMesh(g, box(0.09+Math.random()*0.1, 0.07+Math.random()*0.08, 0.08, 0.015),
        new THREE.MeshStandardMaterial({color:cols[i%3], metalness:0.7, roughness:0.4}), x,y,0.12);
    }
  },
  thermal(g){
    addMesh(g, box(5.3,3.1,0.12,0.06), new THREE.MeshStandardMaterial({ map:copperTex, metalness:0.95, roughness:0.36, envMapIntensity:0.9 }));
    for(let i=0;i<6;i++) addMesh(g, box(5.1,0.09,0.4,0.02), new THREE.MeshStandardMaterial({ map:copperTex, metalness:0.95, roughness:0.36 }), 0, -1.05+i*0.42, 0.24);
    const hp = addMesh(g, new THREE.TorusGeometry(1.7,0.16,12,64), new THREE.MeshStandardMaterial({ map:copperTex, metalness:0.95, roughness:0.36 }), 0,0,0.34);
    hp.scale.set(1.25,0.85,0.28);
    addMesh(g, box(4.6,2.4,0.05,0.03), new THREE.MeshStandardMaterial({ color:0x15181d, roughness:0.9 }), 0,0,0.1);
  },
  battery(g){
    addMesh(g, box(4.1,3.0,1.5,0.14), new THREE.MeshPhysicalMaterial({ color:0x24262b, metalness:0.55, roughness:0.5, clearcoat:0.3 }));
    addMesh(g, new THREE.PlaneGeometry(3.5,2.55), new THREE.MeshStandardMaterial({ map:batteryTex, roughness:0.55, metalness:0.08 }), -0.1,0.78,0, -Math.PI/2,0,0);
    for(let i=0;i<3;i++) addMesh(g, box(0.16,0.3,0.1,0.02), matGold(), 1.98, -0.7+i*0.55, 0);
  },
  'battery-cover'(g){
    addMesh(g, box(0.16,1.5,2.3,0.07), matRubber());
    addMesh(g, box(0.05,1.2,2.0,0.04), new THREE.MeshStandardMaterial({ color:0x2b2f37, roughness:0.85 }), -0.055,0,0);
    addMesh(g, box(0.1,0.4,0.16,0.03), matRubber(), -0.12,-0.55,-0.9);
  },
  'rear-screen'(g){
    addMesh(g, box(6.5,4.0,0.22,0.35), matBlackGloss());
    const s = addMesh(g, new THREE.PlaneGeometry(6.1,3.6), matScreen(scrRearTex), 0,0,-0.112);
    s.rotation.y = Math.PI;
    addMesh(g, box(0.06,1.6,0.08,0.02), matDark(), 3.2,0,0);
  },
  mount(g){
    addMesh(g, box(5.9,0.3,2.2,0.1), matDark());
    for(const sx of [-1,1]){
      addMesh(g, box(0.62,0.5,2.0,0.08), matDark(), sx*1.15, -0.38, 0);
      addMesh(g, box(0.5,0.14,0.24,0.03), matSilver(), sx*1.15, -0.52, 0.95);
    }
    addMesh(g, box(2.2,0.05,0.5,0.01), matGold(), 0, -0.16, -0.5);
  },
  shutter(g){
    addMesh(g, new THREE.CylinderGeometry(0.72,0.76,0.22,40), matDark(), 0,0.11,0);
    for(let i=0;i<30;i++){
      const a = i/30*Math.PI*2;
      const t = addMesh(g, box(0.07,0.12,0.06,0.015), matDark(), Math.cos(a)*0.735, 0.13, Math.sin(a)*0.735);
      t.rotation.y = a + Math.PI/2;
    }
    addMesh(g, new THREE.CylinderGeometry(0.62,0.68,0.14,40), matSilver(), 0,0.26,0);
    addMesh(g, new THREE.TorusGeometry(0.5,0.04,12,48), matRed(), 0,0.33,0, Math.PI/2);
    addMesh(g, new THREE.CylinderGeometry(0.5,0.5,0.04,32), new THREE.MeshStandardMaterial({ color:0x0b0d10, roughness:0.35, metalness:0.5 }), 0,0.335,0);
  },
  qs(g){
    addMesh(g, box(0.18,0.5,0.52,0.07), matDark());
    for(let i=0;i<3;i++) addMesh(g, box(0.05,0.34,0.07,0.02), matSilver(), 0.075,0, -0.16+i*0.16);
  },
  'io-door'(g){
    addMesh(g, box(0.18,1.4,1.05,0.07), matRubber());
    addMesh(g, box(0.05,1.05,0.78,0.03), new THREE.MeshStandardMaterial({ color:0x2b2f37, roughness:0.85 }), -0.055,0,0);
    addMesh(g, box(0.1,0.5,0.14,0.03), matRubber(), -0.12,-0.35,0.28);
  }
};

/* ================= 部件数据 ================= */
const parts = [
  { id:'cover-glass', zh:'镜头保护镜', en:'PROTECTIVE GLASS',
    offset:[0,0,2.9], tag:'强化玻璃 · 高透光',
    desc:'位于镜头最前端的强化玻璃镜片，为内部精密镜组提供第一道防护，兼顾抗刮擦性能与高透光率，不损失 155° 视角与画质。',
    specs:[['类型','强化玻璃镜片'],['特性','高透光 · 抗刮擦'],['位置','光路最前端'],['作用','防护镜组 · 可清洁维护']] },
  { id:'lens', zh:'广角镜头模组', en:'WIDE LENS MODULE',
    offset:[0,0,2.4], tag:'f/2.8 · 155° 超广角',
    desc:'定焦超广角镜头，多组非球面镜片构成，镜筒带滚花调焦环与金属装饰环，大光圈配合大底传感器显著提升弱光进光量，支持水下色彩自动校正。',
    specs:[['光圈','f/2.8'],['视场角 FOV','155°'],['镜片','多组非球面镜片'],['特性','大进光量 · 弱光更纯净']] },
  { id:'sensor', zh:'图像传感器', en:'1/1.3″ CMOS SENSOR',
    offset:[0,0,1.9], tag:'1/1.3 英寸大底',
    desc:'Action 4 的核心升级所在：1/1.3 英寸大底 CMOS，单像素尺寸更大、进光量约为上代的 2 倍量级，弱光与夜景视频噪点更少、动态范围更高，经 FPC 排线连接主板。',
    specs:[['传感器尺寸','1/1.3 英寸'],['有效像素','约 1000 万'],['单像素','更大 · 进光量提升'],['连接','FPC 排线 → 主板']] },
  { id:'front-screen', zh:'前置触摸屏', en:'FRONT TOUCHSCREEN',
    offset:[-2.4,0.3,1.8], tag:'1.4 英寸彩色触摸',
    desc:'镜头侧的彩色触摸屏，自拍构图时实时预览，拍摄中可直接点按调整参数，配合后屏组成双屏触控操作体系。',
    specs:[['尺寸','1.4 英寸'],['类型','彩色触摸屏'],['功能','自拍预览 · 快速设参']] },
  { id:'mainboard', zh:'主板', en:'MAINBOARD',
    offset:[0,2.6,0.8], tag:'10-bit · 130 Mbps',
    desc:'整机运算核心：图像处理 SoC 与存储、电源管理单元集成于高密度 PCB 之上，最高 130 Mbps 视频码率，支持 10-bit D-Log M 色深与 4K/120fps 处理管线。',
    specs:[['处理器','图像处理 SoC'],['视频码率','最高 130 Mbps'],['色深','10-bit D-Log M'],['存储接口','microSD ≤ 512 GB']] },
  { id:'thermal', zh:'散热模块', en:'THERMAL MODULE',
    offset:[1.7,2.6,-0.6], tag:'导热板 + 热管 + 石墨',
    desc:'导热板、热管与石墨贴片将传感器与处理器的热量快速传导至镁合金机身表面散热，保证 4K/120fps 高负载下的长时间稳定录制。',
    specs:[['方案','导热板 + 热管 + 石墨贴片'],['路径','传感器 → 机身外壳'],['收益','高负载长时间稳定录制']] },
  { id:'shell', zh:'镁合金机身', en:'MG-ALLOY UNIBODY',
    offset:[0,0,0], tag:'一体成型 · 裸机防水 18 m',
    desc:'镁铝合金一体成型机身，兼具轻量化与刚性，裸机即可抵御 18 米水深，无需保护壳也能应对剧烈运动场景。',
    specs:[['材质','镁铝合金'],['工艺','一体成型'],['裸机防水','18 m'],['整机重量','约 95 g'],['尺寸','70.5 × 44.4 × 32.8 mm']] },
  { id:'battery', zh:'电池', en:'BATTERY 1770 mAh',
    offset:[-2.5,-1.7,0.3], tag:'最长约 160 分钟',
    desc:'内置可更换锂电池，位于机身左侧电池仓内：滑动电池仓盖即可快速换电，支持 USB-C 直充；室温下最长约 160 分钟连续录制。',
    specs:[['容量','1770 mAh'],['续航','最长约 160 分钟'],['充电','USB-C 直充'],['更换','左侧电池仓 · 上滑仓盖']] },
  { id:'battery-cover', zh:'电池仓盖', en:'BATTERY COMPARTMENT COVER',
    offset:[-2.3,1.9,-0.2], tag:'左侧面 · 上滑开启',
    desc:'机身左侧的电池仓滑动仓盖：按住释放键向上滑动即可打开，仓内集成电池仓与 microSD 卡槽；合盖后密封防水，支持裸机 18 m 防水。',
    specs:[['位置','机身左侧'],['开启','释放键 + 上滑'],['仓内','电池 + microSD 卡槽'],['密封','防水胶圈 · 裸机 18 m']] },
  { id:'rear-screen', zh:'后置触摸屏', en:'REAR TOUCHSCREEN',
    offset:[1.6,-2.6,-0.6], tag:'2.25 英寸高亮触控',
    desc:'机身背面的大尺寸高亮触摸屏，与主板直连：所有拍摄参数、回放与设置均可在触屏上完成，强光下依然清晰可读；双屏不可同时触控。',
    specs:[['尺寸','2.25 英寸'],['类型','高亮触摸屏'],['功能','全参数触控 · 回放'],['结构','固定式显示模组']] },
  { id:'mount', zh:'底部快拆卡扣', en:'QUICK-RELEASE PRONGS',
    offset:[0,-3.1,0.5], tag:'底部集成 · 一按即拆',
    desc:'机身底部集成的快拆卡扣：对准配件安装座一压即锁、按钮一按即拆，无需额外工具；配合快拆转接板实现横拍 / 竖拍秒切，兼容 1/4″ 螺口生态配件。',
    specs:[['结构','双滑轨卡扣快拆'],['位置','机身底部集成'],['方向','横拍 / 竖拍秒切'],['兼容','Action 配件 · 1/4″ 转接']] },
  { id:'shutter', zh:'快门按键', en:'SHUTTER / RECORD BUTTON',
    offset:[-1.3,2.5,0.5], tag:'短按拍摄 · 长按快拍',
    desc:'机身顶部的录制键：短按拍照或开始/停止录制；关机状态长按可快速开机并立即进入拍摄（SnapShot 快拍），拍摄后闲置 3 秒自动关机。',
    specs:[['位置','机身顶部'],['短按','拍照 / 开始·停止录制'],['长按','快拍开机 SnapShot'],['特性','盲操友好']] },
  { id:'qs', zh:'QS 快切按键', en:'QUICK-SWITCH / POWER',
    offset:[2.7,1.1,0.5], tag:'长按开关机 · 短按切模式',
    desc:'机身右侧的快速切换键，兼作电源键：长按开机 / 关机，短按在拍摄模式间轮换，运动中免进菜单盲操即可完成主要控制。',
    specs:[['位置','机身右侧'],['长按','开机 / 关机'],['短按','切换拍摄模式'],['预设','5 组拍摄预设']] },
  { id:'io-door', zh:'USB-C 仓盖', en:'USB-C PORT COVER',
    offset:[2.5,-1.7,0.6], tag:'右侧面 · 释放键下滑开启',
    desc:'机身右侧的橡胶仓盖保护 USB-C 接口：按下释放键向下滑动打开，充电、导出素材、外接麦克风与 Webcam（UAC/UVC）模式均经由此接口。',
    specs:[['位置','机身右侧下半'],['开启','释放键 + 下滑'],['接口','USB-C（充电 / 传输 / 麦克风）'],['扩展','Webcam · UAC/UVC']] },
];

/* ================= 设备特有后处理 ================= */
function postLoad({ partsById, addLiveScreen }){
  /* 镜头轴检测 → 对位 CMOS 传感器 */
  const lensBox = new THREE.Box3().setFromObject(partsById['lens'].group);
  const lensC = lensBox.getCenter(new THREE.Vector3());
  partsById['sensor'].base.set(lensC.x, lensC.y, -0.2);

  /* 保护镜：程序化重建，贴装在实机镜头前端 */
  const cg = partsById['cover-glass'];
  cg.group.clear();
  const lsize = lensBox.getSize(new THREE.Vector3());
  const r = Math.min(lsize.x, lsize.y)/2 - 0.22;
  const glass = new THREE.Group();
  addMesh(glass, new THREE.CylinderGeometry(r, r, 0.07, 48), matGlass(), 0,0,0, Math.PI/2);
  addMesh(glass, new THREE.TorusGeometry(r+0.02, 0.05, 14, 64), matSilver(), 0,0,-0.01);
  glass.position.set(lensC.x, lensC.y, lensBox.max.z + 0.03);
  cg.group.add(glass);
  cg.base.set(0,0,0);
  cg.group.traverse(o=>{ if(o.isMesh){ o.castShadow = o.receiveShadow = true; o.userData.partId = 'cover-glass'; } });

  /* 屏幕点亮 */
  addLiveScreen('front-screen', 1, scrFrontTex, scrFrontC, 0.84);
  addLiveScreen('rear-screen', -1, scrRearTex, scrRearC, 0.86);
}

/* ================= 导出设备配置 ================= */
export default {
  id: 'action4',
  brand: 'DJI',
  name: 'DJI Osmo Action 4',
  en: 'AC203',
  category: '相机',
  tagline: '4K/120fps 运动相机',
  description: 'DJI Osmo Action 4：1/1.3 英寸大底传感器 + f/2.8 广角镜头，4K/120fps 视频规格，RockSteady 3.0 与地平线增稳，镁合金裸机防水机身。点击左侧清单或 3D 模型上的任意部件查看详情。',
  specs: [
    ['传感器','1/1.3″ CMOS'],['有效像素','约 1000 万'],['视频最高','4K / 120 fps'],
    ['镜头','f/2.8 · FOV 155°'],['防抖','RockSteady 3.0 · HorizonSteady'],
    ['色彩','10-bit D-Log M'],['防水','裸机 18 m'],['电池','1770 mAh · 约 160 min'],
    ['重量','约 95 g'],['尺寸','70.5 × 44.4 × 32.8 mm'],
  ],
  accent: '#45e0ff',
  targetWidth: 7.05,
  glb: '/assets/action4.glb',
  mapping: {
    'JISHEN_09':'lens','JISHEN_010':'lens','JISHEN_022':'lens','JISHEN_023':'lens',
    'JISHEN_024':'lens','JISHEN_025':'lens','JISHEN_026':'lens','JISHEN_027':'lens',
    'JISHEN_028':'lens','GLASS':'lens','lens01':'lens','lens02':'lens','lens03':'lens',
    '镜头丝印':'lens',
    'BOLI':'front-screen','JISHEN_020':'front-screen',
    'JISHEN_013':'rear-screen',
    'JISHEN_05':'battery-cover','JISHEN_019_1':'battery-cover',
    'JISHEN_012':'shutter','JISHEN_04':'shell','JISHEN_015':'qs',
    'JISHEN_08':'io-door','JISHEN_07_1':'io-door',
    'JISHEN_016':'mount','JISHEN_017':'mount','JISHEN_018':'mount',
    'JISHEN_014':'shell','JISHEN_06':'shell','JISHEN_03':'shell',
    'JISHEN_029':'shell','JISHEN_030':'shell','JISHEN_031':'shell','挤压':'shell'
  },
  realPartIds: ['shell','cover-glass','lens','front-screen','rear-screen','shutter','qs','io-door','battery-cover','mount'],
  xrayShellIds: ['shell','battery-cover','io-door','front-screen','rear-screen','mount','shutter','qs'],
  /* 逐步装配组序（内件先装）：镁合金机身→镜组入腔→主板散热→电池→双屏→盖板合拢→外部五金 */
  assembleStep: [
    ['shell'],
    ['lens','sensor'],
    ['mainboard','thermal'],
    ['battery'],
    ['front-screen','rear-screen'],
    ['cover-glass','battery-cover','io-door'],
    ['mount','shutter','qs'],
  ],
  tour: ['lens','sensor','mainboard','thermal','battery','battery-cover','shell','rear-screen','front-screen','mount','shutter','qs','io-door','cover-glass'],
  orientationProbe: ['lens','rear-screen'],
  labelAnchorDx: { 'rear-screen': 1.0 },
  assembledPos: {
    'cover-glass': [LENS_X,0,1.76], 'lens': [LENS_X,0,0.85], 'sensor': [LENS_X,0,-0.2],
    'front-screen': [-1.75,0.35,1.42], 'mainboard': [0,0,-0.05], 'thermal': [0,0.55,-0.5],
    'shell': [0,0,0], 'battery': [-1.35,-0.2,0.0], 'battery-cover': [-3.56,-0.25,0.0],
    'rear-screen': [0,0,-1.49], 'mount': [0,-2.34,0], 'shutter': [-1.8,2.22,0.0],
    'qs': [3.56,1.0,0.0], 'io-door': [3.56,-1.1,0.0]
  },
  labelOffsets: {
    'cover-glass': [0,0.8,0], 'lens': [0,1.8,0], 'sensor': [0,1.2,0], 'front-screen': [0,1.7,0],
    'mainboard': [0,2.1,0], 'thermal': [0,1.9,0], 'shell': [0,2.6,0], 'battery': [0,2.0,0],
    'battery-cover': [0,1.4,0], 'rear-screen': [0,2.4,0], 'mount': [0,0.9,0], 'shutter': [0,0.8,0],
    'qs': [0,0.8,0], 'io-door': [0,1.0,0]
  },
  builders,
  parts,
  postLoad,
  tick
};
