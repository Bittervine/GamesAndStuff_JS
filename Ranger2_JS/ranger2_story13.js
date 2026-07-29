window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-crooked-mile",
  "title": "The Crooked Mile",
  "summary": "When a mile of the duke's road appears to shift overnight and grain carts vanish between two familiar villages, the ranger joins road warden Mara Fen to uncover a landholder's scheme built on moved stones, hidden cuttings, and captive labor.",
  "maxTurns": 20,
  "startNodeId": "A01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The missing carters return to their families, the stolen grain reaches Oakenhurst, and Edrik Shaw's surveyed maps prove how deliberately he tried to bend the duke's road around his private toll. Mara Fen resets every stone in daylight while the ranger rides the true mile beside Thorne.",
    "low": "The carts and most of their drivers are recovered, but rain destroys part of the cutting and several records vanish with Shaw's clerk. The road is reopened under armed watch, leaving Duke Aldric to settle the land claim with less proof than justice deserved."
  },
  "nodes": [
    {
      "id": "A01A",
      "turn": 1,
      "title": "A Road That Moved - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into the rain-dark lanes west of Oakenhurst as three grain carts have disappeared on a mile that farmers swear has shifted east during the night.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Mara Fen, the road warden, shows you two milestones bearing fresh mud below old lichen.",
        "The clearer position reveals the stakes: If the road itself has been made uncertain, every cart bound for Oakenhurst can be isolated without a battle."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the buried faces of both milestones.",
          "scoreDelta": 1,
          "nextNodeId": "A02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Walk the reported mile with Mara and question each household.",
          "scoreDelta": 0,
          "nextNodeId": "A02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the newest wagon ruts at a gallop.",
          "failTitle": "Lost on the False Mile",
          "failText": "The ruts turn into a flooded clay pit where Thorne founders and the kidnappers erase their trail behind you.",
          "death": false
        }
      ]
    },
    {
      "id": "A01B",
      "turn": 1,
      "title": "A Road That Moved - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: three grain carts have disappeared on a mile that farmers swear has shifted east during the night.",
        "With Thorne close and local witnesses beside you, you compare every account. Mara Fen, the road warden, shows you two milestones bearing fresh mud below old lichen.",
        "The evidence now defines the danger: If the road itself has been made uncertain, every cart bound for Oakenhurst can be isolated without a battle."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Walk the reported mile with Mara and question each household while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the newest wagon ruts at a gallop while keeping Mara Fen informed.",
          "failTitle": "Lost on the False Mile",
          "failText": "The ruts turn into a flooded clay pit where Thorne founders and the kidnappers erase their trail behind you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the buried faces of both milestones while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A02B"
        }
      ]
    },
    {
      "id": "A01C",
      "turn": 1,
      "title": "A Road That Moved - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, three grain carts have disappeared on a mile that farmers swear has shifted east during the night.",
        "Working against the light, you test the few signs that remain. Mara Fen, the road warden, shows you two milestones bearing fresh mud below old lichen.",
        "Delay has sharpened the danger: If the road itself has been made uncertain, every cart bound for Oakenhurst can be isolated without a battle."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the newest wagon ruts at a gallop before the remaining light fails.",
          "failTitle": "Lost on the False Mile",
          "failText": "The ruts turn into a flooded clay pit where Thorne founders and the kidnappers erase their trail behind you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the buried faces of both milestones before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Walk the reported mile with Mara and question each household before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A02A"
        }
      ]
    },
    {
      "id": "A02A",
      "turn": 2,
      "title": "Mud Beneath the Lichen - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. The displaced stones lead to a hedge newly woven across the original road.",
        "You circle downwind and let small marks tell their order. Cut willow fibers on the hedge match bundles sold by Tobin Vale, a wheelwright whose apprentice drove one missing cart.",
        "The clearer position reveals the stakes: Someone has spent days changing what travelers accept as familiar ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the old road and continue along its verge.",
          "scoreDelta": 0,
          "nextNodeId": "A03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the hedge to expose whatever lies beyond.",
          "failTitle": "Smoke Over the Evidence",
          "failText": "The green hedge smolders into a thick screen, warning hidden watchers and destroying the fibers that tied the work to a supplier.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the hedge fibers to Tobin's yard before confronting him.",
          "scoreDelta": 1,
          "nextNodeId": "A03A"
        }
      ]
    },
    {
      "id": "A02B",
      "turn": 2,
      "title": "Mud Beneath the Lichen - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. The displaced stones lead to a hedge newly woven across the original road.",
        "You ask plain questions and watch which answers agree. Cut willow fibers on the hedge match bundles sold by Tobin Vale, a wheelwright whose apprentice drove one missing cart.",
        "The evidence now defines the danger: Someone has spent days changing what travelers accept as familiar ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the hedge to expose whatever lies beyond while keeping Mara Fen informed.",
          "failTitle": "Smoke Over the Evidence",
          "failText": "The green hedge smolders into a thick screen, warning hidden watchers and destroying the fibers that tied the work to a supplier.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the hedge fibers to Tobin's yard before confronting him while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the old road and continue along its verge while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A03C"
        }
      ]
    },
    {
      "id": "A02C",
      "turn": 2,
      "title": "Mud Beneath the Lichen - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. The displaced stones lead to a hedge newly woven across the original road.",
        "There is no time for elegance, only for separating fresh danger from old damage. Cut willow fibers on the hedge match bundles sold by Tobin Vale, a wheelwright whose apprentice drove one missing cart.",
        "Delay has sharpened the danger: Someone has spent days changing what travelers accept as familiar ground."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Match the hedge fibers to Tobin's yard before confronting him before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the old road and continue along its verge before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the hedge to expose whatever lies beyond before the remaining light fails.",
          "failTitle": "Smoke Over the Evidence",
          "failText": "The green hedge smolders into a thick screen, warning hidden watchers and destroying the fibers that tied the work to a supplier.",
          "death": false
        }
      ]
    },
    {
      "id": "A03A",
      "turn": 3,
      "title": "The Wheelwright's Empty Yard - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Tobin's workshop stands open, its wheel forms cooling and his apprentice absent.",
        "From sheltered ground, you measure tracks, tools, and distances. A half-finished axle carries deep scoring made by a narrow iron guide rather than road wear.",
        "The clearer position reveals the stakes: The missing carts may have been prepared to follow a track invisible to ordinary traffic."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight to Edrik Shaw's hall and accuse him.",
          "failTitle": "An Accusation Too Soon",
          "failText": "Shaw welcomes witnesses, denies everything, and sends a rider ahead while you possess only suspicion.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure the scoring and search for the matching iron width.",
          "scoreDelta": 1,
          "nextNodeId": "A04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tobin's neighbors when the workshop last worked.",
          "scoreDelta": 0,
          "nextNodeId": "A04B"
        }
      ]
    },
    {
      "id": "A03B",
      "turn": 3,
      "title": "The Wheelwright's Empty Yard - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Tobin's workshop stands open, its wheel forms cooling and his apprentice absent.",
        "You keep the scene orderly while your allies search it piece by piece. A half-finished axle carries deep scoring made by a narrow iron guide rather than road wear.",
        "The evidence now defines the danger: The missing carts may have been prepared to follow a track invisible to ordinary traffic."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Measure the scoring and search for the matching iron width while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tobin's neighbors when the workshop last worked while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight to Edrik Shaw's hall and accuse him while keeping Mara Fen informed.",
          "failTitle": "An Accusation Too Soon",
          "failText": "Shaw welcomes witnesses, denies everything, and sends a rider ahead while you possess only suspicion.",
          "death": false
        }
      ]
    },
    {
      "id": "A03C",
      "turn": 3,
      "title": "The Wheelwright's Empty Yard - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Tobin's workshop stands open, its wheel forms cooling and his apprentice absent.",
        "Pressed for time, you trust hard evidence and discard rumor. A half-finished axle carries deep scoring made by a narrow iron guide rather than road wear.",
        "Delay has sharpened the danger: The missing carts may have been prepared to follow a track invisible to ordinary traffic."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tobin's neighbors when the workshop last worked before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight to Edrik Shaw's hall and accuse him before the remaining light fails.",
          "failTitle": "An Accusation Too Soon",
          "failText": "Shaw welcomes witnesses, denies everything, and sends a rider ahead while you possess only suspicion.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure the scoring and search for the matching iron width before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A04C"
        }
      ]
    },
    {
      "id": "A04A",
      "turn": 4,
      "title": "Iron in the Grass - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. The old verge conceals paired iron strips pressed flat beneath wet grass.",
        "You move quietly enough to hear work and voices ahead. Mara finds wheel grease on one strip and bloodless rope marks beside a place where drivers were pulled down.",
        "The clearer position reveals the stakes: The hidden guides turn heavy wagons off the public road without leaving the broad ruts searchers expect."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Trace the strips on foot while leading Thorne.",
          "scoreDelta": 1,
          "nextNodeId": "A05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Set a watch and wait for another cart.",
          "scoreDelta": 0,
          "nextNodeId": "A05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pry up the strips before learning where they lead.",
          "failTitle": "The Hidden Way Broken",
          "failText": "Removing the guides ruins the only quiet route to the captives and tells their guards that the road has been found.",
          "death": false
        }
      ]
    },
    {
      "id": "A04B",
      "turn": 4,
      "title": "Iron in the Grass - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. The old verge conceals paired iron strips pressed flat beneath wet grass.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Mara finds wheel grease on one strip and bloodless rope marks beside a place where drivers were pulled down.",
        "The evidence now defines the danger: The hidden guides turn heavy wagons off the public road without leaving the broad ruts searchers expect."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Set a watch and wait for another cart while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pry up the strips before learning where they lead while keeping Mara Fen informed.",
          "failTitle": "The Hidden Way Broken",
          "failText": "Removing the guides ruins the only quiet route to the captives and tells their guards that the road has been found.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace the strips on foot while leading Thorne while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A05B"
        }
      ]
    },
    {
      "id": "A04C",
      "turn": 4,
      "title": "Iron in the Grass - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. The old verge conceals paired iron strips pressed flat beneath wet grass.",
        "You push through fatigue, knowing the next mistake may close the road. Mara finds wheel grease on one strip and bloodless rope marks beside a place where drivers were pulled down.",
        "Delay has sharpened the danger: The hidden guides turn heavy wagons off the public road without leaving the broad ruts searchers expect."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pry up the strips before learning where they lead before the remaining light fails.",
          "failTitle": "The Hidden Way Broken",
          "failText": "Removing the guides ruins the only quiet route to the captives and tells their guards that the road has been found.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace the strips on foot while leading Thorne before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Set a watch and wait for another cart before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A05A"
        }
      ]
    },
    {
      "id": "A05A",
      "turn": 5,
      "title": "The Sunken Cutting - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. The iron guides descend into an abandoned marl cutting screened by hazel.",
        "A ranger's eye finds the human habit behind the apparent mystery. Below, men unload grain under guard while Tobin's apprentice repairs a shattered wheel.",
        "The clearer position reveals the stakes: The missing drivers are alive, but the cutting holds more guards than Mara can face openly."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Withdraw to summon the nearest reeve.",
          "scoreDelta": 0,
          "nextNodeId": "A06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow at the first guard you see.",
          "failTitle": "The Cutting Alarmed",
          "failText": "The shot misses in the rain; guards drag the prisoners underground and block the entrance with a wagon.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count guards and exits from the upper bank.",
          "scoreDelta": 1,
          "nextNodeId": "A06A"
        }
      ]
    },
    {
      "id": "A05B",
      "turn": 5,
      "title": "The Sunken Cutting - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. The iron guides descend into an abandoned marl cutting screened by hazel.",
        "Together, the small company builds one reliable account from scattered facts. Below, men unload grain under guard while Tobin's apprentice repairs a shattered wheel.",
        "The evidence now defines the danger: The missing drivers are alive, but the cutting holds more guards than Mara can face openly."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow at the first guard you see while keeping Mara Fen informed.",
          "failTitle": "The Cutting Alarmed",
          "failText": "The shot misses in the rain; guards drag the prisoners underground and block the entrance with a wagon.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count guards and exits from the upper bank while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Withdraw to summon the nearest reeve while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A06C"
        }
      ]
    },
    {
      "id": "A05C",
      "turn": 5,
      "title": "The Sunken Cutting - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. The iron guides descend into an abandoned marl cutting screened by hazel.",
        "You take the shortest safe route and accept that concealment is nearly gone. Below, men unload grain under guard while Tobin's apprentice repairs a shattered wheel.",
        "Delay has sharpened the danger: The missing drivers are alive, but the cutting holds more guards than Mara can face openly."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Count guards and exits from the upper bank before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Withdraw to summon the nearest reeve before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow at the first guard you see before the remaining light fails.",
          "failTitle": "The Cutting Alarmed",
          "failText": "The shot misses in the rain; guards drag the prisoners underground and block the entrance with a wagon.",
          "death": false
        }
      ]
    },
    {
      "id": "A06A",
      "turn": 6,
      "title": "Tobin's Bargain - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Tobin steps from cover and claims Shaw forced his help by holding the apprentice.",
        "You preserve the most fragile sign before turning to the larger scene. His hands are tarred with the same preservative used on the buried iron, and his fear appears genuine.",
        "The clearer position reveals the stakes: Tobin can expose the operation, but a frightened accomplice may also lead you into a trap."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pretend to free him, then follow openly.",
          "failTitle": "A Desperate Flight",
          "failText": "Tobin sees the clumsy shadow, bolts toward the guards, and gives them time to move both grain and prisoners.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Offer protection in exchange for the cutting's full layout.",
          "scoreDelta": 1,
          "nextNodeId": "A07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bind Tobin and take him back to Mara's post.",
          "scoreDelta": 0,
          "nextNodeId": "A07B"
        }
      ]
    },
    {
      "id": "A06B",
      "turn": 6,
      "title": "Tobin's Bargain - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Tobin steps from cover and claims Shaw forced his help by holding the apprentice.",
        "Each person is given one task, and confusion begins to clear. His hands are tarred with the same preservative used on the buried iron, and his fear appears genuine.",
        "The evidence now defines the danger: Tobin can expose the operation, but a frightened accomplice may also lead you into a trap."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Offer protection in exchange for the cutting's full layout while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bind Tobin and take him back to Mara's post while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pretend to free him, then follow openly while keeping Mara Fen informed.",
          "failTitle": "A Desperate Flight",
          "failText": "Tobin sees the clumsy shadow, bolts toward the guards, and gives them time to move both grain and prisoners.",
          "death": false
        }
      ]
    },
    {
      "id": "A06C",
      "turn": 6,
      "title": "Tobin's Bargain - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Tobin steps from cover and claims Shaw forced his help by holding the apprentice.",
        "The enemy has the lead, so you judge every pause against the lives at risk. His hands are tarred with the same preservative used on the buried iron, and his fear appears genuine.",
        "Delay has sharpened the danger: Tobin can expose the operation, but a frightened accomplice may also lead you into a trap."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Bind Tobin and take him back to Mara's post before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pretend to free him, then follow openly before the remaining light fails.",
          "failTitle": "A Desperate Flight",
          "failText": "Tobin sees the clumsy shadow, bolts toward the guards, and gives them time to move both grain and prisoners.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Offer protection in exchange for the cutting's full layout before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A07C"
        }
      ]
    },
    {
      "id": "A07A",
      "turn": 7,
      "title": "The Ledger Board - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Tobin reveals a board where loads are recorded as repairs to Shaw's private drains.",
        "You watch before acting and learn who believes themselves unobserved. Notches show six earlier diversions and a final mark beside the duke's tithe convoy due tomorrow.",
        "The clearer position reveals the stakes: The vanished carts are a rehearsal for taking Oakenhurst's winter reserve."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Copy the notches and leave the board apparently untouched.",
          "scoreDelta": 1,
          "nextNodeId": "A08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the board as evidence and retreat.",
          "scoreDelta": 0,
          "nextNodeId": "A08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the board so it cannot guide another theft.",
          "failTitle": "Proof in Splinters",
          "failText": "The marks become meaningless fragments, and Shaw's clerk later calls them firewood from an old shed.",
          "death": false
        }
      ]
    },
    {
      "id": "A07B",
      "turn": 7,
      "title": "The Ledger Board - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Tobin reveals a board where loads are recorded as repairs to Shaw's private drains.",
        "By keeping tempers cool, you hold the inquiry on facts. Notches show six earlier diversions and a final mark beside the duke's tithe convoy due tomorrow.",
        "The evidence now defines the danger: The vanished carts are a rehearsal for taking Oakenhurst's winter reserve."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the board as evidence and retreat while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the board so it cannot guide another theft while keeping Mara Fen informed.",
          "failTitle": "Proof in Splinters",
          "failText": "The marks become meaningless fragments, and Shaw's clerk later calls them firewood from an old shed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the notches and leave the board apparently untouched while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A08B"
        }
      ]
    },
    {
      "id": "A07C",
      "turn": 7,
      "title": "The Ledger Board - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Tobin reveals a board where loads are recorded as repairs to Shaw's private drains.",
        "The narrow margin leaves no room to chase every possibility. Notches show six earlier diversions and a final mark beside the duke's tithe convoy due tomorrow.",
        "Delay has sharpened the danger: The vanished carts are a rehearsal for taking Oakenhurst's winter reserve."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the board so it cannot guide another theft before the remaining light fails.",
          "failTitle": "Proof in Splinters",
          "failText": "The marks become meaningless fragments, and Shaw's clerk later calls them firewood from an old shed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the notches and leave the board apparently untouched before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the board as evidence and retreat before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A08A"
        }
      ]
    },
    {
      "id": "A08A",
      "turn": 8,
      "title": "The Men Below - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. A concealed stair descends from the cutting into dry storage chambers.",
        "You use ground, wind, and cover to approach on your own terms. You hear the carters arguing with a guard named Pell, who promises release after the last convoy passes.",
        "The clearer position reveals the stakes: Freeing them now may save lives but expose the inquiry before the tithe convoy is safe."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Signal Mara to surround the stair before acting.",
          "scoreDelta": 0,
          "nextNodeId": "A09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge down the steps with sword drawn.",
          "failTitle": "Steel in a Narrow Stair",
          "failText": "Pell drops the stair brace; falling timbers pin you while the prisoners are driven through a rear tunnel.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Slip Pell away with a thrown-stone distraction and release one witness.",
          "scoreDelta": 1,
          "nextNodeId": "A09A"
        }
      ]
    },
    {
      "id": "A08B",
      "turn": 8,
      "title": "The Men Below - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. A concealed stair descends from the cutting into dry storage chambers.",
        "Your allies close the easy exits while you examine the heart of the scene. You hear the carters arguing with a guard named Pell, who promises release after the last convoy passes.",
        "The evidence now defines the danger: Freeing them now may save lives but expose the inquiry before the tithe convoy is safe."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge down the steps with sword drawn while keeping Mara Fen informed.",
          "failTitle": "Steel in a Narrow Stair",
          "failText": "Pell drops the stair brace; falling timbers pin you while the prisoners are driven through a rear tunnel.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Slip Pell away with a thrown-stone distraction and release one witness while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Signal Mara to surround the stair before acting while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A09C"
        }
      ]
    },
    {
      "id": "A08C",
      "turn": 8,
      "title": "The Men Below - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. A concealed stair descends from the cutting into dry storage chambers.",
        "You arrive openly and must turn speed into its own kind of protection. You hear the carters arguing with a guard named Pell, who promises release after the last convoy passes.",
        "Delay has sharpened the danger: Freeing them now may save lives but expose the inquiry before the tithe convoy is safe."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Slip Pell away with a thrown-stone distraction and release one witness before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Signal Mara to surround the stair before acting before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge down the steps with sword drawn before the remaining light fails.",
          "failTitle": "Steel in a Narrow Stair",
          "failText": "Pell drops the stair brace; falling timbers pin you while the prisoners are driven through a rear tunnel.",
          "death": true
        }
      ]
    },
    {
      "id": "A09A",
      "turn": 9,
      "title": "The Borrowed Seal - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. The rescued carter carries a clay tally stamped with Shaw's household wheat sheaf.",
        "The cleanest clue survives because you handled it with care. The stamp is genuine, but its rim bears a chip matching sealing clay found on every diverted load.",
        "The clearer position reveals the stakes: Shaw cannot dismiss the theft as the work of strangers if the tally reaches Aldric intact."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Press the seal into fresh clay for extra copies.",
          "failTitle": "A Spoiled Impression",
          "failText": "The damp clay sticks, tearing the original mark and leaving only copies Shaw can challenge.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the tally against rain and record the carter's account.",
          "scoreDelta": 1,
          "nextNodeId": "A10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the witness and tally to Oakenhurst under escort.",
          "scoreDelta": 0,
          "nextNodeId": "A10B"
        }
      ]
    },
    {
      "id": "A09B",
      "turn": 9,
      "title": "The Borrowed Seal - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. The rescued carter carries a clay tally stamped with Shaw's household wheat sheaf.",
        "The shared search reveals details no single witness had understood. The stamp is genuine, but its rim bears a chip matching sealing clay found on every diverted load.",
        "The evidence now defines the danger: Shaw cannot dismiss the theft as the work of strangers if the tally reaches Aldric intact."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the tally against rain and record the carter's account while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the witness and tally to Oakenhurst under escort while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Press the seal into fresh clay for extra copies while keeping Mara Fen informed.",
          "failTitle": "A Spoiled Impression",
          "failText": "The damp clay sticks, tearing the original mark and leaving only copies Shaw can challenge.",
          "death": false
        }
      ]
    },
    {
      "id": "A09C",
      "turn": 9,
      "title": "The Borrowed Seal - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. The rescued carter carries a clay tally stamped with Shaw's household wheat sheaf.",
        "What remains is enough, provided you act before it is moved. The stamp is genuine, but its rim bears a chip matching sealing clay found on every diverted load.",
        "Delay has sharpened the danger: Shaw cannot dismiss the theft as the work of strangers if the tally reaches Aldric intact."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the witness and tally to Oakenhurst under escort before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Press the seal into fresh clay for extra copies before the remaining light fails.",
          "failTitle": "A Spoiled Impression",
          "failText": "The damp clay sticks, tearing the original mark and leaving only copies Shaw can challenge.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the tally against rain and record the carter's account before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A10C"
        }
      ]
    },
    {
      "id": "A10A",
      "turn": 10,
      "title": "Mara Under Arrest - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Shaw's bailiff arrives with lawful authority to detain Mara for neglecting the road.",
        "You pause only long enough to read the danger correctly. His warrant concerns missed maintenance, not the disappearances, yet refusing it openly would divide the villagers.",
        "The clearer position reveals the stakes: The scheme depends on turning the honest road warden into the visible cause of the crooked mile."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the warrant aloud and separate its narrow charge from your investigation.",
          "scoreDelta": 1,
          "nextNodeId": "A11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Mara submit while you continue alone.",
          "scoreDelta": 0,
          "nextNodeId": "A11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten the bailiff until he abandons his duty.",
          "failTitle": "The Law Turned Against You",
          "failText": "The bailiff calls armed tenants, and Shaw gains the public quarrel he needs to bury the missing carts beneath charges of rebellion.",
          "death": false
        }
      ]
    },
    {
      "id": "A10B",
      "turn": 10,
      "title": "Mara Under Arrest - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Shaw's bailiff arrives with lawful authority to detain Mara for neglecting the road.",
        "A sober exchange of evidence keeps the group from dividing. His warrant concerns missed maintenance, not the disappearances, yet refusing it openly would divide the villagers.",
        "The evidence now defines the danger: The scheme depends on turning the honest road warden into the visible cause of the crooked mile."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Mara submit while you continue alone while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten the bailiff until he abandons his duty while keeping Mara Fen informed.",
          "failTitle": "The Law Turned Against You",
          "failText": "The bailiff calls armed tenants, and Shaw gains the public quarrel he needs to bury the missing carts beneath charges of rebellion.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the warrant aloud and separate its narrow charge from your investigation while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A11B"
        }
      ]
    },
    {
      "id": "A10C",
      "turn": 10,
      "title": "Mara Under Arrest - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Shaw's bailiff arrives with lawful authority to detain Mara for neglecting the road.",
        "You make up lost ground with a directness that warns everyone nearby. His warrant concerns missed maintenance, not the disappearances, yet refusing it openly would divide the villagers.",
        "Delay has sharpened the danger: The scheme depends on turning the honest road warden into the visible cause of the crooked mile."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten the bailiff until he abandons his duty before the remaining light fails.",
          "failTitle": "The Law Turned Against You",
          "failText": "The bailiff calls armed tenants, and Shaw gains the public quarrel he needs to bury the missing carts beneath charges of rebellion.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the warrant aloud and separate its narrow charge from your investigation before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Mara submit while you continue alone before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A11A"
        }
      ]
    },
    {
      "id": "A11A",
      "turn": 11,
      "title": "The Apprentice's Route - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. Tobin's apprentice escapes the cutting and finds you beside the old road.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. He says the captives are being moved through a lime drain to Shaw's walled sheepfold before dawn.",
        "The clearer position reveals the stakes: The road plot has a second refuge, and the tithe convoy is already approaching."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send him to guide two villagers while you ride ahead.",
          "scoreDelta": 0,
          "nextNodeId": "A12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force him onto Thorne despite his injured leg.",
          "failTitle": "A Guide Broken",
          "failText": "Pain makes the boy faint in the saddle; you lose the route and the only witness who knew the hidden drain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Treat his bruised ankle and have him draw the drain from memory.",
          "scoreDelta": 1,
          "nextNodeId": "A12A"
        }
      ]
    },
    {
      "id": "A11B",
      "turn": 11,
      "title": "The Apprentice's Route - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. Tobin's apprentice escapes the cutting and finds you beside the old road.",
        "With Thorne close and local witnesses beside you, you compare every account. He says the captives are being moved through a lime drain to Shaw's walled sheepfold before dawn.",
        "The evidence now defines the danger: The road plot has a second refuge, and the tithe convoy is already approaching."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Force him onto Thorne despite his injured leg while keeping Mara Fen informed.",
          "failTitle": "A Guide Broken",
          "failText": "Pain makes the boy faint in the saddle; you lose the route and the only witness who knew the hidden drain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Treat his bruised ankle and have him draw the drain from memory while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send him to guide two villagers while you ride ahead while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A12C"
        }
      ]
    },
    {
      "id": "A11C",
      "turn": 11,
      "title": "The Apprentice's Route - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. Tobin's apprentice escapes the cutting and finds you beside the old road.",
        "Working against the light, you test the few signs that remain. He says the captives are being moved through a lime drain to Shaw's walled sheepfold before dawn.",
        "Delay has sharpened the danger: The road plot has a second refuge, and the tithe convoy is already approaching."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Treat his bruised ankle and have him draw the drain from memory before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send him to guide two villagers while you ride ahead before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force him onto Thorne despite his injured leg before the remaining light fails.",
          "failTitle": "A Guide Broken",
          "failText": "Pain makes the boy faint in the saddle; you lose the route and the only witness who knew the hidden drain.",
          "death": false
        }
      ]
    },
    {
      "id": "A12A",
      "turn": 12,
      "title": "The Lime Drain - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. The drain mouth lies beneath pale spoil where no cart could appear to pass.",
        "You circle downwind and let small marks tell their order. Airflow carries chaff outward, and narrow hoof marks show pack animals moving grain beyond the blocked arch.",
        "The clearer position reveals the stakes: Shaw's men can empty the cutting underground while searchers watch its road entrance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Flood the drain to force everyone out.",
          "failTitle": "The White Torrent",
          "failText": "Water tears through the old limework, collapsing a chamber where captives and evidence remain trapped.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Crawl the dry side channel and mark each branch.",
          "scoreDelta": 1,
          "nextNodeId": "A13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the main arch with villagers and tools.",
          "scoreDelta": 0,
          "nextNodeId": "A13B"
        }
      ]
    },
    {
      "id": "A12B",
      "turn": 12,
      "title": "The Lime Drain - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. The drain mouth lies beneath pale spoil where no cart could appear to pass.",
        "You ask plain questions and watch which answers agree. Airflow carries chaff outward, and narrow hoof marks show pack animals moving grain beyond the blocked arch.",
        "The evidence now defines the danger: Shaw's men can empty the cutting underground while searchers watch its road entrance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Crawl the dry side channel and mark each branch while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the main arch with villagers and tools while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Flood the drain to force everyone out while keeping Mara Fen informed.",
          "failTitle": "The White Torrent",
          "failText": "Water tears through the old limework, collapsing a chamber where captives and evidence remain trapped.",
          "death": true
        }
      ]
    },
    {
      "id": "A12C",
      "turn": 12,
      "title": "The Lime Drain - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. The drain mouth lies beneath pale spoil where no cart could appear to pass.",
        "There is no time for elegance, only for separating fresh danger from old damage. Airflow carries chaff outward, and narrow hoof marks show pack animals moving grain beyond the blocked arch.",
        "Delay has sharpened the danger: Shaw's men can empty the cutting underground while searchers watch its road entrance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the main arch with villagers and tools before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Flood the drain to force everyone out before the remaining light fails.",
          "failTitle": "The White Torrent",
          "failText": "Water tears through the old limework, collapsing a chamber where captives and evidence remain trapped.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Crawl the dry side channel and mark each branch before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A13C"
        }
      ]
    },
    {
      "id": "A13A",
      "turn": 13,
      "title": "The Sheepfold Store - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. The side channel opens beneath Shaw's sheepfold, now packed with sacks from many farms.",
        "From sheltered ground, you measure tracks, tools, and distances. Tithe marks have been scraped away and replaced with private tally cords.",
        "The clearer position reveals the stakes: The theft is meant to look like lawful grain gathered on Shaw's estate."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve one sack of each altered mark and locate the prisoners first.",
          "scoreDelta": 1,
          "nextNodeId": "A14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the gates and let villagers identify their grain.",
          "scoreDelta": 0,
          "nextNodeId": "A14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the sacks across the yard to halt removal.",
          "failTitle": "A Yard of Confusion",
          "failText": "In the scramble, Shaw's men mix honest stores with stolen sacks and spirit the prisoners away.",
          "death": false
        }
      ]
    },
    {
      "id": "A13B",
      "turn": 13,
      "title": "The Sheepfold Store - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. The side channel opens beneath Shaw's sheepfold, now packed with sacks from many farms.",
        "You keep the scene orderly while your allies search it piece by piece. Tithe marks have been scraped away and replaced with private tally cords.",
        "The evidence now defines the danger: The theft is meant to look like lawful grain gathered on Shaw's estate."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the gates and let villagers identify their grain while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the sacks across the yard to halt removal while keeping Mara Fen informed.",
          "failTitle": "A Yard of Confusion",
          "failText": "In the scramble, Shaw's men mix honest stores with stolen sacks and spirit the prisoners away.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve one sack of each altered mark and locate the prisoners first while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A14B"
        }
      ]
    },
    {
      "id": "A13C",
      "turn": 13,
      "title": "The Sheepfold Store - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. The side channel opens beneath Shaw's sheepfold, now packed with sacks from many farms.",
        "Pressed for time, you trust hard evidence and discard rumor. Tithe marks have been scraped away and replaced with private tally cords.",
        "Delay has sharpened the danger: The theft is meant to look like lawful grain gathered on Shaw's estate."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the sacks across the yard to halt removal before the remaining light fails.",
          "failTitle": "A Yard of Confusion",
          "failText": "In the scramble, Shaw's men mix honest stores with stolen sacks and spirit the prisoners away.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve one sack of each altered mark and locate the prisoners first before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the gates and let villagers identify their grain before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A14A"
        }
      ]
    },
    {
      "id": "A14A",
      "turn": 14,
      "title": "Shaw's Countermove - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Edrik Shaw rides in claiming he has exposed a theft committed by Tobin and Mara.",
        "You move quietly enough to hear work and voices ahead. He offers the duke's convoy safe lodging inside his walls while rain worsens the road.",
        "The clearer position reveals the stakes: If the convoy enters, Shaw can seize it under the appearance of protection."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the convoy publicly and bar Shaw's gate.",
          "scoreDelta": 0,
          "nextNodeId": "A15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call Shaw a thief before the captain sees any proof.",
          "failTitle": "Honor Before Evidence",
          "failText": "Shaw demands judgment by the captain, and the convoy is delayed in the open until his hidden men close both roads.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Show the chipped tally only to the convoy captain and redirect quietly.",
          "scoreDelta": 1,
          "nextNodeId": "A15A"
        }
      ]
    },
    {
      "id": "A14B",
      "turn": 14,
      "title": "Shaw's Countermove - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Edrik Shaw rides in claiming he has exposed a theft committed by Tobin and Mara.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. He offers the duke's convoy safe lodging inside his walls while rain worsens the road.",
        "The evidence now defines the danger: If the convoy enters, Shaw can seize it under the appearance of protection."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Call Shaw a thief before the captain sees any proof while keeping Mara Fen informed.",
          "failTitle": "Honor Before Evidence",
          "failText": "Shaw demands judgment by the captain, and the convoy is delayed in the open until his hidden men close both roads.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Show the chipped tally only to the convoy captain and redirect quietly while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the convoy publicly and bar Shaw's gate while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A15C"
        }
      ]
    },
    {
      "id": "A14C",
      "turn": 14,
      "title": "Shaw's Countermove - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Edrik Shaw rides in claiming he has exposed a theft committed by Tobin and Mara.",
        "You push through fatigue, knowing the next mistake may close the road. He offers the duke's convoy safe lodging inside his walls while rain worsens the road.",
        "Delay has sharpened the danger: If the convoy enters, Shaw can seize it under the appearance of protection."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Show the chipped tally only to the convoy captain and redirect quietly before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the convoy publicly and bar Shaw's gate before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call Shaw a thief before the captain sees any proof before the remaining light fails.",
          "failTitle": "Honor Before Evidence",
          "failText": "Shaw demands judgment by the captain, and the convoy is delayed in the open until his hidden men close both roads.",
          "death": false
        }
      ]
    },
    {
      "id": "A15A",
      "turn": 15,
      "title": "The True Mile - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. Mara's old maintenance notes reveal a raised causeway bypassing the sheepfold.",
        "A ranger's eye finds the human habit behind the apparent mystery. Its marker stones were buried, but oaks planted at the same survey still stand in a straight line.",
        "The clearer position reveals the stakes: The convoy can be saved if the forgotten causeway will bear loaded wagons."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive the whole convoy onto it before Shaw catches up.",
          "failTitle": "The Causeway Gives Way",
          "failText": "A hidden washout takes the lead wagon, blocking the route and leaving the convoy trapped between Shaw's riders and the marshy verge.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Probe the causeway for washouts before guiding the first cart.",
          "scoreDelta": 1,
          "nextNodeId": "A16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send an empty wagon across as a test.",
          "scoreDelta": 0,
          "nextNodeId": "A16B"
        }
      ]
    },
    {
      "id": "A15B",
      "turn": 15,
      "title": "The True Mile - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. Mara's old maintenance notes reveal a raised causeway bypassing the sheepfold.",
        "Together, the small company builds one reliable account from scattered facts. Its marker stones were buried, but oaks planted at the same survey still stand in a straight line.",
        "The evidence now defines the danger: The convoy can be saved if the forgotten causeway will bear loaded wagons."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Probe the causeway for washouts before guiding the first cart while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send an empty wagon across as a test while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive the whole convoy onto it before Shaw catches up while keeping Mara Fen informed.",
          "failTitle": "The Causeway Gives Way",
          "failText": "A hidden washout takes the lead wagon, blocking the route and leaving the convoy trapped between Shaw's riders and the marshy verge.",
          "death": true
        }
      ]
    },
    {
      "id": "A15C",
      "turn": 15,
      "title": "The True Mile - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. Mara's old maintenance notes reveal a raised causeway bypassing the sheepfold.",
        "You take the shortest safe route and accept that concealment is nearly gone. Its marker stones were buried, but oaks planted at the same survey still stand in a straight line.",
        "Delay has sharpened the danger: The convoy can be saved if the forgotten causeway will bear loaded wagons."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send an empty wagon across as a test before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive the whole convoy onto it before Shaw catches up before the remaining light fails.",
          "failTitle": "The Causeway Gives Way",
          "failText": "A hidden washout takes the lead wagon, blocking the route and leaving the convoy trapped between Shaw's riders and the marshy verge.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Probe the causeway for washouts before guiding the first cart before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A16C"
        }
      ]
    },
    {
      "id": "A16A",
      "turn": 16,
      "title": "Carts at Dawn - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. The convoy turns onto the restored causeway as Shaw's riders appear behind it.",
        "You preserve the most fragile sign before turning to the larger scene. Mara organizes villagers at the narrowest bank while Tobin braces a weak bridge rail.",
        "The clearer position reveals the stakes: Protection now depends on discipline rather than a reckless fight."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use wagons as a moving barrier and keep the grain advancing.",
          "scoreDelta": 1,
          "nextNodeId": "A17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the bridge with Mara until the last cart crosses.",
          "scoreDelta": 0,
          "nextNodeId": "A17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride alone at Shaw and challenge him.",
          "failTitle": "One Rider Against Many",
          "failText": "Shaw's men surround Thorne and drag you down while the convoy stalls behind the fight.",
          "death": true
        }
      ]
    },
    {
      "id": "A16B",
      "turn": 16,
      "title": "Carts at Dawn - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. The convoy turns onto the restored causeway as Shaw's riders appear behind it.",
        "Each person is given one task, and confusion begins to clear. Mara organizes villagers at the narrowest bank while Tobin braces a weak bridge rail.",
        "The evidence now defines the danger: Protection now depends on discipline rather than a reckless fight."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the bridge with Mara until the last cart crosses while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride alone at Shaw and challenge him while keeping Mara Fen informed.",
          "failTitle": "One Rider Against Many",
          "failText": "Shaw's men surround Thorne and drag you down while the convoy stalls behind the fight.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use wagons as a moving barrier and keep the grain advancing while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A17B"
        }
      ]
    },
    {
      "id": "A16C",
      "turn": 16,
      "title": "Carts at Dawn - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. The convoy turns onto the restored causeway as Shaw's riders appear behind it.",
        "The enemy has the lead, so you judge every pause against the lives at risk. Mara organizes villagers at the narrowest bank while Tobin braces a weak bridge rail.",
        "Delay has sharpened the danger: Protection now depends on discipline rather than a reckless fight."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride alone at Shaw and challenge him before the remaining light fails.",
          "failTitle": "One Rider Against Many",
          "failText": "Shaw's men surround Thorne and drag you down while the convoy stalls behind the fight.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use wagons as a moving barrier and keep the grain advancing before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the bridge with Mara until the last cart crosses before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A17A"
        }
      ]
    },
    {
      "id": "A17A",
      "turn": 17,
      "title": "The Clerk in the Rain - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Shaw's clerk tries to flee with a waxed satchel toward the abandoned cutting.",
        "You watch before acting and learn who believes themselves unobserved. The satchel bulges with route maps and payment rolls; two riders screen his escape.",
        "The clearer position reveals the stakes: Those papers could prove the scheme beyond the single night."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Mara after the clerk while you guard the convoy.",
          "scoreDelta": 0,
          "nextNodeId": "A18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot at the satchel as it swings behind him.",
          "failTitle": "Pages in the Mire",
          "failText": "The arrow tears the satchel loose, and the swollen stream carries the papers into black mud before anyone can recover them.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut across the alder slope and take the clerk without striking his horse.",
          "scoreDelta": 1,
          "nextNodeId": "A18A"
        }
      ]
    },
    {
      "id": "A17B",
      "turn": 17,
      "title": "The Clerk in the Rain - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Shaw's clerk tries to flee with a waxed satchel toward the abandoned cutting.",
        "By keeping tempers cool, you hold the inquiry on facts. The satchel bulges with route maps and payment rolls; two riders screen his escape.",
        "The evidence now defines the danger: Those papers could prove the scheme beyond the single night."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot at the satchel as it swings behind him while keeping Mara Fen informed.",
          "failTitle": "Pages in the Mire",
          "failText": "The arrow tears the satchel loose, and the swollen stream carries the papers into black mud before anyone can recover them.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut across the alder slope and take the clerk without striking his horse while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Mara after the clerk while you guard the convoy while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A18C"
        }
      ]
    },
    {
      "id": "A17C",
      "turn": 17,
      "title": "The Clerk in the Rain - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Shaw's clerk tries to flee with a waxed satchel toward the abandoned cutting.",
        "The narrow margin leaves no room to chase every possibility. The satchel bulges with route maps and payment rolls; two riders screen his escape.",
        "Delay has sharpened the danger: Those papers could prove the scheme beyond the single night."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut across the alder slope and take the clerk without striking his horse before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Mara after the clerk while you guard the convoy before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shoot at the satchel as it swings behind him before the remaining light fails.",
          "failTitle": "Pages in the Mire",
          "failText": "The arrow tears the satchel loose, and the swollen stream carries the papers into black mud before anyone can recover them.",
          "death": false
        }
      ]
    },
    {
      "id": "A18A",
      "turn": 18,
      "title": "The Last Barrier - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Shaw's remaining men drop a timber gate across the causeway ahead.",
        "You use ground, wind, and cover to approach on your own terms. The hinge pins are fresh, and a drainage ditch offers a narrow route around the trap.",
        "The clearer position reveals the stakes: The convoy cannot stop long without surrendering its advantage."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ram the gate with the lead grain wagon.",
          "failTitle": "The Tithe Spilled",
          "failText": "The gate holds; the wagon breaks, and winter grain pours into the flooded ditch while Shaw's riders close.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Remove the lower hinge pin under cover of the wagons.",
          "scoreDelta": 1,
          "nextNodeId": "A19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead carts one by one through the drainage ditch.",
          "scoreDelta": 0,
          "nextNodeId": "A19B"
        }
      ]
    },
    {
      "id": "A18B",
      "turn": 18,
      "title": "The Last Barrier - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Shaw's remaining men drop a timber gate across the causeway ahead.",
        "Your allies close the easy exits while you examine the heart of the scene. The hinge pins are fresh, and a drainage ditch offers a narrow route around the trap.",
        "The evidence now defines the danger: The convoy cannot stop long without surrendering its advantage."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Remove the lower hinge pin under cover of the wagons while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead carts one by one through the drainage ditch while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ram the gate with the lead grain wagon while keeping Mara Fen informed.",
          "failTitle": "The Tithe Spilled",
          "failText": "The gate holds; the wagon breaks, and winter grain pours into the flooded ditch while Shaw's riders close.",
          "death": false
        }
      ]
    },
    {
      "id": "A18C",
      "turn": 18,
      "title": "The Last Barrier - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Shaw's remaining men drop a timber gate across the causeway ahead.",
        "You arrive openly and must turn speed into its own kind of protection. The hinge pins are fresh, and a drainage ditch offers a narrow route around the trap.",
        "Delay has sharpened the danger: The convoy cannot stop long without surrendering its advantage."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead carts one by one through the drainage ditch before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ram the gate with the lead grain wagon before the remaining light fails.",
          "failTitle": "The Tithe Spilled",
          "failText": "The gate holds; the wagon breaks, and winter grain pours into the flooded ditch while Shaw's riders close.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Remove the lower hinge pin under cover of the wagons before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A19C"
        }
      ]
    },
    {
      "id": "A19A",
      "turn": 19,
      "title": "Judgment at the Mile Stone - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. With the convoy safe, Mara brings Shaw, his clerk, and the recovered records to the reset marker.",
        "The cleanest clue survives because you handled it with care. Farmers identify their sacks while the freed carters give matching accounts.",
        "The clearer position reveals the stakes: A public reckoning can restore trust in the road before fear creates private tolls everywhere."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Lay out the maps, tally, and witness accounts in their proper order.",
          "scoreDelta": 1,
          "nextNodeId": "A20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Shaw under guard to Duke Aldric with the strongest evidence.",
          "scoreDelta": 0,
          "nextNodeId": "A20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the angry carters punish Shaw at the roadside.",
          "failTitle": "Justice Lost to Vengeance",
          "failText": "The beating destroys the lawful case and turns Shaw from an exposed thief into a wounded noble with powerful sympathizers.",
          "death": false
        }
      ]
    },
    {
      "id": "A19B",
      "turn": 19,
      "title": "Judgment at the Mile Stone - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. With the convoy safe, Mara brings Shaw, his clerk, and the recovered records to the reset marker.",
        "The shared search reveals details no single witness had understood. Farmers identify their sacks while the freed carters give matching accounts.",
        "The evidence now defines the danger: A public reckoning can restore trust in the road before fear creates private tolls everywhere."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Shaw under guard to Duke Aldric with the strongest evidence while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "nextNodeId": "A20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the angry carters punish Shaw at the roadside while keeping Mara Fen informed.",
          "failTitle": "Justice Lost to Vengeance",
          "failText": "The beating destroys the lawful case and turns Shaw from an exposed thief into a wounded noble with powerful sympathizers.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay out the maps, tally, and witness accounts in their proper order while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "nextNodeId": "A20B"
        }
      ]
    },
    {
      "id": "A19C",
      "turn": 19,
      "title": "Judgment at the Mile Stone - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. With the convoy safe, Mara brings Shaw, his clerk, and the recovered records to the reset marker.",
        "What remains is enough, provided you act before it is moved. Farmers identify their sacks while the freed carters give matching accounts.",
        "Delay has sharpened the danger: A public reckoning can restore trust in the road before fear creates private tolls everywhere."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the angry carters punish Shaw at the roadside before the remaining light fails.",
          "failTitle": "Justice Lost to Vengeance",
          "failText": "The beating destroys the lawful case and turns Shaw from an exposed thief into a wounded noble with powerful sympathizers.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay out the maps, tally, and witness accounts in their proper order before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "A20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Shaw under guard to Duke Aldric with the strongest evidence before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "A20A"
        }
      ]
    },
    {
      "id": "A20A",
      "turn": 20,
      "title": "The Mile Made Straight - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Duke Aldric's reeves gather where the buried oak line meets the original road.",
        "You pause only long enough to read the danger correctly. Tobin accepts sentence for his part, Mara is cleared, and the surviving grain carts wait to complete their journey.",
        "The clearer position reveals the stakes: The final settlement will decide whether this road belongs to common law or the strongest nearby landholder."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Reopen the road under temporary soldiers while Aldric reviews the claim.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Shaw's offer to fund repairs in exchange for silence.",
          "failTitle": "A Crooked Peace",
          "failText": "Shaw's money buys a quiet reopening, but the hidden toll survives and every future disappearance will rest on the compromise.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the complete survey and restore Mara as keeper of the mile.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "A20B",
      "turn": 20,
      "title": "The Mile Made Straight - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Duke Aldric's reeves gather where the buried oak line meets the original road.",
        "A sober exchange of evidence keeps the group from dividing. Tobin accepts sentence for his part, Mara is cleared, and the surviving grain carts wait to complete their journey.",
        "The evidence now defines the danger: The final settlement will decide whether this road belongs to common law or the strongest nearby landholder."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Shaw's offer to fund repairs in exchange for silence while keeping Mara Fen informed.",
          "failTitle": "A Crooked Peace",
          "failText": "Shaw's money buys a quiet reopening, but the hidden toll survives and every future disappearance will rest on the compromise.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the complete survey and restore Mara as keeper of the mile while keeping Mara Fen informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Reopen the road under temporary soldiers while Aldric reviews the claim while keeping Mara Fen informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "A20C",
      "turn": 20,
      "title": "The Mile Made Straight - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Duke Aldric's reeves gather where the buried oak line meets the original road.",
        "You make up lost ground with a directness that warns everyone nearby. Tobin accepts sentence for his part, Mara is cleared, and the surviving grain carts wait to complete their journey.",
        "Delay has sharpened the danger: The final settlement will decide whether this road belongs to common law or the strongest nearby landholder."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Present the complete survey and restore Mara as keeper of the mile before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Reopen the road under temporary soldiers while Aldric reviews the claim before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Shaw's offer to fund repairs in exchange for silence before the remaining light fails.",
          "failTitle": "A Crooked Peace",
          "failText": "Shaw's money buys a quiet reopening, but the hidden toll survives and every future disappearance will rest on the compromise.",
          "death": false
        }
      ]
    }
  ]
});
