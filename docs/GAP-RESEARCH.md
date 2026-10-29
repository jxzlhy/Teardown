# DJI 拆解馆 · 品类缺口模型调研报告

日期：2026-10-30 ｜ 调研范围：piano action / Game Boy / accordion / tourbillon
判据：许可证仅认 CC0 或 CC-BY 4.0；拆解价值 = 独立零件数 ≥5；单文件 STL / 单网格扫描 = 不可拆（标注）。

## 验证方法与证据可信度说明

- **Thingiverse** 直接抓取被 Cloudflare 403 拦截。改用 Wayback Machine 存档页（`web.archive.org/web/*/thingiverse.com/thing:N`）读取页面内嵌 JSON 的 `license` 字段（本报告标「存档已验证」）；无存档数据的标「需人工确认」。
- **Sketchfab** 使用公开 API（`api.sketchfab.com/v3`，无需 key）逐模型核验 license/顶点数，本报告 Sketchfab 条目全部「API 已验证」。
- **Printables** 页面 license 徽标为客户端渲染，抓取与存档均不可得 → 相关条目标「需人工确认」（打开页面 1 秒即可看到）。
- **Pinshape / GitHub / 二手报道**：Pinshape 页面直接抓取到 license 文本；GitHub 读 LICENSE 文件；Clockwerk license 来自 keepthetime.com 引述（二手）。
- 项目工具链核对：`tools/cad2glb.py` 支持 `step`（gmsh 按 STEP 体积实体分组、每部件一个 node，**可拆**）与 `stl`（二进制 STL → 单 mesh GLB，**不可拆**）。多 STL 分件包需逐件转 GLB 后按文件名合并 node（接入时需补一个合并步骤）。

---

## 缺口 1：钢琴击弦机（piano action）

背景核实：Sketchfab 上最专业的击弦机模型确为 ITEMM 出品且全部 by-nc-nd，API 已验证不可用：
- "Grand piano action for simulation" 59,165v — by-nc-nd（uid 664ce9de…）
- "Upright piano action parts for simulation" — by-nc-nd（uid d347e25f…）
- 一系列 "montant action bracket"（Pleyel/Ravenstein 击弦机支架）也全为 by-nc-nd。

### 候选（按可拆解置信度排序）

**P1. Grand piano with moving parts（icefox1983）** ✅ 推荐
- 来源：https://www.thingiverse.com/thing:4059233
- 许可证：**CC BY 4.0**（存档已验证：页面 JSON license 字段指向 creativecommons.org/licenses/by/4.0/）
- 格式：STL + 3MF 打印排样（PrusaSlicer 布局文件）
- 预计零件数：**高（估计 ≥40 个独立打印件）**——官方描述明确含"fully printed moving parts"（活动击弦机件）、琴键、琴槌、铰链、踏板/踏板杆、铜色板件、琴轮、音板与琴桥（木色件）、琴凳（借自 robertkyu 模型），且"多个零件需打印多份"
- 接入路径：多 STL 分件包 → 逐件 `cad2glb.py stl` → 按 part 名分组合并 node；或直接在映射层按文件名建 partId。**不可用单文件 STL 合并**
- 风险：是「整琴含可动击弦机」而非独立击弦机总成，拆解叙事需自行划组（外壳/键盘/击弦机/踏板）；零件为打印件形状，非真实击弦机比例复刻；部分细节面数低，需 webp 贴图/材质补质感
- 可拆解置信度：**高（license 硬验证 + 描述明确多分件）**

**P2. Working Piano（Tarzxn）**
- 来源：https://www.thingiverse.com/thing:7001091
- 许可证：**需人工确认**（存档页只有 4.6KB 空壳，无 license 数据；reader 只取到描述"basic mechanical piano with working hammers"）
- 格式：STL；预计零件数：中（琴体 + 键 + 锤，官方自述结构"basic"，键槌会断，非耐用结构）
- 接入路径：同 P1（多 STL 逐件）
- 风险：license 未验证前不得采用；零件数可能不足 5 的拆解门槛；尺寸/比例以玩具化为主
- 可拆解置信度：低（暂列备胎）

**P3. Realistic Custom Concert Concert Grand Piano（Sketchfab）** ⚠️ 仅展示备选
- 来源：https://sketchfab.com/3d-models/realistic-custom-concert-grand-piano-1331f07bb85f4a3f9ed3e2f03b244902
- 许可证：CC Attribution（API 已验证）；292,356 顶点
- 格式：GLB 可下载；但为整琴建模，**大概率单网格或少量网格**——需下载验证 node 结构，默认按不可拆标注
- 接入路径：直接 GLB → optimize-glb（webp→draco）；仅可作整机展示件，不满足拆解
- 可拆解置信度：拆解=低；展示=中高

**结论**：**有可行路径**。P1 许可证硬验证 + 明确多分件，是四个缺口里证据最扎实的候选之一；若只做"击弦机特写"而非整琴，可在 P1 的分件里只取键盘+击弦机组件建设备。

---

## 缺口 2：Game Boy 原型机（DMG-01）

背景核实：Sketchfab 可下载 Game Boy 里 by-nc 居多（"Nintendo Game Boy (Original 1989)"、多款 GBC 均 by-nc，API 已验证），但**并非全部不可用**——存在多款 CC-BY：

### 候选（按可拆解置信度排序）

**G1. Nintendo Game Boy（Smoggybeard, Sketchfab）** ⚠️ 待验证网格
- 来源：https://sketchfab.com/3d-models/nintendo-game-boy-021b1586089044278164dadc584abb89
- 许可证：**CC Attribution（API 已验证）**；86,890 顶点 / 166,615 面
- 格式：GLB；描述为"high poly、做旧磨损"整 erleben 模型 → **大概率单网格，需下载后用 inspect-glb.mjs 验证 node/mesh 数**
- 接入路径：GLB → inspect-glb 验证；若单网格 → 只能作整机展示件（拆解落选）；若分件 ≥5 → 直接映射
- 风险：单网格概率高；做旧材质与展馆其他设备的干净质感不一致
- 可拆解置信度：低-中（取决于网格验证）

**G2. DMG-01-Shell（guighub, GitHub）** — 条件可行（需自制内部件）
- 来源：https://github.com/guighub/DMG-01-Shell
- 许可证：**MIT**（LICENSE 文件已验证）
- 格式：STL 分件；预计零件数：**2-3**（前壳完成、后壳未完成；无按钮/主板/屏）
- 接入路径：STL 分件 + **自建程序化示意主板/屏/按键**（须按总则标注"程序化示意内部结构"），合并为设备
- 风险：项目未完成（后壳不兼容原硬件、仅树脂打印验证）；外壳分件数不足以独立达标
- 可拆解置信度：低（作为"外壳真实 + 内部示意"混合路径的素材）

**G3. Nintendo Game Boy DMG-01 model 3D scan（GrabCAD, 2024-11）** ❌ 低置信
- 来源：https://grabcad.com/library/tag/game%20boy（STEP/IGES/STL）
- 许可证：需登录后人工确认；且为**扫描件 → 单实体**，STEP 化也不产生分件
- 结论：预标落选（扫描单网格 + 许可不确定 + 需账号下载）

**已核证据（排除项）**：
- PizzaHandhelds/MGB-SHELL-CAD — **CC BY-NC-SA 4.0**（LICENSE 已验证）→ 不合格，排除（虽含按钮+前后壳分件，可惜许可）
- MouseBiteLabs/Game-Boy-DMG-Color — CC BY-SA 4.0，且仅 1 个屏幕支架 STL → 不适用
- Reddit r/Gameboy "Where can I find DMG-01 internals?"（2024）佐证：**公开渠道不存在完整的 DMG 内部 CAD 分件模型**

**结论**：**无现成完全合格的多分件模型（基本无解）**。可行折中 = G1 验证网格做整机展示，或 G2 MIT 前壳 + 自制示意主板（诚实标注）。社区证据表明"真实内部分件"路线当前无源。

---

## 缺口 3：手风琴（accordion）

背景核实：Sketchfab CC0 过滤检索 **0 结果**（API 已验证）；CC-BY 中确有高面数模型但均为摄影测量/LiDAR 单网格：

### 候选（按可拆解置信度排序）

**A1. Accordion（Northern Heritage Network, Sketchfab）** — 仅展示
- 来源：https://sketchfab.com/3d-models/accordion-36a3b7fcca4146e68bd5da650eca9d37
- 许可证：**CC Attribution（API 已验证，CC BY 4.0）**；865,227 顶点 / 1,731,443 面
- 格式：GLB；扫描类 → **单网格，拆解价值 0**；直接 GLB → optimize-glb（draco 可压到可用体积）
- 可拆解置信度：拆解=无；展示=高（四个缺口里能立刻落地的最高保真展示件）

**A2. Accordion -- Polycam LiDAR（Sketchfab）** — 仅展示
- 来源：uid 59553fbb097e41d9a80a9406fbc0c4f9；CC Attribution（API 已验证）；26,362 顶点
- 单网格扫描，同上，保真低于 A1，可忽略

**A3. Steirische Harmonika beweglich（Printables #1804842）** — 待人工确认
- 来源：https://www.printables.com/model/1804842-steirische-harmonika-beweglich-styrian-accordion
- 许可证：**需人工确认**（页面客户端渲染无法抓取；Printables 上 CC0/CC-BY 常见）
- 格式：STL；描述"风箱可拉开（slightly openable bellows）"→ 可能 ≥5 分件
- 接入路径（若 license 合格）：多 STL 分件 → 逐件转换合并 node；品类为按钮手风琴（Steirische），与"钢琴键手风琴"有偏差需在文案注明
- 可拆解置信度：低-中（取决于 license 与实件结构验证）

**已核证据（排除项）**：
- "Accordion Diatonic Hohner"（Sketchfab 500,022v）— by-nc-sa → 排除
- Thingiverse "Sounding Accordion Reed (WORKING!!!)" — 单零件（一片簧片）→ 不达 ≥5 门槛
- GitHub 无开源机械手风琴（Lingcordion 为 PCB 数字乐器、AccordionMega 为 MIDI 改装，均不适用）

**结论**：**拆解用多零件手风琴：实际无解**（CC0=0，CC-BY 全是单网格扫描，机械分件只有 1 个待验证的 Printables 候选）。建议走"整机展示件（A1）+ 文案不承诺拆解"路线。

---

## 缺口 4：天文陀飞轮 / 高级机芯

### 候选（按可拆解置信度排序）

**T1. 3D-printed Watch with Tourbillon（Christoph Laimer, Pinshape）** ✅ 强烈推荐
- 来源：https://pinshape.com/items/30212-3d-printed-watch-with-tourbillon
- 许可证：**CC BY 4.0（Pinshape 页面直接验证）**；免费（需登录下载，>3000 次下载）
- 格式：**54 个 STL**（51 个可打印件 + 销钉/螺丝），含 Swiss lever escapement、发条盒、3D 打印主发条、陀飞轮框架
- 预计零件数：**≥50 → 拆解价值最高的钟表类候选**
- 接入路径：多 STL 分件 → 逐件 `cad2glb.py stl` → 按名称分组（机芯/夹板/轮系/摆轮/陀飞轮框架/表壳）合并 node
- 风险：Pinshape 需账号登录（人工步骤）；形态为怀表而非"天文陀飞轮"（无天文 complications）——文案可标"机械怀表机芯 · 陀飞轮"
- 可拆解置信度：**高（license + 件数双硬验证）**

**T2. Clockwerk – Three-Axis Tourbillon（Adam Wrigley / aaddaamm）**
- 来源：https://www.thingiverse.com/thing:1624844
- 许可证：**CC-BY（attribution-only，keepthetime.com 专文引述"made everything available under an attribution only Creative Commons license"；Thingiverse 页面存档无 license 字段，属二手验证）**
- 格式：STL + BOM；**99 个组件，其中约 1/3（≈34）为打印件**，其余为标准五金（轴承/销/弹簧）
- 接入路径：打印件 STL 逐件转换；五金件需程序化替代建模（标注示意）
- 风险：license 为二手来源（下载时页面确认一次即可）；三轴陀飞轮非"天文陀飞轮"；非打印件占比高
- 可拆解置信度：中-高

**T3. Astronomical Tourbillon Watch（Binkley-Piratepants, Sketchfab）** ⚠️ 疑似已落选件本人
- 来源：https://sketchfab.com/3d-models/astronomical-tourbillon-watch-2d2b58c30d254982ad2e827d382aedb2
- 许可证：**CC Attribution（API 已验证）**；100,390 顶点 / 203,350 面
- 关键疑点：若这就是此前落选的"3 个匿名网格"模型，则 license 虽合格、网格仍不可拆 → **下载后用 inspect-glb.mjs 验证 mesh 命名与数量再定**
- 可拆解置信度：低（需验证；若 mesh ≥5 且命名可映射则直接反转）

**T4. Printables 陀飞轮备选池（license 均需人工确认）**
- mcmaven "Triple Axis Tourbillon"（#83990，自制三轴陀飞轮，STL 多件）
- A26 "Flying Tourbillon Model 5.2 (Daniels Double Independent)"（#10774，Daniels 独立双轮 + remontoire，功能性多件）
- A26 "Mini Triaxial Tourbillon"（#291688）/ Willie Fiddler "Compact Tourbillon"（#179150）
- 均为多件机械结构；Printables license 徽标无法自动抓取，逐个打开页面确认 CC0/CC-BY 后即可入池

**结论**：**有明确可行路径**。T1（CC BY 4.0 + 54 STL）为四个缺口中最强候选；"天文" complications 无合格模型，建议以"陀飞轮机芯"命名落地，另以 T3/T4 扩充。

---

## 总排序（缺口级 · 可拆解置信度）

| 排名 | 缺口 | 结论 | 首选 | 依据 |
|---|---|---|---|---|
| 1 | 天文陀飞轮/机芯 | ✅ 可行 | Laimer Tourbillon（CC BY 4.0, 54 STL） | license+件数双硬验证 |
| 2 | 钢琴击弦机 | ✅ 可行 | icefox1983 Grand piano（CC BY 4.0, 多分件） | 存档 license 硬验证 |
| 3 | Game Boy | ⚠️ 条件可行（无现成全模型） | Smoggybeard CC-BY 86k 验证网格；或 MIT 前壳+示意主板 | 社区证据：内部 CAD 无公开源 |
| 4 | 手风琴 | ❌ 拆解无解（仅整机展示可行） | Northern Heritage CC-BY 865k 扫描 | CC0=0、CC-BY 全单网格 |

## 附：统一的接入提示
- 所有"多 STL 分件"候选：`cad2glb.py stl` 只产单 mesh，需在接入脚本里按文件逐件转换后合并 GLB node（或每件一 GLB 由 device 配置聚合），**不得把整个文件夹的 STL 先合并成一个再转**。
- STEP 装配体路线本次无合格命中（GrabCAD 唯一 STEP 是扫描单实体）。
- 所有"需人工确认 license"条目在确认前不得进入 `vendor/assets/`。
