# 校准与映射决策表

> SKILL.md 第 3、4、6 步的查询手册。只在本文件被引用时读入。

## 来源优先级与许可

| 优先级 | 来源 | 方式 | 许可注意 |
|---|---|---|---|
| 1 | 厂商官网产品页 AR 资产 | GLB / USDZ 直链 | 仅限本机研究/演示，勿再分发 |
| 2 | 官方 3D 模型仓库（如 Flipper 官方仓库） | 下载后转换 | 遵守其许可（GPL 等），`modelCredit` 注明 |
| 3 | Sketchfab 等社区模型 | 下载 GLB | CC-BY 必须在 `modelCredit` 署名 |
| 兜底 | 程序化建模 | `_kit/internals.js` 参数化构件 | 无外部许可问题 |

## 映射方式决策（按资产命名质量从上往下匹配）

| 资产情况 | 用法 |
|---|---|
| 网格名有意义（`Main_Display`…） | `mapping: { '网格名': 'partId' }` |
| 材质名有意义 | `materialMapping: { '材质名': 'partId' }` |
| 有统一前缀规律 | `mappingPrefix: { 'BackCam': 'camera' }` |
| 完全匿名（01…06） | `mapByPosition(name, p, rel)` 按坐标聚类；`p` 是资产原生本地坐标（尺度不定，先看页面 `__RAW.rel` 的分布再定阈值） |
| 什么都不配 | 全部进 `unmappedTo`（默认 `'shell'`）——几乎总是错的 |

反向校验：所有值必须存在于 `parts[].id`，`npm run lint:devices` 会拦，但写的时候就该对齐。

## 朝向与尺度

- `frontAxis`：声明资产原生"机头/屏幕法线"轴（`±x` / `±z`），引擎旋转到 +Z 朝观众。资产屏幕朝 -Z 就写 `'-z'`。
- 拿不准：配 `orientationProbe: ['A部件','B部件']`——A 应在屏幕一侧，引擎按两者世界 z 均值自动翻转 180°。
- `normalize: 'full'`：平铺/直立、长轴方向任意的资产用它（按最大维缩放）；常规立式资产可省略。
- `targetWidth`：归一化后最大维的视觉尺寸（手机 13–15、笔记本 12–13、台式/显示器 12–13.5、小件 6–11）。

## camDist（首页固定机位竖向覆盖 ≈ 12.3 单位）

`targetWidth ≤ 12` 可省略；`> 12` 必配 `camDist ≈ targetWidth / 12.3 × 1.05`（手机 1.2、笔记本/台式 1.2–1.3）。漏配 = 设备首页顶部/底部出框。

## 部件与爆炸

- `parts[].ex` = 爆炸偏移 `[x,y,z]`（世界系：x 右、y 上、z 朝观众）。惯例：屏幕 +z、背盖 -z、电池下坠、主板上浮；手机类参考 `src/devices/_kit/factory.js` 的 `EX.phone` 表。
- `parts[].lo` = 标签锚点偏移，一般 `[0,1.x,0]`（标签挂部件顶上）。
- 程序化内构件：`builders[id]` 生成几何，`postLoad` 里用 `anchorParts({ procId: { ref:'realPartId', dx,dy,dz } })` 锚定到实机包围盒；多个用 `composePostLoad()` 组合。
- ⚠️ partId 全表唯一：实机件与程序件不得同名（历史 bug：zfold7/zflip7 的 `camera` 撞名，详情面板永远指向先注册者）。

## 屏幕点亮

- `makeTex(w, h, drawFn)` 画 UI（手机 512×1024 竖、相机 768×512 横），引擎 `addLiveScreen(pid, facing, tex, canvas, cover)`：`facing > 0` 贴部件 bbox max.z 侧，`< 0` 贴 min.z 侧；`cover` 控制占面比（0.9 左右）。
- 动态 UI（时钟/电量）在 `device.tick(dt)` 里重绘 canvas 并 `needsUpdate`。

## 校准清单（第 6 步逐项过，全绿才进第 7 步）

- [ ] 首页视角整机入画（`targetWidth ≤ 12.3 × camDist`）
- [ ] 朝向正确：屏幕/镜头朝观众（用了 orientationProbe 的复查一次翻转结果）
- [ ] 爆炸方向直觉合理：部件互不穿模、分离后仍大致保持装配序列感
- [ ] 标签互不遮挡、锚点贴合部件顶部
- [ ] 屏幕点亮且方向/比例正确
- [ ] 逐个点击部件，右侧详情面板内容对应（没归错壳）
- [ ] `npm run lint:devices` 通过
- [ ] 缩略图可辨识；不满意改设备配置 `thumbDir:[x,y,z]` 后 `npm run thumbs -- --only <id>`
- [ ] `npm run gen:inventory` 更新清单、`npm run build` 回归
