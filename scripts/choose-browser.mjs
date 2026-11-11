// `npm run dev`, `npm run build` and `npm run package` (`node scripts/choose-browser.mjs
// dev|build|package`): asks which browser it's for and runs that one's script — `npm
// run dev:chrome`, `npm run build:firefox`… The first choice is picked to begin with
// (Enter), the others are a ↓ away: for dev, Chrome, then Firefox; for build and
// package, both, one after the other, then Chrome, then Firefox (packaging Firefox's
// packages its source code too: package:source). With no terminal to ask in, it's the
// first.
import { spawn } from 'node:child_process';
import { emitKeypressEvents } from 'node:readline';

const TASKS = {
  dev: {
    verb: 'Develop',
    choices: [
      { label: 'Chrome', scripts: ['dev:chrome'] },
      { label: 'Firefox', scripts: ['dev:firefox'] }
    ]
  },
  build: {
    verb: 'Build',
    choices: [
      { label: 'Both', scripts: ['build:chrome', 'build:firefox'] },
      { label: 'Chrome', scripts: ['build:chrome'] },
      { label: 'Firefox', scripts: ['build:firefox'] }
    ]
  },
  package: {
    verb: 'Package',
    choices: [
      // Firefox's with its source code too, which addons.mozilla.org asks for with it.
      { label: 'Both', scripts: ['package:chrome', 'package:firefox', 'package:source'] },
      { label: 'Chrome', scripts: ['package:chrome'] },
      { label: 'Firefox', scripts: ['package:firefox', 'package:source'] }
    ]
  }
};
const task = TASKS[process.argv[2]];
if (!task) {
  console.error(`Usage: node scripts/choose-browser.mjs ${Object.keys(TASKS).join('|')}`);
  process.exit(2);
}
const CHOICES = task.choices;

function choose() {
  if (!process.stdin.isTTY) return Promise.resolve(CHOICES[0]);
  const out = process.stdout;
  let selected = 0;
  const draw = () =>
    CHOICES.forEach(({ label }, i) =>
      out.write(`\x1b[2K${i === selected ? `\x1b[36m❯ ${i + 1}. ${label}\x1b[0m` : `  ${i + 1}. ${label}`}\n`)
    );

  out.write(`${task.verb} for which browser? (↑/↓, Enter)\n\x1b[?25l`);
  draw();
  return new Promise((resolve) => {
    const finish = () => {
      process.stdin.off('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      out.write('\x1b[?25h');
    };
    const onKey = (text, key = {}) => {
      if (key.ctrl && key.name === 'c') {
        finish();
        process.exit(130);
      }
      if (key.name === 'return' || key.name === 'enter') {
        finish();
        resolve(CHOICES[selected]);
        return;
      }
      if (key.name === 'up') selected = Math.max(0, selected - 1);
      else if (key.name === 'down') selected = Math.min(CHOICES.length - 1, selected + 1);
      // Its number picks one too, still waiting for Enter.
      else if (/^[1-9]$/.test(text ?? '') && Number(text) <= CHOICES.length) selected = Number(text) - 1;
      else return;
      out.write(`\x1b[${CHOICES.length}A`);
      draw();
    };
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('keypress', onKey);
  });
}

/** Runs `npm run <script>`, resolving with its exit code. */
function run(script) {
  // npm's own path when run through it (`npm run dev`), so the same npm runs the script.
  // (`--silent` keeps npm from announcing the script again, after this one.)
  const npm = process.env.npm_execpath;
  const child = npm
    ? spawn(process.execPath, [npm, 'run', '--silent', script], { stdio: 'inherit' })
    : spawn('npm', ['run', '--silent', script], { stdio: 'inherit', shell: process.platform === 'win32' });
  return new Promise((resolve) => child.on('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0))));
}

const { scripts } = await choose();
// Ctrl+C reaches the script run too, which stops: this then goes with it.
process.on('SIGINT', () => {});
for (const script of scripts) {
  const code = await run(script);
  // A failed build leaves the next one unbuilt, and `npm run build` failed.
  if (code !== 0) process.exit(code);
}
process.exit(0);
