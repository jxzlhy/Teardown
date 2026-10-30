# DESIGN QA · 设计验收清单

> 每轮涉及 UI/3D 呈现的改动，合入前按本清单执行。证据（截图/断言输出）随 AUTONOMOUS_LOG 留档。

## 1. 通用门槛（对应 AGENTS §7，命令强制）

- [ ] `npm run build` 通过；体积对比记录（`dist` 与 three chunk 尺寸）
- [ ] `npm run lint:devices`（涉及设备配置/映射时）
- [ ] `npm run gen:inventory` diff 检查（涉及设备注册时）；数量只引用生成值
- [ ] `npm run smoke` 全绿（断言数以当前运行为准）
- [ ] 涉及新设备：`npm run thumbs` 定向 + 浏览器实载

## 2. 视觉审查（对照 HIG 原则层）

- [ ] 层级：任意时刻界面只有一个视觉焦点；HUD 与 3D 主角不打架
- [ ] 对比度：正文 ≥4.5:1（重点核 `--txt-3` 在 `--bg-1` 上）；强调色派生背景上文本可读
- [ ] 字体：中文正文 ≥13px；`--fs-hud` 10px 仅用于装饰性标注
- [ ] 间距：4 的倍数标尺；面板内边距/圆角用 token，无孤立值
- [ ] 玻璃：只用 G1~G3 三级配方（DESIGN_SYSTEM §3），无新增 blur 值
- [ ] 状态完备：hover / focus-visible / active / disabled / 加载 / 失败 / 空态（新组件四态必查）
- [ ] 图标：内联 SVG，stroke 1.8px 一致；不混用填充风格
- [ ] 长文本：设备描述/部件 desc 在窄面板下可换行不溢出

### HIG 原则摘录（人工维护，摘自 Apple 官方 HIG/Materials，2026-10 核实 URL）
- 清晰度优先：内容先于装饰；模糊材料不得损害内容可读性（Materials 原则）
- 动效有语义：动效传达因果与空间，不是纯装饰；尊重系统减少动态偏好
- 触达目标 ≥44pt；反馈即时；深色环境避免大面积纯白
- ⚠️ 以上为原则摘录，非逐字引用；全文以 developer.apple.com 官方页面为准

## 3. 视口与交互回归

- [ ] 桌面 1440×900：大厅筛选/搜索/卡片 → 设备加载 → 选中/聚焦 → 爆炸/装配 → 四模式（X-Ray/Isolate/Clip）→ Tour → 截图 → 深链直达 → 切台/返回
- [ ] 移动 390×844：HUD 不长期遮挡画布（可交互）；详情卡 sheet 可滚动可收起；工具栏触点 ≥44px；横屏抽查
- [ ] 键盘：Space 拆解、Digit1-4 模式、方向键切台/Tour、Esc 退出
- [ ] `prefers-reduced-motion: reduce`：开场跳过、缓动直达、自转关闭（7/7 断言口径）
- [ ] 错误路径：断网/abort 设备 chunk → 错误面板出现且"返回大厅"可用

## 4. 3D 呈现审查（对照 3D_EXPERIENCE_GUIDELINES）

- [ ] 地面接触/朝向正确、无穿模；相机取景不裁切主体
- [ ] 部件可拾取（含移动端触摸）；标签无遮挡互叠
- [ ] X-Ray 内构件语义正确（光学件不雾化）；Clip 剖面可读
- [ ] 特写小图（capturePartThumb）与部件对得上

## 5. impeccable 流程

- UI 面板改动：`npx impeccable detect src/`（或指定文件）→ 新增问题为 0 才合入
- 大版本界面：critique 打分评审，把"低于 80 分项"转为 backlog 条目，不在当轮强行修完
- ⚠️ impeccable 规则是通用 Web 口径；与本规范冲突时**以本规范为准**并在 LOG 记录冲突点

## 6. 性能与资源

- [ ] 无事件监听/计时器/GSAP timeline 泄漏（切台后残留检查：`window.__ENGINE_ERR` 无、GPU 内存回落）
- [ ] 后处理不叠加过曝（Bloom + Outline + 透明材质组合实测截图）
- [ ] 首屏：大厅不加载 three chunk（smoke 断言在案）
- [ ] 数值声明纪律：未测量不写"提升了 X%"

## 7. 留档要求

AUTONOMOUS_LOG 记录：改动文件、验证命令与结果（原样贴关键输出）、已知限制、截图路径。未验证项必须显式写"未验证"，禁止默认通过。
