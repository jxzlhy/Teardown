import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
const c = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const browser = await puppeteer.launch({ executablePath: c.find(existsSync), headless: 'new', args: ['--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,150)));
page.on('console', m => { if(m.type()==='error') console.log('CONSOLE:', m.text().slice(0,150)); });
await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://127.0.0.1:8137/#/device/iphone-12-teardown', { waitUntil: 'networkidle2', timeout: 60000 });
for(let i = 0; i < 30; i++){
  await new Promise(r => setTimeout(r, 1000));
  const st = await page.evaluate(() => {
    const e = window.__ENGINE;
    return e ? { booted: e.getState().booted, status: e.getState().modelStatus, parts: e.getState().partsCount } : null;
  });
  if(st && st.booted){ console.log('booted:', JSON.stringify(st)); break; }
  if(i === 29) console.log('NOT BOOTED', JSON.stringify(st));
}
await browser.close();
