# AUDIT-3D-AUTHENTICITY · 3D 展品真实性审计（通宵迭代 Phase 0）

> 依据 `docs/roadmap/GEWUGUAN_AUTONOMOUS_3D_ITERATION.md` §2。方法：`tools/screen-audit.mjs`（遍历 scene 统计 display 部件材质的原生 map/emissiveMap）+ `tools/native-texture-dump.mjs`（导出原生贴图 PNG 目检）+ `tools/overlay-ab.mjs`（运行时隐藏 painted overlay 的 A/B 截图）。取证图存 `docs/design/screenshots/audit-native/`。

## 问题清单

### SCR-01（P0 · 已证实）painted 虚拟屏幕遮盖原生真实屏幕（8 台）
- **现象**：设备 GLB 模型自带真实屏幕贴图（官方壁纸/真实 iOS 界面），项目又在 `display` 部件上叠了一层 `makePhoneScreen` 画的通用虚拟 UI（10:20 时钟 + 「格物馆」通知卡）——假 UI 盖住真屏，且虚拟界面并非该机型真实系统。
- **取证**：
  - `iphone-12-teardown`：原生 `mat_screen map+em(2048²)` = **真实 iOS 14 主屏 + 9:41 锁屏**；A/B 隐藏 overlay 后露出完整原生屏。
  - `iphone-13`：原生 `display_ip map+em(4096×2048)` = 苹果官方锁屏（9:41 沙丘壁纸 + 时钟组件 + App 图标）。
  - `iphone-17`：原生官方浅紫壁纸 map；`iphone-18-pro-max`/`-burgundy`：原生 `COLOUR_Black/Cherry_Screen em`；`iphone-duo-fold`：内外双屏均有原生 em；`galaxy-s22-ultra`：原生 `Display_ActiveArea map(1024²)` = 三星 S22 官方壁纸；`modular-smartphone`：原生太空壁纸 map(1024×2048)。
- **修复**：移除这 8 台的 painted screen 接线（import/实例/postLoad hook/tick 四处）。
- **验证**：同探针复跑（display 仅剩原生材质）+ 近景截图确认单层屏幕。

### SCR-02（合法保留）painted overlay 的正确用例（4 台）
- `iphone-16`：display **无任何原生贴图**（仅 painted em）→ overlay 合法。
- `action4`/`pocket3`：官方 GLB 的屏幕区为暗玻璃/机身贴图（`jishen/waike` atlas），无原生屏内容；painted UI 与真机界面一致（RockSteady 录制 UI / 时间码）→ 保留。
- `vision-pro`：display 全部素材质 → 保留。
- 处置：4 台配置加注释锚点「screen: painted（原生贴图缺失/暗玻璃，依据 screen-audit 2026-11-01）」，并写入 screen.js 头部策略。

### PART-01（P1 · 进行中）裸露/错位零件与标签失实
- 任务书 §2.2 要求逐台核查装配关系。**自动筛查**（`tools/assembly-screen.mjs`，装配态部件 bbox 相对整机 hull 中心距离）：16 台旗舰批次无真正漂浮件（无 rel>1.0），旗标项均为边缘合法件或标签失实。
- **已证实并修复（2026-11-01）**：iphone-13 `ip_speaker_blk` 网格实测位于机身**顶部**（尾插/端口在 y 负区），实为听筒而配置写「扬声器/底部主扬声器」→ 改名「听筒（顶部扬声器）」+ desc 如实标注实测依据。
- 其余设备按质量分级滚动核查。
- **实锤 #2（2026-11-01 续轮 5，已修复）**：m4-carbine SkinnedMesh 节点 scale=0.0479 未烘入顶点，inspect 尺寸与视觉差 21.6× → 整机 0.42 单位长不可见（thumbView 自取景掩盖 2 天）。修复：targetWidth 188 补偿（hullRadius 0.21→4.401 ✓）+ smoke 取景尺度护栏断言。**SOP 待补**：新 GLB 接入时比对 inspect 尺寸与 `__RAW.finalBbox`，差一个数量级即查节点 scale。
- 批次 3（20 台）：17 净；ak-47 刺刀/枪托、countach 前盖旗标为真实端部；**抓出 m4 不可见（实锤 #2，已修）**。
- **批次 4+5+6（2026-11-01 续轮，44 台）→ 全量筛查收官：104/104 台覆盖**。旗标 19 个逐项核对均为真实端部/部件位置（手机尾插区、Nothing Glyph 灯角、Switch 双 Joy-Con、VCR 前面板、数字腕表表扣在表带端等），零漂浮件、零错位。
- **结论**：装配类真实性问题全馆共 2 处实锤（iphone-13 听筒标签、m4 取景尺度），均已修复并有护栏断言；其余 102 台装配态结构可信。

### PART-02（P1 · 已修复）小部件特写取景穿模
- 现象：深链/清单点选小部件（如 iphone-13 听筒，退化薄片 size x=0）时相机飞进机身内腔/被爆炸外壳遮挡，画面为无意义放大的部件边缘（`part-iphone13-speaker.png` 修复前）。
- 根因：flyToPart 仅按部件对角线取景；且 `deviceRadius` 只算 p.base（GLB 直映射件的坐标在 mesh 上，group 全在原点 → 低估 hull，3.9 vs 实际 7.9）。
- 修复（engine.js）：① finalize 缓存 mesh 级整机 hull（`hullRadius/hullCenter`）；② **小部件（diag < hull/4）不做相机飞行**——保持全景 + 选中高亮 + 标签指位（退化网格任何特写都无意义，位置信息交给标签）；中/大部件飞近距离下限挂 hull×0.3。
- 修复后：`part-iphone13-speaker.png`（全景 + 06 听筒标签指位 + 详情卡）。

### HOME-01（P1 · 已修复）首屏馆名过压展品（任务书 §3.2）
- 修复（2026-11-01）：馆名 `clamp(76px,11.5vw,172px)` → `clamp(44px,6vw,84px)` 降为识别级，焦点展台成为首屏主视觉；长页面结构保留。
- §3.3 顶栏离场/吸顶工具栏：R2 已实现（hub-nav 随滚动自然离场、`.filter-main` 整页吸顶，`d2-lobby-desktop-scrolled.png` 佐证），本轮复核无重叠/闪跳，无需改动。

## 现状基线（Phase 0 实测）

- `npm run build` ✓（2.01s，2026-11-01）；smoke 28/28 ✓（R8 后复跑）。
- 屏幕方案盘点：14 台挂 `addLiveScreen`（9 手机 + action4/mavic3pro/pocket3/vision-pro）；mavic3pro 无 screen 部件命中（hook 空转，SCR-03 备查）。
- 已知环境坑：长跑 dev server 在 node_modules 变更后 Vite 预打包失效（`vue` 无法解析）→ 重启即愈；smoke 首跑超时同理（冷启动预打包）。

## Phase 5 评估结论：径向（星型）活塞发动机

- **类型确认**：用户所说「行星发动机」按任务书核实为星型/径向活塞发动机（Radial Engine），与既有 `planetary-gearbox`（行星齿轮箱）互不混淆。
- **资源候选（Sketchfab，CC-BY，2026-11-01 检索）**：
  1. Radial Engine by basharnazzal（CC-BY，可下载）— https://sketchfab.com/3d-models/radial-engine-25b49d63734748f7a37da9e065da2f72
  2. Radial Engine by Intan DP（CC-BY，基于 3D 打印气动径向发动机，零件分离设计）— https://sketchfab.com/3d-models/radial-engine-5d562de926de401183cd42a4428c3a2c
  3. Radial Engine Mechanism by trinityscsp（CC-BY，机制演示向）
- **集成路线**（下一垂直切片，走 convert-asset + add-device SOP）：下载 GLB → inspect-glb 体检（网格命名/几何岛）→ 主连杆+副连杆映射（9 缸星型的 master/slave rod 是重点）→ 复用本轮新增 `stroke` 演示类型（相位按各缸均布 360/n）→ thumbs + 移动端验收。
- **状态：✅ 已集成（2026-11-01 续轮 3）**——用户在内置浏览器提供 Sketchfab 登录态后通道打通：claimTab + 同源 fetch 取 S3 直链，basharnazzal 80MB → draco 5.24MB → `radial-engine` 上线（104 台 · 818 部件）。以下为当时的阻塞记录：
- **（历史）下载通道曾阻塞（2026-11-01）**——Sketchfab `/i/archives/latest` 需登录态（本会话无注入渠道，直连 401 实测）；Thingiverse/Printables 页面被 Cloudflare 拦截（curl 与 headless Chrome 均验证）；Wayback 存档页也是挑战页。**替代方案**：① 用户在浏览器打开模型页手动下载 GLB/STL 放入 `vendor/assets/originals/` 即可续跑；② 有 ZCode 浏览器登录态注入的会话续跑 `/i/` 通道。STL 路线走 `cad2glb.py stl`，GLB 路线直接压缩管线。模型到手后按上文集成路线执行（SOP 就绪）。
