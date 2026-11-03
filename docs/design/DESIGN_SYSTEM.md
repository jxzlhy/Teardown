# DESIGN SYSTEM · 格物馆视觉规范（MUSEUM OF MACHINES）

> 馆名沿革：原「拆解馆」，2026-10-31 更名「格物馆」（见 `docs/design/BRAND.md`）。
> 2026-10-31 起本文为**规范主文档**（阶段 B 交付，依据 `docs/design/UI_UX_REFACTOR_SPEC.md` §三）。
> 历史来源：由 `docs/DESIGN_SYSTEM.md`（实测汇编）升级而来；所有 token 以 `src/style.css` `:root` 为唯一代码事实源，改 token 必须同步本文。
> 审查基线：Apple HIG 原则层（层级/对比/克制/触达目标），不照抄 iOS 组件形态。Skill 依据：`frontend-design`（品味与反模板）+ `impeccable`（审查）+ `frontend-skill`（构图与层级）。

## 1. 视觉定位（Visual Thesis）

**高端数字科技博物馆 + 未来科技展馆 + 沉浸式 3D 探索空间。**

一句话论点（2026-10-31 第二轮重构定稿）：**深夜开放的机械博物馆——展柜里的设备被单束冷光照亮，界面是馆内的导视与铭牌系统**。设备模型是唯一发光体；UI 只做三类事：导视（导航/检索）、铭牌（名字与数据）、氛围（深空底 + 扫描线）。

- 气质：深夜展馆（night wing × mission control），不是 SaaS 后台、不是电商、不是 AI Dashboard 模板。
- 三条铁律：**克制**（不堆特效，一屏一个焦点）、**层级**（信息按博物馆铭牌逻辑分层）、**真实**（不掩盖模型几何/映射问题，不把示意包装成事实）。
- 大胆花在刀刃：3D 模型、黑体巨字馆名、开场演出是唯一的「大」；UI 面板一律安静。

### 1.1 名字层 / 数据层 / 操作层（第二轮引入的字体语义规则）

| 层 | 字体 | 用在哪 |
| --- | --- | --- |
| **名字层** | `--name`（Noto Sans SC Black / PingFang Heavy 栈） | 馆名、展区标题、展品名、部件名——只用于「这是什么东西」 |
| **数据层** | `--mono` | 编号、年份、规格、状态、eyebrow——只用于「读数与标注」 |
| **操作层** | `--sans` | 按钮、说明、正文——「用户要做什么」 |

规则：名字层黑体 Heavy 不进按钮/表格/HUD 微标注（正文黑体细字重除外）；等宽不做大标题。三栈各司其职，不得混用层级。
> 沿革：名字层曾用衬线（Songti SC → Noto Serif SC Heavy），2026-10-31 经用户实机对比裁定换装现代黑体（D-20261031-10）——两种宋体骨架相近、感知差异弱，黑体才配得上「数字科技博物馆」的精密气质。

## 2. Color Tokens（代码唯一来源：`src/style.css :root`）

### 2.1 基础

| Token | 值 | 语义 |
| --- | --- | --- |
| `--bg-0 / --bg-1 / --bg-2` | `#030509 / #04070c / #0a121c` | 页面底 / 面板底 / 次级块 |
| `--txt-1 / --txt / --txt-2 / --txt-3` | `#f2f7fc / #dfe8f2 / #c9d6e4 / #7d8fa3` | 标题 / 正文 / 次级 / 弱化（txt-3 对 bg-1 ≈5.9:1，勿再调暗） |
| `--panel-bg` / `--glass` | `rgba(7,13,20,.62)` | 玻璃面板底 |
| `--line` | `color-mix(in srgb, var(--acc) 18%, transparent)` | 描边、分隔线 |

### 2.2 强调色体系（换肤核心）

| Token | 值 | 语义 |
| --- | --- | --- |
| `--acc` | `#45e0ff`（默认；设备配置 `accent` 覆写） | 强调、激活态、eyebrow、HUD 点 |
| `--acc-dim` | `rgba(69,224,255,.55)` | 次级强调 |
| `--acc-08 / --acc-16` | `color-mix(... 8/16%, transparent)` | 强调背景梯度（随 --acc 自动换肤，**禁止手写 rgba 代替**） |
| `--stage-acc` | 设备级（hero 展台用） | 仅大厅展台作用域 |

### 2.3 状态色（阶段 B 新增统一，禁止散落硬编码）

| Token | 值 | 语义 |
| --- | --- | --- |
| `--ok` | `#4ce88a` | 正常/已就绪（hud-dot.ok） |
| `--warn` | `#f0b429` | 警示/降级/NC 许可标（原 #f0b429/#e8b45a 统一归一） |
| `--err` | `#ff7d7d` | 错误/失败（loadErr、错误 toast） |
| `--tech` | `#c792ea` | 知识/技术条目专属色（星图技术节点、编年技术事件），不得挪作装饰 |

规则：新颜色一律 `color-mix` 派生自 `--acc`/`--bg-*` 或用状态色 token；每设备只允许换 `--acc`。强调色仅做点缀，禁止大面积铺底。

## 3. Typography

| Token | 值 | 用途 |
| --- | --- | --- |
| `--sans` | `-apple-system, …, "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", "Segoe UI"` | 操作层：正文、按钮、说明 |
| `--mono` | `ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas` | 数据层：HUD 数据、eyebrow、编号、年份、规格值 |
| `--name` | `"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "HarmonyOS Sans SC", "Microsoft YaHei", "Segoe UI", sans-serif` | 名字层：馆名、展区标题、展品名、部件名（display only；Noto Sans SC 900 webfont 分片懒加载） |
| `--fs-hud` | `10px` | HUD 微标注（仅装饰性标注，配 ≥.2em 字距） |

字号阶梯（现状实测 + 约束）：

| 级 | 用途 | 规格 |
| --- | --- | --- |
| Display | 大厅馆名（黑体巨字） | `clamp(76px,11.5vw,172px)` / 900 |
| H1 | 展品名（设备页标题 / 详情卡 / 卡片名） | 17–22px 黑体 800 |
| H2 | 次级页/展区标题 | 13–20px（衬线展区 / sans 页头） |
| Body | 正文、部件描述 | 12–13.5px，行高 ≥1.7 |
| Caption | 卡片 tagline、辅助说明 | 11–12.5px |
| Label/HUD | eyebrow、状态、徽标 | 8.5–11px mono，宽字距 |

规则：中文正文 ≥13px（长文 ≥12px 需行高 ≥1.8 兜底）；<10px 仅限 HUD 装饰性标注；数字读数用 `--mono`。

## 4. Spacing / Shape / Elevation

- 间距标尺：4 的倍数（4/8/12/16/24/32/48）；组件内边距主用 8/10/12/16；面板间 24+。
- 圆角：`--corner: 10px`（面板）；按钮/输入沿用 7–8px；chip 全圆 999px；**不再新增圆角档位**。
- HUD 缺角：`--notch: 14px`（`.hud-panel` 右上切角）；条状面板（顶栏/dock）与移动端 sheet 必须 `clip-path:none`（避免裁掉面板外 tooltip）。
- 阴影：深色 UI 不用投影表达层级（用**背景透明度+描边+blur** 三件套）；`box-shadow` 仅允许强调色光晕与 `--acc-16` 级别辉光。
- 页面边距：大厅 `clamp(24px,7vw,110px)`；工作空间 HUD 安全边距 24px（移动端 10–14px）。

## 5. Glass Materials（三级配方，勿发明第四级）

| 级 | 配方 | 用途 |
| --- | --- | --- |
| G1 主面板 | `backdrop-filter: blur(16px) saturate(1.3)` + `--glass` | HUD 工具栏、详情卡、总览弹层 |
| G2 次面板 | `blur(14px) saturate(1.2)` | 大厅吸顶筛选、浮层 |
| G3 轻遮罩 | `blur(3~8px)` | toast、提示条、overlay 遮罩 |

性能边界：G1/G2 只上**静态悬浮件**；禁止加到跟随相机/逐帧变化元素；移动端交给浏览器降级，不写 JS 探测。

## 6. Motion Tokens

| Token | 值 | 语义 |
| --- | --- | --- |
| `--dur-1` | .18s | 微反馈（hover/按下/开关） |
| `--dur-2` | .32s | 面板出入、浮层 |
| `--dur-3` | .6s | 大区块转场 |
| `--ease-out` | `cubic-bezier(.22,.9,.28,1)` | 默认 |
| `--ease-spring` | `cubic-bezier(.34,1.45,.5,1)` | 强调回弹（仅点缀） |

详见 `docs/design/INTERACTION_GUIDELINES.md` 与 `docs/MOTION_GUIDELINES.md`（铁律层）。

## 7. Focus / States（阶段 B 新增）

- 焦点环：全站统一 `:focus-visible { outline: 2px solid var(--acc); outline-offset: 2px }`（`.hud-focus` 工具类 + hud.css 全局按钮/chip/卡片规则）；禁止移除 outline 后不加替代。
- 交互四态：hover / focus-visible / active / disabled 为组件准入门槛（DESIGN_QA §2）。
- 触控目标 ≥44×44px（移动端图标按钮 34px 视觉 + 透明扩展 hit-area 达标）。

## 8. Z-Index 层级（事实汇编，新增浮层对号入座）

| 层 | 值 | 成员 |
| --- | --- | --- |
| 画布/标签 | 0–2 | `#scene`、`#labels`、卡内装饰 |
| 内容 HUD | 5 | `#rail`、`#railDots`、`#ctxCard`、`#mpChips` |
| 控制浮层 | 6 | `#topbar`、`#dock`、`#clipStrip`、`#tourBar`、`#toast` |
| 弹层 | 7 | `#infoPop`、`#immersiveExit`、抽屉 30 |
| 引导/开机 | 8–9 | `#bootTitle`、`#bootScan`、`.overlay` |
| 加载/错误 | 10/30 | `#loader`、`#loadErr` |

## 9. 组件准入规则

1. 复用 G1~G3 + 既有 token，零新依赖（组件手写）；
2. 四态完备 + 触控 ≥44px + 长文本截断策略；
3. 图标：内联 SVG stroke 1.6–1.8px，不混填充风；
4. 每个新面板先问「能否是普通排版而非卡片」（frontend-skill：cardless 默认）；
5. eyebrow 体例：**一层信息最多一个 eyebrow**；mono 10px/≥.2em 字距 + 前置横线；禁止 eyebrow 嵌套 eyebrow、禁止整页每卡都挂。

## 10. 禁止事项

- ❌ 硬编码色值/新玻璃配方/新字号家族/新圆角档；
- ❌ 单页引入组件库或 CSS 框架（Tailwind 等）；
- ❌ 强调色大面积铺底、过曝光晕叠加（Bloom 已在引擎 L0 关，CSS 同样克制）；
- ❌ 用 CSS 修补 3D 层问题（映射/取景/拾取回引擎与配置修）;
- ❌ 无意义循环动画常驻（L0 画质与 reduced-motion 必须可关）。

## 11. 换肤流程（设备接入）

设备配置 `accent` → 引擎根元素写 `--acc` → 梯度自动派生。接入检查：与 #45e0ff 可区分度、bg-0 上对比度、`--acc-08` 上文本 ≥4.5:1。

## 12. 与其他文档的关系

- 组件与页面规范：`docs/design/UI_GUIDELINES.md`
- 交互/动效/键盘/无障碍：`docs/design/INTERACTION_GUIDELINES.md`
- QA 执行清单：`docs/DESIGN_QA.md`（合入门槛）
- 动效铁律：`docs/MOTION_GUIDELINES.md`；3D 呈现：`docs/3D_EXPERIENCE_GUIDELINES.md`
- Skill 组合与冲突裁决：`docs/DESIGN_SKILLS.md`
- 审计问题→修复映射：`docs/design/UI_UX_AUDIT.md`
- 参考站调研与采纳裁定：`docs/design/REFERENCE_STUDY_2026-11-03.md`

## 13. 展陈空间组件模式（2026-11-03 增补，来源：参考站调研 R1–R5）

工作空间（设备页）新增/升级组件的固定版式，全部双厅 token 化：

| 模式 | 版式要点 | token/实现 |
| --- | --- | --- |
| 雷达刻度盘底座 | 盘面只允许 hairline 线元素（同心环虚实交替 + 放射刻度 + 外缘渐变弧光），无面无数字；夜厅青光、日厅纸面浅刻线；亮度集中在模型脚下边缘渐隐 | 引擎 `engine.js` plinth 纹理；`setPedestalHall` 双厅材质 |
| 顶栏规格 chip | 数值（mono 13px）/ 单位+标签（9px 弱化）上下两行；分隔线并排 ≤3 枚；≤1080px 隐藏 | `#topbar .tb-spec` |
| 部件索引行 | 两位序号 + CN 名（主）+ EN 全名（下行 9px mono 弱化）；激活态左侧 accent 竖条 + 序号变 accent；头部计数放大 mono | `#rail .prow`、`.rail-count` |
| 档案面板（UNIT DOSSIER） | 巨型型号字（EN，name 层 26px）→ CN 全名 → 简介 → **2 列规格瓦片**（数值 mono 15px + 标签 9.5px）→ 状态行 → 真实性/署名卡；eyebrow ≤1 个 | `#infoPop`；`.spec-tile` |
| 拆解进度读数 | dock 拆解组尾部 mono 百分比（0–100%），随 explodePct 实时刷新 | `#exReadout` |

红线沿用 §9/§10：规格瓦片数值一律来自设备配置真实数据，缺失字段留空不造；进度读数是拆解度真实百分比。
