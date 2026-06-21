import { updateFlightState } from './physics.js';
import {
  crashPlayerShip,
  crashPlayerShipIntoSun,
  respawnShip
} from './player.js';
import { spawnEnemyExplosion } from './effects.js';

export const ENEMY_MODEL_FILES_BY_FAMILY = {
  Standard: [
    'Ship_Standard_1.glb',
    'Ship_Standard_10.glb',
    'Ship_Standard_11.glb',
    'Ship_Standard_12.glb',
    'Ship_Standard_13.glb',
    'Ship_Standard_14.glb',
    'Ship_Standard_17.glb',
    'Ship_Standard_2.glb',
    'Ship_Standard_20.glb',
    'Ship_Standard_3.glb',
    'Ship_Standard_5.glb',
    'Ship_Standard_6.glb',
    'Ship_Standard_7.glb',
    'Ship_Standard_8.glb',
    'Ship_Standard_9.glb'
  ],
  Crosspanel: [
    'Ship_Crosspanel_1.glb',
    'Ship_Crosspanel_10.glb',
    'Ship_Crosspanel_11.glb',
    'Ship_Crosspanel_16.glb',
    'Ship_Crosspanel_18.glb',
    'Ship_Crosspanel_2.glb',
    'Ship_Crosspanel_3.glb',
    'Ship_Crosspanel_4.glb',
    'Ship_Crosspanel_5.glb',
    'Ship_Crosspanel_6.glb',
    'Ship_Crosspanel_7.glb'
  ],
  FlyingSaucer: [
    'Ship_FlyingSaucer_298877.glb',
    'Ship_FlyingSaucer_301176.glb',
    'Ship_FlyingSaucer_336064.glb',
    'Ship_FlyingSaucer_528770.glb',
    'Ship_FlyingSaucer_654444.glb',
    'Ship_FlyingSaucer_750147.glb',
    'Ship_FlyingSaucer_752605.glb',
    'Ship_FlyingSaucer_772429.glb'
  ],
  DeltaWing: [
    'Ship_DeltaWing_108179.glb',
    'Ship_DeltaWing_368386.glb',
    'Ship_DeltaWing_394511.glb',
    'Ship_DeltaWing_535536.glb',
    'Ship_DeltaWing_691262.glb',
    'Ship_DeltaWing_853002.glb',
    'Ship_DeltaWing_894551.glb'
  ],
  Pirate: [
    'Ship_Pirate_1.glb',
    'Ship_Pirate_2.glb',
    'Ship_Pirate_3.glb',
    'Ship_Pirate_4.glb',
    'Ship_Pirate_5.glb',
    'Ship_Pirate_6.glb',
    'Ship_Pirate_7.glb'
  ],
  Orca: [
    'Ship_Orca_135963.glb',
    'Ship_Orca_29300.glb',
    'Ship_Orca_486148.glb',
    'Ship_Orca_492814.glb',
    'Ship_Orca_583214.glb',
    'Ship_Orca_652174.glb',
    'Ship_Orca_687341.glb'
  ],
  Longwing: [
    'Ship_Longwing_1.glb',
    'Ship_Longwing_2.glb',
    'Ship_Longwing_3.glb',
    'Ship_Longwing_4.glb',
    'Ship_Longwing_5.glb',
    'Ship_Longwing_6.glb',
    'Ship_Longwing_7.glb',
    'Ship_Longwing_8.glb'
  ],
  TwoHoop: [
    'Ship_TwoHoop_11695.glb',
    'Ship_TwoHoop_217137.glb',
    'Ship_TwoHoop_274249.glb',
    'Ship_TwoHoop_274461.glb',
    'Ship_TwoHoop_338598.glb',
    'Ship_TwoHoop_428113.glb',
    'Ship_TwoHoop_536191.glb'
  ],
  TigerWing: [
    'Ship_TigerWing_1.glb',
    'Ship_TigerWing_2.glb',
    'Ship_TigerWing_3.glb',
    'Ship_TigerWing_4.glb',
    'Ship_TigerWing_5.glb',
    'Ship_TigerWing_6.glb',
    'Ship_TigerWing_7.glb'
  ],
  LunarCourier: [
    'Ship_LunarCourier_153144.glb',
    'Ship_LunarCourier_322196.glb',
    'Ship_LunarCourier_5002.glb',
    'Ship_LunarCourier_7.glb',
    'Ship_LunarCourier_826239.glb',
    'Ship_LunarCourier_899475.glb',
    'Ship_LunarCourier_95901.glb',
    'Ship_LunarCourier_994899.glb'
  ],
  Hooper: [
    'Ship_Hooper_219385.glb',
    'Ship_Hooper_302864.glb',
    'Ship_Hooper_378031.glb',
    'Ship_Hooper_443110.glb',
    'Ship_Hooper_508807.glb',
    'Ship_Hooper_517819.glb',
    'Ship_Hooper_740839.glb',
    'Ship_Hooper_760830.glb'
  ],
  ManraRay: [
    'Ship_ManraRay_130405.glb',
    'Ship_ManraRay_16943.glb',
    'Ship_ManraRay_190663.glb',
    'Ship_ManraRay_459947.glb',
    'Ship_ManraRay_46262.glb',
    'Ship_ManraRay_766613.glb',
    'Ship_ManraRay_792763.glb',
    'Ship_ManraRay_858242.glb'
  ],
  PyramidLifter: [
    'Ship_PyramidLifter_290115.glb',
    'Ship_PyramidLifter_327178.glb',
    'Ship_PyramidLifter_390936.glb',
    'Ship_PyramidLifter_426685.glb',
    'Ship_PyramidLifter_478836.glb',
    'Ship_PyramidLifter_741828.glb',
    'Ship_PyramidLifter_97249.glb',
    'Ship_PyramidLifter_990348.glb'
  ],
  Nemesis: [
    'ship_nemesis2.glb'
  ]
};

export const ENEMY_FAMILIES = Object.keys(ENEMY_MODEL_FILES_BY_FAMILY);

export function getEnemyFamilyFiles(family) {
  return ENEMY_MODEL_FILES_BY_FAMILY[family] || ENEMY_MODEL_FILES_BY_FAMILY[ENEMY_FAMILIES[0]] || [];
}


export function updateEnemyShipState(state, dt, controls) {
  return updateFlightState(state, dt, controls, {
    respawnShip,
    crashPlayerShip,
    crashPlayerShipIntoSun,
    spawnEnemyExplosion
  });
}
