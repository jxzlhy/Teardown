# UI_GUIDELINES · 组件与页面规范

> 阶段 B 交付（2026-10-31）。Token 以 `docs/design/DESIGN_SYSTEM.md` 为准；本文规定「组件长什么样、页面怎么组织」。

## 1. 组件规范

### 1.1 Button（`.hud-glow-btn`）
- 形态：描边态默认；`.primary` 强调（渐变底+描边+600 字重）；`.on` 激活（内辉光）。
- 尺寸：高 32–34px（HUD 密度），主 CTA 可到 44px（`#btnStart`）；移动端主操作 ≥44px。
- 语义顺序：主操作（开始拆解/聚焦）用 primary；面板内次操作默认描边；**同一视图 primary ≤1 个**。
- 反馈：hover 提亮+辉光（`--acc-16`），active 无弹簧（错误提示禁弹簧，MOTION §6）。
- 焦点：全局 `:focus-visible` 环（DESIGN_SYSTEM §7）。

### 1.2 Icon Button（`.hud-icon`）
- 38×38（顶栏/dock 34–38px），内嵌 18px stroke 图标；激活态 `.on`。
- 必配 tooltip：`.tip`（mono 9px + 可选 `<kbd>` 快捷键）；**顶栏内 tooltip 向下弹**（`.tip-below`），dock 内向上弹。
- 破坏性/低频动作（帮助、切台）降低视觉权重（低饱和描边）。

### 1.3 Panel（`.hud-panel`）
- G1 玻璃 + `--corner` 圆角 + 右上 `--notch` 缺角；条状面板与移动端 sheet `clip-path:none`。
- 可选 `.hud-corner` 四角 L 角标：仅用于「有身份的主面板」（顶栏/详情卡/总览/引导卡），普通面板不加。

### 1.4 Card（大厅 `.card`）
- 结构：媒体区（19/14 快照）+ body（brand eyebrow / 名称 / tagline / meta 徽标行）。
- hover 预算：**抬升 + 边框提亮 + 箭头浮现**三件套为上限；标题变色与径向光斑已裁撤（审计 P2-4，frontend-design「remove one accessory」）。
- 角标：收藏星标 28px（≥44 hit 通过 padding 扩展）；序号 chip 右上。
- 列表视图（`.as-list`）：横排 92×66 缩略图，tagline 隐藏——同一信息的两种密度，不新增第三种。

### 1.5 Chip / Badge
- `.hud-chip`（mono 10.5px 胶囊）：筛选器、移动端部件条。选中态：accent 描边+8% 底+辉光，**不用 scale(1.04) 跳动**（改为背景/描边变化）。
- `.card-meta i` 徽标：2.5px 8px 圆角 2px 小方签；`glb-badge`（模型来源）用设备 accent，`nc-badge` 用 `--warn`，`era-badge` 用中性。
- 状态灯 `.hud-dot`：`--acc`/`--ok`/`--warn` 三色，脉冲动画属氛围层，reduced-motion 压平。

### 1.6 Modal / Drawer
- 总览弹层 `#infoPop`：右上定位面板（非全屏遮罩），Esc/关闭钮可退，不锁滚动（工作空间场景）。
- 引导卡 `.overlay`：全屏遮罩 + 居中面板 + 明确主 CTA；Esc 可退；移动端单列（≤700px）。
- 我的探索抽屉 `#exploreDrawer`：右侧滑入 340px；**Esc 可关、遮罩点击可关**（阶段 C 落地）。
- 移动端详情 sheet `#ctxCard`：底部上滑，grip 可拖/点关闭，内容底部预留 dock 高度（审计 P1-1 修复）。

### 1.7 Input（`.filter-search`）
- 胶囊输入：mono placeholder、聚焦 accent 描边+辉光；移动端独占一行。
- 滑杆：`#exSlider`/clip 轨道 2px + accent 填充 `--p`；thumb 12px grab 态；0 态需保留端点可辨识（审计 P2-2）。

### 1.8 Loading / Empty / Error / Toast
- Loading：`#loader` ring+进度条+mono 分段文案（构建场景→下载→编译→装配），百分比只报真实进度。
- Empty：`.hub-empty`/`.dw-empty` 一句话+指向动作（「换个筛选条件试试」），不放插画。
- Error：`#loadErr` 面板给出恢复路径（重新加载/返回大厅），用 `--err` 点缀，不用弹簧；错误文案不道歉、给方案。
- Toast：`#toast` mono 胶囊，3s 自动退；与 `#clipStrip`/sheet 共存时自动让位（审计 P2-6）。

## 2. 页面组织规范

### 2.1 大厅（GalleryHub）
- 首屏 = 品牌巨字 + 一句副标 + 焦点展台（唯一视觉锚点）；统计条、最近浏览为次级条带。
- 筛选区信息架构（阶段 D 定稿）：**搜索是第一入口 → 类型主轴 chips → 品牌（≥14 项折叠为「更多」展开）**；收藏快捷并入首行；激活筛选以可清除 chip 汇总显示。
- 移动端（≤860px）：筛选默认收合（「筛选」按钮+激活数徽标），展开为抽屉面板；顶栏单列不折行（审计 P0-3）。
- 页脚：引擎/版权/署名三行 mono；数量口径全部来自 `virtual:device-manifest`。

### 2.2 工作空间（DeviceViewer）
- 布局骨架：顶栏（身份+状态+总览）/ 左 rail（部件清单，可折叠为圆点列）/ 底 dock（动作组）/ 右 ctxCard（选中部件详情）/ 浮层（clipStrip/tourBar/tourNote）。
- 视觉权重：3D 主体 > 顶栏 > dock 主键（拆解）> dock 图标组 > rail > ctxCard；任意时刻一个焦点。
- dock 分组语义：拆解主键 ‖ 视图四模式+测量+装配 ‖ 标签/自转/截图/导览/沉浸/帮助 ‖ 切台；组间距用 `.tb-sep`，「视图」组加微标（阶段 E）。
- 沉浸模式：全部面板淡出，仅留右上退出键；thumb 模式全部隐藏（渲染管线专用）。

### 2.3 次级页（graph/timeline/compare）
- 共用页头模式：返回 + eyebrow + 标题（`#graphBar`/`#cmpBar`/`#tlBar` 同构）；内容区铺满余幅。
- 编年标题数量口径「已编目 X / 共 Y 台」（诚实留白）。

## 3. 文案口径（utility copy）

- 按钮/动作：动宾短语，同一动作全站同名（「拆解」↔「组装」状态互斥命名；「关闭」不是「取消」）。
- 状态：真实状态词（OFFICIAL/COMMUNITY/PROCEDURAL/FALLBACK 配中文 hover 说明）。
- 数字：来自生成数据；0 值不展示（我的探索空态只留「我的探索」）。
- 禁黑话：UI 不出现「装杯」类行话；技术演示标注「示意动画，非仿真」。

## 4. eyebrow 使用边界（Skill 冲突裁决记录）

frontend-design 提示避免 ALL-CAPS 眉题滥用；本项目 HUD 体例保留 eyebrow，但执行：一层信息一个 eyebrow；同屏 ≤3 个；内容为「分类词 + 编号/英文注」而非装饰句；正文永不重复 eyebrow 内容。
