# DESIGN SYSTEM · 拆解馆视觉规范

> 2026-10-31 起生效。本文档为**实测汇编**：所有 token 来自 `src/style.css` / `src/ui/hud.css`，修改 CSS 时同步更新本文。
> 审查基线：Apple HIG 原则层（层级/对比/克制/触达目标），不照抄 iOS 组件形态（本站是 Web + 自绘 HUD）。

## 1. 设计语言定义

**编辑部式科技档案馆**：深空冷色底 + 每设备强调色换肤 + 玻璃拟态 HUD + 等宽字技术标注。
三条铁律：克制（不堆特效）、层级（任何时刻只有一个视觉焦点）、真实（不掩盖模型几何问题）。

## 2. Color Tokens（勿硬编码色值，一律用变量）

| Token | 值 | 用途 |
|---|---|---|
| `--acc` | `#45e0ff`（默认；每设备 `accent` 字段覆盖） | 强调、激活态、eyebrow、HUD 点 |
| `--acc-08 / --acc-16` | `color-mix(in srgb, var(--acc) 8/16%, transparent)` | 强调色背景梯度（随 --acc 自动换肤，勿手写 rgba） |
| `--bg-0 / -1 / -2` | `#030509 / #04070c / #0a121c` | 页面底 / 面板底 / 次级块 |
| `--txt-1 / --txt / --txt-2 / --txt-3` | `#f2f7fc / #dfe8f2 / #c9d6e4 / #7d8fa3` | 标题 / 正文 / 次级 / 弱化（对比度已达标，勿再调暗 txt-3） |
| `--panel-bg` / `--glass` | `rgba(7,13,20,.62)` | 玻璃面板底色 |
| `--line` | `color-mix(in srgb, var(--acc) 18%, transparent)` | 描边、分隔线 |

规则：新颜色一律 `color-mix` 派生自 `--acc`/`--bg-*`；每设备只允许换 `--acc`（设备配置 `accent` 字段），不允许设备级改其他 token。

## 3. Glass Materials（三级毛玻璃，勿发明第四级）

| 级 | 配方 | 用途 |
|---|---|---|
| G1 主面板 | `backdrop-filter: blur(16px) saturate(1.3)` + `--panel-bg` | HUD 工具栏、详情卡（hud.css） |
| G2 次面板 | `blur(14px) saturate(1.2)` | 大厅浮层 |
| G3 轻遮罩 | `blur(3~8px)` | toast、提示条、遮罩层 |

性能边界：G1/G2 只允许出现在**静态悬浮件**上，禁止加到跟随相机/逐帧变化的元素；移动端由浏览器降级即可，不写 JS 探测。

## 4. Typography

| Token | 值 | 用途 |
|---|---|---|
| `--sans` | `-apple-system, …, "PingFang SC", "HarmonyOS Sans SC", …` | 正文 |
| `--mono` | `ui-monospace, "SF Mono", …` | HUD 数据、eyebrow、型号标注 |
| `--fs-hud` | `10px` + 宽字距（eyebrow `letter-spacing:.42em`） | HUD 微标注 |

标题层级：大厅主标题 `clamp(72px,13vw,168px)` 编辑部式巨字 → 设备页 `tb-model` 等宽 → 卡片标题。中文正文 ≥13px，勿用 <10px 做可读文本（10px 仅限 HUD 装饰性标注）。

## 5. Shape / Spacing / Elevation

- 圆角：`--corner: 10px`（面板）· `--notch: 14px`（HUD 缺角造型）；按钮/输入沿用面板圆角，不另立体系。
- 间距标尺：4 的倍数（4/8/12/16/24/32）；大厅页边距 `clamp(24px,7vw,110px)`。
- 阴影：不用投影阴影表达层级（深色 UI 用**背景透明度 + 描边 + blur** 三件套）；`box-shadow` 仅允许强调色光晕（如 eyebrow 点 `0 0 10px var(--acc)`）。

## 6. 组件准入规则

新增 UI 组件必须：复用 G1~G3 + 既有 token；提供 hover/focus-visible/active/disabled 四态；触控目标 ≥44×44px（移动端 HUD 图标按钮实测已满足）；长文本有截断策略；不引入新依赖库（组件手写，见 ROADMAP §3.2）。

## 7. 禁止事项

- ❌ 新增硬编码色值 / 新玻璃配方 / 新字号家族；
- ❌ 为单页引入组件库或 Tailwind；
- ❌ 把强调色当背景大面积铺（仅点缀）；过曝光晕叠加（Bloom 已在引擎 L0 关闭，CSS 侧同样克制）；
- ❌ 用 CSS 修补 3D 层问题（映射错位/取景不准回去改引擎与配置）。

## 8. 换肤流程（设备接入时）

设备配置 `accent` 字段 → 引擎根元素写 `--acc` → 全站梯度自动派生。接入新设备时检查：accent 与默认 #45e0ff 的可区分度、在 `--bg-0` 上的对比度、`--acc-08` 背景下文本仍 ≥4.5:1。
