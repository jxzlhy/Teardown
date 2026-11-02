# 格物馆 V4.0 · OPEN MUSEUM 路线图（自主编制）

> 2026-11-02 由 ZCode 依据总则 §2 自主编制（用户指示"做完然后再进行4.0"）。
> **状态声明：本文为 Agent 自主规划的路线图；若用户后续下达 V4.0 权威任务书，以其为准并回填本档。**
> 上游收官：V3 UI/UX 重构（docs/ui-ux/v3/）与 V3.0 MECHANICAL FORGE（docs/roadmap/GEWU_V3_MECHANICAL_FORGE_AUTONOMOUS_EXECUTION.md）PHASE 0-8 已全部验证收官（见 AUTONOMOUS_LOG 2026-11-02 各节）。

## 定位

V3 完成了"看得好、玩得深"（双厅语义体系 + 六层底座 + 程序化创造引擎）。V4.0 解决"**发布得出、持续长大**"：
公开可部署、内容资产治理闭环、访问性能有预算门槛。

## Slice 1 · 缩略图日厅管线（V3 遗留 F2 根除，最高优先）

- 问题：104 台卡片缩略图仅夜厅渲染，日厅卡片"上图下白"拼贴感（V3_CURRENT_STATE_AUDIT F2）。
- 方案：`src/engine/previewScene.js` 增加日厅布光参数集（与 `setHallMode` 的 DAY 配置同源）；`tools/render-thumbs.mjs` 产出 `-day` 变体；大厅按 `data-hall` 切换 `thumb` 资源（glbCache 同款缓存键）。
- **状态：已完成（2026-11-02，104 台日变体全量上线，终验通过）**。原验收：随机 12 台双厅卡片截图对比 + 大厅日厅整屏（拼贴感消除）+ 产物体积核对（每日均 ≤ 60KB 目标）。
- 风险：管线时长（104×2 渲染）；一次性构建任务，可后台分批。

## Slice 2 · 接地全量治理 **【已完成 2026-11-02】**

- `tools/ground-audit.mjs` 全量 104/104 读数（raw/robust 双指标 + 杂点离群清单）→ 工件 `docs/ui-ux/v4-ground-audit.json`。
- 实锤缺陷类：官方 GLB 远处杂点网格（s22-ultra speaker 跨 14u）令展台沉入地下 → 引擎接地基准改**网格级稳健下沿**（最低四分位中位数）+ **落地式钳制**（展台永不高于地面）——30 台落地式设备自动恢复正确形态，零逐台配置。
- 目检：s22-ultra 隐没立地 ✓ / action4 悬浮接底 ✓ / grand-piano 腿底接触 ✓；smoke 全过。

## Slice 3 · 发布就绪（Release Ready）**【已完成 2026-11-02】**

- `tools/v4-preview-verify.mjs`：vite preview 产物级回归 EXIT 0（6 资产 200 + 5 深链启动 + 0 控制台错误）；
- index.html：description 更新至 104 台 + og 三标签 + theme-color；
- AUTONOMOUS_METRICS 增 V4.0 基线表（体积门槛/回归门槛/缩略图预算）。

## Slice 4 · Forge 预设库开放 **【已完成 2026-11-02】**

- 配置 JSON 导入/导出（`gewu-forge/1` 格式，fmt+生成器白名单校验）：`⧉ 配置` 复制 + 「05 · 导入配置」面板，同种子确定性复现（sameId 断言）。
- README「机械锻造所」功能节：GLB 命名规约、配置分享口径、概念示意声明。
- 验证：forge-share-verify.mjs 全绿 + smoke 全过。

## Slice 5 · PHASE 9 持续项（滚动）

- 行星轮啮合相位严格化（自转-公转速比推导）、新生成器候选（转子发动机/差速器/变速箱）、`device.groundKeep` 治理。

## 红线（沿袭）

不破坏引擎核心与既有业务；数量口径以 manifest 为准；本地优先零后端；历史文档不覆盖。
