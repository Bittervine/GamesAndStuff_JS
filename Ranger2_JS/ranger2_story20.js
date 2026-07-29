window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-charcoal-crown",
  "title": "The Charcoal Crown",
  "summary": "A black crown appears around an ancient oak as charcoal burners vanish from Elderwood. The ranger and burner Mera Coalhand uncover a forest steward's hidden kiln chain and a planned fire meant to erase illegal cutting and empty a woodland settlement.",
  "maxTurns": 20,
  "startNodeId": "H01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "Rain falls on living oaks rather than ash. The captive burners return, Joric Vale's contracts expose the illegal kiln chain, and Mera Coalhand becomes keeper of Elderwood's licensed coppices. The gray silver tabby keeps the old oak as its quiet kingdom.",
    "low": "The settlement and most of the coppice survive, but fire consumes part of the hidden ledger and blackens a long eastern slope. Aldric closes the forest to cutting while Mera guides the slow work of renewal."
  },
  "nodes": [
    {
      "id": "H01A",
      "turn": 1,
      "title": "The Crown of Ash - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into the protected oak coppices of Elderwood as an ancient oak stands inside a perfect ring of blackened saplings, and four charcoal burners are missing.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Mera Coalhand finds the ring cold beneath fresh dew, with ash laid over living moss rather than made by fire there.",
        "The clearer position reveals the stakes: The crown is a sign arranged to frighten workers from a part of Elderwood someone wants unwatched."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Lift ash layers and read the cart marks beneath them.",
          "scoreDelta": 1,
          "nextNodeId": "H02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the burners' families about recent orders.",
          "scoreDelta": 0,
          "nextNodeId": "H02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut down the ancient oak to break the omen.",
          "failTitle": "The Heart Oak Felled",
          "failText": "The needless felling turns frightened woodfolk against the inquiry and destroys marks hidden among its roots.",
          "death": false
        }
      ]
    },
    {
      "id": "H01B",
      "turn": 1,
      "title": "The Crown of Ash - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: an ancient oak stands inside a perfect ring of blackened saplings, and four charcoal burners are missing.",
        "With Thorne close and local witnesses beside you, you compare every account. Mera Coalhand finds the ring cold beneath fresh dew, with ash laid over living moss rather than made by fire there.",
        "The evidence now defines the danger: The crown is a sign arranged to frighten workers from a part of Elderwood someone wants unwatched."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the burners' families about recent orders while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut down the ancient oak to break the omen while keeping Mera Coalhand informed.",
          "failTitle": "The Heart Oak Felled",
          "failText": "The needless felling turns frightened woodfolk against the inquiry and destroys marks hidden among its roots.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lift ash layers and read the cart marks beneath them while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H02B"
        }
      ]
    },
    {
      "id": "H01C",
      "turn": 1,
      "title": "The Crown of Ash - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, an ancient oak stands inside a perfect ring of blackened saplings, and four charcoal burners are missing.",
        "Working against the light, you test the few signs that remain. Mera Coalhand finds the ring cold beneath fresh dew, with ash laid over living moss rather than made by fire there.",
        "Delay has sharpened the danger: The crown is a sign arranged to frighten workers from a part of Elderwood someone wants unwatched."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut down the ancient oak to break the omen before the remaining light fails.",
          "failTitle": "The Heart Oak Felled",
          "failText": "The needless felling turns frightened woodfolk against the inquiry and destroys marks hidden among its roots.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lift ash layers and read the cart marks beneath them before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the burners' families about recent orders before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H02A"
        }
      ]
    },
    {
      "id": "H02A",
      "turn": 2,
      "title": "Kiln Dust on Green Moss - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. Ash in the crown contains pale clay used only in deep covered kilns.",
        "You circle downwind and let small marks tell their order. Tiny oak wedges within it come from protected heartwood, which no licensed burner may cut.",
        "The clearer position reveals the stakes: The missing workers were near an illegal kiln consuming trees valuable enough to hide."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect every licensed kiln with Mera.",
          "scoreDelta": 0,
          "nextNodeId": "H03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest all burners using pale clay.",
          "failTitle": "The Wrong Kilns Closed",
          "failText": "Honest families lose their livelihood while the hidden operation burns on beyond the coppice bounds.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace clay grit toward its nearest natural bank.",
          "scoreDelta": 1,
          "nextNodeId": "H03A"
        }
      ]
    },
    {
      "id": "H02B",
      "turn": 2,
      "title": "Kiln Dust on Green Moss - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. Ash in the crown contains pale clay used only in deep covered kilns.",
        "You ask plain questions and watch which answers agree. Tiny oak wedges within it come from protected heartwood, which no licensed burner may cut.",
        "The evidence now defines the danger: The missing workers were near an illegal kiln consuming trees valuable enough to hide."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest all burners using pale clay while keeping Mera Coalhand informed.",
          "failTitle": "The Wrong Kilns Closed",
          "failText": "Honest families lose their livelihood while the hidden operation burns on beyond the coppice bounds.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace clay grit toward its nearest natural bank while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect every licensed kiln with Mera while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H03C"
        }
      ]
    },
    {
      "id": "H02C",
      "turn": 2,
      "title": "Kiln Dust on Green Moss - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. Ash in the crown contains pale clay used only in deep covered kilns.",
        "There is no time for elegance, only for separating fresh danger from old damage. Tiny oak wedges within it come from protected heartwood, which no licensed burner may cut.",
        "Delay has sharpened the danger: The missing workers were near an illegal kiln consuming trees valuable enough to hide."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Trace clay grit toward its nearest natural bank before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect every licensed kiln with Mera before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest all burners using pale clay before the remaining light fails.",
          "failTitle": "The Wrong Kilns Closed",
          "failText": "Honest families lose their livelihood while the hidden operation burns on beyond the coppice bounds.",
          "death": false
        }
      ]
    },
    {
      "id": "H03A",
      "turn": 3,
      "title": "The Steward's Boundary - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Forest steward Joric Vale claims the crowned oak marks disease and orders the whole eastern coppice cleared.",
        "From sheltered ground, you measure tracks, tools, and distances. His written survey is new, but old blaze marks place the protected line far beyond his proposed cutting.",
        "The clearer position reveals the stakes: Fear of rot would give Joric authority to erase the ground around the illegal kiln."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Joric begin felling while you watch for clues.",
          "failTitle": "The Evidence Cut Away",
          "failText": "Axes remove tracks, stumps, and concealed vents faster than you can record them.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare old tree blazes before accepting the survey.",
          "scoreDelta": 1,
          "nextNodeId": "H04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Suspend cutting until Aldric's foresters arrive.",
          "scoreDelta": 0,
          "nextNodeId": "H04B"
        }
      ]
    },
    {
      "id": "H03B",
      "turn": 3,
      "title": "The Steward's Boundary - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Forest steward Joric Vale claims the crowned oak marks disease and orders the whole eastern coppice cleared.",
        "You keep the scene orderly while your allies search it piece by piece. His written survey is new, but old blaze marks place the protected line far beyond his proposed cutting.",
        "The evidence now defines the danger: Fear of rot would give Joric authority to erase the ground around the illegal kiln."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare old tree blazes before accepting the survey while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Suspend cutting until Aldric's foresters arrive while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Joric begin felling while you watch for clues while keeping Mera Coalhand informed.",
          "failTitle": "The Evidence Cut Away",
          "failText": "Axes remove tracks, stumps, and concealed vents faster than you can record them.",
          "death": false
        }
      ]
    },
    {
      "id": "H03C",
      "turn": 3,
      "title": "The Steward's Boundary - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Forest steward Joric Vale claims the crowned oak marks disease and orders the whole eastern coppice cleared.",
        "Pressed for time, you trust hard evidence and discard rumor. His written survey is new, but old blaze marks place the protected line far beyond his proposed cutting.",
        "Delay has sharpened the danger: Fear of rot would give Joric authority to erase the ground around the illegal kiln."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Suspend cutting until Aldric's foresters arrive before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Joric begin felling while you watch for clues before the remaining light fails.",
          "failTitle": "The Evidence Cut Away",
          "failText": "Axes remove tracks, stumps, and concealed vents faster than you can record them.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare old tree blazes before accepting the survey before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H04C"
        }
      ]
    },
    {
      "id": "H04A",
      "turn": 4,
      "title": "The Missing Burner's Cart - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. A handcart belonging to Mera's brother Bram lies overturned in a fern hollow.",
        "You move quietly enough to hear work and voices ahead. Its charcoal load is gone, and the axle is scored by a narrow rail hidden beneath leaf mold.",
        "The clearer position reveals the stakes: The captives and illegal fuel are moving through Elderwood on a prepared path that leaves few wheel ruts."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the buried rail on foot under cover.",
          "scoreDelta": 1,
          "nextNodeId": "H05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the hollow and bring two trusted burners.",
          "scoreDelta": 0,
          "nextNodeId": "H05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drag the rail into the open at once.",
          "failTitle": "The Hidden Route Exposed",
          "failText": "Lookouts see the uncovered iron and move Bram before you reach the kiln chain.",
          "death": false
        }
      ]
    },
    {
      "id": "H04B",
      "turn": 4,
      "title": "The Missing Burner's Cart - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. A handcart belonging to Mera's brother Bram lies overturned in a fern hollow.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Its charcoal load is gone, and the axle is scored by a narrow rail hidden beneath leaf mold.",
        "The evidence now defines the danger: The captives and illegal fuel are moving through Elderwood on a prepared path that leaves few wheel ruts."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the hollow and bring two trusted burners while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drag the rail into the open at once while keeping Mera Coalhand informed.",
          "failTitle": "The Hidden Route Exposed",
          "failText": "Lookouts see the uncovered iron and move Bram before you reach the kiln chain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the buried rail on foot under cover while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H05B"
        }
      ]
    },
    {
      "id": "H04C",
      "turn": 4,
      "title": "The Missing Burner's Cart - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. A handcart belonging to Mera's brother Bram lies overturned in a fern hollow.",
        "You push through fatigue, knowing the next mistake may close the road. Its charcoal load is gone, and the axle is scored by a narrow rail hidden beneath leaf mold.",
        "Delay has sharpened the danger: The captives and illegal fuel are moving through Elderwood on a prepared path that leaves few wheel ruts."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drag the rail into the open at once before the remaining light fails.",
          "failTitle": "The Hidden Route Exposed",
          "failText": "Lookouts see the uncovered iron and move Bram before you reach the kiln chain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the buried rail on foot under cover before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the hollow and bring two trusted burners before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H05A"
        }
      ]
    },
    {
      "id": "H05A",
      "turn": 5,
      "title": "The Tabby and the Warm Stone - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. A gray silver tabby with green eyes sleeps on one warm stone in an otherwise cold ruin.",
        "A ranger's eye finds the human habit behind the apparent mystery. When it slips away, a breath of kiln smoke rises through the gap beneath its paws.",
        "The clearer position reveals the stakes: The animal has revealed an air shaft connected to working chambers below the abandoned forester lodge."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Post Mera by the shaft while you inspect the ruin.",
          "scoreDelta": 0,
          "nextNodeId": "H06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop burning straw down the shaft.",
          "failTitle": "Fire Below Ground",
          "failText": "The flame consumes fresh air and fills chambers holding captive workers with smoke.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test the draft with a thread and listen at the opening.",
          "scoreDelta": 1,
          "nextNodeId": "H06A"
        }
      ]
    },
    {
      "id": "H05B",
      "turn": 5,
      "title": "The Tabby and the Warm Stone - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. A gray silver tabby with green eyes sleeps on one warm stone in an otherwise cold ruin.",
        "Together, the small company builds one reliable account from scattered facts. When it slips away, a breath of kiln smoke rises through the gap beneath its paws.",
        "The evidence now defines the danger: The animal has revealed an air shaft connected to working chambers below the abandoned forester lodge."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop burning straw down the shaft while keeping Mera Coalhand informed.",
          "failTitle": "Fire Below Ground",
          "failText": "The flame consumes fresh air and fills chambers holding captive workers with smoke.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test the draft with a thread and listen at the opening while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post Mera by the shaft while you inspect the ruin while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H06C"
        }
      ]
    },
    {
      "id": "H05C",
      "turn": 5,
      "title": "The Tabby and the Warm Stone - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. A gray silver tabby with green eyes sleeps on one warm stone in an otherwise cold ruin.",
        "You take the shortest safe route and accept that concealment is nearly gone. When it slips away, a breath of kiln smoke rises through the gap beneath its paws.",
        "Delay has sharpened the danger: The animal has revealed an air shaft connected to working chambers below the abandoned forester lodge."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test the draft with a thread and listen at the opening before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post Mera by the shaft while you inspect the ruin before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop burning straw down the shaft before the remaining light fails.",
          "failTitle": "Fire Below Ground",
          "failText": "The flame consumes fresh air and fills chambers holding captive workers with smoke.",
          "death": true
        }
      ]
    },
    {
      "id": "H06A",
      "turn": 6,
      "title": "The Buried Kiln Chain - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. The shaft overlooks linked charcoal kilns built into an old root cellar.",
        "You preserve the most fragile sign before turning to the larger scene. Rails carry baskets from one sealed chamber to the next, while guards keep burners working without daylight.",
        "The clearer position reveals the stakes: The operation can produce vast fuel unseen, using prisoners who know the forest well enough to expose it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop into the nearest kiln room with sword drawn.",
          "failTitle": "Closed in the Kiln",
          "failText": "A guard shuts the iron draft door, trapping you in heat and darkness.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count chambers, guards, and exits before moving.",
          "scoreDelta": 1,
          "nextNodeId": "H07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Call softly to learn where Bram is held.",
          "scoreDelta": 0,
          "nextNodeId": "H07B"
        }
      ]
    },
    {
      "id": "H06B",
      "turn": 6,
      "title": "The Buried Kiln Chain - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. The shaft overlooks linked charcoal kilns built into an old root cellar.",
        "Each person is given one task, and confusion begins to clear. Rails carry baskets from one sealed chamber to the next, while guards keep burners working without daylight.",
        "The evidence now defines the danger: The operation can produce vast fuel unseen, using prisoners who know the forest well enough to expose it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Count chambers, guards, and exits before moving while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Call softly to learn where Bram is held while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop into the nearest kiln room with sword drawn while keeping Mera Coalhand informed.",
          "failTitle": "Closed in the Kiln",
          "failText": "A guard shuts the iron draft door, trapping you in heat and darkness.",
          "death": true
        }
      ]
    },
    {
      "id": "H06C",
      "turn": 6,
      "title": "The Buried Kiln Chain - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. The shaft overlooks linked charcoal kilns built into an old root cellar.",
        "The enemy has the lead, so you judge every pause against the lives at risk. Rails carry baskets from one sealed chamber to the next, while guards keep burners working without daylight.",
        "Delay has sharpened the danger: The operation can produce vast fuel unseen, using prisoners who know the forest well enough to expose it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Call softly to learn where Bram is held before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop into the nearest kiln room with sword drawn before the remaining light fails.",
          "failTitle": "Closed in the Kiln",
          "failText": "A guard shuts the iron draft door, trapping you in heat and darkness.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count chambers, guards, and exits before moving before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H07C"
        }
      ]
    },
    {
      "id": "H07A",
      "turn": 7,
      "title": "Heartwood Stumps - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. A rear passage opens onto dozens of oak stumps hidden under woven turf.",
        "You watch before acting and learn who believes themselves unobserved. Each stump bears Joric's survey hammer, although his public books record only storm-fallen birch.",
        "The clearer position reveals the stakes: The steward is stealing the duke's oldest timber and turning the remains into secret charcoal."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take bark rubbings and match hammer dents.",
          "scoreDelta": 1,
          "nextNodeId": "H08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead neutral woodcutters to witness the stumps.",
          "scoreDelta": 0,
          "nextNodeId": "H08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull away every turf cover as a public display.",
          "failTitle": "The Forest Warned",
          "failText": "Exposed pale circles shine from the ridge, telling Joric his cutting ground has been found.",
          "death": false
        }
      ]
    },
    {
      "id": "H07B",
      "turn": 7,
      "title": "Heartwood Stumps - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. A rear passage opens onto dozens of oak stumps hidden under woven turf.",
        "By keeping tempers cool, you hold the inquiry on facts. Each stump bears Joric's survey hammer, although his public books record only storm-fallen birch.",
        "The evidence now defines the danger: The steward is stealing the duke's oldest timber and turning the remains into secret charcoal."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead neutral woodcutters to witness the stumps while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull away every turf cover as a public display while keeping Mera Coalhand informed.",
          "failTitle": "The Forest Warned",
          "failText": "Exposed pale circles shine from the ridge, telling Joric his cutting ground has been found.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take bark rubbings and match hammer dents while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H08B"
        }
      ]
    },
    {
      "id": "H07C",
      "turn": 7,
      "title": "Heartwood Stumps - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. A rear passage opens onto dozens of oak stumps hidden under woven turf.",
        "The narrow margin leaves no room to chase every possibility. Each stump bears Joric's survey hammer, although his public books record only storm-fallen birch.",
        "Delay has sharpened the danger: The steward is stealing the duke's oldest timber and turning the remains into secret charcoal."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull away every turf cover as a public display before the remaining light fails.",
          "failTitle": "The Forest Warned",
          "failText": "Exposed pale circles shine from the ridge, telling Joric his cutting ground has been found.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take bark rubbings and match hammer dents before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead neutral woodcutters to witness the stumps before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H08A"
        }
      ]
    },
    {
      "id": "H08A",
      "turn": 8,
      "title": "Bram's Message - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. A charcoal tally pushed through the shaft carries cuts only Mera and Bram use.",
        "You use ground, wind, and cover to approach on your own terms. It says the prisoners are building a broad firebreak east of their chambers under armed watch.",
        "The clearer position reveals the stakes: A true firebreak should protect the settlement; this one may serve a different purpose."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Mera to answer with a safe signal.",
          "scoreDelta": 0,
          "nextNodeId": "H09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout down the shaft that rescue is coming.",
          "failTitle": "The Guards Hear Hope",
          "failText": "Joric's men separate Bram from the others and seal the message route.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Decode the cuts and map the stated direction.",
          "scoreDelta": 1,
          "nextNodeId": "H09A"
        }
      ]
    },
    {
      "id": "H08B",
      "turn": 8,
      "title": "Bram's Message - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. A charcoal tally pushed through the shaft carries cuts only Mera and Bram use.",
        "Your allies close the easy exits while you examine the heart of the scene. It says the prisoners are building a broad firebreak east of their chambers under armed watch.",
        "The evidence now defines the danger: A true firebreak should protect the settlement; this one may serve a different purpose."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout down the shaft that rescue is coming while keeping Mera Coalhand informed.",
          "failTitle": "The Guards Hear Hope",
          "failText": "Joric's men separate Bram from the others and seal the message route.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Decode the cuts and map the stated direction while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Mera to answer with a safe signal while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H09C"
        }
      ]
    },
    {
      "id": "H08C",
      "turn": 8,
      "title": "Bram's Message - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. A charcoal tally pushed through the shaft carries cuts only Mera and Bram use.",
        "You arrive openly and must turn speed into its own kind of protection. It says the prisoners are building a broad firebreak east of their chambers under armed watch.",
        "Delay has sharpened the danger: A true firebreak should protect the settlement; this one may serve a different purpose."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Decode the cuts and map the stated direction before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Mera to answer with a safe signal before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout down the shaft that rescue is coming before the remaining light fails.",
          "failTitle": "The Guards Hear Hope",
          "failText": "Joric's men separate Bram from the others and seal the message route.",
          "death": false
        }
      ]
    },
    {
      "id": "H09A",
      "turn": 9,
      "title": "The Reversed Firebreak - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. The new cleared strip curves around Joric's illegal stumps but opens toward the woodland settlement of Hazel Row.",
        "The cleanest clue survives because you handled it with care. Brush has been stacked on the settlement side as dry fuel rather than removed.",
        "The clearer position reveals the stakes: The line is designed to protect evidence of profit while steering a deliberate blaze into homes."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the brush now under supposedly safe conditions.",
          "failTitle": "The Wind Changes Early",
          "failText": "A rising gust carries sparks beyond the unfinished break and begins the disaster before help is ready.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record wind, brush piles, and the break's false curve.",
          "scoreDelta": 1,
          "nextNodeId": "H10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Begin quietly clearing fuel near Hazel Row.",
          "scoreDelta": 0,
          "nextNodeId": "H10B"
        }
      ]
    },
    {
      "id": "H09B",
      "turn": 9,
      "title": "The Reversed Firebreak - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. The new cleared strip curves around Joric's illegal stumps but opens toward the woodland settlement of Hazel Row.",
        "The shared search reveals details no single witness had understood. Brush has been stacked on the settlement side as dry fuel rather than removed.",
        "The evidence now defines the danger: The line is designed to protect evidence of profit while steering a deliberate blaze into homes."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Record wind, brush piles, and the break's false curve while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Begin quietly clearing fuel near Hazel Row while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the brush now under supposedly safe conditions while keeping Mera Coalhand informed.",
          "failTitle": "The Wind Changes Early",
          "failText": "A rising gust carries sparks beyond the unfinished break and begins the disaster before help is ready.",
          "death": true
        }
      ]
    },
    {
      "id": "H09C",
      "turn": 9,
      "title": "The Reversed Firebreak - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. The new cleared strip curves around Joric's illegal stumps but opens toward the woodland settlement of Hazel Row.",
        "What remains is enough, provided you act before it is moved. Brush has been stacked on the settlement side as dry fuel rather than removed.",
        "Delay has sharpened the danger: The line is designed to protect evidence of profit while steering a deliberate blaze into homes."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Begin quietly clearing fuel near Hazel Row before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the brush now under supposedly safe conditions before the remaining light fails.",
          "failTitle": "The Wind Changes Early",
          "failText": "A rising gust carries sparks beyond the unfinished break and begins the disaster before help is ready.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record wind, brush piles, and the break's false curve before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H10C"
        }
      ]
    },
    {
      "id": "H10A",
      "turn": 10,
      "title": "Contracts in Charcoal - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Mera finds order tallies for enough fuel to supply a large ironworks outside Brackenwald.",
        "You pause only long enough to read the danger correctly. Payment is due only after Joric certifies the coppice lost to wildfire, freeing salvage rights to every remaining tree.",
        "The clearer position reveals the stakes: The coming fire will erase theft, fulfill a contract, and turn surviving timber into legal profit."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the tallies in oiled cloth and compare Joric's hammer mark.",
          "scoreDelta": 1,
          "nextNodeId": "H11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a copy to Aldric while retaining the originals.",
          "scoreDelta": 0,
          "nextNodeId": "H11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Use the papers to light a signal fire.",
          "failTitle": "The Profit Record Burned",
          "failText": "The flames consume the only account tying Joric's authority to the hidden kilns.",
          "death": false
        }
      ]
    },
    {
      "id": "H10B",
      "turn": 10,
      "title": "Contracts in Charcoal - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Mera finds order tallies for enough fuel to supply a large ironworks outside Brackenwald.",
        "A sober exchange of evidence keeps the group from dividing. Payment is due only after Joric certifies the coppice lost to wildfire, freeing salvage rights to every remaining tree.",
        "The evidence now defines the danger: The coming fire will erase theft, fulfill a contract, and turn surviving timber into legal profit."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a copy to Aldric while retaining the originals while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Use the papers to light a signal fire while keeping Mera Coalhand informed.",
          "failTitle": "The Profit Record Burned",
          "failText": "The flames consume the only account tying Joric's authority to the hidden kilns.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the tallies in oiled cloth and compare Joric's hammer mark while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H11B"
        }
      ]
    },
    {
      "id": "H10C",
      "turn": 10,
      "title": "Contracts in Charcoal - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Mera finds order tallies for enough fuel to supply a large ironworks outside Brackenwald.",
        "You make up lost ground with a directness that warns everyone nearby. Payment is due only after Joric certifies the coppice lost to wildfire, freeing salvage rights to every remaining tree.",
        "Delay has sharpened the danger: The coming fire will erase theft, fulfill a contract, and turn surviving timber into legal profit."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Use the papers to light a signal fire before the remaining light fails.",
          "failTitle": "The Profit Record Burned",
          "failText": "The flames consume the only account tying Joric's authority to the hidden kilns.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the tallies in oiled cloth and compare Joric's hammer mark before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a copy to Aldric while retaining the originals before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H11A"
        }
      ]
    },
    {
      "id": "H11A",
      "turn": 11,
      "title": "The Captive Burners - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. A maintenance passage reaches the prisoners during a guard change.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Bram explains that kiln vents have been packed with resin bundles ready to ignite along the eastern slope.",
        "The clearer position reveals the stakes: Freeing the workers without controlling those vents could let one fleeing guard start the whole chain."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Release pairs of burners to disable separate vents.",
          "scoreDelta": 0,
          "nextNodeId": "H12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arm every prisoner and rush the guards.",
          "failTitle": "A Spark in the Struggle",
          "failText": "A fallen lamp catches the first resin bundle and fire races into the linked shafts.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure the resin fuses before cutting bonds.",
          "scoreDelta": 1,
          "nextNodeId": "H12A"
        }
      ]
    },
    {
      "id": "H11B",
      "turn": 11,
      "title": "The Captive Burners - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. A maintenance passage reaches the prisoners during a guard change.",
        "With Thorne close and local witnesses beside you, you compare every account. Bram explains that kiln vents have been packed with resin bundles ready to ignite along the eastern slope.",
        "The evidence now defines the danger: Freeing the workers without controlling those vents could let one fleeing guard start the whole chain."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Arm every prisoner and rush the guards while keeping Mera Coalhand informed.",
          "failTitle": "A Spark in the Struggle",
          "failText": "A fallen lamp catches the first resin bundle and fire races into the linked shafts.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure the resin fuses before cutting bonds while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Release pairs of burners to disable separate vents while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H12C"
        }
      ]
    },
    {
      "id": "H11C",
      "turn": 11,
      "title": "The Captive Burners - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. A maintenance passage reaches the prisoners during a guard change.",
        "Working against the light, you test the few signs that remain. Bram explains that kiln vents have been packed with resin bundles ready to ignite along the eastern slope.",
        "Delay has sharpened the danger: Freeing the workers without controlling those vents could let one fleeing guard start the whole chain."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Secure the resin fuses before cutting bonds before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Release pairs of burners to disable separate vents before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arm every prisoner and rush the guards before the remaining light fails.",
          "failTitle": "A Spark in the Struggle",
          "failText": "A fallen lamp catches the first resin bundle and fire races into the linked shafts.",
          "death": true
        }
      ]
    },
    {
      "id": "H12A",
      "turn": 12,
      "title": "Joric's False Alarm - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. The steward rings the forest fire bell and orders villagers west, away from Hazel Row.",
        "You circle downwind and let small marks tell their order. His men claim smoke has been seen near the river road, where wet ground cannot carry a serious blaze.",
        "The clearer position reveals the stakes: The false evacuation clears witnesses from the true target and gives Joric command of every fire crew."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring every bell in Elderwood without directions.",
          "failTitle": "Panic on Every Path",
          "failText": "Families scatter into the working woods and block the routes fire crews need.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Send scouts to verify smoke while keeping crews at Hazel Row.",
          "scoreDelta": 1,
          "nextNodeId": "H13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Refuse evacuation until Mera returns with proof.",
          "scoreDelta": 0,
          "nextNodeId": "H13B"
        }
      ]
    },
    {
      "id": "H12B",
      "turn": 12,
      "title": "Joric's False Alarm - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. The steward rings the forest fire bell and orders villagers west, away from Hazel Row.",
        "You ask plain questions and watch which answers agree. His men claim smoke has been seen near the river road, where wet ground cannot carry a serious blaze.",
        "The evidence now defines the danger: The false evacuation clears witnesses from the true target and gives Joric command of every fire crew."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send scouts to verify smoke while keeping crews at Hazel Row while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Refuse evacuation until Mera returns with proof while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring every bell in Elderwood without directions while keeping Mera Coalhand informed.",
          "failTitle": "Panic on Every Path",
          "failText": "Families scatter into the working woods and block the routes fire crews need.",
          "death": false
        }
      ]
    },
    {
      "id": "H12C",
      "turn": 12,
      "title": "Joric's False Alarm - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. The steward rings the forest fire bell and orders villagers west, away from Hazel Row.",
        "There is no time for elegance, only for separating fresh danger from old damage. His men claim smoke has been seen near the river road, where wet ground cannot carry a serious blaze.",
        "Delay has sharpened the danger: The false evacuation clears witnesses from the true target and gives Joric command of every fire crew."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Refuse evacuation until Mera returns with proof before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring every bell in Elderwood without directions before the remaining light fails.",
          "failTitle": "Panic on Every Path",
          "failText": "Families scatter into the working woods and block the routes fire crews need.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Send scouts to verify smoke while keeping crews at Hazel Row before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H13C"
        }
      ]
    },
    {
      "id": "H13A",
      "turn": 13,
      "title": "The Resin Wagons - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Two wagons loaded with resin pots move toward the hidden vents under tarred covers.",
        "From sheltered ground, you measure tracks, tools, and distances. Their drivers carry Joric's emergency passes and believe they are delivering fire-fighting pitch.",
        "The clearer position reveals the stakes: The steward has turned ordinary workers into unwitting hands for arson."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Redirect the wagons to a wet clearing using Joric's own route marks.",
          "scoreDelta": 1,
          "nextNodeId": "H14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stop and unload them before witnesses.",
          "scoreDelta": 0,
          "nextNodeId": "H14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot a fire arrow into the lead wagon.",
          "failTitle": "A Road of Flame",
          "failText": "Burning resin spills through dry bracken and starts a fire no crew can contain.",
          "death": true
        }
      ]
    },
    {
      "id": "H13B",
      "turn": 13,
      "title": "The Resin Wagons - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Two wagons loaded with resin pots move toward the hidden vents under tarred covers.",
        "You keep the scene orderly while your allies search it piece by piece. Their drivers carry Joric's emergency passes and believe they are delivering fire-fighting pitch.",
        "The evidence now defines the danger: The steward has turned ordinary workers into unwitting hands for arson."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Stop and unload them before witnesses while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot a fire arrow into the lead wagon while keeping Mera Coalhand informed.",
          "failTitle": "A Road of Flame",
          "failText": "Burning resin spills through dry bracken and starts a fire no crew can contain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Redirect the wagons to a wet clearing using Joric's own route marks while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H14B"
        }
      ]
    },
    {
      "id": "H13C",
      "turn": 13,
      "title": "The Resin Wagons - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Two wagons loaded with resin pots move toward the hidden vents under tarred covers.",
        "Pressed for time, you trust hard evidence and discard rumor. Their drivers carry Joric's emergency passes and believe they are delivering fire-fighting pitch.",
        "Delay has sharpened the danger: The steward has turned ordinary workers into unwitting hands for arson."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot a fire arrow into the lead wagon before the remaining light fails.",
          "failTitle": "A Road of Flame",
          "failText": "Burning resin spills through dry bracken and starts a fire no crew can contain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Redirect the wagons to a wet clearing using Joric's own route marks before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stop and unload them before witnesses before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H14A"
        }
      ]
    },
    {
      "id": "H14A",
      "turn": 14,
      "title": "The Tabby's Root Door - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. The gray silver tabby scratches at roots beneath the crowned oak, then slips through a narrow wooden flap.",
        "You move quietly enough to hear work and voices ahead. Behind it, Joric has hidden a speaking tube and lever controlling a chain of kiln vents.",
        "The clearer position reveals the stakes: The old oak was chosen as his command point, not as any forest omen."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Call Mera to identify the vent controls.",
          "scoreDelta": 0,
          "nextNodeId": "H15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull the lever fully to close every draft.",
          "failTitle": "The Kilns Breathe Fire",
          "failText": "The lever opens alternate vents, feeding air to resin bundles on the eastern slope.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Widen the root door without moving the lever and trace each cord.",
          "scoreDelta": 1,
          "nextNodeId": "H15A"
        }
      ]
    },
    {
      "id": "H14B",
      "turn": 14,
      "title": "The Tabby's Root Door - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. The gray silver tabby scratches at roots beneath the crowned oak, then slips through a narrow wooden flap.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Behind it, Joric has hidden a speaking tube and lever controlling a chain of kiln vents.",
        "The evidence now defines the danger: The old oak was chosen as his command point, not as any forest omen."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull the lever fully to close every draft while keeping Mera Coalhand informed.",
          "failTitle": "The Kilns Breathe Fire",
          "failText": "The lever opens alternate vents, feeding air to resin bundles on the eastern slope.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Widen the root door without moving the lever and trace each cord while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Call Mera to identify the vent controls while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H15C"
        }
      ]
    },
    {
      "id": "H14C",
      "turn": 14,
      "title": "The Tabby's Root Door - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. The gray silver tabby scratches at roots beneath the crowned oak, then slips through a narrow wooden flap.",
        "You push through fatigue, knowing the next mistake may close the road. Behind it, Joric has hidden a speaking tube and lever controlling a chain of kiln vents.",
        "Delay has sharpened the danger: The old oak was chosen as his command point, not as any forest omen."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Widen the root door without moving the lever and trace each cord before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Call Mera to identify the vent controls before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull the lever fully to close every draft before the remaining light fails.",
          "failTitle": "The Kilns Breathe Fire",
          "failText": "The lever opens alternate vents, feeding air to resin bundles on the eastern slope.",
          "death": true
        }
      ]
    },
    {
      "id": "H15A",
      "turn": 15,
      "title": "Smoke Before the Storm - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. A dry wind rises hours before the rain promised by valley clouds.",
        "A ranger's eye finds the human habit behind the apparent mystery. Joric's lookouts move toward three vent mouths while Hazel Row's families return confused from the false alarm.",
        "The clearer position reveals the stakes: The arson can begin at several points, and stopping one torch will not save the settlement."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase Joric's nearest lookout and leave the others unseen.",
          "failTitle": "Three Fires for One Chase",
          "failText": "While you catch one man, two resin lines ignite beyond sight.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Place burners at mapped vents and use damp hides on every fuse.",
          "scoreDelta": 1,
          "nextNodeId": "H16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Concentrate villagers on clearing Hazel Row's roofs.",
          "scoreDelta": 0,
          "nextNodeId": "H16B"
        }
      ]
    },
    {
      "id": "H15B",
      "turn": 15,
      "title": "Smoke Before the Storm - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. A dry wind rises hours before the rain promised by valley clouds.",
        "Together, the small company builds one reliable account from scattered facts. Joric's lookouts move toward three vent mouths while Hazel Row's families return confused from the false alarm.",
        "The evidence now defines the danger: The arson can begin at several points, and stopping one torch will not save the settlement."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Place burners at mapped vents and use damp hides on every fuse while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Concentrate villagers on clearing Hazel Row's roofs while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase Joric's nearest lookout and leave the others unseen while keeping Mera Coalhand informed.",
          "failTitle": "Three Fires for One Chase",
          "failText": "While you catch one man, two resin lines ignite beyond sight.",
          "death": true
        }
      ]
    },
    {
      "id": "H15C",
      "turn": 15,
      "title": "Smoke Before the Storm - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. A dry wind rises hours before the rain promised by valley clouds.",
        "You take the shortest safe route and accept that concealment is nearly gone. Joric's lookouts move toward three vent mouths while Hazel Row's families return confused from the false alarm.",
        "Delay has sharpened the danger: The arson can begin at several points, and stopping one torch will not save the settlement."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Concentrate villagers on clearing Hazel Row's roofs before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase Joric's nearest lookout and leave the others unseen before the remaining light fails.",
          "failTitle": "Three Fires for One Chase",
          "failText": "While you catch one man, two resin lines ignite beyond sight.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Place burners at mapped vents and use damp hides on every fuse before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H16C"
        }
      ]
    },
    {
      "id": "H16A",
      "turn": 16,
      "title": "The First Vent Ignites - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Flame bursts from a hillside vent but meets Mera's damp hides and stalls.",
        "You preserve the most fragile sign before turning to the larger scene. Smoke fills the prisoner passage, where the last two burners remain chained beside a failing prop.",
        "The clearer position reveals the stakes: The fire line and rescue now compete for the same few skilled hands."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Open the roof draft, free the prisoners, then smother the vent from above.",
          "scoreDelta": 1,
          "nextNodeId": "H17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the vent while Bram leads a rescue below.",
          "scoreDelta": 0,
          "nextNodeId": "H17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Collapse the passage to starve the fire.",
          "failTitle": "The Burners Buried",
          "failText": "Falling earth seals living prisoners inside the chamber with smoke.",
          "death": true
        }
      ]
    },
    {
      "id": "H16B",
      "turn": 16,
      "title": "The First Vent Ignites - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Flame bursts from a hillside vent but meets Mera's damp hides and stalls.",
        "Each person is given one task, and confusion begins to clear. Smoke fills the prisoner passage, where the last two burners remain chained beside a failing prop.",
        "The evidence now defines the danger: The fire line and rescue now compete for the same few skilled hands."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the vent while Bram leads a rescue below while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Collapse the passage to starve the fire while keeping Mera Coalhand informed.",
          "failTitle": "The Burners Buried",
          "failText": "Falling earth seals living prisoners inside the chamber with smoke.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the roof draft, free the prisoners, then smother the vent from above while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H17B"
        }
      ]
    },
    {
      "id": "H16C",
      "turn": 16,
      "title": "The First Vent Ignites - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Flame bursts from a hillside vent but meets Mera's damp hides and stalls.",
        "The enemy has the lead, so you judge every pause against the lives at risk. Smoke fills the prisoner passage, where the last two burners remain chained beside a failing prop.",
        "Delay has sharpened the danger: The fire line and rescue now compete for the same few skilled hands."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Collapse the passage to starve the fire before the remaining light fails.",
          "failTitle": "The Burners Buried",
          "failText": "Falling earth seals living prisoners inside the chamber with smoke.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the roof draft, free the prisoners, then smother the vent from above before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the vent while Bram leads a rescue below before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H17A"
        }
      ]
    },
    {
      "id": "H17A",
      "turn": 17,
      "title": "Joric at the Heart Oak - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Joric reaches the crowned oak with a torch and the original cutting ledger.",
        "You watch before acting and learn who believes themselves unobserved. He threatens to fire both ledger and root controls unless given a horse and the north path.",
        "The clearer position reveals the stakes: The evidence, the vent chain, and the organizer of the plot stand within one dangerous reach."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Offer Thorne after Mera quietly cuts the control cords.",
          "scoreDelta": 0,
          "nextNodeId": "H18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush Joric through the dry ash ring.",
          "failTitle": "The Crown Takes Flame",
          "failText": "The ash conceals resin; fire circles the ancient oak and runs into every connected root trench.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin his torch hand with an arrow against the soft bark.",
          "scoreDelta": 1,
          "nextNodeId": "H18A"
        }
      ]
    },
    {
      "id": "H17B",
      "turn": 17,
      "title": "Joric at the Heart Oak - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Joric reaches the crowned oak with a torch and the original cutting ledger.",
        "By keeping tempers cool, you hold the inquiry on facts. He threatens to fire both ledger and root controls unless given a horse and the north path.",
        "The evidence now defines the danger: The evidence, the vent chain, and the organizer of the plot stand within one dangerous reach."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush Joric through the dry ash ring while keeping Mera Coalhand informed.",
          "failTitle": "The Crown Takes Flame",
          "failText": "The ash conceals resin; fire circles the ancient oak and runs into every connected root trench.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin his torch hand with an arrow against the soft bark while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Offer Thorne after Mera quietly cuts the control cords while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H18C"
        }
      ]
    },
    {
      "id": "H17C",
      "turn": 17,
      "title": "Joric at the Heart Oak - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Joric reaches the crowned oak with a torch and the original cutting ledger.",
        "The narrow margin leaves no room to chase every possibility. He threatens to fire both ledger and root controls unless given a horse and the north path.",
        "Delay has sharpened the danger: The evidence, the vent chain, and the organizer of the plot stand within one dangerous reach."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Pin his torch hand with an arrow against the soft bark before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Offer Thorne after Mera quietly cuts the control cords before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush Joric through the dry ash ring before the remaining light fails.",
          "failTitle": "The Crown Takes Flame",
          "failText": "The ash conceals resin; fire circles the ancient oak and runs into every connected root trench.",
          "death": true
        }
      ]
    },
    {
      "id": "H18A",
      "turn": 18,
      "title": "Rain and the East Line - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. The first rain reaches Elderwood while embers still cross the false firebreak.",
        "You use ground, wind, and cover to approach on your own terms. Bram can reverse the kiln drafts, and villagers can open the old cattle lane as a bare barrier.",
        "The clearer position reveals the stakes: A final coordinated effort can keep the surviving fire from entering Hazel Row."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Flood the root cellars from the forest stream.",
          "failTitle": "Steam Below",
          "failText": "Water striking hot kilns fills rescue passages with scalding steam and weakens their roofs.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reverse drafts only after clearing smoke paths, then open the cattle lane.",
          "scoreDelta": 1,
          "nextNodeId": "H19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the settlement roofs until rain strengthens.",
          "scoreDelta": 0,
          "nextNodeId": "H19B"
        }
      ]
    },
    {
      "id": "H18B",
      "turn": 18,
      "title": "Rain and the East Line - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. The first rain reaches Elderwood while embers still cross the false firebreak.",
        "Your allies close the easy exits while you examine the heart of the scene. Bram can reverse the kiln drafts, and villagers can open the old cattle lane as a bare barrier.",
        "The evidence now defines the danger: A final coordinated effort can keep the surviving fire from entering Hazel Row."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Reverse drafts only after clearing smoke paths, then open the cattle lane while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the settlement roofs until rain strengthens while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Flood the root cellars from the forest stream while keeping Mera Coalhand informed.",
          "failTitle": "Steam Below",
          "failText": "Water striking hot kilns fills rescue passages with scalding steam and weakens their roofs.",
          "death": true
        }
      ]
    },
    {
      "id": "H18C",
      "turn": 18,
      "title": "Rain and the East Line - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. The first rain reaches Elderwood while embers still cross the false firebreak.",
        "You arrive openly and must turn speed into its own kind of protection. Bram can reverse the kiln drafts, and villagers can open the old cattle lane as a bare barrier.",
        "Delay has sharpened the danger: A final coordinated effort can keep the surviving fire from entering Hazel Row."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the settlement roofs until rain strengthens before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Flood the root cellars from the forest stream before the remaining light fails.",
          "failTitle": "Steam Below",
          "failText": "Water striking hot kilns fills rescue passages with scalding steam and weakens their roofs.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reverse drafts only after clearing smoke paths, then open the cattle lane before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H19C"
        }
      ]
    },
    {
      "id": "H19A",
      "turn": 19,
      "title": "The Ash Court - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Joric and his guards face the freed burners beside the unburned heart oak.",
        "The cleanest clue survives because you handled it with care. The ledger, contracts, hidden stumps, and false firebreak show a scheme larger than illegal cutting.",
        "The clearer position reveals the stakes: The people who nearly lost their homes must see why proof matters more than revenge."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Lay out the cutting, captivity, contract, and fire plan in order.",
          "scoreDelta": 1,
          "nextNodeId": "H20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Joric to Aldric while keeping the forest closed.",
          "scoreDelta": 0,
          "nextNodeId": "H20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hand Joric to the burners for punishment.",
          "failTitle": "Vengeance in the Coppice",
          "failText": "Violence destroys testimony, and the distant ironworks denies every contract with a dead steward.",
          "death": false
        }
      ]
    },
    {
      "id": "H19B",
      "turn": 19,
      "title": "The Ash Court - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Joric and his guards face the freed burners beside the unburned heart oak.",
        "The shared search reveals details no single witness had understood. The ledger, contracts, hidden stumps, and false firebreak show a scheme larger than illegal cutting.",
        "The evidence now defines the danger: The people who nearly lost their homes must see why proof matters more than revenge."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Joric to Aldric while keeping the forest closed while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "nextNodeId": "H20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hand Joric to the burners for punishment while keeping Mera Coalhand informed.",
          "failTitle": "Vengeance in the Coppice",
          "failText": "Violence destroys testimony, and the distant ironworks denies every contract with a dead steward.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay out the cutting, captivity, contract, and fire plan in order while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "nextNodeId": "H20B"
        }
      ]
    },
    {
      "id": "H19C",
      "turn": 19,
      "title": "The Ash Court - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Joric and his guards face the freed burners beside the unburned heart oak.",
        "What remains is enough, provided you act before it is moved. The ledger, contracts, hidden stumps, and false firebreak show a scheme larger than illegal cutting.",
        "Delay has sharpened the danger: The people who nearly lost their homes must see why proof matters more than revenge."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Hand Joric to the burners for punishment before the remaining light fails.",
          "failTitle": "Vengeance in the Coppice",
          "failText": "Violence destroys testimony, and the distant ironworks denies every contract with a dead steward.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay out the cutting, captivity, contract, and fire plan in order before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "H20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Joric to Aldric while keeping the forest closed before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "H20A"
        }
      ]
    },
    {
      "id": "H20A",
      "turn": 20,
      "title": "A Living Crown - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. New green shoots rise inside the washed ring as Aldric's foresters inspect the coppice.",
        "You pause only long enough to read the danger correctly. Mera can oversee licensed burns, Bram can rebuild safe kilns, and Hazel Row asks that the old oak remain their warning.",
        "The clearer position reveals the stakes: The final settlement will decide whether Elderwood recovers through patient care or remains ruled by fear of another hidden flame."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the eastern coppice until every shaft is filled.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep Joric's vent chain as a secret defense.",
          "failTitle": "Fire Held in Reserve",
          "failText": "A hidden ignition system remains a temptation for the next steward who believes the forest is his tool.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Appoint Mera keeper and pursue the contract buyers with the full ledger.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "H20B",
      "turn": 20,
      "title": "A Living Crown - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. New green shoots rise inside the washed ring as Aldric's foresters inspect the coppice.",
        "A sober exchange of evidence keeps the group from dividing. Mera can oversee licensed burns, Bram can rebuild safe kilns, and Hazel Row asks that the old oak remain their warning.",
        "The evidence now defines the danger: The final settlement will decide whether Elderwood recovers through patient care or remains ruled by fear of another hidden flame."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep Joric's vent chain as a secret defense while keeping Mera Coalhand informed.",
          "failTitle": "Fire Held in Reserve",
          "failText": "A hidden ignition system remains a temptation for the next steward who believes the forest is his tool.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Appoint Mera keeper and pursue the contract buyers with the full ledger while keeping Mera Coalhand informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the eastern coppice until every shaft is filled while keeping Mera Coalhand informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "H20C",
      "turn": 20,
      "title": "A Living Crown - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. New green shoots rise inside the washed ring as Aldric's foresters inspect the coppice.",
        "You make up lost ground with a directness that warns everyone nearby. Mera can oversee licensed burns, Bram can rebuild safe kilns, and Hazel Row asks that the old oak remain their warning.",
        "Delay has sharpened the danger: The final settlement will decide whether Elderwood recovers through patient care or remains ruled by fear of another hidden flame."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Appoint Mera keeper and pursue the contract buyers with the full ledger before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the eastern coppice until every shaft is filled before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep Joric's vent chain as a secret defense before the remaining light fails.",
          "failTitle": "Fire Held in Reserve",
          "failText": "A hidden ignition system remains a temptation for the next steward who believes the forest is his tool.",
          "death": false
        }
      ]
    }
  ]
});
