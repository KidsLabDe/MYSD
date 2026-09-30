import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync, existsSync } from 'node:fs';

// Zwei Versionen aus demselben Code:
//   npm run build        → dist/ für den Laptop, Plan aus event.js
//   npm run build:mysd   → MYSD-Version (github.com/KidsLabDe/MYSD), Plan live aus src/data/hackday.json des Repos
const REPO_RAW = 'https://raw.githubusercontent.com/KidsLabDe/MYSD/main';
const MYSD_DATA = process.env.MYSD_DATA || '../src/data/hackday.json'; // eingebetteter Stand (Rückfall ohne Internet)
const MYSD_ORT = process.env.MYSD_ORT || 'ort.json';
const MYSD_OUT = process.env.MYSD_OUT || '../public/lofi';

// event.js = event.json als klassisches Script. Klassische Scripts laufen auch
// per Doppelklick (file://), fetch() auf eine lokale JSON-Datei nicht.
function eventJs(): Plugin {
  const make = () =>
    '// Hackday-Konfiguration. Nur den Inhalt zwischen { } anpassen (JSON-Format).\n' +
    'window.HACKDAY_EVENT = ' + readFileSync('public/event.json', 'utf8').trim() + ';\n';
  return {
    name: 'event-js',
    configureServer(server) {
      server.middlewares.use('/event.js', (_req, res) => {
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        res.end(make());
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'event.js', source: make() });
    },
  };
}

function mysdSource(on: boolean): Plugin {
  const id = '\0virtual:mysd';
  return {
    name: 'mysd-source',
    resolveId: (s) => (s === 'virtual:mysd' ? id : null),
    load(s) {
      if (s !== id) return null;
      if (!on) return 'export default { data: null, ort: null, dataUrl: "", ortUrl: "" };';
      if (!existsSync(MYSD_DATA)) throw new Error(`MYSD-Plan nicht gefunden: ${MYSD_DATA} (MYSD_DATA setzen)`);
      const data = readFileSync(MYSD_DATA, 'utf8'), ort = readFileSync(MYSD_ORT, 'utf8');
      return `export default { data: ${data}, ort: ${ort}, dataUrl: ${JSON.stringify(REPO_RAW + '/src/data/hackday.json')}, ortUrl: ${JSON.stringify(REPO_RAW + '/lofi/ort.json')} };`;
    },
    // Die MYSD-Version braucht kein event.js
    transformIndexHtml: (html) => (on ? html.replace(/<script src="\.\/event\.js"><\/script>\n?/, '') : html),
  };
}

export default defineConfig(({ mode }) => {
  const mysd = mode === 'mysd';
  return {
    base: './',
    plugins: [...(mysd ? [] : [eventJs()]), mysdSource(mysd), viteSingleFile()],
    build: { assetsInlineLimit: 100_000_000, outDir: mysd ? MYSD_OUT : 'dist', emptyOutDir: true },
    server: { host: true },
    test: { include: ['tests/**/*.spec-lofi.ts'] },
  };
});
