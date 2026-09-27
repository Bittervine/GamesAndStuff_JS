window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "snow-at-midsummer",
  "title": "Snow at Midsummer",
  "summary": "Unseasonal snow threatens the seed crops of Rowan Hollow and strands two shepherds above the village. With Thorne, the ranger must read the weather, organize protection for the fields, and find a safe way home when the familiar mountain path disappears beneath a drift.",
  "maxTurns": 20,
  "startNodeId": "AB01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "Rowan Hollow loses part of its crop, but the protected seed plants and the shared reserve give every household a beginning for the next sowing. Aldric's steward sends the measured relief Hedd requested. The village keeps its cold-weather watch long after the snow has left the mountain, and the lower ford gains properly stored boards and a marked approach. Beric returns to his flock when his ankle is ready, with Eda beside him. When you next ride through on Thorne, the midsummer garland has been taken down, but someone has tied a fresh strip of cloth at the mountain turning.",
    "low": "The shepherds come home, and all twelve sheep survive the descent, but too much of the exposed crop fails for the village's reserve to replace it. Hedd stretches the remaining seed until help arrives from Aldric's stores. Neighbors tend the flock while Beric recovers, and Eda keeps the lower route marked through the unsettled weather. Rowan Hollow will remember the hard summer without calling it a curse. When you leave on Thorne, a watch still walks the fields, carrying the lantern that came down from the fold."
  },
  "nodes": [
    {
      "id": "AB01A",
      "turn": 1,
      "title": "White on the Bean Flowers",
      "narrative": [
        "Snow catches in your dark brown hair as you ride Thorne into Rowan Hollow. Yesterday the village hung its midsummer garlands; today farmer Hedd Barl is shaking white clumps from the beans he keeps for seed. Beyond his fields, the Gray Mountains have vanished behind a low cloud.",
        "Two shepherds, Eda Wren and her father Beric, should have brought twelve sheep down from the summer fold before noon. Neither has appeared. Hedd has sent no one after them: the farmhands have never climbed through snow in this season.",
        "Your oath to Duke Aldric binds you to the uplands as surely as the roads. First you must leave the village with useful work to do; then you and Thorne can find out what has happened above it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the exposed bean rows with the sheltered ground before deciding what needs protection.",
          "nextNodeId": "AB02A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Hedd when the wind changed and when the shepherds were last seen.",
          "nextNodeId": "AB02B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the farmhands uphill immediately, carrying their harvesting tools.",
          "failTitle": "Summer Clothes in Snow",
          "failText": "The workers scatter across the hillside without ropes or warm clothing. By the time you gather the first shivering pair, the search itself has become another rescue.",
          "death": false
        }
      ]
    },
    {
      "id": "AB01B",
      "turn": 1,
      "title": "The Unused Shearing Bench",
      "narrative": [
        "Hedd Barl has laid out shears beside his barn, but no sheep are waiting. Eda Wren and her father Beric were due at Rowan Hollow with nine ewes and three lambs. Instead, an unseasonal storm has sent snow blowing down from their summer grazing.",
        "You lead Thorne under the barn eaves. The villagers keep glancing between the empty mountain lane and their flowering seed beans. Someone has covered a row with a heavy wet sack, bending every stem beneath it.",
        "As Duke Aldric's ranger, you can command help, but frightened hands need a task they understand. Hedd holds the unused shears so tightly that the knuckles of his working hand have gone white."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect the barn's dry supplies while Hedd gathers the nearest workers.",
          "nextNodeId": "AB02C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare the storm a sign that everyone must abandon the hollow.",
          "failTitle": "A Flight Without Shelter",
          "failText": "Families leave their sound houses for exposed roads. Carts jam the only lane, and the people who could have helped the shepherds are soon struggling to protect their own children.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hear Hedd's account of the storm and establish the shepherds' expected route.",
          "nextNodeId": "AB02B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB01C",
      "turn": 1,
      "title": "A Garland Under Ice",
      "narrative": [
        "A midsummer garland hangs stiff with frozen rain above Hedd Barl's gate. You dismount beside it and loosen Thorne's girth while the farmer explains why his neighbors have stopped work to watch the mountain.",
        "The shepherds Eda and Beric Wren remain somewhere above Rowan Hollow with twelve sheep. Snow has closed around the high fold, and down here the village's bean and cabbage seed crops are beginning to suffer.",
        "You brush meltwater from your stubble and look into the barn. Ropes, hurdles, and dry wool offer more help than the frightened talk outside. Duke Aldric will expect an account eventually; the missing shepherds need a ranger now."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight uphill at a gallop before the snow hides the lane.",
          "failTitle": "A Horse Spent Too Soon",
          "failText": "Thorne struggles on the slippery rise and strains a leg. You must bring him back slowly, losing both the swift departure and the means to carry anyone who cannot walk.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Sort the dry wool, rope, and spare seed before deciding which hands can be spared.",
          "nextNodeId": "AB02C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Walk the nearest field margin to judge how deeply the cold has reached.",
          "nextNodeId": "AB02A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB02A",
      "turn": 2,
      "title": "The Shelter of a Hedge",
      "narrative": [
        "Your walk along the bean rows shows where shelter matters. Snow rests on the open leaves, while plants beneath the thick hedge remain clear. The ground is wet rather than deeply frozen; there is still time to protect a useful part of the seed crop.",
        "Hedd follows with two workers. He has spare reed mats and low wooden frames, but too few of either to cover every field. You show him the damage caused by the sack laid directly across the stems.",
        "On the mountain road, the morning's shallow cart marks are already filling. Hedd can manage the fields once he has a plan, leaving you free to search for the Wrens."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Set frames over the best seed beans and stretch reed mats above the flowers.",
          "nextNodeId": "AB03A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Press the wet sacks firmly onto the plants to keep every breath of cold away.",
          "failTitle": "The Weight of Protection",
          "failText": "Snowwater soaks the sacks until their weight snaps the flowering stems. The village loses the seed plants it had the best chance of saving, and the workers lose faith in your directions.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the available reeds to shelter the exposed cabbage seed rows from the wind.",
          "nextNodeId": "AB03B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB02B",
      "turn": 2,
      "title": "What Hedd Remembered",
      "narrative": [
        "Hedd's account places the change just after sunrise. A hard north wind drove the warm air away, then sleet became wet snow. Eda and Beric had left before the change to gather their twelve sheep at the summer fold.",
        "The farmer points out which vegetable rows supply next year's seed. They are worth more than the larger patch grown for the table. His neighbors are covering whichever plants lie nearest their doors, with no shared order to the work.",
        "No one has seen a rider or heard fighting on the upper road. What you have so far is bad weather and two overdue people, not evidence of an enemy."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Move the spare seed sacks and boxed seedlings into the dry barn before climbing.",
          "nextNodeId": "AB03C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Arrange reed screens around the cabbage seed rows and give Hedd charge of the workers.",
          "nextNodeId": "AB03B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse the upland households of hiding the shepherds until someone confesses.",
          "failTitle": "Doors Close Against You",
          "failText": "Your accusation spreads faster than the snow. The families who know the mountain withdraw indoors, and Hedd cannot persuade them to join a search under suspicion.",
          "death": false
        }
      ]
    },
    {
      "id": "AB02C",
      "turn": 2,
      "title": "Useful Things in the Barn",
      "narrative": [
        "Sorting the barn supplies gives you dry wool, a sound length of rope, and a sack of seed left from spring. Hedd has also kept young cabbages in shallow wooden boxes for gaps in the lower garden. Neither reserve belongs beneath the leaking outer eaves.",
        "The farmer confirms that Eda and Beric went to bring twelve sheep down from the summer fold. They carried lunch and working cloaks, expecting to return before the shearing bench was ready.",
        "You separate what the village needs from what a rescue might require. Outside, wet snow slides from the roof in heavy sheets, exposing the fragile plants along the wall to the wind."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the spare seed sacks to make a fire large enough to warm the whole yard.",
          "failTitle": "Tomorrow in the Fire",
          "failText": "The little fire cannot warm the open yard. By the time Hedd stops the work, the village's reserve seed has been consumed with its sacks, leaving nothing certain to plant after the storm.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Give the workers frames and mats to protect the strongest flowering beans.",
          "nextNodeId": "AB03A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set the seed sacks on raised boards and carry the young cabbages into the sheltered barn doorway.",
          "nextNodeId": "AB03C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB03A",
      "turn": 3,
      "title": "Room Above the Flowers",
      "narrative": [
        "The raised covers leave a hand's breadth between the mats and the bean flowers. Snow collects on the reeds instead of the stems. Hedd makes each worker lift one corner and see the space that must remain beneath it.",
        "You cannot shelter the entire field. The farmer marks the healthiest seed rows and divides the remaining hands between the cabbage patch and the barn stores. Work begins to spread through the village with a purpose.",
        "Above the roofs, the cloud is moving faster than it appears from the sheltered yard. Before you climb, you need to judge whether the worst is passing or merely changing its shape."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Climb the nearby north-facing knoll and read the cloud and wind above the hollow.",
          "nextNodeId": "AB04A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Hedd to compare the present wind with the last severe late frost he remembers.",
          "nextNodeId": "AB04B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seal every cover to the ground and leave no one to check the weight of gathering snow.",
          "failTitle": "A Roof Too Heavy",
          "failText": "The unattended mats sag as wet snow builds upon them. Frames overturn into the plants, and the hurried protection does more damage than the first hour of weather.",
          "death": false
        }
      ]
    },
    {
      "id": "AB03B",
      "turn": 3,
      "title": "Reeds Across the Wind",
      "narrative": [
        "The reed screens take the force from the wind crossing the cabbage rows. Behind them, Hedd sets light covers above the plants kept for seed. He works a frozen knot loose with his teeth rather than sacrifice another length of twine.",
        "You send the unused frames to the bean plot and put two steady workers in charge of the barn reserves. Not everything can be saved, but the next planting no longer depends on a single exposed field.",
        "A brief opening in the cloud shows fresh snow high on the shoulder of the mountain. Hedd looks at it, then at the empty shearing bench, and asks whether the weather will worsen after sunset."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Examine the mountain from the road bridge, where the ridges are easier to distinguish.",
          "nextNodeId": "AB04C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Strip the village roofs of thatch to cover the remaining vegetable ground.",
          "failTitle": "Shelter Taken Apart",
          "failText": "The workers expose sleeping rooms to the melting snow. Families must abandon the field work to keep their bedding dry, and the village loses the safe shelter a rescue would need.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Hedd's memory of earlier frosts to judge what a clearing sky would mean for the low fields.",
          "nextNodeId": "AB04B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB03C",
      "turn": 3,
      "title": "Seed Above the Wet Floor",
      "narrative": [
        "The reserve sacks are dry on their raised boards, and the boxed cabbages stand inside the broad doorway where daylight reaches them. Hedd counts what is saved before deciding how many workers he can send back to the fields.",
        "You give those workers the spare mats and frames. They begin with the plants grown for seed, while the farmer keeps a small store of wool and food aside for the missing shepherds.",
        "The barn floor darkens where snowwater creeps under the doors. Higher up, the mountain briefly comes into view, showing white gullies between slopes that were green when the Wrens left home."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shut the barn tightly and order everyone to wait until the mountain is green again.",
          "failTitle": "A Wait Without an End",
          "failText": "The villagers obey your promise that the weather must soon turn. No search begins before the upper paths disappear into evening, and the shepherds remain beyond anyone's reach.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Go to the road bridge and compare the snow on the mountain's exposed and sheltered slopes.",
          "nextNodeId": "AB04C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take a short turn over the north knoll to feel the weather above the village roofs.",
          "nextNodeId": "AB04A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB04A",
      "turn": 4,
      "title": "The Wind Beyond the Roofs",
      "narrative": [
        "On the north knoll, the wind cuts through your cloak with none of the shelter found in the village. Ragged cloud streams over the mountain shoulder. Fresh snow lies thickest where the slope faces that wind, while tucked-away grass remains visible.",
        "The pattern gives you an ordinary cause for an extraordinary day: a sudden sweep of northern cold has reached these uplands. There is no strange mark on the earth and no reason to promise that midsummer will drive it away before night.",
        "You return to Hedd with a warning. If the clouds clear and the wind falls, the low hollow may grow colder still. He must keep people checking the covers while you bring the shepherds down."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test a rescue rope and pack dry wool before committing Thorne to the climb.",
          "nextNodeId": "AB05A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell Hedd to remove the covers as soon as the first patch of blue sky appears.",
          "failTitle": "The Fair-Sky Promise",
          "failText": "Hedd trusts your assurance. The village uncovers its seed plants during a brief clearing, only to find that the air near the wet ground is colder than it was beneath the cloud.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Prepare warm food and divide it into small wrapped portions for the missing pair.",
          "nextNodeId": "AB05B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB04B",
      "turn": 4,
      "title": "A Farmer's Old Winter",
      "narrative": [
        "Hedd remembers another summer cold spell from his apprenticeship. The snow was gone from the roofs by evening, but the lowest garden froze after the stars appeared. His master had kept the seed plants covered and lost far less than the neighboring farms.",
        "You match his memory with the north wind and the fresh snow on the exposed mountain face. Nothing suggests that the land itself has changed. The weather is unusual, yet the warnings are ones a careful farmer can understand.",
        "Hedd agrees to keep a watch even if the sky brightens. You turn to the more distant danger: Eda and Beric are dressed for a working morning, not a night above the snowline."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Check Thorne's feet and balance the rescue supplies on either side of his saddle.",
          "nextNodeId": "AB05C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap food and warm drink for the shepherds, then add rope and dry wool to the load.",
          "nextNodeId": "AB05B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise the villagers that the shepherds can survive any summer night outdoors.",
          "failTitle": "A Season Is No Shelter",
          "failText": "Your reassurance persuades Hedd to put the rescue supplies away. When you finally reach the upper lane, the cold and failing light force you back without the means to help anyone.",
          "death": false
        }
      ]
    },
    {
      "id": "AB04C",
      "turn": 4,
      "title": "White Gullies, Dark Grass",
      "narrative": [
        "From the bridge, the mountain shows an uneven coat of snow. The north-facing gullies are white; sheltered folds remain dark with grass. Small streams run beneath the new snow, telling you that the ground has not endured a long freeze.",
        "A sharp north wind explains the sudden change without making it harmless. Wet clothing and a night on the ridge would endanger anyone, even while meltwater still runs at their feet. The Wrens may have chosen the fold for shelter.",
        "You send Hedd back to maintain the crop covers after sunset. He points out three ways to the lower mountain lane, all joining near an old ash: a stone cart road, a hedge lane, and the stream path."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Choose the narrowest gully because its deep snow will make a soft road for Thorne.",
          "failTitle": "Soft Ground, Hidden Stones",
          "failText": "Thorne sinks between rocks concealed by the drift. You cannot free him without unloading everything, and the return to firm ground costs the remaining daylight needed for the search.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Choose the soundest barn rope and take an extra folded blanket for the ascent.",
          "nextNodeId": "AB05A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Examine Thorne's shoes and arrange the rope, wool, and provisions so he can carry a rescued rider.",
          "nextNodeId": "AB05C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB05A",
      "turn": 5,
      "title": "A Rope Worth Trusting",
      "narrative": [
        "The rope holds under a steady pull between two barn posts. You reject a frayed short piece, coil the sound length where you can reach it, and wrap the wool inside a spare cloth. Food and a covered flask fill the other saddlebag.",
        "Hedd checks that you know the three approaches to the ash tree. The cart lane is broad but exposed; the hedge lane gives shelter; the stream path is shortest, though its stones will need testing.",
        "You leave him in charge of the covers, dry stores, and a place ready for the Wrens. Thorne turns one ear toward the mountain as you take his rein."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Lead Thorne up the broad stone lane, keeping to its rough center where his shoes can grip.",
          "nextNodeId": "AB06A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the longer hedge lane to spare yourself and Thorne the direct wind.",
          "nextNodeId": "AB06B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tie the rescue rope around your waist and Thorne's neck so neither of you can become separated.",
          "failTitle": "No Room to Recover",
          "failText": "Thorne slips on the first glazed stones and the short tether drags you against him. The fall leaves you unable to climb, and Hedd must recover the rescuer instead.",
          "death": false
        }
      ]
    },
    {
      "id": "AB05B",
      "turn": 5,
      "title": "Food for the Way Back",
      "narrative": [
        "Warm broth fills the covered flask, while bread and cheese go into separate cloth packets. You add dry wool and the checked rope, leaving enough room behind the saddle for someone who cannot walk. Hedd saves another pot beside the kitchen hearth.",
        "The farmer sketches the approaches to the ash tree with a finger on the barn door. The hedge lane takes longer but stays out of the wind. Beyond it, all three lower routes meet the path to the summer fold.",
        "You repeat the crop-watch duties to the workers before leaving. Hedd answers each one himself, showing you that the village can carry on while you are away."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the stream path at walking pace, testing the wet stones before Thorne steps on them.",
          "nextNodeId": "AB06C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drink the shepherds' warm broth now and leave the bulky flask behind to travel lighter.",
          "failTitle": "Warmth Left Below",
          "failText": "You reach the upper lane cold and short of useful supplies. Forced to return for what you discarded, you lose the search window while the shepherds remain unseen.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the sheltered hedge lane and keep the food wrapped until it is needed.",
          "nextNodeId": "AB06B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB05C",
      "turn": 5,
      "title": "Space Behind the Saddle",
      "narrative": [
        "Thorne's shoes are sound, and you remove a stone lodged beside one frog before loading him. The rope lies outside the bags; food and dry wool sit evenly within them. His back will remain available if a shepherd needs to ride.",
        "Hedd gives you the turns for the stream path and points out where it joins the stone road and hedge lane beneath an ash. He will keep the barn ready and the seed covers watched until your return.",
        "You tighten your cloak at the throat. The first useful task is no grand charge into the mountain, only bringing an uninjured horse and dry supplies to the people who need them."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Load Thorne with every sack Hedd offers so the climb will not need to be repeated.",
          "failTitle": "More Than He Can Carry",
          "failText": "The overloaded saddle shifts on the steep path. Thorne stumbles and the bags tumble into the stream; recovering the supplies leaves the horse too sore to continue uphill.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Walk the stream path and probe each slick crossing with your staff before leading Thorne over.",
          "nextNodeId": "AB06C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Choose the wider stone lane so you can watch Thorne's footing without crowding him.",
          "nextNodeId": "AB06A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB06A",
      "turn": 6,
      "title": "The Rough Center of the Road",
      "narrative": [
        "The broad stone lane gives Thorne room to place his feet. You keep him off the smooth wheel ruts, where meltwater has begun to glaze, and reach the old ash without slipping. Its bare lower branches shelter a patch of churned snow.",
        "Two sets of boot marks lead uphill from the tree. A shepherd's staff has made deep round holes beside them, and a thin call carries from somewhere beyond the next rise. The fold itself remains hidden.",
        "You stop long enough to loosen the wet snow around Thorne's shoes. There is no reason to spend the strength you will need on the return by hurrying blindly now."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Separate the two boot trails beneath the ash and follow the clearer line uphill.",
          "nextNodeId": "AB07A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride over the smooth wheel ruts to gain speed while the road remains broad.",
          "failTitle": "The Polished Stone",
          "failText": "Thorne's feet slide together on the glazed rut. His fall injures your knee, and the descent to Rowan Hollow becomes the only journey you can manage.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Call toward the distant voice and wait for an answering direction.",
          "nextNodeId": "AB07B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB06B",
      "turn": 6,
      "title": "Under the Blackthorn",
      "narrative": [
        "The hedge lane keeps the wind off your hands, though snow showers from the branches whenever Thorne brushes them. At its upper end, you find the old ash and the meeting of the three village paths.",
        "A voice reaches you from above the next rise, too faint to distinguish words. Near the trunk, bootprints and the round marks of a shepherd's staff head toward the summer fold. No tracks return downhill.",
        "You bring Thorne into the ash's shelter before listening again. The call is human and repeated; someone up there is trying to make contact rather than hide."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the deep staff holes beside the sheep trail where the bootprints have blurred.",
          "nextNodeId": "AB07C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Answer the caller, then listen for words that will place them beyond the rise.",
          "nextNodeId": "AB07B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force a shortcut through the blackthorn to reach the voice in a straight line.",
          "failTitle": "Held by the Hedge",
          "failText": "A concealed ditch catches Thorne's forelegs as the thorns close around the bags. Freeing him costs your dry supplies and leaves the horse unable to continue the rescue.",
          "death": false
        }
      ]
    },
    {
      "id": "AB06C",
      "turn": 6,
      "title": "Water Beneath the Snow",
      "narrative": [
        "Probing the stream path keeps you off a stone that shifts beneath its innocent coat of snow. You lead Thorne around it and join the wider lane under the ash. The horse lowers his head to the sheltered grass while you look ahead.",
        "Staff holes climb beside the sheep trail, with two sets of human prints crossing between them. Farther uphill, a call rises and stops. The fold is close enough for sound to carry, although the next ridge hides its walls.",
        "Water still moves under the white margins of the path. You keep that in mind: a firm-looking surface here may cover a hollow rather than solid ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the white crust beside the stream without testing it, saving the longer bend.",
          "failTitle": "A Hollow Underfoot",
          "failText": "The crust breaks over a deep pool between boulders. The current pulls you under the bank before you can regain the path.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the paired bootprints beneath the ash to choose a line toward the fold.",
          "nextNodeId": "AB07A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace the staff marks along the sheep trail, checking the ground at each turn.",
          "nextNodeId": "AB07C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB07A",
      "turn": 7,
      "title": "Two Walkers Going Up",
      "narrative": [
        "Following the bootprints shows you two walkers keeping close together. The heavier heel sometimes overlaps the lighter one where the path narrows. There is no sign of pursuit, only a steady climb made before the snowfall deepened.",
        "At the next bend, Eda calls from beside the fold. She is safe enough to stand, but her father cannot come down. Between you lie a drifted gate, a sheltered hay shed, and the outer wall with a line of staff holes beside it.",
        "Thorne lifts his head at her voice. You answer that you have wool and rope, then study the last short approach instead of treating sight of the shelter as the end of danger."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the boot line through the fold gate, probing the drift before bringing Thorne in.",
          "nextNodeId": "AB08A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Eda to guide you by voice around the sheltered hay shed.",
          "nextNodeId": "AB08B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Jump Thorne over the drifted gate before Eda can move it.",
          "failTitle": "The Hidden Gatepost",
          "failText": "The drift conceals a broken post on the far side. Thorne lands badly against it, leaving you with an injured horse and no means to carry Eda's father home.",
          "death": false
        }
      ]
    },
    {
      "id": "AB07B",
      "turn": 7,
      "title": "An Answer Through the Wind",
      "narrative": [
        "Your call brings a clear answer: Eda Wren is at the summer fold, and Beric has hurt his ankle. She tells you to keep below the ridge, where blown snow hides the edge of the path.",
        "You can see her now, standing beyond a hay shed with one arm raised. A trampled route crosses the gate drift; another follows staff holes beside the outer wall. Eda offers to call you around the shed's sheltered side.",
        "The sheep answer her voice from within the enclosure. Twelve animals make plenty of noise, but there is still no word from Beric himself. You keep Thorne close and work out how to reach the people first."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the staff-marked path along the outer wall to approach her slowly.",
          "nextNodeId": "AB08C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell Eda to bring her father out unaided while you wait with the horse.",
          "failTitle": "Too Much for One Pair of Hands",
          "failText": "Eda tries to lift Beric through the snow without help. They fall together at the doorway, worsening his injury and leaving both beyond the aid your delay has denied them.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Eda call each turn while you lead Thorne around the hay shed.",
          "nextNodeId": "AB08B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB07C",
      "turn": 7,
      "title": "The Staff Beside the Wall",
      "narrative": [
        "The staff holes guide you through patches where blowing snow has erased every lighter mark. At the fold's outer wall, Eda Wren raises a hand and calls that Beric is hurt. She has been making short trips out to look for help.",
        "Her marked route runs close to the stonework. You also see a trampled line through the gate and the low roof of a hay shed. All three offer shelter from part of the wind, but none deserves to be crossed carelessly.",
        "Eda asks whether Hedd knows they are missing. You tell her he is keeping the barn ready. The answer steadies her enough to describe where her father is waiting."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the outer wall to reach Eda without walking around its end.",
          "failTitle": "Stones Without Mortar",
          "failText": "A coping stone rolls under your weight and pulls a section of wall down with it. Your injured shoulder ends the climb, and Eda must turn from her father to help you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Continue beside Eda's staff holes, giving the loose outer stones a wide berth.",
          "nextNodeId": "AB08C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the trampled gate approach, testing its deeper snow before Thorne follows.",
          "nextNodeId": "AB08A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB08A",
      "turn": 8,
      "title": "Inside the Cleared Gate",
      "narrative": [
        "The boot line brings you safely through the gate drift. Eda takes Thorne's rein with reddened hands and shows you the low shelter where Beric sits against a hay bundle. He twisted his ankle while bringing the last lamb indoors.",
        "Nine ewes and three lambs crowd the enclosure. You count them while Eda explains that she could not leave her father to fetch help. The shelter's roof carries a heavy quilt of wet snow, and the front door has begun to rub against its frame.",
        "Beric answers your greeting firmly, though he has not managed to stand. You keep Eda outside the doorway until you have chosen a safe approach."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Check the front doorway and hold its warped door open before entering beside Beric.",
          "nextNodeId": "AB09A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell Eda to climb onto the roof and shovel the snow off above her father.",
          "failTitle": "Weight Above the Beam",
          "failText": "Eda's weight shifts the loaded rafters. The shelter gives a sudden crack, forcing you to pull her away while the entrance closes around fallen timber and Beric remains inside.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Move to the sheltered side opening, where Eda says a hurdle can be lifted out.",
          "nextNodeId": "AB09B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB08B",
      "turn": 8,
      "title": "Behind the Hay Shed",
      "narrative": [
        "Eda's directions take you around the hay shed without crossing the deepest drift. She leads Thorne into its lee and points to Beric in the adjoining shelter. He hurt his ankle collecting a lamb and cannot bear enough weight to descend.",
        "All twelve sheep are gathered within the wall. Eda has kept them together, but her father has been sitting on cold boards in damp clothing. A hooded lantern hangs on a peg beside a removable hurdle in the shelter's side.",
        "The front door is pinched in its frame, while the back wall has a low opening used for passing hay. You need room for a careful lift, not merely a way to squeeze yourself inside."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Walk around to examine the low rear opening before shifting any of the loaded timber.",
          "nextNodeId": "AB09C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lift out the side hurdle and inspect the clear floor between the opening and Beric.",
          "nextNodeId": "AB09B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull the upright nearest Beric aside to widen the doorway quickly.",
          "failTitle": "The Post That Held",
          "failText": "The upright is carrying more of the roof than its slender shape suggests. Moving it drops the beam across your route, trapping you outside the shelter while its walls begin to spread.",
          "death": false
        }
      ]
    },
    {
      "id": "AB08C",
      "turn": 8,
      "title": "Along the Outer Stones",
      "narrative": [
        "Eda meets you at the end of the wall after you follow her staff marks around its loose stones. She has kept Beric and all twelve sheep at the fold, hoping help would come before the weather closed the way home.",
        "Her father sits inside the low shelter with a swollen ankle and a damp cloak. The front door has tightened against its frame. You can also see a removable side hurdle and a small rear opening where hay is passed through.",
        "You settle Thorne on firm ground and take the wool from his bag. Beric tries to joke about spoiling shearing day, but the tremor in his voice gives you a better measure of the cold."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Make Beric walk to Thorne to prove whether his ankle truly prevents travel.",
          "failTitle": "One Step Too Many",
          "failText": "Beric obeys until his injured ankle gives beneath him. His fall leaves him unable to help with the descent, and your rough test has consumed the chance of a controlled rescue.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Approach the front door and check its frame before taking any weight through it.",
          "nextNodeId": "AB09A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the rear hay opening for a clear, sheltered way to reach Beric.",
          "nextNodeId": "AB09C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB09A",
      "turn": 9,
      "title": "The Door Under Strain",
      "narrative": [
        "Holding the front door open gives you a clear way to Beric, but the marks on its frame explain why it jammed. The roof has settled under the wet snow. A pale split runs along the ridge timber above the hay.",
        "You bring Eda to the threshold and wrap her father in dry wool. He is alert and can move his arms; his ankle is the reason he cannot leave. Beside him lie a smooth floor blanket and a stout hay hurdle that could serve as a litter.",
        "The roof gives a soft wooden tick. You have time for a prepared move through the cleared doorway, not for a repair made over a helpless man."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Pad Beric's ankle and arrange a supported two-person carry through the door.",
          "nextNodeId": "AB10A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the folded blanket to slide Beric along the smooth boards without making him stand.",
          "nextNodeId": "AB10B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Brace the cracked ridge with your shoulder while Eda searches outside for a replacement post.",
          "failTitle": "A Body for a Prop",
          "failText": "The beam settles before Eda returns. Its weight pins you where no one can safely lift it, turning a straightforward evacuation into a rescue the two shepherds cannot perform.",
          "death": false
        }
      ]
    },
    {
      "id": "AB09B",
      "turn": 9,
      "title": "A Space in the Side Wall",
      "narrative": [
        "Removing the side hurdle opens a level route to Beric. The better light also reveals the crack in the ridge timber. Snow has loaded the low roof until its joints are shifting; the shelter cannot be trusted for the night.",
        "You wrap Beric in dry wool while Eda clears loose hay from the boards. A blanket can carry him across that smooth stretch, or the sound hurdle can support him as a litter. He promises to keep his injured foot clear.",
        "You point out the screened corner outside where he can rest before being helped onto Thorne. Eda takes one steady breath when the whole move has been explained."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Cushion the sound hay hurdle and use it as a litter through the wider gap.",
          "nextNodeId": "AB10C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light a large fire beneath the roof to melt its snow before moving Beric.",
          "failTitle": "Smoke in the Shelter",
          "failText": "The damp fuel fills the low room with smoke long before it melts the load above. You are driven outside without completing the lift, and Beric is left in a shelter you can no longer enter.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Fold the blanket beneath Beric and slide him gently along the cleared boards to the side opening.",
          "nextNodeId": "AB10B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB09C",
      "turn": 9,
      "title": "Light Through the Hay Opening",
      "narrative": [
        "Looking through the rear opening shows a pale crack along the ridge timber and daylight at a spreading roof joint. The building is failing under wet snow. You reach Beric from the clear side of the room while Eda opens the wider side gap for his exit.",
        "The older shepherd remains alert, but his swollen ankle cannot take the mountain path. You wrap him in dry wool. A sound hay hurdle, a smooth blanket, and enough clear floor lie within easy reach.",
        "There will be no patient wait for better weather in this shelter. You describe the move to Beric before touching him, allowing him to tell you where support hurts least."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove roof slates from inside so the snow can fall through behind Beric.",
          "failTitle": "The Wrong Weight Removed",
          "failText": "The slates hold together a weakened section of roof. Disturbing them sends timber and snow into the room, blocking the clear passage you had already found.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pad the hay hurdle and secure Beric on it for a level carry through the side gap.",
          "nextNodeId": "AB10C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Support his injured ankle and carry him between you and Eda through the cleared opening.",
          "nextNodeId": "AB10A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB10A",
      "turn": 10,
      "title": "Between Two Shoulders",
      "narrative": [
        "The supported carry brings Beric into the screened corner without putting weight on his injured foot. Eda lowers her end only when you tell her yours is steady. Behind you, a dull crack runs along the abandoned shelter roof.",
        "You settle Beric on dry wool and give both shepherds a little food. Eda retrieves the hooded lantern from an outside peg and opens the sheep pen. With your support, her father mounts Thorne for the journey; his padded ankle hangs clear of the horse's flank.",
        "All twelve sheep gather near the gate. Eda points toward the usual ridge path, but fresh drifts have changed its outline since morning."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Walk a short way ahead to inspect the summer ridge path before committing the whole party.",
          "nextNodeId": "AB11A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Beric ahead on Thorne while you and Eda collect the sheep.",
          "failTitle": "A Rider Alone",
          "failText": "Beric cannot dismount quickly when Thorne reaches the blocked ridge. The horse turns into deep snow, and the separated party loses the light trying to bring them both back.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Look down from the fold's low rise for a route that avoids the deepest snow.",
          "nextNodeId": "AB11B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB10B",
      "turn": 10,
      "title": "Across the Smooth Boards",
      "narrative": [
        "The blanket slides over the swept floor, carrying Beric through the opening without a jolt to his ankle. You and Eda lift him only for the short move onto dry ground beside the wall. Snow drops through a roof joint after you leave.",
        "Outside, you replace the damp outer blanket with dry wool and share a little food. Eda takes the hooded lantern from its peg, then gathers the nine ewes and three lambs. You help her father onto Thorne, keeping his padded foot free.",
        "The ridge above the fold looks smooth and white where Eda remembers a distinct path. The sheep hesitate at the gate, waiting for someone to choose a way."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead Thorne only as far as the old sheep gate to test the start of the usual route.",
          "nextNodeId": "AB11C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the low rise beside the fold to compare the ridge with the lower grazing ground.",
          "nextNodeId": "AB11B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive the flock onto the ridge so its weight will break a path for Thorne.",
          "failTitle": "No Path Beneath Them",
          "failText": "The leading ewes push into snow concealing the outer edge of the trail. Eda rushes after them, and the orderly descent breaks into a desperate struggle to recover scattered animals.",
          "death": false
        }
      ]
    },
    {
      "id": "AB10C",
      "turn": 10,
      "title": "The Hurdle Set Down",
      "narrative": [
        "The padded hurdle carries Beric safely out through the side gap. You set it flat beside the wind-screening wall before easing him onto dry wool. Eda looks back as the empty shelter sheds a narrow ribbon of snow through its roof.",
        "After a little food, Beric is ready to sit on Thorne with his injured ankle padded and free. Eda collects the hooded lantern from its outside peg and brings the twelve sheep to the gate. The hurdle stays behind; you need your hands for the living.",
        "At the old sheep gate, the summer route begins with a white slope whose edges are hard to see. Thorne watches it without stepping forward."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Use the broken shelter's upper wall as a shortcut onto the ridge.",
          "failTitle": "The Wall Follows the Roof",
          "failText": "The wall has lost the roof's bracing and tilts when you climb it. The fall injures you badly enough that the shepherds must shelter beside the fold instead of beginning their descent.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Eda with her father and examine the first bend of the ridge path on foot.",
          "nextNodeId": "AB11A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep a hand on Thorne's rein and inspect the ground at the old gate before asking him onward.",
          "nextNodeId": "AB11C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB11A",
      "turn": 11,
      "title": "Where the Path Used to Be",
      "narrative": [
        "Your inspection ends at the first ridge bend. A drift stretches across the summer path and out beyond it, hiding a rock lip that drops sharply into the gully. You probe from firm ground and find empty space where a hurried walker might expect a road.",
        "You return to Eda, Beric, and Thorne rather than attempt a crossing alone. Eda knows a lower grazing bench reached by a shallow stream ford. It will mean a longer descent, but the broad slope toward it is clear enough to follow.",
        "The flock moves with you to the stream. A pair of stored footboards and a spare hurdle stand above its bank, left there for the shepherds' summer crossings."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Probe the ford from its firm margin to find a shallow line with an even bed.",
          "nextNodeId": "AB12A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Study the ford from the bank above it before choosing where to cross.",
          "nextNodeId": "AB12B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Return to cut steps across the ridge drift, trusting its hidden outer edge to hold.",
          "failTitle": "Snow Beyond the Stone",
          "failText": "The outer drift has no path beneath it. A section gives way as you work, carrying you down the rock face before Eda can reach the rope.",
          "death": true
        }
      ]
    },
    {
      "id": "AB11B",
      "turn": 11,
      "title": "A View Below the Fold",
      "narrative": [
        "From the low rise, the summer route's danger is plain. Wind has built a drift across the ridge and beyond the dark rock lip beneath it. Eda can no longer distinguish the narrow walking surface from unsupported snow.",
        "Farther down, a broad grazing bench lies open. Beric points out the stream ford that leads to it, remembering two footboards and a spare hurdle stored on the bank. You bring him, Eda, the flock, and Thorne down the gradual slope together.",
        "The sky is beginning to break. What looks like welcome brightness may bring a colder evening to Rowan Hollow, making a safe but steady pace more useful than waiting for warmth."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Approach the water through the lower sheep wicket where the flock usually crosses.",
          "nextNodeId": "AB12C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take everyone back beside the fold to wait for sunshine to melt the ridge drift.",
          "failTitle": "Light Without Warmth",
          "failText": "The clearing brings no useful thaw. By the time the sun slips behind the mountain, your party is still above the blocked route and too chilled to attempt the unfamiliar lower crossing.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Examine the stream and both landing places from the raised bank.",
          "nextNodeId": "AB12B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB11C",
      "turn": 11,
      "title": "Thorne Stops at the Gate",
      "narrative": [
        "Thorne stops when you inspect the old gate, and a careful probe shows why the ground deserves caution. Beyond the hinge post, drifted snow covers the ridge path and extends past its rock edge. You back the horse onto firm turf.",
        "Eda describes the lower stream ford. Beric confirms that its approach stays on a broad slope and that spare footboards and a hurdle wait beside it. With him still on Thorne, you lead the whole party down toward that crossing.",
        "Nine ewes and three lambs bunch at the sound of water. The ford is shallow enough to consider, but a thin skin of ice along its margins makes familiar ground newly uncertain."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Return to the ridge and force Thorne onto the drifted path with your crop.",
          "failTitle": "Trust Broken on the Ridge",
          "failText": "Thorne obeys the blow and steps where snow conceals the drop. The scramble that follows throws Beric from the saddle and leaves your party unable to descend together.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the lower sheep wicket to approach the ford without crowding its slippery edge.",
          "nextNodeId": "AB12C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the flock back while you probe a firm shallow line through the water.",
          "nextNodeId": "AB12A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB12A",
      "turn": 12,
      "title": "The Bed Under the Current",
      "narrative": [
        "Your staff finds gravel beneath the ford's moving water, with a deeper gap between two broad stepping stones. The shallow line beside them will suit Thorne and the sheep if they are led slowly. Beric needs a dry, supported passage.",
        "Above the bank, you and Eda examine the stored footboards and the spare hurdle. The wood is sound beneath its surface damp. Your rope could also make a handline between the stout bank posts; dry padding remains in Thorne's bag.",
        "You help Beric dismount onto a folded blanket well away from the water. He can assist with his arms, but he must not be asked to balance on the injured ankle."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Bridge the gap between the broad stones with the sound footboards and support Beric across.",
          "nextNodeId": "AB13A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Carry Beric into the current on Thorne so neither of you has to dismount again.",
          "failTitle": "A Burden Above the Ford",
          "failText": "With the extra weight shifting high on his back, Thorne slips at the uneven gap. Beric falls into the cold water, and you must abandon the descent to keep him alive.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead unloaded Thorne through first, then use a rope handline to help Beric over the stones.",
          "nextNodeId": "AB13B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB12B",
      "turn": 12,
      "title": "Both Banks in Sight",
      "narrative": [
        "The raised bank gives you a clear view of the ford. Shallow gravel runs beside a line of broad stones, but one gap is too wide for Beric to manage without support. The far landing rises gently onto open turf.",
        "Eda checks the two stored footboards and the spare hurdle while you examine the bank posts for a rope handline. Each offers a way to keep her father's injured foot clear. Thorne and the sheep can use the shallow gravel separately.",
        "You lower Beric onto dry wool before moving the horse. He watches the far bank with patient concentration, saving his strength for the part only he can do."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Pad the spare hurdle and prepare to carry Beric level across the broad stones with Eda.",
          "nextNodeId": "AB13C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take unloaded Thorne across the shallow line and rig a handline to support Beric between the stones.",
          "nextNodeId": "AB13B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the lambs across first and follow whichever line they choose through the water.",
          "failTitle": "A Lamb's Measure",
          "failText": "The lambs scatter between pools that a person cannot cross in the same way. Eda enters the water after them, and your carefully gathered party breaks apart before Beric has even left the bank.",
          "death": false
        }
      ]
    },
    {
      "id": "AB12C",
      "turn": 12,
      "title": "The Lower Wicket",
      "narrative": [
        "The sheep wicket brings you to a sheltered approach with room to hold the flock clear of the ford. You find a shallow gravel line for the animals beside broad stepping stones. One wider gap will require help for Beric.",
        "Two sound footboards and a spare hurdle are stored above the water. Eda brings them down while you help her father off Thorne. Bank posts offer anchors for your rope, and there is dry wool to pad a seat or litter.",
        "The crossing is manageable because you can separate its tasks. Twelve sheep, one horse, and an injured man must not all enter the narrow place at once."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tie the flock and Thorne into one close line so nothing can be left behind in the ford.",
          "failTitle": "One Fright Pulls All",
          "failText": "An ewe shies from the water and pulls the animals beside her off balance. The tight line tangles at the margin, leaving you and Eda struggling to free them while Beric waits in the cold.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lay the sound footboards over the difficult gap and support Beric across the stones.",
          "nextNodeId": "AB13A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cushion the hurdle and share a level carry with Eda along the broad stepping stones.",
          "nextNodeId": "AB13C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB13A",
      "turn": 13,
      "title": "A Narrow Wooden Bridge",
      "narrative": [
        "The footboards sit firmly across the wide gap once you lash them against sliding. With Eda on one side and you on the other, Beric crosses without using his injured foot. He rests on the far bank while you return for Thorne.",
        "The horse takes the gravel line at a slow walk. Eda leads the ewes after him, keeping the lambs between familiar bodies until all twelve reach the turf. You recover the rope and leave the boards secured for the next traveler.",
        "The lower bench stretches toward Rowan Hollow, pale in the failing light. Eda is trying to hide how much the crossing has taken out of her; Beric notices and presses her hand."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Give the shepherds a short sheltered rest with food before asking them to continue.",
          "nextNodeId": "AB14A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Check each sheep and lamb at the landing while Eda catches her breath.",
          "nextNodeId": "AB14B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave immediately at a trot to regain every moment spent crossing the ford.",
          "failTitle": "Strength Spent Twice",
          "failText": "Eda cannot match the pace after the lift, and the flock strings out behind her. You must turn back repeatedly until darkness overtakes the scattered party on the bench.",
          "death": false
        }
      ]
    },
    {
      "id": "AB13B",
      "turn": 13,
      "title": "A Handline Over the Stones",
      "narrative": [
        "Thorne crosses unloaded along the gravel and waits on the far bank. You secure the handline, then return to support Beric while Eda steadies his other side. His sound leg does the work his injured ankle cannot bear.",
        "Once he is seated on dry turf, Eda brings the flock through the shallows. Nine ewes and three lambs climb onto the landing. You coil the rope again and retrieve the bags before helping Beric back toward Thorne.",
        "The crossing has brought everyone below the blocked ridge, but it has also spent Eda's last easy strength. Ahead, the lower paths are losing their outlines in the evening light."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Adjust Beric's padding and Thorne's load before the final descent.",
          "nextNodeId": "AB14C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Eda back through the ford to fetch the unused footboards for firewood.",
          "failTitle": "A Crossing Asked Too Often",
          "failText": "Eda slips while trying to bring both heavy boards through the ford. The cold water leaves her unable to walk, and you no longer have the means to carry both shepherds down together.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Count and examine the flock at the landing before putting it onto the narrower lower lane.",
          "nextNodeId": "AB14B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB13C",
      "turn": 13,
      "title": "Four Hands on the Hurdle",
      "narrative": [
        "You and Eda lift together, keeping the padded hurdle level as you move from one broad stone to the next. Beric holds the sides without shifting his weight. On the far bank, you set him down before either carrier relaxes a hand.",
        "Thorne crosses the shallow gravel without a rider. Eda then guides the twelve sheep through, and you return the hurdle to the near bank for future use. Your rope and the remaining dry supplies come with you onto the lower bench.",
        "Beric is ready to ride again, but his cloak has bunched beneath him. Eda stands beside the flock with closed eyes for a moment, gathering herself for the last part of the journey."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep Beric strapped to the hurdle and lash it sideways across Thorne for the descent.",
          "failTitle": "An Unsteady Load",
          "failText": "The broad litter catches a bank as Thorne turns, twisting across the saddle. Beric is thrown against the frame, and the improvised arrangement leaves him unable to continue safely.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Resettle Beric's cloak and ankle padding, checking that Thorne's load remains even.",
          "nextNodeId": "AB14C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Find a sheltered hollow for a brief drink and rest before remounting Beric.",
          "nextNodeId": "AB14A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB14A",
      "turn": 14,
      "title": "A Mouthful in Shelter",
      "narrative": [
        "The short rest lets Eda stop shivering long enough to eat. You keep it brief, wrapping Beric against the wind and giving Thorne a chance to breathe before helping the older shepherd back into the saddle.",
        "Eda admits that she knows the lower path in daylight, not under snow at dusk. Three approaches lead toward Hedd's farm: a low path whose bends can be marked, a sheltered hedge lane, and a line of old boundary stones.",
        "The cloud above Rowan Hollow has broken apart. Stars will mean colder ground below, so you need a route the tired shepherd and the flock can follow without constant guessing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark the lower path's bends with pale cloth tied to bushes as you lead the party down.",
          "nextNodeId": "AB15A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Eda sleep while you leave her beside the bench and take Beric down first.",
          "failTitle": "A Second Journey Too Late",
          "failText": "Eda cannot keep warm alone once the party leaves. Your return climb finds her unable to walk, and the divided rescue has placed both shepherds beyond the help you can carry.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Light the hooded lantern and take the sheltered hedge lane at a measured walk.",
          "nextNodeId": "AB15B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB14B",
      "turn": 14,
      "title": "Twelve at the Landing",
      "narrative": [
        "Counting at the landing confirms nine ewes and three lambs. You clear a clump of icy mud from one ewe's foot while Eda leans against a bank to rest. Beric waits on Thorne, wrapped against the wind with his ankle supported.",
        "The simple count matters to Eda: none of the day's trouble has cost her an animal. She still cannot promise to recognize every turn below in this light. There is a hedge lane, a lower winding path, and a route marked by old boundary stones.",
        "You see the first clear patch of evening sky above Rowan Hollow. The rescued party must reach shelter, and Hedd must still be keeping watch over the crops."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the boundary stones, checking the ground between each pair before advancing.",
          "nextNodeId": "AB15C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Eda's hooded lantern to guide the flock down the sheltered hedge lane.",
          "nextNodeId": "AB15B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the slower ewe here to find its own way home after the flock.",
          "failTitle": "Following the Missing One",
          "failText": "The ewe's lamb refuses to leave and runs back uphill. Eda follows before you can stop her, splitting the party just as the light fails and undoing the controlled descent.",
          "death": false
        }
      ]
    },
    {
      "id": "AB14C",
      "turn": 14,
      "title": "A Fold in the Cloak",
      "narrative": [
        "Straightening Beric's cloak removes a hard fold beneath his thigh, and fresh padding keeps the injured ankle clear of the stirrup. You rebalance the bags before taking Thorne's rein. The horse stands patiently while Eda gathers the flock close.",
        "Eda admits that weariness is making the lower paths look unfamiliar. She can name three approaches to Hedd's farm, but you will have to lead: the boundary stones, the winding lower path, or the hedge lane with her lantern.",
        "Snow has stopped falling. The newly open sky offers better sight of the slope without promising warmth, and a white edge is beginning to stiffen the puddles beside your boots."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Bind Beric's injured ankle tightly into the stirrup so it cannot move on the descent.",
          "failTitle": "A Foot Held Fast",
          "failText": "The fixed ankle cannot move when Thorne steps down a bank. Beric's cry stops the party, and the painful binding has turned a manageable injury into one that prevents further riding.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Tie pale cloth at the bends of the lower path so Eda can keep the flock behind you.",
          "nextNodeId": "AB15A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the boundary-stone route and verify each short stretch before bringing the others along.",
          "nextNodeId": "AB15C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB15A",
      "turn": 15,
      "title": "Cloth in the Dusk",
      "narrative": [
        "The pale cloth marks each bend as you descend, giving Eda something plain to follow whenever the flock hides your boots. You keep the gaps short enough that she never has to choose between two unseen turns. Thorne carries Beric steadily behind your shoulder.",
        "At last, a warm square of light appears in Hedd's farmhouse. His barn stands beyond the lower gate, with a sheltered stockyard beside it. The last strip of open ground is firm, though frost is beginning to silver the grass.",
        "Eda calls the sheep through the final bend. You answer Hedd's shout from the doorway and tell him both shepherds are alive."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Bring the shepherds into the prepared barn and have Hedd send hands back for the animals.",
          "nextNodeId": "AB16A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guide the flock into the sheltered stockyard while calling Hedd to meet Beric.",
          "nextNodeId": "AB16B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut across the white pond margin to reach the farmhouse light sooner.",
          "failTitle": "Light Beyond Thin Ice",
          "failText": "The pond edge looks like frosted ground until Thorne breaks through it. Recovering horse and rider from the cold mud becomes an emergency within sight of the shelter you nearly reached.",
          "death": false
        }
      ]
    },
    {
      "id": "AB15B",
      "turn": 15,
      "title": "The Covered Lantern",
      "narrative": [
        "The hooded lantern shows the hedge lane a few paces at a time. You keep its light low enough to reveal ruts without dazzling Eda behind you. The flock follows her voice, and Beric stays balanced on Thorne through the last descent.",
        "Hedd's farmhouse appears beyond the gate. He has left a light facing the mountain and cleared the barn's inner bay. The sheltered stockyard is ready too, with a water bucket standing beyond the frost.",
        "You call before the sheep reach the gate, giving Hedd time to bring help. Eda's shoulders fall when she recognizes the sound of his answer."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Gather Hedd's helpers at the gate and assign the unloading before entering the barn.",
          "nextNodeId": "AB16C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hang the lantern against the haystack so every animal can see the stockyard entrance.",
          "failTitle": "Fire Beside the Return",
          "failText": "Dry hay catches from the poorly placed lantern. The helpers abandon the arriving party to fight the flames, and the safe shelter becomes the night's next danger.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Put the flock into the sheltered stockyard and have Hedd's helpers take Thorne's rein.",
          "nextNodeId": "AB16B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB15C",
      "turn": 15,
      "title": "The Last Boundary Stone",
      "narrative": [
        "Checking the ground between the boundary stones carries the party down without a wrong turn. At the last stone, you can see Hedd's lower gate and the farmhouse window left bright for you. Beric lifts a hand from Thorne's mane in recognition.",
        "The barn bay is ready for the shepherds, and a stockyard lies sheltered behind it. Eda brings the twelve sheep close while you call Hedd outside. He starts toward you with a blanket over one arm.",
        "The return is nearly finished, but tired people can still be hurt by a hurried dismount. You stop on level ground long enough to decide who will hold the horse and who will support Beric."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell Beric to slide down unaided while you open the stockyard for the sheep.",
          "failTitle": "The Last Unattended Step",
          "failText": "Beric's injured ankle folds beneath him when he reaches the ground. The preventable fall ends your return with a second injury at the very door of safety.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Bring Hedd and two helpers to the gate and give each a clear part in the unloading.",
          "nextNodeId": "AB16C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Beric and Eda straight to the barn while Hedd gathers hands for the flock.",
          "nextNodeId": "AB16A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB16A",
      "turn": 16,
      "title": "The Bay Hedd Kept Ready",
      "narrative": [
        "Hedd meets you in the barn and helps lower Beric onto the prepared bedding. Eda sits beside her father with both hands around a cup. The helpers bring Thorne and all twelve sheep into the sheltered yard, leaving you free to check the injured ankle.",
        "Warm food, dry clothing, and a place out of the wind do more than hurried promises. You loosen Beric's damp boot carefully and settle his foot on folded wool. Hedd agrees to fetch the village healer while Eda stays with him.",
        "Outside, the sky has cleared. Hedd kept the field covers watched, as you asked, but a worker reports that several mats have sagged and the lowest vegetable strip is whitening."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the seed-bean covers and lift the sagging mats clear of the flower stems.",
          "nextNodeId": "AB17A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rouse Beric at once and have him demonstrate the mountain route to every curious neighbor.",
          "failTitle": "A Welcome Without Rest",
          "failText": "The questioning keeps the exhausted shepherd upright until he can no longer answer clearly. Eda sends the crowd away herself and refuses further help from the ranger who made her father an exhibit.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take spare reeds and straw to strengthen shelter around the lowest vegetable strip.",
          "nextNodeId": "AB17B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB16B",
      "turn": 16,
      "title": "A Yard Full of Breathing",
      "narrative": [
        "The flock enters the stockyard in a close knot, and Hedd's helpers take Thorne's rein before you dismount Beric. Nine ewes and three lambs settle behind the windbreak. For the first time since the fold, Eda has no animal left to call.",
        "You bring both shepherds into the barn for dry bedding and warm food. Beric's ankle rests on folded wool while Hedd sends for the village healer. Thorne is rubbed down and fed, his work finished for the night.",
        "Hedd says the seed covers have remained in place, but the clearing sky is bringing a sharper cold to the lower gardens. There are still spare reeds and dry straw in the barn."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Check the remaining seed sacks and move the driest reserve into the raised inner store.",
          "nextNodeId": "AB17C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Extend the garden's reed shelter and add supported straw mats above the exposed seed plants.",
          "nextNodeId": "AB17B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pack the sheep tightly into the narrow passage beside the sleeping shepherds to share their warmth.",
          "failTitle": "No Room to Stand",
          "failText": "A frightened ewe turns in the crowded passage and the flock surges behind her. Beric's bedding is struck before the animals can be freed, spoiling the safe refuge you brought him home to reach.",
          "death": false
        }
      ]
    },
    {
      "id": "AB16C",
      "turn": 16,
      "title": "Hands Given Their Work",
      "narrative": [
        "Your instructions at the gate give Hedd the horse's head and two helpers Beric's weight. Eda can guide the flock into the stockyard without trying to support her father at the same time. The careful unloading takes less time than a muddled rush.",
        "Inside the barn, both shepherds receive dry bedding and warm food. You support Beric's ankle while Hedd sends for the village healer. Thorne is fed and rubbed down; the twelve sheep have shelter and water beside him.",
        "The farm has kept its basic crop protection in place, but frost is now reaching beyond the low hollows. Hedd points out the remaining mats and asks you to look at the seed reserve before any is given out."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Give the last dry blankets to the field workers before checking whether the shepherds are warm.",
          "failTitle": "A Rescue Undone Indoors",
          "failText": "Beric's bedding is stripped while his clothes are still being changed. He begins shivering again, and Eda must pull workers from the fields to find back the warmth the barn had promised.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Walk the bean seed rows and reset covers that the wet snow has pulled down.",
          "nextNodeId": "AB17A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Separate the dry planting reserve from the eating grain and raise it clear of damp walls.",
          "nextNodeId": "AB17C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB17A",
      "turn": 17,
      "title": "The Sagging Reed Mat",
      "narrative": [
        "Resetting the bean covers restores the air space above the flowers. You replace a bowed support with a stronger forked stick and show the nearest worker how to lift pooled water away without shaking it onto the plants.",
        "Hedd brings the remaining hands through the garden, sharing mats with households whose seed rows have little shelter. The spare planting sacks stay dry in the barn. Nobody can cover every leaf, so you keep the effort on what will make another sowing possible.",
        "A clear star appears above the mountain. The cold is no longer arriving as falling snow; it lies quietly over the wet fields, and someone must keep watching after the tools are put away."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Set a short watch along the low field edge to warn when the cold reaches the higher beds.",
          "nextNodeId": "AB18A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay beside the covered seed plot and check that its supports hold through the night.",
          "nextNodeId": "AB18B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pile fresh wet snow onto the mats to make a thicker roof over the flowering beans.",
          "failTitle": "Too Much on the Frames",
          "failText": "The added weight bows the covers into the flowers you just freed. Several frames collapse before the workers can lift them, destroying the best seed rows under their own protection.",
          "death": false
        }
      ]
    },
    {
      "id": "AB17B",
      "turn": 17,
      "title": "The Last Open Strip",
      "narrative": [
        "The extra reeds slow the wind along the vegetable strip, and light straw mats rest above the seed plants on borrowed frames. Hedd leaves the strongest helpers to check those frames rather than trust their first hurried knots.",
        "Other workers reset loose bean covers and move the remaining planting sacks away from the barn's damp wall. Across the hollow, neighbors pass spare material over fences. There is not enough to make the whole village safe from loss, but enough to share the chance of planting again.",
        "The mountain has become a dark outline under clear stars. Beric and Eda are sheltered below it now; your last work outdoors is to keep weariness from undoing the precautions already made."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Return to the barn and arrange relief for the tired people tending the shepherds.",
          "nextNodeId": "AB18C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Build a high open fire against the reed screen to warm the entire vegetable strip.",
          "failTitle": "Warmth That Runs",
          "failText": "A gust carries flame into the dry reeds. The workers tear down the shelter to stop the fire reaching the roofs, exposing the crop while the village fights a danger of your making.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Watch the covered seed beds for shifting mats and weakening ties as the temperature falls.",
          "nextNodeId": "AB18B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB17C",
      "turn": 17,
      "title": "Seed Kept for Spring",
      "narrative": [
        "The planting sacks are separate from the grain intended for food, with boards beneath them and space between the cloth and the damp wall. Hedd ties a different cord around each reserve so a tired helper cannot empty it into the kitchen pot.",
        "Outside, the workers maintain the bean covers and add the last light mats to the exposed vegetable beds. You divide the remaining seed fairly on paper before anyone needs it, recording a reserve for the poorest households as well as the larger farms.",
        "Frost glitters along the barn threshold. The tools can rest, but the people watching the fields and the two shepherds still need someone to notice when they are worn out."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the kitchen use the marked reserve sacks tonight and promise that Aldric will replace them.",
          "failTitle": "A Promise Cannot Be Sown",
          "failText": "By dawn, seed meant for the smallest gardens has been cooked with the eating grain. No replacement is at hand, and Hedd cannot honor the shares you recorded only hours before.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take a turn in the warm barn so Eda and the helpers can rest while Beric is watched.",
          "nextNodeId": "AB18C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Walk the low field boundary and arrange a warning if frost reaches the higher seed plots.",
          "nextNodeId": "AB18A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB18A",
      "turn": 18,
      "title": "White at the Lower Fence",
      "narrative": [
        "Watching the low field edge shows frost creeping into the grass while the upper lane remains damp. You send a worker to check the nearest covers, then shorten the watches so no tired person stands out alone for too long.",
        "From the barn comes the quiet sound of Eda telling Hedd where the ridge path is blocked. Beric has food, dry bedding, and someone beside him. You can hear Thorne moving comfortably in the sheltered yard.",
        "Near dawn, the wind stirs again and the stars begin to fade. It will take daylight to judge the fields honestly. White leaves are not a reason to start tearing up every plant before the morning has reached it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Wait for daylight and assess the exposed rows from the paths before handling chilled plants.",
          "nextNodeId": "AB19A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the youngest watcher alone up the ridge to learn whether the mountain path has thawed.",
          "failTitle": "The Watcher Who Does Not Return",
          "failText": "The child follows your order onto the same blocked route you abandoned. When the warning comes back too late, the village must begin another search before the first night's work is finished.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Compare the low hollow with the higher lane so the village can understand the frost's uneven reach.",
          "nextNodeId": "AB19B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB18B",
      "turn": 18,
      "title": "A Knot in the Dark",
      "narrative": [
        "Your watch beside the seed beds catches one loosened tie before its mat slips. You fasten it with a longer cord and leave a smooth stick through the knot so cold fingers can release it later. Hedd sends a rested worker to share the round.",
        "The barn remains quiet apart from an occasional word between the shepherds. The healer has arrived there, and Eda finally lies down beside her father's bedding. Thorne and the flock have water and shelter behind the yard wall.",
        "When the eastern sky lightens, frost lies thickest in the lower gardens. Higher grass is merely wet. The difference offers a useful explanation, provided the village hears observation instead of another frightened rumor."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Count the surviving food, seed, and fodder with Hedd while the frozen fields warm naturally.",
          "nextNodeId": "AB19C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Show Hedd the difference between the lower garden and upper lane before anyone names a cause.",
          "nextNodeId": "AB19B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear every mat off at first light so the villagers can see immediately which plants have failed.",
          "failTitle": "The Hasty Uncovering",
          "failText": "Wet mats drag across stiff leaves and break flower stems as the workers pull them away. Your demand for an instant answer creates damage that the night itself had spared.",
          "death": false
        }
      ]
    },
    {
      "id": "AB18C",
      "turn": 18,
      "title": "The Watch Beside the Bedding",
      "narrative": [
        "Taking the barn watch allows Eda to sleep while you sit within reach of Beric's cup and blanket. The healer arrives and examines his ankle. Outside, Hedd keeps the field rounds going with workers relieved before their hands become clumsy.",
        "Beric tells you he stayed at the fold because he thought summer snow must pass quickly. You answer without reproach: next time, the first change of wind deserves more attention than the date on a feast calendar. He nods and closes his eyes.",
        "Dawn brings enough light to see the stored sacks and the quiet flock through the open inner door. What remains must be counted carefully before promises outrun the village's means."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare Beric fit to ride at dawn because a full night's rest must have healed the injury.",
          "failTitle": "The Journey Demanded Too Soon",
          "failText": "Beric tries to rise rather than disappoint you, but his ankle will not carry him. The needless attempt undoes his settled rest and forces the healer to start the morning with a preventable setback.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Examine the exposed field rows from the paths, leaving the cold plants undisturbed until later.",
          "nextNodeId": "AB19A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Make a sober count of food, seed, and fodder with Hedd before deciding what help to request.",
          "nextNodeId": "AB19C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB19A",
      "turn": 19,
      "title": "What the Morning Spares",
      "narrative": [
        "Your first inspection stays on the paths. Some exposed bean flowers hang dark and limp; beneath the supported mats, enough remain upright to justify patient care. You mark damaged rows for a later assessment instead of pulling them out while the leaves are still cold.",
        "Hedd reports that the seed reserve is dry and the lowest gardens have suffered most. Eda is awake beside her father, whose ankle will need rest. The twelve sheep feed quietly, and Thorne watches the returning workers from the yard.",
        "There is loss to face, but no mystery left that requires an enemy. The northerly storm brought mountain snow; the clearing night punished the sheltered low ground after the wind had passed."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Gather the households to assign seed shares and a watch for any second cold night.",
          "nextNodeId": "AB20A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Record the blocked ridge path and arrange a warning at the lower mountain junction.",
          "nextNodeId": "AB20B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Have the workers uproot every darkened plant now so no household can hide its losses.",
          "failTitle": "Roots Taken Before Judgment",
          "failText": "Plants that might have recovered are pulled with the ruined ones. The inspection becomes an argument over destroyed property, and Hedd cannot turn the morning's evidence into a fair plan.",
          "death": false
        }
      ]
    },
    {
      "id": "AB19B",
      "turn": 19,
      "title": "An Explanation People Can See",
      "narrative": [
        "Comparing the garden and upper lane gives Hedd a clear account to repeat. The same storm crossed both, but the calm hollow held the sharper night cold. You show the villagers the surviving sheltered plants rather than ask them to trust your word alone.",
        "There will still be damaged beans and cabbages when the fields warm enough to examine closely. The seed reserve remains dry, and the shepherds are alive under the healer's care. Eda confirms all twelve sheep are feeding in the yard.",
        "Hedd asks what should be done before anyone returns uphill. The drifted ridge is still dangerous, and Beric's injury will keep him from tending the flock for some time."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Arrange help for the Wrens' flock and a place for Beric to recover without pressure to travel.",
          "nextNodeId": "AB20C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce that every mountain path is safe now because the cause of the snow is understood.",
          "failTitle": "Knowledge Without Caution",
          "failText": "A family takes your assurance as leave to use the summer ridge. The next report is of travelers stranded at the hidden edge, turning an explanation into a dangerous promise.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the mountain closure and name the people who will inspect the route when conditions improve.",
          "nextNodeId": "AB20B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AB19C",
      "turn": 19,
      "title": "The Count on the Barn Door",
      "narrative": [
        "Counting the sacks with Hedd replaces rumor with a smaller, harder truth. There is food for the immediate need and dry seed for a beginning, but losses in the exposed gardens may require help before the next sowing. You record only what is actually there.",
        "Eda checks the nine ewes and three lambs while the healer tends Beric. He will need time off the mountain. Thorne has eaten and rested, though you have no intention of making him climb again merely because the sky is clear.",
        "The first warmth reaches the higher lane before the hollow's white grass. Yesterday's strange snow has become a set of ordinary duties: protect the reserve, share the work, and warn the next person who takes that road."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise every household a full replacement harvest from the sacks you have just counted.",
          "failTitle": "More Promised Than Stored",
          "failText": "The first distribution empties the reserve before half the households are served. Hedd must break your promise at the barn door, leaving the smallest farms with neither seed nor trust.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Settle who will tend the flock while Beric rests and Eda recovers from the rescue.",
          "nextNodeId": "AB20C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Call the households together to agree seed shares and keep a second night's watch.",
          "nextNodeId": "AB20A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB20A",
      "turn": 20,
      "title": "The Shares Agreed",
      "narrative": [
        "The seed meeting ends with each household knowing its share and its turn on the next watch. Hedd keeps the written count, while two neighbors check it aloud. No one is asked to believe that the damaged gardens will recover merely because people have worked hard.",
        "Eda sits at the barn door with a blanket around her shoulders. Beric is resting under the healer's care, and neighbors have agreed to tend the flock. The mountain junction carries a warning about the buried ridge path.",
        "You saddle Thorne for the road to Duke Aldric's steward. Behind you, the midsummer garland is thawing one drop at a time. The request you carry can describe both what Rowan Hollow has saved and what it still needs."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the witnessed seed count and a measured request for relief to Aldric's steward.",
          "nextNodeId": null,
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize the smallest households' seed shares as payment for the rescue before you leave.",
          "failTitle": "The Price of Coming Home",
          "failText": "Hedd tears up the distribution rather than enforce your demand. The rescue ends in a levy on the people least able to bear it, and Rowan Hollow petitions Aldric against his ranger.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry Hedd's account of the losses to the steward and ask for supplies pending a fuller count.",
          "nextNodeId": null,
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AB20B",
      "turn": 20,
      "title": "A Warning at the Ash",
      "narrative": [
        "The route warning names the buried ridge bend plainly and directs travelers to seek local guidance for the lower ford. Hedd assigns a pair to inspect conditions together before any reopening. Nobody is sent uphill merely to prove that yesterday's fear has ended.",
        "At the barn, the healer has Beric resting and Eda has help with the flock. The seed reserve is divided by an agreed count, with a watch kept for another cold night. Damage remains in the fields, but the village has work it can undertake without guessing.",
        "Thorne waits at the gate as you prepare an account for Duke Aldric's steward. The mountain is visible again, every white gully ordinary in daylight and still deserving respect."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Hedd responsible for the route watch and carry a brief request for food and seed to the steward.",
          "nextNodeId": null,
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record the lower route, crop losses, and named local duties so Aldric's help reaches the right needs.",
          "nextNodeId": null,
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove the warning to keep merchants from thinking Rowan Hollow is unsafe to visit.",
          "failTitle": "An Empty Post at the Turning",
          "failText": "The next travelers take the summer ridge because nothing tells them otherwise. Hedd must send help uphill again, and your concern for appearances has made the village repeat its hardest night.",
          "death": false
        }
      ]
    },
    {
      "id": "AB20C",
      "turn": 20,
      "title": "The Flock Without Its Shepherd",
      "narrative": [
        "Neighbors agree to tend the twelve sheep while Beric's ankle mends. Eda will help when she has rested, but nobody treats her return as proof that she should immediately shoulder two people's work. Her father thanks you more readily for that arrangement than for the ride down.",
        "Hedd has the seed shares counted and a watch arranged for the next cold night. The mountain junction carries a warning, and the lower crossing will be inspected before being recommended to strangers. The exposed gardens still bear losses that kindness alone cannot mend.",
        "You take Thorne's rein at the gate. Eda returns the dried wool to your bag and asks you to tell Aldric's steward exactly what happened, including the things the village managed for itself."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Order Eda to lead a party back to the fold today to recover the abandoned hurdle.",
          "failTitle": "One More Duty Too Many",
          "failText": "Eda refuses to risk her exhausted neighbors for a piece of timber. Your final order divides the people who worked together through the night, and the village ends your authority over the recovery.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Hedd to finish the household counts while you take the shepherds' account to Aldric's steward.",
          "nextNodeId": null,
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Bring the steward a witnessed account of the rescue, remaining stores, and the relief still needed.",
          "nextNodeId": null,
          "scoreDelta": 1
        }
      ]
    }
  ]
});
