#!/usr/bin/env node
/* V5.1 P11 · 自动化测试批收口（任务书 §14）：一键回归索引——串行执行全部专项工具
   （并发互杀教训：本机重套件一律串行），汇总 §14 条目覆盖矩阵。
   用法：node tools/v51-regression-all.mjs [--fast]（--fast 跳过 smoke/hud 两大件）
   单工具失败不阻断后续；终局打印覆盖矩阵与失败清单。 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FAST = process.argv.includes('--fast');
let port = 8300;
const nextPort = () => ++port;

/* [工具, §14 条目] —— 条目为该工具覆盖的任务书 §14 测试项 */
const SUITE = [
  ['tools/smoke.mjs', '14.1 拆解/归位/逐步/模式/测量 + 14.3 相机/巡览 + 14.2 读数 + 移动端 smoke 段', { env: { SMOKE_PORT: undefined }, args: [] }],
  ['tools/hud-verify.mjs', '14.2 标注不压面板/读数 + 14.3 相机机位 + 日厅 + 移动端 sheet', { args: ['--no-shots'] }],
  ['tools/v51-p1s3-stage-verify.mjs', '14.2 坐标空间（网格/刻度盘/铅垂线）+ 14.3 慢旋 + 14.5 双厅', { args: ['--device=mini4pro'] }],
  ['tools/v51-p3s3-pop-verify.mjs', '14.1 单件拆解弹出/归位/轮换/全局归位清空/状态同步', { args: [] }],
  ['tools/v51-p5-mobile-verify.mjs', '14.4 移动端全套（dock 横滑/sheet/触屏拆解/浮层基线/三视口溢出）', { args: [] }],
  ['tools/v51-p6-category-verify.mjs', '14.5 设备覆盖（齿轮箱×2/汽车×2 + 薄盘构成 + 双厅）', { args: [] }],
  ['tools/v51-p8-presn-verify.mjs', '14.5 能力检测/presn 覆盖 + 展台三型', { args: [] }],
  ['tools/v51-p9-leak-verify.mjs', '12/14.5 资源释放（A→B→A 计数回基线）', { args: [] }],
  ['tools/coordaid-verify.mjs', '14.2 网格开关/gizmo 渲染', { args: [] }],
  ['tools/pedestal-verify.mjs', '14.5 展台可见性/日厅材质/缩放差异', { args: [] }],
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTool(rel, entry, cfg){
  const port = nextPort();
  const env = { ...process.env, HUD_PORT: String(port), ...(cfg.env || {}) };
  if(cfg.env?.SMOKE_PORT === undefined && rel.endsWith('smoke.mjs')) env.SMOKE_PORT = String(port);
  const args = ['--port=' + port, ...(cfg.args || [])].filter(a => !(rel.endsWith('smoke.mjs') && a.startsWith('--port')));
  console.log(`\n========== ${rel}（端口 ${port}）==========`);
  const t0 = Date.now();
  const res = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, rel), ...args], { env, cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    child.stdout.on('data', d => { const t = d.toString(); buf += t; process.stdout.write(t); });
    child.stderr.on('data', d => { const t = d.toString(); buf += t; process.stderr.write(t); });
    const killer = setTimeout(() => { console.log('[TIMEOUT 12min] 强制结束'); child.kill('SIGKILL'); }, 12 * 60 * 1000);
    child.on('exit', code => { clearTimeout(killer); resolve({ code, buf }); });
  });
  const secs = Math.round((Date.now() - t0) / 1000);
  const ok = res.code === 0 && !/FAIL \d|冒烟执行失败|TIMEOUT/.test(res.buf.slice(-2000));
  console.log(`---------- ${ok ? '✓ PASS' : '✗ FAIL'}（${secs}s）`);
  return { rel, entry, ok, secs };
}

const results = [];
for(const [rel, entry, cfg] of SUITE){
  if(FAST && (rel.endsWith('smoke.mjs') || rel.endsWith('hud-verify.mjs'))){ console.log(`[fast 跳过] ${rel}`); results.push({ rel, entry, ok: null, secs: 0 }); continue; }
  results.push(await runTool(rel, entry, cfg));
}

console.log('\n================ V5.1 回归矩阵 ================');
for(const r of results){
  console.log(`${r.ok === null ? '⏭ 跳过' : r.ok ? '✓ PASS' : '✗ FAIL'}  ${r.rel}  ${r.entry}`);
}
const fail = results.filter(r => r.ok === false);
const run = results.filter(r => r.ok !== null);
console.log(`\n执行 ${run.length} / 跳过 ${results.length - run.length} / 失败 ${fail.length}`);
console.log(fail.length ? 'FAIL: ' + fail.map(f => f.rel).join(', ') : 'ALL GREEN');
process.exit(fail.length ? 1 : 0);
