window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "bells-under-the-white-ridge",
  "title": "Bells Under the White Ridge",
  "summary": "When Greyhook’s warning bells are silenced before a mountain storm, the ranger uncovers a stolen winter reserve, a miners’ conspiracy, and a quartermaster willing to bury the evidence beneath an avalanche.",
  "maxTurns": 20,
  "startNodeId": "V01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The bells are restored before the storm reaches the valley. Duke Aldric exposes Hobb’s false accounts, the winter grain is returned to Greyhook, and the miners of King’s Mercy receive a lawful hearing. Mara keeps the warning chain, and your careful work leaves the mountain roads dangerous but honest.",
    "low": "Greyhook survives, but not untouched. Some grain is lost and the truth reaches Duke Aldric in fragments, while the mountain takes its hidden mine and many of its secrets. The bells ring again by spring, though the valley remembers how close it came to silence."
  },
  "nodes": [
    {
      "id": "V01A",
      "turn": 1,
      "title": "Aldric’s warning - clear lead",
      "narrative": [
        "Aldric’s warning. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Duke Aldric sends you to Greyhook after three mountain warning bells are found wrapped in wet wool. A storm is building, and the passes depend on those bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At aldric’s warning, the fresh details give you a narrow advantage.",
        "You ride with Thorne before noon, carrying a sealed order and a pouch of healing herbs. The duke’s wardens believe the thefts are a raider’s work, but the cut straps show patient hands. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from aldric’s warning now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Aldric for Mara Venn’s full report before leaving.",
          "scoreDelta": 0,
          "nextNodeId": "V02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait for a large escort while the storm gathers.",
          "failTitle": "Failure at Aldric’s warning",
          "failText": "A reckless decision at aldric’s warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ride for Greyhook before the snow hides the cut bell straps.",
          "scoreDelta": 1,
          "nextNodeId": "V02A"
        }
      ]
    },
    {
      "id": "V01B",
      "turn": 1,
      "title": "Aldric’s warning - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to aldric’s warning. Aldric’s warning. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Duke Aldric sends you to Greyhook after three mountain warning bells are found wrapped in wet wool. A storm is building, and the passes depend on those bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At aldric’s warning, patience keeps uncertain testimony separate from proven fact.",
        "You ride with Thorne before noon, carrying a sealed order and a pouch of healing herbs. The duke’s wardens believe the thefts are a raider’s work, but the cut straps show patient hands. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving aldric’s warning in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait for a large escort while the storm gathers, taking time to verify each step.",
          "failTitle": "Failure at Aldric’s warning",
          "failText": "A reckless decision at aldric’s warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ride for Greyhook before the snow hides the cut bell straps, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V02B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Aldric for Mara Venn’s full report before leaving, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V02C"
        }
      ]
    },
    {
      "id": "V01C",
      "turn": 1,
      "title": "Aldric’s warning - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to aldric’s warning. Aldric’s warning. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Duke Aldric sends you to Greyhook after three mountain warning bells are found wrapped in wet wool. A storm is building, and the passes depend on those bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At aldric’s warning, you rebuild the weakened trail from the signs that remain.",
        "You ride with Thorne before noon, carrying a sealed order and a pouch of healing herbs. The duke’s wardens believe the thefts are a raider’s work, but the cut straps show patient hands. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at aldric’s warning can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ride for Greyhook before the snow hides the cut bell straps, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Aldric for Mara Venn’s full report before leaving, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V02A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait for a large escort while the storm gathers, despite the ground already lost.",
          "failTitle": "Failure at Aldric’s warning",
          "failText": "A reckless decision at aldric’s warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V02A",
      "turn": 2,
      "title": "Tracks above Greyhook - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to tracks above greyhook. Tracks above Greyhook. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Snow has begun to sift across the high path, yet a line of narrow sled marks remains beside the cliff road. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At tracks above greyhook, the fresh details give you a narrow advantage.",
        "Mara identifies the iron scratches as bell runners, while a shepherd remembers a lantern moving uphill after midnight. The trail divides near a pine blasted open by lightning. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from tracks above greyhook now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the exposed cliff after an uncertain lantern.",
          "failTitle": "Failure at Tracks above Greyhook",
          "failText": "A reckless decision at tracks above greyhook gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the bell-sled scratches toward the blasted pine.",
          "scoreDelta": 1,
          "nextNodeId": "V03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inventory the remaining warning frames with Mara.",
          "scoreDelta": 0,
          "nextNodeId": "V03B"
        }
      ]
    },
    {
      "id": "V02B",
      "turn": 2,
      "title": "Tracks above Greyhook - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to tracks above greyhook. Tracks above Greyhook. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Snow has begun to sift across the high path, yet a line of narrow sled marks remains beside the cliff road. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At tracks above greyhook, patience keeps uncertain testimony separate from proven fact.",
        "Mara identifies the iron scratches as bell runners, while a shepherd remembers a lantern moving uphill after midnight. The trail divides near a pine blasted open by lightning. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving tracks above greyhook in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the bell-sled scratches toward the blasted pine, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inventory the remaining warning frames with Mara, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V03C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the exposed cliff after an uncertain lantern, taking time to verify each step.",
          "failTitle": "Failure at Tracks above Greyhook",
          "failText": "A reckless decision at tracks above greyhook gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V02C",
      "turn": 2,
      "title": "Tracks above Greyhook - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to tracks above greyhook. Tracks above Greyhook. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Snow has begun to sift across the high path, yet a line of narrow sled marks remains beside the cliff road. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At tracks above greyhook, you rebuild the weakened trail from the signs that remain.",
        "Mara identifies the iron scratches as bell runners, while a shepherd remembers a lantern moving uphill after midnight. The trail divides near a pine blasted open by lightning. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at tracks above greyhook can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Inventory the remaining warning frames with Mara, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the exposed cliff after an uncertain lantern, despite the ground already lost.",
          "failTitle": "Failure at Tracks above Greyhook",
          "failText": "A reckless decision at tracks above greyhook gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the bell-sled scratches toward the blasted pine, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V03C"
        }
      ]
    },
    {
      "id": "V03A",
      "turn": 3,
      "title": "The watch hut - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the watch hut. The watch hut. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The hut contains no raiders, only a cold brazier, three lengths of new rope, and a scrap of ledger paper sealed with blue wax. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the watch hut, the fresh details give you a narrow advantage.",
        "The writing lists grain weights and bell positions in the same hand Mara recognizes from the wardens’ records. Someone has been studying the valley as a system, not stealing at random. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the watch hut now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the blue-wax scrap with Mara’s warden records.",
          "scoreDelta": 1,
          "nextNodeId": "V04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle the watch hut for tracks before entering.",
          "scoreDelta": 0,
          "nextNodeId": "V04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the misplaced bell and announce your position.",
          "failTitle": "Failure at The watch hut",
          "failText": "A reckless decision at the watch hut gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V03B",
      "turn": 3,
      "title": "The watch hut - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the watch hut. The watch hut. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The hut contains no raiders, only a cold brazier, three lengths of new rope, and a scrap of ledger paper sealed with blue wax. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the watch hut, patience keeps uncertain testimony separate from proven fact.",
        "The writing lists grain weights and bell positions in the same hand Mara recognizes from the wardens’ records. Someone has been studying the valley as a system, not stealing at random. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the watch hut in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle the watch hut for tracks before entering, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the misplaced bell and announce your position, taking time to verify each step.",
          "failTitle": "Failure at The watch hut",
          "failText": "A reckless decision at the watch hut gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the blue-wax scrap with Mara’s warden records, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V04B"
        }
      ]
    },
    {
      "id": "V03C",
      "turn": 3,
      "title": "The watch hut - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the watch hut. The watch hut. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The hut contains no raiders, only a cold brazier, three lengths of new rope, and a scrap of ledger paper sealed with blue wax. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the watch hut, you rebuild the weakened trail from the signs that remain.",
        "The writing lists grain weights and bell positions in the same hand Mara recognizes from the wardens’ records. Someone has been studying the valley as a system, not stealing at random. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the watch hut can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the misplaced bell and announce your position, despite the ground already lost.",
          "failTitle": "Failure at The watch hut",
          "failText": "A reckless decision at the watch hut gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the blue-wax scrap with Mara’s warden records, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V04C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle the watch hut for tracks before entering, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V04A"
        }
      ]
    },
    {
      "id": "V04A",
      "turn": 4,
      "title": "A false warning - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to a false warning. A false warning. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The northern bell has been moved to a ruined shrine and fitted with a cracked clapper. Its note is wrong, but frightened villagers are already leaving their homes. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a false warning, the fresh details give you a narrow advantage.",
        "The alarm draws people toward the road while two pack mules disappear from the storehouse. The theft is broader than the bells: someone is testing how the valley reacts to a command. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from a false warning now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the ruined shrine before following the boot mark.",
          "scoreDelta": 0,
          "nextNodeId": "V05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the first fleeing shape into the snow.",
          "failTitle": "Failure at A false warning",
          "failText": "A reckless decision at a false warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Calm the villagers and trace the stolen pack mules.",
          "scoreDelta": 1,
          "nextNodeId": "V05A"
        }
      ]
    },
    {
      "id": "V04B",
      "turn": 4,
      "title": "A false warning - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to a false warning. A false warning. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The northern bell has been moved to a ruined shrine and fitted with a cracked clapper. Its note is wrong, but frightened villagers are already leaving their homes. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a false warning, patience keeps uncertain testimony separate from proven fact.",
        "The alarm draws people toward the road while two pack mules disappear from the storehouse. The theft is broader than the bells: someone is testing how the valley reacts to a command. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving a false warning in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the first fleeing shape into the snow, taking time to verify each step.",
          "failTitle": "Failure at A false warning",
          "failText": "A reckless decision at a false warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Calm the villagers and trace the stolen pack mules, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V05B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the ruined shrine before following the boot mark, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V05C"
        }
      ]
    },
    {
      "id": "V04C",
      "turn": 4,
      "title": "A false warning - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a false warning. A false warning. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The northern bell has been moved to a ruined shrine and fitted with a cracked clapper. Its note is wrong, but frightened villagers are already leaving their homes. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a false warning, you rebuild the weakened trail from the signs that remain.",
        "The alarm draws people toward the road while two pack mules disappear from the storehouse. The theft is broader than the bells: someone is testing how the valley reacts to a command. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at a false warning can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Calm the villagers and trace the stolen pack mules, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the ruined shrine before following the boot mark, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V05A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the first fleeing shape into the snow, despite the ground already lost.",
          "failTitle": "Failure at A false warning",
          "failText": "A reckless decision at a false warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V05A",
      "turn": 5,
      "title": "Mara under suspicion - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to mara under suspicion. Mara under suspicion. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "By sunset, suspicion has turned on Mara because she alone keeps the bell keys. She answers sharply, but her anger has the clean edge of someone cornered by an unfair truth. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At mara under suspicion, the fresh details give you a narrow advantage.",
        "You discover a second key hidden beneath the shrine’s foundation stone. It was made recently and filed to fit an old lock. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from mara under suspicion now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest Mara solely because she kept the original keys.",
          "failTitle": "Failure at Mara under suspicion",
          "failText": "A reckless decision at mara under suspicion gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test the copied key against every surviving bell lock.",
          "scoreDelta": 1,
          "nextNodeId": "V06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear Mara’s account of Oren Vale under guard.",
          "scoreDelta": 0,
          "nextNodeId": "V06B"
        }
      ]
    },
    {
      "id": "V05B",
      "turn": 5,
      "title": "Mara under suspicion - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to mara under suspicion. Mara under suspicion. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "By sunset, suspicion has turned on Mara because she alone keeps the bell keys. She answers sharply, but her anger has the clean edge of someone cornered by an unfair truth. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At mara under suspicion, patience keeps uncertain testimony separate from proven fact.",
        "You discover a second key hidden beneath the shrine’s foundation stone. It was made recently and filed to fit an old lock. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving mara under suspicion in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test the copied key against every surviving bell lock, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear Mara’s account of Oren Vale under guard, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V06C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest Mara solely because she kept the original keys, taking time to verify each step.",
          "failTitle": "Failure at Mara under suspicion",
          "failText": "A reckless decision at mara under suspicion gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V05C",
      "turn": 5,
      "title": "Mara under suspicion - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to mara under suspicion. Mara under suspicion. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "By sunset, suspicion has turned on Mara because she alone keeps the bell keys. She answers sharply, but her anger has the clean edge of someone cornered by an unfair truth. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At mara under suspicion, you rebuild the weakened trail from the signs that remain.",
        "You discover a second key hidden beneath the shrine’s foundation stone. It was made recently and filed to fit an old lock. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at mara under suspicion can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear Mara’s account of Oren Vale under guard, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest Mara solely because she kept the original keys, despite the ground already lost.",
          "failTitle": "Failure at Mara under suspicion",
          "failText": "A reckless decision at mara under suspicion gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test the copied key against every surviving bell lock, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V06C"
        }
      ]
    },
    {
      "id": "V06A",
      "turn": 6,
      "title": "The quartermaster’s ledger - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the quartermaster’s ledger. The quartermaster’s ledger. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The blue wax matches seals used by Quartermaster Hobb in Riverland. His ledger records supplies sent uphill, but several entries are too neat: identical weights on days when the roads were closed. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the quartermaster’s ledger, the fresh details give you a narrow advantage.",
        "A missing page leaves only a pressure mark and the words ‘Cairn Nine’. Hobb insists it means a storage marker, not a person, and offers soldiers to arrest Mara. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the quartermaster’s ledger now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Recover the missing ledger entry from its pressure marks.",
          "scoreDelta": 1,
          "nextNodeId": "V07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Verify Hobb’s store totals with independent carriers.",
          "scoreDelta": 0,
          "nextNodeId": "V07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Hobb’s soldiers and let them seize the evidence.",
          "failTitle": "Failure at The quartermaster’s ledger",
          "failText": "A reckless decision at the quartermaster’s ledger gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V06B",
      "turn": 6,
      "title": "The quartermaster’s ledger - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the quartermaster’s ledger. The quartermaster’s ledger. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The blue wax matches seals used by Quartermaster Hobb in Riverland. His ledger records supplies sent uphill, but several entries are too neat: identical weights on days when the roads were closed. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the quartermaster’s ledger, patience keeps uncertain testimony separate from proven fact.",
        "A missing page leaves only a pressure mark and the words ‘Cairn Nine’. Hobb insists it means a storage marker, not a person, and offers soldiers to arrest Mara. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the quartermaster’s ledger in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Verify Hobb’s store totals with independent carriers, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Hobb’s soldiers and let them seize the evidence, taking time to verify each step.",
          "failTitle": "Failure at The quartermaster’s ledger",
          "failText": "A reckless decision at the quartermaster’s ledger gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Recover the missing ledger entry from its pressure marks, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V07B"
        }
      ]
    },
    {
      "id": "V06C",
      "turn": 6,
      "title": "The quartermaster’s ledger - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the quartermaster’s ledger. The quartermaster’s ledger. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The blue wax matches seals used by Quartermaster Hobb in Riverland. His ledger records supplies sent uphill, but several entries are too neat: identical weights on days when the roads were closed. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the quartermaster’s ledger, you rebuild the weakened trail from the signs that remain.",
        "A missing page leaves only a pressure mark and the words ‘Cairn Nine’. Hobb insists it means a storage marker, not a person, and offers soldiers to arrest Mara. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the quartermaster’s ledger can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Hobb’s soldiers and let them seize the evidence, despite the ground already lost.",
          "failTitle": "Failure at The quartermaster’s ledger",
          "failText": "A reckless decision at the quartermaster’s ledger gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Recover the missing ledger entry from its pressure marks, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V07C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Verify Hobb’s store totals with independent carriers, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V07A"
        }
      ]
    },
    {
      "id": "V07A",
      "turn": 7,
      "title": "A hidden runner - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to a hidden runner. A hidden runner. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Behind the stable wall lies a narrow crawlspace with fresh straw, a coil of bell rope, and a child’s mitten. No adult could have worked there without leaving splinters in the old boards. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a hidden runner, the fresh details give you a narrow advantage.",
        "The mitten belongs to Finn, an orphan who carries messages for the Greyhook inn. He is missing, and the innkeeper says Oren Vale spoke kindly to him two nights ago. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from a hidden runner now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the hiding place for anything the boy left behind.",
          "scoreDelta": 0,
          "nextNodeId": "V08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the crawlspace to drive out whoever used it.",
          "failTitle": "Failure at A hidden runner",
          "failText": "A reckless decision at a hidden runner gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow Finn’s small prints from the stable crawlspace.",
          "scoreDelta": 1,
          "nextNodeId": "V08A"
        }
      ]
    },
    {
      "id": "V07B",
      "turn": 7,
      "title": "A hidden runner - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to a hidden runner. A hidden runner. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Behind the stable wall lies a narrow crawlspace with fresh straw, a coil of bell rope, and a child’s mitten. No adult could have worked there without leaving splinters in the old boards. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a hidden runner, patience keeps uncertain testimony separate from proven fact.",
        "The mitten belongs to Finn, an orphan who carries messages for the Greyhook inn. He is missing, and the innkeeper says Oren Vale spoke kindly to him two nights ago. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving a hidden runner in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the crawlspace to drive out whoever used it, taking time to verify each step.",
          "failTitle": "Failure at A hidden runner",
          "failText": "A reckless decision at a hidden runner gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow Finn’s small prints from the stable crawlspace, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V08B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the hiding place for anything the boy left behind, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V08C"
        }
      ]
    },
    {
      "id": "V07C",
      "turn": 7,
      "title": "A hidden runner - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a hidden runner. A hidden runner. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Behind the stable wall lies a narrow crawlspace with fresh straw, a coil of bell rope, and a child’s mitten. No adult could have worked there without leaving splinters in the old boards. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a hidden runner, you rebuild the weakened trail from the signs that remain.",
        "The mitten belongs to Finn, an orphan who carries messages for the Greyhook inn. He is missing, and the innkeeper says Oren Vale spoke kindly to him two nights ago. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at a hidden runner can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow Finn’s small prints from the stable crawlspace, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the hiding place for anything the boy left behind, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V08A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the crawlspace to drive out whoever used it, despite the ground already lost.",
          "failTitle": "Failure at A hidden runner",
          "failText": "A reckless decision at a hidden runner gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V08A",
      "turn": 8,
      "title": "The charcoal road - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the charcoal road. The charcoal road. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The road climbs through black pines where old kilns crouch beneath snow. Finn’s footprints end beside a handcart, but the cart has been dragged uphill rather than downhill. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the charcoal road, the fresh details give you a narrow advantage.",
        "A whistle answers from the trees. You see Finn for one instant, waving from behind a stump, then a hooded figure pulls him away. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the charcoal road now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge toward Finn without checking for an ambush.",
          "failTitle": "Failure at The charcoal road",
          "failText": "A reckless decision at the charcoal road gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Approach the charcoal road under cover and signal Finn.",
          "scoreDelta": 1,
          "nextNodeId": "V09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Track the handcart while Mara watches the tree line.",
          "scoreDelta": 0,
          "nextNodeId": "V09B"
        }
      ]
    },
    {
      "id": "V08B",
      "turn": 8,
      "title": "The charcoal road - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the charcoal road. The charcoal road. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The road climbs through black pines where old kilns crouch beneath snow. Finn’s footprints end beside a handcart, but the cart has been dragged uphill rather than downhill. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the charcoal road, patience keeps uncertain testimony separate from proven fact.",
        "A whistle answers from the trees. You see Finn for one instant, waving from behind a stump, then a hooded figure pulls him away. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the charcoal road in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Approach the charcoal road under cover and signal Finn, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Track the handcart while Mara watches the tree line, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V09C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge toward Finn without checking for an ambush, taking time to verify each step.",
          "failTitle": "Failure at The charcoal road",
          "failText": "A reckless decision at the charcoal road gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V08C",
      "turn": 8,
      "title": "The charcoal road - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the charcoal road. The charcoal road. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The road climbs through black pines where old kilns crouch beneath snow. Finn’s footprints end beside a handcart, but the cart has been dragged uphill rather than downhill. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the charcoal road, you rebuild the weakened trail from the signs that remain.",
        "A whistle answers from the trees. You see Finn for one instant, waving from behind a stump, then a hooded figure pulls him away. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the charcoal road can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Track the handcart while Mara watches the tree line, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge toward Finn without checking for an ambush, despite the ground already lost.",
          "failTitle": "Failure at The charcoal road",
          "failText": "A reckless decision at the charcoal road gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Approach the charcoal road under cover and signal Finn, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V09C"
        }
      ]
    },
    {
      "id": "V09A",
      "turn": 9,
      "title": "The winter forge - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the winter forge. The winter forge. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "You find the forge under a collapsed charcoal shed. Oren Vale is not there, but the stolen bells hang from beams, their clappers removed and their mouths packed with pitch. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the winter forge, the fresh details give you a narrow advantage.",
        "Finn is tied safely to a post, frightened more than hurt. He says Oren claimed the bells were being silenced to prevent a massacre, not to cause one. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the winter forge now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Free Finn and study Oren’s map before touching the bells.",
          "scoreDelta": 1,
          "nextNodeId": "V10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the winter forge until Mara’s rope team arrives.",
          "scoreDelta": 0,
          "nextNodeId": "V10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Carry off the bells and abandon the marked map.",
          "failTitle": "Failure at The winter forge",
          "failText": "A reckless decision at the winter forge gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V09B",
      "turn": 9,
      "title": "The winter forge - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the winter forge. The winter forge. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "You find the forge under a collapsed charcoal shed. Oren Vale is not there, but the stolen bells hang from beams, their clappers removed and their mouths packed with pitch. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the winter forge, patience keeps uncertain testimony separate from proven fact.",
        "Finn is tied safely to a post, frightened more than hurt. He says Oren claimed the bells were being silenced to prevent a massacre, not to cause one. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the winter forge in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the winter forge until Mara’s rope team arrives, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Carry off the bells and abandon the marked map, taking time to verify each step.",
          "failTitle": "Failure at The winter forge",
          "failText": "A reckless decision at the winter forge gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Free Finn and study Oren’s map before touching the bells, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V10B"
        }
      ]
    },
    {
      "id": "V09C",
      "turn": 9,
      "title": "The winter forge - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the winter forge. The winter forge. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "You find the forge under a collapsed charcoal shed. Oren Vale is not there, but the stolen bells hang from beams, their clappers removed and their mouths packed with pitch. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the winter forge, you rebuild the weakened trail from the signs that remain.",
        "Finn is tied safely to a post, frightened more than hurt. He says Oren claimed the bells were being silenced to prevent a massacre, not to cause one. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the winter forge can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Carry off the bells and abandon the marked map, despite the ground already lost.",
          "failTitle": "Failure at The winter forge",
          "failText": "A reckless decision at the winter forge gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Free Finn and study Oren’s map before touching the bells, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V10C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the winter forge until Mara’s rope team arrives, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V10A"
        }
      ]
    },
    {
      "id": "V10A",
      "turn": 10,
      "title": "A prisoner’s account - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to a prisoner’s account. A prisoner’s account. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Finn tells you Oren left with two men wearing warden cloaks. He overheard them arguing about a caravan that would arrive before the storm. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a prisoner’s account, the fresh details give you a narrow advantage.",
        "The boy remembers Oren saying, ‘When the bells speak, the valley dies.’ It sounds like a threat until you notice that the packed bells are marked with tiny chalk crosses. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from a prisoner’s account now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Escort Finn to safety before pursuing Oren.",
          "scoreDelta": 0,
          "nextNodeId": "V11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss Finn’s warning as a frightened child’s tale.",
          "failTitle": "Failure at A prisoner’s account",
          "failText": "A reckless decision at a prisoner’s account gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the chalk crosses with Mara’s rescue code.",
          "scoreDelta": 1,
          "nextNodeId": "V11A"
        }
      ]
    },
    {
      "id": "V10B",
      "turn": 10,
      "title": "A prisoner’s account - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to a prisoner’s account. A prisoner’s account. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Finn tells you Oren left with two men wearing warden cloaks. He overheard them arguing about a caravan that would arrive before the storm. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a prisoner’s account, patience keeps uncertain testimony separate from proven fact.",
        "The boy remembers Oren saying, ‘When the bells speak, the valley dies.’ It sounds like a threat until you notice that the packed bells are marked with tiny chalk crosses. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving a prisoner’s account in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss Finn’s warning as a frightened child’s tale, taking time to verify each step.",
          "failTitle": "Failure at A prisoner’s account",
          "failText": "A reckless decision at a prisoner’s account gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the chalk crosses with Mara’s rescue code, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V11B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Escort Finn to safety before pursuing Oren, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V11C"
        }
      ]
    },
    {
      "id": "V10C",
      "turn": 10,
      "title": "A prisoner’s account - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a prisoner’s account. A prisoner’s account. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Finn tells you Oren left with two men wearing warden cloaks. He overheard them arguing about a caravan that would arrive before the storm. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a prisoner’s account, you rebuild the weakened trail from the signs that remain.",
        "The boy remembers Oren saying, ‘When the bells speak, the valley dies.’ It sounds like a threat until you notice that the packed bells are marked with tiny chalk crosses. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at a prisoner’s account can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the chalk crosses with Mara’s rescue code, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Escort Finn to safety before pursuing Oren, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V11A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss Finn’s warning as a frightened child’s tale, despite the ground already lost.",
          "failTitle": "Failure at A prisoner’s account",
          "failText": "A reckless decision at a prisoner’s account gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V11A",
      "turn": 11,
      "title": "The sealed pass - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the sealed pass. The sealed pass. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "A fresh avalanche has closed the high road, but the debris is too orderly. Stone blocks have been loosened from above and guided into the cut. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the sealed pass, the fresh details give you a narrow advantage.",
        "The route to King’s Mercy now seems to be the only open approach. A dead courier lies near the snow line with a quartermaster’s seal and a message naming no enemy. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the sealed pass now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb directly over the unstable slide.",
          "failTitle": "Failure at The sealed pass",
          "failText": "A reckless decision at the sealed pass gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the avalanche debris for tool marks and placed stone.",
          "scoreDelta": 1,
          "nextNodeId": "V12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the lower traverse to bypass the sealed pass.",
          "scoreDelta": 0,
          "nextNodeId": "V12B"
        }
      ]
    },
    {
      "id": "V11B",
      "turn": 11,
      "title": "The sealed pass - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the sealed pass. The sealed pass. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "A fresh avalanche has closed the high road, but the debris is too orderly. Stone blocks have been loosened from above and guided into the cut. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the sealed pass, patience keeps uncertain testimony separate from proven fact.",
        "The route to King’s Mercy now seems to be the only open approach. A dead courier lies near the snow line with a quartermaster’s seal and a message naming no enemy. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the sealed pass in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the avalanche debris for tool marks and placed stone, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the lower traverse to bypass the sealed pass, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V12C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb directly over the unstable slide, taking time to verify each step.",
          "failTitle": "Failure at The sealed pass",
          "failText": "A reckless decision at the sealed pass gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V11C",
      "turn": 11,
      "title": "The sealed pass - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the sealed pass. The sealed pass. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "A fresh avalanche has closed the high road, but the debris is too orderly. Stone blocks have been loosened from above and guided into the cut. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the sealed pass, you rebuild the weakened trail from the signs that remain.",
        "The route to King’s Mercy now seems to be the only open approach. A dead courier lies near the snow line with a quartermaster’s seal and a message naming no enemy. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the sealed pass can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the lower traverse to bypass the sealed pass, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb directly over the unstable slide, despite the ground already lost.",
          "failTitle": "Failure at The sealed pass",
          "failText": "A reckless decision at the sealed pass gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the avalanche debris for tool marks and placed stone, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V12C"
        }
      ]
    },
    {
      "id": "V12A",
      "turn": 12,
      "title": "Cairn Nine - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to cairn nine. Cairn Nine. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "At Cairn Nine, the clapper points toward a narrow ravine. There you find crates stamped with the duke’s mark, all empty except for a layer of spoiled barley. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At cairn nine, the fresh details give you a narrow advantage.",
        "A hidden boot print crosses the crate dust. The person wore a warden’s nails, but the heel was repaired with red thread, a detail Mara recalls from Hobb’s escort. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from cairn nine now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Match the red-thread heel to Hobb’s escort records.",
          "scoreDelta": 1,
          "nextNodeId": "V13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Record every false grain mark at Cairn Nine.",
          "scoreDelta": 0,
          "nextNodeId": "V13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse the nearest miners and destroy the empty crates.",
          "failTitle": "Failure at Cairn Nine",
          "failText": "A reckless decision at cairn nine gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V12B",
      "turn": 12,
      "title": "Cairn Nine - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to cairn nine. Cairn Nine. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "At Cairn Nine, the clapper points toward a narrow ravine. There you find crates stamped with the duke’s mark, all empty except for a layer of spoiled barley. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At cairn nine, patience keeps uncertain testimony separate from proven fact.",
        "A hidden boot print crosses the crate dust. The person wore a warden’s nails, but the heel was repaired with red thread, a detail Mara recalls from Hobb’s escort. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving cairn nine in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Record every false grain mark at Cairn Nine, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse the nearest miners and destroy the empty crates, taking time to verify each step.",
          "failTitle": "Failure at Cairn Nine",
          "failText": "A reckless decision at cairn nine gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the red-thread heel to Hobb’s escort records, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V13B"
        }
      ]
    },
    {
      "id": "V12C",
      "turn": 12,
      "title": "Cairn Nine - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to cairn nine. Cairn Nine. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "At Cairn Nine, the clapper points toward a narrow ravine. There you find crates stamped with the duke’s mark, all empty except for a layer of spoiled barley. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At cairn nine, you rebuild the weakened trail from the signs that remain.",
        "A hidden boot print crosses the crate dust. The person wore a warden’s nails, but the heel was repaired with red thread, a detail Mara recalls from Hobb’s escort. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at cairn nine can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse the nearest miners and destroy the empty crates, despite the ground already lost.",
          "failTitle": "Failure at Cairn Nine",
          "failText": "A reckless decision at cairn nine gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the red-thread heel to Hobb’s escort records, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V13C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Record every false grain mark at Cairn Nine, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V13A"
        }
      ]
    },
    {
      "id": "V13A",
      "turn": 13,
      "title": "The red-thread trail - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the red-thread trail. The red-thread trail. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The red-thread heel leads to a rope bridge above the ravine. On its far side, a sentry has abandoned a warm cloak and a pouch of copper tokens. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the red-thread trail, the fresh details give you a narrow advantage.",
        "The tokens bear the mark of a workers’ brotherhood from the old mines. The miners were closed out years ago after a cave-in, though some families still live under the ridge. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the red-thread trail now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Examine the copper tokens before accepting her story.",
          "scoreDelta": 0,
          "nextNodeId": "V14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the rope bridge with your sword drawn.",
          "failTitle": "Failure at The red-thread trail",
          "failText": "A reckless decision at the red-thread trail gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Speak with Sella from cover while keeping the bridge watched.",
          "scoreDelta": 1,
          "nextNodeId": "V14A"
        }
      ]
    },
    {
      "id": "V13B",
      "turn": 13,
      "title": "The red-thread trail - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the red-thread trail. The red-thread trail. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The red-thread heel leads to a rope bridge above the ravine. On its far side, a sentry has abandoned a warm cloak and a pouch of copper tokens. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the red-thread trail, patience keeps uncertain testimony separate from proven fact.",
        "The tokens bear the mark of a workers’ brotherhood from the old mines. The miners were closed out years ago after a cave-in, though some families still live under the ridge. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the red-thread trail in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the rope bridge with your sword drawn, taking time to verify each step.",
          "failTitle": "Failure at The red-thread trail",
          "failText": "A reckless decision at the red-thread trail gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Speak with Sella from cover while keeping the bridge watched, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V14B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Examine the copper tokens before accepting her story, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V14C"
        }
      ]
    },
    {
      "id": "V13C",
      "turn": 13,
      "title": "The red-thread trail - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the red-thread trail. The red-thread trail. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The red-thread heel leads to a rope bridge above the ravine. On its far side, a sentry has abandoned a warm cloak and a pouch of copper tokens. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the red-thread trail, you rebuild the weakened trail from the signs that remain.",
        "The tokens bear the mark of a workers’ brotherhood from the old mines. The miners were closed out years ago after a cave-in, though some families still live under the ridge. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the red-thread trail can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Speak with Sella from cover while keeping the bridge watched, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Examine the copper tokens before accepting her story, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V14A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the rope bridge with your sword drawn, despite the ground already lost.",
          "failTitle": "Failure at The red-thread trail",
          "failText": "A reckless decision at the red-thread trail gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V14A",
      "turn": 14,
      "title": "Sella’s bargain - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to sella’s bargain. Sella’s bargain. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Sella will lead you to the hidden mine if you promise not to bring soldiers until the truth is seen. She does not trust uniforms, especially after Hobb’s men seized two winter wagons. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At sella’s bargain, the fresh details give you a narrow advantage.",
        "Inside her satchel is a list of villages shorted by the same amount. The figures match the false ledger entries exactly. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from sella’s bargain now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Sella and call Hobb’s troops into the ravine.",
          "failTitle": "Failure at Sella’s bargain",
          "failText": "A reckless decision at sella’s bargain gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Check Sella’s village list against the recovered ledger.",
          "scoreDelta": 1,
          "nextNodeId": "V15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Offer limited protection in exchange for seeing the mine.",
          "scoreDelta": 0,
          "nextNodeId": "V15B"
        }
      ]
    },
    {
      "id": "V14B",
      "turn": 14,
      "title": "Sella’s bargain - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to sella’s bargain. Sella’s bargain. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Sella will lead you to the hidden mine if you promise not to bring soldiers until the truth is seen. She does not trust uniforms, especially after Hobb’s men seized two winter wagons. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At sella’s bargain, patience keeps uncertain testimony separate from proven fact.",
        "Inside her satchel is a list of villages shorted by the same amount. The figures match the false ledger entries exactly. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving sella’s bargain in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Check Sella’s village list against the recovered ledger, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Offer limited protection in exchange for seeing the mine, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V15C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Sella and call Hobb’s troops into the ravine, taking time to verify each step.",
          "failTitle": "Failure at Sella’s bargain",
          "failText": "A reckless decision at sella’s bargain gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "V14C",
      "turn": 14,
      "title": "Sella’s bargain - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to sella’s bargain. Sella’s bargain. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Sella will lead you to the hidden mine if you promise not to bring soldiers until the truth is seen. She does not trust uniforms, especially after Hobb’s men seized two winter wagons. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At sella’s bargain, you rebuild the weakened trail from the signs that remain.",
        "Inside her satchel is a list of villages shorted by the same amount. The figures match the false ledger entries exactly. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at sella’s bargain can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Offer limited protection in exchange for seeing the mine, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Sella and call Hobb’s troops into the ravine, despite the ground already lost.",
          "failTitle": "Failure at Sella’s bargain",
          "failText": "A reckless decision at sella’s bargain gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Check Sella’s village list against the recovered ledger, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V15C"
        }
      ]
    },
    {
      "id": "V15A",
      "turn": 15,
      "title": "The mine of King’s Mercy - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the mine of king’s mercy. The mine of King’s Mercy. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The mine entrance is guarded by silence. No pick strikes echo from within, but fresh snow has been swept from a side door. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the mine of king’s mercy, the fresh details give you a narrow advantage.",
        "Sella’s people have moved the grain there, not stolen it. The sacks are dry, properly marked, and enough to keep four villages alive until spring. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the mine of king’s mercy now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the stored grain and Oren’s letters together.",
          "scoreDelta": 1,
          "nextNodeId": "V16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the mine exits while Mara checks the supports.",
          "scoreDelta": 0,
          "nextNodeId": "V16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest every miner before hearing why the grain was moved.",
          "failTitle": "Failure at The mine of King’s Mercy",
          "failText": "A reckless decision at the mine of king’s mercy gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "V15B",
      "turn": 15,
      "title": "The mine of King’s Mercy - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the mine of king’s mercy. The mine of King’s Mercy. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The mine entrance is guarded by silence. No pick strikes echo from within, but fresh snow has been swept from a side door. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the mine of king’s mercy, patience keeps uncertain testimony separate from proven fact.",
        "Sella’s people have moved the grain there, not stolen it. The sacks are dry, properly marked, and enough to keep four villages alive until spring. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the mine of king’s mercy in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the mine exits while Mara checks the supports, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest every miner before hearing why the grain was moved, taking time to verify each step.",
          "failTitle": "Failure at The mine of King’s Mercy",
          "failText": "A reckless decision at the mine of king’s mercy gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the stored grain and Oren’s letters together, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V16B"
        }
      ]
    },
    {
      "id": "V15C",
      "turn": 15,
      "title": "The mine of King’s Mercy - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the mine of king’s mercy. The mine of King’s Mercy. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The mine entrance is guarded by silence. No pick strikes echo from within, but fresh snow has been swept from a side door. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the mine of king’s mercy, you rebuild the weakened trail from the signs that remain.",
        "Sella’s people have moved the grain there, not stolen it. The sacks are dry, properly marked, and enough to keep four villages alive until spring. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the mine of king’s mercy can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest every miner before hearing why the grain was moved, despite the ground already lost.",
          "failTitle": "Failure at The mine of King’s Mercy",
          "failText": "A reckless decision at the mine of king’s mercy gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the stored grain and Oren’s letters together, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V16C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the mine exits while Mara checks the supports, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V16A"
        }
      ]
    },
    {
      "id": "V16A",
      "turn": 16,
      "title": "The second deception - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the second deception. The second deception. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Oren admits he staged the bell thefts to draw attention to the missing grain. Hobb, he says, learned of the plan and planted evidence that would make the miners look like saboteurs. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the second deception, the fresh details give you a narrow advantage.",
        "Before the confession can settle, a runner arrives: Hobb’s soldiers are approaching the mine with orders to seize the stores and arrest everyone inside. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the second deception now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Barricade the mine and prepare to negotiate.",
          "scoreDelta": 0,
          "nextNodeId": "V17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Begin a battle beneath the trembling supports.",
          "failTitle": "Failure at The second deception",
          "failText": "A reckless decision at the second deception gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move the families clear while preserving Hobb’s letters.",
          "scoreDelta": 1,
          "nextNodeId": "V17A"
        }
      ]
    },
    {
      "id": "V16B",
      "turn": 16,
      "title": "The second deception - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the second deception. The second deception. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Oren admits he staged the bell thefts to draw attention to the missing grain. Hobb, he says, learned of the plan and planted evidence that would make the miners look like saboteurs. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the second deception, patience keeps uncertain testimony separate from proven fact.",
        "Before the confession can settle, a runner arrives: Hobb’s soldiers are approaching the mine with orders to seize the stores and arrest everyone inside. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the second deception in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Begin a battle beneath the trembling supports, taking time to verify each step.",
          "failTitle": "Failure at The second deception",
          "failText": "A reckless decision at the second deception gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move the families clear while preserving Hobb’s letters, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V17B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Barricade the mine and prepare to negotiate, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V17C"
        }
      ]
    },
    {
      "id": "V16C",
      "turn": 16,
      "title": "The second deception - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the second deception. The second deception. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Oren admits he staged the bell thefts to draw attention to the missing grain. Hobb, he says, learned of the plan and planted evidence that would make the miners look like saboteurs. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the second deception, you rebuild the weakened trail from the signs that remain.",
        "Before the confession can settle, a runner arrives: Hobb’s soldiers are approaching the mine with orders to seize the stores and arrest everyone inside. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the second deception can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Move the families clear while preserving Hobb’s letters, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Barricade the mine and prepare to negotiate, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V17A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Begin a battle beneath the trembling supports, despite the ground already lost.",
          "failTitle": "Failure at The second deception",
          "failText": "A reckless decision at the second deception gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "V17A",
      "turn": 17,
      "title": "The avalanche line - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the avalanche line. The avalanche line. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "You inspect the upper slope and see the real danger. Hobb’s men have built a fire beneath a snow shelf, intending to trigger a slide that will seal the mine and destroy the evidence. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the avalanche line, the fresh details give you a narrow advantage.",
        "Mara can restore two bells, but the clappers are scattered. Sella knows a drainage tunnel to the slope, while Oren knows where Hobb’s officers will stand. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the avalanche line now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Hobb’s fire-setters alone on the loaded slope.",
          "failTitle": "Failure at The avalanche line",
          "failText": "A reckless decision at the avalanche line gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut off the fire beneath the snow shelf and restore the bells.",
          "scoreDelta": 1,
          "nextNodeId": "V18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Evacuate the nearest grain while Sella slows the fuse.",
          "scoreDelta": 0,
          "nextNodeId": "V18B"
        }
      ]
    },
    {
      "id": "V17B",
      "turn": 17,
      "title": "The avalanche line - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the avalanche line. The avalanche line. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "You inspect the upper slope and see the real danger. Hobb’s men have built a fire beneath a snow shelf, intending to trigger a slide that will seal the mine and destroy the evidence. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the avalanche line, patience keeps uncertain testimony separate from proven fact.",
        "Mara can restore two bells, but the clappers are scattered. Sella knows a drainage tunnel to the slope, while Oren knows where Hobb’s officers will stand. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the avalanche line in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut off the fire beneath the snow shelf and restore the bells, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Evacuate the nearest grain while Sella slows the fuse, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V18C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Hobb’s fire-setters alone on the loaded slope, taking time to verify each step.",
          "failTitle": "Failure at The avalanche line",
          "failText": "A reckless decision at the avalanche line gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "V17C",
      "turn": 17,
      "title": "The avalanche line - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the avalanche line. The avalanche line. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "You inspect the upper slope and see the real danger. Hobb’s men have built a fire beneath a snow shelf, intending to trigger a slide that will seal the mine and destroy the evidence. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the avalanche line, you rebuild the weakened trail from the signs that remain.",
        "Mara can restore two bells, but the clappers are scattered. Sella knows a drainage tunnel to the slope, while Oren knows where Hobb’s officers will stand. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the avalanche line can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Evacuate the nearest grain while Sella slows the fuse, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Hobb’s fire-setters alone on the loaded slope, despite the ground already lost.",
          "failTitle": "Failure at The avalanche line",
          "failText": "A reckless decision at the avalanche line gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut off the fire beneath the snow shelf and restore the bells, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V18C"
        }
      ]
    },
    {
      "id": "V18A",
      "turn": 18,
      "title": "The bells answer - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the bells answer. The bells answer. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The first restored bell sends a low note through the snow. The second answers from the mine mouth, and villagers in the distant valley begin moving toward safe ground. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the bells answer, the fresh details give you a narrow advantage.",
        "Hobb’s soldiers hesitate when Mara names the rescue code. Their captain reads the letters you recovered and realizes the quartermaster’s seal has been used to hide theft. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the bells answer now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Show Hobb’s captain the letters as Mara sounds the rescue code.",
          "scoreDelta": 1,
          "nextNodeId": "V19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Restore the second bell before pursuing the quartermaster.",
          "scoreDelta": 0,
          "nextNodeId": "V19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow into soldiers who have begun to doubt Hobb.",
          "failTitle": "Failure at The bells answer",
          "failText": "A reckless decision at the bells answer gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "V18B",
      "turn": 18,
      "title": "The bells answer - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the bells answer. The bells answer. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The first restored bell sends a low note through the snow. The second answers from the mine mouth, and villagers in the distant valley begin moving toward safe ground. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the bells answer, patience keeps uncertain testimony separate from proven fact.",
        "Hobb’s soldiers hesitate when Mara names the rescue code. Their captain reads the letters you recovered and realizes the quartermaster’s seal has been used to hide theft. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the bells answer in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Restore the second bell before pursuing the quartermaster, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow into soldiers who have begun to doubt Hobb, taking time to verify each step.",
          "failTitle": "Failure at The bells answer",
          "failText": "A reckless decision at the bells answer gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Show Hobb’s captain the letters as Mara sounds the rescue code, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V19B"
        }
      ]
    },
    {
      "id": "V18C",
      "turn": 18,
      "title": "The bells answer - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the bells answer. The bells answer. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The first restored bell sends a low note through the snow. The second answers from the mine mouth, and villagers in the distant valley begin moving toward safe ground. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the bells answer, you rebuild the weakened trail from the signs that remain.",
        "Hobb’s soldiers hesitate when Mara names the rescue code. Their captain reads the letters you recovered and realizes the quartermaster’s seal has been used to hide theft. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the bells answer can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow into soldiers who have begun to doubt Hobb, despite the ground already lost.",
          "failTitle": "Failure at The bells answer",
          "failText": "A reckless decision at the bells answer gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Show Hobb’s captain the letters as Mara sounds the rescue code, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V19C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Restore the second bell before pursuing the quartermaster, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V19A"
        }
      ]
    },
    {
      "id": "V19A",
      "turn": 19,
      "title": "The last crossing - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to the last crossing. The last crossing. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The fire trench catches, but Sella’s miners cut it off with wet spoil. Hobb runs for the rope bridge carrying the ledger page that could still save him. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the last crossing, the fresh details give you a narrow advantage.",
        "You follow across the swaying boards while Mara turns the bells toward the villages. Thorne waits below, stamping at the falling ash. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from the last crossing now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept Hobb’s surrender while Mara braces the crossing.",
          "scoreDelta": 0,
          "nextNodeId": "V20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the bridge with Hobb and the evidence still upon it.",
          "failTitle": "Failure at The last crossing",
          "failText": "A reckless decision at the last crossing gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure Hobb and the ledger before the bridge pins fail.",
          "scoreDelta": 1,
          "nextNodeId": "V20A"
        }
      ]
    },
    {
      "id": "V19B",
      "turn": 19,
      "title": "The last crossing - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to the last crossing. The last crossing. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The fire trench catches, but Sella’s miners cut it off with wet spoil. Hobb runs for the rope bridge carrying the ledger page that could still save him. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the last crossing, patience keeps uncertain testimony separate from proven fact.",
        "You follow across the swaying boards while Mara turns the bells toward the villages. Thorne waits below, stamping at the falling ash. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving the last crossing in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the bridge with Hobb and the evidence still upon it, taking time to verify each step.",
          "failTitle": "Failure at The last crossing",
          "failText": "A reckless decision at the last crossing gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure Hobb and the ledger before the bridge pins fail, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "V20B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept Hobb’s surrender while Mara braces the crossing, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "V20C"
        }
      ]
    },
    {
      "id": "V19C",
      "turn": 19,
      "title": "The last crossing - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the last crossing. The last crossing. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The fire trench catches, but Sella’s miners cut it off with wet spoil. Hobb runs for the rope bridge carrying the ledger page that could still save him. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the last crossing, you rebuild the weakened trail from the signs that remain.",
        "You follow across the swaying boards while Mara turns the bells toward the villages. Thorne waits below, stamping at the falling ash. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at the last crossing can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Secure Hobb and the ledger before the bridge pins fail, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "V20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept Hobb’s surrender while Mara braces the crossing, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "V20A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the bridge with Hobb and the evidence still upon it, despite the ground already lost.",
          "failTitle": "Failure at The last crossing",
          "failText": "A reckless decision at the last crossing gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "V20A",
      "turn": 20,
      "title": "A hard spring - clear lead",
      "narrative": [
        "Following the strongest evidence brings you to a hard spring. A hard spring. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "By dawn, the mine stands and the grain is under guard. Hobb is taken to Duke Aldric, Oren submits the letters, and Mara begins rehanging the bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a hard spring, the fresh details give you a narrow advantage.",
        "The valley has learned that warning is more than a sound: it is trust between people who may never see one another. The first honest inventory in years begins at Greyhook. The next decision must protect both the valley and the truth, for either can be lost by haste. Acting from a hard spring now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the surviving conspirators settle the matter among themselves.",
          "failTitle": "Failure at A hard spring",
          "failText": "A reckless decision at a hard spring gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Deliver the grain, letters, and prisoners together to Aldric.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Mara to restore the bells while you report ahead.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "V20B",
      "turn": 20,
      "title": "A hard spring - hard-won clue",
      "narrative": [
        "After securing the previous scene, you continue to a hard spring. A hard spring. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "By dawn, the mine stands and the grain is under guard. Hobb is taken to Duke Aldric, Oren submits the letters, and Mara begins rehanging the bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a hard spring, patience keeps uncertain testimony separate from proven fact.",
        "The valley has learned that warning is more than a sound: it is trust between people who may never see one another. The first honest inventory in years begins at Greyhook. The next decision must protect both the valley and the truth, for either can be lost by haste. Leaving a hard spring in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Deliver the grain, letters, and prisoners together to Aldric, taking time to verify each step.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Mara to restore the bells while you report ahead, taking time to verify each step.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the surviving conspirators settle the matter among themselves, taking time to verify each step.",
          "failTitle": "Failure at A hard spring",
          "failText": "A reckless decision at a hard spring gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "V20C",
      "turn": 20,
      "title": "A hard spring - uncertain ground",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a hard spring. A hard spring. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "By dawn, the mine stands and the grain is under guard. Hobb is taken to Duke Aldric, Oren submits the letters, and Mara begins rehanging the bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a hard spring, you rebuild the weakened trail from the signs that remain.",
        "The valley has learned that warning is more than a sound: it is trust between people who may never see one another. The first honest inventory in years begins at Greyhook. The next decision must protect both the valley and the truth, for either can be lost by haste. A careful decision at a hard spring can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Mara to restore the bells while you report ahead, despite the ground already lost.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the surviving conspirators settle the matter among themselves, despite the ground already lost.",
          "failTitle": "Failure at A hard spring",
          "failText": "A reckless decision at a hard spring gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Deliver the grain, letters, and prisoners together to Aldric, despite the ground already lost.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
