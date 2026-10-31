import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { installDomShim } from './tools/lib-node-shim.mjs';

/* 轻量设备清单（virtual:device-manifest）：
   大厅卡片只需要元数据（名称/品牌/分类/部件数/glb 路径），不应为此
   拉下 three.js + 全部设备实现。这里在 dev/build 时于 Node 侧提取元数据；
   同时生成 virtual:device-loaders，让设备页只动态加载当前这一台配置，
   避免 82 份配置（及其模块级 canvas）在进入任意设备时全量求值。 */
const MANIFEST_ID = 'virtual:device-manifest';
const LOADERS_ID = 'virtual:device-loaders';
function deviceManifest(){
  let cached = null, cachedMtime = 0;
  const srcDir = path.resolve('src/devices');
  function maxMtime(){
    let mtime = 0;
    for(const f of fs.readdirSync(srcDir)){
      if(!f.endsWith('.js')) continue;
      const st = fs.statSync(path.join(srcDir, f));
      if(st.mtimeMs > mtime) mtime = st.mtimeMs;
    }
    return mtime;
  }
  async function build(mtime){
    installDomShim();
    /* 顺序以 registry.js 为准（大厅分组依赖它），文件名按 id 反查，
       因此 switch2 这类文件名与 id 不一致的设备也能正确映射。 */
    const regUrl = pathToFileURL(path.join(srcDir, 'registry.js')).href;
    const registry = await import(regUrl + '?v=' + mtime);
    const fileById = {};
    for(const f of fs.readdirSync(srcDir)){
      if(!f.endsWith('.js') || f === 'registry.js') continue;
      const mod = await import(pathToFileURL(path.join(srcDir, f)).href + '?v=' + mtime);
      if(mod.default && mod.default.id) fileById[mod.default.id] = f;
    }
    const manifest = registry.devices.map(d => ({
      id: d.id, name: d.name, en: d.en, brand: d.brand || 'OTHER',
      category: d.category, tagline: d.tagline, accent: d.accent,
      era: d.era ?? null,
      glb: d.glb || null, modelCredit: d.modelCredit || null,
      parts: d.parts.length,
    }));
    const loaders = registry.devices
      .filter(d => fileById[d.id])
      .map(d => `  ${JSON.stringify(d.id)}: () => import(${JSON.stringify('/src/devices/' + fileById[d.id])}),`)
      .join('\n');
    return { manifest, loaders };
  }
  async function ensure(){
    const mtime = maxMtime();
    if(!cached || mtime > cachedMtime){
      cached = await build(mtime);
      cachedMtime = mtime;
    }
    return cached;
  }
  return {
    name: 'device-manifest',
    resolveId(id){ return (id === MANIFEST_ID || id === LOADERS_ID) ? '\0' + id : null; },
    async load(id){
      if(id === '\0' + MANIFEST_ID){
        const { manifest } = await ensure();
        return 'export default ' + JSON.stringify(manifest);
      }
      if(id === '\0' + LOADERS_ID){
        const { loaders } = await ensure();
        return 'export const loaders = {\n' + loaders + '\n};';
      }
      return null;
    },
    handleHotUpdate({ file, server }){
      if(!file.startsWith(srcDir) || !file.endsWith('.js')) return;
      for(const id of [MANIFEST_ID, LOADERS_ID]){
        const mod = server.moduleGraph.getModuleById('\0' + id);
        if(mod) server.moduleGraph.invalidateModule(mod);
      }
    },
  };
}

/* 构建时把 Draco 解码器拷进产物目录（dev 模式直服 node_modules 即可） */
const copyDraco = () => {
  let outDir = 'dist';
  return {
    name: 'copy-draco-decoder',
    apply: 'build',
    configResolved(cfg){ outDir = cfg.build.outDir; },
    closeBundle(){
      const src = path.resolve('node_modules/three/examples/jsm/libs/draco');
      const dst = path.resolve(outDir, 'assets/draco');
      fs.mkdirSync(dst, { recursive: true });
      for(const f of ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js']){
        fs.copyFileSync(path.join(src, f), path.join(dst, f));
      }
      console.log('✓ draco decoder → ' + path.relative(process.cwd(), dst) + '/');
    }
  };
};

/* 构建产物卫生：public/ 里的编辑器/审查工具缓存与系统元数据会被原样拷贝，
   这里在打包后统一剔除，避免 dist 里混入 .mimosa / .DS_Store */
const cleanDistJunk = () => {
  let outDir = 'dist';
  return {
    name: 'clean-dist-junk',
    apply: 'build',
    configResolved(cfg){ outDir = cfg.build.outDir; },
    closeBundle(){
      const walk = dir => {
        for(const f of fs.readdirSync(dir)){
          const p = path.join(dir, f);
          const st = fs.lstatSync(p);
          if(st.isDirectory()){
            if(f === '.mimosa'){ fs.rmSync(p, { recursive: true, force: true }); continue; }
            walk(p);
          }else if(f === '.DS_Store'){
            fs.unlinkSync(p);
          }
        }
      };
      const dist = path.resolve(outDir);
      if(fs.existsSync(dist)) walk(dist);
    },
  };
};

export default defineConfig({
  plugins: [vue(), copyDraco(), cleanDistJunk(), deviceManifest()],
  build: {
    rollupOptions: {
      output: {
        /* three 版本稳定、体积大：单独成 chunk，发版后仍可命中旧缓存 */
        manualChunks(id){
          if(id.includes('/node_modules/three/')) return 'three';
        },
      },
    },
  },
  server: {
    port: 8200,
    host: '127.0.0.1'
  }
});
