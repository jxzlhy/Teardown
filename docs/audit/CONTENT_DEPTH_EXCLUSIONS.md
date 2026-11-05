# 内容深度排除性核查清单（realSizeMM / mech）

> 固化日期：2026-11-06 ｜ 口径：AGENTS §1「无可靠数据不补齐」+ 任务书 §7.2「禁止虚假拆解」延伸
> 用途：后续会话**不再重复排除分析**——本清单即结论；新设备接入时按同口径判定。

## 1. realSizeMM 覆盖（53→57/129，44.2%）

已标定 **57 台**（九批：DJI 全系 6 / Apple 14 / Samsung 4 / NASA-航天器 9 / Nintendo 3 / Nothing 3 / Nikon 2 / Porsche 2 / 车辆 2 / Sony·Walther·Smeg·Flipper·Framework·DEWALT·Colt·pocket3 各 1）。测量工具 mm 标定对这 57 台生效。

## 2. 排除清单（维持不补，按理由分类）

### 2.1 GENERIC 匿名模型（42 台）——无官方规格可查
社区/Poly Haven/CAD 教具模型（齿轮箱/钻床/内燃机教学/钟表/显微镜/消防栓等）——模型本身是匿名教具，**不存在官方规格页**；其真实尺寸口径=「教学示意」，补尺寸反而虚假。**永久排除**。

### 2.2 未来/虚构型号（5 台）——产品不存在
| 设备 | 理由 |
|---|---|
| airpods-5 | Apple 无此产品 |
| iphone-18-pro-max / -burgundy | 未来虚构型号 |
| iphone-duo-fold | 虚构折叠形态 |
| CONCEPT 模块化概念手机 | 概念件 |
**永久排除**（除非产品真实发布后按官方规格补）。

### 2.3 官方不公布尺寸（1 台）
| 设备 | 理由 |
|---|---|
| vision-pro | Apple 不公布正式外形尺寸（~35cm 为第三方测量）——按红线不标定 |

### 2.4 古董/冷门无可靠规格（~9 台）——维持排除
Royal 打字机 / Sea-Gull 1963 / Western Electric 500 / Admiral 7T10 / Eumig 放映机 / Hanseatic VCR / **Curta Type II（博物馆口径互斥：直径 69-85mm、高 125-140mm 无单一可靠规格，2026-11-06 查证后排除）** / Casio VL-Tone（无官方精确口径）/ Polaroid Cool Cam 已于轮 57 补（152 收藏档案口径移出）——历史产品规格散佚或型号变体复杂，公开来源不构成「官方规格」口径。**如未来找到权威来源（厂商档案/收藏级文献）可滚动补**。

### 2.5 创作者件（2 台）——口径=作品非产品
REANIMATE 门锁（3D 打印创作者件）/ LAIMER 陀飞轮（3D 打印怀表）——尺寸即创作者设计参数，无「真实产品」参照系。

### 2.6 NASA/Smithsonian 已补（9 台，轮 42-43）
hubble 13200 / jwst 21200 / chandra 19500 / spitzer 4500 / parker 3000 / perseverance 2900 / ingenuity 1210 / apollo-cm 3910×2 / apollo-hatch 990——官方 fact sheet/NSSDC/Smithsonian 藏件页口径。

## 3. mech 覆盖（26→34/129，随批滚动）

已声明 **34 文件**（devices 28 + forge 6），lint-mech 逐边校验。排除口径：
- **机芯未独立拆件**（alarm-clock/pocket-watch）——无可指机构件，不硬凑
- **纯电子/显示设备**（digital-watch/watch-ultra/airpods 系/studio-display/imac 显示部分）——无传统机构
- **柔性变形非机构**（wright-flyer 翘曲操纵已注记）
- **液压传动**（hydraulic-jack）——缸体伸缩为流体口径，机械边只取摇臂/杠杆真实回转

## 4. 后续滚动核查规程

1. 新设备接入时：接入 SOP 同步判定 realSizeMM（官方规格页可查→查证写入；否则入本清单）。
2. 每季度按品牌×字段矩阵重扫一次（本轮滚动重扫曾发现 Apple 漏盘 6 台——轮 53）。
3. 排除理由变化的（如 vision-pro 官方公布尺寸、虚构产品真实发布）→ 移出清单补齐。
4. mech 余量候选：逐台机构学查证（Swiss lever 口径先查来源再写边）。

## 5. 下一批候选（2026-11-06 轮 57 收口）

**全部消化完毕**：Fender 990 / Marshall 740 / Commodore 64 402 / Porsche 992 4519 / TR-808 560（轮 56）+ B&T GL-06 590 / Polaroid Cool Cam 152 / Regency TR-1 127（Smithsonian 藏件口径）/ Braun SK55 580（轮 57）。
**收口态**：零星余量=按新设备接入 SOP 滚动（§4 规程）；realSizeMM 铺量阶段性收官 **66/129（51.2%）**——GENERIC 42+虚构 5+无官方口径 ~16 维持排除。
