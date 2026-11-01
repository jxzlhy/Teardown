# PHASE D · 大厅（GalleryHub）重构（2026-10-31）

> 依据 `UI_UX_REFACTOR_SPEC.md` §UI阶段D。改造前取证：`lobby-*.png`；改造后：`d2-lobby-*.png`。

## 筛选区信息架构重排（P1-2）

旧结构：「快捷收藏」孤行 + 38 品牌 chips 墙 + 37 类型 chips + 右侧孤悬搜索（frontend-skill「chip soup」）。

新结构（`GalleryHub.vue` 模板重排）：
1. **搜索为第一入口**：主行（吸顶）= 搜索框（主宽，带清空钮）+ 视图切换 + 收藏 chip + （移动端）筛选钮；
2. **类型为主轴**、品牌次之（筛选组随页滚动，不再全量吸顶）；
3. **品牌折叠**：默认 12 个 + 「展开其余 N 个」；品牌选中即自动生效；
4. 激活筛选汇总为「✕ 清除全部筛选」chip（`activeFilters` 计数驱动）。

### 吸顶机制（关键实现）

- `.filter-main` 为 `.hub` **直接子元素** + `position:sticky`（特异性 `.hub .filter-main` 越过 `.hub > *` 的 relative）；筛选组为兄弟节点随页滚动。
- 教训记录：最初把 sticky 行嵌在 `.hub-filter` 短父容器内 → sticky 无位移空间失效；DOM 提升后修复（两次截图对比确认）。
- 移动端（≤860px）：展开态取消吸顶+去毛玻璃（防占满整屏）；收合态主行整页吸顶。

## 移动端收合（P0-2）

- `isNarrow`（matchMedia 860px，监听卸载）驱动：默认只显示一行「搜索 / 视图 / ★收藏 / 筛选▾」；「筛选」按钮带激活数徽标（`.ft-count`），展开显示类型+品牌组。
- 修复前：吸顶筛选墙占满 390×844 整屏、网格不可达（`lobby-mobile-grid.png`）；修复后网格可达、搜索常驻（`d2-lobby-mobile-*.png`）。

## 移动端顶栏折行（P0-3）

≤860px `.hub-top` 改单列：eyebrow 一行 nowrap，meta 链接 flex 换行到下方（`d2-lobby-mobile-top.png`）。

## 统计条与文案（P1-5）

- 移除「WEBGL 实时渲染」工程词统计（页脚本有 ENGINE 行）；6→5 项。
- 「我的探索 · ★0 足迹0」→ 0 值不展示计数（`我的探索`；非 0 才显示 `· ★n / · 足迹n`）。
- smoke 断言「统计 6 项」→「5 项」同步更新（有意变更，非回归）。

## Hero 展台氛围（P1-3）

- `.st-img` 提亮 `brightness(1.18) saturate(1.12)`；底部遮罩 82%→70% 且起点 40%→55%；
- 「开始拆解 →」CTA 从低对比描边改为 accent 淡底+亮字，hover 辉光。

## 验证

- `npm run build` ✓；`npm run smoke` 28/28 ✓（统计断言更新后）。
- 截图对：lobby-desktop-top / desktop-scrolled（吸顶搜索行生效）/ mobile-top / mobile-collapsed-scroll / mobile-filter-open。
