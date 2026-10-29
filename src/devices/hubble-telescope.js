/* =============================================================
   设备配置：哈勃空间望远镜（NASA/ESA，1990）
   社区 GLB（Sketchfab）：1308 网格 SA#### 匿名命名、无烘焙材质（白模），已 draco
   bbox 6.39×6.33×4.68 —— Z 为镜筒轴，太阳能翼双侧展开（网格群 c x ±1.3~1.4）
   按坐标簇归并到 8 个部件；白模按真机白色包覆层呈现
============================================================= */
import { makeDevice } from './_kit/factory.js';

export default makeDevice({
  id: 'hubble-telescope',
  name: '哈勃空间望远镜',
  en: 'HUBBLE SPACE TELESCOPE',
  category: '航天',
  brand: 'NASA/ESA',
  tagline: '2.4m 主镜 · 30 余年仍在观测的太空巨眼',
  description: '哈勃空间望远镜是 NASA 与 ESA 合作的 2.4m 口径卡塞格林（Ritchey-Chrétien）反射望远镜，1990 年由航天飞机发现号送入约 540km 近地轨道，历经五次航天飞机维护，至今仍在运行产出。模型为社区白模（1308 网格、无烘焙材质），本页按真机白色包覆层呈现分区：主镜筒、双侧太阳能翼、前端光圈门、后部遮罩舱（WFC3/ACS/COS/STIS 仪器舱）、高增益天线与散热器。',
  specs: [
    ['口径','2.4 m 主镜 · RC 反射'],['发射','1990-04 · STS-31 发现号'],
    ['质量','11 110 kg（发射）'],['轨道','约 540 km 近地轨道'],
    ['波段','紫外 ~ 可见 ~ 近红外'],['指向稳定','0.007 角秒 / 24h'],
    ['尺寸','长 13.2 m · 径 4.2 m（真机）'],['维护','5 次（1993-2009）'],
  ],
  accent: '#f0c75e',
  source: 'Sketchfab 社区模型',
  modelCredit: 'Hubble Space Telescope model by community (Sketchfab)',
  targetWidth: 12.5,
  camDist: 1.1,
  glb: '/assets/hubble-telescope.glb',
  draco: true,
  normalize: 'full',
  frontAxis: '-z',           /* 光圈门端（原生 -z 端）朝观众，对称体不做探测 */
  unmappedTo: 'tube',
  mapByPosition(name, p, rel){
    /* 优先级：顶部天线小群 → 底部散热器 → 侧翼 → 轴向分区 */
    if(rel.y > 0.9) return 'antennas';          /* 顶部碟形高增益天线群 */
    if(rel.y < 0.08) return 'radiators';        /* 底部散热器板 */
    if(rel.x > 0.72) return 'solar-array-r';    /* 右翼网格群（c x +1.3~1.4 → rel≈0.70+） */
    if(rel.x < 0.28) return 'solar-array-l';
    if(rel.z < 0.18) return 'aperture-door';    /* 前端盖板群：光圈门 */
    if(rel.z > 0.72) return 'aft-shroud';       /* 后部遮罩舱（仪器舱端） */
    if(rel.z > 0.55) return 'science-section';  /* 焦面/仪器舱邻接段 */
    return 'tube';
  },
  realPartIds: ['tube','solar-array-l','solar-array-r','aperture-door','aft-shroud','antennas','radiators','science-section'],
  parts: [
    { id:'tube', zh:'主镜筒', en:'OPTICAL TUBE ASSEMBLY', real:true,
      ex:[0,0,.6], lo:[0,1.4,0], tag:'2.4m RC 反射 · 白色包覆层',
      desc:'主镜筒承载 2.4m 口径的 Ritchey-Chrétien 卡塞格林光学系统：主镜面形打磨精度约 10nm，经副镜折转焦面；筒体外包覆多层隔热材料维持热稳定。真机长约 13.2m、直径 4.2m。',
      specs:[['口径','2.4 m 主镜'],['系统','Ritchey-Chrétien'],['面形精度','约 10 nm'],['包覆','多层隔热 · 白色外层']] },
    { id:'solar-array-l', zh:'左太阳能翼', en:'SOLAR ARRAY -L', real:true,
      ex:[-3.4,.4,0], lo:[0,1.1,0], tag:'1993 SM1 换新',
      desc:'左侧太阳能翼：初代柔性太阳翼因热胀冷缩产生在轨抖动、影响指向稳定，1993 年第一次维护任务（SM1）整体换新。模型中翼面网格群沿 -x 侧展开，无烘焙材质、按白色包覆层呈现。',
      specs:[['布局','-x 侧对称展开'],['更换','1993 SM1'],['贡献','供电 + 消除抖动']] },
    { id:'solar-array-r', zh:'右太阳能翼', en:'SOLAR ARRAY -R', real:true,
      ex:[3.4,.4,0], lo:[0,1.1,0], tag:'2002 SM3B 再换刚性翼',
      desc:'右侧太阳能翼：2002 年 SM3B 维护任务再次换装更小的刚性太阳翼，为望远镜与四台在轨仪器供电。双翼与镜筒垂直展开，是哈勃最辨识的侧影。',
      specs:[['布局','+x 侧对称展开'],['更换','2002 SM3B'],['功能','全舱供电']] },
    { id:'aperture-door', zh:'光圈门', en:'APERTURE DOOR', real:true,
      ex:[0,.8,2.6], lo:[0,1.0,0], tag:'2.4m 口径端盖 · 遮光闸',
      desc:'位于 2.4m 口径前端的可开合舱门：发射段保护主镜与内部光学件免受污染，在轨按观测安排开合，兼作遮光闸门挡住太阳直射。本页将其置于朝观众一端。',
      specs:[['口径','2.4 m'],['作用','发射保护 · 遮光'],['位置','镜筒前端']] },
    { id:'aft-shroud', zh:'后部遮罩舱', en:'AFT SHROUD', real:true,
      ex:[0,.4,-2.6], lo:[0,1.2,0], tag:'仪器舱 · WFC3/ACS/COS/STIS',
      desc:'后部遮罩舱是主镜后段的仪器舱遮罩：径向与轴向舱位装着 WFC3（宽场相机 3）、ACS（先进巡天相机）、COS（宇宙起源光谱仪）与 STIS（空间望远镜成像光谱仪）四台在轨仪器，历次维护任务中航天员在此更换仪器与电子设备。',
      specs:[['在轨仪器','WFC3 · ACS · COS · STIS'],['舱位','径向 + 轴向'],['维护','航天员在轨更换']] },
    { id:'antennas', zh:'高增益天线', en:'HIGH-GAIN ANTENNAS', real:true,
      ex:[.6,2.2,.2], lo:[0,.8,0], tag:'碟形天线 ×2 · TDRS 中继',
      desc:'两副碟形高增益天线经 NASA 数据中继卫星（TDRS）把科学数据实时回传地面，另有低增益天线作为低速率备份链路。模型中为镜筒顶部的小网格群。',
      specs:[['数量','高增益碟形 ×2'],['链路','TDRS 数据中继'],['备份','低增益天线']] },
    { id:'radiators', zh:'散热器', en:'RADIATORS', real:true,
      ex:[0,-1.9,.4], lo:[0,.8,0], tag:'铝板辐射散热',
      desc:'铝制散热器板将仪器与电子设备的废热以红外辐射排向深空，分布于筒体下侧与后部遮罩舱外；真机为银白高发射率表面，维持光学舱热环境稳定。',
      specs:[['构成','铝制辐射板'],['布局','筒体/舱段下侧'],['功能','排散设备废热']] },
    { id:'science-section', zh:'科学仪器承载段', en:'SCIENCE INSTRUMENT SECTION', real:true,
      ex:[0,-.7,1.8], lo:[0,.9,0], tag:'焦面接续 · 仪器舱邻接段',
      desc:'主镜焦面与后部仪器舱之间的承载结构段：光线经主镜-副镜折转后在此进入各仪器的接口组件，历次维护任务在焦面接续处换装新代仪器。模型按坐标簇归并，位于轴向中后段。',
      specs:[['段位','主镜后 · 仪器舱前'],['构成','焦面接续 · 承载结构'],['演变','历次维护换装仪器']] },
  ],
  tick: null,
});
