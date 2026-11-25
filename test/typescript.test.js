import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('TypeScript Type Definitions & Package Exports', () => {
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  it('package.json defines root "types" field pointing to valid file', () => {
    assert.ok(pkg.types, 'package.json must have a root "types" field');
    const rootTypesPath = path.resolve(rootDir, pkg.types);
    assert.ok(fs.existsSync(rootTypesPath), `Root types file must exist: ${rootTypesPath}`);
    const content = fs.readFileSync(rootTypesPath, 'utf8');
    assert.ok(content.length > 0, 'Root types file must not be empty');
  });

  it('all package.json exports define valid "types" targets', () => {
    assert.ok(pkg.exports, 'package.json must have "exports"');
    for (const [subpath, exportTarget] of Object.entries(pkg.exports)) {
      assert.ok(exportTarget.types, `Export "${subpath}" must define a "types" property`);
      const targetPath = path.resolve(rootDir, exportTarget.types);
      assert.ok(fs.existsSync(targetPath), `Export "${subpath}" types file missing: ${targetPath}`);
      const content = fs.readFileSync(targetPath, 'utf8');
      assert.ok(content.length > 0, `Types file for "${subpath}" must not be empty`);
    }
  });

  it('package.json "files" includes "types" directory for npm distribution', () => {
    assert.ok(Array.isArray(pkg.files), 'package.json must define files array');
    assert.ok(pkg.files.includes('types'), 'package.json files array must include "types" directory');
  });

  it('types/server.d.ts declares all public server exports', async () => {
    const serverModule = await import('../src/server/index.js');
    const serverDts = fs.readFileSync(path.join(rootDir, 'types', 'server.d.ts'), 'utf8');

    for (const exportName of Object.keys(serverModule)) {
      const isDeclared = serverDts.includes(exportName);
      assert.ok(
        isDeclared,
        `Server export "${exportName}" must be declared in types/server.d.ts`
      );
    }
  });

  it('types/client.d.ts declares all public client exports', async () => {
    const clientModule = await import('../src/client/index.js');
    const clientDts = fs.readFileSync(path.join(rootDir, 'types', 'client.d.ts'), 'utf8');

    for (const exportName of Object.keys(clientModule)) {
      const isDeclared = clientDts.includes(exportName);
      assert.ok(
        isDeclared,
        `Client export "${exportName}" must be declared in types/client.d.ts`
      );
    }
  });

  it('types/react.d.ts declares BarstileWidget and its props', async () => {
    const reactDts = fs.readFileSync(path.join(rootDir, 'types', 'react.d.ts'), 'utf8');
    assert.ok(reactDts.includes('BarstileWidget'), 'BarstileWidget must be declared');
    assert.ok(reactDts.includes('BarstileWidgetProps'), 'BarstileWidgetProps must be declared');
  });

  it('TypeScript consumer fixture runs and executes successfully with native Node type-stripping', async () => {
    const { execFileSync } = await import('node:child_process');
    const fixturePath = path.join(__dirname, 'fixtures', 'ts_consumer.ts');
    const stdout = execFileSync(process.execPath, ['--experimental-strip-types', fixturePath], {
      encoding: 'utf8'
    });
    assert.ok(stdout.includes('TS_FIXTURE_SUCCESS'), 'TypeScript fixture must log TS_FIXTURE_SUCCESS');
  });
});
