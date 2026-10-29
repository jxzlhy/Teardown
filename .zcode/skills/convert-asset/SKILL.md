---
name: convert-asset
description: 拆解馆项目（本工作区）把外部 3D 资产转换并压缩为引擎可用 GLB 的 SOP：官网直链规律（Apple USDZ / Samsung / Nothing / Sketchfab / 官方 CAD 仓库）、Blender headless 转换、CAD 网格化、gltf-transform 压缩（先 webp 后 draco 铁律）、结构校验。当用户要求接入/下载/转换模型资产、处理 USDZ、压缩或瘦身 GLB、资产体积过大，或需要查询某品牌官网模型直链时使用。转换出 GLB 后的设备配置接入用 $add-device。
---

# 拆解馆 · 资产转换 SOP

工具链（已收编在项目 `tools/`）：`usd2glb.py`（Blender headless：USDZ→GLB）、`cad2glb.py`（STEP/STL→GLB，gmsh）、`optimize-glb.mjs`（压缩包装）、`inspect-glb.mjs`（GLB 结构摸底）。全链路已验证：Apple AirPods Pro USDZ 6.88MB → 907KB（13%）。

按序执行；第 2 步按源格式三选一。

## 1. 获取源资产

按 `references/sources.md` 的直链规律抓取（curl 产品页 grep 直链等），原始文件备份进 `vendor/assets/originals/`（已 gitignore）。核对许可：CC-BY 必须在后续设备配置 `modelCredit` 署名；厂商 AR 资产仅限本机研究/演示。

## 2a. USDZ → GLB（Blender headless）

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --python tools/usd2glb.py -- <src.usdz> <raw.glb>
```

- 成功标志：输出 `RESULT meshes=N tris=N materials=N ... size=X MB`。
- 首次运行若长时间无输出，可能是 Gatekeeper 拦截（历史发生过）：系统设置→隐私与安全性→放行；仍不行再考虑系统 Python + usd-core 自写转换器路线。
- Apple 资产特征：节点名是哈希（接入时全走 `mapByPosition`）、材质纯色 + roughness/normal/occlusion 贴图、米制尺度、部分资产屏幕朝 -Z 且熄屏。

## 2b. CAD（STEP/STL）→ GLB

```bash
pip3 install gmsh                                          # step 模式依赖；stl 模式零依赖
python3 tools/cad2glb.py step <in.stp> <out.glb> [meshSizeMax_mm]
python3 tools/cad2glb.py stl  <in.stl> <out.glb>
```

- meshSizeMax 越小越精细越慢：Framework 13 整机 STEP 20MB，2.4mm 要 15 分钟+，4.5mm 约 90 秒（实测）。
- CAD 实体名多为泛名：脚本按名称关键词（keyboard/battery/board/display…）上色，接入时靠 `mapByPosition` 第 4 参 ext（网格尺寸）聚类识别部件。

## 2c. 直接是 GLB（Samsung 官网直链 / Sketchfab / 社区模型）

跳过转换，直接进第 3 步。Samsung 直链自带 Draco 也无需担心——压缩包装的最后一步永远是 draco，幂等。

## 3. 压缩（铁律：先 webp 后 draco，顺序不可反）

```bash
node tools/optimize-glb.mjs <in.glb> [out.glb]   # 省略 out = 原地压缩
```

gltf-transform 的任何后处理命令都会把已有 Draco 解码重写——反序会丢几何压缩（历史实测 switch-2 1MB→14.8MB 反弹）。本脚本固定 webp(85) → draco 顺序并汇报体积。成品放 `public/assets/<id>.glb`（kebab-case = 设备 id）。

## 4. 校验

```bash
node tools/inspect-glb.mjs public/assets/<id>.glb
```

确认：extensionsUsed 含 `KHR_draco_mesh_compression`、贴图为 image/webp、网格/材质数量与源资产一致。之后转 `$add-device` 第 4 步（映射配置与校准）。

## 已知坑

- **usd2glb 的 Blender 导出参数跨版本有差异**（本机 Blender 4.x 不认 `export_colors`）：脚本已做 TypeError 回退最小参数集；再遇到就删掉报错的 kwarg。
- **若重写 usd-core 转换器**，历史两大坑：bufferView 必须带 `buffer:0`；images 不能按 used 过滤（纹理索引错位）。Blender 路线已天然规避。
- 压缩只做 webp + draco：不要加 LOD/纹理重采样等额外步骤，除非用户明确要求（当前引擎无 LOD 通道）。
