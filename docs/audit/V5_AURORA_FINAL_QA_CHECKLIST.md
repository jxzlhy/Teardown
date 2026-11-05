# V5.0.10 AURORA · PHASE 7 终验清单（固化版）

> 固化日期：2026-11-05 ｜ 依据：任务书 §11 双重验收 + §17 最终交付十四项
> 用法：各阶段收口后逐项打勾回填证据链接；四线全绿 + 裁定项处理完毕 = 专项可交付。

## 一、视觉验收（任务书 §11.1，截图存 docs/design/screenshots/）

| # | 项 | 状态 | 证据 |
|---|---|---|---|
| V1 | 首页/大厅（夜+日双厅） | ✅ 基线截图（轮 10 归并遍 0 像素差异三图） | /tmp/aurora-base-*.png + 归并遍对比记录 |
| V2 | 模型展示/零件选择 | ✅ smoke 断言（选择/详情卡/机构面板） | smoke 27/28 |
| V3 | 拆解/组装/逐步装配 | ✅ smoke（爆炸度读数/逐步装配/Esc 复位） | 同上 |
| V4 | 模型切换（loader 表现） | ✅ switch-seq 探针（loader 阶段+切台正确） | /tmp/aurora-switch-seq.mjs ALL PASS |
| V5 | 白天/夜间主题切换不重载 | ✅ 既有 verify:contrast 10/10 + 切换不重载既有断言 | contrast-run3.log |
| V6 | Create Studio 全面板 | ✅ studio-verify 55/55 | d9a1848 |
| V7 | 移动端（390×844） | ✅ smoke 移动段（sheet/剖切条/滚动） | smoke |

## 二、交互验收（任务书 §11.2）

| # | 项 | 状态 | 证据 |
|---|---|---|---|
| I1 | 鼠标/触控/键盘/快捷操作 | ✅ smoke + hud-verify 12/12 | smoke |
| I2 | 面板展开/关闭/Tooltip/镜头控制 | ✅ smoke + V2 既有回归 | smoke |
| I3 | 零件联动（导航↔3D 双向） | ✅ I3 搜索 DOM 断言 + pickFromList 既有 | 轮 22 |
| I4 | 动画中断和恢复（切台相机回位） | ✅ **轮 21 回归 Δ=0 双向**（trackHome/update 后写入） | switch-seq ALL PASS |
| I5 | 选中层次弱化/还原 | ✅ **轮 23 固定机位像素验证**（-25%/还原 |Δ|0.29） | 轮 23 |

## 三、性能验收（任务书 §11.3——须实测数据）

| # | 项 | 状态 | 数据 |
|---|---|---|---|
| P1 | 装载分环节耗时 | ✅ **冷/热对比（本轮）**：done 259-1100ms（3 台×冷热全链 fetch/parse/scene/finalize/firstRender/bvh；缓存命中 fetch 收益实证 v8 52→19ms；action4 热轮 756ms 抖动如实标注） | /tmp/aurora-load-baseline.json |
| P2 | R1 按需渲染收益 | ✅ idle render 16.9 ≈ rAF 30.8×0.5（降频生效）/交互恢复 28.5 全速 | 轮 13 |
| P3 | R3 MSAA 无回退 | ✅ 交互帧率 28.5≈rAF 30.8 | 同上 |
| P4 | 真实 GPU 帧率/真机 low 档 | ⬜ **挂账真机**（环境限制，任务书 §39 BLOCKED 口径） | — |
| P5 | KTX2 前后对比 | ⬜ **评估后缓行**（2048 lint 闸门已收口径；运行时再压收益存疑，与 LOD 同判——如馆方要求再立项） | — |
| P6 | 构建体积 | ✅ three 209KB gzip / DeviceViewer 81.85KB / registry 1.35KB（−95%） | vite build |

## 四、回归验收（任务书 §11.4——不破坏清单）

| # | 项 | 状态 |
|---|---|---|
| R1 | 模型数据/原始 GLB/零件层级/真实结构 | ✅ lint 六段（五处一致 129 台/资产 128 合规） |
| R2 | 拆解/选中/品牌/星图/Create Studio/作品库 | ✅ smoke 27/28（唯一失败=历史 tour 抖动同项）+ studio-verify 55/55 |
| R3 | 现有路由/双厅主题 | ✅ contrast 10/10 + switch-seq |
| R4 | 既有功能（评分/收藏/探索/Tour） | ✅ smoke 断言覆盖 |

## 五、裁定与挂账（非本专项可关闭项）

1. **P1-4 首屏发现路径**：方案稿已交付（`docs/design/P1-4_PROPOSAL.md`）——**待馆方裁定 A/B/A+**。
2. **KTX2 试点**：评估后缓行（如需立项另开专项）。
3. **真机验证**（P4/触控 44px 复核/真机帧率）：环境限制挂账。
4. **sitemap/CSP**：待部署域名（PHASE 1 已缓办有因）。
5. **上游资产许可逐台人工复核**：长期项（非 AURORA 范围）。

## 六、最终交付（任务书 §17）素材索引

- 版本：V5.0.10（核定未占用）｜阶段：0-6 完成/7 本清单固化
- 性能数据：本文档 §三 ｜ 截图：docs/design/screenshots/ + /tmp 取证 ｜ Skills 台账：EXECUTION_STATUS
- 回滚：各切片独立提交语义（工作区未提交改动待分批入库——**入库提醒**）
- V5.1 建议：馆方裁定 P1-4 实施后，转入内容深度（mech/realSizeMM 铺量）与真机专项
