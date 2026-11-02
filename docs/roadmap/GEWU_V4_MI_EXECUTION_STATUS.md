# V4.0 MECHANICAL INTELLIGENCE · 执行状态档（收尾清点）

> 2026-11-02。对照权威任务书 §3 六大系统的完成度清点；证据全部为可复跑工具 + 真实浏览器验证。
> 本档为执行状态记录（自建），不改动用户任务书原文。

## 六系统清点

| # | 系统 | 状态 | 证据 |
| --- | --- | --- | --- |
| ① | Mechanism Graph | **✅ 已完成** | `src/forge/mech.js`（10 类关系+validateMech）；mech 覆盖 6 台（锻造 V8 14 边 / FORGE-99 8 边含 visual_only / 真实 v8-engine 7 边含 belt_drive 首战 / jet 4 边 / radial 2 边 / 涡扇 8 边 N1N2）；总览「机构关系」面板 + lint-mech 入 `lint:devices` 链；`tools/v4-mech-verify.mjs` EXIT 0 |
| ② | Kinematics & Motion | **✅ 已完成** | `state.demoClock` 统一时钟（变速无相位跳变，实测 1.017×/2.000×）+ `setDemoSpeed` API + 详情卡曲轴转角精确显示（转角-时钟一致性 298.2°/297.9°）+ 四缸相位芯片；`tools/v4-kinematics-verify.mjs` EXIT 0 |
| ③ | Interactive Exploration | **✅ 大体覆盖** | 既有能力（隔离/剖切/X 光/聚焦/标签/深链）+ 新增相连关系 mini 列表（对端聚焦）+ 移动端三面板限高滚动；遗留：隐藏/显示单独开关（隔离已覆盖主诉求） |
| ④ | Operating Principles | **✅ 已完成** | 锻造 V8 工作循环七步 Tour（{id,note} 复用），曲轴步自动联动演示，讲解词概念口径；`tools/v4-tour-verify.mjs` EXIT 0 |
| ⑤ | Model QA & Diagnostics | **✅ 已完成** | `src/forge/qa.js` 五类×四级 + 引擎 `runQA` + 总览诊断区 + lint-mech；干净件 0/0/0、注入缺陷捕获、真实 v8-engine 诚实报 1W1I；`tools/v4-qa-verify.mjs` EXIT 0 |
| ⑥ | Workbench UI/UX | **✅ 大体覆盖** | 运动状态块/机构面板/诊断区/相连关系四面板（全部 V3 token 消费、双厅适配、移动端限高）；遗留：更多工作台模式（§9.2 VIEW/EXPLORE 模式切换）未做 |

## 试点跑通确认（§四 要求）

锻造 V8 作为代表性模型跑通完整链路：生成（参数+种子）→ mech 关系 → 统一时钟联动演示（曲轴+活塞+连杆）→ 转角精确显示 → 七步工作循环导览 → QA 诊断 → GLB 导出 → 配置分享复现。随后推广至涡扇/FORGE-99/真实 v8-engine/jet/radial。

## 真实性红线执行

- kinematic 三级标注（exact/approx/visual）贯穿；连杆摆动平动近似、belt_drive 速比未标定、磁悬浮/能量导管虚构层均显式标注。
- 行星轮系速比由齿数解析推导（ω_c/ω_s=0.269=18/(18+49) 实测命中），替换手调值。
- 无 CFD/热力学声明；无性能参数虚构；不进 MODEL_INVENTORY。

## 遗留（转入后续滚动）

- mech 覆盖滚动：其余有演示设备逐台手写（radial 已做；orrery/hubble 等无轮系关系设备按需）。
- 工作台 §9.2 VIEW/EXPLORE 模式切换（当前以 dock 工具组形式存在，未做模式化包装）。
- 部件隐藏/显示独立开关（isolate 之外的细粒度）。

## 产物级回归（收尾门禁）

`tools/v4-preview-verify.mjs` EXIT 0（6 资产 200 + 5 深链启动 + 0 控制台错误）；`npm run smoke` 32 项全过；`npm run lint:devices`（含 lint-mech）全过；`npm run build` 2.65s。

---

## V4.1 首切片（2026-11-03 滚动）

- 照明审计：`tools/v4-light-audit.mjs`（8 设备×双厅，全幅+模型区双口径）→ 工件 `docs/ui-ux/v4-light-audit.json`。结论：0 过曝；模型区全部可读；唯一超标 s22-ultra 属黑色玻璃材质物理属性（非缺陷）。
- 引擎新增 `device.lightBoost`（applyHallFrame 乘径 + finalize 补挂），s22-ultra 试配 1.3（实测 +2，ACES 压缩下线性补光收益有限）；机制留作逐台治理工具。
