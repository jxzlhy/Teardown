# V5.0.10 AURORA · 执行状态档

> 任务书：`docs/roadmap/GEWU_V5_AURORA_EXPERIENCE_PERFORMANCE.md`（2026-11-04 用户下达原文，字节级归档）
> 基线审查：`docs/audit/V5_AURORA_BASELINE_AUDIT.md`（PHASE 0 产物，全部结论带证据）
> 工作方式：独立专项，PHASE 0→7 顺序推进；每阶段实际改码 + 构建 + 测试 + 浏览器验证 + 截图 + 记账；专项完成前不转 V5.1/长期 goal（任务书 §18）。

## 版本核定

- V5.0.x 已占用：V5.0.0–V5.0.6、V5.0.8（git log 实证）；V5.0.7/V5.0.9 未启用。
- **本次采用 V5.0.10**（任务书建议值，未被占用 ✓）。package.json `version` 字段维持 3.0.0 口径不动（馆藏版本以文档系列为准，与 npm version 无联动惯例）。

## 阶段状态

| PHASE | 内容 | 状态 |
|---|---|---|
| 0 BASELINE AUDIT | 现状审查/Skills 清单/加载链路/性能基线/实施顺序 | ✅ **完成（2026-11-04）**——产出 `docs/audit/V5_AURORA_BASELINE_AUDIT.md`；版本核定 ✓；任务书归档 ✓；README/AGENTS/AI_HANDOFF 入口 ✓ |
| 1 DESIGN SYSTEM | 令牌归一（字号 29 种收敛/组件类归一/图标体系扩展）+ U4 :active/aria + U6 SEO 静态件 | 🟡 **首切片+归并遍完成（2026-11-04）**：① 字号原始层 11 令牌 1:1 收纳 112 处；② **归并遍**——长尾 13 静态值令牌化（--fs-8…--fs-44）+ 5 个流式展示值角色命名令牌化（--fs-brand-hero / -compact / section-title / display-xl / display-sub），style.css **裸字号字面量清零**（133 处全令牌）；③ DESIGN_SYSTEM §3 增 3.1 节令牌清单 + 修正馆名 clamp 文档漂移（76/11.5vw/172 → 代码实际 44/6vw/84，旧审计 P2-4 项）；④ U4 `button:active` 按压反馈；⑤ U6 SEO 静态件（og:image/manifest/robots；sitemap/CSP 缓办有因入 PHASE 7）。**截图对比验证**：夜景大厅/设备页 rail **0 像素差异**、日厅文字区 0 差异；唯一差异带 [855-999,160-169] 145×10px maxDelta 11/255 定性=日厅氛围光动效相位时变（after 自身连拍同区亦有差异，base 两次连拍 0 差异 → 采集时相伪影非排版回归），目检不可感知。组件类归一（6 套药丸按钮等）⬜ 待后续遍 |

> **组件归一补记（2026-11-04 轮 15）**：药丸按钮族已完成——新增 `--pill-bg/--pill-line/--pill-line-hover/--pill-fg` 组件 token，`.chip`/`.hud-chip`(hud.css)/`.fav-cat`/`.gb-chip`(GraphView scoped) 四套 `rgba(120,150,180,*)` 字面量收编；有意统一两处漂移（fav-cat 描边 .3→.18、gb-chip .25→.18，与同族公式一致；gb-chip 深底浮层底色保留局部值）；fp-seg/motion-speed 核验已走 --wash-1/--hairline 无需动。**遗留**：hall-link/filter-search 等 28 处同家族字面量（glass/line 大家族，P2-8 另一半）；图标体系（P2-9）未动。build 2.44s ✓。
>
> **glass/line 家族收编（2026-11-04 轮 16，P2-8 另一半完成）**：全项目 33 处 `rgba(120,150,180,*)`（15 种 alpha）收敛**五档**——`--glass-bg(.06，收 .04/.05/.06/.07)` / `--glass-line-faint(.14)` / `--glass-line(.2，收 .18/.2/.22)` / `--glass-line-strong(.3，收 .24/.25/.28/.3/.35)` / `--glass-line-hi(.45，收 .4/.45)`；`--pill-*` 自动成为其组件语义层（replace_all 使然，方向正确）。**漂移量化**：15 值种中 10 种有漂移、最大 Δalpha .06（深底上 ≈2.8% 亮度，.35→.3 grip 条/.4→.45 focus 线，方向均增强可见性），其余 ≤.04。**唯一例外**：DeviceViewer.vue:571 canvas 2D `strokeStyle` 内 `var()` 无效，保留字面量（注释声明）。跨文件覆盖 style.css/hud.css/GraphView/TimelineView；build 2.37s ✓，全库残留 = canvas 例外 1 处 + :root 定义。**P2-8 主债至此清账**（字号 29 种 + 药丸 4 套 + glass 33 处全令牌化）；P2-9 图标体系未动。
>
> **P2-9 图标体系（2026-11-04 轮 18，完成）**：新建 `src/ui/Icon.vue` 内联 SVG sprite（24px 网格 / currentColor / aria-hidden / stroke+fill 双风格，21 图形：close/star/star-o/edit/diamond/diamond-o/chevron-l/r/caret/plus/external/download/upload/copy/import/rotate/focus/undo/redo/hammer）。**38 处控件字符逐点替换**（GalleryHub 10 / DeviceViewer 9 / StudioView 11 / ForgeView 4 / GraphView 6，含动态 ▴▾ 展开指示改 caret 旋转、★/☆ 收藏态改 star/star-o、◆/◇ 徽章改 diamond/diamond-o）；纯图标按钮均有既有 aria-label，带文本按钮文本保留。**有意保留**（非图标）：按键描述文本（toast/帮助里「‹ › 逐组拆装」等 4 处）、空状态说明文字「★ 收藏设备」1 处、studio 树结构符号 ◈/▸（非审计清单控件）。验证：build 3.07s ✓ + 控件字符 grep 残留 **0** + forge 页截图目检（import 图标渲染与风格协调）+ aria-hidden SVG DOM 断言。P2-9 关闭。
| 2 AURORA UI | 全局 UI 重塑（含 P1-4 首屏发现路径——先出方案稿待裁定） | ⬜ |
| 3 INTERACTION PRO | I2 hash 热切换前置修复 → 与 V4.1a 切台手感合流 → 零件导航/选中层次/工具栏 | 🟡 **首修复回归 ALL PASS（2026-11-05 轮 21，Δ=0 双向）**：切台序列探针 v2（loadTiming.id 严格匹配/半径量纲/idle 稳态）——① 切台后相机回位 **Δ=0**（② rp=rh=20.8、③ rp=rh=18.1 精确）+ UI 态清理六项全绿 + 零 console 错误；② **修复三件套**：trackHome 每帧引用 live CAM_HOME + **camTween 段移至 controls.update() 之后**（裁决实验实证 update 每帧用内部 spherical 重建 camera.position 覆盖外部写入=根因；tween 写入成为每帧最终状态）+ trackHome 期间绝对赋值；③ **firstRenderMs 打点错位修复**（原挂引擎生命周期首帧的 booted 块恒 0 → 改 mainLoop 独立检查 doneMs 后首帧）；④ **假遥测陷阱清账**：__CAM.pos 是 finalize 一次性快照非实时（前 5 轮取证被其污染），新增 `getState().camPos` 实时遥测（转正 TEMP-DIAG）。**归因诚实注记**：原缺陷真实程度无法回溯证实（快照污染覆盖历史），修复后保证结构性成立。零件导航/选中层次/工具栏 ⬜ |
| 4 ASSET PIPELINE | 加载阶段化反馈/KTX2 试点（2-3 台 A/B，材质无损验证先行）/glbCache 容量实测校准 | 🟡 **打点基建 + 首组实测完成（2026-11-04 轮 16-17）**：① 打点全链路（loadTiming：fetch/parse/scene/finalize/done/firstRender/bvhMs + performance.mark 时间轴 + lastFetchSource）；② **首轮实测（swiftshader@1440×900 dev，load ~6.5，iphone-13 178KB）**：时序采样曲线 renderFps 2→15→299→724（累计），**fetchMs=16510 / done=84576ms**——定性修正：此前 6 组「冻结」实为**软渲染首帧风暴下主线程饱和致装载极端慢**（90-150s 超时线不足；记忆库「boot 放宽 300s」规程适用），非真冻结；该值为饱和口径参考值，非真实 GPU 表现；③ 300s 规程探针版全套（3 台×冷热）再跑未稳定产出（后台任务失败+stdout 全缓冲），**冷/热对比与 KTX2 前后 A/B 挂账真实浏览器或解冻窗口**；④ KTX2 试点评估待基线稳定后（任务书顺序） |
| 5 RENDER ENGINE | 按需渲染（R1）/标签脏检查（R2）/composer samples（R3）——证据齐备，收益可测 | 🟡 **R2+R1+R3 完成（2026-11-04）**：① R2 `labels.js` 帧间签名脏检查（零重复 DOM 写）；② **R1 按需渲染**——时间基准 idle（无活动 1.2s）后按帧奇偶降为半帧率；活动源=用户输入 1.5s 余波窗口（pointerdown/wheel/touchmove，覆盖 damping 惯性）/hoverDirty/hallTween/camTween/爆炸与步进未到位/拆分悬浮渐变/tour/演示/选中呼吸/测量/动态屏幕 tick/clip·isolate 模式；**待机自转（26s 无交互特性）明确允许降频**（0.5rad/s 慢速环绕 30fps 采样无感知——它是主要降频对象）；跳帧帧 `clock.getDelta()` 丢弃保墙钟速率；watchdog 兜底帧恒渲染；③ **R3** composer RT `samples:4`（HalfFloat+stencil 保留；thumb 模式 samples:0 保持旧缩略图一致性）+ renderer `antialias:false`（composer 路径下纯白付，全项目渲染都走 composer）。**踩坑记录**：OrbitControls.update() 每次（含静止后）dispatch change → 事件判定永不 idle（实测抓出后改输入窗口方案）；帧数基准 IDLE_ENTER=45 在低帧率环境永不进入 → 改时间基准。**实测数据（swiftshader 软渲染 + load 4.5，iphone-13@1440×900）**：idle rAF 30.8 / **render 16.9 fps（≈rAF×0.5+watchdog，降频精确生效）**；交互恢复 **render 28.5 ≈ rAF 30.8（全速回满，同时证明 R3 MSAA 4x 无帧率回退）**；R1 前构造性口径：渲染 fps ≡ rAF（P2-1 证据 rAF 恒定全量重绘）。真实 GPU 绝对帧耗待真机（软渲染绝对值无意义，维持挂账口径）。回归：**smoke 27/28**（唯一失败=历史 tour 抖动同项，连续两轮一致，非本轮模块）；演示/装配/测量/自转路径断言全绿+无控制台错误。fps-probe 工具升级：BASE 参数 + renderCount/frameMsAvg 度量输出 |
| 6 ADAPTIVE EXPERIENCE | DPR/设备内存分档/降级策略/真机项（环境限制部分挂账） | ⬜ |
| 7 FINAL QA | 视觉/交互/性能/回归四线验收 + 交付报告（任务书 §17 十四项） | ⬜ |

## Skills 使用台账（任务书 §4.2 要求逐项记录）

| Skill | 路径 | 应用阶段 | 执行任务 | 结果 |
|---|---|---|---|---|
| frontend-design | `.zcode/skills/frontend-design/` | PHASE 1 | 动 UI 前读规范（AGENTS §11）；裁定：本切片为既有体系令牌化非新设计——1:1 零视觉变更第一遍 + 克制长尾 | ✅ 已执行（指导令牌策略） |
| design-system | `.zcode/skills/design-system/` | PHASE 1 归并遍 | 三层 token 架构（primitive→semantic→component）纪律——归并遍 18 令牌按其命名纪律落层（值命名=原始层/角色命名=展示层）+ DESIGN_SYSTEM §3.1 清单 | ✅ 已执行 |
| tokens | `.zcode/skills/tokens/` | PHASE 1 归并遍 | 审计五查（3 层覆盖/7 类/命名纪律/无任意值）+ 增量补丁不覆盖原则——确认本馆 sRGB 体系、色/动效/圆角类别已备，type 类本次补全 | ✅ 已执行 |
| impeccable | `.zcode/skills/impeccable/` | PHASE 2 | 待 PHASE 2 页面审查时读 | 待执行 |
| audit / heuristic / critique | `.zcode/skills/{audit,heuristic,critique}/` | PHASE 2 | 页面级审查（配合既有 UI_UX_AUDIT 档案） | 待执行 |
| polish / delight / animate | `.zcode/skills/{polish,delight,animate}/` | PHASE 3 | 微交互与动效升级 | 待执行 |
| friction-log | `.zcode/skills/friction-log/` | PHASE 7 | 验收期摩擦记录 | 待执行 |

> 规则：不适用不强行调用；每阶段完成后回填本表（任务/结果/文件/验收）。

## 性能基线（PHASE 0 实测口径，PHASE 4/5/7 对比用）

| 指标 | 基线值 | 来源 |
|---|---|---|
| 构建 | 2.71–4.31s ✓ | vite build（本会话多轮） |
| 关键 chunk gzip | three 209.14KB / DeviceViewer 81.85KB / index 42.57KB / StudioView 22.47KB / registry 1.35KB | vite build 输出 |
| GLB 资产 | 129 个 / 中位 0.99MB 量级 / 纹理 webp≤2048 全量合规 | REAUDIT §一 + lint-assets |
| 显存口径 | 最大单台 v6-engine 815MB（RGBA8+MIP 估算值，非真机计量） | REAUDIT §二 |
| 大厅首载 | 5 块 JS · 不载 three · GLB 364KB | REAUDIT §一 生产 preview 实测 |
| 设备页首载 | 13 块 · three · GLB 962KB | 同上 |
| 门禁 | lint 六段 ✓ / smoke 28 项（环境挂账 2）/ studio-verify 55 项全绿 / contrast 0 不达标 | 本会话实测 |
| 加载链路分环节耗时 | **UNVERIFIED**——PHASE 4 首项任务：以 Performance Mark 在 fetch/parse/decode/finalize 打点实测 | 待做 |

## 门禁与验证（PHASE 1 首切片，2026-11-04）

| 检查 | 结果 |
|---|---|
| `npm run build` | ✓ 2.71s（首切片）/ 2.76s（归并遍+R2 后） |
| 静态产物 | dist 含 robots.txt / manifest.webmanifest / og-cover.webp；preview :8200 三件 200 ✓ |
| 令牌 1:1 恒等探针 | ✓ 11/11 令牌 getComputedStyle 恒等于原 px 值；:active 规则入 CSSOM ✓（/tmp/probe-fs-tokens.mjs） |
| 归并遍截图对比 | ✓ 夜景大厅/设备页 rail **0 像素差异**、日厅文字区 0 差异；唯一差异带 145×10px maxDelta 11/255 定性=日厅氛围光动效相位（after 自身连拍同区亦有差异、base 连拍 0 → 采集时相伪影非排版回归），目检不可感知 |
| **`verify:contrast`** | ✓ **10/10 组全绿 · 合计 0 不达标节点**（负载 4.5-7 窗口，加固版工具）——三轮环境挂账清零。工具加固：reload 3 次重试环 + 用例级换新页面整例重试（此前三次死于 reload 冻结/frame detached 无护栏） |
| `npm run lint:devices` | ✓ PASS（六段链） |
| smoke（R2 后） | **27/28 绿**（负载 4.79 窗口，设备页装载步通过）：唯一失败「导览讲解卡」= R9 轮已定性的 tour 墙钟抖动同类（不同模块，历史记录 `AUTONOMOUS_METRICS` 11-03「2 失败定性环境：tour 墙钟抖动」）——非 R2 回归；设备页全流程 + 「无控制台错误」全绿 = labels.js 脏检查每帧执行数千帧零异常 |
| 回归面 | style.css 纯值替换（特异性/级联不变）+ labels.js 帧间签名（渲染结果等价）+ index.html head 增量 + 3 新静态文件 |

## 变更记录

- 2026-11-04：PHASE 0 完成（本档建立）。
- 2026-11-04：PHASE 1 首切片完成（字号原始层 11 令牌 + button:active + SEO 静态件）；门禁见上表。
