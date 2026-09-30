// Run with: node scripts/check-demo-fixture.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

// Execute the real TS modules in Node; only device storage is replaced.
function loader() {
  const cache = new Map();
  function load(file, base = root) {
    file = path.resolve(file);
    if (!path.extname(file)) file += '.ts';
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    const localRequire = (id) => {
      if (id === '@/lib/storage') return { safeStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } };
      if (id.startsWith('@/')) return load(path.join(base, 'src', id.slice(2)), base);
      if (id.startsWith('.')) return load(path.resolve(path.dirname(file), id), base);
      return require(id);
    };
    new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
    return module.exports;
  }
  return load;
}

async function main() {
  process.env.NEXT_PUBLIC_DEMO_PANEL_STANDS = 'true';
  const load = loader();
  const fixture = load(path.join(root, 'src/data/demo-fixture.ts')).DEMO_FIXTURE;
  const panel = load(path.join(root, 'src/lib/panel-stands.ts'));
  global.fetch = async () => { throw new Error('Demo must not call the backend'); };
  assert.equal((await panel.listStands()).total, 3);
  for (const stand of fixture.stands) {
    const detail = await panel.getStandById(stand.id);
    assert.equal(detail.displayName, stand.name);
    assert.equal(detail.boothCode, stand.boothCode);
    assert.equal(detail.categories[0].id, stand.category);
    assert.equal(detail.activityHighlight, stand.activity);
    assert.equal(detail.promotionHighlight, stand.promotion);
    assert.ok(detail.demoBlock);
  }
  assert.equal((await panel.listStands({ query: 'Kawsay' })).items[0].id, 'stand-kawsay-salud');
  assert.equal((await panel.listStands({ page: 2, limit: 2 })).items.length, 1);
  assert.equal((await panel.listStands({ categoryId: 'health' })).total, 1);
  await assert.rejects(panel.getStandById('missing'), { status: 404 });

  const web = load(path.join(root, 'src/store/demo-store.ts')).useDemoStore;
  web.getState().resetDemo();
  assert.equal(web.getState().points, 100);
  web.getState().confirmVisit('stand-sabor-andino');
  assert.equal(web.getState().points, 150);
  assert.equal(web.getState().missionProgress[fixture.mission.id], 3);
  const count = web.getState().recentVisits.length;
  web.getState().confirmVisit('stand-sabor-andino');
  assert.equal(web.getState().points, 150);
  assert.equal(web.getState().recentVisits.length, count);
  assert.equal(web.getState().nfcStage, 'duplicate');
  web.getState().resetDemo();
  web.getState().confirmVisit('stand-semilla-capital');
  assert.equal(web.getState().missionProgress[fixture.mission.id], 2);

  // Sibling checkout required to verify the actual shared contract.
  const mobileRoot = path.resolve(root, '../fexpo-expo-app');
  const mobileStands = load(path.join(mobileRoot, 'src/data/demo-data.ts'), mobileRoot).STANDS;
  for (const stand of fixture.stands) {
    const other = mobileStands.find((item) => item.id === stand.id);
    for (const key of ['name', 'boothCode', 'zoneId', 'category', 'activity', 'promotion', 'points']) assert.equal(stand[key], other[key], `${stand.id}: ${key}`);
  }
  const mobile = load(path.join(mobileRoot, 'src/store/visitor-store.ts'), mobileRoot).useVisitorStore;
  mobile.getState().reset();
  for (const stand of fixture.stands) mobile.getState().confirmVisit(stand.id);
  assert.equal(mobile.getState().points, 150);
  assert.equal(mobile.getState().missionProgress[fixture.mission.id], 3);
  mobile.getState().confirmVisit(fixture.stands[0].id);
  assert.equal(mobile.getState().points, 150);
  assert.equal(mobile.getState().recentVisits.length, 3);
  mobile.getState().reset();
  mobile.getState().registerVisitIntent(fixture.stands[0].id);
  mobile.getState().registerVisitIntent(fixture.stands[0].id);
  assert.equal(mobile.getState().points, 0);
  assert.equal(mobile.getState().recentVisits.length, 1);
  mobile.getState().applyServerCheckin(fixture.stands[0].id, { pointsAwarded: 50 });
  assert.equal(mobile.getState().points, 50);
  assert.equal(mobile.getState().recentVisits[0].pending, false);

  process.env.NEXT_PUBLIC_DEMO_PANEL_STANDS = 'false';
  process.env.NEXT_PUBLIC_AGENT_BACKEND_URL = 'https://example.invalid';
  const backendPanel = loader()(path.join(root, 'src/lib/panel-stands.ts'));
  let calls = 0;
  global.fetch = async (url) => {
    calls++;
    assert.ok(url.startsWith('https://example.invalid/api/v1/stands'));
    return new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 });
  };
  assert.equal((await backendPanel.listStands()).total, 0);
  assert.equal(calls, 1);
  global.fetch = async () => { throw new Error('offline'); };
  await assert.rejects(backendPanel.listStands());
  console.log('PASS: panel demo/API separation, shared fixture, web/mobile points, duplicate and pending visits.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
