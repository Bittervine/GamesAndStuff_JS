window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-glass-wolves",
  "title": "The Glass Wolves",
  "summary": "Great shining wolves appear around the upland folds without leaving true tracks. The ranger and shepherd Lysa Rowe discover men using mirrored hides, false paws, and herding whistles to frighten Brackenwald's finest flocks into a hidden sale.",
  "maxTurns": 20,
  "startNodeId": "G01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The gathered flocks return under their own bells, Corvin Bale's contracts expose the planned sale, and the glass wolves are displayed as the simple frames they always were. Lysa Rowe becomes warden of the upper folds, where moonlight troubles no shepherd again.",
    "low": "The great drive is broken and most sheep are recovered, but Corvin's buyer slips away with part of the account. Shepherds keep armed night watches until every false paw and hidden gate has been found."
  },
  "nodes": [
    {
      "id": "G01A",
      "turn": 1,
      "title": "Eyes on the Down - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into the moonlit sheep downs above the Riverland as shepherds report wolves tall as horses flashing like ice around their folds, though no true pawprints remain by dawn.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Lysa Rowe shows you a fence polished smooth where frightened sheep pressed past it and a sliver of bright mica in the turf.",
        "The clearer position reveals the stakes: Something made the flock flee, but the supposed beasts left the marks of handled material rather than living feet."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the mica and the flock's direction of flight.",
          "scoreDelta": 1,
          "nextNodeId": "G02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch the fold through the next moonrise with Lysa.",
          "scoreDelta": 0,
          "nextNodeId": "G02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Lead hounds over the ridge to hunt the monsters.",
          "failTitle": "Hounds after Shadows",
          "failText": "The dogs chase reflected light into broken ground, scattering the remaining flock and injuring themselves.",
          "death": false
        }
      ]
    },
    {
      "id": "G01B",
      "turn": 1,
      "title": "Eyes on the Down - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: shepherds report wolves tall as horses flashing like ice around their folds, though no true pawprints remain by dawn.",
        "With Thorne close and local witnesses beside you, you compare every account. Lysa Rowe shows you a fence polished smooth where frightened sheep pressed past it and a sliver of bright mica in the turf.",
        "The evidence now defines the danger: Something made the flock flee, but the supposed beasts left the marks of handled material rather than living feet."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch the fold through the next moonrise with Lysa while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Lead hounds over the ridge to hunt the monsters while keeping Lysa Rowe informed.",
          "failTitle": "Hounds after Shadows",
          "failText": "The dogs chase reflected light into broken ground, scattering the remaining flock and injuring themselves.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the mica and the flock's direction of flight while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G02B"
        }
      ]
    },
    {
      "id": "G01C",
      "turn": 1,
      "title": "Eyes on the Down - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, shepherds report wolves tall as horses flashing like ice around their folds, though no true pawprints remain by dawn.",
        "Working against the light, you test the few signs that remain. Lysa Rowe shows you a fence polished smooth where frightened sheep pressed past it and a sliver of bright mica in the turf.",
        "Delay has sharpened the danger: Something made the flock flee, but the supposed beasts left the marks of handled material rather than living feet."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Lead hounds over the ridge to hunt the monsters before the remaining light fails.",
          "failTitle": "Hounds after Shadows",
          "failText": "The dogs chase reflected light into broken ground, scattering the remaining flock and injuring themselves.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the mica and the flock's direction of flight before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch the fold through the next moonrise with Lysa before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G02A"
        }
      ]
    },
    {
      "id": "G02A",
      "turn": 2,
      "title": "The False Paw - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. A broad wolf print appears in soft mud beneath a gate that no animal crossed.",
        "You circle downwind and let small marks tell their order. Its claws repeat at identical angles, and a straight heel edge lies beneath the padded shape.",
        "The clearer position reveals the stakes: A person wearing carved paws planted the track after the frightened sheep had already gone."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Measure the trail before rain reaches it.",
          "scoreDelta": 0,
          "nextNodeId": "G03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the prints at a run without checking the wind.",
          "failTitle": "The Trackmaker Waiting",
          "failText": "The false trail leads beneath a weighted net, leaving the real herd route unguarded.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cast the print in damp clay and search for the human stride.",
          "scoreDelta": 1,
          "nextNodeId": "G03A"
        }
      ]
    },
    {
      "id": "G02B",
      "turn": 2,
      "title": "The False Paw - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. A broad wolf print appears in soft mud beneath a gate that no animal crossed.",
        "You ask plain questions and watch which answers agree. Its claws repeat at identical angles, and a straight heel edge lies beneath the padded shape.",
        "The evidence now defines the danger: A person wearing carved paws planted the track after the frightened sheep had already gone."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the prints at a run without checking the wind while keeping Lysa Rowe informed.",
          "failTitle": "The Trackmaker Waiting",
          "failText": "The false trail leads beneath a weighted net, leaving the real herd route unguarded.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cast the print in damp clay and search for the human stride while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Measure the trail before rain reaches it while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G03C"
        }
      ]
    },
    {
      "id": "G02C",
      "turn": 2,
      "title": "The False Paw - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. A broad wolf print appears in soft mud beneath a gate that no animal crossed.",
        "There is no time for elegance, only for separating fresh danger from old damage. Its claws repeat at identical angles, and a straight heel edge lies beneath the padded shape.",
        "Delay has sharpened the danger: A person wearing carved paws planted the track after the frightened sheep had already gone."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cast the print in damp clay and search for the human stride before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Measure the trail before rain reaches it before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the prints at a run without checking the wind before the remaining light fails.",
          "failTitle": "The Trackmaker Waiting",
          "failText": "The false trail leads beneath a weighted net, leaving the real herd route unguarded.",
          "death": false
        }
      ]
    },
    {
      "id": "G03A",
      "turn": 3,
      "title": "Whistles in the Grass - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Lysa finds a bone whistle hidden inside a boundary cairn.",
        "From sheltered ground, you measure tracks, tools, and distances. Its high note makes nearby sheep turn sharply toward the eastern slope, a response learned from feeding calls.",
        "The clearer position reveals the stakes: The thieves have trained or tested the flocks before staging their shining wolves."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Blow the whistle repeatedly to summon the missing flock.",
          "failTitle": "The Wrong Ears Answer",
          "failText": "Hidden drivers hear the signal, change their route, and leave decoy bells moving in the dark.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cover the whistle holes and preserve the grease on it.",
          "scoreDelta": 1,
          "nextNodeId": "G04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask every shepherd who uses that feeding pattern.",
          "scoreDelta": 0,
          "nextNodeId": "G04B"
        }
      ]
    },
    {
      "id": "G03B",
      "turn": 3,
      "title": "Whistles in the Grass - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Lysa finds a bone whistle hidden inside a boundary cairn.",
        "You keep the scene orderly while your allies search it piece by piece. Its high note makes nearby sheep turn sharply toward the eastern slope, a response learned from feeding calls.",
        "The evidence now defines the danger: The thieves have trained or tested the flocks before staging their shining wolves."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cover the whistle holes and preserve the grease on it while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask every shepherd who uses that feeding pattern while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Blow the whistle repeatedly to summon the missing flock while keeping Lysa Rowe informed.",
          "failTitle": "The Wrong Ears Answer",
          "failText": "Hidden drivers hear the signal, change their route, and leave decoy bells moving in the dark.",
          "death": false
        }
      ]
    },
    {
      "id": "G03C",
      "turn": 3,
      "title": "Whistles in the Grass - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Lysa finds a bone whistle hidden inside a boundary cairn.",
        "Pressed for time, you trust hard evidence and discard rumor. Its high note makes nearby sheep turn sharply toward the eastern slope, a response learned from feeding calls.",
        "Delay has sharpened the danger: The thieves have trained or tested the flocks before staging their shining wolves."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask every shepherd who uses that feeding pattern before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Blow the whistle repeatedly to summon the missing flock before the remaining light fails.",
          "failTitle": "The Wrong Ears Answer",
          "failText": "Hidden drivers hear the signal, change their route, and leave decoy bells moving in the dark.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cover the whistle holes and preserve the grease on it before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G04C"
        }
      ]
    },
    {
      "id": "G04A",
      "turn": 4,
      "title": "A Ram Without a Bell - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. A valuable breeding ram returns alone with its bell strap neatly cut.",
        "You move quietly enough to hear work and voices ahead. Bright flakes cling to its wool, and its hooves carry red soil found only below the abandoned glass pits.",
        "The clearer position reveals the stakes: The missing animals are being held rather than killed, somewhere ordinary shepherds avoid after dark."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the red soil transfer from shaded ground.",
          "scoreDelta": 1,
          "nextNodeId": "G05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead the ram toward the pits and observe its choices.",
          "scoreDelta": 0,
          "nextNodeId": "G05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tie a new bell on the ram and release it openly.",
          "failTitle": "A Bell for the Thieves",
          "failText": "The sound leads Corvin's men straight to the recovered animal and reveals your approach.",
          "death": false
        }
      ]
    },
    {
      "id": "G04B",
      "turn": 4,
      "title": "A Ram Without a Bell - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. A valuable breeding ram returns alone with its bell strap neatly cut.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Bright flakes cling to its wool, and its hooves carry red soil found only below the abandoned glass pits.",
        "The evidence now defines the danger: The missing animals are being held rather than killed, somewhere ordinary shepherds avoid after dark."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead the ram toward the pits and observe its choices while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tie a new bell on the ram and release it openly while keeping Lysa Rowe informed.",
          "failTitle": "A Bell for the Thieves",
          "failText": "The sound leads Corvin's men straight to the recovered animal and reveals your approach.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the red soil transfer from shaded ground while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G05B"
        }
      ]
    },
    {
      "id": "G04C",
      "turn": 4,
      "title": "A Ram Without a Bell - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. A valuable breeding ram returns alone with its bell strap neatly cut.",
        "You push through fatigue, knowing the next mistake may close the road. Bright flakes cling to its wool, and its hooves carry red soil found only below the abandoned glass pits.",
        "Delay has sharpened the danger: The missing animals are being held rather than killed, somewhere ordinary shepherds avoid after dark."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tie a new bell on the ram and release it openly before the remaining light fails.",
          "failTitle": "A Bell for the Thieves",
          "failText": "The sound leads Corvin's men straight to the recovered animal and reveals your approach.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the red soil transfer from shaded ground before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead the ram toward the pits and observe its choices before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G05A"
        }
      ]
    },
    {
      "id": "G05A",
      "turn": 5,
      "title": "The Glass Pit Frames - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. The abandoned pits contain willow frames shaped like lean wolves.",
        "A ranger's eye finds the human habit behind the apparent mystery. Mica scales and polished tin scraps are stitched to gray hides, while handles let crouching men carry them.",
        "The clearer position reveals the stakes: Moonlight and lantern light turn crude devices into moving shapes at a distance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hide nearby and wait for the carriers.",
          "scoreDelta": 0,
          "nextNodeId": "G06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break every frame across the pit edge.",
          "failTitle": "The Pack Warned",
          "failText": "Splintered frames tell the absent drivers that their hiding place is known before they return.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record how each frame is built and which paths its feet fit.",
          "scoreDelta": 1,
          "nextNodeId": "G06A"
        }
      ]
    },
    {
      "id": "G05B",
      "turn": 5,
      "title": "The Glass Pit Frames - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. The abandoned pits contain willow frames shaped like lean wolves.",
        "Together, the small company builds one reliable account from scattered facts. Mica scales and polished tin scraps are stitched to gray hides, while handles let crouching men carry them.",
        "The evidence now defines the danger: Moonlight and lantern light turn crude devices into moving shapes at a distance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break every frame across the pit edge while keeping Lysa Rowe informed.",
          "failTitle": "The Pack Warned",
          "failText": "Splintered frames tell the absent drivers that their hiding place is known before they return.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record how each frame is built and which paths its feet fit while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hide nearby and wait for the carriers while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G06C"
        }
      ]
    },
    {
      "id": "G05C",
      "turn": 5,
      "title": "The Glass Pit Frames - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. The abandoned pits contain willow frames shaped like lean wolves.",
        "You take the shortest safe route and accept that concealment is nearly gone. Mica scales and polished tin scraps are stitched to gray hides, while handles let crouching men carry them.",
        "Delay has sharpened the danger: Moonlight and lantern light turn crude devices into moving shapes at a distance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Record how each frame is built and which paths its feet fit before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hide nearby and wait for the carriers before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break every frame across the pit edge before the remaining light fails.",
          "failTitle": "The Pack Warned",
          "failText": "Splintered frames tell the absent drivers that their hiding place is known before they return.",
          "death": false
        }
      ]
    },
    {
      "id": "G06A",
      "turn": 6,
      "title": "Corvin Bale's Offer - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Wool factor Corvin Bale arrives claiming he searched the pits after losing sheep of his own.",
        "You preserve the most fragile sign before turning to the larger scene. He offers to buy frightened shepherds' remaining flocks at half value and move them to safe lowland pasture.",
        "The clearer position reveals the stakes: The apparitions make his offer profitable, but profit alone does not yet prove he built them."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Corvin and seize his money chest.",
          "failTitle": "A Merchant Wronged Too Soon",
          "failText": "Corvin calls on lawful drovers to defend him and sends a quiet rider toward the hidden flock.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare his purchase dates with the first sightings.",
          "scoreDelta": 1,
          "nextNodeId": "G07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Lysa hear his terms before answering.",
          "scoreDelta": 0,
          "nextNodeId": "G07B"
        }
      ]
    },
    {
      "id": "G06B",
      "turn": 6,
      "title": "Corvin Bale's Offer - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Wool factor Corvin Bale arrives claiming he searched the pits after losing sheep of his own.",
        "Each person is given one task, and confusion begins to clear. He offers to buy frightened shepherds' remaining flocks at half value and move them to safe lowland pasture.",
        "The evidence now defines the danger: The apparitions make his offer profitable, but profit alone does not yet prove he built them."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare his purchase dates with the first sightings while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Lysa hear his terms before answering while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Corvin and seize his money chest while keeping Lysa Rowe informed.",
          "failTitle": "A Merchant Wronged Too Soon",
          "failText": "Corvin calls on lawful drovers to defend him and sends a quiet rider toward the hidden flock.",
          "death": false
        }
      ]
    },
    {
      "id": "G06C",
      "turn": 6,
      "title": "Corvin Bale's Offer - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Wool factor Corvin Bale arrives claiming he searched the pits after losing sheep of his own.",
        "The enemy has the lead, so you judge every pause against the lives at risk. He offers to buy frightened shepherds' remaining flocks at half value and move them to safe lowland pasture.",
        "Delay has sharpened the danger: The apparitions make his offer profitable, but profit alone does not yet prove he built them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Lysa hear his terms before answering before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Corvin and seize his money chest before the remaining light fails.",
          "failTitle": "A Merchant Wronged Too Soon",
          "failText": "Corvin calls on lawful drovers to defend him and sends a quiet rider toward the hidden flock.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare his purchase dates with the first sightings before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G07C"
        }
      ]
    },
    {
      "id": "G07A",
      "turn": 7,
      "title": "The Drover's Knot - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Rope on a glass-wolf handle bears the reverse knot used by Corvin's contract drovers.",
        "You watch before acting and learn who believes themselves unobserved. A smear of sheep salve contains blue herb grown at his lower pasture.",
        "The clearer position reveals the stakes: The frames and the offered refuge now share materials controlled by the same factor."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal rope and salve separately before showing Corvin.",
          "scoreDelta": 1,
          "nextNodeId": "G08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question his drovers away from their master.",
          "scoreDelta": 0,
          "nextNodeId": "G08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Whip the nearest drover until he confesses.",
          "failTitle": "Fear Instead of Proof",
          "failText": "The beaten man says whatever ends the pain, while willing conspirators ride away with the flocks.",
          "death": false
        }
      ]
    },
    {
      "id": "G07B",
      "turn": 7,
      "title": "The Drover's Knot - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Rope on a glass-wolf handle bears the reverse knot used by Corvin's contract drovers.",
        "By keeping tempers cool, you hold the inquiry on facts. A smear of sheep salve contains blue herb grown at his lower pasture.",
        "The evidence now defines the danger: The frames and the offered refuge now share materials controlled by the same factor."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question his drovers away from their master while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Whip the nearest drover until he confesses while keeping Lysa Rowe informed.",
          "failTitle": "Fear Instead of Proof",
          "failText": "The beaten man says whatever ends the pain, while willing conspirators ride away with the flocks.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal rope and salve separately before showing Corvin while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G08B"
        }
      ]
    },
    {
      "id": "G07C",
      "turn": 7,
      "title": "The Drover's Knot - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Rope on a glass-wolf handle bears the reverse knot used by Corvin's contract drovers.",
        "The narrow margin leaves no room to chase every possibility. A smear of sheep salve contains blue herb grown at his lower pasture.",
        "Delay has sharpened the danger: The frames and the offered refuge now share materials controlled by the same factor."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Whip the nearest drover until he confesses before the remaining light fails.",
          "failTitle": "Fear Instead of Proof",
          "failText": "The beaten man says whatever ends the pain, while willing conspirators ride away with the flocks.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal rope and salve separately before showing Corvin before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question his drovers away from their master before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G08A"
        }
      ]
    },
    {
      "id": "G08A",
      "turn": 8,
      "title": "Bells Beneath the Hill - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Muffled bells sound under turf beside the glass pits.",
        "You use ground, wind, and cover to approach on your own terms. A covered trench leads to a sunken fold where dozens of stolen sheep stand with bells packed in wool.",
        "The clearer position reveals the stakes: The first missing flocks have been gathered into a concealed herd ready for movement."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Lysa for shepherds to identify their stock.",
          "scoreDelta": 0,
          "nextNodeId": "G09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull away the turf cover and call the sheep out.",
          "failTitle": "The Hidden Flock Bolts",
          "failText": "Sudden light and noise drive the packed animals through the guards' prepared eastern gate.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count animals and locate every guard before opening the fold.",
          "scoreDelta": 1,
          "nextNodeId": "G09A"
        }
      ]
    },
    {
      "id": "G08B",
      "turn": 8,
      "title": "Bells Beneath the Hill - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Muffled bells sound under turf beside the glass pits.",
        "Your allies close the easy exits while you examine the heart of the scene. A covered trench leads to a sunken fold where dozens of stolen sheep stand with bells packed in wool.",
        "The evidence now defines the danger: The first missing flocks have been gathered into a concealed herd ready for movement."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull away the turf cover and call the sheep out while keeping Lysa Rowe informed.",
          "failTitle": "The Hidden Flock Bolts",
          "failText": "Sudden light and noise drive the packed animals through the guards' prepared eastern gate.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count animals and locate every guard before opening the fold while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Lysa for shepherds to identify their stock while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G09C"
        }
      ]
    },
    {
      "id": "G08C",
      "turn": 8,
      "title": "Bells Beneath the Hill - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Muffled bells sound under turf beside the glass pits.",
        "You arrive openly and must turn speed into its own kind of protection. A covered trench leads to a sunken fold where dozens of stolen sheep stand with bells packed in wool.",
        "Delay has sharpened the danger: The first missing flocks have been gathered into a concealed herd ready for movement."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Count animals and locate every guard before opening the fold before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Lysa for shepherds to identify their stock before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull away the turf cover and call the sheep out before the remaining light fails.",
          "failTitle": "The Hidden Flock Bolts",
          "failText": "Sudden light and noise drive the packed animals through the guards' prepared eastern gate.",
          "death": true
        }
      ]
    },
    {
      "id": "G09A",
      "turn": 9,
      "title": "The Shepherd in the Trench - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. An injured shepherd named Olan lies bound beyond the sunken fold.",
        "The cleanest clue survives because you handled it with care. He saw Corvin inspecting the frames and heard mention of a buyer arriving at the moon gathering.",
        "The clearer position reveals the stakes: Olan's account names the organizer but also reveals a larger theft still planned."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Force Olan onto his feet to guide the pursuit.",
          "failTitle": "A Witness Lost on the Down",
          "failText": "The injured man collapses in cold rain and cannot reach safety or repeat what he heard.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Treat his leg and record the buyer's phrase exactly.",
          "scoreDelta": 1,
          "nextNodeId": "G10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry Olan to safety while Lysa watches the fold.",
          "scoreDelta": 0,
          "nextNodeId": "G10B"
        }
      ]
    },
    {
      "id": "G09B",
      "turn": 9,
      "title": "The Shepherd in the Trench - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. An injured shepherd named Olan lies bound beyond the sunken fold.",
        "The shared search reveals details no single witness had understood. He saw Corvin inspecting the frames and heard mention of a buyer arriving at the moon gathering.",
        "The evidence now defines the danger: Olan's account names the organizer but also reveals a larger theft still planned."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Treat his leg and record the buyer's phrase exactly while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry Olan to safety while Lysa watches the fold while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force Olan onto his feet to guide the pursuit while keeping Lysa Rowe informed.",
          "failTitle": "A Witness Lost on the Down",
          "failText": "The injured man collapses in cold rain and cannot reach safety or repeat what he heard.",
          "death": true
        }
      ]
    },
    {
      "id": "G09C",
      "turn": 9,
      "title": "The Shepherd in the Trench - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. An injured shepherd named Olan lies bound beyond the sunken fold.",
        "What remains is enough, provided you act before it is moved. He saw Corvin inspecting the frames and heard mention of a buyer arriving at the moon gathering.",
        "Delay has sharpened the danger: Olan's account names the organizer but also reveals a larger theft still planned."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry Olan to safety while Lysa watches the fold before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force Olan onto his feet to guide the pursuit before the remaining light fails.",
          "failTitle": "A Witness Lost on the Down",
          "failText": "The injured man collapses in cold rain and cannot reach safety or repeat what he heard.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Treat his leg and record the buyer's phrase exactly before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G10C"
        }
      ]
    },
    {
      "id": "G10A",
      "turn": 10,
      "title": "The Moon Gathering - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Lysa explains that every upland flock enters Star Bowl for counting at the next full moon.",
        "You pause only long enough to read the danger correctly. Hidden gates around the bowl have been repaired with fresh timber, all opening toward Corvin's lower valley.",
        "The clearer position reveals the stakes: The stolen folds were rehearsals for driving nearly every sheep in northern Brackenwald at once."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Map the altered gates and leave them apparently untouched.",
          "scoreDelta": 1,
          "nextNodeId": "G11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn head shepherds privately before the gathering.",
          "scoreDelta": 0,
          "nextNodeId": "G11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cancel the gathering with a public alarm.",
          "failTitle": "The Plan Moves Early",
          "failText": "Corvin begins the drive that night while scattered shepherds struggle to find their own flocks.",
          "death": false
        }
      ]
    },
    {
      "id": "G10B",
      "turn": 10,
      "title": "The Moon Gathering - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Lysa explains that every upland flock enters Star Bowl for counting at the next full moon.",
        "A sober exchange of evidence keeps the group from dividing. Hidden gates around the bowl have been repaired with fresh timber, all opening toward Corvin's lower valley.",
        "The evidence now defines the danger: The stolen folds were rehearsals for driving nearly every sheep in northern Brackenwald at once."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn head shepherds privately before the gathering while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cancel the gathering with a public alarm while keeping Lysa Rowe informed.",
          "failTitle": "The Plan Moves Early",
          "failText": "Corvin begins the drive that night while scattered shepherds struggle to find their own flocks.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Map the altered gates and leave them apparently untouched while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G11B"
        }
      ]
    },
    {
      "id": "G10C",
      "turn": 10,
      "title": "The Moon Gathering - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Lysa explains that every upland flock enters Star Bowl for counting at the next full moon.",
        "You make up lost ground with a directness that warns everyone nearby. Hidden gates around the bowl have been repaired with fresh timber, all opening toward Corvin's lower valley.",
        "Delay has sharpened the danger: The stolen folds were rehearsals for driving nearly every sheep in northern Brackenwald at once."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cancel the gathering with a public alarm before the remaining light fails.",
          "failTitle": "The Plan Moves Early",
          "failText": "Corvin begins the drive that night while scattered shepherds struggle to find their own flocks.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Map the altered gates and leave them apparently untouched before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn head shepherds privately before the gathering before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G11A"
        }
      ]
    },
    {
      "id": "G11A",
      "turn": 11,
      "title": "The Lantern Cart - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. Wheel marks from the pits lead to a covered cart holding shielded lanterns.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Narrow shutters cast moving bars of light across mica frames, making them flash from far beyond bow range.",
        "The clearer position reveals the stakes: The spectacle requires a lighting crew positioned above Star Bowl at the moment of panic."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Confiscate the cart under the reeve's seal.",
          "scoreDelta": 0,
          "nextNodeId": "G12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light every lantern to test the effect.",
          "failTitle": "The Wolves Rise at Noon",
          "failText": "Reflections announce the discovery across the downs and send Corvin's scouts to replace the equipment.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark each lantern position from Corvin's route notes.",
          "scoreDelta": 1,
          "nextNodeId": "G12A"
        }
      ]
    },
    {
      "id": "G11B",
      "turn": 11,
      "title": "The Lantern Cart - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. Wheel marks from the pits lead to a covered cart holding shielded lanterns.",
        "With Thorne close and local witnesses beside you, you compare every account. Narrow shutters cast moving bars of light across mica frames, making them flash from far beyond bow range.",
        "The evidence now defines the danger: The spectacle requires a lighting crew positioned above Star Bowl at the moment of panic."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Light every lantern to test the effect while keeping Lysa Rowe informed.",
          "failTitle": "The Wolves Rise at Noon",
          "failText": "Reflections announce the discovery across the downs and send Corvin's scouts to replace the equipment.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark each lantern position from Corvin's route notes while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Confiscate the cart under the reeve's seal while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G12C"
        }
      ]
    },
    {
      "id": "G11C",
      "turn": 11,
      "title": "The Lantern Cart - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. Wheel marks from the pits lead to a covered cart holding shielded lanterns.",
        "Working against the light, you test the few signs that remain. Narrow shutters cast moving bars of light across mica frames, making them flash from far beyond bow range.",
        "Delay has sharpened the danger: The spectacle requires a lighting crew positioned above Star Bowl at the moment of panic."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark each lantern position from Corvin's route notes before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Confiscate the cart under the reeve's seal before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light every lantern to test the effect before the remaining light fails.",
          "failTitle": "The Wolves Rise at Noon",
          "failText": "Reflections announce the discovery across the downs and send Corvin's scouts to replace the equipment.",
          "death": false
        }
      ]
    },
    {
      "id": "G12A",
      "turn": 12,
      "title": "Lysa's Old Debt - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. Corvin produces a loan note showing Lysa pledged part of her flock after a hard winter.",
        "You circle downwind and let small marks tell their order. She admits the debt but says he offered forgiveness if she abandoned the upper folds.",
        "The clearer position reveals the stakes: He intends to discredit the one shepherd capable of organizing resistance to the drive."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove Lysa from the gathering as compromised.",
          "failTitle": "The Downs Lose Their Voice",
          "failText": "Without Lysa, rival shepherds argue over routes while Corvin's trained whistles control their animals.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the note's terms with Corvin's later purchase offers.",
          "scoreDelta": 1,
          "nextNodeId": "G13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Lysa in the plan while the reeve reviews the debt.",
          "scoreDelta": 0,
          "nextNodeId": "G13B"
        }
      ]
    },
    {
      "id": "G12B",
      "turn": 12,
      "title": "Lysa's Old Debt - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. Corvin produces a loan note showing Lysa pledged part of her flock after a hard winter.",
        "You ask plain questions and watch which answers agree. She admits the debt but says he offered forgiveness if she abandoned the upper folds.",
        "The evidence now defines the danger: He intends to discredit the one shepherd capable of organizing resistance to the drive."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the note's terms with Corvin's later purchase offers while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Lysa in the plan while the reeve reviews the debt while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove Lysa from the gathering as compromised while keeping Lysa Rowe informed.",
          "failTitle": "The Downs Lose Their Voice",
          "failText": "Without Lysa, rival shepherds argue over routes while Corvin's trained whistles control their animals.",
          "death": false
        }
      ]
    },
    {
      "id": "G12C",
      "turn": 12,
      "title": "Lysa's Old Debt - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. Corvin produces a loan note showing Lysa pledged part of her flock after a hard winter.",
        "There is no time for elegance, only for separating fresh danger from old damage. She admits the debt but says he offered forgiveness if she abandoned the upper folds.",
        "Delay has sharpened the danger: He intends to discredit the one shepherd capable of organizing resistance to the drive."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Lysa in the plan while the reeve reviews the debt before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove Lysa from the gathering as compromised before the remaining light fails.",
          "failTitle": "The Downs Lose Their Voice",
          "failText": "Without Lysa, rival shepherds argue over routes while Corvin's trained whistles control their animals.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the note's terms with Corvin's later purchase offers before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G13C"
        }
      ]
    },
    {
      "id": "G13A",
      "turn": 13,
      "title": "The Buyer at Red Cairn - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. A richly saddled rider meets Corvin's foreman at a distant cairn.",
        "From sheltered ground, you measure tracks, tools, and distances. They exchange a tally naming hundreds of sheep as storm salvage rather than purchases.",
        "The clearer position reveals the stakes: The buyer expects lawful-looking possession after the false wolves scatter owners and bells."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Copy the tally marks from concealment and follow the rider's heraldry.",
          "scoreDelta": 1,
          "nextNodeId": "G14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Detain the foreman after the buyer departs.",
          "scoreDelta": 0,
          "nextNodeId": "G14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot the tally from the foreman's hand.",
          "failTitle": "Paper on the Wind",
          "failText": "The arrow tears the tally loose, and mountain gusts carry the pieces across miles of heather.",
          "death": false
        }
      ]
    },
    {
      "id": "G13B",
      "turn": 13,
      "title": "The Buyer at Red Cairn - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. A richly saddled rider meets Corvin's foreman at a distant cairn.",
        "You keep the scene orderly while your allies search it piece by piece. They exchange a tally naming hundreds of sheep as storm salvage rather than purchases.",
        "The evidence now defines the danger: The buyer expects lawful-looking possession after the false wolves scatter owners and bells."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Detain the foreman after the buyer departs while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot the tally from the foreman's hand while keeping Lysa Rowe informed.",
          "failTitle": "Paper on the Wind",
          "failText": "The arrow tears the tally loose, and mountain gusts carry the pieces across miles of heather.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the tally marks from concealment and follow the rider's heraldry while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G14B"
        }
      ]
    },
    {
      "id": "G13C",
      "turn": 13,
      "title": "The Buyer at Red Cairn - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. A richly saddled rider meets Corvin's foreman at a distant cairn.",
        "Pressed for time, you trust hard evidence and discard rumor. They exchange a tally naming hundreds of sheep as storm salvage rather than purchases.",
        "Delay has sharpened the danger: The buyer expects lawful-looking possession after the false wolves scatter owners and bells."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot the tally from the foreman's hand before the remaining light fails.",
          "failTitle": "Paper on the Wind",
          "failText": "The arrow tears the tally loose, and mountain gusts carry the pieces across miles of heather.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the tally marks from concealment and follow the rider's heraldry before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Detain the foreman after the buyer departs before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G14A"
        }
      ]
    },
    {
      "id": "G14A",
      "turn": 14,
      "title": "Frames Above Star Bowl - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Glass-wolf carriers take positions on three ridges as the gathering begins.",
        "You move quietly enough to hear work and voices ahead. Sheep below already lean away from the high whistles, while lantern crews wait behind screens.",
        "The clearer position reveals the stakes: The illusion needs only one moment of shared fear to become an unstoppable living flood."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send shepherds quietly toward each lantern screen.",
          "scoreDelta": 0,
          "nextNodeId": "G15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order every archer to shoot the shining wolves.",
          "failTitle": "Arrows into Men",
          "failText": "The reflections hide human bodies; several carriers fall, and panic begins before the gates are secured.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Silence the central whistle and turn its trained call toward the safe gate.",
          "scoreDelta": 1,
          "nextNodeId": "G15A"
        }
      ]
    },
    {
      "id": "G14B",
      "turn": 14,
      "title": "Frames Above Star Bowl - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Glass-wolf carriers take positions on three ridges as the gathering begins.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Sheep below already lean away from the high whistles, while lantern crews wait behind screens.",
        "The evidence now defines the danger: The illusion needs only one moment of shared fear to become an unstoppable living flood."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Order every archer to shoot the shining wolves while keeping Lysa Rowe informed.",
          "failTitle": "Arrows into Men",
          "failText": "The reflections hide human bodies; several carriers fall, and panic begins before the gates are secured.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Silence the central whistle and turn its trained call toward the safe gate while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send shepherds quietly toward each lantern screen while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G15C"
        }
      ]
    },
    {
      "id": "G14C",
      "turn": 14,
      "title": "Frames Above Star Bowl - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Glass-wolf carriers take positions on three ridges as the gathering begins.",
        "You push through fatigue, knowing the next mistake may close the road. Sheep below already lean away from the high whistles, while lantern crews wait behind screens.",
        "Delay has sharpened the danger: The illusion needs only one moment of shared fear to become an unstoppable living flood."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Silence the central whistle and turn its trained call toward the safe gate before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send shepherds quietly toward each lantern screen before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order every archer to shoot the shining wolves before the remaining light fails.",
          "failTitle": "Arrows into Men",
          "failText": "The reflections hide human bodies; several carriers fall, and panic begins before the gates are secured.",
          "death": true
        }
      ]
    },
    {
      "id": "G15A",
      "turn": 15,
      "title": "The First Surge - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. One frame slips, flashing sudden light across the packed flocks.",
        "A ranger's eye finds the human habit behind the apparent mystery. The front ranks press toward Corvin's repaired gate while lambs and fallen shepherds crowd the ground.",
        "The clearer position reveals the stakes: Stopping the surge requires changing the animals' direction without adding greater fear."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne into the flock to force it back.",
          "failTitle": "Horse in the Crush",
          "failText": "Thorne's presence deepens the panic, and animals and people fall against the closed rails.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the recovered feeding whistle and open the broad western gate.",
          "scoreDelta": 1,
          "nextNodeId": "G16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Lysa lead the bellwethers against the flow.",
          "scoreDelta": 0,
          "nextNodeId": "G16B"
        }
      ]
    },
    {
      "id": "G15B",
      "turn": 15,
      "title": "The First Surge - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. One frame slips, flashing sudden light across the packed flocks.",
        "Together, the small company builds one reliable account from scattered facts. The front ranks press toward Corvin's repaired gate while lambs and fallen shepherds crowd the ground.",
        "The evidence now defines the danger: Stopping the surge requires changing the animals' direction without adding greater fear."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the recovered feeding whistle and open the broad western gate while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Lysa lead the bellwethers against the flow while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne into the flock to force it back while keeping Lysa Rowe informed.",
          "failTitle": "Horse in the Crush",
          "failText": "Thorne's presence deepens the panic, and animals and people fall against the closed rails.",
          "death": true
        }
      ]
    },
    {
      "id": "G15C",
      "turn": 15,
      "title": "The First Surge - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. One frame slips, flashing sudden light across the packed flocks.",
        "You take the shortest safe route and accept that concealment is nearly gone. The front ranks press toward Corvin's repaired gate while lambs and fallen shepherds crowd the ground.",
        "Delay has sharpened the danger: Stopping the surge requires changing the animals' direction without adding greater fear."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Lysa lead the bellwethers against the flow before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne into the flock to force it back before the remaining light fails.",
          "failTitle": "Horse in the Crush",
          "failText": "Thorne's presence deepens the panic, and animals and people fall against the closed rails.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the recovered feeding whistle and open the broad western gate before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G16C"
        }
      ]
    },
    {
      "id": "G16A",
      "turn": 16,
      "title": "The Lower Funnel - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Corvin's men receive the diverted flock in a long fenced lane below Star Bowl.",
        "You preserve the most fragile sign before turning to the larger scene. False ownership cords wait at the far end, and drovers cut original bells as sheep pass.",
        "The clearer position reveals the stakes: The entire operation is arranged to erase identity during movement, not after sale."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Block the far gate and preserve baskets of cut bells.",
          "scoreDelta": 1,
          "nextNodeId": "G17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seize the cord tables while Lysa holds the flock.",
          "scoreDelta": 0,
          "nextNodeId": "G17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the funnel fences to free the sheep.",
          "failTitle": "Fire Beside the Herd",
          "failText": "Smoke turns control into terror, scattering marked and unmarked animals across the night downs.",
          "death": true
        }
      ]
    },
    {
      "id": "G16B",
      "turn": 16,
      "title": "The Lower Funnel - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Corvin's men receive the diverted flock in a long fenced lane below Star Bowl.",
        "Each person is given one task, and confusion begins to clear. False ownership cords wait at the far end, and drovers cut original bells as sheep pass.",
        "The evidence now defines the danger: The entire operation is arranged to erase identity during movement, not after sale."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Seize the cord tables while Lysa holds the flock while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the funnel fences to free the sheep while keeping Lysa Rowe informed.",
          "failTitle": "Fire Beside the Herd",
          "failText": "Smoke turns control into terror, scattering marked and unmarked animals across the night downs.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Block the far gate and preserve baskets of cut bells while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G17B"
        }
      ]
    },
    {
      "id": "G16C",
      "turn": 16,
      "title": "The Lower Funnel - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Corvin's men receive the diverted flock in a long fenced lane below Star Bowl.",
        "The enemy has the lead, so you judge every pause against the lives at risk. False ownership cords wait at the far end, and drovers cut original bells as sheep pass.",
        "Delay has sharpened the danger: The entire operation is arranged to erase identity during movement, not after sale."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the funnel fences to free the sheep before the remaining light fails.",
          "failTitle": "Fire Beside the Herd",
          "failText": "Smoke turns control into terror, scattering marked and unmarked animals across the night downs.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Block the far gate and preserve baskets of cut bells before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seize the cord tables while Lysa holds the flock before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G17A"
        }
      ]
    },
    {
      "id": "G17A",
      "turn": 17,
      "title": "Corvin among the Bells - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Corvin tries to escape beneath a cloak sewn with stolen flock bells.",
        "You watch before acting and learn who believes themselves unobserved. His horse carries the buyer's tally in a saddle tube and glass scales in its blanket.",
        "The clearer position reveals the stakes: He means to let every bell confuse pursuit while taking the compact proof with him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have shepherds surround him by recognizing their bells.",
          "scoreDelta": 0,
          "nextNodeId": "G18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the loudest bell straight through the flock.",
          "failTitle": "The Noisy Decoy",
          "failText": "Corvin throws the cloak onto a loose pony and escapes while you follow borrowed sound.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the saddle tube strap with an arrow and close from the quiet side.",
          "scoreDelta": 1,
          "nextNodeId": "G18A"
        }
      ]
    },
    {
      "id": "G17B",
      "turn": 17,
      "title": "Corvin among the Bells - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Corvin tries to escape beneath a cloak sewn with stolen flock bells.",
        "By keeping tempers cool, you hold the inquiry on facts. His horse carries the buyer's tally in a saddle tube and glass scales in its blanket.",
        "The evidence now defines the danger: He means to let every bell confuse pursuit while taking the compact proof with him."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the loudest bell straight through the flock while keeping Lysa Rowe informed.",
          "failTitle": "The Noisy Decoy",
          "failText": "Corvin throws the cloak onto a loose pony and escapes while you follow borrowed sound.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the saddle tube strap with an arrow and close from the quiet side while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have shepherds surround him by recognizing their bells while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G18C"
        }
      ]
    },
    {
      "id": "G17C",
      "turn": 17,
      "title": "Corvin among the Bells - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Corvin tries to escape beneath a cloak sewn with stolen flock bells.",
        "The narrow margin leaves no room to chase every possibility. His horse carries the buyer's tally in a saddle tube and glass scales in its blanket.",
        "Delay has sharpened the danger: He means to let every bell confuse pursuit while taking the compact proof with him."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut the saddle tube strap with an arrow and close from the quiet side before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have shepherds surround him by recognizing their bells before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the loudest bell straight through the flock before the remaining light fails.",
          "failTitle": "The Noisy Decoy",
          "failText": "Corvin throws the cloak onto a loose pony and escapes while you follow borrowed sound.",
          "death": false
        }
      ]
    },
    {
      "id": "G18A",
      "turn": 18,
      "title": "The Buyer's Contract - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. The recovered tube contains a contract for 'storm-lost stock' signed before any sheep vanished.",
        "You use ground, wind, and cover to approach on your own terms. Its schedule matches the repaired gates, lantern positions, and Corvin's purchase offers.",
        "The clearer position reveals the stakes: The buyer financed a manufactured disaster and cannot claim an innocent market bargain."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let angry shepherds tear up the false sale.",
          "failTitle": "The Bargain Hidden",
          "failText": "Destroyed paper frees the distant buyer to deny knowing how Corvin obtained the flock.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the contract with the false paws and route map.",
          "scoreDelta": 1,
          "nextNodeId": "G19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the contract to Aldric while holding the buyer's agent.",
          "scoreDelta": 0,
          "nextNodeId": "G19B"
        }
      ]
    },
    {
      "id": "G18B",
      "turn": 18,
      "title": "The Buyer's Contract - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. The recovered tube contains a contract for 'storm-lost stock' signed before any sheep vanished.",
        "Your allies close the easy exits while you examine the heart of the scene. Its schedule matches the repaired gates, lantern positions, and Corvin's purchase offers.",
        "The evidence now defines the danger: The buyer financed a manufactured disaster and cannot claim an innocent market bargain."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal the contract with the false paws and route map while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the contract to Aldric while holding the buyer's agent while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let angry shepherds tear up the false sale while keeping Lysa Rowe informed.",
          "failTitle": "The Bargain Hidden",
          "failText": "Destroyed paper frees the distant buyer to deny knowing how Corvin obtained the flock.",
          "death": false
        }
      ]
    },
    {
      "id": "G18C",
      "turn": 18,
      "title": "The Buyer's Contract - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. The recovered tube contains a contract for 'storm-lost stock' signed before any sheep vanished.",
        "You arrive openly and must turn speed into its own kind of protection. Its schedule matches the repaired gates, lantern positions, and Corvin's purchase offers.",
        "Delay has sharpened the danger: The buyer financed a manufactured disaster and cannot claim an innocent market bargain."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the contract to Aldric while holding the buyer's agent before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let angry shepherds tear up the false sale before the remaining light fails.",
          "failTitle": "The Bargain Hidden",
          "failText": "Destroyed paper frees the distant buyer to deny knowing how Corvin obtained the flock.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the contract with the false paws and route map before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G19C"
        }
      ]
    },
    {
      "id": "G19A",
      "turn": 19,
      "title": "Counting at Dawn - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Families sort sheep by bells, ear marks, and remembered scars in the pale morning.",
        "The cleanest clue survives because you handled it with care. Some animals were honestly sold to Corvin before the plot, while others were stolen under glass-wolf panic.",
        "The clearer position reveals the stakes: A careful count must restore property without turning every disputed sheep into a new feud."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use contracts and old flock rolls beside physical marks.",
          "scoreDelta": 1,
          "nextNodeId": "G20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Return obvious animals first and reserve disputes for court.",
          "scoreDelta": 0,
          "nextNodeId": "G20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let each shepherd seize whatever sheep answer their call.",
          "failTitle": "A Second Stampede",
          "failText": "Competing calls split the exhausted flock and start fights among the people just rescued.",
          "death": false
        }
      ]
    },
    {
      "id": "G19B",
      "turn": 19,
      "title": "Counting at Dawn - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Families sort sheep by bells, ear marks, and remembered scars in the pale morning.",
        "The shared search reveals details no single witness had understood. Some animals were honestly sold to Corvin before the plot, while others were stolen under glass-wolf panic.",
        "The evidence now defines the danger: A careful count must restore property without turning every disputed sheep into a new feud."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Return obvious animals first and reserve disputes for court while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "nextNodeId": "G20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let each shepherd seize whatever sheep answer their call while keeping Lysa Rowe informed.",
          "failTitle": "A Second Stampede",
          "failText": "Competing calls split the exhausted flock and start fights among the people just rescued.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use contracts and old flock rolls beside physical marks while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "nextNodeId": "G20B"
        }
      ]
    },
    {
      "id": "G19C",
      "turn": 19,
      "title": "Counting at Dawn - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Families sort sheep by bells, ear marks, and remembered scars in the pale morning.",
        "What remains is enough, provided you act before it is moved. Some animals were honestly sold to Corvin before the plot, while others were stolen under glass-wolf panic.",
        "Delay has sharpened the danger: A careful count must restore property without turning every disputed sheep into a new feud."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let each shepherd seize whatever sheep answer their call before the remaining light fails.",
          "failTitle": "A Second Stampede",
          "failText": "Competing calls split the exhausted flock and start fights among the people just rescued.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use contracts and old flock rolls beside physical marks before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "G20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Return obvious animals first and reserve disputes for court before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "G20A"
        }
      ]
    },
    {
      "id": "G20A",
      "turn": 20,
      "title": "The Wolves Unmade - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. The willow frames stand in Oakenhurst's court beside Corvin, his foreman, and the sealed contract.",
        "You pause only long enough to read the danger correctly. Lysa can explain the whistles, Olan the hidden fold, and every shepherd the cost of the fear.",
        "The clearer position reveals the stakes: The final judgment can expose the whole design or merely punish the men caught carrying its masks."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Restore the flocks and continue pursuing the distant buyer.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep the glass frames for use against Brackenwald's enemies.",
          "failTitle": "A Useful Monster",
          "failText": "Preserving the deceit as a weapon ensures that fear, not law, will govern the next dark hillside.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the illusion, training, drive, and sale as one connected scheme.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "G20B",
      "turn": 20,
      "title": "The Wolves Unmade - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. The willow frames stand in Oakenhurst's court beside Corvin, his foreman, and the sealed contract.",
        "A sober exchange of evidence keeps the group from dividing. Lysa can explain the whistles, Olan the hidden fold, and every shepherd the cost of the fear.",
        "The evidence now defines the danger: The final judgment can expose the whole design or merely punish the men caught carrying its masks."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep the glass frames for use against Brackenwald's enemies while keeping Lysa Rowe informed.",
          "failTitle": "A Useful Monster",
          "failText": "Preserving the deceit as a weapon ensures that fear, not law, will govern the next dark hillside.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the illusion, training, drive, and sale as one connected scheme while keeping Lysa Rowe informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Restore the flocks and continue pursuing the distant buyer while keeping Lysa Rowe informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "G20C",
      "turn": 20,
      "title": "The Wolves Unmade - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. The willow frames stand in Oakenhurst's court beside Corvin, his foreman, and the sealed contract.",
        "You make up lost ground with a directness that warns everyone nearby. Lysa can explain the whistles, Olan the hidden fold, and every shepherd the cost of the fear.",
        "Delay has sharpened the danger: The final judgment can expose the whole design or merely punish the men caught carrying its masks."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Present the illusion, training, drive, and sale as one connected scheme before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Restore the flocks and continue pursuing the distant buyer before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep the glass frames for use against Brackenwald's enemies before the remaining light fails.",
          "failTitle": "A Useful Monster",
          "failText": "Preserving the deceit as a weapon ensures that fear, not law, will govern the next dark hillside.",
          "death": false
        }
      ]
    }
  ]
});
