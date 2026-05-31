export const QUATERNIUS_HUMANOID_RIG = {
  name: 'QuaterniusHumanoidV1',
  source: 'Quaternius Universal Base Characters and Universal Animation Library',
  bones: [
    'root',
    'pelvis',
    'spine_01',
    'spine_02',
    'spine_03',
    'neck_01',
    'Head',
    'clavicle_l',
    'upperarm_l',
    'lowerarm_l',
    'hand_l',
    'index_01_l',
    'index_02_l',
    'index_03_l',
    'index_04_leaf_l',
    'middle_01_l',
    'middle_02_l',
    'middle_03_l',
    'middle_04_leaf_l',
    'pinky_01_l',
    'pinky_02_l',
    'pinky_03_l',
    'pinky_04_leaf_l',
    'ring_01_l',
    'ring_02_l',
    'ring_03_l',
    'ring_04_leaf_l',
    'thumb_01_l',
    'thumb_02_l',
    'thumb_03_l',
    'thumb_04_leaf_l',
    'clavicle_r',
    'upperarm_r',
    'lowerarm_r',
    'hand_r',
    'index_01_r',
    'index_02_r',
    'index_03_r',
    'index_04_leaf_r',
    'middle_01_r',
    'middle_02_r',
    'middle_03_r',
    'middle_04_leaf_r',
    'pinky_01_r',
    'pinky_02_r',
    'pinky_03_r',
    'pinky_04_leaf_r',
    'ring_01_r',
    'ring_02_r',
    'ring_03_r',
    'ring_04_leaf_r',
    'thumb_01_r',
    'thumb_02_r',
    'thumb_03_r',
    'thumb_04_leaf_r',
    'thigh_l',
    'calf_l',
    'foot_l',
    'ball_l',
    'ball_leaf_l',
    'thigh_r',
    'calf_r',
    'foot_r',
    'ball_r',
    'ball_leaf_r'
  ],
  retargetMap: {
    hips: 'pelvis',
    spine: 'spine_01',
    chest: 'spine_03',
    neck: 'neck_01',
    head: 'Head',
    leftShoulder: 'clavicle_l',
    leftUpperArm: 'upperarm_l',
    leftLowerArm: 'lowerarm_l',
    leftHand: 'hand_l',
    rightShoulder: 'clavicle_r',
    rightUpperArm: 'upperarm_r',
    rightLowerArm: 'lowerarm_r',
    rightHand: 'hand_r',
    leftUpperLeg: 'thigh_l',
    leftLowerLeg: 'calf_l',
    leftFoot: 'foot_l',
    leftToe: 'ball_l',
    rightUpperLeg: 'thigh_r',
    rightLowerLeg: 'calf_r',
    rightFoot: 'foot_r',
    rightToe: 'ball_r'
  }
};

export const QUATERNIUS_CHARACTER_IMPORTS = {
  license: 'CC0-1.0',
  licensePath: 'assets/models/characters/quaternius/LICENSE_Quaternius_CC0.txt',
  sourceUrls: {
    baseCharacters: 'https://quaternius.com/packs/universalbasecharacters.html',
    animationLibrary1: 'https://quaternius.com/packs/universalanimationlibrary.html',
    animationLibrary2: 'https://quaternius.com/packs/universalanimationlibrary2.html'
  },
  baseModels: [
    {
      id: 'quaternius-superhero-male',
      sourcePack: 'Universal Base Characters[Standard]',
      path: 'assets/models/characters/quaternius/base/Superhero_Male_FullBody.gltf',
      buffer: 'assets/models/characters/quaternius/base/Superhero_Male_FullBody.bin',
      triangleCount: 14318,
      vertexCount: 8483,
      skeleton: QUATERNIUS_HUMANOID_RIG.name,
      status: 'source-reference',
      runtimeNotes: [
        'Needs decimation or LOD before it satisfies the 7k triangle runtime budget.',
        'Texture URI aliases were normalized for local glTF loading.',
        'Use this mesh as the anatomical and rigging reference for enemy variants.'
      ]
    }
  ],
  animationLibraries: [
    {
      id: 'quaternius-ual1-standard',
      sourcePack: 'Universal Animation Library[Standard]',
      path: 'assets/models/characters/quaternius/animations/UAL1_Standard.glb',
      clipCount: 45,
      fps: 30,
      skeleton: QUATERNIUS_HUMANOID_RIG.name,
      recommendedEnemyClips: [
        'A_TPose',
        'Idle_Loop',
        'Walk_Loop',
        'Jog_Fwd_Loop',
        'Sprint_Loop',
        'Hit_Chest',
        'Hit_Head',
        'Death01',
        'Pistol_Aim_Neutral',
        'Pistol_Shoot',
        'Punch_Jab',
        'Punch_Cross'
      ]
    },
    {
      id: 'quaternius-ual2-standard',
      sourcePack: 'Universal Animation Library 2[Standard]',
      path: 'assets/models/characters/quaternius/animations/UAL2_Standard.glb',
      clipCount: 43,
      fps: 30,
      skeleton: QUATERNIUS_HUMANOID_RIG.name,
      recommendedEnemyClips: [
        'A_TPose',
        'Hit_Knockback',
        'Melee_Hook',
        'Melee_Hook_Rec',
        'OverhandThrow',
        'Sword_Regular_A',
        'Sword_Regular_B',
        'Zombie_Idle_Loop',
        'Zombie_Scratch',
        'Zombie_Walk_Fwd_Loop'
      ]
    }
  ]
};

export const CHARACTER_PRODUCTION_GUIDE = {
  version: 1,
  baseMeshPolicy: {
    summary: 'Derive variations from the approved base mesh instead of generating full humans from scratch.',
    approvedBaseModelIds: ['quaternius-superhero-male'],
    notes: [
      'Keep changes small, readable, and intentional.',
      'Use the approved mesh as the anatomical reference for all humanoid variants.',
      'Treat AI output as a staged delta, not a one-shot final character.'
    ]
  },
  styleBible: {
    acceptedExamples: [
      {
        id: 'quaternius-stylized-human-baseline',
        label: 'Approved stylized-realistic human baseline',
        sourceModelId: 'quaternius-superhero-male',
        metrics: {
          heightMeters: 1.82,
          headsTall: 7.4,
          shoulderWidthToHeight: 0.28,
          hipWidthToHeight: 0.20,
          armSpanToHeight: 1.01,
          handLengthToHeight: 0.10,
          footLengthToHeight: 0.15,
          kneeHeightToHeight: 0.28,
          elbowHeightToHeight: 0.58
        },
        deformation: {
          maxFootSlideMeters: 0.025,
          maxFootFloatMeters: 0.01,
          maxStretchRatio: 1.05,
          maxJointCollapseRatio: 0.18
        },
        cleanTopologyZones: ['shoulders', 'elbows', 'wrists', 'hips', 'knees', 'ankles', 'neck', 'jaw'],
        notes: [
          'Use this as the comparison target for all new human variants.',
          'Borderline changes should be shown to the user instead of auto-approved.'
        ]
      }
    ],
    rejectedExamples: [
      {
        id: 'silhouette-too-slender',
        label: 'Reject: silhouette and proportions drift away from readable combat forms',
        metrics: {
          heightMeters: 1.95,
          headsTall: 5.8,
          shoulderWidthToHeight: 0.19,
          hipWidthToHeight: 0.13,
          armSpanToHeight: 1.18,
          handLengthToHeight: 0.14,
          footLengthToHeight: 0.09,
          kneeHeightToHeight: 0.19,
          elbowHeightToHeight: 0.72
        },
        notes: [
          'Ask the user to judge any model that drifts toward this silhouette.',
          'Reject early if hands, feet, or joints start to look wrong.'
        ]
      },
      {
        id: 'deformation-unstable',
        label: 'Reject: deformation quality is too unstable for engine import',
        deformation: {
          maxFootSlideMeters: 0.12,
          maxFootFloatMeters: 0.08,
          maxStretchRatio: 1.24,
          maxJointCollapseRatio: 0.42
        },
        notes: [
          'Do not let this stage reach engine import.',
          'Keep the AI agent constrained to repair tasks when deformation fails.'
        ]
      }
    ],
    comparisonMetrics: [
      'heightMeters',
      'headsTall',
      'shoulderWidthToHeight',
      'hipWidthToHeight',
      'armSpanToHeight',
      'handLengthToHeight',
      'footLengthToHeight',
      'kneeHeightToHeight',
      'elbowHeightToHeight'
    ],
    acceptedScoreThreshold: 0.82,
    rejectedSimilarityThreshold: 0.7,
    reviewNotes: [
      'Reject models early if the silhouette, proportions, hands, feet, or joints look wrong.',
      'Require clean topology around shoulders, elbows, wrists, hips, knees, ankles, neck, and jaw.',
      'Retarget motion onto the chosen skeleton instead of relying on generated final motion.',
      'Use the approved style examples as the comparison target for every new model.'
    ]
  },
  reviewStages: [
    {
      id: 'concept',
      label: 'Concept',
      requiresApproval: true,
      checks: ['base mesh variation only', 'silhouette readability', 'combat distance readability']
    },
    {
      id: 'blockout',
      label: 'Blockout',
      requiresApproval: true,
      checks: ['body masses', 'head size', 'hand size', 'foot size', 'overall proportions']
    },
    {
      id: 'topology',
      label: 'Topology',
      requiresApproval: true,
      checks: ['shoulders', 'elbows', 'wrists', 'hips', 'knees', 'ankles', 'neck', 'jaw']
    },
    {
      id: 'rigging',
      label: 'Rigging',
      requiresApproval: true,
      checks: ['QuaterniusHumanoidV1 skeleton', 'no custom bones', 'retarget map alignment']
    },
    {
      id: 'skinning',
      label: 'Skinning',
      requiresApproval: true,
      checks: ['weight painting', 'foot planting', 'joint deformation', 'surface smoothness']
    },
    {
      id: 'animation',
      label: 'Animation',
      requiresApproval: true,
      checks: ['idle', 'walk', 'run', 'stop', 'turn', 'jump', 'hit reaction', 'death', 'interaction', 'IK']
    },
    {
      id: 'engineImport',
      label: 'Engine Import',
      requiresApproval: true,
      checks: ['material count', 'texture budget', 'clip compatibility', 'runtime test']
    },
    {
      id: 'polish',
      label: 'Polish',
      requiresApproval: true,
      checks: ['final readability', 'feel', 'variation limit', 'user approval']
    }
  ],
  approvalPolicy: {
    keepTasksSmall: true,
    requireStageApproval: true,
    compareAgainstAcceptedExamples: true,
    requireUserJudgementForBorderlineModels: true,
    expandVariationOnlyAfterQualityIsReliable: true
  }
};

export const CHARACTER_STYLE_BIBLE = CHARACTER_PRODUCTION_GUIDE.styleBible;
