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
        "Duke Aldric sends you to Greyhook after three mountain warning bells are found wrapped in wet wool. A storm is building, and the passes depend on those bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "You ride with Thorne before noon, carrying a sealed order and a pouch of healing herbs. The duke’s wardens believe the thefts are a raider’s work, but the cut straps show patient hands. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
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
        "Aldric’s warning. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Duke Aldric sends you to Greyhook after three mountain warning bells are found wrapped in wet wool. A storm is building, and the passes depend on those bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "You ride with Thorne before noon, carrying a sealed order and a pouch of healing herbs. The duke’s wardens believe the thefts are a raider’s work, but the cut straps show patient hands. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V02B"
        }
      ]
    },
    {
      "id": "V01C",
      "turn": 1,
      "title": "Aldric’s warning - uncertain ground",
      "narrative": [
        "Aldric’s warning. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Duke Aldric sends you to Greyhook after three mountain warning bells are found wrapped in wet wool. A storm is building, and the passes depend on those bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "You ride with Thorne before noon, carrying a sealed order and a pouch of healing herbs. The duke’s wardens believe the thefts are a raider’s work, but the cut straps show patient hands. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V02A",
      "turn": 2,
      "title": "Tracks above Greyhook - clear lead",
      "narrative": [
        "Tracks above Greyhook. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Snow has begun to sift across the high path, yet a line of narrow sled marks remains beside the cliff road. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Mara identifies the iron scratches as bell runners, while a shepherd remembers a lantern moving uphill after midnight. The trail divides near a pine blasted open by lightning. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
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
        "Tracks above Greyhook. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Snow has begun to sift across the high path, yet a line of narrow sled marks remains beside the cliff road. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Mara identifies the iron scratches as bell runners, while a shepherd remembers a lantern moving uphill after midnight. The trail divides near a pine blasted open by lightning. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V02C",
      "turn": 2,
      "title": "Tracks above Greyhook - uncertain ground",
      "narrative": [
        "Tracks above Greyhook. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Snow has begun to sift across the high path, yet a line of narrow sled marks remains beside the cliff road. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Mara identifies the iron scratches as bell runners, while a shepherd remembers a lantern moving uphill after midnight. The trail divides near a pine blasted open by lightning. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V03A"
        }
      ]
    },
    {
      "id": "V03A",
      "turn": 3,
      "title": "The watch hut - clear lead",
      "narrative": [
        "The watch hut. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The hut contains no raiders, only a cold brazier, three lengths of new rope, and a scrap of ledger paper sealed with blue wax. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The writing lists grain weights and bell positions in the same hand Mara recognizes from the wardens’ records. Someone has been studying the valley as a system, not stealing at random. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V03B",
      "turn": 3,
      "title": "The watch hut - hard-won clue",
      "narrative": [
        "The watch hut. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The hut contains no raiders, only a cold brazier, three lengths of new rope, and a scrap of ledger paper sealed with blue wax. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The writing lists grain weights and bell positions in the same hand Mara recognizes from the wardens’ records. Someone has been studying the valley as a system, not stealing at random. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V04A"
        }
      ]
    },
    {
      "id": "V03C",
      "turn": 3,
      "title": "The watch hut - uncertain ground",
      "narrative": [
        "The watch hut. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The hut contains no raiders, only a cold brazier, three lengths of new rope, and a scrap of ledger paper sealed with blue wax. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The writing lists grain weights and bell positions in the same hand Mara recognizes from the wardens’ records. Someone has been studying the valley as a system, not stealing at random. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V04B"
        }
      ]
    },
    {
      "id": "V04A",
      "turn": 4,
      "title": "A false warning - clear lead",
      "narrative": [
        "A false warning. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The northern bell has been moved to a ruined shrine and fitted with a cracked clapper. Its note is wrong, but frightened villagers are already leaving their homes. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The alarm draws people toward the road while two pack mules disappear from the storehouse. The theft is broader than the bells: someone is testing how the valley reacts to a command. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
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
        "A false warning. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The northern bell has been moved to a ruined shrine and fitted with a cracked clapper. Its note is wrong, but frightened villagers are already leaving their homes. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The alarm draws people toward the road while two pack mules disappear from the storehouse. The theft is broader than the bells: someone is testing how the valley reacts to a command. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V05B"
        }
      ]
    },
    {
      "id": "V04C",
      "turn": 4,
      "title": "A false warning - uncertain ground",
      "narrative": [
        "A false warning. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The northern bell has been moved to a ruined shrine and fitted with a cracked clapper. Its note is wrong, but frightened villagers are already leaving their homes. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The alarm draws people toward the road while two pack mules disappear from the storehouse. The theft is broader than the bells: someone is testing how the valley reacts to a command. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V05A",
      "turn": 5,
      "title": "Mara under suspicion - clear lead",
      "narrative": [
        "Mara under suspicion. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "By sunset, suspicion has turned on Mara because she alone keeps the bell keys. She answers sharply, but her anger has the clean edge of someone cornered by an unfair truth. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "You discover a second key hidden beneath the shrine’s foundation stone. It was made recently and filed to fit an old lock. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
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
        "Mara under suspicion. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "By sunset, suspicion has turned on Mara because she alone keeps the bell keys. She answers sharply, but her anger has the clean edge of someone cornered by an unfair truth. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "You discover a second key hidden beneath the shrine’s foundation stone. It was made recently and filed to fit an old lock. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V05C",
      "turn": 5,
      "title": "Mara under suspicion - uncertain ground",
      "narrative": [
        "Mara under suspicion. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "By sunset, suspicion has turned on Mara because she alone keeps the bell keys. She answers sharply, but her anger has the clean edge of someone cornered by an unfair truth. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "You discover a second key hidden beneath the shrine’s foundation stone. It was made recently and filed to fit an old lock. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V06A"
        }
      ]
    },
    {
      "id": "V06A",
      "turn": 6,
      "title": "The quartermaster’s ledger - clear lead",
      "narrative": [
        "The quartermaster’s ledger. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The blue wax matches seals used by Quartermaster Hobb in Riverland. His ledger records supplies sent uphill, but several entries are too neat: identical weights on days when the roads were closed. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "A missing page leaves only a pressure mark and the words ‘Cairn Nine’. Hobb insists it means a storage marker, not a person, and offers soldiers to arrest Mara. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V06B",
      "turn": 6,
      "title": "The quartermaster’s ledger - hard-won clue",
      "narrative": [
        "The quartermaster’s ledger. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The blue wax matches seals used by Quartermaster Hobb in Riverland. His ledger records supplies sent uphill, but several entries are too neat: identical weights on days when the roads were closed. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "A missing page leaves only a pressure mark and the words ‘Cairn Nine’. Hobb insists it means a storage marker, not a person, and offers soldiers to arrest Mara. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V07A"
        }
      ]
    },
    {
      "id": "V06C",
      "turn": 6,
      "title": "The quartermaster’s ledger - uncertain ground",
      "narrative": [
        "The quartermaster’s ledger. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The blue wax matches seals used by Quartermaster Hobb in Riverland. His ledger records supplies sent uphill, but several entries are too neat: identical weights on days when the roads were closed. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "A missing page leaves only a pressure mark and the words ‘Cairn Nine’. Hobb insists it means a storage marker, not a person, and offers soldiers to arrest Mara. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V07B"
        }
      ]
    },
    {
      "id": "V07A",
      "turn": 7,
      "title": "A hidden runner - clear lead",
      "narrative": [
        "A hidden runner. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Behind the stable wall lies a narrow crawlspace with fresh straw, a coil of bell rope, and a child’s mitten. No adult could have worked there without leaving splinters in the old boards. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The mitten belongs to Finn, an orphan who carries messages for the Greyhook inn. He is missing, and the innkeeper says Oren Vale spoke kindly to him two nights ago. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
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
        "A hidden runner. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Behind the stable wall lies a narrow crawlspace with fresh straw, a coil of bell rope, and a child’s mitten. No adult could have worked there without leaving splinters in the old boards. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The mitten belongs to Finn, an orphan who carries messages for the Greyhook inn. He is missing, and the innkeeper says Oren Vale spoke kindly to him two nights ago. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V08B"
        }
      ]
    },
    {
      "id": "V07C",
      "turn": 7,
      "title": "A hidden runner - uncertain ground",
      "narrative": [
        "A hidden runner. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Behind the stable wall lies a narrow crawlspace with fresh straw, a coil of bell rope, and a child’s mitten. No adult could have worked there without leaving splinters in the old boards. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The mitten belongs to Finn, an orphan who carries messages for the Greyhook inn. He is missing, and the innkeeper says Oren Vale spoke kindly to him two nights ago. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V08A",
      "turn": 8,
      "title": "The charcoal road - clear lead",
      "narrative": [
        "The charcoal road. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The road climbs through black pines where old kilns crouch beneath snow. Finn’s footprints end beside a handcart, but the cart has been dragged uphill rather than downhill. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "A whistle answers from the trees. You see Finn for one instant, waving from behind a stump, then a hooded figure pulls him away. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
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
        "The charcoal road. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The road climbs through black pines where old kilns crouch beneath snow. Finn’s footprints end beside a handcart, but the cart has been dragged uphill rather than downhill. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "A whistle answers from the trees. You see Finn for one instant, waving from behind a stump, then a hooded figure pulls him away. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V08C",
      "turn": 8,
      "title": "The charcoal road - uncertain ground",
      "narrative": [
        "The charcoal road. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The road climbs through black pines where old kilns crouch beneath snow. Finn’s footprints end beside a handcart, but the cart has been dragged uphill rather than downhill. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "A whistle answers from the trees. You see Finn for one instant, waving from behind a stump, then a hooded figure pulls him away. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V09A"
        }
      ]
    },
    {
      "id": "V09A",
      "turn": 9,
      "title": "The winter forge - clear lead",
      "narrative": [
        "The winter forge. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "You find the forge under a collapsed charcoal shed. Oren Vale is not there, but the stolen bells hang from beams, their clappers removed and their mouths packed with pitch. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Finn is tied safely to a post, frightened more than hurt. He says Oren claimed the bells were being silenced to prevent a massacre, not to cause one. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V09B",
      "turn": 9,
      "title": "The winter forge - hard-won clue",
      "narrative": [
        "The winter forge. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "You find the forge under a collapsed charcoal shed. Oren Vale is not there, but the stolen bells hang from beams, their clappers removed and their mouths packed with pitch. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Finn is tied safely to a post, frightened more than hurt. He says Oren claimed the bells were being silenced to prevent a massacre, not to cause one. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V10A"
        }
      ]
    },
    {
      "id": "V09C",
      "turn": 9,
      "title": "The winter forge - uncertain ground",
      "narrative": [
        "The winter forge. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "You find the forge under a collapsed charcoal shed. Oren Vale is not there, but the stolen bells hang from beams, their clappers removed and their mouths packed with pitch. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Finn is tied safely to a post, frightened more than hurt. He says Oren claimed the bells were being silenced to prevent a massacre, not to cause one. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V10B"
        }
      ]
    },
    {
      "id": "V10A",
      "turn": 10,
      "title": "A prisoner’s account - clear lead",
      "narrative": [
        "A prisoner’s account. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Finn tells you Oren left with two men wearing warden cloaks. He overheard them arguing about a caravan that would arrive before the storm. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The boy remembers Oren saying, ‘When the bells speak, the valley dies.’ It sounds like a threat until you notice that the packed bells are marked with tiny chalk crosses. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
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
        "A prisoner’s account. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Finn tells you Oren left with two men wearing warden cloaks. He overheard them arguing about a caravan that would arrive before the storm. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The boy remembers Oren saying, ‘When the bells speak, the valley dies.’ It sounds like a threat until you notice that the packed bells are marked with tiny chalk crosses. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V11B"
        }
      ]
    },
    {
      "id": "V10C",
      "turn": 10,
      "title": "A prisoner’s account - uncertain ground",
      "narrative": [
        "A prisoner’s account. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Finn tells you Oren left with two men wearing warden cloaks. He overheard them arguing about a caravan that would arrive before the storm. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The boy remembers Oren saying, ‘When the bells speak, the valley dies.’ It sounds like a threat until you notice that the packed bells are marked with tiny chalk crosses. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V11A",
      "turn": 11,
      "title": "The sealed pass - clear lead",
      "narrative": [
        "The sealed pass. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "A fresh avalanche has closed the high road, but the debris is too orderly. Stone blocks have been loosened from above and guided into the cut. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The route to King’s Mercy now seems to be the only open approach. A dead courier lies near the snow line with a quartermaster’s seal and a message naming no enemy. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
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
        "The sealed pass. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "A fresh avalanche has closed the high road, but the debris is too orderly. Stone blocks have been loosened from above and guided into the cut. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The route to King’s Mercy now seems to be the only open approach. A dead courier lies near the snow line with a quartermaster’s seal and a message naming no enemy. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V11C",
      "turn": 11,
      "title": "The sealed pass - uncertain ground",
      "narrative": [
        "The sealed pass. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "A fresh avalanche has closed the high road, but the debris is too orderly. Stone blocks have been loosened from above and guided into the cut. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The route to King’s Mercy now seems to be the only open approach. A dead courier lies near the snow line with a quartermaster’s seal and a message naming no enemy. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V12A"
        }
      ]
    },
    {
      "id": "V12A",
      "turn": 12,
      "title": "Cairn Nine - clear lead",
      "narrative": [
        "Cairn Nine. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "At Cairn Nine, the clapper points toward a narrow ravine. There you find crates stamped with the duke’s mark, all empty except for a layer of spoiled barley. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "A hidden boot print crosses the crate dust. The person wore a warden’s nails, but the heel was repaired with red thread, a detail Mara recalls from Hobb’s escort. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V12B",
      "turn": 12,
      "title": "Cairn Nine - hard-won clue",
      "narrative": [
        "Cairn Nine. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "At Cairn Nine, the clapper points toward a narrow ravine. There you find crates stamped with the duke’s mark, all empty except for a layer of spoiled barley. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "A hidden boot print crosses the crate dust. The person wore a warden’s nails, but the heel was repaired with red thread, a detail Mara recalls from Hobb’s escort. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V13A"
        }
      ]
    },
    {
      "id": "V12C",
      "turn": 12,
      "title": "Cairn Nine - uncertain ground",
      "narrative": [
        "Cairn Nine. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "At Cairn Nine, the clapper points toward a narrow ravine. There you find crates stamped with the duke’s mark, all empty except for a layer of spoiled barley. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "A hidden boot print crosses the crate dust. The person wore a warden’s nails, but the heel was repaired with red thread, a detail Mara recalls from Hobb’s escort. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V13B"
        }
      ]
    },
    {
      "id": "V13A",
      "turn": 13,
      "title": "The red-thread trail - clear lead",
      "narrative": [
        "The red-thread trail. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The red-thread heel leads to a rope bridge above the ravine. On its far side, a sentry has abandoned a warm cloak and a pouch of copper tokens. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The tokens bear the mark of a workers’ brotherhood from the old mines. The miners were closed out years ago after a cave-in, though some families still live under the ridge. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
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
        "The red-thread trail. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The red-thread heel leads to a rope bridge above the ravine. On its far side, a sentry has abandoned a warm cloak and a pouch of copper tokens. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The tokens bear the mark of a workers’ brotherhood from the old mines. The miners were closed out years ago after a cave-in, though some families still live under the ridge. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V14B"
        }
      ]
    },
    {
      "id": "V13C",
      "turn": 13,
      "title": "The red-thread trail - uncertain ground",
      "narrative": [
        "The red-thread trail. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The red-thread heel leads to a rope bridge above the ravine. On its far side, a sentry has abandoned a warm cloak and a pouch of copper tokens. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The tokens bear the mark of a workers’ brotherhood from the old mines. The miners were closed out years ago after a cave-in, though some families still live under the ridge. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V14A",
      "turn": 14,
      "title": "Sella’s bargain - clear lead",
      "narrative": [
        "Sella’s bargain. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Sella will lead you to the hidden mine if you promise not to bring soldiers until the truth is seen. She does not trust uniforms, especially after Hobb’s men seized two winter wagons. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Inside her satchel is a list of villages shorted by the same amount. The figures match the false ledger entries exactly. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
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
        "Sella’s bargain. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Sella will lead you to the hidden mine if you promise not to bring soldiers until the truth is seen. She does not trust uniforms, especially after Hobb’s men seized two winter wagons. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Inside her satchel is a list of villages shorted by the same amount. The figures match the false ledger entries exactly. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        }
      ]
    },
    {
      "id": "V14C",
      "turn": 14,
      "title": "Sella’s bargain - uncertain ground",
      "narrative": [
        "Sella’s bargain. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Sella will lead you to the hidden mine if you promise not to bring soldiers until the truth is seen. She does not trust uniforms, especially after Hobb’s men seized two winter wagons. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Inside her satchel is a list of villages shorted by the same amount. The figures match the false ledger entries exactly. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V15A"
        }
      ]
    },
    {
      "id": "V15A",
      "turn": 15,
      "title": "The mine of King’s Mercy - clear lead",
      "narrative": [
        "The mine of King’s Mercy. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The mine entrance is guarded by silence. No pick strikes echo from within, but fresh snow has been swept from a side door. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Sella’s people have moved the grain there, not stolen it. The sacks are dry, properly marked, and enough to keep four villages alive until spring. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        }
      ]
    },
    {
      "id": "V15B",
      "turn": 15,
      "title": "The mine of King’s Mercy - hard-won clue",
      "narrative": [
        "The mine of King’s Mercy. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The mine entrance is guarded by silence. No pick strikes echo from within, but fresh snow has been swept from a side door. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Sella’s people have moved the grain there, not stolen it. The sacks are dry, properly marked, and enough to keep four villages alive until spring. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V16A"
        }
      ]
    },
    {
      "id": "V15C",
      "turn": 15,
      "title": "The mine of King’s Mercy - uncertain ground",
      "narrative": [
        "The mine of King’s Mercy. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The mine entrance is guarded by silence. No pick strikes echo from within, but fresh snow has been swept from a side door. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Sella’s people have moved the grain there, not stolen it. The sacks are dry, properly marked, and enough to keep four villages alive until spring. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V16B"
        }
      ]
    },
    {
      "id": "V16A",
      "turn": 16,
      "title": "The second deception - clear lead",
      "narrative": [
        "The second deception. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "Oren admits he staged the bell thefts to draw attention to the missing grain. Hobb, he says, learned of the plan and planted evidence that would make the miners look like saboteurs. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Before the confession can settle, a runner arrives: Hobb’s soldiers are approaching the mine with orders to seize the stores and arrest everyone inside. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
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
        "The second deception. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "Oren admits he staged the bell thefts to draw attention to the missing grain. Hobb, he says, learned of the plan and planted evidence that would make the miners look like saboteurs. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Before the confession can settle, a runner arrives: Hobb’s soldiers are approaching the mine with orders to seize the stores and arrest everyone inside. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V17B"
        }
      ]
    },
    {
      "id": "V16C",
      "turn": 16,
      "title": "The second deception - uncertain ground",
      "narrative": [
        "The second deception. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "Oren admits he staged the bell thefts to draw attention to the missing grain. Hobb, he says, learned of the plan and planted evidence that would make the miners look like saboteurs. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Before the confession can settle, a runner arrives: Hobb’s soldiers are approaching the mine with orders to seize the stores and arrest everyone inside. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        }
      ]
    },
    {
      "id": "V17A",
      "turn": 17,
      "title": "The avalanche line - clear lead",
      "narrative": [
        "The avalanche line. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "You inspect the upper slope and see the real danger. Hobb’s men have built a fire beneath a snow shelf, intending to trigger a slide that will seal the mine and destroy the evidence. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Mara can restore two bells, but the clappers are scattered. Sella knows a drainage tunnel to the slope, while Oren knows where Hobb’s officers will stand. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
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
        "The avalanche line. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "You inspect the upper slope and see the real danger. Hobb’s men have built a fire beneath a snow shelf, intending to trigger a slide that will seal the mine and destroy the evidence. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Mara can restore two bells, but the clappers are scattered. Sella knows a drainage tunnel to the slope, while Oren knows where Hobb’s officers will stand. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        }
      ]
    },
    {
      "id": "V17C",
      "turn": 17,
      "title": "The avalanche line - uncertain ground",
      "narrative": [
        "The avalanche line. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "You inspect the upper slope and see the real danger. Hobb’s men have built a fire beneath a snow shelf, intending to trigger a slide that will seal the mine and destroy the evidence. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Mara can restore two bells, but the clappers are scattered. Sella knows a drainage tunnel to the slope, while Oren knows where Hobb’s officers will stand. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V18A"
        }
      ]
    },
    {
      "id": "V18A",
      "turn": 18,
      "title": "The bells answer - clear lead",
      "narrative": [
        "The bells answer. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The first restored bell sends a low note through the snow. The second answers from the mine mouth, and villagers in the distant valley begin moving toward safe ground. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Hobb’s soldiers hesitate when Mara names the rescue code. Their captain reads the letters you recovered and realizes the quartermaster’s seal has been used to hide theft. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        }
      ]
    },
    {
      "id": "V18B",
      "turn": 18,
      "title": "The bells answer - hard-won clue",
      "narrative": [
        "The bells answer. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The first restored bell sends a low note through the snow. The second answers from the mine mouth, and villagers in the distant valley begin moving toward safe ground. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Hobb’s soldiers hesitate when Mara names the rescue code. Their captain reads the letters you recovered and realizes the quartermaster’s seal has been used to hide theft. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V19A"
        }
      ]
    },
    {
      "id": "V18C",
      "turn": 18,
      "title": "The bells answer - uncertain ground",
      "narrative": [
        "The bells answer. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The first restored bell sends a low note through the snow. The second answers from the mine mouth, and villagers in the distant valley begin moving toward safe ground. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "Hobb’s soldiers hesitate when Mara names the rescue code. Their captain reads the letters you recovered and realizes the quartermaster’s seal has been used to hide theft. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V19B"
        }
      ]
    },
    {
      "id": "V19A",
      "turn": 19,
      "title": "The last crossing - clear lead",
      "narrative": [
        "The last crossing. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "The fire trench catches, but Sella’s miners cut it off with wet spoil. Hobb runs for the rope bridge carrying the ledger page that could still save him. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "You follow across the swaying boards while Mara turns the bells toward the villages. Thorne waits below, stamping at the falling ash. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
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
        "The last crossing. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "The fire trench catches, but Sella’s miners cut it off with wet spoil. Hobb runs for the rope bridge carrying the ledger page that could still save him. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "You follow across the swaying boards while Mara turns the bells toward the villages. Thorne waits below, stamping at the falling ash. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V20B"
        }
      ]
    },
    {
      "id": "V19C",
      "turn": 19,
      "title": "The last crossing - uncertain ground",
      "narrative": [
        "The last crossing. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "The fire trench catches, but Sella’s miners cut it off with wet spoil. Hobb runs for the rope bridge carrying the ledger page that could still save him. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "You follow across the swaying boards while Mara turns the bells toward the villages. Thorne waits below, stamping at the falling ash. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "nextNodeId": "V20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "V20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        }
      ]
    },
    {
      "id": "V20A",
      "turn": 20,
      "title": "A hard spring - clear lead",
      "narrative": [
        "A hard spring. The clear lead has shaped your approach, and the cold is closing around Greyhook.",
        "By dawn, the mine stands and the grain is under guard. Hobb is taken to Duke Aldric, Oren submits the letters, and Mara begins rehanging the bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The valley has learned that warning is more than a sound: it is trust between people who may never see one another. The first honest inventory in years begins at Greyhook. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
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
        "A hard spring. The hard-won clue has shaped your approach, and the cold is closing around Greyhook.",
        "By dawn, the mine stands and the grain is under guard. Hobb is taken to Duke Aldric, Oren submits the letters, and Mara begins rehanging the bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The valley has learned that warning is more than a sound: it is trust between people who may never see one another. The first honest inventory in years begins at Greyhook. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        }
      ]
    },
    {
      "id": "V20C",
      "turn": 20,
      "title": "A hard spring - uncertain ground",
      "narrative": [
        "A hard spring. The uncertain ground has shaped your approach, and the cold is closing around Greyhook.",
        "By dawn, the mine stands and the grain is under guard. Hobb is taken to Duke Aldric, Oren submits the letters, and Mara begins rehanging the bells. You keep your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The valley has learned that warning is more than a sound: it is trust between people who may never see one another. The first honest inventory in years begins at Greyhook. The next decision must protect both the valley and the truth, for either can be lost by haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the witnesses and proceed with measured caution.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient story without checking its cost.",
          "failTitle": "The Mountain Wins",
          "failText": "The decision gives the storm and the conspirators the opening they needed. The warning chain fails, and Greyhook faces the danger without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the people first.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
