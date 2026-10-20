import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../server/db.js';
import { createApiApp } from '../server/app.js';

test('source checks preserve user edits and do not restore deleted sources', async () => {
  const source = (await db.getSources())[0];
  const edited = { ...source, name: 'Custom name', enabled: false };
  await db.upsertSource(edited);
  await db.updateSourceChecks([{ ...source, lastCheckedAt: '2026-10-20T17:00:00Z' }]);
  const saved = await db.getSourceById(source.id);
  assert.equal(saved?.name, 'Custom name');
  assert.equal(saved?.enabled, false);
  assert.equal(saved?.lastCheckedAt, '2026-10-20T17:00:00Z');
  const custom = { ...source, id: 'custom-test' };
  await db.upsertSource(custom);
  await db.deleteSource(custom.id);
  await db.updateSourceChecks([custom]);
  assert.equal(await db.getSourceById(custom.id), undefined);
});

test('missing production storage returns an HTTP error instead of hanging or losing data', async () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = '1';
  const server = createApiApp().listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const address = server.address() as { port: number };
    const response = await fetch(`http://127.0.0.1:${address.port}/api/briefings`);
    assert.equal(response.status, 500);
    assert.match((await response.json()).error, /storage configuration/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});
