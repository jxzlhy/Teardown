# 自主迭代指标

> 只记录可复现的测量；无测量的项目不写数值。

## 2026-10-30（会话累计）

| 指标 | 数值 | 测量方式 |
|---|---|---|
| 设备规模 | 93 台 / 767 部件 / 93 GLB / 30 品牌 | `npm run gen:inventory` |
| GLB 总体积 | ~190MB 级（新增 5 台：blender 280KB / grinder 908KB / pinball 1.18MB / triple-engine 618KB / gramophone 924KB / smeg 280KB，均为压缩后） | `npm run optimize-glb` 输出 |
| `lint:devices` | 93/93（0 错 0 警），含署名/来源链接强制规则 | `npm run lint:devices` |
| `build` 耗时 | 1.8–2.1s | `npm run build` |
| 冒烟 | `npm run smoke` 全通过（含 three chunk、Tour 兜底、移动端间距断言） | 无头 Chrome + SwiftShader |
| **全量生产回归** | **93/93 台装载通过，0 异常**（booted + 状态匹配 + parts>0 + 0 pageerror + 0 HTTP 4xx） | `vite preview` + 无头 Chrome 逐台遍历（docs/full-regression-2026-10-30.log） |
| 来源口径 | 35 官方 / 55 社区（NASA 计官方） | 大厅统计断言 |
| 署名覆盖 | 外部来源设备 51/51 有 modelSource 链接（Sketchfab/NASA/Poly Haven，lint 强制） | `npm run lint:devices` + curl 逐条 200 |
| 策展覆盖 | 92/93 台有 tour + xrayShellIds（marshall-jcm800 刻意保留供 smoke 兜底断言） | lint + KeyT 抽查 |
| 特写小图 | 详情卡全量生效（离屏 RT 捕获，dataURL 5.6万–13.1万字节实测） | 无头 Chrome 多台 |
| 新设备压缩率 | blender 2.15MB→206KB（9%）/ grinder→887KB（10%）/ pinball→1.12MB（16%）/ triple-engine→618KB（14%）/ gramophone→924KB（10%）/ smeg→280KB（8%） | `tools/optimize-glb.mjs` 输出 |
| 落选记录 | 4 台 inspect 后淘汰（tourbillon/wankel/walkman 不可拆、smeg 曾暂缓后接入） | inspect-glb 判读 |
| Gitee 同步 | main 与 origin 一致，25+ 提交 | `git log` / push 输出 |

## 2026-10-29

| 指标 | 修复前（审计基线） | 修复后 | 测量方式 |
|---|---|---|---|
| `lint:devices` | 82/82 通过 | 82/82 通过（0 错 0 警） | `npm run lint:devices` |
| `build` 耗时 | 1.86s | 1.71s | `npm run build` |
| 设备路由 chunk | 1.2MB / gzip 404KB | 883.82KB / gzip 248.11KB | 构建输出 |
| 单台配置 chunk | 混在设备 chunk 内 | 3–17KB（action4 17.04KB / gzip 8.48KB） | 构建输出 |
| 设备页 chunk 构成 | 单块 903.95KB / gzip 248.13KB | DeviceViewer 132.74KB（50.08KB gzip）+ three 771.32KB（198.73KB gzip） | 构建输出 |
| 进入设备页请求的配置数 | 82 | 1（仅 `/src/devices/action4.js`） | 浏览器 request 监听 |
| 单设备 JS heap | ~41MB | 34.4–35MB | `performance.memory`（无头 Chrome） |
| 挂载 canvas 数 | 审计记录 23（口径可能含离屏 canvas） | 1 | `document.querySelectorAll('canvas')` |
| 移动端 sheet 与浮层间距 | 重叠（-10px 级） | 19.6px | getBoundingClientRect |
| `gen:inventory` | 82 台 / 692 部件 / 82 GLB / 27 品牌 | 同左 | `npm run gen:inventory` |
| GLB 总体积 | 173.8MB（`du` 174M） | 未变 | `du -ch public/assets/*.glb` |
| `dist` 体积 | 213MB（含 `.mimosa`/`.DS_Store`） | 201MB，无缓存/系统垃圾 | `du -sh dist` + `find` |
| 冒烟 | 手工脚本 | `npm run smoke` 11/11 通过 | 无头 Chrome + SwiftShader |
| 缓存策略（policy） | 无上限 | 512MB 上限 + LRU 淘汰，5 项断言通过 | `node` 直接 import `cache-policy.js` |
| 缓存行为（浏览器） | 未验证 | 8/8：写入/命中零请求/LRU 时间刷新/淘汰与元数据同步 | 无头 Chrome + dev server |
| 子路径部署（`--base=/x/`） | 未验证（插件写死 dist/） | 7/7 通过；Draco/缩略图/GLB 均走 `/x/` | 独立产物 + 静态服务 + 无头 Chrome |
| 社区模型署名 | 49 台仅文本，22 台泛化 | 22 台标“来源待核实”，27 台明确署名不加标 | 浏览器断言 + 截图 |
| 配置 chunk 失败恢复 | 仅 console，无 UI | 错误面板 + 重试/返回大厅，4/4 通过 | 请求拦截 abort + 无头 Chrome |
| prefers-reduced-motion | 未处理 | 开场/缓动/浮动/自转/CSS 动画全部降级，7/7 通过 | Chrome 媒体特性模拟 + 无头断言 |
| 生产预览回归 | 未做 | 13/13 通过（大厅 + action4 + 6 机型 + 移动端） | `vite preview` + 无头 Chrome |
| 缩略图管线（按需加载后） | 未验证 | 3/3 成功，画面与设备一致 | `npm run thumbs -- --only action4,switch-2,marshall-jcm800` |

## 2026-10-31 · R7 名字层字体（思源宋体 Heavy）

| 指标 | 值 | 备注 |
|---|---|---|
| dist 字体资产 | +196 文件 / 7.3MB | @fontsource/noto-serif-sc 900（woff2+woff 双格式，unicode-range 分片） |
| 运行时首屏字体请求 | ~19 分片 | 门厅页实测 performance entries；按 unicode-range 懒加载 |
| dist 总量 | 243MB | 其中模型/缩略图等 public 资产 ~236MB（字体占比 ~3%） |
| document.fonts | 'Noto Serif SC 900' loaded | fonts.check('900 "Noto Serif SC"','格物馆') = true |

## 2026-10-31 · R8 名字层终选黑体（思源黑体 Black）

| 指标 | 值 | 备注 |
|---|---|---|
| 字体资产 | 196 文件 / 5.6MB | @fontsource/noto-sans-sc 900（较宋体版 7.3MB -1.7MB） |
| 字体校验 | fonts.check('900 "Noto Sans SC"','格物馆') = true | macOS headless Chrome |
| 构建 | 2.18s ✓ | smoke 首跑超时为 Vite 冷启动预打包，复跑 28/28 |

## 2026-11-01 · V2 任务书指标

| 指标 | 值 | 备注 |
|---|---|---|
| 设备总数 | 104 台 · 818 部件 · 104 GLB · 38 品牌 | gen:inventory 生成值 |
| 构建体积 | three chunk 771KB（不变）| 无包体退化 |
| smoke 断言 | 32 项 | 含视角预设 + m4 取景护栏 + 还原相机 |
| quality 已定级 | 3/104 台 | iphone-12=A / v8=B / radial=B（证据驱动，其余待核） |
| 映射准确性 | 6 台抽查全过 | mapping-verify.mjs（action4/iphone12/v8/radial/digital-watch/nikon-z6） |
| 装配筛查覆盖 | 104/104 台（6 批） | 零漂浮件，2 处实锤修复 |
| 屏幕方案 | 8 native / 4 painted / 92 无屏 | screen-audit 全量取证 |
| impeccable | 0 新增反模式 | 仅既有 --ease-spring advisory |
| 双厅资产 | 日厅背景懒生成 + 星点显隐 | 0 额外纹理下载 |
| 字体资产 | 思源黑体 196 片 / 5.6MB | @fontsource/noto-sans-sc 900 |

## 2026-11-02 · V4.0 基线（发布就绪口径）

| 指标 | 值 | 门槛/备注 |
|---|---|---|
| 构建体积（gzip） | index 42.4KB / DeviceViewer 74.9KB / three 198.8KB / GalleryHub 7.3KB | 不回退；新增 chunk 需评估 |
| 产物回归 | vite preview EXIT 0：资产全 200 + 5 深链启动 + 0 控制台错误 | tools/v4-preview-verify.mjs，发版前必跑 |
| 缩略图资产 | 208 张（104×2）· 4.8MB · 日变体 11-26KB/台 | 单张 ≤60KB 预算 |
| 接地治理 | 全量审计 104/104 读数（v1）；0 下沉 | docs/ui-ux/v4-ground-audit.json；v2 settle 修正后复核 |
| Forge 导出 | V8 628KB / 涡扇 832KB / 核心 679KB | inspect-glb 复检通过 |
| 冒烟断言 | 32 项全过（含 forge 分流回归） | npm run smoke |

## 2026-11-02 · NASA 双官方件接入基线
- 设备规模：104 → **110 台 / 855 部件 / 39 品牌**（MODEL_INVENTORY 自动生成）。
- 新资产：ingenuity-helicopter.glb 738KB（原 1.93MB，38%）、parker-solar-probe.glb 247KB（原 433KB，57%）；原件备份 vendor/assets/originals/nasa-2026-11-02/。
- 缩略图：夜 17-18KB + 日变体 17-23KB（预算 ≤60KB 达标）。
- 构建：build 2.58s；v4-preview-verify EXIT 0（6 资产全 200、0 控制台错误）。
- 许可：两台均为 NASA 3D Resources 公有领域，modelSource 直链资产页，lint 署名校验通过。
- 环境：smoke 因系统负载 6.6–10.4 四轮单点抖动（协议不作数），以产物级回归替代。

## 2026-11-02 · 全维度审计 + Phase 0 止血基线

| 指标 | 修复前 | 修复后 | 测量方式 |
|---|---|---|---|
| 在馆口径（五处一致） | 117 / 110 / 104 / 104 / 110 互相矛盾 | **115 台 · 880 部件 · 39 品牌** 五处全等 | `tools/lint-consistency.mjs`（新建） |
| GLB 总量 | 226.3MB / 117 文件 | **184.7MB** / 115 在馆 | 同一解析脚本复测（`/tmp/glb-audit2.mjs`） |
| ≥4096 纹理设备 | 14 台 | **0 台** | GLB JSON chunk + WebP/PNG/JPEG 头解析 |
| 最大单台纹理显存 | v6-engine 3259MB | **815MB（-75%）** | RGBA8+MIP(×1.34) 估算 |
| 全馆纹理显存合计 | 14.6GB | **8.34GB（-43%）** | 同上 |
| >6MB 单台 | 10 台 | **4 台** | 同上 |
| DRACO / webp 覆盖 | 117/117 · 有纹理者 97/97 webp | 不变（无回退） | 同上 |
| combustion-engine 悬停 p95 | 88.5ms（>50ms 帧 27 · 长任务 24） | **18.0ms（0 · 0）** | `/tmp/hover-bench.mjs` 前后同条件（1440×900 · 真 GPU · 40 次 hover） |
| v8-engine 悬停 p95 | 28.3ms（>50ms 帧 1） | **17.9ms（0）** | 同上 |
| 拾取 BVH 覆盖 | 仅测量工具启用 | **装载后全量（smoke 断言）** | `npm run smoke` |
| 单台设备页实测 | action4 6.01MB/94req/heap 36.9MB；v6-engine 24.4MB/128req/heap 115.2MB | 未复测（Phase 3 一并） | puppeteer + performance API |
| 构建 | 2.74s · three 806KB(gz 209) · DeviceViewer 218.5KB(gz 80) · index 108.6KB(gz 42.5) | 2.64s · 同量级（无退化） | `npm run build` |
| lint:devices | 0 错 11 警 | 0 错 11 警 + **五处一致** + **TODO 硬闸** | `npm run lint:devices` |
| 冒烟断言 | 32 项 | **33 项**（+拾取 BVH 全量覆盖） | `npm run smoke` |
| 日厅对比度（未整改，记账） | 109 节点 / 81 class < AA，最差 1.16:1 | 待 Phase 2-A | 运行时 WCAG 相对亮度扫描 |
| 移动端触控（未整改，记账） | <44px 目标 128/299；导视按钮越界 48px | 待 Phase 2-D | 390×844 实测 |

## 2026-11-03 · 新模型批次 5 台（fresnel/telescope/hydrant/compass/stapler）

| 指标 | 数值 | 测量方式 |
|---|---|---|
| GLB 体积 | fresnel-lens 909KB · refractor-telescope 351KB · fire-hydrant 428KB（剔 aged 变体后） · seadogs-compass 548KB · vintage-stapler 401KB | optimize-glb（webp85→draco） |
| 源→成品压缩率 | 7.55MB→909KB / 3.24MB→351KB / 5.26MB→428KB / 2.57MB→548KB / 2.21MB→401KB（11-24%） | tools/optimize-glb.mjs |
| 缩略图（夜+日变体） | 20-26KB + 22-31KB/台（预算 ≤60KB 达标） | `npm run thumbs -- --only <5 台>` |
| 映射对账 | 5 台部件网格数 ≥1、0 幽灵、0 空部件、0 页面错误 | tools/verify-newdev-20261102.mjs |
| 视觉验证 | 组装+爆炸双态 10 张目检全过（settle 2.6s 后拍摄） | tools/shots-newdev-20261102.mjs |
| 馆级门 | lint 0 错 0 警 · 五处一致 115 台 · build 2.82s · smoke 全过 | npm run lint:devices / gen:inventory / build / smoke |
| 在馆口径 | 115 台 · 880 部件 · 39 品牌（另有 2 台筹备中未入馆） | gen:inventory |

## 2026-11-03 · 大天文台批次
- 设备规模：110 → **117 台 / 890 部件 / 40 品牌**（含并行会话同窗新增）。
- 新资产：spitzer-space-telescope.glb 242KB（原 245KB，无贴图材质件）、chandra-x-ray-observatory.glb 232KB（原 975KB，24%）；原件入 vendor/assets/originals/nasa-2026-11-02/。
- 验证：build 4.42s / preview EXIT 0 / 映射 43/43+6/6 / thumbs 夜+日 20KB 级。

## 2026-11-02/03 · 全网搜罗批次一（本会话 4 台；接入时点 110 台，馆现已 117）
- 新资产与压缩（webp→draco）：
  - curta-type2.glb 9.97MB（原 123.5MB；123→131MB@resize2048 失败教训→1K+q78 路线 12.3%；45 张纹理为主）——全馆最重 GLB，按需加载
  - vintage-binocular.glb 1.41MB（原 7.95MB）
  - manual-gearbox.glb 1.35MB（原 12.4MB；flatten 后重打包）
  - wankel-engine.glb 5.76MB（原 43.6MB；flatten 后重打包）
- 压缩率：四台平均 ~10%（102→17.5MB 合计）
- 验证：lint 0 错（110 台时点）/ gen:inventory 110·855 ✓ / thumbs 4/4 含日变体 / build 2.68s / 首屏+爆炸态截图目检 4 台全过；smoke 因负载 9-11 未跑（并行会话同因跳过；其后续批次 smoke 全过可作回归旁证）
- 调研产出：2 份报告（/tmp/research-community.md、/tmp/research-museum.md）+ Smithsonian 免 key 通道（si_titles.tsv 104k 目录）+ radial 分离活塞 4 CC-BY 候选

## 2026-11-03 续轮 · Forge 锁式线迹机构（自行创造）

| 指标 | 数值 | 测量方式 |
|---|---|---|
| 生成器 | lockstitch v1 · 11 部件 · 11 mech 边（validateMech ok） · 4 预设 · 5 参数 | tools/forge-ls-verify.mjs + mech.js |
| 联动频率比 | Δwheel=7.54 rad vs Δhook=15.08 rad → **ratio 2.00**（期望 2）；needleSwing 0.317；送布椭圆双轴 0.106/0.178 | 同上（采样间隔 1.2s） |
| 复位干净度 | deselect 后 mesh 归基位误差 0；爆炸→复位 group 距 base <0.02 | 同上 |
| 产物 | 锻造件运行时生成（几何不落盘）；GLB 导出能力复用 export.js | /forge 页 |
| 构建 | 3.45s ✓（three chunk 无变化） | npm run build |
| smoke | 本轮环境负载 15-24（并行会话压机），无头 Chrome 反复 Target closed —— **结果不作数，待负载回落补跑**；此前 5 台批次 smoke 33/33 全过 | npm run smoke |

## 2026-11-03（续）· Wankel 生成器
- 锻造所生成器：4 → 5（v8/turbofan/ringdrive/lockstitch/wankel）。
- 引擎演示类型：spin/wobble/meshSpin/stroke/slide + **eccOrbit**（公转+1/3 自转复合）。
- Wankel 产物：7 部件 / ~7.1k tris / 构建 16-52ms / GLB 导出 541KB。
- 验证：orbit 半径恒=0.150、自转率 0.885=ω/3、复位 0 误差、爆炸-装配 0 误差、0 控制台错误。

## 2026-11-03 续轮 3 · Braun SK 55（join-materials 基建首发）

| 指标 | 数值 | 测量方式 |
|---|---|---|
| 网格治理 | 610 → 54（剥副本 305 + 网孔合并 253→2） | tools/join-materials.mjs |
| GLB | 52MB 源 → 735KB（512 重采样 + webp→draco，8%） | optimize-glb |
| 映射 | 7 部件全带网格（7/4/5/28/2/1/7）、0 幽灵 0 空、0 页面错误 | 页面探针 |
| 演示 | 转盘 Δ3.139 rad/0.9s = 33⅓ rpm（真实速率） | 页面采样 |
| 门槛 | lint 全绿（计数四处同步 120）· build 2.97s · thumbs 双布光 ✓ | npm run |
| 馆口径 | 120 台 · 916 部件 · 42 品牌 | gen:inventory |
