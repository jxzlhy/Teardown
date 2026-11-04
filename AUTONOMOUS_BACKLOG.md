# 自主迭代待办池

> 优先级：P0 阻断/高危，P1 高价值，P2 体验与工程，P3 可选。
> 设备/部件数量以 `MODEL_INVENTORY.md` 为准；状态在每次迭代后更新。

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P2 | **P2-11 SEO 基础件**——og:image（复用 public/thumbs）+ robots.txt + sitemap.xml + manifest.webmanifest + CSP meta（实测不破坏 Draco/Cache Storage） | 分享卡片与可索引性 | 低：纯构建期/静态产物 | build + dist 检查 + og:image 200 断言 | **🟡 大部分完成（2026-11-04，AURORA PHASE 1）**：og:image+twitter:card+manifest+robots.txt 已上线（dist 三件 200 ✓）；**遗留**：sitemap（待部署域名；hash 路由设备页需预渲染才可索引）、CSP meta（需含 Draco worker/blob 的实测窗口）——两项并入 AURORA PHASE 7 终验窗口 |
| P2 | 设备页 A→B 同文档 hash 热切换 config 不换新（如 iphone-13 → forge 深链仅变 hash 时部件清单停留旧设备、永久 LOADING）——**既有问题非本轮回归**（干净 HEAD worktree 复现，2026-11-04 无头取证） | 设备切换正确性 | 中：需先人工浏览器复测定级 | 人工复现 → 定级 → 修 route watcher 或 loadDevice 时序 | 待定级（PROJECT_ISSUES 观察记录） |
| P2 | GraphView 品牌标签重叠 + 设备搜索定位输入框 | 星图可读性 | 低：Canvas 绘制层 | 截图 + 标签间距断言 | **已完成**（2026-11-01 续轮 8：两阶段标签去碰撞 + 搜索定位/脉冲/未命中徽标；`"WALTHER` 系标签重叠视觉切片，数据无引号） |
| P3 | 移动端 dock 溢出项（标签/导览/截图/帮助）加滚动渐隐提示 | 移动可发现性 | 低 | 390×844 截图 | 待办（2026-10-31 审计遗留） |
| P2 | 触控目标 ≥44px 真机实测（视觉 34–38px + padding 扩展的口径需真机复核） | 移动可用性 | 需真机环境 | iOS Safari / Android Chrome 实测 | 待办（headless 无法覆盖） |
| P3 | 星图/编年/对比三页头组件化（同构 #graphBar/#tlBar/#cmpBar） | 维护性 | 低 | build + 三页截图 | 待办 |
| P2 | 任务书 §5 视角预设（正/背/左/右机位 + V 键 + viewStrip） | 展品观察体验 | 低 | build + smoke 机位断言 + 截图 | **已完成**（2026-11-01 续轮 4：flyToView + viewStrip + 5-8 键，smoke 29/29） |
| P1 | 社区模型署名补齐（作者/许可证/来源链接）+ lint 强制校验 | 合规与可信度，决定能否公开发布 | 已完成 | `npm run lint:devices` 强制 + faceCount 交叉比对 | **已完成**（37 台全量署名 + modelSource；hubble/perseverance 定案 NASA 公有领域；lint 禁止 by community） |
| P1 | 给更多主力机型补 `xrayShellIds` 与策展 `tour` | X-Ray/导览质量一致性 | 需逐台确认部件语义 | 浏览器抽查 + lint | **已完成 92/93 台（收官）**：全馆仅 marshall-jcm800 刻意保留无策展（smoke 兜底断言依赖）；新增设备默认随接入配 tour |
| P3 | Poly Haven 17 台 CC0 模型补 polyhaven.com 资产页链接（CC0 无强制义务，完整性加分） | 来源可溯 | 低 | lint + 页面抽查 | **已完成（复核确认）**：13 台 Poly Haven 设备 modelSource 全部就位，抽查 4 条 URL 均 200，CC0 设备无遗漏——记账滞后，本轮核实后关闭 |
| P3 | NC/SA/非商业许可证在 UI 上的醒目区分标注（当前仅在 credit 文本中体现） | 合规透明 | 低 | 截图 | **已完成**：3 台 CC-BY-NC + 1 台 CC-BY-SA 在信息浮层显示琥珀色许可徽标（非商业/同许可，悬停见完整义务说明），大厅卡 NC 设备显示 NC 角标（3 个） |
| P3 | ak-47/v8-engine/orrery/computer-parts 面数与在线版偏差的存档说明（slug/作者证据已确认，差异疑为 LOD/重传/转换） | 考据严谨性 | 低 | AUTONOMOUS_LOG 已记录 | 已记录 |
| P2 | 剖切封盖（stencil）或明确的”无封盖”提示 | 剖切可读性 | 中，涉及渲染改法 | 桌面/移动截图对比 | **已完成（务实方案）**：clip 材质切 DoubleSide 内壁可见 + 半透明 accent 剖切指示板（5129158）；真 stencil 需 EffectComposer RT 带 stencilBuffer（现无，改动波及全管线）→ LATER |
| P2 | 详情卡部件特写小图（按部件取景） | 详情页完成度 | 中，需扩缩略图管线 | 缩略图脚本 + 截图 | **已完成**（引擎 capturePartThumb 运行时离屏捕获，全量 90 台生效，零管线成本） |
| ~~P1~~ | DeviceViewer 间歇性 "Maximum recursive updates"——**已定性（2026-11-01）**：18 次压力转换 + 5 次原条件复刻均 0 复现；原错误发生于并行会话编辑 engine.js/DeviceViewer 的中途（mtime 16:23），Vite 服务半更新模块图的瞬时态。warnHandler 诊断法已入记忆库；若再现用 `__vue_app__.config.warnHandler` 抓 trace | 随机体验杀手 | 代码落定后不可复现 | `__vue_app__.config.warnHandler` 抓 trace（见记忆 graph-view-coordinate-system） | **已定性关闭（瞬时态伪影）** |
| P2 | 真实 iOS Safari / Android Chrome 回归（含横屏） | 移动端真实体验 | 需真机/远程设备 | 真机录屏/截图 | 待办（环境缺失；浏览器模拟已覆盖三视口+横屏，性能观察见 AUTONOMOUS_METRICS） |
| P1 | smoke 全绿收官（2026-11-03 续轮 4）：等待已全面放宽（booted 180s / demoActive 30s / 演示采样 2.2s / tour 卡 20s），历史 90s 线对大资产+swiftshader 实测不够（action4 fresh 63s / jet-engine 121s @load5-13）；套件在 load 5-17 多轮死于 4-16 项（frame detached/Target closed/demoActive 超时），单页 fresh boot 稳定——**纯环境瓶颈**（并行会话压机），需 load<2 窗口连跑两次 | 发布门槛 | 低 | load<2 时 exit=0 ×2 | **进行中（基建全部就绪，等窗口）** |
| P2 | 系统高负载下 smoke 偶发失败（两类：① loadDevice TypeError 'group' 已加固栈打印；② 2026-11-01 新增——load≈8 时各处 waitForFunction 计时等待偶发超时，jet-engine demo 等待已加固 8s→15s，action4 boot 90s 也偶发）。根因：筛查/缩略图批次遗留无头 Chrome 进程堆积（pkill swiftshader/smoke 实例后恢复 31/31） | 套件稳定性 | 低频（高负载才触发） | 负载<2 时连跑两次 | **缓解已落地**（运行 smoke 前清残留无头 Chrome；负载>5 时结果不作数，重跑为准） |
| P2 | ~~git 初始化与首次提交~~ → 已完成：Gitee teardown-lab 远程（main，vendor/originals 1.2GB 仅本地备份，.gitignore 注明） | 回滚与协作基础 | 低 | push 成功 6d4a18a/2989033 | **已完成** |
| P3 | three.js 单独 manualChunks，进一步降低设备页首包 | 发版后缓存复用 | 低，总量不变 | 构建体积对比 | 已完成（three 771KB 独立 chunk） |
| P3 | 对齐 `hero` / `parts[].icon` 文档与实现（当前无消费方） | 减少无效配置项 | 低 | 代码检索 | 已完成（文档标注未落地；配置中本来无该字段） |
| P2 | 设备配置 chunk 加载失败态（发版后旧 chunk 404 / 弱网） | 可恢复性 | 低 | 请求拦截 abort + 浏览器 | 已完成（错误面板 + 重试/返回） |
| P2 | `prefers-reduced-motion` 降级（开场/缓动/自转/CSS 动画） | 无障碍与晕动症友好 | 低 | Chrome 媒体特性模拟 + 断言 | 已完成（7/7） |
| P3 | 子路径部署实测（`assetUrl` 已接入 GLB/缩略图/Draco） | 部署灵活性 | 低 | `vite build --base=/x/` + 静态服务 | 已完成（7/7；顺带修好插件写死 dist/） |
| P2 | 新设备研究接入：2026-11-02 官方 NASA 双件（ingenuity-helicopter/parker-solar-probe，3D Resources 直链 GLB 渠道）+ 同日 Sketchfab/PH 4 台（curta-type2/wankel-engine/vintage-binocular/manual-gearbox）达 110 台；2026-11-03 批次 +5（fresnel-lens/refractor-telescope/fire-hydrant/seadogs-compass/vintage-stapler）达 **115 台 39 品牌**；NASA 渠道可扩量（并行会话另有 chandra/spitzer 筹备中）；2026-11-03 已接 **Braun SK55**（610→54 网格 735KB）与 **armillary-sphere 浑天仪**（7 网格 5.78MB，六环异轴联动）；Pascaline 暂缓（双份重叠+跨父链缩放，join 后世界矩阵不齐，需 bake-transform，证据链见 LOG）；Nixie 已判死；其余候选：PH 落地钟复核/ PH 落地钟复核（Nixie 已判死：三套变体叠原点+乱码名，见 LOG 当日条目） | 内容扩充 | 需逐台查证来源/许可 | convert-asset + add-device SOP + inspect 判定 | 持续滚动 |
| P2 | 本会话模型搜罗/自创批次（2026-11-02/03）：官方 NASA 4 台（ingenuity-helicopter/parker-solar-probe/spitzer-space-telescope/chandra-x-ray-observatory，3D Resources 直链 GLB 渠道，6 探 4 中，Dawn/Stardust 网格合并过粗诚实落选）+ 自创 Wankel 生成器（forge 第 5 生成器 + 引擎 eccOrbit 能力）+ 混合路径首件 vintage-microwave（PH 外壳+示意内构件）；mousetrap 机构烘焙单网格落选、spinning_wheel 留待大工程 | 内容扩充 | 逐台查证完成 | lint/inventory/thumbs/build/preview/截图 全链路 | 已完成（各自提交） |
| P3 | 新渠道候选（未验证）：Smithsonian Open Access 3D（3d.si.edu，CC0 馆藏扫描，航天飞机/阿波罗指令舱级标的）——门户为 JS 壳，api.si.edu 需 api.data.gov 密钥，3d-api.si.edu 内部端点待逆向；时间盒探测未突破，下轮可作专项调研 | 内容扩充 | API 密钥/逆向成本 | curl 实测 | 待办（调研） |
| P3 | pinball 弹射板疑似缺右只（Object_32/33 仅左），逐网格核对补映射 | 拆解准确性 | 低 | 页面 __RAW.rel + 截图 | **已核关闭（2026-11-01）**：inspect-glb 94 网格全 Object_N 无语义名；爆炸态选中特写实证 flippers 部件含两个网格（红 rubber 板体 + 白 plastic 板体）成对存在，与 desc「这两个部件」一致——源模型无缺失，无需补映射 |
| P0 | 以下为 2026-10-31《MUSEUM-ROADMAP》研究产出的规划项（详见 docs/MUSEUM-ROADMAP.md 第八部分，验收口径以该文为准） | 记录 | — | — | 已固化 |
| P1 | Phase 2：three-mesh-bvh 引入（MIT，兼容 0.164）+ 两点测量工具态最小原型（单设备试点，区分原始/展示尺寸） | 补齐实验室基础件 | 中：BVH 构建耗时需 <100ms/设备，超时降级普通 raycast | build + smoke + 无头取点断言 + 移动端工具栏不遮画布 | **已完成**（pocket3 123 几何 ≈20-29ms；smoke 17/17 含 2 项新断言；mobile 触屏通过；pocket3 realSizeMM 标定，其余设备显示"未标定"） |
| P1 | Phase 2：剖切真封盖（官方 stencil 模式 + 自建 stencilBuffer:true RenderTarget 传 EffectComposer；失败回退现行 DoubleSide 方案） | 剖切可读性 | 中：OutlinePass 顺序需实测；此前的 LATER 项就此转正 | 桌面/移动截图对比 + 切模式 20 次状态还原 | **已完成（剖面玻璃形态）**：stencil 掩码约束的半透明截面版，贴合设备轮廓（含镜头圆孔轮廓）、内腔组件始终可见；实测实心盖板在非水密模型上会灌满内腔（action4/pocket3/v8-engine/orrery 四台实测），半透明是全馆混合拓扑下的安全形态；无 stencil 回退指示板；附带修复"部件注册前切入剖切永不生效"（装载后重放模式）；smoke 18 项 |
| P1 | Phase 2：`assembleStep` 策展字段 + 逐步装配模式（2-3 台试点） | 装配关系可视化 | 低：纯增量字段 | lint:devices + 浏览器逐步装配断言 | **已完成**：action4（7 组策展）/pocket3（6 组策展）试点，无字段设备按爆炸偏移兜底分 ~5 层；B/←→/Esc 与 dock 步进器（移动端保留）；smoke 21 项 |
| P2 | Phase 3：设备数字档案增量字段（era/series/successors/technologies/sources/credibility）+ `tools/lint-knowledge.mjs` + 20 项高频技术原理库（src/knowledge/technologies，全部带 sources，未编写显示"待编写"） | 知识深度（S1/S2 核心） | 中：逐台查证发布年与来源，禁止编造 | lint 全绿 + 详情卡桌面/移动截图 | **基础设施已完成**：schema + lint-knowledge（principle 非空必须带 https sources）+ 详情卡「原理」区（桌面/移动截图过）；20 项全量词条来源全部经 Web 实证（2026-10-31 收官）。**剩余**：era 已覆盖 64/103 台（描述甄别 33 + 外部实证 31：DJI/Samsung/Nothing/Apple/Nintendo/Flipper/Framework/Sony 全部特定产品收官；经两次实证纠偏——Mini 4 Pro 实为 2023、Action 4 实为 2023）。其余 39 台中 38 台为通用教学/匿名古董模型（era 不适用），1 台 phone4apro 身份待证；series/successors 未动 |
| P2 | Phase 4：`tools/gen-knowledge-graph.mjs`（构建期生成，勿手写）+ /graph 路由（3d-force-graph 3D + sigma.js 2D 双模式）+ iPhone/S25/Action 三组代际对比试点 | 知识星图（S3） | 中：图谱页须不加载 three 主 chunk 的方案需设计 | graph JSON diff 审查 + 深链可达 + 实测帧率 | **数据与 2D 已完成**：gen:graph（103/38/414/20 · 1201 连边 · 139KB）+ /graph 零依赖 Canvas2D 力导向（独立 chunk、不加载 three、悬停高亮/深链/过滤/缩放已验证）。**剩余**：3D 模式已评估——暂缓（3d-force-graph 自带 three 复本 600KB+，2D 已覆盖交互，性价比不成立，除非后续有深度感知需求）。**代际对比试点已完成**：/compare/:group（iPhone 五代 / S25 三兄弟 / Action 两代，specs 同名键自动聚类、era 列头、焦点列高亮、设备页信息浮层入口；specs 同名键自动聚类、缺项 —） |
| P3 | Phase 5：部件级"运行演示"动画集（≥10 个，L0/reduced-motion 降级静帧；UI 标注"视觉原理演示"） | 教育价值 | 中：逐个验证帧率影响 | 每演示截图 + L0 抽查 | **15 台已上线**：device.demos 声明式字段（spin 数组 / spin:'auto' 最薄轴推导 / wobble），引擎 runDemos 驱动（仅旋转、退出缓动回位、激活 toast 标注示意动画、reduced-motion 静帧）。jet-engine 风扇段 + pocket3 云台 + 挂钟/闹钟秒针（真实速率）+ 留声机转盘（33⅓ rpm）+ 机箱/笔电/Mac mini/Switch2 风扇 + 搅拌机刀片 + 角磨机砂轮 + 台钻主轴 + 手摇曲柄 + 擒纵摆轮 + Mavic 螺桨（均降速/降频示意）。**剩余**：L0 静帧策略评估（旋转零渲染成本，现维持运行） |
| P3 | Phase 6：Tour 对象格式升级（兼容旧字符串）+ 三模式导览；AudioManager（默认静音，CC0 音源，总量 <300KB）；Web Speech 可选 TTS | 导览与沉浸感 | 中：音源授权逐个核证 | smoke 增导览断言 + 音源许可表 | **核心已完成**：tour 对象条目 { id, note }（兼容旧字符串，lint 校验继续覆盖）+ 连播/手动双模式 + 讲解卡（pocket3/jet-engine 策展讲解词）+ Web Speech TTS 朗读开关（本地合成默认关，步进/停止/卸载取消）。**挂账**：CC0 音源 AudioManager——本环境无可靠下载通道，待有音源采购条件时启动 |
| P3 | Phase 7：探索系统（dtm.* localStorage：收藏/已探索/徽章；不打分不排行不弹窗） | 回访动力 | 低 | 清空存储后从零复现 | **已完成 v1**：src/lib/explore.js（favorites/explored/badges 即时推导 + pub-sub）、大厅卡收藏星标、我的探索抽屉（徽章 5 枚/收藏/足迹）、设备页信息浮层收藏按钮、装载完成自动记足迹；清空 localStorage 从零复现 ✓（smoke 26 项） |
| P3 | impeccable 接入评估（Apache-2.0，`npx impeccable detect src/` 本地跑）：试用后决定是否纳入 DESIGN_QA 固定流程 | UI 审查标准化 | 低 | 试用轮对比报告 | 待办 |
| P3 | DESIGN_SKILLS 约束：apple-design-skill（dickwu）无 OSS 许可证——永不作为依赖安装，仅人工摘录原则；对外表述不得称"Apple 官方" | 合规 | 低 | DESIGN_SKILLS.md 已记录 | 已固化 |

## 下一版本候选（2026-11-01 通宵迭代收官时评估，按优先级）

| 优先级 | 事项 | 依据 |
|---|---|---|
| P2 | quality 分级逐台覆盖（以 screen-audit + assembly-screen 证据滚动定级；目标先覆盖 50 台主力） | 分级机制已建、2+1 台已定级，证据链现成 |
| P3 | 三页头组件化（#graphBar/#tlBar/#cmpBar 同构） | 维护性；低风险 |
| P3 | GraphView 3D 模式再评估（维持暂缓结论，除非有深度感知需求） | MUSEUM-ROADMAP 结论 |
| P2 | 设备页「内部」视角预设（联动 X-Ray 的组合机位） | 视角预设已上线，组合位是自然延伸；需逐台验证取景 |
| P0 | （外部依赖）径向发动机 stroke 演示启用——模型活塞未单独建模，如获得分离活塞版资源可启用 phaseN=9 均布相位 | stroke.phaseN 已就绪 |

## V4.1 新增（2026-11-03）

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P2 | 引擎 demos `slide` 原语（刚性平移+李萨如闭环）+ Forge 锁式线迹生成器（11 部件 5 路联动 1:2 频率比） | 自行创造分支落地；缝纫原理教学件 | 低（纯新增字段，既有演示零影响） | tools/forge-ls-verify.mjs（ratio=2.00/复位/参数重生）+ 截图目检 | **已完成**（2026-11-03；深链竞态顺带修复） |
| P3 | forge 生成器 mech 面板与运动演示的联动核验（V4 MI①② 与 demos 的一致性抽查） | MI 数据可信度 | 低 | 逐生成器抽查 mech 边 vs 实际演示 | 待办 |
| P3 | 高负载防护：verify/smoke 脚本采样间隔与重试策略统一（rAF 节流假象） | 套件稳定性 | 低 | 负载>9 复跑对比 | 待办 |
| P2 | forge 锁式线迹轮次的干净 smoke 补跑 | 发布门槛完整性 | 低 | `npm run smoke` 全绿 | **已完成**（2026-11-03 晚 load≈11 时 34/34 全过 exit=0） |

## V3 新增（2026-11-02）

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P1 | 模型接地专项：tools/ground-audit.mjs 无头扫描 104 台 hull bbox min.y 与台面 -3.9 间距 → 分级（<0.05 合格/0.05-0.4 微调/需 baseRotation 评估）→ 引擎接地偏移机制（逐台字段，默认 0） | §9.1 悬空是底座专项显性缺陷 | 中：逐台确认不可一刀切；爆炸/取景/特写需回归 | 审计表 + 抽样双厅截图 + smoke | 待办（下一切片） |
| P2 | 缩略图日厅变体：render-thumbs/previewScene 增加日厅布光参数集，产出 day 变体，大厅按 data-hall 切换（缓存双份） | F2 日厅卡片拼贴感根除 | 中：104×2 存储与管线时长 | 缩略图抽查 + 大厅日厅截图 | 待办 |
| P3 | tools/day-contrast-verify.mjs 按 V3 token 更新或退役 | 工具与代码一致 | 低 | 运行 | 待办 |

## 2026-11-02 全网搜罗批次（2026-11-03 记）

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P1 | **Smithsonian 免 key 通道接入**：S3 bucket（104k key 全量目录已在 `vendor/assets/originals/_si-research/si_titles.tsv`）+ CDN `cdn.3d-api.si.edu/{uuid}/{file}`。**JWST ✓ → 1903 Wright Flyer ✓ → Apollo 11 舱门 CAD ✓（125）→ Apollo CM 座舱 ✓（126）→ Apollo CM 外壳 ✓（第 127 台：shell+top 双分包，烧蚀热盾叙事）**——"外壳→座舱→舱门"Apollo 递进三联展线成型 | 全馆级馆藏补充（CC0 无署名负担） | 中：SI 扫描多为单焊接网格需逐个验分组 | inspect-glb + add-device SOP | **五台已完成**；二线池滚动 |
| P2 | ~~随机丢件复验~~ **模式修正（2026-11-04 IAB 两轮复验）**：丢失非随机——两台丢的都是 merge 文件中**顶点数最大 primitive**（CM interior seats 59k / CM exterior nose 160k，各连续两轮稳定丢失）→ 定性改"**特定大网格确定性丢失**"（疑似装载内存预算阈值）；空闲机器复测区分预算不足 vs loader 缺陷。同轮 smoke 尝试（load 4.88）仍 180s 超时——按"不影响其他进程"主动停手 | 排障闭环 | 低 | IAB 探针（cmi-robust/apollo-pid） | 定性更新；修复待空闲机器 |
| P2 | **gltf-transform merge 孤儿节点缺陷**：merge 多个单 node GLB 时输出 scenes[0].nodes=[0] 仅首件挂场景（nodes 1-3 孤儿，GLTFLoader 不实例化）——修复脚本 /tmp/dji-fetch/fix-scene.mjs（重写 scenes.nodes + BIN 重组；待收编 tools/ 加测试） | 资产管线 | 低 | CM interior 修复后 3/4 网格装载实测 | 已定性（脚本收编挂账） |
| P2 | **资源压力下 GLTFLoader 大网格随机静默丢失**：25k-150k 面网格在内存/调度压力下实例化间歇失败（两轮各丢一件不同 mesh；无错误无 catch）——文件结构与路由规则不受影响，4/4 验证等空闲窗口 | 排障定性 | 低 | IAB 长驻进程探针（无头新实例易冻结） | 已定性入 LOG |
| P2 | **SI 预编码 draco 兼容性坑**：SI 的 `*_draco.glb`（S3 直链）使 three 0.164 DRACOLoader worker 挂死（PARSING 永挂；gltf-transform node 侧解码正常、重编码无效）——**SI 资产一律 decode 后跳过 draco**（去 draco 版 4.54MB 装载即通） | 资产管线 | 低 | 已实测（radial 对照同实例 OK） | 已定性入 LOG |
| P2 | JWST/radial/Wright-Flyer 三切片 smoke 补跑——**2026-11-03 深夜定性：环境阻塞**。两次实测（负载 4.8 窗口）：①smoke Vite 启动 30s WS 超时（与并行会话 8 个 vite 实例竞争）；②无头探针 Target closed + 装载冻结 INIT——`memory_pressure` 实证 pages free≈30MB（用户 Chrome+WebKit+并行 vite 吃满 32GB），新无头标签 OOM。**静态链路已全绿**（cfg import/GLB fetch 200/模块转换毫秒级/lint 五处一致/build）；视觉证据以低负载时段截图为准 | 回归完整性 | 低 | `npm run smoke`（待整机空闲） | 挂账（环境阻塞，非代码缺陷） |
| P1 | ~~radial-engine 分离活塞置换切片~~ **已完成（2026-11-03）**：senguptaarmaan Fusion 装配体（51 网格 CC-BY）置换 basharnazzal 3 部件版，draco 1.55MB；部件 3→6（+曲轴/活塞/安装座），8 组活塞连杆独立分件；**引擎新增 stroke `phaseMode:'radial'`**（方位角均布相位）+ 修复 axisL/axisR 无缺省抛错、演示初始化与 GLB 合并竞态两处既有缺陷；8 组活塞 8 条相位分化轨迹实测 ✓ v8 回归 ✓ | 星型发动机 signature 演示补全 | 已回归（lint/build/thumbs/截图/相位实测/v8 canary） | stroke 相位采样 + v8 canary ✓ | **已完成**（smoke 挂账等负载） |
| P2 | smoke 补跑（radial + JWST 两切片，负载 <5 时） | 回归完整性 | 低 | npm run smoke | 待补 |
| P2 | ~~Curta 双版本裁决~~ **已关闭（2026-11-03 自动解决）**：并行会话下载 curta-calculator.glb 后未接入即自行清理（孤儿件消失，registry/inventory 无痕迹）；curta-type2 独占计算器类目 | 类目纯净 | 低 | ls + grep registry 实证 | **已关闭** |
| P3 | ~~二线候选滚动池~~ **正式收官（2026-11-04）**：6 候选全部消化——2 接入（Sea-Gull 1963 第 128 台 / 瓦特蒸汽机第 129 台）+ 4 落选（Singer、Agfa 重叠几何；Lefaucheux、Polyphon 45D 单网格全焊接，原件均备份标 REJECTED）。**规律定稿**：Sketchfab 小件落选三征（重叠 65532v×n / 单网格 / 匿名无语义），后续调研须把"部件可分性"提升为硬性过滤条件 | 内容扩充 | 低 | inspect 先行 | **已收官** |
| P3 | seagull-1963 thumbs 补渲染（8301 实例环境冻结挂账；IAB 首屏+142/142 路由已替代验证） | 缩略图完整性 | 低 | npm run thumbs -- --only seagull-1963 | 挂账窗口 |
| P3 | 品牌档案补齐：CURTA 品牌新档（curta-type2 接入产生）；39→40 品牌 | 档案完整 | 低 | lint brand-check | 待办（并行会话可能已动） |

### 2026-11-02 批次技术备忘（避免重复踩坑）
- Sketchfab 下载：`/i/archives/latest?model=<uid>&archiveType=glb&textureMaxResolution=0`（参数名 model/archiveType；预签名 ~2 分钟即取即下；匿名 401；IAB 登录态 User-419afc4fcb）。
- 节点分支变换不一致的 GLB（同一模型各分支 scale 量级不同）→ `gltf-transform flatten` 预处理根治；排查时 getWorldPosition 报的是枢轴位置，顶点级判断要用 Box3.setFromObject。
- 爆炸 ex 语义：[x右, y上, z朝观众] 相机基向量世界单位直移；同心部件手动发散；小件密集设备 ex 用 2-4 量级。

## V5.0 创作工作室（2026-11-03 立项，总任务书第七章）

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P2 | ~~V5.0.0 基础架构 + V5.0.1 模型导入/体检~~ | 创作支柱首切片：/studio 懒加载 20KB chunk，导入守卫六类错误分类 + 结构报告 + 10 条本地规则诊断 + 层级/视口联动 | 低（纯新增模块） | tools/studio-verify.mjs 11/11 + 截图 + build/lint | **已完成**（2026-11-03；smoke 全量挂账=OOM 环境阻塞，与并行会话三切片合并待补） |
| P2 | V5.0.2 Model Workshop：选择/变换/材质调整/组件分组/撤销重做 | 编辑能力 | 中：命令体系设计决定撤销栈质量 | 编辑操作 e2e + 截图 | **首切片已完成**（2026-11-03：网格级变换/材质+撤销重做+导入态快照复位+GLB 导出+__STUDIO 钩子；21/21 e2e；组件分组已收尾） |
| P2 | 本地作品库（IndexedDB 保存/读取/删除/元数据 + 浏览器数据清理警示 + 备份导出） | 作品持久化 | 低 | 清空存储从零复现 + 导入导出往返 | **基础切片已完成**（2026-11-03：CRUD+备份 JSON 往返+非法拒收+UUID 主键；27/27 e2e；恢复输入遮蔽主输入的 querySelector 坑已修） |
| P3 | 诊断增强：空网格/重复网格/异常法线的**修复副本**路径（总任务书 7.6 修复建议→副本→对比） | 从诊断到修复闭环 | 中：不可覆盖原始数据 | 修复前后 diff 断言 | **首切片已完成**（2026-11-03：missing-normals/empty-mesh 两类确定性修复以可撤销命令组落地+前后严重度对比+8 类需人工如实给理由；本地工作流原始文件不可覆盖=等效满足副本约束；37 项 e2e 36 绿） |
| P3 | 图片参考入口（V5.0.3）：参考图上传/比例/透明度/与视口并排——明确不承诺内结构推断 | 双入口之一 | 低 | 上传 + 并排截图 | **已完成**（2026-11-03：视口叠层对照+四滑杆+拒收+清除；31 项 e2e 中 29 项本轮绿，?cap/懒加载两项环境阻塞挂账——前两轮完整跑均绿） |
| P3 | studio-verify 并入 smoke 套件（待并行批次消化后统一端口口径） | 回归门禁完整性 | 低 | npm run smoke 计数 | 待办 |
| P2 | 文字程序化建模（V5.0.4）：描述→结构化参数→程序化几何 | 双入口第二入口 | 中：解析覆盖面与诚实口径的平衡 | 解析单测 + 生成→管线 e2e | **首切片已完成**（2026-11-03：确定性关键词模板解析非 AI 如实标注；tools/textgen-unit.mjs 16/16 单测全绿（抓修子句顺序/覆盖/自然语序三缺陷）；未识别如实列出+无结构拒析；浏览器集成断言 OOM 挂账——集成路径与已验证模式同一） |
| P2 | 组件分组/零件分组（V5.0.2 收尾，任务书 7.4） | 工作台清单收官项 | 中：结构操作的可逆性 | 结构操作单测 + e2e | **已完成**（2026-11-03：组合/解散双向命令组+世界变换保持+撤销精确还原原父兄弟序；tools/groupops-unit.mjs 19/19；浏览器 UI 断言挂账 OOM） |
| P2 | 机械创作模板（V5.0.6 首切片，任务书 8.7）：齿轮对/曲柄滑块参数化 | 创作能力（标准公式精确实现，演示口径如实标注） | 中：几何/公式正确性 | 公式级单测 + e2e | **已完成**（2026-11-04：中心距/位移公式精确实现+参数钳制+关键词检测+spec template 契约；tools/templates-unit.mjs 24 项全绿；浏览器断言挂账 OOM） |
## R9 设备页参考站驱动升级（2026-11-03，docs/design/REFERENCE_STUDY_2026-11-03.md）

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P1 | ~~底座雷达刻度盘 + 设备页三区升级（R1–R5）~~ | 参考站级视觉与信息架构 | 中（引擎视觉层） | hud-verify 12/12 + smoke 26/28 + 截图目检 | **已完成**（2026-11-03） |
| P2 | R6 部件分组节头：设备数据加 `group` 字段 → rail 分组节头（参考站 A/B/C 分组语汇） | 长清单导航效率 | 中：×128 台配置逐台补数据 | lint:devices + hud-verify 分组断言 | 待立项（数据结构升级，逐台滚动） |
| P3 | R8 日厅白模材质研究：真实模型日厅材质呈现边界（不改原 GLB 的前提下） | 浅色展厅质感 | 高：触碰「不掩盖模型材质」红线 | 视觉对比 + 材质审计 | 研究项（不承诺） |
| P2 | hud-verify `--device action4` 旗舰断言 + smoke 全量复跑（负载 <5 窗口） | 回归完整性 | 低 | npm run smoke | 挂账窗口 |
| P2 | 124 台缩略图批量重渲（render-thumbs 重试护栏已解锁可行性；仅当未来底座/光照再升级需要时执行——当前 thumb 管线不显示 plinth，无视觉差异驱动） | 大厅视觉一致性 | 低 | npm run thumbs -- --all | 挂账（无驱动暂缓） |
| P3 | thumb 管线显示 plinth（雷达盘进入大厅首屏展台）——需改 engine thumb 模式可见性 + 124 台重渲 | 首屏质感 | 中：旧缩略图一致性口径 | 大厅截图对比 | 研究项（无承诺） |
