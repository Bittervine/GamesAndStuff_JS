window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-black-bloom",
  "title": "The Black Bloom",
  "summary": "When Oakenhurst’s orchards flower out of season and black pollen sickens the valley, the ranger uncovers a merchant’s plot to control the harvest by turning bees and blight into weapons.",
  "maxTurns": 20,
  "startNodeId": "T01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The queen hive is secured before the blight reaches the Riverland road. Master Halren faces Duke Aldric’s judgment, Tamsin preserves the healthy bees, and Oakenhurst begins saving cuttings from the trees that survived. The next harvest will be smaller, but it will belong to the valley rather than a single grasping hand.",
    "low": "The plot is broken, but not before several orchards are lost and the valley’s bees are scattered. Halren’s ledgers prove the crime, though recovery will take years of pruning, grafting, and patient work. When spring returns, Oakenhurst watches every unexpected blossom with care."
  },
  "nodes": [
    {
      "id": "T01A",
      "turn": 1,
      "title": "The silent orchard - healthy sign",
      "narrative": [
        "At Oakenhurst, every apple tree has flowered overnight though summer is weeks away. Duke Aldric sends you when the blossoms begin making villagers ill.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T02A"
        }
      ]
    },
    {
      "id": "T01B",
      "turn": 1,
      "title": "The silent orchard - uncertain bloom",
      "narrative": [
        "At Oakenhurst, every apple tree has flowered overnight though summer is weeks away. Duke Aldric sends you when the blossoms begin making villagers ill.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T02B"
        }
      ]
    },
    {
      "id": "T01C",
      "turn": 1,
      "title": "The silent orchard - late warning",
      "narrative": [
        "At Oakenhurst, every apple tree has flowered overnight though summer is weeks away. Duke Aldric sends you when the blossoms begin making villagers ill.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T02A",
      "turn": 2,
      "title": "Black petals - healthy sign",
      "narrative": [
        "The flowers are harmless to touch but shed black pollen near the river. A beekeeper named Tamsin says someone has moved hives into the old orchard.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T03B"
        }
      ]
    },
    {
      "id": "T02B",
      "turn": 2,
      "title": "Black petals - uncertain bloom",
      "narrative": [
        "The flowers are harmless to touch but shed black pollen near the river. A beekeeper named Tamsin says someone has moved hives into the old orchard.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T02C",
      "turn": 2,
      "title": "Black petals - late warning",
      "narrative": [
        "The flowers are harmless to touch but shed black pollen near the river. A beekeeper named Tamsin says someone has moved hives into the old orchard.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T03A"
        }
      ]
    },
    {
      "id": "T03A",
      "turn": 3,
      "title": "The beekeeper’s bell - healthy sign",
      "narrative": [
        "A bell from one of Tamsin’s hives lies cracked beside a fence, and cart tracks lead toward a locked granary.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T03B",
      "turn": 3,
      "title": "The beekeeper’s bell - uncertain bloom",
      "narrative": [
        "A bell from one of Tamsin’s hives lies cracked beside a fence, and cart tracks lead toward a locked granary.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T04A"
        }
      ]
    },
    {
      "id": "T03C",
      "turn": 3,
      "title": "The beekeeper’s bell - late warning",
      "narrative": [
        "A bell from one of Tamsin’s hives lies cracked beside a fence, and cart tracks lead toward a locked granary.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T04B"
        }
      ]
    },
    {
      "id": "T04A",
      "turn": 4,
      "title": "A locked granary - healthy sign",
      "narrative": [
        "The granary holds no grain, only empty bee frames, sacks of ash, and a map of orchards across Elderwood.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T05A"
        }
      ]
    },
    {
      "id": "T04B",
      "turn": 4,
      "title": "A locked granary - uncertain bloom",
      "narrative": [
        "The granary holds no grain, only empty bee frames, sacks of ash, and a map of orchards across Elderwood.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T05B"
        }
      ]
    },
    {
      "id": "T04C",
      "turn": 4,
      "title": "A locked granary - late warning",
      "narrative": [
        "The granary holds no grain, only empty bee frames, sacks of ash, and a map of orchards across Elderwood.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T05A",
      "turn": 5,
      "title": "The thorn road - healthy sign",
      "narrative": [
        "The cart tracks enter a thorn-choked road where no honest farmer would risk a loaded wagon.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T06B"
        }
      ]
    },
    {
      "id": "T05B",
      "turn": 5,
      "title": "The thorn road - uncertain bloom",
      "narrative": [
        "The cart tracks enter a thorn-choked road where no honest farmer would risk a loaded wagon.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T05C",
      "turn": 5,
      "title": "The thorn road - late warning",
      "narrative": [
        "The cart tracks enter a thorn-choked road where no honest farmer would risk a loaded wagon.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T06A"
        }
      ]
    },
    {
      "id": "T06A",
      "turn": 6,
      "title": "Old Wella’s account - healthy sign",
      "narrative": [
        "Old Wella, a charcoal burner, saw hooded workers carrying covered crates uphill. She also saw a child’s red scarf caught on a branch.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T06B",
      "turn": 6,
      "title": "Old Wella’s account - uncertain bloom",
      "narrative": [
        "Old Wella, a charcoal burner, saw hooded workers carrying covered crates uphill. She also saw a child’s red scarf caught on a branch.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T07A"
        }
      ]
    },
    {
      "id": "T06C",
      "turn": 6,
      "title": "Old Wella’s account - late warning",
      "narrative": [
        "Old Wella, a charcoal burner, saw hooded workers carrying covered crates uphill. She also saw a child’s red scarf caught on a branch.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T07B"
        }
      ]
    },
    {
      "id": "T07A",
      "turn": 7,
      "title": "The vanished carts - healthy sign",
      "narrative": [
        "The scarf belongs to Pell, a farm boy missing since yesterday. His footprints stop beside three fresh cart ruts.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T08A"
        }
      ]
    },
    {
      "id": "T07B",
      "turn": 7,
      "title": "The vanished carts - uncertain bloom",
      "narrative": [
        "The scarf belongs to Pell, a farm boy missing since yesterday. His footprints stop beside three fresh cart ruts.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T08B"
        }
      ]
    },
    {
      "id": "T07C",
      "turn": 7,
      "title": "The vanished carts - late warning",
      "narrative": [
        "The scarf belongs to Pell, a farm boy missing since yesterday. His footprints stop beside three fresh cart ruts.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T08A",
      "turn": 8,
      "title": "The hill chapel - healthy sign",
      "narrative": [
        "A hill chapel shelters Pell, frightened but safe. He says the workers spoke of a ‘queen beneath the roots.’",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T09B"
        }
      ]
    },
    {
      "id": "T08B",
      "turn": 8,
      "title": "The hill chapel - uncertain bloom",
      "narrative": [
        "A hill chapel shelters Pell, frightened but safe. He says the workers spoke of a ‘queen beneath the roots.’",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T08C",
      "turn": 8,
      "title": "The hill chapel - late warning",
      "narrative": [
        "A hill chapel shelters Pell, frightened but safe. He says the workers spoke of a ‘queen beneath the roots.’",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T09A"
        }
      ]
    },
    {
      "id": "T09A",
      "turn": 9,
      "title": "The wax seal - healthy sign",
      "narrative": [
        "A wax seal found in the chapel bears the mark of a merchant guild that has supplied Oakenhurst for years.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T09B",
      "turn": 9,
      "title": "The wax seal - uncertain bloom",
      "narrative": [
        "A wax seal found in the chapel bears the mark of a merchant guild that has supplied Oakenhurst for years.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T10A"
        }
      ]
    },
    {
      "id": "T09C",
      "turn": 9,
      "title": "The wax seal - late warning",
      "narrative": [
        "A wax seal found in the chapel bears the mark of a merchant guild that has supplied Oakenhurst for years.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T10B"
        }
      ]
    },
    {
      "id": "T10A",
      "turn": 10,
      "title": "Under the roots - healthy sign",
      "narrative": [
        "The trail ends at an enormous fallen oak. Beneath its roots, you find a cellar containing hives kept in winter darkness.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T11A"
        }
      ]
    },
    {
      "id": "T10B",
      "turn": 10,
      "title": "Under the roots - uncertain bloom",
      "narrative": [
        "The trail ends at an enormous fallen oak. Beneath its roots, you find a cellar containing hives kept in winter darkness.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T11B"
        }
      ]
    },
    {
      "id": "T10C",
      "turn": 10,
      "title": "Under the roots - late warning",
      "narrative": [
        "The trail ends at an enormous fallen oak. Beneath its roots, you find a cellar containing hives kept in winter darkness.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T11A",
      "turn": 11,
      "title": "The winter ledger - healthy sign",
      "narrative": [
        "The hives are fed with sugar and bitter herbs. A ledger records deliveries to villages whose orchards have recently failed.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T12B"
        }
      ]
    },
    {
      "id": "T11B",
      "turn": 11,
      "title": "The winter ledger - uncertain bloom",
      "narrative": [
        "The hives are fed with sugar and bitter herbs. A ledger records deliveries to villages whose orchards have recently failed.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T11C",
      "turn": 11,
      "title": "The winter ledger - late warning",
      "narrative": [
        "The hives are fed with sugar and bitter herbs. A ledger records deliveries to villages whose orchards have recently failed.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T12A"
        }
      ]
    },
    {
      "id": "T12A",
      "turn": 12,
      "title": "A traitor’s trail - healthy sign",
      "narrative": [
        "The ledger’s author is not a guild clerk but Master Halren, Aldric’s appointed orchard steward.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T12B",
      "turn": 12,
      "title": "A traitor’s trail - uncertain bloom",
      "narrative": [
        "The ledger’s author is not a guild clerk but Master Halren, Aldric’s appointed orchard steward.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T13A"
        }
      ]
    },
    {
      "id": "T12C",
      "turn": 12,
      "title": "A traitor’s trail - late warning",
      "narrative": [
        "The ledger’s author is not a guild clerk but Master Halren, Aldric’s appointed orchard steward.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T13B"
        }
      ]
    },
    {
      "id": "T13A",
      "turn": 13,
      "title": "The orchard watch - healthy sign",
      "narrative": [
        "Halren’s watchmen surround the cellar, claiming the hives are part of a lawful experiment to save the harvest.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T14A"
        }
      ]
    },
    {
      "id": "T13B",
      "turn": 13,
      "title": "The orchard watch - uncertain bloom",
      "narrative": [
        "Halren’s watchmen surround the cellar, claiming the hives are part of a lawful experiment to save the harvest.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T14B"
        }
      ]
    },
    {
      "id": "T13C",
      "turn": 13,
      "title": "The orchard watch - late warning",
      "narrative": [
        "Halren’s watchmen surround the cellar, claiming the hives are part of a lawful experiment to save the harvest.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T14A",
      "turn": 14,
      "title": "The hollow tree - healthy sign",
      "narrative": [
        "Tamsin proves the experiment is spreading a cultivated blight through the black pollen. Halren’s men have been paid to guard it.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T15B"
        }
      ]
    },
    {
      "id": "T14B",
      "turn": 14,
      "title": "The hollow tree - uncertain bloom",
      "narrative": [
        "Tamsin proves the experiment is spreading a cultivated blight through the black pollen. Halren’s men have been paid to guard it.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T14C",
      "turn": 14,
      "title": "The hollow tree - late warning",
      "narrative": [
        "Tamsin proves the experiment is spreading a cultivated blight through the black pollen. Halren’s men have been paid to guard it.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T15A"
        }
      ]
    },
    {
      "id": "T15A",
      "turn": 15,
      "title": "The queen’s mark - healthy sign",
      "narrative": [
        "A carved mark on the largest hive shows the planned route: every orchard between Elderwood and the Riverland road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T15B",
      "turn": 15,
      "title": "The queen’s mark - uncertain bloom",
      "narrative": [
        "A carved mark on the largest hive shows the planned route: every orchard between Elderwood and the Riverland road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T16A"
        }
      ]
    },
    {
      "id": "T15C",
      "turn": 15,
      "title": "The queen’s mark - late warning",
      "narrative": [
        "A carved mark on the largest hive shows the planned route: every orchard between Elderwood and the Riverland road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T16B"
        }
      ]
    },
    {
      "id": "T16A",
      "turn": 16,
      "title": "The night harvest - healthy sign",
      "narrative": [
        "Halren admits he intended to control the next harvest by destroying rival orchards, then selling resistant cuttings at a fortune.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T17A"
        }
      ]
    },
    {
      "id": "T16B",
      "turn": 16,
      "title": "The night harvest - uncertain bloom",
      "narrative": [
        "Halren admits he intended to control the next harvest by destroying rival orchards, then selling resistant cuttings at a fortune.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T17B"
        }
      ]
    },
    {
      "id": "T16C",
      "turn": 16,
      "title": "The night harvest - late warning",
      "narrative": [
        "Halren admits he intended to control the next harvest by destroying rival orchards, then selling resistant cuttings at a fortune.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": false
        }
      ]
    },
    {
      "id": "T17A",
      "turn": 17,
      "title": "The burning line - healthy sign",
      "narrative": [
        "The first burning begins near the eastern fields. Smoke drives the bees into the valley, while Halren’s men block the well road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T18B"
        }
      ]
    },
    {
      "id": "T17B",
      "turn": 17,
      "title": "The burning line - uncertain bloom",
      "narrative": [
        "The first burning begins near the eastern fields. Smoke drives the bees into the valley, while Halren’s men block the well road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        }
      ]
    },
    {
      "id": "T17C",
      "turn": 17,
      "title": "The burning line - late warning",
      "narrative": [
        "The first burning begins near the eastern fields. Smoke drives the bees into the valley, while Halren’s men block the well road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T18A"
        }
      ]
    },
    {
      "id": "T18A",
      "turn": 18,
      "title": "The last hive - healthy sign",
      "narrative": [
        "You split the wardens between the fires and the cellar. The queen hive is being carried toward the orchard ridge.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        }
      ]
    },
    {
      "id": "T18B",
      "turn": 18,
      "title": "The last hive - uncertain bloom",
      "narrative": [
        "You split the wardens between the fires and the cellar. The queen hive is being carried toward the orchard ridge.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T19A"
        }
      ]
    },
    {
      "id": "T18C",
      "turn": 18,
      "title": "The last hive - late warning",
      "narrative": [
        "You split the wardens between the fires and the cellar. The queen hive is being carried toward the orchard ridge.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T19B"
        }
      ]
    },
    {
      "id": "T19A",
      "turn": 19,
      "title": "Dawn at Oakenhurst - healthy sign",
      "narrative": [
        "A storm breaks over Oakenhurst. Tamsin reaches the hives, Pell leads villagers to the wells, and Halren runs for the merchant road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T20A"
        }
      ]
    },
    {
      "id": "T19B",
      "turn": 19,
      "title": "Dawn at Oakenhurst - uncertain bloom",
      "narrative": [
        "A storm breaks over Oakenhurst. Tamsin reaches the hives, Pell leads villagers to the wells, and Halren runs for the merchant road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T20B"
        }
      ]
    },
    {
      "id": "T19C",
      "turn": 19,
      "title": "Dawn at Oakenhurst - late warning",
      "narrative": [
        "A storm breaks over Oakenhurst. Tamsin reaches the hives, Pell leads villagers to the wells, and Halren runs for the merchant road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "nextNodeId": "T20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "nextNodeId": "T20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        }
      ]
    },
    {
      "id": "T20A",
      "turn": 20,
      "title": "Green shoots - healthy sign",
      "narrative": [
        "By morning, the blighted hives are secured and the surviving trees are marked for careful pruning. Oakenhurst’s first honest harvest begins the long recovery.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "T20B",
      "turn": 20,
      "title": "Green shoots - uncertain bloom",
      "narrative": [
        "By morning, the blighted hives are secured and the surviving trees are marked for careful pruning. Oakenhurst’s first honest harvest begins the long recovery.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        }
      ]
    },
    {
      "id": "T20C",
      "turn": 20,
      "title": "Green shoots - late warning",
      "narrative": [
        "By morning, the blighted hives are secured and the surviving trees are marked for careful pruning. Oakenhurst’s first honest harvest begins the long recovery.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest orchard, then follow the safest trail onward.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strange hive without learning what is spreading.",
          "failTitle": "The Harvest Fails",
          "failText": "The careless choice scatters the blight and leaves Oakenhurst without a clear way to contain it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the living evidence and protect the people before pursuing the culprit.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
