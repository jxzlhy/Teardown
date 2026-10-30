# 3D EXPERIENCE GUIDELINES · 3D 体验与拆解质量规范

> 引擎与资产管线的现行约定汇编。新增能力先对齐本文，改约定先改本文。

## 1. 取景与姿态

- 归一化：`targetWidth`（米）+ `normalize: 'full'`（平铺布局按整体包围盒）；`frontAxis` 声明正面轴（如 '+z'）；`orientationProbe` 记录朝向探测结论。
- 地面接触：设备底面贴 y=0 展台，禁止悬空/穿模；`baseRotation` 用于整体摆位（混合资产时必配）。
- 相机：进场从远缓推至取景框（主体占高 ≥70%，四周留白 ≥10%）；flyToPart 特写焦点对准部件包围盒中心，特写距离 ≤ 部件对角线 3 倍。
- 灯光/曝光：冷光主调，禁三灯全开堆亮度；白漆材质过曝时压暗而非关灯，黑壳材质防自发光糊死（Poly Haven 批次经验）。

## 2. 材质与部件（materials.js 9 预设）

- 新部件优先复用预设（matSilver/matGold/matScreen…），需要新材质先加预设再使用。
- 屏幕一律 CanvasTexture 实时绘制（paintPreviewScene + 设备 UI），不用死贴图。
- ⚠️ 材质分区 ≠ 独立零件：inspect 报告按**几何岛**判断，匿名网格用 `mapByPosition` 位置聚类映射（先读页面 `__RAW.rel` 实测名，多 primitive 带 `_N` 后缀用 startsWith）。

## 3. 爆炸与装配

- 爆炸方向沿部件真实装配路径（外壳沿法向分离、内构件沿抽拉方向），禁止"全部向上飞"；
- 爆炸后不得遮挡相邻部件的标签；`assembledPos` 必须精确复位（picked 状态复位验证）；
- 程序化内构件（builders/_kit）与真实模型部件**视觉风格一致**，并在 UI 如实标注示意性质。

## 4. 视图四态（view-modes.js 现行规则）

| 态 | 规则 |
|---|---|
| X-Ray | 仅外壳半透明（`xrayShellIds` 策展优先，无则 INTERNAL_KEYS 兜底）；**光学件不雾化**（NON_SHELL_KEYS） |
| Isolate | 非目标件透明度逐帧 lerp → 0.06；退出精确还原材质快照 |
| Clip | 无封盖实现：材质 DoubleSide 内壁 + accent 指示板；stencil 真封盖方案见 ROADMAP P2（需 stencilBuffer RenderTarget） |

进出任何模式：材质/阴影/depthWrite 快照还原必须无损（切换 N 次后状态不变）。

## 5. 标签

- `labelOffsets` 逐部件校准；两标签屏幕间距 <18px 视为遮挡（改 offset 或合并部件）；
- 游离说明卡不遮挡主体；移动端标签字号与触点半径随视口缩放。

## 6. 画质阶梯（engine 自适应）

| 级 | pixelRatio | 阴影 | 辉光/描边 |
|---|---|---|---|
| L2 | 满配 | 1024 | 开 |
| L1 | 1.5 | 1024 | 开 |
| L0 | 1 | 512 | 关 |

FPS <42 自动降级；新增特效必须声明自己在各档的形态（L0 至少降为静态/关闭）。

## 7. 新设备质量门槛（接入门禁）

1. inspect-glb 体检：网格数/材质数/几何岛/命名语义；匿名 CAD 走位置聚类并留档校准记录；
2. 部件可独立拾取/隐藏；真实件与示意件区分标注（不得把推测结构包装成官方事实）；
3. `tour`、`xrayShellIds`、`labelOffsets` 随接入配齐（marshall-jcm800 式无策展属历史特例）；
4. `npm run lint:devices` + `thumbs` + 浏览器实载 + 移动端特写检查（门锁/风扇教训：移动端也要能进特写）；
5. 署名合规：`modelCredit`/`modelSource` 必填，lint 禁止 "by community"。

## 8. 性能与释放

- 每设备加载后 GPU 资源可完整释放（切台 20 次内存平稳）；geometry/material 共享走 glbCache 层；
- 新增每帧逻辑前先问：能否走 `tick()` 单入口；禁止多处 rAF。

## 9. 未来工具态（Phase 2 预留位）

- 测量：BVH 取点吸附表面；显示 mm（反归一化）与展示单位双读数；
- 装配顺序：`assembleStep` 策展字段，逐步高亮，未标注部件归最后一步；
- 演示动画：一律挂部件详情卡"运行演示"，L0 画质与 reduced-motion 降级为静帧 + 文字说明。
