# STUDIO ARCHITECTURE — 创作工作室（V5.0）

> 2026-11-03 立项。总任务书第七章（V5.0 CREATE STUDIO）首个落地模块。
> 纯前端、本地优先、自包含：不引入后端/账号/云端/AI 服务（总任务书 7.1 红线）。
> 与 `src/engine`、`src/forge` 同一分工哲学：**vanilla 核心模块 + 薄 Vue 壳**。

## 模块拓扑

```
src/studio/
├── importer.js     导入管线：File/ArrayBuffer → 守卫 → GLTFLoader.parse → 结构报告
├── diagnostics.js  本地规则诊断（10 条规则，severity 三级，逐条带节点定位）
├── viewer.js       轻量视口（渲染口径与主引擎一致，点选高亮，全量资源释放）
├── workshop.js     命令化编辑层（变换/材质，命令栈 50 + 重做 + 导入态快照复位）
├── exporter.js     GLB 导出（GLTFExporter 二进制 → Blob 下载）
├── library.js      IndexedDB 作品库（CRUD + 备份 JSON 往返）
└── index.js        编排器：状态机 + __STUDIO 调试钩子（与 __ENGINE 同约定）
```

壳层：`src/components/StudioView.vue`（八面板：导入/概览/层级树/诊断/编辑器/材质资源/参考图/作品库）。
路由：`/studio` 懒加载；构建实测 StudioView 独立 chunk（~28KB gzip 12KB），three 仅在 vite 预载映射按需出现，大厅首屏零负担。

## 数据流（状态机）

```
idle → parsing → ready ─┬→ (select) 编辑器草稿 → 应用 → 命令栈
                        └→ importFiles 失败 → error（六类错误分类面板）
```

- `importFrom` 返回的**结构报告**（plain object，含 three 对象引用）是唯一数据源：
  viewer（渲染）、diagnostics（规则输入）、workshop（快照基准）、UI（markRaw 后只读展示）。
- Vue 侧对报告**整体 markRaw**——禁止 reactive 深代理 three 场景图（惰性深代理赌不得）。
- `__STUDIO` 窗口钩子暴露全部编辑器 API，e2e 经它走与 UI 相同的调用路径。

## 真实性边界（UI 如实标注）

- 诊断 = 确定性规则检查，非 AI 推断（面板眉题「本地规则 · 非 AI 推断」）。
- 参考图 = 对照参考，**不承诺从图片推断几何**（单图无法可靠推断隐藏结构）。
- 作品库 = 浏览器本地 IndexedDB，清理站点数据会丢失 → 面板常驻警示 + 备份 JSON 导出/恢复通道。
- 导出 GLB = 编辑后实时场景（GLTFExporter 不压 draco，体积大于馆内压缩资产，如实呈现）。

## e2e 门禁

`node tools/studio-verify.mjs`（独立端口 8251，不与并行会话的 8211/8137 冲突）。
31 项断言：壳渲染/导入/层级联动/自动旋转/编辑器链（变换→撤销→重做→复位→材质→导出→撤销链排干→
工具条同步）/作品库往返（保存→列表→载入→备份→删除→恢复→非法拒收→清理）/参考图四断言/
错误路径组（损坏 GLB/复位恢复/.txt/空场景/?cap 体积守卫）/大厅懒加载边界/控制台零错误门。

环境护栏（OOM 冻结特征——并行会话批量任务期间新无头标签冻结/崩溃）：
- 壳启动 ×3 重试；?cap 步骤独立页面 ×3 重试；大厅边界独立页面 ×3 重试。
- 高负载（load>5）时段冒烟结果不作数（项目既有规程）；负载<5 窗口跑全绿。
