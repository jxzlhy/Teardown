---
name: add-device
description: 拆解馆项目（本工作区，Vite+Vue3 壳 + vanilla three 引擎的多品牌 3D 拆解平台）接新设备的完整 SOP：查重、npm run add 脚手架、GLB 压缩转换（先 webp 后 draco）、映射配置、lint 校验、真机校准、缩略图与清单更新。当用户要求新增/接入设备、加机型、上一台新机器、补缩略图/清单，或出现"部件静默归入外壳""映射 partId 不存在""新设备出框/没图"等问题时使用。
---

# 拆解馆 · 接新设备 SOP

项目根 = 本技能所在工作区根目录。唯一事实来源 `src/devices/registry.js`——设备数量以脚本输出为准，任何文档勿手抄数字。

按序执行以下 7 步，勿跳步；每步的产物是下一步的输入。

## 1. 查重

```bash
npm run gen:inventory && grep -i "<关键词>" MODEL_INVENTORY.md
ls public/assets/ | grep -i "<关键词>"
```

两处都没有命中才继续；有命中则告知用户已存在并停。

## 2. 脚手架

```bash
npm run add -- --id <kebab-id> --zh "<中文名>" --en "<英文名>" --brand <品牌> --category <分类>
```

自动查重、生成 `src/devices/<id>.js` 占位模板、插入 registry 对应品牌分组。id 用 kebab-case（已知例外：模块文件 switch2.js ↔ id `'switch-2'`）。

## 3. 获取并压缩 GLB

来源优先级与许可约束见 `references/calibration.md` §来源。压缩**顺序不可反**（任何后处理都会解码重写，先 draco 后 webp 会丢几何压缩、体积反弹）：

```bash
npx @gltf-transform/cli webp in.glb out.glb --quality 85
npx @gltf-transform/cli draco out.glb out.glb        # 必须最后一步
```

成品放 `public/assets/<id>.glb`（kebab-case = 设备 id）；原始文件备份进 `vendor/assets/originals/`（已 gitignore）。接入前先摸底网格/材质命名：

```bash
node tools/inspect-glb.mjs public/assets/<id>.glb
```

⚠️ **inspect 尺寸可能不含节点 scale（SkinnedMesh 高发）**：GLB 节点自带 scale 时，accessor bbox（inspect 输出）与视觉尺寸可差几十倍（m4-carbine 实锤：节点 scale 0.0479，accessor 4169 vs 视觉 0.42 单位，整机在 CAM_HOME 视角完全不可见，thumbView 自取景会掩盖 2 天）。**接入后必查**：页面里比对 `window.__ENGINE.getState().hullRadius`——若与 inspect 最大维度的一半差一个数量级，按比值补偿 `targetWidth`（例：188 = 9/0.0479），并在配置注释记录依据。

## 4. 配置设备文件

按 `references/calibration.md` 的决策表填写 `src/devices/<id>.js`：映射方式选择、frontAxis/orientationProbe、normalize、targetWidth 与 camDist、parts 的 ex/lo、屏幕贴图。填完先跑一次 `npm run lint:devices`。

## 5. 校验

```bash
npm run lint:devices
```

校验映射引用的 partId 存在（拼错会静默归入 shell——最难查的一类 bug）、parts id 不重复、GLB 文件存在。有错必须修完才继续。

## 6. 真机校准

`npm run dev` 打开 `http://127.0.0.1:8200/#/device/<id>`，按 `references/calibration.md` §校准清单逐项核对（入画、朝向、爆炸方向、标签、屏幕、拾取），边看边调配置文件。

## 7. 出图与收尾

```bash
npm run thumbs -- --only <id>    # 大厅卡片缩略图 public/thumbs/<id>.webp
npm run gen:inventory            # 重新生成 MODEL_INVENTORY.md（此文件勿手改）
npm run build                    # 回归
```

## 已知坑速查（细节在 references/calibration.md）

- **暗屏 ≠ 朝向错误**：多数 Apple 官方资产熄屏时屏幕本来就是深色的；缩略图与设备页首屏一致即忠实还原，不要用翻转朝向去"修暗"。
- **targetWidth > 12 必配 camDist**：首页固定机位竖向覆盖约 12.3 单位，漏配会出框（历史缺口：8 台手机曾集体漏配）。
- **实机件与程序件 partId 不得撞名**（历史 bug：zfold7/zflip7 两台都撞过 `camera`，详情面板永远指向先注册的那个）。
