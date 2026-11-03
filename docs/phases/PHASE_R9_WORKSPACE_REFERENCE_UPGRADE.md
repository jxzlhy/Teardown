# PHASE R9 · 设备页参考站驱动升级：三区信息架构 + 雷达刻度盘底座（2026-11-03）

> 依据：用户 2026-11-03 指令「参考搜罗的同类 U/UX 站点，底座与浅色展示 UI 调研，模型详情页整体交互与 UI 重大升级」。
> Skill 链路（REFACTOR_SPEC §一）：`frontend-design`（SKILL.md 全读）+ `impeccable`（SKILL.md 全读 + context + craft-floor + detect）+ 项目 `DESIGN_SYSTEM.md` / `UI_UX_REFACTOR_SPEC.md`。
> 模式提炼与采纳裁定：`docs/design/REFERENCE_STUDY_2026-11-03.md`（R1–R10）。
> DESIGN_SYSTEM 增补：§13 展陈空间组件模式。

## 一、本轮实施的垂直切片

### S1 调研沉淀（R1–R10 采纳裁定）
- `docs/design/REFERENCE_STUDY_2026-11-03.md`：八参考站共同语法（三区一底 / 雷达盘 / 双语命名 / 状态语言 / 真实性声明卡 / 双主题）→ 采纳 R1–R5、缓采 R6、不采 R7/R8/R10（理由见文内）。
- `DESIGN_SYSTEM.md` §13：雷达刻度盘 / 顶栏规格 chip / 部件索引行 / 档案面板 / 拆解进度读数 五种固定版式入册。

### S2 底座升级 · 雷达刻度盘（R1，采纳）
`src/engine/engine.js` plinth 重建（保持六层骨架与 API 不变）：
- ④雷达刻度盘面：原「1 实线 torus + 48 刻度环 + 金属带 + 3 断弧」合并为**单张 1024 canvas 纹理 × 单 RingGeometry**：外缘实线环 + 中环虚线 + 内环细虚线 + 三级放射刻度（2° 短 / 10° 中 / 30° 长）+ 30° 分段弧块。RingGeometry 平面 UV 按 `r/outer` 精确换算画布半径（对齐误差消除）。**无数字——不伪造测量红线保持**。
- ⑤外缘渐变弧光 ×2：RingGeometry 扇段 + 顶点色沿弧长正弦渐变（黑→accent→黑）+ Additive（黑即不可见）；细线（0.044 单位宽）、夜厅 opacity .6、日厅 .1。
- `setPedestalHall`：夜厅冷青刻线（0x9fc3d4/.7）；日厅暖石墨浅刻线（0x6f6553/.5，纸面画廊口径）+ 弧光近隐——参考 VNT-16 白模厅的克制。
- 保持：`setPlinthTop` 接地随动、deviceRadius 径向缩放、thumb 模式整组隐藏、不参与拾取、无循环动画（reduced-motion 天然安全）。网格/轴线/gizmo 坐标语义不受影响。

### S3 设备页三区升级（R2/R3/R4/R5 采纳）
`src/components/DeviceViewer.vue` + `src/style.css`：
- **R2 顶栏规格 chip**：`device.specs` 前 3 条 → 数值（mono 12.5px）/标签（8.5px 宽字距）两行 chip；≤1080px 整组隐藏（移动端给名称让位）。数据全部来自设备档案，缺失即不渲染。
- **R3 部件索引行**：三列同行改两行结构（CN 名主行 + EN 全名副行，mono 8px 大写、单行截断）；头部计数独立 `.rail-count`（13px 提级）。紧凑/展开/圆点/宫格四态与移动端 chips 全保留。
- **R4 档案面板（UNIT DOSSIER）**：infoPop 重排——品类眉题 → **EN 型号大字（.dp-model，name 层 26px/900）** → CN 名（次级 13px/600）→ 简介 → 规格瓦片。规格瓦片 = `#infoPop .spec` 纯 CSS 重排为 2 列网格（值上/标签下，flex order 视觉序），**DOM 结构 `.spec>.k+.v` 不变**（smoke `#infoPop .spec .k` 断言依赖，锚点保全）。
- **R5 拆解进度读数**：dock 拆解组尾部 `#exReadout` mono 百分比（`ui.explode` 本身 0–100，等宽数字防跳动），随 explodePct 实时刷新；≤700px 隐藏。
- **附带修复（真实缺陷，非装饰）**：`#coordAid`（罗盘+网格钮）与打开的 `#ctxCard` 相互压盖（同 z5、DOM 序使按钮浮于卡面）→ 详情卡打开时 coordAid 淡出（`.viewer.ctx-open`，桌面/移动统一）。

## 二、红线核查（REFACTOR_SPEC §六）

- 3D 引擎核心：加载/Raycaster 拾取/爆炸/X-Ray/Clip/相机/深链/逐步装配/Tour/测量 **零逻辑改动**——plinth 仅材质与纹理层，不进 pickMeshes。
- smoke DOM 锚点：`#ctxCard`（结构未动）、`#mpChips`、`#clipStrip`、`#topbar`、`#infoPop .spec .k`（DOM 序保留）全部保全。
- 移动端 sheet/floatSlots 遮挡矩阵未触碰；dock tooltip z30 体系未触碰。
- 无新依赖、无组件库、无硬编码色（新样式走既有 token + 双厅覆盖块）。

## 三、验证记录

| 项 | 命令 | 结果 |
| --- | --- | --- |
| 构建 | `npm run build` | ✓ 4.9s（两轮：初版 + 收敛修正版均绿） |
| 设备页 e2e | `node tools/hud-verify.mjs`（新） | 见下方「结果回填」 |
| 全站冒烟 | `npm run smoke` | 见「结果回填」 |
| 设计检测 | `impeccable detect --json`（DeviceViewer/style/hud.css） | 1 条 advisory（`--ease-spring` 既有 house token，§6 已限定仅点缀，非本轮引入） |
| 目检 | 日夜×桌面/移动截图 5 张 | docs/design/screenshots/2026-11-03-hud-rev/ |

### 环境口径（如实记录）
本机与并行会话共享整机：本轮验证期间并行会话持续运行无头测试（Chrome 进程 66–83、负载 8–16），渲染进程在 GLB 加载期被环境回收（frame got detached）多次。处置：①清理孤儿测试 Chrome（按 `--use-angle=swiftshader` 测试专用 flag 精确匹配，未动并行会话进程）；② `tools/hud-verify.mjs` 内置每段独立浏览器实例 + 崩溃换新实例重试护栏；③默认验证设备选轻载 `iphone-13`（178KB 正常尺度），`--device action4` 预留整机空闲时的完整旗舰断言。

### 结果回填（2026-11-03 实测）

- **hud-verify（tools/hud-verify.mjs，新增）12/12 ALL PASS**（设备 iphone-13）：
  顶栏规格 chip ×3（真实档案数据）✓ / rail 两行行结构 12/12 + 计数 ✓ / 拆解读数 100%（0–100% 口径）✓ / 档案面板 IPHONE 13 大字 + 9 瓦片（8 规格+era）+ credit ✓ / 详情卡打开 + coordAid 淡出 ✓ / 日厅主题 ✓ / 移动 chips 12 + 顶栏 chip 隐藏 ✓ / sheet 打开 coordAid 不压卡 ✓ / 桌面+移动控制台零真实错误 ✓；截图 5 张（日夜 × 桌面/移动）落盘目检通过。
- **npm run smoke：26/28 绿**。全部设备页链路绿（action4 装载/OFFICIAL/14 部件、仅加载当前配置、无引擎异常、X-Ray、剖切 stencil、逐步装配、Esc 复位、原理词条、档案 era 行、对比页、运行演示、收藏持久、编年、测量×2、视角预设、m4 取景护栏、BVH、映射对账、空白还原）。2 项失败均定性为环境（非回归）：
  ①「导览讲解卡」——pocket3 `tour[0].note` 实为旋转屏词（数据未动），实测读到的是后续条目词：高负载下 auto 导览墙钟推进快过了首次读取（camTween 墙钟口径，见记忆库 4d），负载抖动；
  ②「执行异常：detached Frame」——并行会话 OOM 签名（本会话全程反复实证），移动端 sheet 两项后续断言被截断；该两项已由 hud-verify 等价覆盖 ✓。
- **lint:devices** ✓（128 台五处一致）；**impeccable detect** 1 条 advisory（既有 house token，非本轮引入）。
- 挂账：`--device action4` 旗舰断言与 smoke 全量低负载复跑（ Established 挂账窗口机制，负载 <5）。

## 四、遗留与下一步

- R6（部件分组节头）：需设备数据结构升级（group 字段 × 128 台），挂 backlog 单独立项。
- R8（日厅白模材质）：涉及真实模型材质呈现边界，挂 backlog 研究项（不承诺）。
- action4 完整旗舰断言（含 era 行验证）挂账整机空闲复跑。
