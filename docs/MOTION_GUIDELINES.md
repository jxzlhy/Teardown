# MOTION GUIDELINES · 动效规范

> 基于实测：GSAP 仅编排 UI 时间线；three 主循环不被任何库接管；相机过渡在引擎内自研缓动。

## 1. Token（style.css，勿另立时长）

| Token | 值 | 语义 |
|---|---|---|
| `--dur-1` | .18s | 微反馈：hover、按下、开关 |
| `--dur-2` | .32s | 面板出入、卡片浮层 |
| `--dur-3` | .6s | 大区块转场、页面级 |
| `--ease-out` | cubic-bezier(.22,.9,.28,1) | 默认出场/进入 |
| `--ease-spring` | cubic-bezier(.34,1.45,.5,1) | 强调性回弹（仅点缀，勿全站弹簧） |

## 2. 职责边界（铁律）

| 层 | 负责 | 不负责 |
|---|---|---|
| CSS transition/animation | hover/active、面板出入、装饰循环（扫描线/脉冲） | 任何 3D 相关 |
| GSAP | 设备页开机时间线、UI 编排、文本/数字补间 | **不接管 three ticker**、不做每帧渲染逻辑 |
| 引擎（自研） | 相机 flyTo、爆炸/装配插值、呼吸浮动、待机自转、粒子 | 不操作 DOM |

禁止：为同一元素同时挂 CSS transition 与 GSAP 补间；JS 里手写 `style.transition` 绕过 token。

## 3. 3D 侧节奏（与 engine.js 对齐）

- 相机过渡：单段 0.6~1.2s，`--ease-out` 同族缓动；Tour 步间留 1~1.5s 停留。
- 爆炸/装配：整段 0.8~1.2s；部件多时按 explodeTarget 逐帧 lerp，不做逐件 stagger（避免乱序感）。
- 待机自转：>5s 无操作启动，速度以"读得清标签"为上限；交互即刻接管。
- 呼吸浮动：幅度 ≤ 设备高度 1%，周期 ≥4s。

## 4. prefers-reduced-motion（已落地口径，回归必查）

命中时：跳过开机时间线（直接显示控制条+操作提示）；相机缓动直达终点；关闭呼吸浮动/粒子旋转/待机自转；CSS 动画压至 0.001ms。新增动效必须包含同类降级分支。

## 5. 音画联动（预留，Phase 6 启用）

音效触发必须与动效同源（同一状态变化点），禁止各挂各的定时器；`dtm.audio=off`（默认）时全部静默，不影响动效。

## 6. 禁止模式

- ❌ 长页视差/平滑滚动库（无长页场景，Lenis 类不引入）
- ❌ 弹簧缓动用于错误提示（错误要严肃）
- ❌ 开场 >2.5s 的强制动画（reduced-motion 之外也要快进：点击可跳过）
- ❌ 无意义循环动画常驻（粒子/扫描线属氛围层，L0 画质与 reduced-motion 必须可关）
- ❌ 引入第二个 DOM 动效库（motion/anime/AutoAnimate 均不进，见 ROADMAP §3.3）
