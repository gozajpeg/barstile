import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const testDir = path.resolve(rootDir, 'test');

const files = fs.readdirSync(testDir)
  .filter(f => f.endsWith('.test.js'))
  .map(f => path.join('test', f));

const result = spawnSync(process.execPath, ['--test', ...files], {
  cwd: rootDir,
  stdio: 'inherit'
});

process.exit(result.status ?? 1);
