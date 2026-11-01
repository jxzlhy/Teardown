# INTERACTION_GUIDELINES · 交互 / 动效 / 键盘 / 无障碍规范

> 阶段 B 交付（2026-10-31）。动效铁律见 `docs/MOTION_GUIDELINES.md`（职责边界：CSS=微交互、GSAP=UI 编排、引擎=3D）；本文是面向使用者的交互行为约定。

## 1. 动效原则

1. **动效回答操作**：打开/收起/确认/切换必须让用户看清「什么变了」；非用户触发的动效只允许开场演出与氛围层（扫描线、HUD 点脉冲）。
2. **一屏一焦点**：页面加载只做一次编排（大厅 riseIn 序列 / 设备页 boot 时间线）；滚动/滚动加载不做逐卡 stagger 之外的额外循环。
3. 时长一律 token：`--dur-1/2/3`；缓动一律 `--ease-out`（强调点缀可用 `--ease-spring`）；禁止内联 `transition` 绕过 token。
4. 状态互斥：同一元素不同时挂 CSS transition 与 GSAP 补间（MOTION 铁律）。
5. **reduced-motion 必配降级**：任何新动效写明 reduce 分支（CSS 已全局压至 0.001ms；GSAP 侧跳过开场编排；引擎侧直达/停转）。

## 2. 面板进出（标准时长与方向）

| 面板 | 进 | 出 | 备注 |
| --- | --- | --- | --- |
| 顶栏/rail/dock | boot 时间线 0.5s 依次 0.12s 错峰 | 沉浸淡出 .35s | GSAP 只此一处 |
| ctxCard 桌面 | 右侧滑入 .34s | 滑出 .22s | 切部件重触发 |
| ctxCard 移动 sheet | 底部上滑 | 下滑 | grip 可关；不遮 dock |
| infoPop / tourNote | fade .25s | fade | 非模态 |
| exploreDrawer | 右滑 .25s | 右滑 | Esc/遮罩可关 |
| guide overlay | fade .5s | fade | Esc 可关；主 CTA 显式 |

## 3. 键盘地图（工作空间，已实现为准）

| 键 | 动作 | 键 | 动作 |
| --- | --- | --- | --- |
| Space | 拆解/组装 | F | 聚焦选中部件 |
| 1–4 | 整机/X光/隔离/剖切 | M | 测量 |
| B | 逐步装配 | T | 自动导览 |
| L | 标签三态 | S | 截图 |
| H | 沉浸模式 | R | 复位视角 |
| ← → | 切台（导览/装配时步进） | ? | 帮助卡 |
| Esc | 逐层退出：帮助→总览→沉浸→测量→装配→模式→选中 | | |

Esc 退出顺序不可倒置（外层浮层先退，选中最后清）。输入框聚焦时按键不劫持（滑杆方向键归滑杆）。

## 4. 无障碍约定

- **焦点可见**：全站 `:focus-visible` 2px `--acc` 环 + 2px offset（含 chip/卡片/图标按钮）；Tab 顺序遵循 DOM（顶栏→rail→dock→浮层）。
- **可退出**：所有浮层（引导/总览/抽屉/测量/装配/模式/选中）有 Esc 路径 + 可点关闭；沉浸模式有显式退出键。
- **触控目标**：视觉 34–38px 的图标按钮以 padding 扩展至 ≥44×44 有效区；移动 sheet grip 高 ≥32px。
- **对比度**：正文 ≥4.5:1；HUD 装饰标注（10px mono）不做唯一信息载体（必配 tooltip/aria-label）。
- **屏幕阅读器**：图标按钮必配 `aria-label`；折叠组件用 `aria-expanded`；toast/错误用 `role="alert"`（#loadErr 已设）。
- **动效敏感**：`prefers-reduced-motion` 全局 CSS + GSAP + 引擎三层降级（MOTION §4 口径，回归必查）。

## 5. 3D 交互约定（与引擎边界）

- 拾取/爆炸/视图模式/相机归属引擎；UI 只透传与回显（`ui` 状态单向流）。
- 空状态前置校验：隔离模式未选中时 toast 指引（已实现），不静默失败。
- 长按（dock 拆解键 520ms）= 布局切换彩蛋：必须有 toast 反馈 + 抑制 click（已实现 lpFired 机制）。
- 深链 `?e/p/t` 是一等公民：任何状态改动经 `syncUrl` 回写（260ms 防抖）；切台废弃旧参数。

## 6. 移动端交互专项（390×844 基准）

- 画布可操作性优先：面板不长期遮挡模型主体；sheet 展开时浮层按 `--sheet-h` 让位（已实现）。
- 横滑 chips（`#mpChips`）与 dock 溢出滚动隐藏滚动条但**必须可滑动**；溢出内容有渐隐提示。
- 双指缩放/单指旋转由引擎控制；页面级禁止劫持 pinch（viewport meta 不设 user-scalable=no 之外的缩放限制）。
- 桌面 hover 依赖的能力（tooltip、卡片箭头）在移动端必须有无 hover 等价路径（点按直达）。

## 7. 回归口径

每次 UI 改动跑：DESIGN_QA §3 视口清单（1440×900 / 1280×720 / 390×844 竖横）+ §2 视觉清单 + `npm run smoke`；动效改动另跑 reduced-motion 7 项断言。
