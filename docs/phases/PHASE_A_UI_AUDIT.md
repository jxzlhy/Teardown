# PHASE A · UI 设计审计与问题清单（2026-10-31）

> 依据 `docs/design/UI_UX_REFACTOR_SPEC.md` §UI阶段A。完整审计结果见 **`docs/design/UI_UX_AUDIT.md`**（唯一权威问题清单），本文为阶段档案索引。

## 执行内容

1. **Skill 通读**（完整 SKILL.md，非摘要）：
   - `frontend-design`（`.zcode/skills/frontend-design/`，Anthropic 官方）
   - `impeccable`（`.zcode/skills/impeccable/`，含 `impeccable context` 运行记录：NO_PRODUCT_MD / SCOPED_EXISTING_ALLOWED 裁决）
   - `frontend-skill`（`/Users/admin/.zcode/skills/frontend-skill/`）
   - 三者能力互补、无硬冲突；eyebrow 体例张力裁决记录于 UI_GUIDELINES §4。
2. **源码走查**：App.vue / main.js / style.css(814) / hud.css(127) / GalleryHub(292) / DeviceViewer(793) / GraphView / TimelineView / CompareView。
3. **真实浏览器取证**：puppeteer-core（`--enable-unsafe-swiftshader`），17 张截图存 `docs/design/screenshots/`；覆盖大厅/工作空间/星图/编年/对比 × 桌面 1440×900、笔电 1280×720、移动 390×844；全程 console 零报错。
4. **功能基线**：`npm run build` ✓ 2.76s。

## 产出

- 问题清单 16 项（P0×3 / P1×6 / P2×7），每项带文件定位与方案，见 UI_UX_AUDIT.md §3。
- 不破坏红线清单（引擎能力/数据口径/性能/署名），见 UI_UX_AUDIT.md §4。
- 取证脚本：`tools/ui-audit-shots.mjs`、`tools/ui-audit-shots2.mjs`（只读）。
