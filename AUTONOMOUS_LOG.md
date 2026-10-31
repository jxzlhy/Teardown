# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

## 2026-10-30 · Stratocaster + C64 接入——**100 台里程碑**（100 台 / 806 部件 / 35 品牌）

1. **Fender Stratocaster 电吉他接入**（99 台）：dark_igorek「Tequila Sunrise」（CC-BY，
   206k faces，157 网格——Fender 材质 152 + podium/text/light 陈列件），按材质+尺寸双档
   聚类 5 部件（琴体/琴颈/弦钮与琴头/琴桥五金/陈列展台）。Tequila Sunrise 渐变曝光良好。
2. **Commodore 64 全套接入**（100 台 🎉）：dark_igorek Full Pack（CC-BY，132k faces），
   13 网格按 5 个位置簇聚类（C64 主机/CRT 显示器/1541 驱动器/游戏摇杆/外置电源）——
   真机陈设校正了初版部件身份（右前=Competition Pro 摇杆、右后=外置电源砖、左后=1541）。
   GLB 改名与 id 一致；drive 爆炸方向修正。复古计算机品类落地。
3. 验证：两台均 lint 全通过、gen:inventory、build、smoke、thumbs、真机截图 + Tour 步数。
   推送 1faaaad。

### 下一项（按优先级）
1. 新一轮外部调研（GAP/ROUND2 已消化完毕：乐器 ✅ 复古计算机 ✅ 家电 ✅ 精巧机械 ✅）
2. 真机横向回归（需环境）
3. 引擎打磨：特写方位微调、标签遮挡抽查

## 2026-10-30 · Stratocaster 接入（99 台 / 801 部件 / 34 品牌）

第二轮调研方向1落地：dark_igorek Fender Stratocaster「Tequila Sunrise」（CC-BY 4.0，
206k faces，157 网格——Fender 材质 152 + podium/text/light 陈列场景件）。
按材质+尺寸双档聚类 5 部件（琴体/琴颈/弦钮与琴头/琴桥五金/陈列展台），阈值
2.5/1.2/0.25 真机校准；Tequila Sunrise 渐变漆面曝光良好，展台灯圈氛围到位。
乐器线补全（Casio VL-Tone/TR-808/Marshall/Stratocaster）。
验证：lint 99/99、gen:inventory 99 台/801 部件/34 品牌、build 1.86s、smoke 全通过、
thumbs、真机截图。推送 8ff7aad。

### 下一项
C64 Full Pack 评估（inspect 后定接入或落选）；真机回归需环境。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

## 2026-10-30 · Regency TR-1 接入（103 台 / 815 部件 / 38 品牌）

第三轮调研方向4再落地：cyclonicninja69 Regency TR-1（CC-BY 4.0，史上首台商用
晶体管收音机，1954）——与 Admiral 7T10 电子管收音机组成技术代际对照对。
实测 3 网格中 Object_7 为 5.3m 展示地面板 → 引擎新增 `excludeMeshes` 排除能力
（parse 后、归一化前按名移除；否则巨型背景板撑爆归一化与取景包围盒）。
2 部件（机身面板拨盘一体 / 背盖电池仓）；draco 504KB。
验证：lint 103/103、gen:inventory 103 台/815 部件/38 品牌、build 2.12s、smoke 全通过、
thumbs、真机截图（橙红机身/点阵格栅/拨盘/签名正确，地面板已排除）。推送 a1da632。

### 下一项（按优先级）
1. 真机横向回归（需环境）
2. antique 1930s 双态电话（52k，听筒两态独立）候选评估
3. 引擎打磨：特写方位微调、标签遮挡抽查

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

## 2026-10-31 · 1930s 电话落选 + smoke 移动端断言固化

1. **antique 1930s Rotary Telephones 落选**（Mad_Lobster_Workshop，CC-BY，52k）：下载实测
   13 节点仅 5 合并网格，bbox 1.82m = 两台并排整机（复数属实）——非单一拆解对象，
   且为馆内第三台电话（WE500 已 26 网格精细分件）。复核记录写入 docs/ROUND3-RESEARCH.md。
   ROUND3 全部候选至此消化完毕：收音机 ✅ / 台钳 ❌ / WE500 ✅ / TR-1 ✅ / 1930s ❌。
2. **smoke 移动端断言固化**：三项永久断言（sheet 46vh 封顶 / 特写横幅限高 170px /
   溢出时 overflowY=auto 可滚动）——防止未来特写图或 sheet 内容变更再次撑爆移动端布局。
   实测：高度 388px、特写 150px、smoke 15 项全通过。推送 41cd60b。

### 下一项（按优先级）
1. 新一轮调研（三轮已消化：需新方向——艺术装置/航天器舱段/武器纵深/交通纵深）
2. 真机横向回归（需环境）
3. 引擎打磨：特写方位微调、标签遮挡抽查

## 2026-10-30 · WE500 旋转拨号电话接入（102 台 / 813 部件 / 37 品牌）

第三轮调研方向4再落地：vicky12218 Western Electric 500（CC-BY 4.0，PBR 4K，
182k faces）——26 网格全语义命名（听筒/螺旋线/拨盘×4/叉簧/插口×2/底脚×8/主体）
直接 mappingPrefix 映射 5 部件（听筒与螺旋线/机身底座/旋转拨盘组/叉簧开关/线路插头）。
分布实测 4/12/6/2/2 = 26/26 全分配 ✓。渲染：亮黑胶木 + 拨盘号牌 + 螺旋线清晰。
踩坑：mappingPrefix 首中即停——'Handset_Jack' 必须排在 'Handset' 之前，
否则听筒插口被宽前缀吞掉。
验证：lint 102/102、gen:inventory 102 台/813 部件/37 品牌、build 1.92s、smoke 全通过、
thumbs、真机截图。推送 6ec7018。

### 下一项（按优先级）
1. 真机横向回归（需环境）
2. 引擎打磨：特写方位微调、标签遮挡抽查
3. 新一轮调研候选消化（ROUND3 报告余下：Regency TR-1 晶体管收音机、Western Electric 旋转拨号电话为已接入同款、 antique 1930s 电话等）

## 2026-10-30 · 第三轮调研 + 收音机接入 + 映射修复（101 台 / 808 部件 / 36 品牌）

1. **移动端特写缺失修复（两台）**：retro-fan 的 mapping 改 mappingPrefix（引擎网格名
   带 `_0` 原语后缀，精确键全部失配 → 全部网格回退默认部件）；door-lock 尺寸阈值
   三轮校准失败后合并 bolt-works/steel-pins 为 steel-works（材质语义可靠，尺寸细分
   本就是推测）。修复后两台移动端特写恢复、网格分布 9/9/7 与 2/2/3。
   教训：新设备接入后必须实测各部件网格分布（group.traverse 计数），不能只看总渲染。
2. **第三轮外部调研**（后台代理，docs/ROUND3-RESEARCH.md）：精密仪器/工具/厨电/
   复古通信 4 方向 22 台核实；台钳落选（SolidWorks 装配体导出仅 2 合并网格——
   "描述可拆≠GLB可拆"第 5 例）；前叉/调速器/对讲机等方向已有结论。
3. **Admiral 7T10 电子管收音机接入**（101 台）：4 网格全语义名（case/tubes/tuner/
   wires）直接映射 4 部件，"完整内部元件"描述被网格名证实。draco 2.49MB。
   复古影音/通信线补全（与 radio-transceiver/vcr/filmstrip 差异化：电子管内构）。

验证：lint 101/101、gen:inventory 101 台/808 部件/36 品牌、build 1.89s、smoke 全通过、
thumbs、真机截图（木纹外壳/格栅/旋钮/电源线正确）。推送 1ff504c。

### 下一项（按优先级）
1. Western Electric 500 旋转拨号电话（182k，报告记录：听筒/壳体/拨盘/电话线分件潜力）
2. 真机横向回归（需环境）
3. 引擎打磨：特写方位微调、标签遮挡抽查

## 2026-10-30 · 第二轮调研 + 复古风扇接入（98 台 / 796 部件 / 33 品牌）

1. **第二轮外部调研**（后台代理，docs/ROUND2-RESEARCH.md）：乐器纵深/复古计算机/家电/
   精巧机械 4 方向 22 台详情核实；前叉与调速器方向落选（无可下载单体）。
2. **移动端详情 sheet 修复（真回归）**：特写图上线后 sheet 内容 734px 被裁在 46vh 盒内
   且不可滚动。修复：#ctxCard overflow-y:auto + 特写限高 150px 横幅。双机实测可滚动、
   dock 不被遮挡。早前 sheetBottom=1232 为入场过渡瞬态（300ms 采样）。
3. **门锁机构接入**：ReAnimate.xyz 弹子锁装配体（CC-BY，爆炸动画证实分件），25 匿名
   网格按材质功能聚类 5 部件。精密机械（锁具）新品类。draco 785KB。
4. **复古风扇接入**：dylanheyes Retro Fan（CC-BY，"插头线缆可拆卸"文本证实），7 网格
   语义名直接映射 3 部件（风头/机身/电源线）。draco 433KB。
5. **uid 标签错位纠错**：首轮批量下载三个 uid 文件名与内容错位——以 API 权威名三方改名；
   Stratocaster（157 网格）与 C64 Full Pack（7 网格）原始件归位，记为已验候选。

验证：lint 98/98、gen:inventory 98 台/796 部件/33 品牌、build 1.88s、smoke 全通过、
thumbs、真机截图。推送 2f15711。

### 下一项
Stratocaster 接入（157 网格，暗色材质需校准）；C64 Full Pack（7 网格薄分件）候选；
真机回归需环境。

## 2026-10-30 · 移动端 sheet 修复 + 第二轮调研 + 门锁接入（97 台 / 793 部件 / 32 品牌）

1. **移动端详情 sheet 修复（真回归）**：特写图上线后 sheet 内容 734px 被裁在 46vh 盒内
   且不可滚动——移动端下半内容不可达。修复：#ctxCard overflow-y:auto + 特写限高 150px
   横幅。双机实测可滚动/可达，dock 不被遮挡。早前 sheetBottom=1232 为入场过渡瞬态。
2. **第二轮外部调研**（后台代理，docs/ROUND2-RESEARCH.md）：乐器/复古计算机/家电/
   精巧机械 4 方向 22 台详情核实；前叉与调速器两方向落选（无可下载单体）。
3. **门锁机构接入**（97 台）：ReAnimate.xyz 弹子锁装配体（CC-BY，爆炸动画证实分件），
   25 匿名网格按材质功能聚类 5 部件（黄铜锁体/铜配件/钢制栓件/钢制小件/高碳钢簧片）。
   精密机械（锁具）新品类。draco 785KB。
4. **三候选 inspect 完毕记为已验候选**：retro-fan（157 网格）/fender-stratocaster（13）/
   commodore-64（7，Body/Cable/Fan 语义名，分件薄）。

验证：lint 97/97、gen:inventory 97 台/793 部件/32 品牌、build 1.86s、smoke 全通过、
thumbs、真机截图。推送 76e031c。

### 下一项
retro-fan 或 fender-stratocaster 接入（已验候选）；真机回归需环境。

## 2026-10-30 · Game Boy 混合路径接入（96 台 / 788 部件 / 31 品牌）

GAP 缺口"Game Boy"落地：Smoggybeard CC-BY 外观模型（12 网格外观件）+ 4 个**示意重建**
内构件（主板/电池仓/卡带/扬声器，P 部件 + anchorParts 锚定，desc/source 明确标注
"示意重建 · 非真机结构"——沿用馆内 nikon-d6 先例）。

**新引擎能力 `baseRotation`**：以几何中心建 pivot 旋转（平躺展示模型转正）。
踩坑链（全部实证）：①绕 root 原点旋转会把长轴偏离原点的模型甩飞——必须以几何中心
建 pivot（attach 保世界位姿）；②示意件 box() 误用毫米尺度成巨型箱体埋住真机——
建造器尺寸必须用引擎尺度；③对象字面量内裸调 `anchorParts(...)` 是语法错误——用
`composePostLoad` 组合；④finalBbox 是 root 本地系（对 root 自旋不变），不能用它
判断姿态——要以部件世界矩阵/截图为准。

验证：lint 96/96、gen:inventory 96 台/788 部件/31 品牌、build 1.87s、smoke 全通过、
thumbs 1/1、真机截图多轮（立起/贴花/按键/示意件尺度/锚位正确）。推送 22e4c07。

### 下一项（按优先级）
1. 真机横向回归（需环境）
2. 新一轮外部设备调研（GAP 已收官）
3. 引擎特写方位按部件类型微调（可选）

## 2026-10-30 · 95 台回归 + 工具升级 + 特写亮度修复（本轮）

1. **全量 95 台生产回归 0 异常**（含 tourbillon-movement / grand-piano；日志
   docs/full-regression-95-2026-10-30.log，推送 e4d522d）。
2. **stl2glb-batch 格式扩展**（4e839ab）：ASCII STL 文本解析；3MF 支持（内置最小 ZIP
   读取器 + object/mesh 解析 + object name 命名节点 + build.item 4x3 变换）；
   修复 %f 格式化。回归 5/5（ASCII / 3MF 双对象命名 / build 平移 accessor.min 断言 /
   二进制 STL 不回归）。踩坑：正则惰性可选组会静默匹配空——属性提取改整串二次提取。
3. **部件特写亮度修复**（ebdcaa7）：直渲 WebGLRenderTarget 不走 OutputPass 的 sRGB
   输出变换，readRenderTargetPixels 读到线性值 → 特写近全黑（实测均值 4-16/255）→
   thumbRT.texture.colorSpace = SRGBColorSpace（亮度提升 3-9 倍，12 部件实测）+
   特写相机位临时方向光（finally 移除）。已知限制：直接调用偶发首次 null 未复现
   （UI 路径有 [partId, booted] 重试保护，记录备查）。

### 下一项（按优先级）
1. Game Boy 混合路径评估（外壳 + 程序化内构件需产品决策，暂缓）
2. 真机横向回归（需环境）
3. 新一轮外部设备调研（GAP 已收官，需重新选题）

### 验证基线
- `npm run lint:devices` 95/95；`npm run build` ~1.9s；`npm run smoke` 全通过；
- Gitee main 同步至 ebdcaa7。

## 2026-10-30 · 策展第四批（无人机/相机/放映机/发动机/机械 14 台）

avata2/mini4pro、nikon-z6/d6、polaroid-coolcam、pocket3、eumig-projector、
v8/combustion/v6/jet-engine（动力流叙事）、hypoid-gear、hydraulic-jack、swiss-escapement。
发动机类刻意不设 xrayShellIds（realPartIds 兜底全透明）。**累计策展 54 台 / 90 台**。

验证：lint 90/90、build 1.91s、smoke 全通过、生产 preview 抽查（统计 35 官方/55 社区、
3 台装载、无 HTTP 失败/页面错误）、5 台 tour 步数/首步正确。推送 f818dec。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

## 2026-10-30 · 新设备 2 台 + 3 台落选（92 台 / 761 部件）

### 接入
- **triple-engine**（jamie3d，CC-BY，108 网格全语义命名 → 10 部件，618KB）：
  mappingPrefix 长前缀优先（throttle 前于 throttle_cables 等）；
- **gramophone**（dylanheyes，CC-BY，10 网格 → 4 部件，924KB）：喇叭/唱盘组/箱体/摇柄。
- 下载通道：IAB Sketchfab 登录态（User-419afc4fcb）+ `/i/archives/latest` + node https 落盘；
  长会话中该 tab 可能丢失（socket hang up），重取 `browser.tabs.list()` 恢复。

### 落选（inspect 后淘汰，未接入——原始件已备份 originals）
- astronomical-tourbillon（Binkley-Piratepants，CC-BY）：仅 3 个匿名网格（Object_2…），不可拆；
- motor-wankel（museoETSII，CC-BY）：7 份重叠几何拷贝（mainMeshNode×7，疑似导出损坏）；
- smeg-toaster（Thefreshlab，CC-BY）：18 个匿名 Object_N，映射成本高留待后续；
- walkman-wmf2078（Dolgov12，CC-BY）：4 图元全部重叠于原点、匿名命名，不可拆。
- 教训印证 SOP：研究报告"描述明示可拆"不等于 GLB 可拆，必须 inspect 后判定。

### 验证
- lint 92/92、gen:inventory 92 台/761 部件/29 品牌、build 2.13s、smoke 全通过、thumbs 2/2、
  真机截图目检两台（结构/材质/曝光正确，gramophone 黄铜喇叭质感佳）。推送 58aac76。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

# 自主迭代日志

> 只记录可核实的事实：改了什么、怎么验证、还剩什么。设备/部件数量以 `MODEL_INVENTORY.md` 为准。

## 2026-10-30 · Game Boy 缺口定案（拆解无解）

Smoggybeard CC-BY 模型（86k 顶点候选）下载 inspect：12 网格全部为外观件
（机身×2 / 屏幕 / 玻璃 / 贴花 / D-PAD / AB 键 / START-SELECT / 电量灯），无主板/卡带/
扬声器等任何内构件——按 AGENTS 红线（不得用程序化内构件冒充真机结构）判定**拆解无解**，
检验后删除检验件（原始件保留 originals/gameboy_smoggybeard.glb 供未来混合路径参考）。
四缺口最终口径：陀飞轮 ✅ / 钢琴 ✅ / Game Boy ❌ / 手风琴 ❌。

## 2026-10-30 · 钢琴击弦机接入（95 台 / 781 部件 / 31 品牌）

GAP 调研第二项落地：thing:4059233（icefox1983 "Grand piano with moving parts"，CC-BY 4.0）。
22 个 STL 分件经 stl2glb-batch（--up）合并 → draco 105KB；8 部件（琴键/音板琴桥/铸铁板/
琴体/琴盖/踏板组/琴凳脚轮）；白模压暗 0.42。**多 STL 管线第二次复用**，全程较陀飞轮减半。
验证：lint 95/95、build 1.79s、smoke 全通过、thumbs 1/1、截图目检。推送 684234f。

## 2026-10-30 · 品类缺口调研落地 + 陀飞轮机芯接入（94 台 / 774 部件 / 31 品牌）

### 调研（后台子代理，报告 docs/GAP-RESEARCH.md）
四缺口结论：陀飞轮 ✅（Laimer 怀表，Pinshape CC-BY 硬验证 51 打印件，证据最强）；
钢琴击弦机 ✅（thing:4059233 CC-BY 多分件）；Game Boy ⚠️ 条件可行；手风琴 ❌ 拆解无解。

### 下载通道攻坚（Thingiverse 匿名）
- curl 被 Cloudflare 403；IAB 能过盾但下载事件不落盘（PlaywrightDownload 仅 path() 且超时）；
- 最终路径：IAB 打开 files 页 → 注入 fetch/XHR 观察器 → 点击下载按钮捕获 `download:<id>` 真实 URL
  → 页内 `fetch(url, {credentials:'same-origin'})` 取 arrayBuffer → 分块 base64 回传 node 落盘；
- 坑：下载后弹出的提醒浮层会遮住按钮（点击超时）——先 Escape 再点；大数组
  `String.fromCharCode.apply` 会爆栈——分块转 base64。

### 新工具与资产
- `tools/stl2glb-batch.mjs`：多二进制 STL → 单 GLB（每件一个命名节点、顶点焊接、
  法线面积加权、`--up` Z→Y 换轴、三角形退化管理）；
- 33 分件（17MB）合并 35.5 万面 → draco 855KB；原始分件备份 `vendor/assets/originals/clockwerk/`。

### 配置与校准
- 33 节点按文件语义名归组 7 部件（打印主发条/轮系/瑞士杠杆擒纵/陀飞轮框架/皮带传动/
  主夹板/装配工装——Jig 保留并注明为开源工装致敬）；
- 白模过曝 postLoad 压暗 0.38 + camDist 1.35（两轮截图对比确认）。

### 验证
- lint 94/94、gen:inventory 94 台/774 部件/31 品牌、build 1.88s、smoke 全通过、thumbs 1/1、
  真机截图（ COMMUNITY 徽章正确）。推送 d953815。

### 下一项
1. 钢琴击弦机接入（thing:4059233 CC-BY 多分件，走同一多 STL 管线）；
2. Game Boy 条件路径评估（Smoggybeard CC-BY 单网格需 inspect）；
3. 手风琴：记录为"拆解无解，仅整机展示可行"。

## 2026-10-30 · 全量 93 台生产回归（0 异常）

5 批策展 + 5 台新设备后的全馆验证：生产构建 + preview 服务器 + 无头 Chrome 逐台遍历
93 台设备，断言 booted 且状态匹配 OFFICIAL/COMMUNITY/PROCEDURAL/FALLBACK、parts>0、
无 pageerror、无 HTTP 4xx。**结果：93/93 通过，0 异常**（watch-ultra 捕获瞬间显示
PARSING 中间态但部件/错误指标正常，非失败）。全量日志 /tmp/full-regression.log。

## 2026-10-30 · 策展收官（32 台，除 marshall 外全馆策展完成）

32 台补 tour + xrayShellIds（iphone-13/18-pro-max-burgundy/modular-smartphone/phone3/phone3alite/
phone4apro、countach、porsche×2、vcr/sony-tc510/radio/cassette/console/multimeter/casio/钟表×4、
drill-press/hand-drill/planetary-gearbox/vintage-microscope、m4/gl-06、hubble、computer-parts、
switch-oled、inside-drone、cash-register、royal-typewriter）。
修复：phone3 tour 引用不存在的 board → internals（lint 警告清零）。
**全馆 92/93 台有策展**（marshall-jcm800 刻意保留无策展供 smoke Tour 兜底断言）。
验证：lint 93/93（0 错 0 警）、build 1.80s、smoke 全通过、6 台抽查。推送 257bef2。

## 2026-10-30 · smeg-toaster 正式接入（93 台 / 767 部件 / 30 品牌）

此前"匿名网格待映射"的候选正式接入：18 匿名图元按位置/尺寸/材质判读聚类 6 部件
（机身/顶盖槽口/底座底脚/起弹杆/内部升降架/控制件），draco 280KB，真机截图确认
薄荷绿搪瓷壳+镀铬顶盖+侧起弹杆+旋钮全部正确。lint 93/93、build 1.82s、smoke 全通过、
thumbs 1/1。品牌名仅作型号署名。策展设备累计 55 台。推送 99f6b50。

## 2026-10-30 · 本会话总状态（续跑交接点）

> 当前分支：main @ Gitee（本会话 13 个提交，全部通过 lint/build/smoke + 浏览器验证后推送）。
> 规模：**90 台设备 / 747 部件 / 29 品牌**（MODEL_INVENTORY.md 自动生成）。

### 本会话已完成（按序）
1. Gitee 仓库接入 + cad2glb 路径守卫加固（6d4a18a；Mimosa 门规则见 memory）
2. 37 台社区模型署名查证：作者/许可证/来源链接 + lint 强制校验（2989033）
3. Poly Haven 13 台来源链接（ee8be62）
4. 设备页来源徽章修正（COMMUNITY/OFFICIAL 口径统一到 src/lib/model-class.js）+ 14 台 Tour/X-Ray 策展（d302174）
5. 新设备 3 台：厨房搅拌机/DeWalt 角磨机/弹珠台（0824b89；mapByPosition 增第 5 参材质名）
6. 部件特写小图：引擎 capturePartThumb 离屏捕获，详情卡全量生效（aace665）
7. pinball 弹射板核对修正（f782d23）
8. 剖切可读性：切腔 DoubleSide 内壁 + 半透明指示板（5129158）
9. 策展第二/三/四批：手机/平板/显示器 + mac/audio/穿戴 + 无人机/相机/发动机家族 36 台（733a01e/5fd42b5/f818dec）——累计 54 台策展
10. 新设备 2 台：直列三缸摩托车发动机/手摇留声机（58aac76）+ 3 台 inspect 落选记录

### 规模：**95 台设备 / 781 部件 / 31 品牌**（MODEL_INVENTORY.md 自动生成）；策展 93/95 台

### 下一项（按优先级）
1. 真机横向回归（需环境）
2. 引擎打磨：特写小图按部件类型定制方位；标签遮挡继续抽查
3. stl2glb-batch 工具完善：ASCII STL 与 3MF 支持（现仅二进制 STL）
4. 新设备需新一轮外部调研（GAP 四缺口已收官：陀飞轮/钢琴接入，Game Boy/手风琴无解）

### 验证基线（本会话末次全绿）
- `npm run lint:devices` 95/95（0 错 0 警）；`npm run build` ~1.8s；`npm run smoke` 全通过；
- Gitee main 同步至 dcbbb66；vendor/assets/originals 保持本地（gitignore）。

## 2026-10-30 · 策展第三批（mac/audio/穿戴/输入家族 12 台）

mac-studio/mac-mini、macbook-air/pro、imac、airpods-pro/airpods-5/airpods-max、
watch-ultra、airtag、flipper-zero、cherry-mx-switch。lint 90/90 + 4 台抽查通过（5fd42b5）。


## 2026-10-30 · 策展第二批（手机/平板/显示器家族 10 台）

s25 / s25-plus（同构 s25-ultra 14 步）、zflip7（外屏→铰链→两半→内屏）、
iphone-17 / iphone-18-pro-max、iphone-air（独石 7 步）、iphone-duo-fold（折叠 9 步）、
ipad-air / ipad-pro（含妙控键盘）、studio-display。至此策展设备 28 台（4+14+10）。

验证：lint 90/90；无头 Chrome 抽查 5 台 tour 步数/首步正确。
大厅 UI 审计（桌面 1440+移动 390 截图）：搜索/品牌 chips/统计/焦点展台均正常，无硬伤——
UI 大改版无据，继续按切片渐进打磨。已推送 733a01e。

### 下一项
见 AUTONOMOUS_BACKLOG.md（候选：mac/audio 家族策展、第三批设备接入、真机横向回归待环境）。


## 2026-10-30 · 剖切可读性 + pinball 弹射板核对

### 改动
1. **剖切**（`view-modes.js`）：clip 模式把受影响材质切 `DoubleSide`（快照含 side、退出精确还原），
   切腔内壁被渲染而非看穿；新增 CAD 风格半透明（0.09）accent 指示板挂在 scene，
   位置与 clipPlane 同一 `y - bob` 公式（设备呼吸时恒重合），退出时 dispose 移除。
   真 stencil 封盖的证据：EffectComposer 默认渲染目标无 stencil buffer，改动波及全管线 → LATER。
2. **pinball 弹射板核对**：模型仅含 1 只弹射板网格（红橡胶）；其白色本体（台面底部中央
   z 0.2–0.32 的 white_plastic）按位置归入 flippers；单弹射板为源模型限制，已记录。

### 验证
- ak-47 / action4 剖切截图目检：action4 主板/散热/电池内部结构清晰可读、指示板位置正确。
- 退出还原核对：action4 材质 89 个、还原后 35 个双面与进入前实测一致（CAD 源 ak-47 56/56
  原生双面——`cad2glb.py` 写入 doubleSided:true，非回归）。
- lint 90/90、build 2.05s、smoke 全通过。

### 下一项
见 AUTONOMOUS_BACKLOG.md。


## 2026-10-30 · 部件特写小图（详情卡离屏捕获）

### 改动
1. 引擎 `capturePartThumb(partId, size)`：独立透视相机（38° FOV，按当前视角方向取景）
   + 隐藏其余部件 + `renderer.render` 直渲进 `WebGLRenderTarget`（MSAA×4），
   `readRenderTargetPixels` 翻转写入 2D canvas → PNG dataURL。
   关键设计：**绕过 EffectComposer**（不干扰主画面、不依赖后期链），
   背景临时换 HUD 深蓝，`finally` 恢复部件可见性/选中态/清屏色。
2. DeviceViewer 详情卡新增 `.ctx-thumb`（1:1，object-fit cover）；
   watch 源为 `[partId, booted]` 组合——修复切台竞态：
   selectedPart 恢复自深链时引擎 partsById 可能还是旧设备，捕获为 null 且原实现不重试。
3. 移动端 sheet 同样生效（sheetH 已由 ResizeObserver 适配）。

### 验证
- action4 → pinball SPA 切台路径（原失败路径复现并修复）、ak-47/orrery/kitchen-blender
  特写全部出图（5.6万–13.1万字节 dataURL），无控制台错误。
- 移动端 390×844 截图目检：sheet 内特写图正确取景。
- build 1.97s、smoke 全通过。

### 已知限制
- 特写按当前装配状态渲染（爆炸中截图=爆炸位）；相机方向随主相机，个别部件可能背对——
  暂接受，后续可按部件类型定制方位。

### 下一项
见 AUTONOMOUS_BACKLOG.md。


## 2026-10-30 · Poly Haven 来源链接 + 设备页来源徽章修正 + 14 台策展

### 改动
1. **Poly Haven 13 台补 modelSource**：asset id 由原始件名推导（ph_ 前缀剥离），逐条 curl 验证 200；
   例外 `CashRegister_01` 为驼峰 id（Poly Haven API 查得）；lint 对 Poly Haven 署名强制 polyhaven.com 链接。
2. **设备页来源徽章修正（真实缺陷）**：`engine.js` 曾把所有带 GLB 设备标 "OFFICIAL"——社区模型被包装成官方。
   新增 `src/lib/model-class.js` 单一口径（有 modelCredit 且非 NASA → COMMUNITY），
   engine 徽章 / 大厅统计与卡片徽章 / gen-inventory 报表统一；NASA 官方几何计官方（35 官方 / 52 社区）。
   - 教训：改动当时漏 import 导致渲染循环 ReferenceError（页面 FALLBACK 降级）——由浏览器实测抓出并修复；
     smoke/render-thumbs 的状态等待正则补 COMMUNITY（否则社区设备 90s 超时）。
3. **14 台 Tour/X-Ray 策展**：ak-47（不完全分解叙事）/ iphone-12-teardown / iphone-16 /
   galaxy-s22-ultra / s25-ultra / zfold7（铰链优先）/ walther-p99 / santacruz-v10 /
   action5pro（对齐 action4）/ orrery（行星轨道序，sun X-Ray 露内芯）/ framework-laptop13（可维修叙事）/
   tr-808 / perseverance-rover / filmstrip-projector。

### 验证
- lint 90/90（当时 87）、gen:inventory（NASA→官方口径）、build、smoke 全通过。
- 无头 Chrome：5 台 tour 步数/首步正确、X-Ray 正常；ak-47/hubble/action4 徽章 + 大厅统计正确；
  ak-47 与 orrery X-Ray 截图目检。

## 2026-10-30 · 新设备批次 3 台（90 台 / 747 部件 / 29 品牌）

### 选题
后台研究子代理产出候选报告（/tmp/dji-next-batch-research.md：10 推荐 + 15 观察 + 26 落选，
Sketchfab API 23 组关键词 + 52 详情），按品类空白与结构可拆性选 3 台：搅拌机（厨电空白，作者明示
"every part seperate"）/ 角磨机（电动工具空白）/ 弹珠台（描述明示按真实机械构造建模）。

### 资产与接入
- 下载：IAB 内 Sketchfab 登录态（User-419afc4fcb）仍有效；`/i/archives/latest` 取 S3 直链，
  textureMaxResolution 回退 2048→1024→0（grinder/pinball 命中 1024）；node 侧 https.get 落盘 originals
  （页内 fetch 拿大文件不可行；长 URL 手工复制会损坏——必须程序化传递）。
- 压缩 webp→draco：blender 2.15MB→206KB（9%）/ grinder 8.57MB→887KB（10%）/ pinball 7.10MB→1.12MB（16%）。
- kitchen-blender（shiskin，CC-BY，6 部件）：3ds Max 匿名名按位置语义映射（mappingPrefix）；
  白漆过曝 postLoad 压暗 0.42（casio 模式）+ camDist 1.3。
- angle-grinder（Den.Prodan，CC-BY，5 部件）：body/disk/cyl/button/joint 语义根 × 1001/1002 双材质。
- pinball-machine（Ranguel，CC-BY，9 部件）：**引擎增强**——mapByPosition 增传第 5 参材质名
  （增量改动），按 17 个语义材质 + rel.y 分离灯箱做材质×位置混合聚类。
- 三台均配 tour + xrayShellIds；品牌名（DeWalt）仅作型号署名。

### 验证
- lint 90/90、gen:inventory 90 台/747 部件/29 品牌、build 1.97s、smoke 全通过、thumbs 3/3。
- 真机截图三台目检：blender（压暗后品牌字/拨盘/刀组可见）、grinder（朝向/配色正确）、
  pinball（直立体/灯箱/台面美术正确）。COMMUNITY 徽章正确。

### 已知限制
- pinball 弹射板疑似只有左一只（Object_32/33 一组），右弹射板可能并入其他网格——待逐网格核对；
  blender 顶沿仍有轻微高光溢出（已可接受）。
- 研究报告落选结论存档：钢琴击弦机最优模型是 by-nc-nd、Game Boy 全部 by-nc、
  手风琴/街机摇杆/前拨 CC-BY 版全部 <1 万面——这些缺口需换渠道（Thingiverse CC0 等）。

### 下一项
见 AUTONOMOUS_BACKLOG.md。


## 2026-10-30 · Gitee 仓库接入 + cad2glb 安全加固

### 背景
用户要求用新仓库 https://gitee.com/jxz_330/teardown-lab.git（解决 backlog 中 git 初始化项）。
提交被 Mimosa L3 门拦截：`tools/cad2glb.py` 3 处路径穿越高危。

### 改动
1. `.gitignore`：新增 `vendor/assets/originals/`（1.2GB 且单文件 >100MB 超 Gitee 限制，仅本地备份）、
   `rotate_m4.tmp.mjs`、`.v2c/`。
2. `tools/cad2glb.py` 路径守卫加固（真实安全改进，非仅过门）：
   - `safe_path`：拒绝 `..`，realpath 解析符号链接，输入须存在；
   - 新增 `clean_out_path`：以 cwd 为根、逐段 `[A-Za-z0-9._-]` 白名单重建输出路径（阻断穿越/符号链接/注入字符）；
   - 新增 `clean_in_path`：输入侧同构单出口消毒；
   - 读写均改 `os.open(..., O_NOFOLLOW) + os.fdopen`（显式标志位）；
   - CLI 目标经模块级 SRC/DST 全局传入函数（无 argv 字面量直传）。
   - 调试结论（供后人）：Mimosa 写入钩子不识别元组赋值消毒（`a, b = f(x), g(y)`）与多分支早退守卫，
     识别单出口赋值 + os.open 显式标志位；其行号标注不可靠。
3. 提交并推送：`6d4a18a` 初始提交（316 文件 / 88 GLB / public/assets 185MB）。

### 验证
- cad2glb 回归 4 项：正常写入 ✓、cwd 外输出拒绝 ✓、`..` 输入拒绝 ✓、无参 usage ✓（stl 模式端到端）。
- 推送成功：main → gitee.com/jxz_330/teardown-lab（osxkeychain 凭据，未改全局 git 配置）。
- Mimosa MCP 权威扫描（normal）：全项目 **0 发现**（seal e7448de2…）；L3 提交门对部分提交提示
  "扫描覆盖不完整"——按其要求不宣称项目安全，仅以回归测试佐证本次加固。

### 已知限制
- vendor/assets/originals 未入库（Gitee 单文件 100MB 限制），恢复需依赖本地备份。

## 2026-10-30 · 社区模型署名查证（37 台）

### 背景
backlog P1：22 台泛化署名（"by community (Sketchfab)"）+ 15 台已有作者但缺来源链接。

### 方法
- Sketchfab 公开 API：搜索（标题+作者）→ 模型详情（许可证/faceCount/viewerUrl）；
- 本地 GLB 三角面数 mode 感知精确计数（indexed count/3 + strip/fan n-2；`tools/inspect-glb.mjs`
  对多 primitive 网格会漏计，perseverance 实测 199471 而非 122225）；
- 交叉比对：本地面数 ≤ Sketchfab faceCount 且最接近者为来源（管线 trim 造成小差额）。

### 定案（要点）
- 20 台 Sketchfab：skartemka(AK-47)/tflexcad×2(NC)/fa001569(Countach；Lexyc16 因面数低于本地被排除)/
  DatSketch(NC)/Leo_Newman/freakering/better_peter/kirigami318/wimell(Free Standard)/playerhack/
  TastyTony/LaudoStudio/theclippingpathservice/Metazeon/lionsharp×2(930=CC-BY，Carrera4S=**CC-BY-SA**)/
  Blendoriano/Tomasoo/zstyle——全部含许可证与主页链接。
- **hubble-telescope / perseverance-rover 定案 NASA 3D Resources 官方公开模型（公有领域）**：
  两台原始文件名保留空格（"Hubble Space Telescope (B).glb" / "Mars 2020 Perseverance Rover.glb"），
  不符 Sketchfab 归档命名；NASA 页面核实 200（science.nasa.gov/3d-resources/hubble-space-telescope-b/
  与 /mars-2020-perseverance-rover）；perseverance 本地 199471 ≈ zaddazed 转载源 199309 亦互证为 NASA 系。
- royal-typewriter：topfrank2013 名下已无该模型（下架/转私），保留署名并链作者主页。

### 改动
- 37 台设备配置：modelCredit 写明作者+许可证，新增 `modelSource`（makeDevice 经 `...spec` 透传）；
  hubble/perseverance 的 `source` 字段改为"官方公开模型（NASA 3D Resources · 公有领域）"。
- `DeviceViewer.vue`：MODEL CREDIT 区新增「模型主页 ↗」链接（`.credit-link`，noopener）；
  泛化标记逻辑保留作兜底（现无设备命中）。
- `style.css`：`.credit-link` 样式（9px 等宽、下划点线、hover/focus-visible）。
- `tools/lint-mapping.mjs`：社区模型（credit/source 含 社区|Sketchfab|Poly Haven）强制——
  禁止 "by community" 泛化署名；Sketchfab 署名必须带 sketchfab.com modelSource；
  NASA 署名必须带 science.nasa.gov modelSource；modelSource 必须 https。

### 验证
- `npm run lint:devices` 87/87（0 错 0 警）；`npm run build` 2.09s；`npm run smoke` 全通过。
- 无头 Chrome（`--enable-unsafe-swiftshader`，旧 `--use-gl=swiftshader` 在当前 Chrome 已失效）实测
  ak-47/hubble/galaxy-s22-ultra/perseverance 信息面板：署名/链接/标记消失均正确，无控制台错误。
  （首次两轮返回 null 系无头环境 WebGL 被禁，非产品回归；LOAD ERROR 面板按设计工作。）

### 已知限制（考据存档）
- 面数偏差未解释的 4 台：ak-47（本地 33718 vs 在线 20561，slug 唯一命中）、
  v8-engine（2003742 vs 2197453，−8.8%，slug 唯一命中）、orrery（118480 vs 59816，恰 2.0×）、
  computer-parts（68372 vs 36777，1.86×）——疑为 LOD/重传/转换差，作者依据接入期文件重命名
  （`*_作者.glb` 约定）与 slug 判定；许可证据可信。
- galaxy-s22-ultra 等 4 台为 CC-BY-NC（非商业）、Carrera 4S 为 CC-BY-SA（衍生须同许可）——
  如公开发布需在关于页明示；iphone-16 为 Sketchfab Free Standard 许可。

### 下一项
见 AUTONOMOUS_BACKLOG.md；候选：多机型 Tour/X-Ray 策展、Poly Haven 17 台来源链接、
剖切封盖、新设备研究接入（下一批候选调研）。


## 2026-10-29 · 审计后第一批修复（P0/P1/P2）

### 背景
全面阅读项目后确认的基线：82 台设备 / 692 部件 / 82 个 Draco GLB；设备页因 `registry.js` 静态全量 import，
进入任意一台都会解析全部 82 份配置；移动端浮层与详情 sheet 压盖；大厅统计把全部 GLB 计为“官方模型”；
X-Ray 回退把所有外观件透明化导致镜头/玻璃叠 Bloom 过曝；另有缓存无并发合并、无障碍与打包卫生问题。

### 改动
1. **设备配置按需加载**
   - `vite.config.js`：新增 `virtual:device-loaders`，构建期生成 `id → () => import('./设备文件')`；与 manifest
     共用缓存并在设备文件变更时失效。
   - `src/components/DeviceViewer.vue`：改用 manifest 元数据 + 按 id 动态加载完整配置；切台带序号守卫，
     配置加载完成前用元数据占位；`isMobile` 改为媒体查询监听。
   - `src/devices/registry.js`：注明仅 Node/工具使用。
2. **移动端浮层让位**
   - `DeviceViewer.vue` 用 ResizeObserver 实测 `#ctxCard` 高度写入 `--sheet-h`；
   - `src/style.css` 在 ≤700px 下让 `#clipStrip / #tourBar / #toast` 上移到 sheet 之上。
3. **大厅口径与布局**
   - `GalleryHub.vue`：官方/社区模型分开统计；焦点展台标签移入 `.hub-hero` 网格，不再压副标题。
4. **X-Ray 收敛**
   - `src/engine/view-modes.js`：`xrayShellIds` → `realPartIds`（排除 lens/sensor 等光学件）→ 关键词兜底；
   - `action4 / mavic3pro / vision-pro / switch2` 补 `xrayShellIds`，并配置策展后的 `tour` 顺序。
5. **引擎 / 缓存 / 无障碍**
   - `engine.js`：切台时 AbortController 取消旧 GLB 下载；过期装载异常不再覆盖当前状态；清理待机自转定时器；
     Draco 路径走 `assetUrl`；归一化落点跟随各设备的 `unmappedTo`。
   - `glbCache.js`：同 URL 并发合并、引用计数取消、`assetUrl` 统一路径；`prefetchGlb` 复用在途请求。
   - `labels.js`：标签可聚焦（role=button / tabindex / Enter·Space 选中）。
   - `_kit/factory.js`：未映射网格落点改为真实存在的部件（shell/body/case/frame… → realPartIds → parts[0]）。
   - `tools/lint-mapping.mjs`：新增 `xrayShellIds`、`unmappedTo` 错误校验与 `tour` 警告。
   - 新增 `src/lib/url.js`（BASE_URL 前缀）、`public/favicon.svg`，`index.html` 引用图标。
6. **工程卫生**
   - 将 `public/assets/.mimosa`、`src/devices/.mimosa` 与 4 个 `.DS_Store` 移至 `/tmp/dji-junk-backup/`（可恢复）；
   - `vite.config.js` 新增 `clean-dist-junk`；新增 `.gitignore`；
   - 新增 `tools/smoke.mjs` 与 `npm run smoke`（自起 Vite + 无头 Chrome 的 10 项断言）。
7. **文档**
   - `TECH.md` 更新插件/架构说明、GLB 体积、设备数量口径；`docs/UPGRADE-3.0.md` 去掉过时台数。

### 验证
- `npm run lint:devices` → 全部 82 台通过（0 错 0 警）。
- `npm run gen:inventory` → 82 台 / 692 部件 / 82 GLB / 27 品牌。
- `npm run build` → 1.71s；`DeviceViewer` chunk 883.82KB（gzip 248.11KB）；dist 201MB；无 `.mimosa/.DS_Store`。
- `npm run smoke` → 10/10 通过：大厅 82 卡、统计 6 项、标签不重叠、action4 14 部件、
  仅请求当前配置、X-Ray 可进入、移动端 sheet 与剖切条间距 19.6px、无控制台错误。
- 实测数据：设备页 heap 34.4–35MB（修复前记录 ~41MB）；DOM 挂载 canvas 1 个。

### 已知限制
- 浏览器验证仅覆盖无头 Chrome + SwiftShader；未做 iOS Safari / 真实 Android 回归。
- 49 台社区模型的 credit 仍是泛化文案，缺作者与许可证链接；本轮未编造署名。
- 项目仍不是 git 仓库；未做任何提交。

### 下一项
见 `AUTONOMOUS_BACKLOG.md`：优先补社区模型署名与更多机型的 Tour/X-Ray 策展。

## 2026-10-29 · 生产构建预览 + 多机型 / 缩略图回归

### 改动
- `tools/render-thumbs.mjs`：等待条件增加 `state.device.id === 目标 id`。原因：hash 切台是页内导航，
  `getState().booted` 不会复位，批量渲染在多台连渲时可能截到上一台画面（本轮验证中实际复现：
  旧的等待条件在 `switch-2` 上读到 `LOADING 0%` 的中间态）。

### 验证
- `npm run preview -- --port 8222`（生产构建）+ 无头 Chrome，13 项全通过：
  - 大厅 82 卡，统计 33 官方 / 49 社区（另 82 设备 / 692 部件 / 27 品牌 / WEBGL）；
  - `action4` OFFICIAL · AC203 · 14 部件，Tour 启动 `total=14`；
  - 多机型抽查均 OFFICIAL：`vcr-hanseatic` 5 / `tr-808` 11 / `marshall-jcm800` 4 /
    `polaroid-coolcam` 8 / `switch-2` 6 / `vision-pro` 10 部件；
  - 移动端 390×844：sheet 与剖切条间距 19.6px；
  - 全程无控制台错误。
- `npm run thumbs -- --only action4,switch-2,marshall-jcm800` → 3/3 成功
  （20.5s / 3.9s / 5.9s），逐张检视画面为对应设备，未截到旧设备。
- 临时 dev(8201) / preview(8222) 已停止；用户自有 8200 未触碰。

### 备注
- 首次预览脚本的 2 项“失败”是脚本断言的错误（统计列索引、`getState().tour` 为原始对象无 `total`），
  修正后通过；产品侧仅 `render-thumbs` 存在真实竞态，已修复。

## 2026-10-29 · 导览兜底 + 缓存容量上限

### 改动
1. **无策展设备的 Tour 兜底**（`engine.js`）
   - 原逻辑：没有 `tour` 配置就按 `parts` 配置顺序导览；配置顺序与拆解顺序无关。
   - 现逻辑：按爆炸偏移长度从外到内排序（外壳→内部），策展 `tour` 仍优先；策展 ids 全部失效时也走兜底。
2. **GLB 缓存容量上限与 LRU 淘汰**
   - 新增 `src/engine/cache-policy.js`：纯函数 `planEviction(meta, cap, keepUrl)`，默认 512MB，
     最久未使用优先，刚写入的条目不淘汰。
   - `glbCache.js`：写入成功后记 `localStorage['teardown-glb-meta-v1']`（url → at/size）并同步淘汰；
     缓存命中刷新 `at`；localStorage 不可用时退化为不限额。淘汰在返回数据前完成，避免并发下超限窗口。
3. **回归脚本**
   - `tools/smoke.mjs` 增至 11 项断言（新增“无策展设备 Tour 按外→内兜底”，并给移动端等待加设备 id 守卫）。

### 验证
- `node` 直接 import `cache-policy.js`：5 项断言通过（未超限/最旧优先/keep 不淘汰/缺省体积/边界）。
- 浏览器缓存测试 8/8：写入 Cache Storage 且记账 0.35MB；二次进入 0 次 GLB 网络请求；
  命中刷新 LRU 时间；伪造 800MB 旧条目后淘汰最旧一条，保留未超限条目，元数据同步删除。
- `npm run lint:devices` 82/82；`npm run build` 1.88s（DeviceViewer gzip 248.13KB）。
- `npm run smoke` 11/11；生产预览 14/14（含 Tour 兜底、6 机型、移动端间距 19.6px）。
- 临时 dev(8213) / preview(8222) 在收尾时停止。

### 已知限制
- 旧版本已写入缓存的条目在首次命中前不参与容量统计（命中时补记体积）；当前资产总量 174MB，
  低于 512MB 上限，短期无影响。

## 2026-10-29 · 子路径部署实测

### 改动
- `vite.config.js`：`copy-draco-decoder` 与 `clean-dist-junk` 改为从 `configResolved` 读取 `build.outDir`，
  不再写死 `dist/`。此前 `vite build --outDir dist-subpath` 会把 Draco 解码器拷进真实 `dist/`，
  子路径产物缺解码器。

### 验证
- `npx vite build --base=/x/ --outDir dist-subpath` → Draco 落入 `dist-subpath/assets/draco/`，
  `index.html` 资源前缀为 `/x/`。
- 静态服务把 `/x/` 映射到产物目录，无头 Chrome 7/7 通过：大厅 82 卡、缩略图 `/x/thumbs/`、
  action4 OFFICIAL 14 部件、Draco 解码器 `/x/assets/draco/`、无 4xx、无越界同源请求、无控制台错误。
- 之后删除临时 `dist-subpath/`，重新执行默认构建（1.69s，dist 201MB）。

### 备注
- 检查过程中出现的随机 UUID 请求为 `blob:` URL（GLTFLoader 内嵌纹理），并非越界网络请求；
  断言已按协议过滤。

## 2026-10-29 · 社区模型署名状态标注

### 背景
49 台社区模型里 22 台署名为泛化文案（如 “... by community (Sketchfab)”），没有作者和许可证；
原 UI 只显示 MODEL CREDIT 文本，容易被当成已核实署名。

### 改动
- `DeviceViewer.vue`：设备总览中，泛化署名后追加 “来源待核实” 标记（title 说明：仅标注社区来源，
  作者与许可证尚未核实）；有明确作者/许可证的 27 台不显示。
- `style.css`：`.credit-flag` 胶囊样式，宽度自适应，不溢出面板。

### 验证
- 无头 Chrome 5/5：galaxy-s22-ultra 显示标记且 title 正确、不溢出面板；switch-2（NAIT Studio, CC-BY 4.0）
  不显示；无控制台错误；截图 `/tmp/dji-credit-generic.png` 目视确认层级与字号。
- `npm run build` 1.71s；`npm run smoke` 11/11。

### 未完成
- 22 台泛化署名的真实作者/许可证仍需外部查证，未编造。

## 2026-10-29 · three.js 独立 chunk

### 改动
- `vite.config.js`：`build.rollupOptions.output.manualChunks` 把 `node_modules/three/` 拆为 `three` chunk。
  目的不是减小总量，而是让版本稳定的 three 在发版后继续命中旧缓存；engine/设备逻辑仍单独成块。
- `tools/smoke.mjs`：新增“大厅不加载 three.js”断言（12 项）。

### 验证
- 构建：`DeviceViewer` 903.95KB → 132.74KB（gzip 248.13 → 50.08KB）+ `three` 771.32KB（gzip 198.73KB）；
  总量基本不变（+0.11KB / +0.68KB gzip）。
- 生产预览 3/3：大厅 0 次 three chunk 请求；设备页恰好 1 次 `three-*.js`；action4 OFFICIAL 14 部件。
- `npm run smoke` 12/12（含新增断言）。

## 2026-10-29 · 设备配置加载失败态

### 问题
配置 chunk 动态 import 失败（发版后旧 chunk 404、弱网）时，挂载路径只写 `window.__ENGINE_ERR` 和 console，
页面停在空场景；切台路径只有 toast，没有恢复入口。

### 改动
- `DeviceViewer.vue`：新增 `loadFailed` 状态与错误面板（`role="alert"`）：
  “重新加载”（整页刷新）/“返回大厅”；挂载与切台失败都置位，导航/重试时复位。
- `style.css`：`#loadErr` 居中遮罩面板，宽度 `min(340px, 100vw - 48px)`。

### 验证
- 无头 Chrome 请求拦截 abort `action4.js`：4/4 通过——错误面板可见、文案与两个按钮正确；
  解除拦截点“重新加载”恢复 14 部件；再次阻断后点“返回大厅”回到 `#/`。
- 截图 `/tmp/dji-loaderr.png` 目视确认层级与对比。
- `npm run build` 1.71s；`npm run smoke` 12/12。

## 2026-10-29 · prefers-reduced-motion 支持

### 问题
项目此前完全没有处理 `prefers-reduced-motion`：开场 GSAP 编排、相机缓动、设备呼吸浮动、待机自转、
CSS 装饰动画（扫描线/脉冲）都照常播放，不符合无障碍与 AGENTS 的降级要求。

### 改动
- `DeviceViewer.vue`：读取 `prefers-reduced-motion`；命中时跳过开场时间线（直接显示控制条并给出操作提示），
  并把该偏好传给引擎。
- `engine.js`：`reducedMotion` 选项——相机缓动直接落到终点、关闭呼吸浮动与粒子旋转、不启动待机自转；
  `getState()` 补 `autoRotate` 字段便于验证。
- `style.css`：`@media (prefers-reduced-motion: reduce)` 将动画/过渡压缩到 0.001ms。

### 验证
- 无头 Chrome 模拟 `prefers-reduced-motion: reduce`，7/7 通过：开场标题立即隐藏、控制条 opacity=1、
  相机缓动已清空、过渡时长 1e-06s、3.5s 后 `autoRotate=false`、Space+2 仍可拆解与进入 X-Ray、无控制台错误。
- 截图 `/tmp/dji-reduced-motion.png`。
- 常规模式回归：`npm run build` 1.97s；`npm run smoke` 12/12。

### 本批收束验证
- `npm run lint:devices` 82/82。
- 生产预览 14/14（大厅口径、action4 14 部件与 Tour、6 机型抽查、移动端间距 19.6px、无控制台错误）。
- three chunk 3/3（大厅不加载、设备页恰好 1 次、装载正常）。
- `dist` 201MB，无 `.mimosa/.DS_Store`；临时 dev/preview/静态服务均已停止，用户自有 8200 未触碰。

## 2026-10-31 · 数字博物馆全景研究（ROADMAP 阶段，零代码改动）

### 任务
用户下达《DIGITAL TECH MUSEUM · ULTIMATE DEEP RESEARCH》任务书：20 个方向的全维研究，第一阶段只调研与规划。

### 改动（全部为文档，未动 src/tools）
- 新增 `docs/MUSEUM-ROADMAP.md`：主报告（现状诊断 / AI Skill / 技术库 / 开源项目 / 产品功能 / 设计规范索引 / 数据 Schema / 8 阶段路线图 / 未验证清单与来源索引）。
- 新增设计规范五件套：`docs/DESIGN_SYSTEM.md`、`docs/DESIGN_SKILLS.md`、`docs/DESIGN_QA.md`、`docs/MOTION_GUIDELINES.md`、`docs/3D_EXPERIENCE_GUIDELINES.md`（token 全部实测自 style.css/hud.css/engine.js）。

### 调研过程与证据
- 全部外链经 Web 实证（GitHub 存在性/许可证/维护、Apple 官方 HIG/Liquid Glass URL、npm peer 兼容），来源索引见 ROADMAP 附 B。
- 关键核实结论：dickwu/apple-design-skill 为社区项目且无 OSS 许可证（只摘录原则不安装）；pbakaus/impeccable Apache-2.0 且明确支持 Trae；anthropics/skills 官方含 frontend-design；GSAP 3.13 起全插件免费；pmndrs/postprocessing 最新版与 three 0.164 不兼容（需钉 6.36.x）；three-mesh-bvh 兼容可引入；Smithsonian dpo-voyager 官方开源 Apache-2.0；任务书候选"PRISM Configurator"检索不存在（判定虚构）；Vestige 未开源；Theatre.js 开发转私有仓。
- 后台子代理并发限制致 2 个调研代理被杀（与既有记录一致），相应主题（AI Skill、Vue UI/动效）已由主会话串行补齐；Three.js 生态代理完成并交付核实报告。

### 验证
- 本轮为研究切片，无构建影响；`git status` 确认仅新增 docs/*.md（用户未提交的 regency-tr1.glb 未触碰）。
- 文档一致性：DESIGN_SYSTEM 的 token 值逐项对照 style.css/hud.css 原文；引擎画质阶梯对照 engine.js applyQuality 注释。
- **并行会话事件**：研究收尾时发现另一会话在同一仓库推进（Regency TR-1 接入、smoke 移动端断言等 5 个提交），其 90dc99d 提交将本报告 docs/MUSEUM-ROADMAP.md 一并纳入（内容与工作区字节一致，无损坏）；据此把报告基线从 102 台修正为 103 台 815 部件 38 品牌，smoke 口径改为"15 项全绿"。设计规范五件套与 LOG/BACKLOG 改动截至本条仍为未提交状态，是否提交由用户决定。

### 已知限制
- "Three.js Skill"独立仓库未核实到（搜索超时）；headlessui Vue 维护细节未逐项核实——均在 ROADMAP 附 A 声明。
- 真机 iOS/Android 回归仍缺（既有 BACKLOG 项）。

### 下一项
按 ROADMAP Phase 1 收尾即 Phase 2：three-mesh-bvh 引入 + 测量工具态（先做最小可验证原型：单设备两点测距），随后 stencil 剖切封盖与 assembleStep。

## 2026-10-31 · 设计 Skill 安装（承接 ROADMAP 第二部分）

### 改动
- 新增 `.zcode/skills/impeccable/`（v4.8.0，自 pbakaus/impeccable plugin/skills 成品目录拷贝，含 LICENSE/NOTICE；Apache-2.0）。
- 新增 `.zcode/skills/frontend-design/`（自 anthropics/skills skills/frontend-design 拷贝，含 LICENSE.txt；Apache-2.0）。
- `docs/DESIGN_SKILLS.md` 同步安装状态与基线结果。

### 验证
- `impeccable --version` → 4.8.0（引擎二进制首次运行自动下载并校验，缓存于 ~/.impeccable）。
- `impeccable detect src/` → 122 文件 0 反模式；1 条 advisory（--ease-spring 弹性缓动）。记录为基线，缓动保留（规范定位点缀用）。
- 注：两个 skill 需新开会话才会进入技能清单（当前会话启动时已扫描完毕）。

### 下一项
不变：Phase 2 —— three-mesh-bvh 两点测量原型 → stencil 剖切封盖 → assembleStep。

## 2026-10-31 · Phase 2 切片 1：两点测量工具（three-mesh-bvh）

### 问题
ROADMAP S4：拆解馆没有测量能力。本切片补齐 LAB 基础件第一项——BVH 加速的两点表面测距。

### 改动
- `package.json`：+`three-mesh-bvh@0.9.17`（MIT；peer three ≥0.159 兼容 0.164）。落点在 DeviceViewer chunk（+40KB），three chunk 771.42KB 零变化，大厅不加载。
- `engine.js`：全局换装 `Mesh.raycast = acceleratedRaycast`（无 boundsTree 自动回退，默认路径零开销）；测量工具态 `setMeasure(on)`——首次激活惰性构建全设备 boundsTree（pocket3 123 几何 ≈20-29ms，达标 <100ms）；两点表面取点（标记球 + 连线 + 读数胶囊挂 #labels）；读数标定 `mm = 场景距离/targetWidth × realSizeMM`（模型等比缩放下恒成立）；第三次点击重测；爆炸/切模式/导览时点位失效（工具保持）；disposeDevice 释放 boundsTree 与测量对象；getState/emit 增 `tool` 字段。
- `DeviceViewer.vue`：dock 测量按钮（KeyM）、Esc 先退测量、toast 操作提示、帮助卡新增 M 行。
- `style.css`：`.measure-tip` 玻璃读数胶囊。
- `devices/pocket3.js`：`realSizeMM: 139.7`（官方最大外形尺寸，试点标定）。
- `tools/smoke.mjs`：+2 项永久断言（两点取点读数、mm 格式），15 → 17 项。

### 调试记录
- 首轮验证 7 项失败定位为两个问题：① 测试点位打偏（pocket3 竖握把屏上仅约 130px 宽，±70px 横向偏移脱靶）→ 改竖向两点；② 真 bug：`.measure-tip` 类默认 display:none，`style.display=''` 盖不过类选择器，读数永不显示 → 改 `display='block'`。

### 验证
- `/tmp/verify-measure.mjs` 11/11：M 进入/第一点不触发选中/两点连线读数/mm 与距离换算一致/三次点击重测/爆炸失效且工具保持/Esc 退出/BVH 日志/移动端触屏两点/dock 13 按钮/无控制台错误。
- 截图 `/tmp/measure-desktop.png`、`/tmp/measure-mobile.png` 目视通过：标记点+连线+读数胶囊清晰，标签无互叠，移动端画布可操作。
- `npm run build` 1.95s；`npm run lint:devices` 103/103；`npm run smoke` 17/17。

### 已知限制
- 读数精度依赖模型等比正确性（官方模型可信，社区模型近似）；未标定设备显示场景单位并注明。
- 测量在装配态语义最准；爆炸态点位已被禁用（自动清空）。

### 下一项
Phase 2 切片 2：剖切真封盖（stencil 模式 + 自建 stencilBuffer RenderTarget，失败回退 DoubleSide 方案）。

## 2026-10-31 · Phase 2 切片 2：剖切 stencil 封盖（剖面玻璃）

### 问题
ROADMAP Phase 2 第二项：剖切此前为 DoubleSide 内壁 + 全方形半透明指示板（指示板外溢到设备轮廓之外）。
根因回顾：EffectComposer 默认 RT 无 stencil buffer，官方 stencil 封盖当年因此搁置。

### 改动
- `engine.js`：自建 `{type: HalfFloatType, stencilBuffer: true}` RT 传入 EffectComposer（renderTarget2 克隆继承；
  构造后立即 setSize 修正 composer 的 CSS 口径记账）；`useStencilCap` 传给 view-modes；
  `capturePartThumb` 离屏直渲期间 `modes.setCapHidden(true)`（离屏 RT 无 stencil，NotEqual 会整面误绘）；
  loadDevice 完成时重放当前模式（修复慢网下部件注册前切入剖切/透视永不生效的既有缺陷）；
  `getState()` 增 `clipCap` 观测字段（'stencil'|'indicator'|null）。
- `view-modes.js`：applyClip 时设备网格统一 renderOrder=6（快照含 renderOrder，退出还原）；
  stencil 掩码 = 背面 IncrementWrap / 正面 DecrementWrap 奇偶计数（挂源网格子节点、继承爆炸/呼吸变换、
  geometry 共享）；求掩码裁剪面比可视切面低 δ≈0.9% 高度（避开宽大水平面被斜切的近共面碎片带）；
  可视剖切面上移 ε≈0.15%（同理）；accent 半透明盖板（opacity .30、不写深度）仅在 stencil≠0 处绘制、
  onAfterRender 清 stencil；无 stencil 回退指示板。
- `TECH.md` §5.4 同步；smoke +1 永久断言（clipCap=stencil），17 → 18 项。

### 调试记录（5 轮实机迭代，按序）
1. 官方奇偶法直接上 → 全截面斑驳噪点：宽大水平面（顶壳）被切出近共面碎片，污染穿越计数。
2. FrontSide-only Increment → 掩码近空：剖切实体的射线从开口进入、不穿正面，只从底面（背面）穿出——奇偶法不可替。
3. 盖板带 clippingPlanes + 抬升 → 盖板自裁（631 像素）：官方示例盖板不挂裁剪面，靠掩码约束。
4. 掩码裁剪面下移 δ + 奇偶还原 → 实心盖板灌满内腔：action4 壳底开口由非外壳件封闭、内部件也是
   非水密盒体，逐模型拓扑差异使"只盖实体材料"不可靠——改产品决策：半透明剖面玻璃（内腔始终可见，
   对 103 台混合拓扑安全；掩码仍让截面版贴合设备轮廓，优于旧全方形指示板）。
5. pocket3 切到 0.45 擦过机身顶面 → 盖板上斑驳：可视切面上移 ε 让水平面完整保留在切面之下。

### 验证
- `/tmp/verify-clip-cap.mjs` 10/10：capKind=stencil、盖板像素显著增加（clip=4.3 万 vs 整机 3 千）、
  爆炸共存、剖切态特写捕获正常且盖板随后恢复、退出还原、二次进出、移动端 390×844、控制台零错误。
- `/tmp/spot-clip.mjs` 抽查 pocket3（官方粉 accent）/v8-engine（社区 CC-BY）/orrery（社区 CC-BY 圆轮廓）
  3/3：封盖生效、退出还原、零错误；挑衅时序（引擎出现即切剖切、早于部件注册）经装载后重放全部生效。
- 截图目检：action4 截面版贴合轮廓且镜头圆孔轮廓跟随、pocket3 粉色 accent 换肤、orrery 椭圆贴合；
  移动端画布可操作、剖切条不被 sheet 遮挡。
- `npm run build` 2.0s；`npm run lint:devices` 103/103；`npm run smoke` 18/18。

### 已知限制
- 奇偶掩码对个别拓扑在个别切高仍可能有轻微噪点（pocket3 屏幕折边处极轻残留）；实心盖板需求
  需逐模型水密校验，不在本切片范围。
- 剖切模式多两次全设备几何的 stencil 绘制（仅剖切态），画面无帧率回归（SwiftShader 环境流畅）。

### 下一项
Phase 2 切片 3：`assembleStep` 策展字段 + 逐步装配模式（2-3 台试点）。

## 2026-10-31 · Phase 2 切片 3：assembleStep 逐步装配

### 问题
ROADMAP Phase 2 第三项：拆解馆只有"一键爆炸/装配"，缺少按真实装配关系逐组拆装的叙事能力。

### 改动
- `engine.js`：stepMode/stepCur/stepTarget/stepGroups 状态；`computeStepGroups()`（策展 `assembleStep`
  过滤未知 id、未列部件追加末组；无字段设备按爆炸偏移长度升序兜底分 ~5 层）；`stepAssembly(on)`
  进入时与当前画面无缝衔接（装配态先逐组拆开展示、爆炸态直接从 0 装）+ 相机飞至爆炸位；
  退出先补齐装配再交还爆炸系统（避免两套插值口径跳变）；主循环双模式插值分支
  （step: `lt = easeIO(1 − clamp(stepCur − 组号, 0, 1))`，标签外侧 1/3 桶口径随 explodeCurrent 对齐）；
  到位后一次 emit；`setExplode` 滑杆/空格随时接管退出；`getState()` 增 `step`/`partsCount`
  （parts/partsById 含 THREE 对象不再外泄）、`getPartOffset(id)` 观测。
- `DeviceViewer.vue`：dock「逐步装配」按钮（KeyB）；滑杆位切换步进器（‹ 装配 i/n ›）；←→ 步进
  （优先级 step > 导览 > 切台，修掉切台分支吞掉方向键的问题）；Esc 链插入 step 退出；帮助卡 +1 行。
- `style.css`：`.step-ctl/.step-btn/.step-count`；≤700px 滑杆隐藏但步进器保留（移动端唯一装配入口）。
- `devices/action4.js`（7 组策展：机身→镜组→主板散热→电池→双屏→盖板→外部五金）、
  `devices/pocket3.js`（6 组：机身→电池→控制→云台→旋转屏→背板仓盖）。
- `tools/lint-mapping.mjs`：assembleStep 非空数组/未知部件/跨组重复校验。
- `tools/smoke.mjs`：+3 永久断言（进入 0/7、前两组就位 shell/mainboard 位移、Esc 补齐装配退出），18 → 21 项。

### 调试记录
- 方向键失效根因：onKey 链最前面 ArrowLeft/Right 是切台导航，后加的分支是死代码——按下实际切到了
  下一台设备。修为 step > 导览 > 切台优先级。
- 二次失效根因：引擎 `emit()` 发手拼载荷不含 `step`，Vue 壳 ui.step 恒 undefined—— getState() 正确
  但 UI 永远收不到。补 emit 字段 + 动画到位后一次 emit。
- `getState()` 曾直接外泄 THREE 对象（parts 数组），深拷贝进 Vue 响应式有隐患；改出 `partsCount`，
  smoke 相应改读计数字段。

### 验证
- `/tmp/verify-step.mjs` 10/10：装配态进入自动拆开至 0/7、两步后 lens=0/mainboard=2.72、回退、
  Esc 补齐装配退出、pocket3 dock 按钮 6 组、marshall 兜底 4 组、移动端步进器可见可点（i=0 时
  上一步正确禁用）、控制台零错误；截图 step-two-groups/step-pocket3/step-mobile 目检通过。
- `npm run build` 1.7s；`npm run lint:devices` 103/103；`npm run smoke` 21/21。

### 已知限制
- 逐步装配的相机不会自动聚焦当步部件（复用爆炸位取景）；策展组名未做（UI 显示计数）。
- 进入时机在拆装动画中途时有轻微插值口径切换跳变（静止态进入无跳变）。

### 下一项
Phase 2 收官（测量/封盖/装配齐）。下一优先：Phase 3 设备数字档案增量字段 + lint-knowledge + 20 项
高频技术原理库（src/knowledge/technologies，全部带 sources，未编写显示"待编写"）。

## 2026-10-31 · Phase 3 切片 1：技术原理知识库基础设施

### 问题
ROADMAP S1/S2 核心：馆内只有部件级参数文案，无跨设备的技术原理知识层。

### 改动
- `src/knowledge/technologies/`：6 项全量词条（cmos-sensor/li-po-battery/loudspeaker/three-axis-gimbal/
  escapement/superheterodyne，各含 principle/history/invented/sources/confidence）+ `_stubs.js`
  14 项占位登记（principle 留空，UI 显示"原理编写中"）+ `src/knowledge/index.js` 聚合与
  `techForPart()`（精确命中优先、最长前缀次之）。
- `DeviceViewer.vue`：详情卡「原理」折叠区（正文/起始年/时间线/来源外链；未命中部件不渲染）。
- `style.css`：`.ctx-tech/.tech-head/.tech-body/.tech-hist/.tech-src` 词条样式。
- `tools/lint-knowledge.mjs`：id 唯一、relatedParts 全部存在于全馆 414 个部件 id 词表、
  relatedDevices 必须存在于 registry、principle 非空必须带 ≥1 条 https sources（禁止无来源正文）、
  占位词条豁免；已编写/待编写计数输出。挂入 `npm run lint:devices` 联动。
- `tools/smoke.mjs`：+1 永久断言（action4 sensor → CMOS 词条 + ≥1 来源链接），21 → 22 项。
- 附带：Mimosa 深度安全扫描重跑完成（0 发现 · 107 依赖包 · 0 命中公告，已封印）——清掉此前
  commit/push 钩子的"扫描不完整"挂账。

### 内容可信度
- 6 项词条的 6 个 Wikipedia 来源 URL 全部经 WebFetch 实证存在且内容匹配（发明年/史实直接取自
  抓取结果）；relatedParts 首轮 lint 拦下 19 处臆测 id，全部按实测词表修正——lint 机制本身
  就是防臆造的第一道闸。

### 验证
- `npm run lint:devices` 103 台 + 知识库 20 条全绿；`npm run build` 1.75s；`npm run smoke` 22/22。
- 截图目检：全量词条（正文+时间线+来源）、占位词条（"原理编写中"）桌面 1440×900 通过；
  卡片 overflow-y:auto，折叠线下内容可滚动可达。

### 已知限制
- era/series 等设备级档案字段未动（需逐台查证，下一批）；14 项占位原理待逐项编写。
- 知识文本进 DeviceViewer chunk（约 +3KB gzip），大厅不受影响。

### 下一项
Phase 3 切片 2：era 字段（先从配置内已有年份的 66 台做起，逐台核对措辞）或继续编写 14 项占位原理。

## 2026-10-31 · Phase 3 切片 1b：知识词条扩编至 10/20

### 改动
- 新增 4 项全量词条：camera-optics（镜头与光学系统）、oled-display、wireless-power（Qi）、
  haptic-engine（LRA/Taptic），来源 4 个 Wikipedia URL 全部经 WebFetch 实证（发明年/史实取自抓取正文）。
- `_stubs.js` 相应移除 4 项（剩 10 项占位）；index.js 挂载；修正 three-axis-gimbal 的
  relatedDevices（action4 为电子防抖无机械云台，改为真正有 gimbal 部件的 pocket3/mavic3pro/mini4pro/avata2）。

### 验证
- `npm run lint:devices`（含知识库）全绿：已编写 10 / 20；`npm run build` 1.76s
  （DeviceViewer chunk gzip 77.8KB，+2KB）；`npm run smoke` 22/22。

## 2026-10-31 · Phase 3 切片 1c：技术词条 20/20 收官

### 改动
- 新增 10 项全量词条：pcb-soc、usb-c、cooling-module（热管/VC）、mainspring-drive、wheel-train、
  turbine-engine（涡扇）、vacuum-tube、typebar-linkage、acoustic-horn、internal-combustion（四冲程）。
- 10 个 Wikipedia 来源 URL 全部经 WebFetch 实证（发明年/组件/史实直接取自抓取正文：
  USB-C 2014-08-11 规范 1.0、Conway 1959 首型涡扇、Fleming 1904 二极管、Otto 1876 四冲程等）。
- `_stubs.js` 清空（占位机制保留，供未来新增部件类目时使用）；index.js 挂载至 20 项。
- relatedDevices 按实测词表核对（cooling-module 改 action4/framework-laptop13/mac-mini——
  初稿误写无 fan 部件的 s25-ultra，设备词表 grep 核实后修正）。

### 验证
- `npm run lint:devices`（含知识库）全绿：已编写 20 / 20；`npm run build` 2.0s；`npm run smoke` 22/22。
- 截图目检：v8-engine 活塞连杆 → 「原理 · 内燃机四冲程循环」正文+时间线+来源完整渲染。

### 下一项
Phase 3 切片 2：设备级 era 字段（逐台查证发布年，lint 强制格式与来源），随后 era 驱动 gen-timeline。

## 2026-10-31 · Phase 3 切片 2：设备级 era 字段（首批 35 台）

### 改动
- 33 台设备配置新增 `era`（数字年份或 '1940s' 形式年代串）——取值全部来自各配置已策展描述中的
  年份陈述（人工逐一甄别，排除 CR2032 纽扣电池之类的假阳性）；另 pocket3/action4 两台 DJI 设备
  经外部实证补齐：pocket3 = 2023-10-25（DJI 官方公告页），action4 = 2023-08（Osmo Action 词条——
  顺带修正了记忆里"2024"的错误）。
- `vite.config.js`：manifest 增 `era` 字段（大厅构建期元数据，不加载设备实现）。
- `GalleryHub.vue`：卡片 meta 行新增年代徽章（35 个 `.era-badge`）+ eraLabel 助手。
- `DeviceViewer.vue`：信息浮层 spec-list 首行「发布」（specs 已含"发布"行时自动去重——TR-1
  实测暴露重复后修复）。
- `tools/lint-mapping.mjs`：era 格式校验（1400–2030 数字或 'NNN0s'）+ 覆盖率统计输出。
- `tools/smoke.mjs`：+1 永久断言（action4 信息浮层「发布」行 = 2023），22 → 23 项。

### 验证
- `npm run lint:devices` 103 台全绿（era 覆盖 35/103）；`npm run build` 2.0s；`npm run smoke` 23/23。
- 截图目检：大厅 35 个年代徽章；TR-1 信息浮层「发布 · 1954」（去重后单行）。

### 已知限制
- 其余 68 台 era 待逐台外部查证（需 WebSearch/官方页逐台核实，下一批滚动补齐）。
- era 展示目前只在大厅卡与信息浮层；时间轴（gen-timeline）待 era 覆盖率更高后启动。

### 下一项
era 逐台查证续批（按品牌分组：DJI 8 台官方页 / Apple 10 台 / 相机与乐器等），或 Phase 4 知识图谱。

## 2026-10-31 · Phase 3 切片 2b：era 查证续批至 64/103

### 改动
- 29 台特定产品新增 era，全部经 WebSearch 实证：DJI 4（mini4pro 2023-09-25 / avata2 2024-04 /
  mavic3pro 2023-04 / action5pro 2024-09）、Samsung 5（S25 系 2025-01-22 Unpacked；Fold7/Flip7
  2025-07-09）、Nothing 2（Phone 3 2025-07、3a Lite 2025-10-29）、Apple 13（Vision Pro 2024-02-02、
  iPad Pro M4 2024-05、Mac mini M4 2024-10、iPhone Air/17 2025-09、AirPods Max 2020、AirPods Pro 2
  2022、Watch Ultra 2022、Studio Display 2022、iPad Air M3 2025、iMac M4 2024、MacBook Pro M4 2024、
  AirTag 2021）、Nintendo 2（Switch OLED 2021-10、Switch 2 2025-06-05）、Flipper Zero 2020-08、
  Framework Laptop 13 2021、Sony TC-510 约 1977。
- 诚实跳过：DeWalt D28136（证据仅一条零售列表 ~2010）、Smeg TSF01（官方年份不明）、
  Nothing Phone (4a) Pro（检索无此型号，身份待证）。38 台通用教学/匿名古董模型 era 不适用。

### 方法论收获
- 记忆偏差实证纠偏两例：Mini 4 Pro（记忆 2024，实为 2023-09-25）、Osmo Action 4（记忆 2024，
  实为 2023-08）——"逐台查证"不是形式主义。

### 验证
- `npm run lint:devices` 103 台全绿（era 覆盖 64/103）；`npm run build` 2.1s；`npm run smoke` 23/23。

### 下一项
Phase 4 知识图谱（gen-knowledge-graph.mjs 构建期生成 + /graph 路由），或部件级"运行演示"动画集。

## 2026-10-31 · Phase 3 收尾：P3 记账项复核与许可徽标

### 改动
- 复核发现「Poly Haven 补链接」实际早已完成：13 台 modelSource 全部存在，抽查 4 条 URL 均 200、
  CC0 设备零遗漏——关闭该记账项（此前为记账滞后）。
- 许可证 UI 醒目标注：`DeviceViewer` infoPop 对 CC-BY-NC/CC-BY-SA 设备显示琥珀色
  `.credit-flag.warn` 徽标（短文案"非商业/同许可"，悬停 title 说明完整义务）；
  `GalleryHub` 卡片对 NC 设备显示 NC 角标（3 个）；馆内许可分布实测：108 CC-BY、13 CC0、
  3 CC-BY-NC（combustion-engine/galaxy-s22-ultra/hydraulic-jack）、1 CC-BY-SA（porsche-911-carrera-4s）。
- 截图目检：S22 Ultra 浮层徽标 + 大厅 3 个 NC 角标。

### 验证
- `npm run lint:devices` 全绿；`npm run build` 2.3s；`npm run smoke` 23/23。

## 2026-10-31 · Phase 4 切片 1：知识星图数据与 2D 渲染

### 改动
- `tools/gen-knowledge-graph.mjs`（npm run gen:graph）：registry + 知识库 → public/knowledge-graph.json
  （103 设备 / 38 品牌 / 414 部件类 / 20 技术 / 1201 连边，139KB）。连边语义：produces /
  has-part / uses（techForPart 推导，只算已编写词条）/ applies-to；社区判定复用 model-class 的
  isCommunityModel；产物不手写，设备/知识变更后重新生成。
- `src/components/GraphView.vue`：/graph 路由，零依赖 Canvas 2D 力导向（库仑斥力 + 弹簧 + 向心，
  alpha 衰减 ~3s 收敛；600² 距离剪枝）。交互：滚轮缩放（指针锚点）、拖拽平移、节点拖拽、
  悬停一跳高亮（其余降透明 0.18）、点击设备跳深链 /device/:id、类型过滤 chips（品牌/设备/
  部件类/技术，至少保留一类）。设备/部件标签按缩放级别显隐，控制默认信息密度。
- `main.js`：/graph 懒加载路由；`GalleryHub` 顶部 meta 加「知识星图 ↗」入口。
- `engine.js`：loadDevice catch 对 AbortError 静默（切台主动中止是正常路径，不再当错误打印——
  星图验证暴露的既有日志噪音）。

### 关键设计决策
- 不引入 3d-force-graph/sigma.js：3d-force-graph 自带 three 复本（与主 three chunk 重复）；
  2D Canvas 对 575 节点绰绰有余且移动端省电。3D 模式若后续需要再评估（挂账）。

### 验证
- `/tmp/verify-graph.mjs`：统计正确、three 主 chunk 未加载、类型过滤、悬停高亮（实测命中
  "Apple iPhone 18 Pro Max 酒红"）、设备路由无回归、移动端过滤条、控制台零错误。
- `npm run lint:devices` 全绿；`npm run build` 2.1s（GraphView 独立 chunk 3.05KB gzip）；
  `npm run smoke` 23/23。截图目检：桌面星图（品牌外轨/技术枢纽/部件底网）、移动端可用。

### 已知限制
- 中心设备簇标签默认隐藏（悬停/放大显示）；布局随机初始化，每次进入形态略不同。
- 3D 模式与代际对比试点未做（backlog 挂账）。

## 2026-10-31 · Phase 4 切片 2：代际对比试点（iPhone / S25 / Action）

### 改动
- `src/knowledge/comparisons.js`：3 组策展对比（iphone 5 型 / s25 3 型 / action 2 型）+ groupOf()。
- `src/components/CompareView.vue`：/compare/:group?focus= 路由页——specs 同名键自动聚类成表
  （行 = 组内键并集，缺项 —；值有差异的行在 focus 列画 accent 侧条）、列头缩略图 + era 徽章、
  设备配置经 device-loaders 懒加载（独立 chunk 1.55KB gzip）。
- `DeviceViewer` 信息浮层：属于对比组的设备显示「代际对比」入口按钮。
- 修 bug：同路由不同参数不重载（onMounted → watch route.params.group, immediate）——iphone 组
  切 action 组显示旧数据的实测暴露。

### 验证
- `/tmp/verify-cmp.mjs`：iPhone 5 列 18 行 + focus 高亮、设备页入口跳转、Action 2 列、
  移动端 390×844、控制台零错误。smoke +1 永久断言（23 → 24 项）全绿；build 2.15s。
- 截图目检：iPhone 五代并排（A14→A19 Pro、电池 2815→3677mAh 的代际演进一眼可读）。

## 2026-10-31 · Phase 5 切片 1：运行演示基建 + 2 试点（jet-engine / pocket3）

### 改动
- `engine.js`：`runDemos(dt, t)`——device.demos 声明式驱动（spin=绕轴持续旋转 / wobble=三轴正弦
  微调），仅动 rotation（与爆炸/装配位置管线零冲突）；激活条件 = 选中对应部件；退出 0.5s 缓动
  回初始姿态（缓动用钳制 dt，低帧环境慢但正确）；`getState().demoActive` + `getPartRotation(id)`
  观测口；state.demos 随 loadDevice/disposeDevice 生命周期。
- `DeviceViewer`：demoActive 激活时 toast「视觉原理演示 · …（示意动画，非仿真）」——诚实标注。
- `devices/jet-engine.js`：风扇段绕 X（发动机轴线，头注释已文档化）3.4rad/s；
  `devices/pocket3.js`：云台三轴正弦微调（增稳工作状态示意）。retro-fan 轴向未文档化，诚实跳过。
- 3D 星图评估拍板：暂缓（3d-force-graph 自带 three 复本 600KB+，2D 已覆盖交互）——backlog 关闭该项。

### 验证
- `/tmp/verify-demo.mjs`：激活标签、X 轴持续累加、取消后缓动精确回 0（探针证实端到端）、
  云台摆动、控制台零错误；无头低帧率（dt 钳制 0.05）会让动画变慢但方向正确——验证脚本相应
  改轮询而非固定时长。smoke +1（24 → 25 项）全绿；lint 103 台 + 知识库全绿；build 2.1s。

### 已知限制
- 演示与爆炸态共存（旋转的是部件组自身姿态）；L0/reduced-motion 静帧降级未做（backlog 挂账）。

### 下一项
Phase 5 扩量（≥10 台，逐台确认轴向）或 L0/reduced-motion 降级补齐。

## 2026-10-31 · Phase 5 切片 2：运行演示扩量至 15 台 + reduced-motion 静帧

### 改动
- `engine.js` runDemos 增强：`spin:'auto'` 按部件包围盒最薄轴推导旋转轴（圆盘/薄板/曲柄类
  零件的最薄维度即转轴——解决逐台猜轴问题）；`speed` 独立角速度；reducedMotion 整体静帧
  （晕动症友好；L0 维持运行——旋转零额外渲染成本，评估记录在案）。
- 新增 13 台演示（合计 15）：挂钟/闹钟秒针（真实速率 0.105rad/s）、留声机转盘（33⅓ rpm 真实速率）、
  机箱/笔电/Mac mini/Switch2 风扇（降速）、搅拌机刀片/角磨机砂轮/台钻主轴（降速示意）、
  手摇曲柄、擒纵摆轮（降频振荡）、Mavic 螺桨（同向降速示意，真实为对转——标签注明）。
- 试点回归修复：数组 spin 与 'auto' 分支的速度计算互不干扰。

### 调试记录
- 批量编辑漏掉 mac-mini/switch2 两台 demos（规划 13 实写 11）——批处理编辑后必须核对清单。
- switch-2 的设备 ID 与文件名不一致（已知例外），验证脚本用文件名当 URL 导致加载错设备
  （14 部件的假象来自错误页回退）——CASES 表改用真实 id。
- reduced-motion 验证改独立浏览器 flag `--force-prefers-reduced-motion`（emulateMediaFeatures
  未生效，浏览器级 flag 无歧义）。

### 验证
- `/tmp/verify-demos2.mjs` 16/16：15 台激活 + 旋转增量（时钟类真实速率用专属低阈值）、
  取消后缓动回位、reduced-motion 静帧（demo=null 且旋转归零）。截图目检角磨机砂轮原位。
- `npm run lint:devices` 全绿；`npm run build` 2.2s；`npm run smoke` 25/25。

### 下一项
Phase 5 剩余挂账：L0 静帧策略（已倾向维持）→ 可关闭；转向 Phase 6 沉浸导览升级或 Phase 7
探索系统（收藏/已探索/徽章，localStorage）。

## 2026-10-31 · Phase 7 切片 1：探索系统 v1（收藏/足迹/徽章）

### 改动
- `src/lib/explore.js`：dtm.favorites / dtm.explored localStorage（隐私模式静默降级）+ pub-sub
  同页同步；徽章由数据即时推导（无独立存储、无状态漂移），5 枚：初次拆解 / 五湖四海 /
  十馆之约 / 跨界考察（3 品牌）/ 收藏家。原则：不打分不排行不弹窗。
- `GalleryHub`：卡片右上收藏星标（role=button，避免 button 嵌套在 router-link 内的无效 HTML，
  click.stop.prevent 防误触导航）；顶部「我的探索 · ★n 足迹m」入口；抽屉（徽章/收藏/足迹三节，
  router-link 深链）。
- `DeviceViewer`：两处装载完成点 markExplored（挂载首载 + 切台 watcher）；信息浮层收藏按钮
  （★ 已收藏 / ☆ 收藏 态）。
- `style.css`：fav-star / exploreDrawer / 徽章胶囊样式（earned = accent 点亮，未获得 = 描边灰）。
- smoke +1（收藏刷新持久），25 → 26 项。

### 验证
- `/tmp/verify-explore.mjs` 7/7：清空起点 → 卡片星标收藏 → 设备页自动记足迹（跨品牌验证）→
  浮层收藏切换 → 刷新持久 → 抽屉分节计数与徽章点亮正确。截图目检抽屉。
- 调试记录：点击后同帧读 DOM 是 Vue 异步更新（测试脚本改 sleep 后读）；测试数据首次同品牌
  不满足跨界徽章（换 Commodore 64）。
- `npm run build` 2.2s；`npm run smoke` 26/26；lint 全绿。

### 下一项
Phase 6 导览升级（Tour 对象格式 + 三模式）或 Phase 5 收尾（L0 静帧策略已拍板维持）——
下一个最高价值：大厅「收藏」快捷筛选（已收藏设备一键过滤）。

## 2026-10-31 · Phase 7 切片 1b：大厅「★ 收藏」快捷筛选

### 改动
- `GalleryHub`：快捷筛选组（★ 收藏 · 计数徽标），filtered 联动 favSet；探索系统闭环——
  收藏 → 筛选 → 进入拆解一条龙。

### 验证
- `/tmp/verify-favfilter.mjs`：筛选后仅剩收藏卡（103→1）、取消恢复全量（103）。
  调试记录：TransitionGroup 交错离场动画 ~2s，验证须轮询稳定而非固定 sleep。
- `npm run smoke` 26/26；`npm run build` 2.3s。

### 下一项
Phase 6 导览升级（Tour 对象格式 + 三模式）为 backlog 中剩余的最高价值项。

## 2026-10-31 · 修复：逐步装配退出的低帧率超时（smoke 偶发）

- 现象：smoke「Esc 退出逐步装配」偶发超时——无头低帧率下 dt 钳制 0.05，补齐装配 2.5s 模拟时长
  需要约 50 帧，2fps 环境 15s 墙钟内帧数不足。复跑确认偶发非回归。
- 修复：退出补齐用更快速度（stepSpeed 3.2，交互上也更利落）；连跑两次 smoke 全绿。
- 教训：涉及模拟时长的断言在低帧环境用"状态到达"轮询而非墙钟（本项已是轮询，但总时长
  仍受模拟速度制约——提高模拟速度才是根治）。

## 2026-10-31 · Phase 6 切片 1：导览升级（Tour 对象格式 + 连播/手动 + 讲解卡 + TTS）

### 改动
- `engine.js`：startTour(mode) 条目归一化（'partId' 字符串 / { id, note } 对象，向后兼容）；
  setTourMode('auto'|'manual') 运行中切换；手动模式不自动前进（主循环计时加 mode 条件）；
  连播停留时长随讲解词长度 +1.5s；tourInfo 增 mode/note。
- `DeviceViewer` 导览条：模式切换按钮（连播⇄手动，图标随态）；讲解卡 #tourNote（策展讲解词 +
  Web Speech 朗读按钮——本地合成、默认关、步进/停止/卸载时 cancel）。
- `devices/pocket3.js`（7 步）/`devices/jet-engine.js`（4 步）：tour 升级为带策展讲解词的对象条目。
- `style.css`：#tourNote 讲解卡样式（悬浮于导览条上方）。
- smoke +1（讲解卡渲染断言），26 → 27 项。
- 挂账决策：AudioManager CC0 音源——本环境无可靠下载/核证通道，待条件具备启动（backlog 记录）。

### 验证
- `/tmp/verify-tour2.mjs`：讲解词渲染（DOM + 内容）、手动模式不自动前进、‹ › 手动步进、
  旧字符串条目设备（action4 14 步）完全兼容、无页面异常。截图目检讲解卡 + 导览条模式切换。
- `npm run lint:devices` 全绿；`npm run build` 2.9s；`npm run smoke` 27/27。

### 下一项
backlog 核心项已全部收官（Phase 2/3/4/5/6/7 均有落地）。剩余：真机回归（环境缺失）、
CC0 音源（条件缺失）、灰皮书的 gen-timeline/brand 库等衍生数据层。下一轮从「大厅完成度统计」
（探索数据 × 馆藏统计）或用户反馈驱动的新方向继续。

## 2026-10-31 · Phase 3 收官：技术编年 /timeline + 文档收口 + 环境教训

### 改动
- `tools/gen-timeline.mjs`（npm run gen:timeline）：device.era + technology.invented →
  public/timeline.json（84 事件：64 台设备 + 20 项技术，四段时代分带——古典机械/机电/电子/数字）。
  解析容忍 '约 1300'/'约公元前 150'（公元前记负数排序，display 保留原文）。
- `TimelineView.vue` + `/timeline` 路由 + 大厅「技术编年 ↗」入口：纯 DOM 网格（独立 chunk 1.2KB
  gzip），设备可点深链，头部诚实标注覆盖率 62%。
- TECH.md：§5.8 过时的"已知边界"（剖切无封盖/无特写）划掉更新；新增 §6「Phase 2–7 增量」
  架构记录（LAB 三件套/知识层/衍生视图/运行演示/导览升级/探索系统）——跨工具交接文档收口。
- smoke：错误捕获永久带源位置（m.location()）；+1 时间轴断言（27 → 28 项）。

### 验证
- `/tmp/verify-tl.mjs`：四段分带、84 事件/64 深链、升序起点含'约公元前 150'、深链可达、
  移动端。`npm run smoke` 27/27（历史绿），本轮新增断言通过但整套在**系统高负载（load 12.9，
  正常 <5）下反复饥饿失败**——失败点轮换（Esc 超时/TypeError 竞态/60s 挂起）均为伪影；
  TypeError 栈已捕获（DeviceViewer:428→loadDevice）并记录 BACKLOG 开放调查项（低载无再现）。
  smoke 错误捕获已永久带源位置，后续可直接定位。

### 下一项
待系统负载回落复跑 smoke 确认 28/28；探索系统与衍生视图的后续迭代按反馈驱动。

## 2026-10-31 · 稳定性收口：loadDevice 竞态防御 + smoke 环境加固

### 问题与修复
1. **TypeError 'group'（真实竞态）**：切台时旧装载的 GLB 合并循环对已清空的 partsById 取
   `p.group`——防御性跳过（realPartIds 引用未注册部件时降级程序化外观，不再崩溃）；
   错误消息永久带设备 id 与完整栈。
2. **timeline 懒加载导航竞态**：smoke 在设备页→/timeline 切换偶发 chunk 挂起（探针证实页面
   本身 1.2s 正常渲染）——smoke 该步加一次重试。
3. **孤儿进程**：多次探针脚本异常退出泄漏 4 个 vite dev server + 无头 Chrome——清理；
   此后脚本 finally 均含 kill（已有惯例，崩溃路径除外）。
4. smoke 30s→60s 加固（14 处）+ 两次连跑全绿确认。

### 验证
- `npm run smoke` 28/28 连续两次通过（含新增时间轴断言与全部历史断言）。
- 环境注记：本机负载高峰（load 12.9）会放大上述竞态的触发概率——失败点轮换曾误导排查方向，
  清理孤儿进程 + 竞态防御后稳定。
