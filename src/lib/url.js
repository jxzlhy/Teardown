/* 静态资源路径：配置里统一写 /assets/...，部署到子路径时按 Vite base 前缀补全 */
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

export function assetUrl(p){
  if(!p) return p;
  if(/^(?:[a-z]+:)?\/\//i.test(p) || p.startsWith('data:') || p.startsWith('blob:')) return p;
  return BASE + '/' + p.replace(/^\/+/, '');
}
