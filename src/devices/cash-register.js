/* =============================================================
   设备配置：复古收银机（Poly Haven · CC0 扫描）
   3 网格（机身双网格/钱屉）——重名节点运行时会回退改名，接入后核对 __RAW.names
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'cash-register',
  name: '复古收银机',
  en: 'VINTAGE CASH REGISTER',
  category: '商用设备',
  brand: 'GENERIC',
  tagline: '叮一声，钱进抽屉账进轮',
  description: '机电式收银机（National Cash Register 风格）：按下一个价位键，内部的加法齿轮轮系把金额累加到总额轮上，同时「叮」一声、钱屉「哐」地弹出——声音本身就是防盗设计：老板在里屋听声音就知道伙计有没有正经收款。它是一台会记账的机械计算机，比电子收银机早了七十年。',
  specs: [
    ['形态', '机电式 · 键盘 + 钱屉'],
    ['记账', '加法齿轮轮系 + 总额轮'],
    ['防窃', '响铃 + 自动弹屉'],
    ['时代', '1884 NCR 起 · 至 1970s'],
    ['来源', 'Poly Haven（CC0 扫描）'],
  ],
  accent: '#c98f3d',
  source: 'Poly Haven（CC0）',
  modelCredit: 'Cash Register by Poly Haven (CC0)',
  modelSource: 'https://polyhaven.com/a/CashRegister_01',
  targetWidth: 10,
  normalize: 'full',
  glb: '/assets/cash-register.glb',
  tour: ['body','drawer'],
  xrayShellIds: ['body'],
  mapping: {
    /* 重名节点运行时回退为网格名 Cash_register（机身双网格），见 __RAW.names */
    'Cash_register': 'body',
    'Cash_register_1': 'body',
    'CashRegister_011_drawer': 'drawer',
  },
  realPartIds: ['body', 'drawer'],
  postLoad: ({ partsById }) => {
    /* 扫描件白漆在强光下过曝：整体压暗 */
    for (const pid of ['body', 'drawer']) {
      const p = partsById[pid]; if (!p) continue;
      p.group.traverse(o => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) { if (m.color) m.color.multiplyScalar(0.55); }
      });
    }
  },
  parts: [
    { id: 'body', zh: '机身与记账轮系', en: 'BODY & ADDER', real: true,
      ex: [0, 0.3, -0.8], lo: [0, 1.3, 0], tag: '黄铜加法轮 · 机械计算机',
      desc: '机身：上层的价目键盘下藏着一排加法齿轮——每按一键，对应十位的齿轮转过相应齿数，交易流水与累计总额分别打在两条纸质带上；前面的显示窗读的是「今天的总数」。纯机械，无需电，停电照常营业。',
      specs: [['核心', '加法齿轮轮系'], ['凭证', '双纸带打印'], ['显示', '总额读数窗'], ['供电', '零（纯机械）']] },
    { id: 'drawer', zh: '钱屉', en: 'CASH DRAWER', real: true,
      ex: [0, -0.8, 1.8], lo: [0, 1.1, 0], tag: '叮 → 哐 · 防盗设计的音响',
      desc: '钱屉：完成一笔交易自动「哐」地弹出，里面的金属格把纸币硬币分格压住——弹屉声与响铃声一起构成「收款认证」，老板隔着一间屋子也能对账。打烊时抽屉整个取下收进保险柜，是老店的 nightly ritual。',
      specs: [['触发', '交易完成自动弹'], ['内部', '分格钱匣'], ['防盗', '声音认证 + 可整体取走'], ['仪式', '打烊入保险柜']] },
  ],
});
