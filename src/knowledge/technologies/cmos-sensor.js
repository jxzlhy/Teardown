/* CMOS 图像传感器 —— 部件详情卡「原理」区词条 */
export default {
  id: 'cmos-sensor',
  zh: 'CMOS 图像传感器',
  /* 每个像素自带放大器的"有源像素"结构：光电二极管把光转为电荷，行/列寻址逐行读出。
     与 CCD 的全局电荷转移不同，CMOS 可随机寻址、功耗低、能集成列级 ADC，是手机与运动相机的主流。
     背照式（BSI）把布线层移到光电二极管后方提升进光量；堆栈式再把逻辑层叠到感光层之下。 */
  principle:
    '每个像素自带一个放大器（"有源像素"）：光电二极管把光子转为电荷，行/列寻址逐行读出信号。' +
    '与 CCD 需要把电荷整体转移出来不同，CMOS 可以随机寻址、功耗低、还能把模数转换器集成进芯片，' +
    '因此成为手机与运动相机的主流。背照式（BSI）把布线层移到光电二极管后方以提升进光量，' +
    '堆栈式进一步把逻辑电路叠在感光层之下，换取更高读出速度。',
  relatedParts: ['sensor'],
  relatedDevices: ['action4', 'pocket3', 'iphone-12-teardown'],
  invented: '1993',
  history: [
    ['1967', 'Peter Noble 提出有源像素概念（MOS 光电二极管 + 放大器）'],
    ['1985', 'Olympus 的 Tsutomu Nakamura 团队造出首枚 MOS 有源像素传感器'],
    ['1993', '三菱电机与 NASA JPL 实现实用化 CMOS APS，手机影像的起点'],
    ['2009', '背照式（BSI）量产，弱光画质跃升'],
    ['2012', '堆栈式（stacked）结构商品化，读出速度与功能集成再上台阶'],
  ],
  sources: [
    { label: 'Wikipedia — Active pixel sensor', url: 'https://en.wikipedia.org/wiki/Active_pixel_sensor' },
  ],
  confidence: 'verified-3rd',
};
