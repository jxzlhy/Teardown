/* 虚假取景预览场景：黄昏海岸（程序化，供各设备屏幕贴图共用） */
export function paintPreviewScene(g, W, H, HOR = Math.round(H * 0.653)){
  const sky = g.createLinearGradient(0, 0, 0, HOR);
  sky.addColorStop(0, '#0d2144'); sky.addColorStop(0.55, '#2f5a8f'); sky.addColorStop(0.85, '#c98a4e'); sky.addColorStop(1, '#f2c078');
  g.fillStyle = sky; g.fillRect(0, 0, W, HOR);

  const sunX = W * 0.71, sunY = HOR * 0.72;
  const glow = g.createRadialGradient(sunX, sunY, 6, sunX, sunY, W * 0.17);
  glow.addColorStop(0, 'rgba(255,232,185,.95)'); glow.addColorStop(0.3, 'rgba(255,190,110,.45)'); glow.addColorStop(1, 'rgba(255,170,90,0)');
  g.fillStyle = glow; g.fillRect(sunX - W * 0.17, sunY - W * 0.17, W * 0.34, W * 0.34);
  g.fillStyle = '#ffe9c4'; g.beginPath(); g.arc(sunX, sunY, W * 0.034, 0, Math.PI * 2); g.fill();

  g.fillStyle = 'rgba(240,222,200,.2)';
  [[0.12,0.19,0.20,0.026],[0.32,0.13,0.25,0.022],[0.68,0.26,0.22,0.02],[0.87,0.17,0.15,0.018],[0.50,0.33,0.28,0.024]]
    .forEach(([fx, fy, fw, fh]) => { g.beginPath(); g.ellipse(W*fx, H*fy, W*fw, H*fh, 0, 0, Math.PI*2); g.fill(); });

  const ridge = (pts, color) => { g.fillStyle = color; g.beginPath(); g.moveTo(0, HOR+1);
    pts.forEach(([fx, fy]) => g.lineTo(W*fx, H*fy)); g.lineTo(W, HOR+1); g.closePath(); g.fill(); };
  ridge([[0,0.53],[0.14,0.437],[0.27,0.525],[0.43,0.388],[0.56,0.494],[0.73,0.42],[0.86,0.507],[1,0.45]], '#4a688c');
  ridge([[0,0.578],[0.117,0.512],[0.26,0.591],[0.39,0.49],[0.547,0.578],[0.677,0.525],[0.833,0.596],[1,0.538]], '#31496b');

  const sea = g.createLinearGradient(0, HOR, 0, H);
  sea.addColorStop(0, '#28425f'); sea.addColorStop(0.4, '#16304a'); sea.addColorStop(1, '#0a1626');
  g.fillStyle = sea; g.fillRect(0, HOR, W, H - HOR);

  for(let i = 0; i < 26; i++){
    const y = HOR + 5 + i * 6, w = Math.max(W * 0.117 - i * 2.6, 8), a = Math.max(0.30 - i * 0.010, 0.03);
    g.fillStyle = 'rgba(242,192,120,' + a.toFixed(3) + ')';
    g.fillRect(sunX - w/2 + (i % 2 ? 9 : -6), y, w, 2.4);
  }

  g.fillStyle = '#0a121e';
  g.beginPath(); g.moveTo(0, H); g.lineTo(0, H*0.865); g.lineTo(W*0.156, H*0.891); g.lineTo(W*0.306, H*0.944); g.lineTo(W*0.475, H); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(W*0.723, H); g.lineTo(W*0.84, H*0.914); g.lineTo(W, H*0.953); g.lineTo(W, H); g.closePath(); g.fill();

  g.strokeStyle = 'rgba(22,32,48,.85)'; g.lineWidth = 2.2;
  [[0.276,0.331],[0.328,0.305],[0.393,0.349]].forEach(([fx, fy]) => {
    g.beginPath(); g.arc(W*fx - 7, H*fy, 8, Math.PI*1.15, Math.PI*1.85);
    g.arc(W*fx + 7, H*fy, 8, Math.PI*1.15, Math.PI*1.85); g.stroke();
  });

  const vig = g.createRadialGradient(W/2, H/2, H*0.45, W/2, H/2, W*0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(4,8,14,.5)');
  g.fillStyle = vig; g.fillRect(0, 0, W, H);
}
