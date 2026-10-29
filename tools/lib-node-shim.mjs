/* =============================================================
   Node 端 DOM shim：让 src/devices/*.js 可以在 Node 里直接 import。
   设备配置顶层会调用 makeTex()（document.createElement('canvas') +
   2D context 绘制贴图），这里给一个「万能桩」：任何属性读取/方法调用
   都返回自身，赋值静默成功。仅用于 import 求值期，不参与真实绘制。
============================================================= */
const anyStub = new Proxy(function(){}, {
  get(_t, k){
    if(k === 'width' || k === 'height') return 0;
    if(k === 'then') return undefined;          // 防止被误当 thenable
    return anyStub;
  },
  apply(){ return anyStub; },
  construct(){ return anyStub; },
  set(){ return true; },
  has(){ return true; },
});

export function installDomShim(){
  if(!globalThis.document){
    globalThis.document = { createElement: () => anyStub, createElementNS: () => anyStub };
    globalThis.window = globalThis;
    globalThis.devicePixelRatio = 1;
  }
}
