window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "ash-on-the-river",
  "title": "Ash on the River",
  "summary": "When strange ash poisons Riverland’s waters, the ranger follows a false quarantine scheme through ferries, mills, and buried plague works before a noble house can seize control of the river.",
  "maxTurns": 20,
  "startNodeId": "R01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The intake is saved before the flood, and the river runs clear enough for the villages to endure. Lady Corra Vey and Clerk Pell answer for their conspiracy, while Ansa Reed is restored as a surveyor. Aldric orders the old waterworks repaired, and Riverland remembers the ranger who followed the ash to its source.",
    "low": "The river is kept from complete ruin, but several villages lose stores and clean water before the scheme is broken. The letters survive only in fragments, and House Vey’s influence takes years to unwind. By winter the banks are green again, though the people still watch the water whenever ash falls."
  },
  "nodes": [
    {
      "id": "R01A",
      "turn": 1,
      "title": "Ash on the river - swift trail",
      "narrative": [
        "A gray ash begins falling over Riverland, and Duke Aldric sends you to find its source before the wells are spoiled.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At ash on the river, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from ash on the river now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question Willow Ford’s ferrymen about the first gray fall.",
          "scoreDelta": 0,
          "nextNodeId": "R02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare the river cursed and order every crossing abandoned.",
          "failTitle": "Failure at Ash on the river",
          "failText": "A reckless decision at ash on the river gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the ash at the nearest well before riding upstream.",
          "scoreDelta": 1,
          "nextNodeId": "R02A"
        }
      ]
    },
    {
      "id": "R01B",
      "turn": 1,
      "title": "Ash on the river - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to ash on the river. A gray ash begins falling over Riverland, and Duke Aldric sends you to find its source before the wells are spoiled.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At ash on the river, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving ash on the river in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare the river cursed and order every crossing abandoned, on the strength of one uncertain sign.",
          "failTitle": "Failure at Ash on the river",
          "failText": "A reckless decision at ash on the river gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the ash at the nearest well before riding upstream, along the route least likely to alert the quarry.",
          "scoreDelta": 1,
          "nextNodeId": "R02B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question Willow Ford’s ferrymen about the first gray fall, leaving room to change course.",
          "scoreDelta": 0,
          "nextNodeId": "R02C"
        }
      ]
    },
    {
      "id": "R01C",
      "turn": 1,
      "title": "Ash on the river - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to ash on the river. A gray ash begins falling over Riverland, and Duke Aldric sends you to find its source before the wells are spoiled.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At ash on the river, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at ash on the river can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the ash at the nearest well before riding upstream, following the trail that best fits the evidence.",
          "scoreDelta": 1,
          "nextNodeId": "R02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question Willow Ford’s ferrymen about the first gray fall, with the remaining risks kept in view.",
          "scoreDelta": 0,
          "nextNodeId": "R02A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare the river cursed and order every crossing abandoned, with the warning signs still unresolved.",
          "failTitle": "Failure at Ash on the river",
          "failText": "A reckless decision at ash on the river gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R02A",
      "turn": 2,
      "title": "The dead fish - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the dead fish. Dead fish gather beneath Willow Ford while a sealed barge passes upstream under a false ducal pennant.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the dead fish, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the dead fish now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the false ducal pennant without checking the ford.",
          "failTitle": "Failure at The dead fish",
          "failText": "A reckless decision at the dead fish gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the barge wake and recover the brass toll token.",
          "scoreDelta": 1,
          "nextNodeId": "R03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Collect the dead fish for examination before moving on.",
          "scoreDelta": 0,
          "nextNodeId": "R03B"
        }
      ]
    },
    {
      "id": "R02B",
      "turn": 2,
      "title": "The dead fish - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the dead fish. Dead fish gather beneath Willow Ford while a sealed barge passes upstream under a false ducal pennant.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the dead fish, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the dead fish in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the barge wake and recover the brass toll token, with the strongest account in hand.",
          "scoreDelta": 1,
          "nextNodeId": "R03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Collect the dead fish for examination before moving on, after securing the ground already won.",
          "scoreDelta": 0,
          "nextNodeId": "R03C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the false ducal pennant without checking the ford, without hearing the nearest witness.",
          "failTitle": "Failure at The dead fish",
          "failText": "A reckless decision at the dead fish gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R02C",
      "turn": 2,
      "title": "The dead fish - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the dead fish. Dead fish gather beneath Willow Ford while a sealed barge passes upstream under a false ducal pennant.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the dead fish, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the dead fish can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Collect the dead fish for examination before moving on, while keeping the safer line open.",
          "scoreDelta": 0,
          "nextNodeId": "R03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the false ducal pennant without checking the ford, without testing the danger ahead.",
          "failTitle": "Failure at The dead fish",
          "failText": "A reckless decision at the dead fish gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the barge wake and recover the brass toll token, using the clearest clue from this approach.",
          "scoreDelta": 1,
          "nextNodeId": "R03C"
        }
      ]
    },
    {
      "id": "R03A",
      "turn": 3,
      "title": "The abandoned barge - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the abandoned barge. The empty barge holds wet straw, broken jars, and lamp oil; a boot trail climbs toward an abandoned limeworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the abandoned barge, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the abandoned barge now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Search the barge seals and trace the boot trail ashore.",
          "scoreDelta": 1,
          "nextNodeId": "R04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Moor the abandoned vessel and inventory its broken jars.",
          "scoreDelta": 0,
          "nextNodeId": "R04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the barge and destroy the cargo evidence.",
          "failTitle": "Failure at The abandoned barge",
          "failText": "A reckless decision at the abandoned barge gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R03B",
      "turn": 3,
      "title": "The abandoned barge - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the abandoned barge. The empty barge holds wet straw, broken jars, and lamp oil; a boot trail climbs toward an abandoned limeworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the abandoned barge, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the abandoned barge in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Moor the abandoned vessel and inventory its broken jars, with the remaining risks kept in view.",
          "scoreDelta": 0,
          "nextNodeId": "R04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the barge and destroy the cargo evidence, with the warning signs still unresolved.",
          "failTitle": "Failure at The abandoned barge",
          "failText": "A reckless decision at the abandoned barge gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search the barge seals and trace the boot trail ashore, following the trail that best fits the evidence.",
          "scoreDelta": 1,
          "nextNodeId": "R04B"
        }
      ]
    },
    {
      "id": "R03C",
      "turn": 3,
      "title": "The abandoned barge - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the abandoned barge. The empty barge holds wet straw, broken jars, and lamp oil; a boot trail climbs toward an abandoned limeworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the abandoned barge, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the abandoned barge can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the barge and destroy the cargo evidence, despite the doubts raised by the evidence.",
          "failTitle": "Failure at The abandoned barge",
          "failText": "A reckless decision at the abandoned barge gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search the barge seals and trace the boot trail ashore, on the strongest evidence available.",
          "scoreDelta": 1,
          "nextNodeId": "R04C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Moor the abandoned vessel and inventory its broken jars, by the slower but steadier course.",
          "scoreDelta": 0,
          "nextNodeId": "R04A"
        }
      ]
    },
    {
      "id": "R04A",
      "turn": 4,
      "title": "The limeworks - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the limeworks. The limeworks contain pale grit, a torn courier cloak, and a careful list of village wells.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the limeworks, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the limeworks now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the limeworks room by room with Jorin.",
          "scoreDelta": 0,
          "nextNodeId": "R05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Taste the unknown mineral to judge whether it is poison.",
          "failTitle": "Failure at The limeworks",
          "failText": "A reckless decision at the limeworks gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the pale grit with the list of village wells.",
          "scoreDelta": 1,
          "nextNodeId": "R05A"
        }
      ]
    },
    {
      "id": "R04B",
      "turn": 4,
      "title": "The limeworks - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the limeworks. The limeworks contain pale grit, a torn courier cloak, and a careful list of village wells.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the limeworks, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the limeworks in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Taste the unknown mineral to judge whether it is poison, without testing the danger ahead.",
          "failTitle": "Failure at The limeworks",
          "failText": "A reckless decision at the limeworks gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the pale grit with the list of village wells, using the clearest clue from this approach.",
          "scoreDelta": 1,
          "nextNodeId": "R05B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the limeworks room by room with Jorin, while keeping the safer line open.",
          "scoreDelta": 0,
          "nextNodeId": "R05C"
        }
      ]
    },
    {
      "id": "R04C",
      "turn": 4,
      "title": "The limeworks - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the limeworks. The limeworks contain pale grit, a torn courier cloak, and a careful list of village wells.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the limeworks, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the limeworks can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the pale grit with the list of village wells, with old and new signs considered together.",
          "scoreDelta": 1,
          "nextNodeId": "R05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the limeworks room by room with Jorin, without committing every resource at once.",
          "scoreDelta": 0,
          "nextNodeId": "R05A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Taste the unknown mineral to judge whether it is poison, without securing help or a retreat.",
          "failTitle": "Failure at The limeworks",
          "failText": "A reckless decision at the limeworks gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R05A",
      "turn": 5,
      "title": "Jorin’s warning - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to jorin’s warning. Ferryman Jorin admits he was paid to look away and names Ansa Reed, a disgraced Riverland surveyor.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At jorin’s warning, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from jorin’s warning now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Beat a confession from the ferryman and lose his trust.",
          "failTitle": "Failure at Jorin’s warning",
          "failText": "A reckless decision at jorin’s warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Offer Jorin protection in exchange for the full payment trail.",
          "scoreDelta": 1,
          "nextNodeId": "R06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Jorin under watch while following the towpath.",
          "scoreDelta": 0,
          "nextNodeId": "R06B"
        }
      ]
    },
    {
      "id": "R05B",
      "turn": 5,
      "title": "Jorin’s warning - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to jorin’s warning. Ferryman Jorin admits he was paid to look away and names Ansa Reed, a disgraced Riverland surveyor.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At jorin’s warning, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving jorin’s warning in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Offer Jorin protection in exchange for the full payment trail, on the strongest evidence available.",
          "scoreDelta": 1,
          "nextNodeId": "R06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Jorin under watch while following the towpath, by the slower but steadier course.",
          "scoreDelta": 0,
          "nextNodeId": "R06C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Beat a confession from the ferryman and lose his trust, despite the doubts raised by the evidence.",
          "failTitle": "Failure at Jorin’s warning",
          "failText": "A reckless decision at jorin’s warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R05C",
      "turn": 5,
      "title": "Jorin’s warning - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to jorin’s warning. Ferryman Jorin admits he was paid to look away and names Ansa Reed, a disgraced Riverland surveyor.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At jorin’s warning, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at jorin’s warning can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Jorin under watch while following the towpath, leaving room to change course.",
          "scoreDelta": 0,
          "nextNodeId": "R06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Beat a confession from the ferryman and lose his trust, on the strength of one uncertain sign.",
          "failTitle": "Failure at Jorin’s warning",
          "failText": "A reckless decision at jorin’s warning gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Offer Jorin protection in exchange for the full payment trail, along the route least likely to alert the quarry.",
          "scoreDelta": 1,
          "nextNodeId": "R06C"
        }
      ]
    },
    {
      "id": "R06A",
      "turn": 6,
      "title": "The willow camp - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the willow camp. A hidden camp holds river maps marking wells, ferries, and forgotten plague roads.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the willow camp, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the willow camp now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the camp maps for the route connecting the marked wells.",
          "scoreDelta": 1,
          "nextNodeId": "R07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait in concealment for the lone rider to return.",
          "scoreDelta": 0,
          "nextNodeId": "R07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the maps as worthless surveyor’s work.",
          "failTitle": "Failure at The willow camp",
          "failText": "A reckless decision at the willow camp gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R06B",
      "turn": 6,
      "title": "The willow camp - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the willow camp. A hidden camp holds river maps marking wells, ferries, and forgotten plague roads.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the willow camp, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the willow camp in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait in concealment for the lone rider to return, without committing every resource at once.",
          "scoreDelta": 0,
          "nextNodeId": "R07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the maps as worthless surveyor’s work, without securing help or a retreat.",
          "failTitle": "Failure at The willow camp",
          "failText": "A reckless decision at the willow camp gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the camp maps for the route connecting the marked wells, with old and new signs considered together.",
          "scoreDelta": 1,
          "nextNodeId": "R07B"
        }
      ]
    },
    {
      "id": "R06C",
      "turn": 6,
      "title": "The willow camp - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the willow camp. A hidden camp holds river maps marking wells, ferries, and forgotten plague roads.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the willow camp, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the willow camp can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the maps as worthless surveyor’s work, without hearing the nearest witness.",
          "failTitle": "Failure at The willow camp",
          "failText": "A reckless decision at the willow camp gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study the camp maps for the route connecting the marked wells, with the strongest account in hand.",
          "scoreDelta": 1,
          "nextNodeId": "R07C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait in concealment for the lone rider to return, after securing the ground already won.",
          "scoreDelta": 0,
          "nextNodeId": "R07A"
        }
      ]
    },
    {
      "id": "R07A",
      "turn": 7,
      "title": "The red ochre mark - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the red ochre mark. Ansa explains that the ash is mineral waste being used to turn villages against one another.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the red ochre mark, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the red ochre mark now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear Ansa’s account but retain the suspicious jars.",
          "scoreDelta": 0,
          "nextNodeId": "R08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Ansa before checking any of her evidence.",
          "failTitle": "Failure at The red ochre mark",
          "failText": "A reckless decision at the red ochre mark gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Ansa test the ochre while you cover the riverbank.",
          "scoreDelta": 1,
          "nextNodeId": "R08A"
        }
      ]
    },
    {
      "id": "R07B",
      "turn": 7,
      "title": "The red ochre mark - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the red ochre mark. Ansa explains that the ash is mineral waste being used to turn villages against one another.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the red ochre mark, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the red ochre mark in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Ansa before checking any of her evidence, on the strength of one uncertain sign.",
          "failTitle": "Failure at The red ochre mark",
          "failText": "A reckless decision at the red ochre mark gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Ansa test the ochre while you cover the riverbank, along the route least likely to alert the quarry.",
          "scoreDelta": 1,
          "nextNodeId": "R08B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear Ansa’s account but retain the suspicious jars, leaving room to change course.",
          "scoreDelta": 0,
          "nextNodeId": "R08C"
        }
      ]
    },
    {
      "id": "R07C",
      "turn": 7,
      "title": "The red ochre mark - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the red ochre mark. Ansa explains that the ash is mineral waste being used to turn villages against one another.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the red ochre mark, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the red ochre mark can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Let Ansa test the ochre while you cover the riverbank, following the trail that best fits the evidence.",
          "scoreDelta": 1,
          "nextNodeId": "R08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear Ansa’s account but retain the suspicious jars, with the remaining risks kept in view.",
          "scoreDelta": 0,
          "nextNodeId": "R08A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Ansa before checking any of her evidence, with the warning signs still unresolved.",
          "failTitle": "Failure at The red ochre mark",
          "failText": "A reckless decision at the red ochre mark gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R08A",
      "turn": 8,
      "title": "Ansa’s evidence - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to ansa’s evidence. Her jars show two layers: harmless dye above material that thickens in water and blocks channels.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At ansa’s evidence, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from ansa’s evidence now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour the contents into the river to see what happens.",
          "failTitle": "Failure at Ansa’s evidence",
          "failText": "A reckless decision at ansa’s evidence gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Separate the jar layers and compare them with river sediment.",
          "scoreDelta": 1,
          "nextNodeId": "R09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hide the jars and move toward the old plague pits.",
          "scoreDelta": 0,
          "nextNodeId": "R09B"
        }
      ]
    },
    {
      "id": "R08B",
      "turn": 8,
      "title": "Ansa’s evidence - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to ansa’s evidence. Her jars show two layers: harmless dye above material that thickens in water and blocks channels.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At ansa’s evidence, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving ansa’s evidence in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Separate the jar layers and compare them with river sediment, with the strongest account in hand.",
          "scoreDelta": 1,
          "nextNodeId": "R09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hide the jars and move toward the old plague pits, after securing the ground already won.",
          "scoreDelta": 0,
          "nextNodeId": "R09C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour the contents into the river to see what happens, without hearing the nearest witness.",
          "failTitle": "Failure at Ansa’s evidence",
          "failText": "A reckless decision at ansa’s evidence gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R08C",
      "turn": 8,
      "title": "Ansa’s evidence - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to ansa’s evidence. Her jars show two layers: harmless dye above material that thickens in water and blocks channels.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At ansa’s evidence, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at ansa’s evidence can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hide the jars and move toward the old plague pits, while keeping the safer line open.",
          "scoreDelta": 0,
          "nextNodeId": "R09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour the contents into the river to see what happens, without testing the danger ahead.",
          "failTitle": "Failure at Ansa’s evidence",
          "failText": "A reckless decision at ansa’s evidence gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Separate the jar layers and compare them with river sediment, using the clearest clue from this approach.",
          "scoreDelta": 1,
          "nextNodeId": "R09C"
        }
      ]
    },
    {
      "id": "R09A",
      "turn": 9,
      "title": "The toll riders - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the toll riders. False toll riders arrive with forged papers and know too much about the hidden cargo.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the toll riders, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the toll riders now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Expose the riders’ dead seal and protect the ferry rope.",
          "scoreDelta": 1,
          "nextNodeId": "R10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Delay them with questions while Ansa secures the jars.",
          "scoreDelta": 0,
          "nextNodeId": "R10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Surrender Ansa to men carrying forged papers.",
          "failTitle": "Failure at The toll riders",
          "failText": "A reckless decision at the toll riders gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R09B",
      "turn": 9,
      "title": "The toll riders - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the toll riders. False toll riders arrive with forged papers and know too much about the hidden cargo.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the toll riders, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the toll riders in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Delay them with questions while Ansa secures the jars, with the remaining risks kept in view.",
          "scoreDelta": 0,
          "nextNodeId": "R10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Surrender Ansa to men carrying forged papers, with the warning signs still unresolved.",
          "failTitle": "Failure at The toll riders",
          "failText": "A reckless decision at the toll riders gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Expose the riders’ dead seal and protect the ferry rope, following the trail that best fits the evidence.",
          "scoreDelta": 1,
          "nextNodeId": "R10B"
        }
      ]
    },
    {
      "id": "R09C",
      "turn": 9,
      "title": "The toll riders - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the toll riders. False toll riders arrive with forged papers and know too much about the hidden cargo.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the toll riders, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the toll riders can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Surrender Ansa to men carrying forged papers, despite the doubts raised by the evidence.",
          "failTitle": "Failure at The toll riders",
          "failText": "A reckless decision at the toll riders gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Expose the riders’ dead seal and protect the ferry rope, on the strongest evidence available.",
          "scoreDelta": 1,
          "nextNodeId": "R10C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Delay them with questions while Ansa secures the jars, by the slower but steadier course.",
          "scoreDelta": 0,
          "nextNodeId": "R10A"
        }
      ]
    },
    {
      "id": "R10A",
      "turn": 10,
      "title": "The drowned marker - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the drowned marker. A drowned stone marker reveals a forgotten intake beneath the old city wall.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the drowned marker, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the drowned marker now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the intake’s position before returning to the road.",
          "scoreDelta": 0,
          "nextNodeId": "R11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the marker apart and leave its meaning unread.",
          "failTitle": "Failure at The drowned marker",
          "failText": "A reckless decision at the drowned marker gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Raise the drowned marker and locate the forgotten intake.",
          "scoreDelta": 1,
          "nextNodeId": "R11A"
        }
      ]
    },
    {
      "id": "R10B",
      "turn": 10,
      "title": "The drowned marker - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the drowned marker. A drowned stone marker reveals a forgotten intake beneath the old city wall.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the drowned marker, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the drowned marker in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the marker apart and leave its meaning unread, without testing the danger ahead.",
          "failTitle": "Failure at The drowned marker",
          "failText": "A reckless decision at the drowned marker gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Raise the drowned marker and locate the forgotten intake, using the clearest clue from this approach.",
          "scoreDelta": 1,
          "nextNodeId": "R11B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the intake’s position before returning to the road, while keeping the safer line open.",
          "scoreDelta": 0,
          "nextNodeId": "R11C"
        }
      ]
    },
    {
      "id": "R10C",
      "turn": 10,
      "title": "The drowned marker - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the drowned marker. A drowned stone marker reveals a forgotten intake beneath the old city wall.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the drowned marker, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the drowned marker can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Raise the drowned marker and locate the forgotten intake, with old and new signs considered together.",
          "scoreDelta": 1,
          "nextNodeId": "R11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the intake’s position before returning to the road, without committing every resource at once.",
          "scoreDelta": 0,
          "nextNodeId": "R11A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the marker apart and leave its meaning unread, without securing help or a retreat.",
          "failTitle": "Failure at The drowned marker",
          "failText": "A reckless decision at the drowned marker gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R11A",
      "turn": 11,
      "title": "The lockhouse - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the lockhouse. The lockhouse cabinet has been opened, and Clerk Pell’s night signatures fill the ledger.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the lockhouse, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the lockhouse now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume every signed entry proves lawful access.",
          "failTitle": "Failure at The lockhouse",
          "failText": "A reckless decision at the lockhouse gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare Pell’s night entries with the missing lockhouse key.",
          "scoreDelta": 1,
          "nextNodeId": "R12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the lockhouse and send a warden to find Pell.",
          "scoreDelta": 0,
          "nextNodeId": "R12B"
        }
      ]
    },
    {
      "id": "R11B",
      "turn": 11,
      "title": "The lockhouse - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the lockhouse. The lockhouse cabinet has been opened, and Clerk Pell’s night signatures fill the ledger.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the lockhouse, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the lockhouse in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare Pell’s night entries with the missing lockhouse key, on the strongest evidence available.",
          "scoreDelta": 1,
          "nextNodeId": "R12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the lockhouse and send a warden to find Pell, by the slower but steadier course.",
          "scoreDelta": 0,
          "nextNodeId": "R12C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume every signed entry proves lawful access, despite the doubts raised by the evidence.",
          "failTitle": "Failure at The lockhouse",
          "failText": "A reckless decision at the lockhouse gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R11C",
      "turn": 11,
      "title": "The lockhouse - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the lockhouse. The lockhouse cabinet has been opened, and Clerk Pell’s night signatures fill the ledger.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the lockhouse, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the lockhouse can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the lockhouse and send a warden to find Pell, leaving room to change course.",
          "scoreDelta": 0,
          "nextNodeId": "R12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume every signed entry proves lawful access, on the strength of one uncertain sign.",
          "failTitle": "Failure at The lockhouse",
          "failText": "A reckless decision at the lockhouse gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare Pell’s night entries with the missing lockhouse key, along the route least likely to alert the quarry.",
          "scoreDelta": 1,
          "nextNodeId": "R12C"
        }
      ]
    },
    {
      "id": "R12A",
      "turn": 12,
      "title": "Pell’s secret - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to pell’s secret. Pell confesses that someone ordered the diversions, then gives you a scrap bearing House Vey’s crest.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At pell’s secret, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from pell’s secret now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Keep Pell talking until he explains the House Vey cloth.",
          "scoreDelta": 1,
          "nextNodeId": "R13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Pell into custody and preserve his muddy clothing.",
          "scoreDelta": 0,
          "nextNodeId": "R13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the frightened clerk flee with the remaining records.",
          "failTitle": "Failure at Pell’s secret",
          "failText": "A reckless decision at pell’s secret gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R12B",
      "turn": 12,
      "title": "Pell’s secret - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to pell’s secret. Pell confesses that someone ordered the diversions, then gives you a scrap bearing House Vey’s crest.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At pell’s secret, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving pell’s secret in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Pell into custody and preserve his muddy clothing, without committing every resource at once.",
          "scoreDelta": 0,
          "nextNodeId": "R13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the frightened clerk flee with the remaining records, without securing help or a retreat.",
          "failTitle": "Failure at Pell’s secret",
          "failText": "A reckless decision at pell’s secret gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep Pell talking until he explains the House Vey cloth, with old and new signs considered together.",
          "scoreDelta": 1,
          "nextNodeId": "R13B"
        }
      ]
    },
    {
      "id": "R12C",
      "turn": 12,
      "title": "Pell’s secret - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to pell’s secret. Pell confesses that someone ordered the diversions, then gives you a scrap bearing House Vey’s crest.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At pell’s secret, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at pell’s secret can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the frightened clerk flee with the remaining records, without hearing the nearest witness.",
          "failTitle": "Failure at Pell’s secret",
          "failText": "A reckless decision at pell’s secret gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep Pell talking until he explains the House Vey cloth, with the strongest account in hand.",
          "scoreDelta": 1,
          "nextNodeId": "R13C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Pell into custody and preserve his muddy clothing, after securing the ground already won.",
          "scoreDelta": 0,
          "nextNodeId": "R13A"
        }
      ]
    },
    {
      "id": "R13A",
      "turn": 13,
      "title": "House Vey’s mill - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to house vey’s mill. House Vey’s mill runs through a hidden channel cut from the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At house vey’s mill, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from house vey’s mill now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the mill hands away from their mistress.",
          "scoreDelta": 0,
          "nextNodeId": "R14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Corra’s road-repair story without viewing the cargo.",
          "failTitle": "Failure at House Vey’s mill",
          "failText": "A reckless decision at house vey’s mill gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the hidden mill channel before confronting Lady Corra.",
          "scoreDelta": 1,
          "nextNodeId": "R14A"
        }
      ]
    },
    {
      "id": "R13B",
      "turn": 13,
      "title": "House Vey’s mill - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to house vey’s mill. House Vey’s mill runs through a hidden channel cut from the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At house vey’s mill, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving house vey’s mill in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Corra’s road-repair story without viewing the cargo, on the strength of one uncertain sign.",
          "failTitle": "Failure at House Vey’s mill",
          "failText": "A reckless decision at house vey’s mill gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the hidden mill channel before confronting Lady Corra, along the route least likely to alert the quarry.",
          "scoreDelta": 1,
          "nextNodeId": "R14B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the mill hands away from their mistress, leaving room to change course.",
          "scoreDelta": 0,
          "nextNodeId": "R14C"
        }
      ]
    },
    {
      "id": "R13C",
      "turn": 13,
      "title": "House Vey’s mill - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to house vey’s mill. House Vey’s mill runs through a hidden channel cut from the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At house vey’s mill, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at house vey’s mill can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the hidden mill channel before confronting Lady Corra, following the trail that best fits the evidence.",
          "scoreDelta": 1,
          "nextNodeId": "R14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the mill hands away from their mistress, with the remaining risks kept in view.",
          "scoreDelta": 0,
          "nextNodeId": "R14A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Corra’s road-repair story without viewing the cargo, with the warning signs still unresolved.",
          "failTitle": "Failure at House Vey’s mill",
          "failText": "A reckless decision at house vey’s mill gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R14A",
      "turn": 14,
      "title": "The millrace - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the millrace. The millrace carries pale waste toward a marsh hollow, threatening to redirect the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the millrace, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the millrace now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Open every sluice at once and flood the lower farms.",
          "failTitle": "Failure at The millrace",
          "failText": "A reckless decision at the millrace gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test where the thickened water flows beyond the millrace.",
          "scoreDelta": 1,
          "nextNodeId": "R15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Block the side channel while Ansa surveys the hollow.",
          "scoreDelta": 0,
          "nextNodeId": "R15B"
        }
      ]
    },
    {
      "id": "R14B",
      "turn": 14,
      "title": "The millrace - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the millrace. The millrace carries pale waste toward a marsh hollow, threatening to redirect the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the millrace, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the millrace in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test where the thickened water flows beyond the millrace, with the strongest account in hand.",
          "scoreDelta": 1,
          "nextNodeId": "R15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Block the side channel while Ansa surveys the hollow, after securing the ground already won.",
          "scoreDelta": 0,
          "nextNodeId": "R15C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open every sluice at once and flood the lower farms, without hearing the nearest witness.",
          "failTitle": "Failure at The millrace",
          "failText": "A reckless decision at the millrace gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R14C",
      "turn": 14,
      "title": "The millrace - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the millrace. The millrace carries pale waste toward a marsh hollow, threatening to redirect the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the millrace, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the millrace can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Block the side channel while Ansa surveys the hollow, while keeping the safer line open.",
          "scoreDelta": 0,
          "nextNodeId": "R15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open every sluice at once and flood the lower farms, without testing the danger ahead.",
          "failTitle": "Failure at The millrace",
          "failText": "A reckless decision at the millrace gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test where the thickened water flows beyond the millrace, using the clearest clue from this approach.",
          "scoreDelta": 1,
          "nextNodeId": "R15C"
        }
      ]
    },
    {
      "id": "R15A",
      "turn": 15,
      "title": "The old plague pits - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the old plague pits. The old plague pits conceal fresh excavation and a tunnel toward the forgotten intake.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the old plague pits, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the old plague pits now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Enter the plague-pit tunnel with ropes and marked exits.",
          "scoreDelta": 1,
          "nextNodeId": "R16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the captured worker outside the excavation.",
          "scoreDelta": 0,
          "nextNodeId": "R16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send villagers into the unsupported tunnel ahead of you.",
          "failTitle": "Failure at The old plague pits",
          "failText": "A reckless decision at the old plague pits gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "R15B",
      "turn": 15,
      "title": "The old plague pits - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the old plague pits. The old plague pits conceal fresh excavation and a tunnel toward the forgotten intake.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the old plague pits, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the old plague pits in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the captured worker outside the excavation, with the remaining risks kept in view.",
          "scoreDelta": 0,
          "nextNodeId": "R16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send villagers into the unsupported tunnel ahead of you, with the warning signs still unresolved.",
          "failTitle": "Failure at The old plague pits",
          "failText": "A reckless decision at the old plague pits gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Enter the plague-pit tunnel with ropes and marked exits, following the trail that best fits the evidence.",
          "scoreDelta": 1,
          "nextNodeId": "R16B"
        }
      ]
    },
    {
      "id": "R15C",
      "turn": 15,
      "title": "The old plague pits - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the old plague pits. The old plague pits conceal fresh excavation and a tunnel toward the forgotten intake.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the old plague pits, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the old plague pits can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send villagers into the unsupported tunnel ahead of you, despite the doubts raised by the evidence.",
          "failTitle": "Failure at The old plague pits",
          "failText": "A reckless decision at the old plague pits gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Enter the plague-pit tunnel with ropes and marked exits, on the strongest evidence available.",
          "scoreDelta": 1,
          "nextNodeId": "R16C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the captured worker outside the excavation, by the slower but steadier course.",
          "scoreDelta": 0,
          "nextNodeId": "R16A"
        }
      ]
    },
    {
      "id": "R16A",
      "turn": 16,
      "title": "The buried chamber - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the buried chamber. The buried chamber holds correspondence proving a bargain between House Vey and a foreign grain broker.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the buried chamber, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the buried chamber now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the names and seals while Jorin guards the chamber.",
          "scoreDelta": 0,
          "nextNodeId": "R17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the letters because foreign names appear upon them.",
          "failTitle": "Failure at The buried chamber",
          "failText": "A reckless decision at the buried chamber gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure the correspondence before examining the barrels.",
          "scoreDelta": 1,
          "nextNodeId": "R17A"
        }
      ]
    },
    {
      "id": "R16B",
      "turn": 16,
      "title": "The buried chamber - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the buried chamber. The buried chamber holds correspondence proving a bargain between House Vey and a foreign grain broker.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the buried chamber, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the buried chamber in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the letters because foreign names appear upon them, without testing the danger ahead.",
          "failTitle": "Failure at The buried chamber",
          "failText": "A reckless decision at the buried chamber gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure the correspondence before examining the barrels, using the clearest clue from this approach.",
          "scoreDelta": 1,
          "nextNodeId": "R17B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the names and seals while Jorin guards the chamber, while keeping the safer line open.",
          "scoreDelta": 0,
          "nextNodeId": "R17C"
        }
      ]
    },
    {
      "id": "R16C",
      "turn": 16,
      "title": "The buried chamber - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the buried chamber. The buried chamber holds correspondence proving a bargain between House Vey and a foreign grain broker.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the buried chamber, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the buried chamber can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Secure the correspondence before examining the barrels, with old and new signs considered together.",
          "scoreDelta": 1,
          "nextNodeId": "R17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the names and seals while Jorin guards the chamber, without committing every resource at once.",
          "scoreDelta": 0,
          "nextNodeId": "R17A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the letters because foreign names appear upon them, without securing help or a retreat.",
          "failTitle": "Failure at The buried chamber",
          "failText": "A reckless decision at the buried chamber gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "R17A",
      "turn": 17,
      "title": "The rising water - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the rising water. Rain begins upstream, and the blocked intake is close to breaking.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the rising water, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the rising water now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep everyone together and leave the villages unwarned.",
          "failTitle": "Failure at The rising water",
          "failText": "A reckless decision at the rising water gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Send Jorin to warn villages while Ansa clears the intake.",
          "scoreDelta": 1,
          "nextNodeId": "R18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Move the evidence uphill before the flood arrives.",
          "scoreDelta": 0,
          "nextNodeId": "R18B"
        }
      ]
    },
    {
      "id": "R17B",
      "turn": 17,
      "title": "The rising water - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the rising water. Rain begins upstream, and the blocked intake is close to breaking.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the rising water, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the rising water in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send Jorin to warn villages while Ansa clears the intake, on the strongest evidence available.",
          "scoreDelta": 1,
          "nextNodeId": "R18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Move the evidence uphill before the flood arrives, by the slower but steadier course.",
          "scoreDelta": 0,
          "nextNodeId": "R18C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep everyone together and leave the villages unwarned, despite the doubts raised by the evidence.",
          "failTitle": "Failure at The rising water",
          "failText": "A reckless decision at the rising water gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "R17C",
      "turn": 17,
      "title": "The rising water - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the rising water. Rain begins upstream, and the blocked intake is close to breaking.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the rising water, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the rising water can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Move the evidence uphill before the flood arrives, leaving room to change course.",
          "scoreDelta": 0,
          "nextNodeId": "R18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep everyone together and leave the villages unwarned, on the strength of one uncertain sign.",
          "failTitle": "Failure at The rising water",
          "failText": "A reckless decision at the rising water gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Send Jorin to warn villages while Ansa clears the intake, along the route least likely to alert the quarry.",
          "scoreDelta": 1,
          "nextNodeId": "R18C"
        }
      ]
    },
    {
      "id": "R18A",
      "turn": 18,
      "title": "The night crossing - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the night crossing. Lanterns move along the mill side as Corra’s men carry barrels toward the waterworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the night crossing, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the night crossing now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cross under cover of rain and cut off Corra’s barrel crew.",
          "scoreDelta": 1,
          "nextNodeId": "R19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the near bank until Jorin’s warning boats return.",
          "scoreDelta": 0,
          "nextNodeId": "R19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge the rotten footbridge with the whole party.",
          "failTitle": "Failure at The night crossing",
          "failText": "A reckless decision at the night crossing gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "R18B",
      "turn": 18,
      "title": "The night crossing - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the night crossing. Lanterns move along the mill side as Corra’s men carry barrels toward the waterworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the night crossing, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the night crossing in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the near bank until Jorin’s warning boats return, without committing every resource at once.",
          "scoreDelta": 0,
          "nextNodeId": "R19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge the rotten footbridge with the whole party, without securing help or a retreat.",
          "failTitle": "Failure at The night crossing",
          "failText": "A reckless decision at the night crossing gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cross under cover of rain and cut off Corra’s barrel crew, with old and new signs considered together.",
          "scoreDelta": 1,
          "nextNodeId": "R19B"
        }
      ]
    },
    {
      "id": "R18C",
      "turn": 18,
      "title": "The night crossing - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the night crossing. Lanterns move along the mill side as Corra’s men carry barrels toward the waterworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the night crossing, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the night crossing can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge the rotten footbridge with the whole party, without hearing the nearest witness.",
          "failTitle": "Failure at The night crossing",
          "failText": "A reckless decision at the night crossing gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cross under cover of rain and cut off Corra’s barrel crew, with the strongest account in hand.",
          "scoreDelta": 1,
          "nextNodeId": "R19C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the near bank until Jorin’s warning boats return, after securing the ground already won.",
          "scoreDelta": 0,
          "nextNodeId": "R19A"
        }
      ]
    },
    {
      "id": "R19A",
      "turn": 19,
      "title": "The river remembers - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to the river remembers. At the final crossing, the river rises against rotten bridge supports and the letters may still be destroyed.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the river remembers, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from the river remembers now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Brace the bridge and demand the mill hands surrender.",
          "scoreDelta": 0,
          "nextNodeId": "R20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue Corra while the blocked intake begins to burst.",
          "failTitle": "Failure at The river remembers",
          "failText": "A reckless decision at the river remembers gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Save the letters and open the lock gate before taking Corra.",
          "scoreDelta": 1,
          "nextNodeId": "R20A"
        }
      ]
    },
    {
      "id": "R19B",
      "turn": 19,
      "title": "The river remembers - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to the river remembers. At the final crossing, the river rises against rotten bridge supports and the letters may still be destroyed.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the river remembers, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving the river remembers in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue Corra while the blocked intake begins to burst, on the strength of one uncertain sign.",
          "failTitle": "Failure at The river remembers",
          "failText": "A reckless decision at the river remembers gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Save the letters and open the lock gate before taking Corra, along the route least likely to alert the quarry.",
          "scoreDelta": 1,
          "nextNodeId": "R20B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Brace the bridge and demand the mill hands surrender, leaving room to change course.",
          "scoreDelta": 0,
          "nextNodeId": "R20C"
        }
      ]
    },
    {
      "id": "R19C",
      "turn": 19,
      "title": "The river remembers - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the river remembers. At the final crossing, the river rises against rotten bridge supports and the letters may still be destroyed.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At the river remembers, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at the river remembers can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Save the letters and open the lock gate before taking Corra, following the trail that best fits the evidence.",
          "scoreDelta": 1,
          "nextNodeId": "R20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Brace the bridge and demand the mill hands surrender, with the remaining risks kept in view.",
          "scoreDelta": 0,
          "nextNodeId": "R20A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue Corra while the blocked intake begins to burst, with the warning signs still unresolved.",
          "failTitle": "Failure at The river remembers",
          "failText": "A reckless decision at the river remembers gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "R20A",
      "turn": 20,
      "title": "A clear bank - swift trail",
      "narrative": [
        "Following the strongest evidence brings you to a clear bank. By dawn, the intake stands open, the conspirators face judgment, and Riverland’s water runs clear again.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a clear bank, the fresh details give you a narrow advantage.",
        "The current is rising, and every delay gives the hidden scheme another chance. Acting from a clear bank now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Allow House Vey to remove the remaining mineral in secret.",
          "failTitle": "Failure at A clear bank",
          "failText": "A reckless decision at a clear bank gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the surviving records and water samples to Aldric.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the intake guarded while the wells recover.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "R20B",
      "turn": 20,
      "title": "A clear bank - careful inquiry",
      "narrative": [
        "After securing the previous scene, you continue to a clear bank. By dawn, the intake stands open, the conspirators face judgment, and Riverland’s water runs clear again.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a clear bank, patience keeps uncertain testimony separate from proven fact.",
        "The current is rising, and every delay gives the hidden scheme another chance. Leaving a clear bank in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Present the surviving records and water samples to Aldric, with the strongest account in hand.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the intake guarded while the wells recover, after securing the ground already won.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Allow House Vey to remove the remaining mineral in secret, without hearing the nearest witness.",
          "failTitle": "Failure at A clear bank",
          "failText": "A reckless decision at a clear bank gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "R20C",
      "turn": 20,
      "title": "A clear bank - late discovery",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a clear bank. By dawn, the intake stands open, the conspirators face judgment, and Riverland’s water runs clear again.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events. At a clear bank, you rebuild the weakened trail from the signs that remain.",
        "The current is rising, and every delay gives the hidden scheme another chance. A careful decision at a clear bank can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the intake guarded while the wells recover, while keeping the safer line open.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Allow House Vey to remove the remaining mineral in secret, without testing the danger ahead.",
          "failTitle": "Failure at A clear bank",
          "failText": "A reckless decision at a clear bank gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the surviving records and water samples to Aldric, using the clearest clue from this approach.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
