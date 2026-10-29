/* =============================================================
   设备配置：Flipper Zero
   官方外壳 STL（flipperdevices 官方仓库 · GPL-3.0）转 GLB
   直立姿态（Y=100mm 高），内构件程序化：LCD / 主板 / 电池
============================================================= */
import * as THREE from 'three';
import { makeDevice, anchorParts, composePostLoad } from './_kit/factory.js';
import { mainboard, battery } from './_kit/internals.js';
import { addMesh, matDark, matScreen } from '../engine/materials.js';

const ZH_FONT = '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';

/* 单色 LCD 实时屏幕：橄榄绿底 + 像素海豚桌面 */
const lcdC = document.createElement('canvas'); lcdC.width = 512; lcdC.height = 256;
const lcdTex = new THREE.CanvasTexture(lcdC); lcdTex.colorSpace = THREE.SRGBColorSpace;
let blink = 0, lastTick = 0;
function drawLcd(){
  const g = lcdC.getContext('2d'), W = 512, H = 256;
  g.fillStyle = '#9ea663'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#20240f';
  /* 状态栏 */
  g.fillRect(0, 0, W, 6);
  g.font = '600 22px ' + ZH_FONT; g.textAlign = 'left';
  g.fillText('▶ 00:0' + (blink % 10), 18, 40);
  g.textAlign = 'right';
  g.fillText('BAT ▮▮▮▯   BLE', W - 18, 40);
  /* 像素海豚（简化方块画） */
  const px = (x, y, s=10) => g.fillRect(x*12+90, y*12+70, s, s);
  for(let i=0;i<6;i++) px(2+i, 6-i>2?4:5);
  px(1,5); px(2,4); px(3,4); px(4,3); px(5,3); px(6,2); px(7,2); px(8,2);
  px(8,3); px(9,3); px(9,4); px(8,4); px(7,5); px(6,5); px(5,5); px(4,5); px(3,5);
  /* 菜单列表 */
  g.font = '600 26px ' + ZH_FONT;
  const items = ['Sub-GHz', 'RFID 125kHz', 'NFC', 'Infrared', 'GPIO', 'Bad USB'];
  items.forEach((t, i)=>{
    const y = 96 + i * 26;
    if(i === blink % items.length){ g.fillStyle = '#20240f'; g.fillRect(250, y - 22, 240, 26); g.fillStyle = '#9ea663'; }
    else g.fillStyle = '#20240f';
    g.fillText(t, 258, y);
  });
  lcdTex.needsUpdate = true;
}
drawLcd();
function tick(){
  if(performance.now() - lastTick > 800){ lastTick = performance.now(); blink++; drawLcd(); }
}

const builders = {
  lcd: (g)=>{
    addMesh(g, new THREE.BoxGeometry(3.6, 2.4, 0.14), matDark());
    addMesh(g, new THREE.PlaneGeometry(3.3, 2.0), matScreen(lcdTex), 0, 0, 0.08);
  },
  board: (g)=> mainboard(g, { w:3.4, h:4.4, soc:[-0.7,.9], ram:[0.7,.6], label:'STM32WB55', sub:'FLIPPER ZERO · MAIN + CC1101', pcb:'#1d4a34', smalls:10 }),
  battery: (g)=> battery(g, { w:2.9, h:3.6, d:.4, label:'FLIPPER', capacity:'2000 mAh', model:'LiPo 3.7V', rating:'3.7V' }),
};

export default makeDevice({
  id: 'flipper-zero',
  name: 'Flipper Zero',
  en: 'FLIPPER ZERO',
  category: '极客工具',
  brand: 'FLIPPER',
  tagline: '海豚形多协议渗透玩具',
  description: 'Flipper Zero：白鲸造型的便携多工具——Sub-GHz、RFID、NFC、红外、GPIO 与 Bad USB 一机通吃， Tamagotchi 式电子宠物海豚陪伴极客日常。外壳来自官方 3D 模型仓库（GPL-3.0），内构件为示意重建。',
  specs: [
    ['主控','STM32WB55（BLE 5）'],['射频','CC1101 Sub-1GHz'],['读卡','125kHz RFID · 13.56MHz NFC'],
    ['红外','发射 + 接收'],['屏幕','1.4″ 单色 LCD 背光'],['电池','2000 mAh LiPo'],
    ['扩展','GPIO 排针 · microSD'],['尺寸','100 × 40 × 25 mm · 102 g'],
  ],
  accent: '#ff9d2e',
  source: 'Flipper 官方 3D 模型仓库（GPL-3.0）',
  modelCredit: 'Flipper Zero shell by flipperdevices (GPL-3.0), via flipperzero-3d-models',
  targetWidth: 11.0,
  glb: '/assets/flipper-zero.glb',
  /* 策展导览：壳→LCD→主板→电池 */
  tour: ['shell','lcd','board','battery'],
  xrayShellIds: ['shell'],
  normalize: 'full',
  realPartIds: ['shell'],
  builders,
  parts: [
    { id:'shell', zh:'白色外壳', en:'ABS SHELL', real:true,
      ex:[0,0,0], lo:[0,1.4,0], tag:'官方 CAD · 海豚造型',
      desc:'官方开源的 ABS 外壳：海豚轮廓一体注塑，正面集成 D-pad 与确认/返回键，背面留有 GPIO 排针开孔与 iButton 触点；顶缘是红外窗与 Sub-GHz 天线区。',
      specs:[['来源','官方 3D 仓库（GPL-3.0）'],['材质','ABS + PC'],['按键','D-pad · OK · Back'],['开孔','GPIO · iButton · 红外窗']] },
    { id:'lcd', zh:'单色 LCD 屏', en:'1.4″ MONO LCD',
      ex:[0,1.6,2.6], lo:[0,1.3,0], tag:'128×64 · 橙色背光',
      desc:'1.4 英寸 128×64 单色液晶：橄榄绿底黑像素是它的标志面孔，电子宠物海豚就在这里成长；白/橙双色 LED 背光可换心情。',
      specs:[['分辨率','128×64'],['背光','白 / 橙 双色 LED'],['显示','像素海豚 + 菜单']] },
    { id:'board', zh:'主板', en:'MAINBOARD',
      ex:[0,-1.6,2.2], lo:[0,1.3,0], tag:'STM32WB55 + CC1101',
      desc:'双层主板：STM32WB55 双核（Cortex-M4 + M0，BLE 5）主控，CC1101 Sub-1GHz 射频收发器覆盖 300-928MHz，另有 125kHz RFID 前端与 NFC 芯片，microSD 卡槽记录抓取的信号。',
      specs:[['主控','STM32WB55'],['射频','CC1101 300-928MHz'],['RFID','125kHz EM-4100'],['NFC','ST25R3916'],['存储','microSD']] },
    { id:'battery', zh:'电池', en:'LIPO 2000 mAh',
      ex:[0,-3.2,-.6], lo:[0,1.2,0], tag:'2000 mAh · 27 小时',
      desc:'2000 mAh 锂聚合物电池塞满握把：典型使用 27 小时续航，USB-C 充电；电池仓藏于背盖之下，拆开四颗螺丝即可更换。',
      specs:[['容量','2000 mAh'],['续航','约 27h'],['充电','USB-C']] },
  ],
  postLoad: composePostLoad(
    ({ partsById })=>{
      const shell = partsById['shell'];
      if(shell){
        const bb = new THREE.Box3().setFromObject(shell.group);
        const c = bb.getCenter(new THREE.Vector3());
        /* 外壳正面朝 +Z（D-pad 与屏幕窗同面） */
        const place = (pid, dy, dz)=>{
          const p = partsById[pid];
          p.base.set(c.x, c.y + dy, c.z + dz);
          p.group.position.copy(p.base);
        };
        place('lcd', -1.1, bb.max.z - c.z - 0.25);
        place('board', -1.6, -0.3);
        place('battery', -3.4, -0.4);
      }
    },
  ),
  tick,
});
