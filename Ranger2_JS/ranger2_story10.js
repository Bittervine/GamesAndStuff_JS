window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-black-bloom",
  "title": "The Black Bloom",
  "summary": "When Oakenhurst’s orchards flower out of season and black pollen sickens the valley, the ranger uncovers a merchant’s plot to control the harvest by turning bees and blight into weapons.",
  "maxTurns": 20,
  "startNodeId": "T01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The queen hive is secured before the blight reaches the Riverland road. Master Halren faces Duke Aldric’s judgment, Tamsin preserves the healthy bees, and Oakenhurst begins saving cuttings from the trees that survived. The next harvest will be smaller, but it will belong to the valley rather than a single grasping hand.",
    "low": "The plot is broken, but not before several orchards are lost and the valley’s bees are scattered. Halren’s ledgers prove the crime, though recovery will take years of pruning, grafting, and patient work. When spring returns, Oakenhurst watches every unexpected blossom with care."
  },
  "nodes": [
    {
      "id": "T01A",
      "turn": 1,
      "title": "The silent orchard - healthy sign",
      "narrative": [
        "At Oakenhurst, every apple tree has flowered overnight though summer is weeks away. Duke Aldric sends you when the blossoms begin making villagers ill.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the silent orchard, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the silent orchard now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the sickest orchard and question its workers.",
          "scoreDelta": 0,
          "nextNodeId": "T02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Taste the black pollen to decide whether it is dangerous.",
          "failTitle": "Failure at The silent orchard",
          "failText": "A reckless decision at the silent orchard gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Examine the unnatural blossoms before anyone burns them.",
          "scoreDelta": 1,
          "nextNodeId": "T02A"
        }
      ]
    },
    {
      "id": "T01B",
      "turn": 1,
      "title": "The silent orchard - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the silent orchard. At Oakenhurst, every apple tree has flowered overnight though summer is weeks away. Duke Aldric sends you when the blossoms begin making villagers ill.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the silent orchard, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the silent orchard in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Taste the black pollen to decide whether it is dangerous, taking time to verify each step.",
          "failTitle": "Failure at The silent orchard",
          "failText": "A reckless decision at the silent orchard gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Examine the unnatural blossoms before anyone burns them, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T02B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the sickest orchard and question its workers, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T02C"
        }
      ]
    },
    {
      "id": "T01C",
      "turn": 1,
      "title": "The silent orchard - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the silent orchard. At Oakenhurst, every apple tree has flowered overnight though summer is weeks away. Duke Aldric sends you when the blossoms begin making villagers ill.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the silent orchard, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the silent orchard can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Examine the unnatural blossoms before anyone burns them, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the sickest orchard and question its workers, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T02A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Taste the black pollen to decide whether it is dangerous, despite the ground already lost.",
          "failTitle": "Failure at The silent orchard",
          "failText": "A reckless decision at the silent orchard gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T02A",
      "turn": 2,
      "title": "Black petals - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to black petals. The flowers are harmless to touch but shed black pollen near the river. A beekeeper named Tamsin says someone has moved hives into the old orchard.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At black petals, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from black petals now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut down every flowering tree before finding the source.",
          "failTitle": "Failure at Black petals",
          "failText": "A reckless decision at black petals gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace the pollen from the riverbank back toward the hives.",
          "scoreDelta": 1,
          "nextNodeId": "T03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Collect petals and keep villagers away from the water.",
          "scoreDelta": 0,
          "nextNodeId": "T03B"
        }
      ]
    },
    {
      "id": "T02B",
      "turn": 2,
      "title": "Black petals - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to black petals. The flowers are harmless to touch but shed black pollen near the river. A beekeeper named Tamsin says someone has moved hives into the old orchard.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At black petals, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving black petals in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Trace the pollen from the riverbank back toward the hives, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Collect petals and keep villagers away from the water, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T03C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut down every flowering tree before finding the source, taking time to verify each step.",
          "failTitle": "Failure at Black petals",
          "failText": "A reckless decision at black petals gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T02C",
      "turn": 2,
      "title": "Black petals - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to black petals. The flowers are harmless to touch but shed black pollen near the river. A beekeeper named Tamsin says someone has moved hives into the old orchard.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At black petals, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at black petals can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Collect petals and keep villagers away from the water, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut down every flowering tree before finding the source, despite the ground already lost.",
          "failTitle": "Failure at Black petals",
          "failText": "A reckless decision at black petals gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace the pollen from the riverbank back toward the hives, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T03C"
        }
      ]
    },
    {
      "id": "T03A",
      "turn": 3,
      "title": "The beekeeper’s bell - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the beekeeper’s bell. A bell from one of Tamsin’s hives lies cracked beside a fence, and cart tracks lead toward a locked granary.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the beekeeper’s bell, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the beekeeper’s bell now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the displaced hive marks from Tamsin’s broken bell.",
          "scoreDelta": 1,
          "nextNodeId": "T04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tamsin to identify the stolen frames.",
          "scoreDelta": 0,
          "nextNodeId": "T04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick open the hive boxes without smoke or protection.",
          "failTitle": "Failure at The beekeeper’s bell",
          "failText": "A reckless decision at the beekeeper’s bell gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T03B",
      "turn": 3,
      "title": "The beekeeper’s bell - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the beekeeper’s bell. A bell from one of Tamsin’s hives lies cracked beside a fence, and cart tracks lead toward a locked granary.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the beekeeper’s bell, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the beekeeper’s bell in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tamsin to identify the stolen frames, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick open the hive boxes without smoke or protection, taking time to verify each step.",
          "failTitle": "Failure at The beekeeper’s bell",
          "failText": "A reckless decision at the beekeeper’s bell gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the displaced hive marks from Tamsin’s broken bell, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T04B"
        }
      ]
    },
    {
      "id": "T03C",
      "turn": 3,
      "title": "The beekeeper’s bell - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the beekeeper’s bell. A bell from one of Tamsin’s hives lies cracked beside a fence, and cart tracks lead toward a locked granary.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the beekeeper’s bell, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the beekeeper’s bell can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick open the hive boxes without smoke or protection, despite the ground already lost.",
          "failTitle": "Failure at The beekeeper’s bell",
          "failText": "A reckless decision at the beekeeper’s bell gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the displaced hive marks from Tamsin’s broken bell, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T04C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tamsin to identify the stolen frames, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T04A"
        }
      ]
    },
    {
      "id": "T04A",
      "turn": 4,
      "title": "A locked granary - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to a locked granary. The granary holds no grain, only empty bee frames, sacks of ash, and a map of orchards across Elderwood.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At a locked granary, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from a locked granary now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the ash sacks and question the keeper.",
          "scoreDelta": 0,
          "nextNodeId": "T05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the strange frames inside the wooden granary.",
          "failTitle": "Failure at A locked granary",
          "failText": "A reckless decision at a locked granary gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search behind the granary map for delivery records.",
          "scoreDelta": 1,
          "nextNodeId": "T05A"
        }
      ]
    },
    {
      "id": "T04B",
      "turn": 4,
      "title": "A locked granary - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to a locked granary. The granary holds no grain, only empty bee frames, sacks of ash, and a map of orchards across Elderwood.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At a locked granary, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving a locked granary in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the strange frames inside the wooden granary, taking time to verify each step.",
          "failTitle": "Failure at A locked granary",
          "failText": "A reckless decision at a locked granary gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search behind the granary map for delivery records, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T05B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the ash sacks and question the keeper, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T05C"
        }
      ]
    },
    {
      "id": "T04C",
      "turn": 4,
      "title": "A locked granary - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a locked granary. The granary holds no grain, only empty bee frames, sacks of ash, and a map of orchards across Elderwood.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At a locked granary, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at a locked granary can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Search behind the granary map for delivery records, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the ash sacks and question the keeper, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T05A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the strange frames inside the wooden granary, despite the ground already lost.",
          "failTitle": "Failure at A locked granary",
          "failText": "A reckless decision at a locked granary gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T05A",
      "turn": 5,
      "title": "The thorn road - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the thorn road. The cart tracks enter a thorn-choked road where no honest farmer would risk a loaded wagon.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the thorn road, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the thorn road now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride blindly into the thorns after a snapped branch.",
          "failTitle": "Failure at The thorn road",
          "failText": "A reckless decision at the thorn road gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the cart ruts through the thorn road with Thorne.",
          "scoreDelta": 1,
          "nextNodeId": "T06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a warden around to watch the road’s far end.",
          "scoreDelta": 0,
          "nextNodeId": "T06B"
        }
      ]
    },
    {
      "id": "T05B",
      "turn": 5,
      "title": "The thorn road - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the thorn road. The cart tracks enter a thorn-choked road where no honest farmer would risk a loaded wagon.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the thorn road, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the thorn road in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the cart ruts through the thorn road with Thorne, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a warden around to watch the road’s far end, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T06C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride blindly into the thorns after a snapped branch, taking time to verify each step.",
          "failTitle": "Failure at The thorn road",
          "failText": "A reckless decision at the thorn road gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T05C",
      "turn": 5,
      "title": "The thorn road - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the thorn road. The cart tracks enter a thorn-choked road where no honest farmer would risk a loaded wagon.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the thorn road, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the thorn road can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send a warden around to watch the road’s far end, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride blindly into the thorns after a snapped branch, despite the ground already lost.",
          "failTitle": "Failure at The thorn road",
          "failText": "A reckless decision at the thorn road gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the cart ruts through the thorn road with Thorne, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T06C"
        }
      ]
    },
    {
      "id": "T06A",
      "turn": 6,
      "title": "Old Wella’s account - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to old wella’s account. Old Wella, a charcoal burner, saw hooded workers carrying covered crates uphill. She also saw a child’s red scarf caught on a branch.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At old wella’s account, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from old wella’s account now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare Wella’s account with the child’s red scarf.",
          "scoreDelta": 1,
          "nextNodeId": "T07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Escort Wella to safety before following the carts.",
          "scoreDelta": 0,
          "nextNodeId": "T07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the charcoal burner as an unreliable witness.",
          "failTitle": "Failure at Old Wella’s account",
          "failText": "A reckless decision at old wella’s account gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T06B",
      "turn": 6,
      "title": "Old Wella’s account - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to old wella’s account. Old Wella, a charcoal burner, saw hooded workers carrying covered crates uphill. She also saw a child’s red scarf caught on a branch.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At old wella’s account, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving old wella’s account in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Escort Wella to safety before following the carts, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the charcoal burner as an unreliable witness, taking time to verify each step.",
          "failTitle": "Failure at Old Wella’s account",
          "failText": "A reckless decision at old wella’s account gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare Wella’s account with the child’s red scarf, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T07B"
        }
      ]
    },
    {
      "id": "T06C",
      "turn": 6,
      "title": "Old Wella’s account - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to old wella’s account. Old Wella, a charcoal burner, saw hooded workers carrying covered crates uphill. She also saw a child’s red scarf caught on a branch.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At old wella’s account, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at old wella’s account can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the charcoal burner as an unreliable witness, despite the ground already lost.",
          "failTitle": "Failure at Old Wella’s account",
          "failText": "A reckless decision at old wella’s account gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare Wella’s account with the child’s red scarf, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T07C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Escort Wella to safety before following the carts, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T07A"
        }
      ]
    },
    {
      "id": "T07A",
      "turn": 7,
      "title": "The vanished carts - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the vanished carts. The scarf belongs to Pell, a farm boy missing since yesterday. His footprints stop beside three fresh cart ruts.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the vanished carts, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the vanished carts now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the other carts while Tamsin tracks the boy.",
          "scoreDelta": 0,
          "nextNodeId": "T08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume Pell stole the grain and abandon the larger trail.",
          "failTitle": "Failure at The vanished carts",
          "failText": "A reckless decision at the vanished carts gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow Pell’s footprints beside the freshest wheel rut.",
          "scoreDelta": 1,
          "nextNodeId": "T08A"
        }
      ]
    },
    {
      "id": "T07B",
      "turn": 7,
      "title": "The vanished carts - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the vanished carts. The scarf belongs to Pell, a farm boy missing since yesterday. His footprints stop beside three fresh cart ruts.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the vanished carts, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the vanished carts in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume Pell stole the grain and abandon the larger trail, taking time to verify each step.",
          "failTitle": "Failure at The vanished carts",
          "failText": "A reckless decision at the vanished carts gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow Pell’s footprints beside the freshest wheel rut, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T08B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the other carts while Tamsin tracks the boy, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T08C"
        }
      ]
    },
    {
      "id": "T07C",
      "turn": 7,
      "title": "The vanished carts - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the vanished carts. The scarf belongs to Pell, a farm boy missing since yesterday. His footprints stop beside three fresh cart ruts.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the vanished carts, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the vanished carts can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow Pell’s footprints beside the freshest wheel rut, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the other carts while Tamsin tracks the boy, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T08A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume Pell stole the grain and abandon the larger trail, despite the ground already lost.",
          "failTitle": "Failure at The vanished carts",
          "failText": "A reckless decision at the vanished carts gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T08A",
      "turn": 8,
      "title": "The hill chapel - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the hill chapel. A hill chapel shelters Pell, frightened but safe. He says the workers spoke of a ‘queen beneath the roots.’",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the hill chapel, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the hill chapel now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drag the frightened boy straight back toward his captors.",
          "failTitle": "Failure at The hill chapel",
          "failText": "A reckless decision at the hill chapel gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reassure Pell and record the workers’ exact words.",
          "scoreDelta": 1,
          "nextNodeId": "T09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Pell guarded at the chapel before continuing.",
          "scoreDelta": 0,
          "nextNodeId": "T09B"
        }
      ]
    },
    {
      "id": "T08B",
      "turn": 8,
      "title": "The hill chapel - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the hill chapel. A hill chapel shelters Pell, frightened but safe. He says the workers spoke of a ‘queen beneath the roots.’",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the hill chapel, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the hill chapel in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Reassure Pell and record the workers’ exact words, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Pell guarded at the chapel before continuing, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T09C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drag the frightened boy straight back toward his captors, taking time to verify each step.",
          "failTitle": "Failure at The hill chapel",
          "failText": "A reckless decision at the hill chapel gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T08C",
      "turn": 8,
      "title": "The hill chapel - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the hill chapel. A hill chapel shelters Pell, frightened but safe. He says the workers spoke of a ‘queen beneath the roots.’",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the hill chapel, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the hill chapel can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Pell guarded at the chapel before continuing, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drag the frightened boy straight back toward his captors, despite the ground already lost.",
          "failTitle": "Failure at The hill chapel",
          "failText": "A reckless decision at the hill chapel gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reassure Pell and record the workers’ exact words, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T09C"
        }
      ]
    },
    {
      "id": "T09A",
      "turn": 9,
      "title": "The wax seal - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the wax seal. A wax seal found in the chapel bears the mark of a merchant guild that has supplied Oakenhurst for years.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the wax seal, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the wax seal now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the guild seal with recent Oakenhurst deliveries.",
          "scoreDelta": 1,
          "nextNodeId": "T10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the sealed wax to Aldric’s local clerk.",
          "scoreDelta": 0,
          "nextNodeId": "T10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse every guild merchant before verifying the mark.",
          "failTitle": "Failure at The wax seal",
          "failText": "A reckless decision at the wax seal gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T09B",
      "turn": 9,
      "title": "The wax seal - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the wax seal. A wax seal found in the chapel bears the mark of a merchant guild that has supplied Oakenhurst for years.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the wax seal, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the wax seal in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the sealed wax to Aldric’s local clerk, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse every guild merchant before verifying the mark, taking time to verify each step.",
          "failTitle": "Failure at The wax seal",
          "failText": "A reckless decision at the wax seal gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the guild seal with recent Oakenhurst deliveries, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T10B"
        }
      ]
    },
    {
      "id": "T09C",
      "turn": 9,
      "title": "The wax seal - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the wax seal. A wax seal found in the chapel bears the mark of a merchant guild that has supplied Oakenhurst for years.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the wax seal, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the wax seal can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse every guild merchant before verifying the mark, despite the ground already lost.",
          "failTitle": "Failure at The wax seal",
          "failText": "A reckless decision at the wax seal gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the guild seal with recent Oakenhurst deliveries, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T10C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the sealed wax to Aldric’s local clerk, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T10A"
        }
      ]
    },
    {
      "id": "T10A",
      "turn": 10,
      "title": "Under the roots - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to under the roots. The trail ends at an enormous fallen oak. Beneath its roots, you find a cellar containing hives kept in winter darkness.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At under the roots, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from under the roots now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Post guards at both exits while Tamsin studies the bees.",
          "scoreDelta": 0,
          "nextNodeId": "T11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Smoke the cellar heavily and drive the altered swarm outside.",
          "failTitle": "Failure at Under the roots",
          "failText": "A reckless decision at under the roots gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ventilate the root cellar and inspect the winter hives.",
          "scoreDelta": 1,
          "nextNodeId": "T11A"
        }
      ]
    },
    {
      "id": "T10B",
      "turn": 10,
      "title": "Under the roots - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to under the roots. The trail ends at an enormous fallen oak. Beneath its roots, you find a cellar containing hives kept in winter darkness.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At under the roots, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving under the roots in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Smoke the cellar heavily and drive the altered swarm outside, taking time to verify each step.",
          "failTitle": "Failure at Under the roots",
          "failText": "A reckless decision at under the roots gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ventilate the root cellar and inspect the winter hives, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T11B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post guards at both exits while Tamsin studies the bees, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T11C"
        }
      ]
    },
    {
      "id": "T10C",
      "turn": 10,
      "title": "Under the roots - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to under the roots. The trail ends at an enormous fallen oak. Beneath its roots, you find a cellar containing hives kept in winter darkness.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At under the roots, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at under the roots can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ventilate the root cellar and inspect the winter hives, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post guards at both exits while Tamsin studies the bees, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T11A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Smoke the cellar heavily and drive the altered swarm outside, despite the ground already lost.",
          "failTitle": "Failure at Under the roots",
          "failText": "A reckless decision at under the roots gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T11A",
      "turn": 11,
      "title": "The winter ledger - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the winter ledger. The hives are fed with sugar and bitter herbs. A ledger records deliveries to villages whose orchards have recently failed.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the winter ledger, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the winter ledger now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Halren without preserving the ledger.",
          "failTitle": "Failure at The winter ledger",
          "failText": "A reckless decision at the winter ledger gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the ledger’s failed orchards to Halren’s deliveries.",
          "scoreDelta": 1,
          "nextNodeId": "T12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the entries before moving the hive records.",
          "scoreDelta": 0,
          "nextNodeId": "T12B"
        }
      ]
    },
    {
      "id": "T11B",
      "turn": 11,
      "title": "The winter ledger - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the winter ledger. The hives are fed with sugar and bitter herbs. A ledger records deliveries to villages whose orchards have recently failed.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the winter ledger, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the winter ledger in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Match the ledger’s failed orchards to Halren’s deliveries, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the entries before moving the hive records, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T12C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Halren without preserving the ledger, taking time to verify each step.",
          "failTitle": "Failure at The winter ledger",
          "failText": "A reckless decision at the winter ledger gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T11C",
      "turn": 11,
      "title": "The winter ledger - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the winter ledger. The hives are fed with sugar and bitter herbs. A ledger records deliveries to villages whose orchards have recently failed.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the winter ledger, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the winter ledger can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the entries before moving the hive records, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Halren without preserving the ledger, despite the ground already lost.",
          "failTitle": "Failure at The winter ledger",
          "failText": "A reckless decision at the winter ledger gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the ledger’s failed orchards to Halren’s deliveries, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T12C"
        }
      ]
    },
    {
      "id": "T12A",
      "turn": 12,
      "title": "A traitor’s trail - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to a traitor’s trail. The ledger’s author is not a guild clerk but Master Halren, Aldric’s appointed orchard steward.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At a traitor’s trail, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from a traitor’s trail now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Shadow the orchard steward and identify his hired guards.",
          "scoreDelta": 1,
          "nextNodeId": "T13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Summon neutral wardens before questioning Halren.",
          "scoreDelta": 0,
          "nextNodeId": "T13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Warn Halren that his secret cellar has been found.",
          "failTitle": "Failure at A traitor’s trail",
          "failText": "A reckless decision at a traitor’s trail gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T12B",
      "turn": 12,
      "title": "A traitor’s trail - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to a traitor’s trail. The ledger’s author is not a guild clerk but Master Halren, Aldric’s appointed orchard steward.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At a traitor’s trail, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving a traitor’s trail in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Summon neutral wardens before questioning Halren, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Warn Halren that his secret cellar has been found, taking time to verify each step.",
          "failTitle": "Failure at A traitor’s trail",
          "failText": "A reckless decision at a traitor’s trail gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Shadow the orchard steward and identify his hired guards, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T13B"
        }
      ]
    },
    {
      "id": "T12C",
      "turn": 12,
      "title": "A traitor’s trail - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to a traitor’s trail. The ledger’s author is not a guild clerk but Master Halren, Aldric’s appointed orchard steward.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At a traitor’s trail, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at a traitor’s trail can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Warn Halren that his secret cellar has been found, despite the ground already lost.",
          "failTitle": "Failure at A traitor’s trail",
          "failText": "A reckless decision at a traitor’s trail gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Shadow the orchard steward and identify his hired guards, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T13C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Summon neutral wardens before questioning Halren, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T13A"
        }
      ]
    },
    {
      "id": "T13A",
      "turn": 13,
      "title": "The orchard watch - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the orchard watch. Halren’s watchmen surround the cellar, claiming the hives are part of a lawful experiment to save the harvest.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the orchard watch, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the orchard watch now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Separate the watchmen and offer mercy for honest testimony.",
          "scoreDelta": 0,
          "nextNodeId": "T14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept the steward’s authority and return all evidence.",
          "failTitle": "Failure at The orchard watch",
          "failText": "A reckless decision at the orchard watch gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test Halren’s lawful claim against the hidden ledger.",
          "scoreDelta": 1,
          "nextNodeId": "T14A"
        }
      ]
    },
    {
      "id": "T13B",
      "turn": 13,
      "title": "The orchard watch - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the orchard watch. Halren’s watchmen surround the cellar, claiming the hives are part of a lawful experiment to save the harvest.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the orchard watch, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the orchard watch in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept the steward’s authority and return all evidence, taking time to verify each step.",
          "failTitle": "Failure at The orchard watch",
          "failText": "A reckless decision at the orchard watch gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test Halren’s lawful claim against the hidden ledger, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T14B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Separate the watchmen and offer mercy for honest testimony, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T14C"
        }
      ]
    },
    {
      "id": "T13C",
      "turn": 13,
      "title": "The orchard watch - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the orchard watch. Halren’s watchmen surround the cellar, claiming the hives are part of a lawful experiment to save the harvest.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the orchard watch, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the orchard watch can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test Halren’s lawful claim against the hidden ledger, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Separate the watchmen and offer mercy for honest testimony, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T14A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept the steward’s authority and return all evidence, despite the ground already lost.",
          "failTitle": "Failure at The orchard watch",
          "failText": "A reckless decision at the orchard watch gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T14A",
      "turn": 14,
      "title": "The hollow tree - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the hollow tree. Tamsin proves the experiment is spreading a cultivated blight through the black pollen. Halren’s men have been paid to guard it.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the hollow tree, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the hollow tree now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Release a hive in the village square to prove the danger.",
          "failTitle": "Failure at The hollow tree",
          "failText": "A reckless decision at the hollow tree gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Tamsin demonstrate how the black pollen spreads.",
          "scoreDelta": 1,
          "nextNodeId": "T15A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the mill vent and keep the workers inside.",
          "scoreDelta": 0,
          "nextNodeId": "T15B"
        }
      ]
    },
    {
      "id": "T14B",
      "turn": 14,
      "title": "The hollow tree - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the hollow tree. Tamsin proves the experiment is spreading a cultivated blight through the black pollen. Halren’s men have been paid to guard it.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the hollow tree, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the hollow tree in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Let Tamsin demonstrate how the black pollen spreads, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the mill vent and keep the workers inside, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T15C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release a hive in the village square to prove the danger, taking time to verify each step.",
          "failTitle": "Failure at The hollow tree",
          "failText": "A reckless decision at the hollow tree gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T14C",
      "turn": 14,
      "title": "The hollow tree - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the hollow tree. Tamsin proves the experiment is spreading a cultivated blight through the black pollen. Halren’s men have been paid to guard it.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the hollow tree, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the hollow tree can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Close the mill vent and keep the workers inside, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release a hive in the village square to prove the danger, despite the ground already lost.",
          "failTitle": "Failure at The hollow tree",
          "failText": "A reckless decision at the hollow tree gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Tamsin demonstrate how the black pollen spreads, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T15C"
        }
      ]
    },
    {
      "id": "T15A",
      "turn": 15,
      "title": "The queen’s mark - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the queen’s mark. A carved mark on the largest hive shows the planned route: every orchard between Elderwood and the Riverland road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the queen’s mark, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the queen’s mark now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Intercept the marked queen hive before it reaches the road.",
          "scoreDelta": 1,
          "nextNodeId": "T16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the next orchard while tracking the planned route.",
          "scoreDelta": 0,
          "nextNodeId": "T16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the route map and guess where the hive is bound.",
          "failTitle": "Failure at The queen’s mark",
          "failText": "A reckless decision at the queen’s mark gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T15B",
      "turn": 15,
      "title": "The queen’s mark - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the queen’s mark. A carved mark on the largest hive shows the planned route: every orchard between Elderwood and the Riverland road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the queen’s mark, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the queen’s mark in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the next orchard while tracking the planned route, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the route map and guess where the hive is bound, taking time to verify each step.",
          "failTitle": "Failure at The queen’s mark",
          "failText": "A reckless decision at the queen’s mark gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Intercept the marked queen hive before it reaches the road, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T16B"
        }
      ]
    },
    {
      "id": "T15C",
      "turn": 15,
      "title": "The queen’s mark - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the queen’s mark. A carved mark on the largest hive shows the planned route: every orchard between Elderwood and the Riverland road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the queen’s mark, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the queen’s mark can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the route map and guess where the hive is bound, despite the ground already lost.",
          "failTitle": "Failure at The queen’s mark",
          "failText": "A reckless decision at the queen’s mark gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Intercept the marked queen hive before it reaches the road, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T16C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the next orchard while tracking the planned route, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T16A"
        }
      ]
    },
    {
      "id": "T16A",
      "turn": 16,
      "title": "The night harvest - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the night harvest. Halren admits he intended to control the next harvest by destroying rival orchards, then selling resistant cuttings at a fortune.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the night harvest, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the night harvest now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send riders to isolate the threatened orchards.",
          "scoreDelta": 0,
          "nextNodeId": "T17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise Halren silence in exchange for a share of the cuttings.",
          "failTitle": "Failure at The night harvest",
          "failText": "A reckless decision at the night harvest gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure Halren’s confession and locate every planted hive.",
          "scoreDelta": 1,
          "nextNodeId": "T17A"
        }
      ]
    },
    {
      "id": "T16B",
      "turn": 16,
      "title": "The night harvest - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the night harvest. Halren admits he intended to control the next harvest by destroying rival orchards, then selling resistant cuttings at a fortune.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the night harvest, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the night harvest in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise Halren silence in exchange for a share of the cuttings, taking time to verify each step.",
          "failTitle": "Failure at The night harvest",
          "failText": "A reckless decision at the night harvest gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure Halren’s confession and locate every planted hive, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T17B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send riders to isolate the threatened orchards, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T17C"
        }
      ]
    },
    {
      "id": "T16C",
      "turn": 16,
      "title": "The night harvest - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the night harvest. Halren admits he intended to control the next harvest by destroying rival orchards, then selling resistant cuttings at a fortune.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the night harvest, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the night harvest can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Secure Halren’s confession and locate every planted hive, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send riders to isolate the threatened orchards, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T17A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise Halren silence in exchange for a share of the cuttings, despite the ground already lost.",
          "failTitle": "Failure at The night harvest",
          "failText": "A reckless decision at the night harvest gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": false
        }
      ]
    },
    {
      "id": "T17A",
      "turn": 17,
      "title": "The burning line - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the burning line. The first burning begins near the eastern fields. Smoke drives the bees into the valley, while Halren’s men block the well road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the burning line, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the burning line now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride through the smoke after Halren and leave the fires unchecked.",
          "failTitle": "Failure at The burning line",
          "failText": "A reckless decision at the burning line gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lead villagers to the wells while Tamsin turns the swarm.",
          "scoreDelta": 1,
          "nextNodeId": "T18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Cut a firebreak around the eastern orchard.",
          "scoreDelta": 0,
          "nextNodeId": "T18B"
        }
      ]
    },
    {
      "id": "T17B",
      "turn": 17,
      "title": "The burning line - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the burning line. The first burning begins near the eastern fields. Smoke drives the bees into the valley, while Halren’s men block the well road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the burning line, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the burning line in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Lead villagers to the wells while Tamsin turns the swarm, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Cut a firebreak around the eastern orchard, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T18C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride through the smoke after Halren and leave the fires unchecked, taking time to verify each step.",
          "failTitle": "Failure at The burning line",
          "failText": "A reckless decision at the burning line gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "T17C",
      "turn": 17,
      "title": "The burning line - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the burning line. The first burning begins near the eastern fields. Smoke drives the bees into the valley, while Halren’s men block the well road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the burning line, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the burning line can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Cut a firebreak around the eastern orchard, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride through the smoke after Halren and leave the fires unchecked, despite the ground already lost.",
          "failTitle": "Failure at The burning line",
          "failText": "A reckless decision at the burning line gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lead villagers to the wells while Tamsin turns the swarm, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T18C"
        }
      ]
    },
    {
      "id": "T18A",
      "turn": 18,
      "title": "The last hive - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to the last hive. You split the wardens between the fires and the cellar. The queen hive is being carried toward the orchard ridge.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the last hive, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from the last hive now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Block the ridge path and recover the queen hive intact.",
          "scoreDelta": 1,
          "nextNodeId": "T19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Tamsin draw the bees into empty skeps.",
          "scoreDelta": 0,
          "nextNodeId": "T19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot arrows into the moving hive and scatter the swarm.",
          "failTitle": "Failure at The last hive",
          "failText": "A reckless decision at the last hive gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "T18B",
      "turn": 18,
      "title": "The last hive - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to the last hive. You split the wardens between the fires and the cellar. The queen hive is being carried toward the orchard ridge.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the last hive, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving the last hive in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Tamsin draw the bees into empty skeps, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot arrows into the moving hive and scatter the swarm, taking time to verify each step.",
          "failTitle": "Failure at The last hive",
          "failText": "A reckless decision at the last hive gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Block the ridge path and recover the queen hive intact, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T19B"
        }
      ]
    },
    {
      "id": "T18C",
      "turn": 18,
      "title": "The last hive - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to the last hive. You split the wardens between the fires and the cellar. The queen hive is being carried toward the orchard ridge.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At the last hive, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at the last hive can still recover the lost ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot arrows into the moving hive and scatter the swarm, despite the ground already lost.",
          "failTitle": "Failure at The last hive",
          "failText": "A reckless decision at the last hive gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Block the ridge path and recover the queen hive intact, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T19C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Tamsin draw the bees into empty skeps, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T19A"
        }
      ]
    },
    {
      "id": "T19A",
      "turn": 19,
      "title": "Dawn at Oakenhurst - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to dawn at oakenhurst. A storm breaks over Oakenhurst. Tamsin reaches the hives, Pell leads villagers to the wells, and Halren runs for the merchant road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At dawn at oakenhurst, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from dawn at oakenhurst now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ring Oakenhurst’s alarm while Pell guides the water line.",
          "scoreDelta": 0,
          "nextNodeId": "T20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase Halren alone and abandon the burning orchard.",
          "failTitle": "Failure at Dawn at Oakenhurst",
          "failText": "A reckless decision at dawn at oakenhurst gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the storm to contain the last fire and arrest Halren.",
          "scoreDelta": 1,
          "nextNodeId": "T20A"
        }
      ]
    },
    {
      "id": "T19B",
      "turn": 19,
      "title": "Dawn at Oakenhurst - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to dawn at oakenhurst. A storm breaks over Oakenhurst. Tamsin reaches the hives, Pell leads villagers to the wells, and Halren runs for the merchant road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At dawn at oakenhurst, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving dawn at oakenhurst in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase Halren alone and abandon the burning orchard, taking time to verify each step.",
          "failTitle": "Failure at Dawn at Oakenhurst",
          "failText": "A reckless decision at dawn at oakenhurst gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the storm to contain the last fire and arrest Halren, taking time to verify each step.",
          "scoreDelta": 1,
          "nextNodeId": "T20B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ring Oakenhurst’s alarm while Pell guides the water line, taking time to verify each step.",
          "scoreDelta": 0,
          "nextNodeId": "T20C"
        }
      ]
    },
    {
      "id": "T19C",
      "turn": 19,
      "title": "Dawn at Oakenhurst - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to dawn at oakenhurst. A storm breaks over Oakenhurst. Tamsin reaches the hives, Pell leads villagers to the wells, and Halren runs for the merchant road.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At dawn at oakenhurst, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at dawn at oakenhurst can still recover the lost ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the storm to contain the last fire and arrest Halren, despite the ground already lost.",
          "scoreDelta": 1,
          "nextNodeId": "T20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ring Oakenhurst’s alarm while Pell guides the water line, despite the ground already lost.",
          "scoreDelta": 0,
          "nextNodeId": "T20A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase Halren alone and abandon the burning orchard, despite the ground already lost.",
          "failTitle": "Failure at Dawn at Oakenhurst",
          "failText": "A reckless decision at dawn at oakenhurst gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "T20A",
      "turn": 20,
      "title": "Green shoots - healthy sign",
      "narrative": [
        "Following the strongest evidence brings you to green shoots. By morning, the blighted hives are secured and the surviving trees are marked for careful pruning. Oakenhurst’s first honest harvest begins the long recovery.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At green shoots, the fresh details give you a narrow advantage.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Acting from green shoots now may keep you ahead of the threat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Sell the resistant cuttings before their safety is known.",
          "failTitle": "Failure at Green shoots",
          "failText": "A reckless decision at green shoots gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Give Aldric the ledger, sealed hive, and witness accounts.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep damaged orchards closed through the next bloom.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "T20B",
      "turn": 20,
      "title": "Green shoots - uncertain bloom",
      "narrative": [
        "After securing the previous scene, you continue to green shoots. By morning, the blighted hives are secured and the surviving trees are marked for careful pruning. Oakenhurst’s first honest harvest begins the long recovery.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At green shoots, patience keeps uncertain testimony separate from proven fact.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. Leaving green shoots in order matters as much as gaining speed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Give Aldric the ledger, sealed hive, and witness accounts, taking time to verify each step.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep damaged orchards closed through the next bloom, taking time to verify each step.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Sell the resistant cuttings before their safety is known, taking time to verify each step.",
          "failTitle": "Failure at Green shoots",
          "failText": "A reckless decision at green shoots gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        }
      ]
    },
    {
      "id": "T20C",
      "turn": 20,
      "title": "Green shoots - late warning",
      "narrative": [
        "The slower trail costs time, but it eventually leads to green shoots. By morning, the blighted hives are secured and the surviving trees are marked for careful pruning. Oakenhurst’s first honest harvest begins the long recovery.",
        "You rely on clear signs: pollen, wax, wheel marks, damaged bark, and the testimony of ordinary people caught in an extraordinary danger. At green shoots, you rebuild the weakened trail from the signs that remain.",
        "The orchard is more than a crop now; it is a chain of lives, and one careless step could break it. A careful decision at green shoots can still recover the lost ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep damaged orchards closed through the next bloom, despite the ground already lost.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Sell the resistant cuttings before their safety is known, despite the ground already lost.",
          "failTitle": "Failure at Green shoots",
          "failText": "A reckless decision at green shoots gives the opposition the time and confusion it needs. The trail is broken before you can recover it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Give Aldric the ledger, sealed hive, and witness accounts, despite the ground already lost.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    }
  ]
});
