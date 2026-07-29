window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-iron-rain",
  "title": "The Iron Rain",
  "summary": "Iron bolts begin falling from clear mountain skies, driving families from their homes. With smith Maelin Kest, the ranger uncovers a disgraced engineer testing hidden engines for an attack on Duke Aldric's cliff road.",
  "maxTurns": 20,
  "startNodeId": "E01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "Torren Rusk's engines are dismantled before witnesses, his buyers are named, and the cliff road remains open for Duke Aldric's progress. Maelin turns the recovered iron into tools for the damaged hamlets, where rain means water again rather than falling steel.",
    "low": "The largest engine is destroyed and Aldric's road is saved, but Rusk escapes or his buyer list burns. Mountain wardens occupy the heights while the hamlets rebuild beneath an uneasy sky."
  },
  "nodes": [
    {
      "id": "E01A",
      "turn": 1,
      "title": "Bolts from a Clear Sky - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into the slate hamlets of the Gray Mountains as three heavy iron bolts strike roofs in the hamlet of Slate End despite a cloudless morning.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Smith Maelin Kest shows you that none bear feathers, and each entered from the same western angle.",
        "The clearer position reveals the stakes: What frightened villagers call iron rain was launched by hands hidden somewhere above the valley."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Measure the entry angles before removing the bolts.",
          "scoreDelta": 1,
          "nextNodeId": "E02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Evacuate the western houses and search uphill.",
          "scoreDelta": 0,
          "nextNodeId": "E02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride directly toward the highest ridge.",
          "failTitle": "Under the Next Volley",
          "failText": "A second bolt takes Thorne beneath you on exposed ground and ends the search in panic.",
          "death": true
        }
      ]
    },
    {
      "id": "E01B",
      "turn": 1,
      "title": "Bolts from a Clear Sky - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: three heavy iron bolts strike roofs in the hamlet of Slate End despite a cloudless morning.",
        "With Thorne close and local witnesses beside you, you compare every account. Smith Maelin Kest shows you that none bear feathers, and each entered from the same western angle.",
        "The evidence now defines the danger: What frightened villagers call iron rain was launched by hands hidden somewhere above the valley."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Evacuate the western houses and search uphill while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride directly toward the highest ridge while keeping Maelin Kest informed.",
          "failTitle": "Under the Next Volley",
          "failText": "A second bolt takes Thorne beneath you on exposed ground and ends the search in panic.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure the entry angles before removing the bolts while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E02B"
        }
      ]
    },
    {
      "id": "E01C",
      "turn": 1,
      "title": "Bolts from a Clear Sky - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, three heavy iron bolts strike roofs in the hamlet of Slate End despite a cloudless morning.",
        "Working against the light, you test the few signs that remain. Smith Maelin Kest shows you that none bear feathers, and each entered from the same western angle.",
        "Delay has sharpened the danger: What frightened villagers call iron rain was launched by hands hidden somewhere above the valley."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride directly toward the highest ridge before the remaining light fails.",
          "failTitle": "Under the Next Volley",
          "failText": "A second bolt takes Thorne beneath you on exposed ground and ends the search in panic.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure the entry angles before removing the bolts before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Evacuate the western houses and search uphill before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E02A"
        }
      ]
    },
    {
      "id": "E02A",
      "turn": 2,
      "title": "The Bent Socket - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. One bolt has a hollow socket and a groove worn by twisted rope.",
        "You circle downwind and let small marks tell their order. Maelin recognizes the forging style of Torren Rusk, a former bridge engineer dismissed for unsafe engines.",
        "The clearer position reveals the stakes: The weapon is neither bow nor accident, and its maker knows the duke's mountain works."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask wardens where Rusk was last seen.",
          "scoreDelta": 0,
          "nextNodeId": "E03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Heat the bolt until it reveals hidden marks.",
          "failTitle": "Evidence in the Forge",
          "failText": "The heat burns away rope and oil traces while watchers see exactly where the inquiry has gone.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the rope fibers and compare Rusk's old bridge fittings.",
          "scoreDelta": 1,
          "nextNodeId": "E03A"
        }
      ]
    },
    {
      "id": "E02B",
      "turn": 2,
      "title": "The Bent Socket - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. One bolt has a hollow socket and a groove worn by twisted rope.",
        "You ask plain questions and watch which answers agree. Maelin recognizes the forging style of Torren Rusk, a former bridge engineer dismissed for unsafe engines.",
        "The evidence now defines the danger: The weapon is neither bow nor accident, and its maker knows the duke's mountain works."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Heat the bolt until it reveals hidden marks while keeping Maelin Kest informed.",
          "failTitle": "Evidence in the Forge",
          "failText": "The heat burns away rope and oil traces while watchers see exactly where the inquiry has gone.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the rope fibers and compare Rusk's old bridge fittings while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask wardens where Rusk was last seen while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E03C"
        }
      ]
    },
    {
      "id": "E02C",
      "turn": 2,
      "title": "The Bent Socket - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. One bolt has a hollow socket and a groove worn by twisted rope.",
        "There is no time for elegance, only for separating fresh danger from old damage. Maelin recognizes the forging style of Torren Rusk, a former bridge engineer dismissed for unsafe engines.",
        "Delay has sharpened the danger: The weapon is neither bow nor accident, and its maker knows the duke's mountain works."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the rope fibers and compare Rusk's old bridge fittings before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask wardens where Rusk was last seen before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Heat the bolt until it reveals hidden marks before the remaining light fails.",
          "failTitle": "Evidence in the Forge",
          "failText": "The heat burns away rope and oil traces while watchers see exactly where the inquiry has gone.",
          "death": false
        }
      ]
    },
    {
      "id": "E03A",
      "turn": 3,
      "title": "The Empty Smithy - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Maelin's upper-valley forge has been stripped of bar iron, tongs, and two apprentices.",
        "From sheltered ground, you measure tracks, tools, and distances. Cart grooves stop at bare rock where loads appear to vanish.",
        "The clearer position reveals the stakes: The missing smiths may be building the engines under force, and every bolt costs metal taken from Brackenwald."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Set the forge alight as a warning to thieves.",
          "failTitle": "The Smithy Burned",
          "failText": "Fire destroys order books and convinces the captives that rescue will not come from lawful hands.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Find crushed slate hiding the cart's turn.",
          "scoreDelta": 1,
          "nextNodeId": "E04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the apprentices' families about recent visitors.",
          "scoreDelta": 0,
          "nextNodeId": "E04B"
        }
      ]
    },
    {
      "id": "E03B",
      "turn": 3,
      "title": "The Empty Smithy - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Maelin's upper-valley forge has been stripped of bar iron, tongs, and two apprentices.",
        "You keep the scene orderly while your allies search it piece by piece. Cart grooves stop at bare rock where loads appear to vanish.",
        "The evidence now defines the danger: The missing smiths may be building the engines under force, and every bolt costs metal taken from Brackenwald."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Find crushed slate hiding the cart's turn while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the apprentices' families about recent visitors while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set the forge alight as a warning to thieves while keeping Maelin Kest informed.",
          "failTitle": "The Smithy Burned",
          "failText": "Fire destroys order books and convinces the captives that rescue will not come from lawful hands.",
          "death": false
        }
      ]
    },
    {
      "id": "E03C",
      "turn": 3,
      "title": "The Empty Smithy - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Maelin's upper-valley forge has been stripped of bar iron, tongs, and two apprentices.",
        "Pressed for time, you trust hard evidence and discard rumor. Cart grooves stop at bare rock where loads appear to vanish.",
        "Delay has sharpened the danger: The missing smiths may be building the engines under force, and every bolt costs metal taken from Brackenwald."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the apprentices' families about recent visitors before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set the forge alight as a warning to thieves before the remaining light fails.",
          "failTitle": "The Smithy Burned",
          "failText": "Fire destroys order books and convinces the captives that rescue will not come from lawful hands.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Find crushed slate hiding the cart's turn before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E04C"
        }
      ]
    },
    {
      "id": "E04A",
      "turn": 4,
      "title": "Marks on the Scree - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Paired drag marks cross a scree slope too steep for an ordinary cart.",
        "You move quietly enough to hear work and voices ahead. Small iron shoes on the marks show that engine parts were hauled by sled and winch.",
        "The clearer position reveals the stakes: Rusk can move a weapon between heights without using roads watched by wardens."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the anchor scars from cover.",
          "scoreDelta": 1,
          "nextNodeId": "E05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Climb beside Maelin and mark each winch point.",
          "scoreDelta": 0,
          "nextNodeId": "E05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the highest visible rope.",
          "failTitle": "Stone and Timber Released",
          "failText": "The severed rope drops a loaded sled down the slope toward the hamlet.",
          "death": true
        }
      ]
    },
    {
      "id": "E04B",
      "turn": 4,
      "title": "Marks on the Scree - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Paired drag marks cross a scree slope too steep for an ordinary cart.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Small iron shoes on the marks show that engine parts were hauled by sled and winch.",
        "The evidence now defines the danger: Rusk can move a weapon between heights without using roads watched by wardens."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Climb beside Maelin and mark each winch point while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the highest visible rope while keeping Maelin Kest informed.",
          "failTitle": "Stone and Timber Released",
          "failText": "The severed rope drops a loaded sled down the slope toward the hamlet.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the anchor scars from cover while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E05B"
        }
      ]
    },
    {
      "id": "E04C",
      "turn": 4,
      "title": "Marks on the Scree - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Paired drag marks cross a scree slope too steep for an ordinary cart.",
        "You push through fatigue, knowing the next mistake may close the road. Small iron shoes on the marks show that engine parts were hauled by sled and winch.",
        "Delay has sharpened the danger: Rusk can move a weapon between heights without using roads watched by wardens."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the highest visible rope before the remaining light fails.",
          "failTitle": "Stone and Timber Released",
          "failText": "The severed rope drops a loaded sled down the slope toward the hamlet.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the anchor scars from cover before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Climb beside Maelin and mark each winch point before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E05A"
        }
      ]
    },
    {
      "id": "E05A",
      "turn": 5,
      "title": "The First Engine Bed - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. A leveled shelf holds a timber frame, spent rope, and three aiming stakes.",
        "A ranger's eye finds the human habit behind the apparent mystery. The stakes point not only at Slate End but at ranges marked for moving riders and wagons.",
        "The clearer position reveals the stakes: The roof strikes were trials for a weapon intended against a road-bound target."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Set a hidden watch for the engine crew.",
          "scoreDelta": 0,
          "nextNodeId": "E06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the frame and leave it in plain sight.",
          "failTitle": "The Test Site Warns Them",
          "failText": "Rusk sees the destruction from another height and changes every prepared position.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the range marks and recover the firing wedge.",
          "scoreDelta": 1,
          "nextNodeId": "E06A"
        }
      ]
    },
    {
      "id": "E05B",
      "turn": 5,
      "title": "The First Engine Bed - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. A leveled shelf holds a timber frame, spent rope, and three aiming stakes.",
        "Together, the small company builds one reliable account from scattered facts. The stakes point not only at Slate End but at ranges marked for moving riders and wagons.",
        "The evidence now defines the danger: The roof strikes were trials for a weapon intended against a road-bound target."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the frame and leave it in plain sight while keeping Maelin Kest informed.",
          "failTitle": "The Test Site Warns Them",
          "failText": "Rusk sees the destruction from another height and changes every prepared position.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the range marks and recover the firing wedge while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Set a hidden watch for the engine crew while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E06C"
        }
      ]
    },
    {
      "id": "E05C",
      "turn": 5,
      "title": "The First Engine Bed - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. A leveled shelf holds a timber frame, spent rope, and three aiming stakes.",
        "You take the shortest safe route and accept that concealment is nearly gone. The stakes point not only at Slate End but at ranges marked for moving riders and wagons.",
        "Delay has sharpened the danger: The roof strikes were trials for a weapon intended against a road-bound target."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Copy the range marks and recover the firing wedge before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Set a hidden watch for the engine crew before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the frame and leave it in plain sight before the remaining light fails.",
          "failTitle": "The Test Site Warns Them",
          "failText": "Rusk sees the destruction from another height and changes every prepared position.",
          "death": false
        }
      ]
    },
    {
      "id": "E06A",
      "turn": 6,
      "title": "The Wounded Apprentice - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Maelin's apprentice Jory crawls from a goat cave with rope burns and a cracked rib.",
        "You preserve the most fragile sign before turning to the larger scene. He says Rusk keeps the other smiths in an old slate gallery and moves engines after each test.",
        "The clearer position reveals the stakes: Jory knows the operation but needs care before he can guide anyone through thin mountain air."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Force him to lead you immediately.",
          "failTitle": "A Guide Spent",
          "failText": "Jory collapses on the climb, leaving the rescue party exposed and directionless.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Bind his ribs and have him draw the gallery approaches.",
          "scoreDelta": 1,
          "nextNodeId": "E07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry him to Slate End before continuing.",
          "scoreDelta": 0,
          "nextNodeId": "E07B"
        }
      ]
    },
    {
      "id": "E06B",
      "turn": 6,
      "title": "The Wounded Apprentice - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Maelin's apprentice Jory crawls from a goat cave with rope burns and a cracked rib.",
        "Each person is given one task, and confusion begins to clear. He says Rusk keeps the other smiths in an old slate gallery and moves engines after each test.",
        "The evidence now defines the danger: Jory knows the operation but needs care before he can guide anyone through thin mountain air."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Bind his ribs and have him draw the gallery approaches while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry him to Slate End before continuing while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force him to lead you immediately while keeping Maelin Kest informed.",
          "failTitle": "A Guide Spent",
          "failText": "Jory collapses on the climb, leaving the rescue party exposed and directionless.",
          "death": true
        }
      ]
    },
    {
      "id": "E06C",
      "turn": 6,
      "title": "The Wounded Apprentice - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Maelin's apprentice Jory crawls from a goat cave with rope burns and a cracked rib.",
        "The enemy has the lead, so you judge every pause against the lives at risk. He says Rusk keeps the other smiths in an old slate gallery and moves engines after each test.",
        "Delay has sharpened the danger: Jory knows the operation but needs care before he can guide anyone through thin mountain air."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry him to Slate End before continuing before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force him to lead you immediately before the remaining light fails.",
          "failTitle": "A Guide Spent",
          "failText": "Jory collapses on the climb, leaving the rescue party exposed and directionless.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Bind his ribs and have him draw the gallery approaches before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E07C"
        }
      ]
    },
    {
      "id": "E07A",
      "turn": 7,
      "title": "Rusk's Survey - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Jory's charcoal sketch shows firing shelves around Aldric's cliff road.",
        "You watch before acting and learn who believes themselves unobserved. One mark names the Narrow Crown, where the duke's party must pass during next week's progress.",
        "The clearer position reveals the stakes: The scattered trials form a planned crossfire meant to trap Aldric between stone wall and drop."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Overlay the sketch on the warden's road map.",
          "scoreDelta": 1,
          "nextNodeId": "E08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send warning to delay the progress.",
          "scoreDelta": 0,
          "nextNodeId": "E08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce Rusk's target throughout the valley.",
          "failTitle": "The Target Confirmed for Rusk",
          "failText": "Public alarm reaches Rusk's scouts, confirming that you understand the plan before his engines are found.",
          "death": false
        }
      ]
    },
    {
      "id": "E07B",
      "turn": 7,
      "title": "Rusk's Survey - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Jory's charcoal sketch shows firing shelves around Aldric's cliff road.",
        "By keeping tempers cool, you hold the inquiry on facts. One mark names the Narrow Crown, where the duke's party must pass during next week's progress.",
        "The evidence now defines the danger: The scattered trials form a planned crossfire meant to trap Aldric between stone wall and drop."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send warning to delay the progress while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce Rusk's target throughout the valley while keeping Maelin Kest informed.",
          "failTitle": "The Target Confirmed for Rusk",
          "failText": "Public alarm reaches Rusk's scouts, confirming that you understand the plan before his engines are found.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Overlay the sketch on the warden's road map while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E08B"
        }
      ]
    },
    {
      "id": "E07C",
      "turn": 7,
      "title": "Rusk's Survey - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Jory's charcoal sketch shows firing shelves around Aldric's cliff road.",
        "The narrow margin leaves no room to chase every possibility. One mark names the Narrow Crown, where the duke's party must pass during next week's progress.",
        "Delay has sharpened the danger: The scattered trials form a planned crossfire meant to trap Aldric between stone wall and drop."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce Rusk's target throughout the valley before the remaining light fails.",
          "failTitle": "The Target Confirmed for Rusk",
          "failText": "Public alarm reaches Rusk's scouts, confirming that you understand the plan before his engines are found.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Overlay the sketch on the warden's road map before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send warning to delay the progress before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E08A"
        }
      ]
    },
    {
      "id": "E08A",
      "turn": 8,
      "title": "The Slate Gallery - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. The prison gallery breathes smoke through a crack high above its blocked entrance.",
        "You use ground, wind, and cover to approach on your own terms. Hammer rhythms from within pause whenever a guard walks across the outer platform.",
        "The clearer position reveals the stakes: Captive smiths are still working and can be reached without beginning a fight in the narrow tunnel."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Draw the guards away while Maelin opens the entrance.",
          "scoreDelta": 0,
          "nextNodeId": "E09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Roll burning brush into the gallery.",
          "failTitle": "Smoke Among Captives",
          "failText": "The fire drives smoke toward the prisoners and forces them deeper behind Rusk's guards.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the hammer pauses to approach the rear air shaft.",
          "scoreDelta": 1,
          "nextNodeId": "E09A"
        }
      ]
    },
    {
      "id": "E08B",
      "turn": 8,
      "title": "The Slate Gallery - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. The prison gallery breathes smoke through a crack high above its blocked entrance.",
        "Your allies close the easy exits while you examine the heart of the scene. Hammer rhythms from within pause whenever a guard walks across the outer platform.",
        "The evidence now defines the danger: Captive smiths are still working and can be reached without beginning a fight in the narrow tunnel."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Roll burning brush into the gallery while keeping Maelin Kest informed.",
          "failTitle": "Smoke Among Captives",
          "failText": "The fire drives smoke toward the prisoners and forces them deeper behind Rusk's guards.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the hammer pauses to approach the rear air shaft while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Draw the guards away while Maelin opens the entrance while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E09C"
        }
      ]
    },
    {
      "id": "E08C",
      "turn": 8,
      "title": "The Slate Gallery - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. The prison gallery breathes smoke through a crack high above its blocked entrance.",
        "You arrive openly and must turn speed into its own kind of protection. Hammer rhythms from within pause whenever a guard walks across the outer platform.",
        "Delay has sharpened the danger: Captive smiths are still working and can be reached without beginning a fight in the narrow tunnel."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the hammer pauses to approach the rear air shaft before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Draw the guards away while Maelin opens the entrance before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Roll burning brush into the gallery before the remaining light fails.",
          "failTitle": "Smoke Among Captives",
          "failText": "The fire drives smoke toward the prisoners and forces them deeper behind Rusk's guards.",
          "death": true
        }
      ]
    },
    {
      "id": "E09A",
      "turn": 9,
      "title": "The Counterweight Room - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. A rear shaft opens above stone weights used to twist engine ropes.",
        "The cleanest clue survives because you handled it with care. Tool marks show the smiths have weakened one hook without their captors noticing.",
        "The clearer position reveals the stakes: Their quiet resistance can disable the nearest engine if preserved until firing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop every weight into the gallery.",
          "failTitle": "The Gallery Collapse",
          "failText": "Falling stone breaks supports and traps prisoners with the men guarding them.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the weak hook and signal the prisoners to leave it untouched.",
          "scoreDelta": 1,
          "nextNodeId": "E10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Remove the counterweights one by one.",
          "scoreDelta": 0,
          "nextNodeId": "E10B"
        }
      ]
    },
    {
      "id": "E09B",
      "turn": 9,
      "title": "The Counterweight Room - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. A rear shaft opens above stone weights used to twist engine ropes.",
        "The shared search reveals details no single witness had understood. Tool marks show the smiths have weakened one hook without their captors noticing.",
        "The evidence now defines the danger: Their quiet resistance can disable the nearest engine if preserved until firing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark the weak hook and signal the prisoners to leave it untouched while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Remove the counterweights one by one while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop every weight into the gallery while keeping Maelin Kest informed.",
          "failTitle": "The Gallery Collapse",
          "failText": "Falling stone breaks supports and traps prisoners with the men guarding them.",
          "death": true
        }
      ]
    },
    {
      "id": "E09C",
      "turn": 9,
      "title": "The Counterweight Room - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. A rear shaft opens above stone weights used to twist engine ropes.",
        "What remains is enough, provided you act before it is moved. Tool marks show the smiths have weakened one hook without their captors noticing.",
        "Delay has sharpened the danger: Their quiet resistance can disable the nearest engine if preserved until firing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Remove the counterweights one by one before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop every weight into the gallery before the remaining light fails.",
          "failTitle": "The Gallery Collapse",
          "failText": "Falling stone breaks supports and traps prisoners with the men guarding them.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the weak hook and signal the prisoners to leave it untouched before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E10C"
        }
      ]
    },
    {
      "id": "E10A",
      "turn": 10,
      "title": "Maelin's Secret - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Maelin admits Rusk was once her teacher and that she designed the safer release he now abuses.",
        "You pause only long enough to read the danger correctly. She knows how to jam an engine, but Rusk may expect her methods.",
        "The clearer position reveals the stakes: Trust in her knowledge could end the threat; distrust could leave you guessing at deadly machinery."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Let Maelin adapt her old design to a new hidden jam.",
          "scoreDelta": 1,
          "nextNodeId": "E11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep her beside you while wardens inspect each device.",
          "scoreDelta": 0,
          "nextNodeId": "E11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Disarm her and exclude her from the engines.",
          "failTitle": "The One Skilled Hand Bound",
          "failText": "Without Maelin, a loaded arm slips its catch and fires into the rescue route.",
          "death": true
        }
      ]
    },
    {
      "id": "E10B",
      "turn": 10,
      "title": "Maelin's Secret - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Maelin admits Rusk was once her teacher and that she designed the safer release he now abuses.",
        "A sober exchange of evidence keeps the group from dividing. She knows how to jam an engine, but Rusk may expect her methods.",
        "The evidence now defines the danger: Trust in her knowledge could end the threat; distrust could leave you guessing at deadly machinery."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep her beside you while wardens inspect each device while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Disarm her and exclude her from the engines while keeping Maelin Kest informed.",
          "failTitle": "The One Skilled Hand Bound",
          "failText": "Without Maelin, a loaded arm slips its catch and fires into the rescue route.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Maelin adapt her old design to a new hidden jam while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E11B"
        }
      ]
    },
    {
      "id": "E10C",
      "turn": 10,
      "title": "Maelin's Secret - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Maelin admits Rusk was once her teacher and that she designed the safer release he now abuses.",
        "You make up lost ground with a directness that warns everyone nearby. She knows how to jam an engine, but Rusk may expect her methods.",
        "Delay has sharpened the danger: Trust in her knowledge could end the threat; distrust could leave you guessing at deadly machinery."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Disarm her and exclude her from the engines before the remaining light fails.",
          "failTitle": "The One Skilled Hand Bound",
          "failText": "Without Maelin, a loaded arm slips its catch and fires into the rescue route.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Maelin adapt her old design to a new hidden jam before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep her beside you while wardens inspect each device before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E11A"
        }
      ]
    },
    {
      "id": "E11A",
      "turn": 11,
      "title": "The Buyers on the Ridge - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. Two cloaked observers watch a test from a ridge beyond the gallery.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Their horses carry a southern baron's knot, while Rusk demonstrates range with a bolt through a painted shield.",
        "The clearer position reveals the stakes: The attack on Aldric is also a sale: success will spread the engines beyond this valley."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a warden to identify their camp.",
          "scoreDelta": 0,
          "nextNodeId": "E12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot one observer before they depart.",
          "failTitle": "A Buyer Made a Martyr",
          "failText": "The survivor escapes with proof of hostile attack but none of Rusk's bargain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record the saddle marks and follow the observers' retreat.",
          "scoreDelta": 1,
          "nextNodeId": "E12A"
        }
      ]
    },
    {
      "id": "E11B",
      "turn": 11,
      "title": "The Buyers on the Ridge - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. Two cloaked observers watch a test from a ridge beyond the gallery.",
        "With Thorne close and local witnesses beside you, you compare every account. Their horses carry a southern baron's knot, while Rusk demonstrates range with a bolt through a painted shield.",
        "The evidence now defines the danger: The attack on Aldric is also a sale: success will spread the engines beyond this valley."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot one observer before they depart while keeping Maelin Kest informed.",
          "failTitle": "A Buyer Made a Martyr",
          "failText": "The survivor escapes with proof of hostile attack but none of Rusk's bargain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record the saddle marks and follow the observers' retreat while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a warden to identify their camp while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E12C"
        }
      ]
    },
    {
      "id": "E11C",
      "turn": 11,
      "title": "The Buyers on the Ridge - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. Two cloaked observers watch a test from a ridge beyond the gallery.",
        "Working against the light, you test the few signs that remain. Their horses carry a southern baron's knot, while Rusk demonstrates range with a bolt through a painted shield.",
        "Delay has sharpened the danger: The attack on Aldric is also a sale: success will spread the engines beyond this valley."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Record the saddle marks and follow the observers' retreat before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a warden to identify their camp before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot one observer before they depart before the remaining light fails.",
          "failTitle": "A Buyer Made a Martyr",
          "failText": "The survivor escapes with proof of hostile attack but none of Rusk's bargain.",
          "death": false
        }
      ]
    },
    {
      "id": "E12A",
      "turn": 12,
      "title": "The Captive Smiths - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. The weakened hook lets you enter as the guards move an engine.",
        "You circle downwind and let small marks tell their order. Three smiths remain chained by the ankle beside parts for two larger frames.",
        "The clearer position reveals the stakes: They can identify Rusk's orders, but freeing them carelessly may release the loaded torsion ropes."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut every rope with your sword.",
          "failTitle": "The Iron Lash",
          "failText": "Twisted rope snaps across the chamber and brings the roof props down.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Brace the frame before cutting chains and pins.",
          "scoreDelta": 1,
          "nextNodeId": "E13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Free one smith at a time under Maelin's direction.",
          "scoreDelta": 0,
          "nextNodeId": "E13B"
        }
      ]
    },
    {
      "id": "E12B",
      "turn": 12,
      "title": "The Captive Smiths - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. The weakened hook lets you enter as the guards move an engine.",
        "You ask plain questions and watch which answers agree. Three smiths remain chained by the ankle beside parts for two larger frames.",
        "The evidence now defines the danger: They can identify Rusk's orders, but freeing them carelessly may release the loaded torsion ropes."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Brace the frame before cutting chains and pins while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Free one smith at a time under Maelin's direction while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut every rope with your sword while keeping Maelin Kest informed.",
          "failTitle": "The Iron Lash",
          "failText": "Twisted rope snaps across the chamber and brings the roof props down.",
          "death": true
        }
      ]
    },
    {
      "id": "E12C",
      "turn": 12,
      "title": "The Captive Smiths - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. The weakened hook lets you enter as the guards move an engine.",
        "There is no time for elegance, only for separating fresh danger from old damage. Three smiths remain chained by the ankle beside parts for two larger frames.",
        "Delay has sharpened the danger: They can identify Rusk's orders, but freeing them carelessly may release the loaded torsion ropes."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Free one smith at a time under Maelin's direction before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut every rope with your sword before the remaining light fails.",
          "failTitle": "The Iron Lash",
          "failText": "Twisted rope snaps across the chamber and brings the roof props down.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Brace the frame before cutting chains and pins before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E13C"
        }
      ]
    },
    {
      "id": "E13A",
      "turn": 13,
      "title": "Engines in Pieces - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. The freed smiths reveal that each sled carries only part of a weapon.",
        "From sheltered ground, you measure tracks, tools, and distances. At Narrow Crown, prepared sockets can join the frames into three engines within an hour.",
        "The clearer position reveals the stakes: Rusk's threat is a moving system, not a single machine that can be destroyed at one camp."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seize the unique release pins needed by every frame.",
          "scoreDelta": 1,
          "nextNodeId": "E14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Scatter the sled teams while wardens hold the sockets.",
          "scoreDelta": 0,
          "nextNodeId": "E14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the nearest timber and declare the engines ended.",
          "failTitle": "The Missing Frames Move",
          "failText": "Smoke hides the remaining sleds as they leave by separate winch paths.",
          "death": false
        }
      ]
    },
    {
      "id": "E13B",
      "turn": 13,
      "title": "Engines in Pieces - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. The freed smiths reveal that each sled carries only part of a weapon.",
        "You keep the scene orderly while your allies search it piece by piece. At Narrow Crown, prepared sockets can join the frames into three engines within an hour.",
        "The evidence now defines the danger: Rusk's threat is a moving system, not a single machine that can be destroyed at one camp."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Scatter the sled teams while wardens hold the sockets while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the nearest timber and declare the engines ended while keeping Maelin Kest informed.",
          "failTitle": "The Missing Frames Move",
          "failText": "Smoke hides the remaining sleds as they leave by separate winch paths.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seize the unique release pins needed by every frame while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E14B"
        }
      ]
    },
    {
      "id": "E13C",
      "turn": 13,
      "title": "Engines in Pieces - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. The freed smiths reveal that each sled carries only part of a weapon.",
        "Pressed for time, you trust hard evidence and discard rumor. At Narrow Crown, prepared sockets can join the frames into three engines within an hour.",
        "Delay has sharpened the danger: Rusk's threat is a moving system, not a single machine that can be destroyed at one camp."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the nearest timber and declare the engines ended before the remaining light fails.",
          "failTitle": "The Missing Frames Move",
          "failText": "Smoke hides the remaining sleds as they leave by separate winch paths.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seize the unique release pins needed by every frame before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Scatter the sled teams while wardens hold the sockets before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E14A"
        }
      ]
    },
    {
      "id": "E14A",
      "turn": 14,
      "title": "The False Rockfall - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Rusk triggers a small slide above Slate End to pull wardens away from Narrow Crown.",
        "You move quietly enough to hear work and voices ahead. The stones stop at an empty sheep wall, but distress horns make the danger sound larger.",
        "The clearer position reveals the stakes: He is using rescue duty to clear the road at the precise hour his buyers expect."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Split the wardens evenly between both dangers.",
          "scoreDelta": 0,
          "nextNodeId": "E15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Race every available hand toward the horns.",
          "failTitle": "The Crown Left Open",
          "failText": "Rusk assembles his engines unopposed while rescuers discover an empty field of stone.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Send villagers to the safe wall and keep trained wardens on the road.",
          "scoreDelta": 1,
          "nextNodeId": "E15A"
        }
      ]
    },
    {
      "id": "E14B",
      "turn": 14,
      "title": "The False Rockfall - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Rusk triggers a small slide above Slate End to pull wardens away from Narrow Crown.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. The stones stop at an empty sheep wall, but distress horns make the danger sound larger.",
        "The evidence now defines the danger: He is using rescue duty to clear the road at the precise hour his buyers expect."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Race every available hand toward the horns while keeping Maelin Kest informed.",
          "failTitle": "The Crown Left Open",
          "failText": "Rusk assembles his engines unopposed while rescuers discover an empty field of stone.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Send villagers to the safe wall and keep trained wardens on the road while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Split the wardens evenly between both dangers while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E15C"
        }
      ]
    },
    {
      "id": "E14C",
      "turn": 14,
      "title": "The False Rockfall - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Rusk triggers a small slide above Slate End to pull wardens away from Narrow Crown.",
        "You push through fatigue, knowing the next mistake may close the road. The stones stop at an empty sheep wall, but distress horns make the danger sound larger.",
        "Delay has sharpened the danger: He is using rescue duty to clear the road at the precise hour his buyers expect."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send villagers to the safe wall and keep trained wardens on the road before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Split the wardens evenly between both dangers before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Race every available hand toward the horns before the remaining light fails.",
          "failTitle": "The Crown Left Open",
          "failText": "Rusk assembles his engines unopposed while rescuers discover an empty field of stone.",
          "death": false
        }
      ]
    },
    {
      "id": "E15A",
      "turn": 15,
      "title": "The Narrow Crown - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. Engine sockets have been uncovered beside Aldric's cliff road and sled teams climb from three gullies.",
        "A ranger's eye finds the human habit behind the apparent mystery. Maelin identifies the central frame as the master aimer that sets range for the others.",
        "The clearer position reveals the stakes: If that frame is captured intact, the crossfire can be broken without sending loose bolts into the valley."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge the first sled team on horseback.",
          "failTitle": "Horse and Sled on the Ledge",
          "failText": "The collision carries men, animal, and timber over the unguarded edge.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reach the master frame through the drainage ledge.",
          "scoreDelta": 1,
          "nextNodeId": "E16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Block the road with wagons before the engines arrive.",
          "scoreDelta": 0,
          "nextNodeId": "E16B"
        }
      ]
    },
    {
      "id": "E15B",
      "turn": 15,
      "title": "The Narrow Crown - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. Engine sockets have been uncovered beside Aldric's cliff road and sled teams climb from three gullies.",
        "Together, the small company builds one reliable account from scattered facts. Maelin identifies the central frame as the master aimer that sets range for the others.",
        "The evidence now defines the danger: If that frame is captured intact, the crossfire can be broken without sending loose bolts into the valley."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Reach the master frame through the drainage ledge while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Block the road with wagons before the engines arrive while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge the first sled team on horseback while keeping Maelin Kest informed.",
          "failTitle": "Horse and Sled on the Ledge",
          "failText": "The collision carries men, animal, and timber over the unguarded edge.",
          "death": true
        }
      ]
    },
    {
      "id": "E15C",
      "turn": 15,
      "title": "The Narrow Crown - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. Engine sockets have been uncovered beside Aldric's cliff road and sled teams climb from three gullies.",
        "You take the shortest safe route and accept that concealment is nearly gone. Maelin identifies the central frame as the master aimer that sets range for the others.",
        "Delay has sharpened the danger: If that frame is captured intact, the crossfire can be broken without sending loose bolts into the valley."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Block the road with wagons before the engines arrive before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge the first sled team on horseback before the remaining light fails.",
          "failTitle": "Horse and Sled on the Ledge",
          "failText": "The collision carries men, animal, and timber over the unguarded edge.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reach the master frame through the drainage ledge before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E16C"
        }
      ]
    },
    {
      "id": "E16A",
      "turn": 16,
      "title": "The Jammed Release - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Maelin's hidden iron wedge locks the master frame as Rusk orders a test shot.",
        "You preserve the most fragile sign before turning to the larger scene. The strained rope begins tearing its bed, and captive haulers are still tied to the sled.",
        "The clearer position reveals the stakes: A successful jam must be relieved safely or the disabled engine will kill the people nearest it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut the haulers free before easing the torsion with the capstan.",
          "scoreDelta": 1,
          "nextNodeId": "E17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Order everyone clear and let the frame break.",
          "scoreDelta": 0,
          "nextNodeId": "E17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Strike the wedge deeper with a hammer.",
          "failTitle": "The Frame Bursts",
          "failText": "The timber splits under full strain and throws iron fittings across the road.",
          "death": true
        }
      ]
    },
    {
      "id": "E16B",
      "turn": 16,
      "title": "The Jammed Release - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Maelin's hidden iron wedge locks the master frame as Rusk orders a test shot.",
        "Each person is given one task, and confusion begins to clear. The strained rope begins tearing its bed, and captive haulers are still tied to the sled.",
        "The evidence now defines the danger: A successful jam must be relieved safely or the disabled engine will kill the people nearest it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Order everyone clear and let the frame break while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Strike the wedge deeper with a hammer while keeping Maelin Kest informed.",
          "failTitle": "The Frame Bursts",
          "failText": "The timber splits under full strain and throws iron fittings across the road.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the haulers free before easing the torsion with the capstan while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E17B"
        }
      ]
    },
    {
      "id": "E16C",
      "turn": 16,
      "title": "The Jammed Release - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Maelin's hidden iron wedge locks the master frame as Rusk orders a test shot.",
        "The enemy has the lead, so you judge every pause against the lives at risk. The strained rope begins tearing its bed, and captive haulers are still tied to the sled.",
        "Delay has sharpened the danger: A successful jam must be relieved safely or the disabled engine will kill the people nearest it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Strike the wedge deeper with a hammer before the remaining light fails.",
          "failTitle": "The Frame Bursts",
          "failText": "The timber splits under full strain and throws iron fittings across the road.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the haulers free before easing the torsion with the capstan before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Order everyone clear and let the frame break before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E17A"
        }
      ]
    },
    {
      "id": "E17A",
      "turn": 17,
      "title": "Rusk Above the Road - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Rusk retreats to a smaller engine aimed at the capstan and holds a firepot over its rope bed.",
        "You watch before acting and learn who believes themselves unobserved. Burning the ropes will fire or shatter the device while destroying his written orders.",
        "The clearer position reveals the stakes: He means to turn defeat into confusion and leave his buyers unnamed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Rusk talking while Maelin drains the tension.",
          "scoreDelta": 0,
          "nextNodeId": "E18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot the firepot from his hand.",
          "failTitle": "Fire in the Twisted Rope",
          "failText": "Flame races through oiled cord, and the engine releases into the crowded road.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin the firepot sleeve with an arrow and close along the wall.",
          "scoreDelta": 1,
          "nextNodeId": "E18A"
        }
      ]
    },
    {
      "id": "E17B",
      "turn": 17,
      "title": "Rusk Above the Road - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Rusk retreats to a smaller engine aimed at the capstan and holds a firepot over its rope bed.",
        "By keeping tempers cool, you hold the inquiry on facts. Burning the ropes will fire or shatter the device while destroying his written orders.",
        "The evidence now defines the danger: He means to turn defeat into confusion and leave his buyers unnamed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot the firepot from his hand while keeping Maelin Kest informed.",
          "failTitle": "Fire in the Twisted Rope",
          "failText": "Flame races through oiled cord, and the engine releases into the crowded road.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin the firepot sleeve with an arrow and close along the wall while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Rusk talking while Maelin drains the tension while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E18C"
        }
      ]
    },
    {
      "id": "E17C",
      "turn": 17,
      "title": "Rusk Above the Road - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Rusk retreats to a smaller engine aimed at the capstan and holds a firepot over its rope bed.",
        "The narrow margin leaves no room to chase every possibility. Burning the ropes will fire or shatter the device while destroying his written orders.",
        "Delay has sharpened the danger: He means to turn defeat into confusion and leave his buyers unnamed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Pin the firepot sleeve with an arrow and close along the wall before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Rusk talking while Maelin drains the tension before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot the firepot from his hand before the remaining light fails.",
          "failTitle": "Fire in the Twisted Rope",
          "failText": "Flame races through oiled cord, and the engine releases into the crowded road.",
          "death": true
        }
      ]
    },
    {
      "id": "E18A",
      "turn": 18,
      "title": "The Baron's Purse - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Rusk is taken with a purse of newly minted southern silver and a folded range contract.",
        "You use ground, wind, and cover to approach on your own terms. The contract specifies Aldric's route but uses marks rather than the buyer's written name.",
        "The clearer position reveals the stakes: The observers' saddle knots and mint dates can turn coded payment into an identifiable patron."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Divide the silver among the captive smiths.",
          "failTitle": "Payment Without a Payer",
          "failText": "Once scattered, the coins become wages or charity and no longer prove who funded Rusk.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal purse and contract together with warden witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "E19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send both to Aldric while holding Rusk locally.",
          "scoreDelta": 0,
          "nextNodeId": "E19B"
        }
      ]
    },
    {
      "id": "E18B",
      "turn": 18,
      "title": "The Baron's Purse - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Rusk is taken with a purse of newly minted southern silver and a folded range contract.",
        "Your allies close the easy exits while you examine the heart of the scene. The contract specifies Aldric's route but uses marks rather than the buyer's written name.",
        "The evidence now defines the danger: The observers' saddle knots and mint dates can turn coded payment into an identifiable patron."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal purse and contract together with warden witnesses while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send both to Aldric while holding Rusk locally while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Divide the silver among the captive smiths while keeping Maelin Kest informed.",
          "failTitle": "Payment Without a Payer",
          "failText": "Once scattered, the coins become wages or charity and no longer prove who funded Rusk.",
          "death": false
        }
      ]
    },
    {
      "id": "E18C",
      "turn": 18,
      "title": "The Baron's Purse - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Rusk is taken with a purse of newly minted southern silver and a folded range contract.",
        "You arrive openly and must turn speed into its own kind of protection. The contract specifies Aldric's route but uses marks rather than the buyer's written name.",
        "Delay has sharpened the danger: The observers' saddle knots and mint dates can turn coded payment into an identifiable patron."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send both to Aldric while holding Rusk locally before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Divide the silver among the captive smiths before the remaining light fails.",
          "failTitle": "Payment Without a Payer",
          "failText": "Once scattered, the coins become wages or charity and no longer prove who funded Rusk.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal purse and contract together with warden witnesses before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E19C"
        }
      ]
    },
    {
      "id": "E19A",
      "turn": 19,
      "title": "The Mountain Reckoning - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Slate End's families gather beside the dismantled frames while the smiths give evidence.",
        "The cleanest clue survives because you handled it with care. Some demand every part be thrown into the ravine; Maelin argues that safe capstans can be rebuilt from them.",
        "The clearer position reveals the stakes: Justice must preserve proof without leaving a weapon ready for another ambitious engineer."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Remove firing arms and display numbered parts with the contract.",
          "scoreDelta": 1,
          "nextNodeId": "E20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Store the frames under guard until Aldric's court.",
          "scoreDelta": 0,
          "nextNodeId": "E20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let villagers smash the engines where they stand.",
          "failTitle": "Proof Becomes Firewood",
          "failText": "The wreckage satisfies anger but leaves only Rusk's denials against frightened testimony.",
          "death": false
        }
      ]
    },
    {
      "id": "E19B",
      "turn": 19,
      "title": "The Mountain Reckoning - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Slate End's families gather beside the dismantled frames while the smiths give evidence.",
        "The shared search reveals details no single witness had understood. Some demand every part be thrown into the ravine; Maelin argues that safe capstans can be rebuilt from them.",
        "The evidence now defines the danger: Justice must preserve proof without leaving a weapon ready for another ambitious engineer."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Store the frames under guard until Aldric's court while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "nextNodeId": "E20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let villagers smash the engines where they stand while keeping Maelin Kest informed.",
          "failTitle": "Proof Becomes Firewood",
          "failText": "The wreckage satisfies anger but leaves only Rusk's denials against frightened testimony.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Remove firing arms and display numbered parts with the contract while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "nextNodeId": "E20B"
        }
      ]
    },
    {
      "id": "E19C",
      "turn": 19,
      "title": "The Mountain Reckoning - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Slate End's families gather beside the dismantled frames while the smiths give evidence.",
        "What remains is enough, provided you act before it is moved. Some demand every part be thrown into the ravine; Maelin argues that safe capstans can be rebuilt from them.",
        "Delay has sharpened the danger: Justice must preserve proof without leaving a weapon ready for another ambitious engineer."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let villagers smash the engines where they stand before the remaining light fails.",
          "failTitle": "Proof Becomes Firewood",
          "failText": "The wreckage satisfies anger but leaves only Rusk's denials against frightened testimony.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Remove firing arms and display numbered parts with the contract before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "E20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Store the frames under guard until Aldric's court before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "E20A"
        }
      ]
    },
    {
      "id": "E20A",
      "turn": 20,
      "title": "No More Iron Rain - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Duke Aldric reaches Narrow Crown after wardens certify the road.",
        "You pause only long enough to read the danger correctly. Maelin offers a full account of her design, Rusk faces the coded contract, and the hamlets ask for stronger shelters.",
        "The clearer position reveals the stakes: The final judgment can secure both the road and the knowledge that made it vulnerable."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Destroy the engines and permanently station wardens at the Crown.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep one loaded engine as a warning to Aldric's enemies.",
          "failTitle": "The Weapon Kept Ready",
          "failText": "A cocked engine above a public road becomes the very threat you fought to remove.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Expose the buyers and turn the iron into public tools under Maelin's watch.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "E20B",
      "turn": 20,
      "title": "No More Iron Rain - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Duke Aldric reaches Narrow Crown after wardens certify the road.",
        "A sober exchange of evidence keeps the group from dividing. Maelin offers a full account of her design, Rusk faces the coded contract, and the hamlets ask for stronger shelters.",
        "The evidence now defines the danger: The final judgment can secure both the road and the knowledge that made it vulnerable."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep one loaded engine as a warning to Aldric's enemies while keeping Maelin Kest informed.",
          "failTitle": "The Weapon Kept Ready",
          "failText": "A cocked engine above a public road becomes the very threat you fought to remove.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Expose the buyers and turn the iron into public tools under Maelin's watch while keeping Maelin Kest informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Destroy the engines and permanently station wardens at the Crown while keeping Maelin Kest informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "E20C",
      "turn": 20,
      "title": "No More Iron Rain - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Duke Aldric reaches Narrow Crown after wardens certify the road.",
        "You make up lost ground with a directness that warns everyone nearby. Maelin offers a full account of her design, Rusk faces the coded contract, and the hamlets ask for stronger shelters.",
        "Delay has sharpened the danger: The final judgment can secure both the road and the knowledge that made it vulnerable."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Expose the buyers and turn the iron into public tools under Maelin's watch before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Destroy the engines and permanently station wardens at the Crown before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep one loaded engine as a warning to Aldric's enemies before the remaining light fails.",
          "failTitle": "The Weapon Kept Ready",
          "failText": "A cocked engine above a public road becomes the very threat you fought to remove.",
          "death": false
        }
      ]
    }
  ]
});
