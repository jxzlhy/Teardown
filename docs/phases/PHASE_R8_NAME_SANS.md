# PHASE R8 · 名字层换装现代黑体（2026-10-31 第二轮追加）

> 承接 R7：webfont 思源宋体落地后，用户实机反馈「这不还是一样吗，没看出变化」。经 8200 实例核查确认新字体已在跑——**根因是华文宋体与思源宋体同为明朝体骨架（横细竖粗+三角衬线），互换来得不可感知**。「换更高级的同风格字体」不构成用户要的变化。

## 决策（用户三选一裁定）

AskUserQuestion 给出三方向：**现代黑体（推荐，用户选定）** / 魏碑石刻（仅 Mac）/ 楷书题字（仅 Mac）。

**终选：思源黑体 Noto Sans SC Black（900）**：
- token `--serif` → **`--name`**（语义更名：名字层不再是衬线），13 处引用全量替换；
- 字体栈：`"Noto Sans SC"(webfont 900, 分片懒加载) → "PingFang SC" → "Hiragino Sans GB" → "HarmonyOS Sans SC" → "Microsoft YaHei"`；
- 依赖更换：卸载 `@fontsource/noto-serif-sc`，安装 `@fontsource/noto-sans-sc`（npm 主源网络抖动，经 npmmirror 镜像完成）。

## 验证

- `document.fonts.check('900 …"Noto Sans SC"', '格物馆')` = true；特写截图：几何粗笔画、零衬线——与宋体版**肉眼立辨**（`r7-title-font.png` 已被新版覆盖，旧版见用户截图存档）；
- `npm run build` ✓ 2.18s；字体资产 196 片 / **5.6MB**（较宋体版 -1.7MB）；
- `npm run smoke`：首跑超时失败 1 项（smoke 自起 Vite 对新字体依赖冷启动预打包超时，非回归），**复跑 28/28 全绿**；
- 桌面/移动截图 `r7-lobby-font.png` / `r7-lobby-font-mobile.png`（新版黑体）。

## 经验沉淀（写回 BRAND.md）

跨风格切换前先确认用户的审美分岔；同风格「升级替换」对非专业眼几乎不可见。
