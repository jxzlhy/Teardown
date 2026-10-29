# 已有模型清单（防重复登记表 · 自动生成）

> 生成时间：2026-10-30 · 由 `tools/gen-inventory.mjs` 扫描 `src/devices/registry.js` + `public/assets/` 生成
> **本文件不要手改** —— 改动请跑 `npm run gen:inventory` 重新生成。
> 当前：**93 台设备** · 767 个部件 · 93 套 GLB · 30 个品牌

## 查重三步（新增前必做）

1. 查本表各品牌板块的机型名；
2. 快速命令确认：
   ```bash
   ls /Users/admin/Desktop/jxz/DJI/public/assets/ | grep <关键词>
   grep -ri "<关键词>" /Users/admin/Desktop/jxz/DJI/src/devices/registry.js
   ```
3. 都没有才走新增流程（`npm run add -- --id <id> --zh <名称> --en <EN> --brand <品牌> --category <分类>` 生成脚手架 → USDZ/GLB 转换后放 `public/assets/` → 补配置 → `registry.js` 注册）。

## 命名约定

- GLB 文件名 = 设备 id（kebab-case），如 `mac-studio.glb` ↔ `id: 'mac-studio'`；
- 已知例外：`switch2.js` 里 `id: 'switch-2'`、`glb: '/assets/switch-2.glb'`（文件名带连字符、模块名不带）；
- 源模型统一转好后放 `public/assets/`，`dist/assets/` 只是构建产物、**不要当参考**；
- 设备配置（`src/devices/<id>.js`）新增后跑 `npm run lint:devices` 校验映射引用。

### DJI（6 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| action5pro | DJI Osmo Action 5 Pro | 相机 | 14 | 官方 | action5pro.glb | 1.2 MB |
| action4 | DJI Osmo Action 4 | 相机 | 14 | 官方 | action4.glb | 364 KB |
| pocket3 | DJI Osmo Pocket 3 | 相机 | 7 | 官方 | pocket3.glb | 962 KB |
| mini4pro | DJI Mini 4 Pro | 无人机 | 6 | 官方 | mini4pro.glb | 3.0 MB |
| avata2 | DJI Avata 2 | 无人机 | 4 | 官方 | avata2.glb | 2.3 MB |
| mavic3pro | DJI Mavic 3 Pro | 无人机 | 7 | 官方 | mavic3pro.glb | 1.9 MB |

### SAMSUNG（6 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| s25-ultra | Samsung Galaxy S25 Ultra | 手机 | 15 | 官方 | s25-ultra.glb | 327 KB |
| s25-plus | Samsung Galaxy S25+ | 手机 | 14 | 官方 | s25-plus.glb | 237 KB |
| s25 | Samsung Galaxy S25 | 手机 | 14 | 官方 | s25.glb | 246 KB |
| zfold7 | Samsung Galaxy Z Fold7 | 折叠屏 | 15 | 官方 | zfold7.glb | 687 KB |
| zflip7 | Samsung Galaxy Z Flip7 | 折叠屏 | 14 | 官方 | zflip7.glb | 568 KB |
| galaxy-s22-ultra | Samsung Galaxy S22 Ultra | 手机 | 13 | 社区 | galaxy-s22-ultra.glb | 400 KB |

### NOTHING（3 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| phone3 | Nothing Phone (3) | 手机 | 12 | 官方 | phone3.glb | 789 KB |
| phone4apro | Nothing Phone (4a) Pro | 手机 | 6 | 官方 | phone4apro.glb | 7.8 MB |
| phone3alite | Nothing Phone (3a) Lite | 手机 | 7 | 官方 | phone3alite.glb | 1.1 MB |

### APPLE（22 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| vision-pro | Apple Vision Pro | 头显 | 10 | 官方 | vision-pro.glb | 4.3 MB |
| mac-studio | Apple Mac Studio | 台式机 | 7 | 官方 | mac-studio.glb | 552 KB |
| mac-mini | Apple Mac mini (M4) | 台式机 | 7 | 官方 | mac-mini.glb | 523 KB |
| macbook-pro | Apple MacBook Pro 14″ (M4) | 笔记本 | 9 | 官方 | macbook-pro.glb | 737 KB |
| imac | Apple iMac 24″ (M4) | 台式机 | 9 | 官方 | imac.glb | 989 KB |
| ipad-pro | Apple iPad Pro 13″ (M4) | 平板 | 6 | 官方 | ipad-pro.glb | 918 KB |
| airpods-max | Apple AirPods Max | 耳机 | 8 | 官方 | airpods-max.glb | 2.1 MB |
| airpods-pro | Apple AirPods Pro 2 | 耳机 | 7 | 官方 | airpods-pro.glb | 1.0 MB |
| watch-ultra | Apple Watch Ultra | 穿戴 | 10 | 官方 | watch-ultra.glb | 2.8 MB |
| iphone-air | Apple iPhone Air | 手机 | 7 | 官方 | iphone-air.glb | 560 KB |
| iphone-17 | Apple iPhone 17 | 手机 | 10 | 官方 | iphone-17.glb | 531 KB |
| macbook-air | Apple MacBook Air 15″ (M4) | 笔记本 | 7 | 官方 | macbook-air.glb | 801 KB |
| ipad-air | Apple iPad Air 11″ (M3) | 平板 | 6 | 官方 | ipad-air.glb | 967 KB |
| airpods-5 | Apple AirPods 5 | 耳机 | 7 | 官方 | airpods-5.glb | 1002 KB |
| studio-display | Apple Studio Display | 台式机 | 6 | 官方 | studio-display.glb | 607 KB |
| airtag | Apple AirTag | 穿戴 | 4 | 官方 | airtag.glb | 118 KB |
| iphone-18-pro-max | Apple iPhone 18 Pro Max | 手机 | 10 | 官方 | iphone-18-pro-max.glb | 500 KB |
| iphone-18-pro-max-burgundy | Apple iPhone 18 Pro Max 酒红 | 手机 | 10 | 官方 | iphone-18-pro-max-burgundy.glb | 531 KB |
| iphone-duo-fold | Apple iPhone Duo 折叠屏 | 手机 | 9 | 官方 | iphone-duo-fold.glb | 586 KB |
| iphone-12-teardown | Apple iPhone 12 全拆解 | 手机 | 23 | 社区 | iphone-12-teardown.glb | 6.4 MB |
| iphone-13 | Apple iPhone 13 | 手机 | 12 | 社区 | iphone-13.glb | 261 KB |
| iphone-16 | Apple iPhone 16 | 手机 | 12 | 社区 | iphone-16.glb | 279 KB |

### NIKON（2 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| nikon-d6 | Nikon D6 | 相机 | 9 | 社区 | nikon-d6.glb | 3.3 MB |
| nikon-z6 | Nikon Z6 | 相机 | 8 | 社区 | nikon-z6.glb | 3.9 MB |

### PORSCHE（2 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| porsche-911-carrera-4s | Porsche 911 Carrera 4S | 汽车 | 7 | 社区 | porsche-911-carrera-4s.glb | 4.3 MB |
| porsche-911-930 | Porsche 911 Turbo（930） | 汽车 | 9 | 社区 | porsche-911-930.glb | 9.1 MB |

### LAMBORGHINI（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| countach-lpi800-4 | Lamborghini Countach LPI 800-4 | 汽车 | 6 | 社区 | countach-lpi800-4.glb | 1.9 MB |

### GENERIC（28 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| v6-engine | V 型发动机（教学） | 机械 | 6 | 社区 | v6-engine.glb | 13.7 MB |
| v8-engine | V8 发动机（拆解态） | 机械 | 8 | 社区 | v8-engine.glb | 5.8 MB |
| combustion-engine | 直列内燃机（教学） | 机械 | 7 | 社区 | combustion-engine.glb | 6.7 MB |
| jet-engine | 涡轮喷气发动机 | 机械 | 4 | 社区 | jet-engine.glb | 4.4 MB |
| hydraulic-jack | 卧式液压千斤顶 | 机械 | 6 | 社区 | hydraulic-jack.glb | 956 KB |
| inside-drone | 无人机内部剖面 | 无人机 | 4 | 社区 | inside-drone.glb | 727 KB |
| swiss-escapement | 瑞士杠杆式擒纵机构 | 钟表 | 9 | 社区 | swiss-escapement.glb | 864 KB |
| orrery | 太阳系仪 | 科学仪器 | 13 | 社区 | orrery.glb | 2.5 MB |
| radio-transceiver | 军用电台收发机 | 无线电 | 7 | 社区 | radio-transceiver.glb | 3.5 MB |
| drill-press | 台式钻床 | 工具 | 10 | 社区 | drill-press.glb | 1.3 MB |
| vintage-microscope | 老式光学显微镜 | 科学仪器 | 7 | 社区 | vintage-microscope.glb | 994 KB |
| pocket-watch | 猎壳怀表 | 钟表 | 6 | 社区 | pocket-watch.glb | 848 KB |
| portable-cassette-player | 便携卡带机 | 音频 | 3 | 社区 | portable-cassette-player.glb | 1.7 MB |
| retro-multimeter | 指针万用表 | 工具 | 7 | 社区 | retro-multimeter.glb | 592 KB |
| hand-drill | 手摇曲柄钻 | 工具 | 4 | 社区 | hand-drill.glb | 2.4 MB |
| digital-watch | 数字腕表 | 穿戴 | 4 | 社区 | digital-watch.glb | 1.2 MB |
| alarm-clock | 机械闹钟 | 钟表 | 4 | 社区 | alarm-clock.glb | 1.2 MB |
| cash-register | 复古收银机 | 商用设备 | 2 | 社区 | cash-register.glb | 863 KB |
| retro-console | 立方游戏主机 | 游戏机 | 2 | 社区 | retro-console.glb | 843 KB |
| hypoid-gear | 准双曲面齿轮组 | 机械 | 4 | 社区 | hypoid-gear.glb | 262 KB |
| computer-parts | 电脑硬件全家福 | 电脑 | 9 | 社区 | computer-parts.glb | 6.1 MB |
| filmstrip-projector | 幻灯片条放映机 | 影音 | 13 | 社区 | filmstrip-projector.glb | 1.4 MB |
| wall-clock | 石英挂钟 | 钟表 | 4 | 社区 | wall-clock.glb | 489 KB |
| planetary-gearbox | 行星齿轮箱（CAD） | 机械 | 4 | 社区 | planetary-gearbox.glb | 1015 KB |
| kitchen-blender | 厨房搅拌机 | 厨电 | 6 | 社区 | kitchen-blender.glb | 206 KB |
| pinball-machine | 弹珠台 | 游戏 | 9 | 社区 | pinball-machine.glb | 1.1 MB |
| triple-engine | 直列三缸摩托车发动机 | 发动机 | 10 | 社区 | triple-engine.glb | 618 KB |
| gramophone | 手摇留声机 | 影音 | 4 | 社区 | gramophone.glb | 924 KB |

### KALASHNIKOV（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| ak-47 | AK-47 全拆解 | 枪械 | 17 | 社区 | ak-47.glb | 13.0 MB |

### WALTHER（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| walther-p99 | Walther P99 全机构拆解 | 枪械 | 15 | 社区 | walther-p99.glb | 6.2 MB |

### COLT（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| m4-carbine | M4 卡宾枪（结构示意） | 枪械 | 5 | 社区 | m4-carbine.glb | 59 KB |

### B&T（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| gl-06-launcher | B&T GL-06 | 枪械 | 8 | 社区 | gl-06-launcher.glb | 9.4 MB |

### NASA/ESA（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| hubble-telescope | 哈勃空间望远镜 | 航天 | 8 | 官方 | hubble-telescope.glb | 4.0 MB |

### NASA/JPL（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| perseverance-rover | 毅力号火星车 | 航天 | 12 | 官方 | perseverance-rover.glb | 2.8 MB |

### NINTENDO（2 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| switch-oled | Nintendo Switch OLED | 游戏机 | 6 | 社区 | switch-oled.glb | 228 KB |
| switch-2 | Nintendo Switch 2 | 游戏机 | 6 | 社区 | switch-2.glb | 975 KB |

### FLIPPER（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| flipper-zero | Flipper Zero | 极客工具 | 4 | 社区 | flipper-zero.glb | 121 KB |

### FRAMEWORK（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| framework-laptop13 | Framework Laptop 13 | 笔记本 | 13 | 社区 | framework-laptop13.glb | 596 KB |

### CONCEPT（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| modular-smartphone | 模块化概念手机 | 手机 | 10 | 社区 | modular-smartphone.glb | 855 KB |

### SANTA CRUZ（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| santacruz-v10 | Santa Cruz V10 速降山地车 | 自行车 | 17 | 社区 | santacruz-v10.glb | 4.5 MB |

### ROYAL（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| royal-typewriter | Royal 打字机 | 打字机 | 10 | 社区 | royal-typewriter.glb | 1.2 MB |

### EUMIG（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| eumig-projector | Eumig 胶片放映机 | 影音 | 8 | 社区 | eumig-projector.glb | 394 KB |

### HANSEATIC（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| vcr-hanseatic | Hanseatic VCR 200 录像机 | 影音 | 5 | 社区 | vcr-hanseatic.glb | 1.4 MB |

### ROLAND（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| tr-808 | Roland TR-808 节奏作曲机 | 音频 | 11 | 社区 | tr-808.glb | 1.3 MB |

### CHERRY（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| cherry-mx-switch | Cherry MX 轴体解剖 | 键盘 | 7 | 社区 | cherry-mx-switch.glb | 1.1 MB |

### POLAROID（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| polaroid-coolcam | Polaroid Cool Cam 拍立得 | 相机 | 8 | 社区 | polaroid-coolcam.glb | 1.1 MB |

### CASIO（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| casio-vl-tone | Casio VL-Tone 计算器琴 | 音频 | 4 | 社区 | casio-vl-tone.glb | 356 KB |

### MARSHALL（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| marshall-jcm800 | Marshall JCM800 音箱头 | 音频 | 4 | 社区 | marshall-jcm800.glb | 1.9 MB |

### SONY（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| sony-tc510 | Sony TC-510 磁带机 | 音频 | 5 | 社区 | sony-tc510.glb | 1.6 MB |

### DEWALT（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| angle-grinder | 角磨机（DeWalt D28136） | 工具 | 5 | 社区 | angle-grinder.glb | 887 KB |

### SMEG（1 台）

| id | 机型 | 分类 | 部件 | 模型 | GLB | 大小 |
|---|---|---|---|---|---|---|
| smeg-toaster | Smeg 烤面包机 | 厨电 | 6 | 社区 | smeg-toaster.glb | 280 KB |

