# DJI 拆解馆 · 第四批拆解候选调研（round 3 / 第四方向批次）

> 调研日期：2026-10-30 · 方法：Sketchfab 公开 API（curl，search + model 详情），请求间隔 ≥1.2s
> 硬性标准：license = cc0 / by · isDownloadable=true · faceCount 1 万–250 万 · 名称/描述暗示多部件
> **历史教训已内化**：描述可拆 ≠ GLB 可拆。所有"结构可拆性"判断均为基于建模方式（CAD 装配 / 手工分件 / AI 生成 / 照度扫描）的置信度估计，接入前必须 `tools/inspect-glb.mjs` 实测 mesh 数量与命名；单网格即落选。

## 查重基线（已对照 MODEL_INVENTORY.md，100 台）

本项目已有：vintage-microscope 显微镜、hubble-telescope 望远镜（航天）、jet-engine 涡喷、tourbillon/pocket-watch/escapement 钟表、door-lock 门锁、planetary-gearbox/hypoid-gear 齿轮、kitchen-blender 台式搅拌机、smeg-toaster 烤面包机、radio-transceiver 军用电台、drill-press 台钻、hand-drill 手摇钻、angle-grinder 角磨机、retro-multimeter 万用表、orrery 太阳系仪、hydraulic-jack 千斤顶等。以下候选均已避开；相近品类注明差异化逻辑。

---

## 方向 1：精密仪器 / 科研设备

### 推荐 1（本方向最佳）：An optical spectrometer 光学光谱仪
- 作者：WirtualneMuzeaMalopolska（波兰高校博物馆数字化项目，本项目友善来源）
- License：**CC0** · faceCount：**12,094** · Downloadable：是
- URL：https://sketchfab.com/3d-models/an-optical-spectrometer-1cb673f9f1044907a6261e4bb8a63464
- 推荐理由：1876 年德国造博物馆实物，分光计天然多部件（底座、立柱、准直管、观察筒、刻度盘）；品类与已有显微镜/太阳系仪完全错开，面数极低、CC0 许可零风险，是许可+面数最优解。
- 风险：博物馆摄影测量扫描，mesh 可能整体融合；如果 GLB 实测单网格即落选，同作者还有"Pocket sextant"等同源备选。

### 推荐 2：Vintage Sextant 老式六分仪
- 作者：Happymiel4（DAE Howest 游戏资产课程作业）
- License：CC-BY · faceCount：**15,132** · Downloadable：是
- URL：https://sketchfab.com/3d-models/vintage-sextant-39a7bf5a9da94c2c9ca2d9a34d71435f
- 推荐理由：Maya 手工建模 + Substance 手绘，游戏资产流程通常按零件命名（架体、刻度弧、望远镜、动镜/定镜、手柄）；六分仪结构精巧、叙事感强，与钟表板块气质契合。
- 风险：作者未逐件说明；学生作业可能合并网格。备选：同方向 aged sextant（IrisProcess，CC-BY，176,435）。

### 其他候选
| 名称 | 作者 | License | faces | URL | 说明/风险 |
|---|---|---|---|---|---|
| Refracting telescope（Carl Zeiss 1920s） | WirtualneMuzeaMalopolski | **CC0** | 46,208 | https://sketchfab.com/3d-models/refracting-telescope-acefc3a7d4434628bd28f29fceb47b8b | 地面望远镜+支架，与已有 hubble（航天）差异化明确；镜筒/支架/目镜可拆感强；扫描融合风险同上 |
| Refracting telescope（1750s Venice, Semitecolo） | 同上 | **CC0** | 59,616 | https://sketchfab.com/3d-models/refracting-telescope-4d606254893b418998483e1f38a4c127 | 18 世纪威尼斯木铜结构，博物馆级出处 |
| Pocket sextant（James Henri Steward, 19 世纪末伦敦） | 同上 | **CC0** | 280,498 | https://sketchfab.com/3d-models/pocket-sextant-45cf60e598904f26ac8c9f8401e711a7 | CC0 收藏级；折叠式小六分仪，面数偏高 |
| Beckman DU Spectrophotometer（1941） | mzechini | CC-BY | 1,300,441 | https://sketchfab.com/3d-models/beckman-spectrophotometer-878fbaf8f8444c90bcfc6bb822b33354 | 科学史上著名仪器（第一台商用紫外分光光度计）；面数逼近上限，需减面 |
| Antique Balance Scale with Brass Weights | Azura_SQ | CC-BY | 258,242 | https://sketchfab.com/3d-models/antique-balance-scale-with-brass-weights-4335983d5596469ebcd75595a8adbe16 | 名字即多部件（天平+砝码组）；**Meshy AI 生成**，零件结构不可信，低置信 |

---

## 方向 2：工具纵深

### 推荐 1（本方向最佳）：Benchvise assembly 台钳装配体
- 作者：ChinmaySingh
- License：CC-BY · faceCount：**114,688** · Downloadable：是
- URL：https://sketchfab.com/3d-models/benchvise-assembly-a9a9b84680de449994187f552ccae71e
- 推荐理由：**SolidWorks CAD 装配体**，描述逐件列出底座/活动钳口/丝杠等——CAD 装配导出 GLB 时天然多命名 mesh，是全批次结构可拆性置信度最高的候选之一；台钳与已有台钻/角磨机组成"工作台工具"叙事。
- 风险：CAD 转 GLB 常带工程冗余面；丝杠螺纹段面数可能集中。

### 推荐 2：refurbished lathe machine 苏联 1967 老车床
- 作者：cepi7
- License：CC-BY · faceCount：**177,457** · Downloadable：是
- URL：https://sketchfab.com/3d-models/refurbished-lathe-machine-01406e7034fe4b7da32494c6cbf260f2
- 推荐理由：真实机床（克拉斯诺列钦斯克机床厂 1967 年造、2012 年修复）；车床部件天然丰富：主轴箱、卡盘、刀架、尾座、床身、挂轮箱、操纵手柄阵列——是"工具纵深"里部件潜力最大的机型。
- 风险：手工建模的整机，未声明分件；爆炸时卡盘/刀架等细件易丢；面数中高。

### 其他候选
| 名称 | 作者 | License | faces | URL | 说明/风险 |
|---|---|---|---|---|---|
| Soldering Iron Station 电烙铁工作站 | deslancer | CC-BY | 44,296 | https://sketchfab.com/3d-models/soldering-iron-station-563f3a638d0e471baef919d0dacf77c3 | 站体+烙铁+烙铁架+旋钮天然多件；描述为空，需实测；单支烙铁类候选（8k–258k 面另有 3 支）部件太少 |
| DeWalt DC759KA Cordless Drill | jerosolari | CC-BY | 315,204 | https://sketchfab.com/3d-models/dewalt-dc759ka-cordless-drill-023c84c399814304b3f876103faccb98 | 与已有 DeWalt 角磨机品牌续力；钻夹头/电池包/电机/壳体拆解经典；面数偏高，另有 dirty 版（elpatio，318,214） |
| Bench Vice – ChaosWeld | chaosweld | CC-BY | 176,232 | https://sketchfab.com/3d-models/bench-vice-bench-vise-chaosweld-1e54fee4aac54765af61ea9edb38ebae | 台钳备选；作者职业接单建模，质量稳，分件不明 |
| Desk Lathe（抽象台式车床） | Ambiabstract | CC-BY | 7,407 | https://sketchfab.com/3d-models/desk-lathe-7b7ef0cdefdf4a0d9e483a026af98fd2 | 面数极低但"abstract"示意风格，与展馆写实基调不符 |
| Construction laser level on tripod | mirsaid7787 | CC-BY | 119,999 | https://sketchfab.com/3d-models/construction-laser-level-on-tripod-96bf2a8335be4aca8c89351f7c41072f | 激光水平仪方向唯一像样结果；主机+云台三脚架两段式，内部无从谈起；描述为空，低置信 |

---

## 方向 3：厨房电器

### 推荐 1（本方向最佳）：KitchenAid Stand mixer 厨师机
- 作者：MelissaVerdonck
- License：CC-BY · faceCount：**96,748** · Downloadable：是
- URL：https://sketchfab.com/3d-models/kitchenaid-stand-mixer-716dfa11eb8f4020833584a3c3d09d5d
- 推荐理由：Tilt-head 厨师机是厨电里拆解叙事最强的机型：机头、搅拌碗、打蛋笼/面钩、速度拨杆、翻盖铰链、底座脚垫件件独立；与已有台式搅拌机（kitchen-blender）完全差异化；面数适中。
- 风险：学生高模作业，可能为渲染优化而焊接部件；需实测碗/搅拌头是否独立 mesh。

### 推荐 2：Old coffee grinder 手摇咖啡磨豆机
- 作者：dashkilya
- License：CC-BY · faceCount：**10,650** · Downloadable：是
- URL：https://sketchfab.com/3d-models/old-coffee-grinder-3ee32fff29074d869949cfd61f8467c4
- 推荐理由：描述强调"金属+实体零件"的老式手摇磨：曲柄、顶盖、料斗、磨芯、抽屉、机身——部件小而清晰，爆炸图效果好；面数低，移动端友好；咖啡磨与现有厨电零重叠。
- 风险：面数低意味着细节有限；抽屉/磨芯若与机身融合需手工拆分。备选：Classic coffee grinder（hgasco，CC-BY，19,040，描述空）、Coffee Grinder PBR（omarfaruqtawsif32，CC-BY，76,645，首 Substance 作品）。

### 其他候选
| 名称 | 作者 | License | faces | URL | 说明/风险 |
|---|---|---|---|---|---|
| Handheld Immersion Blender 手持均质机 | spartanbranding | CC-BY | 20,874 | https://sketchfab.com/3d-models/handheld-immersion-blender-3d-model-63495aa4f33741d892e5324b8ee566a1 | 与已有台式搅拌机的"差异化"解法之一（手持/便携）；商用产品图渲染向，实际可拆结构少（柄+杆+刀头） |
| La Marzocco Home GS3 咖啡机 | mvmvsvn | CC-BY | 226,736 | https://sketchfab.com/3d-models/la-marzocco-home-gs3-espresso-machine-59efee4d73ee415198eba03e0704d3f8 | 半专业咖啡机，冲煮头/手柄/蒸汽棒/压力表可拆点多；自述"basic shapes 搭建"——件与件分离概率高但造型偏方；面数中高 |
| （烤面包炉 toaster oven 方向） | — | — | — | — | **整体放弃**：与已有 smeg-toaster 品类重叠，且搜索结果要么低模（9,120）要么百万面杂物包，无合格候选 |

---

## 方向 4：复古通信

### 推荐 1（本方向最佳，全批次最强证据）：Vintage Radio 1940s — Admiral 7T10 电子管收音机
- 作者：ponchoguy
- License：CC-BY · faceCount：**220,857** · Downloadable：是
- URL：https://sketchfab.com/3d-models/vintage-radio-1940s-7724f81ad4e043079b7bf4b16146c087
- 推荐理由：描述明确写出"**Modeled with the full internal components**"（完整内部元件建模）——电子管、变压器、扬声器、底盘俱全，是本批次唯一描述级确认含内部的候选；与已有军用电台（radio-transceiver）差异化：民用木壳电子管收音机，年代感与教育价值都更强。
- 风险：内部件是建模件还是装饰块需 GLB 实测；木壳+布面扬声器材质在 draco/webp 后的观感需验证。

### 推荐 2：Morse-Vail Telegraph Key 莫尔斯-维尔电报键（史密森尼）
- 作者：**Smithsonian（官方机构账号）**
- License：**CC0（公有领域）** · faceCount：**150,000** · Downloadable：是
- URL：https://sketchfab.com/3d-models/morse-vail-telegraph-key-a5b108e3132d46b696c36310c2314ed8
- 推荐理由：博物馆级出处+公有领域，是全批次许可最干净的候选；电报键的杠杆/触点/底座/接线柱是天然分件；复古通信"第一环"，历史叙事极强。同作者另有 Chester Telegraph Relay（CC0，150,000）可作备选。
- 风险：史密森尼扫描件多为整网格扫描，分件概率存疑；若单网格，可退到 CAD 重拓扑版 Old Telegraph Key（topfrank2013，CC-BY，60,398，源自 technoscience3d 的 CAD 模型重拓扑）。

### 其他候选
| 名称 | 作者 | License | faces | URL | 说明/风险 |
|---|---|---|---|---|---|
| Western Electric 500 旋转拨号电话 | vicky12218 | CC-BY | 182,444 | https://sketchfab.com/3d-models/western-electric-500-vintage-rotary-telephone-4425a0d9629c420788cf6b0d072f4564 | 型号精确、PBR 4K、含玻璃材质；听筒/壳体/拨盘/电话线分件潜力大；未声明分件 |
| Regency TR-1 晶体管收音机（1954，史上第一台商用晶体管收音机） | cyclonicninja69 | CC-BY | 60,182 | https://sketchfab.com/3d-models/vintage-portable-transistor-radioregency-tr-1-c01869269a8b4bd2a8a05b8162fe7a11 | 与 Admiral 7T10 二选一时的差异化（晶体管 vs 电子管）；壳+旋钮+刻度盘为主，内部未知 |
| Antique 1930s Rotary Telephones | Mad_Lobster_Workshop | CC-BY | 52,336 | https://sketchfab.com/3d-models/antique-1930s-rotary-telephones-c08787c11a494006afbc50a435e7c4c8 | 自述含多纹理变体和"standard/unhooked 两态"——两态说明听筒是独立件，分件置信度提升 |
| Walkie Talkie | afjalymail78692 | CC-BY | 37,946 | https://sketchfab.com/3d-models/walkie-talkie-8a7eccb7a3ce4368a9d768e684f20bcc | 对讲机方向仅存的 CC-BY 可下载结果；自述 low poly，拆解价值低 |

---

## 接入后复核（2026-10-31）

- Antique 1930s Rotary Telephones（Mad_Lobster_Workshop，CC-BY，52,336）：下载实测
  13 节点仅 5 合并网格，bbox 1.82m 宽 = **两台并排整机**（复数属实）——非单一拆解
  对象，且为馆内第三台电话（WE500 已 26 网格精细分件）→ 落选。

## 落选项与原因

| 候选 | 落选原因 |
|---|---|
| Toaster oven（整方向） | 与已有 smeg-toaster 品类重叠；候选仅 960 面低模或 1M+ 杂物包，均不达标 |
| Walkie talkie 方向整体 | 唯一结构像样的 abg_3d 版为 **CC-BY-NC**（违反硬标准）；其余全部 <17k 面低模或科幻风；与已有 radio-transceiver 功能重叠且无可拆证据 |
| Vintage Radio Guts (Free Raw Scan)（kryik1023，CC-BY，500k） | "内部"吸引但为 RealityCapture 视频扫描 raw 件，几乎必为融合网格；且 500k 贴上限 |
| Vintage bench vise（ibrahimonardo）/ CNC Lathe T250（oreshker） | 均 **Meshy AI 生成**，零件结构不可信，按"描述可拆≠GLB可拆"教训直接降级 |
| Antique Balance Scale with Brass Weights（Azura_SQ） | 同为 Meshy AI 生成；名字虽暗示多件，但 AI 输出通常单网格，列为低置信观察项而非推荐 |
| Sextant（alienor.org，500k）/ Ulugh Beg Observatory Sextant（6.9M） | 前者 **CC-BY-NC-ND** 违反许可；后者 NC + 面数爆表 |
| 19th Century Telegraph Key（technoscience3d，737k）/ J.H. Brunell（GlobalDigitalHeritage，192k）/ Feldfernschreiber（mitkrakow，137k） | 均为 **CC-BY-NC 或 NC-SA**，许可不达标 |
| Beckman DU Spectrophotometer | 未直接落选但列为方向 1 备选末位：1.3M 面逼近上限、需减面，且扫描融合风险 |
| Black & Decker Drill（Qlone，183k） | **CC-BY-ND**（NoDerivs）禁止拆解改形，违反硬标准 |
| Cordless Drill（Sbell_Reality3D 1.87M / 75K 两版） | 75K 版可用但被 DeWalt DC759KA（品牌一致性更好）覆盖；1.87M 版超预算 |
| espresso machine saeco_poemia（BonchBryBonch，607k）/ Slayer Espresso（1.36M） | 面数过高需重减面；GS3 已覆盖该品类 |
| Pipe Organ Espresso Machine（ehcawen） | CC-BY-NC |

## 排序说明

排序权重：结构可拆性（CAD 装配 > 手工分件描述 > 手工无声明 > 扫描 > AI 生成）> 许可（CC0 > CC-BY）> 面数适中（≤300k 优先）> 品类差异化（避开 100 台已收录）。
**接入前强制动作**：对每个入选 UID 下载 GLB 后先跑 `tools/inspect-glb.mjs` 看实际 mesh 数量/命名，单网格即弃，按各方向备选顺位递补。
