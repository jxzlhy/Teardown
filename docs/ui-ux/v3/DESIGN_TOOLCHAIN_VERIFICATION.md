# DESIGN TOOLCHAIN VERIFICATION · V3 四件套接入记录

> 2026-11-02。依据 `docs/ui-ux/v3/MUSEUM_OF_MACHINES_V3_UI_UX_REDESIGN_MASTER_PLAN.md` §04/§18.7。
> 原则：只有实际调用过的能力才标记"已验证"；未验证项如实标注。

## 1. 接入清单

| 工具 | 版本 | 安装方式 | 安装路径 | ZCode 识别 |
| --- | --- | --- | --- | --- |
| UI/UX Pro Max | 当前 npm latest（2026-11-02） | `npx -y ui-ux-pro-max-cli init --ai universal` + 手工 symlink | `.agents/skills/ui-ux-pro-max/`（含 8 skill：ui-ux-pro-max/design/design-system/brand/slides/banner-design/ui-styling + 数据 CSV） | 符号链接入 `.zcode/skills/` ✓ |
| UI Craft | 当前 repo main（2026-11-02） | `npx -y skills add educlopez/ui-craft -y`（自动 symlink 到 ZCode） | `.agents/skills/ui-craft/` + 命令族（craft/critique/polish/animate/audit/tokens/brief/remember/finalize/harden 等 30 项） | 安装器自动 symlink ✓ |
| Oil UI | 0.29.1 | `npx -y skills add oil-oil/oil-ui -y` | `.agents/skills/oil-ui/` | 安装器自动 symlink ✓ |
| Impeccable | 4.8.0 | 已于 2026-10-31 安装（见 `docs/DESIGN_SKILLS.md`） | `.zcode/skills/impeccable/` | ✓ |

### 兼容性备注（如实记录）

1. **UI/UX Pro Max CLI 当前版本不支持 `--ai zcode`**（有效值列表实测无 zcode；任务书 §4.3 所述官方支持与当前发布版不符）。采用 `--ai universal`（`.agents/skills/` 布局）+ symlink 进 `.zcode/skills/`，ZCode 可正常读取 SKILL.md 与数据。若后续 CLI 新增 zcode 类型，可 `uipro update` 重装。
2. **UI Craft 完整 CLI 的 MCP 质量门禁 / Review Agents / Design Memory 未接入**——按任务书 §4.4 预期，仅接入通用 Agent Skill 层（指令文件）。rung 3（Enforce/CI 门禁）不可用，rung 0-2 可用。
3. **Oil UI** 为提示词流程型 skill（中文，含可选 Python 风格对比页生成器，需 Python 3.10+ 本机标准库，产物为本地 HTML，无云端依赖，符合 §2.4 本地优先约束）。
4. Skill 指令重叠裁决：impeccable 与 ui-craft 的 audit/critique/polish 命令名重叠 → **审查一律用 impeccable（已验证的确定性引擎），ui-craft 用于反模板规则与设计工程流程**；与 `docs/DESIGN_SKILLS.md` 职责分工一致，V3 期间四工具分工见下 §3。
5. 上述 skill 在**安装后的首个会话**才会进入 ZCode 技能列表；当前会话内按 SKILL.md 原文直接遵循执行（等效调用）。

## 2. 真实调用记录

| 日期 | 工具 | 调用 | 结果 |
| --- | --- | --- | --- |
| 2026-11-02 | UI/UX Pro Max | `python3 .agents/skills/ui-ux-pro-max/scripts/search.py "digital museum 3d product exhibition dark gallery precision" --design-system -p "Museum of Machines"` | ✅ 返回完整设计系统建议：Scroll-Triggered Storytelling 版式 / Minimalism & Swiss Style / Gallery 黑白灰 + 中性描边 / Space Grotesk+Inter / 反模式清单与交付 checklist——与任务书方向 A+B 吻合 |
| 2026-11-02 | Impeccable | `scripts/impeccable context`；`scripts/impeccable detect src/` | ✅ context：NO_PRODUCT_MD + SCOPED_EXISTING_ALLOWED（既有实现即权威）；detect：154 文件 0 反模式，1 条 advisory（--ease-spring 弹性缓动，沿用 10-31 结论：点缀用保留） |
| 2026-11-02 | UI Craft | SKILL.md 全文读取 + Ladder/Rung 模型确认 | ✅ 指令型可用；`/brief /tokens /remember`（rung 2 持久化）适配本项目 docs/design 体系；rung 3 不可用（见上） |
| 2026-11-02 | Oil UI | SKILL.md 读取（v0.29.1） | ✅ 已装；多方向同屏对比页生成器待 Phase 2 实际使用后回填本表 |

## 3. V3 工作流分工（§4.7 落地）

```
设计系统决策 / Token 体系      → UI/UX Pro Max（search.py 数据检索 + reasoning）
多方向视觉探索 / 同屏对比      → Oil UI（真实页面三方向）+ frontend-design（品味基线）
组件工程 / 反模板规则          → UI Craft（anti-slop、discovery、四态完备）
合入前审查 / 全量扫描          → Impeccable（critique + detect，每 3-5 切片一次全量）
冲突裁决依据                   → docs/ui-ux/v3/DESIGN_SYSTEM.md（V3 版，Phase 3 产出）
```

## 4. 维护方式

- 更新：`npx -y skills update`（Oil UI/UI Craft）；`npx -y ui-ux-pro-max-cli update`；impeccable 手动替换 `.zcode/skills/impeccable/`。
- 卸载：`uipro uninstall`；`npx -y skills remove`。
- 新会话验证：ZCode 技能列表应出现 `ui-ux-pro-max`、`ui-craft`、`oil-ui`（若缺失检查 `.zcode/skills/` symlink）。
