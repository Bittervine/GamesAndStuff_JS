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
        "Nera checks the exposed ground at the frost line while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the frost line now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the nearby shepherds about the missing man.",
          "scoreDelta": 0,
          "nextNodeId": "X02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne straight across the white line.",
          "failTitle": "Failure at The frost line",
          "failText": "A reckless decision at the frost line gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the unnatural frost boundary before crossing it.",
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
        "After securing the previous scene, you continue to the frost line. A hard frost draws a straight white line across Elderwood’s southern meadows, though the ground beyond it is still soft. Duke Aldric sends you after a shepherd disappears beside the strange boundary.",
        "At the frost line, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the frost line in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne straight across the white line, taking time to verify each step.",
          "failTitle": "Failure at The frost line",
          "failText": "A reckless decision at the frost line gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the unnatural frost boundary before crossing it, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X02B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the nearby shepherds about the missing man, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X02C"
        }
      ]
    },
    {
      "id": "X01C",
      "turn": 1,
      "title": "The frost line - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the frost line. A hard frost draws a straight white line across Elderwood’s southern meadows, though the ground beyond it is still soft. Duke Aldric sends you after a shepherd disappears beside the strange boundary.",
        "Nera helps rebuild the weakened trail at the frost line before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the frost line can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the unnatural frost boundary before crossing it, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the nearby shepherds about the missing man, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X02A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne straight across the white line, despite the ground already lost.",
          "failTitle": "Failure at The frost line",
          "failText": "A reckless decision at the frost line gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X02A",
      "turn": 2,
      "title": "A vanished shepherd - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to a vanished shepherd. At first light, the shepherd’s crook is found upright in the grass. A gray silver tabby with green eyes watches from the stone wall, then slips toward the dark trees.",
        "Nera checks the exposed ground at a vanished shepherd while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from a vanished shepherd now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Call loudly into the trees and reveal your approach.",
          "failTitle": "Failure at A vanished shepherd",
          "failText": "A reckless decision at a vanished shepherd gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the tabby toward the crook and sheltered ground.",
          "scoreDelta": 1,
          "nextNodeId": "X03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Preserve the tracks around the upright staff.",
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
        "After securing the previous scene, you continue to a vanished shepherd. At first light, the shepherd’s crook is found upright in the grass. A gray silver tabby with green eyes watches from the stone wall, then slips toward the dark trees.",
        "At a vanished shepherd, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving a vanished shepherd in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the tabby toward the crook and sheltered ground, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Preserve the tracks around the upright staff, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X03C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call loudly into the trees and reveal your approach, taking time to verify each step.",
          "failTitle": "Failure at A vanished shepherd",
          "failText": "A reckless decision at a vanished shepherd gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X02C",
      "turn": 2,
      "title": "A vanished shepherd - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a vanished shepherd. At first light, the shepherd’s crook is found upright in the grass. A gray silver tabby with green eyes watches from the stone wall, then slips toward the dark trees.",
        "Nera helps rebuild the weakened trail at a vanished shepherd before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at a vanished shepherd can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Preserve the tracks around the upright staff, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call loudly into the trees and reveal your approach, despite the ground already lost.",
          "failTitle": "Failure at A vanished shepherd",
          "failText": "A reckless decision at a vanished shepherd gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the tabby toward the crook and sheltered ground, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X03C"
        }
      ]
    },
    {
      "id": "X03A",
      "turn": 3,
      "title": "Marks in the ice - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to marks in the ice. Small marks in the ice resemble dragged branches, but the pattern repeats around boot prints. A half-buried trail marker stands where the false grooves cross.",
        "Nera checks the exposed ground at marks in the ice while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from marks in the ice now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the dragged branches with the concealed boot prints.",
          "scoreDelta": 1,
          "nextNodeId": "X04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Raise the half-buried marker without moving it.",
          "scoreDelta": 0,
          "nextNodeId": "X04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the first icy groove as though it were a true trail.",
          "failTitle": "Failure at Marks in the ice",
          "failText": "A reckless decision at marks in the ice gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X03B",
      "turn": 3,
      "title": "Marks in the ice - steady trail",
      "narrative": [
        "After securing the previous scene, you continue to marks in the ice. Small marks in the ice resemble dragged branches, but the pattern repeats around boot prints. A half-buried trail marker stands where the false grooves cross.",
        "At marks in the ice, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving marks in the ice in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Raise the half-buried marker without moving it, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the first icy groove as though it were a true trail, taking time to verify each step.",
          "failTitle": "Failure at Marks in the ice",
          "failText": "A reckless decision at marks in the ice gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the dragged branches with the concealed boot prints, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X04B"
        }
      ]
    },
    {
      "id": "X03C",
      "turn": 3,
      "title": "Marks in the ice - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to marks in the ice. Small marks in the ice resemble dragged branches, but the pattern repeats around boot prints. A half-buried trail marker stands where the false grooves cross.",
        "Nera helps rebuild the weakened trail at marks in the ice before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at marks in the ice can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the first icy groove as though it were a true trail, despite the ground already lost.",
          "failTitle": "Failure at Marks in the ice",
          "failText": "A reckless decision at marks in the ice gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the dragged branches with the concealed boot prints, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X04C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Raise the half-buried marker without moving it, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X04A"
        }
      ]
    },
    {
      "id": "X04A",
      "turn": 4,
      "title": "The charcoal hut - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the charcoal hut. An abandoned charcoal hut contains fresh ashes, a blood-stained bandage, and a map of old border paths. Nothing suggests a beast; someone is using the forest as cover.",
        "Nera checks the exposed ground at the charcoal hut while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the charcoal hut now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the warm ashes to judge how recently it was left.",
          "scoreDelta": 0,
          "nextNodeId": "X05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the bloodied bandage and hidden map.",
          "failTitle": "Failure at The charcoal hut",
          "failText": "A reckless decision at the charcoal hut gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search the charcoal hut for the wounded traveler’s route.",
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
        "After securing the previous scene, you continue to the charcoal hut. An abandoned charcoal hut contains fresh ashes, a blood-stained bandage, and a map of old border paths. Nothing suggests a beast; someone is using the forest as cover.",
        "At the charcoal hut, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the charcoal hut in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the bloodied bandage and hidden map, taking time to verify each step.",
          "failTitle": "Failure at The charcoal hut",
          "failText": "A reckless decision at the charcoal hut gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search the charcoal hut for the wounded traveler’s route, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X05B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the warm ashes to judge how recently it was left, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X05C"
        }
      ]
    },
    {
      "id": "X04C",
      "turn": 4,
      "title": "The charcoal hut - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the charcoal hut. An abandoned charcoal hut contains fresh ashes, a blood-stained bandage, and a map of old border paths. Nothing suggests a beast; someone is using the forest as cover.",
        "Nera helps rebuild the weakened trail at the charcoal hut before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the charcoal hut can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Search the charcoal hut for the wounded traveler’s route, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the warm ashes to judge how recently it was left, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X05A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the bloodied bandage and hidden map, despite the ground already lost.",
          "failTitle": "Failure at The charcoal hut",
          "failText": "A reckless decision at the charcoal hut gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X05A",
      "turn": 5,
      "title": "Nera’s lantern - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to nera’s lantern. Nera Holt, a border scout, arrives with a lantern and says the missing shepherd saw men moving stone at night. She believes an old mountain boundary is being rebuilt in secret.",
        "Nera checks the exposed ground at nera’s lantern while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from nera’s lantern now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Reject the scout’s warning because no survey was registered.",
          "failTitle": "Failure at Nera’s lantern",
          "failText": "A reckless decision at nera’s lantern gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Check Nera’s account against the moved boundary stones.",
          "scoreDelta": 1,
          "nextNodeId": "X06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Join Nera’s lantern patrol along the lower path.",
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
        "After securing the previous scene, you continue to nera’s lantern. Nera Holt, a border scout, arrives with a lantern and says the missing shepherd saw men moving stone at night. She believes an old mountain boundary is being rebuilt in secret.",
        "At nera’s lantern, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving nera’s lantern in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Check Nera’s account against the moved boundary stones, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Join Nera’s lantern patrol along the lower path, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X06C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Reject the scout’s warning because no survey was registered, taking time to verify each step.",
          "failTitle": "Failure at Nera’s lantern",
          "failText": "A reckless decision at nera’s lantern gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X05C",
      "turn": 5,
      "title": "Nera’s lantern - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to nera’s lantern. Nera Holt, a border scout, arrives with a lantern and says the missing shepherd saw men moving stone at night. She believes an old mountain boundary is being rebuilt in secret.",
        "Nera helps rebuild the weakened trail at nera’s lantern before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at nera’s lantern can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Join Nera’s lantern patrol along the lower path, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Reject the scout’s warning because no survey was registered, despite the ground already lost.",
          "failTitle": "Failure at Nera’s lantern",
          "failText": "A reckless decision at nera’s lantern gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Check Nera’s account against the moved boundary stones, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X06C"
        }
      ]
    },
    {
      "id": "X06A",
      "turn": 6,
      "title": "The buried road - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the buried road. The buried road climbs toward the Gray Mountains, where forgotten stones once marked the duke’s limit. A cart has passed recently despite the snow.",
        "Nera checks the exposed ground at the buried road while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the buried road now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the loaded cart marks up the buried road.",
          "scoreDelta": 1,
          "nextNodeId": "X07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Nera ahead to watch the next turning.",
          "scoreDelta": 0,
          "nextNodeId": "X07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force Thorne onto the steepest snow-covered slope.",
          "failTitle": "Failure at The buried road",
          "failText": "A reckless decision at the buried road gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X06B",
      "turn": 6,
      "title": "The buried road - steady trail",
      "narrative": [
        "After securing the previous scene, you continue to the buried road. The buried road climbs toward the Gray Mountains, where forgotten stones once marked the duke’s limit. A cart has passed recently despite the snow.",
        "At the buried road, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the buried road in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Nera ahead to watch the next turning, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force Thorne onto the steepest snow-covered slope, taking time to verify each step.",
          "failTitle": "Failure at The buried road",
          "failText": "A reckless decision at the buried road gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the loaded cart marks up the buried road, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X07B"
        }
      ]
    },
    {
      "id": "X06C",
      "turn": 6,
      "title": "The buried road - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the buried road. The buried road climbs toward the Gray Mountains, where forgotten stones once marked the duke’s limit. A cart has passed recently despite the snow.",
        "Nera helps rebuild the weakened trail at the buried road before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the buried road can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Force Thorne onto the steepest snow-covered slope, despite the ground already lost.",
          "failTitle": "Failure at The buried road",
          "failText": "A reckless decision at the buried road gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the loaded cart marks up the buried road, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X07C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Nera ahead to watch the next turning, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X07A"
        }
      ]
    },
    {
      "id": "X07A",
      "turn": 7,
      "title": "The patrol buckle - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the patrol buckle. A crow rising from a fallen log reveals a silver buckle beneath the leaves. The buckle belongs to a Brackenwald patrol cloak.",
        "Nera checks the exposed ground at the patrol buckle while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the patrol buckle now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the fallen log while Nera watches the brush.",
          "scoreDelta": 0,
          "nextNodeId": "X08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore Nera’s signal and leave the buckle buried.",
          "failTitle": "Failure at The patrol buckle",
          "failText": "A reckless decision at the patrol buckle gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Recover the patrol buckle exposed by the startled crow.",
          "scoreDelta": 1,
          "nextNodeId": "X08A"
        }
      ]
    },
    {
      "id": "X07B",
      "turn": 7,
      "title": "The patrol buckle - steady trail",
      "narrative": [
        "After securing the previous scene, you continue to the patrol buckle. A crow rising from a fallen log reveals a silver buckle beneath the leaves. The buckle belongs to a Brackenwald patrol cloak.",
        "At the patrol buckle, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the patrol buckle in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore Nera’s signal and leave the buckle buried, taking time to verify each step.",
          "failTitle": "Failure at The patrol buckle",
          "failText": "A reckless decision at the patrol buckle gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Recover the patrol buckle exposed by the startled crow, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X08B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the fallen log while Nera watches the brush, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X08C"
        }
      ]
    },
    {
      "id": "X07C",
      "turn": 7,
      "title": "The patrol buckle - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the patrol buckle. A crow rising from a fallen log reveals a silver buckle beneath the leaves. The buckle belongs to a Brackenwald patrol cloak.",
        "Nera helps rebuild the weakened trail at the patrol buckle before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the patrol buckle can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Recover the patrol buckle exposed by the startled crow, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the fallen log while Nera watches the brush, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X08A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore Nera’s signal and leave the buckle buried, despite the ground already lost.",
          "failTitle": "Failure at The patrol buckle",
          "failText": "A reckless decision at the patrol buckle gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X08A",
      "turn": 8,
      "title": "The broken cairn - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the broken cairn. A boundary cairn has been broken apart and rebuilt several paces away. The new position quietly gives a hidden valley to another lord’s claim.",
        "Nera checks the exposed ground at the broken cairn while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the broken cairn now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the stones before proving where they belonged.",
          "failTitle": "Failure at The broken cairn",
          "failText": "A reckless decision at the broken cairn gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure the shifted cairn against the old foundation.",
          "scoreDelta": 1,
          "nextNodeId": "X09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Record the false position and compare it with the old foundation.",
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
        "After securing the previous scene, you continue to the broken cairn. A boundary cairn has been broken apart and rebuilt several paces away. The new position quietly gives a hidden valley to another lord’s claim.",
        "At the broken cairn, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the broken cairn in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Measure the shifted cairn against the old foundation, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Record the false position and compare it with the old foundation, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X09C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the stones before proving where they belonged, taking time to verify each step.",
          "failTitle": "Failure at The broken cairn",
          "failText": "A reckless decision at the broken cairn gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X08C",
      "turn": 8,
      "title": "The broken cairn - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the broken cairn. A boundary cairn has been broken apart and rebuilt several paces away. The new position quietly gives a hidden valley to another lord’s claim.",
        "Nera helps rebuild the weakened trail at the broken cairn before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the broken cairn can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Record the false position and compare it with the old foundation, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the stones before proving where they belonged, despite the ground already lost.",
          "failTitle": "Failure at The broken cairn",
          "failText": "A reckless decision at the broken cairn gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure the shifted cairn against the old foundation, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X09C"
        }
      ]
    },
    {
      "id": "X09A",
      "turn": 9,
      "title": "The mountain answer - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the mountain answer. A deep horn answers from the mountains. Nera says it is the signal used by surveyors, but no survey party is registered in Aldric’s records.",
        "Nera checks the exposed ground at the mountain answer while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the mountain answer now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Answer the survey horn with Nera’s recognized signal.",
          "scoreDelta": 1,
          "nextNodeId": "X10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take cover and watch for movement after the horn.",
          "scoreDelta": 0,
          "nextNodeId": "X10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Sound a war call that warns the hidden surveyors.",
          "failTitle": "Failure at The mountain answer",
          "failText": "A reckless decision at the mountain answer gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X09B",
      "turn": 9,
      "title": "The mountain answer - steady trail",
      "narrative": [
        "After securing the previous scene, you continue to the mountain answer. A deep horn answers from the mountains. Nera says it is the signal used by surveyors, but no survey party is registered in Aldric’s records.",
        "At the mountain answer, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the mountain answer in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take cover and watch for movement after the horn, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Sound a war call that warns the hidden surveyors, taking time to verify each step.",
          "failTitle": "Failure at The mountain answer",
          "failText": "A reckless decision at the mountain answer gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Answer the survey horn with Nera’s recognized signal, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X10B"
        }
      ]
    },
    {
      "id": "X09C",
      "turn": 9,
      "title": "The mountain answer - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the mountain answer. A deep horn answers from the mountains. Nera says it is the signal used by surveyors, but no survey party is registered in Aldric’s records.",
        "Nera helps rebuild the weakened trail at the mountain answer before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the mountain answer can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Sound a war call that warns the hidden surveyors, despite the ground already lost.",
          "failTitle": "Failure at The mountain answer",
          "failText": "A reckless decision at the mountain answer gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Answer the survey horn with Nera’s recognized signal, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X10C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take cover and watch for movement after the horn, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X10A"
        }
      ]
    },
    {
      "id": "X10A",
      "turn": 10,
      "title": "The empty lookout - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the empty lookout. The old lookout stands empty except for warm stones and a coil of red cord. Someone has been watching the roads below and reporting movements uphill.",
        "Nera checks the exposed ground at the empty lookout while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the empty lookout now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the red cord as evidence and leave a watcher.",
          "scoreDelta": 0,
          "nextNodeId": "X11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light the lookout beacon and expose the search.",
          "failTitle": "Failure at The empty lookout",
          "failText": "A reckless decision at the empty lookout gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search the warm lookout stones for the observer’s route.",
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
        "After securing the previous scene, you continue to the empty lookout. The old lookout stands empty except for warm stones and a coil of red cord. Someone has been watching the roads below and reporting movements uphill.",
        "At the empty lookout, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the empty lookout in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Light the lookout beacon and expose the search, taking time to verify each step.",
          "failTitle": "Failure at The empty lookout",
          "failText": "A reckless decision at the empty lookout gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search the warm lookout stones for the observer’s route, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X11B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the red cord as evidence and leave a watcher, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X11C"
        }
      ]
    },
    {
      "id": "X10C",
      "turn": 10,
      "title": "The empty lookout - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the empty lookout. The old lookout stands empty except for warm stones and a coil of red cord. Someone has been watching the roads below and reporting movements uphill.",
        "Nera helps rebuild the weakened trail at the empty lookout before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the empty lookout can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Search the warm lookout stones for the observer’s route, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the red cord as evidence and leave a watcher, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X11A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light the lookout beacon and expose the search, despite the ground already lost.",
          "failTitle": "Failure at The empty lookout",
          "failText": "A reckless decision at the empty lookout gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X11A",
      "turn": 11,
      "title": "A map in birchbark - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to a map in birchbark. A birchbark map shows springs, goat tracks, and a route through a pass erased from every current chart. The shepherd’s name is written beside the pass.",
        "Nera checks the exposed ground at a map in birchbark while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from a map in birchbark now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Discard the bark map as an obsolete border sketch.",
          "failTitle": "Failure at A map in birchbark",
          "failText": "A reckless decision at a map in birchbark gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the birchbark map with Aldric’s current charts.",
          "scoreDelta": 1,
          "nextNodeId": "X12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the marked springs toward the erased pass.",
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
        "After securing the previous scene, you continue to a map in birchbark. A birchbark map shows springs, goat tracks, and a route through a pass erased from every current chart. The shepherd’s name is written beside the pass.",
        "At a map in birchbark, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving a map in birchbark in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the birchbark map with Aldric’s current charts, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the marked springs toward the erased pass, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X12C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Discard the bark map as an obsolete border sketch, taking time to verify each step.",
          "failTitle": "Failure at A map in birchbark",
          "failText": "A reckless decision at a map in birchbark gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X11C",
      "turn": 11,
      "title": "A map in birchbark - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a map in birchbark. A birchbark map shows springs, goat tracks, and a route through a pass erased from every current chart. The shepherd’s name is written beside the pass.",
        "Nera helps rebuild the weakened trail at a map in birchbark before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at a map in birchbark can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the marked springs toward the erased pass, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Discard the bark map as an obsolete border sketch, despite the ground already lost.",
          "failTitle": "Failure at A map in birchbark",
          "failText": "A reckless decision at a map in birchbark gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the birchbark map with Aldric’s current charts, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X12C"
        }
      ]
    },
    {
      "id": "X12A",
      "turn": 12,
      "title": "The old boundary - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the old boundary. The map leads to an ancient boundary post. Its iron plate has been pried loose, exposing a message hidden inside by a former warden.",
        "Nera checks the exposed ground at the old boundary while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the old boundary now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Open the boundary post and preserve the former warden’s message.",
          "scoreDelta": 1,
          "nextNodeId": "X13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Reset the iron plate before following the warning.",
          "scoreDelta": 0,
          "nextNodeId": "X13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the ancient post without recording its position.",
          "failTitle": "Failure at The old boundary",
          "failText": "A reckless decision at the old boundary gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X12B",
      "turn": 12,
      "title": "The old boundary - steady trail",
      "narrative": [
        "After securing the previous scene, you continue to the old boundary. The map leads to an ancient boundary post. Its iron plate has been pried loose, exposing a message hidden inside by a former warden.",
        "At the old boundary, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the old boundary in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Reset the iron plate before following the warning, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the ancient post without recording its position, taking time to verify each step.",
          "failTitle": "Failure at The old boundary",
          "failText": "A reckless decision at the old boundary gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the boundary post and preserve the former warden’s message, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X13B"
        }
      ]
    },
    {
      "id": "X12C",
      "turn": 12,
      "title": "The old boundary - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the old boundary. The map leads to an ancient boundary post. Its iron plate has been pried loose, exposing a message hidden inside by a former warden.",
        "Nera helps rebuild the weakened trail at the old boundary before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the old boundary can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the ancient post without recording its position, despite the ground already lost.",
          "failTitle": "Failure at The old boundary",
          "failText": "A reckless decision at the old boundary gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the boundary post and preserve the former warden’s message, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X13C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Reset the iron plate before following the warning, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X13A"
        }
      ]
    },
    {
      "id": "X13A",
      "turn": 13,
      "title": "Men below the snow - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to men below the snow. The message warns that Lord Veyr’s men are placing false markers to claim the pass before winter closes it. Several armed men now camp below the snowline.",
        "Nera checks the exposed ground at men below the snow while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from men below the snow now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait for darkness while Nera locates the prisoners.",
          "scoreDelta": 0,
          "nextNodeId": "X14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Descend openly into the armed camp.",
          "failTitle": "Failure at Men below the snow",
          "failText": "A reckless decision at men below the snow gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count Lord Veyr’s campfires from concealed high ground.",
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
        "After securing the previous scene, you continue to men below the snow. The message warns that Lord Veyr’s men are placing false markers to claim the pass before winter closes it. Several armed men now camp below the snowline.",
        "At men below the snow, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving men below the snow in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Descend openly into the armed camp, taking time to verify each step.",
          "failTitle": "Failure at Men below the snow",
          "failText": "A reckless decision at men below the snow gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count Lord Veyr’s campfires from concealed high ground, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X14B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait for darkness while Nera locates the prisoners, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X14C"
        }
      ]
    },
    {
      "id": "X13C",
      "turn": 13,
      "title": "Men below the snow - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to men below the snow. The message warns that Lord Veyr’s men are placing false markers to claim the pass before winter closes it. Several armed men now camp below the snowline.",
        "Nera helps rebuild the weakened trail at men below the snow before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at men below the snow can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Count Lord Veyr’s campfires from concealed high ground, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait for darkness while Nera locates the prisoners, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X14A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Descend openly into the armed camp, despite the ground already lost.",
          "failTitle": "Failure at Men below the snow",
          "failText": "A reckless decision at men below the snow gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X14A",
      "turn": 14,
      "title": "The split patrol - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the split patrol. A Brackenwald patrol has been captured without a fight. Their captain says the enemy wore familiar colors and spoke with local accents.",
        "Nera checks the exposed ground at the split patrol while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the split patrol now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Attack the familiar uniforms before learning who wears them.",
          "failTitle": "Failure at The split patrol",
          "failText": "A reckless decision at the split patrol gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Speak to the captured captain from outside bow range.",
          "scoreDelta": 1,
          "nextNodeId": "X15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Create a diversion while Nera cuts one prisoner free.",
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
        "After securing the previous scene, you continue to the split patrol. A Brackenwald patrol has been captured without a fight. Their captain says the enemy wore familiar colors and spoke with local accents.",
        "At the split patrol, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the split patrol in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Speak to the captured captain from outside bow range, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Create a diversion while Nera cuts one prisoner free, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X15C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Attack the familiar uniforms before learning who wears them, taking time to verify each step.",
          "failTitle": "Failure at The split patrol",
          "failText": "A reckless decision at the split patrol gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "X14C",
      "turn": 14,
      "title": "The split patrol - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the split patrol. A Brackenwald patrol has been captured without a fight. Their captain says the enemy wore familiar colors and spoke with local accents.",
        "Nera helps rebuild the weakened trail at the split patrol before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the split patrol can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Create a diversion while Nera cuts one prisoner free, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Attack the familiar uniforms before learning who wears them, despite the ground already lost.",
          "failTitle": "Failure at The split patrol",
          "failText": "A reckless decision at the split patrol gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Speak to the captured captain from outside bow range, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X15C"
        }
      ]
    },
    {
      "id": "X15A",
      "turn": 15,
      "title": "The hidden pass - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the hidden pass. The hidden pass is narrow and defensible, but its far side opens toward Riverland trade roads. Whoever controls it can move soldiers unseen.",
        "Nera checks the exposed ground at the hidden pass while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the hidden pass now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark both entrances to the hidden pass for Aldric’s wardens.",
          "scoreDelta": 1,
          "nextNodeId": "X16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the narrow approach while Nera scouts the far side.",
          "scoreDelta": 0,
          "nextNodeId": "X16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Advance through the pass without checking the heights.",
          "failTitle": "Failure at The hidden pass",
          "failText": "A reckless decision at the hidden pass gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "X15B",
      "turn": 15,
      "title": "The hidden pass - steady trail",
      "narrative": [
        "After securing the previous scene, you continue to the hidden pass. The hidden pass is narrow and defensible, but its far side opens toward Riverland trade roads. Whoever controls it can move soldiers unseen.",
        "At the hidden pass, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the hidden pass in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the narrow approach while Nera scouts the far side, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Advance through the pass without checking the heights, taking time to verify each step.",
          "failTitle": "Failure at The hidden pass",
          "failText": "A reckless decision at the hidden pass gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark both entrances to the hidden pass for Aldric’s wardens, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X16B"
        }
      ]
    },
    {
      "id": "X15C",
      "turn": 15,
      "title": "The hidden pass - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the hidden pass. The hidden pass is narrow and defensible, but its far side opens toward Riverland trade roads. Whoever controls it can move soldiers unseen.",
        "Nera helps rebuild the weakened trail at the hidden pass before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the hidden pass can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Advance through the pass without checking the heights, despite the ground already lost.",
          "failTitle": "Failure at The hidden pass",
          "failText": "A reckless decision at the hidden pass gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark both entrances to the hidden pass for Aldric’s wardens, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X16C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the narrow approach while Nera scouts the far side, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X16A"
        }
      ]
    },
    {
      "id": "X16A",
      "turn": 16,
      "title": "A dangerous bargain - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to a dangerous bargain. Lord Veyr’s envoy offers a bargain: abandon the old boundary and the shepherd and patrol will be released. Nera refuses to trust the promise.",
        "Nera checks the exposed ground at a dangerous bargain while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from a dangerous bargain now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Delay the bargain while Nera searches for another route.",
          "scoreDelta": 0,
          "nextNodeId": "X17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Veyr’s promise and surrender the old boundary.",
          "failTitle": "Failure at A dangerous bargain",
          "failText": "A reckless decision at a dangerous bargain gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Demand proof the prisoners are alive before answering the envoy.",
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
        "After securing the previous scene, you continue to a dangerous bargain. Lord Veyr’s envoy offers a bargain: abandon the old boundary and the shepherd and patrol will be released. Nera refuses to trust the promise.",
        "At a dangerous bargain, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving a dangerous bargain in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Veyr’s promise and surrender the old boundary, taking time to verify each step.",
          "failTitle": "Failure at A dangerous bargain",
          "failText": "A reckless decision at a dangerous bargain gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Demand proof the prisoners are alive before answering the envoy, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X17B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Delay the bargain while Nera searches for another route, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X17C"
        }
      ]
    },
    {
      "id": "X16C",
      "turn": 16,
      "title": "A dangerous bargain - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a dangerous bargain. Lord Veyr’s envoy offers a bargain: abandon the old boundary and the shepherd and patrol will be released. Nera refuses to trust the promise.",
        "Nera helps rebuild the weakened trail at a dangerous bargain before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at a dangerous bargain can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Demand proof the prisoners are alive before answering the envoy, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Delay the bargain while Nera searches for another route, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X17A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Veyr’s promise and surrender the old boundary, despite the ground already lost.",
          "failTitle": "Failure at A dangerous bargain",
          "failText": "A reckless decision at a dangerous bargain gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "X17A",
      "turn": 17,
      "title": "The white wall - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the white wall. A white wall of wind-driven snow blocks the pass. Beneath it lies a rope line leading toward the prisoners’ camp and a second line leading to the false cairn.",
        "Nera checks the exposed ground at the white wall while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the white wall now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the lines and walk blind into the driven snow.",
          "failTitle": "Failure at The white wall",
          "failText": "A reckless decision at the white wall gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test both rope lines before the white wall closes in.",
          "scoreDelta": 1,
          "nextNodeId": "X18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Nera along the line leading toward the prisoners.",
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
        "After securing the previous scene, you continue to the white wall. A white wall of wind-driven snow blocks the pass. Beneath it lies a rope line leading toward the prisoners’ camp and a second line leading to the false cairn.",
        "At the white wall, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the white wall in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test both rope lines before the white wall closes in, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Nera along the line leading toward the prisoners, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X18C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the lines and walk blind into the driven snow, taking time to verify each step.",
          "failTitle": "Failure at The white wall",
          "failText": "A reckless decision at the white wall gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "X17C",
      "turn": 17,
      "title": "The white wall - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the white wall. A white wall of wind-driven snow blocks the pass. Beneath it lies a rope line leading toward the prisoners’ camp and a second line leading to the false cairn.",
        "Nera helps rebuild the weakened trail at the white wall before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the white wall can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Nera along the line leading toward the prisoners, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the lines and walk blind into the driven snow, despite the ground already lost.",
          "failTitle": "Failure at The white wall",
          "failText": "A reckless decision at the white wall gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test both rope lines before the white wall closes in, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X18C"
        }
      ]
    },
    {
      "id": "X18A",
      "turn": 18,
      "title": "The last signal - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the last signal. The tabby darts across the snow and draws your eye to a loose stone above the camp. Behind it is the signal horn that can call Nera’s scattered scouts.",
        "Nera checks the exposed ground at the last signal while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the last signal now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the tabby’s movement to locate the hidden signal horn.",
          "scoreDelta": 1,
          "nextNodeId": "X19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the loose stone while Nera reaches the camp.",
          "scoreDelta": 0,
          "nextNodeId": "X19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dislodge the rock above the prisoners without warning.",
          "failTitle": "Failure at The last signal",
          "failText": "A reckless decision at the last signal gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "X18B",
      "turn": 18,
      "title": "The last signal - steady trail",
      "narrative": [
        "After securing the previous scene, you continue to the last signal. The tabby darts across the snow and draws your eye to a loose stone above the camp. Behind it is the signal horn that can call Nera’s scattered scouts.",
        "At the last signal, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the last signal in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the loose stone while Nera reaches the camp, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dislodge the rock above the prisoners without warning, taking time to verify each step.",
          "failTitle": "Failure at The last signal",
          "failText": "A reckless decision at the last signal gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the tabby’s movement to locate the hidden signal horn, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X19B"
        }
      ]
    },
    {
      "id": "X18C",
      "turn": 18,
      "title": "The last signal - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the last signal. The tabby darts across the snow and draws your eye to a loose stone above the camp. Behind it is the signal horn that can call Nera’s scattered scouts.",
        "Nera helps rebuild the weakened trail at the last signal before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the last signal can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Dislodge the rock above the prisoners without warning, despite the ground already lost.",
          "failTitle": "Failure at The last signal",
          "failText": "A reckless decision at the last signal gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the tabby’s movement to locate the hidden signal horn, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X19C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the loose stone while Nera reaches the camp, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X19A"
        }
      ]
    },
    {
      "id": "X19A",
      "turn": 19,
      "title": "The thawing camp - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to the thawing camp. With the horn restored, the scouts cut off the camp while you recover the prisoners. The false markers are gathered as proof, but the pass is still at risk.",
        "Nera checks the exposed ground at the thawing camp while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from the thawing camp now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Recover the false markers while the scouts secure Veyr’s men.",
          "scoreDelta": 0,
          "nextNodeId": "X20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue the envoy and leave the prisoners unguarded.",
          "failTitle": "Failure at The thawing camp",
          "failText": "A reckless decision at the thawing camp gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Sound the true warden signal and close both camp exits.",
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
        "After securing the previous scene, you continue to the thawing camp. With the horn restored, the scouts cut off the camp while you recover the prisoners. The false markers are gathered as proof, but the pass is still at risk.",
        "At the thawing camp, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving the thawing camp in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue the envoy and leave the prisoners unguarded, taking time to verify each step.",
          "failTitle": "Failure at The thawing camp",
          "failText": "A reckless decision at the thawing camp gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Sound the true warden signal and close both camp exits, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "X20B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Recover the false markers while the scouts secure Veyr’s men, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "X20C"
        }
      ]
    },
    {
      "id": "X19C",
      "turn": 19,
      "title": "The thawing camp - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the thawing camp. With the horn restored, the scouts cut off the camp while you recover the prisoners. The false markers are gathered as proof, but the pass is still at risk.",
        "Nera helps rebuild the weakened trail at the thawing camp before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at the thawing camp can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Sound the true warden signal and close both camp exits, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "X20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Recover the false markers while the scouts secure Veyr’s men, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "X20A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue the envoy and leave the prisoners unguarded, despite the ground already lost.",
          "failTitle": "Failure at The thawing camp",
          "failText": "A reckless decision at the thawing camp gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "X20A",
      "turn": 20,
      "title": "Spring at the border - clear sign",
      "narrative": [
        "Following the strongest evidence brings you to spring at the border. At spring thaw, Aldric’s wardens reset the stones in public view. The shepherd returns home, Nera takes command of the border watch, and the first supply carts cross the restored boundary road.",
        "Nera checks the exposed ground at spring at the border while you preserve the freshest signs.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Acting from spring at the border now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Settle the border privately with Veyr’s remaining officers.",
          "failTitle": "Failure at Spring at the border",
          "failText": "A reckless decision at spring at the border gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the old message and false cairns at the spring hearing.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the pass watched until every marker is reset.",
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
        "After securing the previous scene, you continue to spring at the border. At spring thaw, Aldric’s wardens reset the stones in public view. The shepherd returns home, Nera takes command of the border watch, and the first supply carts cross the restored boundary road.",
        "At spring at the border, Nera keeps watch as you separate old boundary lore from present evidence.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. Leaving spring at the border in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Present the old message and false cairns at the spring hearing, taking time to verify each step.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the pass watched until every marker is reset, taking time to verify each step.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Settle the border privately with Veyr’s remaining officers, taking time to verify each step.",
          "failTitle": "Failure at Spring at the border",
          "failText": "A reckless decision at spring at the border gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "X20C",
      "turn": 20,
      "title": "Spring at the border - late arrival",
      "narrative": [
        "The slower trail costs time, but it eventually leads to spring at the border. At spring thaw, Aldric’s wardens reset the stones in public view. The shepherd returns home, Nera takes command of the border watch, and the first supply carts cross the restored boundary road.",
        "Nera helps rebuild the weakened trail at spring at the border before wind and snow erase it.",
        "The mountain boundary is being altered by careful hands, and every hour gives those hands more ground. A careful decision at spring at the border can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the pass watched until every marker is reset, despite the ground already lost.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Settle the border privately with Veyr’s remaining officers, despite the ground already lost.",
          "failTitle": "Failure at Spring at the border",
          "failText": "A reckless decision at spring at the border gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the old message and false cairns at the spring hearing, despite the ground already lost.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
