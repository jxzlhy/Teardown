# DJI 拆解馆 · UI 3.0 升级技术文档

> 版本目标：**2.0 → 3.0**。关键词：**影院级开场 · HUD 视觉系统 · 上下文交互 · 全端可用**。
> 本文是 UI/布局升级的完整设计与实施规范。现有架构（引擎/壳分离、设备配置体系）保持不变，
> 所有升级在其上叠加。架构现状见 [TECH.md](./TECH.md)。

---

## 0. 现状诊断（基于 2.0 实测截图）

| # | 痛点 | 证据 | 影响面 |
|---|------|------|--------|
| 1 | **大厅卡片纯文字**，无任何视觉预览，25 台设备扫一眼全是字 | 首页截图：卡片只有名称+标签 | 第一印象、点击率 |
| 2 | **爆炸后部件被面板遮挡**：右侧详情面板压住飞出的部件（QS 快切按键被切一半） | 拆解态截图右缘 | 核心体验 |
| 3 | **标签重叠打架**：「镁合金机身/广角镜头模组」「镜头保护镜/图像传感器」互相叠字；无引线，只有一根短竖线 | 拆解态截图中部 | 可读性 |
| 4 | **点击部件没有镜头反馈**：只有发光，相机不动，部件在画面里还是那么小 | engine.js `selectPart()` 无相机逻辑 | 交互质感 |
| 5 | **面板常驻占屏**：清单+详情+工具栏三块玻璃板围一圈，画布实际可用 <50% | 整机态截图 | 沉浸感 |
| 6 | **移动端布局崩坏**：清单与详情面板互相叠压盖死模型，工具栏堆成 5 行，标题截断 | 390×844 截图 | 全部移动用户 |
| 7 | **没有开场演出**：加载转圈后画面直接出现；参考视频的"哇"时刻（相机推近+自动装配+HUD 逐个点亮）完全缺失 | — | 传播力 |
| 8 | **查看模式单一**：无 X 光透视、无部件隔离、无剖切、无截图/分享、无自动导览 | engine.js API 面 | 可玩性 |

**对标参考**（抖音爆款拆解页的共同配方）：深色 HUD + 发光描边 + 引线标注 + 影院级开场 + 一键爆炸 + 逐件导览。
我们的引擎底子（爆炸向量、错峰动画、程序化内构件）已经齐了，缺的是**最后一公里的视觉与交互包装**。

---

## 1. 设计语言：HUD Design Tokens

把现在散落在 `style.css` 的视觉决策收拢为 token 层，一次定义、全站生效、每设备自动换肤（现有 `--acc` 机制保留并扩展）。

```css
:root {
  /* —— 色彩 —— */
  --acc: #45e0ff;                       /* 设备强调色（已有，registry 下发） */
  --acc-08: color-mix(in srgb, var(--acc) 8%, transparent);
  --acc-16: color-mix(in srgb, var(--acc) 16%, transparent);
  --bg-0: #030509; --bg-1: #04070c; --bg-2: #0a121c;
  --txt-1: #f2f7fc; --txt-2: #c9d6e4; --txt-3: #7d8fa3;
  --glass: rgba(7,13,20,.62);           /* 玻璃拟态底，比 2.0 的 .72 更透 */
  --line: color-mix(in srgb, var(--acc) 18%, transparent);
  /* —— HUD 形状 —— */
  --corner: 10px;                        /* 面板圆角，2.0 的 4px 太硬 */
  --notch: 14px;                         /* 切角尺寸（clip-path 用） */
  /* —— 动效 —— */
  --ease-out: cubic-bezier(.22,.9,.28,1);
  --ease-spring: cubic-bezier(.34,1.45,.5,1);
  --dur-1: .18s; --dur-2: .32s; --dur-3: .6s;
  /* —— 字体 —— */
  --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --sans: -apple-system, "PingFang SC", "HarmonyOS Sans SC", sans-serif;
  --fs-hud: 10px;  /* HUD 小字统一 10px + 0.24em 字距 */
}
```

**HUD 组件库**（`src/ui/hud.css`，全站复用，替代各页面手写）：

| 组件 | 做法 | 用在哪 |
|------|------|--------|
| `.hud-panel` | 玻璃拟态（`backdrop-filter: blur(16px) saturate(1.3)`）+ 1px 内描边 + `clip-path` 单角切角 | 所有面板 |
| `.hud-corner` | 四角 L 型角标（伪元素，2px 发光线条，入场时从 0 缩放弹出） | 面板、卡片、详情卡 |
| `.hud-eyebrow` | `mono 10px / 0.24em` 强调色小字 + 前置 24px 横线 | 各面板标题 |
| `.hud-scan` | 扫描线：`repeating-linear-gradient` + 一条周期性下扫的高亮带（`@keyframes` 移动的 `linear-gradient`） | 大厅 hero、加载页 |
| `.hud-glow-btn` | 按钮：默认描边态 → hover 时 `box-shadow: 0 0 18px var(--acc-16)` + 文字变强调色 | 全部按钮 |
| `.hud-chip` | 筛选 chip，选中态内发光 + 微缩放 `scale(1.04)` | 大厅筛选 |

> 参考实现：[Cosmic UI](https://github.com/rizkimuhammada/cosmic-ui)（Vue 可用的 Tailwind HUD 组件，抄切角与发光参数）、
> [Futuristic HUD CodePen](https://codepen.io/DESKTOP-the-decoder/pen/ZEZJvPL)（伪元素角括号+扫描线全套 CSS）。
> 我们不引 Tailwind，只抄参数写原生 CSS，保持零依赖。

**动效编排**：引入 **GSAP 3**（`npm i gsap`，~70KB）做 DOM 侧编排（面板 stagger 滑入、数字滚动、逐字显现）。
3D 侧继续用引擎自带 camTween，不混用两套 tween。

---

## 2. 信息架构（不变 + 两处扩展）

路由保持：`/`（大厅）、`/device/:id`（拆解页）。新增：

1. **URL 状态同步**（拆解页）：`#/device/action4?e=1&p=battery&t=1`
   — `e` 爆炸度、`p` 选中部件、`t=1` 自动导览。分享链接打开即还原现场（引流场景刚需）。
2. **最近浏览**：localStorage 记录最近 5 台，大厅顶部显示「继续拆解」横条。

---

## 3. 大厅 3.0：「展馆门面」

### 3.1 布局

```
┌────────────────────────────────────────────────────────────┐
│ ● TEARDOWN GALLERY                        VOL.04 · 25 台    │
│                                                            │
│   拆 解 馆            ┌──────────────────────┐             │
│   DEVICE TEARDOWN     │   ★ 3D 焦点展台 ★     │   ← Hero：  │
│   把每一台机器，        │  （当前焦点设备实时    │   右侧内嵌   │
│   拆到最后一颗螺丝      │   渲染 + 缓慢自转 +   │   一个共享   │
│   [ 开始导览 ▸ ]      │   呼吸光效，hover 翻页 │   WebGL     │
│                       └──────────────────────┘   小画布）   │
│ ── 继续拆解：Action4 · S25U · Pocket3 ────────────────────  │
│ [品牌 chips] [类型 chips] [🔍 搜索]        [⊞|☰ 视图切换]   │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │ 3D图 │ │ 3D图 │ │ 3D图 │ │ 3D图 │ │ 3D图 │  ← 卡片带    │
│ │名称..│ │      │ │      │ │      │ │      │    实机缩略图 │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
└────────────────────────────────────────────────────────────┘
```

### 3.2 关键特性与实现

**A. 卡片实机缩略图（最大视觉增量）**

- `ThumbStage`（`src/components/ThumbStage.vue`）：**全站共享一个离屏 WebGLRenderer**（256×192，DPR 1），
  按 `IntersectionObserver` 顺序为进入视口的卡片渲染其设备 GLB 快照 → `toDataURL` 写入 `<img>`，渲染完立即 dispose 几何，**同屏只保留 1 个 GLB 在显存**。
- 设备简易预览配置：复用 `frontAxis/targetWidth/camDist`，相机固定 3/4 前视角 + 单盏主光 + 纯色背景（不加载完整引擎，独立 80 行轻量渲染器）。
- 缩略图首次渲染后缓存进内存 Map（路由切换不重渲），失败（GLB 太大/超时 8s）回退到现在的纯文字卡。
- 卡片 hover：缩略图从静态图切换为**实时旋转**（把该设备接进共享渲染器，持续 3s 转动，鼠标离开停止）——低成本实现"卡片活了"。

**B. Hero 焦点展台**

- 复用 ThumbStage 的同一渲染器（同一时刻要么渲染缩略图要么渲染 Hero，队列调度），轮播 4 台招牌设备（Action 4 / Mavic 3 Pro / Vision Pro / Switch 2），6s 自动切换，左右 hover 热区可翻。
- Hero 设备缓慢自转 + 底部反射光晕；切换时 GSAP 淡入 + 相机微推。
- 点击 Hero 直接进对应拆解页。

**C. 其他**

- 筛选行升级为**吸顶**（滚动后 `position: sticky`），视图切换「卡片/紧凑列表」；
- 卡片入场动画改 GSAP stagger（现在 CSS delay 12 个一组，改完滚动再入场的卡片也有动画）；
- 移动端 Hero 缩为顶部 16:9 横幅，卡片单列。

---

## 4. 拆解页 3.0：「悬浮 HUD + 上下文卡片」

### 4.1 桌面布局重构

核心思想：**面板从"常驻三栏"改为"上下文出现"**——不选部件时画布独占全屏；选中部件时详情卡才滑入。

```
不选中任何部件（画布最大化）            选中部件（上下文详情卡）
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ ←  AC203 · OSMO ACTION 4   ⓘ │    │ ←  AC203 · OSMO ACTION 4   ⓘ │
│                              │    │ ┌────────────┐               │
│ [部件] ⟨icon rail⟩           │    │ │ 部件详情卡   │← 滑入，右下    │
│  01 02 03                    │    │ │ 07 镁合金机身 │  浮动，不挡    │
│  04 05 06        🎬 3D 模型   │    │ │ tag/描述/    │  爆炸路径      │
│  ...              全屏       │    │ │ 参数表]      │               │
│                              │    │ └────────────┘               │
│ ┌──────────────────────────┐ │    │ ┌──────────────────────────┐ │
│ │ ⚡ dock 工具栏（图标化）    │ │    │ │ ⚡ dock 工具栏            │ │
│ └──────────────────────────┘ │    │ └──────────────────────────┘ │
└──────────────────────────────┘    └──────────────────────────────┘
```

| 区域 | 2.0 | 3.0 |
|------|-----|-----|
| 顶部 | 大标题+副题占 150px 高 | **细导航条**：返回 ‖ 设备名+型号徽章 ‖ ⓘ 总览按钮 ‖ 状态灯。总览信息（规格表）移入 ⓘ 弹出卡 |
| 左侧部件清单 | 236px 常驻面板 | **可折叠图标 rail**：收起时一列部件序号圆点（hover 展开名称、显示选中态色环）；点头部展开完整清单（含英文名）。折叠状态存 localStorage |
| 右侧详情 | 296px 常驻 | **上下文详情卡**：仅选中部件时出现，右下浮动 340px 卡，出现动画 = GSAP `x:+40→0, opacity` + 角标弹出。内容增加：部件小图（从缩略图管线取该部件特写）+「聚焦」按钮 |
| 底部工具栏 | 文字按钮排一行 | **图标 dock**，分 3 组：①拆解（一键拆解/滑杆）②视图模式（整机/X光/隔离/剖切 四态）③显示（标签/旋转/截图/导览）。图标 + hover tooltip，移动端同样式 |
| 状态角标 | 左下 hint + 右下 status 两堆字 | 收进 ⓘ 卡和 dock tooltip，桌面只在加载期显示进度 |

### 4.2 标签系统升级（`engine/labels.js` 独立成模块）

1. **引线**：每个标签由「锚点圆点 → SVG 折线（斜 45° 段 + 水平段）→ 标签框」组成。
   实现：`#labels` 层放一个全屏 `<svg>`，每帧把部件锚点世界坐标投到屏幕，标签框放在投影点
   右上/右下 45° 方向固定偏移（左右交替避让），SVG `<path>` 连接。选中件引线加粗发光。
2. **碰撞规避**：每帧对可见标签做 Y 轴分箱（桶高 = 标签高），同桶内依次上下推开（O(n) 简单算法，n<20 足够），消灭叠字。
3. **分级显示**：`labelsMode = auto / all / off`。auto 下按爆炸度渐显（现有逻辑保留），爆炸时只显示**外侧 1/3 部件**的标签，其余随深度渐隐——画面不再糊满字。
4. 标签框加 `.hud-corner` 角标 + 编号色环，与全站 HUD 语言统一。

### 4.3 开场演出（Boot Sequence，参考视频的核心 wow）

加载完成后的 4 秒编排（GSAP timeline 驱动 DOM，引擎 camTween 驱动相机，引擎新增 `assembleFrom(explodeT)` API）：

```
t=0.0  黑场，设备名大字逐字显现（mono 英文 + 中文粗体）
t=0.6  相机从远景 dolly-in（现有 booted camTween 复用，时长 1.9s）
t=0.9  模型以 explode=0.6 的散开状态出现，随后 1.4s 内自动装配到 0
       （复用现有错峰爆炸动画反向播放，视觉=「零件飞拢成整机」）
t=2.4  HUD 逐个点亮：导航条 → rail → dock 依次 stagger 滑入（每项 60ms）
t=3.2  一道扫描光带从上到下扫过画面（.hud-scan 一次性播放），状态灯变绿
t=3.5  底部浮现提示条「SPACE 一键拆解 · 点击部件查看详情」，3s 后淡出
```

加载期同步升级：转圈改为**分段进度**——「构建场景 → 加载官方模型 37% → 编译材质 → 装配」，百分比来自引擎已有的 `LOADING %` 状态（2.0 已上报，UI 没用上）。

### 4.4 新增查看模式（dock 第②组）

| 模式 | 效果 | 实现要点 |
|------|------|----------|
| **整机** | 默认 | 现状 |
| **X 光** | 外壳变半透明蓝玻璃，内构件保持实色 | `engine.setXray(true)`：遍历 `realPartIds` 外壳类部件材质 → `transparent=true, opacity=0.16, depthWrite=false`；内构件不动。设备配置新增 `xrayShellIds`（默认=非 internal 部件） |
| **隔离** | 只显示选中部件，其余淡出至 6% + 关阴影 | `engine.isolate(partId)`：其余部件材质 opacity→0.06（逐帧 lerp），`castShadow=false`；再点一次或 Esc 退出 |
| **剖切** | 一个可拖动剖切面把机身切开，切口用Stencil 封盖 | `renderer.localClippingEnabled` + 水平面（高度由 dock 滑杆控制）；封盖用 three.js 官方 [clipping stencil 方案](https://threejs.org/examples/#webgl_clipping_stencil)。对本项目 20+ 材质逐个挂 `clippingPlanes`，封装 `engine.setClip(height|null)` |

四态互斥（进入隔离自动退出 X 光），快捷键 `1/2/3/4`。

### 4.5 交互补强

- **点击部件 = 相机飞近**：新增 `engine.flyToPart(partId)`——取部件包围盒，目标点=盒中心，距离=盒对角线×2.2，复用现有 `camTween` 缓动 0.8s。同时详情卡滑入。`Esc`/点空白飞回全景。这是 2.0→3.0 **交互质感提升最大的一处**（参考 [camera-controls 的 fitToObject 思路](https://github.com/yomotsu/camera-controls)，我们自实现 ~30 行，不引库）。
- **悬停预览**：hover 部件时 rail 上对应序号点亮（双向联动已有，补 rail 侧）。
- **截图**：dock 相机图标 → `renderer.domElement.toBlob()` 下载 PNG。实现：截图帧临时用 `composer.render()` 后立即读取（需在 `render` 后同步调用；避免常开 `preserveDrawingBuffer` 的性能损耗——截图时手动再渲染一帧再读）。
- **自动导览（Tour）**：dock 播放键 → 依次飞到每个部件（`flyToPart`）+ 高亮 + 详情卡显示 + 标签点亮，每件 3.5s，底部出现进度点列，可 ←/→ 手动步进、任意交互即暂停。播放顺序用设备配置新增的 `tour: ['lens','sensor',...]`（未配置则按 parts 顺序）。**这是可发抖音的"一键装杯"模式**。
- **爆炸度滑杆**保留，但爆炸布局新增第二算法：**径向布局**（部件按 `ex` 方向归一化后统一放到半径 R 的球壳位置，形成"一圈花瓣"式排布，适合截图）。dock 长按拆解键切换布局（高级选项收进 ⓘ）。
  > 布局自动排布的学术参考：[Adobe Interactive Exploded Views](https://research.adobe.com/publication/automated-generation-of-interactive-3d-exploded-view-diagrams)；我们只做其简化版（径向+防重叠回退）。

### 4.6 键盘与帮助

- 快捷键扩充：`SPACE` 拆解/组装、`1-4` 视图模式、`F` 聚焦选中件、`T` 导览、`S` 截图、`L` 标签、`H` 沉浸、`?` 帮助。
- 帮助卡（现有 guideCard）重绘为 HUD 风格 + 快捷键全表 + 模式说明。

---

## 5. 引擎层重构（engine.js 700 行 → 模块化）

```
src/engine/
├─ engine.js          ~260 行：装配流程（loadDevice/GLB 归类，2.0 逻辑原样保留）+ 门面导出
├─ render-core.js     渲染器/场景/灯光/背景/后期链
├─ explode.js         爆炸状态机（相机基向量 + 错峰 + 新增径向布局 + assembleFrom）
├─ camera-rig.js      camTween / flyToPart / resetView / 视角预设
├─ labels.js          投影标签 + SVG 引线 + 碰撞规避（见 4.2）
├─ view-modes.js      X 光 / 隔离 / 剖切（材质状态机，负责 baseEmissive 快照恢复）
└─ materials.js       （不动）
```

拆分原则：**对外 API 完全兼容**（`createEngine` 返回对象在现有方法上只增不改），Vue 壳按节奏切换。
`dispose()` 需要新增：OutlinePass/剖切材质/引线 SVG 的清理。

后期链升级：

```
RenderPass → OutlinePass(选中 3px 强调色 + 悬停 1.5px 暗色) → UnrealBloomPass(0.42 保留) → OutputPass
```

- [OutlinePass 官方示例](https://threejs.org/examples/#webgl_postprocessing_outline)给选中/悬停**轮廓光**，与现有 emissive 呼吸叠加（emissive 调弱到 0.06，避免双层过曝）。
- 性能兜底：OutlinePass 在移动端自动跳过（见 §7）。

---

## 6. 数据层扩展（devices/*.js，全部可选、向后兼容）

```js
{
  /* …现有字段不动… */
  hero: true,                    // 参与 Hero 轮播（默认 false，选 4 台）
  xrayShellIds: ['shell','glass'],  // X 光下变半透明的部件（默认自动推断）
  tour: ['lens','sensor','mainboard'],  // 导览顺序（缺省=parts 顺序）
  parts: [{
    id:'mainboard', /* …现有字段… */
    icon: 'chip',                // dock/rail 图标名（内置 12 个 SVG）
    hot: true,                   // 导览重点件（Tour 中停留 5s）
  }]
}
```

24 台设备**不强制**补字段：没配的走缺省行为，优先给 6 台 DJI + 2 台 Apple 旗舰补全（第一批）。

---

## 7. 移动端方案（对齐 2.0 截图问题逐条修）

| 问题 | 3.0 方案 |
|------|----------|
| 面板叠压盖死画布 | 部件清单 → 顶部横滑 chips（部件序号+名，一行）；详情 → **底部 45% 高 sheet**（可下滑关闭，拖拽把手）；总览 → ⓘ 全屏 sheet |
| 工具栏堆 5 行 | dock 精简为 6 个图标一行（拆解/视图/标签/旋转/截图/导览），滑杆收进拆解按钮长按 |
| 标题截断 | 导航条单行：`←` + 型号徽章，全名只在 sheet 显示 |
| 性能 | DPR clamp 1.5、阴影 1024²、跳过 OutlinePass、bloom 半分辨率（`EffectComposer` 尺寸 ×0.5）；`navigator.hardwareConcurrency ≤ 4` 时再关粒子 |
| 手势 | 双击部件=flyToPart、双指捏合=爆炸度（替代滑杆）、长按=隔离 |

移动断点：`≤ 860px`（现有断点保留）。3D 交互手势用引擎 pointer 事件扩展，不引手势库。

---

## 8. 实施路线图（4 个阶段，每阶段可独立验收合并）

| 阶段 | 内容 | 验收标准 | 预估 |
|------|------|----------|------|
| **P1 视觉基建** | tokens + hud.css 组件库 + GSAP 接入 + 开场演出 + 加载分段进度 | 打开任一设备页：4s 编排完整播放、HUD 角标/切角全站统一 | 1.5 天 |
| **P2 拆解页布局** | 导航条/图标 rail/上下文详情卡/图标 dock/标签引线+碰撞规避/ ⓘ 总览卡 | 爆炸态无标签叠字；选中件详情卡不遮爆炸路径；Ⓘ 可看规格 | 2 天 |
| **P3 引擎新能力** | flyToPart + OutlinePass + X 光/隔离/剖切 + 截图 + Tour 导览 + URL 状态 | 1-4 键四模式可用；分享链接还原现场；Tour 完整跑完 14 件 | 2.5 天 |
| **P4 大厅 + 移动端** | ThumbStage 缩略图 + Hero 展台 + 吸顶筛选 + 移动端 sheet 布局 + 性能自适应 | 大厅卡片全带实机图；390×844 下模型不被面板遮挡；低端机 FPS≥30 | 2 天 |

依赖关系：P1→P2→P3 串行（P3 依赖 P2 的 dock/UI 挂点）；P4 与 P3 可并行。
总量约 8 天单人工作量；每阶段结束跑一次 `npm run build` + 桌面/移动双端手测清单。

---

## 9. 风险与对策

| 风险 | 对策 |
|------|------|
| OutlinePass × Bloom 叠加过曝 | emissive 高亮系数从 0.12 降到 0.06，实测调参；保留开关可退回纯 emissive |
| 剖切 stencil 对 20+ 材质的兼容成本 | 剖切是最后实现的单项（P3 末），失败则降级为「无封盖剖切」或砍掉，不影响其他交付 |
| 共享缩略图渲染器与拆解页 WebGL 上下文冲突（浏览器上限 ~16 个 context） | ThumbStage 只在大厅存活，路由离开即 `dispose()`；快照用 dataURL 不依赖长驻 context |
| GSAP 引入体积（+70KB gzip 前） | 只用 core 不用插件；或评估原生 WAAPI 降级（路线图 P1 时决策） |
| 老设备数据无新字段 | 全部可选+缺省推断，`_kit/factory.js` 统一补全 |
| 调试钩子回归 | `__ENGINE/__RAW/__NORMDBG` 等全部保留，P2/P3 各补一条无头冒烟（engine.step() 推进 60 帧断言无异常） |

---

## 10. 附录：参考索引（调研所得，全部实测可访问）

**three.js 官方示例**
- OutlinePass 描边：https://threejs.org/examples/#webgl_postprocessing_outline
- 选择性 Bloom：https://threejs.org/examples/#webgl_postprocessing_unreal_bloom_selective
- 剖切 + Stencil 封盖：https://threejs.org/examples/#webgl_clipping_stencil

**开源项目**
- [camera-controls](https://github.com/yomotsu/camera-controls) — `fitToObject` 相机飞行（思路参考，自实现）
- [google/model-viewer](https://modelviewer.dev) — hotspot 标注 / poster 懒加载 / AR 出口的 UX 范式
- [WhiiteRose/Apple](https://github.com/WhiiteRose/Apple) — R3F+GSAP 克隆 Apple 产品页（滚动驱动 3D）
- [Cosmic UI](https://github.com/rizkimuhammada/cosmic-ui) — Vue 可用 HUD 切角/发光组件（抄参数到原生 CSS）
- [Futuristic HUD CodePen](https://codepen.io/DESKTOP-the-decoder/pen/ZEZJvPL) — 角括号+扫描线 CSS 全套
- [r3f 生产站案例集](https://github.com/pmndrs/react-three-fiber/discussions/1142) — 布局灵感池

**方法论**
- [Adobe: 自动生成交互式爆炸图](https://research.adobe.com/publication/automated-generation-of-interactive-3d-exploded-view-diagrams) — 爆炸布局算法
- [Builder.io: WebGL 滚动叙事](https://www.builder.io/blog/webgl-scroll-animation) — 分镜→进度映射（Tour 设计参考）
- [Needle Engine 优化指南](https://engine.needle.tools/docs/how-to-guides/optimization) — 纹理分级/LOD 流水线
- [Draco vs meshopt 选型](https://polymuse.tech/blog/why-3d-product-configurators-load-slowly) — 资产压缩策略

---

*本文档对应版本 3.0.0 规划；实施时按阶段在 TECH.md 追加变更记录。*
