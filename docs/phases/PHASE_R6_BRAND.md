# PHASE R6 · 馆牌重构：「拆解馆」→「格物馆」（2026-10-31 第二轮追加）

> 用户反馈：项目内容已超出「拆解」单一动作，slogan 不再匹配现阶段。决策与完整理由见 `docs/design/BRAND.md` + `docs/DECISIONS.md` D-20261031-08。

## 语义升维

拆解 = 入口动作；原理库 / 技术编年（公元前 150 年—2026）/ 知识星图 / 代际对比 = 致知。「格物致知」一词正好覆盖全链路：**拆开机器是格物，看懂技术是致知**。馆名从动作升维到目的；「拆解」保留为全站核心交互动词（拆解按钮、拆解度、开始拆解、试试一键拆解）。

## 改动落点（产品表面）

| 位置 | 旧 | 新 |
| --- | --- | --- |
| `<title>` / meta description | DJI 拆解馆 · 3.0 | 格物馆 · MUSEUM OF MACHINES（main.js 从 brand.js 动态覆写） |
| 导视条馆印 | 拆解馆 TEARDOWN MUSEUM | 格物馆 MUSEUM OF MACHINES |
| 门厅巨字 | 拆 / 解 / 馆 | 格 / 物 / 馆（逐字入场动画沿用） |
| 主/副标语 | 把每一台机器…／选择任意设备… | 把每一台机器，拆到最后一颗螺丝。／**格一物，致一知——看清技术的来龙去脉。** |
| 页脚 | © 2026 TEARDOWN LAB | © 2026 格物馆 MUSEUM OF MACHINES |
| 设备屏幕通知卡（_kit/screen.js） | 拆解馆 | 格物馆（「试试一键拆解」保留） |
| 返回文案 | 返回大厅（aria + 错误面板按钮） | 返回门厅 |
| package.json description / README / AGENTS 头部 / AI_HANDOFF / DESIGN_SYSTEM 头部 | 拆解馆 | 格物馆（原拆解馆）标注沿革 |

**品牌单一事实源**：`src/lib/brand.js`（name/nameChars/en/motto/tagline/tagline2），GalleryHub 与 main.js 从中引用——后续再更名只改一个文件。

## 不改写历史

AUTONOMOUS_LOG、PHASE_A–R5 档案、MUSEUM-ROADMAP 等历史文档中的「拆解馆」保留原文。

## 验证

- 浏览器实测：title / 门厅巨字 / 馆印 / 页脚 / 展签卡无「拆解馆」残留；设备屏幕通知卡显示「格物馆」（选一台用 screen.js 的手机型设备实拍）。
- `npm run build` ✓ / `npm run smoke` 28/28 ✓（品牌文案不在断言锚点中，仅 hub-sub 几何断言与拆解按钮文案无关字段）。
- 残留扫描：`grep -rn "拆解馆" src/ index.html` 应为 0（历史文档除外）。
