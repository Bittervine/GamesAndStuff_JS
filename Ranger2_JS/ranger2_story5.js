window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "hollow-bell-of-saint-bryn",
  "title": "The Hollow Bell of Saint Bryn",
  "summary": "When empty death-bells ring from the ruined hospice of Saint Bryn and skilled townsfolk vanish from Oakenhurst, the ranger must cut through fear, false hauntings, and a hidden camp in Elderwood to stop a desperate search beneath the hill before greed buries truth and the living together.",
  "maxTurns": 20,
  "startNodeId": "K01B",
  "goodScoreThreshold": 13,
  "epilogues": {
    "high": "With Holl taken, the captives saved, and the ledgers preserved, Oakenhurst learns that old theft had indeed been buried under Saint Bryn's hill, though never cleanly enough to stay buried forever. Duke Aldric's officers later sort the claims under Maelin's witness and Sister Elswyth's records, the recovered silver is accounted for rather than plundered, and the tale of the empty bell becomes not a ghost story but a hard memory of fear mastered in time.",
    "low": "The night ends with the hill secured and the captives living, but too much has been soaked, broken, or lost for full justice to walk in daylight. Oakenhurst is spared a greater ruin, yet arguments linger over the damaged records, the missing coin, and the blame owed to dead men and living ones alike, while the ranger rides on knowing that saving a town and healing it are not always the same labor."
  },
  "nodes": [
    {
      "id": "K01A",
      "turn": 1,
      "title": "The Empty Peal - Clear Advantage",
      "narrative": [
        "The summons reaches you before full dark, and Thorne bears you into Oakenhurst while the last red light still clings to the west. A bell has tolled the death peal three nights running from the ruined hospice of Saint Bryn, yet no corpse has been laid out, and the villagers have begun to shutter their doors before dusk.",
        "At the inn yard, Reeve Maelin Harrow waits with a lantern hooded in her fist, her face set hard against worry. Beside her stands Sister Elswyth from the chapel, windblown and plain-spoken, who tells you that a cooper and a mason vanished between sunset and moonrise, leaving white clay hand-marks on their doors like the plague signs of old tales.",
        "You dismount with the damp of the road still in your cloak and feel the town listening to your first words. Fear has not yet ripened into panic, and that gives you a thin but precious edge."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Question Maelin and Elswyth closely, then go by the quieter lane",
          "nextNodeId": "K02A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight to the bell tower alone and call out into the dark",
          "failTitle": "Arrow in the Ruins",
          "failText": "A hidden watcher answers your challenge before any honest soul can reach you. You go down among the wet stones, and Oakenhurst spends the night with fear unbroken and no ranger to stand against it.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear the townsfolk through and take the common road to the hospice",
          "nextNodeId": "K02B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K01B",
      "turn": 1,
      "title": "The Empty Peal - Narrow Trail",
      "narrative": [
        "Rain follows you down from the north road and turns Oakenhurst's main street to black ruts that shine under torchlight. Before you can hand Thorne to a stable boy, the cracked bell of Saint Bryn's ruined hospice sounds once more across the fields, too slow for alarm and too solemn for any living celebration.",
        "Maelin Harrow meets you under the eaves of the alehouse, with Sister Elswyth close by and three sleepless householders behind them. They tell the same tale in rough pieces: no body in the hospice, no lawful reason to ring that bell, and two missing craftsmen taken after dark while white clay tokens in the shape of open hands were left where all could see them.",
        "The folk look at your sword, your bow, and the mud on your boots as though certainty might be carried in with the weather. All you truly have is a night's worth of questions and the knowledge that whatever stalks this town prefers dread to open force."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear the townsfolk through and take the common road to the hospice",
          "nextNodeId": "K02C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Question Maelin and Elswyth closely, then go by the quieter lane",
          "nextNodeId": "K02A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight to the bell tower alone and call out into the dark",
          "failTitle": "Arrow in the Ruins",
          "failText": "A hidden watcher answers your challenge before any honest soul can reach you. You go down among the wet stones, and Oakenhurst spends the night with fear unbroken and no ranger to stand against it.",
          "death": true
        }
      ]
    },
    {
      "id": "K01C",
      "turn": 1,
      "title": "The Empty Peal - Hard Pressed",
      "narrative": [
        "By the time you ride into Oakenhurst, the lanes are all but empty and every lit window seems to watch from behind drawn shutters. The hospice bell has already sounded and gone silent, leaving the kind of hush that makes frightened people imagine movement in every hedgerow.",
        "Maelin Harrow is sharper than courtesy, because the town has spent half the evening fending off rumors of graves opened and saints walking. Sister Elswyth keeps order as she can, but the facts are bad enough without the whispering: a cooper gone from his shed, a mason from his yard, and white clay hand-marks pressed onto both doors before dawn.",
        "Thorne blows steam into the cold and stamps at the cobbles while you take the measure of a place already sliding toward disorder. You are late enough that the trail has cooled, and somebody meant it to."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight to the bell tower alone and call out into the dark",
          "failTitle": "Arrow in the Ruins",
          "failText": "A hidden watcher answers your challenge before any honest soul can reach you. You go down among the wet stones, and Oakenhurst spends the night with fear unbroken and no ranger to stand against it.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear the townsfolk through and take the common road to the hospice",
          "nextNodeId": "K02C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Question Maelin and Elswyth closely, then go by the quieter lane",
          "nextNodeId": "K02B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K02A",
      "turn": 2,
      "title": "White Clay at Saint Bryn's - Clear Advantage",
      "narrative": [
        "Saint Bryn's hospice stands beyond the last crofts, a roofless shell with one square tower still holding against time and weather. In the wet ground below the belfry you find fresh prints, two men in nailed boots and one lighter step that turns inward as though burdened by a hauled rope.",
        "The bell rope itself has been replaced in part with new hemp, pale against the old black fibers, and the knot work is careful. Near the broken threshold lies a thumb-sized token of dried white clay stamped with an open hand, the sort once hung over plague doors so passersby would keep away.",
        "Sister Elswyth watches your face rather than the ground, knowing better than to ask too much at once. Whoever used the old sign knew the custom well and trusted fear to do half the work for them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the ground and the doorway for plain signs",
          "nextNodeId": "K03B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the cracked belfry steps in haste",
          "failTitle": "The Tower Gives Way",
          "failText": "The ruined stair was waiting for a heavier fool than the last one who used it. Stone breaks under you, and the hunt ends in shattered dark beneath Saint Bryn's bell.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the rope splice, the token, and the prints together before moving on",
          "nextNodeId": "K03A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K02B",
      "turn": 2,
      "title": "White Clay at Saint Bryn's - Narrow Trail",
      "narrative": [
        "The ruined hospice sits on a low rise east of town, its stone wet and dark under a spent moon. Up close the place looks less haunted than used, which is worse, because use belongs to the living and living hands can return.",
        "You find the bell rope frayed near the base and newer fibers spliced in above head height, with muddy smears on the inside wall where someone braced a shoulder to pull. A white clay hand-token rests in a crack of the sill, not dropped by chance but placed where dawn light would catch it first.",
        "Below the tower, wagon ruts overlap older cart tracks from chapel repairs and make the ground hard to read. Even so, the pattern is plain enough to trouble you: this was arranged, repeated, and done by people patient enough to come and go without leaving a scene of panic behind."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the rope splice, the token, and the prints together before moving on",
          "nextNodeId": "K03A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the ground and the doorway for plain signs",
          "nextNodeId": "K03C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the cracked belfry steps in haste",
          "failTitle": "The Tower Gives Way",
          "failText": "The ruined stair was waiting for a heavier fool than the last one who used it. Stone breaks under you, and the hunt ends in shattered dark beneath Saint Bryn's bell.",
          "death": true
        }
      ]
    },
    {
      "id": "K02C",
      "turn": 2,
      "title": "White Clay at Saint Bryn's - Hard Pressed",
      "narrative": [
        "The rise to Saint Bryn's is churned by too many feet, because half the town has been up to stare at it before courage failed. The ruined walls give back every sound in the wind, and the bell above swings a little in its frame as if remembering the hand that set it moving.",
        "Whatever clear tracks might have lain in the mud are spoiled by gawkers, wardens, and boys sent to prove they were not afraid. Still, you notice a newer splice in the rope and a crusted fragment of white clay worked into the doorway, marked with an open hand that no frightened child would have shaped so neatly.",
        "Maelin swears and orders the curious away while you crouch in the wet and salvage what sense you can. The place has been muddled by fear, yet one truth remains sharp: someone wanted the town looking at the tower while other work was done elsewhere."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the cracked belfry steps in haste",
          "failTitle": "The Tower Gives Way",
          "failText": "The ruined stair was waiting for a heavier fool than the last one who used it. Stone breaks under you, and the hunt ends in shattered dark beneath Saint Bryn's bell.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the rope splice, the token, and the prints together before moving on",
          "nextNodeId": "K03B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the ground and the doorway for plain signs",
          "nextNodeId": "K03C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K03A",
      "turn": 3,
      "title": "The Cooper's Yard - Clear Advantage",
      "narrative": [
        "The missing cooper's yard lies near the south edge of town where the sheds back onto alder scrub and a seldom-used lane. You find the door forced inward without splintering, a craftsman's job done by someone who knew how to lift a bar quietly, and outside in the muck a drag mark where a bundled load was taken to a waiting cart.",
        "Tomlin Kest, the chapel bell-ringer, slips out from behind a rain barrel when he sees Sister Elswyth with you. He admits he heard wheels in the night and saw a man in a dark cowl pin a white token to the cooper's lintel, while another stood watch with a soldier's posture and a scar bright on his cheek when the moon caught him.",
        "From the yard the cart trail leads toward the old pilgrims' way that enters Elderwood by a half-rotted gate. Hobb Greycap, an old charcoal burner Maelin trusts when she must, can take you there by ground that does not proclaim your coming."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Win Tomlin's trust and compare his memory with the tracks",
          "nextNodeId": "K04A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drag Tomlin out before the crowd and force his story",
          "failTitle": "A Witness Lost",
          "failText": "The boy bolts in terror, the crowd surges, and the yard becomes useless confusion. By the time order returns, the trail has truly gone cold.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the yard and follow the clearest cart marks",
          "nextNodeId": "K04B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K03B",
      "turn": 3,
      "title": "The Cooper's Yard - Narrow Trail",
      "narrative": [
        "The cooper's yard has the stale, strained look of a place searched after the fact by frightened neighbors. Tools remain on the bench, a hoop half-set on a cask, and one stool kicked over hard enough to tell you the taking was fast even if it was not loud.",
        "Tomlin Kest swallows his fear and gives you what he can. He says he heard cart wheels and men speaking low, and though he never saw their faces plain, one voice had the clipped edge of a camp sergeant, not a farmer or carter from Oakenhurst.",
        "You find enough in the lane to pick out a direction but not enough to count men with confidence. The trail bends toward Elderwood and the forgotten pilgrims' way, where Hobb Greycap knows the side tracks, peat runs, and charcoal paths better than any man in the village."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the yard and follow the clearest cart marks",
          "nextNodeId": "K04C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Win Tomlin's trust and compare his memory with the tracks",
          "nextNodeId": "K04A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drag Tomlin out before the crowd and force his story",
          "failTitle": "A Witness Lost",
          "failText": "The boy bolts in terror, the crowd surges, and the yard becomes useless confusion. By the time order returns, the trail has truly gone cold.",
          "death": false
        }
      ]
    },
    {
      "id": "K03C",
      "turn": 3,
      "title": "The Cooper's Yard - Hard Pressed",
      "narrative": [
        "The cooper's yard is crowded when you reach it, and the useful silence of a crime scene is long gone. Still, ordinary disorder has its own language, and beneath the villagers' trampling feet you find the deep cut of a cart wheel standing longer in one place than honest loading would require.",
        "Tomlin Kest is so shaken he keeps looking toward Saint Bryn's hill rather than at you. Between pauses he says he heard the cart, saw a white shape fixed to the door after the men had gone, and thought he glimpsed someone in a soldier's old jack near the lane mouth.",
        "The trail is blurred, the hour poor, and the town beginning to imagine ghosts where men will do. Yet the wheels turned toward Elderwood, and Hobb Greycap is sent for because no one else can read the forest edge with any trust left in his own nerves."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drag Tomlin out before the crowd and force his story",
          "failTitle": "A Witness Lost",
          "failText": "The boy bolts in terror, the crowd surges, and the yard becomes useless confusion. By the time order returns, the trail has truly gone cold.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the yard and follow the clearest cart marks",
          "nextNodeId": "K04C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Win Tomlin's trust and compare his memory with the tracks",
          "nextNodeId": "K04B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K04A",
      "turn": 4,
      "title": "Lamps in Elderwood - Clear Advantage",
      "narrative": [
        "Hobb Greycap meets you at the old gate with a charcoal sack over one shoulder and a long knife that has been sharpened more from habit than hope. He says the woods have shown stranger lights these past three nights, not the sway of foxfire in marsh gas but hooded lamps moved by men who know enough to keep them low.",
        "Under the alder boughs the air smells of wet bark and cold leaf mold, and Thorne must be left at a forester's lean-to while you go on foot. You find lantern grease on one trunk, a broken sprig tucked as a mark where only the cautious would notice it, and the shallow print of a boot turned outward to watch the back trail.",
        "By the time the moon lifts clear of the branches, you have the ring of their outer watch. Whoever haunts the village by night is no wandering madman but an organized hand working from within Elderwood's cover."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow the marked path and keep to cover",
          "nextNodeId": "K05B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Strike at the first moving light in the trees",
          "failTitle": "The Forest Answers",
          "failText": "You loose too soon and find not a leader but a decoy. The real sentries close on your position, and Elderwood swallows your chance in silence and steel.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Hobb's knowledge to circle wide and read the watchers from behind",
          "nextNodeId": "K05A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K04B",
      "turn": 4,
      "title": "Lamps in Elderwood - Narrow Trail",
      "narrative": [
        "Hobb Greycap leads you through Elderwood with the patience of a man who trusts roots and shadows more than stone streets. He has seen lamps moving among the trees, he tells you, and heard axes muffled under sacking as if some camp deeper in the wood has reason to hide even its smallest sounds.",
        "The path gives you signs in pieces. A scuffed patch where a sentry shifted his weight, a wax drip on fern leaves, and once the faint smell of banked charcoal not far enough from the pilgrims' way to be natural.",
        "You do not yet have their camp, but you have their habit. They watch their approaches, they mark safe routes, and they are disciplined enough to keep unneeded men from talking around the fires."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Hobb's knowledge to circle wide and read the watchers from behind",
          "nextNodeId": "K05A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow the marked path and keep to cover",
          "nextNodeId": "K05C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Strike at the first moving light in the trees",
          "failTitle": "The Forest Answers",
          "failText": "You loose too soon and find not a leader but a decoy. The real sentries close on your position, and Elderwood swallows your chance in silence and steel.",
          "death": true
        }
      ]
    },
    {
      "id": "K04C",
      "turn": 4,
      "title": "Lamps in Elderwood - Hard Pressed",
      "narrative": [
        "Hobb Greycap wastes no words when he finds you, only glances once at the sky and takes you off the lane before any hidden watcher can count how many came from town. Elderwood closes around you in damp black layers, and every branch-scratch seems louder because you know the other side of the hunt can hear just as well.",
        "The signs are thin where you most need them and plentiful where they may be planted. A lamp smear on bark, a snapped twig at shin height, and a length of old cord half-buried in leaves pull you deeper until even Hobb pauses and admits the men ahead know enough to lead pursuers astray.",
        "Then far off between the trunks a hooded light glides once and vanishes. It is no spirit, only a man with sense enough to move like one, and for the first time the shape of the trap begins to show."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Strike at the first moving light in the trees",
          "failTitle": "The Forest Answers",
          "failText": "You loose too soon and find not a leader but a decoy. The real sentries close on your position, and Elderwood swallows your chance in silence and steel.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Hobb's knowledge to circle wide and read the watchers from behind",
          "nextNodeId": "K05B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow the marked path and keep to cover",
          "nextNodeId": "K05C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K05A",
      "turn": 5,
      "title": "Marks in the Charcoal Ash - Clear Advantage",
      "narrative": [
        "The hidden camp is not found all at once but by layers: first a midden buried under bracken, then a rain trough cut with a spade, and at last the faint tap of iron on stone where men are working under orders to keep quiet. Through the screen of hazel you see rough shelters, stacked timbers, and two bound craftsmen being fed beside a covered cart.",
        "One of the shelters bears a white clay hand pressed onto the upright as if to make a badge of the old fear. Yet the rest of the place is sober and practical, with tools sorted by trade and watch lines set to command the approaches rather than defend against beasts or phantoms.",
        "Hobb touches your sleeve and nods toward a strip of cloth tied low to a root. On it is the mason's mark of Ivo Redd from Oakenhurst, set where a man might leave word for any rescuer patient enough to look down instead of ahead."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Look for a captive's mark and learn what labor the camp is built for",
          "nextNodeId": "K06A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the hidden camp and try to free the captives at once",
          "failTitle": "Too Many Blades",
          "failText": "The camp wakes in a heartbeat, and courage without numbers becomes only noise. The captives are dragged deeper into the wood while you are brought down or driven off.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay hidden and study the camp's order",
          "nextNodeId": "K06B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K05B",
      "turn": 5,
      "title": "Marks in the Charcoal Ash - Narrow Trail",
      "narrative": [
        "You circle the deeper wood until the forest gives up a smell of men: damp wool, horse sweat, and cooked barley from a fire kept low. From behind wind-thrown fir roots you glimpse a work camp fitted together in haste but not confusion, with carts drawn under netting and tools stacked under tarred hides.",
        "Two of the missing craftsmen are there, alive and closely watched. The white clay hand-signs appear again, daubed onto a supply chest and one post near the path, more emblem than warning now, which tells you the men at the center of this have begun to believe in their own pageant.",
        "There are more guards than simple kidnappers should require, and they move like men drilled once and not wholly softened by civilian years. The taking of townsfolk was never the end of their plan, only a means to put skilled hands to harder work."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay hidden and study the camp's order",
          "nextNodeId": "K06C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Look for a captive's mark and learn what labor the camp is built for",
          "nextNodeId": "K06A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the hidden camp and try to free the captives at once",
          "failTitle": "Too Many Blades",
          "failText": "The camp wakes in a heartbeat, and courage without numbers becomes only noise. The captives are dragged deeper into the wood while you are brought down or driven off.",
          "death": true
        }
      ]
    },
    {
      "id": "K05C",
      "turn": 5,
      "title": "Marks in the Charcoal Ash - Hard Pressed",
      "narrative": [
        "You do not find the camp cleanly. A sentry's cough, a glimpse of tarp through wet leaves, and the thud of a hammer wrapped in cloth bring you to it in scraps, each scrap carrying the risk that you have already been marked in return.",
        "What you see is enough to chill any talk of wandering spirits. The missing men are being kept under guard, tools laid out nearby, and the clay hand-signs stand among the trees like a badge chosen to frighten villagers rather than any token with sacred meaning.",
        "The camp itself is larger than the town suspected, with more stores, more rope, and more discipline than a handful of grave-robbers would need. Someone has built this hidden place to support a planned labor, and the labor is near at hand."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the hidden camp and try to free the captives at once",
          "failTitle": "Too Many Blades",
          "failText": "The camp wakes in a heartbeat, and courage without numbers becomes only noise. The captives are dragged deeper into the wood while you are brought down or driven off.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay hidden and study the camp's order",
          "nextNodeId": "K06C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Look for a captive's mark and learn what labor the camp is built for",
          "nextNodeId": "K06B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K06A",
      "turn": 6,
      "title": "The Leper Barn - Clear Advantage",
      "narrative": [
        "Following the workers' supply trail at dusk, you come to an old leper barn on the far side of the pilgrims' way, its stone walls half sunk in ivy and its loft boarded against weather. Voices carry from within, one calm and educated, another roughened by command, and you and Hobb flatten yourselves beneath the sill to listen.",
        "The calm voice belongs to a lean man in a patched black coat whom the others call Brother Cenn. He speaks of Saint Bryn's ward beneath the hill, of sealed rooms, old ledgers, and the need for carpenters and masons before the entrance can be safely opened.",
        "The rougher speaker is answered as Holl, and every word from him smells of impatience. He wants the silver Cenn has promised may lie below, and he does not care how many frightened villagers must be made to run from shadows before the digging is done."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Listen from cover and withdraw with what you hear",
          "nextNodeId": "K07B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burst into the leper barn and challenge the leaders openly",
          "failTitle": "Steel Before Truth",
          "failText": "Holl has men enough at hand to make a bold entrance into a short death. You learn nothing useful, and the hidden band closes ranks around the work.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Edge closer, sort the voices, and learn what each leader wants",
          "nextNodeId": "K07A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K06B",
      "turn": 6,
      "title": "The Leper Barn - Narrow Trail",
      "narrative": [
        "The trail of supplies and boot prints leads not to the heart of the camp but to a stone barn from the old hospice lands, once used to isolate the sick who arrived too late for the ward. Hobb finds you a gap in the rear wall where wind and weather have opened the mortar enough for sound to pass.",
        "You hear a man called Brother Cenn speaking with grave, clipped certainty about measurements, old records, and a chamber beneath Saint Bryn's hill sealed since the plague winters. The captives, he says, are needed to open it without bringing the earth down on everyone involved.",
        "Another man interrupts him twice, each time with less patience than before. The others call him Holl, and from the scrape of chairs and the silence that follows you judge he commands the blades, even if Cenn commands the purpose."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Edge closer, sort the voices, and learn what each leader wants",
          "nextNodeId": "K07A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Listen from cover and withdraw with what you hear",
          "nextNodeId": "K07C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burst into the leper barn and challenge the leaders openly",
          "failTitle": "Steel Before Truth",
          "failText": "Holl has men enough at hand to make a bold entrance into a short death. You learn nothing useful, and the hidden band closes ranks around the work.",
          "death": true
        }
      ]
    },
    {
      "id": "K06C",
      "turn": 6,
      "title": "The Leper Barn - Hard Pressed",
      "narrative": [
        "You reach the leper barn only after one wrong turn and a tense crawl through briar where a lesser man would have cursed aloud and been heard for it. By the time you settle below the cracked wall, the talk inside is near its end, and every lost word feels dear.",
        "Still, a few names fall clear enough. Brother Cenn speaks of a ward below Saint Bryn's hill and curses the weakness of old stone, while another man called Holl demands to know when the silver will be in hand and whether the village can be kept cowed much longer.",
        "The shape of the matter is suddenly sharper than the rumors that brought you here. Whatever sanctity is being worn as a mask, the men behind it are digging toward something buried, and greed stands close beside grievance in the same room."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burst into the leper barn and challenge the leaders openly",
          "failTitle": "Steel Before Truth",
          "failText": "Holl has men enough at hand to make a bold entrance into a short death. You learn nothing useful, and the hidden band closes ranks around the work.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Edge closer, sort the voices, and learn what each leader wants",
          "nextNodeId": "K07B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Listen from cover and withdraw with what you hear",
          "nextNodeId": "K07C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K07A",
      "turn": 7,
      "title": "What Lies Beneath the Hill - Clear Advantage",
      "narrative": [
        "At first light you return to the barn's backside and search the ash pit where last night's scraps were thrown. There you find a torn strip from an old hospice survey, ink faded but legible enough to mark a buried ward running from Saint Bryn's tower into the hill, with notes on a sealed lower store and a drainage culvert long thought collapsed.",
        "Hobb recognizes the hand on the newer notes in the margin. Brother Cenn, he says, served years ago at a river hospice farther south and had a reputation for memory, stubbornness, and a habit of preserving records no one else cared to keep.",
        "The plan becomes plain at last. The bells, the clay hands, and the kidnappings all serve one design: empty the approaches, hold the skilled men, and break open the ward below the ruined hospice before Oakenhurst dares to look too closely."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Search for written proof of what lies beneath Saint Bryn's hill",
          "nextNodeId": "K08A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the barn and hope the plan dies with it",
          "failTitle": "The Wrong Flame",
          "failText": "The blaze scatters the hidden company but does not stop them. Captives vanish into the trees, records are moved, and the night turns wild in all the ways you most needed to avoid.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Piece the clues together and carry the warning back",
          "nextNodeId": "K08B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K07B",
      "turn": 7,
      "title": "What Lies Beneath the Hill - Narrow Trail",
      "narrative": [
        "The scraps you gather from camp refuse and wheel ruts do not make a map at first, only a pattern. Then Sister Elswyth, when you bring the matter back to her in haste, remembers an old tale of a plague ward under Saint Bryn's hill where stores and records were sealed after the fever passed.",
        "A little more searching turns rumor into shape. A carved stone once used as a boundary marker bears a mason's scratch pointing toward the tower, and among the kidnappers' trash lies a strip of old vellum marked with measurements that match the hospice grounds.",
        "Brother Cenn is not digging at random. He believes something worth men, risk, and secrecy lies beneath the hill, and the clay tokens are meant to hold every honest witness at arm's length until he can reach it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Piece the clues together and carry the warning back",
          "nextNodeId": "K08C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search for written proof of what lies beneath Saint Bryn's hill",
          "nextNodeId": "K08A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the barn and hope the plan dies with it",
          "failTitle": "The Wrong Flame",
          "failText": "The blaze scatters the hidden company but does not stop them. Captives vanish into the trees, records are moved, and the night turns wild in all the ways you most needed to avoid.",
          "death": false
        }
      ]
    },
    {
      "id": "K07C",
      "turn": 7,
      "title": "What Lies Beneath the Hill - Hard Pressed",
      "narrative": [
        "What you know is still broken into hard little pieces, yet the pieces begin to answer one another if held in the right light. Saint Bryn's empty bell keeps folk away from the hill, the captured craftsmen provide labor, and Holl's men guard more tools than would ever be needed for a mere camp.",
        "Hobb gives you the rest from memory, grudging because old stories sit ill with practical men. He recalls hearing that the hospice once had a buried fever ward and stores cut into the rise itself, sealed when the sickness ended and left to sink from common memory.",
        "That is enough to guide the mind, if not the hand. Someone beneath those trees is working toward the stone under Saint Bryn's tower, and they mean to reach it before Oakenhurst can master its fear."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the barn and hope the plan dies with it",
          "failTitle": "The Wrong Flame",
          "failText": "The blaze scatters the hidden company but does not stop them. Captives vanish into the trees, records are moved, and the night turns wild in all the ways you most needed to avoid.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Piece the clues together and carry the warning back",
          "nextNodeId": "K08C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search for written proof of what lies beneath Saint Bryn's hill",
          "nextNodeId": "K08B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K08A",
      "turn": 8,
      "title": "Word Sent Before Dark - Clear Advantage",
      "narrative": [
        "You go back to Oakenhurst by a forester's cut, reaching the town before the hidden camp can guess how much you have learned. Maelin Harrow wastes no breath on doubt when she hears your account, and Sister Elswyth brings out the hospice keys, old parish rolls, and a bell hammer wrapped in cloth as if she had long feared they might matter again.",
        "Together you lay a quiet plan. Maelin sets two trustworthy wardens on the south lane, Elswyth gathers bread and bandages without telling the women why, and Hobb slips away to watch whether Holl's supply carts leave the wood before nightfall.",
        "The town is still afraid, but now its fear has a spine to lean on. For the first time since your arrival, Oakenhurst is not merely enduring events but preparing to answer them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Confide in Maelin and gather what help the town can quietly spare",
          "nextNodeId": "K09B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell the whole town everything at once",
          "failTitle": "Panic Takes the Reins",
          "failText": "The truth, shouted too broadly and too soon, arrives in Oakenhurst as rumor and terror. By nightfall the lanes are chaos, and Holl gains exactly the confusion he needs.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set Maelin, Elswyth, and Hobb to separate tasks before the enemy can shift",
          "nextNodeId": "K09A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K08B",
      "turn": 8,
      "title": "Word Sent Before Dark - Narrow Trail",
      "narrative": [
        "You return to Oakenhurst with enough proof to stiffen the reeve's resolve, though not enough to calm the whole village. Maelin Harrow agrees to keep the matter close and quiet, while Sister Elswyth searches the chapel chest for old ground plans and plague records that might tell you where the buried ward begins.",
        "The help they can raise is modest. A few steady men, some lamp oil, lengths of rope, and the promise that if the bell rings again they will not let the crowd run wild without hearing from you first.",
        "That is less than you would like and more than you had at dawn. In stories, a town rises as one; in life, most people first secure their own doors and pray their caution will not shame them by morning."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Set Maelin, Elswyth, and Hobb to separate tasks before the enemy can shift",
          "nextNodeId": "K09A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Confide in Maelin and gather what help the town can quietly spare",
          "nextNodeId": "K09C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell the whole town everything at once",
          "failTitle": "Panic Takes the Reins",
          "failText": "The truth, shouted too broadly and too soon, arrives in Oakenhurst as rumor and terror. By nightfall the lanes are chaos, and Holl gains exactly the confusion he needs.",
          "death": false
        }
      ]
    },
    {
      "id": "K08C",
      "turn": 8,
      "title": "Word Sent Before Dark - Hard Pressed",
      "narrative": [
        "You come back hard and late, and Oakenhurst has had too many hours to feed its own terrors. Men who were ready to help before dusk now speak of saints, old fever pits, and curses best left untouched, while Maelin spends half her strength keeping fools from marching on Saint Bryn's hill with torches and more courage than sense.",
        "Sister Elswyth believes you at once, which is a mercy, but belief does not conjure a ready force. She can find a few old papers and keep Tomlin close, while Hobb offers to return to the wood alone if need be, though the look in his eyes says he knows that will end poorly.",
        "You gain what support you can in a place already slipping from your fingers. The enemy has not merely hidden themselves well; they have made the village doubt its own judgment, which may serve them as well as any blade."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell the whole town everything at once",
          "failTitle": "Panic Takes the Reins",
          "failText": "The truth, shouted too broadly and too soon, arrives in Oakenhurst as rumor and terror. By nightfall the lanes are chaos, and Holl gains exactly the confusion he needs.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set Maelin, Elswyth, and Hobb to separate tasks before the enemy can shift",
          "nextNodeId": "K09B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Confide in Maelin and gather what help the town can quietly spare",
          "nextNodeId": "K09C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K09A",
      "turn": 9,
      "title": "The Lime Quarry - Clear Advantage",
      "narrative": [
        "Hobb's watch proves true, and before midnight you intercept a supply cart turning from the wood toward an abandoned lime quarry east of the hospice lands. The cart carries wedges, fresh rope, two covered lanterns, and sacks of barley enough for more men than the work camp alone should hold.",
        "In the quarry sheds you corner one of Holl's outer hands before he can flee. He breaks quickly under your knife laid across his sleeve rather than his throat, spitting out Brand Holl's full name and cursing the fool's greed for silver hidden in Saint Bryn's buried store.",
        "The quarry also holds a second truth. Extra picks and hauled timber have been staged there for a fast push underground, which means Holl and Cenn are nearing the point where secrecy will give way to action."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Intercept a lesser man and wring names and purpose from him",
          "nextNodeId": "K10A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait at the quarry in hopes of taking Holl himself",
          "failTitle": "The Empty Ambush",
          "failText": "Holl never comes, and the hours bleed away while the real work moves elsewhere. When at last you leave the quarry, you are chasing the night instead of shaping it.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the sheds and seize what clear evidence remains",
          "nextNodeId": "K10B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K09B",
      "turn": 9,
      "title": "The Lime Quarry - Narrow Trail",
      "narrative": [
        "A narrow watch on the forest lanes leads you to an abandoned lime quarry where the kidnappers have hidden supplies away from their main camp. The sheds are cold but recently used, and among the dust you find fresh rope, lantern trim, timber braces, and a stack of tools better suited to opening stone than cutting firewood.",
        "One of Holl's men nearly slips past you with a mule, yet panic makes him clumsy. From him you wrench two useful names: Brand Holl for the hard captain in charge of blades, and Brother Cenn for the man driving the search below Saint Bryn's hill.",
        "He knows little beyond fear and pay, but that little is enough. Holl expects silver in quantity, and he is gathering material as if readying for a final breach rather than another week of cautious digging."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the sheds and seize what clear evidence remains",
          "nextNodeId": "K10C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Intercept a lesser man and wring names and purpose from him",
          "nextNodeId": "K10A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait at the quarry in hopes of taking Holl himself",
          "failTitle": "The Empty Ambush",
          "failText": "Holl never comes, and the hours bleed away while the real work moves elsewhere. When at last you leave the quarry, you are chasing the night instead of shaping it.",
          "death": false
        }
      ]
    },
    {
      "id": "K09C",
      "turn": 9,
      "title": "The Lime Quarry - Hard Pressed",
      "narrative": [
        "When you reach the old lime quarry, one shed stands open and the freshest goods are already gone. Someone has either guessed your interest or simply moved faster than you could, and in either case the loss bites deep.",
        "What remains still speaks. Broken lantern hoods, chalk lines on a crate lid, and a half-drunk pot left on the coals suggest a larger underground effort than the hidden camp showed by itself, while a dropped tally stick bears the scored name Holl beside marks for rope, wedges, and mules.",
        "You come away without a prisoner and with less certainty than you wanted. Yet the quarry confirms what the barn only hinted: Brand Holl is provisioning for a dangerous push beneath the hill, and he means to make it soon."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait at the quarry in hopes of taking Holl himself",
          "failTitle": "The Empty Ambush",
          "failText": "Holl never comes, and the hours bleed away while the real work moves elsewhere. When at last you leave the quarry, you are chasing the night instead of shaping it.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the sheds and seize what clear evidence remains",
          "nextNodeId": "K10C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Intercept a lesser man and wring names and purpose from him",
          "nextNodeId": "K10B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K10A",
      "turn": 10,
      "title": "A Split in the Hidden Camp - Clear Advantage",
      "narrative": [
        "With the quarry marked and the camp's rhythm better known, you and Hobb slip close enough after dusk to watch the hidden council fire. Brother Cenn stands with a rolled parchment in both hands, thin as a nail and fierce with purpose, while Brand Holl paces the edge of the light like a wolf forced to sit at table.",
        "Cenn wants one more careful night to shore the breach and keep the captives alive for the descent. Holl wants to move at once, seize what silver lies below, and leave the village to sort corpses, rumor, and blame after the fact.",
        "The men around them are not of one mind. Some listen to Cenn as if he were a priest still, others to Holl as if pay and fear had settled the whole matter, and that fracture is a lever a patient hand might yet use."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch from cover and judge the split in their ranks",
          "nextNodeId": "K11B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow into the council fire to break them apart",
          "failTitle": "The Wood Erupts",
          "failText": "The shot scatters the camp, but not in your favor. Men vanish with captives, orders change, and the last chance to learn their division is lost in a running fight.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study both men closely and learn where their aims part",
          "nextNodeId": "K11A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K10B",
      "turn": 10,
      "title": "A Split in the Hidden Camp - Narrow Trail",
      "narrative": [
        "You cannot reach the council fire closely enough to catch every word, but posture and scraps of speech tell their own story. Brother Cenn speaks to the ring of men as though laying down terms for a solemn duty, while Holl interrupts with the hard little gestures of a captain who thinks caution is another name for weakness.",
        "From what reaches you, the breach under Saint Bryn's hill is near ready and the captives are still needed. Holl presses for speed and silver, Cenn for timbering and records, and neither man trusts the other enough to hide it well.",
        "That matters more than any sermon or threat. A hidden company divided at its center can still strike hard, yet it strikes with a tremor in the arm, and a ranger may live on smaller advantages than that."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study both men closely and learn where their aims part",
          "nextNodeId": "K11A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch from cover and judge the split in their ranks",
          "nextNodeId": "K11C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow into the council fire to break them apart",
          "failTitle": "The Wood Erupts",
          "failText": "The shot scatters the camp, but not in your favor. Men vanish with captives, orders change, and the last chance to learn their division is lost in a running fight.",
          "death": false
        }
      ]
    },
    {
      "id": "K10C",
      "turn": 10,
      "title": "A Split in the Hidden Camp - Hard Pressed",
      "narrative": [
        "You miss the council itself and come upon its wake instead: trampled leaves, a cold ring of coals, and men splitting off in pairs with the hasty purpose of orders just given. Even so, the fragments are plain enough to read if you have seen soldiers fall out from command before.",
        "Holl's men carry extra rope and iron, while two others head toward the camp with stretchers and a keg of water. Hobb finds a scrap of parchment in the ashes bearing the words lower ward and records, with Cenn's hand cramped in the margin beside a line about unstable stone.",
        "The division in the band is harder to prove than to feel, but you feel it. The careful work is ending, the reckless work beginning, and the men inside the scheme no longer want quite the same prize."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow into the council fire to break them apart",
          "failTitle": "The Wood Erupts",
          "failText": "The shot scatters the camp, but not in your favor. Men vanish with captives, orders change, and the last chance to learn their division is lost in a running fight.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Study both men closely and learn where their aims part",
          "nextNodeId": "K11B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch from cover and judge the split in their ranks",
          "nextNodeId": "K11C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K11A",
      "turn": 11,
      "title": "Brother Cenn's Claim - Clear Advantage",
      "narrative": [
        "You send Hobb to keep watch and step into the edge of the firelight alone under a raised empty hand, trusting surprise to hold longer than any plea. Holl reaches for steel at once, but Brother Cenn checks him with a word and studies you as one tired man studies another who has walked too far to be lying.",
        "Cenn says the ward below Saint Bryn's hill was sealed during the fever years with relief silver, parish ledgers, and the names of children whose holdings were quietly stolen after their kin died. He claims the old steward who profited is long dead, yet the theft still stains living families, and he would drag the truth into daylight if the ground itself had to be broken for it.",
        "What he says is plausible enough to hurt. What he has done to reach it remains unforgivable, and Holl's hand on his hilt tells you the matter will not be settled by argument alone."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Draw out the truth of Cenn's grievance while keeping Holl in sight",
          "nextNodeId": "K12A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Cenn's words and leave him to his own conscience",
          "failTitle": "Mercy Misplaced",
          "failText": "Whatever remains of Cenn's purpose, Holl is the sharper will now. Your retreat gives the deserter captain the very hours he needs to seize the work entire.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the claim seriously but prepare for force",
          "nextNodeId": "K12B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K11B",
      "turn": 11,
      "title": "Brother Cenn's Claim - Narrow Trail",
      "narrative": [
        "Parley comes half by design and half by chance when one of the outer sentries recognizes that you have been shadowing them too long for blind luck. You stand across a strip of wet leaves from Brother Cenn while Holl lingers farther back with two armed men, plainly offended that words are being spent where he prefers force.",
        "Cenn does not deny the kidnappings or the bell. He says fear was the only wall strong enough to keep Oakenhurst from blundering onto the old ward before it could be opened, and that beneath Saint Bryn's hill lie records proving that land and silver meant for plague orphans were swallowed by a ducal officer and never restored.",
        "The claim lands like a stone in deep water. You cannot test its depth here, and Holl's impatience grows with every breath, yet you leave knowing this is not merely a hunt for coin in the mind of the man who began it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the claim seriously but prepare for force",
          "nextNodeId": "K12C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Draw out the truth of Cenn's grievance while keeping Holl in sight",
          "nextNodeId": "K12A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Cenn's words and leave him to his own conscience",
          "failTitle": "Mercy Misplaced",
          "failText": "Whatever remains of Cenn's purpose, Holl is the sharper will now. Your retreat gives the deserter captain the very hours he needs to seize the work entire.",
          "death": false
        }
      ]
    },
    {
      "id": "K11C",
      "turn": 11,
      "title": "Brother Cenn's Claim - Hard Pressed",
      "narrative": [
        "The chance for parley comes ragged and dangerous, with bows half-drawn in the dark and Holl only barely talked out of a first foolish shot. Brother Cenn steps forward from behind his men, lantern light cutting the planes of a face worn thin by conviction and sleeplessness.",
        "He gives you the bare bones and no more. There are records below Saint Bryn's hill, he says, enough to shame old theft and perhaps restore what was taken from children left helpless in the plague years, and he will not abandon that truth because Oakenhurst frightens easily.",
        "It is a hard thing to hear from a man standing among kidnappers. Before you can press further, Holl breaks the moment with a curse and orders the guards doubled, making plain which of the two men will choose blood fastest when patience runs out."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Cenn's words and leave him to his own conscience",
          "failTitle": "Mercy Misplaced",
          "failText": "Whatever remains of Cenn's purpose, Holl is the sharper will now. Your retreat gives the deserter captain the very hours he needs to seize the work entire.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the claim seriously but prepare for force",
          "nextNodeId": "K12C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Draw out the truth of Cenn's grievance while keeping Holl in sight",
          "nextNodeId": "K12B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K12A",
      "turn": 12,
      "title": "The Bells Before Midnight - Clear Advantage",
      "narrative": [
        "You expect Holl to betray caution, and so when the hospice bell begins to toll before midnight you are already moving. From the tree line you see his men driving the captives from camp under guard, lanterns hooded, carts loaded, and no sign that Brother Cenn fully chose the hour.",
        "The road to Saint Bryn's hill becomes a dark river of urgency. Holl means to force the breach while the town cowers indoors at the sound of the death peal, counting on superstition to clear his flanks one last time.",
        "Because you guessed this turn of events, you are not wholly behind it. Maelin's watchers can be signaled, Elswyth can keep the townsfolk from stampeding, and the enemy must work fast under eyes they do not know are now open."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Signal your allies and move on the hill by the safer side",
          "nextNodeId": "K13B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Race straight for the captives through the open road",
          "failTitle": "Crossed in the Bell's Shadow",
          "failText": "Holl's covering men were waiting for just such haste. The road becomes a killing ground, and the night closes over the rescue before it begins.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Anticipate Holl's push and use the bell's confusion against him",
          "nextNodeId": "K13A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K12B",
      "turn": 12,
      "title": "The Bells Before Midnight - Narrow Trail",
      "narrative": [
        "The bell starts before midnight, sudden and deliberate, and every dog in Oakenhurst answers it. Holl has made his choice at last, throwing aside Cenn's measured pace for a push bold enough to win or ruin them all before dawn.",
        "Through breaks in the trees you glimpse the hidden camp in motion. Captive craftsmen are marched under guard toward Saint Bryn's hill, tools on carts behind them, while Holl's fighters spread outward to keep curious villagers and honest witnesses from coming near.",
        "You move quickly, but so do they. The matter has broken from secrecy into action, and whatever was patient in the scheme is now being carried forward by men who think noise matters less once the last gate is being forced."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Anticipate Holl's push and use the bell's confusion against him",
          "nextNodeId": "K13A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Signal your allies and move on the hill by the safer side",
          "nextNodeId": "K13C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Race straight for the captives through the open road",
          "failTitle": "Crossed in the Bell's Shadow",
          "failText": "Holl's covering men were waiting for just such haste. The road becomes a killing ground, and the night closes over the rescue before it begins.",
          "death": true
        }
      ]
    },
    {
      "id": "K12C",
      "turn": 12,
      "title": "The Bells Before Midnight - Hard Pressed",
      "narrative": [
        "The first toll of the bell finds you out of position, and the second tells you the rest before any messenger can. Holl has gone early or gone mad, perhaps both, and the whole hidden company is in motion while Oakenhurst wakes in fear to the old death peal once again.",
        "By the time you near Saint Bryn's hill, lights are moving through the trees in three separate files. One drives the captives, one secures the road, and one hauls tools and timber with the blunt haste of men who expect to finish their business before dawn can bring witnesses enough to matter.",
        "You have lost the luxury of choosing the ground. The enemy sets the pace now, and your work becomes the harder art of breaking a bad plan before it closes over the town completely."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Race straight for the captives through the open road",
          "failTitle": "Crossed in the Bell's Shadow",
          "failText": "Holl's covering men were waiting for just such haste. The road becomes a killing ground, and the night closes over the rescue before it begins.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Anticipate Holl's push and use the bell's confusion against him",
          "nextNodeId": "K13B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Signal your allies and move on the hill by the safer side",
          "nextNodeId": "K13C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K13A",
      "turn": 13,
      "title": "Panic on Hospice Hill - Clear Advantage",
      "narrative": [
        "Wind comes up from the marsh and drives low rain across Hospice Hill, flattening torch smoke and making every shout carry farther than it should. Even so, Maelin keeps the townsfolk below the rise while Sister Elswyth stands in the chapel yard and names the living God louder than the bell, stripping some of the old terror from the air by sheer steadiness.",
        "Holl's men have posted two archers among the broken walls and set laborers to widening a breach near the tower foundation. The captives work under threat, yet more than one glance lifts toward you when they realize help has reached the hill at last.",
        "Panic has not won, and that alone changes the shape of the night. What was meant to be a frightened village's silence becomes instead a contested ground where courage, order, and time still have purchase."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Steady Maelin's line and open a path toward the lower entrance",
          "nextNodeId": "K14A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the frightened villagers charge the ruins ahead of you",
          "failTitle": "Panic on the Slope",
          "failText": "The rush breaks against Holl's sentries and turns to trampling, screams, and blind retreat. The hill is given wholly to the enemy for the worst possible hour.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the crowd back and work toward the breach carefully",
          "nextNodeId": "K14B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K13B",
      "turn": 13,
      "title": "Panic on Hospice Hill - Narrow Trail",
      "narrative": [
        "Hospice Hill is a knot of rain, mud, and human fear by the time you reach it. Some villagers have come despite Maelin's orders, drawn by the bell and by their own dread, and Sister Elswyth must spend half her breath keeping them from rushing the ruins or fleeing blindly down the dark lanes.",
        "Above them Holl's men move with the confidence of those who know confusion is serving them. The captives are forced at spear point to widen a stone break near the tower, while sentries hold the approaches and shout warnings into the wet whenever any shadow shifts below.",
        "You arrive in time to matter but not in time to command the whole field. The hill is balanced on the lip between order and riot, and what you do next will tip more than the hidden chamber beneath it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the crowd back and work toward the breach carefully",
          "nextNodeId": "K14C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Steady Maelin's line and open a path toward the lower entrance",
          "nextNodeId": "K14A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the frightened villagers charge the ruins ahead of you",
          "failTitle": "Panic on the Slope",
          "failText": "The rush breaks against Holl's sentries and turns to trampling, screams, and blind retreat. The hill is given wholly to the enemy for the worst possible hour.",
          "death": false
        }
      ]
    },
    {
      "id": "K13C",
      "turn": 13,
      "title": "Panic on Hospice Hill - Hard Pressed",
      "narrative": [
        "Fear outruns you to Hospice Hill and breeds three fresh fears before you arrive. Villagers gather with torches, boys cry that the dead are rising, and one panicked fool swears he saw a white hand move across the ruined wall though it was surely only rain on stone in bad light.",
        "Holl uses the uproar well. His men bully the captives through the breach while archers on the rise threaten anyone who comes close, and every shouted rumor from below helps cover the scrape of tools above.",
        "Maelin is trying to hold a line with too few steady hands, while Sister Elswyth has Tomlin by the shoulder and will not let the boy look at the tower. The night has become the very chaos Holl hoped to buy, and you must carve sense out of it with almost nothing to spare."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the frightened villagers charge the ruins ahead of you",
          "failTitle": "Panic on the Slope",
          "failText": "The rush breaks against Holl's sentries and turns to trampling, screams, and blind retreat. The hill is given wholly to the enemy for the worst possible hour.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the crowd back and work toward the breach carefully",
          "nextNodeId": "K14C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Steady Maelin's line and open a path toward the lower entrance",
          "nextNodeId": "K14B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K14A",
      "turn": 14,
      "title": "The Drain Under Stone - Clear Advantage",
      "narrative": [
        "Sister Elswyth remembers the old drainage run only when you ask where fever water was carried in the hospice days. Behind a tangle of nettles and fallen stone, you find the culvert mouth half-choked but passable for a careful man, and Tomlin swears he saw one of Holl's men haul boards from that side earlier in the night.",
        "The crawl is wet, close, and rank with earth long shut from weather. Halfway through you come upon Ivo Redd, the missing mason, wedged behind a broken grate where he was left bound after warning the others that the timbering was unsound.",
        "Ivo has dirt in his beard and terror in his eyes, yet his mind is clear. He tells you Holl means to force the lower ward by winch and wedge, and that Brother Cenn has tried too late to slow him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the drain and trust the cramped old route",
          "nextNodeId": "K15B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force the first blocked stair without checking the stone",
          "failTitle": "Buried Below",
          "failText": "The rubble shifts under your weight and comes down in a grinding sheet. Earth and old masonry seal the passage, and the ward keeps its secrets over your grave.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Ivo's knowledge and the drain together to reach the lower ward cleanly",
          "nextNodeId": "K15A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K14B",
      "turn": 14,
      "title": "The Drain Under Stone - Narrow Trail",
      "narrative": [
        "A search of the hill's lower face turns up what the old stories promised: a drainage slit hidden behind thorn and rubble where the buried ward once shed foul water downhill. It is narrow and mean, but narrower ways have carried you before, and the marks around it are fresh enough to prove it has not been forgotten by Holl's men.",
        "Inside, the passage bends sharply and opens near a broken service chamber where one of the captives lies tied with bruised wrists and a split lip. He is Ivo Redd, the mason from Oakenhurst, and relief almost unmakes him when he recognizes you in the lantern glow.",
        "Ivo says the breach below is unstable, the workers near spent, and Holl deaf to any warning not spoken in the language of profit. Brother Cenn is still alive, he thinks, but no longer master of what he set in motion."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Ivo's knowledge and the drain together to reach the lower ward cleanly",
          "nextNodeId": "K15A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the drain and trust the cramped old route",
          "nextNodeId": "K15C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force the first blocked stair without checking the stone",
          "failTitle": "Buried Below",
          "failText": "The rubble shifts under your weight and comes down in a grinding sheet. Earth and old masonry seal the passage, and the ward keeps its secrets over your grave.",
          "death": true
        }
      ]
    },
    {
      "id": "K14C",
      "turn": 14,
      "title": "The Drain Under Stone - Hard Pressed",
      "narrative": [
        "You find the drain by luck sharpened with desperation, when rainwater running through nettles shows where old stone still channels the slope. There is barely room to force your shoulders through, and the crawl beyond is black enough that each breath feels borrowed from the earth itself.",
        "At the first widening you nearly step on a bound figure left in the dark. It is Ivo Redd, weak with cold but lucid enough to tell you between chattering teeth that Holl has driven the men below, that the timbers are groaning, and that Brother Cenn's warnings have become little more than words shouted after greed.",
        "Ivo also gives you the thing you lacked most: direction. The lower ward can be reached by the old service stair if the rubble there has not fallen fully in, and every moment lost above may already be costing lives below."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Force the first blocked stair without checking the stone",
          "failTitle": "Buried Below",
          "failText": "The rubble shifts under your weight and comes down in a grinding sheet. Earth and old masonry seal the passage, and the ward keeps its secrets over your grave.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Ivo's knowledge and the drain together to reach the lower ward cleanly",
          "nextNodeId": "K15B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the drain and trust the cramped old route",
          "nextNodeId": "K15C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K15A",
      "turn": 15,
      "title": "The Buried Ward - Clear Advantage",
      "narrative": [
        "The buried ward opens before you in a long stone chamber with arched ceilings blackened by age and smoke from newly lit lamps. Rows of plank cots, long collapsed, line the walls under faded holy marks, and beyond them stand sealed niches, record chests, and a barred store room half torn from its hinges.",
        "Holl's men have broken the place like raiders bursting a cellar, yet the old order still shows through. Bundles of parish ledgers lie stacked in waxed cloth, and three small strongboxes stamped with Saint Bryn's seal rest among fever jars and rusted fittings that no greedy man would notice first.",
        "Brother Cenn kneels near a fallen prop with blood on his sleeve, shouting at the workers to shore the passage before the lower floor shifts. Holl does not even turn his head, being too intent on the store room and whatever gleam he thinks waits beyond."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the chamber, the records, and Holl's obsession in a single glance",
          "nextNodeId": "K16A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Go straight for the silver and trust the chamber to hold",
          "failTitle": "Greed's Companion",
          "failText": "You step where Holl stepped in spirit if not in motive. The floor answers badly, and the ward begins to fall before the living can clear it.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the way in and measure the danger before pressing farther",
          "nextNodeId": "K16B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K15B",
      "turn": 15,
      "title": "The Buried Ward - Narrow Trail",
      "narrative": [
        "You come into the lower ward through a side chamber and stop for one sober breath at the sight of it. The place is no tomb of legend, only a hard-built refuge for desperate winters long gone, with stone cots, prayer marks, and storage cut deep into the hill where fever and fear once ruled above.",
        "The first opened chests hold not treasure but records. Ledgers wrapped in waxed cloth, names, dates, and land tallies written in careful hands, all the quiet papers by which theft can live longer than the men who first committed it.",
        "Farther in, where Holl has concentrated his strength, iron has been set to a sealed store and the air is full of powdery stone. Brother Cenn is there, gaunt and pale, trying to keep the breach from becoming a grave for everyone present while Holl demands speed from men too frightened to disobey."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the way in and measure the danger before pressing farther",
          "nextNodeId": "K16C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the chamber, the records, and Holl's obsession in a single glance",
          "nextNodeId": "K16A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Go straight for the silver and trust the chamber to hold",
          "failTitle": "Greed's Companion",
          "failText": "You step where Holl stepped in spirit if not in motive. The floor answers badly, and the ward begins to fall before the living can clear it.",
          "death": true
        }
      ]
    },
    {
      "id": "K15C",
      "turn": 15,
      "title": "The Buried Ward - Hard Pressed",
      "narrative": [
        "The lower ward feels less like discovery than violation. Fresh lamp smoke mingles with the stale cold of a place sealed for decades, and every new shout jars against carvings meant to comfort the sick who once lay here under strict, humble care.",
        "You see at once that Holl has reached both records and silver, though neither cleanly. Ledgers have been dragged from their wrappings onto dirty stone, while one cracked strongbox lies open with a wash of old coin dim in the lantern light and more still sealed behind a bar-split door.",
        "Brother Cenn is alive but losing his hold on the men, if he ever truly had it. Holl stands over the opened store like a starving hound, blind to the shifting dust above and the dread on the captives' faces as the ward begins to answer rough handling with dangerous sounds."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Go straight for the silver and trust the chamber to hold",
          "failTitle": "Greed's Companion",
          "failText": "You step where Holl stepped in spirit if not in motive. The floor answers badly, and the ward begins to fall before the living can clear it.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the way in and measure the danger before pressing farther",
          "nextNodeId": "K16C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the chamber, the records, and Holl's obsession in a single glance",
          "nextNodeId": "K16B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K16A",
      "turn": 16,
      "title": "A Choice Among the Dead - Clear Advantage",
      "narrative": [
        "Cenn looks up when he sees you and, for the first time, conviction gives way to naked weariness. He says he found the records years ago in a river hospice archive, traced them to Saint Bryn's sealed ward, and convinced himself that one last unlawful act could set an older unlawful act right.",
        "The words might have landed harder if Holl had not chosen that moment to strike one of the captive carpenters for slowing at the braces. Cenn flinches as if the blow fell on him, and in that flinch you read the full measure of his failure: he opened the door to violence thinking purpose would keep it on a leash.",
        "Stone dust sifts from the ceiling in a pale whisper. Whatever justice Cenn imagined lies now in a chamber where lives, records, and silver may all be crushed together unless someone seizes the night from Holl at once."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take what truth matters and move to stop Holl",
          "nextNodeId": "K17B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop to argue the whole of justice with Cenn",
          "failTitle": "Words Under Falling Stone",
          "failText": "The chamber has moved beyond speeches. While you spend your breath on blame and confession, Holl takes the deeper route with coin, records, and the last of the advantage.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Turn Cenn's confession into leverage against Holl at once",
          "nextNodeId": "K17A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K16B",
      "turn": 16,
      "title": "A Choice Among the Dead - Narrow Trail",
      "narrative": [
        "Brother Cenn is wounded and proud enough to treat the first as nothing and the second as armor. When you force words from him, he admits the records below name children stripped of inheritance after the plague years, their holdings folded into larger estates by a steward who trusted burial and time to hide the theft.",
        "He says he needed masons, carpenters, and silence, and that silence could only be had by frightening the town away from Saint Bryn's hill. Before you can answer, Holl shoves past with a pry bar in hand and makes plain how little room remains for argument or regret.",
        "Cenn's claim may be true, partly true, or sharpened by guilt into something he can still bear to say aloud. Yet Holl is truer in the immediate sense, because his greed is visible and the chamber itself is beginning to shift under it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Turn Cenn's confession into leverage against Holl at once",
          "nextNodeId": "K17A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take what truth matters and move to stop Holl",
          "nextNodeId": "K17C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop to argue the whole of justice with Cenn",
          "failTitle": "Words Under Falling Stone",
          "failText": "The chamber has moved beyond speeches. While you spend your breath on blame and confession, Holl takes the deeper route with coin, records, and the last of the advantage.",
          "death": false
        }
      ]
    },
    {
      "id": "K16C",
      "turn": 16,
      "title": "A Choice Among the Dead - Hard Pressed",
      "narrative": [
        "Brother Cenn leans against a pillar with one arm pressed to his side, no longer the stern voice from the leper barn but a scholar-priest who has discovered too late that men like Holl do not serve causes, only opportunities. He tries to speak of records, stolen holdings, and plague orphans, but every sentence is cut short by the groan of stone or the bark of Holl's orders.",
        "The confession comes in splinters. He began the search, he used the old signs, he justified the kidnappings as temporary evil for a lasting correction, and he did not see how quickly hired blades would make the whole work their own.",
        "Holl scarcely bothers with him now. The deserter captain wants the strongboxes, the outer road, and any witness frightened enough to keep silent afterward, and that makes him the true center of danger whether Cenn likes it or not."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop to argue the whole of justice with Cenn",
          "failTitle": "Words Under Falling Stone",
          "failText": "The chamber has moved beyond speeches. While you spend your breath on blame and confession, Holl takes the deeper route with coin, records, and the last of the advantage.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Turn Cenn's confession into leverage against Holl at once",
          "nextNodeId": "K17B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take what truth matters and move to stop Holl",
          "nextNodeId": "K17C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K17A",
      "turn": 17,
      "title": "Horn and Chapel Light - Clear Advantage",
      "narrative": [
        "You have enough now to act on more than instinct. Through the drain and the broken stair you pass word back in quick relays, drawing Maelin's steadiest wardens to the hill and setting Sister Elswyth to receiving the freed captives at the chapel yard before fear can turn them into another panicked crowd.",
        "Hobb ghosts through the outer dark and cuts down one sentry with the flat of his blade, binds another, and opens a lane for the villagers who still trust you. The balance inside the ward shifts by degrees rather than with any single grand stroke, which is how most real victories begin.",
        "Holl hears that shift and becomes dangerous in the way trapped men do. He orders the records gathered with the coin and starts backing toward the deeper bell chamber where an old hoist shaft drops under the hill."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Coordinate Maelin, Hobb, and Elswyth so the hill answers as one",
          "nextNodeId": "K18A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive everyone forward in one blind rush",
          "failTitle": "The Line Breaks",
          "failText": "Too many feet, too little room, and too much fear undo the push at once. Holl slips the crush, and good men are hurt by friends as much as foes.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Gather the steadiest hands and tighten the net slowly",
          "nextNodeId": "K18B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K17B",
      "turn": 17,
      "title": "Horn and Chapel Light - Narrow Trail",
      "narrative": [
        "With Ivo safe enough to walk and Tomlin carrying a message like a sacrament, you begin to stitch the hill's scattered loyalties together. Maelin brings a handful of wardens who will stand where told, Sister Elswyth steadies the captives as they emerge, and Hobb takes the blind side of the ruins to worry Holl's outer men.",
        "The result is not clean command but a growing pressure Holl can feel. His archers lose clear shots, his workers falter when they hear familiar voices below, and even some of his own lesser hands start to reckon whether silver is worth being trapped under a hillside for.",
        "Holl reacts as hard captains do when the ground worsens. He gathers what valuables he can carry, shouts for the deeper route, and tries to turn a planned excavation into a fighting withdrawal."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Gather the steadiest hands and tighten the net slowly",
          "nextNodeId": "K18C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Coordinate Maelin, Hobb, and Elswyth so the hill answers as one",
          "nextNodeId": "K18A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive everyone forward in one blind rush",
          "failTitle": "The Line Breaks",
          "failText": "Too many feet, too little room, and too much fear undo the push at once. Holl slips the crush, and good men are hurt by friends as much as foes.",
          "death": false
        }
      ]
    },
    {
      "id": "K17C",
      "turn": 17,
      "title": "Horn and Chapel Light - Hard Pressed",
      "narrative": [
        "Nothing about the next stretch is orderly except your refusal to give it up. Messages are sent through rain and rubble, Maelin scrapes together whomever she can trust to keep formation, and Sister Elswyth turns chapel linen into bandages while the hill keeps spitting out half-frozen captives and rumors with equal force.",
        "Holl still holds the inner ground, but the edges of his control begin to fray. A sentry fails to return, one of the laborers bolts for the drain, and the villagers at last hear enough plain truth from the rescued men to stop muttering about saints and start naming criminals.",
        "Pressed from without and within, Holl chooses the only path left to him that promises both cover and leverage. He drives his closest men deeper under Saint Bryn's hill toward the old bell chamber and the shaft beyond it, hauling coin and records alike."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive everyone forward in one blind rush",
          "failTitle": "The Line Breaks",
          "failText": "Too many feet, too little room, and too much fear undo the push at once. Holl slips the crush, and good men are hurt by friends as much as foes.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Gather the steadiest hands and tighten the net slowly",
          "nextNodeId": "K18C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Coordinate Maelin, Hobb, and Elswyth so the hill answers as one",
          "nextNodeId": "K18B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K18A",
      "turn": 18,
      "title": "The Bell Chamber Run - Clear Advantage",
      "narrative": [
        "The bell chamber lies beyond a low gallery where the air turns colder and every sound answers itself twice from stone and water. Old mechanisms still hang there in rusted dignity: a broken counterweight, a haul wheel, and the shaft by which stores were once lowered into the deepest part of the ward.",
        "Holl has chosen the place well if he means to bargain or kill. One wrong step near the shaft would take a man into black water below, and the narrow approaches prevent Maelin's people from pressing him all at once.",
        "Yet he is also tired, cornered, and burdened by the very loot he refuses to leave. That burden is the truest ally you have left, for greed makes poor company in a chase through old stone."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Press carefully and deny Holl an easy escape",
          "nextNodeId": "K19B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Holl across the narrow gallery",
          "failTitle": "The Black Water Below",
          "failText": "He gives way just enough to draw you on, then uses the shaft and the dark as weapons of their own. The fall is short only in the telling.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Holl's burden and the chamber's shape against him",
          "nextNodeId": "K19A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K18B",
      "turn": 18,
      "title": "The Bell Chamber Run - Narrow Trail",
      "narrative": [
        "The pursuit drives through storerooms and service passages until the ward gives way to an older chamber built around a shaft and haul wheel. Water shines far below in the lantern light, and the bell rope from the tower above disappears through a slot in the ceiling black with age.",
        "Holl plants himself there with two loyal men, sacks of coin, and a bundle of records lashed in oilcloth. He threatens the shaft, the papers, and anyone foolish enough to rush him in a place made narrow by old engineering and older fear.",
        "The ground favors neither side cleanly. He has space enough to make a stand but not enough to escape a patient encirclement, and every extra pound he clings to slows the hope of running when the circle tightens."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Holl's burden and the chamber's shape against him",
          "nextNodeId": "K19A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Press carefully and deny Holl an easy escape",
          "nextNodeId": "K19C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Holl across the narrow gallery",
          "failTitle": "The Black Water Below",
          "failText": "He gives way just enough to draw you on, then uses the shaft and the dark as weapons of their own. The fall is short only in the telling.",
          "death": true
        }
      ]
    },
    {
      "id": "K18C",
      "turn": 18,
      "title": "The Bell Chamber Run - Hard Pressed",
      "narrative": [
        "The deeper passages are a bad place for any chase, all blind turns, damp steps, and sudden drops where lamp light ends before the stone does. Still you drive on, because letting Holl vanish with coin and records would poison the town long after tonight's wounds closed.",
        "He makes his stand in the old bell chamber by a hoist shaft sunk into black water. There he has height, a pinch point, and the madness of a man who believes loss of his prize would be worse than death or capture.",
        "The chamber itself seems to wait, taut as a drawn line. One shove too many, one beam cut in panic, and Holl could destroy the very evidence he chased, which means speed alone will not save this ending."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Holl across the narrow gallery",
          "failTitle": "The Black Water Below",
          "failText": "He gives way just enough to draw you on, then uses the shaft and the dark as weapons of their own. The fall is short only in the telling.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Holl's burden and the chamber's shape against him",
          "nextNodeId": "K19B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Press carefully and deny Holl an easy escape",
          "nextNodeId": "K19C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K19A",
      "turn": 19,
      "title": "At the Winch Shaft - Clear Advantage",
      "narrative": [
        "Holl backs to the winch with one hand on the haul rope and the other on his sword, silver at his feet and the oilcloth bundle of records wedged behind his heel. He spits that Cenn was a fool, the town will believe whatever frightens it most, and the dead keep secrets better than any priest.",
        "Brother Cenn, half-carried into the chamber by Hobb and Ivo, hears that and finally understands the full ruin of his bargain. Whatever his purpose once was, Holl means to leave nothing here that cannot be sold, buried, or drowned.",
        "You stand in the wet echo of the chamber with every road closed except the one a steady nerve can open. The night has narrowed to a single man, a single shaft, and the question of whether truth can be preserved without paying too much blood for it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take Holl alive and keep the records out of the shaft",
          "nextNodeId": "K20A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the haul rope to end the standoff at once",
          "failTitle": "Truth in the Water",
          "failText": "The rope parts, and with it go silver, records, and the best proof of the night's deeper crime. Holl may die or live, but the town loses what it most needed to face daylight honestly.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Force Holl to yield even if some proof is spoiled in the struggle",
          "nextNodeId": "K20B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K19B",
      "turn": 19,
      "title": "At the Winch Shaft - Narrow Trail",
      "narrative": [
        "The final distance to Holl is measured less in steps than in nerve. He has the winch at his back, a sword in hand, and enough room to threaten every man who comes within reach while kicking at the sacks and record bundle to remind you what may be lost with him.",
        "He sneers at Cenn's claims of justice and calls the papers a peddler's burden compared with hard silver. In that contempt lies a mercy of sorts, because it proves the records themselves still matter and have not yet been cast into the water below.",
        "Maelin's people hold the approaches, Hobb keeps the flank, and even the shaken captives begin to crowd the gallery mouth behind you. Holl is no longer master of the night, only its last hard knot."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Force Holl to yield even if some proof is spoiled in the struggle",
          "nextNodeId": "K20C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take Holl alive and keep the records out of the shaft",
          "nextNodeId": "K20A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the haul rope to end the standoff at once",
          "failTitle": "Truth in the Water",
          "failText": "The rope parts, and with it go silver, records, and the best proof of the night's deeper crime. Holl may die or live, but the town loses what it most needed to face daylight honestly.",
          "death": false
        }
      ]
    },
    {
      "id": "K19C",
      "turn": 19,
      "title": "At the Winch Shaft - Hard Pressed",
      "narrative": [
        "Holl looks almost relieved when he sees there is no road left but through you. Men like him often prefer the clean edge of one final contest to the slow shrinking of hope, and the shaft beside him offers a tempting answer to every honest claim laid against him.",
        "He curses Cenn, curses the town, curses Duke Aldric by name, and swears that records are just another sort of chain forged by powerful men after the strong have done the real taking. The speech is half spite and half shield, but it tells you enough: he would rather drown truth than stand before it.",
        "The chamber is crowded now with danger, witnesses, and all the unfinished consequences of the night. A single bold move might save everything or lose it, and the old hill seems to hold its breath with the rest of you."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the haul rope to end the standoff at once",
          "failTitle": "Truth in the Water",
          "failText": "The rope parts, and with it go silver, records, and the best proof of the night's deeper crime. Holl may die or live, but the town loses what it most needed to face daylight honestly.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Force Holl to yield even if some proof is spoiled in the struggle",
          "nextNodeId": "K20C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take Holl alive and keep the records out of the shaft",
          "nextNodeId": "K20B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K20A",
      "turn": 20,
      "title": "Dawn Over Oakenhurst - Clear Advantage",
      "narrative": [
        "Dawn comes gray through low rain, finding Saint Bryn's hill scarred but standing and Oakenhurst no longer frozen in old superstition. The captives are alive, the surviving ledgers are dried by chapel braziers, and the strongboxes sit under Maelin's seal while Sister Elswyth keeps account in a clear steady hand.",
        "Brother Cenn lives long enough to give names, dates, and the path by which he traced the buried ward, though whether that confession lightens him is hard to say. Brand Holl is beaten down to one last choice, and what becomes of him will set the final temper of the tale told after this morning.",
        "You stand with mud on your boots and night still in your bones, sworn as ever to Duke Aldric and to the quiet folk whose fears are rarely simple. The town waits not for a legend but for judgment, and judgment must now be made."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Settle for the safer account and close the matter quietly",
          "endStory": true,
          "endType": "low",
          "nextNodeId": null,
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let rage rule the last judgment",
          "failTitle": "A Bitter Morning",
          "failText": "Vengeance spoken in the heat of dawn turns the hill from hard-won rescue to fresh wrong. Oakenhurst remembers the ranger not as a shield but as another armed man who chose wrath over measure.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay out the whole truth and bind justice to mercy where you can",
          "endStory": true,
          "endType": "high",
          "nextNodeId": null,
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K20B",
      "turn": 20,
      "title": "Dawn Over Oakenhurst - Narrow Trail",
      "narrative": [
        "Morning reaches Oakenhurst after a night that has left every face older. The hill is secured, the bell silent, the captives counted, and the first work of truth has begun as Sister Elswyth and Maelin sort wet ledgers from ruined ones on chapel tables dragged near the fire.",
        "Brother Cenn's scheme lies in shards around that labor. Some of what he claimed appears true, some still uncertain, and all of it stained by the means he chose, while Holl's greed has left clearer wreck behind it than any sermon could excuse.",
        "You have enough in hand to decide whether this ending will be told as a clean settling, a narrow salvage, or a grief made tolerable only because worse was avoided. Not all victories sound alike when morning names their cost."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Lay out the whole truth and bind justice to mercy where you can",
          "endStory": true,
          "endType": "high",
          "nextNodeId": null,
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Settle for the safer account and close the matter quietly",
          "endStory": true,
          "endType": "low",
          "nextNodeId": null,
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let rage rule the last judgment",
          "failTitle": "A Bitter Morning",
          "failText": "Vengeance spoken in the heat of dawn turns the hill from hard-won rescue to fresh wrong. Oakenhurst remembers the ranger not as a shield but as another armed man who chose wrath over measure.",
          "death": false
        }
      ]
    },
    {
      "id": "K20C",
      "turn": 20,
      "title": "Dawn Over Oakenhurst - Hard Pressed",
      "narrative": [
        "Dawn does not heal the night, but it forces everyone to look at what remains. Men are bound in the chapel yard, freed workers wrapped in blankets, and wet pages from the lower ward are spread wherever heat can reach them while Maelin counts losses with a face gone nearly to stone.",
        "Brother Cenn has little strength left for defense and less for pride, and Holl's shadow still hangs over the hill whether he stands alive, wounded, or ready to make one final desperate break. The silver recovered is less than was promised, the records damaged but not wholly gone, and rumor already begins its work among the watching townsfolk.",
        "You have stopped the worst and earned the right to shape what comes next. That right is no bright thing. It is a burden placed in your hands at the end of mud, blood, old grief, and a long night's stubborn work."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let rage rule the last judgment",
          "failTitle": "A Bitter Morning",
          "failText": "Vengeance spoken in the heat of dawn turns the hill from hard-won rescue to fresh wrong. Oakenhurst remembers the ranger not as a shield but as another armed man who chose wrath over measure.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay out the whole truth and bind justice to mercy where you can",
          "endStory": true,
          "endType": "high",
          "nextNodeId": null,
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Settle for the safer account and close the matter quietly",
          "endStory": true,
          "endType": "low",
          "nextNodeId": null,
          "scoreDelta": 0
        }
      ]
    }
  ]
});
