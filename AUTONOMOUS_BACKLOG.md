# 自主迭代待办池

> 优先级：P0 阻断/高危，P1 高价值，P2 体验与工程，P3 可选。
> 设备/部件数量以 `MODEL_INVENTORY.md` 为准；状态在每次迭代后更新。

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
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
| P2 | 系统高负载下 smoke 偶发失败（两类：① loadDevice TypeError 'group' 已加固栈打印；② 2026-11-01 新增——load≈8 时各处 waitForFunction 计时等待偶发超时，jet-engine demo 等待已加固 8s→15s，action4 boot 90s 也偶发）。根因：筛查/缩略图批次遗留无头 Chrome 进程堆积（pkill swiftshader/smoke 实例后恢复 31/31） | 套件稳定性 | 低频（高负载才触发） | 负载<2 时连跑两次 | **缓解已落地**（运行 smoke 前清残留无头 Chrome；负载>5 时结果不作数，重跑为准） |
| P2 | ~~git 初始化与首次提交~~ → 已完成：Gitee teardown-lab 远程（main，vendor/originals 1.2GB 仅本地备份，.gitignore 注明） | 回滚与协作基础 | 低 | push 成功 6d4a18a/2989033 | **已完成** |
| P3 | three.js 单独 manualChunks，进一步降低设备页首包 | 发版后缓存复用 | 低，总量不变 | 构建体积对比 | 已完成（three 771KB 独立 chunk） |
| P3 | 对齐 `hero` / `parts[].icon` 文档与实现（当前无消费方） | 减少无效配置项 | 低 | 代码检索 | 已完成（文档标注未落地；配置中本来无该字段） |
| P2 | 设备配置 chunk 加载失败态（发版后旧 chunk 404 / 弱网） | 可恢复性 | 低 | 请求拦截 abort + 浏览器 | 已完成（错误面板 + 重试/返回） |
| P2 | `prefers-reduced-motion` 降级（开场/缓动/自转/CSS 动画） | 无障碍与晕动症友好 | 低 | Chrome 媒体特性模拟 + 断言 | 已完成（7/7） |
| P3 | 子路径部署实测（`assetUrl` 已接入 GLB/缩略图/Draco） | 部署灵活性 | 低 | `vite build --base=/x/` + 静态服务 | 已完成（7/7；顺带修好插件写死 dist/） |
| P2 | 新设备研究接入：2026-11-02 官方 NASA 双件（ingenuity-helicopter/parker-solar-probe，3D Resources 直链 GLB 渠道）+ 同日 Sketchfab/PH 4 台（curta-type2/wankel-engine/vintage-binocular/manual-gearbox）达 110 台；2026-11-03 批次 +5（fresnel-lens/refractor-telescope/fire-hydrant/seadogs-compass/vintage-stapler）达 **115 台 39 品牌**；NASA 渠道可扩量（并行会话另有 chandra/spitzer 筹备中）；下一批已查证候选：Nixie 辉光钟（panmax L158，1162 网格需位置聚类）/ Braun SK55（L26，610 网格）/ PH 落地钟复核 | 内容扩充 | 需逐台查证来源/许可 | convert-asset + add-device SOP + inspect 判定 | 持续滚动 |
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
| P2 | forge 锁式线迹轮次的干净 smoke 补跑（2026-11-03 负载 15-24 期间无头 Chrome 反复 Target closed，23-24 项通过后崩，环境级非回归；5 台批次 smoke 33/33 已过） | 发布门槛完整性 | 低 | 负载<5 时 `npm run smoke` 全绿 | **待补跑（阻塞于并行会话负载）** |

## V3 新增（2026-11-02）

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P1 | 模型接地专项：tools/ground-audit.mjs 无头扫描 104 台 hull bbox min.y 与台面 -3.9 间距 → 分级（<0.05 合格/0.05-0.4 微调/需 baseRotation 评估）→ 引擎接地偏移机制（逐台字段，默认 0） | §9.1 悬空是底座专项显性缺陷 | 中：逐台确认不可一刀切；爆炸/取景/特写需回归 | 审计表 + 抽样双厅截图 + smoke | 待办（下一切片） |
| P2 | 缩略图日厅变体：render-thumbs/previewScene 增加日厅布光参数集，产出 day 变体，大厅按 data-hall 切换（缓存双份） | F2 日厅卡片拼贴感根除 | 中：104×2 存储与管线时长 | 缩略图抽查 + 大厅日厅截图 | 待办 |
| P3 | tools/day-contrast-verify.mjs 按 V3 token 更新或退役 | 工具与代码一致 | 低 | 运行 | 待办 |

## 2026-11-02 全网搜罗批次（2026-11-03 记）

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P1 | **Smithsonian 免 key 通道接入**：S3 bucket（104k key 全量目录已在 `vendor/assets/originals/_si-research/si_titles.tsv`）+ CDN `cdn.3d-api.si.edu/{uuid}/{file}`。**JWST 已接入（第 118 台，1600 网格→10 部件，brand NASA/ESA/CSA 新档）**；剩余：1903 Wright Flyer（3 命名网格+40 条官方注释，58MB 高模+258KB LOD 双版本）→ Apollo 11 舱门 CAD+指令舱递进展项 | 全馆级馆藏补充（CC0 无署名负担） | 中：SI 扫描多为单焊接网格需逐个验分组；NASA 模型天然多节点 | inspect-glb + add-device SOP | **JWST 已完成**；剩余待办 |
| P2 | JWST 切片 smoke 补跑（负载回落 <5 时）——lint/build/thumbs/截图已全绿 | 回归完整性 | 低 | npm run smoke | 待补 |
| P1 | **radial-engine 分离活塞置换切片**（原 P0 外部依赖正式转正）：4 个 CC-BY CAD 候选已验——simakovs05 5 缸 81k / jxstnxlll 7 缸 84k / senguptaarmaan Fusion360 227k / ygorprangel 75k；下载 inspect 后择优置换，启用 stroke.phaseN 演示（phaseN 按缸数配置） | 星型发动机 signature 演示补全 | 中：置换既有在库设备需全量回归（映射/tour/xray/demos） | stroke 演示截图 + smoke | 待办 |
| P2 | **Curta 双版本裁决**：本会话 curta-type2（halilkantarci 231 网格带拆解动画）vs 并行会话 curta-calculator（来源待查）——二选一或区分 Type I/II 共存 | 类目纯净 | 低 | inspect 对比 + 页面目检 | 待办（依赖并行会话落地） |
| P3 | 二线候选滚动池（社区报告已验 uid）：CMBC Singer 15 手摇缝纫机 315k / Sea-Gull 1963 计时码表 176k（ST19 柱轮叙事）/ Agfa Movex 88 发条摄影机 312k（拍摄侧空白）/ Lefaucheux 针发左轮 13k / 瓦特蒸汽机教学模型 63k（波兰国家级数字化，带动画）/ Polyphon 45D 盘式八音盒 10.9k | 内容扩充 | 低 | convert-asset SOP | 待办 |
| P3 | 品牌档案补齐：CURTA 品牌新档（curta-type2 接入产生）；39→40 品牌 | 档案完整 | 低 | lint brand-check | 待办（并行会话可能已动） |

### 2026-11-02 批次技术备忘（避免重复踩坑）
- Sketchfab 下载：`/i/archives/latest?model=<uid>&archiveType=glb&textureMaxResolution=0`（参数名 model/archiveType；预签名 ~2 分钟即取即下；匿名 401；IAB 登录态 User-419afc4fcb）。
- 节点分支变换不一致的 GLB（同一模型各分支 scale 量级不同）→ `gltf-transform flatten` 预处理根治；排查时 getWorldPosition 报的是枢轴位置，顶点级判断要用 Box3.setFromObject。
- 爆炸 ex 语义：[x右, y上, z朝观众] 相机基向量世界单位直移；同心部件手动发散；小件密集设备 ex 用 2-4 量级。
