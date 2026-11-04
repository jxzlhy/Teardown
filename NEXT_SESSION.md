# NEXT_SESSION · 下次会话最先执行

> 2026-11-02 深夜安全收尾时点。本轮 Goal：V4.0 MECHANICAL INTELLIGENCE（权威任务书 `docs/roadmap/GEWU_V4_MECHANICAL_INTELLIGENCE_AUTONOMOUS_EXECUTION.md`，604 行）。

## 现状快照

- **V5.0.10 AURORA 专项执行中（2026-11-04 轮 9-10，任务书 docs/roadmap/GEWU_V5_AURORA_EXPERIENCE_PERFORMANCE.md）**：PHASE 0 基线审查完成（`docs/audit/V5_AURORA_BASELINE_AUDIT.md` + 执行状态档 `docs/roadmap/GEWU_V5_AURORA_EXECUTION_STATUS.md`：阶段表/Skills 台账/性能基线）；**PHASE 1 首切片完成**——style.css 字号原始层 11 令牌 1:1 收纳 112/160 处（新代码禁裸字号）+ 全局 button:active 按压反馈 + SEO 静态件（og-cover.webp/og:image/twitter:card/manifest/robots.txt；sitemap/CSP 缓办有因入 PHASE 7）；build 2.71s ✓ 三静态件 200 ✓，对比度闸门结果见执行状态档。**下一项 = PHASE 1 归并遍**（长尾 18 种字号→语义档，需双厅截图对比验证；先读 design-system/tokens Skill）→ PHASE 3 前置修 hash 热切换 → PHASE 4 资产管线（KTX2 试点）→ PHASE 5 渲染引擎（R1 按需渲染/R2 标签脏检查/R3 composer samples）。专项完成前不转 V5.1（任务书 §18）。
- **PHASE 01 完结——RS-09~18 九项全部整改关闭（2026-11-04 续会话轮 7，本会话）**：RS-09/11/12/13/14/15/16/17/18 全关并验证（证据链 `docs/audit/REAUDIT-2026-11-03.md` §八 + `PROJECT_ISSUES.md` RS 表 11-04 节）。门禁：build ✓ / lint 六段 ✓ / 单测 21+16 ✓ / **studio-verify 55/55 ALL PASS**（负载 4.4，含本轮新断言）。**RS-16 战果：registry chunk gzip 29.17→1.35KB（−95%）**，生产 preview 实证普通设备页零 forge 生成器 chunk；forge 冷加载深链正常。新记录观察项：设备页 A→B 同文档 hash 热切换 config 不换新=既有缺陷（干净 HEAD 复现，待人工定级）。无头取证坑合集入记忆库 `headless-forensics-pitfalls-2026-11-04`。未提交改动中本轮 RS 部分：src/forge/registry.js、ForgeView、DeviceViewer、engine.js dispose、tools/studio-verify、7 个 forge-verify 工具（src/studio/* 已被 d9a1848 扫入）。
- **R9 设备页参考站驱动升级已收官（2026-11-03 续轮 4，本会话）**：底座雷达刻度盘（engine.js plinth 重建，双厅双材质）+ 设备页三区升级（顶栏规格 chip ×3 / rail 两行行结构 / infoPop 档案瓦片版式 / dock 拆解度读数 / coordAid↔ctxCard 互斥修复）。验证：**tools/hud-verify.mjs（新）12/12 ALL PASS**（参数化设备+独立实例重试护栏）+ smoke 26/28（2 失败定性环境非回归）+ build/lint 绿 + 5 张日夜截图目检。模式裁定 `docs/design/REFERENCE_STUDY_2026-11-03.md`，版式规范 `DESIGN_SYSTEM.md` §13，阶段档案 `docs/phases/PHASE_R9_*.md`。
- V3 UI/UX、V3.0 Forge（PHASE 0-8 三大标杆）、OPEN_MUSEUM 前置 Slice 1-4 全部验证收官（见 AUTONOMOUS_LOG 当日各节）。
- V4.0 MI 已完成：**①Mechanism Graph 首切片**——`src/forge/mech.js`（10 类关系 + validateMech）+ 锻造 V8 试点 `mech` 14 边（4 曲柄滑块 approx / 3 轴承支撑 exact / 7 固定）+ DeviceViewer 总览弹层「机构关系」面板（无数据/校验失败即隐藏）。验证工具 `tools/v4-mech-verify.mjs` EXIT 0。
- ~~全部改动未提交~~ **已入库**（并行会话于 2026-11-03 凌晨分批提交：V3 UI/Forge/MI/缩略图资产全部入库，达 119 台 39 品牌；此后又新增 Wankel 生成器/微波炉混合路径/NASA×4——注意本档为多会话接力档，以 git log 与 AUTONOMOUS_LOG 最新节为准）。

## 下一次最先执行（按序）

0. **R9 延伸（2026-11-04 更新）**：a) ~~日厅大厅审计~~ **已完成（4b）**——V3 遗产质量确认无重构需求；实证 thumb 管线 plinth 本就隐藏；导航修复+render-thumbs 护栏已入库（45fa721）。b) ~~研究翼延伸~~ **已完成审计（11-04）**——星图/编年/对比三页截图审计结论=PHASE_R4 成熟态，R9 语法对数据密集页过度设计，**无需重构**（截图 docs/design/screenshots/2026-11-04-research-audit/）。c) ~~R6 分组节头~~ **数据证伪（11-04）**——部件数 max 23、分布集中低位，两行行结构+滚动已可用，缓采裁定维持。d) ~~action4 旗舰断言~~ **10/10 ALL PASS（11-04）**——注意 CLI 语法必须 `--device=action4`（空格分隔不命中解析器）；AC203 档案大字+11 瓦片+era 行+chip×3 全绿。**R9 弧线只剩 smoke 全量绿一项**：三次尝试均被并行会话负载截断（大厅 4 项恒绿、设备装载段 OOM/boot 超时）——低负载窗口挂账维持，R9 代码路径已被昨日 26/28+今日 10/10 完整覆盖。
1. **下一垂直切片候选（11-04 两个并列候选，按当值负载与价值自选）**：a) V4.1a 切台时序/动画手感打磨（切台 loader 表现/相机回位缓动/面板状态清理的连贯性）——动工前先用 hud-verify 扩一段切台序列断言（action4→iphone-13→action4 往返，断言 UI 态清理+相机回位）；b) P2-11 SEO 基础件（og:image 复用 thumbs + robots.txt + 构建期 sitemap 工具 + manifest + CSP meta 须实测不破坏 Draco worker/Cache Storage；静态产物风险低收益确定，backlog 已排）。
1. ~~V4.0 MI 全系统 + 收尾清点 + V4.1 照明治理循环 + 性能/兼容回归~~ **收官**（执行状态档 GEWU_V4_MI_EXECUTION_STATUS.md / v4-light-audit / v4-viewport-sweep EXIT 0 / fps-probe quality 修复 / forge nav 修正；**smoke 负载抖动已定案=环境负载非回归**——负载曲线 24→6.4 与通过/失败严格相关，load<8 单跑全过，规程入记忆库）。
2. **V5.0 创作工作室续（11-03/04 八切片已交付）**：`/studio`（src/studio/ 十模块 + StudioView.vue 十面板）——V5.0.0 基础架构 + V5.0.1 导入/体检 + V5.0.2 Workshop（编辑+组件分组）+ V5.0.8 本地作品库 + V5.0.3 参考图 + V5.0.5 修复闭环 + V5.0.4 文字生成+**spec 契约/深链** + **V5.0.6 机械模板（齿轮对/曲柄滑块）**；Node 四套件 77 项全绿；studio-verify 55 项（浏览器段挂账 OOM，静默窗口待跑全量）；下一候选 = 凸轮模板/gizmo/studio-verify 并入 smoke，见 AUTONOMOUS_BACKLOG「V5.0 创作工作室」节与 docs/architecture/STUDIO_ARCHITECTURE.md。
3. **V4.1 续（按价值自选）**：a) 模型切换/运动/拆解/复位体验打磨（切台时序/动画手感）；b) 零件导航/弹出层滚动优化；c) 真机性能回归（headless 已覆盖，真机 Safari/Chrome 待设备）。
4. **smoke 全量补跑窗口**：OOM 环境阻塞定性后（free pages≈30MB、无头标签冻结于动态 import pending），JWST/radial/Wright/V5.0-studio 四切片的 smoke 均挂账待整机空闲（负载<5）一次性补跑。
5. 大批次授权提醒：**304+ 项改动未提交**（含 208 张缩略图 + V3 UI/Forge/MI 三大批次），git 基线 b6ccfaf——强建议尽早分批入库。

## 已知风险 / 注意

- 每轮改引擎后必跑 `npm run smoke`（当前 32 项全绿基线）+ `tools/v4-preview-verify.mjs`（产物回归）。
- 无头验证三坑（并行会话高负载下：frame detached=必须换新 browser 实例 / boot 放宽 300s / protocolTimeout 600s）+ 负载窗口轮询协议已固化在 tools/hud-verify.mjs 与记忆库 webgl-page-testing-env 第 8 条。
- **m4-carbine 是 188× 缩放补偿特殊设备**：flyToPart 怼进零件内部，不可作视觉验收目标；用 iphone-13（178KB 正常尺度）。
- 无头脚本三坑与接地治理经验全部在记忆库 forge-v3-engine 条目（device.id 守卫 / settle / raw bbox 不可信 / browser.close 挂起用文件日志）。
- 日厅 token 体系（`html[data-hall="day"]` 语义层）勿回退为硬编码；plinth 盘面「无数字」红线勿破。
- 用户指令：全程自主、不询问、不停；唯一硬停止=任务书 §0.2。
