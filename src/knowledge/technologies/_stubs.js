/* =============================================================
   技术词条占位登记（_stubs.js）
   只登记 zh 名称与 relatedParts 关联，principle 一律留空：
   UI 显示「原理编写中」，不臆造内容；lint 允许无 sources。
   每编写完成一项，移出本文件建立独立 <id>.js 并补 sources。
============================================================= */
export default [
  { id: 'pcb-soc', zh: '印制电路板与 SoC', relatedParts: ['board', 'mainboard', 'usb-pcb', 'board-cover', 'antenna'] },
  { id: 'usb-c', zh: 'USB-C 接口', relatedParts: ['usb', 'port', 'usb-pcb'] },
  { id: 'cooling-module', zh: '散热模块（VC 均热板/风扇）', relatedParts: ['fan', 'heatsink', 'thermal', 'cooling'] },
  { id: 'mainspring-drive', zh: '发条与上弦机构', relatedParts: ['mainspring', 'crank'] },
  { id: 'wheel-train', zh: '齿轮传动系', relatedParts: ['wheel-train', 'turntable', 'belt-drive', 'gears'] },
  { id: 'turbine-engine', zh: '燃气涡轮发动机', relatedParts: ['core', 'fan-section', 'nozzle', 'afterburner'] },
  { id: 'vacuum-tube', zh: '真空电子管', relatedParts: ['tubes'] },
  { id: 'typebar-linkage', zh: '打字机字杆联动', relatedParts: ['typebars', 'platen', 'ribbon-mech', 'keys'] },
  { id: 'acoustic-horn', zh: '留声机号筒拾放声', relatedParts: ['horn'] },
  { id: 'internal-combustion', zh: '内燃机缸体曲柄连杆', relatedParts: ['pistons', 'crank', 'head-l', 'head-r', 'intake', 'exhaust-l', 'exhaust-r', 'crankcase', 'cylinders', 'valvetrain'] },
];
