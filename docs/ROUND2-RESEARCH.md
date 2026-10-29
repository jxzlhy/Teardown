# DJI 拆解馆 · Round 2 拆解候选调研（Sketchfab）

- 日期：2026-10-30 · 数据源：Sketchfab 公开 API（curl，search + model detail，均 isDownloadable=true）
- 查重基线：MODEL_INVENTORY.md（96 台 / 788 部件 / 31 品牌，2026-10-30 版）。本批候选与现有 96 台无一重名；相邻品类已核对：手摇留声机(gramophone)≠电唱机、Cherry MX 轴体解剖≠Model M 整键、弹珠台(pinball)≠街机柜、Santa Cruz V10 整车≠前叉单体、三角钢琴≠吉他/鼓/萨克斯。
- 判定铁律：本报告仅按"许可 + 面数 + 文本信号"预筛；**所有候选接入前必须 `tools/inspect-glb.mjs` 复核 mesh 数量与命名，单网格即落选**（历史教训：描述可拆 ≠ GLB 可拆）。
- 许可记号：[by]=CC-BY 可推荐；[by-nc*]=只记录不推荐；[free-st]=Sketchfab 自有许可，未授权前只记录。
- 面数硬标准：1 万–250 万（电吉他方向另按需求 ≥10 万）。

---

## 方向 1 · 乐器纵深

### 1a. 电吉他（要求 faceCount ≥10 万）

1. **Fender Stratocaster「Tequila Sunrise」** · dark_igorek · [by] · 206,344 faces / 106,557 verts
   https://sketchfab.com/3d-models/a393cf85ebf84a398d9c7636eb3fd6dc
   理由：面数达标、作者高产且建模规整（同作者 C64/A500 系列质量稳定）；吉他天然多分件（琴颈/拾波器/护板/旋钮/琴桥）。
   风险：未声明分件结构，需 GLB 复核 mesh 数。
2. **Fender Stratocaster（黑·Clapton 款）** · emcnaught · [by] · 502,514 faces / 255,419 verts
   https://sketchfab.com/3d-models/19dc452b4ca94afda2742009ec943304
   理由：面数充足、"Modeled from scratch"手工建模，细节概率高。
   风险：可能整体单网格+高模；50 万面对移动端偏重，需压缩。
- 记录：Ryan_Nein Strat（[by] 373,290）、Les Paul（mwfontes [by] 707,500，无描述）、Ibanez Fully Rigged（[by] 1,766,038——rigged 通常=单一蒙皮网格，拆解风险高，仅作备选）、kiksart 旧化 Strat（[by] 31,129 低于 10 万线）。

### 1b. 架子鼓 drum kit

1. **Just a Couple of Drum kits** · PippyJ · [by] · 175,664 faces / 91,924 verts
   https://sketchfab.com/3d-models/73d77993f54746b5864d8079d65a4cd3
   理由：含两套鼓组，鼓/镲/支架天然为独立网格；面数适中。
   风险：场景拆出件，可能含重复套件需挑选。
2. **Drum Kit** · art.katja · [by] · 86,020 faces / 45,032 verts
   https://sketchfab.com/3d-models/898f2f4ba1704abe9c784066e2b0f751
   理由：描述明确列出底鼓/军鼓/嗵鼓/落地鼓/镲片等部件清单，分件信号最强。
   风险：部件是否各自独立 mesh 仍需复核。
- 记录：Tama Drum Kit（robcantuart [by] 39,248）；⚠ Chenchanchong「Drum kit」与 Serg.Morgun 面数/顶点完全相同（38,704/21,675），疑似搬运件，规避。

### 1c. 机械节拍器 metronome

1. **Metronome – Wittner Taktell Piccolo** · KrankJoran · [by] · 108,908 faces / 54,833 verts
   https://sketchfab.com/3d-models/ad30a99337f04c97b0e4819ec1231779
   理由：Fusion 360 CAD 建模 → 装配体分件概率高（壳体/摆杆/发条/刻度板）；品牌实物。
   风险：CAD 渲染件可能仅保留整体化输出；产品级精细但摆锤机构内藏件未必建模。
- 本方向仅 1 个达标候选：weekless Vintage Metronome（[by] 4,606）、AlexKurts（[by] 2,980）、loban32（[by] 1,200）均低于 1 万面下限 → 落选。**节拍器为单推荐方向。**

### 1d. 电唱机 turntable / vinyl player

1. **Turntable ION Audio Vinyl Transport** · TemmieTim · [by] · 23,126 faces / 12,402 verts
   https://sketchfab.com/3d-models/c7aa526b201e41ad8ae67bf3806cb2e6
   理由：含 9 段动画（仓盖/唱臂/转盘分件概率极高），作者按手头实物建模；体积小转换友好。
   面数偏低但结构与许可优先。
   风险：消费级塑料机型细节一般。
2. **Vinyl player Pro-Ject E1** · axxxo · [by] · 2,090,320 faces / 1,045,718 verts
   https://sketchfab.com/3d-models/a1ee56b1592c47b0a95351dbbd355743
   理由：HiFi 实物复刻、细节极高（转盘/唱臂/配重/皮带轮分件期望强）。
   风险：贴着 250 万面上限，必须 draco+webp 深压，移动端吃力。
- 记录：Technics SL-1210MK2（Geug [by] 22,328，DJ 经典；描述自述"被平台禁售后免费"，来源敏感性需评估）；Record player（K- [free-st] 3,994,278 超上限且许可不符）。

### 1e. 萨克斯 saxophone

1. **Charlie "Bird" Parker's Alto Saxophone（King Super 20, 1947）** · cmcsteen · [by] · 100,000 faces / 49,242 verts
   https://sketchfab.com/3d-models/1670dd6dfd8f4f0ca910cd6c81c0e9de
   理由：名琴叙事与展馆气质契合；按键/喇叭口/拉管结构天然多件；面数恰在门槛。
   风险：乐器模型常做成 1-2 个整体网格，按键是否独立需复核。
2. **saxophone alto** · ANDRIANIAINAToky · [by] · 104,547 faces / 54,175 verts
   https://sketchfab.com/3d-models/08448f4bfbca474b80ba35a571648a27
   理由：作者免费分享、面数达标、Blender 建模。
   风险：同上，按键/连杆分件未知。
- 记录：Alto Saxophone（Jonivan.Carter [by] 302,976，"85% accuracy"备选）。

---

## 方向 2 · 复古计算机

### 2a. Commodore 64

1. **Commodore 64 (Full Pack)** · dark_igorek · [by] · 132,448 faces / 72,819 verts
   https://sketchfab.com/3d-models/1f43612fa2d54041bbe2bdff8164c2cd
   理由："Full Pack"含主机+外设（磁带机/磁盘机等），天然多对象；面数适中。
   风险：需确认外设件齐全且非合并网格。
2. **Commodore 64 (Computer)** · dark_igorek · [by] · 63,691 faces / 34,419 verts
   https://sketchfab.com/3d-models/3da4b1bade284fdb94d34573e9ff7002
   理由：同一作者单机版，可与 Full Pack 二选一或互补；键盘键帽分件期望较高。
   风险：键帽若整体雕刻则拆解层次有限。
- 记录：digitalheritageaustralia C64（[by] 48,360，ACMI 博物馆数字化，扫描件单网格风险高）；Urpo C64（[by-nc] 1,464）；SX-64 便携版（mitkrakow [by-nc-sa] 275,969，许可不符很可惜）。

### 2b. Amiga

1. **Commodore Amiga 500** · dark_igorek · [by] · 53,759 faces / 30,531 verts
   https://sketchfab.com/3d-models/9c21f636edd44371ac81ce1c3ff6c987
   理由：方向内唯一达标者，作者与 C64 系列同源、质量可预期。
   风险：与 C64 同作者同风格，建议二选一以保持品类差异化。
- 落选：Amiga 1000（Timescade [by] **111 faces**，占位级模型）。

### 2c. classic Macintosh

- **无达标推荐**。唯一候选 Macintosh 128K (1984)（Darren.Hogan，[by-nc]，99,906 faces）许可为 by-nc → 只记录不推荐：
  https://sketchfab.com/3d-models/70e8f2c87fec4cde8ba6d6cea00edd35
  馆内已有 22 台 Apple 官方机型，此方向非缺口，可搁置。

### 2d. IBM Model M keyboard

1. **IBM Model M Keyboard** · timblewee · [by] · 64,908 faces / 47,066 verts
   https://sketchfab.com/3d-models/63aec0874c184b53becb74b792588e69
   理由：与馆内 Cherry MX 轴体解剖形成"轴体→整键"叙事互补；键帽/上下壳/线缆分件期望高。
   风险：键帽可能是整体阵列网格，需复核。
2. （无第二达标）**IBM Model M SSK Industrial** · snacksthecat · [by] · 2,559,430 faces
   https://sketchfab.com/3d-models/37589428db2e4604a3a9919d00148396
   理由：630 张照片摄影测量重建，纹理真实。
   风险：**超出 250 万面上限**且扫描件=单网格，列落选。

### 2e. 复古街机机柜 arcade cabinet

1. **street fighter arcade cabinet** · leoxx300 · [by] · 21,541 faces / 10,949 verts
   https://sketchfab.com/3d-models/0c36e287218543e3b1aeb729c24a4563
   理由：与馆内弹珠台形成"游戏厅"品类对；机柜=框体/屏幕/控制面板/投币门，结构层级清晰。
   风险：面数偏低，细节依赖贴图。
2. **The House of the Dead Arcade cabinet** · Songti · [by] · 14,248 faces / 7,731 verts
   https://sketchfab.com/3d-models/e03d6a5f5efd49d19cfb7d95a27ad363
   理由：带 1 段动画（暗示分件），光枪机型差异化。
   风险：IP 联动机型（世嘉/HotD 商标），公开展示需注意非商用边界。
- 落选：Neo-Geo Cabinet（johnstone [by] 183 faces）；sbabineau/joshtmc（约 2k faces 过低）。

---

## 方向 3 · 家电

### 3a. 意式咖啡机 espresso machine（结构型）

1. **La Marzocco Home GS3** · mvmvsvn · [by] · 226,736 faces / 125,409 verts
   https://sketchfab.com/3d-models/59efee4d73ee415198eba03e0704d3f8
   理由：专业机型结构最丰富（冲煮头/蒸汽棒/压力表/滴水盘/侧板），结构型拆解的理想主角。
   风险：作者自述"basic shapes 拼装"，分件可能少而大块——反而利于拆解分层。
2. **coffee espresso machine Saeco Poemia** · BonchBryBonch · [by] · 607,550 faces / 306,855 verts
   https://sketchfab.com/3d-models/ed44d015d924440894be1326f94cf44e
   理由：家用机型差异化，与馆内 Smeg 烤面包机/搅拌机组成厨电线；面数充裕。
   风险：60 万面需压缩；内部锅炉/泵未必建模。
- 记录：Slayer Espresso（robbertvandervelden [by] 1,360,464，"很旧的模型"备选）；Willoughsby（KWojcik [by] 29,804，La Pavoni 复古杠杆机，风格化）；Pipe Organ Espresso（[by-nc] 记录不推荐）。

### 3b. 吸尘器 vacuum

1. **Upright Dyson Vacuum Cleaner** · rhcreations · [by] · 16,274 faces / 8,193 verts
   https://sketchfab.com/3d-models/26354cd6800744289bc1754cab8dbd4b
   理由：戴森直立机的透明集尘腔/气旋组是天然拆解叙事；与馆内无同类。
   风险：面数仅 1.6 万，气旋细节有限。
2. **"Saturnas" vacuum cleaner** · Sergey.Khanin · [by] · 39,454 faces / 23,633 verts
   https://sketchfab.com/3d-models/f233571565c5443185a8054a3579e456
   理由：复古罐式吸尘器，与展馆复古调性契合，面数适中。
   风险：苏制老电器品牌认知度低；软管/软线分件未知。
- 落选：rescue3d 工业吸尘器（[by] 4,571 低于下限）；两款扫地机器人均为 low poly。

### 3c. 电风扇 desk fan

1. **Retro Fan** · dylanheyes · [by] · 159,463 faces / 77,561 verts
   https://sketchfab.com/3d-models/45bccd8afa834e84b690fb91e34f9262
   理由：描述明示"可拆卸的插头与线缆"+动画 → **分件已被文本证实**；扇叶/护网/底座结构清晰。
   风险：几乎无，本方向最强候选之一。
2. **Retro-style Desk Fan** · futaba_blender · [by] · 20,416 faces / 10,749 verts
   https://sketchfab.com/3d-models/79bb384f2ed545a5ae8c2b9cfa06cd8f
   理由：复古虚构机型规避商标问题，面数适中。
   风险：分件未知。
- 记录：Zanderart Desk fan（[by] 20,408，clean UVs 备选）；plazma019 Rigged Free（[free-st] 记录）；zhixson（[by] 300 faces 落选）。

### 3d. 缝纫机 sewing machine

1. **Singer 15 – Old Sewing Machine** · Pepego · [by] · 55,723 faces / 27,485 verts
   https://sketchfab.com/3d-models/65e18a7f558c42b28cf090858071b744
   理由：Singer 15 经典黑金机型，机臂/手轮/针板/梭芯结构期望强；贴图还原认真。
   风险：内部梭床机构未必建模，需 mesh 复核。
2. （无严格达标第二候选）**Retro/Sci-Fi Sewing Machine** · bloodmeat08 · [by] · 9,962 faces
   https://sketchfab.com/3d-models/1e46878101394d4598dac171399686a5
   理由：差 38 面到下限，风格化处理。
   风险：低于硬标准、科幻风格与展馆不符。
- 记录：Singer kl.15-30（mitkrakow [by-nc-sa] 229,833 许可不符）；CharlesNG Old Sewing Machine（[free-st] 141,331）；halilkantarci Elna Supermatic（[by] 5,301 低于下限）。

---

## 方向 4 · 精巧机械

### 4a. 挂锁 padlock（内部锁舌）

1. **Combination padlock（letter-gate 机关锁）** · WirtualneMuzeaMalopolska 博物馆 · [by] · 877,272 faces / 442,239 verts
   https://sketchfab.com/3d-models/756916ba62b7489294fc9c862503c53d
   理由：描述明确这是"信闸式机关锁/魔术锁"，机构叙事一流；博物馆 CC-BY。
   风险：**博物馆摄影测量件概率极高 → 闭合单网格、内部锁舌大概率未建模**，需优先 GLB 复核。
2. **Combination lock** · sky0net · [by] · 554,680 faces / 276,879 verts
   https://sketchfab.com/3d-models/b8100aaf195947a683c23f609f77b068
   理由：Blender 游戏向建模，转盘/锁体/锁梁分件概率高于扫描件。
   风险：描述无结构信息；55 万面偏重。
- 记录：ahmagh2e Combination Lock_10_MB（[by] 14,948，达标但无结构信息）；hugopetersons（[free-st] 104,772）；落选：pavito（3,426）、RED2000（3,496）、tediuminteractive（1,714）、Planetrix23（1,237）、Aether5（5,040）均低于 1 万面下限。

### 4b. 门锁 door lock mechanism

1. **Door Locking Mechanism（百年老锁装配体）** · ReAnimate.xyz · [by] · 335,985 faces / 167,387 verts
   https://sketchfab.com/3d-models/6cdf6da929644ec09bfc6ff6fe0d3528
   理由：**描述明示"exploded animation 提供装配语境"→ 分件已被动画证实**，是本轮全部候选中拆解确定性最高的模型；与馆内擒纵/陀飞轮组成"机构"线。
   风险：面数 33.6 万适中偏上；需确认动画节点可静态导出。
2. **Door Lock** · theeena · [by] · 139,269 faces / 69,972 verts
   https://sketchfab.com/3d-models/9f696c9514484c828b6d353ca05da679
   理由：面数达标、许可合规，作为锁体结构备选。
   风险：零描述，结构完全未知。
- 落选：zdig Door Lock mechanism（[by] 696 faces）；Handforged lock（landessammlungen-noe [by-nc] 407,612 许可不符）。

### 4c. 自行车前叉避震 fork —— 方向落选

- Sketchfab downloadable 检索（"bicycle suspension fork"/"suspension fork mountain bike"/"rockshox"变体）只返回整车：Mountain Bike GT Avalanche 2.0（aero3d.org [by]）。馆内已有 Santa Cruz V10 整车（17 部件），再入整车属重复品类；无独立前叉避震单体模型 → **方向放弃**。

### 4d. 调速器 centrifugal governor —— 方向落选

- 四组检索（"centrifugal governor"/"flyball governor"/"steam engine governor"/"governor"）在 downloadable=true 下均为 0 或无关结果（总督府/人像扫描等）→ **方向放弃**。馆内可用瑞士擒纵/陀飞轮/行星齿轮箱覆盖机构叙事，无硬缺口。

---

## 落选项与原因（汇总）

| 候选 | 方向 | 原因 |
|---|---|---|
| IBM Model M SSK（snacksthecat, 2,559,430） | 复古电脑 | 超 250 万面上限；摄影测量单网格风险 |
| Amiga 1000（Timescade, 111 faces） | 复古电脑 | 占位级低模，非真实资产 |
| Neo-Geo Cabinet（johnstone, 183 faces） | 复古电脑 | 占位级低模 |
| Macintosh 128K（Darren.Hogan, 99,906） | 复古电脑 | [by-nc] 许可不符（馆内 Apple 已 22 台，非缺口） |
| Commodore SX-64（mitkrakow, 275,969） | 复古电脑 | [by-nc-sa] 许可不符 |
| C64（digitalheritageaustralia, 48,360） | 复古电脑 | 博物馆扫描件单网格风险（许可合规，仅记录） |
| Drum kit（Chenchanchong, 38,704） | 乐器 | 面数/顶点与 Serg.Morgun 完全一致，疑似搬运件 |
| Vintage Metronome（weekless, 4,606）等 4 款 | 乐器 | 低于 1 万面下限 → 节拍器仅剩单推荐 |
| Record player（K-, 3,994,278, [free-st]） | 乐器 | 许可不符 + 超 250 万面上限 |
| Technics SL-1210MK2（Geug, 22,328） | 乐器 | 许可合规但描述自述"被禁售后放出"，来源敏感，暂缓 |
| Ibanez Fully Rigged（1,766,038） | 乐器 | rigged 蒙皮件单网格概率高，列备选不进前 2 |
| hugopetersons Combination lock（104,772） | 精巧机械 | [free-st] 许可不符 |
| pavito/RED2000/tediuminteractive/Planetrix23/Aether5 各挂锁 | 精巧机械 | 全部低于 1 万面下限 |
| Handforged door lock（landessammlungen-noe, 407,612） | 精巧机械 | [by-nc] 许可不符 |
| zdig Door Lock mechanism（696 faces） | 精巧机械 | 低于面数下限 |
| 自行车前叉（全方向） | 精巧机械 | 无独立前叉 downloadable 模型，仅整车（与馆内 V10 重复） |
| 离心调速器（全方向） | 精巧机械 | Sketchfab downloadable 结果为 0 |

## 本轮前 2 推荐 · 全局排序摘要

按 结构可拆性 > 许可 > 面数适中 > 品类差异化：

1. **门锁机构 ReAnimate.xyz**（分件被爆炸动画证实，机构线强）— 方向4
2. **Retro Fan dylanheyes**（插头/线缆可拆被文本证实，家电线）— 方向3
3. **La Marzocco GS3 / Saeco Poemia**（咖啡机双档，厨电线补全）— 方向3
4. **C64 Full Pack dark_igorek**（复古电脑缺口主力）— 方向2
5. **Drum kits PippyJ / art.katja**（乐器纵深，部件清单明确）— 方向1
6. **ION Vinyl Transport**（9 段动画暗示分件，与留声机差异化）— 方向1
7. **Stratocaster dark_igorek / emcnaught**（面数达标，待 mesh 复核）— 方向1
8. **Singer 15 Pepego**（缝纫机唯一达标）— 方向3
9. **timblewee Model M**（与 Cherry MX 轴体叙事互补）— 方向2
10. **街机柜 leoxx300 / Songti**（面数偏低但品类新增）— 方向2
11. **挂锁双候选**（博物馆机关锁叙事最强但单网格风险也最高，接入前必须先验 mesh）— 方向4

**接入前必做**：`tools/inspect-glb.mjs` 复核每个 GLB 的 mesh 数与命名；单网格直接弃，按本清单顺延。
