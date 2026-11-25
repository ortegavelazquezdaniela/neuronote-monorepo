/**
 * Genera el Manual técnico en PDF desde docs/manual-tecnico/manual-tecnico.html
 * con Chrome sin ventana (tamaño carta, sin encabezados del navegador).
 *   npm run manual        (desde frontend/)
 * CHROME_PATH permite indicar otra ruta de Chrome o Edge.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
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

const html = pathToFileURL(fileURLToPath(new URL('../../docs/manual-tecnico/manual-tecnico.html', import.meta.url))).href;
const out = fileURLToPath(new URL('../../docs/manual-tecnico/NEURONOTE-manual-tecnico.pdf', import.meta.url));
execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--virtual-time-budget=4000',
  `--print-to-pdf=${out}`,
  html,
]);
const kb = Math.round(statSync(out).size / 1024);
console.log(`Manual técnico escrito en ${out} (${kb} KB)`);
if (kb > 2048) throw new Error('El PDF pasa de 2 MB.');
