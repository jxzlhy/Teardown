# PHASE R7 · 名字层字体升级：思源宋体 Heavy（2026-10-31 第二轮追加）

> 用户反馈：系统宋体（Songti SC Black）大字发燥——横画过细、喇叭衬线收尖过锐，像报纸版。截图取证后定位为字体本身而非渲染问题。

## 决策

名字层 webfont 换 **思源宋体 / Noto Serif SC Heavy（900）**（= Source Han Serif，SIL OFL 许可，可自由再分发）：

- 造型：横竖对比受控、衬线为几何楔形、Heavy 字重厚实——博物馆级 display face；
- 交付：`@fontsource/noto-serif-sc/900.css`（npm 依赖，**本地打包、不依赖外网 CDN**），unicode-range 分片（~120 片），浏览器按需懒加载，首屏实拉 ~19 片；
- 仅引 900 一档：名字层（馆名/展区/展品名/部件名）统一 Heavy，层级靠字号与字距区分；CSS 中旧 800 声明由 font-matching 就近命中 900 face，无合成加粗；
- 兜底栈：`"Noto Serif SC", "Songti SC", "STSong", "Source Han Serif SC", "SimSun", serif`——未就绪/无网时仍有像样衬线，Windows 不再裸降 SimSun。

**拒绝的替代**：`chinese-simplified-900` 单文件版（1.44MB，首屏阻塞重）；换回黑体（丢失博物馆铭牌性格）；Weibei SC 等系统字体（仅 macOS 有，跨平台不可控）。

## 体积实测（AUTONOMOUS_METRICS 同步）

- dist 新增 noto 分片 196 文件 / **7.3MB**（woff2+woff 双格式；相对 dist 既有 236MB 模型资产可忽略）；
- 运行时按 unicode-range 懒加载，实测门厅首屏 19 个请求（含 latin 分片，展台英文同字面渲染）。

## 验证

- `document.fonts.check('900 100px "Noto Serif SC"', '格物馆')` = true；`.hub-title` computed family 首位为 Noto Serif SC；
- 特写截图 `r7-title-font.png`（fonts.ready 后）：几何楔形衬线、厚实横画——与 Songti 旧貌对比显著；
- 移动端 `r7-lobby-font-mobile.png` ✓；实测发现展台英文名 21px 在 390px 与 CTA 同行溢出换行孤字 → 移动端降至 17px；
- `npm run build` ✓ 2.29s；impeccable detect 0 新增。

## 许可合规

SIL OFL 1.1：允许捆绑再分发；License 文件随 npm 包保留于 node_modules；来源与用途记录于本文与 BRAND.md。
