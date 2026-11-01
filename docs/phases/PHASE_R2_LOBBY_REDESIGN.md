# PHASE R2 · 大厅彻底重构（2026-10-31 第二轮）

> 改造前基线：`docs/phases/PHASE_D_HUB_REFACTOR.md` 版本；本轮全部重排。

## 门厅（首屏即海报）

- **馆导视条 `.hub-nav`**：左「拆解馆（衬线）+ TEARDOWN MUSEUM（mono）」馆印，右星图/编年/我的探索链接；下边线分隔。替代原 eyebrow+meta 双 mono 行。
- **门厅 `.hub-hero`**：`min-height:calc(100svh - 96px)` 海报式两栏——左列 VOL 眉题 → 衬线巨字「拆解馆」（`clamp(76px,11.5vw,172px)`，逐字 riseIn 入场）→ 副标 → 5 项馆藏统计（mono 数字白、标签弱化，从强调色大数降级为铭牌读数）；右列**墙面展台**撑满门厅高（`min-height:min(60svh,580px)`），双辉光阴影营造单束冷光，`NO.002` 展签 chip、轮播点、衬线展品名 + mono 品牌·年代、开始拆解 CTA。
- 移动端 ≤860px：展台先行单列，馆名 `clamp(64px,19vw,110px)`。

## 常设展分区

- 新 `.hub-sect` 分区头：衬线「常设展」+ mono `COLLECTION · 103 件展品 · 815 部件`。
- 统计条从独立横带并入门厅（原位置删除，smoke `.stat`×5 锚点保留在 hero 内）。

## 展签卡

- `NO.001` 编号 chip 移至缩略图**左上**（与展台同位；修复与收藏星标的右上重叠——浏览器实测发现）。
- 品牌行改 `DJI · 2024`（mono，含年代，替代独立 era 徽标，减一层徽标噪音）。
- 展品名改衬线 20px。hover 三件套（抬升/边框/箭头）不变。

## 浏览器实机验证（含交互）

`tools/ui-interact-lobby.mjs`：hover 卡片 ✓ / 品牌展开「其余 26 个」✓ / 探索抽屉打开+Esc 关闭 ✓ / 搜索 "drone" → 54 张卡+清空钮 ✓ / 点击展台进设备 → 返回大厅 103 卡 ✓，全程零页面错误。
截图：`d2-lobby-*`（首屏/滚动/移动）、`r2-lobby-card-hover`、`r2-lobby-drawer`、`r2-lobby-search`。

## 体验迭代记录（边调边验）

1. NO. 编号与星标重叠 → 移左上；
2. 抽屉内容少却占满全高 → `bottom:auto; max-height`；
3. 门厅初版留白偏空 → 展台 min-height 拉满 + 统计并入左列。
