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
