# DESIGN SKILLS · AI 设计能力组合

> 2026-10-31 核实。原则：**最少 skill、职责互斥**；官方/社区身份必须如实标注。

## 1. 采用组合（三个）

### 1.1 工作区 `.zcode/skills/frontend-skill`（本地，已有）
- 用途：新页面/大改版时的构图与动效基线（克制构图、图片主导、避免 AI 味卡片墙）。
- 时机：GalleryHub 改版、新路由页、宣传性界面。

### 1.2 pbakaus/impeccable（社区 · Apache-2.0 · 明确支持 Trae/Claude Code/Cursor 等）
- 用途：**审查主力**。`critique`（打分式 UX 评审）+ `audit`（62 条确定性规则，无需 LLM）。
- **状态：已安装（2026-10-31）**——`.zcode/skills/impeccable/`（v4.8.0，58 文件，含上游 LICENSE/NOTICE；引擎二进制首次运行已缓存至 `~/.impeccable/`，无需 Node）。基线扫描：`detect src/` 122 文件 0 反模式（1 条建议：--ease-spring 弹性缓动，MOTION_GUIDELINES 定位为点缀用，暂保留）。
- 时机：任何 UI 面板/样式改动合入前；每 3-5 个切片做一次全量 audit。
- 来源：https://github.com/pbakaus/impeccable （由 Anthropic frontend-design 衍生）

### 1.3 anthropics/skills · frontend-design（Anthropic 官方 · Apache-2.0）
- 用途：生成新界面时的设计品味基线（与 1.1 互补：1.1 偏"构图"，1.3 偏"品味与实现细节"）。
- **状态：已安装（2026-10-31）**——`.zcode/skills/frontend-design/`（SKILL.md + LICENSE.txt，原样拷贝自 anthropics/skills）。
- 来源：https://github.com/anthropics/skills （skills/frontend-design）

## 2. 参考不安装（原则人工摘录）

**dickwu/apple-design-skill**（社区项目，页面自述 "not affiliated with or endorsed by Apple"；2.4k★）
- 内容：123 个 HIG 页面 + 策划版 liquid-glass.md + `scripts/pull-hig.mjs`。
- **不安装原因**：无标准 OSS 许可证（"provided as they are"），内含 Apple 版权 HIG 文本。
- **用法**：需要 HIG 判断时，其核心原则已摘录进 `docs/DESIGN_QA.md` §2；如需全文自行访问官方 https://developer.apple.com/design/human-interface-guidelines （Materials / Liquid Glass 文档 URL 已核实，见 MUSEUM-ROADMAP §2.2）。
- ⚠️ 对外表述禁令：不得称其为"Apple 官方 Skill"；HIG 是原生平台规范，Web 项目只取原则层。

## 3. 明确不装（防重复）

| Skill | 理由 |
|---|---|
| vercel-labs/agent-skills 的 web-design-guidelines | 与 impeccable audit 功能重叠（react-* 子集与技术栈不符，MIT 许可本身无问题） |
| emilkowalski/skills | MIT 许可；但 React/RN 导向 + 动画理念与本项目 MOTION_GUIDELINES 重叠 |
| Delanyo32/ux-skill | **无许可证** + 3 commits 不成熟 |
| GuidanceStudio/uxui-audit-skill | MIT 但 0★ 早期项目，截图审计流程已由 web-gui-tester 覆盖 |
| 各类 Three.js skill | 未核实到可信仓库；本项目 3D 经验沉淀在 `.zcode/skills/convert-asset`、`.zcode/skills/add-device` 与 `docs/3D_EXPERIENCE_GUIDELINES.md` |

## 4. 工作流（谁在什么时候做什么）

```
新页面/新路由      → frontend-skill + frontend-design 生成基线 → impeccable critique 复审
现有 UI 修改       → 直接改 → impeccable audit（改动文件范围）→ DESIGN_QA 清单
视觉风格争议       → 先查 DESIGN_SYSTEM token；token 没有的先补 token 再写样式
3D 交互争议        → 查 3D_EXPERIENCE_GUIDELINES；不套用 Web UI 直觉
移动端问题         → 390×844 实测 + DESIGN_QA §3 移动清单
```

## 5. Skill 格式备注

SKILL.md（frontmatter name/description）为开放格式（agentskills.io 规范，anthropics/skills 同款）；跨工具（Claude Code/Cursor/Codex/Trae）兼容性以各 skill README 声明为准——impeccable README 明确列出 Trae 支持；其余未逐项验证不打包票。
