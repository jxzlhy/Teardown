# 自主迭代待办池

> 优先级：P0 阻断/高危，P1 高价值，P2 体验与工程，P3 可选。
> 设备/部件数量以 `MODEL_INVENTORY.md` 为准；状态在每次迭代后更新。

| 优先级 | 事项 | 价值 | 风险 | 验证方式 | 状态 |
|---|---|---|---|---|---|
| P1 | 社区模型署名补齐（作者/许可证/来源链接）+ lint 强制校验 | 合规与可信度，决定能否公开发布 | 已完成 | `npm run lint:devices` 强制 + faceCount 交叉比对 | **已完成**（37 台全量署名 + modelSource；hubble/perseverance 定案 NASA 公有领域；lint 禁止 by community） |
| P1 | 给更多主力机型补 `xrayShellIds` 与策展 `tour` | X-Ray/导览质量一致性 | 需逐台确认部件语义 | 浏览器抽查 + lint | **已完成 92/93 台（收官）**：全馆仅 marshall-jcm800 刻意保留无策展（smoke 兜底断言依赖）；新增设备默认随接入配 tour |
| P3 | Poly Haven 17 台 CC0 模型补 polyhaven.com 资产页链接（CC0 无强制义务，完整性加分） | 来源可溯 | 低 | lint + 页面抽查 | 待办 |
| P3 | NC/SA/非商业许可证在 UI 上的醒目区分标注（当前仅在 credit 文本中体现） | 合规透明 | 低 | 截图 | 待办 |
| P3 | ak-47/v8-engine/orrery/computer-parts 面数与在线版偏差的存档说明（slug/作者证据已确认，差异疑为 LOD/重传/转换） | 考据严谨性 | 低 | AUTONOMOUS_LOG 已记录 | 已记录 |
| P2 | 剖切封盖（stencil）或明确的”无封盖”提示 | 剖切可读性 | 中，涉及渲染改法 | 桌面/移动截图对比 | **已完成（务实方案）**：clip 材质切 DoubleSide 内壁可见 + 半透明 accent 剖切指示板（5129158）；真 stencil 需 EffectComposer RT 带 stencilBuffer（现无，改动波及全管线）→ LATER |
| P2 | 详情卡部件特写小图（按部件取景） | 详情页完成度 | 中，需扩缩略图管线 | 缩略图脚本 + 截图 | **已完成**（引擎 capturePartThumb 运行时离屏捕获，全量 90 台生效，零管线成本） |
| P2 | 真实 iOS Safari / Android Chrome 回归（含横屏） | 移动端真实体验 | 需真机/远程设备 | 真机录屏/截图 | 待办（环境缺失） |
| P2 | ~~git 初始化与首次提交~~ → 已完成：Gitee teardown-lab 远程（main，vendor/originals 1.2GB 仅本地备份，.gitignore 注明） | 回滚与协作基础 | 低 | push 成功 6d4a18a/2989033 | **已完成** |
| P3 | three.js 单独 manualChunks，进一步降低设备页首包 | 发版后缓存复用 | 低，总量不变 | 构建体积对比 | 已完成（three 771KB 独立 chunk） |
| P3 | 对齐 `hero` / `parts[].icon` 文档与实现（当前无消费方） | 减少无效配置项 | 低 | 代码检索 | 已完成（文档标注未落地；配置中本来无该字段） |
| P2 | 设备配置 chunk 加载失败态（发版后旧 chunk 404 / 弱网） | 可恢复性 | 低 | 请求拦截 abort + 浏览器 | 已完成（错误面板 + 重试/返回） |
| P2 | `prefers-reduced-motion` 降级（开场/缓动/自转/CSS 动画） | 无障碍与晕动症友好 | 低 | Chrome 媒体特性模拟 + 断言 | 已完成（7/7） |
| P3 | 子路径部署实测（`assetUrl` 已接入 GLB/缩略图/Draco） | 部署灵活性 | 低 | `vite build --base=/x/` + 静态服务 | 已完成（7/7；顺带修好插件写死 dist/） |
| P2 | 新设备研究接入：已接 8 台（blender/grinder/pinball/triple-engine/gramophone/smeg/tourbillon-movement/grand-piano/gameboy，达 96 台 31 品牌）；GAP 四缺口全部收官：陀飞轮 ✅ 钢琴 ✅ Game Boy ✅（混合路径：真实外壳+明标注示意内构件，baseRotation 引擎能力）/ 手风琴 ❌ 拆解无解；新设备需新一轮外部调研 | 内容扩充 | 需逐台查证来源/许可 | convert-asset + add-device SOP + inspect 判定 | 持续滚动 |
| P3 | pinball 弹射板疑似缺右只（Object_32/33 仅左），逐网格核对补映射 | 拆解准确性 | 低 | 页面 __RAW.rel + 截图 | 待办 |
