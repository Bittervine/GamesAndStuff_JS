window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-last-orchard-wall",
  "title": "The Last Orchard Wall",
  "summary": "After weeks of rain split the ancient terrace walls above Fellapple, the ranger must read the failing hillside, rescue the orchard families, and help waller Bran Tey turn floodwater and falling earth away from the village before the last wall gives way.",
  "maxTurns": 20,
  "startNodeId": "Z01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "Fellapple wakes beneath a scarred but quiet hillside. The old relief channel carries clear water into the meadow, the lowest wall stands, and every missing villager answers the dawn roll. Sabeth Orr saves enough graft wood to renew the lost terraces, while Bran Tey sets the first stone of a safer orchard whose drains will never again be forgotten.",
    "low": "The last wall holds long enough for Fellapple to survive, though mud takes the south orchard, several cottages, and most of the stored harvest. No family is left beneath the slope. Through the lean winter, Bran Tey rebuilds the drains before the terraces, and Sabeth Orr shares the surviving grafts among every household that stayed to help."
  },
  "nodes": [
    {
      "id": "Z01A",
      "turn": 1,
      "title": "Rain Above Fellapple - The First Crack",
      "narrative": [
        "Three weeks of rain have turned the road into a brown stream when you ride Thorne into Fellapple. Orchard reeve Sabeth Orr meets you beneath the warning bell and points to a fresh white scar across the highest terrace wall.",
        "The village lies below seven shelves of apple trees, each held by dry stone older than Duke Aldric's hall. Water pours from joints that should breathe only a little, families are still carrying late fruit below, and Sabeth's young pruning apprentice Noll is somewhere uphill closing the head ditch.",
        "Bran Tey, the village waller, says the upper crack may settle when the rain eases. A deep sound rolls through the hill before he finishes, and three stones jump outward into the grass."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Climb with Bran and read the crack, springs, and leaning trees before moving anyone into the wrong ground.",
          "nextNodeId": "Z02A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order the families indoors and trust the ancient walls to outlast one more storm.",
          "failTitle": "The Hill Moves First",
          "failText": "The upper terrace folds before the warning bell can be rung. Cottages fill with mud while their doors are still barred against the rain.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ring the orchard bell and begin moving the nearest households to the stone chapel.",
          "nextNodeId": "Z02B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z01B",
      "turn": 1,
      "title": "Rain Above Fellapple - A Village Waking",
      "narrative": [
        "You reach Fellapple as Sabeth Orr is hauling on the warning bell with both hands. The sound carries badly through the rain, but doors open below the terraced orchard and frightened families look uphill.",
        "Bran Tey shows you water jetting through the highest wall. He has repaired frost damage there for forty years and has never seen the stones bulge so far without falling.",
        "The chapel stands on firm gravel beyond the stream, yet the lane to it crosses beneath two loaded terraces. Evacuation without knowledge of the slope could place the whole village in the path of the first slide."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the lowest cottages toward the chapel by the longer mill lane.",
          "nextNodeId": "Z02C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Sabeth count every household while you and Bran mark a safe lane outside the fall line.",
          "nextNodeId": "Z02B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call everyone into the orchard square directly beneath the bulging terrace.",
          "failTitle": "Gathered Under Stone",
          "failText": "The square becomes a trap when the wall sheds its outer face. Panic scatters the villagers through falling rock and branches.",
          "death": false
        }
      ]
    },
    {
      "id": "Z01C",
      "turn": 1,
      "title": "Rain Above Fellapple - Stones in the Lane",
      "narrative": [
        "Thorne shies at a loose stone rolling down Fellapple's main lane. Above the roofs, orchard walls step into the rain like dark ramparts, and the highest one has opened along half its length.",
        "Sabeth Orr has begun pulling children from the nearest cottages, while waller Bran Tey argues that the whole slope cannot be abandoned before the stored apples and winter tools are secured.",
        "Another pulse of muddy water pushes through the wall. The danger is not a single fallen stone but the weight of a soaked hillside searching for somewhere lower to go."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let every household return for tools and fruit before sounding a general warning.",
          "failTitle": "The Cost of One More Load",
          "failText": "People crowd the narrow lane as the first terrace fails, and loaded carts block the only clear retreat.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Clear the main lane first and send families downhill in small groups.",
          "nextNodeId": "Z02A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Divide the village into rescue and survey teams under Sabeth and Bran before the rain worsens.",
          "nextNodeId": "Z02C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z02A",
      "turn": 2,
      "title": "The Upper Shelf - Reading the Slope",
      "narrative": [
        "Your careful climb brings you above the crack without crossing the bulging face. Bran follows your route, and together you find grass laid flat by water where no surface stream ran yesterday.",
        "An uprooted apple tree has dammed the old head ditch at the orchard rim. The backed water has vanished into a seam of pale clay, feeding the terrace from behind instead of passing around it.",
        "The wall can be braced, but timber alone will not remove the hidden water. You must learn where the buried flow emerges before the next shelf takes its weight."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Probe the wet clay with pruning rods and mark the underground flow before cutting the dam.",
          "nextNodeId": "Z03A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hack through the tree dam at once and release the whole head ditch onto the cracked wall.",
          "failTitle": "A Sudden River",
          "failText": "The trapped water tears through the cut in one rush and carries the upper wall down with it.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Bran for shoring timber while you trace the ditch toward the next terrace.",
          "nextNodeId": "Z03B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z02B",
      "turn": 2,
      "title": "The Upper Shelf - The Safe Lane",
      "narrative": [
        "The household count and marked escape lane bring order to the first evacuation. Sabeth names one empty cottage, two stubborn elders, and her young pruning apprentice Noll, who was last seen carrying rope uphill.",
        "Bran reports that the head ditch has stopped running below an uprooted tree. Water is entering the slope somewhere above the crack, while a second wet line has appeared behind the cider store.",
        "The chapel route is safe for now. Finding Noll and keeping the line clear must be balanced against the chance to relieve the water before another wall begins to move."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Sabeth on the household count and search Noll's usual pruning paths.",
          "nextNodeId": "Z03C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow Noll's rope marks uphill while Bran tests the new seep behind the cider store.",
          "nextNodeId": "Z03B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume Noll has already reached the chapel and strike his name from the missing list.",
          "failTitle": "A Name Set Aside",
          "failText": "The apprentice remains alone above the crack, and the next movement of the hill cuts off every path to him.",
          "death": false
        }
      ]
    },
    {
      "id": "Z02C",
      "turn": 2,
      "title": "The Upper Shelf - Work in the Rain",
      "narrative": [
        "Your divided teams move quickly despite the confusion. Sabeth sends families by the mill lane, Bran gathers tools, and you find wagon ruts already filling with water beneath the lowest trees.",
        "The highest ditch is blocked by a fallen apple tree, but the ground below it is too soft for a direct approach. Noll's pruning rope disappears into that wet ground and does not return.",
        "Saving time now requires accepting risk without losing control. A hurried cut could free the water, while a delayed search could leave the apprentice beyond reach."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send unroped villagers across the soft shelf to drag the fallen tree aside.",
          "failTitle": "Hands in the Slump",
          "failText": "The clay gives beneath the first rescuers and draws them toward the opening crack faster than Bran can reach them.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle below the soft ground and study where the trapped water is pressing outward.",
          "nextNodeId": "Z03A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Anchor a rope team to the old pear trunks and follow Noll's line without loading the weak wall.",
          "nextNodeId": "Z03C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z03A",
      "turn": 3,
      "title": "Water Under Stone - The Pale Clay",
      "narrative": [
        "By probing the slope instead of cutting blindly, you trace the hidden water across the upper shelf. The rods sink deepest along a pale clay seam that bends toward the center terrace.",
        "Bran remembers an old drain mouth below that line, sealed during his grandfather's time when roots kept lifting its capstones. If it still exists, opening it could empty the hill without sending a flood through Fellapple.",
        "A section of turf sags under your boot, showing that the water has already hollowed a path. The drain must be found from below, where the wall is now shedding small stones."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark the clay seam, rope the approach, and search below for the forgotten drain mouth.",
          "nextNodeId": "Z04A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive a stake through the hollow turf to make a quick outlet.",
          "failTitle": "The Wrong Opening",
          "failText": "The stake breaks the clay seal. Water erupts beneath your feet and tears a fresh channel toward the cottages.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shore the sagging turf with hurdles before looking for the old masonry.",
          "nextNodeId": "Z04B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z03B",
      "turn": 3,
      "title": "Water Under Stone - Timber and Names",
      "narrative": [
        "The steadier route brings Bran's timber to the cider-store shelf while Sabeth keeps the evacuation moving. Noll is still missing, but a loop of his rope is found tied correctly around a pear trunk above the wet ground.",
        "Bran drives two braces against the wall and hears a hollow answer behind the stones. He believes an old drain lies there, though its mouth has been hidden by later repairs.",
        "The braces buy minutes rather than safety. You can open the suspected drain carefully, or keep strengthening a wall that water is already undermining."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Add a second row of braces and move the cider barrels off the shelf.",
          "nextNodeId": "Z04C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Bran's hollow sounding to uncover the drain cap without disturbing the loaded stones.",
          "nextNodeId": "Z04B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull the hollow stones free with a wagon chain from directly below them.",
          "failTitle": "Under the Wall",
          "failText": "The chain opens more than a drain. A loaded section of wall comes forward onto the workers beneath it.",
          "death": true
        }
      ]
    },
    {
      "id": "Z03C",
      "turn": 3,
      "title": "Water Under Stone - Noll's Rope",
      "narrative": [
        "The urgent search follows Noll's rope around the soft shelf. You find him clinging to a low branch beyond a narrow slump, soaked and frightened but able to answer.",
        "He says he saw water vanish beside an old carved stone before the ground moved. The stone lies below him, half hidden by roots, and its mark resembles a downward-pointing spade.",
        "The apprentice can be hauled back first, or the rope can be used to reach the carved marker while the route still holds. Neither task permits careless weight on the clay."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell Noll to run across the sagging ground before the gap widens.",
          "failTitle": "The Shortest Way",
          "failText": "His first stride breaks the crust, and both branch and boy drop into the moving clay beyond easy reach.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Haul Noll to firm ground and leave the carved stone until more rope arrives.",
          "nextNodeId": "Z04A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Rig a sliding loop for Noll, then use his anchored line to inspect the marked stone safely.",
          "nextNodeId": "Z04C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z04A",
      "turn": 4,
      "title": "The Buried Mouth - A Careful Opening",
      "narrative": [
        "Your marked route leads to a low arch hidden behind nettles and repair stone. The forgotten drain mouth is packed with black roots, silt, and fragments of old wooden grating.",
        "A thin stream begins when you loosen the outer debris, but the water behind it groans through the wall like a millrace behind a gate. Bran warns that pulling the plug whole would strike the next terrace with terrible force.",
        "The drain must be opened in stages while its outflow is carried away. There is no prepared channel below, only orchard rows, a cart track, and a shallow swale toward the meadow."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut a bypass trench to the meadow swale before widening the drain by hand.",
          "nextNodeId": "Z05A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hook all the roots to Thorne and pull the blockage free in one effort.",
          "failTitle": "The Plug Comes Away",
          "failText": "The horse clears the roots, but the released water smashes through the unprepared orchard rows and starts a second slide.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open a hand-wide gap and post watchers along the wall while it drains.",
          "nextNodeId": "Z05B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z04B",
      "turn": 4,
      "title": "The Buried Mouth - Braced Stone",
      "narrative": [
        "The shored approach keeps the wall steady while Bran removes its patched outer stones. Behind them, an older arch appears with a root-bound drain no living villager remembers using.",
        "Water beads through the roots and carries pale clay with it. The braces tremble each time the hidden chamber fills and settles, proving that the wall is holding back more than wet soil.",
        "Bran can control the masonry if someone gives the water a safe destination. Sabeth has spare hands below, but most are still moving households and winter food."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Bran on the arch and borrow six villagers to deepen the nearest orchard ditch.",
          "nextNodeId": "Z05C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay hurdles as a lined runnel to the meadow while Bran opens the drain one root at a time.",
          "nextNodeId": "Z05B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the evacuation team and bring every able hand beneath the shaking arch.",
          "failTitle": "Too Many Under Stone",
          "failText": "A brace slips in the crowded work. There is no room to retreat when the arch drops its capstones.",
          "death": false
        }
      ]
    },
    {
      "id": "Z04C",
      "turn": 4,
      "title": "The Buried Mouth - The Spade Mark",
      "narrative": [
        "Noll's carved stone proves to be the head of an old drain arch. Once he is safe, you clear leaves from the spade mark and find a second groove pointing across the terrace rather than downhill.",
        "Bran recognizes the groove as a waller's instruction: carry the water sideways to open ground. Later repairs buried the old course beneath an apple row and a cart turning place.",
        "The route can be recovered, but digging through soaked ground may weaken the trees above it. The alternative is a shorter drop that points directly toward occupied cottages."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the short downhill route and trust the cottages to shed the water.",
          "failTitle": "Water at the Doors",
          "failText": "The released flow strikes the houses like a burst pond, trapping the last families against their own walls.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Trace the sideways groove with shallow test cuts before committing workers.",
          "nextNodeId": "Z05A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move the vulnerable trees with rope supports and reopen the old cross-slope channel.",
          "nextNodeId": "Z05C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z05A",
      "turn": 5,
      "title": "The Water's Road - Meadow Channel",
      "narrative": [
        "Your bypass reaches the meadow swale before the drain is widened. Muddy water runs away from the terrace in a controlled ribbon, and the highest wall stops shedding stones for the first time since your arrival.",
        "The relief exposes a worse truth lower down: water is rising behind the third wall, far from the blocked head ditch. Bran says the old drains must have joined beneath the orchard and failed together.",
        "A single repaired mouth will not save Fellapple. The buried drainage line must be followed through terraces already carrying cottages, stores, and the weight of the harvest."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the change in water color to map where the joined drains pass under each wall.",
          "nextNodeId": "Z06A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare the upper shelf safe and send the evacuated families back for their belongings.",
          "failTitle": "Safety Too Soon",
          "failText": "The lower drain backs up without warning, and returning families meet the next failure in the narrow orchard lane.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the meadow channel clear while Bran inspects the third wall from firm ground.",
          "nextNodeId": "Z06B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z05B",
      "turn": 5,
      "title": "The Water's Road - A Measured Release",
      "narrative": [
        "The narrow opening lowers the pressure without breaking the wall. Watchers pass each change down the slope, and Sabeth shifts the evacuation whenever a new seep appears.",
        "One watcher reports clear water at the upper drain but red-brown water beneath the cider store. Bran takes this as proof that a second buried branch is scouring clay from the heart of the hill.",
        "The village has gained time, though no one knows how much. Finding the second branch means working near the loaded third terrace while rain continues to feed it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Extend the watch line and test every visible seep for clay before digging.",
          "nextNodeId": "Z06C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the colored flows and sound the wall where the hidden branch should cross.",
          "nextNodeId": "Z06B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Block the red seep with sacks so the clay cannot escape.",
          "failTitle": "Pressure Sealed In",
          "failText": "The sacks hide the warning and force the trapped water toward the wall's weakest joint.",
          "death": false
        }
      ]
    },
    {
      "id": "Z05C",
      "turn": 5,
      "title": "The Water's Road - The Old Course",
      "narrative": [
        "The reopened cross-slope channel carries the first release safely between the apple rows. Its stone bed continues beyond the visible ditch and disappears beneath a later terrace wall.",
        "Noll remembers a place lower down where snow always melted first. Bran realizes the buried course may still carry water there, but without an open mouth it would be filling the slope from within.",
        "The clue lies near the cider store, where barrels, tools, and two frightened families remain. They must be moved without loading the very ground you need to examine."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Roll the full cider barrels downhill across the suspected drain line.",
          "failTitle": "Weight on the Hollow",
          "failText": "A barrel breaks through the softened cover, and the others follow it into a widening collapse.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Empty the cider into the gutter and move the families before searching beneath the store.",
          "nextNodeId": "Z06A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use skids and hand lines to clear the store while keeping every wheel off Noll's warm-ground clue.",
          "nextNodeId": "Z06C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z06A",
      "turn": 6,
      "title": "Beneath the Cider Store - Mapping the Branch",
      "narrative": [
        "Your map of colored water places the hidden branch beneath the cider store's uphill corner. Once the floor is lifted, you find rounded drain stones under a layer of newer clay.",
        "The stones have not been smashed or tampered with. Fine roots from the old orchard have knitted through every gap until leaves and silt formed a solid plug behind them.",
        "Clearing it from above would drop the store floor into the channel. Bran proposes opening the wall below instead, but that face now supports a loaded track used by the evacuation carts."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Close the cart track, shore the store corner, and open the drain from its lower face.",
          "nextNodeId": "Z07A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut through the store floor and stand over the plug while prying it loose.",
          "failTitle": "The Floor Becomes a Sluice",
          "failText": "The plug releases upward, taking the floor and everyone upon it into the drain trench.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Unload the track and begin a narrow inspection trench beside the store.",
          "nextNodeId": "Z07B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z06B",
      "turn": 6,
      "title": "Beneath the Cider Store - Hollow Stone",
      "narrative": [
        "Bran's sounding hammer finds a hollow run beneath the third wall. The red seep pulses after every gust of rain, and each pulse leaves another pinch of orchard clay on the grass.",
        "A cart loaded with flour waits on the track above because its driver fears the mill lane. Moving it is necessary, but the horses are already nervous and the turn is tight.",
        "Thorne stands steady beside you, accustomed to bad ground and shouted work. Used carefully, he can help unload the track without adding a runaway wagon to the danger."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the flour sacks by hand and leave the empty cart chocked above the turn.",
          "nextNodeId": "Z07C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Thorne as a calm lead horse and walk the lightened cart back onto firm ground.",
          "nextNodeId": "Z07B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Whip the frightened team around the narrow turn before the wall worsens.",
          "failTitle": "Wheels on the Edge",
          "failText": "The team bolts, the cart strikes the wall, and a whole course of stone spills into the hidden drain.",
          "death": false
        }
      ]
    },
    {
      "id": "Z06C",
      "turn": 6,
      "title": "Beneath the Cider Store - The Warm Ground",
      "narrative": [
        "Keeping wheels away from the warm-ground clue preserves the thin cover over the old drain. When the store is clear, steam-like mist rises where cold rain meets water moving beneath the clay.",
        "Noll finds a loose capstone, but Bran stops him before he lifts it. The stone is carrying part of the store corner and may also be the only thing holding back the plugged branch.",
        "A safe opening requires support below and room above. The villagers can provide both if they are drawn from harvest rescue, which will leave more winter food exposed to the storm."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Noll lift the capstone alone while the waller fetches tools.",
          "failTitle": "The Lesson Given Too Late",
          "failText": "The stone turns under the apprentice's hands and opens a deep, fast hollow beneath him.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Fence the capstone and move the remaining food before beginning the drain work.",
          "nextNodeId": "Z07A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Call a short, roped work party to brace below while Bran eases the capstone free.",
          "nextNodeId": "Z07C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z07A",
      "turn": 7,
      "title": "Fruit and Foundations - The Closed Track",
      "narrative": [
        "Closing the track gives Bran room to expose the drain face without carts passing overhead. The roots are thick, but water begins to thread through as he cuts them back from the outside.",
        "Sabeth arrives with a harder question. Hundreds of baskets remain in the upper store, and the mill lane cannot carry both the harvest wagons and every household before dark.",
        "Fruit can be replaced in years; graft wood, seed stock, medicine, and people cannot. The village needs an order of rescue that no frightened family will mistake for favoritism."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Publish a rescue order of people, medicines, graft wood, seed, tools, then market fruit.",
          "nextNodeId": "Z08A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let each household save whatever it values most without controlling the lane.",
          "failTitle": "Every Cart at Once",
          "failText": "Private wagons jam the mill lane, and the rescue teams cannot reach the next cottage when the slope shifts.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Save the families and seed stock first, leaving Sabeth to choose among the remaining stores.",
          "nextNodeId": "Z08B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z07B",
      "turn": 7,
      "title": "Fruit and Foundations - A Steady Horse",
      "narrative": [
        "Thorne leads the flour cart clear without a wheel touching the hollow ground. The watching teamsters settle, and Sabeth uses the calm moment to start the remaining wagons down one at a time.",
        "Bran opens a hand-wide gap in the second drain. The flow is promising, yet the track must stay empty until its foundations stop trembling.",
        "The upper store still holds most of Fellapple's late harvest. Moving all of it would cost the hours the drainage work has bought."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Assign one wagon to seed and graft wood, then keep the track empty for Bran.",
          "nextNodeId": "Z08C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pair each evacuation cart with a rescue list so no load delays a waiting household.",
          "nextNodeId": "Z08B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Reopen the weak track to harvest wagons because the first cart crossed safely.",
          "failTitle": "The Second Crossing",
          "failText": "Repeated wheels find the hollow that one careful passage spared, collapsing the track onto the drain crew.",
          "death": false
        }
      ]
    },
    {
      "id": "Z07C",
      "turn": 7,
      "title": "Fruit and Foundations - Hands Divided",
      "narrative": [
        "The roped work party frees the capstone and survives the first hard gush. Clear water becomes red, then clear again as the buried branch begins to empty.",
        "Half the village cheers, but Sabeth points uphill where the exposed harvest darkens in the rain. Saving it would protect Fellapple from hunger; leaving the drainage crew short could cost the village itself.",
        "Bran needs only six steady workers. The argument is over who can be spared and which goods truly matter once winter closes the roads."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Bran's whole crew uphill to save every basket before the fruit spoils.",
          "failTitle": "The Drain Unwatched",
          "failText": "Roots shift in the unattended opening and seal it again while water continues rising behind the wall.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the drain crew intact and abandon all stores above the third terrace.",
          "nextNodeId": "Z08A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep six at the drain and send the remaining hands for graft wood, seed, medicine, and flour.",
          "nextNodeId": "Z08C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z08A",
      "turn": 8,
      "title": "Cribwork - The Ordered Rescue",
      "narrative": [
        "The public rescue order ends the quarrel over carts. Medicines and graft bundles go first, and even families losing market fruit can see the same rule applied to every door.",
        "Bran uses the cleared track to build timber cribs against the third wall. They will not hold a full landslide, but they can keep the stone face upright while the drain lowers the water behind it.",
        "The crib feet must rest on firm gravel. One promising patch lies close to the drain outflow, where digging could either reveal the foundation or cut the water's new escape."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test each crib footing with an iron rod and bridge the drain with a stone lintel.",
          "nextNodeId": "Z09A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set every timber foot in the softest ground because it is easiest to dig.",
          "failTitle": "Braces Without Footing",
          "failText": "The cribs sink together when the wall leans, adding their weight to the stones they were meant to hold.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place fewer cribs on known gravel and leave the uncertain section unsupported.",
          "nextNodeId": "Z09B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z08B",
      "turn": 8,
      "title": "Cribwork - The Narrow Lane",
      "narrative": [
        "The controlled wagon line clears another row of cottages while preserving Bran's work space. Sabeth records each departure and sends empty carts back by the meadow rather than against the flow.",
        "Timber cribs rise along the third wall, but there are too few squared beams for its full length. The cider-store roof can supply more if dismantled, though men on that roof would stand beneath the next terrace.",
        "Bran can reinforce the wall's worst bulge or spread lighter support across every weak place. Either choice must leave a clear lane for the last households."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Spread the remaining braces evenly and keep the escape lane untouched.",
          "nextNodeId": "Z09C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Strip the cleared store from the safe side and double-brace the measured bulge.",
          "nextNodeId": "Z09B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Park loaded wagons against the wall as makeshift supports.",
          "failTitle": "A Wall of Wheels",
          "failText": "The wall pushes the wagons sideways and seals the lane just as the upper cottages begin to empty.",
          "death": false
        }
      ]
    },
    {
      "id": "Z08C",
      "turn": 8,
      "title": "Cribwork - Six at the Drain",
      "narrative": [
        "Six workers remain with Bran, exactly as promised, while the others carry the irreplaceable stores downhill. Their discipline keeps the drain open and the frightened village from splitting into private rescues.",
        "A fresh crack appears behind the work party, running between two crib sites. It is narrow, but muddy bubbles rise from it whenever the drain mouth chokes on leaves.",
        "Someone must keep the outflow clear while the others bridge the crack. The rain is now strong enough to sweep loose tools and cut branches back into the mouth."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stand all six workers on the crack so their weight keeps it closed.",
          "failTitle": "Weight on a Warning",
          "failText": "The crust gives beneath the gathered crew, dropping them into the waterlogged foundation trench.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post two workers at the drain and build a light crib on either side of the crack.",
          "nextNodeId": "Z09A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Stretch a leaf screen upstream and span the crack with paired timbers on firm stone.",
          "nextNodeId": "Z09C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z09A",
      "turn": 9,
      "title": "The Second Rain - Water Measured",
      "narrative": [
        "Your tested footings hold when the wind turns and a second curtain of rain crosses the valley. Water drums on the lintel above the drain instead of washing soil from beneath the crib.",
        "Sabeth's watchers report that the upper wall has stopped bulging, but the fourth terrace is moving outward by the width of a finger. Its drain gives no water at all.",
        "The failure is descending through the orchard one blocked branch at a time. Before you can reach the fourth wall, the warning bell sounds twice: the signal for people trapped."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send Bran to locate the fourth drain while you follow the two-bell rescue signal.",
          "nextNodeId": "Z10A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the rescue bell and keep polishing the cribwork that already holds.",
          "failTitle": "Two Bells Unanswered",
          "failText": "The trapped household loses its last safe exit while workers continue strengthening a wall no longer in immediate danger.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Move the whole crib crew toward the bell and leave a watcher at the drain.",
          "nextNodeId": "Z10B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z09B",
      "turn": 9,
      "title": "The Second Rain - The Braced Bulge",
      "narrative": [
        "The doubled cribs take the first lean of the wall and settle hard into their gravel feet. Bran says the support has bought an hour, perhaps two, if the water keeps falling.",
        "Then the new rain arrives, colder and heavier. A runner from Sabeth reports two elders trapped in the orchard house above the fourth terrace, where a fallen pear has blocked the door.",
        "The rescue route crosses a wall with no working drain. Bran can search for its mouth while you approach from above, but the easier lane below lies directly in the fall line."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Approach the orchard house from above with ropes and keep the main lane closed.",
          "nextNodeId": "Z10C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Bran sound for the drain while you cut a roped path along the stable terrace edge.",
          "nextNodeId": "Z10B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Lead the rescue party up the open lane beneath the unsupported wall.",
          "failTitle": "The Easy Lane",
          "failText": "The fourth wall sheds stone across the rescue route, cutting off rescuers and household together.",
          "death": false
        }
      ]
    },
    {
      "id": "Z09C",
      "turn": 9,
      "title": "The Second Rain - Leaves Against the Screen",
      "narrative": [
        "The leaf screen catches a dark mat of twigs as the second rain begins. Because the drain remains open, the bridged crack widens slowly instead of breaking beneath the crew.",
        "A two-bell alarm rings from the orchard house. Sabeth says two elders are inside, and the nearest pear tree has fallen across their door and chimney.",
        "The screened drain cannot be abandoned for long. Noll knows the roof path to the house, while Thorne can carry rope and tools by a firmer route around the terrace end."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Noll alone over the wet roof with an axe and no safety line.",
          "failTitle": "A Slippery Errand",
          "failText": "The apprentice reaches the trapped house but falls where neither the elders nor the drain crew can help him.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Thorne around the terrace end and reach the house with heavy tools.",
          "nextNodeId": "Z10A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave a pair at the screen and lead Noll by a roof line while Thorne brings tools below.",
          "nextNodeId": "Z10C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z10A",
      "turn": 10,
      "title": "The Orchard House - Split Duties",
      "narrative": [
        "Dividing the work keeps Bran on the hidden drains while you reach the orchard house. The fallen pear has pinned the door inward, and smoke from a banked hearth is collecting under the damaged roof.",
        "The elders answer from the pantry, unhurt but unable to cross the main room. The uphill wall behind the house leaks a steady ribbon through its mortarless stones.",
        "Cutting the trunk may free the door but shift the roots against the wall. A roof opening is slower, yet it avoids disturbing the loaded ground beside the house."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Vent the roof first, then lower a ladder into the pantry without moving the pear roots.",
          "nextNodeId": "Z11A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the fallen branches so they burn away from the doorway.",
          "failTitle": "Smoke Under a Broken Roof",
          "failText": "Wet wood fills the trapped house with thick smoke long before it clears the door.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Trim the crown lightly and pry a narrow passage beside the pinned door.",
          "nextNodeId": "Z11B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z10B",
      "turn": 10,
      "title": "The Orchard House - The Stable Edge",
      "narrative": [
        "The stable-edge path brings you beside the orchard house without crossing the wall's face. Bran's hammer sounds below, searching for a drain as the trapped elders call through the shutter.",
        "The fallen pear can be rolled only if its crown is lightened. Every cut shakes rain and broken tile from the roof, while the roots lift a small wedge of terrace behind the kitchen.",
        "Sabeth has brought a broad pruning saw and blankets. The rescue can proceed quietly from the window, or quickly through the blocked door."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Widen the shutter opening and bring each elder out wrapped against the rain.",
          "nextNodeId": "Z11C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Brace the lifted root plate, trim the crown, and open a protected gap beside the door.",
          "nextNodeId": "Z11B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Harness Thorne to the whole pear and drag it downhill across the weak terrace.",
          "failTitle": "Tree and Terrace Together",
          "failText": "The roots tear free with a slab of soaked ground, carrying the house corner toward the wall.",
          "death": false
        }
      ]
    },
    {
      "id": "Z10C",
      "turn": 10,
      "title": "The Orchard House - Two Routes",
      "narrative": [
        "Noll's roof line and Thorne's lower route meet at the trapped house from opposite sides. The elders wave from a pantry window while smoke curls from broken tiles above them.",
        "The apprentice can reach the roof ridge, but the wet thatch will not bear two people. Below, Thorne stands on firm gravel with enough rope to steady a ladder and haul tools.",
        "The fourth wall gives a low click behind the kitchen. The sound is small, yet every stoneworker in Fellapple has learned to fear such quiet changes."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Crowd the whole rescue party onto the roof before the wall clicks again.",
          "failTitle": "Too Much on the Thatch",
          "failText": "The soaked roof folds into the smoky room, closing the cleanest route to the trapped elders.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Anchor the ladder to Thorne and bring the elders out through the pantry window.",
          "nextNodeId": "Z11A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Noll's high line to vent the smoke while the anchored ladder carries both elders to firm ground.",
          "nextNodeId": "Z11C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z11A",
      "turn": 11,
      "title": "Thorne in the Mud - The Anchored Ladder",
      "narrative": [
        "The elders come down safely, and the ladder line remains tied to Thorne when the terrace gives a sudden sideways lurch. The horse plants himself and keeps the last rescuer from sliding against the house.",
        "The movement opens a shallow trough beside the wall. In its bottom lies a row of flat stones unlike the drain arches above, each marked with a small chisel notch.",
        "Bran arrives breathless and calls them guide stones from the orchard's first builders. They seem to point toward the unplanted south meadow, but one lies beneath Thorne's sinking hind foot."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Shift Thorne onto a hurdle mat, then uncover the guide stones without breaking their line.",
          "nextNodeId": "Z12A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Spur Thorne straight uphill across the soft trough before he sinks farther.",
          "failTitle": "The Horse's Weight",
          "failText": "His leap breaks the thin crust over the channel and drops horse and rider into the rushing mud.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead Thorne back by the ladder rope and mark the stones for later study.",
          "nextNodeId": "Z12B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z11B",
      "turn": 11,
      "title": "Thorne in the Mud - The Root Plate",
      "narrative": [
        "The braced root plate holds until the elders are clear, then settles into the terrace with a heavy sigh. Thorne carries blankets and tools away while you walk beside his head through deepening mud.",
        "His forehoof strikes a flat buried stone. Bran washes it with rainwater and finds a waller's notch aimed across the slope, matching the mark above the first drain.",
        "More stones may reveal a relief route older than the orchard house. Following them means crossing a wet hollow that will not safely bear a mounted horse."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Stable Thorne on gravel and follow the notches on foot with a sounding rod.",
          "nextNodeId": "Z12C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lay pruning hurdles over the hollow and expose each marked stone in order.",
          "nextNodeId": "Z12B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne along the buried line so his hooves locate every hollow place.",
          "failTitle": "A Living Sounding Weight",
          "failText": "The method finds the old channel only when the horse breaks through its rotten stone cover.",
          "death": false
        }
      ]
    },
    {
      "id": "Z11C",
      "turn": 11,
      "title": "Thorne in the Mud - A Horse's Warning",
      "narrative": [
        "The two-route rescue succeeds, but Thorne refuses the direct path away from the house. He turns his head toward the south meadow and paws once at a strip of firmer, stony ground.",
        "Beneath the washed grass you find a sequence of chisel-marked slabs. Noll says the line has always been called the dead furrow because no apple tree thrives over it.",
        "Bran believes the furrow covers a broad relief channel meant for a failure larger than any single drain. Its lower end has vanished beneath a later wall and a stand of thorn."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Force Thorne down the path he refuses and ignore the dead furrow.",
          "failTitle": "The Warning Underfoot",
          "failText": "The direct path collapses beneath the horse and severs the rescue line behind him.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the dead furrow toward the meadow and flag every marked slab.",
          "nextNodeId": "Z12A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Noll trace the tree failures while Bran follows the stones to their buried outlet.",
          "nextNodeId": "Z12C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z12A",
      "turn": 12,
      "title": "The Waller's Mark - A Forgotten Relief",
      "narrative": [
        "The preserved line of guide stones leads to a broad stone throat buried beneath the fifth terrace. Unlike the smaller drains, it is dry and deliberately sealed by a fitted wall of light stones.",
        "Bran recognizes the design from old hill farms: a relief cut meant to be opened when the whole slope became waterlogged. The south meadow beyond it is empty, but the channel crosses a valuable row of winter pears.",
        "No saboteur closed this outlet. Later generations simply planted over a safeguard whose purpose they forgot. Opening it may save Fellapple by sacrificing the southern orchard."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Survey the full relief line and clear the meadow before touching its fitted seal.",
          "nextNodeId": "Z13A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Bran of hiding the outlet and remove him from the work.",
          "failTitle": "The Only Waller Sent Away",
          "failText": "Suspicion wastes the hour and deprives the village of the one person who understands how the fitted stones should open.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Begin clearing thorn from the outlet while Sabeth warns the meadow workers.",
          "nextNodeId": "Z13B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z12B",
      "turn": 12,
      "title": "The Waller's Mark - Slabs in Order",
      "narrative": [
        "Exposing the slabs in order reveals a complete cross-slope channel under the dead furrow. At the fifth wall it ends behind pale fitted stones much lighter than the retaining blocks around them.",
        "Bran admits he repaired around those stones years ago without understanding them. Their chisel marks show a sequence for dismantling the seal from the meadow side.",
        "The discovery brings relief and grief together. Sabeth's best winter pears stand in the intended flood path, and opening the channel will uproot them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Give Sabeth time to cut graft wood while Bran prepares the meadow-side opening.",
          "nextNodeId": "Z13C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the removal sequence, clear people and livestock, then harvest grafts nearest the channel.",
          "nextNodeId": "Z13B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the relief sealed because the pear row is too valuable to lose.",
          "failTitle": "Fruit Before Foundations",
          "failText": "The orchard remains whole only until the saturated fifth wall carries it toward the village.",
          "death": false
        }
      ]
    },
    {
      "id": "Z12C",
      "turn": 12,
      "title": "The Waller's Mark - The Dead Furrow",
      "narrative": [
        "The tree failures and marked stones agree: the dead furrow hides a relief channel running into the south meadow. Bran finds its seal beneath thorn roots at the fifth wall.",
        "Noll notices numbers cut beside the spade mark, not dates but an order for lifting the fitted stones. The first builders expected the outlet to be used without bringing down the wall around it.",
        "Rainwater is already seeping around the seal. The village can open the old safeguard deliberately, or wait for pressure to choose a rougher opening."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Hammer through the center stone from the uphill side.",
          "failTitle": "The Seal Struck Backward",
          "failText": "The pressure throws the broken stone outward and turns the narrow opening into an uncontrolled breach.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Clear the meadow end and let Bran study Noll's numbered sequence.",
          "nextNodeId": "Z13A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the sequence, brace the surrounding wall, and prepare ropes for each fitted stone.",
          "nextNodeId": "Z13C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z13A",
      "turn": 13,
      "title": "Opening the Relief - Meadow First",
      "narrative": [
        "Your survey finds the old channel ending in a shallow basin at the meadow edge. Two hay wagons and a flock of geese are moved before Bran allows anyone near the fitted seal.",
        "The first numbered stone comes free with a rope from safe ground. Only a trickle follows, showing that roots or fallen masonry block the channel farther uphill.",
        "The outlet is prepared, but the hidden obstruction must be cleared from inspection pits along the dead furrow. Darkness is less than two hours away."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Open every marked inspection pit from below upward and keep workers roped in pairs.",
          "nextNodeId": "Z14A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Crawl into the narrow relief throat alone to find the blockage faster.",
          "failTitle": "Inside the Old Channel",
          "failText": "A shift of roots closes the throat behind you as water begins rising from the orchard side.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Clear the lowest two pits before dark and post a night watch on the seal.",
          "nextNodeId": "Z14B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z13B",
      "turn": 13,
      "title": "Opening the Relief - Thorn and Grafts",
      "narrative": [
        "The meadow workers clear the thorn while Sabeth cuts grafts from the doomed pear row. Bundles of living wood go downhill even as Bran exposes the numbered seal behind them.",
        "The first stones release little water. A blockage remains somewhere under the dead furrow, and the ground above it has begun to rise in a soft ridge.",
        "Workers are tired, but the old inspection pits can still be found by their flat caps. Opening them in rain and fading light demands strict spacing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Open one inspection pit at a time and stop work when the light fails.",
          "nextNodeId": "Z14C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set lanterns on firm posts, rope each pair, and clear the pits from the outlet upward.",
          "nextNodeId": "Z14B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Put the whole crew on the raised ridge and dig wherever the ground looks softest.",
          "failTitle": "The Ridge Opens",
          "failText": "The crowded ridge collapses into the channel and adds tools, soil, and workers to the blockage.",
          "death": false
        }
      ]
    },
    {
      "id": "Z13C",
      "turn": 13,
      "title": "Opening the Relief - Stones by Number",
      "narrative": [
        "Bran follows the copied sequence and draws the fitted stones one by one. The surrounding wall stays quiet, yet the relief channel gives only a weak brown thread.",
        "Noll finds the first inspection cap beneath moss, followed by another beneath the pear roots. The second cap jumps slightly each time pressure pulses through the hill.",
        "The jumping stone marks the likely blockage. It can be lifted with a remote line, provided the crew first clears the path between it and the open meadow."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stand on the jumping cap and pry it up between your boots.",
          "failTitle": "Over the Pressure",
          "failText": "The cap leaves its seat like a thrown shield, followed by mud and stone from the trapped channel.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Clear the lower pit and trench before disturbing the jumping cap.",
          "nextNodeId": "Z14A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Run a rope through the cap ring and lift it from behind a braced pear trunk.",
          "nextNodeId": "Z14C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z14A",
      "turn": 14,
      "title": "Night on the Terraces - Roped Pairs",
      "narrative": [
        "Working from below keeps each opened pit from draining onto the next crew. Roots and silt come out in baskets, and the relief flow grows from a thread to a steady stream.",
        "Night closes around the lantern posts. Above them, Sabeth's watchers call that the fifth wall has begun leaning, though its stones have not yet separated.",
        "The channel needs one more pit cleared, while the wall needs people moved beyond its reach. There are enough hands for both only if the teams keep their discipline in darkness."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Rotate fresh pairs into the last pit and send the tired crew to extend the safety cordon.",
          "nextNodeId": "Z15A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Extinguish the lanterns so frightened villagers cannot see the leaning wall.",
          "failTitle": "Darkness Without Warning",
          "failText": "Workers lose the marked safe paths, and the first fallen stones find people who never saw them coming.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stop digging and move every worker below the meadow boundary before the wall leans farther.",
          "nextNodeId": "Z15B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z14B",
      "turn": 14,
      "title": "Night on the Terraces - Lantern Posts",
      "narrative": [
        "The fixed lanterns hold a clear line through the rain. Bran's teams empty two inspection pits, while Sabeth walks the cordon and answers every household name from her slate.",
        "At the highest open pit, the relief water suddenly stops. A mass of pear roots has shifted into the channel, and the fifth wall answers with a long scrape of stone.",
        "Cutting the roots may restore the flow but release the wall above them. The crew must work from cover and know exactly where to retreat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Build a hurdle shield below the pit and cut only the roots visible from safety.",
          "nextNodeId": "Z15C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Rig the root mass to a meadow-side capstan and clear it with everyone outside the fall line.",
          "nextNodeId": "Z15B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Noll into the pit because he is smallest and quickest with a pruning knife.",
          "failTitle": "The Narrow Pit",
          "failText": "The roots shift around the apprentice, pinning him where the wall's next movement will strike.",
          "death": false
        }
      ]
    },
    {
      "id": "Z14C",
      "turn": 14,
      "title": "Night on the Terraces - The Jumping Cap",
      "narrative": [
        "The remote line lifts the jumping cap without exposing the crew. Mud bursts upward, then falls into the cleared lower channel and races toward the meadow.",
        "For several breaths the slope seems to settle. Then a watcher lantern swings three times from the fifth wall: the agreed warning that its face is separating.",
        "Bran says the wall may fall whether the relief runs or not. The task has changed from preventing all movement to deciding where the moving earth can safely spend its force."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Order the crew to push the separating stones back by hand.",
          "failTitle": "Hands Against a Hillside",
          "failText": "The wall advances as one weight, brushing aside the people placed directly before it.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Withdraw to the meadow and watch how the first stones move before acting.",
          "nextNodeId": "Z15A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the relief seal fully and cut marker lines showing the slide a path into empty ground.",
          "nextNodeId": "Z15C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z15A",
      "turn": 15,
      "title": "When the Fifth Wall Falls - Watching the First Stones",
      "narrative": [
        "The ordered withdrawal leaves the fifth terrace empty when its first face stones tumble. Because the relief channel is running, the collapse begins as separate falls rather than one solid wave.",
        "You read the direction from rolling apples, bent grass, and the tilt of the remaining courses. Most of the soil is turning toward the south pears, but one tongue points down the occupied mill lane.",
        "Noll waits by the warning bell for your signal. A small cut through the pear row could catch the stray flow, though making it requires workers near a moving edge."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ring the full retreat, then cut the diversion from its meadow end with long-handled tools.",
          "nextNodeId": "Z16A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send villagers onto the falling wall to carry away its loosened stones.",
          "failTitle": "Salvage During the Fall",
          "failText": "The remaining courses roll while hands are still among them, turning useful stone into a deadly burden.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Block the mill lane with empty carts and keep everyone behind the lower cordon.",
          "nextNodeId": "Z16B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z15B",
      "turn": 15,
      "title": "When the Fifth Wall Falls - The Root Mass",
      "narrative": [
        "The capstan tears the pear roots from the relief channel, and water surges cleanly toward the meadow. Seconds later the fifth wall lowers itself in a roar of stone and soaked earth.",
        "The cleared channel takes the center of the slide, but broken tree crowns catch along its edge. Each snag turns part of the flow back toward Fellapple.",
        "Bran has billhooks and ropes ready beyond the fall line. The snags can be pulled sideways if each line is set before the moving mud reaches it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Pull the nearest tree crown clear and abandon the higher snags.",
          "nextNodeId": "Z16C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set staggered ropes from firm pear trunks and peel each snag toward the meadow.",
          "nextNodeId": "Z16B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne into the channel and drag the largest crown from its center.",
          "failTitle": "Horse in the Flow",
          "failText": "The mud reaches Thorne's chest before the rope tightens, leaving neither horse nor rider footing to pull.",
          "death": true
        }
      ]
    },
    {
      "id": "Z15C",
      "turn": 15,
      "title": "When the Fifth Wall Falls - The Marked Path",
      "narrative": [
        "The fully opened seal gives the hillside a path, and your marker lines keep the waiting crews away from it. The fifth wall breaks just uphill of the south pears and folds into the relief channel.",
        "For a moment the plan works perfectly. Then a buried stump rolls crosswise and splits the moving mud, sending a narrow branch toward the mill lane and the lower cottages.",
        "The main slide cannot be stopped. The smaller branch can still be turned with a quick breach through an empty orchard bank."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stand in the mud branch and try to lever the buried stump aside.",
          "failTitle": "No Footing for a Lever",
          "failText": "The stump turns under the pole and carries you down with the flow it was dividing.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the lower cordon and let the branch spend itself against the empty carts.",
          "nextNodeId": "Z16A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the empty bank from firm ground and draw the branch into the meadow channel.",
          "nextNodeId": "Z16C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z16A",
      "turn": 16,
      "title": "The Run of Mud - A Clean Turn",
      "narrative": [
        "The meadow-end cut catches the stray flow before it enters the mill lane. Mud, apples, and wall stone turn south across ground already cleared of people and animals.",
        "The diversion is narrow and begins clogging where a gate hedge crosses it. Behind the blockage, water rises toward the sixth terrace, the last shelf above the village roofs.",
        "Sabeth sends Noll uphill to ring three slow bells for the lower cordon. You must widen the turn while keeping the apprentice's return path visible."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Remove the gate, cut the hedge at its roots, and mark Noll's return with paired lanterns.",
          "nextNodeId": "Z17A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the hedge to filter the mud and protect the meadow grass.",
          "failTitle": "A Living Dam",
          "failText": "The hedge catches branches until the diverted flow climbs out of its channel toward the village.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the gate and station a crew to clear debris as it arrives.",
          "nextNodeId": "Z17B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z16B",
      "turn": 16,
      "title": "The Run of Mud - Ropes Across the Channel",
      "narrative": [
        "The staggered ropes draw the worst tree crowns away one after another. The main slide stays within the old relief course, though every pull costs rope and leaves fewer hands at the lower cordon.",
        "Noll carries the three-bell warning uphill while Sabeth checks the chapel roll again. Bran sees the sixth terrace leaking above the village, loaded by water that the moving channel has not reached.",
        "The relief has saved the upper orchard from a single great collapse, but the last wall now bears the debris and water from every shelf above it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the tired rope crew to reinforce the lower cordon and wait for Noll's bell.",
          "nextNodeId": "Z17C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave two crews on debris and take Bran to inspect the last wall's ends from safe ground.",
          "nextNodeId": "Z17B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare the danger past because the main slide has reached the meadow.",
          "failTitle": "The Wall Below",
          "failText": "The village relaxes while the lowest terrace quietly gathers all the water the upper work released.",
          "death": false
        }
      ]
    },
    {
      "id": "Z16C",
      "turn": 16,
      "title": "The Run of Mud - The Rough Diversion",
      "narrative": [
        "The quick bank breach turns the mud branch, but not cleanly. Water spills across the southern pear row and carries half its trees toward the meadow in a grinding raft.",
        "Sabeth accepts the loss and sends Noll to ring the lower warning. Bran points to the sixth terrace, where seepage has become a brown curtain above the village edge.",
        "The moving pear raft can block the relief outlet if it reaches the meadow wall. Stopping it must not draw every worker away from the greater danger below."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Gather the whole village to save the uprooted pear trees from the mud.",
          "failTitle": "Trees Before the Village",
          "failText": "The pear raft jams the outlet while the unguarded last wall begins to open above Fellapple.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the pear raft go and ride the firm boundary toward the sixth terrace.",
          "nextNodeId": "Z17A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Send one roped pair to turn the raft while you and Bran assess the last wall.",
          "nextNodeId": "Z17C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z17A",
      "turn": 17,
      "title": "Three Bells Missing - The Lantern Path",
      "narrative": [
        "The hedge is cleared and paired lanterns shine along Noll's return path. Three slow warning bells sound from above, then stop halfway through the final stroke.",
        "Sabeth checks the chapel slate: every household is safe, but Noll has not returned. One lantern on his route has vanished beside the old pruning shed.",
        "The sixth wall is leaking faster, yet a short search can follow the remaining lights without crossing its face. Bran stays below to measure the wall while you go for the apprentice."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the intact lantern line on rope and probe the darkness where the missing light stood.",
          "nextNodeId": "Z18A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call Noll's name from below and assume silence means he reached another shelter.",
          "failTitle": "The Unfinished Bell",
          "failText": "The apprentice remains pinned beside the pruning shed as the last safe approach disappears.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send two roped villagers along the lights while you remain with Bran at the wall.",
          "nextNodeId": "Z18B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z17B",
      "turn": 17,
      "title": "Three Bells Missing - The Wall Ends",
      "narrative": [
        "Your inspection with Bran finds firm bedrock at the west end of the sixth wall and deep clay at the east. A controlled opening at the clay end could send pressure toward the meadow instead of the roofs.",
        "Before the plan is complete, the warning bell breaks off in mid-stroke. Sabeth reports Noll missing, and his footprints point toward the pruning shed near the wall's firm end.",
        "The apprentice may have shelter, but the west approach will close if the wall begins peeling from the east. Rescue and preparation must proceed together."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the east breach point, then take a small rope team toward the pruning shed.",
          "nextNodeId": "Z18C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set Bran's breach crew at the clay end while you approach Noll along the bedrock edge.",
          "nextNodeId": "Z18B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the east end immediately without checking whether anyone remains below its path.",
          "failTitle": "A Safe Direction Unchecked",
          "failText": "The first released flow catches rescuers still crossing the meadow boundary.",
          "death": false
        }
      ]
    },
    {
      "id": "Z17C",
      "turn": 17,
      "title": "Three Bells Missing - Beyond the Pear Raft",
      "narrative": [
        "The roped pair turns the pear raft enough to keep the outlet breathing. As you reach the sixth terrace, two warning bells sound; the third begins and ends with a wooden crack.",
        "Noll's bell rope lies across the wet path, leading toward a pruning shed tilted by the slide. Sabeth sees movement beneath its eaves but cannot tell whether the apprentice is trapped.",
        "Bran needs your reading of the lowest wall before he can choose a breach. Noll needs a route that will not add rescuers to the loaded ground above him."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Run straight down the bell rope across the cracked terrace.",
          "failTitle": "Following the Rope Blindly",
          "failText": "The rope crosses a fresh opening hidden by water, and the rescue ends at the same trapped shed.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle to the firm west end and signal Noll to stay under cover.",
          "nextNodeId": "Z18A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Bran read the wall from the west while you reach the shed over anchored hurdles.",
          "nextNodeId": "Z18C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z18A",
      "turn": 18,
      "title": "The Last Orchard Wall - Noll Found",
      "narrative": [
        "The lantern line brings you to a washout beside the pruning shed. Noll is pinned by the broken bell frame, bruised but awake, with firm bedrock only a spear length beyond him.",
        "A rope around the frame lets the rescue party lift from safe ground. When Noll is free, he gives you the last thing he saw from above: the sixth wall is opening first at its clay east end.",
        "Below that end lies the emptied south orchard and the meadow channel. Below the stone west end lie Fellapple's roofs. The final work is to persuade the wall to fail where the village is not."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send Noll to Sabeth and mark a stepped breach from the east end into the meadow channel.",
          "nextNodeId": "Z19A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Use the rescued apprentice as a runner before his injuries are examined.",
          "failTitle": "One Task Too Many",
          "failText": "Noll collapses between teams, and the final warning never reaches the meadow crews.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry Noll to the chapel first, then return to Bran's breach line.",
          "nextNodeId": "Z19B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z18B",
      "turn": 18,
      "title": "The Last Orchard Wall - Bedrock and Clay",
      "narrative": [
        "The divided teams work as intended. Noll is drawn from beneath the bell frame along the bedrock edge while Bran sets tools at the wall's softer eastern end.",
        "The apprentice reports a deep humming under the eastern stones. Bran says that is water moving through clay, and the wall may open there without taking the western foundation if the first courses are removed in order.",
        "Sabeth clears the meadow crews and brings the final household roll: everyone is accounted for. The choice now concerns ground and buildings, not lives still hidden on the slope."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Remove the outer east stones and accept a broad, slower spill across the south orchard.",
          "nextNodeId": "Z19C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut a narrow stepped spillway that joins the open relief channel before releasing the toe stones.",
          "nextNodeId": "Z19B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the wall at its strongest western end because the footing is easier to reach.",
          "failTitle": "Stone Toward the Roofs",
          "failText": "The strong end tears the weak one after it, directing the wall's weight toward Fellapple instead of the meadow.",
          "death": true
        }
      ]
    },
    {
      "id": "Z18C",
      "turn": 18,
      "title": "The Last Orchard Wall - Hurdles at the Shed",
      "narrative": [
        "The anchored hurdles carry you to the tilted shed without loading the crack beneath it. Noll crawls free as Bran calls from the west end that the wall has begun opening along its eastern clay bed.",
        "The rough diversion above sends pulses of water against the sixth terrace. Each pulse widens the east joint and rattles windows in the nearest empty cottages.",
        "There is no time for a finished spillway. A shallow guide trench, paired with a deliberate removal of the lowest east stones, may be enough to turn the break."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull random stones from the wall until water appears.",
          "failTitle": "No Shape to the Breach",
          "failText": "The loosened face collapses across its full length, giving the water no safer direction than the village below.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Dig the guide trench first and let pressure choose when the east joint opens.",
          "nextNodeId": "Z19A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Number the east toe stones, rope them from the meadow, and pair their release with the trench.",
          "nextNodeId": "Z19C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z19A",
      "turn": 19,
      "title": "The Meadow Gate - A Stepped Breach",
      "narrative": [
        "Your stepped line reaches the meadow channel, and Bran approves each cut before the next is made. The last wall bows above you but remains joined to its bedrock western end.",
        "Sabeth has moved everyone beyond the chapel road. Thorne stands with the rope team on firm meadow ground, ready to draw the numbered toe stones without people beneath the face.",
        "One pull can open the eastern spillway. It must come after the channel gate is cleared and before the next pulse from the upper terraces reaches the wall."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Clear the meadow gate, wait for the water pulse to ebb, then draw the toe stones in sequence.",
          "nextNodeId": "Z20A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull every toe-stone rope together while workers still clear the gate.",
          "failTitle": "The Breach Too Soon",
          "failText": "The wall opens onto its own crew, and the blocked channel throws the released water back toward Fellapple.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the highest toe stone now and widen the spillway as the water begins to run.",
          "nextNodeId": "Z20B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "Z19B",
      "turn": 19,
      "title": "The Meadow Gate - Channel Joined",
      "narrative": [
        "The narrow spillway meets the old relief channel cleanly. Bran removes the outer stones while water begins threading through the stepped cut instead of pressing against the whole wall.",
        "A root bundle catches at the meadow gate, slowing the first flow. The last household roll is secure, but a blocked outlet could still turn the controlled release into a new break.",
        "Thorne can pull the gate free from dry ground, or workers can cut the roots while the stream is still shallow. The wall gives you only moments to choose."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Cut the reachable roots from the bank and accept a slower release.",
          "nextNodeId": "Z20C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Rope the gate to Thorne, clear all people, and draw the obstruction sideways.",
          "nextNodeId": "Z20B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send workers into the channel to lift the root bundle by hand.",
          "failTitle": "In the Outlet",
          "failText": "The wall releases while the crew stands in the only path the water can take.",
          "death": true
        }
      ]
    },
    {
      "id": "Z19C",
      "turn": 19,
      "title": "The Meadow Gate - Numbered Stones",
      "narrative": [
        "The numbered toe stones and shallow trench give the hurried plan a workable shape. Ropes run from each stone to the meadow, where Sabeth checks that no one remains inside the marked boundary.",
        "Bran warns that the lowest stone must move first. If a higher one opens before the toe is free, the wall may topple outward instead of settling into the channel.",
        "The upper water pulse can already be heard through the slope. There will be time for one clean sequence, not a second attempt."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull the highest stone first so the water can leap over the wall.",
          "failTitle": "The Wall Topples Whole",
          "failText": "The unsupported face turns outward as Bran feared, carrying the spill beyond the guide trench.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Draw the lowest stone and pause to see whether the opening widens by itself.",
          "nextNodeId": "Z20A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Call the numbered sequence steadily and keep every rope team behind the meadow markers.",
          "nextNodeId": "Z20C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "Z20A",
      "turn": 20,
      "title": "Dawn Below the Wall - The Water Turns",
      "narrative": [
        "The toe stones come free between pulses, and the eastern end of the last wall settles into the stepped spillway instead of falling outward. Water carries clay and broken roots through the old channel toward the empty meadow.",
        "Behind you, Fellapple's roofs remain dark and whole beneath the rain. The south orchard is a field of mud and torn pear trees, but Sabeth's household roll has no unanswered name.",
        "Bran watches the western stones stop moving one by one. Dawn shows through the clouds as the slope finally gives back only the sound of running water."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Keep the channel watched through dawn and begin a full map of every surviving drain.",
          "scoreDelta": 1,
          "nextNodeId": null,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send everyone home before checking whether the meadow outlet remains clear.",
          "failTitle": "The Last Blockage",
          "failText": "Unwatched debris closes the outlet, and the exhausted village receives one final surge against the lower wall.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Bran's crew at the outlet while the other families take shelter.",
          "scoreDelta": 0,
          "nextNodeId": null,
          "endStory": true,
          "endType": "low"
        }
      ]
    },
    {
      "id": "Z20B",
      "turn": 20,
      "title": "Dawn Below the Wall - The Root Gate",
      "narrative": [
        "Thorne draws the root-bound gate sideways just as the spillway fills. The first muddy rush crosses the meadow, spreads in the empty basin, and loses the force that threatened the village.",
        "The last wall remains standing at its western half and open at the east like a door built for water. Bran says the old builders would recognize the shape even if they mourned the orchard above it.",
        "Sabeth lays the rescued graft bundles beneath the chapel porch. Fellapple has lost years of fruit, but not the living wood from which those years can begin again."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Post a meadow watch and turn the remaining hands toward shelter and hot food.",
          "scoreDelta": 0,
          "nextNodeId": null,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure the open gate, record the water marks, and plan the new drains before anyone rebuilds.",
          "scoreDelta": 1,
          "nextNodeId": null,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Close the relief channel immediately to keep more soil from leaving the orchard.",
          "failTitle": "The Water Shut In Again",
          "failText": "The hill is still draining. Closing its only safe outlet renews the pressure behind the surviving wall.",
          "death": false
        }
      ]
    },
    {
      "id": "Z20C",
      "turn": 20,
      "title": "Dawn Below the Wall - The Final Sequence",
      "narrative": [
        "Each numbered rope tightens in turn. The east face lowers rather than topples, and the released water follows the shallow trench into the relief channel with only a hand's breadth to spare.",
        "The rough southern diversion takes the pear row and one empty cottage, then spreads harmlessly across the meadow basin. Above it, the western half of the last wall still guards Fellapple.",
        "Noll, bandaged and pale, joins Sabeth and Bran at the chapel road. When the rain eases, the three of them look not at what the hill has taken, but at the clear stream running where the first wallers meant it to run."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Walk onto the settling breach to recover tools before the mud has stopped moving.",
          "failTitle": "One Step Before Stillness",
          "failText": "The new channel shifts underfoot and turns a saved morning into a needless final rescue.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Fence the breach, count the losses, and leave detailed rebuilding for daylight.",
          "scoreDelta": 0,
          "nextNodeId": null,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set watches at every drain and preserve the marked stones as the plan for rebuilding.",
          "scoreDelta": 1,
          "nextNodeId": null,
          "endStory": true,
          "endType": "high"
        }
      ]
    }
  ]
});
