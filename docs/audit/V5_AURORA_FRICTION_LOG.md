# V5.0.10 AURORA · 验收期摩擦记录（Friction Log）

> 日期：2026-11-05 ｜ 覆盖：执行期轮 9–26
> 口径：friction-log Skill 的条目模式（What happened / Why it hurt / Fix / Status）；
> 该 Skill 的 GitHub issue 通道面向 educlopez/ui-craft 仓库，本项目不适用——落地为本地档。
> 用途：验收期真实摩擦留档，供后续会话避免重复踩坑；与记忆库互补（此处带项目上下文全链）。

## F-01 · 无头装载慢被误判为冻结（超时线违反既有规程）
- **What**：设备页装载 84.6s（软渲染饱和），探针 90-150s 超时线判「冻结」，5 轮取证+清场重试烧 ~1 小时。
- **Why**：记忆库已有「boot 放宽 300s」规程但未先查；时序采样（renderCount/loadTiming 数值在变=慢不是死）后才定性翻转。
- **Fix**：探针统一 420s + loadTiming.id 严格条件。**Status: 已修（探针 v2）**。规程引用已入记忆库。

## F-02 · 调试快照被当实时遥测（假遥测污染 5 轮取证）
- **What**：`__CAM.pos` 是 finalize 一次性快照；切台相机取证的 5 轮结论全部建立其上。
- **Why**：取遥测前未核对该钩子的写入时机（每帧 vs 一次性）。
- **Fix**：TEMP-DIAG 直写裁决实验定案 + `getState().camPos` 正式实时遥测转正。**Status: 已修**。
- **教训**：使用任何调试观测点前先确认写入时机。

## F-03 · 产品交互改动未同步无头验证通道
- **What**：studio 加 confirm() 后无头 CDP 通道挂死（对话框无 handler），曾被误判「OOM 冻结」。
- **Why**：改产品交互时未盘点验证工具链的对话框处理。
- **Fix**：studio-verify 加 `page.on('dialog')` 自动接受（RS-15b，并行会话完成）。**Status: 已修**。

## F-04 · 诊断钩子挂载位置引发 TDZ 全引擎崩溃
- **What**：`window.__CAMREF = camera` 挂在 camera 声明前 → `Cannot access 'camera' before initialization` → 装载全灭。
- **Why**：临时钩子插入时未检查声明顺序。
- **Fix**：挪至声明后；diag 探针（pageerror 采集）一轮抓出。**Status: 已修（钩子已随验证完成删除）**。

## F-05 · OrbitControls 覆盖外部相机写入（认知错误三次返工）
- **What**：tween/绝对赋值写 camera.position 被 update() 每帧用内部 spherical 重建恢复；先后尝试「跳过 update」「绝对赋值」均无效。
- **Why**：对 0.164 update 实现的认知错误（以为从 position 重算恒等）。
- **Fix**：**补间段移至 controls.update() 之后**（写入成为每帧最终状态）——结构性修复，Δ=0 双向回归。**Status: 已修（回归 ALL PASS）**。

## F-06 · verify:contrast 工具无护栏三连败
- **What**：reload 冻结/frame detached 使闸门连续三轮失败（含 21min launch 挂起），一度误标「环境挂账」。
- **Why**：工具无重试护栏（hud-verify 有而 contrast 没有同类）。
- **Fix**：reload×3 重试环 + 用例级换新页面重试 → 10/10 全绿。**Status: 已修**。

## F-07 · firstRenderMs 打点挂错块恒为 0
- **What**：打点挂 booted 块（引擎生命周期首帧，远早于 loadTiming 存在）→ 探针条件 firstRenderMs>0 恒假、二次超时。
- **Why**：「装载后首帧」的语义映射到错误的现有挂钩点。
- **Fix**：mainLoop 独立检查 doneMs>0 且未写→写。**Status: 已修（实测 firstRenderMs=1963/355 正确）**。

## F-08 · puppeteer waitForFunction 传参不可序列化
- **What**：传 RegExp 变 `{}`，页内 test 抛错。
- **Fix**：传字符串+includes。**Status: 已修（记忆库条目 1）**。

## F-09 · 辅助函数返回 sleep() 作布尔判据恒 continue
- **What**：`if(!(await waitServer(x))) continue` 恒真 → 全脚本静默空转，输出只剩 FAIL 行。
- **Fix**：判据函数显式 return 布尔 / 固定预热不做判据。**Status: 已修（记忆库条目 2）**。

## F-10 · 验证用测试词未先核对数据
- **What**：搜「镜头/lens」0 命中误判功能失效——iphone-13 部件名本不含这些词。
- **Why**：断言用例凭印象选词未查配置。
- **Fix**：import 配置数据核对后换词复测全绿。**Status: 已修（复测通过）**。

## 模式总结

反复出现的三类：**① 环境口径先行**（超时线/遥测时机/清场——先查既有规程再动手）；**② 工具与产品同步**（改交互/加钩子时同步验证通道与声明顺序）；**③ 假设验证成本**（认知错误类 F-05 烧掉三轮——首个数据点后应立即做最小裁决实验而非连续修复尝试）。
