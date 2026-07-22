window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-tabby-at-the-quarry",
  "title": "The Tabby at the Quarry",
  "summary": "When grain stores vanish from Oakenhurst, a gray silver tabby with green eyes helps the ranger uncover a dismissed captain’s plan to arm the forest roads beneath a cover of false plague orders.",
  "maxTurns": 20,
  "startNodeId": "U01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The weapons are seized at the quarry before they reach the forest roads. Captain Rusk faces trial, the forged plague order is exposed, and Lysa’s testimony clears the mill from suspicion. The gray silver tabby remains at the granary, accepting scraps from everyone and allegiance from no one.",
    "low": "The plot is broken, but several carts escape into Elderwood and the stolen grain is not all recovered. Rusk’s larger allies remain uncertain, so Duke Aldric strengthens the roads and watches the old quarry. Whenever the tabby appears at a gate, the wardens now look twice."
  },
  "nodes": [
    {
      "id": "U01A",
      "turn": 1,
      "title": "The cat at the gate - sharp clue",
      "narrative": [
        "At a rain-dark gate outside Oakenhurst, a gray silver tabby with green eyes watches you from the wall before vanishing into the guardhouse.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U02A"
        }
      ]
    },
    {
      "id": "U01B",
      "turn": 1,
      "title": "The cat at the gate - steady search",
      "narrative": [
        "At a rain-dark gate outside Oakenhurst, a gray silver tabby with green eyes watches you from the wall before vanishing into the guardhouse.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U02B"
        }
      ]
    },
    {
      "id": "U01C",
      "turn": 1,
      "title": "The cat at the gate - lost ground",
      "narrative": [
        "At a rain-dark gate outside Oakenhurst, a gray silver tabby with green eyes watches you from the wall before vanishing into the guardhouse.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U02A",
      "turn": 2,
      "title": "A missing bell - sharp clue",
      "narrative": [
        "The cat reappears beside a missing chapel bell, pawing at mud where a cart was turned around.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U03B"
        }
      ]
    },
    {
      "id": "U02B",
      "turn": 2,
      "title": "A missing bell - steady search",
      "narrative": [
        "The cat reappears beside a missing chapel bell, pawing at mud where a cart was turned around.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U02C",
      "turn": 2,
      "title": "A missing bell - lost ground",
      "narrative": [
        "The cat reappears beside a missing chapel bell, pawing at mud where a cart was turned around.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U03A"
        }
      ]
    },
    {
      "id": "U03A",
      "turn": 3,
      "title": "Tracks in flour - sharp clue",
      "narrative": [
        "Flour scattered across a bakery floor shows boot prints and small cat tracks leading to a shuttered mill.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U03B",
      "turn": 3,
      "title": "Tracks in flour - steady search",
      "narrative": [
        "Flour scattered across a bakery floor shows boot prints and small cat tracks leading to a shuttered mill.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U04A"
        }
      ]
    },
    {
      "id": "U03C",
      "turn": 3,
      "title": "Tracks in flour - lost ground",
      "narrative": [
        "Flour scattered across a bakery floor shows boot prints and small cat tracks leading to a shuttered mill.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U04B"
        }
      ]
    },
    {
      "id": "U04A",
      "turn": 4,
      "title": "The cold kitchen - sharp clue",
      "narrative": [
        "The mill kitchen is cold despite fresh ashes. The tabby slips through a broken vent and draws your eye to a loose stone.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U05A"
        }
      ]
    },
    {
      "id": "U04B",
      "turn": 4,
      "title": "The cold kitchen - steady search",
      "narrative": [
        "The mill kitchen is cold despite fresh ashes. The tabby slips through a broken vent and draws your eye to a loose stone.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U05B"
        }
      ]
    },
    {
      "id": "U04C",
      "turn": 4,
      "title": "The cold kitchen - lost ground",
      "narrative": [
        "The mill kitchen is cold despite fresh ashes. The tabby slips through a broken vent and draws your eye to a loose stone.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U05A",
      "turn": 5,
      "title": "The miller’s daughter - sharp clue",
      "narrative": [
        "Miller’s daughter Lysa says the cat has appeared each night since grain began disappearing from sealed stores.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U06B"
        }
      ]
    },
    {
      "id": "U05B",
      "turn": 5,
      "title": "The miller’s daughter - steady search",
      "narrative": [
        "Miller’s daughter Lysa says the cat has appeared each night since grain began disappearing from sealed stores.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U05C",
      "turn": 5,
      "title": "The miller’s daughter - lost ground",
      "narrative": [
        "Miller’s daughter Lysa says the cat has appeared each night since grain began disappearing from sealed stores.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U06A"
        }
      ]
    },
    {
      "id": "U06A",
      "turn": 6,
      "title": "The stone culvert - sharp clue",
      "narrative": [
        "A stone culvert beneath the mill carries wheel ruts toward the old quarry road, but the water is too shallow to hide a loaded cart.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U06B",
      "turn": 6,
      "title": "The stone culvert - steady search",
      "narrative": [
        "A stone culvert beneath the mill carries wheel ruts toward the old quarry road, but the water is too shallow to hide a loaded cart.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U07A"
        }
      ]
    },
    {
      "id": "U06C",
      "turn": 6,
      "title": "The stone culvert - lost ground",
      "narrative": [
        "A stone culvert beneath the mill carries wheel ruts toward the old quarry road, but the water is too shallow to hide a loaded cart.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U07B"
        }
      ]
    },
    {
      "id": "U07A",
      "turn": 7,
      "title": "A green-eyed warning - sharp clue",
      "narrative": [
        "The cat creates a sudden commotion among stacked baskets, distracting a hidden watcher long enough for you to find his dropped key.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U08A"
        }
      ]
    },
    {
      "id": "U07B",
      "turn": 7,
      "title": "A green-eyed warning - steady search",
      "narrative": [
        "The cat creates a sudden commotion among stacked baskets, distracting a hidden watcher long enough for you to find his dropped key.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U08B"
        }
      ]
    },
    {
      "id": "U07C",
      "turn": 7,
      "title": "A green-eyed warning - lost ground",
      "narrative": [
        "The cat creates a sudden commotion among stacked baskets, distracting a hidden watcher long enough for you to find his dropped key.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U08A",
      "turn": 8,
      "title": "The hidden sacks - sharp clue",
      "narrative": [
        "Behind the mill, sacks marked as oats contain salt, lamp oil, and folded strips of royal blue cloth.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U09B"
        }
      ]
    },
    {
      "id": "U08B",
      "turn": 8,
      "title": "The hidden sacks - steady search",
      "narrative": [
        "Behind the mill, sacks marked as oats contain salt, lamp oil, and folded strips of royal blue cloth.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U08C",
      "turn": 8,
      "title": "The hidden sacks - lost ground",
      "narrative": [
        "Behind the mill, sacks marked as oats contain salt, lamp oil, and folded strips of royal blue cloth.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U09A"
        }
      ]
    },
    {
      "id": "U09A",
      "turn": 9,
      "title": "The night watch - sharp clue",
      "narrative": [
        "At night, the guardhouse watchman admits he was paid to ignore carts leaving after curfew. He names no payer.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U09B",
      "turn": 9,
      "title": "The night watch - steady search",
      "narrative": [
        "At night, the guardhouse watchman admits he was paid to ignore carts leaving after curfew. He names no payer.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U10A"
        }
      ]
    },
    {
      "id": "U09C",
      "turn": 9,
      "title": "The night watch - lost ground",
      "narrative": [
        "At night, the guardhouse watchman admits he was paid to ignore carts leaving after curfew. He names no payer.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U10B"
        }
      ]
    },
    {
      "id": "U10A",
      "turn": 10,
      "title": "The false priest - sharp clue",
      "narrative": [
        "A false priest arrives with a letter ordering the stores moved for plague safety. The seal is good, but the wording is wrong.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U11A"
        }
      ]
    },
    {
      "id": "U10B",
      "turn": 10,
      "title": "The false priest - steady search",
      "narrative": [
        "A false priest arrives with a letter ordering the stores moved for plague safety. The seal is good, but the wording is wrong.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U11B"
        }
      ]
    },
    {
      "id": "U10C",
      "turn": 10,
      "title": "The false priest - lost ground",
      "narrative": [
        "A false priest arrives with a letter ordering the stores moved for plague safety. The seal is good, but the wording is wrong.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U11A",
      "turn": 11,
      "title": "Beneath the granary - sharp clue",
      "narrative": [
        "Beneath the granary, you find a chamber where stolen goods are repacked for a road that reaches Elderwood.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U12B"
        }
      ]
    },
    {
      "id": "U11B",
      "turn": 11,
      "title": "Beneath the granary - steady search",
      "narrative": [
        "Beneath the granary, you find a chamber where stolen goods are repacked for a road that reaches Elderwood.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U11C",
      "turn": 11,
      "title": "Beneath the granary - lost ground",
      "narrative": [
        "Beneath the granary, you find a chamber where stolen goods are repacked for a road that reaches Elderwood.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U12A"
        }
      ]
    },
    {
      "id": "U12A",
      "turn": 12,
      "title": "The burned tally - sharp clue",
      "narrative": [
        "A burned tally reveals the thefts are funding armed men, not simple smuggling. One surviving mark names the old quarry.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U12B",
      "turn": 12,
      "title": "The burned tally - steady search",
      "narrative": [
        "A burned tally reveals the thefts are funding armed men, not simple smuggling. One surviving mark names the old quarry.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U13A"
        }
      ]
    },
    {
      "id": "U12C",
      "turn": 12,
      "title": "The burned tally - lost ground",
      "narrative": [
        "A burned tally reveals the thefts are funding armed men, not simple smuggling. One surviving mark names the old quarry.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U13B"
        }
      ]
    },
    {
      "id": "U13A",
      "turn": 13,
      "title": "The road to Elderwood - sharp clue",
      "narrative": [
        "The quarry road climbs through wet pine. Lysa follows with a lantern, while the tabby keeps slipping ahead into the brush.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U14A"
        }
      ]
    },
    {
      "id": "U13B",
      "turn": 13,
      "title": "The road to Elderwood - steady search",
      "narrative": [
        "The quarry road climbs through wet pine. Lysa follows with a lantern, while the tabby keeps slipping ahead into the brush.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U14B"
        }
      ]
    },
    {
      "id": "U13C",
      "turn": 13,
      "title": "The road to Elderwood - lost ground",
      "narrative": [
        "The quarry road climbs through wet pine. Lysa follows with a lantern, while the tabby keeps slipping ahead into the brush.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U14A",
      "turn": 14,
      "title": "A room without windows - sharp clue",
      "narrative": [
        "An empty quarry room contains bedrolls, bowstrings, and a wall map showing every road between Oakenhurst and the Gray Mountains.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U15B"
        }
      ]
    },
    {
      "id": "U14B",
      "turn": 14,
      "title": "A room without windows - steady search",
      "narrative": [
        "An empty quarry room contains bedrolls, bowstrings, and a wall map showing every road between Oakenhurst and the Gray Mountains.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U14C",
      "turn": 14,
      "title": "A room without windows - lost ground",
      "narrative": [
        "An empty quarry room contains bedrolls, bowstrings, and a wall map showing every road between Oakenhurst and the Gray Mountains.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U15A"
        }
      ]
    },
    {
      "id": "U15A",
      "turn": 15,
      "title": "The cat leads on - sharp clue",
      "narrative": [
        "The cat pauses at a blank wall and stares until you notice fresh dust along the floor. Behind it lies a narrow passage.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        }
      ]
    },
    {
      "id": "U15B",
      "turn": 15,
      "title": "The cat leads on - steady search",
      "narrative": [
        "The cat pauses at a blank wall and stares until you notice fresh dust along the floor. Behind it lies a narrow passage.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U16A"
        }
      ]
    },
    {
      "id": "U15C",
      "turn": 15,
      "title": "The cat leads on - lost ground",
      "narrative": [
        "The cat pauses at a blank wall and stares until you notice fresh dust along the floor. Behind it lies a narrow passage.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U16B"
        }
      ]
    },
    {
      "id": "U16A",
      "turn": 16,
      "title": "The old quarry - sharp clue",
      "narrative": [
        "The passage opens above the quarry floor, where three men load carts under a blue banner stripped of its crest.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U17A"
        }
      ]
    },
    {
      "id": "U16B",
      "turn": 16,
      "title": "The old quarry - steady search",
      "narrative": [
        "The passage opens above the quarry floor, where three men load carts under a blue banner stripped of its crest.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U17B"
        }
      ]
    },
    {
      "id": "U16C",
      "turn": 16,
      "title": "The old quarry - lost ground",
      "narrative": [
        "The passage opens above the quarry floor, where three men load carts under a blue banner stripped of its crest.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        }
      ]
    },
    {
      "id": "U17A",
      "turn": 17,
      "title": "The empty carts - sharp clue",
      "narrative": [
        "The carts are not carrying food but weapons hidden beneath grain chaff. Their leader is Captain Rusk, a dismissed officer.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U18B"
        }
      ]
    },
    {
      "id": "U17B",
      "turn": 17,
      "title": "The empty carts - steady search",
      "narrative": [
        "The carts are not carrying food but weapons hidden beneath grain chaff. Their leader is Captain Rusk, a dismissed officer.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        }
      ]
    },
    {
      "id": "U17C",
      "turn": 17,
      "title": "The empty carts - lost ground",
      "narrative": [
        "The carts are not carrying food but weapons hidden beneath grain chaff. Their leader is Captain Rusk, a dismissed officer.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U18A"
        }
      ]
    },
    {
      "id": "U18A",
      "turn": 18,
      "title": "The rope bridge - sharp clue",
      "narrative": [
        "Rusk retreats across a rope bridge while his men cut the rear lines. The tabby darts along the far side and disappears into the fog.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        }
      ]
    },
    {
      "id": "U18B",
      "turn": 18,
      "title": "The rope bridge - steady search",
      "narrative": [
        "Rusk retreats across a rope bridge while his men cut the rear lines. The tabby darts along the far side and disappears into the fog.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U19A"
        }
      ]
    },
    {
      "id": "U18C",
      "turn": 18,
      "title": "The rope bridge - lost ground",
      "narrative": [
        "Rusk retreats across a rope bridge while his men cut the rear lines. The tabby darts along the far side and disappears into the fog.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U19B"
        }
      ]
    },
    {
      "id": "U19A",
      "turn": 19,
      "title": "The bell rings - sharp clue",
      "narrative": [
        "The bridge sways as Lysa rings the recovered chapel bell, warning the quarry workers and nearby farms to bar their doors.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U20A"
        }
      ]
    },
    {
      "id": "U19B",
      "turn": 19,
      "title": "The bell rings - steady search",
      "narrative": [
        "The bridge sways as Lysa rings the recovered chapel bell, warning the quarry workers and nearby farms to bar their doors.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U20B"
        }
      ]
    },
    {
      "id": "U19C",
      "turn": 19,
      "title": "The bell rings - lost ground",
      "narrative": [
        "The bridge sways as Lysa rings the recovered chapel bell, warning the quarry workers and nearby farms to bar their doors.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "nextNodeId": "U20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "nextNodeId": "U20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        }
      ]
    },
    {
      "id": "U20A",
      "turn": 20,
      "title": "A quiet hearth - sharp clue",
      "narrative": [
        "By dawn, the weapons are secured, Rusk is taken for trial, and the cat sits on the granary step as if it had always belonged there.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "U20B",
      "turn": 20,
      "title": "A quiet hearth - steady search",
      "narrative": [
        "By dawn, the weapons are secured, Rusk is taken for trial, and the cat sits on the granary step as if it had always belonged there.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        }
      ]
    },
    {
      "id": "U20C",
      "turn": 20,
      "title": "A quiet hearth - lost ground",
      "narrative": [
        "By dawn, the weapons are secured, Rusk is taken for trial, and the cat sits on the granary step as if it had always belonged there.",
        "The gray silver tabby keeps near the edges of the scene, green eyes bright in the dimness. Its sudden attention often matters more than its silence.",
        "You weigh the animal’s warning against footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the people nearby, then continue along the next sound trail.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the small signs and trust the loudest official voice.",
          "failTitle": "The Trail Goes Cold",
          "failText": "The conspirators gain the distance they need, and the hidden weapons reach the forest roads before the warning can spread.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cat’s warning and verify the clue before moving.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
