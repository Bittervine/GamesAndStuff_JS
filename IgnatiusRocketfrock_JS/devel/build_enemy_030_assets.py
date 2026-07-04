from __future__ import annotations

import json
import math
from copy import deepcopy
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
ATLAS_PNG = ASSETS / 'ct_atlas_enemy_030.png'
ATLAS_JSON = ASSETS / 'ct_atlas_enemy_030.json'
PARTS_JSON = ASSETS / 'ct_human_parts_030.json'
RIG_JSON = ASSETS / 'ct_rig_enemy_030.json'
CHAR_JSON = ASSETS / 'ct_char_enemy_030.json'
ENEMIES_JSON = ASSETS / 'ct_enemies_001.json'

SKELETON_RIG_JSON = ASSETS / 'ct_rig_enemy_001.json'
SKELETON_CHAR_JSON = ASSETS / 'ct_char_enemy_001.json'
SKELETON_ANIMS = {
    'idle': ASSETS / 'ct_anim_enemy_001_idle.json',
    'walk': ASSETS / 'ct_anim_enemy_001_walk.json',
    'attack': ASSETS / 'ct_anim_enemy_001_attack.json',
    'hurt': ASSETS / 'ct_anim_enemy_001_hurt.json',
    'death': ASSETS / 'ct_anim_enemy_001_death.json',
}
HUMAN_ANIMS = {
    slot: ASSETS / f'ct_anim_enemy_030_{slot}.json'
    for slot in ['idle', 'walk', 'attack', 'hurt', 'death']
}


def alpha_bbox(image: np.ndarray) -> tuple[int, int, int, int]:
    mask = image[:, :, 3] > 10
    ys, xs = np.where(mask)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def load_atlas_rgba(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert('RGBA'))


def detect_components(rgba: np.ndarray) -> list[dict]:
    mask = rgba[:, :, 3] > 10
    labels, count = ndimage.label(mask)
    objects = ndimage.find_objects(labels)
    components: list[dict] = []
    for index, slices in enumerate(objects, start=1):
        if slices is None:
            continue
        y_slice, x_slice = slices
        x0, x1 = int(x_slice.start), int(x_slice.stop)
        y0, y1 = int(y_slice.start), int(y_slice.stop)
        area = int((labels[slices] == index).sum())
        if area < 10000:
            continue
        crop = rgba[y0:y1, x0:x1].copy()
        components.append({
            'bbox': [x0, y0, x1, y1],
            'area': area,
            'w': x1 - x0,
            'h': y1 - y0,
            'crop': crop,
        })
    components.sort(key=lambda comp: (comp['bbox'][1], comp['bbox'][0]))
    return components




def sort_by_rows(components: list[dict], row_tolerance: int = 80) -> list[dict]:
    if not components:
        return []
    comps = sorted(components, key=lambda comp: (comp['bbox'][1], comp['bbox'][0]))
    rows: list[list[dict]] = []
    row_starts: list[int] = []
    for comp in comps:
        y = comp['bbox'][1]
        if not rows or abs(y - row_starts[-1]) > row_tolerance:
            rows.append([comp])
            row_starts.append(y)
        else:
            rows[-1].append(comp)
    ordered: list[dict] = []
    for row in rows:
        ordered.extend(sorted(row, key=lambda comp: comp['bbox'][0]))
    return ordered

def classify_components(components: list[dict]) -> dict[str, list[dict]]:
    bodies = []
    heads = []
    arms = []
    legs = []
    weapons = []
    for comp in components:
        x0, y0, x1, y1 = comp['bbox']
        area = comp['area']
        w = comp['w']
        h = comp['h']
        if area > 300000 and y0 < 2300:
            bodies.append(comp)
        elif 90000 <= area <= 110000 and 2300 <= y0 < 3700:
            heads.append(comp)
        elif x0 > 3000 and y0 < 1800 and area > 110000:
            if y0 < 900:
                arms.append(comp)
            else:
                legs.append(comp)
        elif x0 > 3000 and y0 >= 1800:
            weapons.append(comp)
        else:
            raise RuntimeError(f'Unclassified component {comp}')

    bodies = sort_by_rows(bodies, row_tolerance=120)
    heads = sort_by_rows(heads, row_tolerance=120)
    arms.sort(key=lambda comp: comp['bbox'][0])
    legs.sort(key=lambda comp: comp['bbox'][0])
    weapons.sort(key=lambda comp: (comp['bbox'][1], comp['bbox'][0]))

    assert len(bodies) == 10, f'Expected 10 bodies, got {len(bodies)}'
    assert len(heads) == 18, f'Expected 18 heads, got {len(heads)}'
    assert len(arms) == 2, f'Expected 2 arms, got {len(arms)}'
    assert len(legs) == 2, f'Expected 2 legs, got {len(legs)}'
    assert len(weapons) == 7, f'Expected 7 weapons, got {len(weapons)}'

    return {
        'bodies': bodies,
        'heads': heads,
        'arms': arms,
        'legs': legs,
        'weapons': weapons,
    }


def estimate_head_anchor(crop: np.ndarray) -> tuple[float, float]:
    mask = crop[:, :, 3] > 10
    h, w = mask.shape
    rows = []
    for y in range(int(h * 0.72), h):
        xs = np.where(mask[y])[0]
        if xs.size:
            width = int(xs[-1] - xs[0] + 1)
            rows.append((y, int(xs[0]), int(xs[-1]), width))
    if not rows:
        return w * 0.5, h * 0.9
    min_width = min(row[3] for row in rows)
    selected = [row for row in rows if row[3] <= min_width + 14]
    anchor_y = float(np.median([row[0] for row in selected]))
    anchor_x = float(np.median([(row[1] + row[2]) * 0.5 for row in selected]))
    return anchor_x, anchor_y


def derive_uniform_frames(items: list[dict], anchor_fn, pad_x: int = 8, pad_y: int = 8) -> tuple[list[dict], dict]:
    local_anchors: list[tuple[float, float]] = []
    for item in items:
        crop = item['crop']
        local_anchors.append(anchor_fn(crop))
    anchor_x = max(anchor[0] for anchor in local_anchors)
    anchor_y = max(anchor[1] for anchor in local_anchors)
    # Clamp the common anchor so the derived frame origins stay inside the atlas.
    anchor_x = min(anchor_x, min(item['bbox'][0] + anchor[0] for item, anchor in zip(items, local_anchors)))
    anchor_y = min(anchor_y, min(item['bbox'][1] + anchor[1] for item, anchor in zip(items, local_anchors)))
    cell_w = int(math.ceil(anchor_x + max(item['w'] - anchor[0] for item, anchor in zip(items, local_anchors)) + pad_x))
    cell_h = int(math.ceil(anchor_y + max(item['h'] - anchor[1] for item, anchor in zip(items, local_anchors)) + pad_y))

    frames = []
    for item, anchor in zip(items, local_anchors):
        x0, y0, x1, y1 = item['bbox']
        frame_x = int(round(x0 - (anchor_x - anchor[0])))
        frame_y = int(round(y0 - (anchor_y - anchor[1])))
        frame = {
            'x': frame_x,
            'y': frame_y,
            'w': cell_w,
            'h': cell_h,
        }
        # Validate containment and image bounds.
        if frame_x < 0 or frame_y < 0:
            raise RuntimeError(f'Frame {frame} starts outside atlas for bbox {item["bbox"]}')
        if frame_x + cell_w > 4096 or frame_y + cell_h > 4096:
            raise RuntimeError(f'Frame {frame} ends outside atlas for bbox {item["bbox"]}')
        if not (frame_x <= x0 and frame_y <= y0 and frame_x + cell_w >= x1 and frame_y + cell_h >= y1):
            raise RuntimeError(f'Frame {frame} does not contain {item["bbox"]}')
        frames.append(frame)

    # Ensure no overlaps in same atlas family.
    for i, a in enumerate(frames):
        ax0, ay0, aw, ah = a['x'], a['y'], a['w'], a['h']
        ax1, ay1 = ax0 + aw, ay0 + ah
        for j, b in enumerate(frames):
            if j <= i:
                continue
            bx0, by0, bw, bh = b['x'], b['y'], b['w'], b['h']
            bx1, by1 = bx0 + bw, by0 + bh
            separated = ax1 <= bx0 or bx1 <= ax0 or ay1 <= by0 or by1 <= ay0
            if not separated:
                raise RuntimeError(f'Uniform frames overlap: {i} {a} vs {j} {b}')

    return frames, {
        'cellSize': {'w': cell_w, 'h': cell_h},
        'anchor': {'x': float(anchor_x), 'y': float(anchor_y)},
        'localAnchors': [{'x': float(a[0]), 'y': float(a[1])} for a in local_anchors],
    }


def build_atlas_manifest(groups: dict[str, list[dict]]) -> tuple[dict, dict]:
    bodies = groups['bodies']
    heads_all = groups['heads']
    # The user explicitly allowed the troublesome top-right head to be scrapped. Excluding it
    # keeps a clean shared-pivot set of 17 heads.
    heads = [head for index, head in enumerate(heads_all) if index != 5]
    arms = groups['arms']
    legs = groups['legs']
    weapons = groups['weapons']

    head_frames, head_meta = derive_uniform_frames(heads, estimate_head_anchor, pad_x=8, pad_y=8)

    # Bodies use shared replacement geometry derived from the earlier preprocessing pass.
    # The current atlas was manually re-packed, so keep a pragmatic consistent cell: a little
    # left/top padding, and enough room under the hem for common leg alignment.
    body_cell_w = 555
    body_cell_h = 1155
    body_frame_left_pad = 12
    body_frame_top_pad = 26
    body_frames = []
    for item in bodies:
        x0, y0, x1, y1 = item['bbox']
        body_frames.append({
            'x': x0 - body_frame_left_pad,
            'y': y0 - body_frame_top_pad,
            'w': body_cell_w,
            'h': body_cell_h,
        })
    for frame in body_frames:
        if frame['x'] < 0 or frame['y'] < 0 or frame['x'] + frame['w'] > 4096 or frame['y'] + frame['h'] > 4096:
            raise RuntimeError(f'Body frame outside atlas: {frame}')
    for i, a in enumerate(body_frames):
        ax0, ay0, ax1, ay1 = a['x'], a['y'], a['x'] + a['w'], a['y'] + a['h']
        for j, b in enumerate(body_frames):
            if j <= i:
                continue
            bx0, by0, bx1, by1 = b['x'], b['y'], b['x'] + b['w'], b['y'] + b['h']
            separated = ax1 <= bx0 or bx1 <= ax0 or ay1 <= by0 or by1 <= ay0
            if not separated:
                raise RuntimeError(f'Body frames overlap: {i} {a} vs {j} {b}')

    body_meta = {
        'cellSize': {'w': body_cell_w, 'h': body_cell_h},
        'primaryShoulderAnchor': {'x': 112.0, 'y': 329.0},
        'neckAnchor': {'x': 166.0, 'y': 200.0},
        'bodyOriginHint': {'x': body_frame_left_pad, 'y': body_frame_top_pad},
        'notes': 'Shoulder/neck anchors are a first-pass common placement for the shared limb rig. Fine-tuning per enemy can happen in later rig revisions.',
    }

    frame_map: dict[str, dict] = {}
    object_map: dict[str, dict] = {}

    for index, frame in enumerate(body_frames):
        frame_id = f'body_{index:02d}'
        frame_map[frame_id] = frame
        object_map[frame_id] = {
            'id': frame_id,
            'frame': frame_id,
            'type': 'characterPart',
            'layer': 'character',
            'mirrorable': True,
            'tags': ['torso', 'body', 'humanVariant'],
        }

    for index, frame in enumerate(head_frames):
        frame_id = f'head_{index:02d}'
        frame_map[frame_id] = frame
        object_map[frame_id] = {
            'id': frame_id,
            'frame': frame_id,
            'type': 'characterPart',
            'layer': 'character',
            'mirrorable': True,
            'tags': ['head', 'humanVariant'],
        }

    limb_names = ['arm_00', 'arm_01', 'leg_00', 'leg_01']
    for frame_id, item, tags in [
        ('arm_00', arms[0], ['arm', 'rear', 'closedHand']),
        ('arm_01', arms[1], ['arm', 'front', 'openHand']),
        ('leg_00', legs[0], ['leg', 'rear']),
        ('leg_01', legs[1], ['leg', 'front']),
    ]:
        x0, y0, x1, y1 = item['bbox']
        frame_map[frame_id] = {'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0}
        object_map[frame_id] = {
            'id': frame_id,
            'frame': frame_id,
            'type': 'characterPart',
            'layer': 'character',
            'mirrorable': True,
            'tags': tags,
        }

    weapon_names = [
        ('dagger', weapons[0], ['weapon', 'dagger', 'thrown', 'equipment']),
        ('throwingAxe', weapons[1], ['weapon', 'axe', 'thrown', 'equipment']),
        ('bow', weapons[2], ['weapon', 'bow', 'equipment']),
        ('arrow', weapons[3], ['weapon', 'arrow', 'projectile']),
        ('sword', weapons[4], ['weapon', 'sword', 'equipment', 'held']),
        ('rapier', weapons[5], ['weapon', 'rapier', 'equipment', 'held']),
        ('crossbow', weapons[6], ['weapon', 'crossbow', 'equipment', 'held']),
    ]
    for frame_id, item, tags in weapon_names:
        x0, y0, x1, y1 = item['bbox']
        frame_map[frame_id] = {'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0}
        object_map[frame_id] = {
            'id': frame_id,
            'frame': frame_id,
            'type': 'projectileSprite' if 'projectile' in tags else 'characterPart',
            'layer': 'projectile' if 'projectile' in tags else 'character',
            'mirrorable': True,
            'tags': tags,
        }

    atlas_manifest = {
        'meta': {
            'version': 1,
            'note': 'Revision 365 modular human enemy atlas. Bodies and heads use uniform extraction rectangles so pivots stay consistent across variants.',
        },
        'atlasId': 'ct_atlas_enemy_030',
        'image': 'ct_atlas_enemy_030.png',
        'frames': frame_map,
        'objects': object_map,
    }

    parts_manifest = {
        'meta': {
            'version': 1,
            'note': 'Revision 365 modular human parts manifest. Stores the uniform head/body frame geometry and identifies the first assembled enemy variant.',
        },
        'partsManifestId': 'ct_human_parts_030',
        'atlasId': 'ct_atlas_enemy_030',
        'atlasManifest': 'ct_atlas_enemy_030.json',
        'image': 'ct_atlas_enemy_030.png',
        'groups': {
            'bodies': {
                'cellSize': body_meta['cellSize'],
                'primaryShoulderAnchor': body_meta['primaryShoulderAnchor'],
                'neckAnchor': body_meta['neckAnchor'],
                'variants': [
                    {
                        'id': f'body_{index:02d}',
                        'frame': f'body_{index:02d}',
                        'frameRect': frame,
                    }
                    for index, frame in enumerate(body_frames)
                ],
            },
            'heads': {
                'cellSize': head_meta['cellSize'],
                'neckAnchor': head_meta['anchor'],
                'variants': [
                    {
                        'id': f'head_{index:02d}',
                        'frame': f'head_{index:02d}',
                        'sourceIndex': index if index < 5 else index + 1,
                        'frameRect': frame,
                        'anchor': head_meta['localAnchors'][index],
                    }
                    for index, frame in enumerate(head_frames)
                ],
                'qaNotes': {
                    'scrapped': ['head_05'],
                    'note': 'The original top-right head was dropped from the shared-pivot variant list because it remained the least cooperative alignment subject during preprocessing review.',
                },
            },
            'limbs': {
                'rearArm': {'frame': 'arm_00'},
                'frontArm': {'frame': 'arm_01'},
                'rearLeg': {'frame': 'leg_00'},
                'frontLeg': {'frame': 'leg_01'},
            },
            'weapons': [{'frame': name} for name, _item, _tags in weapon_names],
        },
        'firstAssembly': {
            'body': 'body_00',
            'head': 'head_00',
            'rearArm': 'arm_00',
            'frontArm': 'arm_01',
            'rearLeg': 'leg_00',
            'frontLeg': 'leg_01',
            'weapon': 'sword',
        },
        'notes': [
            body_meta['notes'],
            'Heads use a common neck pivot. Bodies share one common extraction cell and one common first-pass shoulder/neck placement.',
            'This file is intended to be the future source for swapping body/head variants over the same shared limb rig.',
        ],
    }
    return atlas_manifest, parts_manifest


def build_rig() -> dict:
    rig = json.loads(SKELETON_RIG_JSON.read_text(encoding='utf-8'))
    rig['meta'] = {
        'version': 2,
        'note': 'Revision 368 fallback Human Raider rig matching the user-tuned pivots, draw order, and part scales.',
    }
    rig['rigId'] = 'ct_rig_enemy_030'
    rig['atlasId'] = 'ct_atlas_enemy_030'
    rig['atlasManifest'] = 'ct_atlas_enemy_030.json'
    rig['drawOrder'] = ['rightArm', 'leftLeg', 'rightLeg', 'torso', 'head', 'weapon', 'leftArm']
    rig['global'] = {
        'scale': 0.5,
        'lean': 0,
        'rootX': 0,
        'rootYOffsetFromGround': 0,
        'groundOffset': 0,
        'debugPivots': False,
    }
    rig['anchors'] = {
        'neck': {'x': 4, 'y': -296},
        'leftShoulder': {'x': -42, 'y': -276},
        'rightShoulder': {'x': 48, 'y': -280},
        'leftHand': {'x': -10, 'y': -158},
        'rightHand': {'x': 54, 'y': -152},
        'leftHip': {'x': -24, 'y': -168},
        'rightHip': {'x': 24, 'y': -168},
        'weaponGrip': {'x': 54, 'y': -152},
    }
    rig['pivots'] = {
        'leftArm': {'x': 0.355, 'y': 0.125},
        'leftLeg': {'x': 0.52, 'y': 0.04},
        'rightLeg': {'x': 0.52, 'y': 0.04},
        'torso': {'x': 0.5, 'y': 0.92},
        'head': {'x': 0.42, 'y': 0.885},
        'rightArm': {'x': 0.195, 'y': 0.11},
        'weapon': {'x': 0.066, 'y': 0.48},
    }
    rig['parts'] = {
        'leftArm': {
            'frame': 'arm_00',
            'role': 'leftArm',
            'tags': ['arm', 'rear', 'holder'],
            'offset': {'x': -36, 'y': -276},
            'scale': 1,
            'targetHeight': 176,
            'alpha': 1,
        },
        'leftLeg': {
            'frame': 'leg_00',
            'role': 'leftLeg',
            'tags': ['leg', 'rear'],
            'offset': {'x': -24, 'y': -168},
            'scale': 1,
            'targetHeight': 188,
            'alpha': 1,
        },
        'rightLeg': {
            'frame': 'leg_01',
            'role': 'rightLeg',
            'tags': ['leg', 'front'],
            'offset': {'x': 24, 'y': -168},
            'scale': 1,
            'targetHeight': 188,
            'alpha': 1,
        },
        'torso': {
            'frame': 'body_00',
            'role': 'torso',
            'tags': ['body', 'torso', 'human'],
            'offset': {'x': 0, 'y': -166},
            'scale': 1,
            'targetHeight': 182,
            'alpha': 1,
        },
        'head': {
            'frame': 'head_00',
            'role': 'head',
            'tags': ['head', 'human'],
            'offset': {'x': 4, 'y': -298},
            'scale': 1,
            'targetHeight': 140,
            'alpha': 1,
        },
        'rightArm': {
            'frame': 'arm_01',
            'role': 'rightArm',
            'tags': ['arm', 'front', 'weaponArm', 'holder'],
            'offset': {'x': 48, 'y': -280},
            'scale': 0.5,
            'targetHeight': 176,
            'alpha': 1,
        },
        'weapon': {
            'frame': 'sword',
            'role': 'weapon',
            'tags': ['weapon', 'equipment', 'held', 'sword'],
            'offset': {'x': 54, 'y': -152},
            'scale': 1,
            'targetHeight': 82,
            'alpha': 1,
        },
    }
    rig['attachments'] = {
        'weapon': {
            'holder': 'rightArm',
            'holderPoint': {'x': 0.72, 'y': 0.88},
            'equipmentPivot': {'x': 0.066, 'y': 0.48},
            'note': 'The human enemy uses the shared sword art for its first assembled melee variant. The pivot sits on the handle grip.',
        }
    }
    return rig


def build_character() -> dict:
    char = json.loads(SKELETON_CHAR_JSON.read_text(encoding='utf-8'))
    char['meta'] = {
        'version': 1,
        'note': 'Revision 365 first assembled modular human enemy. Uses body_00, head_00, shared limbs, and cloned base melee animations as a starting point.',
    }
    char['characterId'] = 'ct_char_enemy_030'
    char['displayName'] = 'Human Raider'
    char['rig'] = 'ct_rig_enemy_030.json'
    char['defaultFacing'] = 'right'
    char['mirrorable'] = True
    char['animationMap'] = {slot: path.name for slot, path in HUMAN_ANIMS.items()}
    return char


def build_animation(slot: str) -> dict:
    data = json.loads(SKELETON_ANIMS[slot].read_text(encoding='utf-8'))
    data['meta'] = {
        'version': 1,
        'note': f'Revision 365 initial human enemy {slot} animation. Cloned from Enemy 001 as a first assembly baseline and trimmed to the human rig parts.',
    }
    data['animationId'] = f'ct_anim_enemy_030_{slot}'

    # Drop shield and rename sword to weapon.
    if 'shield' in data['referencePose']:
        data['referencePose'].pop('shield', None)
    if 'sword' in data['referencePose']:
        data['referencePose']['weapon'] = data['referencePose'].pop('sword')
    data['tracks'].pop('shield', None)
    if 'sword' in data['tracks']:
        data['tracks']['weapon'] = data['tracks'].pop('sword')

    # Ensure every expected part exists in a stable order.
    ordered_pose_keys = ['leftArm', 'leftLeg', 'rightLeg', 'torso', 'head', 'weapon', 'rightArm']
    data['referencePose'] = {key: data['referencePose'][key] for key in ordered_pose_keys}
    data['tracks'] = {key: data['tracks'][key] for key in ordered_pose_keys}
    return data


def update_enemy_catalog() -> None:
    catalog = json.loads(ENEMIES_JSON.read_text(encoding='utf-8'))
    catalog['meta']['version'] = int(catalog['meta'].get('version', 0)) + 1
    catalog['meta']['revision'] = 368
    catalog['meta']['note'] = 'Revision 368 fallback Human Raider catalog entry matching the user-tuned runtime offset.'
    catalog['enemies']['enemy_030'] = {
        'label': 'Human Raider',
        'icon': '⚔',
        'characterId': 'ct_char_enemy_030',
        'defaultSize': {'w': 45, 'h': 118},
        'defaults': {
            'facing': -1,
            'patrolDistance': 250,
            'walkSpeed': 58,
            'idleDuration': 1.0,
            'turnPause': 0.46,
            'groundSnapDistance': 96,
            'maxStepHeight': 26,
            'maxDropDistance': 34,
            'renderScale': 0.82,
            'health': 95,
            'animationSlot': 'idle',
            'targetAnchor': {'x': 0.54, 'y': 0.38},
            'showTargetMarker': False,
            'attackDamage': 26,
            'attackRange': 72,
            'attackVerticalRange': 108,
            'attackDuration': 0.46,
            'attackHitTime': 0.35,
            'attackCooldown': 0.14,
            'attackKnockbackX': 340,
            'attackKnockbackY': -255,
            'awarenessRange': 820,
            'awarenessHoldDuration': 1.2,
            'attackLungeDistance': 22,
            'attackLungeSpeed': 190,
            'strategy': 'hunter',
            'runSpeed': 152,
            'jumpHeight': 196,
            'unreachableGlareDuration': 5,
            'awarenessViewHalfAngle': 60,
            'renderOffsetX': 0,
            'renderOffsetY': 34,
            'locomotion': 'ground',
            'jumpGravity': 1250,
            'maxFallDistance': 520,
            'routeRepathInterval': 0.34,
            'homeRetryInterval': 4,
        },
        'description': 'A first assembled modular human melee enemy based on the shared body/head atlas parts.',
    }
    ENEMIES_JSON.write_text(json.dumps(catalog, indent=2) + '\n', encoding='utf-8')


def main() -> None:
    atlas = load_atlas_rgba(ATLAS_PNG)
    groups = classify_components(detect_components(atlas))
    atlas_manifest, parts_manifest = build_atlas_manifest(groups)
    ATLAS_JSON.write_text(json.dumps(atlas_manifest, indent=2) + '\n', encoding='utf-8')
    # Modular assembly records are authored by build_human_enemy_variant.py.
    # Preserve them when regenerating atlas geometry from the PNG.
    if PARTS_JSON.exists():
        existing_parts = json.loads(PARTS_JSON.read_text(encoding='utf-8'))
        if isinstance(existing_parts.get('assemblies'), dict):
            parts_manifest['assemblies'] = existing_parts['assemblies']
    PARTS_JSON.write_text(json.dumps(parts_manifest, indent=2) + '\n', encoding='utf-8')

    # Rig, idle, and catalog are user-tuned authoring files. Preserve them on
    # regeneration; only create fallbacks when a clean checkout lacks them.
    if not RIG_JSON.exists():
        RIG_JSON.write_text(json.dumps(build_rig(), indent=4) + '\n', encoding='utf-8')
    if not CHAR_JSON.exists():
        CHAR_JSON.write_text(json.dumps(build_character(), indent=4) + '\n', encoding='utf-8')
    if not HUMAN_ANIMS['idle'].exists():
        raise FileNotFoundError('ct_anim_enemy_030_idle.json is the canonical user-authored pose and must exist.')

    # Existing animation files are authored content. Never rewrite them during
    # atlas regeneration. Only create a missing clip and retarget that new
    # fallback to the canonical idle pose.
    from retarget_enemy_030_animations import canonical_pose, retarget_clip
    idle = json.loads(HUMAN_ANIMS['idle'].read_text(encoding='utf-8'))
    pose = canonical_pose(idle)
    for slot, path in HUMAN_ANIMS.items():
        if slot == 'idle' or path.exists():
            continue
        clip = build_animation(slot)
        clip = retarget_clip(clip, pose, 368)
        path.write_text(json.dumps(clip, indent=4) + '\n', encoding='utf-8')

    if not ENEMIES_JSON.exists():
        raise FileNotFoundError('ct_enemies_001.json is a user-tuned catalog file and must exist.')


if __name__ == '__main__':
    main()
