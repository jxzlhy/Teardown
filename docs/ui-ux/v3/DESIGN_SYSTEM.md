# V3 DESIGN SYSTEM · 格物馆双厅语义体系（MUSEUM OF MACHINES V3）

> 2026-11-02 定稿。上游依据：`MUSEUM_OF_MACHINES_V3_UI_UX_REDESIGN_MASTER_PLAN.md` + `V3_VISUAL_DIRECTION_PROPOSALS.md`（方向 A+B 融合 + 夜厅 C 精修，2026-11-02 裁定）。
> 代码唯一事实源：`src/style.css`。本文记录语义与规则；改 token 必须同步本文。
> 与 `docs/design/DESIGN_SYSTEM.md`（V2 规范主文档）关系：名字/数据/操作三层字体、玻璃三级、动效 token、z-index 表、组件准入规则**继续有效**；本文在其上叠加**双厅语义层**并接管日厅色值。

## 1. 双厅架构（V3 核心）

```
:root                      夜厅取值（默认）——深夜展馆 C 精修
html[data-hall="day"]      日厅取值 ——A 暖白画廊 × B 精密工程语汇
```

- 组件**只消费语义 token**，禁止在组件规则里写死双厅色值（V2 的 ~90 条 `data-hall` 组件硬编码已于 2026-11-02 全量 token 化清零）。
- 引擎光照/材质由 `setHallMode` 渐变（不重载模型、不重建场景）；CSS 只管壳层。
- 研究翼（星图/编年/对比）恒夜厅，不消费日厅值。

## 2. 夜厅（Immersive Dark · C 精修）

| Token | 值 | 备注 |
| --- | --- | --- |
| `--bg-0/1/2` | `#020408 / #040810 / #0c141f` | V3 加深一档，三层纵深 |
| `--txt-1/·/2/3` | `#f2f7fc / #dfe8f2 / #c9d6e4 / #7d8fa3` | 不变 |
| `--acc` | `#45e0ff`（设备可覆写） | 不变 |
| 导视 hairline | `rgba(196,164,96,.2)` | **暖金**（V3·C），别处仍冷灰 |

## 3. 日厅（Daylight Gallery · A+B 融合）

| Token | 值 | 语义 | 对比度（bg-0 上） |
| --- | --- | --- | --- |
| `--bg-0/1/2` | `#f4f1ea / #f6f3ec / #e9e4d8` | 象牙纸面三级 | — |
| `--txt-1` | `#211d15` | 标题/展品名 | 14.9:1 |
| `--txt` | `#3a3428` | 正文 | 10.5:1 |
| `--txt-2` | `#57503f` | 次级 | 7.0:1 |
| `--txt-3`=`--txt-dim` | `#6f6553` | 弱化/标注 | 5.2:1 |
| `--acc` | `#0f766e` | 深青绿（白底可读；设备换肤仍覆写 `--acc`，梯度自动派生） | 4.9:1 |
| `--panel-bg`/`--glass` | `rgba(253,251,246,.9)` | 暖白面板 | — |
| `--surface-hi` | `rgba(255,253,248,.96)` | 版画卡面/浮层 | — |
| `--surface-2` | `#ece7db` | 图底/次级面 | — |
| `--surface-stage` | `#e7e1d2` | 焦点展台 | — |
| `--wash-1/2` | `rgba(95,80,55,.05/.1)` | 中性洗色 | — |
| `--hairline`/`--hairline-strong` | `rgba(110,95,70,.2/.34)` | 暖色细线两级 | — |

- **A（基调）**：纯纸面无光斑（日厅 `hub::before` 关闭）、照片版画卡片（白装裱 + 暖 hairline + 分层微阴影 + 4px 圆角）、胶囊搜索/胶囊 chip、暖砂展台。
- **B（仅工具性表面）**：焦点展台同心刻度环（`hub-stage::before` repeating-radial，opacity .45）。不再向下扩散；如新增 B 语汇仅限刻度/角标记类结构线。
- 日厅禁区：纯白 #fff 大面积铺底、冷蓝灰硬编码（V2 残留已清零）、辉光、磨砂玻璃叠层。

## 4. 双厅共享规则（不变项）

- 字体三层（`--name` 黑体 Heavy 名字层 / `--mono` 数据层 / `--sans` 操作层）。
- 三级玻璃 G1-G3 只在夜厅静态悬浮件；日厅面板用不透明暖白（`--panel-bg`），日厅禁用 backdrop blur（性能与纸面气质双原因）。
- 动效 token、focus-visible、触控 44px、z-index 层级表照旧。
- 状态色 `--ok/--warn/--err/--tech` 双厅共用（日厅靠 `--warn` 等原值在浅底仍可读）。

## 5. 换肤（设备接入）

不变：设备配置 `accent` → 引擎写 `--acc` → `--acc-08/16` 梯度自动派生。日厅新增要求：accent 在 `#f4f1ea` 上 ≥4.5:1 才可用作文字色（引擎 `setHallMode` 已按厅切换日/夜 accent 的设备需核查此项，默认日厅用加深派生）。

## 6. 工具链与审查

- 合入门槛：`npm run build` + `npm run smoke` + `impeccable detect src/`（0 反模式基线）+ 双厅四点截图（大厅 top/grid × 日夜）。
- V3 截图证据：`docs/ui-ux/v3/references/`（baseline / directions / v3-tokens 三组）。
