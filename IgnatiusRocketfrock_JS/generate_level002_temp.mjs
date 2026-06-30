import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateAutomaticLevelDraft,
  normalizeGenerationAssetCatalog,
  normalizeEnemyGenerationCatalog,
  normalizeRewardGenerationCatalog,
  normalizeGeneratorTheme
} from './src/shared/level-generator-data.js';
import { buildCaveDecorationCatalog } from './src/shared/cave-window-decoration.js';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const theme = normalizeGeneratorTheme(read('assets/level-generator-themes/earth-cavern.json'));
const assetCatalog = normalizeGenerationAssetCatalog(read('assets/level-generator-platforms.json'));
const enemyGenerationCatalog = normalizeEnemyGenerationCatalog(read('assets/level-generator-enemies.json'));
const rewardGenerationCatalog = normalizeRewardGenerationCatalog(read('assets/level-generator-rewards.json'));
const enemyCatalog = read('assets/ct_enemies_001.json');
const entityCatalog = read('assets/it_entities_001.json');
const entries = [];
for (const filename of fs.readdirSync('assets').filter((name) => /^at_atlas_\d+\.json$/.test(name))) {
  const manifest = read(path.join('assets', filename));
  for (const [assetId, object] of Object.entries(manifest.objects || {})) {
    const frame = manifest.frames?.[object?.frame || assetId];
    if (!frame) continue;
    entries.push({
      atlasId: manifest.atlasId,
      assetId,
      frame,
      tags: object?.tags || [],
      defaultScale: object?.defaultScale || 1
    });
  }
}
const decorationCatalog = buildCaveDecorationCatalog(entries);
const seed = 'cinder-vault-291-8f6c2b';
const draft = generateAutomaticLevelDraft({
  theme,
  assetCatalog,
  decorationCatalog,
  requirePopulatedPerimeter: true,
  enemyGenerationCatalog,
  rewardGenerationCatalog,
  enemyCatalog,
  entityCatalog,
  seed,
  settings: {
    ...theme.defaults,
    length: 'standard',
    allowedEnemies: '2',
    enemyDensity: 0.48,
    difficulty: 0.42,
    rewardDensity: 0.38,
    allowThoughts: false
  },
  availableEnemyIds: ['enemy_002'],
  destinationLevel: 'level_003'
});
fs.writeFileSync('/tmp/level002_draft.json', JSON.stringify(draft, null, 2) + '\n');
console.log(JSON.stringify({
  seed,
  runId: draft.generation.runId,
  valid: draft.generation.validation.valid,
  bounds: draft.world.bounds,
  placements: draft.placements.length,
  entities: draft.entities.length,
  enemies: draft.entities.filter((e) => e.type === 'characterEnemy').map((e) => ({id:e.id, enemy:e.enemyCatalogId, x:e.x, y:e.y, support:e.generationSupportId})),
  rewards: draft.entities.filter((e) => e.generationStage === 'rewards').map((e) => ({id:e.id,type:e.type,x:e.x,y:e.y,support:e.generationSupportId})),
  doors: draft.entities.filter((e) => /door/.test(e.type)).map((e) => ({id:e.id,type:e.type,x:e.x,y:e.y})),
  routeEnd: draft.generation.route.mainPath.at(-1),
  supportsTail: draft.generation.traversal.supports.slice(-8).map((s) => ({id:s.id, role:s.role, x:s.centerX, y:s.surfaceY, width:s.width, left:s.walkableLeftX,right:s.walkableRightX,mandatory:s.mandatory,secondary:s.secondaryPlatform}))
}, null, 2));
