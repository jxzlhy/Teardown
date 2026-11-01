# PHASE B · 统一设计系统（2026-10-31）

> 依据 `UI_UX_REFACTOR_SPEC.md` §UI阶段B、§三。

## 设计方向（Visual Thesis）

**深空冷色档案库里的「活体机械标本」**——界面是展馆的照明与铭牌，设备模型永远是主角。继承项目既有「编辑部式科技档案馆」语言（该语言已成熟且辨识度高），本次做**系统化收口**而非推倒：补 token 缺口、消硬编码、写明使用边界。

## 交付物

| 文件 | 内容 |
| --- | --- |
| `docs/design/DESIGN_SYSTEM.md` | 规范主文档：视觉定位 / 颜色·字体·间距·玻璃·动效·焦点·z-index token / 组件准入 / 禁止事项 / 换肤流程 |
| `docs/design/UI_GUIDELINES.md` | 组件规范（Button/Icon/Card/Panel/Modal/Drawer/Chip/Input/状态反馈）+ 页面组织 + 文案口径 + eyebrow 使用边界 |
| `docs/design/INTERACTION_GUIDELINES.md` | 动效原则 / 面板进出时长 / 键盘地图 / 无障碍约定 / 3D 交互边界 / 移动端专项 |
| `src/style.css` `:root` | 新增状态色 token：`--ok: #4ce88a`、`--warn: #f0b429`、`--err: #ff7d7d`、`--tech: #c792ea`（技术条目专属） |

## Token 决策记录

- **不新建 tokens.css**：token 唯一来源保持 `style.css :root`（避免双源），文档与代码一一对应。
- 状态色从散落硬编码（`#4ce88a`/`#f0b429`/`#e8b45a`×2/`#c792ea`×4）归一为 4 个 token；`--err` 为新增预留（错误面板/toast 语义色）。
- `--tech` 紫色定为知识/技术条目专属色，禁作装饰（GraphView Canvas 内色值为同值常量，注释标注）。

## 验证

- `npm run build` ✓ 3.10s；全站截图无视觉回归（`docs/design/screenshots/d2-*.png`）。
- 旧 `docs/DESIGN_SYSTEM.md` 顶部加迁移横幅指向新主文档，历史内容保留。
