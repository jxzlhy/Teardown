# 自主迭代待办池

> 优先级：P0 阻断/高危，P1 高价值，P2 体验与工程，P3 可选。
> 设备/部件数量以 `MODEL_INVENTORY.md` 为准；状态在每次迭代后更新。

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P1 | 社区模型署名补齐（作者/许可证/来源链接）+ lint 强制校验 | 合规与可信度，决定能否公开发布 | 已完成 | `npm run lint:devices` 强制 + faceCount 交叉比对 | **已完成**（37 台全量署名 + modelSource；hubble/perseverance 定案 NASA 公有领域；lint 禁止 by community） |
| P1 | 给更多主力机型补 `xrayShellIds` 与策展 `tour` | X-Ray/导览质量一致性 | 需逐台确认部件语义 | 浏览器抽查 + lint | **已完成 92/93 台（收官）**：全馆仅 marshall-jcm800 刻意保留无策展（smoke 兜底断言依赖）；新增设备默认随接入配 tour |
| P3 | Poly Haven 17 台 CC0 模型补 polyhaven.com 资产页链接（CC0 无强制义务，完整性加分） | 来源可溯 | 低 | lint + 页面抽查 | 待办 |
| P3 | NC/SA/非商业许可证在 UI 上的醒目区分标注（当前仅在 credit 文本中体现） | 合规透明 | 低 | 截图 | 待办 |
| P3 | ak-47/v8-engine/orrery/computer-parts 面数与在线版偏差的存档说明（slug/作者证据已确认，差异疑为 LOD/重传/转换） | 考据严谨性 | 低 | AUTONOMOUS_LOG 已记录 | 已记录 |
| P2 | 剖切封盖（stencil）或明确的”无封盖”提示 | 剖切可读性 | 中，涉及渲染改法 | 桌面/移动截图对比 | **已完成（务实方案）**：clip 材质切 DoubleSide 内壁可见 + 半透明 accent 剖切指示板（5129158）；真 stencil 需 EffectComposer RT 带 stencilBuffer（现无，改动波及全管线）→ LATER |
| P2 | 详情卡部件特写小图（按部件取景） | 详情页完成度 | 中，需扩缩略图管线 | 缩略图脚本 + 截图 | **已完成**（引擎 capturePartThumb 运行时离屏捕获，全量 90 台生效，零管线成本） |
| P2 | 真实 iOS Safari / Android Chrome 回归（含横屏） | 移动端真实体验 | 需真机/远程设备 | 真机录屏/截图 | 待办（环境缺失） |
| P2 | ~~git 初始化与首次提交~~ → 已完成：Gitee teardown-lab 远程（main，vendor/originals 1.2GB 仅本地备份，.gitignore 注明） | 回滚与协作基础 | 低 | push 成功 6d4a18a/2989033 | **已完成** |
| P3 | three.js 单独 manualChunks，进一步降低设备页首包 | 发版后缓存复用 | 低，总量不变 | 构建体积对比 | 已完成（three 771KB 独立 chunk） |
| P3 | 对齐 `hero` / `parts[].icon` 文档与实现（当前无消费方） | 减少无效配置项 | 低 | 代码检索 | 已完成（文档标注未落地；配置中本来无该字段） |
| P2 | 设备配置 chunk 加载失败态（发版后旧 chunk 404 / 弱网） | 可恢复性 | 低 | 请求拦截 abort + 浏览器 | 已完成（错误面板 + 重试/返回） |
| P2 | `prefers-reduced-motion` 降级（开场/缓动/自转/CSS 动画） | 无障碍与晕动症友好 | 低 | Chrome 媒体特性模拟 + 断言 | 已完成（7/7） |
| P3 | 子路径部署实测（`assetUrl` 已接入 GLB/缩略图/Draco） | 部署灵活性 | 低 | `vite build --base=/x/` + 静态服务 | 已完成（7/7；顺带修好插件写死 dist/） |
| P2 | 新设备研究接入：已接 8 台（blender/grinder/pinball/triple-engine/gramophone/smeg/tourbillon-movement/grand-piano/gameboy，达 96 台 31 品牌）；GAP 四缺口全部收官：陀飞轮 ✅ 钢琴 ✅ Game Boy ✅（混合路径：真实外壳+明标注示意内构件，baseRotation 引擎能力）/ 手风琴 ❌ 拆解无解；新设备需新一轮外部调研 | 内容扩充 | 需逐台查证来源/许可 | convert-asset + add-device SOP + inspect 判定 | 持续滚动 |
| P3 | pinball 弹射板疑似缺右只（Object_32/33 仅左），逐网格核对补映射 | 拆解准确性 | 低 | 页面 __RAW.rel + 截图 | 待办 |
| P0 | 以下为 2026-10-31《MUSEUM-ROADMAP》研究产出的规划项（详见 docs/MUSEUM-ROADMAP.md 第八部分，验收口径以该文为准） | 记录 | — | — | 已固化 |
| P1 | Phase 2：three-mesh-bvh 引入（MIT，兼容 0.164）+ 两点测量工具态最小原型（单设备试点，区分原始/展示尺寸） | 补齐实验室基础件 | 中：BVH 构建耗时需 <100ms/设备，超时降级普通 raycast | build + smoke + 无头取点断言 + 移动端工具栏不遮画布 | **已完成**（pocket3 123 几何 ≈20-29ms；smoke 17/17 含 2 项新断言；mobile 触屏通过；pocket3 realSizeMM 标定，其余设备显示"未标定"） |
| P1 | Phase 2：剖切真封盖（官方 stencil 模式 + 自建 stencilBuffer:true RenderTarget 传 EffectComposer；失败回退现行 DoubleSide 方案） | 剖切可读性 | 中：OutlinePass 顺序需实测；此前的 LATER 项就此转正 | 桌面/移动截图对比 + 切模式 20 次状态还原 | **已完成（剖面玻璃形态）**：stencil 掩码约束的半透明截面版，贴合设备轮廓（含镜头圆孔轮廓）、内腔组件始终可见；实测实心盖板在非水密模型上会灌满内腔（action4/pocket3/v8-engine/orrery 四台实测），半透明是全馆混合拓扑下的安全形态；无 stencil 回退指示板；附带修复"部件注册前切入剖切永不生效"（装载后重放模式）；smoke 18 项 |
| P1 | Phase 2：`assembleStep` 策展字段 + 逐步装配模式（2-3 台试点） | 装配关系可视化 | 低：纯增量字段 | lint:devices + 浏览器逐步装配断言 | **已完成**：action4（7 组策展）/pocket3（6 组策展）试点，无字段设备按爆炸偏移兜底分 ~5 层；B/←→/Esc 与 dock 步进器（移动端保留）；smoke 21 项 |
| P2 | Phase 3：设备数字档案增量字段（era/series/successors/technologies/sources/credibility）+ `tools/lint-knowledge.mjs` + 20 项高频技术原理库（src/knowledge/technologies，全部带 sources，未编写显示"待编写"） | 知识深度（S1/S2 核心） | 中：逐台查证发布年与来源，禁止编造 | lint 全绿 + 详情卡桌面/移动截图 | 待办 |
| P2 | Phase 4：`tools/gen-knowledge-graph.mjs`（构建期生成，勿手写）+ /graph 路由（3d-force-graph 3D + sigma.js 2D 双模式）+ iPhone/S25/Action 三组代际对比试点 | 知识星图（S3） | 中：图谱页须不加载 three 主 chunk 的方案需设计 | graph JSON diff 审查 + 深链可达 + 实测帧率 | 待办 |
| P3 | Phase 5：部件级"运行演示"动画集（≥10 个，L0/reduced-motion 降级静帧；UI 标注"视觉原理演示"） | 教育价值 | 中：逐个验证帧率影响 | 每演示截图 + L0 抽查 | 待办 |
| P3 | Phase 6：Tour 对象格式升级（兼容旧字符串）+ 三模式导览；AudioManager（默认静音，CC0 音源，总量 <300KB）；Web Speech 可选 TTS | 导览与沉浸感 | 中：音源授权逐个核证 | smoke 增导览断言 + 音源许可表 | 待办 |
| P3 | Phase 7：探索系统（dtm.* localStorage：收藏/已探索/徽章；不打分不排行不弹窗） | 回访动力 | 低 | 清空存储后从零复现 | 待办 |
| P3 | impeccable 接入评估（Apache-2.0，`npx impeccable detect src/` 本地跑）：试用后决定是否纳入 DESIGN_QA 固定流程 | UI 审查标准化 | 低 | 试用轮对比报告 | 待办 |
| P3 | DESIGN_SKILLS 约束：apple-design-skill（dickwu）无 OSS 许可证——永不作为依赖安装，仅人工摘录原则；对外表述不得称"Apple 官方" | 合规 | 低 | DESIGN_SKILLS.md 已记录 | 已固化 |
