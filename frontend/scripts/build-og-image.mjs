/**
 * Genera public/og-image.png (1200 × 630) desde scripts/og-image.html con Chrome sin ventana.
 *   npm run og-image
 * CHROME_PATH permite indicar otra ruta de Chrome o Edge.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) throw new Error('No encontré Chrome: define CHROME_PATH.');

const html = pathToFileURL(fileURLToPath(new URL('./og-image.html', import.meta.url))).href;
const out = fileURLToPath(new URL('../public/og-image.png', import.meta.url));
execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  '--virtual-time-budget=3000',
  `--screenshot=${out}`,
  html,
]);
console.log(`Imagen Open Graph escrita en ${out}`);
