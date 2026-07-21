/**
 * Cloudflare Workers : remplace les imports async_hooks (Node) par un shim minimal.
 * À exécuter après next-on-pages. Voir WTconnect/test2snWin/scripts/patch-nop-async-hooks.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const functionsRoot = path.join(
  root,
  '.vercel',
  'output',
  'static',
  '_worker.js',
  '__next-on-pages-dist__',
  'functions'
);

const ASYNC_HOOKS_CLASS =
  'class AsyncLocalStorage{getStore(){return undefined}run(s,c,...a){return c(...a)}enterWith(){}disable(){}}';
const ASYNC_HOOKS_EXPORTS = '({AsyncLocalStorage})';

function stripEsmImportsFromAsyncHooks(code) {
  let c = code;
  let prev;
  do {
    prev = c;
    c = c.replace(/\bimport\s*\{[^}]+\}\s*from\s*["'][^"'\n]*async_hooks[^"'\n]*["']\s*;?/g, '');
    c = c.replace(/import\{[^}]+\}from["'][^"'\n]*async_hooks[^"'\n]*["']/g, '');
    c = c.replace(/\bimport\s*\*\s*as\s+(\w+)\s+from\s*["'][^"'\n]*async_hooks[^"'\n]*["']\s*;?/g, 'const $1={AsyncLocalStorage};');
    c = c.replace(/import\*as\s*(\w+)\s*from["'][^"'\n]*async_hooks[^"'\n]*["']/g, 'const $1={AsyncLocalStorage};');
    c = c.replace(/\bimport\s+(\w+)\s+from\s*["'][^"'\n]*async_hooks[^"'\n]*["']\s*;?/g, 'const $1={AsyncLocalStorage};');
    c = c.replace(/import\s*(\w+)\s*from["'][^"'\n]*async_hooks[^"'\n]*["']/g, 'const $1={AsyncLocalStorage};');
    c = c.replace(/\bimport\s*["'][^"'\n]*async_hooks[^"'\n]*["']\s*;?/g, '');
    c = c.replace(/import["'][^"'\n]*async_hooks[^"'\n]*["']/g, '');
    c = c.replace(/\bimport\s+[^;\n]+?from\s*["'][^"'\n]*async_hooks[^"'\n]*["']\s*;?/g, '');
  } while (c !== prev);
  return c;
}

function replaceCjsStyleAsyncHooksLoads(code) {
  let c = code;
  let prev;
  do {
    prev = c;
    c = c.replace(/__webpack_require__\(\s*["'][^"']*async_hooks[^"']*["']\s*\)/g, ASYNC_HOOKS_EXPORTS);
    c = c.replace(/\brequire\s*\(\s*["'][^"']*async_hooks[^"']*["']\s*\)/g, ASYNC_HOOKS_EXPORTS);
  } while (c !== prev);
  return c;
}

function stillLoadsAsyncHooksModule(code) {
  if (/\bimport[\s\S]{0,800}?from\s*["'][^"']*async_hooks/.test(code)) return true;
  if (/__webpack_require__\s*\(\s*["'][^"']*async_hooks/.test(code)) return true;
  if (/\brequire\s*\(\s*["'][^"']*async_hooks/.test(code)) return true;
  if (/\bimport\s*\(\s*["'][^"']*async_hooks/.test(code)) return true;
  return false;
}

function needsAsyncHooksShim(code) {
  if (!code.includes('async_hooks')) return false;
  return stillLoadsAsyncHooksModule(code);
}

function patchOneFuncFile(absPath) {
  let before = fs.readFileSync(absPath, 'utf8').replace(/^\uFEFF/, '');
  if (!needsAsyncHooksShim(before)) return false;

  let c = stripEsmImportsFromAsyncHooks(before);
  c = replaceCjsStyleAsyncHooksLoads(c);
  if (c === before) {
    console.error('[patch-nop-async-hooks] async_hooks load found but no pattern matched:', absPath);
    process.exit(1);
  }

  fs.writeFileSync(absPath, `${ASYNC_HOOKS_CLASS}\n${c}`, 'utf8');
  if (stillLoadsAsyncHooksModule(fs.readFileSync(absPath, 'utf8'))) {
    console.error('[patch-nop-async-hooks] FAILED — still loads async_hooks:', absPath);
    process.exit(1);
  }
  return true;
}

function walkFuncJs(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkFuncJs(p, out);
    else if (name.endsWith('.func.js')) out.push(p);
  }
  return out;
}

const workerRoot = path.join(root, '.vercel', 'output', 'static', '_worker.js');
if (!fs.existsSync(workerRoot)) {
  console.error('[patch-nop-async-hooks] Missing', workerRoot, '(run next-on-pages first)');
  process.exit(1);
}

const files = walkFuncJs(functionsRoot);
let n = 0;
for (const f of files) {
  if (patchOneFuncFile(f)) {
    console.log('[patch-nop-async-hooks] Patched', path.relative(root, f));
    n++;
  }
}

console.log('[patch-nop-async-hooks] Done, patched', n, 'file(s).');
