# DJI 拆解馆 · 下一批设备候选调研（2026-10-30）

> 来源：Sketchfab 公开 API（curl，搜索 23 组关键词 × count=12 downloadable，52 个详情请求，间隔 ≥1.2s，429 退避 3s）。
> 查重：候选关键词（guitar/piano/accordion/gramophone/espresso/toaster/blender/washing/chainsaw/grinder/derailleur/motorcycle/wankel/rotary/radial/tourbillon/game boy/walkman/arcade/pinball/sewing）在 `src/devices/registry.js` 与 `public/assets/` 均 0 命中，无重复。
> 本批未发现 CC0 模型；推荐项全部为 `by`（CC Attribution 4.0，license 对象实测 label="CC Attribution"）。
> 排序规则：结构可拆性 > 许可 > 面数适中 > 品类差异化。

---

## 一、推荐清单（10 个，按优先级）

### 1. Kitchen Blender（厨房搅拌机）
- 作者：shiskin ｜ license：by（CC-BY 4.0）｜ faceCount：69,376 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/kitchen-blender-ce3d8add9f454fb6b6aa70f0ddcefa22
- 推荐理由：作者描述明示 "good topology. **with every part seperate**"——全场唯一明确承诺全部件独立网格的候选，搅拌机（杯体/刀组/底座/旋钮）拆解语义天然成立。
- 风险：未公布部件清单，接入前仍需 `tools/inspect-glb.mjs` 验证实际 mesh 分组；photoreal 产品级，材质压缩后体积需评估。

### 2. Angle Grinder DeWalt D28136（得伟角磨机）
- 作者：Den.Prodan ｜ license：by ｜ faceCount：18,109 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/angle-grinder-dewalt-d28136-d3da4a887d524714a2cfa358be2c907f
- 推荐理由：真实品牌电动工具（hardsurface 建模，2 组 4K UDIM 贴图）；角磨机的机壳/齿轮头/护罩/砂轮片/双侧手柄/电源线是教科书级拆解结构；工具板块现只有台钻/手摇钻/万用表，电动工具空白。
- 风险：面数 1.8 万偏轻，细节依赖贴图；"DeWalt" 商标仅宜作署名性标注。

### 3. Pinball Machine（弹珠台）
- 作者：Ranguel ｜ license：by ｜ faceCount：63,915 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/pinball-machine-cc2a49ca2ad14910abce89b5a78bb09f
- 推荐理由：描述明示 "includes **flippers, slingshots, posts, roll-over switches, drop targets and playfield plastics, following real pinball machine construction principles**"——按真实机械构造建模，零件即独立机械件；游戏机板块只有 Switch×2 与复古立方主机，弹珠台是全新品类。
- 风险：台体扁平宽大，现有爆炸路径算法需为其单独调参；台面美术主题的 IP 属性接入前需再看一眼完整描述与贴图。

### 4. Motor Wankel（转子发动机·实验室剖切教具）
- 作者：museoETSII ｜ license：by ｜ faceCount：769,218 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/motor-wankel-c0b73b5a311e4ebb86d2c8411aa7ae44
- 推荐理由：描述为 "Motor de combustión interna Wankel **seccionado** del Laboratorio de Motores de la ETSII-UPM"——马德里理工大学发动机实验室的实物剖切教学机，来源可靠；转子（汪克尔）发动机与已有 V6/V8/直列/涡喷四种动力形态完全差异化。
- 风险：76.9 万面偏重（需 draco 压缩评估加载）；"剖切"（seccionado）与"拆解"语义不同，需确认网格能按转子/偏心轴/端盖分组。

### 5. Astronomical Tourbillon Watch（天文陀飞轮腕表机构）
- 作者：Binkley-Piratepants ｜ license：by ｜ faceCount：203,350 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/astronomical-tourbillon-watch-2d2b58c30d254982ad2e827d382aedb2
- 推荐理由：双轴陀飞轮腕表机构（描述自述基于 Jacob & Co Astronomia "only way way better"）；钟表板块已有擒纵/怀表/闹钟/挂钟/数显表，陀飞轮是差异化最高的机芯品类，齿轮系+框架+宝石轴承是天然拆解结构。
- 风险：外观仿 Jacob & Co，展示命名建议用"天文陀飞轮机构"而非品牌名；分件程度未声明，需 GLB 检查。

### 6. Three Cylinder Motorcycle Engine（三缸摩托车发动机）
- 作者：jamie3d ｜ license：by ｜ faceCount：157,938 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/three-cylinder-motorcycle-engine-ad2416e341cb4beca3f86b0b00e84749
- 推荐理由：职业美术作者 jamie3d 的作品，取自其 Generic Triple 摩托车项目，描述明示 "Ready to be subdivided"；曲轴箱/缸体/缸头/离合边盖等分件预期良好；交通板块有整车（保时捷×2、Countach、山地车）但无动力总成特写。
- 风险：分件未明示，需 inspect 验证；线管/线束被作者"剪断"以便集成，爆炸时断口可见。

### 7. Smeg Toaster（Smeg 复古烤面包机）
- 作者：Thefreshlab ｜ license：by ｜ faceCount：120,716 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/smeg-toaster-646838d76f204c83ae952e049f2948b1
- 推荐理由：Blender 精修的复古 Smeg 产品级建模；烤面包机是经典拆解题材（外壳/升降架/发热丝座/杠杆联锁/集屑盘），厨电板块当前完全空白。
- 风险：Smeg 外观设计权敏感，仅署名展示；分件未声明。

### 8. Washing Machine（滚筒洗衣机）
- 作者：re1monsen ｜ license：by ｜ faceCount：21,005 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/washing-machine-d81d81853a9f478ca9fac019eabcf453
- 推荐理由：游戏资产（4K 材质、带 1 段动画、拖拽即用），门/滚筒/洗涤剂盒/控制面板/调平脚天然分件；大家电板块空白，且面数极轻适合移动端。
- 风险：游戏资产风格化而非照片级，与展馆整体写实基调需比对；21k 面的内部结构（电机/配重）大概率缺失。

### 9. Gramophone（老式留声机）
- 作者：dylanheyes ｜ license：by ｜ faceCount：31,338 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/gramophone-896398c16ed94dbba416a04ecc3f8f01
- 推荐理由：描述明示 "The **handle is separate** and can be animated if needed"——多网格；喇叭/木质箱体/摇柄/唱盘/唱臂/唱片结构完整；留声机同时覆盖"乐器"与"复古影音"两个目标品类，dylanheyes 是知名写实资产作者。
- 风险：大喇叭为单一大曲面网格，实际可拆分点有限（明示的只有手柄）；箱体内部机芯未建模。

### 10. Sony Walkman WM-F2078（随身听套装）
- 作者：Dolgov12 ｜ license：by ｜ faceCount：249,827 ｜ downloadable：true
- viewerUrl：https://sketchfab.com/3d-models/sony-walkman-wm-f2078-a336664b96344630b0f7e1eaac2c256d
- 推荐理由：描述给出明确分件账目 "3 UV sets … **Player - 96k tris, Headphones - 52k tris, Cassette - 50k tris**"——主机/耳机/磁带三件套，磁带可作独立内部部件展示；随身听是任务点名品类。
- 风险：与已有 portable-cassette-player（便携卡带机）、Sony TC-510（开盘机）品类相近，须以"Walkman 特定型号+耳机/磁带套装"做差异化登记；Sony 商标仅署名展示。

---

## 二、观察名单（合格但列为第二选择/同类备胎）

- Triaxial Tourbillon Clock — bog07 — by — 248,662 — https://sketchfab.com/3d-models/triaxial-tourbillon-clock-41e05ebc99024a8199d943c471c82953 — 三轴陀飞轮座钟，描述注明衍生物为 Thingiverse mcmaven 的 CC 作品（来源可溯）；与推荐 5 二选一，或作为钟表板块第二台。
- Radial Engine Mechanism — trinityscsp — by — 172,616（anim=1）— https://sketchfab.com/3d-models/radial-engine-mechanism-654aa59996b64cb0a9fb1466a07fe2cb — SolidWorks CAD 机构、带动画，星型发动机对已有引擎序列差异化强；风险：vertexCount 369 万偏重。
- Radial 7-cyl Diesel Engine — jxstnxlll — by — 169,919 — https://sketchfab.com/3d-models/radial-7-cyl-diesel-engine-f5e004dd0ef54ac580b27f04c22b9f40 — 七缸星型柴油机，作者自述"做了很久"；描述明示非工程精确。
- Stihl Chainsaw — SethHamer — by — 205,691 — https://sketchfab.com/3d-models/stihl-chainsaw-6c4c0ac9fcb148fb9d9161052a663af4 — 电链锯填补工具品类；风险：带 3dscan 标签，扫描网格可能整体合并需手动切件。
- La Marzocco Home GS3 Espresso Machine — mvmvsvn — by — 226,736 — https://sketchfab.com/3d-models/la-marzocco-home-gs3-espresso-machine-59efee4d73ee415198eba03e0704d3f8 — 意式咖啡机；风险：作者自述 "made with basic shapes"，精度存疑。
- Electric Guitar — flowstudio — by — 185,726 — https://sketchfab.com/3d-models/electric-guitar-9b7e233ca9674fcfa1995a9b846d4a4f — 电吉他含琴架，乐器板块空缺时的首选；风险：分件未声明，琴弦/拾音器可能合并。
- Hallet And Davis Piano, 1896 — tauricity — by — 284,900 — https://sketchfab.com/3d-models/hallet-and-davis-piano-1896-3dst19-5a0d2e4dea71474abb55b7c2bfb6e715 — 1896 年古董立式钢琴，"An old, beat up piano with a story to tell"；风险：钢琴拆解实际多为外壳盖板件，内部弦列难拆。
- Vintage Upright Piano — Zack_Hawley — by — 10,834 — https://sketchfab.com/3d-models/vintage-upright-piano-535d2c6465d243c4a17dd87650fa2c88 — 刚过面数下限，Blender+Substance 手工建模（有蓝图参照）。
- Sony Walkman TPS-L2 — berilbaska — by — 11,215 — https://sketchfab.com/3d-models/sony-walkman-tps-l2-cassette-player-3cad4141c9aa4e67ba1d2ab1e5b9d277 — 银河护卫队同款标志性机型；风险：lowpoly 标签、1.1 万面细节有限；与推荐 10 二选一。
- coffee espresso machine saeco_poemia — BonchBryBonch — by — 607,550 — https://sketchfab.com/3d-models/coffee-espresso-machine-saeco-poemia-ed44d015d924440894be1326f94cf44e — 家用意式机，面数偏重。
- Slayer Espresso — robbertvandervelden — by — 1,360,464 — https://sketchfab.com/3d-models/slayer-espresso-907f74c6eb634952925ef2c66bc66670 — 作者自述 very old model，136 万面偏重。
- PB164 Angle Grinder Low — scanimat — by — 11,335 — https://sketchfab.com/3d-models/pb164-angle-grinder-low-8db23dbfd2a54c1c9524931b753292a4 — 老式角磨机实拍扫描（realcapture），"Low" 为降面版；推荐 2 的备选。
- Motorsäge Stihl — fhernand — by — 499,999 — https://sketchfab.com/3d-models/motorsage-stihl-61f9e45afac84e4da5f41f792f920efc — 无描述，50 万面。
- Rotary Engine — kyou0086 — by — 1,656,832 — https://sketchfab.com/3d-models/rotary-engine-fae8a079080c49669502fda3621e893e — 转子发动机备选；无描述、166 万面偏重，与推荐 4 同题材二选一。
- old chainsaw — KatieswayVR — by — 750,616 — https://sketchfab.com/3d-models/old-chainsaw-67ab9611810045a8a253268cdd5ea878 — 作者自述 rough draft，质量风险。

---

## 三、不推荐但记录（落选项）

**许可不合格（by-nc/by-nc-sa/by-nc-nd，仅记录）**
- Grand piano action for simulation — ITEMM — by-nc-nd — 118,165 — 多体仿真用三角钢琴击弦机，结构上是本批最完美的拆解对象，但 ND 禁止改编与再分发（本批最大遗憾）
- Accordion Diatonic Hohner — bgirault — by-nc-sa — 1,000,122
- Motorcycle 4 stroke engine — soliveres — by-nc — 240,910
- Internal Combustion Engine Moto — tflexcad — by-nc — 1,116,032
- Nintendo Game Boy (Original 1989) — lokeig — by-nc — 18,182
- Game Boy Original — dannyp_3d — by-nc — 6,854（同时低于 1 万面）
- Cyclone 9 Radial Engine — flightmaster177 — by-nc-sa — 482,720
- Drum washing machine — D.art — by-nc — 43,266
- Electric Guitar — KangaroOz-3D — by-nc — 3,518（同时低于 1 万面）

**许可不合格（Sketchfab Free Standard，非 CC）**
- Old Gramophone — akselmot — free-st — 5,436（同时低于 1 万面）
- V-twin Engine motorcycle engine — UnforgettableName — free-st — 44,849
- Bally Midway Tron Arcade Machine — big_jojo — free-st — 5,743（同时低于 1 万面）

**面数低于 1 万（虽为 CC-BY，不可拆）**
- Accordion — lisaStalberg — by — 4,332
- Antique Accordion — Canicule — by — 5,172（手风琴品类本批整体面数不足）
- Electric Guitar Stratocaster Red — YieldingMist206 — by — 3,624
- Steinway Upright Piano — boogie4631 — by — 2,154
- Vintage Toaster（Toastmaster 1A1, 1920s）— kommanderkarl — by — 6,701
- Toaster — hoschu — by — 2,766
- Lowpoly Kitchen Blender — AspectStudio — by — 9,822
- Front Derailleur — rhcreations — by — 3,547（自行车变速器品类空缺但模型太小）
- Arcade Joystick — Thanh-Le — by — 9,438；Arcade joystick — ctrlshifttilt — by — 9,280；Arcade Joystick — selkie3d — by — 1,081（街机摇杆品类整体面数不足）
- game_boy_classic — inreality — by — 1,154
- Gramophone — NikolasGaertling — by — 9,952（差 48 面过线，可惜）

**语义不符**
- Tourbillon — pattarrian — by — 2,429,866 — 实为陶艺雕塑（Maarten Stuer，陶瓷一件式作品），非钟表机构

---

## 四、品类缺口备忘（本批未解决，需换渠道）

- **手风琴**：合格面数（≥1 万）且 CC-BY 的模型为 0；现有 1 百万面的是 by-nc-sa。
- **Game Boy**：全部可用版本均 by-nc，唯一 CC-BY 仅 1,154 面。备选渠道：Thingiverse CC0 打印件（如开源 GB 壳+板）。
- **街机摇杆/弹珠机摇杆**：CC-BY 版本全部 <1 万面。
- **自行车变速器（derailleur）**：仅找到 3,547 面的一个。备选渠道：Shimano 官方 CAD 勿用（版权），可找 Gripnail/CAD folk 的 CC0。
- **机械钢琴击弦机**：唯一专业模型（ITEMM）为 by-nc-nd。备选：Thingiverse piano action 打印件（多为 CC-BY）。
- **缝纫机**：全部候选未达推荐线（未逐个查详情，搜索结果以 lowpoly/游戏资产为主）。
