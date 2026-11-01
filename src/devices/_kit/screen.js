/* =============================================================
   共享手机实时屏幕：黄昏取景壁纸 + 时钟/状态栏 UI
   返回 { canvas, tex, tick, hook }，hook 里调 addLiveScreen
   ── 屏幕方案策略（2026-11-01 通宵迭代 SCR-01/02，审计 docs/AUDIT-3D-AUTHENTICITY.md）──
   仅当设备 GLB 的 display 网格【无原生屏幕贴图】时才允许使用本 API（painted 方案）；
   原生贴图已含真实系统界面/官方壁纸的设备（iphone-12-teardown、iphone-13、iphone-17、
   iphone-18-pro-max、iphone-18-pro-max-burgundy、iphone-duo-fold、galaxy-s22-ultra、
   modular-smartphone）已拆除 painted 接线，禁止再加第二层。
   接入新设备时先跑 tools/screen-audit.mjs 判定，并在配置中留「screen: native|painted」注释。
============================================================= */
import * as THREE from 'three';
import { paintPreviewScene } from '../../engine/previewScene.js';
import { matScreen } from '../../engine/materials.js';

const ZH_FONT = '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';

export function makePhoneScreen({ w=560, h=1212, brand='IPHONE', carrier='5G', accent='#45e0ff' }){
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  let seconds = 0, lastTick = 0;

  function draw(){
    const g = canvas.getContext('2d');
    paintPreviewScene(g, w, h);
    /* 状态栏 */
    g.fillStyle = 'rgba(4,8,14,.55)';
    g.fillRect(0, 0, w, 64);
    g.font = '600 30px ' + ZH_FONT;
    g.fillStyle = '#eaf3fa'; g.textAlign = 'left';
    g.fillText('10:20', 34, 46);
    g.textAlign = 'right'; g.font = '500 26px ' + ZH_FONT;
    g.fillStyle = '#9fdcf2';
    g.fillText(carrier + ' ▾  ⌁ 87%', w - 34, 46);
    /* 主时钟 */
    g.textAlign = 'center';
    g.font = '300 150px ' + ZH_FONT;
    g.fillStyle = 'rgba(235,244,252,.92)';
    g.fillText('10:20', w/2, 320);
    g.font = '500 40px ' + ZH_FONT;
    g.fillStyle = 'rgba(180,208,232,.75)';
    g.fillText('10月28日 星期三', w/2, 386);
    /* 通知卡 */
    const nw = w - 96, nx = 48, ny = h - 430;
    g.fillStyle = 'rgba(10,18,28,.66)';
    g.beginPath(); g.roundRect(nx, ny, nw, 128, 26); g.fill();
    g.strokeStyle = 'rgba(140,190,230,.25)'; g.lineWidth = 2; g.stroke();
    g.textAlign = 'left';
    g.fillStyle = accent; g.font = '600 26px ' + ZH_FONT;
    g.fillText('格物馆', nx + 30, ny + 46);
    g.fillStyle = 'rgba(226,238,248,.88)'; g.font = '500 28px ' + ZH_FONT;
    g.fillText('欢迎回来 — 试试一键拆解', nx + 30, ny + 92);
    /* Dock */
    g.fillStyle = 'rgba(10,18,28,.5)';
    g.beginPath(); g.roundRect(48, h - 210, w - 96, 150, 40); g.fill();
    const appc = ['#45e0ff', '#ff8fab', '#c792ea', '#ffd166'];
    appc.forEach((cc, i)=>{
      const ax = 110 + i * (w - 220) / 3;
      g.fillStyle = cc;
      g.globalAlpha = .85;
      g.beginPath(); g.roundRect(ax - 44, h - 178, 88, 88, 22); g.fill();
      g.globalAlpha = 1;
    });
    tex.needsUpdate = true;
  }

  draw();
  return {
    canvas, tex,
    tick(dt){
      if(performance.now() - lastTick > 1000){ lastTick = performance.now(); seconds++; draw(); }
    },
    hook(addLiveScreen, partId){
      addLiveScreen(partId, 1, tex, canvas, 0.92);
    },
  };
}
