window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-white-harts-collar",
  "title": "The White Hart's Collar",
  "summary": "A white hart wearing Duke Aldric's old hunting collar draws armed strangers into Elderwood, where the ranger and young forester Elian Voss uncover a staged poaching war meant to empty tenant woods for a profitable charcoal grant.",
  "maxTurns": 20,
  "startNodeId": "B01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The white hart is released beyond the hunting lanes, the tenants keep their woodland rights, and Calder Voss answers for manufacturing both poachers and panic. Elian becomes keeper of the north coppices, where no horn is sounded again without cause.",
    "low": "The hart survives and the planned bloodshed is stopped, but Calder's burned ledgers leave the charcoal claim tangled for years. Soldiers patrol the coppices while Duke Aldric hears each tenant family in turn."
  },
  "nodes": [
    {
      "id": "B01A",
      "turn": 1,
      "title": "The Hart at the Gate - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into the coppiced woods north of Oakenhurst as a white hart wearing one of Duke Aldric's old kennel collars has appeared beside three slain deer.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Young forester Elian Voss insists the collar was locked away after the ducal hunt ended five years ago.",
        "The clearer position reveals the stakes: Someone is using a rare animal and the duke's own mark to turn ordinary poaching into an insult against Aldric."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Examine the collar and the dead deer's wounds before following the hart.",
          "scoreDelta": 1,
          "nextNodeId": "B02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question Elian and the nearby coppice tenants.",
          "scoreDelta": 0,
          "nextNodeId": "B02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Sound the hunting horn and drive every armed man into the wood.",
          "failTitle": "The Hunt Unleashed",
          "failText": "The horn scatters the hart and draws rival bands together before you know who placed them there.",
          "death": false
        }
      ]
    },
    {
      "id": "B01B",
      "turn": 1,
      "title": "The Hart at the Gate - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: a white hart wearing one of Duke Aldric's old kennel collars has appeared beside three slain deer.",
        "With Thorne close and local witnesses beside you, you compare every account. Young forester Elian Voss insists the collar was locked away after the ducal hunt ended five years ago.",
        "The evidence now defines the danger: Someone is using a rare animal and the duke's own mark to turn ordinary poaching into an insult against Aldric."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question Elian and the nearby coppice tenants while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Sound the hunting horn and drive every armed man into the wood while keeping Elian Voss informed.",
          "failTitle": "The Hunt Unleashed",
          "failText": "The horn scatters the hart and draws rival bands together before you know who placed them there.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Examine the collar and the dead deer's wounds before following the hart while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B02B"
        }
      ]
    },
    {
      "id": "B01C",
      "turn": 1,
      "title": "The Hart at the Gate - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, a white hart wearing one of Duke Aldric's old kennel collars has appeared beside three slain deer.",
        "Working against the light, you test the few signs that remain. Young forester Elian Voss insists the collar was locked away after the ducal hunt ended five years ago.",
        "Delay has sharpened the danger: Someone is using a rare animal and the duke's own mark to turn ordinary poaching into an insult against Aldric."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Sound the hunting horn and drive every armed man into the wood before the remaining light fails.",
          "failTitle": "The Hunt Unleashed",
          "failText": "The horn scatters the hart and draws rival bands together before you know who placed them there.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Examine the collar and the dead deer's wounds before following the hart before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question Elian and the nearby coppice tenants before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B02A"
        }
      ]
    },
    {
      "id": "B02A",
      "turn": 2,
      "title": "A Collar Recut - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. File marks inside the brass collar show it was opened and closed with a farrier's tool.",
        "You circle downwind and let small marks tell their order. White hairs are caught beneath fresh leather padding, proving the hart has worn it for several days.",
        "The clearer position reveals the stakes: The animal was handled patiently; this is no chance trophy tied by a passing hunter."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the collar to Oakenhurst's farriers.",
          "scoreDelta": 0,
          "nextNodeId": "B03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the collar from the hart with an arrow.",
          "failTitle": "The Hart Wounded",
          "failText": "The shot glances from brass and drives the injured animal deep into the crowded hunting ground.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take a wax impression of the tool marks.",
          "scoreDelta": 1,
          "nextNodeId": "B03A"
        }
      ]
    },
    {
      "id": "B02B",
      "turn": 2,
      "title": "A Collar Recut - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. File marks inside the brass collar show it was opened and closed with a farrier's tool.",
        "You ask plain questions and watch which answers agree. White hairs are caught beneath fresh leather padding, proving the hart has worn it for several days.",
        "The evidence now defines the danger: The animal was handled patiently; this is no chance trophy tied by a passing hunter."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the collar from the hart with an arrow while keeping Elian Voss informed.",
          "failTitle": "The Hart Wounded",
          "failText": "The shot glances from brass and drives the injured animal deep into the crowded hunting ground.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take a wax impression of the tool marks while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the collar to Oakenhurst's farriers while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B03C"
        }
      ]
    },
    {
      "id": "B02C",
      "turn": 2,
      "title": "A Collar Recut - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. File marks inside the brass collar show it was opened and closed with a farrier's tool.",
        "There is no time for elegance, only for separating fresh danger from old damage. White hairs are caught beneath fresh leather padding, proving the hart has worn it for several days.",
        "Delay has sharpened the danger: The animal was handled patiently; this is no chance trophy tied by a passing hunter."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take a wax impression of the tool marks before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the collar to Oakenhurst's farriers before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the collar from the hart with an arrow before the remaining light fails.",
          "failTitle": "The Hart Wounded",
          "failText": "The shot glances from brass and drives the injured animal deep into the crowded hunting ground.",
          "death": false
        }
      ]
    },
    {
      "id": "B03A",
      "turn": 3,
      "title": "Two Kinds of Arrow - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. The deer were killed by broad hunting heads, but a broken narrow point lies under the leaves.",
        "From sheltered ground, you measure tracks, tools, and distances. Elian identifies the narrow iron as a charcoal burner's tool for pinning kiln screens, not a hunting arrow.",
        "The clearer position reveals the stakes: Evidence from two trades has been arranged to make each accuse the other."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest the first charcoal worker carrying narrow iron.",
          "failTitle": "The Wrong Enemy",
          "failText": "The arrest convinces the burners that Aldric has chosen the tenants' side, and armed men vanish into the coppices.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the boot prints that avoided the blood trail.",
          "scoreDelta": 1,
          "nextNodeId": "B04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring a burner and a tenant hunter to compare the iron.",
          "scoreDelta": 0,
          "nextNodeId": "B04B"
        }
      ]
    },
    {
      "id": "B03B",
      "turn": 3,
      "title": "Two Kinds of Arrow - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. The deer were killed by broad hunting heads, but a broken narrow point lies under the leaves.",
        "You keep the scene orderly while your allies search it piece by piece. Elian identifies the narrow iron as a charcoal burner's tool for pinning kiln screens, not a hunting arrow.",
        "The evidence now defines the danger: Evidence from two trades has been arranged to make each accuse the other."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the boot prints that avoided the blood trail while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring a burner and a tenant hunter to compare the iron while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest the first charcoal worker carrying narrow iron while keeping Elian Voss informed.",
          "failTitle": "The Wrong Enemy",
          "failText": "The arrest convinces the burners that Aldric has chosen the tenants' side, and armed men vanish into the coppices.",
          "death": false
        }
      ]
    },
    {
      "id": "B03C",
      "turn": 3,
      "title": "Two Kinds of Arrow - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. The deer were killed by broad hunting heads, but a broken narrow point lies under the leaves.",
        "Pressed for time, you trust hard evidence and discard rumor. Elian identifies the narrow iron as a charcoal burner's tool for pinning kiln screens, not a hunting arrow.",
        "Delay has sharpened the danger: Evidence from two trades has been arranged to make each accuse the other."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring a burner and a tenant hunter to compare the iron before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest the first charcoal worker carrying narrow iron before the remaining light fails.",
          "failTitle": "The Wrong Enemy",
          "failText": "The arrest convinces the burners that Aldric has chosen the tenants' side, and armed men vanish into the coppices.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the boot prints that avoided the blood trail before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B04C"
        }
      ]
    },
    {
      "id": "B04A",
      "turn": 4,
      "title": "Sella's Cold Kiln - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Charcoal burner Sella Norr has abandoned a kiln that should be hot.",
        "You move quietly enough to hear work and voices ahead. A gray ash line shows someone dragged a cage from the kiln yard toward a fenced preserve.",
        "The clearer position reveals the stakes: Sella says masked hunters took her brother and demanded she blame the tenant bowmen."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "The coercion is meant to create testimony as well as tracks..",
          "scoreDelta": 1,
          "nextNodeId": "B05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Read the cage drag and search for a place it paused.",
          "scoreDelta": 0,
          "nextNodeId": "B05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Escort Sella to safety before continuing.",
          "failTitle": "Set the cold kiln alight as a signal to her brother",
          "failText": "A Signal to the Captors",
          "death": true
        }
      ]
    },
    {
      "id": "B04B",
      "turn": 4,
      "title": "Sella's Cold Kiln - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Charcoal burner Sella Norr has abandoned a kiln that should be hot.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. A gray ash line shows someone dragged a cage from the kiln yard toward a fenced preserve.",
        "The evidence now defines the danger: Sella says masked hunters took her brother and demanded she blame the tenant bowmen."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Read the cage drag and search for a place it paused while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Escort Sella to safety before continuing while keeping Elian Voss informed.",
          "failTitle": "Set the cold kiln alight as a signal to her brother",
          "failText": "A Signal to the Captors",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "The coercion is meant to create testimony as well as tracks. while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B05B"
        }
      ]
    },
    {
      "id": "B04C",
      "turn": 4,
      "title": "Sella's Cold Kiln - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Charcoal burner Sella Norr has abandoned a kiln that should be hot.",
        "You push through fatigue, knowing the next mistake may close the road. A gray ash line shows someone dragged a cage from the kiln yard toward a fenced preserve.",
        "Delay has sharpened the danger: Sella says masked hunters took her brother and demanded she blame the tenant bowmen."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Escort Sella to safety before continuing before the remaining light fails.",
          "failTitle": "Set the cold kiln alight as a signal to her brother",
          "failText": "A Signal to the Captors",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "The coercion is meant to create testimony as well as tracks. before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Read the cage drag and search for a place it paused before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B05A"
        }
      ]
    },
    {
      "id": "B05A",
      "turn": 5,
      "title": "The Fenced Preserve - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. The cage trail reaches a private deer preserve leased by Elian's uncle, Master Forester Calder Voss.",
        "A ranger's eye finds the human habit behind the apparent mystery. Inside, cut fodder and white hair mark a pen prepared for the hart.",
        "The clearer position reveals the stakes: Calder had the means to tame the animal and access to the duke's retired collars."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Demand Calder open the preserve in front of tenants.",
          "scoreDelta": 0,
          "nextNodeId": "B06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut every fence panel and release the deer.",
          "failTitle": "The Wood in Panic",
          "failText": "A stampede tears through the search parties, destroying tracks and injuring the very tenants you need to protect.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Enter downwind through a gap beneath the fence.",
          "scoreDelta": 1,
          "nextNodeId": "B06A"
        }
      ]
    },
    {
      "id": "B05B",
      "turn": 5,
      "title": "The Fenced Preserve - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. The cage trail reaches a private deer preserve leased by Elian's uncle, Master Forester Calder Voss.",
        "Together, the small company builds one reliable account from scattered facts. Inside, cut fodder and white hair mark a pen prepared for the hart.",
        "The evidence now defines the danger: Calder had the means to tame the animal and access to the duke's retired collars."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut every fence panel and release the deer while keeping Elian Voss informed.",
          "failTitle": "The Wood in Panic",
          "failText": "A stampede tears through the search parties, destroying tracks and injuring the very tenants you need to protect.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Enter downwind through a gap beneath the fence while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Demand Calder open the preserve in front of tenants while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B06C"
        }
      ]
    },
    {
      "id": "B05C",
      "turn": 5,
      "title": "The Fenced Preserve - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. The cage trail reaches a private deer preserve leased by Elian's uncle, Master Forester Calder Voss.",
        "You take the shortest safe route and accept that concealment is nearly gone. Inside, cut fodder and white hair mark a pen prepared for the hart.",
        "Delay has sharpened the danger: Calder had the means to tame the animal and access to the duke's retired collars."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Enter downwind through a gap beneath the fence before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Demand Calder open the preserve in front of tenants before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut every fence panel and release the deer before the remaining light fails.",
          "failTitle": "The Wood in Panic",
          "failText": "A stampede tears through the search parties, destroying tracks and injuring the very tenants you need to protect.",
          "death": false
        }
      ]
    },
    {
      "id": "B06A",
      "turn": 6,
      "title": "Calder's Courtesy - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Calder welcomes you with servants and calls the pen a winter feeding station.",
        "You preserve the most fragile sign before turning to the larger scene. He produces a grant application for exclusive charcoal rights, claiming violence makes tenant management impossible.",
        "The clearer position reveals the stakes: The alleged poaching war would remove the families standing between Calder and a valuable woodland lease."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Calder on Elian's accusation alone.",
          "failTitle": "A Family Quarrel",
          "failText": "Calder portrays the arrest as a nephew's ambition, and neutral foresters refuse to support the inquiry.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the dates and witness marks without revealing your conclusion.",
          "scoreDelta": 1,
          "nextNodeId": "B07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept shelter while Elian searches the outbuildings.",
          "scoreDelta": 0,
          "nextNodeId": "B07B"
        }
      ]
    },
    {
      "id": "B06B",
      "turn": 6,
      "title": "Calder's Courtesy - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Calder welcomes you with servants and calls the pen a winter feeding station.",
        "Each person is given one task, and confusion begins to clear. He produces a grant application for exclusive charcoal rights, claiming violence makes tenant management impossible.",
        "The evidence now defines the danger: The alleged poaching war would remove the families standing between Calder and a valuable woodland lease."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the dates and witness marks without revealing your conclusion while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept shelter while Elian searches the outbuildings while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Calder on Elian's accusation alone while keeping Elian Voss informed.",
          "failTitle": "A Family Quarrel",
          "failText": "Calder portrays the arrest as a nephew's ambition, and neutral foresters refuse to support the inquiry.",
          "death": false
        }
      ]
    },
    {
      "id": "B06C",
      "turn": 6,
      "title": "Calder's Courtesy - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Calder welcomes you with servants and calls the pen a winter feeding station.",
        "The enemy has the lead, so you judge every pause against the lives at risk. He produces a grant application for exclusive charcoal rights, claiming violence makes tenant management impossible.",
        "Delay has sharpened the danger: The alleged poaching war would remove the families standing between Calder and a valuable woodland lease."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept shelter while Elian searches the outbuildings before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Calder on Elian's accusation alone before the remaining light fails.",
          "failTitle": "A Family Quarrel",
          "failText": "Calder portrays the arrest as a nephew's ambition, and neutral foresters refuse to support the inquiry.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the dates and witness marks without revealing your conclusion before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B07C"
        }
      ]
    },
    {
      "id": "B07A",
      "turn": 7,
      "title": "The Missing Brother - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Sella's brother Bren is held in a bark shed with two tenant hunters.",
        "You watch before acting and learn who believes themselves unobserved. Their bonds use fine kennel cord, and each has been threatened with execution by the other group.",
        "The clearer position reveals the stakes: Calder's men are manufacturing enemies who will fight without seeing their true captor."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut the prisoners free silently and preserve a length of cord.",
          "scoreDelta": 1,
          "nextNodeId": "B08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Call Elian to witness the bonds before moving them.",
          "scoreDelta": 0,
          "nextNodeId": "B08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Give the prisoners weapons and send them after their captors.",
          "failTitle": "Revenge in the Coppice",
          "failText": "The frightened men attack shadows, and Calder's guards answer with arrows while he denies commanding either side.",
          "death": true
        }
      ]
    },
    {
      "id": "B07B",
      "turn": 7,
      "title": "The Missing Brother - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Sella's brother Bren is held in a bark shed with two tenant hunters.",
        "By keeping tempers cool, you hold the inquiry on facts. Their bonds use fine kennel cord, and each has been threatened with execution by the other group.",
        "The evidence now defines the danger: Calder's men are manufacturing enemies who will fight without seeing their true captor."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Call Elian to witness the bonds before moving them while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Give the prisoners weapons and send them after their captors while keeping Elian Voss informed.",
          "failTitle": "Revenge in the Coppice",
          "failText": "The frightened men attack shadows, and Calder's guards answer with arrows while he denies commanding either side.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the prisoners free silently and preserve a length of cord while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B08B"
        }
      ]
    },
    {
      "id": "B07C",
      "turn": 7,
      "title": "The Missing Brother - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Sella's brother Bren is held in a bark shed with two tenant hunters.",
        "The narrow margin leaves no room to chase every possibility. Their bonds use fine kennel cord, and each has been threatened with execution by the other group.",
        "Delay has sharpened the danger: Calder's men are manufacturing enemies who will fight without seeing their true captor."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Give the prisoners weapons and send them after their captors before the remaining light fails.",
          "failTitle": "Revenge in the Coppice",
          "failText": "The frightened men attack shadows, and Calder's guards answer with arrows while he denies commanding either side.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the prisoners free silently and preserve a length of cord before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Call Elian to witness the bonds before moving them before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B08A"
        }
      ]
    },
    {
      "id": "B08A",
      "turn": 8,
      "title": "Horns in Sequence - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Three hunting horns sound from separate ridges, drawing tenant bands toward Sella's burners.",
        "You use ground, wind, and cover to approach on your own terms. The notes copy an old ducal drive, but the second call comes from ground no hunt master would use.",
        "The clearer position reveals the stakes: The signals are steering armed people into a planned collision."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Elian to silence the nearest horn.",
          "scoreDelta": 0,
          "nextNodeId": "B09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Answer with Aldric's full gathering call.",
          "failTitle": "The False Muster",
          "failText": "Men who know only parts of the old code mistake your answer for an order to close the ring.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Climb the central oak and map each horn by echo.",
          "scoreDelta": 1,
          "nextNodeId": "B09A"
        }
      ]
    },
    {
      "id": "B08B",
      "turn": 8,
      "title": "Horns in Sequence - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Three hunting horns sound from separate ridges, drawing tenant bands toward Sella's burners.",
        "Your allies close the easy exits while you examine the heart of the scene. The notes copy an old ducal drive, but the second call comes from ground no hunt master would use.",
        "The evidence now defines the danger: The signals are steering armed people into a planned collision."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Answer with Aldric's full gathering call while keeping Elian Voss informed.",
          "failTitle": "The False Muster",
          "failText": "Men who know only parts of the old code mistake your answer for an order to close the ring.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Climb the central oak and map each horn by echo while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Elian to silence the nearest horn while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B09C"
        }
      ]
    },
    {
      "id": "B08C",
      "turn": 8,
      "title": "Horns in Sequence - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Three hunting horns sound from separate ridges, drawing tenant bands toward Sella's burners.",
        "You arrive openly and must turn speed into its own kind of protection. The notes copy an old ducal drive, but the second call comes from ground no hunt master would use.",
        "Delay has sharpened the danger: The signals are steering armed people into a planned collision."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Climb the central oak and map each horn by echo before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Elian to silence the nearest horn before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Answer with Aldric's full gathering call before the remaining light fails.",
          "failTitle": "The False Muster",
          "failText": "Men who know only parts of the old code mistake your answer for an order to close the ring.",
          "death": false
        }
      ]
    },
    {
      "id": "B09A",
      "turn": 9,
      "title": "The Horn Keeper - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. You catch a kennel boy carrying three horns wrapped in sacking.",
        "The cleanest clue survives because you handled it with care. He admits Calder paid him to sound them, but says a scarred gamekeeper named Rusk holds the written sequence.",
        "The clearer position reveals the stakes: The boy is a frightened tool; Rusk is the link between Calder's plan and its armed execution."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten him until he leads you at once.",
          "failTitle": "A Child Driven Too Hard",
          "failText": "The boy runs at the first chance and shouts for Rusk, who changes the signal sequence and clears his camp.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hide the boy with Sella and follow Rusk's fresh track.",
          "scoreDelta": 1,
          "nextNodeId": "B10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the boy openly to the nearest reeve.",
          "scoreDelta": 0,
          "nextNodeId": "B10B"
        }
      ]
    },
    {
      "id": "B09B",
      "turn": 9,
      "title": "The Horn Keeper - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. You catch a kennel boy carrying three horns wrapped in sacking.",
        "The shared search reveals details no single witness had understood. He admits Calder paid him to sound them, but says a scarred gamekeeper named Rusk holds the written sequence.",
        "The evidence now defines the danger: The boy is a frightened tool; Rusk is the link between Calder's plan and its armed execution."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Hide the boy with Sella and follow Rusk's fresh track while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the boy openly to the nearest reeve while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten him until he leads you at once while keeping Elian Voss informed.",
          "failTitle": "A Child Driven Too Hard",
          "failText": "The boy runs at the first chance and shouts for Rusk, who changes the signal sequence and clears his camp.",
          "death": false
        }
      ]
    },
    {
      "id": "B09C",
      "turn": 9,
      "title": "The Horn Keeper - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. You catch a kennel boy carrying three horns wrapped in sacking.",
        "What remains is enough, provided you act before it is moved. He admits Calder paid him to sound them, but says a scarred gamekeeper named Rusk holds the written sequence.",
        "Delay has sharpened the danger: The boy is a frightened tool; Rusk is the link between Calder's plan and its armed execution."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the boy openly to the nearest reeve before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten him until he leads you at once before the remaining light fails.",
          "failTitle": "A Child Driven Too Hard",
          "failText": "The boy runs at the first chance and shouts for Rusk, who changes the signal sequence and clears his camp.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hide the boy with Sella and follow Rusk's fresh track before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B10C"
        }
      ]
    },
    {
      "id": "B10A",
      "turn": 10,
      "title": "Elian Accused - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Rusk leaves Elian's knife beside a wounded charcoal burner.",
        "You pause only long enough to read the danger correctly. The wound was made through heavy cloth with the victim held still, not in a forest fight.",
        "The clearer position reveals the stakes: Calder is preparing to sacrifice his nephew as the supposed leader of tenant violence."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Measure the wound and find the missing cloth fibers.",
          "scoreDelta": 1,
          "nextNodeId": "B11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Elian beside you under formal watch.",
          "scoreDelta": 0,
          "nextNodeId": "B11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Elian confront Calder alone to clear his name.",
          "failTitle": "The Nephew's Trap",
          "failText": "Calder's servants seize Elian for attempted murder and display the planted knife before you can explain the wound.",
          "death": false
        }
      ]
    },
    {
      "id": "B10B",
      "turn": 10,
      "title": "Elian Accused - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Rusk leaves Elian's knife beside a wounded charcoal burner.",
        "A sober exchange of evidence keeps the group from dividing. The wound was made through heavy cloth with the victim held still, not in a forest fight.",
        "The evidence now defines the danger: Calder is preparing to sacrifice his nephew as the supposed leader of tenant violence."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Elian beside you under formal watch while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Elian confront Calder alone to clear his name while keeping Elian Voss informed.",
          "failTitle": "The Nephew's Trap",
          "failText": "Calder's servants seize Elian for attempted murder and display the planted knife before you can explain the wound.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure the wound and find the missing cloth fibers while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B11B"
        }
      ]
    },
    {
      "id": "B10C",
      "turn": 10,
      "title": "Elian Accused - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Rusk leaves Elian's knife beside a wounded charcoal burner.",
        "You make up lost ground with a directness that warns everyone nearby. The wound was made through heavy cloth with the victim held still, not in a forest fight.",
        "Delay has sharpened the danger: Calder is preparing to sacrifice his nephew as the supposed leader of tenant violence."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Elian confront Calder alone to clear his name before the remaining light fails.",
          "failTitle": "The Nephew's Trap",
          "failText": "Calder's servants seize Elian for attempted murder and display the planted knife before you can explain the wound.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure the wound and find the missing cloth fibers before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Elian beside you under formal watch before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B11A"
        }
      ]
    },
    {
      "id": "B11A",
      "turn": 11,
      "title": "The Hart's Return - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. The white hart crosses your trail with a raw patch beneath the loosened collar.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Its hooves carry pale preserve sand and dark pitch from a recently repaired gate.",
        "The clearer position reveals the stakes: The animal's route can identify a second enclosure without turning the inquiry into a chase."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Use fodder to hold it while Sella checks the collar.",
          "scoreDelta": 0,
          "nextNodeId": "B12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw a rope over its antlers.",
          "failTitle": "The Hart's Last Flight",
          "failText": "The frightened animal crashes through thorn and draws every watcher toward your position.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow at a distance and mark where the hart chooses cover.",
          "scoreDelta": 1,
          "nextNodeId": "B12A"
        }
      ]
    },
    {
      "id": "B11B",
      "turn": 11,
      "title": "The Hart's Return - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. The white hart crosses your trail with a raw patch beneath the loosened collar.",
        "With Thorne close and local witnesses beside you, you compare every account. Its hooves carry pale preserve sand and dark pitch from a recently repaired gate.",
        "The evidence now defines the danger: The animal's route can identify a second enclosure without turning the inquiry into a chase."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw a rope over its antlers while keeping Elian Voss informed.",
          "failTitle": "The Hart's Last Flight",
          "failText": "The frightened animal crashes through thorn and draws every watcher toward your position.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow at a distance and mark where the hart chooses cover while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use fodder to hold it while Sella checks the collar while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B12C"
        }
      ]
    },
    {
      "id": "B11C",
      "turn": 11,
      "title": "The Hart's Return - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. The white hart crosses your trail with a raw patch beneath the loosened collar.",
        "Working against the light, you test the few signs that remain. Its hooves carry pale preserve sand and dark pitch from a recently repaired gate.",
        "Delay has sharpened the danger: The animal's route can identify a second enclosure without turning the inquiry into a chase."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow at a distance and mark where the hart chooses cover before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use fodder to hold it while Sella checks the collar before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw a rope over its antlers before the remaining light fails.",
          "failTitle": "The Hart's Last Flight",
          "failText": "The frightened animal crashes through thorn and draws every watcher toward your position.",
          "death": false
        }
      ]
    },
    {
      "id": "B12A",
      "turn": 12,
      "title": "The Pitch Gate - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. The hart's tracks lead to a hidden gate behind Calder's lodge.",
        "You circle downwind and let small marks tell their order. Beyond it lie spare collars, broad arrowheads, burner pins, and coats from both factions.",
        "The clearer position reveals the stakes: The entire poaching war has been assembled from stolen objects under one roof."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pile the disguises in the yard and burn them.",
          "failTitle": "Smoke Without Proof",
          "failText": "The fire destroys the pattern showing how each false trail was built and lets Calder call the objects rubbish.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave each object in place while recording its arrangement.",
          "scoreDelta": 1,
          "nextNodeId": "B13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry representative pieces to neutral foresters.",
          "scoreDelta": 0,
          "nextNodeId": "B13B"
        }
      ]
    },
    {
      "id": "B12B",
      "turn": 12,
      "title": "The Pitch Gate - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. The hart's tracks lead to a hidden gate behind Calder's lodge.",
        "You ask plain questions and watch which answers agree. Beyond it lie spare collars, broad arrowheads, burner pins, and coats from both factions.",
        "The evidence now defines the danger: The entire poaching war has been assembled from stolen objects under one roof."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Leave each object in place while recording its arrangement while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry representative pieces to neutral foresters while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pile the disguises in the yard and burn them while keeping Elian Voss informed.",
          "failTitle": "Smoke Without Proof",
          "failText": "The fire destroys the pattern showing how each false trail was built and lets Calder call the objects rubbish.",
          "death": false
        }
      ]
    },
    {
      "id": "B12C",
      "turn": 12,
      "title": "The Pitch Gate - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. The hart's tracks lead to a hidden gate behind Calder's lodge.",
        "There is no time for elegance, only for separating fresh danger from old damage. Beyond it lie spare collars, broad arrowheads, burner pins, and coats from both factions.",
        "Delay has sharpened the danger: The entire poaching war has been assembled from stolen objects under one roof."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry representative pieces to neutral foresters before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pile the disguises in the yard and burn them before the remaining light fails.",
          "failTitle": "Smoke Without Proof",
          "failText": "The fire destroys the pattern showing how each false trail was built and lets Calder call the objects rubbish.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave each object in place while recording its arrangement before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B13C"
        }
      ]
    },
    {
      "id": "B13A",
      "turn": 13,
      "title": "Rusk's Hunting Book - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Rusk returns for a small leather book listing horn stations and payments.",
        "From sheltered ground, you measure tracks, tools, and distances. A final page names tomorrow's royal inspection, when Aldric's steward will ride through the disputed coppice.",
        "The clearer position reveals the stakes: Calder plans a deadly clash in front of the steward so the tenants lose their rights at once."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take Rusk quietly and secure the book inside your coat.",
          "scoreDelta": 1,
          "nextNodeId": "B14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow him to learn the last horn station.",
          "scoreDelta": 0,
          "nextNodeId": "B14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Challenge him to single combat in the lodge yard.",
          "failTitle": "The Book Carried Away",
          "failText": "Rusk refuses, throws the book to a mounted servant, and uses the noise to escape into the preserve.",
          "death": false
        }
      ]
    },
    {
      "id": "B13B",
      "turn": 13,
      "title": "Rusk's Hunting Book - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Rusk returns for a small leather book listing horn stations and payments.",
        "You keep the scene orderly while your allies search it piece by piece. A final page names tomorrow's royal inspection, when Aldric's steward will ride through the disputed coppice.",
        "The evidence now defines the danger: Calder plans a deadly clash in front of the steward so the tenants lose their rights at once."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow him to learn the last horn station while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Challenge him to single combat in the lodge yard while keeping Elian Voss informed.",
          "failTitle": "The Book Carried Away",
          "failText": "Rusk refuses, throws the book to a mounted servant, and uses the noise to escape into the preserve.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take Rusk quietly and secure the book inside your coat while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B14B"
        }
      ]
    },
    {
      "id": "B13C",
      "turn": 13,
      "title": "Rusk's Hunting Book - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Rusk returns for a small leather book listing horn stations and payments.",
        "Pressed for time, you trust hard evidence and discard rumor. A final page names tomorrow's royal inspection, when Aldric's steward will ride through the disputed coppice.",
        "Delay has sharpened the danger: Calder plans a deadly clash in front of the steward so the tenants lose their rights at once."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Challenge him to single combat in the lodge yard before the remaining light fails.",
          "failTitle": "The Book Carried Away",
          "failText": "Rusk refuses, throws the book to a mounted servant, and uses the noise to escape into the preserve.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take Rusk quietly and secure the book inside your coat before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow him to learn the last horn station before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B14A"
        }
      ]
    },
    {
      "id": "B14A",
      "turn": 14,
      "title": "The Steward's Road - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. The steward's party is already entering Elderwood under a banner visible for miles.",
        "You move quietly enough to hear work and voices ahead. Hidden horn men wait on both sides, while armed tenants and burners gather beyond sight of one another.",
        "The clearer position reveals the stakes: Stopping the inspection outright may look like surrender to the violence Calder invented."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Elian with a warning while you hunt the horn men.",
          "scoreDelta": 0,
          "nextNodeId": "B15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Fire a warning arrow across the steward's banner.",
          "failTitle": "Treason by Appearance",
          "failText": "The guard treats the shot as an attack and charges toward the very ambush you meant to prevent.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reach the steward by the streambed and show him Rusk's book privately.",
          "scoreDelta": 1,
          "nextNodeId": "B15A"
        }
      ]
    },
    {
      "id": "B14B",
      "turn": 14,
      "title": "The Steward's Road - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. The steward's party is already entering Elderwood under a banner visible for miles.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Hidden horn men wait on both sides, while armed tenants and burners gather beyond sight of one another.",
        "The evidence now defines the danger: Stopping the inspection outright may look like surrender to the violence Calder invented."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Fire a warning arrow across the steward's banner while keeping Elian Voss informed.",
          "failTitle": "Treason by Appearance",
          "failText": "The guard treats the shot as an attack and charges toward the very ambush you meant to prevent.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reach the steward by the streambed and show him Rusk's book privately while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Elian with a warning while you hunt the horn men while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B15C"
        }
      ]
    },
    {
      "id": "B14C",
      "turn": 14,
      "title": "The Steward's Road - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. The steward's party is already entering Elderwood under a banner visible for miles.",
        "You push through fatigue, knowing the next mistake may close the road. Hidden horn men wait on both sides, while armed tenants and burners gather beyond sight of one another.",
        "Delay has sharpened the danger: Stopping the inspection outright may look like surrender to the violence Calder invented."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Reach the steward by the streambed and show him Rusk's book privately before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Elian with a warning while you hunt the horn men before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Fire a warning arrow across the steward's banner before the remaining light fails.",
          "failTitle": "Treason by Appearance",
          "failText": "The guard treats the shot as an attack and charges toward the very ambush you meant to prevent.",
          "death": true
        }
      ]
    },
    {
      "id": "B15A",
      "turn": 15,
      "title": "The Empty Drive - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. Old hunt maps reveal a clearing where Calder means the two groups to meet.",
        "A ranger's eye finds the human habit behind the apparent mystery. Fresh hurdles narrow its exits, and straw screens conceal his own archers above the ground.",
        "The clearer position reveals the stakes: The staged battle will become real once the first frightened person cannot retreat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Occupy the clearing alone and dare anyone to enter.",
          "failTitle": "One Voice in a Storm",
          "failText": "The horns drown your warning, and men enter from three sides with no clear way back.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut hidden gaps in the hurdles and expose the archers' screens.",
          "scoreDelta": 1,
          "nextNodeId": "B16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place neutral foresters between the approaching groups.",
          "scoreDelta": 0,
          "nextNodeId": "B16B"
        }
      ]
    },
    {
      "id": "B15B",
      "turn": 15,
      "title": "The Empty Drive - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. Old hunt maps reveal a clearing where Calder means the two groups to meet.",
        "Together, the small company builds one reliable account from scattered facts. Fresh hurdles narrow its exits, and straw screens conceal his own archers above the ground.",
        "The evidence now defines the danger: The staged battle will become real once the first frightened person cannot retreat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut hidden gaps in the hurdles and expose the archers' screens while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place neutral foresters between the approaching groups while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Occupy the clearing alone and dare anyone to enter while keeping Elian Voss informed.",
          "failTitle": "One Voice in a Storm",
          "failText": "The horns drown your warning, and men enter from three sides with no clear way back.",
          "death": true
        }
      ]
    },
    {
      "id": "B15C",
      "turn": 15,
      "title": "The Empty Drive - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. Old hunt maps reveal a clearing where Calder means the two groups to meet.",
        "You take the shortest safe route and accept that concealment is nearly gone. Fresh hurdles narrow its exits, and straw screens conceal his own archers above the ground.",
        "Delay has sharpened the danger: The staged battle will become real once the first frightened person cannot retreat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Place neutral foresters between the approaching groups before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Occupy the clearing alone and dare anyone to enter before the remaining light fails.",
          "failTitle": "One Voice in a Storm",
          "failText": "The horns drown your warning, and men enter from three sides with no clear way back.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut hidden gaps in the hurdles and expose the archers' screens before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B16C"
        }
      ]
    },
    {
      "id": "B16A",
      "turn": 16,
      "title": "The First False Horn - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Rusk raises his horn from a yew ridge as the steward nears the clearing.",
        "You preserve the most fragile sign before turning to the larger scene. Elian can reach the second caller, while Sella knows a burner path to the third.",
        "The clearer position reveals the stakes: A few breaths will decide whether Calder's design becomes bloodshed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Loose an arrow through Rusk's horn strap and give the true stand-down call.",
          "scoreDelta": 1,
          "nextNodeId": "B17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Divide your allies between all three stations.",
          "scoreDelta": 0,
          "nextNodeId": "B17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot Rusk in the chest before he can sound.",
          "failTitle": "A Death That Proves Nothing",
          "failText": "Rusk falls, but his horn sounds as it rolls; Calder later names him a lone murderer and keeps his grant alive.",
          "death": true
        }
      ]
    },
    {
      "id": "B16B",
      "turn": 16,
      "title": "The First False Horn - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Rusk raises his horn from a yew ridge as the steward nears the clearing.",
        "Each person is given one task, and confusion begins to clear. Elian can reach the second caller, while Sella knows a burner path to the third.",
        "The evidence now defines the danger: A few breaths will decide whether Calder's design becomes bloodshed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Divide your allies between all three stations while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot Rusk in the chest before he can sound while keeping Elian Voss informed.",
          "failTitle": "A Death That Proves Nothing",
          "failText": "Rusk falls, but his horn sounds as it rolls; Calder later names him a lone murderer and keeps his grant alive.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Loose an arrow through Rusk's horn strap and give the true stand-down call while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B17B"
        }
      ]
    },
    {
      "id": "B16C",
      "turn": 16,
      "title": "The First False Horn - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Rusk raises his horn from a yew ridge as the steward nears the clearing.",
        "The enemy has the lead, so you judge every pause against the lives at risk. Elian can reach the second caller, while Sella knows a burner path to the third.",
        "Delay has sharpened the danger: A few breaths will decide whether Calder's design becomes bloodshed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot Rusk in the chest before he can sound before the remaining light fails.",
          "failTitle": "A Death That Proves Nothing",
          "failText": "Rusk falls, but his horn sounds as it rolls; Calder later names him a lone murderer and keeps his grant alive.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Loose an arrow through Rusk's horn strap and give the true stand-down call before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Divide your allies between all three stations before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B17A"
        }
      ]
    },
    {
      "id": "B17A",
      "turn": 17,
      "title": "Calder in the Clearing - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. With the false signals broken, Calder rides into the clearing pretending to restore order.",
        "You watch before acting and learn who believes themselves unobserved. He points to armed tenants as proof of rebellion and commands the steward's guard to disarm them.",
        "The clearer position reveals the stakes: The plot can still succeed politically unless its maker is exposed before everyone he divided."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Present Rusk's book to the steward under guard.",
          "scoreDelta": 0,
          "nextNodeId": "B18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call the tenants forward to seize Calder.",
          "failTitle": "The Crowd Becomes His Proof",
          "failText": "The rush gives Calder exactly the image of rebellion he promised the steward.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have the freed prisoners identify their stolen coats and captor.",
          "scoreDelta": 1,
          "nextNodeId": "B18A"
        }
      ]
    },
    {
      "id": "B17B",
      "turn": 17,
      "title": "Calder in the Clearing - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. With the false signals broken, Calder rides into the clearing pretending to restore order.",
        "By keeping tempers cool, you hold the inquiry on facts. He points to armed tenants as proof of rebellion and commands the steward's guard to disarm them.",
        "The evidence now defines the danger: The plot can still succeed politically unless its maker is exposed before everyone he divided."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Call the tenants forward to seize Calder while keeping Elian Voss informed.",
          "failTitle": "The Crowd Becomes His Proof",
          "failText": "The rush gives Calder exactly the image of rebellion he promised the steward.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have the freed prisoners identify their stolen coats and captor while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Present Rusk's book to the steward under guard while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B18C"
        }
      ]
    },
    {
      "id": "B17C",
      "turn": 17,
      "title": "Calder in the Clearing - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. With the false signals broken, Calder rides into the clearing pretending to restore order.",
        "The narrow margin leaves no room to chase every possibility. He points to armed tenants as proof of rebellion and commands the steward's guard to disarm them.",
        "Delay has sharpened the danger: The plot can still succeed politically unless its maker is exposed before everyone he divided."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Have the freed prisoners identify their stolen coats and captor before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Present Rusk's book to the steward under guard before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call the tenants forward to seize Calder before the remaining light fails.",
          "failTitle": "The Crowd Becomes His Proof",
          "failText": "The rush gives Calder exactly the image of rebellion he promised the steward.",
          "death": false
        }
      ]
    },
    {
      "id": "B18A",
      "turn": 18,
      "title": "The White Hart Cornered - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. A panicked guard drives the hart against the hidden hurdles.",
        "You use ground, wind, and cover to approach on your own terms. Calder reaches for a bow, perhaps to destroy the living link to his preserve.",
        "The clearer position reveals the stakes: Saving the animal without endangering the crowd will strip away Calder's final excuse."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tackle Calder while the hart remains trapped.",
          "failTitle": "Antlers in the Crowd",
          "failText": "The struggle startles the hart into the gathered people, where fear turns a rescue into chaos.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Drop one hurdle section and screen the opening from riders.",
          "scoreDelta": 1,
          "nextNodeId": "B19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead the hart out with the fodder Sella carried.",
          "scoreDelta": 0,
          "nextNodeId": "B19B"
        }
      ]
    },
    {
      "id": "B18B",
      "turn": 18,
      "title": "The White Hart Cornered - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. A panicked guard drives the hart against the hidden hurdles.",
        "Your allies close the easy exits while you examine the heart of the scene. Calder reaches for a bow, perhaps to destroy the living link to his preserve.",
        "The evidence now defines the danger: Saving the animal without endangering the crowd will strip away Calder's final excuse."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Drop one hurdle section and screen the opening from riders while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead the hart out with the fodder Sella carried while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tackle Calder while the hart remains trapped while keeping Elian Voss informed.",
          "failTitle": "Antlers in the Crowd",
          "failText": "The struggle startles the hart into the gathered people, where fear turns a rescue into chaos.",
          "death": true
        }
      ]
    },
    {
      "id": "B18C",
      "turn": 18,
      "title": "The White Hart Cornered - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. A panicked guard drives the hart against the hidden hurdles.",
        "You arrive openly and must turn speed into its own kind of protection. Calder reaches for a bow, perhaps to destroy the living link to his preserve.",
        "Delay has sharpened the danger: Saving the animal without endangering the crowd will strip away Calder's final excuse."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead the hart out with the fodder Sella carried before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tackle Calder while the hart remains trapped before the remaining light fails.",
          "failTitle": "Antlers in the Crowd",
          "failText": "The struggle startles the hart into the gathered people, where fear turns a rescue into chaos.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Drop one hurdle section and screen the opening from riders before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B19C"
        }
      ]
    },
    {
      "id": "B19A",
      "turn": 19,
      "title": "Accounts Beneath the Lodge - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Elian finds Calder's charcoal contracts and payments to Rusk under a loose floorboard.",
        "The cleanest clue survives because you handled it with care. The dates match every staged killing, abduction, and horn call.",
        "The clearer position reveals the stakes: The documents explain the profit behind the spectacle and protect both tenants and burners from blame."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal the floorboard contents before neutral witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "B20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the steward ahead with the contracts.",
          "scoreDelta": 0,
          "nextNodeId": "B20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Sella read the names aloud to the angry crowd.",
          "failTitle": "Names as Targets",
          "failText": "Relatives turn on minor servants before lawful testimony can separate coercion from willing guilt.",
          "death": false
        }
      ]
    },
    {
      "id": "B19B",
      "turn": 19,
      "title": "Accounts Beneath the Lodge - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Elian finds Calder's charcoal contracts and payments to Rusk under a loose floorboard.",
        "The shared search reveals details no single witness had understood. The dates match every staged killing, abduction, and horn call.",
        "The evidence now defines the danger: The documents explain the profit behind the spectacle and protect both tenants and burners from blame."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the steward ahead with the contracts while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "nextNodeId": "B20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Sella read the names aloud to the angry crowd while keeping Elian Voss informed.",
          "failTitle": "Names as Targets",
          "failText": "Relatives turn on minor servants before lawful testimony can separate coercion from willing guilt.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the floorboard contents before neutral witnesses while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "nextNodeId": "B20B"
        }
      ]
    },
    {
      "id": "B19C",
      "turn": 19,
      "title": "Accounts Beneath the Lodge - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Elian finds Calder's charcoal contracts and payments to Rusk under a loose floorboard.",
        "What remains is enough, provided you act before it is moved. The dates match every staged killing, abduction, and horn call.",
        "Delay has sharpened the danger: The documents explain the profit behind the spectacle and protect both tenants and burners from blame."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Sella read the names aloud to the angry crowd before the remaining light fails.",
          "failTitle": "Names as Targets",
          "failText": "Relatives turn on minor servants before lawful testimony can separate coercion from willing guilt.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the floorboard contents before neutral witnesses before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "B20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the steward ahead with the contracts before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "B20A"
        }
      ]
    },
    {
      "id": "B20A",
      "turn": 20,
      "title": "The Coppice Court - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Duke Aldric holds court beneath the oaks while the hart watches from distant bracken.",
        "You pause only long enough to read the danger correctly. Elian, Sella, Bren, and the kennel boy are ready to testify; Calder still argues that disorder justified his grant.",
        "The clearer position reveals the stakes: The final account must show that the disorder was not merely useful to Calder but deliberately made by him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Aldric to suspend the grant and investigate each charge separately.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Offer Calder exile if he signs the coppices over to the tenants.",
          "failTitle": "A Bargain Without Truth",
          "failText": "Calder signs, then claims coercion; the tenants keep uncertain rights and the makers of the violence remain unjudged.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Link collar, horn book, disguises, contracts, and witnesses in one ordered case.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "B20B",
      "turn": 20,
      "title": "The Coppice Court - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Duke Aldric holds court beneath the oaks while the hart watches from distant bracken.",
        "A sober exchange of evidence keeps the group from dividing. Elian, Sella, Bren, and the kennel boy are ready to testify; Calder still argues that disorder justified his grant.",
        "The evidence now defines the danger: The final account must show that the disorder was not merely useful to Calder but deliberately made by him."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Offer Calder exile if he signs the coppices over to the tenants while keeping Elian Voss informed.",
          "failTitle": "A Bargain Without Truth",
          "failText": "Calder signs, then claims coercion; the tenants keep uncertain rights and the makers of the violence remain unjudged.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Link collar, horn book, disguises, contracts, and witnesses in one ordered case while keeping Elian Voss informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Aldric to suspend the grant and investigate each charge separately while keeping Elian Voss informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "B20C",
      "turn": 20,
      "title": "The Coppice Court - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Duke Aldric holds court beneath the oaks while the hart watches from distant bracken.",
        "You make up lost ground with a directness that warns everyone nearby. Elian, Sella, Bren, and the kennel boy are ready to testify; Calder still argues that disorder justified his grant.",
        "Delay has sharpened the danger: The final account must show that the disorder was not merely useful to Calder but deliberately made by him."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Link collar, horn book, disguises, contracts, and witnesses in one ordered case before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Aldric to suspend the grant and investigate each charge separately before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Offer Calder exile if he signs the coppices over to the tenants before the remaining light fails.",
          "failTitle": "A Bargain Without Truth",
          "failText": "Calder signs, then claims coercion; the tenants keep uncertain rights and the makers of the violence remain unjudged.",
          "death": false
        }
      ]
    }
  ]
});
