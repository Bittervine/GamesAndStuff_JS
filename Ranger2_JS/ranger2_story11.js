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
        "Lysa watches the road while you sort the fresh signs at the cat at the gate.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the cat at the gate now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the gate watch who last handled the grain keys.",
          "scoreDelta": 0,
          "nextNodeId": "U02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the cat and accuse the nearest hungry traveler.",
          "failTitle": "Failure at The cat at the gate",
          "failText": "A reckless decision at the cat at the gate gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the guardhouse where the tabby disappeared.",
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
        "After securing the previous scene, you continue to the cat at the gate. At a rain-dark gate outside Oakenhurst, a gray silver tabby with green eyes watches you from the wall before vanishing into the guardhouse.",
        "With Lysa guarding the approach, you separate rumor from evidence at the cat at the gate.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the cat at the gate in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the cat and accuse the nearest hungry traveler, taking time to verify each step.",
          "failTitle": "Failure at The cat at the gate",
          "failText": "A reckless decision at the cat at the gate gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the guardhouse where the tabby disappeared, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U02B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the gate watch who last handled the grain keys, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U02C"
        }
      ]
    },
    {
      "id": "U01C",
      "turn": 1,
      "title": "The cat at the gate - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the cat at the gate. At a rain-dark gate outside Oakenhurst, a gray silver tabby with green eyes watches you from the wall before vanishing into the guardhouse.",
        "Lysa helps recover the weakened trail at the cat at the gate before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the cat at the gate can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the guardhouse where the tabby disappeared, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the gate watch who last handled the grain keys, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U02A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the cat and accuse the nearest hungry traveler, despite the ground already lost.",
          "failTitle": "Failure at The cat at the gate",
          "failText": "A reckless decision at the cat at the gate gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U02A",
      "turn": 2,
      "title": "A missing bell - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to a missing bell. The missing chapel bell lies beside churned mud where a cart was turned around.",
        "Lysa watches the road while you sort the fresh signs at a missing bell.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from a missing bell now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the recovered bell and warn the thieves.",
          "failTitle": "Failure at A missing bell",
          "failText": "A reckless decision at a missing bell gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the turned cart marks beside the missing bell.",
          "scoreDelta": 1,
          "nextNodeId": "U03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Measure the wheel track before moving the bell.",
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
        "After securing the previous scene, you continue to a missing bell. The missing chapel bell lies beside churned mud where a cart was turned around.",
        "With Lysa guarding the approach, you separate rumor from evidence at a missing bell.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving a missing bell in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the turned cart marks beside the missing bell, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Measure the wheel track before moving the bell, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U03C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the recovered bell and warn the thieves, taking time to verify each step.",
          "failTitle": "Failure at A missing bell",
          "failText": "A reckless decision at a missing bell gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U02C",
      "turn": 2,
      "title": "A missing bell - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a missing bell. The missing chapel bell lies beside churned mud where a cart was turned around.",
        "Lysa helps recover the weakened trail at a missing bell before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at a missing bell can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Measure the wheel track before moving the bell, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the recovered bell and warn the thieves, despite the ground already lost.",
          "failTitle": "Failure at A missing bell",
          "failText": "A reckless decision at a missing bell gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the turned cart marks beside the missing bell, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U03C"
        }
      ]
    },
    {
      "id": "U03A",
      "turn": 3,
      "title": "Tracks in flour - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to tracks in flour. Flour scattered across a bakery floor shows boot prints and small animal tracks leading to a shuttered mill.",
        "Lysa watches the road while you sort the fresh signs at tracks in flour.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from tracks in flour now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the flour prints before the bakery is swept.",
          "scoreDelta": 1,
          "nextNodeId": "U04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the baker while Lysa watches the shutters.",
          "scoreDelta": 0,
          "nextNodeId": "U04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the clearest footprint without checking its direction.",
          "failTitle": "Failure at Tracks in flour",
          "failText": "A reckless decision at tracks in flour gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U03B",
      "turn": 3,
      "title": "Tracks in flour - steady search",
      "narrative": [
        "After securing the previous scene, you continue to tracks in flour. Flour scattered across a bakery floor shows boot prints and small animal tracks leading to a shuttered mill.",
        "With Lysa guarding the approach, you separate rumor from evidence at tracks in flour.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving tracks in flour in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the baker while Lysa watches the shutters, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the clearest footprint without checking its direction, taking time to verify each step.",
          "failTitle": "Failure at Tracks in flour",
          "failText": "A reckless decision at tracks in flour gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the flour prints before the bakery is swept, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U04B"
        }
      ]
    },
    {
      "id": "U03C",
      "turn": 3,
      "title": "Tracks in flour - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to tracks in flour. Flour scattered across a bakery floor shows boot prints and small animal tracks leading to a shuttered mill.",
        "Lysa helps recover the weakened trail at tracks in flour before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at tracks in flour can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the clearest footprint without checking its direction, despite the ground already lost.",
          "failTitle": "Failure at Tracks in flour",
          "failText": "A reckless decision at tracks in flour gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the flour prints before the bakery is swept, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U04C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the baker while Lysa watches the shutters, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U04A"
        }
      ]
    },
    {
      "id": "U04A",
      "turn": 4,
      "title": "The cold kitchen - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the cold kitchen. The mill kitchen is cold despite fresh ashes. A draft through a broken vent stirs a hanging cloth and exposes a loose stone.",
        "Lysa watches the road while you sort the fresh signs at the cold kitchen.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the cold kitchen now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the cold kitchen for signs of recent occupation.",
          "scoreDelta": 0,
          "nextNodeId": "U05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light a great fire in the blocked hearth.",
          "failTitle": "Failure at The cold kitchen",
          "failText": "A reckless decision at the cold kitchen gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the draft through the vent and examine the loose stone.",
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
        "After securing the previous scene, you continue to the cold kitchen. The mill kitchen is cold despite fresh ashes. A draft through a broken vent stirs a hanging cloth and exposes a loose stone.",
        "With Lysa guarding the approach, you separate rumor from evidence at the cold kitchen.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the cold kitchen in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Light a great fire in the blocked hearth, taking time to verify each step.",
          "failTitle": "Failure at The cold kitchen",
          "failText": "A reckless decision at the cold kitchen gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the draft through the vent and examine the loose stone, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U05B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the cold kitchen for signs of recent occupation, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U05C"
        }
      ]
    },
    {
      "id": "U04C",
      "turn": 4,
      "title": "The cold kitchen - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the cold kitchen. The mill kitchen is cold despite fresh ashes. A draft through a broken vent stirs a hanging cloth and exposes a loose stone.",
        "Lysa helps recover the weakened trail at the cold kitchen before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the cold kitchen can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the draft through the vent and examine the loose stone, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the cold kitchen for signs of recent occupation, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U05A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light a great fire in the blocked hearth, despite the ground already lost.",
          "failTitle": "Failure at The cold kitchen",
          "failText": "A reckless decision at the cold kitchen gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U05A",
      "turn": 5,
      "title": "The miller’s daughter - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the miller’s daughter. Miller’s daughter Lysa says a stranger has appeared by the mill each night since grain began disappearing from sealed stores.",
        "Lysa watches the road while you sort the fresh signs at the miller’s daughter.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the miller’s daughter now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse the miller’s daughter of arranging every theft.",
          "failTitle": "Failure at The miller’s daughter",
          "failText": "A reckless decision at the miller’s daughter gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ask Lysa when the grain losses and nightly visits began.",
          "scoreDelta": 1,
          "nextNodeId": "U06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place Lysa under protection before searching the mill.",
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
        "After securing the previous scene, you continue to the miller’s daughter. Miller’s daughter Lysa says a stranger has appeared by the mill each night since grain began disappearing from sealed stores.",
        "With Lysa guarding the approach, you separate rumor from evidence at the miller’s daughter.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the miller’s daughter in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ask Lysa when the grain losses and nightly visits began, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place Lysa under protection before searching the mill, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U06C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse the miller’s daughter of arranging every theft, taking time to verify each step.",
          "failTitle": "Failure at The miller’s daughter",
          "failText": "A reckless decision at the miller’s daughter gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U05C",
      "turn": 5,
      "title": "The miller’s daughter - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the miller’s daughter. Miller’s daughter Lysa says a stranger has appeared by the mill each night since grain began disappearing from sealed stores.",
        "Lysa helps recover the weakened trail at the miller’s daughter before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the miller’s daughter can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Place Lysa under protection before searching the mill, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse the miller’s daughter of arranging every theft, despite the ground already lost.",
          "failTitle": "Failure at The miller’s daughter",
          "failText": "A reckless decision at the miller’s daughter gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ask Lysa when the grain losses and nightly visits began, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U06C"
        }
      ]
    },
    {
      "id": "U06A",
      "turn": 6,
      "title": "The stone culvert - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the stone culvert. A stone culvert beneath the mill carries wheel ruts toward the old quarry road, but the water is too shallow to hide a loaded cart.",
        "Lysa watches the road while you sort the fresh signs at the stone culvert.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the stone culvert now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark the culvert exits and follow the shallow wheel ruts.",
          "scoreDelta": 1,
          "nextNodeId": "U07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a warden aboveground while you inspect the tunnel.",
          "scoreDelta": 0,
          "nextNodeId": "U07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Crawl into the culvert alone during rising water.",
          "failTitle": "Failure at The stone culvert",
          "failText": "A reckless decision at the stone culvert gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U06B",
      "turn": 6,
      "title": "The stone culvert - steady search",
      "narrative": [
        "After securing the previous scene, you continue to the stone culvert. A stone culvert beneath the mill carries wheel ruts toward the old quarry road, but the water is too shallow to hide a loaded cart.",
        "With Lysa guarding the approach, you separate rumor from evidence at the stone culvert.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the stone culvert in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a warden aboveground while you inspect the tunnel, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Crawl into the culvert alone during rising water, taking time to verify each step.",
          "failTitle": "Failure at The stone culvert",
          "failText": "A reckless decision at the stone culvert gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the culvert exits and follow the shallow wheel ruts, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U07B"
        }
      ]
    },
    {
      "id": "U06C",
      "turn": 6,
      "title": "The stone culvert - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the stone culvert. A stone culvert beneath the mill carries wheel ruts toward the old quarry road, but the water is too shallow to hide a loaded cart.",
        "Lysa helps recover the weakened trail at the stone culvert before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the stone culvert can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Crawl into the culvert alone during rising water, despite the ground already lost.",
          "failTitle": "Failure at The stone culvert",
          "failText": "A reckless decision at the stone culvert gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the culvert exits and follow the shallow wheel ruts, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U07C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a warden aboveground while you inspect the tunnel, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U07A"
        }
      ]
    },
    {
      "id": "U07A",
      "turn": 7,
      "title": "A green-eyed warning - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to a green-eyed warning. A stack of baskets topples without warning, distracting a hidden watcher long enough for you to find his dropped key.",
        "Lysa watches the road while you sort the fresh signs at a green-eyed warning.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from a green-eyed warning now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the baskets still and wait for the watcher to move.",
          "scoreDelta": 0,
          "nextNodeId": "U08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw a knife toward the noise without seeing the target.",
          "failTitle": "Failure at A green-eyed warning",
          "failText": "A reckless decision at a green-eyed warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the fallen baskets to recover the watcher’s key.",
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
        "After securing the previous scene, you continue to a green-eyed warning. A stack of baskets topples without warning, distracting a hidden watcher long enough for you to find his dropped key.",
        "With Lysa guarding the approach, you separate rumor from evidence at a green-eyed warning.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving a green-eyed warning in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw a knife toward the noise without seeing the target, taking time to verify each step.",
          "failTitle": "Failure at A green-eyed warning",
          "failText": "A reckless decision at a green-eyed warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the fallen baskets to recover the watcher’s key, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U08B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the baskets still and wait for the watcher to move, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U08C"
        }
      ]
    },
    {
      "id": "U07C",
      "turn": 7,
      "title": "A green-eyed warning - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a green-eyed warning. A stack of baskets topples without warning, distracting a hidden watcher long enough for you to find his dropped key.",
        "Lysa helps recover the weakened trail at a green-eyed warning before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at a green-eyed warning can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the fallen baskets to recover the watcher’s key, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the baskets still and wait for the watcher to move, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U08A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw a knife toward the noise without seeing the target, despite the ground already lost.",
          "failTitle": "Failure at A green-eyed warning",
          "failText": "A reckless decision at a green-eyed warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U08A",
      "turn": 8,
      "title": "The hidden sacks - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the hidden sacks. Behind the mill, sacks marked as oats contain salt, lamp oil, and folded strips of royal blue cloth.",
        "Lysa watches the road while you sort the fresh signs at the hidden sacks.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the hidden sacks now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour lamp oil across the floor beside an open lantern.",
          "failTitle": "Failure at The hidden sacks",
          "failText": "A reckless decision at the hidden sacks gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open one false oat sack and preserve its markings.",
          "scoreDelta": 1,
          "nextNodeId": "U09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Count the hidden sacks before searching for the carts.",
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
        "After securing the previous scene, you continue to the hidden sacks. Behind the mill, sacks marked as oats contain salt, lamp oil, and folded strips of royal blue cloth.",
        "With Lysa guarding the approach, you separate rumor from evidence at the hidden sacks.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the hidden sacks in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Open one false oat sack and preserve its markings, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Count the hidden sacks before searching for the carts, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U09C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour lamp oil across the floor beside an open lantern, taking time to verify each step.",
          "failTitle": "Failure at The hidden sacks",
          "failText": "A reckless decision at the hidden sacks gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U08C",
      "turn": 8,
      "title": "The hidden sacks - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the hidden sacks. Behind the mill, sacks marked as oats contain salt, lamp oil, and folded strips of royal blue cloth.",
        "Lysa helps recover the weakened trail at the hidden sacks before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the hidden sacks can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Count the hidden sacks before searching for the carts, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour lamp oil across the floor beside an open lantern, despite the ground already lost.",
          "failTitle": "Failure at The hidden sacks",
          "failText": "A reckless decision at the hidden sacks gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open one false oat sack and preserve its markings, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U09C"
        }
      ]
    },
    {
      "id": "U09A",
      "turn": 9,
      "title": "The night watch - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the night watch. At night, the guardhouse watchman admits he was paid to ignore carts leaving after curfew. He names no payer.",
        "Lysa watches the road while you sort the fresh signs at the night watch.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the night watch now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Offer the watchman mercy for the payer’s description.",
          "scoreDelta": 1,
          "nextNodeId": "U10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Verify his account against the guardhouse duty roll.",
          "scoreDelta": 0,
          "nextNodeId": "U10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release him before learning where the night carts went.",
          "failTitle": "Failure at The night watch",
          "failText": "A reckless decision at the night watch gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U09B",
      "turn": 9,
      "title": "The night watch - steady search",
      "narrative": [
        "After securing the previous scene, you continue to the night watch. At night, the guardhouse watchman admits he was paid to ignore carts leaving after curfew. He names no payer.",
        "With Lysa guarding the approach, you separate rumor from evidence at the night watch.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the night watch in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Verify his account against the guardhouse duty roll, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release him before learning where the night carts went, taking time to verify each step.",
          "failTitle": "Failure at The night watch",
          "failText": "A reckless decision at the night watch gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Offer the watchman mercy for the payer’s description, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U10B"
        }
      ]
    },
    {
      "id": "U09C",
      "turn": 9,
      "title": "The night watch - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the night watch. At night, the guardhouse watchman admits he was paid to ignore carts leaving after curfew. He names no payer.",
        "Lysa helps recover the weakened trail at the night watch before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the night watch can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Release him before learning where the night carts went, despite the ground already lost.",
          "failTitle": "Failure at The night watch",
          "failText": "A reckless decision at the night watch gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Offer the watchman mercy for the payer’s description, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U10C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Verify his account against the guardhouse duty roll, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U10A"
        }
      ]
    },
    {
      "id": "U10A",
      "turn": 10,
      "title": "The false priest - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the false priest. A false priest arrives with a letter ordering the stores moved for plague safety. The seal is good, but the wording is wrong.",
        "Lysa watches the road while you sort the fresh signs at the false priest.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the false priest now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Detain the false priest while checking the wax seal.",
          "scoreDelta": 0,
          "nextNodeId": "U11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Obey the forged order and surrender the granary keys.",
          "failTitle": "Failure at The false priest",
          "failText": "A reckless decision at the false priest gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Challenge the dead magistrate’s wording in the plague order.",
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
        "After securing the previous scene, you continue to the false priest. A false priest arrives with a letter ordering the stores moved for plague safety. The seal is good, but the wording is wrong.",
        "With Lysa guarding the approach, you separate rumor from evidence at the false priest.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the false priest in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Obey the forged order and surrender the granary keys, taking time to verify each step.",
          "failTitle": "Failure at The false priest",
          "failText": "A reckless decision at the false priest gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Challenge the dead magistrate’s wording in the plague order, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U11B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Detain the false priest while checking the wax seal, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U11C"
        }
      ]
    },
    {
      "id": "U10C",
      "turn": 10,
      "title": "The false priest - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the false priest. A false priest arrives with a letter ordering the stores moved for plague safety. The seal is good, but the wording is wrong.",
        "Lysa helps recover the weakened trail at the false priest before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the false priest can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Challenge the dead magistrate’s wording in the plague order, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Detain the false priest while checking the wax seal, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U11A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Obey the forged order and surrender the granary keys, despite the ground already lost.",
          "failTitle": "Failure at The false priest",
          "failText": "A reckless decision at the false priest gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U11A",
      "turn": 11,
      "title": "Beneath the granary - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to beneath the granary. Beneath the granary, you find a chamber where stolen goods are repacked for a road that reaches Elderwood.",
        "Lysa watches the road while you sort the fresh signs at beneath the granary.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from beneath the granary now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove the stolen goods before learning their destination.",
          "failTitle": "Failure at Beneath the granary",
          "failText": "A reckless decision at beneath the granary gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the repacking marks toward the Elderwood road.",
          "scoreDelta": 1,
          "nextNodeId": "U12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the underground chamber and inventory its contents.",
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
        "After securing the previous scene, you continue to beneath the granary. Beneath the granary, you find a chamber where stolen goods are repacked for a road that reaches Elderwood.",
        "With Lysa guarding the approach, you separate rumor from evidence at beneath the granary.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving beneath the granary in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the repacking marks toward the Elderwood road, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the underground chamber and inventory its contents, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U12C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove the stolen goods before learning their destination, taking time to verify each step.",
          "failTitle": "Failure at Beneath the granary",
          "failText": "A reckless decision at beneath the granary gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U11C",
      "turn": 11,
      "title": "Beneath the granary - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to beneath the granary. Beneath the granary, you find a chamber where stolen goods are repacked for a road that reaches Elderwood.",
        "Lysa helps recover the weakened trail at beneath the granary before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at beneath the granary can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the underground chamber and inventory its contents, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove the stolen goods before learning their destination, despite the ground already lost.",
          "failTitle": "Failure at Beneath the granary",
          "failText": "A reckless decision at beneath the granary gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the repacking marks toward the Elderwood road, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U12C"
        }
      ]
    },
    {
      "id": "U12A",
      "turn": 12,
      "title": "The burned tally - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the burned tally. A burned tally reveals the thefts are funding armed men, not simple smuggling. One surviving mark names the old quarry.",
        "Lysa watches the road while you sort the fresh signs at the burned tally.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the burned tally now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Recover the surviving tally mark naming the quarry.",
          "scoreDelta": 1,
          "nextNodeId": "U13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the clerk who kept the burned accounts.",
          "scoreDelta": 0,
          "nextNodeId": "U13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Crush the charred page because most of it is unreadable.",
          "failTitle": "Failure at The burned tally",
          "failText": "A reckless decision at the burned tally gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U12B",
      "turn": 12,
      "title": "The burned tally - steady search",
      "narrative": [
        "After securing the previous scene, you continue to the burned tally. A burned tally reveals the thefts are funding armed men, not simple smuggling. One surviving mark names the old quarry.",
        "With Lysa guarding the approach, you separate rumor from evidence at the burned tally.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the burned tally in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the clerk who kept the burned accounts, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Crush the charred page because most of it is unreadable, taking time to verify each step.",
          "failTitle": "Failure at The burned tally",
          "failText": "A reckless decision at the burned tally gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Recover the surviving tally mark naming the quarry, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U13B"
        }
      ]
    },
    {
      "id": "U12C",
      "turn": 12,
      "title": "The burned tally - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the burned tally. A burned tally reveals the thefts are funding armed men, not simple smuggling. One surviving mark names the old quarry.",
        "Lysa helps recover the weakened trail at the burned tally before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the burned tally can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Crush the charred page because most of it is unreadable, despite the ground already lost.",
          "failTitle": "Failure at The burned tally",
          "failText": "A reckless decision at the burned tally gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Recover the surviving tally mark naming the quarry, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U13C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the clerk who kept the burned accounts, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U13A"
        }
      ]
    },
    {
      "id": "U13A",
      "turn": 13,
      "title": "The road to Elderwood - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the road to elderwood. The quarry road climbs through wet pine. Lysa follows with a hooded lantern while movement in the brush hints that the quarry road is watched.",
        "Lysa watches the road while you sort the fresh signs at the road to elderwood.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the road to elderwood now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the cart ruts at a distance along the quarry road.",
          "scoreDelta": 0,
          "nextNodeId": "U14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride openly beneath the watchers on the ridge.",
          "failTitle": "Failure at The road to Elderwood",
          "failText": "A reckless decision at the road to elderwood gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Lysa shield her lantern while you scout the brush.",
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
        "After securing the previous scene, you continue to the road to elderwood. The quarry road climbs through wet pine. Lysa follows with a hooded lantern while movement in the brush hints that the quarry road is watched.",
        "With Lysa guarding the approach, you separate rumor from evidence at the road to elderwood.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the road to elderwood in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride openly beneath the watchers on the ridge, taking time to verify each step.",
          "failTitle": "Failure at The road to Elderwood",
          "failText": "A reckless decision at the road to elderwood gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Lysa shield her lantern while you scout the brush, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U14B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the cart ruts at a distance along the quarry road, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U14C"
        }
      ]
    },
    {
      "id": "U13C",
      "turn": 13,
      "title": "The road to Elderwood - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the road to elderwood. The quarry road climbs through wet pine. Lysa follows with a hooded lantern while movement in the brush hints that the quarry road is watched.",
        "Lysa helps recover the weakened trail at the road to elderwood before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the road to elderwood can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Let Lysa shield her lantern while you scout the brush, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the cart ruts at a distance along the quarry road, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U14A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride openly beneath the watchers on the ridge, despite the ground already lost.",
          "failTitle": "Failure at The road to Elderwood",
          "failText": "A reckless decision at the road to elderwood gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U14A",
      "turn": 14,
      "title": "A room without windows - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to a room without windows. An empty quarry room contains bedrolls, bowstrings, and a wall map showing every road between Oakenhurst and the Gray Mountains.",
        "Lysa watches the road while you sort the fresh signs at a room without windows.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from a room without windows now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear down the map before understanding it.",
          "failTitle": "Failure at A room without windows",
          "failText": "A reckless decision at a room without windows gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the road map and identify the unmarked supply route.",
          "scoreDelta": 1,
          "nextNodeId": "U15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the bedrolls for Captain Rusk’s next order.",
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
        "After securing the previous scene, you continue to a room without windows. An empty quarry room contains bedrolls, bowstrings, and a wall map showing every road between Oakenhurst and the Gray Mountains.",
        "With Lysa guarding the approach, you separate rumor from evidence at a room without windows.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving a room without windows in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Copy the road map and identify the unmarked supply route, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the bedrolls for Captain Rusk’s next order, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U15C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear down the map before understanding it, taking time to verify each step.",
          "failTitle": "Failure at A room without windows",
          "failText": "A reckless decision at a room without windows gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U14C",
      "turn": 14,
      "title": "A room without windows - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a room without windows. An empty quarry room contains bedrolls, bowstrings, and a wall map showing every road between Oakenhurst and the Gray Mountains.",
        "Lysa helps recover the weakened trail at a room without windows before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at a room without windows can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the bedrolls for Captain Rusk’s next order, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear down the map before understanding it, despite the ground already lost.",
          "failTitle": "Failure at A room without windows",
          "failText": "A reckless decision at a room without windows gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the road map and identify the unmarked supply route, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U15C"
        }
      ]
    },
    {
      "id": "U15A",
      "turn": 15,
      "title": "The cat leads on - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the cat leads on. The cat pauses at a blank wall and stares until you notice fresh dust along the floor. Behind it lies a narrow passage.",
        "Lysa watches the road while you sort the fresh signs at the cat leads on.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the cat leads on now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Examine the wall where the tabby has fixed its gaze.",
          "scoreDelta": 1,
          "nextNodeId": "U16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the quarry room while Lysa tests the loose stones.",
          "scoreDelta": 0,
          "nextNodeId": "U16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the cat and leave the hidden passage unfound.",
          "failTitle": "Failure at The cat leads on",
          "failText": "A reckless decision at the cat leads on gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "U15B",
      "turn": 15,
      "title": "The cat leads on - steady search",
      "narrative": [
        "After securing the previous scene, you continue to the cat leads on. The cat pauses at a blank wall and stares until you notice fresh dust along the floor. Behind it lies a narrow passage.",
        "With Lysa guarding the approach, you separate rumor from evidence at the cat leads on.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the cat leads on in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the quarry room while Lysa tests the loose stones, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the cat and leave the hidden passage unfound, taking time to verify each step.",
          "failTitle": "Failure at The cat leads on",
          "failText": "A reckless decision at the cat leads on gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Examine the wall where the tabby has fixed its gaze, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U16B"
        }
      ]
    },
    {
      "id": "U15C",
      "turn": 15,
      "title": "The cat leads on - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the cat leads on. The cat pauses at a blank wall and stares until you notice fresh dust along the floor. Behind it lies a narrow passage.",
        "Lysa helps recover the weakened trail at the cat leads on before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the cat leads on can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the cat and leave the hidden passage unfound, despite the ground already lost.",
          "failTitle": "Failure at The cat leads on",
          "failText": "A reckless decision at the cat leads on gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Examine the wall where the tabby has fixed its gaze, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U16C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the quarry room while Lysa tests the loose stones, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U16A"
        }
      ]
    },
    {
      "id": "U16A",
      "turn": 16,
      "title": "The old quarry - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the old quarry. The passage opens above the quarry floor, where three men load carts under a blue banner stripped of its crest.",
        "Lysa watches the road while you sort the fresh signs at the old quarry.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the old quarry now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait for the loaders to separate before descending.",
          "scoreDelta": 0,
          "nextNodeId": "U17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Step into the quarry and demand surrender without support.",
          "failTitle": "Failure at The old quarry",
          "failText": "A reckless decision at the old quarry gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count Rusk’s men and the weapon carts from above.",
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
        "After securing the previous scene, you continue to the old quarry. The passage opens above the quarry floor, where three men load carts under a blue banner stripped of its crest.",
        "With Lysa guarding the approach, you separate rumor from evidence at the old quarry.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the old quarry in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Step into the quarry and demand surrender without support, taking time to verify each step.",
          "failTitle": "Failure at The old quarry",
          "failText": "A reckless decision at the old quarry gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count Rusk’s men and the weapon carts from above, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U17B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait for the loaders to separate before descending, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U17C"
        }
      ]
    },
    {
      "id": "U16C",
      "turn": 16,
      "title": "The old quarry - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the old quarry. The passage opens above the quarry floor, where three men load carts under a blue banner stripped of its crest.",
        "Lysa helps recover the weakened trail at the old quarry before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the old quarry can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Count Rusk’s men and the weapon carts from above, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait for the loaders to separate before descending, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U17A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Step into the quarry and demand surrender without support, despite the ground already lost.",
          "failTitle": "Failure at The old quarry",
          "failText": "A reckless decision at the old quarry gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "U17A",
      "turn": 17,
      "title": "The empty carts - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the empty carts. The carts are not carrying food but weapons hidden beneath grain chaff. Their leader is Captain Rusk, a dismissed officer.",
        "Lysa watches the road while you sort the fresh signs at the empty carts.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the empty carts now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the grain chaff around the hidden weapons.",
          "failTitle": "Failure at The empty carts",
          "failText": "A reckless decision at the empty carts gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Warn the road wardens before following the weapon convoy.",
          "scoreDelta": 1,
          "nextNodeId": "U18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Disable the nearest cart while Lysa watches the trail.",
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
        "After securing the previous scene, you continue to the empty carts. The carts are not carrying food but weapons hidden beneath grain chaff. Their leader is Captain Rusk, a dismissed officer.",
        "With Lysa guarding the approach, you separate rumor from evidence at the empty carts.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the empty carts in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Warn the road wardens before following the weapon convoy, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Disable the nearest cart while Lysa watches the trail, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U18C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the grain chaff around the hidden weapons, taking time to verify each step.",
          "failTitle": "Failure at The empty carts",
          "failText": "A reckless decision at the empty carts gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "U17C",
      "turn": 17,
      "title": "The empty carts - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the empty carts. The carts are not carrying food but weapons hidden beneath grain chaff. Their leader is Captain Rusk, a dismissed officer.",
        "Lysa helps recover the weakened trail at the empty carts before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the empty carts can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Disable the nearest cart while Lysa watches the trail, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the grain chaff around the hidden weapons, despite the ground already lost.",
          "failTitle": "Failure at The empty carts",
          "failText": "A reckless decision at the empty carts gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Warn the road wardens before following the weapon convoy, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U18C"
        }
      ]
    },
    {
      "id": "U18A",
      "turn": 18,
      "title": "The rope bridge - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the rope bridge. Rusk retreats across a rope bridge while his men cut the rear lines. A loose rope whips along the far side and disappears into the fog.",
        "Lysa watches the road while you sort the fresh signs at the rope bridge.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the rope bridge now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cross one at a time while securing the bridge’s rear lines.",
          "scoreDelta": 1,
          "nextNodeId": "U19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Cover Lysa as she carries the bell toward the far side.",
          "scoreDelta": 0,
          "nextNodeId": "U19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the whole group onto the bridge as its ropes are cut.",
          "failTitle": "Failure at The rope bridge",
          "failText": "A reckless decision at the rope bridge gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "U18B",
      "turn": 18,
      "title": "The rope bridge - steady search",
      "narrative": [
        "After securing the previous scene, you continue to the rope bridge. Rusk retreats across a rope bridge while his men cut the rear lines. A loose rope whips along the far side and disappears into the fog.",
        "With Lysa guarding the approach, you separate rumor from evidence at the rope bridge.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the rope bridge in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Cover Lysa as she carries the bell toward the far side, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the whole group onto the bridge as its ropes are cut, taking time to verify each step.",
          "failTitle": "Failure at The rope bridge",
          "failText": "A reckless decision at the rope bridge gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cross one at a time while securing the bridge’s rear lines, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U19B"
        }
      ]
    },
    {
      "id": "U18C",
      "turn": 18,
      "title": "The rope bridge - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the rope bridge. Rusk retreats across a rope bridge while his men cut the rear lines. A loose rope whips along the far side and disappears into the fog.",
        "Lysa helps recover the weakened trail at the rope bridge before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the rope bridge can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the whole group onto the bridge as its ropes are cut, despite the ground already lost.",
          "failTitle": "Failure at The rope bridge",
          "failText": "A reckless decision at the rope bridge gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cross one at a time while securing the bridge’s rear lines, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U19C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Cover Lysa as she carries the bell toward the far side, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U19A"
        }
      ]
    },
    {
      "id": "U19A",
      "turn": 19,
      "title": "The bell rings - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to the bell rings. The bridge sways as Lysa rings the recovered chapel bell, warning the quarry workers and nearby farms to bar their doors.",
        "Lysa watches the road while you sort the fresh signs at the bell rings.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from the bell rings now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the bridgehead before pursuing the captain.",
          "scoreDelta": 0,
          "nextNodeId": "U20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Silence Lysa and let Rusk’s men control the alarm.",
          "failTitle": "Failure at The bell rings",
          "failText": "A reckless decision at the bell rings gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the chapel bell to rally workers against Rusk.",
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
        "After securing the previous scene, you continue to the bell rings. The bridge sways as Lysa rings the recovered chapel bell, warning the quarry workers and nearby farms to bar their doors.",
        "With Lysa guarding the approach, you separate rumor from evidence at the bell rings.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving the bell rings in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Silence Lysa and let Rusk’s men control the alarm, taking time to verify each step.",
          "failTitle": "Failure at The bell rings",
          "failText": "A reckless decision at the bell rings gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the chapel bell to rally workers against Rusk, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "U20B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the bridgehead before pursuing the captain, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "U20C"
        }
      ]
    },
    {
      "id": "U19C",
      "turn": 19,
      "title": "The bell rings - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the bell rings. The bridge sways as Lysa rings the recovered chapel bell, warning the quarry workers and nearby farms to bar their doors.",
        "Lysa helps recover the weakened trail at the bell rings before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at the bell rings can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the chapel bell to rally workers against Rusk, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "U20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the bridgehead before pursuing the captain, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "U20A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Silence Lysa and let Rusk’s men control the alarm, despite the ground already lost.",
          "failTitle": "Failure at The bell rings",
          "failText": "A reckless decision at the bell rings gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "U20A",
      "turn": 20,
      "title": "A quiet hearth - sharp clue",
      "narrative": [
        "Following the strongest evidence brings you to a quiet hearth. By dawn, the weapons are secured, Rusk is taken for trial, and Lysa hangs the recovered bell above the granary step.",
        "Lysa watches the road while you sort the fresh signs at a quiet hearth.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Acting from a quiet hearth now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the armed carts unguarded while everyone celebrates.",
          "failTitle": "Failure at A quiet hearth",
          "failText": "A reckless decision at a quiet hearth gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Deliver Rusk, the forged order, and the weapons to Aldric.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Return the stolen grain before reopening the granary.",
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
        "After securing the previous scene, you continue to a quiet hearth. By dawn, the weapons are secured, Rusk is taken for trial, and Lysa hangs the recovered bell above the granary step.",
        "With Lysa guarding the approach, you separate rumor from evidence at a quiet hearth.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. Leaving a quiet hearth in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Deliver Rusk, the forged order, and the weapons to Aldric, taking time to verify each step.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Return the stolen grain before reopening the granary, taking time to verify each step.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the armed carts unguarded while everyone celebrates, taking time to verify each step.",
          "failTitle": "Failure at A quiet hearth",
          "failText": "A reckless decision at a quiet hearth gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "U20C",
      "turn": 20,
      "title": "A quiet hearth - lost ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a quiet hearth. By dawn, the weapons are secured, Rusk is taken for trial, and Lysa hangs the recovered bell above the granary step.",
        "Lysa helps recover the weakened trail at a quiet hearth before more tracks are lost.",
        "You weigh footprints, rope, dust, and the testimony of ordinary people. The hidden road is narrowing. A careful decision at a quiet hearth can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Return the stolen grain before reopening the granary, despite the ground already lost.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the armed carts unguarded while everyone celebrates, despite the ground already lost.",
          "failTitle": "Failure at A quiet hearth",
          "failText": "A reckless decision at a quiet hearth gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Deliver Rusk, the forged order, and the weapons to Aldric, despite the ground already lost.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
