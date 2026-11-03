# NEXT_SESSION · 下次会话最先执行

> 2026-11-02 深夜安全收尾时点。本轮 Goal：V4.0 MECHANICAL INTELLIGENCE（权威任务书 `docs/roadmap/GEWU_V4_MECHANICAL_INTELLIGENCE_AUTONOMOUS_EXECUTION.md`，604 行）。

## 现状快照

- **R9 设备页参考站驱动升级已收官（2026-11-03 续轮 4，本会话）**：底座雷达刻度盘（engine.js plinth 重建，双厅双材质）+ 设备页三区升级（顶栏规格 chip ×3 / rail 两行行结构 / infoPop 档案瓦片版式 / dock 拆解度读数 / coordAid↔ctxCard 互斥修复）。验证：**tools/hud-verify.mjs（新）12/12 ALL PASS**（参数化设备+独立实例重试护栏）+ smoke 26/28（2 失败定性环境非回归）+ build/lint 绿 + 5 张日夜截图目检。模式裁定 `docs/design/REFERENCE_STUDY_2026-11-03.md`，版式规范 `DESIGN_SYSTEM.md` §13，阶段档案 `docs/phases/PHASE_R9_*.md`。
- V3 UI/UX、V3.0 Forge（PHASE 0-8 三大标杆）、OPEN_MUSEUM 前置 Slice 1-4 全部验证收官（见 AUTONOMOUS_LOG 当日各节）。
- V4.0 MI 已完成：**①Mechanism Graph 首切片**——`src/forge/mech.js`（10 类关系 + validateMech）+ 锻造 V8 试点 `mech` 14 边（4 曲柄滑块 approx / 3 轴承支撑 exact / 7 固定）+ DeviceViewer 总览弹层「机构关系」面板（无数据/校验失败即隐藏）。验证工具 `tools/v4-mech-verify.mjs` EXIT 0。
- ~~全部改动未提交~~ **已入库**（并行会话于 2026-11-03 凌晨分批提交：V3 UI/Forge/MI/缩略图资产全部入库，达 119 台 39 品牌；此后又新增 Wankel 生成器/微波炉混合路径/NASA×4——注意本档为多会话接力档，以 git log 与 AUTONOMOUS_LOG 最新节为准）。

## 下一次最先执行（按序）

0. **R9 延伸（2026-11-03 续轮 4 新增，4b 已完成首轮延伸）**：a) ~~日厅大厅审计~~ **已完成（4b）**——V3 遗产质量确认无重构需求；实证 thumb 管线 plinth 本就隐藏（大厅无旧底座包袱）；移动端导航渐隐带修复+render-thumbs 重试护栏已入库（45fa721）。b) R9 语言向研究翼延伸（星图/编年/对比页头与档案瓦片化，REFERENCE_STUDY 语法页面级小审计先行）；c) R6 部件分组节头（设备数据 group 字段，逐台滚动）；d) hud-verify `--device action4` 旗舰断言 + smoke 全量复跑（负载 <5 窗口，含历史挂账 radial/JWST/Wright/V5.0-studio）。
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
