window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-frost-line",
  "title": "The Frost Line",
  "summary": "When a shepherd vanishes beside a strange line of frost, the ranger discovers a quiet border theft in the Gray Mountains and follows a helpful gray silver tabby toward the hidden pass.",
  "maxTurns": 20,
  "startNodeId": "X01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The prisoners return, the shepherd is safe, and Duke Aldric’s wardens reset the boundary stones before Lord Veyr can deny the attempt. Nera takes command of the pass, while the gray silver tabby disappears into Elderwood as quietly as it arrived.",
    "low": "The pass remains in Brackenwald’s hands, but the altered stones and lost patrol leave a stain on the border. The shepherd returns with little memory of the camp, and Aldric must strengthen the watch before the next winter closes in."
  },
  "nodes": [
    {
      "id": "X01A",
      "turn": 1,
      "title": "The frost line - clear sign",
      "narrative": [
        "A hard frost draws a straight white line across Elderwood’s southern meadows, though the ground beyond it is still soft. Duke Aldric sends you after a shepherd disappears beside the strange boundary.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X02A"
        }
      ]
    },
    {
      "id": "X01B",
      "turn": 1,
      "title": "The frost line - steady trail",
      "narrative": [
        "A hard frost draws a straight white line across Elderwood’s southern meadows, though the ground beyond it is still soft. Duke Aldric sends you after a shepherd disappears beside the strange boundary.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X02B"
        }
      ]
    },
    {
      "id": "X01C",
      "turn": 1,
      "title": "The frost line - late arrival",
      "narrative": [
        "A hard frost draws a straight white line across Elderwood’s southern meadows, though the ground beyond it is still soft. Duke Aldric sends you after a shepherd disappears beside the strange boundary.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X02A",
      "turn": 2,
      "title": "A vanished shepherd - clear sign",
      "narrative": [
        "At first light, the shepherd’s crook is found upright in the grass. A gray silver tabby with green eyes watches from the stone wall, then slips toward the dark trees.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X03B"
        }
      ]
    },
    {
      "id": "X02B",
      "turn": 2,
      "title": "A vanished shepherd - steady trail",
      "narrative": [
        "At first light, the shepherd’s crook is found upright in the grass. A gray silver tabby with green eyes watches from the stone wall, then slips toward the dark trees.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X02C",
      "turn": 2,
      "title": "A vanished shepherd - late arrival",
      "narrative": [
        "At first light, the shepherd’s crook is found upright in the grass. A gray silver tabby with green eyes watches from the stone wall, then slips toward the dark trees.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X03A"
        }
      ]
    },
    {
      "id": "X03A",
      "turn": 3,
      "title": "Marks in the ice - clear sign",
      "narrative": [
        "Small marks in the ice resemble dragged branches, but the pattern repeats around boot prints. The tabby appears beside a half-buried trail marker and vanishes again.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X03B",
      "turn": 3,
      "title": "Marks in the ice - steady trail",
      "narrative": [
        "Small marks in the ice resemble dragged branches, but the pattern repeats around boot prints. The tabby appears beside a half-buried trail marker and vanishes again.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X04A"
        }
      ]
    },
    {
      "id": "X03C",
      "turn": 3,
      "title": "Marks in the ice - late arrival",
      "narrative": [
        "Small marks in the ice resemble dragged branches, but the pattern repeats around boot prints. The tabby appears beside a half-buried trail marker and vanishes again.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X04B"
        }
      ]
    },
    {
      "id": "X04A",
      "turn": 4,
      "title": "The charcoal hut - clear sign",
      "narrative": [
        "An abandoned charcoal hut contains fresh ashes, a blood-stained bandage, and a map of old border paths. Nothing suggests a beast; someone is using the forest as cover.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X05A"
        }
      ]
    },
    {
      "id": "X04B",
      "turn": 4,
      "title": "The charcoal hut - steady trail",
      "narrative": [
        "An abandoned charcoal hut contains fresh ashes, a blood-stained bandage, and a map of old border paths. Nothing suggests a beast; someone is using the forest as cover.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X05B"
        }
      ]
    },
    {
      "id": "X04C",
      "turn": 4,
      "title": "The charcoal hut - late arrival",
      "narrative": [
        "An abandoned charcoal hut contains fresh ashes, a blood-stained bandage, and a map of old border paths. Nothing suggests a beast; someone is using the forest as cover.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X05A",
      "turn": 5,
      "title": "Nera’s lantern - clear sign",
      "narrative": [
        "Nera Holt, a border scout, arrives with a lantern and says the missing shepherd saw men moving stone at night. She believes an old mountain boundary is being rebuilt in secret.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X06B"
        }
      ]
    },
    {
      "id": "X05B",
      "turn": 5,
      "title": "Nera’s lantern - steady trail",
      "narrative": [
        "Nera Holt, a border scout, arrives with a lantern and says the missing shepherd saw men moving stone at night. She believes an old mountain boundary is being rebuilt in secret.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X05C",
      "turn": 5,
      "title": "Nera’s lantern - late arrival",
      "narrative": [
        "Nera Holt, a border scout, arrives with a lantern and says the missing shepherd saw men moving stone at night. She believes an old mountain boundary is being rebuilt in secret.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X06A"
        }
      ]
    },
    {
      "id": "X06A",
      "turn": 6,
      "title": "The buried road - clear sign",
      "narrative": [
        "The buried road climbs toward the Gray Mountains, where forgotten stones once marked the duke’s limit. A cart has passed recently despite the snow.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X06B",
      "turn": 6,
      "title": "The buried road - steady trail",
      "narrative": [
        "The buried road climbs toward the Gray Mountains, where forgotten stones once marked the duke’s limit. A cart has passed recently despite the snow.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X07A"
        }
      ]
    },
    {
      "id": "X06C",
      "turn": 6,
      "title": "The buried road - late arrival",
      "narrative": [
        "The buried road climbs toward the Gray Mountains, where forgotten stones once marked the duke’s limit. A cart has passed recently despite the snow.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X07B"
        }
      ]
    },
    {
      "id": "X07A",
      "turn": 7,
      "title": "A green-eyed guide - clear sign",
      "narrative": [
        "The tabby startles a crow from a fallen log, revealing a silver buckle beneath the leaves. The buckle belongs to a Brackenwald patrol cloak.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X08A"
        }
      ]
    },
    {
      "id": "X07B",
      "turn": 7,
      "title": "A green-eyed guide - steady trail",
      "narrative": [
        "The tabby startles a crow from a fallen log, revealing a silver buckle beneath the leaves. The buckle belongs to a Brackenwald patrol cloak.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X08B"
        }
      ]
    },
    {
      "id": "X07C",
      "turn": 7,
      "title": "A green-eyed guide - late arrival",
      "narrative": [
        "The tabby startles a crow from a fallen log, revealing a silver buckle beneath the leaves. The buckle belongs to a Brackenwald patrol cloak.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X08A",
      "turn": 8,
      "title": "The broken cairn - clear sign",
      "narrative": [
        "A boundary cairn has been broken apart and rebuilt several paces away. The new position quietly gives a hidden valley to another lord’s claim.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X09B"
        }
      ]
    },
    {
      "id": "X08B",
      "turn": 8,
      "title": "The broken cairn - steady trail",
      "narrative": [
        "A boundary cairn has been broken apart and rebuilt several paces away. The new position quietly gives a hidden valley to another lord’s claim.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X08C",
      "turn": 8,
      "title": "The broken cairn - late arrival",
      "narrative": [
        "A boundary cairn has been broken apart and rebuilt several paces away. The new position quietly gives a hidden valley to another lord’s claim.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X09A"
        }
      ]
    },
    {
      "id": "X09A",
      "turn": 9,
      "title": "The mountain answer - clear sign",
      "narrative": [
        "A deep horn answers from the mountains. Nera says it is the signal used by surveyors, but no survey party is registered in Aldric’s records.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X09B",
      "turn": 9,
      "title": "The mountain answer - steady trail",
      "narrative": [
        "A deep horn answers from the mountains. Nera says it is the signal used by surveyors, but no survey party is registered in Aldric’s records.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X10A"
        }
      ]
    },
    {
      "id": "X09C",
      "turn": 9,
      "title": "The mountain answer - late arrival",
      "narrative": [
        "A deep horn answers from the mountains. Nera says it is the signal used by surveyors, but no survey party is registered in Aldric’s records.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X10B"
        }
      ]
    },
    {
      "id": "X10A",
      "turn": 10,
      "title": "The empty lookout - clear sign",
      "narrative": [
        "The old lookout stands empty except for warm stones and a coil of red cord. Someone has been watching the roads below and reporting movements uphill.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X11A"
        }
      ]
    },
    {
      "id": "X10B",
      "turn": 10,
      "title": "The empty lookout - steady trail",
      "narrative": [
        "The old lookout stands empty except for warm stones and a coil of red cord. Someone has been watching the roads below and reporting movements uphill.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X11B"
        }
      ]
    },
    {
      "id": "X10C",
      "turn": 10,
      "title": "The empty lookout - late arrival",
      "narrative": [
        "The old lookout stands empty except for warm stones and a coil of red cord. Someone has been watching the roads below and reporting movements uphill.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X11A",
      "turn": 11,
      "title": "A map in birchbark - clear sign",
      "narrative": [
        "A birchbark map shows springs, goat tracks, and a route through a pass erased from every current chart. The shepherd’s name is written beside the pass.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X12B"
        }
      ]
    },
    {
      "id": "X11B",
      "turn": 11,
      "title": "A map in birchbark - steady trail",
      "narrative": [
        "A birchbark map shows springs, goat tracks, and a route through a pass erased from every current chart. The shepherd’s name is written beside the pass.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X11C",
      "turn": 11,
      "title": "A map in birchbark - late arrival",
      "narrative": [
        "A birchbark map shows springs, goat tracks, and a route through a pass erased from every current chart. The shepherd’s name is written beside the pass.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X12A"
        }
      ]
    },
    {
      "id": "X12A",
      "turn": 12,
      "title": "The old boundary - clear sign",
      "narrative": [
        "The map leads to an ancient boundary post. Its iron plate has been pried loose, exposing a message hidden inside by a former warden.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X12B",
      "turn": 12,
      "title": "The old boundary - steady trail",
      "narrative": [
        "The map leads to an ancient boundary post. Its iron plate has been pried loose, exposing a message hidden inside by a former warden.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X13A"
        }
      ]
    },
    {
      "id": "X12C",
      "turn": 12,
      "title": "The old boundary - late arrival",
      "narrative": [
        "The map leads to an ancient boundary post. Its iron plate has been pried loose, exposing a message hidden inside by a former warden.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X13B"
        }
      ]
    },
    {
      "id": "X13A",
      "turn": 13,
      "title": "Men below the snow - clear sign",
      "narrative": [
        "The message warns that Lord Veyr’s men are placing false markers to claim the pass before winter closes it. Several armed men now camp below the snowline.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X14A"
        }
      ]
    },
    {
      "id": "X13B",
      "turn": 13,
      "title": "Men below the snow - steady trail",
      "narrative": [
        "The message warns that Lord Veyr’s men are placing false markers to claim the pass before winter closes it. Several armed men now camp below the snowline.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X14B"
        }
      ]
    },
    {
      "id": "X13C",
      "turn": 13,
      "title": "Men below the snow - late arrival",
      "narrative": [
        "The message warns that Lord Veyr’s men are placing false markers to claim the pass before winter closes it. Several armed men now camp below the snowline.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X14A",
      "turn": 14,
      "title": "The split patrol - clear sign",
      "narrative": [
        "A Brackenwald patrol has been captured without a fight. Their captain says the enemy wore familiar colors and spoke with local accents.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X15B"
        }
      ]
    },
    {
      "id": "X14B",
      "turn": 14,
      "title": "The split patrol - steady trail",
      "narrative": [
        "A Brackenwald patrol has been captured without a fight. Their captain says the enemy wore familiar colors and spoke with local accents.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        }
      ]
    },
    {
      "id": "X14C",
      "turn": 14,
      "title": "The split patrol - late arrival",
      "narrative": [
        "A Brackenwald patrol has been captured without a fight. Their captain says the enemy wore familiar colors and spoke with local accents.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X15A"
        }
      ]
    },
    {
      "id": "X15A",
      "turn": 15,
      "title": "The hidden pass - clear sign",
      "narrative": [
        "The hidden pass is narrow and defensible, but its far side opens toward Riverland trade roads. Whoever controls it can move soldiers unseen.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        }
      ]
    },
    {
      "id": "X15B",
      "turn": 15,
      "title": "The hidden pass - steady trail",
      "narrative": [
        "The hidden pass is narrow and defensible, but its far side opens toward Riverland trade roads. Whoever controls it can move soldiers unseen.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X16A"
        }
      ]
    },
    {
      "id": "X15C",
      "turn": 15,
      "title": "The hidden pass - late arrival",
      "narrative": [
        "The hidden pass is narrow and defensible, but its far side opens toward Riverland trade roads. Whoever controls it can move soldiers unseen.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X16B"
        }
      ]
    },
    {
      "id": "X16A",
      "turn": 16,
      "title": "A dangerous bargain - clear sign",
      "narrative": [
        "Lord Veyr’s envoy offers a bargain: abandon the old boundary and the shepherd and patrol will be released. Nera refuses to trust the promise.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X17A"
        }
      ]
    },
    {
      "id": "X16B",
      "turn": 16,
      "title": "A dangerous bargain - steady trail",
      "narrative": [
        "Lord Veyr’s envoy offers a bargain: abandon the old boundary and the shepherd and patrol will be released. Nera refuses to trust the promise.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X17B"
        }
      ]
    },
    {
      "id": "X16C",
      "turn": 16,
      "title": "A dangerous bargain - late arrival",
      "narrative": [
        "Lord Veyr’s envoy offers a bargain: abandon the old boundary and the shepherd and patrol will be released. Nera refuses to trust the promise.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        }
      ]
    },
    {
      "id": "X17A",
      "turn": 17,
      "title": "The white wall - clear sign",
      "narrative": [
        "A white wall of wind-driven snow blocks the pass. Beneath it lies a rope line leading toward the prisoners’ camp and a second line leading to the false cairn.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X18B"
        }
      ]
    },
    {
      "id": "X17B",
      "turn": 17,
      "title": "The white wall - steady trail",
      "narrative": [
        "A white wall of wind-driven snow blocks the pass. Beneath it lies a rope line leading toward the prisoners’ camp and a second line leading to the false cairn.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        }
      ]
    },
    {
      "id": "X17C",
      "turn": 17,
      "title": "The white wall - late arrival",
      "narrative": [
        "A white wall of wind-driven snow blocks the pass. Beneath it lies a rope line leading toward the prisoners’ camp and a second line leading to the false cairn.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X18A"
        }
      ]
    },
    {
      "id": "X18A",
      "turn": 18,
      "title": "The last signal - clear sign",
      "narrative": [
        "The tabby darts across the snow and draws your eye to a loose stone above the camp. Behind it is the signal horn that can call Nera’s scattered scouts.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        }
      ]
    },
    {
      "id": "X18B",
      "turn": 18,
      "title": "The last signal - steady trail",
      "narrative": [
        "The tabby darts across the snow and draws your eye to a loose stone above the camp. Behind it is the signal horn that can call Nera’s scattered scouts.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X19A"
        }
      ]
    },
    {
      "id": "X18C",
      "turn": 18,
      "title": "The last signal - late arrival",
      "narrative": [
        "The tabby darts across the snow and draws your eye to a loose stone above the camp. Behind it is the signal horn that can call Nera’s scattered scouts.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X19B"
        }
      ]
    },
    {
      "id": "X19A",
      "turn": 19,
      "title": "The thawing camp - clear sign",
      "narrative": [
        "With the horn restored, the scouts cut off the camp while you recover the prisoners. The false markers are gathered as proof, but the pass is still at risk.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X20A"
        }
      ]
    },
    {
      "id": "X19B",
      "turn": 19,
      "title": "The thawing camp - steady trail",
      "narrative": [
        "With the horn restored, the scouts cut off the camp while you recover the prisoners. The false markers are gathered as proof, but the pass is still at risk.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X20B"
        }
      ]
    },
    {
      "id": "X19C",
      "turn": 19,
      "title": "The thawing camp - late arrival",
      "narrative": [
        "With the horn restored, the scouts cut off the camp while you recover the prisoners. The false markers are gathered as proof, but the pass is still at risk.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "X20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "nextNodeId": "X20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        }
      ]
    },
    {
      "id": "X20A",
      "turn": 20,
      "title": "Spring at the border - clear sign",
      "narrative": [
        "At spring thaw, Aldric’s wardens reset the stones in public view. The shepherd returns home, Nera takes command of the border watch, and the tabby leaves no tracks in the mud.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "X20B",
      "turn": 20,
      "title": "Spring at the border - steady trail",
      "narrative": [
        "At spring thaw, Aldric’s wardens reset the stones in public view. The shepherd returns home, Nera takes command of the border watch, and the tabby leaves no tracks in the mud.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        }
      ]
    },
    {
      "id": "X20C",
      "turn": 20,
      "title": "Spring at the border - late arrival",
      "narrative": [
        "At spring thaw, Aldric’s wardens reset the stones in public view. The shepherd returns home, Nera takes command of the border watch, and the tabby leaves no tracks in the mud.",
        "The gray silver tabby keeps near the edges of the search, its green eyes bright whenever the trail changes. You trust no single sign, but you do not ignore a useful one.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the trail, then continue with the wardens.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the strange boundary without scouting the ground.",
          "failTitle": "Lost Beyond the Line",
          "failText": "The hidden patrol surrounds you before the border can be understood. The shepherd and the evidence disappear into the mountain.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the boundary signs carefully and protect the witnesses.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
