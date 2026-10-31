/* 内燃机缸体曲柄连杆 —— 部件详情卡「原理」区词条 */
export default {
  id: 'internal-combustion',
  zh: '内燃机四冲程循环',
  principle:
    '进气→压缩→做功→排气四个冲程周而复始：活塞下行吸入油气混合气，上行压缩，' +
    '火花塞点燃后燃气爆发把活塞推下（唯一做功冲程），再上行排出废气。' +
    '活塞的往复直线运动经连杆推动曲轴旋转输出——多缸按相位错开，让曲轴始终有力可传。',
  relatedParts: ['pistons', 'crank', 'head-l', 'head-r', 'intake', 'exhaust-l', 'exhaust-r', 'crankcase', 'cylinders', 'valvetrain'],
  relatedDevices: ['v8-engine', 'triple-engine'],
  invented: '1876',
  history: [
    ['1860', 'Lenoir 推出首台商用内燃机（非压缩式）'],
    ['1876', 'Otto 完成四冲程循环，热效率跃升'],
    ['1886', 'Benz/Daimler 把内燃机装上汽车'],
    ['1930s', 'V 型多缸布局成为性能与紧凑的平衡解'],
  ],
  sources: [
    { label: 'Wikipedia — Internal combustion engine', url: 'https://en.wikipedia.org/wiki/Internal_combustion_engine' },
  ],
  confidence: 'verified-3rd',
};
