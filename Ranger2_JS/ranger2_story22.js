window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-stones-that-grew",
  "title": "The Stones That Grew",
  "summary": "New stone heaps rise overnight in planted fields, then farmers vanish and the earth begins to sink. The ranger and farmer Elspeth Cairn discover illegal mine galleries built to steal ironstone and collapse whole holdings into a land speculator's hands.",
  "maxTurns": 20,
  "startNodeId": "J01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "Every captive farmer walks back into daylight, the galleries are filled under sound engineering, and Oswin Marr's purchase map proves his plan to ruin and acquire the plowlands. Elspeth Cairn leads a new field council that keeps watch over soil as carefully as seed.",
    "low": "The main collapse is prevented and most captives survive, but flooded galleries swallow some records and leave several farms unsafe. Aldric supports displaced families while masons spend years securing the hollow earth."
  },
  "nodes": [
    {
      "id": "J01A",
      "turn": 1,
      "title": "Stones in the Furrows - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into the broad plowlands west of Oakenhurst as waist-high stone heaps have appeared overnight across three planted fields, and a plowman is missing.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Farmer Elspeth Cairn shows you warm air rising between the rocks and fresh iron dust on stones unlike local fieldstone.",
        "The clearer position reveals the stakes: The heaps are vents built from below, signs that unknown hands are working under active farms."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test the draft and map each heap before moving stones.",
          "scoreDelta": 1,
          "nextNodeId": "J02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question neighboring farmers about night sounds.",
          "scoreDelta": 0,
          "nextNodeId": "J02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Fill the warmest heap with earth.",
          "failTitle": "The Buried Breath",
          "failText": "Blocked air forces smoke into occupied tunnels, endangering the missing plowman and warning those below.",
          "death": true
        }
      ]
    },
    {
      "id": "J01B",
      "turn": 1,
      "title": "Stones in the Furrows - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: waist-high stone heaps have appeared overnight across three planted fields, and a plowman is missing.",
        "With Thorne close and local witnesses beside you, you compare every account. Farmer Elspeth Cairn shows you warm air rising between the rocks and fresh iron dust on stones unlike local fieldstone.",
        "The evidence now defines the danger: The heaps are vents built from below, signs that unknown hands are working under active farms."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question neighboring farmers about night sounds while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Fill the warmest heap with earth while keeping Elspeth Cairn informed.",
          "failTitle": "The Buried Breath",
          "failText": "Blocked air forces smoke into occupied tunnels, endangering the missing plowman and warning those below.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test the draft and map each heap before moving stones while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J02B"
        }
      ]
    },
    {
      "id": "J01C",
      "turn": 1,
      "title": "Stones in the Furrows - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, waist-high stone heaps have appeared overnight across three planted fields, and a plowman is missing.",
        "Working against the light, you test the few signs that remain. Farmer Elspeth Cairn shows you warm air rising between the rocks and fresh iron dust on stones unlike local fieldstone.",
        "Delay has sharpened the danger: The heaps are vents built from below, signs that unknown hands are working under active farms."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Fill the warmest heap with earth before the remaining light fails.",
          "failTitle": "The Buried Breath",
          "failText": "Blocked air forces smoke into occupied tunnels, endangering the missing plowman and warning those below.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test the draft and map each heap before moving stones before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question neighboring farmers about night sounds before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J02A"
        }
      ]
    },
    {
      "id": "J02A",
      "turn": 2,
      "title": "The Hollow Step - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. Thorne's hoof sounds hollow along a straight line between two stone heaps.",
        "You circle downwind and let small marks tell their order. Thin cracks cross the barley, while old land records show no cellar or drain beneath it.",
        "The clearer position reveals the stakes: A man-made gallery is weakening soil expected to carry harvest wagons within weeks."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Fence the cracked field until masons arrive.",
          "scoreDelta": 0,
          "nextNodeId": "J03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride the hollow line to learn its length quickly.",
          "failTitle": "The Field Opens",
          "failText": "The crust collapses under Thorne, carrying horse and rider into a timbered shaft.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Probe the line from firm ground and mark unsafe strips.",
          "scoreDelta": 1,
          "nextNodeId": "J03A"
        }
      ]
    },
    {
      "id": "J02B",
      "turn": 2,
      "title": "The Hollow Step - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. Thorne's hoof sounds hollow along a straight line between two stone heaps.",
        "You ask plain questions and watch which answers agree. Thin cracks cross the barley, while old land records show no cellar or drain beneath it.",
        "The evidence now defines the danger: A man-made gallery is weakening soil expected to carry harvest wagons within weeks."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride the hollow line to learn its length quickly while keeping Elspeth Cairn informed.",
          "failTitle": "The Field Opens",
          "failText": "The crust collapses under Thorne, carrying horse and rider into a timbered shaft.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Probe the line from firm ground and mark unsafe strips while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Fence the cracked field until masons arrive while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J03C"
        }
      ]
    },
    {
      "id": "J02C",
      "turn": 2,
      "title": "The Hollow Step - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. Thorne's hoof sounds hollow along a straight line between two stone heaps.",
        "There is no time for elegance, only for separating fresh danger from old damage. Thin cracks cross the barley, while old land records show no cellar or drain beneath it.",
        "Delay has sharpened the danger: A man-made gallery is weakening soil expected to carry harvest wagons within weeks."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Probe the line from firm ground and mark unsafe strips before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Fence the cracked field until masons arrive before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride the hollow line to learn its length quickly before the remaining light fails.",
          "failTitle": "The Field Opens",
          "failText": "The crust collapses under Thorne, carrying horse and rider into a timbered shaft.",
          "death": true
        }
      ]
    },
    {
      "id": "J03A",
      "turn": 3,
      "title": "Ironstone at Dawn - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. A lump from the heap contains rich ironstone newly split by a wedge.",
        "From sheltered ground, you measure tracks, tools, and distances. No licensed mine lies within a day's travel, but reeve Oswin Marr recently bought several exhausted-looking farms nearby.",
        "The clearer position reveals the stakes: Someone is taking ore and may be creating the very ruin used to cheapen the land."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce a valuable mine and invite villagers to dig.",
          "failTitle": "A Rush into Weak Ground",
          "failText": "Hopeful farmers tear open unsafe vents and bring galleries down on themselves.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare wedge marks with tools from Oswin's holdings.",
          "scoreDelta": 1,
          "nextNodeId": "J04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the reeve to explain his recent purchases.",
          "scoreDelta": 0,
          "nextNodeId": "J04B"
        }
      ]
    },
    {
      "id": "J03B",
      "turn": 3,
      "title": "Ironstone at Dawn - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. A lump from the heap contains rich ironstone newly split by a wedge.",
        "You keep the scene orderly while your allies search it piece by piece. No licensed mine lies within a day's travel, but reeve Oswin Marr recently bought several exhausted-looking farms nearby.",
        "The evidence now defines the danger: Someone is taking ore and may be creating the very ruin used to cheapen the land."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare wedge marks with tools from Oswin's holdings while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the reeve to explain his recent purchases while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce a valuable mine and invite villagers to dig while keeping Elspeth Cairn informed.",
          "failTitle": "A Rush into Weak Ground",
          "failText": "Hopeful farmers tear open unsafe vents and bring galleries down on themselves.",
          "death": true
        }
      ]
    },
    {
      "id": "J03C",
      "turn": 3,
      "title": "Ironstone at Dawn - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. A lump from the heap contains rich ironstone newly split by a wedge.",
        "Pressed for time, you trust hard evidence and discard rumor. No licensed mine lies within a day's travel, but reeve Oswin Marr recently bought several exhausted-looking farms nearby.",
        "Delay has sharpened the danger: Someone is taking ore and may be creating the very ruin used to cheapen the land."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the reeve to explain his recent purchases before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce a valuable mine and invite villagers to dig before the remaining light fails.",
          "failTitle": "A Rush into Weak Ground",
          "failText": "Hopeful farmers tear open unsafe vents and bring galleries down on themselves.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare wedge marks with tools from Oswin's holdings before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J04C"
        }
      ]
    },
    {
      "id": "J04A",
      "turn": 4,
      "title": "The Missing Plow - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. The vanished man's plow is found hidden beneath straw in Oswin's unused threshing barn.",
        "You move quietly enough to hear work and voices ahead. Its beam bears scrape marks from being lowered through a narrow shaft, and a broken chain still holds chalky clay.",
        "The clearer position reveals the stakes: The plowman and his team were pulled below rather than lost on the road."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Trace the clay to the barn's floor seams.",
          "scoreDelta": 1,
          "nextNodeId": "J05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the barn and seek witnesses.",
          "scoreDelta": 0,
          "nextNodeId": "J05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Oswin inside the barn alone.",
          "failTitle": "The Reeve's Men",
          "failText": "Hidden guards close both doors and lower you through the same shaft as the missing farmer.",
          "death": true
        }
      ]
    },
    {
      "id": "J04B",
      "turn": 4,
      "title": "The Missing Plow - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. The vanished man's plow is found hidden beneath straw in Oswin's unused threshing barn.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Its beam bears scrape marks from being lowered through a narrow shaft, and a broken chain still holds chalky clay.",
        "The evidence now defines the danger: The plowman and his team were pulled below rather than lost on the road."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the barn and seek witnesses while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Oswin inside the barn alone while keeping Elspeth Cairn informed.",
          "failTitle": "The Reeve's Men",
          "failText": "Hidden guards close both doors and lower you through the same shaft as the missing farmer.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace the clay to the barn's floor seams while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J05B"
        }
      ]
    },
    {
      "id": "J04C",
      "turn": 4,
      "title": "The Missing Plow - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. The vanished man's plow is found hidden beneath straw in Oswin's unused threshing barn.",
        "You push through fatigue, knowing the next mistake may close the road. Its beam bears scrape marks from being lowered through a narrow shaft, and a broken chain still holds chalky clay.",
        "Delay has sharpened the danger: The plowman and his team were pulled below rather than lost on the road."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Oswin inside the barn alone before the remaining light fails.",
          "failTitle": "The Reeve's Men",
          "failText": "Hidden guards close both doors and lower you through the same shaft as the missing farmer.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace the clay to the barn's floor seams before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the barn and seek witnesses before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J05A"
        }
      ]
    },
    {
      "id": "J05A",
      "turn": 5,
      "title": "The Threshing Shaft - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. A false grain pit conceals a timber lift descending under the fields.",
        "A ranger's eye finds the human habit behind the apparent mystery. Its rope carries fresh mud and fibers from a farmer's coat, while whispered hammering rises after sunset.",
        "The clearer position reveals the stakes: The mine uses familiar farm buildings to move prisoners, ore, and tools unseen."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send for wardens before opening the pit.",
          "scoreDelta": 0,
          "nextNodeId": "J06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the lift rope to trap whoever is below.",
          "failTitle": "The Captives Cut Off",
          "failText": "The cage drops into darkness, injuring prisoners and destroying the safest descent.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Descend beside the lift rope while Elspeth watches the brake.",
          "scoreDelta": 1,
          "nextNodeId": "J06A"
        }
      ]
    },
    {
      "id": "J05B",
      "turn": 5,
      "title": "The Threshing Shaft - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. A false grain pit conceals a timber lift descending under the fields.",
        "Together, the small company builds one reliable account from scattered facts. Its rope carries fresh mud and fibers from a farmer's coat, while whispered hammering rises after sunset.",
        "The evidence now defines the danger: The mine uses familiar farm buildings to move prisoners, ore, and tools unseen."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the lift rope to trap whoever is below while keeping Elspeth Cairn informed.",
          "failTitle": "The Captives Cut Off",
          "failText": "The cage drops into darkness, injuring prisoners and destroying the safest descent.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Descend beside the lift rope while Elspeth watches the brake while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send for wardens before opening the pit while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J06C"
        }
      ]
    },
    {
      "id": "J05C",
      "turn": 5,
      "title": "The Threshing Shaft - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. A false grain pit conceals a timber lift descending under the fields.",
        "You take the shortest safe route and accept that concealment is nearly gone. Its rope carries fresh mud and fibers from a farmer's coat, while whispered hammering rises after sunset.",
        "Delay has sharpened the danger: The mine uses familiar farm buildings to move prisoners, ore, and tools unseen."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Descend beside the lift rope while Elspeth watches the brake before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send for wardens before opening the pit before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the lift rope to trap whoever is below before the remaining light fails.",
          "failTitle": "The Captives Cut Off",
          "failText": "The cage drops into darkness, injuring prisoners and destroying the safest descent.",
          "death": true
        }
      ]
    },
    {
      "id": "J06A",
      "turn": 6,
      "title": "Oswin's Land Book - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Oswin produces deeds showing every shaft stands under land he lawfully purchased.",
        "You preserve the most fragile sign before turning to the larger scene. Elspeth notices the maps extend galleries beneath neighboring farms not included in any deed.",
        "The clearer position reveals the stakes: His surface ownership is being used to hide theft and danger far beyond its boundaries."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear up the deeds as fraudulent.",
          "failTitle": "The Boundaries Erased",
          "failText": "Without the papers, Oswin denies the gallery extensions and blames unknown miners.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Overlay the deeds on old boundary maps.",
          "scoreDelta": 1,
          "nextNodeId": "J07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Aldric's surveyor to review the claims.",
          "scoreDelta": 0,
          "nextNodeId": "J07B"
        }
      ]
    },
    {
      "id": "J06B",
      "turn": 6,
      "title": "Oswin's Land Book - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Oswin produces deeds showing every shaft stands under land he lawfully purchased.",
        "Each person is given one task, and confusion begins to clear. Elspeth notices the maps extend galleries beneath neighboring farms not included in any deed.",
        "The evidence now defines the danger: His surface ownership is being used to hide theft and danger far beyond its boundaries."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Overlay the deeds on old boundary maps while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Aldric's surveyor to review the claims while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear up the deeds as fraudulent while keeping Elspeth Cairn informed.",
          "failTitle": "The Boundaries Erased",
          "failText": "Without the papers, Oswin denies the gallery extensions and blames unknown miners.",
          "death": false
        }
      ]
    },
    {
      "id": "J06C",
      "turn": 6,
      "title": "Oswin's Land Book - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Oswin produces deeds showing every shaft stands under land he lawfully purchased.",
        "The enemy has the lead, so you judge every pause against the lives at risk. Elspeth notices the maps extend galleries beneath neighboring farms not included in any deed.",
        "Delay has sharpened the danger: His surface ownership is being used to hide theft and danger far beyond its boundaries."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Aldric's surveyor to review the claims before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear up the deeds as fraudulent before the remaining light fails.",
          "failTitle": "The Boundaries Erased",
          "failText": "Without the papers, Oswin denies the gallery extensions and blames unknown miners.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Overlay the deeds on old boundary maps before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J07C"
        }
      ]
    },
    {
      "id": "J07A",
      "turn": 7,
      "title": "The First Gallery - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. The threshing shaft opens into a braced passage lined with sacks of ironstone.",
        "You watch before acting and learn who believes themselves unobserved. Numbered side tunnels point beneath standing crops, and guards drive farmers at pick point.",
        "The clearer position reveals the stakes: The operation is both illegal mining and forced labor hidden under a lawful farm purchase."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark the side-tunnel numbers and locate prisoners before acting.",
          "scoreDelta": 1,
          "nextNodeId": "J08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Withdraw to bring enough wardens for a rescue.",
          "scoreDelta": 0,
          "nextNodeId": "J08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Attack the nearest guard in the narrow gallery.",
          "failTitle": "A Fight Beneath Timber",
          "failText": "The struggle knocks out a prop and closes the tunnel on guards, captives, and evidence alike.",
          "death": true
        }
      ]
    },
    {
      "id": "J07B",
      "turn": 7,
      "title": "The First Gallery - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. The threshing shaft opens into a braced passage lined with sacks of ironstone.",
        "By keeping tempers cool, you hold the inquiry on facts. Numbered side tunnels point beneath standing crops, and guards drive farmers at pick point.",
        "The evidence now defines the danger: The operation is both illegal mining and forced labor hidden under a lawful farm purchase."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Withdraw to bring enough wardens for a rescue while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Attack the nearest guard in the narrow gallery while keeping Elspeth Cairn informed.",
          "failTitle": "A Fight Beneath Timber",
          "failText": "The struggle knocks out a prop and closes the tunnel on guards, captives, and evidence alike.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the side-tunnel numbers and locate prisoners before acting while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J08B"
        }
      ]
    },
    {
      "id": "J07C",
      "turn": 7,
      "title": "The First Gallery - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. The threshing shaft opens into a braced passage lined with sacks of ironstone.",
        "The narrow margin leaves no room to chase every possibility. Numbered side tunnels point beneath standing crops, and guards drive farmers at pick point.",
        "Delay has sharpened the danger: The operation is both illegal mining and forced labor hidden under a lawful farm purchase."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Attack the nearest guard in the narrow gallery before the remaining light fails.",
          "failTitle": "A Fight Beneath Timber",
          "failText": "The struggle knocks out a prop and closes the tunnel on guards, captives, and evidence alike.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the side-tunnel numbers and locate prisoners before acting before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Withdraw to bring enough wardens for a rescue before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J08A"
        }
      ]
    },
    {
      "id": "J08A",
      "turn": 8,
      "title": "Renn the Miner - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. An older miner named Renn slips away from the guards and surrenders.",
        "You use ground, wind, and cover to approach on your own terms. Oswin hired him to design safe galleries, then ignored limits and held him after he protested extensions.",
        "The clearer position reveals the stakes: Renn can distinguish deliberate collapse cuts from ordinary mine damage if fear does not silence him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him bound but listen to his account.",
          "scoreDelta": 0,
          "nextNodeId": "J09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call him a thief and send him back below as bait.",
          "failTitle": "The Engineer Returned",
          "failText": "Oswin's guards seize Renn and move the collapse crews before you can follow.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Promise protection and have Renn annotate the tunnel map.",
          "scoreDelta": 1,
          "nextNodeId": "J09A"
        }
      ]
    },
    {
      "id": "J08B",
      "turn": 8,
      "title": "Renn the Miner - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. An older miner named Renn slips away from the guards and surrenders.",
        "Your allies close the easy exits while you examine the heart of the scene. Oswin hired him to design safe galleries, then ignored limits and held him after he protested extensions.",
        "The evidence now defines the danger: Renn can distinguish deliberate collapse cuts from ordinary mine damage if fear does not silence him."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Call him a thief and send him back below as bait while keeping Elspeth Cairn informed.",
          "failTitle": "The Engineer Returned",
          "failText": "Oswin's guards seize Renn and move the collapse crews before you can follow.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Promise protection and have Renn annotate the tunnel map while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him bound but listen to his account while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J09C"
        }
      ]
    },
    {
      "id": "J08C",
      "turn": 8,
      "title": "Renn the Miner - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. An older miner named Renn slips away from the guards and surrenders.",
        "You arrive openly and must turn speed into its own kind of protection. Oswin hired him to design safe galleries, then ignored limits and held him after he protested extensions.",
        "Delay has sharpened the danger: Renn can distinguish deliberate collapse cuts from ordinary mine damage if fear does not silence him."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Promise protection and have Renn annotate the tunnel map before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him bound but listen to his account before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call him a thief and send him back below as bait before the remaining light fails.",
          "failTitle": "The Engineer Returned",
          "failText": "Oswin's guards seize Renn and move the collapse crews before you can follow.",
          "death": false
        }
      ]
    },
    {
      "id": "J09A",
      "turn": 9,
      "title": "The Purchase Stakes - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Surface stakes above each dangerous gallery mark farms Oswin has offered to buy cheaply.",
        "The cleanest clue survives because you handled it with care. Dates in his land book show offers arriving one day after new cracks appeared.",
        "The clearer position reveals the stakes: The mine is designed not only to steal ore but to manufacture failing farms for acquisition."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull all stakes and throw them down the shafts.",
          "failTitle": "The Pattern Scattered",
          "failText": "Without their positions, the link between damaged galleries and purchase offers becomes much harder to prove.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record stake dates beside the matching tunnel numbers.",
          "scoreDelta": 1,
          "nextNodeId": "J10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn every named farmer against selling.",
          "scoreDelta": 0,
          "nextNodeId": "J10B"
        }
      ]
    },
    {
      "id": "J09B",
      "turn": 9,
      "title": "The Purchase Stakes - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Surface stakes above each dangerous gallery mark farms Oswin has offered to buy cheaply.",
        "The shared search reveals details no single witness had understood. Dates in his land book show offers arriving one day after new cracks appeared.",
        "The evidence now defines the danger: The mine is designed not only to steal ore but to manufacture failing farms for acquisition."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Record stake dates beside the matching tunnel numbers while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn every named farmer against selling while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull all stakes and throw them down the shafts while keeping Elspeth Cairn informed.",
          "failTitle": "The Pattern Scattered",
          "failText": "Without their positions, the link between damaged galleries and purchase offers becomes much harder to prove.",
          "death": false
        }
      ]
    },
    {
      "id": "J09C",
      "turn": 9,
      "title": "The Purchase Stakes - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Surface stakes above each dangerous gallery mark farms Oswin has offered to buy cheaply.",
        "What remains is enough, provided you act before it is moved. Dates in his land book show offers arriving one day after new cracks appeared.",
        "Delay has sharpened the danger: The mine is designed not only to steal ore but to manufacture failing farms for acquisition."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn every named farmer against selling before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull all stakes and throw them down the shafts before the remaining light fails.",
          "failTitle": "The Pattern Scattered",
          "failText": "Without their positions, the link between damaged galleries and purchase offers becomes much harder to prove.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record stake dates beside the matching tunnel numbers before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J10C"
        }
      ]
    },
    {
      "id": "J10A",
      "turn": 10,
      "title": "A Granary Underground - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. One numbered gallery runs beneath Oakenhurst's outer grain barn.",
        "You pause only long enough to read the danger correctly. Fresh saw cuts weaken its props, and a chalk date matches the day the duke's harvest reserve will be stored.",
        "The clearer position reveals the stakes: Oswin plans a dramatic collapse that will ruin both farms and the town's winter grain."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Brace the cut props temporarily and preserve one sawn face.",
          "scoreDelta": 1,
          "nextNodeId": "J11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Empty the granary before pursuing the miners.",
          "scoreDelta": 0,
          "nextNodeId": "J11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the gallery roof now so it cannot reach the barn.",
          "failTitle": "The Collapse Brought Early",
          "failText": "The forced cave-in races beyond the intended break and takes part of the granary with it.",
          "death": true
        }
      ]
    },
    {
      "id": "J10B",
      "turn": 10,
      "title": "A Granary Underground - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. One numbered gallery runs beneath Oakenhurst's outer grain barn.",
        "A sober exchange of evidence keeps the group from dividing. Fresh saw cuts weaken its props, and a chalk date matches the day the duke's harvest reserve will be stored.",
        "The evidence now defines the danger: Oswin plans a dramatic collapse that will ruin both farms and the town's winter grain."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Empty the granary before pursuing the miners while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the gallery roof now so it cannot reach the barn while keeping Elspeth Cairn informed.",
          "failTitle": "The Collapse Brought Early",
          "failText": "The forced cave-in races beyond the intended break and takes part of the granary with it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Brace the cut props temporarily and preserve one sawn face while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J11B"
        }
      ]
    },
    {
      "id": "J10C",
      "turn": 10,
      "title": "A Granary Underground - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. One numbered gallery runs beneath Oakenhurst's outer grain barn.",
        "You make up lost ground with a directness that warns everyone nearby. Fresh saw cuts weaken its props, and a chalk date matches the day the duke's harvest reserve will be stored.",
        "Delay has sharpened the danger: Oswin plans a dramatic collapse that will ruin both farms and the town's winter grain."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the gallery roof now so it cannot reach the barn before the remaining light fails.",
          "failTitle": "The Collapse Brought Early",
          "failText": "The forced cave-in races beyond the intended break and takes part of the granary with it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Brace the cut props temporarily and preserve one sawn face before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Empty the granary before pursuing the miners before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J11A"
        }
      ]
    },
    {
      "id": "J11A",
      "turn": 11,
      "title": "Elspeth's Brother - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. A captive work crew includes Elspeth's brother Davin, believed to have left for seasonal labor.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. He says Oswin forces farmers to sign sales underground before allowing food or rest.",
        "The clearer position reveals the stakes: Those deeds can appear voluntary unless the place and method of coercion are exposed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring the whole crew toward the guarded shaft.",
          "scoreDelta": 0,
          "nextNodeId": "J12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Give Davin a pick and send him after Oswin.",
          "failTitle": "Anger in the Dark",
          "failText": "Davin's attack starts a tunnel fight and destroys the fragile route to the remaining captives.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Free Davin quietly and preserve his unsigned deed and restraints.",
          "scoreDelta": 1,
          "nextNodeId": "J12A"
        }
      ]
    },
    {
      "id": "J11B",
      "turn": 11,
      "title": "Elspeth's Brother - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. A captive work crew includes Elspeth's brother Davin, believed to have left for seasonal labor.",
        "With Thorne close and local witnesses beside you, you compare every account. He says Oswin forces farmers to sign sales underground before allowing food or rest.",
        "The evidence now defines the danger: Those deeds can appear voluntary unless the place and method of coercion are exposed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Give Davin a pick and send him after Oswin while keeping Elspeth Cairn informed.",
          "failTitle": "Anger in the Dark",
          "failText": "Davin's attack starts a tunnel fight and destroys the fragile route to the remaining captives.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Free Davin quietly and preserve his unsigned deed and restraints while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring the whole crew toward the guarded shaft while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J12C"
        }
      ]
    },
    {
      "id": "J11C",
      "turn": 11,
      "title": "Elspeth's Brother - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. A captive work crew includes Elspeth's brother Davin, believed to have left for seasonal labor.",
        "Working against the light, you test the few signs that remain. He says Oswin forces farmers to sign sales underground before allowing food or rest.",
        "Delay has sharpened the danger: Those deeds can appear voluntary unless the place and method of coercion are exposed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Free Davin quietly and preserve his unsigned deed and restraints before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring the whole crew toward the guarded shaft before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Give Davin a pick and send him after Oswin before the remaining light fails.",
          "failTitle": "Anger in the Dark",
          "failText": "Davin's attack starts a tunnel fight and destroys the fragile route to the remaining captives.",
          "death": true
        }
      ]
    },
    {
      "id": "J12A",
      "turn": 12,
      "title": "The Sump Gate - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. Renn reveals a water gate holding back an old underground stream.",
        "You circle downwind and let small marks tell their order. Oswin can flood worked galleries, erase ore and bodies, then blame natural ground water for every collapse.",
        "The clearer position reveals the stakes: The gate is both his final concealment and a threat hanging over prisoners still below."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the gate to drive Oswin's men out.",
          "failTitle": "The Mine Flooded",
          "failText": "Water outruns every person in the low galleries and removes proof with lives.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure the winding handle and map the drainage route.",
          "scoreDelta": 1,
          "nextNodeId": "J13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place wardens at the gate while rescue continues.",
          "scoreDelta": 0,
          "nextNodeId": "J13B"
        }
      ]
    },
    {
      "id": "J12B",
      "turn": 12,
      "title": "The Sump Gate - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. Renn reveals a water gate holding back an old underground stream.",
        "You ask plain questions and watch which answers agree. Oswin can flood worked galleries, erase ore and bodies, then blame natural ground water for every collapse.",
        "The evidence now defines the danger: The gate is both his final concealment and a threat hanging over prisoners still below."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Secure the winding handle and map the drainage route while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place wardens at the gate while rescue continues while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the gate to drive Oswin's men out while keeping Elspeth Cairn informed.",
          "failTitle": "The Mine Flooded",
          "failText": "Water outruns every person in the low galleries and removes proof with lives.",
          "death": true
        }
      ]
    },
    {
      "id": "J12C",
      "turn": 12,
      "title": "The Sump Gate - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. Renn reveals a water gate holding back an old underground stream.",
        "There is no time for elegance, only for separating fresh danger from old damage. Oswin can flood worked galleries, erase ore and bodies, then blame natural ground water for every collapse.",
        "Delay has sharpened the danger: The gate is both his final concealment and a threat hanging over prisoners still below."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Place wardens at the gate while rescue continues before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the gate to drive Oswin's men out before the remaining light fails.",
          "failTitle": "The Mine Flooded",
          "failText": "Water outruns every person in the low galleries and removes proof with lives.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure the winding handle and map the drainage route before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J13C"
        }
      ]
    },
    {
      "id": "J13A",
      "turn": 13,
      "title": "The False Surveyor - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. A surveyor arrives claiming Duke Aldric ordered the mines sealed immediately.",
        "From sheltered ground, you measure tracks, tools, and distances. His measuring chain lacks the duke's standard links, and clay on his boots comes from Oswin's lower shaft.",
        "The clearer position reveals the stakes: The false authority is meant to exclude witnesses while collapse crews finish their work."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Measure his chain against Elspeth's field rod and detain him.",
          "scoreDelta": 1,
          "nextNodeId": "J14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him talking until the true surveyor arrives.",
          "scoreDelta": 0,
          "nextNodeId": "J14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Obey the order and withdraw everyone from the fields.",
          "failTitle": "The Ground Abandoned",
          "failText": "Oswin gains the empty surface he needs to cut props and flood galleries without resistance.",
          "death": false
        }
      ]
    },
    {
      "id": "J13B",
      "turn": 13,
      "title": "The False Surveyor - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. A surveyor arrives claiming Duke Aldric ordered the mines sealed immediately.",
        "You keep the scene orderly while your allies search it piece by piece. His measuring chain lacks the duke's standard links, and clay on his boots comes from Oswin's lower shaft.",
        "The evidence now defines the danger: The false authority is meant to exclude witnesses while collapse crews finish their work."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him talking until the true surveyor arrives while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Obey the order and withdraw everyone from the fields while keeping Elspeth Cairn informed.",
          "failTitle": "The Ground Abandoned",
          "failText": "Oswin gains the empty surface he needs to cut props and flood galleries without resistance.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure his chain against Elspeth's field rod and detain him while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J14B"
        }
      ]
    },
    {
      "id": "J13C",
      "turn": 13,
      "title": "The False Surveyor - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. A surveyor arrives claiming Duke Aldric ordered the mines sealed immediately.",
        "Pressed for time, you trust hard evidence and discard rumor. His measuring chain lacks the duke's standard links, and clay on his boots comes from Oswin's lower shaft.",
        "Delay has sharpened the danger: The false authority is meant to exclude witnesses while collapse crews finish their work."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Obey the order and withdraw everyone from the fields before the remaining light fails.",
          "failTitle": "The Ground Abandoned",
          "failText": "Oswin gains the empty surface he needs to cut props and flood galleries without resistance.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure his chain against Elspeth's field rod and detain him before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him talking until the true surveyor arrives before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J14A"
        }
      ]
    },
    {
      "id": "J14A",
      "turn": 14,
      "title": "The Collapse Crew - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Three men carry short saws and oil jars toward the numbered galleries.",
        "You move quietly enough to hear work and voices ahead. Their list names the granary, Elspeth's farm, and two holdings whose owners rejected Oswin's offers.",
        "The clearer position reveals the stakes: The coming destruction is targeted land fraud, not careless mining."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Arrest the crew at the next braced junction.",
          "scoreDelta": 0,
          "nextNodeId": "J15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light their oil to block the tunnel.",
          "failTitle": "Fire Under the Fields",
          "failText": "Smoke and flame race along dry props toward captives and grain above.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the list and disable the saw teeth without raising alarm.",
          "scoreDelta": 1,
          "nextNodeId": "J15A"
        }
      ]
    },
    {
      "id": "J14B",
      "turn": 14,
      "title": "The Collapse Crew - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Three men carry short saws and oil jars toward the numbered galleries.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Their list names the granary, Elspeth's farm, and two holdings whose owners rejected Oswin's offers.",
        "The evidence now defines the danger: The coming destruction is targeted land fraud, not careless mining."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Light their oil to block the tunnel while keeping Elspeth Cairn informed.",
          "failTitle": "Fire Under the Fields",
          "failText": "Smoke and flame race along dry props toward captives and grain above.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the list and disable the saw teeth without raising alarm while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Arrest the crew at the next braced junction while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J15C"
        }
      ]
    },
    {
      "id": "J14C",
      "turn": 14,
      "title": "The Collapse Crew - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Three men carry short saws and oil jars toward the numbered galleries.",
        "You push through fatigue, knowing the next mistake may close the road. Their list names the granary, Elspeth's farm, and two holdings whose owners rejected Oswin's offers.",
        "Delay has sharpened the danger: The coming destruction is targeted land fraud, not careless mining."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the list and disable the saw teeth without raising alarm before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Arrest the crew at the next braced junction before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light their oil to block the tunnel before the remaining light fails.",
          "failTitle": "Fire Under the Fields",
          "failText": "Smoke and flame race along dry props toward captives and grain above.",
          "death": true
        }
      ]
    },
    {
      "id": "J15A",
      "turn": 15,
      "title": "The Field Council - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. Elspeth gathers farmers over the mine map while Renn explains which land can bear weight.",
        "A ranger's eye finds the human habit behind the apparent mystery. Fearful families want every shaft filled at once, but sudden loading could trigger connected collapses.",
        "The clearer position reveals the stakes: Saving the farms requires coordinated restraint from people who have already lost trust in the ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let each farmer fill the nearest vent independently.",
          "failTitle": "A Thousand Stones Below",
          "failText": "Uneven loads crush supports and spread sinkholes across neighboring fields.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Assign safe surface zones matching Renn's tunnel braces.",
          "scoreDelta": 1,
          "nextNodeId": "J16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Evacuate threatened homes and wait for Aldric's engineers.",
          "scoreDelta": 0,
          "nextNodeId": "J16B"
        }
      ]
    },
    {
      "id": "J15B",
      "turn": 15,
      "title": "The Field Council - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. Elspeth gathers farmers over the mine map while Renn explains which land can bear weight.",
        "Together, the small company builds one reliable account from scattered facts. Fearful families want every shaft filled at once, but sudden loading could trigger connected collapses.",
        "The evidence now defines the danger: Saving the farms requires coordinated restraint from people who have already lost trust in the ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Assign safe surface zones matching Renn's tunnel braces while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Evacuate threatened homes and wait for Aldric's engineers while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let each farmer fill the nearest vent independently while keeping Elspeth Cairn informed.",
          "failTitle": "A Thousand Stones Below",
          "failText": "Uneven loads crush supports and spread sinkholes across neighboring fields.",
          "death": true
        }
      ]
    },
    {
      "id": "J15C",
      "turn": 15,
      "title": "The Field Council - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. Elspeth gathers farmers over the mine map while Renn explains which land can bear weight.",
        "You take the shortest safe route and accept that concealment is nearly gone. Fearful families want every shaft filled at once, but sudden loading could trigger connected collapses.",
        "Delay has sharpened the danger: Saving the farms requires coordinated restraint from people who have already lost trust in the ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Evacuate threatened homes and wait for Aldric's engineers before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let each farmer fill the nearest vent independently before the remaining light fails.",
          "failTitle": "A Thousand Stones Below",
          "failText": "Uneven loads crush supports and spread sinkholes across neighboring fields.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Assign safe surface zones matching Renn's tunnel braces before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J16C"
        }
      ]
    },
    {
      "id": "J16A",
      "turn": 16,
      "title": "Oswin Cuts the Main Prop - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Oswin reaches the central junction with an axe and a deed chest.",
        "You preserve the most fragile sign before turning to the larger scene. The main prop carries the gallery beneath the granary; one deep cut already groans under the soil.",
        "The clearer position reveals the stakes: He will bury the mine and emerge as the largest surviving landholder if the support fails."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Brace the beam with the lift cage before closing on Oswin.",
          "scoreDelta": 1,
          "nextNodeId": "J17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him talking while Renn brings a screw jack.",
          "scoreDelta": 0,
          "nextNodeId": "J17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush him across the weakened floor.",
          "failTitle": "The Junction Falls",
          "failText": "The floor and central prop fail together, taking the pursuit and the granary foundations down.",
          "death": true
        }
      ]
    },
    {
      "id": "J16B",
      "turn": 16,
      "title": "Oswin Cuts the Main Prop - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Oswin reaches the central junction with an axe and a deed chest.",
        "Each person is given one task, and confusion begins to clear. The main prop carries the gallery beneath the granary; one deep cut already groans under the soil.",
        "The evidence now defines the danger: He will bury the mine and emerge as the largest surviving landholder if the support fails."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him talking while Renn brings a screw jack while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush him across the weakened floor while keeping Elspeth Cairn informed.",
          "failTitle": "The Junction Falls",
          "failText": "The floor and central prop fail together, taking the pursuit and the granary foundations down.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Brace the beam with the lift cage before closing on Oswin while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J17B"
        }
      ]
    },
    {
      "id": "J16C",
      "turn": 16,
      "title": "Oswin Cuts the Main Prop - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Oswin reaches the central junction with an axe and a deed chest.",
        "The enemy has the lead, so you judge every pause against the lives at risk. The main prop carries the gallery beneath the granary; one deep cut already groans under the soil.",
        "Delay has sharpened the danger: He will bury the mine and emerge as the largest surviving landholder if the support fails."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush him across the weakened floor before the remaining light fails.",
          "failTitle": "The Junction Falls",
          "failText": "The floor and central prop fail together, taking the pursuit and the granary foundations down.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Brace the beam with the lift cage before closing on Oswin before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him talking while Renn brings a screw jack before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J17A"
        }
      ]
    },
    {
      "id": "J17A",
      "turn": 17,
      "title": "The Deed Chest - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Oswin drops the chest onto a mine cart and kicks it toward the open sump.",
        "You watch before acting and learn who believes themselves unobserved. Inside lie coerced sales, purchase offers, wage lists, and the master gallery map.",
        "The clearer position reveals the stakes: The documents can restore stolen farms and prove why particular supports were cut."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Davin catch the cart while you bind Oswin.",
          "scoreDelta": 0,
          "nextNodeId": "J18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Jump onto the moving cart before the sump.",
          "failTitle": "Into the Black Water",
          "failText": "The cart breaks the sump rail and carries you and the deeds beneath the flooded gate.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Switch the cart onto the dry ore spur and stop it there.",
          "scoreDelta": 1,
          "nextNodeId": "J18A"
        }
      ]
    },
    {
      "id": "J17B",
      "turn": 17,
      "title": "The Deed Chest - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Oswin drops the chest onto a mine cart and kicks it toward the open sump.",
        "By keeping tempers cool, you hold the inquiry on facts. Inside lie coerced sales, purchase offers, wage lists, and the master gallery map.",
        "The evidence now defines the danger: The documents can restore stolen farms and prove why particular supports were cut."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Jump onto the moving cart before the sump while keeping Elspeth Cairn informed.",
          "failTitle": "Into the Black Water",
          "failText": "The cart breaks the sump rail and carries you and the deeds beneath the flooded gate.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Switch the cart onto the dry ore spur and stop it there while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Davin catch the cart while you bind Oswin while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J18C"
        }
      ]
    },
    {
      "id": "J17C",
      "turn": 17,
      "title": "The Deed Chest - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Oswin drops the chest onto a mine cart and kicks it toward the open sump.",
        "The narrow margin leaves no room to chase every possibility. Inside lie coerced sales, purchase offers, wage lists, and the master gallery map.",
        "Delay has sharpened the danger: The documents can restore stolen farms and prove why particular supports were cut."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Switch the cart onto the dry ore spur and stop it there before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Davin catch the cart while you bind Oswin before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Jump onto the moving cart before the sump before the remaining light fails.",
          "failTitle": "Into the Black Water",
          "failText": "The cart breaks the sump rail and carries you and the deeds beneath the flooded gate.",
          "death": true
        }
      ]
    },
    {
      "id": "J18A",
      "turn": 18,
      "title": "The Weight of the Granary - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Surface workers begin unloading grain while Renn and Aldric's engineer brace the tunnel.",
        "You use ground, wind, and cover to approach on your own terms. A cracked field wall can supply stone, but removing it will release sheep onto the work area.",
        "The clearer position reveals the stakes: Every rescue now depends on managing ordinary farm tasks beside extraordinary danger."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop stones through the nearest ventilation heap.",
          "failTitle": "The Brace Crew Buried",
          "failText": "Falling rock strikes workers below and overloads one section instead of supporting the main line.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move sheep first, then pass numbered stones to the correct braces.",
          "scoreDelta": 1,
          "nextNodeId": "J19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use timber props until the whole barn is empty.",
          "scoreDelta": 0,
          "nextNodeId": "J19B"
        }
      ]
    },
    {
      "id": "J18B",
      "turn": 18,
      "title": "The Weight of the Granary - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Surface workers begin unloading grain while Renn and Aldric's engineer brace the tunnel.",
        "Your allies close the easy exits while you examine the heart of the scene. A cracked field wall can supply stone, but removing it will release sheep onto the work area.",
        "The evidence now defines the danger: Every rescue now depends on managing ordinary farm tasks beside extraordinary danger."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Move sheep first, then pass numbered stones to the correct braces while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use timber props until the whole barn is empty while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop stones through the nearest ventilation heap while keeping Elspeth Cairn informed.",
          "failTitle": "The Brace Crew Buried",
          "failText": "Falling rock strikes workers below and overloads one section instead of supporting the main line.",
          "death": true
        }
      ]
    },
    {
      "id": "J18C",
      "turn": 18,
      "title": "The Weight of the Granary - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Surface workers begin unloading grain while Renn and Aldric's engineer brace the tunnel.",
        "You arrive openly and must turn speed into its own kind of protection. A cracked field wall can supply stone, but removing it will release sheep onto the work area.",
        "Delay has sharpened the danger: Every rescue now depends on managing ordinary farm tasks beside extraordinary danger."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Use timber props until the whole barn is empty before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop stones through the nearest ventilation heap before the remaining light fails.",
          "failTitle": "The Brace Crew Buried",
          "failText": "Falling rock strikes workers below and overloads one section instead of supporting the main line.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move sheep first, then pass numbered stones to the correct braces before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J19C"
        }
      ]
    },
    {
      "id": "J19A",
      "turn": 19,
      "title": "Court Above the Shaft - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Aldric's reeve hears Oswin's case in the opened threshing barn.",
        "The cleanest clue survives because you handled it with care. Farmers hold coerced deeds, Renn presents the map, and sacks of ore bear numbers matching damaged fields.",
        "The clearer position reveals the stakes: The judgment must connect theft below ground with false purchases above it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Lay out map, stakes, deeds, ore, and cut props as one design.",
          "scoreDelta": 1,
          "nextNodeId": "J20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Restore obvious farms first and investigate the remaining claims.",
          "scoreDelta": 0,
          "nextNodeId": "J20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let farmers divide Oswin's land before judgment.",
          "failTitle": "A New Boundary War",
          "failText": "Hasty division creates rival claims and lets Oswin's partners hide among supposed restitution.",
          "death": false
        }
      ]
    },
    {
      "id": "J19B",
      "turn": 19,
      "title": "Court Above the Shaft - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Aldric's reeve hears Oswin's case in the opened threshing barn.",
        "The shared search reveals details no single witness had understood. Farmers hold coerced deeds, Renn presents the map, and sacks of ore bear numbers matching damaged fields.",
        "The evidence now defines the danger: The judgment must connect theft below ground with false purchases above it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Restore obvious farms first and investigate the remaining claims while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "nextNodeId": "J20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let farmers divide Oswin's land before judgment while keeping Elspeth Cairn informed.",
          "failTitle": "A New Boundary War",
          "failText": "Hasty division creates rival claims and lets Oswin's partners hide among supposed restitution.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay out map, stakes, deeds, ore, and cut props as one design while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "nextNodeId": "J20B"
        }
      ]
    },
    {
      "id": "J19C",
      "turn": 19,
      "title": "Court Above the Shaft - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Aldric's reeve hears Oswin's case in the opened threshing barn.",
        "What remains is enough, provided you act before it is moved. Farmers hold coerced deeds, Renn presents the map, and sacks of ore bear numbers matching damaged fields.",
        "Delay has sharpened the danger: The judgment must connect theft below ground with false purchases above it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let farmers divide Oswin's land before judgment before the remaining light fails.",
          "failTitle": "A New Boundary War",
          "failText": "Hasty division creates rival claims and lets Oswin's partners hide among supposed restitution.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay out map, stakes, deeds, ore, and cut props as one design before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "J20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Restore obvious farms first and investigate the remaining claims before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "J20A"
        }
      ]
    },
    {
      "id": "J20A",
      "turn": 20,
      "title": "Firm Earth - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Filled galleries settle beneath green shoots as the rescued families return.",
        "You pause only long enough to read the danger correctly. Elspeth proposes a field council to watch vents and cracks, while Renn offers to mark every safe seam.",
        "The clearer position reveals the stakes: The final settlement can restore both land and confidence or leave Oakenhurst living above an unnamed danger."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Close only the main shafts and compensate displaced families.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Reopen the safest seam as Aldric's secret mine.",
          "failTitle": "The Hidden Work Begins Again",
          "failText": "Keeping the mine secret preserves the same temptation that put profit beneath every life above it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the full map to secure every gallery and restore coerced holdings.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "J20B",
      "turn": 20,
      "title": "Firm Earth - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Filled galleries settle beneath green shoots as the rescued families return.",
        "A sober exchange of evidence keeps the group from dividing. Elspeth proposes a field council to watch vents and cracks, while Renn offers to mark every safe seam.",
        "The evidence now defines the danger: The final settlement can restore both land and confidence or leave Oakenhurst living above an unnamed danger."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Reopen the safest seam as Aldric's secret mine while keeping Elspeth Cairn informed.",
          "failTitle": "The Hidden Work Begins Again",
          "failText": "Keeping the mine secret preserves the same temptation that put profit beneath every life above it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the full map to secure every gallery and restore coerced holdings while keeping Elspeth Cairn informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close only the main shafts and compensate displaced families while keeping Elspeth Cairn informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "J20C",
      "turn": 20,
      "title": "Firm Earth - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Filled galleries settle beneath green shoots as the rescued families return.",
        "You make up lost ground with a directness that warns everyone nearby. Elspeth proposes a field council to watch vents and cracks, while Renn offers to mark every safe seam.",
        "Delay has sharpened the danger: The final settlement can restore both land and confidence or leave Oakenhurst living above an unnamed danger."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the full map to secure every gallery and restore coerced holdings before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close only the main shafts and compensate displaced families before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Reopen the safest seam as Aldric's secret mine before the remaining light fails.",
          "failTitle": "The Hidden Work Begins Again",
          "failText": "Keeping the mine secret preserves the same temptation that put profit beneath every life above it.",
          "death": false
        }
      ]
    }
  ]
});
