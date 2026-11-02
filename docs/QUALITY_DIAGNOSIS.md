# QUALITY DIAGNOSIS · 模型质量诊断报告

> 生成：2026/11/3 01:43:32 · 工具：`tools/quality-diagnose.mjs`（运行 `node tools/quality-diagnose.mjs` 重新生成，勿手改本报告数据表）。
> 依据：V2 权威任务书第八章。诊断只报告事实，不自动修改模型（8.1：用户低分 ≠ 直接改模型）。
> 追溯（8.4）：原始模型 `vendor/assets/originals/` · 修改记录 `AUTONOMOUS_LOG.md` + git log · 回滚 `git checkout <commit> -- <file>`。

## 总览

- 设备总数：**119**
- quality 已定级：**20** 台（A/B/C/D 口径见 DESIGN_SYSTEM）· 其余待核
- GLB 就绪/压缩：**119/119**
- 署名合规：**119** 台 · 来源链接：**119** 台
- NC（非商业）资产：3 台
- 挂屏设备策略注释：119/119 台

## 设备明细

| id | 分级 | GLB | draco | 署名 | 来源 | NC | tour | xray | 部件 | 屏幕注 |
|---|---|---|---|---|---|---|---|---|---|---|
| action5pro | ⚪ 待核 | 1240.1 KB | ✓ | ✓ | ✓ |  | 14 | ✓ | 14 | ✓ |
| action4 | ⚪ 待核 | 363.5 KB | ✓ | ✓ | ✓ |  | 14 | ✓ | 14 | ✓ |
| pocket3 | ⚪ 待核 | 962.3 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| mini4pro | ⚪ 待核 | 1689.2 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| avata2 | ⚪ 待核 | 1066.4 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| mavic3pro | ⚪ 待核 | 1939.8 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| s25-ultra | ⚪ 待核 | 327.2 KB | ✓ | ✓ | ✓ |  | 15 | ✓ | 15 | ✓ |
| s25-plus | ⚪ 待核 | 237 KB | ✓ | ✓ | ✓ |  | 14 | ✓ | 14 | ✓ |
| s25 | ⚪ 待核 | 246.1 KB | ✓ | ✓ | ✓ |  | 14 | ✓ | 14 | ✓ |
| zfold7 | ⚪ 待核 | 687.3 KB | ✓ | ✓ | ✓ |  | 15 | ✓ | 15 | ✓ |
| zflip7 | ⚪ 待核 | 568.5 KB | ✓ | ✓ | ✓ |  | 14 | ✓ | 14 | ✓ |
| galaxy-s22-ultra | ⚪ 待核 | 400.1 KB | ✓ | ✓ | ✓ | NC | 13 | ✓ | 13 | ✓ |
| phone3 | ⚪ 待核 | 705.6 KB | ✓ | ✓ | ✓ |  | 12 | ✓ | 12 | ✓ |
| phone4apro | ⚪ 待核 | 3858.4 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| phone3alite | ⚪ 待核 | 1146.8 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| vision-pro | ⚪ 待核 | 4421.3 KB | ✓ | ✓ | ✓ |  | 10 | ✓ | 10 | ✓ |
| mac-studio | ⚪ 待核 | 551.7 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| mac-mini | ⚪ 待核 | 523.3 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| macbook-pro | ⚪ 待核 | 737.3 KB | ✓ | ✓ | ✓ |  | 9 | ✓ | 9 | ✓ |
| imac | ⚪ 待核 | 989.2 KB | ✓ | ✓ | ✓ |  | 9 | ✓ | 9 | ✓ |
| ipad-pro | ⚪ 待核 | 918.4 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| airpods-max | ⚪ 待核 | 2189.8 KB | ✓ | ✓ | ✓ |  | 8 | ✓ | 8 | ✓ |
| airpods-pro | ⚪ 待核 | 1067.4 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| watch-ultra | ⚪ 待核 | 2901.7 KB | ✓ | ✓ | ✓ |  | 10 | ✓ | 10 | ✓ |
| iphone-air | ⚪ 待核 | 559.9 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| iphone-17 | ⚪ 待核 | 531.4 KB | ✓ | ✓ | ✓ |  | 10 | ✓ | 10 | ✓ |
| macbook-air | ⚪ 待核 | 801 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| ipad-air | ⚪ 待核 | 967.5 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| airpods-5 | ⚪ 待核 | 1002.2 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| studio-display | ⚪ 待核 | 606.7 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| airtag | ⚪ 待核 | 118.4 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| iphone-18-pro-max | ⚪ 待核 | 499.8 KB | ✓ | ✓ | ✓ |  | 10 | ✓ | 10 | ✓ |
| iphone-18-pro-max-burgundy | ⚪ 待核 | 531.2 KB | ✓ | ✓ | ✓ |  | 10 | ✓ | 10 | ✓ |
| iphone-duo-fold | ⚪ 待核 | 586.5 KB | ✓ | ✓ | ✓ |  | 9 | ✓ | 9 | ✓ |
| iphone-12-teardown | 🟢 A | 4692.5 KB | ✓ | ✓ | ✓ |  | 23 | ✓ | 23 | ✓ |
| iphone-13 | ⚪ 待核 | 173.7 KB | ✓ | ✓ | ✓ |  | 12 | ✓ | 12 | ✓ |
| iphone-16 | ⚪ 待核 | 278.6 KB | ✓ | ✓ | ✓ |  | 12 | ✓ | 12 | ✓ |
| nikon-d6 | ⚪ 待核 | 1904.6 KB | ✓ | ✓ | ✓ |  | 9 | ✓ | 9 | ✓ |
| nikon-z6 | ⚪ 待核 | 2726.6 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| porsche-911-carrera-4s | ⚪ 待核 | 4436.6 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| countach-lpi800-4 | ⚪ 待核 | 1916.3 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| porsche-911-930 | ⚪ 待核 | 5984.5 KB | ✓ | ✓ | ✓ |  | 9 | ✓ | 9 | ✓ |
| v6-engine | 🟡 B | 9681.2 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| v8-engine | 🟡 B | 5904.2 KB | ✓ | ✓ | ✓ |  | 8 | ✓ | 8 | ✓ |
| combustion-engine | 🟡 B | 6909.8 KB | ✓ | ✓ | ✓ | NC | 7 | ✓ | 7 | ✓ |
| jet-engine | 🟡 B | 4525.3 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| hydraulic-jack | ⚪ 待核 | 956.5 KB | ✓ | ✓ | ✓ | NC | 6 | ✓ | 6 | ✓ |
| ak-47 | ⚪ 待核 | 3928.3 KB | ✓ | ✓ | ✓ |  | 17 | ✓ | 17 | ✓ |
| walther-p99 | ⚪ 待核 | 1994.6 KB | ✓ | ✓ | ✓ |  | 15 | ✓ | 15 | ✓ |
| m4-carbine | ⚪ 待核 | 59 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| gl-06-launcher | ⚪ 待核 | 2832.1 KB | ✓ | ✓ | ✓ |  | 8 | ✓ | 8 | ✓ |
| hubble-telescope | ⚪ 待核 | 4077.5 KB | ✓ | ✓ | ✓ |  | 8 | ✓ | 8 | ✓ |
| perseverance-rover | ⚪ 待核 | 2859.8 KB | ✓ | ✓ | ✓ |  | 12 | ✓ | 12 | ✓ |
| inside-drone | ⚪ 待核 | 727.4 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| switch-oled | ⚪ 待核 | 228.4 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| switch-2 | ⚪ 待核 | 975.5 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| flipper-zero | ⚪ 待核 | 121.1 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| framework-laptop13 | ⚪ 待核 | 595.6 KB | ✓ | ✓ | ✓ |  | 13 | ✓ | 13 | ✓ |
| modular-smartphone | ⚪ 待核 | 854.8 KB | ✓ | ✓ | ✓ |  | 10 | ✓ | 10 | ✓ |
| swiss-escapement | 🟡 B | 863.8 KB | ✓ | ✓ | ✓ |  | 9 | ✓ | 9 | ✓ |
| orrery | ⚪ 待核 | 2540.6 KB | ✓ | ✓ | ✓ |  | 13 | ✓ | 13 | ✓ |
| radio-transceiver | ⚪ 待核 | 3557.8 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| drill-press | ⚪ 待核 | 1341.2 KB | ✓ | ✓ | ✓ |  | 10 | ✓ | 10 | ✓ |
| vintage-microscope | 🟡 B | 994.4 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| pocket-watch | ⚪ 待核 | 847.8 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| portable-cassette-player | ⚪ 待核 | 1748.4 KB | ✓ | ✓ | ✓ |  | 3 | ✓ | 3 | ✓ |
| retro-multimeter | ⚪ 待核 | 591.7 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| hand-drill | ⚪ 待核 | 2461.5 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| digital-watch | ⚪ 待核 | 1202.7 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| alarm-clock | ⚪ 待核 | 1183.8 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| cash-register | ⚪ 待核 | 862.5 KB | ✓ | ✓ | ✓ |  | 2 | ✓ | 2 | ✓ |
| retro-console | ⚪ 待核 | 843.3 KB | ✓ | ✓ | ✓ |  | 2 | ✓ | 2 | ✓ |
| hypoid-gear | 🟡 B | 261.7 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| computer-parts | 🟡 B | 6217.1 KB | ✓ | ✓ | ✓ |  | 9 | ✓ | 9 | ✓ |
| filmstrip-projector | ⚪ 待核 | 1416.3 KB | ✓ | ✓ | ✓ |  | 13 | ✓ | 13 | ✓ |
| wall-clock | ⚪ 待核 | 489.3 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| planetary-gearbox | 🟡 B | 1015.5 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| kitchen-blender | ⚪ 待核 | 206.4 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| pinball-machine | ⚪ 待核 | 1147.9 KB | ✓ | ✓ | ✓ |  | 9 | ✓ | 9 | ✓ |
| triple-engine | 🟡 B | 618.1 KB | ✓ | ✓ | ✓ |  | 10 | ✓ | 10 | ✓ |
| gramophone | ⚪ 待核 | 924 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| grand-piano | ⚪ 待核 | 105.2 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| radial-engine | 🟡 B | 5118.4 KB | ✓ | ✓ | ✓ |  | 3 | ✓ | 3 | ✓ |
| vintage-binocular | 🟡 B | 1381.3 KB | ✓ | ✓ | ✓ |  | 8 | — | 8 | ✓ |
| manual-gearbox | 🟡 B | 1314.6 KB | ✓ | ✓ | ✓ |  | 8 | — | 8 | ✓ |
| wankel-engine | 🟠 C | 2873 KB | ✓ | ✓ | ✓ |  | 5 | — | 5 | ✓ |
| fresnel-lens | ⚪ 待核 | 909 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 8 | ✓ |
| refractor-telescope | ⚪ 待核 | 350.8 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| fire-hydrant | ⚪ 待核 | 428.1 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| seadogs-compass | ⚪ 待核 | 1601.3 KB | ✓ | ✓ | ✓ |  | 3 | ✓ | 3 | ✓ |
| vintage-stapler | ⚪ 待核 | 401.3 KB | ✓ | ✓ | ✓ |  | 3 | ✓ | 3 | ✓ |
| vintage-microwave | ⚪ 待核 | 900 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| santacruz-v10 | ⚪ 待核 | 4594.2 KB | ✓ | ✓ | ✓ |  | 17 | ✓ | 17 | ✓ |
| royal-typewriter | ⚪ 待核 | 1247.6 KB | ✓ | ✓ | ✓ |  | 10 | ✓ | 10 | ✓ |
| eumig-projector | ⚪ 待核 | 394.3 KB | ✓ | ✓ | ✓ |  | 8 | ✓ | 8 | ✓ |
| vcr-hanseatic | ⚪ 待核 | 1441.6 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| tr-808 | ⚪ 待核 | 1282.8 KB | ✓ | ✓ | ✓ |  | 11 | ✓ | 11 | ✓ |
| cherry-mx-switch | ⚪ 待核 | 1176.4 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| polaroid-coolcam | ⚪ 待核 | 1118.7 KB | ✓ | ✓ | ✓ |  | 8 | ✓ | 8 | ✓ |
| casio-vl-tone | ⚪ 待核 | 356.5 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| marshall-jcm800 | 🟡 B | 1949.3 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| sony-tc510 | ⚪ 待核 | 1684 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| angle-grinder | ⚪ 待核 | 887.2 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| smeg-toaster | ⚪ 待核 | 280.4 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| tourbillon-movement | 🟡 B | 855.2 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| gameboy | ⚪ 待核 | 1127.6 KB | ✓ | ✓ | ✓ |  | 7 | ✓ | 7 | ✓ |
| door-lock-mechanism | ⚪ 待核 | 784.7 KB | ✓ | ✓ | ✓ |  | 3 | ✓ | 3 | ✓ |
| retro-fan | ⚪ 待核 | 433.1 KB | ✓ | ✓ | ✓ |  | 3 | ✓ | 3 | ✓ |
| fender-stratocaster | ⚪ 待核 | 1650.7 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| commodore-64 | ⚪ 待核 | 2476.1 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| admiral-7t10 | ⚪ 待核 | 2551.4 KB | ✓ | ✓ | ✓ |  | 4 | ✓ | 4 | ✓ |
| we500-rotary-phone | ⚪ 待核 | 1105.3 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| regency-tr1 | 🟡 B | 503.9 KB | ✓ | ✓ | ✓ |  | 2 | ✓ | 2 | ✓ |
| curta-type2 | 🟡 B | 9736 KB | ✓ | ✓ | ✓ |  | 8 | ✓ | 8 | ✓ |
| ingenuity-helicopter | ⚪ 待核 | 737.9 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| parker-solar-probe | ⚪ 待核 | 246.8 KB | ✓ | ✓ | ✓ |  | 6 | ✓ | 6 | ✓ |
| spitzer-space-telescope | ⚪ 待核 | 242.1 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| chandra-x-ray-observatory | ⚪ 待核 | 232.1 KB | ✓ | ✓ | ✓ |  | 5 | ✓ | 5 | ✓ |
| jwst | 🟡 B | 3356.6 KB | ✓ | ✓ | ✓ |  | 10 | — | 10 | ✓ |

## 待办问题（4 台）

- **vintage-binocular**：
  - 无 xrayShellIds（X-Ray 走 realPartIds 兜底）
- **manual-gearbox**：
  - 无 xrayShellIds（X-Ray 走 realPartIds 兜底）
- **wankel-engine**：
  - 无 xrayShellIds（X-Ray 走 realPartIds 兜底）
- **jwst**：
  - 无 xrayShellIds（X-Ray 走 realPartIds 兜底）

## 运行时专项（需浏览器，见 tools/）

- 装配映射准确性（3.4 零网格/幽灵部件）：`node tools/mapping-verify.mjs`
- 屏幕方案取证：`node tools/screen-audit.mjs` + `tools/overlay-ab.mjs`
- 取景尺度护栏：smoke「m4 取景尺度护栏」断言（hullRadius ∈ [2,30]）
- 帧率观察：`node tools/fps-probe.mjs`（软件渲染参考值）

## 用户评分参考（8.1 理念）

用户评分存于本机 localStorage `dtm.ratings`，不上传。质量改进参考流程：
1. 收到低分维度（如「内部结构还原度」2 星）→
2. 对照本报告该设备的映射/屏幕/署名事实 →
3. 人工核实参考资料后走 convert-asset SOP 修复 →
4. 记录追溯（原始版本/时间/原因/回滚）于 AUTONOMOUS_LOG。
