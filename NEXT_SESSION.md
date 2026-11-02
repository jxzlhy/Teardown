# NEXT_SESSION · 下次会话最先执行

> 2026-11-02 深夜安全收尾时点。本轮 Goal：V4.0 MECHANICAL INTELLIGENCE（权威任务书 `docs/roadmap/GEWU_V4_MECHANICAL_INTELLIGENCE_AUTONOMOUS_EXECUTION.md`，604 行）。

## 现状快照

- V3 UI/UX、V3.0 Forge（PHASE 0-8 三大标杆）、OPEN_MUSEUM 前置 Slice 1-4 全部验证收官（见 AUTONOMOUS_LOG 当日各节）。
- V4.0 MI 已完成：**①Mechanism Graph 首切片**——`src/forge/mech.js`（10 类关系 + validateMech）+ 锻造 V8 试点 `mech` 14 边（4 曲柄滑块 approx / 3 轴承支撑 exact / 7 固定）+ DeviceViewer 总览弹层「机构关系」面板（无数据/校验失败即隐藏）。验证工具 `tools/v4-mech-verify.mjs` EXIT 0。
- 全部改动**未提交**（工作区含 V3 UI + Forge + V4.0 大批修改，等用户授权入库）。

## 下一次最先执行（按序）

1. ~~V4.0 MI 全系统 + 收尾清点 + V4.1 照明治理循环 + 性能/兼容回归~~ **收官**（执行状态档 GEWU_V4_MI_EXECUTION_STATUS.md / v4-light-audit / v4-viewport-sweep EXIT 0 / fps-probe quality 修复 / forge nav 修正；**smoke 负载抖动已定案=环境负载非回归**——负载曲线 24→6.4 与通过/失败严格相关，load<8 单跑全过，规程入记忆库）。
2. **V4.1 续（按价值自选）**：a) 模型切换/运动/拆解/复位体验打磨（切台时序/动画手感）；b) 零件导航/弹出层滚动优化；c) 真机性能回归（headless 已覆盖，真机 Safari/Chrome 待设备）。
3. 大批次授权提醒：**304+ 项改动未提交**（含 208 张缩略图 + V3 UI/Forge/MI 三大批次），git 基线 b6ccfaf——强建议尽早分批入库。

## 已知风险 / 注意

- 每轮改引擎后必跑 `npm run smoke`（当前 32 项全绿基线）+ `tools/v4-preview-verify.mjs`（产物回归）。
- 无头脚本三坑与接地治理经验全部在记忆库 forge-v3-engine 条目（device.id 守卫 / settle / raw bbox 不可信 / browser.close 挂起用文件日志）。
- 日厅 token 体系（`html[data-hall="day"]` 语义层）勿回退为硬编码。
- 用户指令：全程自主、不询问、不停；唯一硬停止=任务书 §0.2。
