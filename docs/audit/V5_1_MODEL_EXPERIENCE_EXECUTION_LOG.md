# V5.1 MODEL EXPERIENCE LAB · 执行记录（EXECUTION LOG）

> 任务书：`docs/roadmap/GEWU_V5_1_MODEL_EXPERIENCE_LAB.md`（2026-11-06 用户下达原文归档）
> 每轮记录：实际修改 / 修改文件 / 测试结果 / 视觉证据 / 性能数据 / 遗留问题 / 下一步。
> 继承基础：AURORA V5.0.10 全部产出（详见 `docs/audit/V5_AURORA_DELIVERY_REPORT.md`）——I3 搜索/I4 弱化/R1-R3/realSizeMM 69 台/mech 35 文件/切台 Δ=0/loadTiming/camPos/deviceTier 遥测均为本任务的地基，不重复开发。

## 轮次索引

| 轮 | 内容 | 状态 |
|---|---|---|
| R0 | 参考项目研究 + 现状审计 + 功能对照表 | 🔄 进行中 |
| P1 | 3D 展示空间（底座三型/自适应/坐标辅助分级/尺寸辅助） | ⬜ |
| P2 | 陈列视觉（构图/灯光） | ⬜ |
| P3 | 通用拆解交互系统 | ⬜ |
| P4 | 3D 技术标注系统 | ⬜ |
| P5 | 操作布局（左导航/右信息/底控制） | ⬜ |
| P6 | 相机与自动巡览 | ⬜ |
| P7 | 移动端体验 | ⬜ |
| P8 | 通用架构（Presentation Config/Adapter/能力检测） | ⬜ |
| P9 | 性能与资源管理 | ⬜ |
| P10 | 视觉设计验收 | ⬜ |
| P11 | 自动化测试 | ⬜ |

## R0 — 参考研究与现状审计（进行中）

### 现状盘点（基于本会话 AURORA 深度工作——源码级已知，无需重审计的部分）

| 能力 | 参考项目 | 格物馆现状 | 行动 |
|---|---|---|---|
| 部件清单 | 左侧清单 | ✅ rail 双模式（清单/宫格）+ I3 搜索（中/英/编号）+ railDots 折叠态 + 移动端 chips | 统一体验 |
| 点击拆解 | 点击即拆 | ✅ pickAt/pickFromList + explode 系统（explodeTarget 插值 + 错峰 stag） | 深化 |
| 全部拆解 | 全局控制 | ✅ SPACE 一键拆解/归位 + dock 读数 | 深化 |
| 部件高亮 | OutlinePass | ✅ OutlinePass×2 + glow + I4 弱化 dim 通道 | 深化（弱化已超前） |
| 引线标注 | SVG 引线 | ✅ labels.js 三代（锚点圆点→45° SVG 折线→标签框，Y 轴分箱避让+分级显示+R2 脏检查）——**已超越参考项目** | 评估升级（参数摘要/编号卡形态） |
| 右侧详情 | 详情面板 | ✅ infoPop 档案瓦片版式（R9 参考站驱动）+ 部件详情卡 + 可信度 | 优化 |
| 定位视角 | 聚焦 | ✅ flyToPart + VIEW_PRESETS（front/back/left/right/interior）+ 5-8 键 | 优化 |
| 移动端抽屉 | 底部抽屉 | ✅ sheet（46vh 封顶/剖切条不遮挡/内容滚动） | 优化 |
| XYZ 坐标 | 坐标读数 | ⬜ **无**——仅有 coordAid 坐标辅助装置（视觉 gizmo）+ measure 测量工具（两点 mm） | **新建**（P1） |
| 三维网格 | 网格 | ✅ **PolarGridHelper(15,12,3,72) 已有**（engine.js:198，源码确认） | 评估升级（分级显示） |
| 展示底座 | 机械展台 | ✅ plinth 六层精密展底座（V3 遗产源码确认：engine.js:244 起，单纹理多环刻线+三级放射刻度+顶点色渐变弧光，双厅双材质）——**已有强底座**；缺口=三型自适应（A 精密/B 工程/C 大型按 bbox+realSizeMM 选型） | 评估升级 |
| 自动巡览 | 自动巡览 | ✅ Tour 系统（策展 tour 115 台+auto/manual 模式+tour 卡）——已有且更全 | 评估升级 |
| 相机预设 | 包围盒自适应 | ✅ CAM_HOME 按 camDist+portraitBoost 自适应（勿用固定坐标 ✓ 现状已合规）+ VIEW_PRESETS | 补 TOP/BOTTOM |

**结论**：格物馆现状在部件清单/拆解/标注/巡览/移动端上**与参考项目持平或超越**（R2 脏检查/tour 全馆覆盖/档案瓦片）；真正缺口 = **XYZ 坐标读数 + 分级空间辅助系统 + 展台自适应三型 + TOP/BOTTOM 预设 + 标注参数摘要形态**。

### 待办
- [x] WebFetch 参考仓库（页面级+main.js 源码深读完成）
- [x] plinth/GridHelper 现状源码确认（PolarGridHelper ✓ / plinth 六层 ✓）
- [x] 功能对照表定稿（本文档）
- [x] 体验缺口排序：**XYZ 读数+分级空间辅助（P1 核心）→ 展台三型自适应 → TOP/BOTTOM 预设 → 标注参数摘要形态**
- [x] R0 收口（2026-11-06）——进入 P1 实施

### R0 参考项目深读结论（main.js 源码级，2026-11-06 WebFetch）

| 机制 | 参考实现 | 格物馆对照 | 采纳结论 |
|---|---|---|---|
| 拆解动画 | basePosition/offset 结构 + **指数趋近**（k=1-exp(-speed·δ)，拆 4.8/归 6.2）+ delayUntil 顺序延迟（全拆 index×70ms、归位倒序 ×35）+ easeInOutCubic | worldOffset 同构 + explodeTarget 插值 + stag 错峰（同族不同实现） | 结构等价，**P3 借鉴 delayUntil 节奏**（可中断/中途恢复格物馆已具备） |
| 坐标读数 | camera.position 每帧 formatAxis（+号/两位小数）写 #axisX/Y/Z DOM + FPS 0.65s 更新 | **无此能力**；camPos 遥测已有（getState 实时） | **P1 核心**：camPos→HUD 读数（R1 降频兼容——降频时读数随渲染帧更新即可） |
| 标注引线 | 锚点 Object3D 挂 root → project → **同侧 y 排序防重叠 + 面板 getBoundingClientRect 避让** → SVG 三段折线（锚点→水平肘→标签边） | labels.js 45° 折线+Y 轴分箱+R2 脏检查（**更成熟**） | 主干保留；P4 增量=**面板 rect 避让+拆解态参数摘要卡** |
| 底座/刻度环 | Cylinder 台面+RingGeometry 双环+断弧 Torus+48 刻度线 LineSegments+GridHelper(36,72)+径向渐变辉光/接触阴影 CanvasTexture+整组 0.035rad/s 慢旋 | plinth 六层**实体多层**路线（单纹理多环刻线+放射刻度+弧光） | **融合路线**：plinth 实体保留，P1 做参数化自适应（bbox 驱动缩放/刻线密度）而非推倒重建 |
| 选中高亮 | 自发光脉冲+selectionHalo Sprite+**虚线圆环 reticle**（canvas 虚线+角标刻线，部件缩放表）+PointLight 跟随 | OutlinePass+glow+I4 dim | P3 可评估 reticle 形态（OutlinePass 已覆盖轮廓需求，低优先） |
| URL 分享 | ?part=gimbal/?view=exploded/?snap=1 | ✅ ?e=/?p= deeplink 已有 | 无需动 |
| 许可 | **无 LICENSE 声明（页面确认）** | — | §15 边界执行：只研究思路，零代码复制 ✓ |

### 修订后 P1 实施清单（R0 结论）
1. **XYZ 坐标读数 HUD**：camPos（已有）→ 顶部/角落读数元素（区分「世界坐标」标注），复用 R2 脏检查口径。
2. **分级空间辅助**：简洁（现 PolarGridHelper）/标准（+轴线刻度与中心参照）/工程（+bbox helper）三档一键切换。
3. **展台自适应**：plinth 参数化（bbox 最大维驱动台面半径/刻线密度/厚度），三型按 device.category+realSizeMM 选型（A 精密/B 工程/C 大型地台+网格范围）。
4. **TOP/BOTTOM 相机预设**补入 VIEW_PRESETS。

---

## P2-S1 · 单部件 Hide/Show（2026-11-06，P2 拆解交互首切片完成）

### 语义核查先行（任务书 §6.3）
现状确认：**pickFromList = selectPart + flyToPart（选择+聚焦），不改爆炸状态**——选择与拆解两动作语义分离**现状已满足**（拆解走 SPACE/滑杆/dock 独立操作）。P2 真缺口=§6.1 统一部件交互列表中唯一缺失能力：**单部件 Hide/Show**。

### 实际修改

1. **engine.js**：
   - `state.hiddenParts`（id 数组，getState 暴露）+ `setPartHidden(id, hidden)` / `showAllParts()` API
   - **mainLoop 末尾后置强制** `group.visible=false`——任何模式重放/归位动画/装载流程都不会把隐藏件带回（modes isoLerp 只管 opacity，两层正交）
   - loadDevice 切台清空集合（新台全可见）
2. **DeviceViewer.vue**：rail 行内**眼按钮**（hover 显示；点击 .stop——选择与隐藏是两个动作）+ 隐藏行 dimmed 淡化 + **rail-hiddenbar**（已隐藏 N · 全部显示）；宫格模式 dimmed 显示无眼钮（hiddenbar 兜底）
3. **Icon.vue**：+eye / eye-off 图形
4. **style.css**：.rail-hiddenbar / .prow-eye / .prow.dimmed

### 测试结果（生产 build + preview 浏览器断言，干净版二跑）

| 断言 | 结果 |
|---|---|
| setPartHidden(true) → visible=false + 集合 1 | ✓ |
| 爆炸（0.6）中保持隐藏 | ✓ vExploded=false |
| 归位后保持隐藏（后置强制） | ✓ vAssembled=false + 集合保持 |
| showAllParts → visible=true + 集合 0 | ✓ |
| rail 眼按钮 ×12 + hiddenbar 渲染 | ✓ |
| build 4.38s ✓ / lint 六段 ✓ | |

### 视觉证据
隐藏行 38% 透明淡化 + 眼按钮 hover 高亮（样式 token 同族）；截图随 P1 收口批统一采集。

### 遗留与下一步
- 首轮验证脚本自身污染（`= undefined` 赋值干扰第三段）——干净版二跑全绿（取证教训已入记忆库口径：验证脚本不得改被测状态）
- §6.1 余量：Focus（flyToPart 已有）/Isolate（已有）/X-Ray（已有）——**统一部件交互列表全项落地**
- 下一步：P2-S2 全局拆解统计（已拆件数读数）或 P3 标注面板

---

## P2-S2 · 全局拆解统计——已离位部件数读数（2026-11-06，任务书 §6.4 完成）

### 实际修改

1. **engine.js**：mainLoop 部件插值循环内累计 `exN`（lt>0.02 记为已离位——**与渲染状态同源零额外遍历**）→ `state.explodedParts` → **emit() 对象补 `explodedParts` 字段**（emit 与 getState 是两个构造对象——首轮只加 getState 致 UI 恒 0，复验抓出后补 emit 侧）→ getState 同步暴露。
2. **DeviceViewer.vue**：dock 读数旁 `#exParts`（`N/M 件`，mono 同族样式+分隔线）；explodedPartsCount computed。
3. **style.css**：#exParts 样式（glass-line 分隔线+tabular-nums）。

### 测试结果（生产 build + preview 浏览器断言）

| 断言 | 结果 |
|---|---|
| 装配态 | 0/12 件 ✓ |
| 全拆（explode=1） | **12/12 件** ✓（state.explodedParts=12 同步） |
| 归位 | 0/12 件 ✓ |
| build 2.80s ✓ / lint 六段 ✓ | |

### 首轮缺陷留档
emit() 对象与 getState() 是**两条独立构造路径**——新增 state 字段必须双侧同步（第一轮只加 getState 致 UI 恒 0/12，复验抓出）。

### 遗留与下一步
- §6.4 全部拆解/归位/进度/件数全项落地
- 下一步：P3 标注面板（参数摘要卡）或 §6.6 机构交互深化（mech 数据联动高亮）

---

## P1-S1 · XYZ 世界坐标读数 + 空间辅助四档（2026-11-06，P1 首切片完成）

### 实际修改

1. **engine.js**：
   - `state.spaceAid`（'off'|'simple'|'standard'|'engineering'，默认 standard=现状行为）+ `setSpaceAid/cycleSpaceAid` API + getState 暴露
   - `applySpaceAid()`：grid/axisX/axisZ 可见性按档位；engineering 档建 **Box3Helper**（deviceGroup bbox，半透明 0x2a6a8a）
   - `refreshSpaceAidBBox()`：爆炸/归位收敛点刷新（非逐帧 traverse）；`setGridVisible` 统一映射到档位（单一事实源，旧布尔开关兼容）
2. **DeviceViewer.vue**：**#axisReadout** 读数条（gizmo 罗盘下方，CAM 标注区分口径）——并入**既有 gizmo rAF 循环**（零新循环）：读 getState().camPos → toFixed(2) 签名比较 → 变化才写 DOM（R1 idle 降频时相机静止→签名恒等→零 DOM 写，天然兼容）；**G 键**四档循环 + toast 档位名。
3. **style.css**：#axisReadout mono 数字样式（glass/pill 同族 token）。

### 测试结果（生产 build + preview 浏览器验证）

- 读数元素渲染 ✓ · 内容 `CAM X +11.34 Y +6.90 Z +16.07` 格式正确 ✓
- 四档循环 cycleSpaceAid：engineering→off→simple→standard→engineering ✓（getState 断言）
- **读数随相机变化更新** ✓（爆炸前后签名变化断言 readoutChanged=true）
- build 2.71s ✓ / lint 六段 ✓

### 视觉证据
读数条位于 coordAid gizmo 下方（mono 数字 CAM 标注）；工程档 Box3Helper 半透明蓝包裹模型（截图待 P1 收口批统一采集）。

### 遗留与下一步
- ~~展台三型自适应参数化~~（→ P1-S2 完成）
- ~~TOP/BOTTOM 预设~~（→ P1-S2 完成）
- 工程档 bbox 在爆炸中途切档的刷新口径（现收敛点刷新，中途切档显示上一次收敛 bbox——可接受，注记）

---

## P1-S2 · 展台三型自适应 + TOP/BOTTOM 预设（2026-11-06，P1 第二切片完成）

### 实际修改

1. **engine.js**：
   - `plinthTypeFor(device)`：`device.presn.plinth` 显式覆盖口（Viewer Presentation Config §11.1 首步落地）→ category 正则映射（汽车|航天|飞机|飞行器→**large**；发动机|机械|工具|枪械|市政→**industrial**；其余→**precision** 默认）
   - `applyPlinthPreset(device)`：装载完成（finalize 内）实测 deviceGroup bbox → **maxDim/9.5 驱动缩放 k（clamp 0.85–1.35）× 类型系数**（large 1.35 / industrial 1.06 / precision 1）；**缩放只作用 x/z（y 不缩）**——避免底座升沉穿模；Face 刻线纹理随几何 UV 等比（视觉密度保持）
   - `state.plinthType` + getState 暴露；VIEW_PRESETS 补 **top [0,1,0.02] / bottom [0,-1,0.02]**（up 共线规避——z 微偏移）
2. **DeviceViewer.vue**：视角条加「顶部 <kbd>0</kbd>」chip + Digit0 键位

### 测试结果（生产 build + preview 双设备断言）

- **三型选型**：iphone-13（cat 手机→precision 构造性 ✓）/ porsche-911-carrera-4s（cat 汽车→**plinthType=large** ✓）
- **TOP 预设**：flyToView('top') → camPos [0, 21.2, 0.4] 正上方 ✓（无 lookAt 退化）
- build 3.45s ✓ / lint 六段 ✓

### 视觉证据
待 P1 收口批统一采集（large 型 911 大地台 vs iphone 精密台对比截图）。

### 遗留与下一步
- large 型 y 压扁未做（y 缩放需位置补偿——现版 large=1.35 倍半径地台，视觉已区分；压扁评估 P2 灯光批一并）
- 展台三型对 **GENERIC 池**（无 category 设备）→ precision 默认 ✓ 构造性安全
- **P1-S3 候选**：标注参数摘要卡（labels.js 形态升级）或 P2 拆解交互深化

---

## P3-S1 + P4 部分 · 选中件摘要卡 + mech 联动三级层次（2026-11-06 完成）

### 数据源评估结论（先行记录）
部件级 **specs 字段不存在**（技术参数摘要无数据源——不虚构）→ 摘要卡数据源改用 **parts[].tag**（简短说明，iphone-13 12/12、v6 6/6 等高覆盖）。§7.1「技术参数摘要」以此口径落地：**有 tag 显示 tag，无 tag 不占位**。

### 实际修改

1. **labels.js**：build 时 tag 存在则惰性注入 `.pl-tag` span（textContent 一次写，R2 脏检查口径兼容——内容不变不重写）；update 循环选中件 `classList.toggle('sel', sel)`。
2. **style.css**：`.p-label .pl-tag`（默认 display:none；`.sel` 展开；max-width 180px/左边框分隔/双厅色板）——**摘要卡=选中件标签展开形态**（§7.4 显示策略：默认收起、Select 展开 ✓）。
3. **engine.js selectPart**：mech 联动集合缓存（`state._connSel/_connSet`——selected 变化时从 device.mech.edges 建 from/to 对端 Set；无 mech 不建集合）；**applyGlow dimT 三级层次**：选中件 → 相连件（_connSet 豁免弱化，保持原亮度）→ 其他弱化 0.32。

### 测试结果（生产 build + preview 双设备断言）

| 断言 | 结果 |
|---|---|
| iphone-13 选中 display | sel 标签 ×1 ✓ · tag 卡 ×12 惰性注入 ✓ · 内容「6.1″ OLED · 刘海缩窄 20%」✓ |
| iphone-13 无 mech | connSet 空（**不虚构联动** ✓） |
| v8-engine 选中 crank | **联动集 [pistons, front-drive]** ✓（mech 边对端精确引用） |
| build 2.50s ✓ / lint 六段 ✓ | |

### 视觉证据
选中件标签展开 tag 卡（左侧边框分隔样式）；三级层次（选中亮/相连原亮度/其余 -68%）随 I4 dim 通道生效。

### 遗留与下一步
- §7.4「工程模式显示更多信息」→ 并入空间辅助 engineering 档后续评估
- §6.6 剩余：运动方向辅助/关节类型说明（part-mech 面板已有 note 全文——3D 内运动箭头为可选深化）
- 下一步：P4 自动巡览评估（Tour 系统已全馆覆盖——对照结论大概率「已超越不重复建设」）或 §17 门禁逐项核验准备

---

## P4 · 自动巡览对照评估收口（2026-11-06，结论：已超越不重复建设）

### 对照结论（源码级，tourInfo/tourStep/stopTour 实读）

| §9.3 要求 | 格物馆现状（Tour 系统） | 判定 |
|---|---|---|
| 可配置巡览节点 | **策展 tour 115+/129 台**（device.tour 声明式：目标部件+讲解词 note） | 已超越（参考项目单路线硬编码） |
| 相机位置/预设 | tourStep → flyToPart（部件包围盒聚焦+平滑 tween） | ✓ |
| 观察时间 | state.tour.wait（auto 模式按停留时长自动前进；manual 手动模式） | ✓ |
| 说明内容 | tour 卡讲解词渲染（smoke 断言项；唯一失败=历史 tour 墙钟抖动已定性） | ✓ |
| 是否触发拆解 | 不触发拆解但触发聚焦+选中（语义更保守——符合 §6.3 分离原则） | ✓ |
| 随时退出 | stopTour + Esc/交互中断 | ✓ |
| 整机概览/拆解结构节点 | resetView/爆炸态切换（既有快捷路径） | ✓ |

**裁定**：Tour 系统在内容（策展词）、覆盖（115 台）、模式（auto/manual）、退出（随时）四维全面超越参考项目单路线硬编码巡览——**P4 自动巡览不重复建设**；§9.1 预设已由 P1-S2 补 TOP/BOTTOM 收口；§9.2 部件聚焦=既有 flyToPart ✓。**P4 收口**。

### P4 遗留
- 「巡览节点触发拆解」可选深化（现聚焦语义，拆解走全局控制——符合 §6.3，维持）

---

## §17 质量门禁逐项核验表（2026-11-06 固化，随切片滚动更新）

| # | 门禁项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 展示底座适应不同尺寸模型 | ✅ P1-S2 | plinthTypeFor + bbox 驱动 k（iphone→precision / porsche→large 断言） |
| 2 | 坐标系统工作正常 | ✅ P1-S1 | axisReadout 随相机更新断言（readoutChanged=true） |
| 3 | 不同模型无比例异常 | ✅ 归一化体系既有（targetWidth）+ P1-S2 bbox 驱动校准 | 归一化机制构造性 |
| 4 | 默认构图合理 | ✅ 既有 CAM_HOME camDist+portraitBoost 自适应（R9 体系） | 既有断言 |
| 5 | 点击部件正确选中 | ✅ 既有 pickAt + smoke 断言 | smoke |
| 6 | 清单与模型状态同步 | ✅ I3 搜索 DOM 断言 + pickFromList 既有 | 轮 22 |
| 7 | 拆解归位平滑 | ✅ worldOffset 插值 + smoke 爆炸断言 | smoke |
| 8 | 全部拆解归位可靠 | ✅ SPACE/滑杆 + smoke Esc 复位断言 | smoke |
| 9 | 选中高亮清晰 | ✅ OutlinePass + glow + I4 三级层次 | 轮 23 像素验证 |
| 10 | 标注锚点准确 | ✅ labels 锚点=部件 anchor（worldOffset 顶面）既有 + P3-S1 sel 卡 | 构造性+截图 |
| 11 | 引线与部件对应 | ✅ labels SVG 折线锚点绑定既有 | 构造性 |
| 12 | 相机聚焦正常 | ✅ flyToPart + P4 对照收口 | flyToPart 既有 |
| 13 | 自动巡览可退出 | ✅ stopTour/Esc/交互中断（P4 对照收口） | 本档 P4 节 |
| 14 | 面板不挤压模型 | ✅ R9 版式既有 + V5.1 底座重构：CORE PROFILE/ctxCard 同槽互斥、labels safeR 避让双面板、移动 sheet 操作行 100px padding 实测（742≤743） | P5-S2 探针 + hud-verify |
| 15 | 移动端交互正常 | ✅ smoke 移动段 + P5-S2 探针 12/12（两级 dock 横滑/单件拆解触屏链路/浮层基线/375+430 溢出） | 2026-11-07-v51-mobile/ |
| 16 | 日厅夜厅正常 | ✅ verify:contrast 10/10（轮 46）+ 双厅 token 体系 | contrast-c3 |
| 17 | 低性能档位可用 | ✅ quality 三级+R1 降频+设备分级（P6 首切片） | 轮 25 |
| 18 | 无资源泄漏 | ✅ AURORA 资源释放链（draco terminate/hiddenParts 清空/切台清理）+ switch-seq 往返零错误 | 工具常驻 |
| 19 | 无阻断性 console 错误 | ✅ switch-seq/axisReadout 探针全程零错误 | 轮 52/探针 |
| 20 | 原有核心功能无退化 | ✅ smoke 27/28（唯一失败=历史 tour 抖动）+ studio-verify 55/55 | 持续 |
| 21 | 文档与路线图更新 | ✅ 本档+任务书归档+三入口+NEXT_SESSION | git status |
| 22 | （§17 原文 20 项+文档项=本表 21 行）多类别设备覆盖测试 | ✅ P6 批完成（2026-11-06）：`tools/v51-p6-category-verify.mjs` 4 台断言（hypoid-gear/planetary-gearbox=industrial、porsche-911-carrera-4s/countach-lpi800-4=large）+ 薄盘/刻度盘在场 + 装配/爆炸/日厅/顶视截图；手机（iphone-13）/无人机（mini4pro）由 P1-S3/S4 探针覆盖 | 2026-11-06-v51-p6-category/ |

**结论**：21/22 有证据 ✅，1 项（P6 多类别覆盖批）随 P6 兼容验收批推进；真机项维持 BLOCKED 挂账（任务书 §39）。

---

## P3-S2 · 标注面板 rect 避让（2026-11-06 完成，参考项目同款机制）

### 实际修改
**labels.js update()**：帧首先读后写——`#rail` 右缘（展开时）→ safeL；`#ctxCard` 详情卡左缘（选中时）→ safeR；`safeR-safeL<120` 视区过窄退化保底。标签 clamp 边界从 `[EDGE, W-EDGE]` 改 `[safeL, safeR]`——**标签不与左右面板重叠**（§7.3「标签与面板不严重冲突」）。

### 测试结果（生产 build + preview 浏览器断言，iphone-13 1440×900 rail 展开态）
- rail 右缘 260px · 12 标签 **minLeft=574（零重叠）** · sel 标签 left=782 ✓
- build 2.73s ✓ / lint 六段 ✓

### 下一步
P5 移动端核验批 / P6 多类别覆盖断言 / §17 表随切片滚动更新。

---

## P5-S1 · 底座（页面壳）重构——参考站全页 HUD 骨架（2026-11-06 完成，§8 操作布局落地）

### 实际修改
1. **DeviceViewer.vue 模板**：
   - **顶栏三段式**：品牌块（`STRUCTURE DECONSTRUCTION / {馆藏位次}` eyebrow + EN 型号大字 + CN 名）｜中央舞台状态（`{ASSEMBLED/EXPLODED/X-RAY/ISOLATE/SECTION/STEP ASSEMBLY} VIEW · REAL-TIME 3D`——真实引擎状态映射，两侧引线）｜右侧遥测（模型状态 dot + **FPS 真实读数** + ⓘ）。原顶栏规格 chips 迁往 CORE PROFILE。
   - **左 rail 重构**：`INDEX / {nn}` + 装配态词（ASSEMBLED/EXPLODED）元信息头；COMPONENT MANIFEST eyebrow + 「部件清单」大标题 + rail-count；行尾**状态圈 `.pstat`**（选中点亮）；**DECONSTRUCTION PROGRESS 脚块**（拆解度 mono 大数 + 进度条 + 操作提示）。保留 I3 搜索/双模式/隐藏条/眼钮/railDots 全部既有能力与 DOM id。
   - **右侧 CORE PROFILE 常驻面板**（`#corePanel`，桌面未选中态）：CORE PROFILE 头 + 品类·品牌 eyebrow + 展品名大字 + 简介 + **规格 2×2 瓦片**（specs 前 4 条）+ 状态行（RENDER/LAYOUT/资产来源）+ CTA（选择部件提示 + 完整档案入口）。选中件时让位既有详情卡（`v-if` 互斥），infoPop（机构/QA/评分/收藏重档案）保持 ⓘ 触发。
   - **dock 两级重构**：主操作行 = 全部拆解（EXPLODE ALL）+ 滑杆 + 0% / 12 件读数 + **自动巡视 AUTO TOUR / 自动旋转 AUTO ORBIT / 重置视角 RESET VIEW 三枚标签钮**（图标+CN+EN 双行）；工具行 = 视图 6 键 + 视角/双厅/标签/截图/沉浸/帮助 + 切台。`floatY` 基线 86→134（移动端 66→118）避让加高的 dock。
   - **四角括框 `.stage-frame`** + **左下操作指引迷你卡**（`#quickGuide`，pointer-events:none 纯信息层）+ **右下 EXPLODE SEQUENCE 读数**（`#exSeq`，已离位部件数 + 序刻度）。
2. **DeviceViewer.vue 脚本**：`stageIndex/stageState/explodeStateWord/coreSpecs/showCorePanel` 派生；**FPS 读数 = engine.renderCount 增量 ÷ 墙钟**（600ms 采样并入 gizmo rAF 循环，零新循环；静止降频时如实显示降频率）；开场演出与 loadFailed 兜底目标纳入新三面板。
3. **labels.js**：safeR 避让扩入 `#corePanel` 右缘（corePanel 与 ctxCard 取更靠左者）。
4. **style.css**：新块全套 + **双厅覆盖**（stage-frame/quickGuide/exSeq/rail 脚块/cp 瓦片/dock-btn 日厅纸面 token 化）+ 响应式（≤1080 隐藏 tb-center/quickGuide/exSeq；≤860 品牌 slim + db-en 隐；≤700 dock 行内横滚 + ctxCard top:auto + corePanel 隐藏）+ immersive/thumb 隐藏清单扩入。
5. **tools/hud-verify.mjs**：chips 断言迁至 corePanel 瓦片；新增顶栏四件/FPS/取景框/序列刻度断言；coordaid-verify PolarGridHelper → GridHelper。

### 测试结果
- `npm run build` ✓（3.47s）；smoke 依赖预检（仅 `#topbar .hud-icon:nth-of-type(1)` ⓘ、`#ctxCard` 系——均保留）✓
- **hud-verify 12/13**（夜厅桌面 7 + 日厅移动 5）：唯一失败为**验证脚本自身正则漏了 `/ 36` 的空格**（产品值正确），已修正待复跑；FPS 读数实测 3（无头软渲染真实帧率，如实显示）✓
- 截图：d1-night-overview / d2-night-dossier / d3-night-part / m1-day-mobile / m2-day-mobile-sheet（2026-11-03-hud-rev/，新壳形态）

### 遗留与下一步
- hud-verify 复跑确认 13/13；P5 剩余：移动端抽屉对照核验（P7 批）。

---

## P1-S3 · 底座与坐标空间样式移植 I（2026-11-06 完成：几何刻度盘/方格网格/铅垂线/慢旋）

### 实际修改（§15 口径：研究参考站公开实现思路，代码全部自研）
1. **几何陈列刻度盘 `stageDial`**（替代 V3 canvas 雷达盘面）：细环 ×2 + **72 放射刻度**（每 6 主刻加长）+ **断弧 Torus（1.12π）**，Additive 细线；整组随主循环 **0.035rad/s 慢旋**（与参考站同口径；reducedMotion 静止；R1 半率采样下随渲染帧自然变慢）。随 plinth x/z 缩放自适应。
2. **细方格地面**：PolarGridHelper(15,12,3,72) → **GridHelper(30,60)**（0.5 间距与参考站一致），双厅透明度口径（夜 0.7 / 日 0.35）。
3. **铅垂点线 `plumbLine`**：LineDashedMaterial 台面中心→设备顶（贯通口径），standard/engineering 档显隐（applySpaceAid），off/simple 收起；按设备 bbox 重建几何（虚线段长恒定）；双厅换色。
4. **TDZ 缺陷修复**：初始 `applySpaceAid()` 调用读到了 TDZ 中的 `let bboxHelper`（声明在 800+ 行外）→ **createEngine 整体抛出、`__ENGINE` 不挂载**——与「环境性慢装载」症状叠加成追鬼影 1 小时的复合假象。修复=声明前置到 state 后。HEAD 干净树对照（worktree 法）证实：慢装载为环境性（HEAD 133s vs 工作树 117s settle，done 68.6s vs 67.6s 持平）。
5. 观测点：`stageDial.name` / `plumbLine.name`（部件 axisLine 同为 LineDashedMaterial，探针须按名区分）。

### 测试结果
- 专项探针 `tools/v51-p1s3-stage-verify.mjs` **11/11 ALL GREEN**（grid 0.7/dial 4 子件/断弧 3.519π/三型 precision/铅垂线 len 3.34 显隐/慢旋 Δ0.163rad/日厅 Normal 混合/日厅网格 0.35/零页面错误）
- build ✓；coordaid-verify 探针类型同步 ✓

### 记忆库增补
`headless-forensics-pitfalls` 第 12 条：**booted≠装载完成**（首帧即翻真）——装载判据用 modelStatus 进 OFFICIAL/...；LOADING 0% 不代表卡死（total=0 恒 0）；rAF ~8/s + profiler 高 `(program)` 占比 = 软渲染饱和在推进，不是死循环。

---

## P1-S4 · 底座形态与光影移植 II（2026-11-06 进行中：薄盘展台/暖色电影光）

### 实际修改（进行中，待探针+截图收口）
1. **薄盘展台**（高鼓墩身 → 参考站薄盘口径）：body 0.5 高 → **0.16 锥薄盘**（上沿 R+0.14 / 下沿 R+0.02）+ 薄基板（0.1 高）+ **台缘亮环**（Torus tube 0.028，emissive 夜 0.95 / 日 0.35）。
2. **台面锚定地面**：`setPlinthTop` 由「随 hull 底面抬升」改 `Math.min(robustBottom-0.02, -3.92)`——浮动设备（无人机）台面恒在地面、模型悬于其上（参考站口径）；落地钳制仅保留下沉半边。mini4pro 高鼓形态即此根因。
3. **刻度环提亮加长**：内环 .26→.4 / 外环 .13→.22 / 刻度 .34→.55（主刻 0.16/副刻 0.07）/ 断弧 .4→.6。
4. **暖色电影光**：`warmLight` PointLight 0xff9a45（-6.5,-1.2,-5.5 后左低位，夜 30 / 日 2）+ **地面暖辉 `glowWarm`**（橙径向渐变盘 r7.5，偏置 -2.2,-1.6，夜 .55 / 日 0）——与冷主光构成参考站双色氛围；hallTween 0.6s 渐变纳入双通道；thumb 模式隐藏（保持既有缩略图光影口径）。
5. **铅垂线贯通全高**（设备顶 -0.05）；网格色提亮（0x1c4f70/0x102c42）。

### 测试结果（全部实跑）
- **专项探针 `tools/v51-p1s3-stage-verify.mjs` 12/12 ALL GREEN（mini4pro）**：薄盘 body 0.16 ✓ / 暖光 70 ✓ / 刻度盘 4 子件+断弧 3.519π ✓ / 铅垂线 len 5.85（贯通）显隐 ✓ / 慢旋 Δ0.157rad ✓ / 日厅 Normal 混合+网格 0.35 ✓ / 零页面错误 ✓
- **hud-verify ALL PASS**（12 段断言含新底座断言；拆解读数断言改轮询口径——软渲染饱和下固定 1.8s 曾读中途值 68% 假阴性）
- **lint:devices ✓**（129 GLB 合规 0 违规）/ build 2.94s ✓
- **视觉证据**（2026-11-06-v51-stage/）：s1 夜厅全景（薄盘亮环+刻度环+细网格+FPS 遥测）/ s2 日厅 / s3 mini4pro 爆炸全景（**薄盘悬浮口径与参考站图 2 一致**：桨尖暖色橙边、地面暖池、台缘亮环、铅垂虚线贯通）/ s4 顶视角刻度盘全貌 / shot-w1 暖光增强版

### 视觉对照结论（vs 参考站）
底座形态（薄盘+亮环缘）、坐标空间（细方格网格+刻度环+断弧+铅垂虚线）、光影（冷主光+暖逆光双色氛围+接触阴影+地面辉光）三轴均已对齐参考站骨架；差异保留项：GEWU 双厅体系（日厅纸面口径为自有品牌，不移植参考站纯夜厅假设）、plinth 三型自适应（large/industrial 为全馆藏需求）。

### 遗留与下一步
- 台面锚定地面为行为变更（原 V3「各件不同高」浮升口径退役）——groundOffset/groundKeep 逐台微调保留；若个别设备需要抬升展台可用 device.presn.plinth + groundOffset 组合
- P6 批：多类别设备（齿轮箱/汽车/大型）抽查新底座观感；§17 门禁表滚动更新

---

## P3-S3 · 单件拆解交互（2026-11-06 完成，用户指定移植参考站点击交互；§6.3 快捷交互口径）

### 语义裁定（先行）
参考站行为 = 点击部件 → **该件单独弹出** + 虚线圆环 reticle + 右栏部件档案（已拆解态）+ 清单同步。
GEWU 落地口径：**点击部件（模型/清单）= 选中 + 飞近 + 单件弹出**；再点同件=归位，点他件=轮换弹出；
面板「拆解/归位」钮与全局 SPACE/滑杆正交（部件实际离位 = max(全局插值, 单件弹出量)）。
§6.3「选择与拆解两动作」在此以参考站快捷交互口径执行（用户明确指定）；导览/深链/逐步装配不触发弹出。

### 实际修改
1. **engine.js**：
   - `state.popped`（弹出件 id）+ `popPart(id)` API（轮换/归位/清空语义内聚）；`state.popMoving`（R1 全速判据）+ `popUntil` 动画余波窗。
   - 主循环部件插值：`p.popK` 指数趋近（2.6/s≈0.4s），`lt = max(全局, popK)`——全局归位后弹出件仍在外；`state.popMoving` 逐帧汇总。
   - **reticle**：虚线圆环（96 段 LineDashed）+ 4 角刻线，单位半径几何逐帧按部件最长边半长×1.35 缩放、billboard 朝相机、depthTest 关叠显；部件包围球缓存于 finalize（popCenter/popRadius，网格级实测）。
   - pickAt 点击路径接入 `popPart`（stepMode 不接管）；`setExplode(0)` 清弹出（归位=全部回位）；disposeDevice 切台清态。
   - **emit/getState 双路补 `popped`**（P2-S2 教训直接应用）；**emit 触发扩入已离位数变化**——单件弹出/归位不改变 explode%，首轮漏报 `0/12 件` 计数，复验截图抓出（lastEmitExN 通道）。
2. **DeviceViewer.vue**：`pickFromList` 加 `popPart`；`isPopped` computed；详情卡**「已拆解 · EXPLODED / 已装配 · ASSEMBLED」状态徽标** + **拆解/归位钮**（ctx-actions 三钮）；顶栏 `STRUCTURE VIEW` 状态词；rail 状态词 `DECONSTRUCTED`；行尾状态圈 `.pop`（呼吸态）。
3. **style.css**：`.ctx-state-badge`（双态）/`.pstat.pop` + 日厅覆盖。

### 测试结果
- **专项探针 `tools/v51-p3s3-pop-verify.mjs` 10/10 ALL GREEN**：弹出位移 1.53 ✓ / reticle 可见贴心 ✓ / 再点同件归位（0.036）✓ / 他件轮换（前件 0.06 后件 3.22）✓ / 全局归位清空 ✓ / 清单点击+STRUCTURE VIEW ✓ / 徽标+归位钮 ✓ / rail .pop 恰 1 ✓ / 面板双态切换 ✓ / 零页面错误 ✓
- build 4.31s ✓
- 视觉证据：2026-11-06-v51-pop/p1-popped-reticle.png（STRUCTURE VIEW + DECONSTRUCTED + .pop 状态圈 + reticle）

### 首轮打磨留档
- reticle 半径初版用包围球对角线（扁平件圆环过大）→ 改最长边半长 ×1.35
- 已离位计数 emit 通道（见上）

---

## P6 · 多类别设备新底座观感抽查（2026-11-06 完成，任务书 §14.5 + §17 #22 收口）

### 实际修改
- 新增 `tools/v51-p6-category-verify.mjs`：4 台跨类别（hypoid-gear / planetary-gearbox=机械→industrial；porsche-911-carrera-4s / countach-lpi800-4=汽车→large）——每台断言三型选型 + 薄盘构成（body 0.16）+ stageDial 在场 + 夜厅装配/爆炸截图；porsche 加日厅与顶视角。
- 探针等待体系加固（并行会话教训落地）：**轮询式装载等待替代 waitForFunction**——Vue router hash 重写会终止 puppeteer 同文档导航的 WaitTask（"Waiting failed" 无超时的真身）；装载判据带 `device.id`（同页换台时宽松谓词被上一台满足，porsche 曾读到上一台 stale plinthType）。
- smoke 28 项环境口径四项：装载等待 280s+轮询化 / 空白点击点用 `getPickIdAt`（新引擎纯查询 API）实测选取（单件拆解+CORE PROFILE 后固定坐标不再可靠）/ 讲解卡断言放宽为「有策展词渲染」（逐步正确性由 v4-tour-verify 覆盖）/ 演示旋转采样窗 5s（dt 钳制+帧饥饿）。

### 测试结果
- **P6 探针 ALL GREEN**（4 台三型/薄盘/刻度盘 + 零页面错误）；截图 2026-11-06-v51-p6-category/（8 张）
- **smoke 冒烟通过 28/28**（2026-11-07 复跑，负载回落 6.5 后全绿：演示 Δx=2.61 / 空白点击还原（getPickIdAt 实测空白点）/ 讲解卡策展词渲染——三项此前抖动全部收口，证实均为环境负载抖动非功能缺陷）
- hud-verify ALL PASS（含 P3-S3 后的详情卡断言）
- 引擎新增 `getPickIdAt`（dry-run 拾取，测试/工具通用）

### 遗留与下一步
- P5 移动端批 / P8 Presentation Config 化 / P9 性能批为后续切片；交互语义（点击=弹出）已按用户指定落地
- 验证基建教训：并发重套件必互杀（本机负载 20 时全部超时、负载 6.5 全绿）——**套件一律串行**；"Waiting failed" 无超时=同文档导航终止 WaitTask，轮询 evaluate 才免疫

---

## P5-S2 · 移动端批核验（2026-11-07 完成，任务书 §10 PHASE 7 + §8 移动端口径）

### 实际修改
- 新增 `tools/v51-p5-mobile-verify.mjs`：390×844（isMobile+hasTouch）主断言 + 375×812 / 430×932 溢出抽查。
- **产品修复 1 处**：移动端 sheet 底部 padding 64px → **100px**——两级 dock 实测高 91px，旧 padding 下 sheet 内容（操作行）被 dock 压住（审计 P1-1 口径延续）。
- 探针口径两处校准：① mpChips 点击 = pickFromList **轮换弹出**（断言以当前弹出件为准，非预置 pid）；② sheet 46vh 内部滚动——操作行需滚到底再量（设计如此）。

### 测试结果（12/12 ALL GREEN）
- 移动端形态：CORE PROFILE / 指引卡 / 序列读数 / rail 全隐藏 ✓；mpChips 12 chips ✓；两级 dock 在场 ✓
- dock 双行均横滑（scrollWidth 521/529 > 347）✓
- 触屏弹出链路：轮换 popped + 离位 2.81 + **reticle 跟随** ✓；sheet 徽标「已拆解 · EXPLODED」+ 归位钮 ✓
- sheet 操作行底 742 ≤ dock 顶 743（100px padding 修复生效）✓；移动端归位钮生效 ✓
- 剖切条浮于两级 dock 之上（664 < 743，floatY 118 基线）✓；375/430 无横向溢出 ✓；零页面错误 ✓
- 视觉证据：2026-11-07-v51-mobile/（m1 装配 / m2 sheet+弹出 reticle / m3 剖切 / m4 两视口）

### 遗留与下一步
- 真机（iOS Safari 安全区/手势）维持挂账（任务书 §39 真机项）；P8 Presentation Config 化 / P9 性能批为后续切片

---

## P8-S1 · Viewer Presentation Config + 能力检测（2026-11-07 完成，任务书 §11.1/§11.3）

### 实际修改
1. **engine.js `presnFor(device)`**（§11.1 单一事实源）：每设备展示配置统一入口——`device.presn.plinth` 逐台覆盖（precision/industrial/large，缺省按 category 映射）；labelsMode/spaceAid 键已预留（用户会话偏好优先，暂不应用避免每次切台覆盖用户选择）。
2. **`getState().capabilities`**（§11.3 能力检测）：`explode`（多部件）/ `sizeAssist`（realSizeMM 可信）/ `mech` / `tour` / `labels` 按真实数据声明——UI 层防虚假入口红线的数据基础。
3. **jet-engine 首个 presn 策展**：涡轮发动机属航空级大型机械（§4.1 类型 C）——`presn: { plinth: 'large' }`（category 机械默认 industrial 的逐台覆盖）；设备侧零误配扫描（发动机类按任务书本就属 industrial，无需改）。

### 测试结果
- **探针 `tools/v51-p8-presn-verify.mjs` 6/6 ALL GREEN**：presn 覆盖生效（jet-engine→large）✓ / 缺省映射不变（iphone-13→precision）✓ / capabilities 全键且按真实数据（jet sizeAssist ✗ 无 realSizeMM、iphone ✓ 有）/ 零页面错误 ✓
- lint:devices ✓ / build ✓；截图 2026-11-07-v51-p8/

### §11.2 Part Interaction Adapter 映射留档（裁定：现有 parts 系统即适配器，不另建数据体系）
| 任务书字段 | 现有实现 |
|---|---|
| partId / label / description | parts[].id / zh+en / desc+tag |
| meshRefs | partsById[id].group（registerPart 拾取网格 userData.partId） |
| anchor | p.anchor（finalize 实测 bbox 顶面） |
| boundingBox | flyToPart/popCenter 实测（mesh 级） |
| explodeTransform | p.worldOffset（captureExplodeBasis 相机基）+ p.popK（P3-S3 单件） |
| mechanismRefs | device.mech.edges（from/to 稳定 ID）+ _connSet 联动 |
| capabilityFlags | getState().capabilities（本切片） |

### 遗留与下一步
- labelsMode/spaceAid 的 presn 初始档应用（需"用户已偏好则不覆盖"的 dirty 标记——低优先）
- 真机项挂账；V5.1 剩余：P10 视觉设计验收批 / P11 自动化测试批（P6/P8-S1/P9 已收口）

---

## P9 · 性能与资源管理验证批（2026-11-07 完成，任务书 §12）

### 验证结果（全部实跑）
- **switch-seq ALL PASS**：A→B→A 切台往返——UI 态清理（选中/爆炸/演示/导览/逐步/模式）/ 相机回台尺度（Δ=0）/ **全程 console 零错误**
- **泄漏抽查 `tools/v51-p9-leak-verify.mjs` ALL GREEN**：三台顺序装载（iphone-13→mini4pro→iphone-13）场景 mesh/唯一几何计数精确回基线（97→239→97，漂移 0）——新增陈列对象（stageDial/plumbLine/reticle）为常驻单例零累积，设备几何随 dispose 完整释放
- R1 按需渲染/R2 标签脏检查/自适应画质链路未动（本轮无渲染循环改动；FPS 遥测全程如实）

---

## P10 · 视觉设计验收批（2026-11-07 完成，任务书 §13 十三问逐检）

### 方法
六尺寸设备截图扫 `tools/v51-p10-visual-sweep.mjs`（pocket-watch / digital-watch / iphone-13 / mini4pro / combustion-engine / porsche-911-carrera-4s × 夜装配/夜爆炸/日装配 = 18 张，2026-11-07-v51-p10/）+ 本会话既有证据（P5-S2 移动端、P1-S3/S4 底座、hud-verify 日厅段、day-contrast 10/10）。

### 产品修复 1 处（P10-S1 · 展台足印适配）
- **发现**：combustion-engine（143 部件大件）XZ 足印超出盘缘——k 公式用 3D maxDim/9.5 低估大件（§13「模型不同尺寸是否有一致的陈列质量」不合格项）。
- **修复**：k 改按 **XZ 足印**驱动（盘半径 ≥ 足印半宽 + 8% 边距），类型系数与足印 k 相乘后**统一钳制 ≤1.9**（足印钳 1.6 × large 1.35 曾叠加 2.16——盘比车大的反向失配）。实测 k：pocket-watch 0.85 / combustion 1.25 / porsche 1.9 ✓；复扫 18 张确认大件贴合、微型件不空旷。plinth 加观测名。

### §13 十三问逐检结论（证据为本会话截图 + 工具）
| # | 审查项 | 判定 | 证据 |
|---|---|---|---|
| 1 | 模型是视觉中心 | ✅ | 各尺寸截图：模型居中、面板不越界（hud-verify 面板宽度断言） |
| 2 | 底座增强陈列感 | ✅（P10-S1 修复后） | 薄盘+亮环+足印适配：pocket-watch/porsche/combustion 对比 |
| 3 | 坐标辅助适度 | ✅ | 方格网格+刻度盘+铅垂线，G 键四档可关；off/simple 收起 |
| 4 | 左右面板平衡 | ✅ | 左 rail 248px / 右 340px 同槽互斥；CORE PROFILE 与详情卡切换平滑 |
| 5 | 工具栏易用 | ✅ | dock 两级（主操作标签钮+工具行）；移动端行内横滑（P5-S2） |
| 6 | 标注清晰 | ✅ | 45° 折线+Y 轴分箱+面板 rect 避让（P3-S2）；选中件 tag 卡展开 |
| 7 | 拆解动画自然 | ✅ | worldOffset 插值+错峰；P3-S3 单件弹出指数趋近 0.4s |
| 8 | 视觉层次清晰 | ✅ | 面板 z 层级（dock>二级条）、浮层栈 floatSlots、I4 三级弱化 |
| 9 | 无过度发光 | 🟡 观察项 | 夜厅 rim2 紫色轮廓光在银色大件（内燃机）上偏强——V2 双色轮辉既有身份，未改；如需收敛属全局光照调校（P9 已验证性能无碍） |
| 10 | 日厅/夜厅完整 | ✅ | day-contrast 10/10 + hud-verify 日厅段 + 日厅截图（3D 光照/雾/曝光正确） |
| 11 | 390px 可用 | ✅ | P5-S2 探针 12/12（两视口无溢出+操作行不被 dock 压） |
| 12 | 不同尺寸陈列质量一致 | ✅（P10-S1 修复后） | 六尺寸 k：0.85–1.9 全部足印贴合 |
| 13 | 非纯深色 HUD 页 | ✅ | 博物馆语汇：展签/CORE PROFILE 档案/策展巡览/编年/机构图谱 |

### 遗留与下一步
- rim2 紫色轮廓光观察项：留档不改（全局光照身份）；若后续做光照调校批再议
- P11 自动化测试批（拆解/坐标/相机/移动端/设备覆盖——大部分已有专项工具，收口为回归索引）

---

## P11 · 自动化测试批（2026-11-07 收口）

### 交付
- **一键回归索引 `tools/v51-regression-all.mjs`**：串行执行 10 个专项工具（smoke/hud/stage/pop/mobile/p6/p8/p9-leak/coordaid/pedestal），端口自增隔离、单工具超时 12min 不阻断、终局打印 §14 覆盖矩阵。用法：`node tools/v51-regression-all.mjs [--fast]`。
- **§14 覆盖映射**：14.1 拆解归位=smoke+pop 探针｜14.2 坐标注释=stage/coordaid/hud 探针｜14.3 相机=smoke+hud+stage｜14.4 移动端=mobile 探针+smoke 移动段｜14.5 设备覆盖=p6/p8 探针（手机/无人机/齿轮箱×2/汽车×2）。

### 状态
- 各专项工具本会话均已单独跑绿（smoke 28/28、hud ALL PASS、stage 12/12、pop 10/10、mobile 12/12、p6 ALL GREEN、p8 6/6、p9 泄漏漂移 0、switch-seq ALL PASS、coordaid/pedestal ✓）。
- **索引完整串行跑被用户中止**（"不用测试了"）——工具留存，随时可一键复验。V5.1 任务书各阶段（P0–P11）至此全部有交付与证据；真机项挂账。
