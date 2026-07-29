window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-black-horseshoe",
  "title": "The Black Horseshoe",
  "summary": "When patrol horses begin falling lame from cracked black shoes, the ranger and farrier Rilla Dane uncover a planned crippling of Brackenwald's mounted wardens before thieves descend on the duke's breeding fair.",
  "maxTurns": 20,
  "startNodeId": "F01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The poisoned iron is withdrawn, the horse fair opens under honest guards, and Bran Coss's ledgers expose every stable he compromised. Rilla Dane receives the duke's mark as master farrier, and Thorne leaves her forge in sound bright shoes.",
    "low": "The breeding herd is saved and the worst shoes are found, but Bran's supplier network remains partly hidden. The fair is delayed while every horse in Aldric's service is reshod and every road watched on foot."
  },
  "nodes": [
    {
      "id": "F01A",
      "turn": 1,
      "title": "Three Lame Patrols - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into the horse farms and warden roads south of Oakenhurst as mounted wardens arrive from three roads with horses limping on newly fitted black shoes.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Farrier Rilla Dane shows you hairline cracks filled with dark powder, while Thorne's older shoes remain sound.",
        "The clearer position reveals the stakes: The failures are too sudden and too widely placed to be ordinary poor work."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Collect one numbered shoe from each patrol and compare breaks.",
          "scoreDelta": 1,
          "nextNodeId": "F02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Rest the horses and question their riders.",
          "scoreDelta": 0,
          "nextNodeId": "F02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne hard to prove good horses survive bad roads.",
          "failTitle": "Thorne Lamed",
          "failText": "A buried shard pierces Thorne's hoof while the sabotaged patrols remain unable to pursue.",
          "death": false
        }
      ]
    },
    {
      "id": "F01B",
      "turn": 1,
      "title": "Three Lame Patrols - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: mounted wardens arrive from three roads with horses limping on newly fitted black shoes.",
        "With Thorne close and local witnesses beside you, you compare every account. Farrier Rilla Dane shows you hairline cracks filled with dark powder, while Thorne's older shoes remain sound.",
        "The evidence now defines the danger: The failures are too sudden and too widely placed to be ordinary poor work."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Rest the horses and question their riders while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne hard to prove good horses survive bad roads while keeping Rilla Dane informed.",
          "failTitle": "Thorne Lamed",
          "failText": "A buried shard pierces Thorne's hoof while the sabotaged patrols remain unable to pursue.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Collect one numbered shoe from each patrol and compare breaks while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F02B"
        }
      ]
    },
    {
      "id": "F01C",
      "turn": 1,
      "title": "Three Lame Patrols - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, mounted wardens arrive from three roads with horses limping on newly fitted black shoes.",
        "Working against the light, you test the few signs that remain. Farrier Rilla Dane shows you hairline cracks filled with dark powder, while Thorne's older shoes remain sound.",
        "Delay has sharpened the danger: The failures are too sudden and too widely placed to be ordinary poor work."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne hard to prove good horses survive bad roads before the remaining light fails.",
          "failTitle": "Thorne Lamed",
          "failText": "A buried shard pierces Thorne's hoof while the sabotaged patrols remain unable to pursue.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Collect one numbered shoe from each patrol and compare breaks before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Rest the horses and question their riders before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F02A"
        }
      ]
    },
    {
      "id": "F02A",
      "turn": 2,
      "title": "Cold Iron, Hot Forge - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. The black shoes bend cold at their edges yet snap where a sound shoe should flex.",
        "You circle downwind and let small marks tell their order. Rilla finds pale slag inside them, evidence that weak scrap was mixed into good bar iron.",
        "The clearer position reveals the stakes: Someone is making failure look like the farriers' fault while controlling the metal they receive."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect the nearest forge accounts.",
          "scoreDelta": 0,
          "nextNodeId": "F03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse all village farriers of cheating the wardens.",
          "failTitle": "The Forges Close",
          "failText": "Honest farriers bar their doors, leaving patrol horses lame and the true supplier untouched.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test samples from every recent iron bundle.",
          "scoreDelta": 1,
          "nextNodeId": "F03A"
        }
      ]
    },
    {
      "id": "F02B",
      "turn": 2,
      "title": "Cold Iron, Hot Forge - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. The black shoes bend cold at their edges yet snap where a sound shoe should flex.",
        "You ask plain questions and watch which answers agree. Rilla finds pale slag inside them, evidence that weak scrap was mixed into good bar iron.",
        "The evidence now defines the danger: Someone is making failure look like the farriers' fault while controlling the metal they receive."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse all village farriers of cheating the wardens while keeping Rilla Dane informed.",
          "failTitle": "The Forges Close",
          "failText": "Honest farriers bar their doors, leaving patrol horses lame and the true supplier untouched.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test samples from every recent iron bundle while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect the nearest forge accounts while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F03C"
        }
      ]
    },
    {
      "id": "F02C",
      "turn": 2,
      "title": "Cold Iron, Hot Forge - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. The black shoes bend cold at their edges yet snap where a sound shoe should flex.",
        "There is no time for elegance, only for separating fresh danger from old damage. Rilla finds pale slag inside them, evidence that weak scrap was mixed into good bar iron.",
        "Delay has sharpened the danger: Someone is making failure look like the farriers' fault while controlling the metal they receive."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test samples from every recent iron bundle before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect the nearest forge accounts before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse all village farriers of cheating the wardens before the remaining light fails.",
          "failTitle": "The Forges Close",
          "failText": "Honest farriers bar their doors, leaving patrol horses lame and the true supplier untouched.",
          "death": false
        }
      ]
    },
    {
      "id": "F03A",
      "turn": 3,
      "title": "Bran Coss's Mark - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Each bad bundle bears the split-ring mark of iron factor Bran Coss.",
        "From sheltered ground, you measure tracks, tools, and distances. His receipts show full-weight quality iron delivered to six forges, but wagon scales record lighter loads.",
        "The clearer position reveals the stakes: The missing good iron and substituted scrap point to a deliberate exchange after weighing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Bran's warehouse before checking its exits.",
          "failTitle": "The Empty Warehouse",
          "failText": "A rear cart leaves while guards gather at the front, carrying records and the remaining sound iron away.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the receipts and inspect wagon bed dust.",
          "scoreDelta": 1,
          "nextNodeId": "F04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Summon Bran to explain the weight difference.",
          "scoreDelta": 0,
          "nextNodeId": "F04B"
        }
      ]
    },
    {
      "id": "F03B",
      "turn": 3,
      "title": "Bran Coss's Mark - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Each bad bundle bears the split-ring mark of iron factor Bran Coss.",
        "You keep the scene orderly while your allies search it piece by piece. His receipts show full-weight quality iron delivered to six forges, but wagon scales record lighter loads.",
        "The evidence now defines the danger: The missing good iron and substituted scrap point to a deliberate exchange after weighing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the receipts and inspect wagon bed dust while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Summon Bran to explain the weight difference while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Bran's warehouse before checking its exits while keeping Rilla Dane informed.",
          "failTitle": "The Empty Warehouse",
          "failText": "A rear cart leaves while guards gather at the front, carrying records and the remaining sound iron away.",
          "death": false
        }
      ]
    },
    {
      "id": "F03C",
      "turn": 3,
      "title": "Bran Coss's Mark - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Each bad bundle bears the split-ring mark of iron factor Bran Coss.",
        "Pressed for time, you trust hard evidence and discard rumor. His receipts show full-weight quality iron delivered to six forges, but wagon scales record lighter loads.",
        "Delay has sharpened the danger: The missing good iron and substituted scrap point to a deliberate exchange after weighing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Summon Bran to explain the weight difference before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Bran's warehouse before checking its exits before the remaining light fails.",
          "failTitle": "The Empty Warehouse",
          "failText": "A rear cart leaves while guards gather at the front, carrying records and the remaining sound iron away.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the receipts and inspect wagon bed dust before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F04C"
        }
      ]
    },
    {
      "id": "F04A",
      "turn": 4,
      "title": "The Roadside Change - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Fine black scale leads from Bran's warehouse to an abandoned toll shed.",
        "You move quietly enough to hear work and voices ahead. Inside, broken bundle cords and fresh straw show loads were opened and repacked out of rain.",
        "The clearer position reveals the stakes: The substitution happened between merchant and farrier, allowing each side to blame the other."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Match cut cord ends before disturbing the bundles.",
          "scoreDelta": 1,
          "nextNodeId": "F05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch the shed for the next delivery.",
          "scoreDelta": 0,
          "nextNodeId": "F05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the shed and every bad shoe within it.",
          "failTitle": "Smoke Over the Road",
          "failText": "The fire destroys fibers, wagon marks, and the place linking Bran to the exchange.",
          "death": false
        }
      ]
    },
    {
      "id": "F04B",
      "turn": 4,
      "title": "The Roadside Change - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Fine black scale leads from Bran's warehouse to an abandoned toll shed.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Inside, broken bundle cords and fresh straw show loads were opened and repacked out of rain.",
        "The evidence now defines the danger: The substitution happened between merchant and farrier, allowing each side to blame the other."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch the shed for the next delivery while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the shed and every bad shoe within it while keeping Rilla Dane informed.",
          "failTitle": "Smoke Over the Road",
          "failText": "The fire destroys fibers, wagon marks, and the place linking Bran to the exchange.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match cut cord ends before disturbing the bundles while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F05B"
        }
      ]
    },
    {
      "id": "F04C",
      "turn": 4,
      "title": "The Roadside Change - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Fine black scale leads from Bran's warehouse to an abandoned toll shed.",
        "You push through fatigue, knowing the next mistake may close the road. Inside, broken bundle cords and fresh straw show loads were opened and repacked out of rain.",
        "Delay has sharpened the danger: The substitution happened between merchant and farrier, allowing each side to blame the other."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the shed and every bad shoe within it before the remaining light fails.",
          "failTitle": "Smoke Over the Road",
          "failText": "The fire destroys fibers, wagon marks, and the place linking Bran to the exchange.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match cut cord ends before disturbing the bundles before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch the shed for the next delivery before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F05A"
        }
      ]
    },
    {
      "id": "F05A",
      "turn": 5,
      "title": "Rilla's Missing Striker - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. Rilla's striker, Edan, has vanished after warning her that shoes were stamped twice.",
        "A ranger's eye finds the human habit behind the apparent mystery. His apron lies beside hoofprints from a heavy draft horse and a small smear of lampblack.",
        "The clearer position reveals the stakes: Edan may have learned how compromised shoes were passed through otherwise honest forges."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question teamsters who buy lampblack.",
          "scoreDelta": 0,
          "nextNodeId": "F06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume Edan fled from guilt and abandon his trail.",
          "failTitle": "The Witness Given Up",
          "failText": "Bran's men move Edan before the only recognizable horse can lead you to him.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the draft horse by its uneven hind step.",
          "scoreDelta": 1,
          "nextNodeId": "F06A"
        }
      ]
    },
    {
      "id": "F05B",
      "turn": 5,
      "title": "Rilla's Missing Striker - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. Rilla's striker, Edan, has vanished after warning her that shoes were stamped twice.",
        "Together, the small company builds one reliable account from scattered facts. His apron lies beside hoofprints from a heavy draft horse and a small smear of lampblack.",
        "The evidence now defines the danger: Edan may have learned how compromised shoes were passed through otherwise honest forges."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume Edan fled from guilt and abandon his trail while keeping Rilla Dane informed.",
          "failTitle": "The Witness Given Up",
          "failText": "Bran's men move Edan before the only recognizable horse can lead you to him.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the draft horse by its uneven hind step while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question teamsters who buy lampblack while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F06C"
        }
      ]
    },
    {
      "id": "F05C",
      "turn": 5,
      "title": "Rilla's Missing Striker - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. Rilla's striker, Edan, has vanished after warning her that shoes were stamped twice.",
        "You take the shortest safe route and accept that concealment is nearly gone. His apron lies beside hoofprints from a heavy draft horse and a small smear of lampblack.",
        "Delay has sharpened the danger: Edan may have learned how compromised shoes were passed through otherwise honest forges."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the draft horse by its uneven hind step before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question teamsters who buy lampblack before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume Edan fled from guilt and abandon his trail before the remaining light fails.",
          "failTitle": "The Witness Given Up",
          "failText": "Bran's men move Edan before the only recognizable horse can lead you to him.",
          "death": false
        }
      ]
    },
    {
      "id": "F06A",
      "turn": 6,
      "title": "The Charcoal Barn - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. The uneven draft tracks reach a barn filled with low-grade charcoal and shoe molds.",
        "You preserve the most fragile sign before turning to the larger scene. Fresh stamps can copy six farriers' marks, while a locked stall holds Edan alive.",
        "The clearer position reveals the stakes: The network counterfeits workmanship as well as iron, spreading blame across the entire county."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick open the stall while armed men work nearby.",
          "failTitle": "The Barn Fight",
          "failText": "A lantern falls in the struggle, and fire races through charcoal around the bound striker.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Free Edan quietly and take one false stamp in its wrapping.",
          "scoreDelta": 1,
          "nextNodeId": "F07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Surround the barn with wardens on foot.",
          "scoreDelta": 0,
          "nextNodeId": "F07B"
        }
      ]
    },
    {
      "id": "F06B",
      "turn": 6,
      "title": "The Charcoal Barn - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. The uneven draft tracks reach a barn filled with low-grade charcoal and shoe molds.",
        "Each person is given one task, and confusion begins to clear. Fresh stamps can copy six farriers' marks, while a locked stall holds Edan alive.",
        "The evidence now defines the danger: The network counterfeits workmanship as well as iron, spreading blame across the entire county."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Free Edan quietly and take one false stamp in its wrapping while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Surround the barn with wardens on foot while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick open the stall while armed men work nearby while keeping Rilla Dane informed.",
          "failTitle": "The Barn Fight",
          "failText": "A lantern falls in the struggle, and fire races through charcoal around the bound striker.",
          "death": true
        }
      ]
    },
    {
      "id": "F06C",
      "turn": 6,
      "title": "The Charcoal Barn - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. The uneven draft tracks reach a barn filled with low-grade charcoal and shoe molds.",
        "The enemy has the lead, so you judge every pause against the lives at risk. Fresh stamps can copy six farriers' marks, while a locked stall holds Edan alive.",
        "Delay has sharpened the danger: The network counterfeits workmanship as well as iron, spreading blame across the entire county."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Surround the barn with wardens on foot before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick open the stall while armed men work nearby before the remaining light fails.",
          "failTitle": "The Barn Fight",
          "failText": "A lantern falls in the struggle, and fire races through charcoal around the bound striker.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Free Edan quietly and take one false stamp in its wrapping before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F07C"
        }
      ]
    },
    {
      "id": "F07A",
      "turn": 7,
      "title": "The Fair List - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Edan says Bran ordered black shoes fitted to every remount bound for Aldric's breeding fair.",
        "You watch before acting and learn who believes themselves unobserved. A copied stable list includes patrol mounts, gate teams, and the horses meant to escort the duke's broodmares.",
        "The clearer position reveals the stakes: The lamed patrols were trials for disabling every mounted guard on the same morning."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the copied list with stable records without alerting grooms.",
          "scoreDelta": 1,
          "nextNodeId": "F08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Delay the fair and begin public reshoeing.",
          "scoreDelta": 0,
          "nextNodeId": "F08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce that all black shoes are poisoned.",
          "failTitle": "Panic in the Stables",
          "failText": "Owners drive horses onto the roads at once, creating the unguarded confusion Bran needs.",
          "death": false
        }
      ]
    },
    {
      "id": "F07B",
      "turn": 7,
      "title": "The Fair List - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Edan says Bran ordered black shoes fitted to every remount bound for Aldric's breeding fair.",
        "By keeping tempers cool, you hold the inquiry on facts. A copied stable list includes patrol mounts, gate teams, and the horses meant to escort the duke's broodmares.",
        "The evidence now defines the danger: The lamed patrols were trials for disabling every mounted guard on the same morning."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Delay the fair and begin public reshoeing while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce that all black shoes are poisoned while keeping Rilla Dane informed.",
          "failTitle": "Panic in the Stables",
          "failText": "Owners drive horses onto the roads at once, creating the unguarded confusion Bran needs.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the copied list with stable records without alerting grooms while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F08B"
        }
      ]
    },
    {
      "id": "F07C",
      "turn": 7,
      "title": "The Fair List - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Edan says Bran ordered black shoes fitted to every remount bound for Aldric's breeding fair.",
        "The narrow margin leaves no room to chase every possibility. A copied stable list includes patrol mounts, gate teams, and the horses meant to escort the duke's broodmares.",
        "Delay has sharpened the danger: The lamed patrols were trials for disabling every mounted guard on the same morning."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce that all black shoes are poisoned before the remaining light fails.",
          "failTitle": "Panic in the Stables",
          "failText": "Owners drive horses onto the roads at once, creating the unguarded confusion Bran needs.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the copied list with stable records without alerting grooms before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Delay the fair and begin public reshoeing before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F08A"
        }
      ]
    },
    {
      "id": "F08A",
      "turn": 8,
      "title": "The Sound Shoes Missing - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Rilla discovers that good iron removed from the bundles was forged into unmarked shoes.",
        "You use ground, wind, and cover to approach on your own terms. Those sound shoes are stacked in Bran's private stable beside tack for forty riders.",
        "The clearer position reveals the stakes: The saboteurs intend to remain mounted while everyone protecting the fair is forced onto foot."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Seize the stable with the nearest reeve.",
          "scoreDelta": 0,
          "nextNodeId": "F09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release all forty horses into the lanes.",
          "failTitle": "A Stampede Before the Fair",
          "failText": "Loose horses injure townsfolk and erase hoof patterns tying riders to Bran.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count the prepared mounts and record their tack marks.",
          "scoreDelta": 1,
          "nextNodeId": "F09A"
        }
      ]
    },
    {
      "id": "F08B",
      "turn": 8,
      "title": "The Sound Shoes Missing - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Rilla discovers that good iron removed from the bundles was forged into unmarked shoes.",
        "Your allies close the easy exits while you examine the heart of the scene. Those sound shoes are stacked in Bran's private stable beside tack for forty riders.",
        "The evidence now defines the danger: The saboteurs intend to remain mounted while everyone protecting the fair is forced onto foot."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Release all forty horses into the lanes while keeping Rilla Dane informed.",
          "failTitle": "A Stampede Before the Fair",
          "failText": "Loose horses injure townsfolk and erase hoof patterns tying riders to Bran.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count the prepared mounts and record their tack marks while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seize the stable with the nearest reeve while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F09C"
        }
      ]
    },
    {
      "id": "F08C",
      "turn": 8,
      "title": "The Sound Shoes Missing - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Rilla discovers that good iron removed from the bundles was forged into unmarked shoes.",
        "You arrive openly and must turn speed into its own kind of protection. Those sound shoes are stacked in Bran's private stable beside tack for forty riders.",
        "Delay has sharpened the danger: The saboteurs intend to remain mounted while everyone protecting the fair is forced onto foot."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Count the prepared mounts and record their tack marks before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seize the stable with the nearest reeve before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release all forty horses into the lanes before the remaining light fails.",
          "failTitle": "A Stampede Before the Fair",
          "failText": "Loose horses injure townsfolk and erase hoof patterns tying riders to Bran.",
          "death": true
        }
      ]
    },
    {
      "id": "F09A",
      "turn": 9,
      "title": "The False Farrier - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. A traveling smith arrives offering urgent reshoeing at half price.",
        "The cleanest clue survives because you handled it with care. His nails carry the same pale slag, and his wagon has a hidden compartment for removing sound shoes.",
        "The clearer position reveals the stakes: Bran's answer to discovery is to deepen the sabotage under the guise of repair."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Beat him until he names Bran.",
          "failTitle": "A Confession Without Weight",
          "failText": "The coerced accusation cannot support the case, and frightened accomplices scatter from every forge.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let him begin one shoe while you watch his exchange method.",
          "scoreDelta": 1,
          "nextNodeId": "F10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Detain him and search the wagon before witnesses.",
          "scoreDelta": 0,
          "nextNodeId": "F10B"
        }
      ]
    },
    {
      "id": "F09B",
      "turn": 9,
      "title": "The False Farrier - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. A traveling smith arrives offering urgent reshoeing at half price.",
        "The shared search reveals details no single witness had understood. His nails carry the same pale slag, and his wagon has a hidden compartment for removing sound shoes.",
        "The evidence now defines the danger: Bran's answer to discovery is to deepen the sabotage under the guise of repair."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Let him begin one shoe while you watch his exchange method while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Detain him and search the wagon before witnesses while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Beat him until he names Bran while keeping Rilla Dane informed.",
          "failTitle": "A Confession Without Weight",
          "failText": "The coerced accusation cannot support the case, and frightened accomplices scatter from every forge.",
          "death": false
        }
      ]
    },
    {
      "id": "F09C",
      "turn": 9,
      "title": "The False Farrier - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. A traveling smith arrives offering urgent reshoeing at half price.",
        "What remains is enough, provided you act before it is moved. His nails carry the same pale slag, and his wagon has a hidden compartment for removing sound shoes.",
        "Delay has sharpened the danger: Bran's answer to discovery is to deepen the sabotage under the guise of repair."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Detain him and search the wagon before witnesses before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Beat him until he names Bran before the remaining light fails.",
          "failTitle": "A Confession Without Weight",
          "failText": "The coerced accusation cannot support the case, and frightened accomplices scatter from every forge.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let him begin one shoe while you watch his exchange method before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F10C"
        }
      ]
    },
    {
      "id": "F10A",
      "turn": 10,
      "title": "The Night Paddock - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Horses reshod by the false farrier are moved to a paddock with a cut rear fence.",
        "You pause only long enough to read the danger correctly. Beyond it, soft-wrapped hoofprints lead toward the fair's broodmare enclosure.",
        "The clearer position reveals the stakes: The plan is not merely to disrupt the fair but to steal Aldric's breeding stock during the confusion."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Map the wrapped tracks and repair the fence without showing the discovery.",
          "scoreDelta": 1,
          "nextNodeId": "F11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post hidden grooms inside the paddock.",
          "scoreDelta": 0,
          "nextNodeId": "F11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Move every broodmare to Oakenhurst at midnight.",
          "failTitle": "The Herd on the Road",
          "failText": "Bran's riders ambush the hurried herd beyond the lamps, where guards still ride weak shoes.",
          "death": true
        }
      ]
    },
    {
      "id": "F10B",
      "turn": 10,
      "title": "The Night Paddock - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Horses reshod by the false farrier are moved to a paddock with a cut rear fence.",
        "A sober exchange of evidence keeps the group from dividing. Beyond it, soft-wrapped hoofprints lead toward the fair's broodmare enclosure.",
        "The evidence now defines the danger: The plan is not merely to disrupt the fair but to steal Aldric's breeding stock during the confusion."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Post hidden grooms inside the paddock while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Move every broodmare to Oakenhurst at midnight while keeping Rilla Dane informed.",
          "failTitle": "The Herd on the Road",
          "failText": "Bran's riders ambush the hurried herd beyond the lamps, where guards still ride weak shoes.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Map the wrapped tracks and repair the fence without showing the discovery while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F11B"
        }
      ]
    },
    {
      "id": "F10C",
      "turn": 10,
      "title": "The Night Paddock - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Horses reshod by the false farrier are moved to a paddock with a cut rear fence.",
        "You make up lost ground with a directness that warns everyone nearby. Beyond it, soft-wrapped hoofprints lead toward the fair's broodmare enclosure.",
        "Delay has sharpened the danger: The plan is not merely to disrupt the fair but to steal Aldric's breeding stock during the confusion."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Move every broodmare to Oakenhurst at midnight before the remaining light fails.",
          "failTitle": "The Herd on the Road",
          "failText": "Bran's riders ambush the hurried herd beyond the lamps, where guards still ride weak shoes.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Map the wrapped tracks and repair the fence without showing the discovery before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post hidden grooms inside the paddock before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F11A"
        }
      ]
    },
    {
      "id": "F11A",
      "turn": 11,
      "title": "A Nail in the Ledger - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. Edan recalls that Bran paid accomplices by hiding clipped silver beneath boxes of horseshoe nails.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. One unopened box in the toll shed bears a false farrier's delivery number.",
        "The clearer position reveals the stakes: The payment method can connect ordinary teamsters, stable hands, and riders to one organizer."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the sealed box to Aldric's magistrate.",
          "scoreDelta": 0,
          "nextNodeId": "F12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the nails to count the coins faster.",
          "failTitle": "Silver Without Context",
          "failText": "Once mixed on the floor, the payment can be called forgotten savings or road money.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the box with Rilla and a reeve as witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "F12A"
        }
      ]
    },
    {
      "id": "F11B",
      "turn": 11,
      "title": "A Nail in the Ledger - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. Edan recalls that Bran paid accomplices by hiding clipped silver beneath boxes of horseshoe nails.",
        "With Thorne close and local witnesses beside you, you compare every account. One unopened box in the toll shed bears a false farrier's delivery number.",
        "The evidence now defines the danger: The payment method can connect ordinary teamsters, stable hands, and riders to one organizer."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the nails to count the coins faster while keeping Rilla Dane informed.",
          "failTitle": "Silver Without Context",
          "failText": "Once mixed on the floor, the payment can be called forgotten savings or road money.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the box with Rilla and a reeve as witnesses while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the sealed box to Aldric's magistrate while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F12C"
        }
      ]
    },
    {
      "id": "F11C",
      "turn": 11,
      "title": "A Nail in the Ledger - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. Edan recalls that Bran paid accomplices by hiding clipped silver beneath boxes of horseshoe nails.",
        "Working against the light, you test the few signs that remain. One unopened box in the toll shed bears a false farrier's delivery number.",
        "Delay has sharpened the danger: The payment method can connect ordinary teamsters, stable hands, and riders to one organizer."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Open the box with Rilla and a reeve as witnesses before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the sealed box to Aldric's magistrate before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the nails to count the coins faster before the remaining light fails.",
          "failTitle": "Silver Without Context",
          "failText": "Once mixed on the floor, the payment can be called forgotten savings or road money.",
          "death": false
        }
      ]
    },
    {
      "id": "F12A",
      "turn": 12,
      "title": "The Broodmare Bell - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. The lead broodmare's bell is found tied to a gelding in a lower pasture.",
        "You circle downwind and let small marks tell their order. Riders following sound rather than sight would escort the wrong group while thieves take the silent mares uphill.",
        "The clearer position reveals the stakes: Bran has prepared deception for guards even if their horses remain sound."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the bell through town to expose the trick.",
          "failTitle": "The Thieves Change Plans",
          "failText": "Bran's watchers hear the public alarm and move the mares before guards can close the upper path.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Return the bell secretly and mark the false gelding.",
          "scoreDelta": 1,
          "nextNodeId": "F13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the escort captain about the exchange.",
          "scoreDelta": 0,
          "nextNodeId": "F13B"
        }
      ]
    },
    {
      "id": "F12B",
      "turn": 12,
      "title": "The Broodmare Bell - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. The lead broodmare's bell is found tied to a gelding in a lower pasture.",
        "You ask plain questions and watch which answers agree. Riders following sound rather than sight would escort the wrong group while thieves take the silent mares uphill.",
        "The evidence now defines the danger: Bran has prepared deception for guards even if their horses remain sound."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Return the bell secretly and mark the false gelding while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the escort captain about the exchange while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the bell through town to expose the trick while keeping Rilla Dane informed.",
          "failTitle": "The Thieves Change Plans",
          "failText": "Bran's watchers hear the public alarm and move the mares before guards can close the upper path.",
          "death": false
        }
      ]
    },
    {
      "id": "F12C",
      "turn": 12,
      "title": "The Broodmare Bell - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. The lead broodmare's bell is found tied to a gelding in a lower pasture.",
        "There is no time for elegance, only for separating fresh danger from old damage. Riders following sound rather than sight would escort the wrong group while thieves take the silent mares uphill.",
        "Delay has sharpened the danger: Bran has prepared deception for guards even if their horses remain sound."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the escort captain about the exchange before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the bell through town to expose the trick before the remaining light fails.",
          "failTitle": "The Thieves Change Plans",
          "failText": "Bran's watchers hear the public alarm and move the mares before guards can close the upper path.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Return the bell secretly and mark the false gelding before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F13C"
        }
      ]
    },
    {
      "id": "F13A",
      "turn": 13,
      "title": "The Upper Horse Road - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Wrapped hoofprints lead to a disused drove road above the fairground.",
        "From sheltered ground, you measure tracks, tools, and distances. Freshly repaired gates can funnel a herd toward Bran's private valley without a rider entering town.",
        "The clearer position reveals the stakes: The theft is built into fences and animal habit, making it possible amid noise without open battle."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Reverse one gate and leave the others appearing untouched.",
          "scoreDelta": 1,
          "nextNodeId": "F14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place foot wardens at every repaired gate.",
          "scoreDelta": 0,
          "nextNodeId": "F14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Barricade the first gate with wagons.",
          "failTitle": "The Escape Route Revealed",
          "failText": "The obvious barrier tells Bran exactly where you found his road, and his men cut a new opening behind the herd.",
          "death": false
        }
      ]
    },
    {
      "id": "F13B",
      "turn": 13,
      "title": "The Upper Horse Road - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Wrapped hoofprints lead to a disused drove road above the fairground.",
        "You keep the scene orderly while your allies search it piece by piece. Freshly repaired gates can funnel a herd toward Bran's private valley without a rider entering town.",
        "The evidence now defines the danger: The theft is built into fences and animal habit, making it possible amid noise without open battle."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Place foot wardens at every repaired gate while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Barricade the first gate with wagons while keeping Rilla Dane informed.",
          "failTitle": "The Escape Route Revealed",
          "failText": "The obvious barrier tells Bran exactly where you found his road, and his men cut a new opening behind the herd.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reverse one gate and leave the others appearing untouched while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F14B"
        }
      ]
    },
    {
      "id": "F13C",
      "turn": 13,
      "title": "The Upper Horse Road - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Wrapped hoofprints lead to a disused drove road above the fairground.",
        "Pressed for time, you trust hard evidence and discard rumor. Freshly repaired gates can funnel a herd toward Bran's private valley without a rider entering town.",
        "Delay has sharpened the danger: The theft is built into fences and animal habit, making it possible amid noise without open battle."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Barricade the first gate with wagons before the remaining light fails.",
          "failTitle": "The Escape Route Revealed",
          "failText": "The obvious barrier tells Bran exactly where you found his road, and his men cut a new opening behind the herd.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reverse one gate and leave the others appearing untouched before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place foot wardens at every repaired gate before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F14A"
        }
      ]
    },
    {
      "id": "F14A",
      "turn": 14,
      "title": "Bran's Honest Face - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Bran arrives at the fair offering sound shoes from his hidden stock.",
        "You move quietly enough to hear work and voices ahead. He blames distant smelters, promises compensation, and asks control of the emergency forge lines.",
        "The clearer position reveals the stakes: If accepted, the man who caused the crisis will command every repair and stable movement."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Allow sales but put Rilla over inspection.",
          "scoreDelta": 0,
          "nextNodeId": "F15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest Bran before displaying the evidence.",
          "failTitle": "The Factor's Friends",
          "failText": "Merchants block the arrest as an attack on trade, and Bran's riders begin their move under cover of the dispute.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Show him one copied stamp and watch which forge he protects.",
          "scoreDelta": 1,
          "nextNodeId": "F15A"
        }
      ]
    },
    {
      "id": "F14B",
      "turn": 14,
      "title": "Bran's Honest Face - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Bran arrives at the fair offering sound shoes from his hidden stock.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. He blames distant smelters, promises compensation, and asks control of the emergency forge lines.",
        "The evidence now defines the danger: If accepted, the man who caused the crisis will command every repair and stable movement."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest Bran before displaying the evidence while keeping Rilla Dane informed.",
          "failTitle": "The Factor's Friends",
          "failText": "Merchants block the arrest as an attack on trade, and Bran's riders begin their move under cover of the dispute.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Show him one copied stamp and watch which forge he protects while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Allow sales but put Rilla over inspection while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F15C"
        }
      ]
    },
    {
      "id": "F14C",
      "turn": 14,
      "title": "Bran's Honest Face - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Bran arrives at the fair offering sound shoes from his hidden stock.",
        "You push through fatigue, knowing the next mistake may close the road. He blames distant smelters, promises compensation, and asks control of the emergency forge lines.",
        "Delay has sharpened the danger: If accepted, the man who caused the crisis will command every repair and stable movement."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Show him one copied stamp and watch which forge he protects before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Allow sales but put Rilla over inspection before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest Bran before displaying the evidence before the remaining light fails.",
          "failTitle": "The Factor's Friends",
          "failText": "Merchants block the arrest as an attack on trade, and Bran's riders begin their move under cover of the dispute.",
          "death": false
        }
      ]
    },
    {
      "id": "F15A",
      "turn": 15,
      "title": "Rain on the Fair - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. Hard rain turns the fairground to mud as the first weak shoes split.",
        "A ranger's eye finds the human habit behind the apparent mystery. Stable teams crowd the forges, exactly blocking the southern gate from view.",
        "The clearer position reveals the stakes: Bran's wrapped riders can move behind the noise unless the rescue effort and defense become one plan."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive lame horses aside with whips.",
          "failTitle": "Fear Among the Herd",
          "failText": "Panicked animals break rails and open a path straight toward Bran's upper road.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Create numbered repair lanes that leave sightlines to every gate.",
          "scoreDelta": 1,
          "nextNodeId": "F16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the fair while Rilla treats the worst horses.",
          "scoreDelta": 0,
          "nextNodeId": "F16B"
        }
      ]
    },
    {
      "id": "F15B",
      "turn": 15,
      "title": "Rain on the Fair - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. Hard rain turns the fairground to mud as the first weak shoes split.",
        "Together, the small company builds one reliable account from scattered facts. Stable teams crowd the forges, exactly blocking the southern gate from view.",
        "The evidence now defines the danger: Bran's wrapped riders can move behind the noise unless the rescue effort and defense become one plan."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Create numbered repair lanes that leave sightlines to every gate while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the fair while Rilla treats the worst horses while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive lame horses aside with whips while keeping Rilla Dane informed.",
          "failTitle": "Fear Among the Herd",
          "failText": "Panicked animals break rails and open a path straight toward Bran's upper road.",
          "death": true
        }
      ]
    },
    {
      "id": "F15C",
      "turn": 15,
      "title": "Rain on the Fair - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. Hard rain turns the fairground to mud as the first weak shoes split.",
        "You take the shortest safe route and accept that concealment is nearly gone. Stable teams crowd the forges, exactly blocking the southern gate from view.",
        "Delay has sharpened the danger: Bran's wrapped riders can move behind the noise unless the rescue effort and defense become one plan."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the fair while Rilla treats the worst horses before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive lame horses aside with whips before the remaining light fails.",
          "failTitle": "Fear Among the Herd",
          "failText": "Panicked animals break rails and open a path straight toward Bran's upper road.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Create numbered repair lanes that leave sightlines to every gate before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F16C"
        }
      ]
    },
    {
      "id": "F16A",
      "turn": 16,
      "title": "The Silent Riders - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Bran's men enter through the southern gate with cloth wrapped around sound hooves.",
        "You preserve the most fragile sign before turning to the larger scene. They wear stable aprons over mail and move toward the broodmare pens rather than the money stalls.",
        "The clearer position reveals the stakes: Their disguise depends on everyone seeing workers where armed thieves stand."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut the lead rider's saddle girth with a low arrow and bar the pen lane.",
          "scoreDelta": 1,
          "nextNodeId": "F17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Challenge the group while foot wardens close behind.",
          "scoreDelta": 0,
          "nextNodeId": "F17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot into the horses to stop the riders.",
          "failTitle": "The Herd Pays the Price",
          "failText": "Wounded mounts crash among the broodmares, turning a controlled defense into slaughter and flight.",
          "death": true
        }
      ]
    },
    {
      "id": "F16B",
      "turn": 16,
      "title": "The Silent Riders - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Bran's men enter through the southern gate with cloth wrapped around sound hooves.",
        "Each person is given one task, and confusion begins to clear. They wear stable aprons over mail and move toward the broodmare pens rather than the money stalls.",
        "The evidence now defines the danger: Their disguise depends on everyone seeing workers where armed thieves stand."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Challenge the group while foot wardens close behind while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot into the horses to stop the riders while keeping Rilla Dane informed.",
          "failTitle": "The Herd Pays the Price",
          "failText": "Wounded mounts crash among the broodmares, turning a controlled defense into slaughter and flight.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the lead rider's saddle girth with a low arrow and bar the pen lane while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F17B"
        }
      ]
    },
    {
      "id": "F16C",
      "turn": 16,
      "title": "The Silent Riders - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Bran's men enter through the southern gate with cloth wrapped around sound hooves.",
        "The enemy has the lead, so you judge every pause against the lives at risk. They wear stable aprons over mail and move toward the broodmare pens rather than the money stalls.",
        "Delay has sharpened the danger: Their disguise depends on everyone seeing workers where armed thieves stand."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot into the horses to stop the riders before the remaining light fails.",
          "failTitle": "The Herd Pays the Price",
          "failText": "Wounded mounts crash among the broodmares, turning a controlled defense into slaughter and flight.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the lead rider's saddle girth with a low arrow and bar the pen lane before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Challenge the group while foot wardens close behind before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F17A"
        }
      ]
    },
    {
      "id": "F17A",
      "turn": 17,
      "title": "The Reversed Gate - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. The stolen herd reaches the upper road but your reversed gate turns it into a fenced meadow.",
        "You watch before acting and learn who believes themselves unobserved. Bran rides for the hinge with two men while Rilla calms the lead mare from the lower rail.",
        "The clearer position reveals the stakes: Holding the gate without frightening the herd can end the theft and keep witnesses alive."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Brace the gate with foot wardens until the herd settles.",
          "scoreDelta": 0,
          "nextNodeId": "F18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Thorne directly into Bran among the mares.",
          "failTitle": "Hooves in a Closed Field",
          "failText": "The collision starts a stampede that breaks the far fence and carries the herd into ravines.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin Bran's cloak to the gatepost and cut his reins.",
          "scoreDelta": 1,
          "nextNodeId": "F18A"
        }
      ]
    },
    {
      "id": "F17B",
      "turn": 17,
      "title": "The Reversed Gate - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. The stolen herd reaches the upper road but your reversed gate turns it into a fenced meadow.",
        "By keeping tempers cool, you hold the inquiry on facts. Bran rides for the hinge with two men while Rilla calms the lead mare from the lower rail.",
        "The evidence now defines the danger: Holding the gate without frightening the herd can end the theft and keep witnesses alive."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Thorne directly into Bran among the mares while keeping Rilla Dane informed.",
          "failTitle": "Hooves in a Closed Field",
          "failText": "The collision starts a stampede that breaks the far fence and carries the herd into ravines.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin Bran's cloak to the gatepost and cut his reins while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Brace the gate with foot wardens until the herd settles while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F18C"
        }
      ]
    },
    {
      "id": "F17C",
      "turn": 17,
      "title": "The Reversed Gate - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. The stolen herd reaches the upper road but your reversed gate turns it into a fenced meadow.",
        "The narrow margin leaves no room to chase every possibility. Bran rides for the hinge with two men while Rilla calms the lead mare from the lower rail.",
        "Delay has sharpened the danger: Holding the gate without frightening the herd can end the theft and keep witnesses alive."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Pin Bran's cloak to the gatepost and cut his reins before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Brace the gate with foot wardens until the herd settles before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Thorne directly into Bran among the mares before the remaining light fails.",
          "failTitle": "Hooves in a Closed Field",
          "failText": "The collision starts a stampede that breaks the far fence and carries the herd into ravines.",
          "death": true
        }
      ]
    },
    {
      "id": "F18A",
      "turn": 18,
      "title": "Bran's Iron Book - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Bran drops a thin ledger bound between two false horseshoe plates.",
        "You use ground, wind, and cover to approach on your own terms. It lists scrap mixtures, copied stamps, stable bribes, and buyers for stolen broodmares.",
        "The clearer position reveals the stakes: The book turns a single failed raid into proof of the whole planned crippled county."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rip out only the page naming Bran.",
          "failTitle": "The Network Left Whole",
          "failText": "Minor accomplices and buyers vanish from judgment when the rest of the iron book is discarded.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the plates together and have Edan identify the marks.",
          "scoreDelta": 1,
          "nextNodeId": "F19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the ledger to Aldric under mounted escort.",
          "scoreDelta": 0,
          "nextNodeId": "F19B"
        }
      ]
    },
    {
      "id": "F18B",
      "turn": 18,
      "title": "Bran's Iron Book - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Bran drops a thin ledger bound between two false horseshoe plates.",
        "Your allies close the easy exits while you examine the heart of the scene. It lists scrap mixtures, copied stamps, stable bribes, and buyers for stolen broodmares.",
        "The evidence now defines the danger: The book turns a single failed raid into proof of the whole planned crippled county."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the plates together and have Edan identify the marks while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the ledger to Aldric under mounted escort while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rip out only the page naming Bran while keeping Rilla Dane informed.",
          "failTitle": "The Network Left Whole",
          "failText": "Minor accomplices and buyers vanish from judgment when the rest of the iron book is discarded.",
          "death": false
        }
      ]
    },
    {
      "id": "F18C",
      "turn": 18,
      "title": "Bran's Iron Book - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Bran drops a thin ledger bound between two false horseshoe plates.",
        "You arrive openly and must turn speed into its own kind of protection. It lists scrap mixtures, copied stamps, stable bribes, and buyers for stolen broodmares.",
        "Delay has sharpened the danger: The book turns a single failed raid into proof of the whole planned crippled county."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the ledger to Aldric under mounted escort before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rip out only the page naming Bran before the remaining light fails.",
          "failTitle": "The Network Left Whole",
          "failText": "Minor accomplices and buyers vanish from judgment when the rest of the iron book is discarded.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the plates together and have Edan identify the marks before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F19C"
        }
      ]
    },
    {
      "id": "F19A",
      "turn": 19,
      "title": "The Farriers' Circle - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Rilla gathers every accused farrier around the emergency forge.",
        "The cleanest clue survives because you handled it with care. The copied stamps clear some, implicate others, and show how Bran played honest craftspeople against wardens.",
        "The clearer position reveals the stakes: Restoring trust matters because Brackenwald cannot keep roads without their shared skill."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare each real stamp to its copy before the reeve.",
          "scoreDelta": 1,
          "nextNodeId": "F20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Suspend all disputed farriers until separate hearings.",
          "scoreDelta": 0,
          "nextNodeId": "F20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let riders choose which farriers to punish.",
          "failTitle": "The Forge Mob",
          "failText": "Old grudges replace evidence, and Bran's deliberate pattern dissolves into local revenge.",
          "death": false
        }
      ]
    },
    {
      "id": "F19B",
      "turn": 19,
      "title": "The Farriers' Circle - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Rilla gathers every accused farrier around the emergency forge.",
        "The shared search reveals details no single witness had understood. The copied stamps clear some, implicate others, and show how Bran played honest craftspeople against wardens.",
        "The evidence now defines the danger: Restoring trust matters because Brackenwald cannot keep roads without their shared skill."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Suspend all disputed farriers until separate hearings while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "nextNodeId": "F20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let riders choose which farriers to punish while keeping Rilla Dane informed.",
          "failTitle": "The Forge Mob",
          "failText": "Old grudges replace evidence, and Bran's deliberate pattern dissolves into local revenge.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare each real stamp to its copy before the reeve while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "nextNodeId": "F20B"
        }
      ]
    },
    {
      "id": "F19C",
      "turn": 19,
      "title": "The Farriers' Circle - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Rilla gathers every accused farrier around the emergency forge.",
        "What remains is enough, provided you act before it is moved. The copied stamps clear some, implicate others, and show how Bran played honest craftspeople against wardens.",
        "Delay has sharpened the danger: Restoring trust matters because Brackenwald cannot keep roads without their shared skill."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let riders choose which farriers to punish before the remaining light fails.",
          "failTitle": "The Forge Mob",
          "failText": "Old grudges replace evidence, and Bran's deliberate pattern dissolves into local revenge.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare each real stamp to its copy before the reeve before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "F20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Suspend all disputed farriers until separate hearings before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "F20A"
        }
      ]
    },
    {
      "id": "F20A",
      "turn": 20,
      "title": "Bright Shoes at Dawn - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. The broodmares stand safe while Aldric's patrols receive sound new shoes.",
        "You pause only long enough to read the danger correctly. Rilla can oversee a permanent iron test, Edan can testify, and Bran's buyer list reaches beyond the fair.",
        "The clearer position reveals the stakes: The final settlement can repair both horses and the chain of trust that failed them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Reshoe the wardens and postpone judgment on the wider network.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Melt all seized iron together for quick reuse.",
          "failTitle": "Bad Metal Hidden Again",
          "failText": "The mixed iron preserves the same weakness under a new shape and destroys the proof held in each batch.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Establish Rilla's inspection mark and pursue every named buyer.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "F20B",
      "turn": 20,
      "title": "Bright Shoes at Dawn - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. The broodmares stand safe while Aldric's patrols receive sound new shoes.",
        "A sober exchange of evidence keeps the group from dividing. Rilla can oversee a permanent iron test, Edan can testify, and Bran's buyer list reaches beyond the fair.",
        "The evidence now defines the danger: The final settlement can repair both horses and the chain of trust that failed them."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Melt all seized iron together for quick reuse while keeping Rilla Dane informed.",
          "failTitle": "Bad Metal Hidden Again",
          "failText": "The mixed iron preserves the same weakness under a new shape and destroys the proof held in each batch.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Establish Rilla's inspection mark and pursue every named buyer while keeping Rilla Dane informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Reshoe the wardens and postpone judgment on the wider network while keeping Rilla Dane informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "F20C",
      "turn": 20,
      "title": "Bright Shoes at Dawn - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. The broodmares stand safe while Aldric's patrols receive sound new shoes.",
        "You make up lost ground with a directness that warns everyone nearby. Rilla can oversee a permanent iron test, Edan can testify, and Bran's buyer list reaches beyond the fair.",
        "Delay has sharpened the danger: The final settlement can repair both horses and the chain of trust that failed them."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Establish Rilla's inspection mark and pursue every named buyer before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Reshoe the wardens and postpone judgment on the wider network before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Melt all seized iron together for quick reuse before the remaining light fails.",
          "failTitle": "Bad Metal Hidden Again",
          "failText": "The mixed iron preserves the same weakness under a new shape and destroys the proof held in each batch.",
          "death": false
        }
      ]
    }
  ]
});
