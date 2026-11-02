# 格物馆 · 优化执行记录（PROJECT_OPTIMIZATION_LOG）

> 规则：每完成一次整改就追加一条，**只写可核实事实**（改了什么文件、跑了什么命令、结果数值、遗留什么）。
> 与 `AUTONOMOUS_LOG.md` 的分工：这里是"审计驱动整改"的专用台账，`AUTONOMOUS_LOG.md` 仍是自主研发总账。
> 状态标记：`已实施` / `已验证` / `部分完成` / `未实施（仅诊断）`

---

## 2026-11-02 · 第 0 轮：全维度审计（诊断轮，未改动业务代码）

### 修改内容
| 文件 | 动作 |
|---|---|
| `docs/audit/MASTER_PROJECT_AUDIT.md` | 新建：用户审计指令原文归档（先确认不存在，未覆盖历史） |
| `docs/audit/PROJECT_AUDIT_REPORT.md` | 新建：审计报告 |
| `docs/audit/PROJECT_ISSUES.md` | 新建：问题清单（P0×2 / P1×9 / P2×15 / P3×14 / IDEA×6 + 撤销 5 条误报） |
| `docs/audit/PROJECT_ROADMAP.md` | 新建：Phase 0–7 路线图（含依赖顺序） |
| `docs/audit/PROJECT_AUDIT_SCORE.md` | 新建：十维评分 75/100 |
| `docs/audit/PROJECT_OPTIMIZATION_LOG.md` | 本文件 |
| `README.md` / `docs/AI_HANDOFF.md` / `AGENTS.md` | 追加审计文档索引入口 |

**业务代码零改动**（遵循指令 §七"先诊断后动手"）。取证脚本全部写在 `/tmp`，未落入仓库。

### 验证命令与结果
| 命令 | 结果 |
|---|---|
| `npm run build` | ✓ 2.74s；dist 274MB；three 806KB(gzip 209KB) / DeviceViewer 218.5KB(80KB) / index 108.6KB(42.5KB) |
| `npm run lint:devices` | ✓ 0 错误 / 11 警告（era 覆盖 70/117；知识库 20/20；品牌 33/39 核证；mech 3 台 0 失败） |
| `npm run smoke` | ✓ 32 项全过（含移动端 sheet/剖切间距/视角预设/无控制台错误） |
| `npm audit --omit=dev` | ✓ 0 漏洞 |
| `npm audit` | 2 项（esbuild GHSA-67mh-4wv8-2f99 high ⇒ vite≤6.4.3，仅 dev） |
| 自建 GLB 取证（117 文件解析） | 226.3MB / DRACO 117·117 / 有纹理 97 台全 webp / ≥4096 纹理 14 台 / >50 万三角 9 台 / >6MB 10 台 |
| 浏览器实测（Chrome 156 + Metal，Vite dev） | 大厅 50 请求·2.39MB·canvas 0；action4 94 请求·6.01MB·heap 36.9MB·60fps；v6-engine 128 请求·24.4MB·heap 115.2MB·60fps |
| 运行时 WCAG 对比度扫描 | 夜厅 262 节点/23 class 不达标（最差 1.93:1）；**日厅 109 节点/81 class（最差 1.16:1）**；日厅设备页 6 节点（1.62:1） |
| 移动端 390×844 实测 | 无横向溢出；触控 <44px 目标 128/299；导视 `hall-link` 右边界 438px（越界 48px） |
| 字段覆盖率统计 | specs 117 · tour 115 · xrayShellIds 115 · demos 20 · quality 19 · mech 3 · assembleStep 2 · realSizeMM 1 |
| 截图 | 14 张，`/tmp/audit/`（审计轮临时保存，Phase 2 起改落 `docs/design/screenshots/audit-2026-11/`） |

### 关键结论（供后续整改对照）
1. **P0×2**：14 台 ≥4096 纹理（v6-engine 估算显存 3259MB、phone4apro 含 8192²）；BVH 只在测量工具启用，主悬停/点击拾取无加速，而 9 台 >50 万三角。
2. **P1 可信度三连**：2 台 TODO 占位展品在馆；四套数字互相矛盾（117/110/104/104）；日厅对比度大面积不达标。
3. **P1 许可**：3 台 CC-BY-NC + 1 台 Sketchfab Free Standard + 1 台 GPL-3.0 随 dist 分发；35/117 无 `modelCredit` 字段；lint 署名规则是自证循环。
4. **架构加分项已确认**：切台竞态防护、dispose 成对释放、Cache Storage 存原始字节、路由级分包与按台懒加载——这些**不许在后续重构中回退**。

### 撤销的误报（避免后续重复排查）
- countach-lpi800-4 许可矛盾 → 实为 CC-BY（采用件 uid `9c94c70a`，NC 属另一候选件），直查 `docs/credit-research-raw.json` 证伪。
- jet-engine "Free Standard" → 实为 CC-BY 4.0（`src/devices/jet-engine.js:26`）。
- "悬停每帧射线" → 实为 `hoverDirty` 脏驱动；真问题是未走 BVH。
- "日厅 `.nc-badge` 1.65:1" → 运行时实测 `rgb(111,101,83)` = 5.08:1 合格。
- "20 台纹理未走 webp" → 97 台有纹理者全部 webp，其余 20 台本就无纹理。

### 未竟验证（下一轮补做）
- hover 帧耗时基线（探针脚本 `page.evaluate` 断言缺陷崩溃，未取数）→ Phase 0-A 前置。
- 切台往返 heap 曲线（同上）→ Phase 3 前置。
- 真机（iOS/Android/集显 Win）、弱网首载、读屏走查、生产 HTTP 头。

### 下一步（已排定，按 ROADMAP Phase 0）
1. 0-A BVH 回补主拾取（先取 hover 基线，再改，再复测 p95）。
2. 0-C TODO 硬闸 + 2 台占位展品下线（成本最低、止血最快）。
3. 0-D 生成物重跑 + `tools/lint-consistency.mjs`。
4. 0-B 纹理 2048 上限 3 台试点。

---

## 2026-11-02 · 第 1 轮：Phase 0-C + 0-D（占位展品止血 · 全站数字一致）

### 修改内容
| 文件 | 动作 | 对应问题 |
|---|---|---|
| `src/devices/spitzer-space-telescope.js` | 加 `unlisted: true`（保留文件与资产，深链仍可预览） | P1-1 |
| `src/devices/chandra-x-ray-observatory.js` | 同上 | P1-1 |
| `tools/lint-mapping.mjs` | 新增硬闸：已入馆展品的 `tagline/description/parts[].desc` 含 `TODO` ⇒ **error**；输出行标注"筹备中 · 未入馆"；汇总打印在馆/筹备中台数 | P1-1 |
| `vite.config.js` | `virtual:device-manifest` 过滤 `unlisted`（`device-loaders` 保留 ⇒ 深链不 404）；新增 `transformIndexHtml` 构建期注入真实台数 | P1-1 / P1-2 |
| `tools/gen-inventory.mjs` `gen-knowledge-graph.mjs` `gen-timeline.mjs` | 统一 `allDevices.filter(d => !d.unlisted)`；孤儿 GLB 判定区分"未注册"与"筹备中"，后者单列一节 | P1-2 |
| `tools/lint-consistency.mjs` | **新建**：断言 registry / MODEL_INVENTORY / knowledge-graph / timeline / index.html 五处台数一致，不一致 exit 1 并给出修复命令 | P1-2 |
| `package.json` | `lint:devices` 链尾接入 `lint-consistency.mjs` | P1-2 |
| `index.html` | description / og:description 110 → 115（此后由构建期注入兜底） | P1-2 |
| `src/components/DeviceViewer.vue` | 未收录 id 回落时给出明确提示（延后 6.4s 避开 bootTimeline 的提示覆盖） | 0-C 衍生（避免静默换台） |
| `MODEL_INVENTORY.md` / `public/knowledge-graph.json` / `public/timeline.json` | 重新生成（115 台 · 880 部件 · 39 品牌 · 1282 连边 · 90 事件） | P1-2 |

### 解决的问题
- **P1-1**：两台 TODO 占位展品不再对公众展出（大厅/星图/编年/统计全部剔除），且 lint 从此会拦住任何"半成品入馆"。
- **P1-2**：全站台数从「117 / 110 / 104 / 104 / 110」统一为 **115**，并加了自动闸门。
- 附带修正审计判断：`resolvePartId` 实为有兜底（`unmappedTo`），P1-7 已按全馆取证降级为 P2-16（见下）。

### 测试与回归结果
| 命令 | 结果 |
|---|---|
| `node /tmp/mapping-audit.mjs`（全馆 117 台映射静态对账） | mapping/materialMapping/mappingPrefix 指向未知部件 **0 台**；realPartIds 幽灵 id **0 台**；`unmappedTo ∉ realPartIds` **2 台**（正是两台占位展品） |
| `npm run lint:devices` | ✓ 0 错误；新增输出「在馆 115 台 · 筹备中未入馆 2 台」+「✓ 五处数字一致」 |
| TODO 硬闸反向测试 | 临时把 spitzer 改回 `unlisted:false` ⇒ `✗ 已入馆展品仍含 TODO 占位文案：tagline, description, parts[body].desc`，退出码非 0；随后已还原 |
| `npm run gen:inventory / gen:graph / gen:timeline` | ✓ 115 台 · 880 部件 · 39 品牌 · 1282 连边 · 90 事件；孤儿 GLB 告警归零（改为"筹备中"单列） |
| `npm run build` | ✓ 2.42s；`dist/index.html` 实测注入 `115 台设备` |
| `npm run smoke` | ✓ 全过（含移动端 sheet/剖切间距/视角预设/无控制台错误） |
| 浏览器实测（1440×900） | 大厅 `115 台设备 / 880 个部件`，全文无"斯皮策/钱德拉"；`/graph` 头栏 `115 台设备 · 39 品牌 · 1282 连边`；深链 `#/device/spitzer-space-telescope` 回落 action4 并显示提示 toast（实测 `class="show"`，文案正确），正常台 `#/device/pocket3` 不误报；0 控制台错误 |

### 遗留与已知限制
1. 两台筹备中展品的 GLB 仍在 `public/assets/`（`MODEL_INVENTORY.md` 已单列说明），`dist` 体积暂未因此下降。
2. 深链回落仍是"带回默认台 + 提示"，不是"展品不存在页"——若日后要做 404/筹备中页，属新功能。
3. `era` 覆盖仍 70/115（数字档案字段，逐台查证类任务，Phase 6）。
4. 大厅统计口径改为 115 后，`AUTONOMOUS_METRICS.md` 里的历史"117 台"条目属当时快照，不回改。

### 下一项（Phase 0-B）
14 台 ≥4096 纹理降到 2048（先试点 v6-engine / phone4apro / porsche-911-930），并给 `tools/optimize-glb.mjs` 加 `--max-texture` 策略。

---

## 2026-11-02 · 第 3 轮：Phase 0-B 纹理上限（P0-1 关闭）

### 做法
1. 先做 1 台试点（v6-engine，最重 3259MB 显存）确认可视质量与体积；
2. 全量 14 台走项目自有管线 **resize(2048) → webp → draco**（顺序不可反，见 `tools/optimize-glb.mjs` 头部铁律），源件一律取 `vendor/assets/originals/`；
3. **安装前置闸门**：逐台比对 `三角形数 / 图元数 / 网格名集合` 与在馆文件完全一致才允许覆盖（防止重导出丢失历史几何修正）；
4. 覆盖后重跑 `npm run thumbs -- --only <14 台>`（渲染成功即证明引擎侧装载/映射/拾取全通），并逐台目视特写截图。

### 实测结果（`/tmp/0b-report.json`，14/14 通过几何一致性闸门）
| 展品 | 体积 MB | 估算显存 MB | 最大纹理 | 三角/图元 |
|---|---|---|---|---|
| v6-engine | 13.7 → **9.9** | 3259 → **815** | 4096→2048 | 1,290,048 / 260（不变） |
| phone4apro | 7.8 → **3.8** | 1222 → **386** | **8192**→2048 | 57,398 / 19 |
| porsche-911-930 | 9.1 → **5.8** | 952 → **438** | 4096→2048 | 241,260 / 75 |
| ak-47 | 13.0 → **3.8** | 515 → **129** | 4096→2048 | 33,718 / 56 |
| gl-06-launcher | 9.4 → **2.8** | 515 → **129** | 4096→2048 | 29,908 / 27 |
| nikon-d6 | 3.3 → **1.9** | 515 → **129** | 4096→2048 | 155,124 / 78 |
| walther-p99 | 6.2 → **1.9** | 515 → **129** | 4096→2048 | 79,520 / 126 |
| iphone-12-teardown | 6.4 → **4.6** | 464 → **143** | 4096→2048 | 364,853 / 159 |
| wankel-engine | 5.5 → **2.8** | 343 → **21** | **8192**→2048 | 769,218 / 7 |
| phone3 | 0.8 → **0.7** | 289 → **191** | **4500**→2048 | 54,878 / 79 |
| mini4pro | 3.0 → **1.6** | 135 → **71** | 4096→2048 | 168,151 / 207 |
| avata2 | 2.3 → **1.0** | 118 → **54** | 4096→2048 | 199,363 / 56 |
| nikon-z6 | 3.9 → **2.7** | 86 → **21** | 4096→2048 | 500,018 / 7 |
| iphone-13 | 0.3 → **0.2** | 47 → **15** | 4096→2048 | 25,049 / 19 |

**全馆口径（同一取证脚本复测）**：GLB 总量 **226.3 → 184.7MB（-18%）**；≥4096 纹理设备 **14 → 0 台**；全馆纹理显存合计 **14.6GB → 8.34GB（-43%）**；>6MB 单台 **10 → 4 台**；最大单台 **3259MB → 815MB（-75%）**。

### 修改内容
| 文件 | 动作 |
|---|---|
| `public/assets/*.glb` | 14 台按上表重导出覆盖（原件仍在 `vendor/assets/originals/`，git 可回滚） |
| `public/thumbs/*.webp` | 14 台 × 日夜两版缩略图重渲（14 成功 / 0 失败） |
| `tools/optimize-glb.mjs` | 新增 `--max-texture <px>`（默认 2048，传 0 关闭），管线固化为 resize→webp→draco；**输入已 Draco 时拒绝执行并 exit 2**（防体积反弹陷阱） |

### 测试与回归
| 命令 | 结果 |
|---|---|
| 几何一致性闸门（三角/图元/网格名三项全等） | ✓ 14/14 通过，无一跳过 |
| `npm run thumbs -- --only <14 台>` | ✓ 14 成功 / 0 失败（引擎装载 + 映射 + 出图全通） |
| `node /tmp/glb-audit2.mjs`（全馆复测） | ✓ 4K+ 设备 0 台；总量 184.7MB；纹理显存合计 8338MB |
| 设备页实测（ak-47 / phone4apro / v6-engine，1440×900@2x 特写） | ✓ 部件数正确（17 / 6 / 6）、`bvh=true` 全覆盖、0 控制台错误；木纹/金属/螺栓细节目视可接受 |
| `npm run build` | ✓ 2.64s |
| `npm run lint:devices` | ✓ 0 错误 · 五处数字一致 |
| `npm run smoke` | ✓ 全过（含新增 BVH 断言） |
| `node tools/optimize-glb.mjs <原件> /tmp/t.glb` | ✓ `3.59MB → 174KB（5%）· 纹理 ≤2048` |
| 同命令喂已 draco 的在馆文件 | ✓ 拒绝执行，`exit=2`，提示从 originals 重跑 |

### 遗留
1. `v6-engine` 仍在 815MB（38 张贴图 ×2048² 的必然结果）。若要进 <250MB，需 1024 上限或贴图合并——**当前判定：桌面安全、移动端待真机复测后再决定是否二次降档**。
2. 4 台仍 >6MB（v6-engine 9.9 / porsche-911-930 5.8 等），瓶颈已从纹理转为几何本体，属 meshopt/LOD 议题（Phase 6 之后的性能专项）。
3. 真机（iOS Safari / 集显 Win）显存行为仍未验证——这是 P0-1 的原始假设来源，需外部条件。
4. `AUTONOMOUS_METRICS.md` 的历史条目（226.3MB / 117 台）属当时快照，不回改；本轮新数值见上表。

### 下一项
Phase 1-A（lint 独立判定来源）与 1-B（可发布构建排除 NC/Free Standard/GPL），或转 Phase 2-A（日厅对比度令牌反转）。

---

## 2026-11-02 · 第 2 轮：Phase 0-A 拾取加速（P0-2 关闭）

### 基线（修复前实测，`/tmp/hover-before.json`，1440×900 · 真 GPU · 40 次扫过模型 hover）
| 展品 | 三角 | pickMeshes | 中位帧 | p95 帧 | 最大帧 | >50ms 帧 | 长任务 |
|---|---|---|---|---|---|---|---|
| radial-engine | 2,251,655 | 29 | 16.7ms | 18.6ms | 42.7ms | 0 | 0 |
| **combustion-engine** | 2,313,030 | 143 | 24.2ms | **88.5ms** | **98.9ms** | **27** | **24（max 97ms）** |
| v8-engine | 2,003,742 | 90 | 16.6ms | 28.3ms | 58.1ms | 1 | 0 |

→ 审计判断成立且可量化：**mesh 数量多 + 面数高**的展品（combustion）在默认悬停路径上产生 24 次 50ms+ 长任务，用户感知为"鼠标划过就卡"。

### 修改内容
| 文件 | 动作 |
|---|---|
| `src/engine/engine.js` | `ensureBVH()` 拆为 `buildBVHFor()` + 同步 `ensureBVH()`（测量工具仍立即可用）+ 新增 `scheduleBVH()`：**装载收尾分帧增量建 BVH，每帧预算 ≤6ms**；构建完成后置 `raycaster.firstHitOnly = true`；`finalize()` 末尾调用 `scheduleBVH()` |
| `src/engine/engine.js` | `disposeDevice()` 增 `bvhJob++` 令牌，切台/卸载可打断在途构建（防陈旧队列） |
| `tools/smoke.mjs` | 新增断言「拾取 BVH 全量覆盖」（m4-carbine 装载后 `pickMeshes.every(m => m.geometry.boundsTree)`，20s 超时） |

设计取舍：缩略图渲染进程（`hooks.adaptive === false`，离线批量出图）跳过 BVH——进程短、建树反而是净成本。

### 复测结果（修复后，`/tmp/hover-after.json`，同条件）
| 展品 | 中位帧 | p95 帧 | 最大帧 | >50ms 帧 | 长任务 |
|---|---|---|---|---|---|
| radial-engine | 16.7ms | 18.6 → **17.0ms** | 47.6ms | 0 | 0 |
| **combustion-engine** | 24.2 → **16.7ms** | 88.5 → **18.0ms** | 98.9 → **47.6ms** | 27 → **0** | 24 → **0** |
| v8-engine | 16.7ms | 28.3 → **17.9ms** | 49.4ms | 1 → **0** | 0 |

三台 `bvh=true`（pickMeshes 全量建树）；**p95 全部 <50ms 验收线**，combustion-engine 的长任务归零。

### 测试与回归
| 命令 | 结果 |
|---|---|
| `node /tmp/hover-bench.mjs before/after` | ✓ 上表（前后各 3 台，同一脚本同一条件） |
| `npm run smoke` | ✓ 全过，含新增「✓ 拾取 BVH 全量覆盖」 |
| `npm run build` | ✓ 2.46s |
| 控制台 | 无新增错误；`[pick] BVH …` 为 info 级观测输出 |

### 遗留
1. BVH 构建耗时目前只打 console，未入 `AUTONOMOUS_METRICS.md` 的结构化字段（Phase 3 做运行时对账时一并采集）。
2. `firstHitOnly` 是 raycaster 全局开关，仅在 BVH 完成后生效；构建完成前的极短窗口仍是普通求交（实测 <1s，且发生在开场演出期间，用户尚未 hover）。
3. 未做真机（移动端 GPU）复测。

### 下一项（Phase 0-B）
14 台 ≥4096 纹理降到 2048（先试点 v6-engine / phone4apro / porsche-911-930），并给 `tools/optimize-glb.mjs` 加 `--max-texture` 策略。

---

## 2026-11-02 · 第 4 轮：Phase 2-A/2-B 日厅对比度 + 对比度 CI（P1-3 关闭）

### 测量方法学修正（重要，影响此前所有对比度数字的可信度）
第一版扫描器有两处缺陷，均已修正后重测：
1. **`color-mix()` 序列化为 `color(srgb 0.66 0.93 0.70)`**（0–1 值域），正则按 0–255 解析 → 亮度算错，一度把夜厅"修好了"误报成 463 节点不达标。现改用 **canvas fillStyle 归一化**（支持 rgb()/rgba()/color(srgb)/oklch 等 CSS Color 4）。
2. **半透明背景被当实色使用**（`rgba(95,80,55,.05)` 直接算亮度）→ 锻造所误报 1.39:1。现沿祖先链做 **source-over 合成**。
3. 补：跳过 `opacity<0.5 / display:none / visibility:hidden`（含祖先链）的不可见元素；hash 路由下测厅别前必须 `reload`，否则测到上一例的厅。
   → 结论：**审计初稿的"日厅 109 节点 / 81 class"中，日厅大厅部分为真实缺陷（修后归零），而"设备页/研究翼"部分数字受上述缺陷影响，已以修正后口径重述。**

### 修改内容（全部为令牌层与规则层，无结构改动）
| 文件 | 位置 | 动作 |
|---|---|---|
| `src/style.css` | 日厅 token 块 | `--txt-3/--txt-dim` #6f6553 → **#5f5646**（6.52:1）；`--acc` #0f766e → **#0d6b62**（5.75:1） |
| `src/style.css` | `.card-brand` `.glb-badge` | `var(--acc)` → `color-mix(in srgb, var(--acc) 62%, #f2f7fc)`（夜厅提亮，保留展品色相）；日厅对应 `color-mix(... 34%, var(--txt-1))` |
| `src/style.css` | `.hub-stage .st-brand`（日） | 同上，改混色而非直用展品 accent |
| `src/style.css` | `.card-meta i` `.card-fallback i/b` `.hub-credit` `.hub-stage-tag` `.fg-label` `.prow .pen` `.dock-glabel` | 8 处 `rgba(125,143,163,α)` / `rgba(69,224,255,.22)` 字面量 → `var(--txt-3)` / 提亮混色（夜厅 1.92–2.81:1 → 6.04:1） |
| `src/style.css` | 日厅 `.prow .pen` | 去掉 85% 透明混合（导致 3.42:1） |
| `src/components/TimelineView.vue` | `.tl-count` `.tl-year` `.tl-sub` `.tl-item.tech .tl-sub` | 4 处 → `var(--txt-3)` / `var(--acc)` / `var(--txt)` / 满 alpha `var(--tech)` |
| `src/components/CompareView.vue` | `.cmp-era` | `--acc-dim` → `--acc` |
| `tools/contrast-verify.mjs` | **新建** | 11 组「页面 × 厅别」运行时 AA 扫描（大厅/网格/设备页 × 夜日 + 星图/编年/对比/锻造所），`--max 0` 不达标即 exit 1 |
| `package.json` | scripts | 新增 `npm run verify:contrast` |

### 验证结果
| 检查 | 修复前 | 修复后 |
|---|---|---|
| 大厅 · 夜 | 262 节点 / 23 类（最差 1.93:1） | **0 / 0** |
| 大厅 · 日（网格） | 109 节点 / 81 类（最差 1.16:1） | **0 / 0** |
| 设备页 · 夜 | 9 节点（最差 2.28:1） | **0 / 0** |
| 设备页 · 日 | 6→13 节点（最差 1.62:1） | **0 / 0** |
| 编年 · 夜 | 94 节点 / 3 类（最差 2.54:1） | **0 / 0** |
| 对比 · 夜 | 5 节点（4.32:1） | **0 / 0** |
| 星图 / 锻造所 | — | **0 / 0** |
| `npm run verify:contrast` | 不存在 | ✓ 合计不达标节点 **0** |
| `npm run build` | 2.64s | ✓ 2.52s |
| `npm run lint:devices` | ✓ | ✓ 0 错 · 五处数字一致 |
| `npm run smoke` | ✓ | ✓ 全绿（含 BVH 断言），0 控制台错误 |
| 截图留档 | — | `docs/design/screenshots/audit-2026-11/`（hall-top/hall-grid/device × 日夜 + timeline） |

### 设计意图保全说明
日厅品牌行不再直接用展品 accent（白底 1.16:1），而是"展品 accent 混入馆内墨色"——**色相身份保留、亮度抬到 AA**；夜厅同理向名字层亮色混。这与 style.css:1093 既有裁定（"设备换肤 accent 仅作用于大厅卡片小件，维持展品身份"）一致，不是取消换肤。

### 遗留
1. `.tl-item.tech .tl-year` 用 `--tech` 紫（#c792ea）实测已过，但仍是硬编码色值（Phase 4-B 令牌化）。
2. 日厅卡片缩略图底色与纸面偏接近（观感"糊成一片"），属 BACKLOG 既有「缩略图日厅变体」议题，非对比度问题。
3. 8.5px 微标签虽已过 4.5:1，但**字号本身**对低视力用户仍偏小——属可读性而非 AA 合规，记 P3（Phase 4-F 统一字号阶梯时一并评估）。
4. 扫描器口径限制：文字压在 `<img>`/canvas 上时取最近不透明祖先，结果**偏乐观**；已在工具头注明。

### 下一项（按 ROADMAP）
Phase 2-D 移动端导视溢出 + 触控热区（P1-9 / P2-10），或 Phase 3 生命周期（P1-5/P1-6，需先做 P2-14 调试面收敛）。

---

## 2026-11-02 · 第 5 轮：Phase 2-D 移动端导视与触控热区（P1-9 关闭 / P2-10 关闭）

### 修改内容
| 文件 | 动作 |
|---|---|
| `src/components/GalleryHub.vue` | 「我的探索 · ★N · 足迹N」文本后缀 → **`.el-badge` 徽标**（不再随计数撑长导视条） |
| `src/style.css`（≤860px） | `.hub-links` 改**单行横向滚动**（隐藏滚动条 + 右缘 mask 渐隐 + `scroll-padding-right`）；`.hall-link` **`position:sticky; right:0` + 左向渐变底**——双厅按钮钉在右端不再不可达；导视项 `padding:13px 0` 抬高度 |
| `src/style.css`（`@media (pointer: coarse)`） | 新增触控热区扩展层：24 类小控件（`.fav-star .rdot .step-btn .drawer-close .chip .hr-chip .hud-icon .tb-back .hud-chip .hud-btn .hud-glow-btn .pm-link .mech-edge .qa-row .forge-back .forge-go .hall-link .explore-link .hub-links a …`）用 `::after{min-height:44px}` 扩命中盒，**视觉尺寸不变**；表单控件（input 不支持 ::after）统一 `min-height:44px`；`#topbar`/`#dock`/`.hub-head` 补 `env(safe-area-inset-*)` |

### 验证（390×844 · isMobile · hasTouch · 7 个页面）
| 检查项 | 修复前 | 修复后 |
|---|---|---|
| 双厅按钮右边界 | 438px（视口 390，**不可达**） | **367px 可见**；导视横滚到底后仍 **366px 钉住可见** |
| 触控 <44px 目标 | 大厅 128/299（跨页更多） | **7 页合计 386 个目标 / 不达标 0** |
| 横向溢出 | — | 7 页全部 `overflow:false` |
| 滑杆可用性 A/B（range min-height 16 vs 44） | — | **行为一致**（键盘 96→97、拖拽 →106 两种高度相同），未因加高破坏拖动 |
| 控制台 | — | 0 错误 |

> 过程纠错：中途一次"滑杆失效"是**测量口径错误**（读了分段控件的 `.fp-val[0]` 而非第一个 range 的 `value`）；改为读 `input.value` 并做 16px/44px A/B 后确认功能正常。

### 回归
`npm run build` ✓ 2.14s ｜ `npm run lint:devices` ✓ 0 错 · 五处一致 ｜ `npm run smoke` ✓ 全绿 ｜ `npm run verify:contrast` ✓ 不达标 0 ｜ 截图 `/tmp/audit/95-mobile-nav-fixed.png`、`97-mobile-hall-after-nav.png`、`98-mobile-forge.png`

### 遗留
1. 热区达标靠 `::after` 命中盒，**iOS Safari 对伪元素命中盒的真实行为未验证**（BACKLOG 既有真机待办，本审计无法替代）。
2. 导视横滚依赖用户发现"可以滑"；右缘渐隐是暗示，但没有首次引导。若真机反馈仍找不到双厅按钮，考虑把按钮移出滚动容器改为常驻。
3. `.forge-go` 等按钮视觉高 39–43px 保持原样（只扩命中盒）；若要做视觉 44px 需重排 dock/表单，属 Phase 4 字号与间距阶梯工作。
4. `safe-area` 已加，但 `env()` 在无刘海设备上为 0，视觉无变化——真机（iPhone）验证仍缺。

### 下一项（按 ROADMAP）
Phase 3 生命周期与内存（P1-5 `delete window.__ENGINE` / P1-6 PMREM / P2-14 调试面收敛）——注意依赖：**先做 5-C 的 `__GEWU_DEBUG` 收敛，再删全局**，否则会打断 66 个 verify 脚本。

---

## 2026-11-02 · 第 6 轮：Phase 1-A/1-B 许可判定与可发布构建（P1-8 部分关闭）

### 修改内容
| 文件 | 动作 |
|---|---|
| `tools/lint-mapping.mjs` | **署名判定去循环化**（P1-8 根因）：不再用"credit 文本里有没有提到 Sketchfab/社区"决定要不要署名，改为以 `modelSource` 域名（sketchfab/polyhaven/thangs/cults3d）+ 显式 `distribution` 字段独立判定；新增规则：`distribution` 非法值 ⇒ error；有 GLB 却既无 `modelCredit` 又无 `distribution` ⇒ error；`by community` 泛化署名与 `modelSource` 非 https 继续拦截 |
| `tools/lib-license.mjs` | **新建**：再分发风险分级的唯一判定源（`licenseRisk` / `localDemoOnly` / `blockedForRelease` / `blockReasonText`），lint 与构建共用，避免两处口径漂移 |
| 34 份 `src/devices/*.js` | 官方 AR/CDN 转制资产补 `distribution: 'local-demo-only'`（28 台 Apple/Samsung/Nothing 已有 `source:` 的只补标记；6 台 DJI 连 `source:` 一起补，取自各文件头部注释既有记载） |
| `vite.config.js` | `deviceManifest` 支持 `GEWU_RELEASE=1`：manifest 与 loaders 同步过滤受限展品（大厅/星图/深链一律不可达，且不留悬空引用）；新增 `closeBundle` 剔除 `dist/assets/<id>.glb` 与 `dist/thumbs/<id>{,.day}.webp`，产出 `dist/RELEASE-EXCLUDED.json` 说明每台排除理由 |
| `package.json` | 新增 `npm run build:release` |

### 实测结果
| 检查 | 结果 |
|---|---|
| 新 lint 规则首轮命中 | **33 台**「有 GLB 但既无 modelCredit 也未标 distribution」⇒ 逐台补标记后（含 pocket3 共 34 台）→ **0 错误 / 11 警告** |
| `npm run build:release` | ✓ 2.51s；**排除 40 台**（local-demo-only 33 · 许可受限 5 · 筹备中 2），删除 **78 个产物文件**，`dist` 274MB → **179MB** |
| 排除清单正确性 | 许可受限 5 台 = `galaxy-s22-ultra`、`iphone-16`（Sketchfab Free Standard）、`combustion-engine`、`hydraulic-jack`（CC-BY-NC）、`flipper-zero`（GPL-3.0 外壳）；`dist/assets/` 内受限 GLB **残留 0** |
| release 产物浏览器实测（vite preview） | 大厅 **77 台**、meta 注入同为 77、页面文本无 iPhone 17/Mac mini/内燃机；受限台深链回落不 404；**0 个 4xx、0 控制台错误** |
| 普通构建回归 | `npm run build` ✓ 2.86s（`dist/assets` 117 GLB，不含 `RELEASE-EXCLUDED.json`）；`npm run lint:devices` ✓ 0 错 · 五处数字一致 |

### 设计取舍
- **不删资产、只分口径**：`public/assets/` 与设备配置一律保留，`unlisted`/`distribution` 只影响"哪个构建包含它"。本机演示（`npm run dev` / `npm run build`）仍是全馆 115 台。
- **判定源单一化**：风险等级只在 `tools/lib-license.mjs` 定义一次，lint 与 release 构建共用，防止"lint 放行、构建排除"或反之。
- **深链不悬空**：release 模式同时过滤 `loaders`，被排除展品不会留下"卡片在、点进去 404"的半截状态（实测回落正常）。

### 遗留（P1-8 未完全关闭的原因）
1. **人工复核仍缺**：34 台的 `distribution: 'local-demo-only'` 是"按项目自述归类"，Apple/DJI/Samsung 官方 AR 条款原文未逐条核对；5 台风险许可的上游页面当前许可也未复核（许可可被作者追溯更改）。
2. DJI 6 台的 `source:` 取自配置头部注释（"官方 GLB（DJI 官网 CDN）"），**未记录精确资产 URL**；后续如重新取得，应补 `modelSource` 直链。
3. `og:image` / `robots.txt` / `sitemap.xml` / `manifest.webmanifest` / CSP 仍未加（ROADMAP 1-C，下一轮）。
4. `dist/` 是最后构建的产物：本轮末已用 `npm run build` 还原为全馆口径，发布前需显式跑 `build:release`。

### 下一项（按 ROADMAP）
Phase 1-C（分享与索引最小集：og:image 复用 thumbs、robots.txt、manifest、CSP 实测不破坏 Draco/Cache Storage）；或 Phase 3 生命周期（需先做 5-C 调试面收敛再删 `__ENGINE`）。
