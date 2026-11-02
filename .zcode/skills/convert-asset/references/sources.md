# 模型来源直链规律（全部实测验证过）

> SKILL.md 第 1 步的查询手册。抓取前先 `npm run gen:inventory` 查重。

## Apple（USDZ，需转换）

产品页 AR 资产直链规律：

```
https://apple.com/105/media/us/<产品slug>/<年份>/<uuid>/ar/<资产名>.usdz
```

枚举方法：`curl -s <产品页URL> | grep -oE '[^"]+\.usdz' | sort -u`。

特征与注意：节点名是哈希（接入全走 `mapByPosition`）；材质纯色 + roughness/normal/occlusion 贴图；米制；**部分资产屏幕朝 -Z（iMac/MacBook Pro）**、部分平放（iPhone Air）、iPad Pro 实为含妙控键盘的姿势；熄屏状态是常态（接入时勿把暗屏当 bug）。

## Samsung（GLB 直链，自带 Draco）

```
https://images.samsung.com/common/smartphones/models/<系列>/<型号>-<颜色>.glb
```

特征：Y 直立、屏幕朝 +Z、节点名语义化（`Display_ActiveArea` / `Rearcase` / `BackCam*` / `Hinge_*`）可直接 name mapping；Z Fold/Flip 是展开态。压缩已在源里，接入配置不需要特殊处理（引擎无条件挂 Draco 解码器）。

## Nothing（GLB 直链，无 Draco）

nothing.tech 产品页内嵌 cdn.sanity.io 的 hash 直链 GLB。特征：无 Draco、**cm 尺度**、屏幕层在 **-Z**（`frontAxis:'-z'`）；官方资产自带透明设计内视件与 Glyph（材质名 `Led` / `emission_on` / `Light_On` / `glyph` → `materialMapping` 按材质名归组）。

## 社区模型（Sketchfab 等）

- Switch OLED：SceneView 仓库 CC-BY 4.0 GLB（原作者 rtql8d，已在 `modelCredit` 署名）。
- **Sketchfab 下载通道（2026-11-02 实测仍有效）**：IAB 内 Sketchfab 登录态（User-419afc4fcb）+
  页内 `fetch('/i/archives/latest?model=<uid>&archiveType=glb&textureMaxResolution=0', {credentials:'include'})`
  → 200 返回 `{url: <S3 预签名直链>}` → node 侧 `https.get` 落盘 originals。
  注意：参数名是 `model`/`archiveType`（不是 uid/type）；`textureMaxResolution` 必填，0=原始纹理，
  2048/1024 仅当该分辨率压缩档存在时可用（不存在报 400，可作回退序列 0→1024）；
  匿名 curl 直接 401，必须在登录态页面上下文内取直链；长 URL 必须程序化传递，手工复制会损坏。

## CAD 仓库

Framework Laptop 13：官方 CAD 仓库（CC-BY 4.0），浅克隆拿 STEP/文件清单；整机 STEP 20MB。Flipper Zero：官方 STL（GPL-3.0）。

## 官方 GLB 直链的其他品牌（实测）

- DJI：官网产品页 AR 资产直链（如 Action 4 = AC203 机型码资产）。**DJI 2025 后新品（Neo/Flip/Air 3S 等）官网没有 3D viewer，无模型可抓**。

## 实测无直链、已排除的品牌

Google Pixel、三星穿戴、PS5、Surface。

## 许可红线

- 厂商官网 AR 资产：仅限本机研究/演示，勿再分发。
- CC-BY：`modelCredit` 字段必须署名（如 "Nintendo Switch 2 Realistic by NAIT Studio (CC-BY 4.0), via Sketchfab"）。
- GPL/NC-SA：GPL 可用需署名来源；NC（非商用）类默认不接。
