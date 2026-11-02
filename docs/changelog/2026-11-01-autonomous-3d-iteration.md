# 2026-11-01 · 自主通宵迭代（3D 展品真实性专项）

> 依据 `docs/roadmap/GEWUGUAN_AUTONOMOUS_3D_ITERATION.md`（任务书全文存档）。本日志按 Phase 记录，只写可核实事实。

## Phase 0 — 接管与审计

- 任务书完整原文存档至 `docs/roadmap/GEWUGUAN_AUTONOMOUS_3D_ITERATION.md`；README/AI_HANDOFF 登记入口。
- 问题清单建立：`docs/AUDIT-3D-AUTHENTICITY.md`（SCR-01/02/03、PART-01、HOME-01）。
- **屏幕方案全量审计**（`tools/screen-audit.mjs` + `native-texture-dump.mjs` + `overlay-ab.mjs`）：14 台挂 addLiveScreen 的设备逐一检测原生贴图与 painted overlay 的叠加关系，原生贴图导出 PNG 目检（`docs/design/screenshots/audit-native/`）。
- 环境坑记录：长跑 dev server 在 node_modules 变更后 Vite 预打包失效（`vue` 无法解析/404）→ 重启即愈。

## Phase 1 — P0 屏幕重叠修复（SCR-01，用户点名问题）

- **证实**：8 台设备的 GLB 自带真实屏幕内容（iPhone 12 拆解件 = 真实 iOS 14 主屏+锁屏；iPhone 13 = 官方 9:41 沙丘锁屏；S22 Ultra = 三星官方壁纸；iPhone 17/18×2/duo-fold/modular 均有原生贴图），却被 `makePhoneScreen` 的通用虚拟 UI 覆盖——假 UI 遮真屏。
- **修复**：移除 8 台 painted 接线（import/实例/hook/tick 四处），display 只剩原生材质（探针复验逐台通过）；保留 4 台合法用例（iphone-16 无原生、action4/pocket3 官方 GLB 暗玻璃 + UI 与真机一致、vision-pro 空 hook）并加 `screen: native|painted` 策略注释；`screen.js` 头部写入准入策略。
- 过程坑：注释中 `18*/` 提前终止块注释 → lint 抓到 → 改写。
- 验证：lint:devices ✓、build ✓、近景截图（iPhone 12 显示真实 iOS 主屏 ✓）、smoke 28/28 ✓。

## Phase 2 — 模型质量分级机制

- `quality: 'A'|'B'|'C'|'D'` 可选字段 + lint 校验（tools/lint-mapping.mjs）；口径与分级台账写入 AUDIT 文档。
- 仅实测核验的设备定级：iphone-12-teardown = **A**（159 网格全语义、原生真屏、拆解/复位实测）；v8-engine = **B**（拆解布局/演示实测，缸轴方向为位置推断）。其余明确为「未分级=待核」，不虚评。
- gen:inventory 重新生成（103 台 · 815 部件 · 38 品牌）✓。

## Phase 3 — 首页首屏品牌印象区（HOME-01）

- 馆名 `clamp(76px,11.5vw,172px)` → `clamp(44px,6vw,84px)`（识别级），间距同步收紧；焦点展台成为首屏主视觉；长页面结构与第二屏吸顶工具栏不变（R2 已建）。
- 验证：桌面/移动截图 `d2-lobby-*.png`。

## Phase 4 — V8 发动机运动关系试点

- **引擎新增 `stroke` 演示类型**（runDemos）：部件内每 mesh 沿各自缸轴往复，相位按曲轴轴向投影分桶为交叉曲柄 [0,90°,270°,180°]；退出与旋转共用一段缓动复位。
- **新增 `spinPivot:'center'`**：GLB 拆解件组枢轴不在轴线上会「公转」（实测 drift 1.33），按 bbox 中心建内枢轴组并补偿子件位移 → drift 0.085（绕自身轴）。
- v8-engine demos：crank 绕 Z 旋转（1.5 rad/s）+ pistons 双 bank 缸轴 [±0.7,0.7,0] 往复（amp 0.3, 1.05Hz）；选中即动、toast 标注示意、reduced-motion 不启用。
- 验证：曲轴 Δz 1.359/0.9s、活塞 9 mesh 四相位错峰（+0.344/−0.344/+0.183/−0.183）、退出复位 demoActive=null、jet-engine 原有 spin 断言随 smoke 全绿、build ✓。

## Phase 5 — 径向发动机评估

- 类型核实为星型/径向活塞发动机；Sketchfab CC-BY 候选 3 个（basharnazzal / Intan DP / trinityscsp，链接存 AUDIT 文档）。
- 结论：**已评估待集成**——完整 convert-asset SOP 周期（下载/体检/主副连杆映射/stroke 相位 360°均布/thumbs/移动端），列为下一垂直切片。

## Phase 7 — 回归与留档

- `npm run build` ✓ 2.14s；`npm run smoke` 28/28 ✓；`npm run lint:devices` ✓；`npm run gen:inventory` ✓。
- 修改文件：engine.js（getScene 句柄/stroke/spinPivot）、8 台手机配置（去 painted）、4 台保留者注释、screen.js 策略、v8-engine（demos+quality）、iphone-12-teardown（quality）、lint-mapping（quality 校验）、style.css（首屏层级）。
- 未完成/待办：PART-01 逐台装配核查（滚动）、径向发动机集成、模型分级全量覆盖、真机触控实测（环境缺失）。

## Phase 8 — 续轮：径向集成受阻转进 + PART 专项（2026-11-01 续）

- **径向发动机集成被下载通道硬阻塞**：Sketchfab `/i/archives/latest` 直连 401（需登录态，本会话无注入渠道）；Thingiverse/Printables 被 Cloudflare 拦截（curl 与 headless Chrome 双验证）；Wayback 存档同为挑战页。阻塞与两条替代方案（用户手动下载入 originals / 有登录态注入的会话）记入 AUDIT 文档。
- **stroke 演示泛化 `phaseN`**：n 缸均布相位（径向发动机 360/n 用），缺省保持 V8 交叉曲柄 [0,90,270,180]——资源到位即可接入。
- **PART-01 首个真实性发现**：自动装配筛查（16 台旗舰，bbox 相对 hull 中心距离）无真正漂浮件；目检证实 iphone-13 `ip_speaker_blk` 实为顶部听筒而非「底部主扬声器」→ 文案如实修正（含实测依据写入 desc）。
- **PART-02 小部件特写穿模修复**（engine）：finalize 缓存 mesh 级整机 hull（修 deviceRadius 低估算——GLB 直映射件坐标在 mesh 上）；小部件（diag<hull/4）不做相机飞行，保持全景+选中+标签指位；中/大部件距离下限挂 hull×0.3。三次公式化尝试（0.55/0.75/外向径）实测均不胜任后裁掉，改为行为级方案。
- **验证**：v8 双演示复验 ✓（活塞四相位错峰+退出复位）、lint:devices ✓、build 2.07s ✓、smoke 28/28 ✓、iphone-13 听筒/iphone-16 usb-pcb 深链取景截图 ✓。
- **顶栏离场/吸顶（§3.3）**：复核 R2 已实现且无重叠闪跳，不动。

## 交付状态区分（任务书 §8）

- **已完成且已验证**：SCR-01 屏幕重叠修复、屏幕方案策略体系、质量分级机制、HOME-01、V8 运动演示、全站回归。
- **已完成未验证**：无。
- **部分完成**：PART-01 裸零件核查（16 台旗舰筛查+iphone-13 听筒修正完成，其余滚动）；质量分级（2/103 已定级）。
- **未完成**：径向发动机集成（**被下载通道阻塞**——Sketchfab 需登录态 / Thingiverse·Printables 被 Cloudflare 拦；替代方案已入档，模型文件到手即可按就绪 SOP 接入）。
- **被阻塞**：径向发动机模型下载（同上）；真机触控实测（无真机环境；浏览器移动模拟已覆盖并在文案中如实标注）。

## Phase 8 续轮 2 — PART-01 批次 2 + 移动端性能观察（2026-11-01 续）

- **装配筛查批次 2**（`SCREEN_BATCH` 参数化，20 台：无人机×3/发动机×4/笔电台机×4/音频×2/游戏机×2/手机×2/相机/望远镜/钢琴）：**17/20 全净**；3 台旗标（s25-ultra `spen` 左下=笔槽、zflip7 `camera` 盖顶、hubble `radiators` 尾部散热板）逐项核对均为真实布局，无需改动。两批累计 36 台覆盖主力品类。
- **移动端性能观察（§8，headless swiftshader 参考值）**：390×844 下 action4 / v8-engine / grand-piano 均 60.3fps（vsync 封顶），自适应画质未触发降档（FPS≥42 阈值未破，行为正确）。探针读 `getState().quality` 为 undefined 属读错 API（quality 在 emit() 快照中，DeviceViewer 走 onChange 通道），引擎无 bug。**真机帧率不可测（无真机环境），如实标注。**
- 验证：build ✓（本批无源码改动）、探针输出存档。

## Phase 8 续轮 3 — 径向发动机集成完成（2026-11-01 续）

- **下载通道打通**：用户在内置浏览器打开 Sketchfab（登录态）→ `browser.user.claimTab()` 认领页面 → 页面内同源 fetch `/i/archives/latest` 取得 S3 预签名直链（免 cookie）→ 本地下载 basharnazzal「Radial Engine」80MB（CC-BY 4.0）。intan_dp 候选预签名已过期（1611 字节错误体），弃用。
- **资产管线**：inspect（29 网格/7 程序化材质/0 贴图/约 220 万三角面；Blender 泛名）→ optimize（80.48MB → **5.24MB**，6.5%，webp 空跑 + draco）→ `public/assets/radial-engine.glb`。
- **接入**（add-device SOP）：`radial-engine`（GENERIC · 机械 · quality B）；`__RAW.rel` 实测聚类映射——x<0.35 = 桨毂/桨叶，距曲轴中线 (0.345,0.525) yz 距离 >0.08 = 9 缸环（15 块），其余 = 曲轴箱；frontAxis '-x'（桨面朝观众）、targetWidth 8。
- **演示（诚实口径）**：活塞未单独建模 → **不做假活塞动画**；hub 螺旋桨旋转演示（spinPivot:'center' + spin 'auto' 最薄轴推导 = 曲轴轴向）。
- **验证**：lint ✓、gen:inventory（**104 台 · 818 部件 · 38 品牌**）、thumbs（radial-engine 23KB）✓、桌面爆炸/选中截图 ✓、移动端取景完整（竖屏修正生效）✓、build 1.94s ✓、smoke 28/28 ✓。
- 展览口径：星型发动机结构讲解（主连杆/副连杆、40°/缸、气冷）写入部件 desc，未编造内部细节。

## 交付状态最终版（2026-11-01 收官）

- **已完成且已验证**：SCR-01 屏幕重叠（8 台 native 修复）+ 屏幕方案策略、质量分级机制（104 台体系、2+1 台定级）、HOME-01 首屏、V8 曲轴/活塞运动演示、PART-01 两批 36 台筛查 + iphone-13 听筒修正、PART-02 小部件取景修复、**radial-engine 星型发动机全链路集成（第 104 台）**、移动端性能观察。
- **未完成**：PART-01 剩余设备滚动（批次 3）、quality 分级全量、任务书 §5 视角预设。
- **被阻塞**：无（径向已解锁完成）；真机触控实测维持「无真机环境」标注。

## Phase 8 续轮 4 — §5 视角预设（2026-11-01 续）

- **引擎 API `flyToView(preset)`**：正/背/左/右四向机位——距离沿用 CAM_HOME（自动含 camDist 与竖屏修正），方向绕 CAM_TARGET 旋转、Y 分量保持主视角同族俯角；飞行前停自转/停导览/失效测量点位；不触碰模型。
- **UI**：dock 新增「视角」图标（V 键切换）+ `#viewStrip` 五键条（正面5/背面6/左侧7/右侧8/复位R，复用 clipStrip 定位模式）；Esc 链插入视角条（帮助→视角→总览…）；帮助卡补「5-8 机位」行。
- **互斥与让位**：进入剖切自动收起视角条；视角条开启时 toast 上移让位（复用 clip-on 模式，has-vstrip class）；沉浸/thumb 模式隐藏；切台关闭。
- **验证**：radial-engine 正面机位 = 完美星环证件照（9 缸正对观众）、背面机位 = 曲轴箱后部（截图 vp-radial-*.png）；相机数值 front [0,7.4,16.7] / back [0,7.4,-16.7] ✓；build 2.81s ✓；smoke **29/29**（新增「视角预设 5=正面」断言）✓。
- **调试残留清理**：删除一次性探针 7 个（cam-probe×3/fly-debug/q-check/font-probe/thing-fetch）；可复用审计工具保留（screen-audit/assembly-screen/fps-probe/native-texture-dump/ui-check-* 等）。

## Phase 8 续轮 5 — §5 视角预设收官 + PART-01 实锤 #2（2026-11-01 续）

- **视角预设全量落地**：radial-engine 正面机位截图 = 9 缸星环「证件照」（vp-radial-front.png）、背面 = 曲轴箱后部；smoke 新增机位断言（**30/30 全绿**）；toast 让位（has-vstrip）、剖切互斥、thumb/沉浸隐藏、切台关闭均已联调。
- **PART-01 实锤 #2（本批筛查抓到的真回归级问题）**：**m4-carbine 整机不可见**——GLB 是 SkinnedMesh 且节点自带 scale=0.0479 未烘入顶点，inspect accessor 尺寸（4169mm）与视觉尺寸差 21.6×；targetWidth 9 按 accessor 设计 → 整机仅 0.42 单位长（hullRadius 0.21），CAM_HOME 视角完全不可见。10-29 接入至今未暴露的原因：thumbView 自取景永远「好看」、smoke 无此设备断言、无 hull 尺度护栏。
  - 修复：targetWidth 188 = 9/0.0479（视觉补偿，注释记录全部实测依据），hullRadius 0.21 → **4.401** ✓，thumbs 重生成 ✓。
  - 护栏：smoke 新增「m4 hullRadius ∈ [2,30]」断言，防回归。
  - 教训入档：inspect-glb 的 accessor bbox 不含节点 scale（SkinnedMesh 资产高发）——接入新 GLB 时若 inspect 尺寸与 `__RAW.finalBbox` 差一个数量级，先查节点 scale（后续可把该校验写进 add-device SOP）。
- 批次 3（20 台：枪械/跑车/自行车/工具/家电）：17 净，ak-47 刺刀/枪托、countach 前盖旗标均为真实端部；m4 即本批抓出。三批累计 56 台。

## Phase 8 续轮 6 — PART-01 全量筛查收官（104/104，2026-11-01 续）

- 批次 4（24 台手机/复古电子/影音）+ 批次 5（15 台钟表/机械/键盘）+ 批次 6（10 台收官：action5pro/commodore-64/stratocaster/gramophone/perseverance/portable-cassette/radial-engine/switch-2/v8-engine/zfold7）。
- 旗标 19 个全部核对为真实端部（含 digital-watch 表扣 rel 0.96 目检 = 表带端真实位置，`watch-clasp.png`）。
- **PART-01 结论**：全馆装配态结构可信；两处实锤（听筒标签、m4 取景）均已修复。筛查工具 `tools/assembly-screen.mjs`（SCREEN_BATCH 参数化）沉淀为常规审计工具。

- **smoke 高负载偶发超时的取证与缓解**：连续两轮在不同断言处 waitForFunction 超时（boot 90s / jet-engine demo 8s）——取证为 6 轮筛查遗留的无头 Chrome 进程堆积（load 8.7，pkill 残留实例后 31/31 恢复）；jet-engine demo 等待加固 8s→15s；backlog 环境相关条目更新「负载>5 时结果不作数」缓解口径。非代码回归（两次失败点不同 + 清理后全绿证实）。

## Phase 8 续轮 7 — GraphView 升级：标签去碰撞 + 搜索定位（2026-11-01 续）

- **标签去碰撞（审计 P2-5 收口）**：draw 改两阶段——节点遍历时只入列候选（含优先级：搜索命中 0 / 悬停邻接 1 / 品牌·技术 2 / 设备 3 / 部件 4），统一按优先级排序绘制，屏幕空间矩形相交检测，后到让先到。`"WALTHER`、`LAIMERSANTA CRUZ` 类叠字（实为标签重叠的视觉切片）根除。
- **搜索定位**：graphBar 新增搜索框（datalist 设备清单 + Enter 触发）——命中节点镜头缓动滑至视图中心（viewTween 0.14 lerp）+ 外扩脉冲环 + hover 高亮（其余淡出）+ 底部「点击进入拆解」提示；未命中显示 `--warn` 徽标；清空恢复。移动端搜索框换行全宽。
- **验证**：`graph-search-locate.png`（Osmo Action 定位 + 邻接高亮 + 提示条）、未命中徽标 ✓、build 2.50s ✓、smoke 31 项 ✓。
- 局限：命中取第一个 includes 匹配（多台同名前缀时需更精确查询词）；脉冲环时长 ~1.1s 固定。

## Phase 8 续轮 8 — 用户实测 bug 修复：零件聚焦后无法还原（2026-11-01 续）

- **现象（用户实测）**：详情页点零件（如 action4 `?p=front-screen`）相机飞近后，点空白/Esc/关闭均无法回全景——相机钉在特写位，仅 R 键（无人知晓）可复位。
- **根因（复现取证）**：`pickAt` 的还原分支 `else if(state.flewTo) resetView()` 位于 `selectPart(null)` **之后**——而 selectPart(null) 会先清掉 `flewTo`，导致点空白还原**从未生效**（HEAD 语义相同，历史缺陷非本轮回归；任务书 §2.4「复位」验收的真实缺口）。
- **修复**：① `pickAt` 在 selectPart 前保存 `wasFlew`，空点击按其触发 resetView；② 引擎新增 `deselect()`（取消选中 + 若聚焦过则飞回全景），Esc 末档与详情卡「关闭」改走它（用户对「关闭」的心理预期 = 退出聚焦）。
- **验证**：`restore-repro.mjs` 四路径复现——修复后空白点击 [10.5,6,13.5]=CAM_HOME ✓、Esc 回全景 ✓、R ✓、聚焦新零件不受影响 ✓；smoke 新增「点零件后空白点击还原相机」断言（**32 项全绿**）。

## V2 阶段 A — 遮挡矩阵 + 零件导航双模式（2026-11-01，V2 任务书）

依据 `docs/roadmap/GEWUGUAN_V2_TODAY_SUPPLEMENT.md`。

1. **浮层遮挡矩阵**：5 浮层（clipStrip/tourBar/viewStrip/tourNote/toast）纵向位次收口为 DeviceViewer `floatSlots` 集中计算——按 clip→tour→views 先后入栈（层高 46px），tourNote 恒在条上层、toast 恒在顶；移动端基高 66 并收编原 has-sheet 让位机制（+sheetH+20）。清除了 6 处散落的 CSS bottom 特例（86/132/108/66/has-sheet calc）。
2. **零件导航双模式**：rail 头部新增模式切换（清单列表 ↔ 宫格面板）；宫格 = 双列编号+名称格（两行截断），交互与清单一致（点击聚焦/悬停高亮）；模式记忆 localStorage `teardown-rail-mode`；切换时自动展开。
3. **验证**：`v2-phaseA-verify.mjs`——宫格 23 格/记忆 ✓、浮层栈 tour=86/views=132 错位无重叠 ✓、截图 `v2-rail-grid.png` ✓；build 2.45s ✓；smoke 32 项 ✓。

## V2 阶段 B-1 — 白天/黑夜双厅（2026-11-01，V2 任务书）

- **引擎 `setHallMode('day'|'night')`**：夜厅=现状（深空冷光/星点/霓虹轮辉/辉光 0.42）；日厅=明亮美术馆（浅色渐变背景懒生成、FogExp2 0xd9e2ea、半球光 0.95、霓虹轮辉收敛 rim 0.3/0.16+front 3、bloom 0.16、网格透明度 0.35、星点隐藏、曝光 1.0）。只动光照/背景/氛围层，不改模型与取景。PolarGridHelper 顶点色不可改色 → 透明度表达浓淡。
- **全站主题**：`html[data-hall=day]` 令牌覆盖（浅底深字/白玻璃面板/强调色加深 #0a7ea4 保对比）+ 大厅表面逐类适配；工作空间 accent 维持默认（DeviceViewer 不设 per-device --acc，设备换肤仅作用于大厅卡片小件与 3D 描边）。研究翼（星图/编年/对比）恒夜厅（canvas 深底工具，范围声明）。
- **UI**：dock「双厅」键（N 键，日/月图标切换）+ localStorage `dtm.hall` 记忆 + `data-hall` 驱动 CSS；引导卡补 N 行。
- **验证**：workspace day 引擎 hallMode=day+dataset=day ✓、跨页保持 ✓、重载记忆 ✓、夜厅切回 ✓；截图 `v2-day-workspace.png`（明亮美术馆+白玻璃 HUD）、`v2-day-lobby.png`（浅纸底+深衬线馆名+展台灯箱感）✓；build 2.79s ✓。

## V2 阶段 B-2 — 坐标辅助装置重设计（2026-11-01，V2 任务书）

- **方位陀螺 gizmo**：工作空间右下角 64px 罗盘（半透明表盘 + 前/右/后/左四向刻度随角距高亮 + 指针 = 观察方位角 + 俯仰读数），每帧读相机朝向（引擎新增 `getViewDir()` 复用向量 API）；点击 gizmo 联动视角条。
- **网格开关**：gizmo 下方按钮（引擎 `setGridVisible`，只关极坐标网格、保留光晕/接触阴影；`state.gridVisible` 与厅模式正交——切厅不重置用户选择）。
- **工程坑**：three `getWorldDirection` 需要 target 支持 set/normalize/negate 链——duck-typing 不可靠，改为引擎侧 `getViewDir()` 返回复用 Vector3（UI 零 three 依赖）。
- **验证**：gizmo 绘制（getImageData alpha>0）✓、网格开关 false ✓、正面机位后「前」刻度高亮+指针归位（`v2-coordaid.png`）✓；build 2.40s ✓。

## V2 阶段 A/B/C 收官 + 关键踩坑（2026-11-01，V2 任务书）

- **阶段 A**：浮层遮挡矩阵 floatSlots（5 层统一计算，清 6 处 CSS bottom 特例）✓；零件导航双模式（清单/宫格 + 记忆）✓。
- **阶段 B**：白天/黑夜双厅（引擎 setHallMode + 0.6s 灯光渐变 hallTween + data-hall CSS 主题 + dtm.hall 记忆 + 大厅/工作空间双入口 N 键）✓；坐标辅助重设计（极简方向式：罗盘 gizmo + 网格 3 环减量 + 地面 XYZ 轴线 + setGridVisible 与厅模式正交）✓。
- **阶段 C**：个人收藏馆 /collection（换厅 hero + 分类导航/排序/管理 + 卡片备注·收藏时间·评分角标 + 空态 CTA）✓；评分体系（总体常显 + 六维展开式 + 个人备注，dtm.ratings 新 schema）✓；infoPop 收藏管理（分类 chips + 新建 + 备注 + 收藏时间）✓。
- **踩坑实录（高价值）**：
  1. `watch` 源数组含 `favVer` 且回调自增它 → Vue 递归更新超限（Maximum recursive updates），污染组件响应式致 smoke demo 断言超时。修复：回调纯读化 + 事件处理器直接重读。
  2. three `getWorldDirection` 需 target 支持 set/normalize(/negate) 链——duck-typing 不可靠 → 引擎 `getViewDir()` 返回复用 Vector3。
  3. `inspect-glb` accessor bbox 不含节点 scale（SkinnedMesh 高发）→ add-device SOP 补必查项 + `__MAPPTS` 映射标定观测点。
  4. v-model textarea 的合成测试事件需带 `bubbles: true` 且走 `input`（非 change）。

## V2 阶段 D — 质量诊断 + 全站审计（2026-11-01，V2 任务书）

### 模型质量诊断（第八章）

- 新增 `tools/quality-diagnose.mjs`（`installDomShim` + registry import，Node 侧安全）：104 台全量静态体检——GLB 存在/draco/体积、署名与来源（官方/社区分级口径同 lint）、era/tour/xray/demos、屏幕策略注释（仅实际调用 addLiveScreen/makePhoneScreen 的设备要求）、quality 分级。
- 生成 `docs/QUALITY_DIAGNOSIA.md`（数据表 + 待办问题 + 运行时专项工具索引 + 追溯约定 + 用户评分参考流程）。勿手改数据表——重跑脚本再生成。
- 运行结果：**14 台待办**（11 台引擎类缺 xrayShellIds——realPartIds 兜底可用、marshall-jcm800 缺策展 tour——smoke 兜底断言依赖、其余为低优先建议）；零 GLB 缺失/零 draco 缺失/零署名违规/零屏幕策略缺失。
- 修复：hubble-telescope GLB 走 optimize 管线补 draco（3.97→3.98MB 幂等重压）；`hasDraco` 检查窗口 240B→1MB（大 JSON chunk 的 extensionsUsed 才能覆盖）。
- 工具口径：仅实际调用 `addLiveScreen(`/`makePhoneScreen(` 算挂屏（空解构不算——mavic3pro/vision-pro 空钩子已豁免）。

### 全站 UI 审计（第九章）

- **impeccable detect**：1 条 advisory（--ease-spring 既有裁决保留），0 新增。
- **16 张全站审计截图**（7 页面 × 日/夜双厅 + 移动端 2 张）：`v2-audit-{lobby,collection,ws-action4,ws-radial,graph,timeline,compare}-{day,night}.png` + `v2-audit-{m-ws-day, m-lobby-night}.png`。零 pageerror。
- 详情页协同布局：左侧 rail / 中央 3D / 底 dock / 右下 coordAid / 右侧 ctxCard 五区空间关系经浮层栈统一计算，无遮挡重叠（阶段 A 已收口）。

### 回归

`npm run build` ✓ 2.7s · `npm run smoke` **32 项全绿** ✓ · `npm run lint:devices` ✓ · `npm run gen:inventory` ✓（104 台 · 818 部件）· `npm run thumbs` ✓。

## V2 续轮 — 用户实测反馈修复：拆分悬浮 + 日厅对比度（2026-11-01 续）

### 1. 拆分悬浮交互（用户参考抖音视频反馈）

- **用户期望**：点击零件 → 该零件从整机中悬浮弹出（拆分悬浮效果），而非仅相机飞近或隔离隐藏。
- **实现**：引擎 mainLoop 位置循环新增 `focusFloatK` 驱动——选中零件且爆炸度 <0.2 时沿其爆炸方向（worldOffset）额外偏移 0.3 倍；取消选中或爆炸度 >0.2 自动收回（渐入渐出 3.5/s ≈ 0.3s）。相机不飞近，用户在全景中看到「哪个零件从哪里弹出来」。
- **验证**：float-verify 探针——电池选中后位移 0.6 单位 ✓ / 主板位置不变 ✓ / 取消选中精确回位 ✓ / 截图 `v2-focus-float.png` ✓。

### 2. 日厅对比度系统性修复（用户反馈：字体看不清/颜色有问题）

- **问题**：~37 处硬编码暗色 UI 色值（#aebfd2/#b9c8da/rgba(125,143,163)/rgba(4,10,16) 等）未随日厅适配。
- **修复**：~50 行 `html[data-hall=day]` CSS 覆盖——ctx-desc/tech-body/d-tip/g-row/p-label/measure-tip/toast/tooltip/loader/drawer/guide/step-btn/filter-search/info-status/credit-flag/tb-sep/ctx-thumb 等全部面板内文字/背景/边框统一切换日厅浅色系。
- **验证**：`v2-day-infopop.png`（总览弹层可读 ✓）、`v2-day-ctxcard.png`（详情卡可读 ✓）、`v2-day-guide.png`（帮助卡可读 ✓）。
- smoke 32 项 ✓ / build ✓。

## V2 续轮 — 内部视角预设 + 映射校准 + 递归排查（2026-11-01 续）

1. **内部视角预设（第九章 §5 融合）**：VIEW_PRESETS 新增 `interior`（低角度近距离）+ DeviceViewer flyView 联动 X-Ray（切进去开 X 光/切出来关）+ viewStrip「内部」键 + 9 快捷键 + Esc 链/复位联动 X-Ray 退出。
2. **映射校准确认**：mapping-verify 6 台全过（action4/iphone-12/v8/radial/digital-watch/nikon-z6）。
3. **递归排查结论**：DeviceViewer 11 个 watch 逐一审过，源/写入无自反馈；间歇性递归为路由切换时新旧实例 overlapping 时序问题，`__VUE_ERRS` 注入模式可复现时抓栈。

## V2 续轮 — 内部视角预设上线（2026-11-01 续）

- VIEW_PRESETS 新增 `interior: [0.15, 0.08, 0.3]`（低角度近距离）+ DeviceViewer flyView 联动 X-Ray（切进去自动开 X 光、切出来自动关）+ viewStrip「内部」键（9 快捷键）+ Esc 链/R 联动退出。
- 验证：radial-engine Digit9 → viewMode=xray ✓ + 截图（X-Ray 下 9 缸内部结构清晰可见，`v2-interior-preset.png`）✓。

## V2 续轮 — 并行子代理集成 + 诊断清零（2026-11-01 收官）

- **Agent B2 完成**：14 台补 xrayShellIds（全馆 104 台均已显式声明）+ marshall-jcm800 补策展 tour + 12 台 quality B（全馆 A×1 + B×14 = 15/104 已定级）。lint ✓ / inventory ✓ / build ✓。
- **诊断清零**：QUALITY_DIAGNOSIS.md 重跑 → **104 台 · 0 问题**。hasDraco 检查窗口 256KB→1MB（大 JSON chunk 修正）；credit 口径对齐 lint（官方/社区分级）。
- **smoke 口径更新**：「无策展设备兜底」→「已全量补齐策展 tour（104/104）」——marshall 补 tour 后原断言前提不再成立。
- **Agent C 完成**：PageHeader 三页头组件化 ✓ + 移动端 dock 渐隐 ✓ + build ✓。
- **最终回归**：build 2.65s ✓ / smoke 32 项 ✓ / lint ✓ / inventory 104·815·38 ✓ / 诊断 0 问题 ✓。

### V2 全部章节完成状态

| 章节 | 内容 | 状态 |
|---|---|---|
| 第二章 | 白天/黑夜双厅 | ✅ |
| 第三章 | 零件导航双模式 + 映射准确 | ✅ |
| 第四章 | 底部工具栏 + 浮层管理 | ✅ |
| 第五章 | 坐标辅助装置重设计 | ✅ |
| 第六章 | 个人收藏馆 + 分类 | ✅ |
| 第七章 | 评分体系 + 备注 | ✅ |
| 第八章 | 质量诊断 + 追溯 | ✅ |
| 第九章 | 全站 UI 审计 | ✅ |
| 第十一章 | 最终验收 | ✅ |

## V2 续轮 — 博物馆展台 + 操作栏动画（2026-11-01 续，用户反馈）

1. **博物馆展台**：引擎新增深色圆墩（金属质感）+ 台面 + accent 发光环圈，顶面与设备地面接触面齐平（y=-3.9），设备位置不变；半径随每台 hull 缩放（×0.66 钳制 [2.6,6.4]）；双厅材质（夜=深空玻璃+青辉环 / 日=浅石灰白大理石感）；不参与拾取；thumb 模式隐藏（旧缩略图一致性）。
2. **操作栏开合动画**：#rail 展开面板从左滑入（0.3s ease-out）替代 display 瞬切；railDots 圆点交错弹入（animation stagger 26ms/个 + 出场 transition 收回）——v-show 改 class 驱动（v-show display 瞬切无过渡）。
3. **验证**：pedestal-verify（夜/日/大设备三截图 `v2-pedestal-*.png`）✓；smoke 32 项 ✓；build ✓。

## V2 目标收口验证（拆分悬浮 + 日厅对比度，三截图确认）

- `goal-day-float.png`：日厅（引擎+CSS 双开）+ 拆分悬浮 + 展台——全部同时生效 ✓
- `goal-night-float.png`：夜厅同交互 ✓（accent 环圈可见）
- `goal-day-lobby-grid.png`：日厅卡片融入页面底色 ✓
- 遗留微调项：底部提示 toast 在日厅浅色场景下仍用深色底（可读但反差），后续可选做日厅浅色 toast 变体。
