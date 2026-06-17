const FIXED_DRAW_ORDER = [
    "leftArm",
    "leftFoot",
    "rocket",
    "rightFoot",
    "robe",
    "head",
    "hat",
    "rightArm"
];

const ASSET_CANDIDATES = {
    hat: ["assets/wizard_hat.png", "wizard_hat.png"],
    head: ["assets/wizard_head.png", "wizard_head.png"],
    robe: ["assets/wizard_robe.png", "wizard_robe.png"],
    leftArm: ["assets/wizard_left_arm.png", "wizard_left_arm.png"],
    rightArm: ["assets/wizard_right_arm.png", "wizard_right_arm.png"],
    leftFoot: ["assets/wizard_left_foot.png", "wizard_left_foot.png"],
    rightFoot: ["assets/wizard_right_foot.png", "wizard_right_foot.png"],
    rocket: ["assets/wizard_rocket.png", "wizard_rocket.png"]
};


const FALLBACK_ATLAS_001_MANIFEST = {
    "meta": {
        "version": 4,
        "note": "Cave/ruin atlas. Cyan boxes identify visual islands/assets. Nodes and lines are local to each box."
    },
    "atlasId": "atlas_001",
    "image": "atlas_001.png",
    "frames": {
        "ledge_left_chunk": {
            "x": 56,
            "y": 60,
            "w": 191,
            "h": 124
        },
        "ledge_flat_long_a": {
            "x": 268,
            "y": 84,
            "w": 290,
            "h": 88
        },
        "ledge_flat_long_b": {
            "x": 576,
            "y": 84,
            "w": 335,
            "h": 89
        },
        "ledge_blue_crystals": {
            "x": 927,
            "y": 85,
            "w": 322,
            "h": 90
        },
        "ledge_mossy_left": {
            "x": 43,
            "y": 204,
            "w": 275,
            "h": 116
        },
        "ledge_mossy_right": {
            "x": 1148,
            "y": 204,
            "w": 343,
            "h": 123
        },
        "ledge_flat_mid": {
            "x": 625,
            "y": 210,
            "w": 264,
            "h": 94
        },
        "ledge_purple_crystals": {
            "x": 896,
            "y": 208,
            "w": 238,
            "h": 103
        },
        "ledge_small_round": {
            "x": 50,
            "y": 473,
            "w": 174,
            "h": 65
        },
        "ledge_small_flat": {
            "x": 179,
            "y": 346,
            "w": 156,
            "h": 59
        },
        "ruin_stairs": {
            "x": 1100,
            "y": 333,
            "w": 160,
            "h": 112
        },
        "hanging_ledge": {
            "x": 1286,
            "y": 363,
            "w": 196,
            "h": 134
        },
        "rubble_skull": {
            "x": 366,
            "y": 459,
            "w": 261,
            "h": 67
        },
        "rubble_long": {
            "x": 648,
            "y": 479,
            "w": 278,
            "h": 41
        },
        "floor_big_moss": {
            "x": 43,
            "y": 559,
            "w": 290,
            "h": 142
        },
        "pillar_broken": {
            "x": 831,
            "y": 541,
            "w": 126,
            "h": 225
        },
        "pillar_plain": {
            "x": 351,
            "y": 552,
            "w": 131,
            "h": 207
        },
        "arch_ruin": {
            "x": 970,
            "y": 566,
            "w": 407,
            "h": 206
        },
        "floor_long_terrace": {
            "x": 35,
            "y": 713,
            "w": 744,
            "h": 162
        },
        "floor_cold_platform": {
            "x": 794,
            "y": 789,
            "w": 336,
            "h": 85
        },
        "floor_hanging_right": {
            "x": 1151,
            "y": 788,
            "w": 351,
            "h": 121
        },
        "floor_mossy_low": {
            "x": 47,
            "y": 889,
            "w": 342,
            "h": 88
        },
        "wood_barrier_low": {
            "x": 520,
            "y": 898,
            "w": 174,
            "h": 77
        },
        "wood_spikes_low": {
            "x": 705,
            "y": 893,
            "w": 227,
            "h": 82
        },
        "skull_pile_small": {
            "x": 950,
            "y": 904,
            "w": 128,
            "h": 72
        },
        "lantern_gold_small": {
            "x": 652,
            "y": 329,
            "w": 46,
            "h": 108
        },
        "lantern_silver_tall": {
            "x": 835,
            "y": 337,
            "w": 50,
            "h": 117
        },
        "ledge_flat_mid_2": {
            "x": 328,
            "y": 207,
            "w": 286,
            "h": 100
        },
        "pillar_fancy": {
            "x": 663,
            "y": 548,
            "w": 154,
            "h": 208
        },
        "object_032": {
            "x": 345,
            "y": 344,
            "w": 140,
            "h": 88
        },
        "object_033": {
            "x": 495,
            "y": 351,
            "w": 143,
            "h": 82
        },
        "ledge_right_chunk": {
            "x": 1268,
            "y": 52,
            "w": 223,
            "h": 136
        },
        "object_034": {
            "x": 945,
            "y": 475,
            "w": 247,
            "h": 54
        },
        "object_035": {
            "x": 1372,
            "y": 515,
            "w": 134,
            "h": 245
        },
        "object_036": {
            "x": 498,
            "y": 540,
            "w": 158,
            "h": 231
        }
    },
    "objects": {
        "ledge_left_chunk": {
            "id": "ledge_left_chunk",
            "frame": "ledge_left_chunk",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 12,
                    "y": 39
                },
                {
                    "id": "n2",
                    "x": 175,
                    "y": 11
                },
                {
                    "id": "n3",
                    "x": 102,
                    "y": 55
                },
                {
                    "id": "n4",
                    "x": 15,
                    "y": 38
                },
                {
                    "id": "n5",
                    "x": 20,
                    "y": 101
                },
                {
                    "id": "n6",
                    "x": 66,
                    "y": 118
                },
                {
                    "id": "n7",
                    "x": 115,
                    "y": 115
                },
                {
                    "id": "n8",
                    "x": 133,
                    "y": 95
                },
                {
                    "id": "n9",
                    "x": 113,
                    "y": 75
                },
                {
                    "id": "n10",
                    "x": 13,
                    "y": 59
                }
            ],
            "lines": [
                {
                    "id": "walkable_1",
                    "kind": "walkable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n1",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n1",
                    "tags": []
                }
            ]
        },
        "ledge_flat_long_a": {
            "id": "ledge_flat_long_a",
            "frame": "ledge_flat_long_a",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n2",
                    "x": 273,
                    "y": 14
                },
                {
                    "id": "n3",
                    "x": 8,
                    "y": 18
                },
                {
                    "id": "n4",
                    "x": 31,
                    "y": 69
                },
                {
                    "id": "n5",
                    "x": 253,
                    "y": 77
                },
                {
                    "id": "n6",
                    "x": 281,
                    "y": 60
                },
                {
                    "id": "n7",
                    "x": 185,
                    "y": 62
                },
                {
                    "id": "n8",
                    "x": 161,
                    "y": 80
                },
                {
                    "id": "n9",
                    "x": 112,
                    "y": 78
                },
                {
                    "id": "n10",
                    "x": 70,
                    "y": 70
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "ledge_flat_long_b": {
            "id": "ledge_flat_long_b",
            "frame": "ledge_flat_long_b",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 18,
                    "y": 16
                },
                {
                    "id": "n2",
                    "x": 319,
                    "y": 15
                },
                {
                    "id": "n3",
                    "x": 4,
                    "y": 25
                },
                {
                    "id": "n4",
                    "x": 11,
                    "y": 70
                },
                {
                    "id": "n5",
                    "x": 56,
                    "y": 75
                },
                {
                    "id": "n6",
                    "x": 86,
                    "y": 74
                },
                {
                    "id": "n7",
                    "x": 143,
                    "y": 77
                },
                {
                    "id": "n8",
                    "x": 176,
                    "y": 58
                },
                {
                    "id": "n9",
                    "x": 218,
                    "y": 78
                },
                {
                    "id": "n10",
                    "x": 246,
                    "y": 65
                },
                {
                    "id": "n11",
                    "x": 262,
                    "y": 80
                },
                {
                    "id": "n12",
                    "x": 295,
                    "y": 70
                },
                {
                    "id": "n13",
                    "x": 318,
                    "y": 74
                },
                {
                    "id": "n14",
                    "x": 322,
                    "y": 43
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_13",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n14",
                    "tags": []
                },
                {
                    "id": "blockable_14",
                    "kind": "blockable",
                    "from": "n14",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "ledge_blue_crystals": {
            "id": "ledge_blue_crystals",
            "frame": "ledge_blue_crystals",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 26,
                    "y": 14
                },
                {
                    "id": "n2",
                    "x": 300,
                    "y": 15
                },
                {
                    "id": "n3",
                    "x": 9,
                    "y": 23
                },
                {
                    "id": "n4",
                    "x": 8,
                    "y": 60
                },
                {
                    "id": "n5",
                    "x": 38,
                    "y": 77
                },
                {
                    "id": "n6",
                    "x": 104,
                    "y": 82
                },
                {
                    "id": "n7",
                    "x": 144,
                    "y": 74
                },
                {
                    "id": "n8",
                    "x": 172,
                    "y": 84
                },
                {
                    "id": "n9",
                    "x": 207,
                    "y": 71
                },
                {
                    "id": "n10",
                    "x": 234,
                    "y": 79
                },
                {
                    "id": "n11",
                    "x": 284,
                    "y": 75
                },
                {
                    "id": "n12",
                    "x": 315,
                    "y": 73
                },
                {
                    "id": "n13",
                    "x": 320,
                    "y": 37
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_13",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "ledge_mossy_left": {
            "id": "ledge_mossy_left",
            "frame": "ledge_mossy_left",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 24,
                    "y": 37
                },
                {
                    "id": "n3",
                    "x": 9,
                    "y": 44
                },
                {
                    "id": "n4",
                    "x": 25,
                    "y": 91
                },
                {
                    "id": "n5",
                    "x": 76,
                    "y": 90
                },
                {
                    "id": "n6",
                    "x": 116,
                    "y": 107
                },
                {
                    "id": "n7",
                    "x": 159,
                    "y": 109
                },
                {
                    "id": "n8",
                    "x": 184,
                    "y": 96
                },
                {
                    "id": "n10",
                    "x": 185,
                    "y": 71
                },
                {
                    "id": "n11",
                    "x": 221,
                    "y": 68
                },
                {
                    "id": "n12",
                    "x": 246,
                    "y": 61
                },
                {
                    "id": "n13",
                    "x": 265,
                    "y": 32
                },
                {
                    "id": "n14",
                    "x": 261,
                    "y": 7
                }
            ],
            "lines": [
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n14",
                    "tags": []
                },
                {
                    "id": "blockable_13",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n14",
                    "tags": []
                }
            ]
        },
        "ledge_mossy_right": {
            "id": "ledge_mossy_right",
            "frame": "ledge_mossy_right",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 23,
                    "y": 10
                },
                {
                    "id": "n2",
                    "x": 154,
                    "y": 16
                },
                {
                    "id": "n3",
                    "x": 319,
                    "y": 40
                },
                {
                    "id": "n4",
                    "x": 7,
                    "y": 17
                },
                {
                    "id": "n5",
                    "x": 27,
                    "y": 69
                },
                {
                    "id": "n6",
                    "x": 93,
                    "y": 84
                },
                {
                    "id": "n8",
                    "x": 145,
                    "y": 108
                },
                {
                    "id": "n9",
                    "x": 226,
                    "y": 112
                },
                {
                    "id": "n10",
                    "x": 260,
                    "y": 112
                },
                {
                    "id": "n11",
                    "x": 303,
                    "y": 96
                },
                {
                    "id": "n12",
                    "x": 332,
                    "y": 90
                },
                {
                    "id": "n13",
                    "x": 338,
                    "y": 43
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_13",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n3",
                    "tags": []
                }
            ]
        },
        "ledge_flat_mid": {
            "id": "ledge_flat_mid",
            "frame": "ledge_flat_mid",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 13,
                    "y": 12
                },
                {
                    "id": "n2",
                    "x": 251,
                    "y": 14
                },
                {
                    "id": "n3",
                    "x": 11,
                    "y": 23
                },
                {
                    "id": "n4",
                    "x": 24,
                    "y": 75
                },
                {
                    "id": "n5",
                    "x": 41,
                    "y": 57
                },
                {
                    "id": "n6",
                    "x": 67,
                    "y": 86
                },
                {
                    "id": "n7",
                    "x": 80,
                    "y": 77
                },
                {
                    "id": "n8",
                    "x": 120,
                    "y": 86
                },
                {
                    "id": "n9",
                    "x": 128,
                    "y": 59
                },
                {
                    "id": "n10",
                    "x": 141,
                    "y": 79
                },
                {
                    "id": "n11",
                    "x": 156,
                    "y": 59
                },
                {
                    "id": "n12",
                    "x": 180,
                    "y": 88
                },
                {
                    "id": "n13",
                    "x": 217,
                    "y": 75
                },
                {
                    "id": "n14",
                    "x": 241,
                    "y": 69
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_13",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n14",
                    "tags": []
                },
                {
                    "id": "blockable_14",
                    "kind": "blockable",
                    "from": "n14",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "ledge_purple_crystals": {
            "id": "ledge_purple_crystals",
            "frame": "ledge_purple_crystals",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 11,
                    "y": 21
                },
                {
                    "id": "n2",
                    "x": 232,
                    "y": 18
                },
                {
                    "id": "n3",
                    "x": 225,
                    "y": 57
                },
                {
                    "id": "n4",
                    "x": 196,
                    "y": 85
                },
                {
                    "id": "n5",
                    "x": 150,
                    "y": 94
                },
                {
                    "id": "n6",
                    "x": 92,
                    "y": 98
                },
                {
                    "id": "n7",
                    "x": 51,
                    "y": 84
                },
                {
                    "id": "n8",
                    "x": 13,
                    "y": 86
                },
                {
                    "id": "n9",
                    "x": 6,
                    "y": 43
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n1",
                    "tags": []
                }
            ]
        },
        "ledge_small_round": {
            "id": "ledge_small_round",
            "frame": "ledge_small_round",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 28,
                    "y": 22
                },
                {
                    "id": "n2",
                    "x": 150,
                    "y": 12
                },
                {
                    "id": "n3",
                    "x": 16,
                    "y": 52
                },
                {
                    "id": "n4",
                    "x": 96,
                    "y": 55
                },
                {
                    "id": "n5",
                    "x": 155,
                    "y": 54
                },
                {
                    "id": "n6",
                    "x": 165,
                    "y": 29
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "ledge_small_flat": {
            "id": "ledge_small_flat",
            "frame": "ledge_small_flat",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 22,
                    "y": 25
                },
                {
                    "id": "n2",
                    "x": 135,
                    "y": 29
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "ruin_stairs": {
            "id": "ruin_stairs",
            "frame": "ruin_stairs",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 28,
                    "y": 8
                },
                {
                    "id": "n3",
                    "x": 15,
                    "y": 19
                },
                {
                    "id": "n4",
                    "x": 19,
                    "y": 69
                },
                {
                    "id": "n5",
                    "x": 33,
                    "y": 96
                },
                {
                    "id": "n6",
                    "x": 74,
                    "y": 96
                },
                {
                    "id": "n7",
                    "x": 126,
                    "y": 98
                },
                {
                    "id": "n8",
                    "x": 153,
                    "y": 75
                },
                {
                    "id": "n9",
                    "x": 153,
                    "y": 58
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n1",
                    "tags": []
                }
            ]
        },
        "hanging_ledge": {
            "id": "hanging_ledge",
            "frame": "hanging_ledge",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 13,
                    "y": 13
                },
                {
                    "id": "n2",
                    "x": 183,
                    "y": 13
                },
                {
                    "id": "n3",
                    "x": 12,
                    "y": 61
                },
                {
                    "id": "n4",
                    "x": 55,
                    "y": 81
                },
                {
                    "id": "n5",
                    "x": 100,
                    "y": 88
                },
                {
                    "id": "n6",
                    "x": 136,
                    "y": 108
                },
                {
                    "id": "n7",
                    "x": 178,
                    "y": 124
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "rubble_skull": {
            "id": "rubble_skull",
            "frame": "rubble_skull",
            "type": "decor",
            "layer": "decorFront",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 26,
                    "y": 34
                },
                {
                    "id": "n2",
                    "x": 234,
                    "y": 36
                },
                {
                    "id": "n3",
                    "x": 9,
                    "y": 53
                },
                {
                    "id": "n4",
                    "x": 62,
                    "y": 54
                },
                {
                    "id": "n5",
                    "x": 149,
                    "y": 60
                },
                {
                    "id": "n6",
                    "x": 212,
                    "y": 63
                },
                {
                    "id": "n7",
                    "x": 254,
                    "y": 41
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "rubble_long": {
            "id": "rubble_long",
            "frame": "rubble_long",
            "type": "decor",
            "layer": "decorFront",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 20,
                    "y": 20
                },
                {
                    "id": "n2",
                    "x": 264,
                    "y": 21
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "floor_big_moss": {
            "id": "floor_big_moss",
            "frame": "floor_big_moss",
            "type": "floor",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 12,
                    "y": 16
                },
                {
                    "id": "n2",
                    "x": 279,
                    "y": 22
                },
                {
                    "id": "n3",
                    "x": 133,
                    "y": 25
                },
                {
                    "id": "n4",
                    "x": 17,
                    "y": 120
                },
                {
                    "id": "n5",
                    "x": 59,
                    "y": 81
                },
                {
                    "id": "n6",
                    "x": 79,
                    "y": 126
                },
                {
                    "id": "n7",
                    "x": 95,
                    "y": 110
                },
                {
                    "id": "n8",
                    "x": 113,
                    "y": 120
                },
                {
                    "id": "n9",
                    "x": 131,
                    "y": 130
                },
                {
                    "id": "n10",
                    "x": 143,
                    "y": 109
                },
                {
                    "id": "n11",
                    "x": 166,
                    "y": 134
                },
                {
                    "id": "n12",
                    "x": 196,
                    "y": 92
                },
                {
                    "id": "n13",
                    "x": 237,
                    "y": 110
                },
                {
                    "id": "n14",
                    "x": 265,
                    "y": 114
                },
                {
                    "id": "n15",
                    "x": 277,
                    "y": 73
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n15",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n1",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_13",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_14",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n14",
                    "tags": []
                },
                {
                    "id": "blockable_15",
                    "kind": "blockable",
                    "from": "n14",
                    "to": "n15",
                    "tags": []
                }
            ]
        },
        "pillar_broken": {
            "id": "pillar_broken",
            "frame": "pillar_broken",
            "type": "pillar",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 18,
                    "y": 12
                },
                {
                    "id": "n2",
                    "x": 103,
                    "y": 15
                },
                {
                    "id": "n3",
                    "x": 114,
                    "y": 135
                },
                {
                    "id": "n4",
                    "x": 122,
                    "y": 212
                },
                {
                    "id": "n5",
                    "x": 50,
                    "y": 220
                },
                {
                    "id": "n6",
                    "x": 11,
                    "y": 208
                },
                {
                    "id": "n7",
                    "x": 8,
                    "y": 173
                },
                {
                    "id": "n8",
                    "x": 24,
                    "y": 151
                },
                {
                    "id": "n9",
                    "x": 25,
                    "y": 95
                },
                {
                    "id": "n10",
                    "x": 15,
                    "y": 52
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n1",
                    "tags": []
                }
            ]
        },
        "pillar_plain": {
            "id": "pillar_plain",
            "frame": "pillar_plain",
            "type": "pillar",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 24,
                    "y": 8
                },
                {
                    "id": "n2",
                    "x": 104,
                    "y": 10
                },
                {
                    "id": "n3",
                    "x": 102,
                    "y": 41
                },
                {
                    "id": "n4",
                    "x": 104,
                    "y": 144
                },
                {
                    "id": "n5",
                    "x": 120,
                    "y": 163
                },
                {
                    "id": "n6",
                    "x": 121,
                    "y": 189
                },
                {
                    "id": "n7",
                    "x": 43,
                    "y": 197
                },
                {
                    "id": "n8",
                    "x": 5,
                    "y": 179
                },
                {
                    "id": "n9",
                    "x": 23,
                    "y": 143
                },
                {
                    "id": "n10",
                    "x": 24,
                    "y": 32
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n1",
                    "tags": []
                }
            ]
        },
        "arch_ruin": {
            "id": "arch_ruin",
            "frame": "arch_ruin",
            "type": "decor",
            "layer": "decorFront",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 66,
                    "y": 178
                },
                {
                    "id": "n2",
                    "x": 328,
                    "y": 179
                },
                {
                    "id": "n3",
                    "x": 15,
                    "y": 43
                },
                {
                    "id": "n4",
                    "x": 69,
                    "y": 25
                },
                {
                    "id": "n5",
                    "x": 137,
                    "y": 10
                },
                {
                    "id": "n6",
                    "x": 216,
                    "y": 12
                },
                {
                    "id": "n7",
                    "x": 276,
                    "y": 28
                },
                {
                    "id": "n8",
                    "x": 319,
                    "y": 56
                },
                {
                    "id": "n9",
                    "x": 361,
                    "y": 78
                },
                {
                    "id": "n10",
                    "x": 389,
                    "y": 175
                },
                {
                    "id": "n11",
                    "x": 126,
                    "y": 179
                },
                {
                    "id": "n12",
                    "x": 222,
                    "y": 181
                },
                {
                    "id": "n13",
                    "x": 292,
                    "y": 188
                },
                {
                    "id": "n14",
                    "x": 25,
                    "y": 175
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n1",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n14",
                    "to": "n1",
                    "tags": []
                }
            ]
        },
        "floor_long_terrace": {
            "id": "floor_long_terrace",
            "frame": "floor_long_terrace",
            "type": "floor",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 10,
                    "y": 13
                },
                {
                    "id": "n2",
                    "x": 268,
                    "y": 15
                },
                {
                    "id": "n3",
                    "x": 205,
                    "y": 86
                },
                {
                    "id": "n4",
                    "x": 724,
                    "y": 89
                },
                {
                    "id": "n5",
                    "x": 24,
                    "y": 125
                },
                {
                    "id": "n6",
                    "x": 181,
                    "y": 137
                },
                {
                    "id": "n7",
                    "x": 346,
                    "y": 155
                },
                {
                    "id": "n8",
                    "x": 570,
                    "y": 151
                },
                {
                    "id": "n9",
                    "x": 659,
                    "y": 150
                },
                {
                    "id": "n10",
                    "x": 704,
                    "y": 149
                },
                {
                    "id": "n11",
                    "x": 730,
                    "y": 120
                },
                {
                    "id": "n12",
                    "x": 198,
                    "y": 20
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "walkable_10",
                    "kind": "walkable",
                    "from": "n2",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "walkable_11",
                    "kind": "walkable",
                    "from": "n12",
                    "to": "n1",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n5",
                    "tags": []
                }
            ]
        },
        "floor_cold_platform": {
            "id": "floor_cold_platform",
            "frame": "floor_cold_platform",
            "type": "floor",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 7,
                    "y": 12
                },
                {
                    "id": "n2",
                    "x": 330,
                    "y": 13
                },
                {
                    "id": "n3",
                    "x": 6,
                    "y": 11
                },
                {
                    "id": "n4",
                    "x": 25,
                    "y": 66
                },
                {
                    "id": "n5",
                    "x": 98,
                    "y": 72
                },
                {
                    "id": "n6",
                    "x": 137,
                    "y": 78
                },
                {
                    "id": "n7",
                    "x": 175,
                    "y": 75
                },
                {
                    "id": "n8",
                    "x": 222,
                    "y": 66
                },
                {
                    "id": "n9",
                    "x": 255,
                    "y": 78
                },
                {
                    "id": "n10",
                    "x": 307,
                    "y": 63
                },
                {
                    "id": "n11",
                    "x": 330,
                    "y": 47
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n1",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                }
            ]
        },
        "floor_hanging_right": {
            "id": "floor_hanging_right",
            "frame": "floor_hanging_right",
            "type": "floor",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 4,
                    "y": 12
                },
                {
                    "id": "n2",
                    "x": 325,
                    "y": 12
                },
                {
                    "id": "n3",
                    "x": 64,
                    "y": 66
                },
                {
                    "id": "n4",
                    "x": 138,
                    "y": 62
                },
                {
                    "id": "n5",
                    "x": 198,
                    "y": 76
                },
                {
                    "id": "n6",
                    "x": 273,
                    "y": 111
                },
                {
                    "id": "n7",
                    "x": 318,
                    "y": 97
                },
                {
                    "id": "n8",
                    "x": 330,
                    "y": 59
                },
                {
                    "id": "n9",
                    "x": 238,
                    "y": 84
                },
                {
                    "id": "n10",
                    "x": 256,
                    "y": 73
                },
                {
                    "id": "n11",
                    "x": 107,
                    "y": 64
                },
                {
                    "id": "n12",
                    "x": 21,
                    "y": 58
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n1",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n1",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n12",
                    "tags": []
                }
            ]
        },
        "floor_mossy_low": {
            "id": "floor_mossy_low",
            "frame": "floor_mossy_low",
            "type": "floor",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 9,
                    "y": 12
                },
                {
                    "id": "n2",
                    "x": 305,
                    "y": 13
                },
                {
                    "id": "n3",
                    "x": 8,
                    "y": 11
                },
                {
                    "id": "n4",
                    "x": 18,
                    "y": 65
                },
                {
                    "id": "n5",
                    "x": 68,
                    "y": 71
                },
                {
                    "id": "n6",
                    "x": 119,
                    "y": 70
                },
                {
                    "id": "n7",
                    "x": 178,
                    "y": 75
                },
                {
                    "id": "n8",
                    "x": 237,
                    "y": 80
                },
                {
                    "id": "n9",
                    "x": 299,
                    "y": 79
                },
                {
                    "id": "n10",
                    "x": 333,
                    "y": 66
                },
                {
                    "id": "n11",
                    "x": 333,
                    "y": 40
                },
                {
                    "id": "n12",
                    "x": 309,
                    "y": 30
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n1",
                    "tags": []
                }
            ]
        },
        "wood_barrier_low": {
            "id": "wood_barrier_low",
            "frame": "wood_barrier_low",
            "type": "barrier",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 13,
                    "y": 13
                },
                {
                    "id": "n2",
                    "x": 153,
                    "y": 14
                },
                {
                    "id": "n3",
                    "x": 159,
                    "y": 62
                },
                {
                    "id": "n4",
                    "x": 73,
                    "y": 63
                },
                {
                    "id": "n5",
                    "x": 7,
                    "y": 68
                }
            ],
            "lines": [
                {
                    "id": "damaging_1",
                    "kind": "damaging",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "wood_spikes_low": {
            "id": "wood_spikes_low",
            "frame": "wood_spikes_low",
            "type": "barrier",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 13,
                    "y": 22
                },
                {
                    "id": "n2",
                    "x": 214,
                    "y": 16
                },
                {
                    "id": "n3",
                    "x": 210,
                    "y": 69
                },
                {
                    "id": "n4",
                    "x": 96,
                    "y": 75
                },
                {
                    "id": "n5",
                    "x": 14,
                    "y": 72
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "damaging_5",
                    "kind": "damaging",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "skull_pile_small": {
            "id": "skull_pile_small",
            "frame": "skull_pile_small",
            "type": "decor",
            "layer": "decorFront",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [],
            "lines": []
        },
        "lantern_gold_small": {
            "id": "lantern_gold_small",
            "frame": "lantern_gold_small",
            "type": "decor",
            "layer": "decorFront",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [],
            "lines": []
        },
        "lantern_silver_tall": {
            "id": "lantern_silver_tall",
            "frame": "lantern_silver_tall",
            "type": "decor",
            "layer": "decorFront",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [],
            "lines": []
        },
        "ledge_flat_mid_2": {
            "id": "ledge_flat_mid_2",
            "frame": "ledge_flat_mid_2",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 14,
                    "y": 17
                },
                {
                    "id": "n2",
                    "x": 270,
                    "y": 17
                },
                {
                    "id": "n3",
                    "x": 16,
                    "y": 31
                },
                {
                    "id": "n4",
                    "x": 32,
                    "y": 88
                },
                {
                    "id": "n5",
                    "x": 47,
                    "y": 69
                },
                {
                    "id": "n6",
                    "x": 54,
                    "y": 80
                },
                {
                    "id": "n7",
                    "x": 74,
                    "y": 48
                },
                {
                    "id": "n8",
                    "x": 80,
                    "y": 80
                },
                {
                    "id": "n9",
                    "x": 98,
                    "y": 61
                },
                {
                    "id": "n10",
                    "x": 121,
                    "y": 81
                },
                {
                    "id": "n12",
                    "x": 159,
                    "y": 73
                },
                {
                    "id": "n13",
                    "x": 183,
                    "y": 86
                },
                {
                    "id": "n14",
                    "x": 200,
                    "y": 75
                },
                {
                    "id": "n15",
                    "x": 231,
                    "y": 80
                },
                {
                    "id": "n16",
                    "x": 250,
                    "y": 88
                },
                {
                    "id": "n17",
                    "x": 264,
                    "y": 64
                },
                {
                    "id": "n18",
                    "x": 272,
                    "y": 33
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n14",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n14",
                    "to": "n15",
                    "tags": []
                },
                {
                    "id": "blockable_13",
                    "kind": "blockable",
                    "from": "n15",
                    "to": "n16",
                    "tags": []
                },
                {
                    "id": "blockable_14",
                    "kind": "blockable",
                    "from": "n16",
                    "to": "n17",
                    "tags": []
                },
                {
                    "id": "blockable_15",
                    "kind": "blockable",
                    "from": "n17",
                    "to": "n18",
                    "tags": []
                },
                {
                    "id": "blockable_16",
                    "kind": "blockable",
                    "from": "n18",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "pillar_fancy": {
            "id": "pillar_fancy",
            "frame": "pillar_fancy",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 26,
                    "y": 13
                },
                {
                    "id": "n2",
                    "x": 141,
                    "y": 12
                },
                {
                    "id": "n3",
                    "x": 141,
                    "y": 47
                },
                {
                    "id": "n4",
                    "x": 116,
                    "y": 51
                },
                {
                    "id": "n5",
                    "x": 117,
                    "y": 157
                },
                {
                    "id": "n6",
                    "x": 141,
                    "y": 179
                },
                {
                    "id": "n7",
                    "x": 135,
                    "y": 196
                },
                {
                    "id": "n8",
                    "x": 23,
                    "y": 193
                },
                {
                    "id": "n9",
                    "x": 39,
                    "y": 161
                },
                {
                    "id": "n10",
                    "x": 39,
                    "y": 59
                },
                {
                    "id": "n11",
                    "x": 21,
                    "y": 47
                },
                {
                    "id": "n12",
                    "x": 24,
                    "y": 25
                },
                {
                    "id": "n13",
                    "x": 21,
                    "y": 174
                },
                {
                    "id": "n14",
                    "x": 81,
                    "y": 203
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n1",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n14",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n14",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_13",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n10",
                    "tags": []
                }
            ]
        },
        "object_032": {
            "id": "object_032",
            "frame": "object_032",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [],
            "lines": []
        },
        "object_033": {
            "id": "object_033",
            "frame": "object_033",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [],
            "lines": []
        },
        "ledge_right_chunk": {
            "id": "ledge_right_chunk",
            "frame": "ledge_right_chunk",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 33,
                    "y": 12
                },
                {
                    "id": "n2",
                    "x": 186,
                    "y": 47
                },
                {
                    "id": "n3",
                    "x": 97,
                    "y": 68
                },
                {
                    "id": "n4",
                    "x": 98,
                    "y": 123
                },
                {
                    "id": "n5",
                    "x": 143,
                    "y": 119
                },
                {
                    "id": "n6",
                    "x": 181,
                    "y": 108
                },
                {
                    "id": "n7",
                    "x": 217,
                    "y": 70
                },
                {
                    "id": "n8",
                    "x": 77,
                    "y": 108
                },
                {
                    "id": "n9",
                    "x": 86,
                    "y": 84
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "walkable_2",
                    "kind": "walkable",
                    "from": "n2",
                    "to": "n1",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n2",
                    "tags": []
                }
            ]
        },
        "object_034": {
            "id": "object_034",
            "frame": "object_034",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 9,
                    "y": 18
                },
                {
                    "id": "n2",
                    "x": 239,
                    "y": 32
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n1",
                    "tags": []
                }
            ]
        },
        "object_035": {
            "id": "object_035",
            "frame": "object_035",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 19,
                    "y": 14
                },
                {
                    "id": "n2",
                    "x": 20,
                    "y": 224
                },
                {
                    "id": "n3",
                    "x": 109,
                    "y": 224
                },
                {
                    "id": "n4",
                    "x": 107,
                    "y": 13
                },
                {
                    "id": "n5",
                    "x": 99,
                    "y": 53
                },
                {
                    "id": "n6",
                    "x": 100,
                    "y": 119
                },
                {
                    "id": "n7",
                    "x": 108,
                    "y": 161
                },
                {
                    "id": "n8",
                    "x": 113,
                    "y": 199
                },
                {
                    "id": "n9",
                    "x": 64,
                    "y": 239
                },
                {
                    "id": "n10",
                    "x": 14,
                    "y": 193
                },
                {
                    "id": "n11",
                    "x": 21,
                    "y": 136
                },
                {
                    "id": "n12",
                    "x": 22,
                    "y": 79
                },
                {
                    "id": "n13",
                    "x": 21,
                    "y": 38
                },
                {
                    "id": "n14",
                    "x": 67,
                    "y": 12
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n14",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n14",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n6",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n6",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n10",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n10",
                    "to": "n11",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n11",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_13",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_14",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n1",
                    "tags": []
                }
            ]
        },
        "object_036": {
            "id": "object_036",
            "frame": "object_036",
            "type": "platform",
            "layer": "terrain",
            "mirrorable": true,
            "defaultScale": 1,
            "pivot": {
                "x": 0.5,
                "y": 1
            },
            "destroyable": false,
            "targetableByRocket": false,
            "destroy": {
                "hp": 1,
                "explosionRadius": 64,
                "fadeToBlackSeconds": 0.18,
                "removeAfterSeconds": 0.22
            },
            "tags": [],
            "notes": "",
            "nodes": [
                {
                    "id": "n1",
                    "x": 24,
                    "y": 18
                },
                {
                    "id": "n2",
                    "x": 140,
                    "y": 19
                },
                {
                    "id": "n3",
                    "x": 142,
                    "y": 39
                },
                {
                    "id": "n4",
                    "x": 127,
                    "y": 62
                },
                {
                    "id": "n5",
                    "x": 124,
                    "y": 164
                },
                {
                    "id": "n7",
                    "x": 27,
                    "y": 36
                },
                {
                    "id": "n8",
                    "x": 42,
                    "y": 65
                },
                {
                    "id": "n9",
                    "x": 41,
                    "y": 161
                },
                {
                    "id": "n12",
                    "x": 30,
                    "y": 208
                },
                {
                    "id": "n13",
                    "x": 86,
                    "y": 216
                },
                {
                    "id": "n14",
                    "x": 137,
                    "y": 206
                },
                {
                    "id": "n15",
                    "x": 141,
                    "y": 176
                }
            ],
            "lines": [
                {
                    "id": "blockable_1",
                    "kind": "blockable",
                    "from": "n1",
                    "to": "n2",
                    "tags": []
                },
                {
                    "id": "blockable_2",
                    "kind": "blockable",
                    "from": "n2",
                    "to": "n3",
                    "tags": []
                },
                {
                    "id": "blockable_3",
                    "kind": "blockable",
                    "from": "n3",
                    "to": "n4",
                    "tags": []
                },
                {
                    "id": "blockable_4",
                    "kind": "blockable",
                    "from": "n4",
                    "to": "n5",
                    "tags": []
                },
                {
                    "id": "blockable_5",
                    "kind": "blockable",
                    "from": "n5",
                    "to": "n15",
                    "tags": []
                },
                {
                    "id": "blockable_6",
                    "kind": "blockable",
                    "from": "n15",
                    "to": "n14",
                    "tags": []
                },
                {
                    "id": "blockable_7",
                    "kind": "blockable",
                    "from": "n14",
                    "to": "n13",
                    "tags": []
                },
                {
                    "id": "blockable_8",
                    "kind": "blockable",
                    "from": "n13",
                    "to": "n12",
                    "tags": []
                },
                {
                    "id": "blockable_9",
                    "kind": "blockable",
                    "from": "n12",
                    "to": "n9",
                    "tags": []
                },
                {
                    "id": "blockable_10",
                    "kind": "blockable",
                    "from": "n9",
                    "to": "n8",
                    "tags": []
                },
                {
                    "id": "blockable_11",
                    "kind": "blockable",
                    "from": "n8",
                    "to": "n7",
                    "tags": []
                },
                {
                    "id": "blockable_12",
                    "kind": "blockable",
                    "from": "n7",
                    "to": "n1",
                    "tags": []
                }
            ]
        }
    }
};

const ENVIRONMENT_ATLAS_MANIFEST_CANDIDATES = [
    { url: "assets/atlas_001.json", fallback: FALLBACK_ATLAS_001_MANIFEST, forceAtlasId: "atlas_001", forceImage: "atlas_001.png" }
];

const FALLBACK_RIG_CONFIG = {
    meta: { version: 2 },
    drawOrder: FIXED_DRAW_ORDER,
    global: {
        scale: 0.35,
        lean: 0.19,
        rootX: 550,
        rootYOffsetFromGround: -146,
        groundOffset: -15,
        debugPivots: false
    },
    animation: {
        speed: 3,
        torsoWobble: 0.035,
        headWobble: 0.025,
        headLeanMultiplier: 0.45,
        rootSway: 3.2,
        bobAmplitude: 5.5,
        bobCompression: 1.6,
        rocketBob: 2.2
    },
    anchors: {
        shoulderCenter: { x: 0, y: -102 },
        leftShoulder: { x: 20, y: 4 },
        rightShoulder: { x: -20, y: 4 },
        neck: { x: 4, y: -134 },
        rocketMount: { x: -45, y: -64 },
        hatFromHead: { x: -1, y: -55 }
    },
    legMotion: {
        stride: 37,
        lift: 26,
        groundRise: -4,
        leftBaseX: 13,
        rightBaseX: -13,
        angleStride: -0.15,
        angleLift: 0.1,
        anglePlanted: -0.03
    },
    pivots: {
        leftArm: { x: 0.27, y: 0.14 },
        leftFoot: { x: 0.38, y: 0.86 },
        rocket: { x: 0.72, y: 0.58 },
        rightFoot: { x: 0.42, y: 0.86 },
        robe: { x: 0.55, y: 0.55 },
        head: { x: 0.53, y: 0.82 },
        hat: { x: 0.46, y: 0.765 },
        rightArm: { x: 0.48, y: 0.13 }
    },
    parts: {
        leftArm: { targetHeight: 128, scale: 0.73, offset: { x: -12, y: 59 }, rotation: { base: -0.16, swing: 0.52, lift: -0.08, torso: 1 }, alpha: 1 },
        leftFoot: { targetHeight: 90, scale: 0.98, offset: { x: -34, y: 0 }, rotation: { base: 0 }, alpha: 1 },
        rocket: { targetHeight: 220, scale: 1, offset: { x: 3, y: 40 }, rotation: { base: 0.07, torso: 1 }, alpha: 0.98 },
        rightFoot: { targetHeight: 90, scale: 1.02, offset: { x: 0, y: 0 }, rotation: { base: 0 }, alpha: 1 },
        robe: { targetHeight: 258, scale: 0.73, offset: { x: 9, y: 21 }, rotation: { base: 0, torso: 1 }, alpha: 1 },
        head: { targetHeight: 78, scale: 1.28, offset: { x: -14, y: 71 }, rotation: { base: 0 }, alpha: 1 },
        hat: { targetHeight: 76, scale: 1.33, offset: { x: -13, y: 55 }, rotation: { base: -0.02 }, alpha: 1 },
        rightArm: { targetHeight: 128, scale: 1.03, offset: { x: -10, y: 63 }, rotation: { base: 0.03, swing: 0.52, lift: -0.08, torso: 1 }, alpha: 1 }
    }
};

export async function createRenderer(canvas) {
    const ctx = canvas.getContext("2d", { alpha: false });
    const assets = new Map();
    const rigConfig = await loadRigConfig();
    await loadAllAssets(assets);
    const environmentAtlases = await loadEnvironmentAtlases();

    return new RocketfrockRenderer(canvas, ctx, assets, normalizeRigConfig(rigConfig), environmentAtlases);
}

class RocketfrockRenderer {
    constructor(canvas, ctx, assets, rigConfig, environmentAtlases = new Map()) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = assets;
        this.rigConfig = rigConfig;
        this.environmentAtlases = environmentAtlases;
        this.phase = 0;
        this.forcePhase = null;
        this.visualPose = null;
        this.lastVisualPoseMode = null;
        this.lastRenderDt = 1 / 60;
        this.viewport = { w: canvas.width, h: canvas.height, dpr: 1 };
        this.lastBounds = null;
    }

    getEnvironmentManifests() {
        return this.environmentAtlases;
    }

    resize() {
        const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
        const width = Math.floor(this.canvas.clientWidth * dpr);
        const height = Math.floor(this.canvas.clientHeight * dpr);
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        this.viewport = { w: width, h: height, dpr };
    }

    updatePhase(state, dt) {
        if (this.forcePhase !== null) {
            this.phase = this.forcePhase;
            return;
        }
        const speedRatio = Math.min(1.4, Math.abs(state.player.vx) / Math.max(1, state.tuning.maxRunSpeed));
        if (!state.player.onGround) {
            // Airborne poses are now state poses, not a slow copy of the run cycle.
            this.phase = 0;
            return;
        }
        if (speedRatio < 0.04) {
            this.phase = 0;
            return;
        }
        const base = 0.55 + speedRatio * 2.6;
        this.phase = (this.phase + dt * base * Math.PI * 2) % (Math.PI * 2);
    }

    render(state, inputFrame, dt) {
        this.lastRenderDt = Math.max(0, Math.min(0.08, Number(dt) || 1 / 60));
        this.resize();
        this.updatePhase(state, dt);
        const ctx = this.ctx;
        const view = this.computeView(state);
        this.clear(view);
        this.drawBackdrop(view);
        this.drawWorld(state, view);
        this.drawTargets(state, view);
        this.drawPickups(state, view);
        this.drawEnemies(state, view);
        this.drawWorldEffects(state, view);
        this.drawProjectiles(state, view);
        this.drawPlayer(state, view);
        this.drawDebug(state, view, inputFrame);
        this.drawVignette();
    }

    computeView(state) {
        const w = this.viewport.w;
        const h = this.viewport.h;
        const dpr = this.viewport.dpr;
        const zoom = dpr;
        return {
            w,
            h,
            dpr,
            zoom,
            x: state.camera.x - w / zoom * 0.5,
            y: state.camera.y - h / zoom * 0.56
        };
    }

    worldToScreen(view, x, y) {
        return {
            x: (x - view.x) * view.zoom,
            y: (y - view.y) * view.zoom
        };
    }

    clear(view) {
        const ctx = this.ctx;
        const g = ctx.createLinearGradient(0, 0, 0, view.h);
        g.addColorStop(0, "#2a2441");
        g.addColorStop(0.58, "#17172a");
        g.addColorStop(1, "#101019");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, view.w, view.h);
    }

    drawBackdrop(view) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.19;
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 70; i += 1) {
            const x = (i * 211 + 47 - view.x * 0.05) % view.w;
            const y = (i * 113 + 71 - view.y * 0.04) % Math.max(1, view.h * 0.72);
            ctx.fillRect(x, y, 1.4 * view.dpr, 1.4 * view.dpr);
        }
        ctx.restore();
    }

    drawWorld(state, view) {
        const ctx = this.ctx;
        const drewVisuals = this.drawOrderedWorldVisuals(state, view);

        const shouldDrawCollision = Boolean(state.debug.showCollision) || !drewVisuals;
        if (shouldDrawCollision) {
            for (const solid of state.world.solids) {
                const p = this.worldToScreen(view, solid.x, solid.y);
                const w = solid.w * view.zoom;
                const h = solid.h * view.zoom;
                ctx.save();
                if (state.debug.showCollision) {
                    ctx.fillStyle = solid.kind === "floor" ? "rgba(122, 104, 149, 0.18)" : "rgba(92, 81, 124, 0.20)";
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
                } else {
                    ctx.fillStyle = solid.kind === "floor" ? "rgba(122, 104, 149, 0.45)" : "rgba(92, 81, 124, 0.52)";
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
                }
                ctx.lineWidth = 1.5 * view.dpr;
                ctx.beginPath();
                roundedRect(ctx, p.x, p.y, w, h, 8 * view.dpr);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }

        if (state.debug.showCollision) {
            this.drawCollisionSegments(state, view);
        }

        if (state.debug.showAssetGuides) {
            this.drawAssetGuides(state, view);
        }

        if (state.debug.showCollision) {
            ctx.save();
            ctx.font = `${12 * view.dpr}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.64)";
            for (const label of state.world.labels) {
                const p = this.worldToScreen(view, label.x, label.y);
                ctx.fillText(label.text, p.x, p.y);
            }
            ctx.restore();
        }
    }

    drawCollisionSegments(state, view) {
        const ctx = this.ctx;
        const segments = state.world.segments || [];
        if (!segments.length) {
            return;
        }
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3 * view.dpr;
        for (const segment of segments) {
            const a = this.worldToScreen(view, segment.x1, segment.y1);
            const b = this.worldToScreen(view, segment.x2, segment.y2);
            ctx.strokeStyle = assetLineColor(segment.kind);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawOrderedWorldVisuals(state, view) {
        const visuals = (state.world.visuals || [])
            .map((visual, index) => ({ visual, index }))
            .sort((a, b) => this.visualSortKey(a.visual, a.index) - this.visualSortKey(b.visual, b.index));
        let drewAny = false;
        for (const { visual } of visuals) {
            if (visual.kind === "atlasSprite") {
                if (this.drawAtlasSpriteVisual(visual, view)) {
                    drewAny = true;
                }
            } else if (visual.kind === "cutoutMask") {
                this.drawCutoutMaskVisual(visual, view);
                drewAny = true;
            }
        }
        return drewAny;
    }

    visualSortKey(visual, index) {
        if (Number.isFinite(Number(visual.order))) {
            return Number(visual.order);
        }
        const layer = visual.layer || "terrain";
        const layerOrder = layer === "decorBack" ? 0 : layer === "terrain" ? 10000 : layer === "mask" ? 20000 : 30000;
        return layerOrder + index;
    }

    drawCutoutMaskVisual(mask, view) {
        const ctx = this.ctx;
        const p = this.worldToScreen(view, mask.x, mask.y);
        const w = mask.w * view.zoom;
        const h = mask.h * view.zoom;
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(p.x, p.y, w, h);
        ctx.restore();
    }

    drawAtlasVisuals(state, view, layer) {
        const visuals = state.world.visuals || [];
        let drewAny = false;
        for (const visual of visuals) {
            if ((visual.layer || "terrain") !== layer) {
                continue;
            }
            if (visual.kind !== "atlasSprite") {
                continue;
            }
            if (this.drawAtlasSpriteVisual(visual, view)) {
                drewAny = true;
            }
        }
        return drewAny;
    }

    drawAtlasSpriteVisual(visual, view) {
        const atlas = this.environmentAtlases.get(visual.atlasId);
        if (!atlas || atlas.missing || !atlas.image) {
            return false;
        }
        const frameName = visual.frame || visual.assetId;
        const frame = atlas.frames?.[frameName];
        if (!frame) {
            return false;
        }
        const ctx = this.ctx;
        const p = this.worldToScreen(view, visual.x, visual.y);
        const w = visual.w * view.zoom;
        const h = visual.h * view.zoom;
        ctx.save();
        ctx.globalAlpha *= visual.alpha ?? 1;
        if (visual.mirrorX) {
            ctx.translate(p.x + w, p.y);
            ctx.scale(-1, 1);
            ctx.drawImage(atlas.image, frame.x, frame.y, frame.w, frame.h, 0, 0, w, h);
        } else {
            ctx.drawImage(atlas.image, frame.x, frame.y, frame.w, frame.h, p.x, p.y, w, h);
        }
        ctx.restore();
        return true;
    }

    drawAssetGuides(state, view) {
        const visuals = state.world.visuals || [];
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `${11 * view.dpr}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (const visual of visuals) {
            if (visual.kind === "cutoutMask") {
                const p = this.worldToScreen(view, visual.x, visual.y);
                ctx.save();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
                ctx.lineWidth = 1.5 * view.dpr;
                ctx.setLineDash([8 * view.dpr, 5 * view.dpr]);
                ctx.strokeRect(p.x, p.y, visual.w * view.zoom, visual.h * view.zoom);
                ctx.setLineDash([]);
                ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
                ctx.fillText(visual.id || "cutoutMask", p.x + 4 * view.dpr, p.y - 5 * view.dpr);
                ctx.restore();
                continue;
            }
            if (visual.kind !== "atlasSprite") {
                continue;
            }
            const atlas = this.environmentAtlases.get(visual.atlasId);
            if (!atlas || !atlas.manifest) {
                continue;
            }
            const frameName = visual.frame || visual.assetId;
            const frame = atlas.frames?.[frameName];
            const object = atlas.manifest.objects?.[visual.assetId || frameName];
            if (!frame) {
                continue;
            }

            const p = this.worldToScreen(view, visual.x, visual.y);
            ctx.save();
            ctx.strokeStyle = "rgba(86, 230, 255, 0.72)";
            ctx.lineWidth = 1.5 * view.dpr;
            ctx.setLineDash([5 * view.dpr, 4 * view.dpr]);
            ctx.strokeRect(p.x, p.y, visual.w * view.zoom, visual.h * view.zoom);
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(86, 230, 255, 0.78)";
            ctx.fillText(visual.assetId || frameName, p.x + 4 * view.dpr, p.y - 5 * view.dpr);
            ctx.restore();

            if (!object || !Array.isArray(object.nodes) || !Array.isArray(object.lines)) {
                continue;
            }

            for (const line of object.lines) {
                const a = object.nodes.find((node) => node.id === line.from);
                const b = object.nodes.find((node) => node.id === line.to);
                if (!a || !b) {
                    continue;
                }
                const ap = this.assetLocalToScreen(visual, frame, a, view);
                const bp = this.assetLocalToScreen(visual, frame, b, view);
                const color = assetLineColor(line.kind);
                ctx.save();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5 * view.dpr;
                ctx.beginPath();
                ctx.moveTo(ap.x, ap.y);
                ctx.lineTo(bp.x, bp.y);
                ctx.stroke();
                ctx.restore();
            }

            for (const node of object.nodes) {
                const np = this.assetLocalToScreen(visual, frame, node, view);
                ctx.save();
                ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
                ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
                ctx.lineWidth = 1 * view.dpr;
                ctx.beginPath();
                ctx.arc(np.x, np.y, 3.4 * view.dpr, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }

        ctx.restore();
    }

    assetLocalToScreen(visual, frame, node, view) {
        const localX = visual.mirrorX ? frame.w - node.x : node.x;
        const wx = visual.x + localX / Math.max(1, frame.w) * visual.w;
        const wy = visual.y + node.y / Math.max(1, frame.h) * visual.h;
        return this.worldToScreen(view, wx, wy);
    }

    drawTargets(state, view) {
        const ctx = this.ctx;
        for (const target of state.targets || []) {
            if (target.state !== "active") continue;
            const p = this.worldToScreen(view, target.x, target.y);
            const pulse = 0.5 + 0.5 * Math.sin(state.clock.time * 5.5);
            ctx.save();
            ctx.lineWidth = 2 * view.dpr;
            ctx.strokeStyle = `rgba(255, 234, 124, ${0.55 + pulse * 0.25})`;
            ctx.fillStyle = "rgba(255, 126, 98, 0.82)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, target.radius * view.zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, (target.radius + 9 + pulse * 4) * view.zoom, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawPickups(state, view) {
        const ctx = this.ctx;
        for (const pickup of state.pickups) {
            if (pickup.collected) continue;
            const p = this.worldToScreen(view, pickup.x, pickup.y);
            const r = pickup.radius * view.zoom;
            ctx.save();
            ctx.globalAlpha = 0.82 + 0.18 * Math.sin(state.clock.time * 5 + pickup.x);
            ctx.fillStyle = "rgba(113, 224, 126, 0.82)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
            ctx.lineWidth = 2 * view.dpr;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    drawEnemies(state, view) {
        const ctx = this.ctx;
        for (const enemy of state.enemies) {
            const p = this.worldToScreen(view, enemy.x - enemy.width / 2, enemy.y - enemy.height);
            ctx.save();
            ctx.fillStyle = "rgba(202, 135, 255, 0.62)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            ctx.lineWidth = 2 * view.dpr;
            ctx.beginPath();
            roundedRect(ctx, p.x, p.y, enemy.width * view.zoom, enemy.height * view.zoom, 14 * view.dpr);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(255, 255, 255, 0.84)";
            ctx.beginPath();
            ctx.arc(p.x + enemy.width * view.zoom * 0.38, p.y + enemy.height * view.zoom * 0.35, 3 * view.dpr, 0, Math.PI * 2);
            ctx.arc(p.x + enemy.width * view.zoom * 0.62, p.y + enemy.height * view.zoom * 0.35, 3 * view.dpr, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    drawWorldEffects(state, view) {
        const ctx = this.ctx;
        const puffs = state.effects?.smokePuffs || [];
        if (!puffs.length) {
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        for (const puff of puffs) {
            const ageRatio = clamp(puff.age / Math.max(0.001, puff.lifetime), 0, 1);
            const p = this.worldToScreen(view, puff.x, puff.y);
            const radius = (puff.radius * (0.75 + ageRatio * 1.65)) * view.zoom;
            const smokeAlpha = 0.30 * Math.pow(1 - ageRatio, 1.25);

            const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, Math.max(1, radius));
            g.addColorStop(0, `rgba(207, 198, 218, ${smokeAlpha})`);
            g.addColorStop(0.56, `rgba(155, 145, 170, ${smokeAlpha * 0.48})`);
            g.addColorStop(1, "rgba(92, 84, 112, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();

            const sparkFade = Math.pow(1 - ageRatio, 1.9);
            if (sparkFade > 0.025) {
                ctx.save();
                ctx.globalCompositeOperation = "lighter";
                const sparkCount = 2 + Math.floor(5 * (1 - ageRatio));
                for (let i = 0; i < sparkCount; i += 1) {
                    const seed = (puff.sparkleSeed || 0) + i * 17;
                    const angle = hashNoise(seed, i) * Math.PI * 2;
                    const r = radius * (0.12 + hashNoise(seed + 31, i) * 0.64);
                    const twinkle = 0.72 + 0.28 * Math.sin((state.clock.time + puff.age) * 18 + i * 1.4);
                    const size = (0.9 + hashNoise(seed + 79, i) * 2.6) * view.dpr;
                    ctx.globalAlpha = clamp(0.12 + sparkFade * twinkle * 0.72, 0, 0.82);
                    ctx.fillStyle = i % 3 === 0 ? "rgba(204, 157, 255, 0.92)" : "rgba(255, 238, 129, 0.94)";
                    ctx.beginPath();
                    ctx.arc(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }
        ctx.restore();
    }

    drawProjectiles(state, view) {
        const ctx = this.ctx;
        for (const projectile of state.projectiles || []) {
            if (projectile.state === "exploding") {
                const p = this.worldToScreen(view, projectile.x, projectile.y);
                ctx.save();
                const sparkRadius = 32 * view.zoom;
                this.drawSparkBurst(p.x, p.y, view, projectile.age + projectile.x, 14, sparkRadius);
                ctx.restore();
                continue;
            }

            if (projectile.state !== "launched") {
                continue;
            }
            this.drawProjectileRocket(projectile, state, view);
        }
    }

    drawProjectileRocket(projectile, state, view) {
        const asset = this.assets.get("rocket");
        if (!asset || asset.missing) {
            return;
        }
        const ctx = this.ctx;
        const p = this.worldToScreen(view, projectile.x, projectile.y);
        const speed = Math.hypot(projectile.vx, projectile.vy) || 1;
        const dir = { x: projectile.vx / speed, y: projectile.vy / speed };
        const angle = Math.atan2(dir.x, -dir.y);
        const pivot = this.rigConfig.pivots.rocket;
        const targetHeight = 72 * view.zoom;
        const spriteScale = targetHeight / Math.max(1, asset.height);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.scale(spriteScale, spriteScale);
        ctx.drawImage(asset.canvas, -pivot.x * asset.width, -pivot.y * asset.height);
        drawRocketFlameLocal(ctx, asset, pivot, state.clock.time + projectile.age * 11, 0.55, projectile.id.length * 13);
        ctx.restore();
    }

    drawRocketPathTrail(projectile, state, view) {
        const ctx = this.ctx;
        const rawTrail = Array.isArray(projectile.trail) ? projectile.trail : [];
        const trail = rawTrail.concat([{ x: projectile.x, y: projectile.y, time: state.clock.time }]);
        if (trail.length < 2) {
            return;
        }

        const screenTrail = trail.map((point) => ({
            ...this.worldToScreen(view, point.x, point.y),
            worldX: point.x,
            worldY: point.y,
            time: point.time ?? state.clock.time
        }));

        const maxScreenLength = this.canvas.width * 0.34;
        const visible = [screenTrail[screenTrail.length - 1]];
        let distanceSoFar = 0;
        for (let i = screenTrail.length - 2; i >= 0; i -= 1) {
            const newer = screenTrail[i + 1];
            const older = screenTrail[i];
            const segment = Math.hypot(newer.x - older.x, newer.y - older.y);
            if (distanceSoFar + segment > maxScreenLength) {
                const remaining = Math.max(0, maxScreenLength - distanceSoFar);
                const ratio = segment <= 0 ? 0 : remaining / segment;
                visible.push({
                    x: newer.x + (older.x - newer.x) * ratio,
                    y: newer.y + (older.y - newer.y) * ratio,
                    time: older.time
                });
                break;
            }
            visible.push(older);
            distanceSoFar += segment;
        }
        visible.reverse();

        if (visible.length < 2) {
            return;
        }

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // First pass: smoke that stays on the travelled path.
        for (let i = 0; i < visible.length - 1; i += 1) {
            const a = visible[i];
            const b = visible[i + 1];
            const u = i / Math.max(1, visible.length - 2);
            const age = clamp((state.clock.time - (a.time ?? state.clock.time)) / 2.15, 0, 1);
            const smokeAlpha = (0.06 + 0.24 * u) * (1 - age * 0.45);
            const smokeWidth = (28 - u * 16) * view.dpr;
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = smokeAlpha;
            ctx.strokeStyle = "rgba(184, 172, 198, 1)";
            ctx.lineWidth = Math.max(2, smokeWidth);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        // Second pass: hot magical sparkle crumbs pinned to the same bent path.
        ctx.globalCompositeOperation = "lighter";
        const sparkCount = Math.min(110, Math.max(18, visible.length * 5));
        const seed = projectile.id.length * 97 + Math.floor(projectile.x * 0.11) + Math.floor(projectile.y * 0.07);
        for (let i = 0; i < sparkCount; i += 1) {
            const segmentIndex = Math.min(visible.length - 2, Math.floor(hashNoise(seed + 13, i) * (visible.length - 1)));
            const a = visible[segmentIndex];
            const b = visible[segmentIndex + 1];
            const t = hashNoise(seed + 31, i);
            const x = a.x + (b.x - a.x) * t;
            const y = a.y + (b.y - a.y) * t;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const length = Math.hypot(dx, dy) || 1;
            const nx = -dy / length;
            const ny = dx / length;
            const u = (segmentIndex + t) / Math.max(1, visible.length - 1);
            const spread = (8 + (1 - u) * 24) * view.dpr;
            const jitter = (hashNoise(seed + 71, i) - 0.5) * spread;
            const age = clamp((state.clock.time - (a.time ?? state.clock.time)) / 2.15, 0, 1);
            const twinkle = 0.72 + 0.28 * Math.sin(state.clock.time * 19 + i * 1.7);
            const fade = Math.pow(u, 0.38) * (1 - age * 0.55) * twinkle;
            const size = (1.0 + hashNoise(seed + 101, i) * 3.6) * view.dpr * (0.55 + fade);
            ctx.globalAlpha = clamp(0.05 + fade * 0.72, 0, 0.86);
            ctx.fillStyle = i % 7 === 0 ? "rgba(197, 151, 255, 0.95)" : (i % 2 === 0 ? "rgba(255, 239, 126, 0.94)" : "rgba(255, 133, 82, 0.9)");
            ctx.beginPath();
            ctx.arc(x + nx * jitter, y + ny * jitter, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Small hot core near the nozzle, still short and local to the current rocket.
        const newest = visible[visible.length - 1];
        const previous = visible[Math.max(0, visible.length - 2)];
        const vx = newest.x - previous.x;
        const vy = newest.y - previous.y;
        const length = Math.hypot(vx, vy) || 1;
        const tailX = -vx / length;
        const tailY = -vy / length;
        const core = ctx.createRadialGradient(newest.x + tailX * 18 * view.dpr, newest.y + tailY * 18 * view.dpr, 1, newest.x + tailX * 28 * view.dpr, newest.y + tailY * 28 * view.dpr, 34 * view.dpr);
        core.addColorStop(0, "rgba(255, 235, 126, 0.46)");
        core.addColorStop(1, "rgba(255, 116, 70, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(newest.x + tailX * 24 * view.dpr, newest.y + tailY * 24 * view.dpr, 34 * view.dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawSparkBurst(x, y, view, seed, count, radius) {
        const ctx = this.ctx;
        ctx.save();
        for (let i = 0; i < count; i += 1) {
            const a = hashNoise(seed, i) * Math.PI * 2;
            const r = (0.25 + hashNoise(seed + 31, i) * 0.75) * radius;
            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;
            const size = (1.2 + hashNoise(seed + 71, i) * 2.7) * view.dpr;
            ctx.globalAlpha = 0.35 + hashNoise(seed + 109, i) * 0.5;
            ctx.fillStyle = i % 3 === 0 ? "rgba(255, 246, 166, 0.9)" : "rgba(255, 137, 82, 0.86)";
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawPlayer(state, view) {
        const p = this.worldToScreen(view, state.player.x, state.player.y);
        this.drawShadow(p.x, p.y, view.zoom);
        const bounds = this.drawWizardRig(p.x, p.y, state.player.facing, state, view.zoom);
        this.lastBounds = bounds;

        if (state.health.low) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = 0.14 + 0.16 * state.player.lowHealthPulse;
            ctx.fillStyle = "#e84e48";
            ctx.beginPath();
            ctx.ellipse(p.x, p.y - state.player.height * view.zoom * 0.5, 62 * view.zoom, 78 * view.zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    drawShadow(x, groundY, zoom) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, groundY + 4 * zoom);
        ctx.globalAlpha = 0.26;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(0, 0, 46 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawWizardRig(screenX, screenGroundY, facing, state, zoom) {
        const ctx = this.ctx;
        const targetPose = this.computeRigPose(state, zoom);
        const pose = this.blendRigPose(targetPose, state, zoom);
        const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

        ctx.save();
        ctx.translate(screenX, screenGroundY);
        ctx.scale(facing, 1);
        for (const name of FIXED_DRAW_ORDER) {
            const spriteBounds = this.drawSprite(name, pose.transforms[name], zoom);
            mergeBounds(bounds, spriteBounds, screenX, screenGroundY, facing);
            if (name === "rocket") {
                // Phase 1.011: attached boost exhaust is represented by world-managed smoke/spark puffs,
                // not by a local flame sprite. The flying projectile still keeps its short nozzle flame.
                this.drawMountedRocketFuelBulb(pose.transforms[name], state, zoom);
            }
        }
        ctx.restore();

        return bounds;
    }

    computeRigPose(state, zoom = 1) {
        const phase = this.phase;
        const cfg = this.rigConfig;
        const scale = cfg.global.scale * zoom;
        const lean = cfg.global.lean;
        const anim = cfg.animation;
        const anchors = cfg.anchors;
        const speedRatio = Math.min(1.25, Math.abs(state.player.vx) / Math.max(1, state.tuning.maxRunSpeed));
        const groundMotion = smoothstep(0.05, 0.24, speedRatio);
        const rocket = state.equipment.rocket;
        const airborne = !state.player.onGround;
        const kickWindow = Math.max(0.16, Math.min(0.34, (state.tuning.attachedBoostBurstDuration ?? 0.5) * 0.55));
        const boostKickPose = airborne && rocket.attachedBoosting && rocket.attachedBoostTime <= kickWindow;
        const hoverPose = airborne && rocket.attachedBoosting && !boostKickPose;
        const poseMode = hoverPose ? "hover" : (airborne ? "jump" : "ground");
        const motionAmount = poseMode === "ground" ? groundMotion : 0;
        const bob = poseMode === "ground"
            ? (Math.sin(phase * 2) * anim.bobAmplitude - Math.max(0, Math.cos(phase * 2)) * anim.bobCompression) * scale * motionAmount
            : 0;
        const standLean = 0.02;
        const runLean = lean + speedRatio * 0.1;
        let torsoAngle = standLean * (1 - motionAmount) + runLean * motionAmount + Math.sin(phase * 2) * anim.torsoWobble * motionAmount;
        if (poseMode === "jump") {
            const riseLean = state.player.vy < 0 ? 0.08 : 0.045;
            torsoAngle = boostKickPose ? 0.12 : riseLean;
        } else if (poseMode === "hover") {
            torsoAngle = 0.015 + Math.sin(state.clock.time * 5.5) * 0.012;
        }
        const headAngle = torsoAngle * anim.headLeanMultiplier + (poseMode === "ground" ? Math.sin(phase * 2 + 0.4) * anim.headWobble * motionAmount : 0);
        const root = {
            x: 0,
            y: cfg.global.rootYOffsetFromGround * scale + bob
        };
        const shoulderCenter = add(root, scaledRotatedAnchor(anchors.shoulderCenter, scale, torsoAngle));
        const leftShoulder = add(shoulderCenter, scaledRotatedAnchor(anchors.leftShoulder, scale, torsoAngle));
        const rightShoulder = add(shoulderCenter, scaledRotatedAnchor(anchors.rightShoulder, scale, torsoAngle));
        const neck = add(root, scaledRotatedAnchor(anchors.neck, scale, torsoAngle));
        const rocketMount = add(root, scaledRotatedAnchor(anchors.rocketMount, scale, torsoAngle));
        const hatBase = add(neck, scaledRotatedAnchor(anchors.hatFromHead, scale, headAngle));
        const rocketBob = rocket.attachedBoosting ? Math.sin(state.clock.time * 38) * 2.8 * scale : Math.sin(phase * 2 + 0.7) * anim.rocketBob * scale * motionAmount;
        const rocketBobPoint = { x: rocketMount.x, y: rocketMount.y + rocketBob };

        return {
            poseMode,
            transforms: {
                leftArm: this.makeArmTransform("left", leftShoulder, phase, scale, torsoAngle, motionAmount, poseMode),
                leftFoot: this.makeLegTransform("left", root, phase, scale, motionAmount, poseMode, state),
                rocket: this.makeRigidTransform("rocket", rocketBobPoint, torsoAngle, scale),
                rightFoot: this.makeLegTransform("right", root, phase, scale, motionAmount, poseMode, state),
                robe: this.makeRigidTransform("robe", root, torsoAngle, scale),
                head: this.makeRigidTransform("head", neck, headAngle, scale),
                hat: this.makeRigidTransform("hat", hatBase, headAngle, scale),
                rightArm: this.makeArmTransform("right", rightShoulder, phase, scale, torsoAngle, motionAmount, poseMode)
            }
        };
    }

    blendRigPose(targetPose, state, zoom) {
        const speed = Number(state.tuning.poseBlendSpeed ?? 14);
        if (!Number.isFinite(speed) || speed <= 0 || !this.visualPose) {
            this.visualPose = clonePose(targetPose);
            this.lastVisualPoseMode = targetPose.poseMode;
            return targetPose;
        }

        const alpha = 1 - Math.exp(-speed * this.lastRenderDt);
        const blended = {
            poseMode: targetPose.poseMode,
            transforms: {}
        };

        for (const name of FIXED_DRAW_ORDER) {
            const from = this.visualPose.transforms[name];
            const to = targetPose.transforms[name];
            blended.transforms[name] = from ? lerpTransform(from, to, alpha) : { ...to };
        }

        this.visualPose = clonePose(blended);
        this.lastVisualPoseMode = targetPose.poseMode;
        return blended;
    }

    makeLegTransform(side, root, phase, scale, motionAmount = 1, poseMode = "ground", state = null) {
        const name = side === "left" ? "leftFoot" : "rightFoot";
        const part = this.rigConfig.parts[name];
        const motion = this.rigConfig.legMotion;
        const baseX = side === "left" ? motion.leftBaseX : motion.rightBaseX;

        if (poseMode !== "ground") {
            const falling = state ? state.player.vy > 120 : false;
            const kick = state ? state.equipment.rocket.attachedBoosting && state.equipment.rocket.attachedBoostTime < 0.24 : false;
            let poseX = baseX;
            let poseY = motion.groundRise;
            let angle = part.rotation.base;

            if (poseMode === "hover") {
                // Hovering should read as a passive dangle rather than airborne running.
                poseX += side === "left" ? -4 : 4;
                poseY += 2;
                angle += side === "left" ? -0.025 : 0.025;
            } else {
                // Jump/kick pose: one leg trailing from takeoff and the other preparing to land.
                const apart = kick ? 1.18 : 1.0;
                if (side === "left") {
                    poseX -= 24 * apart;
                    poseY += falling ? -14 : -2;
                    angle += -0.18;
                } else {
                    poseX += 32 * apart;
                    poseY += falling ? -4 : -22;
                    angle += 0.21;
                }
            }

            const point = applyPartOffset({
                x: root.x + poseX * scale,
                y: poseY * scale
            }, part, scale);
            return {
                x: point.x,
                y: point.y,
                angle,
                targetHeight: part.targetHeight * scale * part.scale,
                alpha: part.alpha
            };
        }

        const p = phase + (side === "left" ? 0 : Math.PI);
        const stride = -Math.sin(p) * motionAmount;
        const lift = Math.max(0, -Math.cos(p)) * motionAmount;
        const planted = Math.max(0, Math.cos(p)) * motionAmount;
        const basePoint = {
            x: root.x + (baseX + stride * motion.stride) * scale,
            y: (motion.groundRise - lift * motion.lift) * scale
        };
        const point = applyPartOffset(basePoint, part, scale);
        return {
            x: point.x,
            y: point.y,
            angle: part.rotation.base + motion.angleStride * stride + motion.angleLift * lift + motion.anglePlanted * planted,
            targetHeight: part.targetHeight * scale * part.scale,
            alpha: part.alpha
        };
    }

    makeArmTransform(side, shoulder, phase, scale, torsoAngle, motionAmount = 1, poseMode = "ground") {
        const name = side === "left" ? "leftArm" : "rightArm";
        const part = this.rigConfig.parts[name];
        const point = applyPartOffset(shoulder, part, scale);

        if (poseMode !== "ground") {
            const passive = poseMode === "hover";
            const spread = passive ? 0 : (side === "left" ? -0.08 : 0.08);
            return {
                x: point.x,
                y: point.y,
                angle: torsoAngle * (part.rotation.torso ?? 1) + part.rotation.base + spread,
                targetHeight: part.targetHeight * scale * part.scale,
                alpha: part.alpha
            };
        }

        const p = phase + (side === "left" ? 0 : Math.PI);
        const swing = -Math.sin(p) * motionAmount;
        const lift = Math.max(0, -Math.cos(p)) * motionAmount;
        return {
            x: point.x,
            y: point.y,
            angle: torsoAngle * part.rotation.torso + part.rotation.base + swing * part.rotation.swing + lift * part.rotation.lift,
            targetHeight: part.targetHeight * scale * part.scale,
            alpha: part.alpha
        };
    }

    drawMountedRocketFlame(transform, state, zoom) {
        const asset = this.assets.get("rocket");
        if (!asset || asset.missing || !transform) {
            return;
        }
        const ctx = this.ctx;
        const pivot = this.rigConfig.pivots.rocket;
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        const power = clamp(state.equipment.rocket.boostVisualPowerNow ?? 0.45, 0.2, 1.2);
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        drawRocketFlameLocal(ctx, asset, pivot, state.clock.time * 1.7, power, 41);
        ctx.restore();
    }

    drawMountedRocketFuelBulb(transform, state, zoom) {
        if (state.tuning.rocketFuelBulbEnabled === false) {
            return;
        }
        const asset = this.assets.get("rocket");
        if (!asset || asset.missing || !transform) {
            return;
        }
        const ctx = this.ctx;
        const pivot = this.rigConfig.pivots.rocket;
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        drawRocketFuelBulbLocal(ctx, asset, pivot, state, state.clock.time);
        ctx.restore();
    }

    makeRigidTransform(name, point, baseAngle, scale) {
        const part = this.rigConfig.parts[name];
        const rotation = part.rotation || {};
        const p = applyPartOffset(point, part, scale);
        return {
            x: p.x,
            y: p.y,
            angle: baseAngle * (rotation.torso ?? 1) + (rotation.base ?? 0),
            targetHeight: part.targetHeight * scale * part.scale,
            alpha: part.alpha
        };
    }

    drawSprite(name, transform, zoom) {
        const asset = this.assets.get(name);
        if (!asset || asset.missing || !transform) {
            return null;
        }

        const ctx = this.ctx;
        const pivot = this.rigConfig.pivots[name];
        const spriteScale = transform.targetHeight / Math.max(1, asset.height);
        ctx.save();
        ctx.globalAlpha *= transform.alpha;
        ctx.translate(transform.x, transform.y);
        ctx.rotate(transform.angle);
        ctx.scale(spriteScale, spriteScale);
        ctx.drawImage(asset.canvas, -pivot.x * asset.width, -pivot.y * asset.height);

        if (this.rigConfig.global.debugPivots) {
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "rgba(255, 237, 120, 0.72)";
            ctx.lineWidth = 1 / Math.max(0.001, Math.abs(spriteScale));
            ctx.strokeRect(-pivot.x * asset.width, -pivot.y * asset.height, asset.width, asset.height);
        }
        ctx.restore();

        return transformedSpriteBounds(asset, pivot, transform, spriteScale);
    }

    drawDebug(state, view, inputFrame) {
        const ctx = this.ctx;
        if (state.debug.showCollision) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 1 * view.dpr;
            for (const solid of state.world.solids || []) {
                const p = this.worldToScreen(view, solid.x, solid.y);
                ctx.strokeRect(p.x, p.y, solid.w * view.zoom, solid.h * view.zoom);
            }
            for (const segment of state.world.segments || []) {
                const a = this.worldToScreen(view, segment.x1, segment.y1);
                const b = this.worldToScreen(view, segment.x2, segment.y2);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (state.debug.showHitboxes) {
            const rect = {
                x: state.player.x - state.player.width / 2,
                y: state.player.y - state.player.height,
                w: state.player.width,
                h: state.player.height
            };
            const p = this.worldToScreen(view, rect.x, rect.y);
            ctx.save();
            ctx.strokeStyle = "rgba(127, 232, 255, 0.82)";
            ctx.lineWidth = 2 * view.dpr;
            ctx.strokeRect(p.x, p.y, rect.w * view.zoom, rect.h * view.zoom);
            ctx.restore();
        }

        if (state.debug.showHitboxes) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 220, 110, 0.68)";
            ctx.lineWidth = 1.5 * view.dpr;
            for (const projectile of state.projectiles || []) {
                if (projectile.state !== "launched") continue;
                const p = this.worldToScreen(view, projectile.x, projectile.y);
                ctx.beginPath();
                ctx.arc(p.x, p.y, projectile.radius * view.zoom, 0, Math.PI * 2);
                ctx.stroke();
            }
            for (const target of state.targets || []) {
                const p = this.worldToScreen(view, target.x, target.y);
                ctx.beginPath();
                ctx.arc(p.x, p.y, target.radius * view.zoom, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (state.debug.showVelocity) {
            const start = this.worldToScreen(view, state.player.x, state.player.y - state.player.height * 0.5);
            ctx.save();
            ctx.strokeStyle = "rgba(255, 223, 116, 0.92)";
            ctx.lineWidth = 2 * view.dpr;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(start.x + state.player.vx * 0.16 * view.zoom, start.y + state.player.vy * 0.16 * view.zoom);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawVignette() {
        const ctx = this.ctx;
        const g = ctx.createRadialGradient(this.viewport.w * 0.5, this.viewport.h * 0.5, this.viewport.h * 0.25, this.viewport.w * 0.5, this.viewport.h * 0.5, this.viewport.h * 0.78);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0.36)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, this.viewport.w, this.viewport.h);
    }

    getRigMetrics(state) {
        const partMetrics = {};
        const scale = this.rigConfig.global.scale;
        for (const name of FIXED_DRAW_ORDER) {
            const part = this.rigConfig.parts[name];
            partMetrics[name] = {
                targetHeight: part.targetHeight,
                partScale: part.scale,
                renderedHeightAtCanvasScale1: part.targetHeight * scale * part.scale,
                pivot: this.rigConfig.pivots[name]
            };
        }
        return {
            globalScale: scale,
            drawOrder: FIXED_DRAW_ORDER.slice(),
            parts: partMetrics,
            lastBounds: this.lastBounds,
            renderer: "Phase1 renderer uses the same rig config and part transform formula as wizard_rig_runner.html."
        };
    }
}

async function loadRigConfig() {
    try {
        const response = await fetch("./wizard_rig_config.json", { cache: "no-store" });
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        // Fall back below. This keeps file:// testing alive, though a local server is recommended.
    }
    return FALLBACK_RIG_CONFIG;
}

function normalizeRigConfig(rawConfig) {
    const config = deepMerge(FALLBACK_RIG_CONFIG, rawConfig || {});
    config.drawOrder = FIXED_DRAW_ORDER.slice();
    return config;
}

async function loadAllAssets(assets) {
    await Promise.all(FIXED_DRAW_ORDER.map(async (name) => {
        assets.set(name, await loadPart(name));
    }));
}

async function loadEnvironmentAtlases() {
    const atlases = new Map();
    for (const candidate of ENVIRONMENT_ATLAS_MANIFEST_CANDIDATES) {
        let manifest = null;
        if (candidate.url) {
            try {
                const response = await fetch(candidate.url, { cache: "no-store" });
                if (response.ok) {
                    manifest = await response.json();
                }
            } catch (error) {
                // file:// cannot reliably fetch JSON in all browsers. Try the next candidate.
            }
        }

        manifest = manifest || candidate.fallback;
        if (manifest) {
            manifest = normalizeEnvironmentManifest(manifest, candidate.forceAtlasId, candidate.forceImage);
        }
        if (!manifest || !manifest.atlasId || atlases.has(manifest.atlasId)) {
            continue;
        }

        const basePath = pathDirectory(candidate.url);
        const imageCandidates = [
            basePath + manifest.image
        ];

        let image = null;
        let source = null;
        for (const url of imageCandidates) {
            try {
                image = await loadImage(url);
                source = url;
                break;
            } catch (error) {
                // Try the next path.
            }
        }

        const atlasRecord = {
            id: manifest.atlasId,
            image,
            frames: manifest.frames || {},
            source,
            manifest,
            missing: !image
        };
        atlases.set(manifest.atlasId, atlasRecord);

        // Backward compatibility with older level/editor drafts.
        if (manifest.atlasId === "atlas_001") {
            atlases.set("theme_A_atlas_1", atlasRecord);
            atlases.set("themeA1", atlasRecord);
        }
    }
    return atlases;
}

function normalizeEnvironmentManifest(manifest, forcedAtlasId, forcedImage) {
    const normalized = JSON.parse(JSON.stringify(manifest));
    if (forcedAtlasId) {
        normalized.atlasId = forcedAtlasId;
    }
    if (forcedImage) {
        normalized.image = forcedImage;
    }
    return normalized;
}

function pathDirectory(url) {
    const text = String(url || "");
    const slash = text.lastIndexOf("/");
    return slash >= 0 ? text.slice(0, slash + 1) : "";
}

async function loadPart(name) {
    const candidates = ASSET_CANDIDATES[name] || [];
    for (const url of candidates) {
        try {
            const img = await loadImage(url);
            const asset = trimImageByAlpha(img, name);
            asset.source = url;
            return asset;
        } catch (error) {
            // Try the next candidate.
        }
    }
    return makeMissingPart(name);
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Could not load ${url}`));
        img.src = url;
    });
}

function trimImageByAlpha(img, name) {
    const temp = document.createElement("canvas");
    temp.width = img.naturalWidth || img.width;
    temp.height = img.naturalHeight || img.height;
    const tctx = temp.getContext("2d", { willReadFrequently: true });
    tctx.drawImage(img, 0, 0);
    const data = tctx.getImageData(0, 0, temp.width, temp.height).data;

    let minX = temp.width;
    let minY = temp.height;
    let maxX = -1;
    let maxY = -1;
    const threshold = 8;
    for (let y = 0; y < temp.height; y += 1) {
        for (let x = 0; x < temp.width; x += 1) {
            const alpha = data[(y * temp.width + x) * 4 + 3];
            if (alpha > threshold) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        return makeMissingPart(name);
    }

    const pad = 2;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(temp.width - 1, maxX + pad);
    maxY = Math.min(temp.height - 1, maxY + pad);

    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const trimmed = document.createElement("canvas");
    trimmed.width = w;
    trimmed.height = h;
    trimmed.getContext("2d").drawImage(temp, minX, minY, w, h, 0, 0, w, h);

    return {
        canvas: trimmed,
        width: w,
        height: h,
        naturalWidth: temp.width,
        naturalHeight: temp.height,
        bounds: { x: minX, y: minY, w, h },
        name,
        missing: false
    };
}

function makeMissingPart(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return { canvas, width: 1, height: 1, name, missing: true, bounds: { x: 0, y: 0, w: 1, h: 1 } };
}

function applyPartOffset(point, part, scale) {
    return {
        x: point.x + (part.offset?.x ?? 0) * scale,
        y: point.y + (part.offset?.y ?? 0) * scale
    };
}

function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}

function scaledRotatedAnchor(anchor, scale, angle) {
    return rotatePoint(anchor.x * scale, anchor.y * scale, angle);
}

function rotatePoint(localX, localY, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: localX * c - localY * s,
        y: localX * s + localY * c
    };
}



function drawRocketFuelBulbLocal(ctx, asset, pivot, state, time) {
    const fuel = state.fuel || { amount: 0, max: 100, rechargeDelayTimer: 0, rechargeCap: 100 };
    const tuning = state.tuning || {};
    const rocket = state.equipment?.rocket || {};
    const ratio = clamp(fuel.amount / Math.max(1, fuel.max || 100), 0, 1);
    const percent = ratio * 100;
    const low = tuning.rocketFuelBulbLowThreshold ?? 25;
    const mid = tuning.rocketFuelBulbMediumThreshold ?? 60;
    const scale = tuning.rocketFuelBulbScale ?? 1;
    const bulbX = (0.46 - pivot.x) * asset.width;
    const bulbY = (0.47 - pivot.y) * asset.height;
    const radius = Math.max(5, Math.min(asset.width, asset.height) * 0.055 * scale);
    const canRechargeNow = tuning.fuelRechargeRequiresGround === false || state.player.onGround || fuel.rechargeLatched === true;
    const recharging = Boolean(
        tuning.rocketFuelBulbPulseWhenRecharging !== false &&
        !rocket.attachedBoosting &&
        canRechargeNow &&
        (fuel.rechargeDelayTimer ?? 0) <= 0 &&
        fuel.amount < Math.min(fuel.rechargeCap ?? fuel.max, fuel.max)
    );
    const unavailable = (tuning.fuelRechargeRequiresGround !== false && !state.player.onGround && fuel.rechargeLatched !== true) || (fuel.rechargeDelayTimer ?? 0) > 0;
    const flash = clamp((rocket.fuelBulbFlashTimer ?? 0) / 0.45, 0, 1);
    const pulse = recharging ? 0.5 + 0.5 * Math.sin(time * 13.5) : 0;

    let fill = "rgba(18, 16, 20, 0.88)";
    let glow = "rgba(0, 0, 0, 0)";
    if (percent > 0.5 && percent < low) {
        fill = "rgba(220, 59, 58, 0.95)";
        glow = "rgba(255, 67, 53, 0.45)";
    } else if (percent >= low && percent < mid) {
        fill = "rgba(239, 198, 71, 0.96)";
        glow = "rgba(255, 217, 75, 0.42)";
    } else if (percent >= mid) {
        fill = "rgba(103, 218, 117, 0.96)";
        glow = "rgba(100, 244, 126, 0.42)";
    }

    const dim = unavailable && !recharging ? 0.62 : 1;
    const glowRadius = radius * (2.2 + pulse * 0.75 + flash * 1.8);

    ctx.save();
    ctx.translate(bulbX, bulbY);
    ctx.globalCompositeOperation = "source-over";

    if (percent > 0.5) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, glowRadius);
        g.addColorStop(0, glow);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = dim * (0.55 + pulse * 0.35 + flash * 0.42);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.globalAlpha = 0.82;
    ctx.fillStyle = "rgba(5, 4, 7, 0.92)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = dim;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (fuel.amount > 0 && fuel.amount < fuel.max) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
        ctx.beginPath();
        ctx.rect(-radius, -radius, radius * 2, radius * 2 * (1 - ratio));
        ctx.clip();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.globalAlpha = 0.88;
    ctx.strokeStyle = flash > 0.01 ? "rgba(255, 255, 210, 0.98)" : (unavailable ? "rgba(255, 255, 255, 0.32)" : "rgba(255, 255, 255, 0.66)");
    ctx.lineWidth = Math.max(1.25, radius * 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1.06 + flash * 0.35), 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.70;
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.beginPath();
    ctx.arc(-radius * 0.28, -radius * 0.32, radius * 0.23, 0, Math.PI * 2);
    ctx.fill();

    if (percent <= 0.5) {
        ctx.globalAlpha = 0.42 + 0.22 * Math.sin(time * 10);
        ctx.strokeStyle = "rgba(255, 80, 62, 0.76)";
        ctx.lineWidth = Math.max(1, radius * 0.12);
        ctx.beginPath();
        ctx.moveTo(-radius * 0.55, radius * 0.52);
        ctx.lineTo(radius * 0.55, -radius * 0.52);
        ctx.stroke();
    }

    ctx.restore();
}

function drawRocketFlameLocal(ctx, asset, pivot, time, power = 1, seed = 0) {
    const nozzleX = (0.5 - pivot.x) * asset.width;
    const nozzleY = (0.965 - pivot.y) * asset.height;
    const stablePower = clamp(power, 0.15, 1.2);
    const flutter = 0.96 + 0.04 * Math.sin(time * 33 + seed);
    const length = asset.height * 0.75 * stablePower * flutter;
    const width = asset.width * (0.16 + 0.08 * stablePower);

    ctx.save();
    ctx.translate(nozzleX, nozzleY);
    ctx.globalCompositeOperation = "lighter";

    // The rocket artwork points upward in local space, so the nozzle flame is a straight +Y plume.
    // No orbiting particles here: the long path trail is a separate world effect.
    const outer = ctx.createLinearGradient(0, 0, 0, length);
    outer.addColorStop(0, "rgba(255, 244, 149, 0.94)");
    outer.addColorStop(0.24, "rgba(255, 129, 62, 0.78)");
    outer.addColorStop(0.72, "rgba(189, 111, 255, 0.32)");
    outer.addColorStop(1, "rgba(255, 100, 45, 0)");
    ctx.fillStyle = outer;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(-width * 0.52, 0);
    ctx.lineTo(width * 0.52, 0);
    ctx.quadraticCurveTo(width * 0.12, length * 0.42, 0, length);
    ctx.quadraticCurveTo(-width * 0.16, length * 0.42, -width * 0.52, 0);
    ctx.closePath();
    ctx.fill();

    const inner = ctx.createLinearGradient(0, 0, 0, length * 0.64);
    inner.addColorStop(0, "rgba(255, 255, 214, 0.96)");
    inner.addColorStop(0.5, "rgba(255, 227, 91, 0.78)");
    inner.addColorStop(1, "rgba(255, 137, 54, 0)");
    ctx.fillStyle = inner;
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.moveTo(-width * 0.22, 0);
    ctx.lineTo(width * 0.22, 0);
    ctx.quadraticCurveTo(width * 0.06, length * 0.28, 0, length * 0.64);
    ctx.quadraticCurveTo(-width * 0.07, length * 0.28, -width * 0.22, 0);
    ctx.closePath();
    ctx.fill();

    const emberCount = Math.floor(4 + stablePower * 7);
    for (let i = 0; i < emberCount; i += 1) {
        const tick = Math.floor(time * 18);
        const down = (0.18 + hashNoise(seed + tick + 17, i) * 0.74) * length;
        const maxLateral = width * 0.18 * (1 - down / Math.max(1, length));
        const lateral = (hashNoise(seed + tick, i) - 0.5) * maxLateral;
        const size = 0.9 + hashNoise(seed + tick + 53, i) * 1.9;
        ctx.globalAlpha = 0.22 + hashNoise(seed + tick + 91, i) * 0.38;
        ctx.fillStyle = i % 3 === 0 ? "rgba(200, 151, 255, 0.82)" : "rgba(255, 240, 132, 0.86)";
        ctx.beginPath();
        ctx.arc(lateral, down, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function clonePose(pose) {
    return {
        poseMode: pose.poseMode,
        transforms: Object.fromEntries(
            Object.entries(pose.transforms).map(([name, transform]) => [name, { ...transform }])
        )
    };
}

function lerpTransform(from, to, alpha) {
    return {
        x: lerp(from.x, to.x, alpha),
        y: lerp(from.y, to.y, alpha),
        angle: lerpAngle(from.angle, to.angle, alpha),
        targetHeight: lerp(from.targetHeight, to.targetHeight, alpha),
        alpha: lerp(from.alpha, to.alpha, alpha)
    };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
    let delta = (b - a + Math.PI) % (Math.PI * 2) - Math.PI;
    if (delta < -Math.PI) {
        delta += Math.PI * 2;
    }
    return a + delta * t;
}

function hashNoise(seed, i) {
    const x = Math.sin((seed + 1) * 127.1 + (i + 3) * 311.7) * 43758.5453123;
    return x - Math.floor(x);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

function transformedSpriteBounds(asset, pivot, transform, spriteScale) {
    const corners = [
        { x: -pivot.x * asset.width, y: -pivot.y * asset.height },
        { x: (1 - pivot.x) * asset.width, y: -pivot.y * asset.height },
        { x: (1 - pivot.x) * asset.width, y: (1 - pivot.y) * asset.height },
        { x: -pivot.x * asset.width, y: (1 - pivot.y) * asset.height }
    ].map((corner) => {
        const scaled = { x: corner.x * spriteScale, y: corner.y * spriteScale };
        const rotated = rotatePoint(scaled.x, scaled.y, transform.angle);
        return { x: rotated.x + transform.x, y: rotated.y + transform.y };
    });

    return {
        minX: Math.min(...corners.map((p) => p.x)),
        minY: Math.min(...corners.map((p) => p.y)),
        maxX: Math.max(...corners.map((p) => p.x)),
        maxY: Math.max(...corners.map((p) => p.y))
    };
}

function mergeBounds(out, local, screenX, screenY, facing) {
    if (!local) {
        return;
    }
    const x1 = screenX + local.minX * facing;
    const x2 = screenX + local.maxX * facing;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    out.minX = Math.min(out.minX, minX);
    out.minY = Math.min(out.minY, screenY + local.minY);
    out.maxX = Math.max(out.maxX, maxX);
    out.maxY = Math.max(out.maxY, screenY + local.maxY);
}

function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) * 0.5, Math.abs(h) * 0.5);
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

function deepMerge(base, incoming) {
    if (Array.isArray(base)) {
        return Array.isArray(incoming) ? JSON.parse(JSON.stringify(incoming)) : JSON.parse(JSON.stringify(base));
    }
    if (!base || typeof base !== "object") {
        return incoming === undefined ? base : incoming;
    }
    const result = JSON.parse(JSON.stringify(base));
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
        return result;
    }
    for (const key of Object.keys(incoming)) {
        if (key in base) {
            result[key] = deepMerge(base[key], incoming[key]);
        } else {
            result[key] = JSON.parse(JSON.stringify(incoming[key]));
        }
    }
    return result;
}


function assetLineColor(kind) {
    if (kind === "walkable") return "rgba(88, 255, 158, 0.92)";
    if (kind === "blockable") return "rgba(255, 225, 94, 0.92)";
    if (kind === "damaging") return "rgba(255, 159, 67, 0.95)";
    if (kind === "killable") return "rgba(255, 79, 97, 0.95)";
    return "rgba(255, 255, 255, 0.85)";
}
