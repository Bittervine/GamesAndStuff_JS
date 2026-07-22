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
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
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
        "A gray ash begins falling over Riverland, and Duke Aldric sends you to find its source before the wells are spoiled.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R02B"
        }
      ]
    },
    {
      "id": "R01C",
      "turn": 1,
      "title": "Ash on the river - late discovery",
      "narrative": [
        "A gray ash begins falling over Riverland, and Duke Aldric sends you to find its source before the wells are spoiled.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R02A",
      "turn": 2,
      "title": "The dead fish - swift trail",
      "narrative": [
        "Dead fish gather beneath Willow Ford while a sealed barge passes upstream under a false ducal pennant.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
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
        "Dead fish gather beneath Willow Ford while a sealed barge passes upstream under a false ducal pennant.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R02C",
      "turn": 2,
      "title": "The dead fish - late discovery",
      "narrative": [
        "Dead fish gather beneath Willow Ford while a sealed barge passes upstream under a false ducal pennant.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R03A"
        }
      ]
    },
    {
      "id": "R03A",
      "turn": 3,
      "title": "The abandoned barge - swift trail",
      "narrative": [
        "The empty barge holds wet straw, broken jars, and lamp oil; a boot trail climbs toward an abandoned limeworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R03B",
      "turn": 3,
      "title": "The abandoned barge - careful inquiry",
      "narrative": [
        "The empty barge holds wet straw, broken jars, and lamp oil; a boot trail climbs toward an abandoned limeworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R04A"
        }
      ]
    },
    {
      "id": "R03C",
      "turn": 3,
      "title": "The abandoned barge - late discovery",
      "narrative": [
        "The empty barge holds wet straw, broken jars, and lamp oil; a boot trail climbs toward an abandoned limeworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R04B"
        }
      ]
    },
    {
      "id": "R04A",
      "turn": 4,
      "title": "The limeworks - swift trail",
      "narrative": [
        "The limeworks contain pale grit, a torn courier cloak, and a careful list of village wells.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
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
        "The limeworks contain pale grit, a torn courier cloak, and a careful list of village wells.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R05B"
        }
      ]
    },
    {
      "id": "R04C",
      "turn": 4,
      "title": "The limeworks - late discovery",
      "narrative": [
        "The limeworks contain pale grit, a torn courier cloak, and a careful list of village wells.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R05A",
      "turn": 5,
      "title": "Jorin’s warning - swift trail",
      "narrative": [
        "Ferryman Jorin admits he was paid to look away and names Ansa Reed, a disgraced Riverland surveyor.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
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
        "Ferryman Jorin admits he was paid to look away and names Ansa Reed, a disgraced Riverland surveyor.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R05C",
      "turn": 5,
      "title": "Jorin’s warning - late discovery",
      "narrative": [
        "Ferryman Jorin admits he was paid to look away and names Ansa Reed, a disgraced Riverland surveyor.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R06A"
        }
      ]
    },
    {
      "id": "R06A",
      "turn": 6,
      "title": "The willow camp - swift trail",
      "narrative": [
        "A hidden camp holds river maps marking wells, ferries, and forgotten plague roads.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R06B",
      "turn": 6,
      "title": "The willow camp - careful inquiry",
      "narrative": [
        "A hidden camp holds river maps marking wells, ferries, and forgotten plague roads.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R07A"
        }
      ]
    },
    {
      "id": "R06C",
      "turn": 6,
      "title": "The willow camp - late discovery",
      "narrative": [
        "A hidden camp holds river maps marking wells, ferries, and forgotten plague roads.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R07B"
        }
      ]
    },
    {
      "id": "R07A",
      "turn": 7,
      "title": "The red ochre mark - swift trail",
      "narrative": [
        "Ansa explains that the ash is mineral waste being used to turn villages against one another.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
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
        "Ansa explains that the ash is mineral waste being used to turn villages against one another.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R08B"
        }
      ]
    },
    {
      "id": "R07C",
      "turn": 7,
      "title": "The red ochre mark - late discovery",
      "narrative": [
        "Ansa explains that the ash is mineral waste being used to turn villages against one another.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R08A",
      "turn": 8,
      "title": "Ansa’s evidence - swift trail",
      "narrative": [
        "Her jars show two layers: harmless dye above material that thickens in water and blocks channels.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
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
        "Her jars show two layers: harmless dye above material that thickens in water and blocks channels.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R08C",
      "turn": 8,
      "title": "Ansa’s evidence - late discovery",
      "narrative": [
        "Her jars show two layers: harmless dye above material that thickens in water and blocks channels.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R09A"
        }
      ]
    },
    {
      "id": "R09A",
      "turn": 9,
      "title": "The toll riders - swift trail",
      "narrative": [
        "False toll riders arrive with forged papers and know too much about the hidden cargo.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R09B",
      "turn": 9,
      "title": "The toll riders - careful inquiry",
      "narrative": [
        "False toll riders arrive with forged papers and know too much about the hidden cargo.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R10A"
        }
      ]
    },
    {
      "id": "R09C",
      "turn": 9,
      "title": "The toll riders - late discovery",
      "narrative": [
        "False toll riders arrive with forged papers and know too much about the hidden cargo.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R10B"
        }
      ]
    },
    {
      "id": "R10A",
      "turn": 10,
      "title": "The drowned marker - swift trail",
      "narrative": [
        "A drowned stone marker reveals a forgotten intake beneath the old city wall.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
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
        "A drowned stone marker reveals a forgotten intake beneath the old city wall.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R11B"
        }
      ]
    },
    {
      "id": "R10C",
      "turn": 10,
      "title": "The drowned marker - late discovery",
      "narrative": [
        "A drowned stone marker reveals a forgotten intake beneath the old city wall.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R11A",
      "turn": 11,
      "title": "The lockhouse - swift trail",
      "narrative": [
        "The lockhouse cabinet has been opened, and Clerk Pell’s night signatures fill the ledger.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
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
        "The lockhouse cabinet has been opened, and Clerk Pell’s night signatures fill the ledger.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R11C",
      "turn": 11,
      "title": "The lockhouse - late discovery",
      "narrative": [
        "The lockhouse cabinet has been opened, and Clerk Pell’s night signatures fill the ledger.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R12A"
        }
      ]
    },
    {
      "id": "R12A",
      "turn": 12,
      "title": "Pell’s secret - swift trail",
      "narrative": [
        "Pell confesses that someone ordered the diversions, then gives you a scrap bearing House Vey’s crest.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R12B",
      "turn": 12,
      "title": "Pell’s secret - careful inquiry",
      "narrative": [
        "Pell confesses that someone ordered the diversions, then gives you a scrap bearing House Vey’s crest.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R13A"
        }
      ]
    },
    {
      "id": "R12C",
      "turn": 12,
      "title": "Pell’s secret - late discovery",
      "narrative": [
        "Pell confesses that someone ordered the diversions, then gives you a scrap bearing House Vey’s crest.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R13B"
        }
      ]
    },
    {
      "id": "R13A",
      "turn": 13,
      "title": "House Vey’s mill - swift trail",
      "narrative": [
        "House Vey’s mill runs through a hidden channel cut from the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
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
        "House Vey’s mill runs through a hidden channel cut from the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R14B"
        }
      ]
    },
    {
      "id": "R13C",
      "turn": 13,
      "title": "House Vey’s mill - late discovery",
      "narrative": [
        "House Vey’s mill runs through a hidden channel cut from the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R14A",
      "turn": 14,
      "title": "The millrace - swift trail",
      "narrative": [
        "The millrace carries pale waste toward a marsh hollow, threatening to redirect the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
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
        "The millrace carries pale waste toward a marsh hollow, threatening to redirect the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R14C",
      "turn": 14,
      "title": "The millrace - late discovery",
      "narrative": [
        "The millrace carries pale waste toward a marsh hollow, threatening to redirect the river.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R15A"
        }
      ]
    },
    {
      "id": "R15A",
      "turn": 15,
      "title": "The old plague pits - swift trail",
      "narrative": [
        "The old plague pits conceal fresh excavation and a tunnel toward the forgotten intake.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        }
      ]
    },
    {
      "id": "R15B",
      "turn": 15,
      "title": "The old plague pits - careful inquiry",
      "narrative": [
        "The old plague pits conceal fresh excavation and a tunnel toward the forgotten intake.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R16A"
        }
      ]
    },
    {
      "id": "R15C",
      "turn": 15,
      "title": "The old plague pits - late discovery",
      "narrative": [
        "The old plague pits conceal fresh excavation and a tunnel toward the forgotten intake.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R16B"
        }
      ]
    },
    {
      "id": "R16A",
      "turn": 16,
      "title": "The buried chamber - swift trail",
      "narrative": [
        "The buried chamber holds correspondence proving a bargain between House Vey and a foreign grain broker.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
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
        "The buried chamber holds correspondence proving a bargain between House Vey and a foreign grain broker.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R17B"
        }
      ]
    },
    {
      "id": "R16C",
      "turn": 16,
      "title": "The buried chamber - late discovery",
      "narrative": [
        "The buried chamber holds correspondence proving a bargain between House Vey and a foreign grain broker.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        }
      ]
    },
    {
      "id": "R17A",
      "turn": 17,
      "title": "The rising water - swift trail",
      "narrative": [
        "Rain begins upstream, and the blocked intake is close to breaking.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
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
        "Rain begins upstream, and the blocked intake is close to breaking.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        }
      ]
    },
    {
      "id": "R17C",
      "turn": 17,
      "title": "The rising water - late discovery",
      "narrative": [
        "Rain begins upstream, and the blocked intake is close to breaking.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R18A"
        }
      ]
    },
    {
      "id": "R18A",
      "turn": 18,
      "title": "The night crossing - swift trail",
      "narrative": [
        "Lanterns move along the mill side as Corra’s men carry barrels toward the waterworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        }
      ]
    },
    {
      "id": "R18B",
      "turn": 18,
      "title": "The night crossing - careful inquiry",
      "narrative": [
        "Lanterns move along the mill side as Corra’s men carry barrels toward the waterworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R19A"
        }
      ]
    },
    {
      "id": "R18C",
      "turn": 18,
      "title": "The night crossing - late discovery",
      "narrative": [
        "Lanterns move along the mill side as Corra’s men carry barrels toward the waterworks.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R19B"
        }
      ]
    },
    {
      "id": "R19A",
      "turn": 19,
      "title": "The river remembers - swift trail",
      "narrative": [
        "At the final crossing, the river rises against rotten bridge supports and the letters may still be destroyed.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
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
        "At the final crossing, the river rises against rotten bridge supports and the letters may still be destroyed.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R20B"
        }
      ]
    },
    {
      "id": "R19C",
      "turn": 19,
      "title": "The river remembers - late discovery",
      "narrative": [
        "At the final crossing, the river rises against rotten bridge supports and the letters may still be destroyed.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "nextNodeId": "R20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "nextNodeId": "R20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        }
      ]
    },
    {
      "id": "R20A",
      "turn": 20,
      "title": "A clear bank - swift trail",
      "narrative": [
        "By dawn, the intake stands open, the conspirators face judgment, and Riverland’s water runs clear again.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
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
        "By dawn, the intake stands open, the conspirators face judgment, and Riverland’s water runs clear again.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        }
      ]
    },
    {
      "id": "R20C",
      "turn": 20,
      "title": "A clear bank - late discovery",
      "narrative": [
        "By dawn, the intake stands open, the conspirators face judgment, and Riverland’s water runs clear again.",
        "You keep the evidence dry and your attention on practical signs: rope, iron, footprints, and the way frightened people remember events.",
        "The current is rising, and every delay gives the hidden scheme another chance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the nearest people, then continue with measured caution.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust the convenient official story without checking it.",
          "failTitle": "The River Turns Against You",
          "failText": "The false trail wins the time it needs. The river works fail, and danger spreads beyond the reach of your search.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the physical evidence and protect the villages first.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
