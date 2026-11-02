/* 资产再分发风险分级（审计 P1-8）——lint 与 release 构建共用的唯一判定源。
   判定只看配置里的事实字段，不用"自述文本里有没有提到社区"这种循环逻辑。 */

/** 许可证风险：CC-BY-NC（禁商用）、Sketchfab Free Standard（禁独立再分发）、GPL 系（传染性） */
export const RISKY_LICENSES = [/CC-BY-NC/i, /Free Standard/i, /GPL/i];

export function licenseRisk(device){
  const credit = device.modelCredit || '';
  return RISKY_LICENSES.find(re => re.test(credit))?.source || null;
}

/** 官方 AR/CDN 转制：项目自述"仅本机研究/演示"，不得随公开发布包再分发 */
export function localDemoOnly(device){
  return device.distribution === 'local-demo-only';
}

/** 公开发布构建必须排除的展品（保留可发布资产：CC-BY / CC0 / NASA 公有领域 / 程序化） */
export function blockedForRelease(device){
  if (device.unlisted) return 'unlisted';
  if (localDemoOnly(device)) return 'local-demo-only';
  const risk = licenseRisk(device);
  if (risk) return 'risky-license';
  if (device.glb && !device.modelCredit) return 'no-provenance';
  return null;
}

/** 供构建日志与 dist/RELEASE-EXCLUDED.json 使用的人读说明 */
export function blockReasonText(reason, device){
  if (reason === 'unlisted') return '筹备中展品（未入馆）';
  if (reason === 'local-demo-only') return '官方 AR/CDN 转制，标注仅本机演示不再分发';
  if (reason === 'risky-license') return `许可证限制再分发：${device.modelCredit}`;
  if (reason === 'no-provenance') return '有 GLB 但无来源署名';
  return reason;
}
