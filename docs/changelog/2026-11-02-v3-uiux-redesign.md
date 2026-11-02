# 2026-11-02 · V3 设计系统与 UI/UX 深度重构（首轮）

任务书：`docs/ui-ux/v3/MUSEUM_OF_MACHINES_V3_UI_UX_REDESIGN_MASTER_PLAN.md`（全文 2688 行已存档）。

## Phase 0-3 交付

1. **工具链**（`DESIGN_TOOLCHAIN_VERIFICATION.md`）：UI/UX Pro Max（universal 布局+symlink，CLI 暂无 zcode 类型如实记录）、UI Craft（30 命令族）、Oil UI 0.29.1、impeccable 4.8.0（已有）；UUPM search.py 与 impeccable detect 均真实调用。
2. **审计**（`V3_CURRENT_STATE_AUDIT.md`）：三大根因——F1 日厅=200+ 行选择器覆盖补丁层；F2 缩略图仅夜厅渲染（日厅卡片拼贴感）；F3 展台无厚度/模型悬浮/日厅顶栏对比度失效。基线截图 7 张。
3. **方向探索**（`V3_VISUAL_DIRECTION_PROPOSALS.md`）：`?dir=` 预览脚手架 + 三方向真实页面 9 张取证；裁定 **A+B 融合**（A 暖白画廊基调 + B 工程语汇限工具层）、夜厅 C 精修。
4. **语义 token 双主题落地**（src/style.css）：
   - 日厅根 token 换 A 调色板（bg 象牙三级/暖墨四级/深青绿 accent，对比度 4.9-14.9:1 全达标）；
   - V2 遗留 ~90 条日厅硬编码（#1c2836/#3c4c5c/rgba(90,120,150,α) 等 21 族）**全量替换为语义 token，残留 0**；
   - 扩展 token：--wash-1/2、--hairline(-strong)、--raise、--surface-hi/2/stage；
   - A 结构：日厅去光斑、照片版画卡、胶囊搜索/chip 透明化；B 结构：焦点展台同心刻度环；
   - C 夜厅：底色加深一档（#020408/#040810/#0c141f）+ 导视条暖金 hairline。
5. **文档**：`docs/ui-ux/v3/DESIGN_SYSTEM.md`（V3 双厅语义体系）。

## 验证

- `npm run build` ✓ 2.58s；`npm run smoke` ✓ 全过（含移动端、无控制台错误）；
- `impeccable detect src/` ✓ 0 反模式（1 条既有 advisory 不变）；
- 定稿截图 5 张（`references/v3-tokens/`）：日厅大厅 top/grid、日厅工作空间、夜厅大厅、夜厅工作空间——日厅顶栏/面板可读性与统一性显著改善，夜厅零回归。

## 遗留与下一项

- Phase 4-6（下一垂直切片）：精密环形展陈底座六层结构（引擎侧 Three.js，三方案探索）；缩略图日厅渲染方案（render-thumbs 双布光参数集）；首页 Hero 日厅适配。
- `tools/day-contrast-verify.mjs`（V2 旧调色断言）已过时，待按新 token 更新或退役。

## 追加 · 精密环形展陈底座首切片（Phase 6）

- `src/engine/engine.js`：展台三件套升级为六层结构 `plinth` Group（V3 任务书 §09）——双层墩身、台面、内环 accent 定位环、中环 canvas 径向刻度环（12 主 + 48 次，无数字）、外环金属带圈、断开式弧轨 ×3；整组随 deviceRadius 缩放；thumb 模式整组隐藏；`setPedestalHall` 扩展至全部六层材质（双厅共享几何）。
- 亮度两轮调校：刻度环 opacity 夜 .55/日 .45、弧轨 emissive 夜 .2/日 .08（防光晕化，符合"外环建立空间尺度而非堆砌发光"）。
- 验证：build ✓ / impeccable 0 反模式 ✓ / 双厅截图目检 ✓（`references/v3-tokens/workspace-{day,night}.png`）。
- 已知遗留：模型-台面悬空间距（逐台接地专项，已入 BACKLOG P1）；缩略图仍夜厅渲染（日厅变体管线，P2）。

## 追加 · 模型接地专项（V3 P1）

- 16 台抽样审计：模型底面距台面悬空 1.0-4.2 单位（工具 `tools/ground-audit.mjs`）。
- 引擎 `setPlinthTop`：台面动态贴合设备 hull 底面（博物馆展台各件不同高），墩身延伸至地面；`device.groundOffset`/`groundKeep` 逐台覆盖；装配/爆炸/取景零回归（smoke 全过）。

## 追加 · V3.0 MECHANICAL FORGE 首轮（独立任务书，见 docs/roadmap/）

- 新系统「机械锻造所」：src/forge/{rand,materials,v8,registry}.js + /forge 路由 + DeviceViewer 生成物分流 + 引擎 demos `also` 伴随联动扩展。
- V8 标杆生成器：90°/60° 交叉曲柄概念布局，10 部件组（缸体/曲轴总成/活塞连杆组×8/缸盖/盖罩/进气/排气/油底壳/前端/后端），参数（夹角/缸径/行程/表面/细节）+ 种子可复现；选中曲轴触发曲轴自转+活塞连杆往复联动（运动学示意口径，页面明示"非可制造工程模型"）。
- 验证全绿：forge-verify（生成/演示/爆炸复位/双厅/确定性/刷新重建/0 错误）+ smoke + v8 演示专项 + lint。截图 docs/design/screenshots/forge-*.png。

## 追加 · 涡扇标杆 + 预设深链 + GLB 导出（V3.0 Forge 续轮）

- `src/forge/turbofan.js`：双转子涡扇（9 部件，N1/N2 差速联动演示，扭转收缩叶片），PHASE 5 收官。
- ForgeView：预设方案（V8×4 / 涡扇×3）+ 深链 `?gen=&preset=&参数=&seed=&auto=1`，PHASE 4 子集。
- `src/forge/export.js`：GLB 导出（结构校验→GLTFExporter→下载，文件名含版本与种子）；inspect-glb 复检 188 节点/162 网格可重导入。PHASE 7 核心。
- 验证：forge-tf-verify / forge-export-verify 全过（差速 Δ5.4 vs Δ9.3、爆炸复位<0.02、0 控制台错误）+ smoke 全过。

## 追加 · FORGE-99 科幻核心（PHASE 6 收官）

- `src/forge/ringdrive.js`：环式磁耦合动力核心（虚构概念，9 部件组，轮系几何真实/磁悬浮层虚构并明示标注），轮系联动演示 + GLB 导出 679KB 验证通过；三大标杆（V8/涡扇/科幻核心）全部落地。
- verify 脚本健壮化：文件日志替代管道 tail（browser.close 挂起曾伪装成无限卡死），domcontentloaded 等待替代 networkidle2（Vite dep 重载循环）。

## 追加 · V4.0 Slice 2+3（接地治理 + 发布就绪）

- 引擎接地基准改网格级稳健下沿 + 落地式钳制（展台永不高于地面）：修复官方 GLB 杂点网格导致的展台埋地（s22-ultra 类 30 台），钢琴等少腿模型不误伤；smoke 全过。
- 全量接地审计工件（raw/robust/离群三列，104/104）；vite preview 产物级回归脚本（EXIT 0）；index.html meta/og 补齐。

## 追加 · V4.0 MECHANICAL INTELLIGENCE 立项 + Mechanism Graph 首切片

- 权威任务书 docs/roadmap/GEWU_V4_MECHANICAL_INTELLIGENCE_AUTONOMOUS_EXECUTION.md；src/forge/mech.js 关系数据层（10 类关系 + validateMech）；锻造 V8 试点 mech 14 条边（诚实 kinematic 口径）；DeviceViewer 总览弹层机构关系面板（校验失败/无数据即隐藏）。
