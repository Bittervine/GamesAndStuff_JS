window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "needles-in-the-wool",
  "title": "Needles in the Wool",
  "summary": "Winter wool leaves spinners burned and patrol cloaks brittle. The ranger and dyer Ada Venn trace tainted wash, switched bale marks, and guild pressure to a cloth master willing to cripple Duke Aldric's wardens for a monopoly.",
  "maxTurns": 20,
  "startNodeId": "I01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The clean cloaks reach every mountain post, Harl Krail's hidden accounts break his attempted monopoly, and the injured workers receive restitution from his seized stores. Ada Venn is chosen to oversee an open cloth assay in Oakenhurst.",
    "low": "The wardens receive safe wool and Krail loses his vats, but fire or water destroys part of the account linking him to distant buyers. Oakenhurst's cloth trade survives under strict inspection and lingering distrust."
  },
  "nodes": [
    {
      "id": "I01A",
      "turn": 1,
      "title": "Hands Like Fire - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into the fulling yards and sheep villages around Oakenhurst as spinners in three Oakenhurst yards suffer blistered hands after opening winter wool marked for Duke Aldric's patrols.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Dyer Ada Venn finds sharp white dust deep inside the fleeces, where ordinary road dirt could not settle.",
        "The clearer position reveals the stakes: The taint harms workers now and could weaken every cloak sent to the Gray Mountain watch."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal samples from each bale and wash one under controlled water.",
          "scoreDelta": 1,
          "nextNodeId": "I02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the yards and question the wool sorters.",
          "scoreDelta": 0,
          "nextNodeId": "I02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the suspect bales before anyone else is hurt.",
          "failTitle": "Smoke Without an Answer",
          "failText": "The wool, marks, and hidden dust vanish together, leaving the source free to taint another shipment.",
          "death": false
        }
      ]
    },
    {
      "id": "I01B",
      "turn": 1,
      "title": "Hands Like Fire - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: spinners in three Oakenhurst yards suffer blistered hands after opening winter wool marked for Duke Aldric's patrols.",
        "With Thorne close and local witnesses beside you, you compare every account. Dyer Ada Venn finds sharp white dust deep inside the fleeces, where ordinary road dirt could not settle.",
        "The evidence now defines the danger: The taint harms workers now and could weaken every cloak sent to the Gray Mountain watch."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the yards and question the wool sorters while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the suspect bales before anyone else is hurt while keeping Ada Venn informed.",
          "failTitle": "Smoke Without an Answer",
          "failText": "The wool, marks, and hidden dust vanish together, leaving the source free to taint another shipment.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal samples from each bale and wash one under controlled water while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I02B"
        }
      ]
    },
    {
      "id": "I01C",
      "turn": 1,
      "title": "Hands Like Fire - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, spinners in three Oakenhurst yards suffer blistered hands after opening winter wool marked for Duke Aldric's patrols.",
        "Working against the light, you test the few signs that remain. Dyer Ada Venn finds sharp white dust deep inside the fleeces, where ordinary road dirt could not settle.",
        "Delay has sharpened the danger: The taint harms workers now and could weaken every cloak sent to the Gray Mountain watch."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the suspect bales before anyone else is hurt before the remaining light fails.",
          "failTitle": "Smoke Without an Answer",
          "failText": "The wool, marks, and hidden dust vanish together, leaving the source free to taint another shipment.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal samples from each bale and wash one under controlled water before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the yards and question the wool sorters before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I02A"
        }
      ]
    },
    {
      "id": "I02A",
      "turn": 2,
      "title": "The White Dust - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. Ada identifies quicklime mixed with a bitter mordant used to strip grease from old cloth.",
        "You circle downwind and let small marks tell their order. The mixture was sprinkled after shearing but before the bales were bound, and one clump bears red sealing fiber.",
        "The clearer position reveals the stakes: Someone with access to cloth preparation, not a shepherd's field, poisoned the fleece."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect each washhouse using the same mordant.",
          "scoreDelta": 0,
          "nextNodeId": "I03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Taste the dust to distinguish lime from chalk.",
          "failTitle": "A Caustic Test",
          "failText": "The powder burns your mouth and throat, ending the inquiry in a healer's room.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the red fiber with Oakenhurst bale cords.",
          "scoreDelta": 1,
          "nextNodeId": "I03A"
        }
      ]
    },
    {
      "id": "I02B",
      "turn": 2,
      "title": "The White Dust - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. Ada identifies quicklime mixed with a bitter mordant used to strip grease from old cloth.",
        "You ask plain questions and watch which answers agree. The mixture was sprinkled after shearing but before the bales were bound, and one clump bears red sealing fiber.",
        "The evidence now defines the danger: Someone with access to cloth preparation, not a shepherd's field, poisoned the fleece."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Taste the dust to distinguish lime from chalk while keeping Ada Venn informed.",
          "failTitle": "A Caustic Test",
          "failText": "The powder burns your mouth and throat, ending the inquiry in a healer's room.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the red fiber with Oakenhurst bale cords while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect each washhouse using the same mordant while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I03C"
        }
      ]
    },
    {
      "id": "I02C",
      "turn": 2,
      "title": "The White Dust - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. Ada identifies quicklime mixed with a bitter mordant used to strip grease from old cloth.",
        "There is no time for elegance, only for separating fresh danger from old damage. The mixture was sprinkled after shearing but before the bales were bound, and one clump bears red sealing fiber.",
        "Delay has sharpened the danger: Someone with access to cloth preparation, not a shepherd's field, poisoned the fleece."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the red fiber with Oakenhurst bale cords before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect each washhouse using the same mordant before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Taste the dust to distinguish lime from chalk before the remaining light fails.",
          "failTitle": "A Caustic Test",
          "failText": "The powder burns your mouth and throat, ending the inquiry in a healer's room.",
          "death": true
        }
      ]
    },
    {
      "id": "I03A",
      "turn": 3,
      "title": "Marks Cut Twice - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Several bales carry a shepherd's notch beneath a newer guild stamp.",
        "From sheltered ground, you measure tracks, tools, and distances. The upper stamp belongs to Master Harl Krail, whose contracts promise replacement cloth if rivals fail Aldric's order.",
        "The clearer position reveals the stakes: Krail profits from the exact disaster spreading through independent yards."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize all cloth bearing Krail's stamp.",
          "failTitle": "The Trade Turns Hostile",
          "failText": "Honest buyers and workers caught under the same mark rally around Krail against a broad confiscation.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record both marks before separating the bindings.",
          "scoreDelta": 1,
          "nextNodeId": "I04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Summon Krail to explain his handling route.",
          "scoreDelta": 0,
          "nextNodeId": "I04B"
        }
      ]
    },
    {
      "id": "I03B",
      "turn": 3,
      "title": "Marks Cut Twice - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Several bales carry a shepherd's notch beneath a newer guild stamp.",
        "You keep the scene orderly while your allies search it piece by piece. The upper stamp belongs to Master Harl Krail, whose contracts promise replacement cloth if rivals fail Aldric's order.",
        "The evidence now defines the danger: Krail profits from the exact disaster spreading through independent yards."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Record both marks before separating the bindings while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Summon Krail to explain his handling route while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize all cloth bearing Krail's stamp while keeping Ada Venn informed.",
          "failTitle": "The Trade Turns Hostile",
          "failText": "Honest buyers and workers caught under the same mark rally around Krail against a broad confiscation.",
          "death": false
        }
      ]
    },
    {
      "id": "I03C",
      "turn": 3,
      "title": "Marks Cut Twice - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Several bales carry a shepherd's notch beneath a newer guild stamp.",
        "Pressed for time, you trust hard evidence and discard rumor. The upper stamp belongs to Master Harl Krail, whose contracts promise replacement cloth if rivals fail Aldric's order.",
        "Delay has sharpened the danger: Krail profits from the exact disaster spreading through independent yards."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Summon Krail to explain his handling route before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize all cloth bearing Krail's stamp before the remaining light fails.",
          "failTitle": "The Trade Turns Hostile",
          "failText": "Honest buyers and workers caught under the same mark rally around Krail against a broad confiscation.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record both marks before separating the bindings before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I04C"
        }
      ]
    },
    {
      "id": "I04A",
      "turn": 4,
      "title": "The Dry Fulling Mill - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Tomas Gray's fulling mill stands idle though its wheel race runs strongly.",
        "You move quietly enough to hear work and voices ahead. Lime dust coats one locked trough, while the clean finishing water has been diverted through a hidden plank gate.",
        "The clearer position reveals the stakes: The tainting required control of both powder and wash water inside a rival's mill."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Trace footprints between the trough and hidden gate.",
          "scoreDelta": 1,
          "nextNodeId": "I05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the mill with Tomas and a reeve.",
          "scoreDelta": 0,
          "nextNodeId": "I05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release the full race through every trough.",
          "failTitle": "The Evidence Washed Away",
          "failText": "The sudden flood carries powder, fibers, and footprints into the river.",
          "death": false
        }
      ]
    },
    {
      "id": "I04B",
      "turn": 4,
      "title": "The Dry Fulling Mill - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Tomas Gray's fulling mill stands idle though its wheel race runs strongly.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Lime dust coats one locked trough, while the clean finishing water has been diverted through a hidden plank gate.",
        "The evidence now defines the danger: The tainting required control of both powder and wash water inside a rival's mill."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the mill with Tomas and a reeve while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release the full race through every trough while keeping Ada Venn informed.",
          "failTitle": "The Evidence Washed Away",
          "failText": "The sudden flood carries powder, fibers, and footprints into the river.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace footprints between the trough and hidden gate while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I05B"
        }
      ]
    },
    {
      "id": "I04C",
      "turn": 4,
      "title": "The Dry Fulling Mill - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Tomas Gray's fulling mill stands idle though its wheel race runs strongly.",
        "You push through fatigue, knowing the next mistake may close the road. Lime dust coats one locked trough, while the clean finishing water has been diverted through a hidden plank gate.",
        "Delay has sharpened the danger: The tainting required control of both powder and wash water inside a rival's mill."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Release the full race through every trough before the remaining light fails.",
          "failTitle": "The Evidence Washed Away",
          "failText": "The sudden flood carries powder, fibers, and footprints into the river.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace footprints between the trough and hidden gate before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the mill with Tomas and a reeve before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I05A"
        }
      ]
    },
    {
      "id": "I05A",
      "turn": 5,
      "title": "Ada's Missing Cart - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. A cart carrying Ada's clean alum has vanished between her yard and the mill.",
        "A ranger's eye finds the human habit behind the apparent mystery. Wheel tracks enter Krail's covered market shed and leave with a heavier axle bite.",
        "The clearer position reveals the stakes: The conspirators may be replacing safe supplies as well as contaminating finished bales."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask market porters who handled the cart.",
          "scoreDelta": 0,
          "nextNodeId": "I06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break into every crate inside Krail's shed.",
          "failTitle": "The Shed Emptied in Noise",
          "failText": "Crashing boxes warn Krail's carriers and mix lawful dye goods with the switched supplies.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the changed axle marks beyond the shed.",
          "scoreDelta": 1,
          "nextNodeId": "I06A"
        }
      ]
    },
    {
      "id": "I05B",
      "turn": 5,
      "title": "Ada's Missing Cart - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. A cart carrying Ada's clean alum has vanished between her yard and the mill.",
        "Together, the small company builds one reliable account from scattered facts. Wheel tracks enter Krail's covered market shed and leave with a heavier axle bite.",
        "The evidence now defines the danger: The conspirators may be replacing safe supplies as well as contaminating finished bales."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break into every crate inside Krail's shed while keeping Ada Venn informed.",
          "failTitle": "The Shed Emptied in Noise",
          "failText": "Crashing boxes warn Krail's carriers and mix lawful dye goods with the switched supplies.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the changed axle marks beyond the shed while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask market porters who handled the cart while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I06C"
        }
      ]
    },
    {
      "id": "I05C",
      "turn": 5,
      "title": "Ada's Missing Cart - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. A cart carrying Ada's clean alum has vanished between her yard and the mill.",
        "You take the shortest safe route and accept that concealment is nearly gone. Wheel tracks enter Krail's covered market shed and leave with a heavier axle bite.",
        "Delay has sharpened the danger: The conspirators may be replacing safe supplies as well as contaminating finished bales."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the changed axle marks beyond the shed before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask market porters who handled the cart before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break into every crate inside Krail's shed before the remaining light fails.",
          "failTitle": "The Shed Emptied in Noise",
          "failText": "Crashing boxes warn Krail's carriers and mix lawful dye goods with the switched supplies.",
          "death": false
        }
      ]
    },
    {
      "id": "I06A",
      "turn": 6,
      "title": "The Lime Cellar - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. The cart trail ends at a cellar holding barrels labeled as harmless chalk.",
        "You preserve the most fragile sign before turning to the larger scene. One open barrel contains quicklime, clipped red cords, and scraps from rival bale marks.",
        "The clearer position reveals the stakes: The materials for poisoning and relabeling wool share a store controlled by Krail's factor."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour water into the barrels to destroy the lime.",
          "failTitle": "The Cellar Boils",
          "failText": "The quicklime heats violently, filling the room with choking dust and ruining the arranged evidence.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take layered samples without moving the marked scraps.",
          "scoreDelta": 1,
          "nextNodeId": "I07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the cellar until guild witnesses arrive.",
          "scoreDelta": 0,
          "nextNodeId": "I07B"
        }
      ]
    },
    {
      "id": "I06B",
      "turn": 6,
      "title": "The Lime Cellar - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. The cart trail ends at a cellar holding barrels labeled as harmless chalk.",
        "Each person is given one task, and confusion begins to clear. One open barrel contains quicklime, clipped red cords, and scraps from rival bale marks.",
        "The evidence now defines the danger: The materials for poisoning and relabeling wool share a store controlled by Krail's factor."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take layered samples without moving the marked scraps while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the cellar until guild witnesses arrive while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour water into the barrels to destroy the lime while keeping Ada Venn informed.",
          "failTitle": "The Cellar Boils",
          "failText": "The quicklime heats violently, filling the room with choking dust and ruining the arranged evidence.",
          "death": true
        }
      ]
    },
    {
      "id": "I06C",
      "turn": 6,
      "title": "The Lime Cellar - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. The cart trail ends at a cellar holding barrels labeled as harmless chalk.",
        "The enemy has the lead, so you judge every pause against the lives at risk. One open barrel contains quicklime, clipped red cords, and scraps from rival bale marks.",
        "Delay has sharpened the danger: The materials for poisoning and relabeling wool share a store controlled by Krail's factor."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the cellar until guild witnesses arrive before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour water into the barrels to destroy the lime before the remaining light fails.",
          "failTitle": "The Cellar Boils",
          "failText": "The quicklime heats violently, filling the room with choking dust and ruining the arranged evidence.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take layered samples without moving the marked scraps before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I07C"
        }
      ]
    },
    {
      "id": "I07A",
      "turn": 7,
      "title": "A Weaver's Warning - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. An apprentice weaver named Noll admits Krail paid him to report which yards had completed patrol cloth.",
        "You watch before acting and learn who believes themselves unobserved. Noll believed the bales would be bought cheaply, not made dangerous, and now fears for his sister among the spinners.",
        "The clearer position reveals the stakes: The sabotage follows production schedules and targets finished work just before delivery."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Protect Noll and have him list every report he sent.",
          "scoreDelta": 1,
          "nextNodeId": "I08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him under watch while Ada checks the named yards.",
          "scoreDelta": 0,
          "nextNodeId": "I08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Parade him through the market as Krail's spy.",
          "failTitle": "The Informant Exposed",
          "failText": "Krail's men seize Noll in the crowd, and frightened apprentices destroy their own notes.",
          "death": false
        }
      ]
    },
    {
      "id": "I07B",
      "turn": 7,
      "title": "A Weaver's Warning - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. An apprentice weaver named Noll admits Krail paid him to report which yards had completed patrol cloth.",
        "By keeping tempers cool, you hold the inquiry on facts. Noll believed the bales would be bought cheaply, not made dangerous, and now fears for his sister among the spinners.",
        "The evidence now defines the danger: The sabotage follows production schedules and targets finished work just before delivery."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him under watch while Ada checks the named yards while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Parade him through the market as Krail's spy while keeping Ada Venn informed.",
          "failTitle": "The Informant Exposed",
          "failText": "Krail's men seize Noll in the crowd, and frightened apprentices destroy their own notes.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Protect Noll and have him list every report he sent while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I08B"
        }
      ]
    },
    {
      "id": "I07C",
      "turn": 7,
      "title": "A Weaver's Warning - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. An apprentice weaver named Noll admits Krail paid him to report which yards had completed patrol cloth.",
        "The narrow margin leaves no room to chase every possibility. Noll believed the bales would be bought cheaply, not made dangerous, and now fears for his sister among the spinners.",
        "Delay has sharpened the danger: The sabotage follows production schedules and targets finished work just before delivery."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Parade him through the market as Krail's spy before the remaining light fails.",
          "failTitle": "The Informant Exposed",
          "failText": "Krail's men seize Noll in the crowd, and frightened apprentices destroy their own notes.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Protect Noll and have him list every report he sent before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep him under watch while Ada checks the named yards before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I08A"
        }
      ]
    },
    {
      "id": "I08A",
      "turn": 8,
      "title": "Brittle Cloaks - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. The first completed patrol cloaks tear along folds after a light rain.",
        "You use ground, wind, and cover to approach on your own terms. Ada finds that harsh wash stripped the wool's natural strength even where dust was removed.",
        "The clearer position reveals the stakes: A simple cleaning will not save the order; unsafe cloth must be identified before mountain wardens depend on it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Recall delivered cloaks for visual inspection.",
          "scoreDelta": 0,
          "nextNodeId": "I09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Issue the cloaks anyway because winter has begun.",
          "failTitle": "The Watch Left Bare",
          "failText": "Cloaks split during the first mountain storm, leaving isolated wardens exposed to cold.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test each batch by wet tension and preserve the failures.",
          "scoreDelta": 1,
          "nextNodeId": "I09A"
        }
      ]
    },
    {
      "id": "I08B",
      "turn": 8,
      "title": "Brittle Cloaks - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. The first completed patrol cloaks tear along folds after a light rain.",
        "Your allies close the easy exits while you examine the heart of the scene. Ada finds that harsh wash stripped the wool's natural strength even where dust was removed.",
        "The evidence now defines the danger: A simple cleaning will not save the order; unsafe cloth must be identified before mountain wardens depend on it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Issue the cloaks anyway because winter has begun while keeping Ada Venn informed.",
          "failTitle": "The Watch Left Bare",
          "failText": "Cloaks split during the first mountain storm, leaving isolated wardens exposed to cold.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test each batch by wet tension and preserve the failures while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Recall delivered cloaks for visual inspection while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I09C"
        }
      ]
    },
    {
      "id": "I08C",
      "turn": 8,
      "title": "Brittle Cloaks - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. The first completed patrol cloaks tear along folds after a light rain.",
        "You arrive openly and must turn speed into its own kind of protection. Ada finds that harsh wash stripped the wool's natural strength even where dust was removed.",
        "Delay has sharpened the danger: A simple cleaning will not save the order; unsafe cloth must be identified before mountain wardens depend on it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test each batch by wet tension and preserve the failures before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Recall delivered cloaks for visual inspection before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Issue the cloaks anyway because winter has begun before the remaining light fails.",
          "failTitle": "The Watch Left Bare",
          "failText": "Cloaks split during the first mountain storm, leaving isolated wardens exposed to cold.",
          "death": true
        }
      ]
    },
    {
      "id": "I09A",
      "turn": 9,
      "title": "The Guild Assay - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Krail offers to judge all disputed cloth as senior master of the guild.",
        "The cleanest clue survives because you handled it with care. His assay weights have been filed light, making weak cloth appear to meet Aldric's standard.",
        "The clearer position reveals the stakes: The man suspected of sabotage has prepared the official test that could certify its success."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw Krail's weights into the mill race.",
          "failTitle": "The Measure Lost",
          "failText": "Without the false weights, Krail claims the result was slander and demands a new private assay.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare his weights against the reeve's grain standard.",
          "scoreDelta": 1,
          "nextNodeId": "I10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Attend the assay with Ada as a second judge.",
          "scoreDelta": 0,
          "nextNodeId": "I10B"
        }
      ]
    },
    {
      "id": "I09B",
      "turn": 9,
      "title": "The Guild Assay - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Krail offers to judge all disputed cloth as senior master of the guild.",
        "The shared search reveals details no single witness had understood. His assay weights have been filed light, making weak cloth appear to meet Aldric's standard.",
        "The evidence now defines the danger: The man suspected of sabotage has prepared the official test that could certify its success."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare his weights against the reeve's grain standard while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Attend the assay with Ada as a second judge while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw Krail's weights into the mill race while keeping Ada Venn informed.",
          "failTitle": "The Measure Lost",
          "failText": "Without the false weights, Krail claims the result was slander and demands a new private assay.",
          "death": false
        }
      ]
    },
    {
      "id": "I09C",
      "turn": 9,
      "title": "The Guild Assay - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Krail offers to judge all disputed cloth as senior master of the guild.",
        "What remains is enough, provided you act before it is moved. His assay weights have been filed light, making weak cloth appear to meet Aldric's standard.",
        "Delay has sharpened the danger: The man suspected of sabotage has prepared the official test that could certify its success."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Attend the assay with Ada as a second judge before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw Krail's weights into the mill race before the remaining light fails.",
          "failTitle": "The Measure Lost",
          "failText": "Without the false weights, Krail claims the result was slander and demands a new private assay.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare his weights against the reeve's grain standard before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I10C"
        }
      ]
    },
    {
      "id": "I10A",
      "turn": 10,
      "title": "Tomas Accused - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Guild officers discover lime sacks in Tomas Gray's loft.",
        "You pause only long enough to read the danger correctly. The sacks are dry despite a roof leak, and their drag marks begin at a door opened with Krail's standard warehouse key.",
        "The clearer position reveals the stakes: The planted store is meant to turn a harmed fuller into the visible poisoner."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the dry floor outline and key scratches.",
          "scoreDelta": 1,
          "nextNodeId": "I11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold Tomas formally while investigating the planting.",
          "scoreDelta": 0,
          "nextNodeId": "I11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Free Tomas and send him to confront Krail.",
          "failTitle": "The Fuller in Their Hands",
          "failText": "Guild guards arrest Tomas during the confrontation and remove him beyond Ada's reach.",
          "death": false
        }
      ]
    },
    {
      "id": "I10B",
      "turn": 10,
      "title": "Tomas Accused - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Guild officers discover lime sacks in Tomas Gray's loft.",
        "A sober exchange of evidence keeps the group from dividing. The sacks are dry despite a roof leak, and their drag marks begin at a door opened with Krail's standard warehouse key.",
        "The evidence now defines the danger: The planted store is meant to turn a harmed fuller into the visible poisoner."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold Tomas formally while investigating the planting while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Free Tomas and send him to confront Krail while keeping Ada Venn informed.",
          "failTitle": "The Fuller in Their Hands",
          "failText": "Guild guards arrest Tomas during the confrontation and remove him beyond Ada's reach.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the dry floor outline and key scratches while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I11B"
        }
      ]
    },
    {
      "id": "I10C",
      "turn": 10,
      "title": "Tomas Accused - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Guild officers discover lime sacks in Tomas Gray's loft.",
        "You make up lost ground with a directness that warns everyone nearby. The sacks are dry despite a roof leak, and their drag marks begin at a door opened with Krail's standard warehouse key.",
        "Delay has sharpened the danger: The planted store is meant to turn a harmed fuller into the visible poisoner."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Free Tomas and send him to confront Krail before the remaining light fails.",
          "failTitle": "The Fuller in Their Hands",
          "failText": "Guild guards arrest Tomas during the confrontation and remove him beyond Ada's reach.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the dry floor outline and key scratches before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold Tomas formally while investigating the planting before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I11A"
        }
      ]
    },
    {
      "id": "I11A",
      "turn": 11,
      "title": "The Red-Cord Route - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. Noll's list shows every tainted bale passed through one riverside counting house.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Red cord offcuts fill its stove, and a night hatch opens directly above a loading quay.",
        "The clearer position reveals the stakes: The operation can switch marks and supplies after sellers, buyers, and inspectors have all counted the goods."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the counting house under the reeve's seal.",
          "scoreDelta": 0,
          "nextNodeId": "I12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set the cord heap alight to draw out the workers.",
          "failTitle": "A Fire in the Records",
          "failText": "Flames climb from the stove into shelves holding contracts and delivery books.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Watch the hatch through one full loading cycle.",
          "scoreDelta": 1,
          "nextNodeId": "I12A"
        }
      ]
    },
    {
      "id": "I11B",
      "turn": 11,
      "title": "The Red-Cord Route - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. Noll's list shows every tainted bale passed through one riverside counting house.",
        "With Thorne close and local witnesses beside you, you compare every account. Red cord offcuts fill its stove, and a night hatch opens directly above a loading quay.",
        "The evidence now defines the danger: The operation can switch marks and supplies after sellers, buyers, and inspectors have all counted the goods."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Set the cord heap alight to draw out the workers while keeping Ada Venn informed.",
          "failTitle": "A Fire in the Records",
          "failText": "Flames climb from the stove into shelves holding contracts and delivery books.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Watch the hatch through one full loading cycle while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the counting house under the reeve's seal while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I12C"
        }
      ]
    },
    {
      "id": "I11C",
      "turn": 11,
      "title": "The Red-Cord Route - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. Noll's list shows every tainted bale passed through one riverside counting house.",
        "Working against the light, you test the few signs that remain. Red cord offcuts fill its stove, and a night hatch opens directly above a loading quay.",
        "Delay has sharpened the danger: The operation can switch marks and supplies after sellers, buyers, and inspectors have all counted the goods."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Watch the hatch through one full loading cycle before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the counting house under the reeve's seal before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set the cord heap alight to draw out the workers before the remaining light fails.",
          "failTitle": "A Fire in the Records",
          "failText": "Flames climb from the stove into shelves holding contracts and delivery books.",
          "death": true
        }
      ]
    },
    {
      "id": "I12A",
      "turn": 12,
      "title": "The Night Switch - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. A clean patrol bale enters the counting house and a matching tainted bale leaves minutes later.",
        "You circle downwind and let small marks tell their order. Porters use duplicate tally boards, passing one to the driver and hiding the true weight in a wall slot.",
        "The clearer position reveals the stakes: You have witnessed the method, but the hidden records can still reveal how many loads were changed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop only the driver in the street.",
          "failTitle": "The House Clears Behind You",
          "failText": "While attention holds the cart, counting clerks carry the true books through the quay hatch.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take both bales and the wall tallies at the same moment.",
          "scoreDelta": 1,
          "nextNodeId": "I13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the outgoing cart to its destination.",
          "scoreDelta": 0,
          "nextNodeId": "I13B"
        }
      ]
    },
    {
      "id": "I12B",
      "turn": 12,
      "title": "The Night Switch - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. A clean patrol bale enters the counting house and a matching tainted bale leaves minutes later.",
        "You ask plain questions and watch which answers agree. Porters use duplicate tally boards, passing one to the driver and hiding the true weight in a wall slot.",
        "The evidence now defines the danger: You have witnessed the method, but the hidden records can still reveal how many loads were changed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take both bales and the wall tallies at the same moment while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the outgoing cart to its destination while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop only the driver in the street while keeping Ada Venn informed.",
          "failTitle": "The House Clears Behind You",
          "failText": "While attention holds the cart, counting clerks carry the true books through the quay hatch.",
          "death": false
        }
      ]
    },
    {
      "id": "I12C",
      "turn": 12,
      "title": "The Night Switch - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. A clean patrol bale enters the counting house and a matching tainted bale leaves minutes later.",
        "There is no time for elegance, only for separating fresh danger from old damage. Porters use duplicate tally boards, passing one to the driver and hiding the true weight in a wall slot.",
        "Delay has sharpened the danger: You have witnessed the method, but the hidden records can still reveal how many loads were changed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the outgoing cart to its destination before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop only the driver in the street before the remaining light fails.",
          "failTitle": "The House Clears Behind You",
          "failText": "While attention holds the cart, counting clerks carry the true books through the quay hatch.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take both bales and the wall tallies at the same moment before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I13C"
        }
      ]
    },
    {
      "id": "I13A",
      "turn": 13,
      "title": "Krail's Winter Contract - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. The wall slot contains a private agreement granting Krail exclusive cloth rights if half the independent yards default.",
        "From sheltered ground, you measure tracks, tools, and distances. A distant factor promises high prices after Aldric's patrol order fails.",
        "The clearer position reveals the stakes: The poisoning was designed to break rivals, seize the guild, and make Brackenwald pay for the shortage."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal the agreement beside Noll's reports and duplicate tallies.",
          "scoreDelta": 1,
          "nextNodeId": "I14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the contract to Aldric before moving on Krail.",
          "scoreDelta": 0,
          "nextNodeId": "I14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Read it aloud in the crowded market.",
          "failTitle": "A Riot of Clothworkers",
          "failText": "Workers attack Krail's stalls, and his clerks burn the remaining accounts during the disorder.",
          "death": false
        }
      ]
    },
    {
      "id": "I13B",
      "turn": 13,
      "title": "Krail's Winter Contract - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. The wall slot contains a private agreement granting Krail exclusive cloth rights if half the independent yards default.",
        "You keep the scene orderly while your allies search it piece by piece. A distant factor promises high prices after Aldric's patrol order fails.",
        "The evidence now defines the danger: The poisoning was designed to break rivals, seize the guild, and make Brackenwald pay for the shortage."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the contract to Aldric before moving on Krail while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Read it aloud in the crowded market while keeping Ada Venn informed.",
          "failTitle": "A Riot of Clothworkers",
          "failText": "Workers attack Krail's stalls, and his clerks burn the remaining accounts during the disorder.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the agreement beside Noll's reports and duplicate tallies while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I14B"
        }
      ]
    },
    {
      "id": "I13C",
      "turn": 13,
      "title": "Krail's Winter Contract - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. The wall slot contains a private agreement granting Krail exclusive cloth rights if half the independent yards default.",
        "Pressed for time, you trust hard evidence and discard rumor. A distant factor promises high prices after Aldric's patrol order fails.",
        "Delay has sharpened the danger: The poisoning was designed to break rivals, seize the guild, and make Brackenwald pay for the shortage."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Read it aloud in the crowded market before the remaining light fails.",
          "failTitle": "A Riot of Clothworkers",
          "failText": "Workers attack Krail's stalls, and his clerks burn the remaining accounts during the disorder.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the agreement beside Noll's reports and duplicate tallies before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the contract to Aldric before moving on Krail before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I14A"
        }
      ]
    },
    {
      "id": "I14A",
      "turn": 14,
      "title": "The Locked Dye Yard - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Krail closes his dye yard with workers and finished cloaks inside.",
        "You move quietly enough to hear work and voices ahead. Smoke from the chimney carries lime dust, while carts gather at a rear gate to remove clean wool.",
        "The clearer position reveals the stakes: He intends to destroy tainted evidence and keep valuable safe stock for his monopoly."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Surround the yard and demand surrender.",
          "scoreDelta": 0,
          "nextNodeId": "I15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the front doors with a timber ram.",
          "failTitle": "Dust Through the Yard",
          "failText": "The impact bursts suspended powder sacks over trapped workers and rescuers.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Enter through the wet-ragged drain and open the worker gate.",
          "scoreDelta": 1,
          "nextNodeId": "I15A"
        }
      ]
    },
    {
      "id": "I14B",
      "turn": 14,
      "title": "The Locked Dye Yard - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Krail closes his dye yard with workers and finished cloaks inside.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Smoke from the chimney carries lime dust, while carts gather at a rear gate to remove clean wool.",
        "The evidence now defines the danger: He intends to destroy tainted evidence and keep valuable safe stock for his monopoly."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the front doors with a timber ram while keeping Ada Venn informed.",
          "failTitle": "Dust Through the Yard",
          "failText": "The impact bursts suspended powder sacks over trapped workers and rescuers.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Enter through the wet-ragged drain and open the worker gate while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Surround the yard and demand surrender while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I15C"
        }
      ]
    },
    {
      "id": "I14C",
      "turn": 14,
      "title": "The Locked Dye Yard - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Krail closes his dye yard with workers and finished cloaks inside.",
        "You push through fatigue, knowing the next mistake may close the road. Smoke from the chimney carries lime dust, while carts gather at a rear gate to remove clean wool.",
        "Delay has sharpened the danger: He intends to destroy tainted evidence and keep valuable safe stock for his monopoly."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Enter through the wet-ragged drain and open the worker gate before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Surround the yard and demand surrender before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the front doors with a timber ram before the remaining light fails.",
          "failTitle": "Dust Through the Yard",
          "failText": "The impact bursts suspended powder sacks over trapped workers and rescuers.",
          "death": true
        }
      ]
    },
    {
      "id": "I15A",
      "turn": 15,
      "title": "The Workers in the Loft - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. Ada locates twelve workers above the mixing room as lime dust rises.",
        "A ranger's eye finds the human habit behind the apparent mystery. A hoist can lower them one by one, but its rope passes beside a rack of unstable dye vats.",
        "The clearer position reveals the stakes: Rescue must come before pursuit without releasing corrosive liquid through the yard."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the hoist counterweight to lower everyone quickly.",
          "failTitle": "The Loft Gives Way",
          "failText": "The released weight tears the beam loose and drops workers into the mixing room.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Brace the vat rack and operate the hoist under Ada's count.",
          "scoreDelta": 1,
          "nextNodeId": "I16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead workers across the roof to the next warehouse.",
          "scoreDelta": 0,
          "nextNodeId": "I16B"
        }
      ]
    },
    {
      "id": "I15B",
      "turn": 15,
      "title": "The Workers in the Loft - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. Ada locates twelve workers above the mixing room as lime dust rises.",
        "Together, the small company builds one reliable account from scattered facts. A hoist can lower them one by one, but its rope passes beside a rack of unstable dye vats.",
        "The evidence now defines the danger: Rescue must come before pursuit without releasing corrosive liquid through the yard."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Brace the vat rack and operate the hoist under Ada's count while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead workers across the roof to the next warehouse while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the hoist counterweight to lower everyone quickly while keeping Ada Venn informed.",
          "failTitle": "The Loft Gives Way",
          "failText": "The released weight tears the beam loose and drops workers into the mixing room.",
          "death": true
        }
      ]
    },
    {
      "id": "I15C",
      "turn": 15,
      "title": "The Workers in the Loft - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. Ada locates twelve workers above the mixing room as lime dust rises.",
        "You take the shortest safe route and accept that concealment is nearly gone. A hoist can lower them one by one, but its rope passes beside a rack of unstable dye vats.",
        "Delay has sharpened the danger: Rescue must come before pursuit without releasing corrosive liquid through the yard."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead workers across the roof to the next warehouse before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the hoist counterweight to lower everyone quickly before the remaining light fails.",
          "failTitle": "The Loft Gives Way",
          "failText": "The released weight tears the beam loose and drops workers into the mixing room.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Brace the vat rack and operate the hoist under Ada's count before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I16C"
        }
      ]
    },
    {
      "id": "I16A",
      "turn": 16,
      "title": "Krail at the Sluice - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Krail reaches the yard sluice carrying his account book in a waxed case.",
        "You preserve the most fragile sign before turning to the larger scene. Opening the gate would wash lime and dye into the Riverland while giving him a flooded escape channel.",
        "The clearer position reveals the stakes: He holds both the wider proof and a threat to farms downstream."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Pin the sluice lever with an arrow before closing on him.",
          "scoreDelta": 1,
          "nextNodeId": "I17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Tomas block the outlet while Ada secures the book.",
          "scoreDelta": 0,
          "nextNodeId": "I17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leap into the channel and tackle Krail.",
          "failTitle": "The Poisoned Race",
          "failText": "Krail opens the gate during the struggle, and the flood carries both of you into the mill wheels.",
          "death": true
        }
      ]
    },
    {
      "id": "I16B",
      "turn": 16,
      "title": "Krail at the Sluice - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Krail reaches the yard sluice carrying his account book in a waxed case.",
        "Each person is given one task, and confusion begins to clear. Opening the gate would wash lime and dye into the Riverland while giving him a flooded escape channel.",
        "The evidence now defines the danger: He holds both the wider proof and a threat to farms downstream."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Tomas block the outlet while Ada secures the book while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leap into the channel and tackle Krail while keeping Ada Venn informed.",
          "failTitle": "The Poisoned Race",
          "failText": "Krail opens the gate during the struggle, and the flood carries both of you into the mill wheels.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin the sluice lever with an arrow before closing on him while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I17B"
        }
      ]
    },
    {
      "id": "I16C",
      "turn": 16,
      "title": "Krail at the Sluice - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Krail reaches the yard sluice carrying his account book in a waxed case.",
        "The enemy has the lead, so you judge every pause against the lives at risk. Opening the gate would wash lime and dye into the Riverland while giving him a flooded escape channel.",
        "Delay has sharpened the danger: He holds both the wider proof and a threat to farms downstream."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leap into the channel and tackle Krail before the remaining light fails.",
          "failTitle": "The Poisoned Race",
          "failText": "Krail opens the gate during the struggle, and the flood carries both of you into the mill wheels.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin the sluice lever with an arrow before closing on him before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Tomas block the outlet while Ada secures the book before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I17A"
        }
      ]
    },
    {
      "id": "I17A",
      "turn": 17,
      "title": "The Clean Wool Store - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. The recovered book identifies a hidden loft packed with untouched patrol wool.",
        "You watch before acting and learn who believes themselves unobserved. Krail planned to release it at triple price after independent yards missed their deadlines.",
        "The clearer position reveals the stakes: The winter order can still be met if honest workers cooperate instead of fighting over ruined contracts."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Place the store under ducal guard for later issue.",
          "scoreDelta": 0,
          "nextNodeId": "I18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Give all wool to Ada's yard alone.",
          "failTitle": "A New Monopoly",
          "failText": "Favoring one ally repeats Krail's abuse and drives skilled rivals away when Brackenwald needs them most.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inventory the clean bales and divide work by proven capacity.",
          "scoreDelta": 1,
          "nextNodeId": "I18A"
        }
      ]
    },
    {
      "id": "I17B",
      "turn": 17,
      "title": "The Clean Wool Store - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. The recovered book identifies a hidden loft packed with untouched patrol wool.",
        "By keeping tempers cool, you hold the inquiry on facts. Krail planned to release it at triple price after independent yards missed their deadlines.",
        "The evidence now defines the danger: The winter order can still be met if honest workers cooperate instead of fighting over ruined contracts."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Give all wool to Ada's yard alone while keeping Ada Venn informed.",
          "failTitle": "A New Monopoly",
          "failText": "Favoring one ally repeats Krail's abuse and drives skilled rivals away when Brackenwald needs them most.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inventory the clean bales and divide work by proven capacity while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place the store under ducal guard for later issue while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I18C"
        }
      ]
    },
    {
      "id": "I17C",
      "turn": 17,
      "title": "The Clean Wool Store - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. The recovered book identifies a hidden loft packed with untouched patrol wool.",
        "The narrow margin leaves no room to chase every possibility. Krail planned to release it at triple price after independent yards missed their deadlines.",
        "Delay has sharpened the danger: The winter order can still be met if honest workers cooperate instead of fighting over ruined contracts."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inventory the clean bales and divide work by proven capacity before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place the store under ducal guard for later issue before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Give all wool to Ada's yard alone before the remaining light fails.",
          "failTitle": "A New Monopoly",
          "failText": "Favoring one ally repeats Krail's abuse and drives skilled rivals away when Brackenwald needs them most.",
          "death": false
        }
      ]
    },
    {
      "id": "I18A",
      "turn": 18,
      "title": "Seven Days of Cloth - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Spinners, fullers, dyers, and tailors work across seven yards under a shared assay.",
        "You use ground, wind, and cover to approach on your own terms. Krail's remaining foremen try to spread rumors that Ada's test damages good wool.",
        "The clearer position reveals the stakes: Trust in the replacement order depends on a standard everyone can see and repeat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Hide failures to maintain speed and confidence.",
          "failTitle": "Weakness Sewn In",
          "failText": "Concealed bad cloth reaches patrol bundles and unravels the honest work beside it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Demonstrate wet-tension tests with public weights at each yard.",
          "scoreDelta": 1,
          "nextNodeId": "I19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep inspections centralized under the reeve.",
          "scoreDelta": 0,
          "nextNodeId": "I19B"
        }
      ]
    },
    {
      "id": "I18B",
      "turn": 18,
      "title": "Seven Days of Cloth - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Spinners, fullers, dyers, and tailors work across seven yards under a shared assay.",
        "Your allies close the easy exits while you examine the heart of the scene. Krail's remaining foremen try to spread rumors that Ada's test damages good wool.",
        "The evidence now defines the danger: Trust in the replacement order depends on a standard everyone can see and repeat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Demonstrate wet-tension tests with public weights at each yard while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep inspections centralized under the reeve while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hide failures to maintain speed and confidence while keeping Ada Venn informed.",
          "failTitle": "Weakness Sewn In",
          "failText": "Concealed bad cloth reaches patrol bundles and unravels the honest work beside it.",
          "death": false
        }
      ]
    },
    {
      "id": "I18C",
      "turn": 18,
      "title": "Seven Days of Cloth - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Spinners, fullers, dyers, and tailors work across seven yards under a shared assay.",
        "You arrive openly and must turn speed into its own kind of protection. Krail's remaining foremen try to spread rumors that Ada's test damages good wool.",
        "Delay has sharpened the danger: Trust in the replacement order depends on a standard everyone can see and repeat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep inspections centralized under the reeve before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hide failures to maintain speed and confidence before the remaining light fails.",
          "failTitle": "Weakness Sewn In",
          "failText": "Concealed bad cloth reaches patrol bundles and unravels the honest work beside it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Demonstrate wet-tension tests with public weights at each yard before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I19C"
        }
      ]
    },
    {
      "id": "I19A",
      "turn": 19,
      "title": "The Guild Hall Hearing - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Injured spinners, Tomas, Noll, and the counting clerks face Krail before Aldric's reeve.",
        "The cleanest clue survives because you handled it with care. The lime samples, false weights, switched bales, and winter contract establish different parts of one design.",
        "The clearer position reveals the stakes: The case must show intent without condemning every worker who obeyed a master's ordinary order."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Present the chain from material to monopoly and distinguish each role.",
          "scoreDelta": 1,
          "nextNodeId": "I20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send all records to Aldric for a slower central trial.",
          "scoreDelta": 0,
          "nextNodeId": "I20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the injured spinners strip Krail of office by force.",
          "failTitle": "The Hearing Broken",
          "failText": "Violence lets Krail claim guild rivalry while his distant partner avoids examination.",
          "death": false
        }
      ]
    },
    {
      "id": "I19B",
      "turn": 19,
      "title": "The Guild Hall Hearing - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Injured spinners, Tomas, Noll, and the counting clerks face Krail before Aldric's reeve.",
        "The shared search reveals details no single witness had understood. The lime samples, false weights, switched bales, and winter contract establish different parts of one design.",
        "The evidence now defines the danger: The case must show intent without condemning every worker who obeyed a master's ordinary order."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send all records to Aldric for a slower central trial while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "nextNodeId": "I20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the injured spinners strip Krail of office by force while keeping Ada Venn informed.",
          "failTitle": "The Hearing Broken",
          "failText": "Violence lets Krail claim guild rivalry while his distant partner avoids examination.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the chain from material to monopoly and distinguish each role while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "nextNodeId": "I20B"
        }
      ]
    },
    {
      "id": "I19C",
      "turn": 19,
      "title": "The Guild Hall Hearing - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Injured spinners, Tomas, Noll, and the counting clerks face Krail before Aldric's reeve.",
        "What remains is enough, provided you act before it is moved. The lime samples, false weights, switched bales, and winter contract establish different parts of one design.",
        "Delay has sharpened the danger: The case must show intent without condemning every worker who obeyed a master's ordinary order."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the injured spinners strip Krail of office by force before the remaining light fails.",
          "failTitle": "The Hearing Broken",
          "failText": "Violence lets Krail claim guild rivalry while his distant partner avoids examination.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the chain from material to monopoly and distinguish each role before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "I20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send all records to Aldric for a slower central trial before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "I20A"
        }
      ]
    },
    {
      "id": "I20A",
      "turn": 20,
      "title": "Warm Watchers - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Sound cloaks are stacked for the mountain posts as snow reaches Oakenhurst.",
        "You pause only long enough to read the danger correctly. Ada proposes a permanent open assay, Tomas reopens his mill, and Krail's buyer list waits in the sealed account.",
        "The clearer position reveals the stakes: The final settlement can make this rescue a lasting protection for workers and wardens alike."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Deliver the cloaks first and defer the wider trade case.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep Krail's tainted cloth for cheap village blankets.",
          "failTitle": "The Poison Passed Down",
          "failText": "Dangerous wool reaches families with less power to complain, preserving the harm under a charitable name.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Establish the shared assay and pursue every buyer named in the account.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "I20B",
      "turn": 20,
      "title": "Warm Watchers - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Sound cloaks are stacked for the mountain posts as snow reaches Oakenhurst.",
        "A sober exchange of evidence keeps the group from dividing. Ada proposes a permanent open assay, Tomas reopens his mill, and Krail's buyer list waits in the sealed account.",
        "The evidence now defines the danger: The final settlement can make this rescue a lasting protection for workers and wardens alike."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep Krail's tainted cloth for cheap village blankets while keeping Ada Venn informed.",
          "failTitle": "The Poison Passed Down",
          "failText": "Dangerous wool reaches families with less power to complain, preserving the harm under a charitable name.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Establish the shared assay and pursue every buyer named in the account while keeping Ada Venn informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Deliver the cloaks first and defer the wider trade case while keeping Ada Venn informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "I20C",
      "turn": 20,
      "title": "Warm Watchers - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Sound cloaks are stacked for the mountain posts as snow reaches Oakenhurst.",
        "You make up lost ground with a directness that warns everyone nearby. Ada proposes a permanent open assay, Tomas reopens his mill, and Krail's buyer list waits in the sealed account.",
        "Delay has sharpened the danger: The final settlement can make this rescue a lasting protection for workers and wardens alike."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Establish the shared assay and pursue every buyer named in the account before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Deliver the cloaks first and defer the wider trade case before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep Krail's tainted cloth for cheap village blankets before the remaining light fails.",
          "failTitle": "The Poison Passed Down",
          "failText": "Dangerous wool reaches families with less power to complain, preserving the harm under a charitable name.",
          "death": false
        }
      ]
    }
  ]
});
