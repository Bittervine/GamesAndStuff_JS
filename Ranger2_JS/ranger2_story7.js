window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "black-sluice-of-sallow-mere",
  "title": "The Black Sluice of Sallow Mere",
  "summary": "When horned saboteurs begin stealing keys from the old marsh floodgates, the ranger of Brackenwald rides into the Deep Marshes to stop a disgraced waterwright from opening a buried master-sluice, tearing apart the river works, and reaching a war cache hidden beneath a drowned priory.",
  "maxTurns": 20,
  "startNodeId": "K01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "Corren Vane's design fails at the edge of triumph. The marsh works hold well enough for spring planting, the lower farms are warned in time, and Duke Aldric comes in person to witness the sealed toll cellar beneath Saint Edda's drowned stones. Fenbridge speaks your name with relief rather than dread, Elsbeth's wardens keep the banks, and the Deep Marshes remember that careful hands, not old fear, rule the water.",
    "low": "You keep the Deep Marshes from utter ruin, but not from loss. Water takes fields, rumors linger, and Saint Edda's drowned priory becomes a place men speak of with lowered voices. Whether Corren dies, escapes, or is dragged out in irons, the damage leaves its mark on Fenbridge and the lower lanes. Duke Aldric still has reason to thank you, yet the spring in Sallow Mere begins under a hard sky and harder memory."
  },
  "nodes": [
    {
      "id": "K01A",
      "turn": 1,
      "title": "The Duke's Summons - Hall Road",
      "narrative": [
        "Late in the thaw, a groom found you in Oakenhurst's lower yard and brought you straight to Duke Aldric's hall with mud still on your boots. Elsbeth Rook of the marsh wardens stood before the hearth in a wet cloak, and on the table lay a split reed marker, an iron key ring shorn clean through, and a willow mask carved into the shape of a stag's narrow face.",
        "Aldric spoke without ceremony. Two floodgates in the Deep Marshes had been tested in the night, a bund near Fenbridge had been cut, and frightened folk were already saying the old drowned saints had sent riders back out of the fog. The duke wanted none of it left to rumor. Elderwood, the Riverland road, and the lower fields all depended on the marsh works holding through the spring swell.",
        "Thorne was saddled before the duke finished. Brother Senan at Saint Edda's chapel knew more of the old waterworks than any man still living, but the freshest sign lay at Fenbridge, where the cut bank would still be speaking to a patient eye if you reached it before dawn."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ride for Fenbridge at once and read the breach before dawn.",
          "scoreDelta": 1,
          "nextNodeId": "K02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stop first at Saint Edda's chapel and hear Brother Senan's account.",
          "scoreDelta": 0,
          "nextNodeId": "K02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait for a larger escort and let the night pass.",
          "failTitle": "The Water Gets Ahead of You",
          "failText": "By the time more men are gathered, a second gate has been struck and fear has outrun truth all through the Deep Marshes. You begin the hunt already behind the flood.",
          "death": false
        }
      ]
    },
    {
      "id": "K01B",
      "turn": 1,
      "title": "The Chapel Warning - Marsh Road",
      "narrative": [
        "You reached Saint Edda's chapel ahead of the duke's formal summons because Brother Senan had sent a bell rope runner in plain terror. On the little stone table beside his lamp lay a mud-black lantern hood, a broken gate pin, and a strip of willow bark shaved into the likeness of antlers.",
        "Senan's hands shook as he told you that men had come through the mist speaking in muffled voices and taking measurements from the old sluice markers as if they belonged there. Before he could say more, Elsbeth Rook rode into the yard with news that Fenbridge had lost a bund in the same night.",
        "The priest had lore, and the marsh bank had fresh truth. Between them lay the shape of the matter, if you could choose the better first cut through it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay a little longer and force Senan to show every surviving chart he has.",
          "scoreDelta": 0,
          "nextNodeId": "K02C"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take Senan's warning as enough and ride hard for Fenbridge.",
          "scoreDelta": 1,
          "nextNodeId": "K02A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Spread the tale through the chapel yard to rouse the countryside at once.",
          "failTitle": "Panic Before Proof",
          "failText": "The rumor of horned marsh riders runs faster than any horse. Roads clog, witnesses invent what they did not see, and the true trail vanishes into frightened noise.",
          "death": false
        }
      ]
    },
    {
      "id": "K01C",
      "turn": 1,
      "title": "The Broken Bund - Reed Road",
      "narrative": [
        "You were already on the reed road when the summons found you, having ridden out on a lesser complaint of strange lights over Sallow Mere. Near Fenbridge you found the night's work yourself: a reed-bund sliced through low and clean, not hacked by drunks or boys, and a ward marker driven upside down into the mud.",
        "Thorne stamped at the smell of fresh silt while villagers gathered in doorways and whispered of a stag-headed thing that had passed soundlessly between the dikes. Then Elsbeth arrived with the duke's order in her mouth and Brother Senan's name close behind it.",
        "The marsh could be read from where you sat, but only if you chose whether to trust the freshest mud, the oldest memory, or your own impatience."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Spur after the first glimmering light in the fog without taking stock.",
          "failTitle": "Will-o'-the-Wisp",
          "failText": "The light leads you onto a drowned shelf. By the time you claw back out, the true riders are long gone and the marsh has taken the lead.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Work the bank carefully and let the signs tell you where the saboteurs went.",
          "scoreDelta": 1,
          "nextNodeId": "K02B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Push straight along the reed road in hope of sighting the culprits quickly.",
          "scoreDelta": 0,
          "nextNodeId": "K02C"
        }
      ]
    },
    {
      "id": "K02A",
      "turn": 2,
      "title": "Fresh Sign at Fenbridge - Clear Lead",
      "narrative": [
        "By riding straight from Oakenhurst or taking the best of the first signs, you reached Fenbridge while the breach was still raw. The cut in the bund was low, deliberate, and cleanly tied back with ditcher's knots before it was opened, which told you at once that no spirit had done it and no common poacher either.",
        "Elsbeth joined you among the wet reeds as dawn showed a line of pole-sledge marks dragging away from the bank. The ferry rope had been sawn half through, a grain tally shed forced, and one gate key taken from the keeper's chest while the poorer iron copies were left behind.",
        "Whoever had come in the night knew marsh work and knew exactly what iron mattered. The fresh marks ran toward an old towpath above the black water, though frightened villagers were already begging you to stay and hear what they thought they had seen."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the keeper's yard and question Fenbridge's witnesses before the trail dries.",
          "scoreDelta": 0,
          "nextNodeId": "K03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wade alone into the dark culvert beneath the broken bund.",
          "failTitle": "Taken by the Cut",
          "failText": "The culvert drops into a blind surge under the bank. Cold water slams you into stone and the marsh closes over the hunt.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the pole-sledge marks at once and cut for the old towpath.",
          "scoreDelta": 1,
          "nextNodeId": "K03A"
        }
      ]
    },
    {
      "id": "K02B",
      "turn": 2,
      "title": "Marsh Lore and Fading Mud - Steady Ground",
      "narrative": [
        "By stopping for Brother Senan or reading the outer signs with patience, you entered the Deep Marshes with more sense of the old works and less of the night's haste. Senan named half-forgotten feeder cuts and warned that the oldest sluices had once been tied to Saint Edda's drowned priory before later dukes rebuilt the banks.",
        "At Fenbridge the freshest hoof marks had already softened, yet enough remained to show disciplined passage: boots wrapped in cloth, a pole-sledge for heavy iron, and blackened lantern glass used to hide flame in fog. Elsbeth listened without interruption and looked more troubled with every word.",
        "The trail was no longer shouting, but it still spoke. You could use the priest's knowledge to cut ahead of it, or spend more time among the houses and risk letting the men who knew the marsh best slip deeper into it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Senan's old survey marks to cut ahead toward the towpath.",
          "scoreDelta": 1,
          "nextNodeId": "K03A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the houses, stables, and keeper's shed for one clue too many.",
          "scoreDelta": 0,
          "nextNodeId": "K03C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust Reeve Niall's easy offer of a guide through the side channels.",
          "failTitle": "Led into Black Water",
          "failText": "The guide turns you onto a blind shelf and vanishes. Arrows come out of the reeds before you ever see the men who loosed them.",
          "death": true
        }
      ]
    },
    {
      "id": "K02C",
      "turn": 2,
      "title": "Trampled Banks - Lost Ground",
      "narrative": [
        "By pushing on the broad road or lingering too long over first reports, you reached Fenbridge after fear had begun its own work. Children had been moved indoors, men spoke over one another, and a dozen helpful feet had trampled the very margin that might have told you most.",
        "Still, some truth endured. A ferryman's mooring pin lay bent near the cut bund, and in a patch of unsullied mud you found the mark of a pole-sledge hauling weight toward the old towpath. An old woman swore she had heard no ghostly singing at all, only the scrape of iron and one man coughing like a ruined bellows.",
        "The marsh had been muddled, not silenced. You could still recover the line of the hunt if you worked with care, or lose more of it by treating every frightened shout as if it mattered alike."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow a chain of lantern rumors into the drowned reed beds at once.",
          "failTitle": "The Marsh Takes Its Due",
          "failText": "The lights are bait and the ground beneath them false. You vanish into a sink no map remembers.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the ferryman's pin and the old woman's word, then rebuild the trail piece by piece.",
          "scoreDelta": 1,
          "nextNodeId": "K03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride straight for the towpath and hope speed will mend what time has spoiled.",
          "scoreDelta": 0,
          "nextNodeId": "K03C"
        }
      ]
    },
    {
      "id": "K03A",
      "turn": 3,
      "title": "Towpath Sign - Clear Lead",
      "narrative": [
        "By pressing the fresher marks or cutting ahead with good lore, you gained the old towpath before sun and wind could spoil it. There you found exactly what Elsbeth had begun to suspect: willow masks shaved into stag faces, bootprints from men who moved in file, and fresh drag marks where a heavy iron piece had twice been shifted by practiced hands.",
        "An abandoned charcoal shed stood above the towpath, its floor black with pitch and old ash. Inside were reed wraps for lanterns, a Fenbridge grain sack used as packing, and a carved tally notch that looked less like a woodsman's mark than the work sign of a crew that had once labored together.",
        "The towpath bent toward an alder rise and then split. One branch led for the back side of Fenbridge, the other toward a half-forgotten dike house on Heron Reach that only older marsh hands still named without thinking."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Circle wide with Thorne and cut for the alder rise before anyone can be warned.",
          "scoreDelta": 1,
          "nextNodeId": "K04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Step into the open and call a challenge down the path.",
          "failTitle": "Bolts from the Reeds",
          "failText": "Crossbow quarrels answer your voice from both sides of the towpath. The ambush was waiting for exactly such pride.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the charcoal shed and gather every sign before moving on.",
          "scoreDelta": 0,
          "nextNodeId": "K04B"
        }
      ]
    },
    {
      "id": "K03B",
      "turn": 3,
      "title": "Towpath Sign - Recovered Trail",
      "narrative": [
        "By securing the keeper's yard or patiently rebuilding the trail from broken pieces, you reached the towpath later but not empty-handed. The ferryman's bent pin matched a drag groove there, and the grain sack in the charcoal shed tied the raiders back to Fenbridge more neatly than any ghost story could untie.",
        "You also found black pitch smeared on the lantern wraps and a willow shaving with careful knife work rather than rustic roughness. Whoever was leading this had both craft and an eye for fear. The men wanted villagers talking of marsh spirits while real labor moved under cover of that talk.",
        "A direct cut might still let you get ahead of them, yet Fenbridge's reeve would soon hear you were asking better questions than rumor could answer. If there was an inside hand, time around the village would help him most."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Go openly to Fenbridge and hear the reeve's account before the village closes against you.",
          "scoreDelta": 0,
          "nextNodeId": "K04C"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Slip through the willow cut and come at Fenbridge by the back dike.",
          "scoreDelta": 1,
          "nextNodeId": "K04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Put the charcoal shed to the torch to flush out hidden men.",
          "failTitle": "Fire on the Reed Line",
          "failText": "The blaze runs faster than you judge. By dawn half the bank is burning and every useful witness curses your name.",
          "death": false
        }
      ]
    },
    {
      "id": "K03C",
      "turn": 3,
      "title": "Towpath Sign - Spoiled Ground",
      "narrative": [
        "By searching too long among frightened houses or trusting speed to mend lost time, you came to the towpath when weather and rumor had both done their harm. The drag marks were half flattened, and the shed on the rise had been hastily emptied, though not cleanly enough to hide a broken willow mask and a strip of cloth from a ferryman's sleeve.",
        "An old woman cutting reeds nearby spat at the spirit tale and named the coughing voice another way. Corren Vane, she said, used to cough like that when the cold sat in his chest and he worked the dikes through wet autumns. The name meant something to Elsbeth, though she did not speak it yet.",
        "The ground no longer offered an easy victory. You could still win back some truth by following the old woman's memory, or waste more of the hunt by walking straight into the arms of the village men best placed to hide it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Question the old reed-cutter privately and take what she knows of Corren Vane.",
          "scoreDelta": 1,
          "nextNodeId": "K04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride straight to Fenbridge's hall and let the reeve see you coming.",
          "scoreDelta": 0,
          "nextNodeId": "K04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cross the rotten side plank toward a better view of the bank.",
          "failTitle": "The Plank Gives Way",
          "failText": "The board breaks under you and throws you into a narrow run of water between hidden stakes. You do not come out again.",
          "death": true
        }
      ]
    },
    {
      "id": "K04A",
      "turn": 4,
      "title": "Fenbridge Before Rumor - Clear Lead",
      "narrative": [
        "By cutting the back dike or riding the alder rise in time, you reached Fenbridge before the village had fully arranged its own lies. Reeve Niall Brome received you in shirtsleeves and surprise too smooth to be true, while Elsbeth watched him with the patient dislike of a woman who had long since learned the sound of grease over truth.",
        "An old dyker's widow named Maelin came when you asked for the oldest hands in the place. She studied the willow mask without fear and said the knife work belonged to men who had once served under Corren Vane, master waterwright before the last great flood and cast out afterward in anger and shame.",
        "Maelin also named a place. Corren had kept a dike house on Heron Reach where he stored chains, ledgers, and survey pegs when the marsh works were still his to command. Niall tried too quickly to call it ruined and useless."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Niall aloud before the village without proof in hand.",
          "failTitle": "The Village Turns",
          "failText": "Niall plays the wounded reeve to perfection. By the time tempers cool, a warning runner has already slipped away into the marsh.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ride for Heron Reach at once before Niall can send word ahead.",
          "scoreDelta": 1,
          "nextNodeId": "K05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep your courtesy, gather statements, and move only after dusk.",
          "scoreDelta": 0,
          "nextNodeId": "K05B"
        }
      ]
    },
    {
      "id": "K04B",
      "turn": 4,
      "title": "Fenbridge Under Watch - Steady Ground",
      "narrative": [
        "By searching the towpath thoroughly or trusting Maelin before the village reeve, you came into Fenbridge with useful suspicion rather than open advantage. Niall greeted you with food, dry cloaks, and a kind of concern that seemed meant for an audience rather than for you.",
        "Maelin still named Corren Vane, though more quietly now, and swore he had once hidden his best survey tools at a dike house on Heron Reach. She also said Niall had clerked for Brother Senan as a young man and learned more of old marsh records than a reeve strictly needed.",
        "The light was thinning and every hour favored men already moving in wet country. You could steal off toward Heron Reach while Fenbridge still thought you seated at Niall's fire, or stay and pick one more layer of false comfort from his hall."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Slip away with Elsbeth for Heron Reach before the reeve knows you are gone.",
          "scoreDelta": 1,
          "nextNodeId": "K05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay in the hall and compare ledgers, marks, and memories a little too long.",
          "scoreDelta": 0,
          "nextNodeId": "K05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take Niall's offered guide through the cut channels after dark.",
          "failTitle": "A Guided Grave",
          "failText": "The guide leads you onto a drowned service bank where hidden men already wait with clubs and bowstaves. The marsh swallows your inquiry before midnight.",
          "death": true
        }
      ]
    },
    {
      "id": "K04C",
      "turn": 4,
      "title": "Fenbridge Closed Up - Lost Ground",
      "narrative": [
        "By arriving openly and late, you found Fenbridge already hardening around its reeve. Doors were barred against the weather, boys ran messages instead of errands, and Niall Brome had the look of a man who had spent the last hour deciding what innocence ought to resemble.",
        "Only Maelin would talk without being coaxed into it. Through a cracked shutter she told you Corren Vane had once overseen half the dikes between Fenbridge and Sallow Mere, then vanished after blaming Duke Aldric's father for starving the marsh works of repair coin while demanding impossible labor from the men who kept them standing.",
        "Niall wanted you under his roof and out of the dark, which was reason enough to distrust the offer. Yet if you rejected every roof and hearth in anger, you would learn little from a village already afraid of its own voice."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Post guards and spend precious hours trying to steady the village.",
          "scoreDelta": 0,
          "nextNodeId": "K05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Sleep in the reeve's hall and trust his wine not to blunt the edge of the hunt.",
          "failTitle": "Drugged in Fenbridge",
          "failText": "You wake long after dawn with a woolen mouth and no sign of Niall, the best horses, or the chart chest he went to fetch for you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Slip to Maelin's loft by the back lane and question her through the night.",
          "scoreDelta": 1,
          "nextNodeId": "K05B"
        }
      ]
    },
    {
      "id": "K05A",
      "turn": 5,
      "title": "Heron Reach Dike House - Clear Lead",
      "narrative": [
        "By riding fast and refusing Fenbridge's soft comforts, you reached Heron Reach while the hidden dike house still held its breath. It crouched behind a low reed wall like a thing ashamed of being found, and inside you discovered not ruin but order: spare chain links, pitch-dark lantern hoods, ditcher's wedges, and a chest of copied gate measurements.",
        "Pinned under a stone on the workbench lay half a survey sheet marked in cramped old script with the words Edda Lower Works. A second paper bore a blob of beeswax impressed with Niall Brome's seal, which made Elsbeth's jaw set hard enough to show in the lamplight.",
        "You had broken one of Corren's hidden ribs. Yet a place like this would not have been left unwatched forever, and from the loft above came the creak of a board under a weight that was not yours."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Hide in the dark and seize whoever has returned to watch the house.",
          "scoreDelta": 1,
          "nextNodeId": "K06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the papers and withdraw before more men close on the place.",
          "scoreDelta": 0,
          "nextNodeId": "K06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force the cellar hatch at once without checking how it is trapped.",
          "failTitle": "Powder in the Cellar",
          "failText": "A flash of stored powder and lamp oil blows up through the floor. Heron Reach ends in splinters and black smoke.",
          "death": true
        }
      ]
    },
    {
      "id": "K05B",
      "turn": 5,
      "title": "Heron Reach Dike House - Steady Ground",
      "narrative": [
        "By leaving Fenbridge under disguise or trusting Maelin's whispered guidance, you came to Heron Reach after the first sweep had already passed through it. The dike house had been opened and hurriedly searched, but not cleared well enough to hide the shape of its use. Charred plan scraps curled in the hearth, black lantern glass lay underfoot, and a ferryman's boot mark ran deep in the mud outside as if a bound man had stumbled there.",
        "Among the half-burned papers you found gate sketches, a tally of wheel turns, and a broken beeswax seal from Niall's hand. Whatever story Fenbridge told itself, the reeve was tied into this work more tightly than any frightened villager understood.",
        "The raiders had taken the better part of their knowledge with them, but not all of it. The dragged boot marks led toward the reed islands, while the charred papers might still give Brother Senan enough to name what Edda Lower Works truly meant."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the charred plans to Senan before you lose the writing altogether.",
          "scoreDelta": 0,
          "nextNodeId": "K06C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Search the dike house with open torches and loud orders.",
          "failTitle": "Arrows at Heron Reach",
          "failText": "Hidden men in the reed wall answer fire with shafts. The dike house becomes your coffin before the night is out.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the dragged ferry boots toward the reed islands at once.",
          "scoreDelta": 1,
          "nextNodeId": "K06A"
        }
      ]
    },
    {
      "id": "K05C",
      "turn": 5,
      "title": "Heron Reach in Ashes - Lost Ground",
      "narrative": [
        "By lingering with ledgers or trying to steady Fenbridge before the ground was ready to be steadied, you reached Heron Reach too late for a clean prize. The hidden dike house was still standing, but smoke seeped from the eaves and whatever papers had mattered most were already ash in a bucket beside the bench.",
        "Even so, hasty men had missed one thing. Under a broken floorboard you found a brass marker cut with Saint Edda's crossed reeds and scored with measurements not for the common floodgates but for some heavier wheel below common reach. Elsbeth swore she had seen its like only once, years ago, in old marsh stores long since cleared out.",
        "Loss had not emptied the place entirely. Mud outside still held the ferryman's knife print and the slide mark of a body dragged by men who were pressed for time, which meant one witness might yet be alive if you chose well."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the mud carefully, find the dragged line, and follow it toward the reeds.",
          "scoreDelta": 1,
          "nextNodeId": "K06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle the marsh in widening sweeps and hope to blunder into the captors.",
          "scoreDelta": 0,
          "nextNodeId": "K06C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive Thorne onto the half-rotted plank road in the dark for speed.",
          "failTitle": "The Road Breaks Beneath You",
          "failText": "The plank road shears away over deep black water. Horse and rider are left floundering where armed men need only watch.",
          "death": false
        }
      ]
    },
    {
      "id": "K06A",
      "turn": 6,
      "title": "Reed Island Rescue - Clear Lead",
      "narrative": [
        "By waiting in the dike house or taking the fresh dragged trail without delay, you reached the reed islands before Corren's men had finished moving their captive. Two punts lay hidden under cut sedge, and between them sat Tobin Gray, Fenbridge ferryman, wrists tied behind him and mouth dark with swamp mud where someone had tried to keep him quiet.",
        "The fight was short and bitter in the half light. When it was done, Tobin spat blood into the reeds and told you what he had heard while pretending worse hurt than he felt. Corren's men were not chasing random gates. They wanted a black sluice under drowned stone, and Niall had promised them the last of the charting needed to find it.",
        "Tobin had also seen a toothed iron fitting wrapped in oilcloth, guarded more carefully than coin. Whatever that piece belonged to, Corren meant to marry it to old works that should have stayed buried."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut every rope at once and shout for hidden prisoners before the banks are secure.",
          "failTitle": "The Reed Line Springs Shut",
          "failText": "More men were waiting just beyond the sedge wall. In the rush to free everyone, you give them the moment they needed.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Tobin under guard and search the punts for every scrap of gear.",
          "scoreDelta": 0,
          "nextNodeId": "K07B"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Press Tobin to guide you by hidden cut straight to Saint Edda's chapel.",
          "scoreDelta": 1,
          "nextNodeId": "K07A"
        }
      ]
    },
    {
      "id": "K06B",
      "turn": 6,
      "title": "Fishers' Huts and Broken Camp - Steady Ground",
      "narrative": [
        "By withdrawing cleanly from Heron Reach or reading the last useful mud signs from the ashes, you came to a cluster of abandoned fishers' huts where Corren's men had kept watch and then moved on in haste. You found Tobin Gray alive only because he had worked one wrist partly free and crawled under a collapsed eel rack to hide from the last search.",
        "He was weak, but his memory held. He had heard the men speak of Saint Edda and of a buried master-gate older than the present banks. He had also heard Niall's name spoken without honor, as one speaks of a clerk who knows the lock but not the labor that gave it use.",
        "The ferryman could still point a way through the reed cuts if you took him seriously and moved with a healer's patience. If not, the marsh would soon take him from you and keep the best witness for itself."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Bind Tobin's wounds and ride with him straight to Brother Senan.",
          "scoreDelta": 1,
          "nextNodeId": "K07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take the obvious causeway back to save time.",
          "failTitle": "Snared on the Causeway",
          "failText": "The causeway is baited with concealed hooks and a hanging net. You spend your last minutes struggling where no ally can reach you.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the huts for the missing windlass piece before leaving.",
          "scoreDelta": 0,
          "nextNodeId": "K07C"
        }
      ]
    },
    {
      "id": "K06C",
      "turn": 6,
      "title": "A Wounded Witness - Lost Ground",
      "narrative": [
        "By carrying papers first or sweeping too wide through the marsh, you found only the tail of Corren's camp. A kettle swung above cold ash, the punts were gone, and for a sick moment it seemed every useful witness had been carried deeper into the water with the rest.",
        "Then Tobin Gray dragged himself out from a mat of sedge with an arrow crease along his ribs and enough stubbornness left to curse before he collapsed. Once you had packed the wound and got a little broth into him, he gasped out the name Saint Edda and the phrase black sluice as if both words still tasted wrong in his mouth.",
        "He also begged you not to trust Niall Brome, which mattered more than any prayer in that hour. You could keep Tobin alive and trade speed for certainty, or leave him under poor protection while you gambled on making up lost ground alone."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hide Tobin with villagers and push on toward the priory rumor alone.",
          "scoreDelta": 0,
          "nextNodeId": "K07C"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use your herbs, steady Tobin, and take him to Senan at once.",
          "scoreDelta": 1,
          "nextNodeId": "K07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force the ferryman back into the saddle at speed despite the wound.",
          "failTitle": "The Witness Fails",
          "failText": "Tobin dies before first light, and with him goes the last honest account of what Corren seeks.",
          "death": false
        }
      ]
    },
    {
      "id": "K07A",
      "turn": 7,
      "title": "The Black Sluice Named - Clear Lead",
      "narrative": [
        "By bringing Tobin swiftly to Saint Edda or riding the hidden cuts without delay, you put living witness and written scrap before Brother Senan while there was still time to matter. In the chapel loft the old priest spread worm-eaten charters under a hanging lamp and traced the faded lines with one bent finger until his face lost what little color remained in it.",
        "The Black Sluice, he said at last, was a buried master spillgate built beneath Saint Edda's priory after an older flood, then sealed and omitted from later maps when newer banks made it too dangerous to trust. Used carefully, it could draw Sallow Mere down for a few hours. Forced at spring crest, it could tear lesser banks apart like stitched cloth.",
        "Senan had kept the knowledge quiet to deter treasure seekers and fools, but Corren Vane was no fool and no mere thief. If he had the proper iron fitting and enough of the chart, he could wake the drowned works before anyone understood what had happened."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take Senan's hidden survey notes and ride for the western spillway before Corren gathers all the keys.",
          "scoreDelta": 1,
          "nextNodeId": "K08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the map, send warnings, and lose an hour to prudence.",
          "scoreDelta": 0,
          "nextNodeId": "K08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ring the chapel bell and rally the countryside at once.",
          "failTitle": "The Bell Gives You Away",
          "failText": "The bell carries farther over wet country than you mean it to. Corren's scouts hear it, and the outbuildings burn before the dawn is old.",
          "death": false
        }
      ]
    },
    {
      "id": "K07B",
      "turn": 7,
      "title": "The Black Sluice Half Hidden - Steady Ground",
      "narrative": [
        "Whether by careful escort or stubborn healing, you brought Brother Senan enough proof to shake him out of denial. He admitted that Saint Edda's drowned priory had once sat above a buried control chamber older than the present dikes and that only fragments of its survey remained after later rebuilding.",
        "The old priest had always believed the Black Sluice too dangerous and too difficult to reach for any living man to trouble. Tobin's witness, the brass marker, and the charred notes from Heron Reach undid that comfort in a single hour. Senan's fear was no longer for old secrets. It was for the lower farms and the river road if Corren forced the buried gate at the wrong water.",
        "You could take what notes he had and move before Corren did, or spend longer making certain of every mark while the marsh continued to draw breath around you."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Senan of hiding silver and lean on him with threats.",
          "failTitle": "A Priest Shuts His Mouth",
          "failText": "Fear closes what guilt had only cracked open. Senan says no more of use until the marsh has already begun to fail.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Force the old priest to show every concealed survey mark at once.",
          "scoreDelta": 1,
          "nextNodeId": "K08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Senan to search for more while you post warnings along the banks.",
          "scoreDelta": 0,
          "nextNodeId": "K08C"
        }
      ]
    },
    {
      "id": "K07C",
      "turn": 7,
      "title": "The Black Sluice in Rain - Lost Ground",
      "narrative": [
        "By pausing too long over gear or pushing on with only broken reports, you reached Saint Edda late and under gathering rain. Senan denied everything at first, but Tobin's words, the brass marker, and the surviving scraps from Heron Reach dragged the truth out of him piece by piece until he sagged onto a bench like a man finally overtaken by an old debt.",
        "He told you of the Black Sluice and of a map once copied into three parts to keep the full scheme from greedy hands. One fragment, he admitted, had passed before Niall Brome's eyes years ago when the reeve served him as a clerk and thought old records harmless. That harmlessness had died with the first cut bund.",
        "The rain on the chapel roof sounded like many small warnings at once. You could search the loft through the dark for enough detail to move well at dawn, or wait and keep order around a secret already leaking through too many mouths."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Search the loft by lamp and recover enough of the old survey to move by dawn.",
          "scoreDelta": 1,
          "nextNodeId": "K08B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait out the rain and question Senan more slowly until daylight.",
          "scoreDelta": 0,
          "nextNodeId": "K08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Senan unguarded while you sleep.",
          "failTitle": "The Chart Is Taken",
          "failText": "Niall's men come before dawn and carry off both priest and paper. You wake to hoofbeats and a chapel door swinging on its latch.",
          "death": false
        }
      ]
    },
    {
      "id": "K08A",
      "turn": 8,
      "title": "Western Spillway - Clear Lead",
      "narrative": [
        "Armed with the hidden survey and moving before Corren expected it, you cut across the firmer reed lanes to the western spillway while the work there still stood mostly untouched. Elsbeth's wardens met you among dripping alders, and together you found fresh tool marks on the chain housing, wedges set for a quick lift, and ratchet teeth greased with black pitch so a wheel could turn more silently in the dark.",
        "If the western spillway was opened first, Senan's chart showed exactly what would follow. The draw around Saint Edda would sharpen, hidden footing would emerge where none ought to be, and Corren's approach to the drowned priory would become far easier. He was not yet at the heart of the marsh, but he was shaping the body around it.",
        "The men who had done the greasing would return. The question was whether they would meet an empty house, a strengthened gate, or the hard surprise of a ranger who had guessed them in time."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Pull the wedges now and spend time shoring the sill with local hands.",
          "scoreDelta": 0,
          "nextNodeId": "K09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "March out onto the spillway in open view and call for the saboteurs to show themselves.",
          "failTitle": "Bolts on Open Water",
          "failText": "Crossbows answer from both banks. You never reach the wheelhouse door.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set an ambush in the spillhouse and hold fire until hands touch the wheel.",
          "scoreDelta": 1,
          "nextNodeId": "K09A"
        }
      ]
    },
    {
      "id": "K08B",
      "turn": 8,
      "title": "Western Spillway - Hard-Won Timing",
      "narrative": [
        "By copying the chart or searching the loft through the rain, you reached the western spillway with enough knowledge but not first possession. One of Corren's outer crews had already been there. The chain housing was greased, a brace pin lay on the mud where it should have stood in iron, and pitch stained the edge of the ratchet like old blood under a nail.",
        "Elsbeth could still gather a handful of wardens and two steady dykers from nearby holdings. With Senan's marks in mind, you also knew of a narrow bypass cut under the bank where a man willing to stoop into foul water could come up almost beneath the wheelhouse itself.",
        "Time had thinned your choice, not erased it. You could still surprise the saboteurs if you trusted mud, cold, and stealth more than dry footing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the hidden bypass and come at the saboteurs from below the bank.",
          "scoreDelta": 1,
          "nextNodeId": "K09A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Set villagers to repairs while you search the wider banks for tracks.",
          "scoreDelta": 0,
          "nextNodeId": "K09C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send everyone into the spillhouse with torches blazing.",
          "failTitle": "The Chain Falls",
          "failText": "The hidden crew drops the chain housing from above. Iron and water crush the men packed inside before they can turn.",
          "death": false
        }
      ]
    },
    {
      "id": "K08C",
      "turn": 8,
      "title": "Western Spillway - Weather Against You",
      "narrative": [
        "By warning the banks first or waiting too long at Saint Edda, you came to the western spillway with the sky already low and the marsh laboring under a hard wind. One outer pin was gone, the gate shuddered as if someone had tested it in secret, and Elsbeth stood with too few wardens and no patience left for comfort.",
        "The saboteurs had been careful, but not perfect. A side trench still showed fresh scrape marks where tools had been dragged to a maintenance crawl under the spillway. The main walkway, by contrast, was broad, visible, and almost certainly watched by men who knew fear would drive other men toward easy footing.",
        "You no longer had room for elegance. Whatever you did next would be done under pressure and with water already beginning to obey someone else's hand."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Rig a rope over the side trench and cross to the maintenance crawl.",
          "scoreDelta": 1,
          "nextNodeId": "K09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Split your few helpers into three weak groups to watch everything at once.",
          "failTitle": "Too Thin a Line",
          "failText": "Corren's men choose the strongest point because none remains strong enough to hold it. The spillway swings under their hands.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the visible walkway and hope the saboteurs come straight at you.",
          "scoreDelta": 0,
          "nextNodeId": "K09C"
        }
      ]
    },
    {
      "id": "K09A",
      "turn": 9,
      "title": "Spillhouse Ambush - Clear Lead",
      "narrative": [
        "The ambush or hidden approach worked as you meant. Corren's outer crew came in low and quiet, found the spillhouse seemingly undefended, and were halfway through the first turn before you and Elsbeth fell on them from both sides. Two men died where they stood, a third yielded, and the rest fled without the silence they had brought with them.",
        "Among their gear you found the missing windlass tooth wrapped in oiled cloth and a leather case holding two of the three measurements needed to work Saint Edda's buried gate. The captured man, bleeding from the mouth and too frightened to lie well, told you Corren meant to meet Niall at Fenbridge before dawn for the last copied chart.",
        "The western spillway would hold for a time now, but only if Elsbeth stayed with it. The better chase lay east, where Niall's fear and Corren's need were about to cross paths in the dark."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue the lone fleeing scout by yourself across the flood trench.",
          "failTitle": "The Trench Takes Horse and Man",
          "failText": "The scout wanted you off the bank. The hidden trench below the reeds does the rest.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ride for Fenbridge at once by the alder ridge and leave Elsbeth to hold the spillway.",
          "scoreDelta": 1,
          "nextNodeId": "K10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the prisoners longer and send warning riders ahead of you.",
          "scoreDelta": 0,
          "nextNodeId": "K10B"
        }
      ]
    },
    {
      "id": "K09B",
      "turn": 9,
      "title": "Spillhouse Fight - Steady Ground",
      "narrative": [
        "Your firmer crossing and harder work kept the western spillway from opening cleanly, though not without cost. Corren's men got one ugly wrench at the ratchet before you reached them, and the wheelhouse door had to be taken with shoulder and boot rather than surprise. When the struggle ended, the gate still stood, but the hinge groaned like a cracked rib.",
        "What you did recover mattered. The missing windlass tooth lay in the bilge water under the wheel, and on a torn scrap of leather one of the men had written lower choir steps in a hand too neat to be his own. Saint Edda was no longer a suspicion. It was a destination.",
        "The spillway needed mending, yet every heartbeat given to iron here was one heartbeat handed to Niall and Corren elsewhere. The marsh would not let you save everything first."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Gallop with Tobin for Fenbridge and seize Niall before he can move.",
          "scoreDelta": 1,
          "nextNodeId": "K10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay to finish the repairs before turning back toward the village.",
          "scoreDelta": 0,
          "nextNodeId": "K10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust a captured saboteur who offers a shortcut through the reed cuts.",
          "failTitle": "A Shortcut into Stakes",
          "failText": "He leads you onto a drowned shelf lined with sharpened poles. By the time you understand the gift, it is already too late.",
          "death": true
        }
      ]
    },
    {
      "id": "K09C",
      "turn": 9,
      "title": "Spillhouse Strain - Lost Ground",
      "narrative": [
        "You kept the western spillway from full loss only by strength, luck, and Elsbeth's refusal to yield a handbreadth of sill. The saboteurs slipped off with better order than you would have liked, leaving the hinge weakened and the wheelhouse reeking of pitch and wet iron.",
        "In the mud outside lay the one useful thing they had dropped. Niall's seal was pressed into fresh beeswax on a wrapped message, and inside, blurred but legible enough, was a place and hour that tied Fenbridge to Saint Edda more neatly than any confession could have done.",
        "You had proof now, but proof gathered late is a colder comfort. Either you would ride on it at once, or dawn would find the reeve already beyond your easy reach."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Elsbeth while you linger to secure the wheelhouse.",
          "scoreDelta": 0,
          "nextNodeId": "K10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the message as bait and stay where you are.",
          "failTitle": "Too Late for the Reeve",
          "failText": "When you finally turn for Fenbridge, Niall is gone, Corren is supplied, and the marsh is already moving toward disaster.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Break the seal, trust the warning, and ride hard for Fenbridge.",
          "scoreDelta": 1,
          "nextNodeId": "K10B"
        }
      ]
    },
    {
      "id": "K10A",
      "turn": 10,
      "title": "The Reeve in the Cellar - Clear Lead",
      "narrative": [
        "By riding the alder ridge without delay, you reached Fenbridge in the thin hours before dawn and found Niall Brome in his own cellar with travel gear laid out around him. A chart tube lay open on the table, a black lantern packed in straw beside it, and coin enough for betrayal already counted into three little stacks.",
        "Niall did not waste breath on denial once he saw you. He kicked over the stool, snatched the tube, and ran through the byre passage while Elsbeth's voice brought half the yard to life. For a moment you could hear him plainly in the rain, then only the hammer of a horse and the scrape of a gate.",
        "The cellar still held what he had meant to carry, but the man himself held what mattered most. In such moments a ranger earns the future by choosing whether paper or flesh is likelier to run farther."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut across the cattle lane on foot and take him at the bridge mouth.",
          "scoreDelta": 1,
          "nextNodeId": "K11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the cellar first for what he was too rushed to carry.",
          "scoreDelta": 0,
          "nextNodeId": "K11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rouse the whole village before moving after him.",
          "failTitle": "The Yard Fills with Delay",
          "failText": "By the time enough men are awake to be useless, Niall is already a dark shape on the far bank and the chart has gone with him.",
          "death": false
        }
      ]
    },
    {
      "id": "K10B",
      "turn": 10,
      "title": "The Reeve Bolts - Steady Ground",
      "narrative": [
        "Whether you came on the strength of a warning note or from the spillway with only a narrow margin left, you still reached Fenbridge while Niall was making ready to flee. He had burned ledgers in the hearth and hidden silver in his boot, but the neatness of his escape ended the instant Elsbeth stepped through the hall door.",
        "Pressed too hard to lie and too frightened to stand, Niall shoved a lamp into a hanging cloth and ran for the back of the house. The small fire gave you one filthy blessing: in the flare you saw the chart tube under his arm and knew he was not fleeing empty-handed.",
        "You could let the house burn while you hunted the traitor, or save what papers and people you still could and accept a thinner chase through the wet dark."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Stamp out the fire, save the papers, and then take up the pursuit.",
          "scoreDelta": 0,
          "nextNodeId": "K11C"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow at once with Thorne along the dike lane before the fire spreads.",
          "scoreDelta": 1,
          "nextNodeId": "K11A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Tobin to question Niall alone while you order the yard.",
          "failTitle": "A Knife in the Confusion",
          "failText": "Niall cuts the ferryman and escapes in the scramble. You gain blood, smoke, and nothing else.",
          "death": false
        }
      ]
    },
    {
      "id": "K10C",
      "turn": 10,
      "title": "A Village Already Stirring - Lost Ground",
      "narrative": [
        "By the time you came back from the spillway or lingered too long over repairs, Fenbridge had already begun to wake into rumor. Niall was gone. His horse stall stood empty, a stable boy sat bruised under a blanket, and a torn sheet from Senan's copied survey clung wetly to a nail where some hurried hand had caught it and ripped it free.",
        "Maelin spat at the sight and said the reeve had ridden toward the old eel fires by Sallow Mere, where the bank ran narrow and smoky even in rain. It was not much, but it was more than despair and better than following the broad road like a caravan.",
        "Niall had chosen ground where sight, breath, and certainty all failed together. If you meant to catch him now, you would need to trust damaged signs and the word of those who knew the marsh before it was measured."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the torn survey marks and take the eel-track shortcut through the reeds.",
          "scoreDelta": 1,
          "nextNodeId": "K11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Spend the dawn line by line in Niall's accounts looking for a cleaner answer.",
          "failTitle": "While You Read, They Ride",
          "failText": "The figures tell you much about theft and nothing about timing. Corren reaches Saint Edda untouched while you turn pages in a warm room.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Gather men and follow the broad road at first light.",
          "scoreDelta": 0,
          "nextNodeId": "K11C"
        }
      ]
    },
    {
      "id": "K11A",
      "turn": 11,
      "title": "The Eel Fires Chase - Clear Lead",
      "narrative": [
        "Your hard pursuit kept Niall almost in sight. He rode with two of Corren's men through the eel grounds where wet smoke lay close to the water, then flung a hooded lantern behind him to set the dead reeds running with a low greasy flame. Through the shifting smoke you saw his horse stumble once and the chart tube bounce from its strap into the mire.",
        "The fire did not spread like summer fire. It crawled, coughed, and then leapt where old pitch had been laid among the reeds to make confusion serve as a wall. Even so, the dropped tube lay where luck and haste had betrayed him, close enough to seize if you chose truth over vengeance.",
        "You had a breath of advantage and only a breath. Whether Niall reached Corren mattered. So did the paper that explained what Corren meant to do when he got there."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay on Niall's heels and trust Tobin to recover the fallen chart tube.",
          "scoreDelta": 0,
          "nextNodeId": "K12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride Thorne straight through the smoking reed fire to keep every advantage at once.",
          "failTitle": "Burned in the Eel Grounds",
          "failText": "The horse vanishes under you in smoke and sudden mud. Fire, water, and panic finish what the enemy began.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seize the chart and leave Elsbeth to keep after Niall while you angle for Saint Edda.",
          "scoreDelta": 1,
          "nextNodeId": "K12A"
        }
      ]
    },
    {
      "id": "K11B",
      "turn": 11,
      "title": "Smoke and Broken Sign - Steady Ground",
      "narrative": [
        "Your recovered shortcut or careful reading of damaged marks brought you into the eel grounds by a harder road. There you found one of Corren's men dead in the reeds with Niall's knife in his ribs and the chart tube crushed under his body, as if betrayal had begun to feed on itself before the night's work was done.",
        "The copy inside was blurred and muddied but not wholly lost. More important, the surviving marks aligned with Senan's remembered notes and pointed toward Saint Edda more cleanly than any hoofprint could have done. Niall was still ahead somewhere in the smoke, though perhaps no longer under Corren's full trust.",
        "The hunt had split in two: one road after the traitor, the other after the design he had served. Only one of them could be taken first."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the surviving chart marks and race for the priory instead of the man.",
          "scoreDelta": 1,
          "nextNodeId": "K12A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep hunting Niall through the eel smoke until you have him in hand.",
          "scoreDelta": 0,
          "nextNodeId": "K12C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow at the first shadow moving in the mist.",
          "failTitle": "A Friendly Shape Falls",
          "failText": "The shadow is one of Elsbeth's wardens. In the confusion that follows, Niall's trail disappears for good.",
          "death": false
        }
      ]
    },
    {
      "id": "K11C",
      "turn": 11,
      "title": "Dawn in the Eel Grounds - Lost Ground",
      "narrative": [
        "By saving the hall first or following the broad road into bad country, you entered the eel grounds at first light with the smoke already thinning into a sour gray veil. Niall had widened his lead, and the folk you had pressed into service now whispered of spirits with the special conviction that comes from not wanting to look hard at ordinary men.",
        "Even so, the marsh still offered something to a patient eye. Under a collapsed rack you found the scorched shell of the chart case, and tucked inside a split seam was one clean page spared by water because a boot heel had trapped it under the leather.",
        "The page gave you direction, not victory. You could use it and let Niall run a little longer, or cling to the man and risk arriving at Saint Edda only in time to witness what you had failed to stop."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Thorne and try to cross the mudflats on foot alone for speed.",
          "failTitle": "The Mudflats Close",
          "failText": "The flats take weight like a promise and then betray it. You sink before any hand can reach you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the spared page to Senan's memory and head for Saint Edda at once.",
          "scoreDelta": 1,
          "nextNodeId": "K12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Sweep the eel grounds for Niall's sign until the light is fully up.",
          "scoreDelta": 0,
          "nextNodeId": "K12C"
        }
      ]
    },
    {
      "id": "K12A",
      "turn": 12,
      "title": "The Design Revealed - Clear Lead",
      "narrative": [
        "By choosing the chart over the traitor, you arrived at understanding before Corren arrived at triumph. Senan, Tobin, and the recovered tube together showed that the Black Sluice could draw Sallow Mere down just long enough to bare an older stone bed running out from Saint Edda's drowned foundations toward a sealed toll cellar.",
        "Duke Aldric's grandfather had hidden coin, salt, and iron there during the border war rather than let raiders take it from the Riverland road. Senan had always feared the cache would tempt fools into meddling with the buried gate. Corren meant to be no fool. He meant to use the marsh itself as his crowbar, flood the lower country if he had to, and pay a hired band with what he believed the fen was owed.",
        "The threat now had full shape. It was not sabotage for terror alone, nor theft for greed alone, but grievance harnessed to expert hands and directed through the oldest weakness in Brackenwald's waterworks."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send Tobin to muster boats while you and Elsbeth ride straight for Saint Edda.",
          "scoreDelta": 1,
          "nextNodeId": "K13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn the lower farms first and lose an hour to duty.",
          "scoreDelta": 0,
          "nextNodeId": "K13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Race alone for the toll cellar in hope of beating both sides to it.",
          "failTitle": "Buried Before the Flood",
          "failText": "The approach to the cellar collapses under you in drowned masonry. By the time anyone finds the place, it is your tomb.",
          "death": true
        }
      ]
    },
    {
      "id": "K12B",
      "turn": 12,
      "title": "The Design Revealed in Fragments - Steady Ground",
      "narrative": [
        "The spared page and Senan's memory gave you the truth in parts, but the parts were enough. A buried toll cellar lay under the mere bed beyond Saint Edda, sealed in the war years with coin, salt, and iron. The Black Sluice could strip the water off that stone road for a few hours if worked at the right crest, and Corren Vane intended to buy himself a following from the exposed stores.",
        "What chilled you most was the cost written between the lines. The old notes were plain that the buried gate had never been meant for violent use after the newer dikes were raised. If Corren forced it in the spring swell, the mere would answer, but so would the lesser banks from Fenbridge down to the river meads.",
        "No rumor remained to hide behind now. Every delay henceforth had a face, a field, and a likely grave attached to it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Stop to warn Fenbridge and gather whatever men will still stand with you.",
          "scoreDelta": 0,
          "nextNodeId": "K13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce the hidden cache in the tavern to raise eager help.",
          "failTitle": "Greed Crowds the Road",
          "failText": "Word of silver and salt brings looters faster than fighters. By dusk the road to Saint Edda is choked with the wrong kind of courage.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pull Elsbeth onto the dykers' back embankment and ride for the priory by the harder road.",
          "scoreDelta": 1,
          "nextNodeId": "K13A"
        }
      ]
    },
    {
      "id": "K12C",
      "turn": 12,
      "title": "The Design Revealed Too Late - Lost Ground",
      "narrative": [
        "By clinging to Niall's trail or spending too much light in the eel grounds, you reached the full truth only when the weather had already turned toward violence. The chart remained broken, but Senan could still point out the buried line of the old stone bed and the margin note that named wartime stores sealed beneath it.",
        "Corren's plan was plain enough even through gaps. Wake the Black Sluice at crest, draw the mere, reach the toll cellar, and let the lower marsh pay the price while hired blades and desperate hands took the stores. He had planned it through months of false hauntings and carefully staged fear, because fear cleared banks better than steel alone.",
        "Understanding came late, but it came complete. What remained was to decide whether you would keep chasing traitors and whispers, or finally ride straight at the heart of the thing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Abandon the hunt for Niall and cut across the drowned hay meads for Saint Edda now.",
          "scoreDelta": 1,
          "nextNodeId": "K13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait for more hands before moving on the priory.",
          "scoreDelta": 0,
          "nextNodeId": "K13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hide the truth from Elsbeth and try to manage the whole matter alone.",
          "failTitle": "A House Divided",
          "failText": "Elsbeth rides one way and you another. Corren profits from the split as surely as if he had ordered it himself.",
          "death": false
        }
      ]
    },
    {
      "id": "K13A",
      "turn": 13,
      "title": "The Priory Margin - Clear Lead",
      "narrative": [
        "Your fast ride and clean choice of road brought you to the willow rise above Saint Edda before Corren had all the ground he wanted. The drowned priory showed itself in broken pieces through rain and reed: the leaning stump of a bell tower, a split transept roof, and black water moving strangely fast around stones that should have slept still under silt.",
        "Elsbeth placed wardens on the northern causeway while Tobin, stubborn despite his hurts, poled two punts into cover under the lee of the ruined nave. Across the water you saw camp smoke from Corren's outer men and heard the knock of labor somewhere under stone, regular enough to be work rather than salvage.",
        "You had come soon enough to trouble the plan, perhaps soon enough to break it. But only if you crossed the ruined ground before Corren finished laying hand to the deeper mechanism."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow at the first distant lantern and reveal yourself too soon.",
          "failTitle": "A Shot that Starts the Night",
          "failText": "The lantern goes dark and the whole priory wakes against you. Surprise dies before the first real step.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cross by punt and seize the outer wheelhouse before full dark.",
          "scoreDelta": 1,
          "nextNodeId": "K14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the rise, watch the traffic, and wait for deeper dark.",
          "scoreDelta": 0,
          "nextNodeId": "K14B"
        }
      ]
    },
    {
      "id": "K13B",
      "turn": 13,
      "title": "The Priory Margin - Steady Ground",
      "narrative": [
        "Whether you came by the back embankment or cut the hay meads in grim haste, you reached Saint Edda with strength enough to matter but not enough to own the ground. Corren's men were already dug into parts of the ruined precinct, and the black water around the old nave moved with a purpose no natural wind entirely explained.",
        "Niall's fresh tracks led toward the drowned cloister. Tobin whispered that a hidden landing still lay under the western wall if the reeds had not swallowed it. Elsbeth, standing knee-deep beside the punts, looked at the priory as if she would gladly burn it stone by stone if that would spare the banks below.",
        "The place allowed no clean approach. You could still gain one with nerve and a little craft, or settle for a slower line and hope Corren had not yet come to the heart of the works."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send Tobin to mark the hidden landing while you and Elsbeth work around the western stones.",
          "scoreDelta": 1,
          "nextNodeId": "K14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring up villagers and make a cautious line on the willow rise.",
          "scoreDelta": 0,
          "nextNodeId": "K14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge the open causeway in rain and half light.",
          "failTitle": "The Causeway Kills the Bold",
          "failText": "Crossbow fire takes the front rank before steel ever meets steel. The priory keeps what you throw at it.",
          "death": true
        }
      ]
    },
    {
      "id": "K13C",
      "turn": 13,
      "title": "The Priory Margin - Lost Ground",
      "narrative": [
        "You came to Saint Edda under hard rain and harder knowledge, already late enough that Corren's lanterns moved openly among the broken stones. One feeder cut was plainly working by the lean of the water, and the villagers who had followed this far looked less like help than like men about to believe anything that would spare them another step forward.",
        "The ruined priory was not grand in the old stories' way. It was low, half drowned, and practical, which somehow made it more unnerving. Every wall hinted at labor rather than miracle. Every dark opening suggested stored tools, chains, or men who knew what they were doing in confined wet places.",
        "Fear was now part of the ground itself. You could strip it away by cutting your party to the reliable core, or let it spread and pay the price in confusion when the real struggle began."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the whole fearful band together and edge down the main causeway.",
          "scoreDelta": 0,
          "nextNodeId": "K14C"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Send the wavering villagers back and move with only Elsbeth and the steadiest hands.",
          "scoreDelta": 1,
          "nextNodeId": "K14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rouse the men with talk of silver in the toll cellar.",
          "failTitle": "Looters Instead of Allies",
          "failText": "The promise of buried wealth shatters the last of your order. Corren's scouts cut down the first rush and the rest break in panic.",
          "death": false
        }
      ]
    },
    {
      "id": "K14A",
      "turn": 14,
      "title": "The First Feeder Opens - Clear Lead",
      "narrative": [
        "Your bold crossing or hidden landing put you onto the priory ground in time to hear the first true groan of the buried works. Somewhere below the ruined choir, a feeder gate opened and cold water began to run where no water should. The sound was not loud. It was worse than loud. It was sure.",
        "Tobin pointed and saw Niall below with a chain gang hauling under cover of broken arches. The opened feeder changed the ground immediately. Pools drew down, channels sharpened, and stones that had been harmless under still water began to show wet edges slick as fish bellies.",
        "You still had the better footing and the better moment, but not for long. One more clean strike could throw Corren's timings into disorder before the second feeder turned."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Hit Niall's chain gang now before the second feeder can open.",
          "scoreDelta": 1,
          "nextNodeId": "K15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase a lantern through the cloister vaults without marking your path.",
          "failTitle": "Lost Below Saint Edda",
          "failText": "You vanish into blind passages while water rises behind you. The priory keeps you as neatly as any cell.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Pull back enough men to shore the landing and keep an escape open.",
          "scoreDelta": 0,
          "nextNodeId": "K15B"
        }
      ]
    },
    {
      "id": "K14B",
      "turn": 14,
      "title": "The First Feeder Opens - Steady Ground",
      "narrative": [
        "Your hidden approach or stripped-down party got you onto the broken priory close enough to matter just as the first feeder opened. The sound came up through the stones like a giant chest taking a first breath after years under silt, and the black water around the nave began sliding toward the lower ground in a way no natural current ever would.",
        "One glance was enough to tell you the second feeder could not be far from turning. Men moved in the lower yard, hauling on a chain in short rhythm under Niall's shouted count, while Corren himself remained unseen somewhere deeper in the works.",
        "The night had narrowed to a few real choices. Strike the laborers now and hope disorder buys time, or work around them toward the next housing and trust your strength to hold under pressure."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle for the bell tower stump and look for the second feeder housing.",
          "scoreDelta": 0,
          "nextNodeId": "K15C"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut straight for the chain gang in the lower yard.",
          "scoreDelta": 1,
          "nextNodeId": "K15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stand gaping at the draw while the ground changes beneath you.",
          "failTitle": "The Moment Passes",
          "failText": "By the time you move again, the yard is sealed, the gang is gone below, and the priory is working on Corren's terms instead of yours.",
          "death": false
        }
      ]
    },
    {
      "id": "K14C",
      "turn": 14,
      "title": "The First Feeder Opens - Lost Ground",
      "narrative": [
        "You reached the priory just as the first feeder began to work and the whole drowned place changed shape around you. Channels that had been passable became pulling black lanes, and one of your helpers vanished between stones before anyone could even name what had happened.",
        "Corren had the ground and knew it better. Lanterns winked through slit arches, boots slapped on hidden masonry, and the open causeway behind you already felt less like retreat than like a trap waiting for panic to give it shape.",
        "No fine plan remained. Only useful decisions did. You could abandon the easy lines and fight for a narrower, smarter foothold, or cling to shrinking safety until the water itself drove you out of it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Break for the bell tower side where the next housing ought to lie.",
          "scoreDelta": 1,
          "nextNodeId": "K15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the main yard and try to keep a foothold as the water changes.",
          "scoreDelta": 0,
          "nextNodeId": "K15C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order a full retreat at once and let fear set the pace.",
          "failTitle": "Rout on the Causeway",
          "failText": "Men run, slip, and push one another into dark water. Corren does not have to kill those the marsh is already taking.",
          "death": false
        }
      ]
    },
    {
      "id": "K15A",
      "turn": 15,
      "title": "Niall's Chain Gang Broken - Clear Lead",
      "narrative": [
        "By striking at once, you smashed Niall's chain gang before it could finish its pull. Men fled into the transept dark, one slipped and was taken by his own rushing water, and Niall himself dropped the pry bar and ran deeper into the priory with the quick selfishness of a clerk who had always expected harder men to pay for his courage.",
        "On the stones you found a key ring heavy with odd wards and a chalked tally of wheel turns. One notation stood out even in the rain: black pull at crest. Corren was close now to the move that mattered, and the outer wheelhouse under the south transept was the next step in the chain.",
        "The blow had bought you time measured in breaths and perhaps a little more. Spend it well and the whole plan might yet be thrown crooked. Spend it poorly and you would merely arrive sooner at the same disaster."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Drag the chain free and deny them the feeder you have just won.",
          "scoreDelta": 0,
          "nextNodeId": "K16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop in the open court to study Niall's tally at leisure.",
          "failTitle": "A Bolt for Your Learning",
          "failText": "A quarrel from the gallery pins you to the stone before the chalk is half read.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the keys and rush the outer wheelhouse before Corren shifts more men below.",
          "scoreDelta": 1,
          "nextNodeId": "K16A"
        }
      ]
    },
    {
      "id": "K15B",
      "turn": 15,
      "title": "The Lower Yard Held - Steady Ground",
      "narrative": [
        "Your steadier handling kept you on the ground, but not cleanly enough to own it. Part of Niall's labor gang slipped away through the transept dark, and the feeder still drew under a strain you had not fully broken. Even so, a dropped key ring and the shattered chalk marks on the paving told you the next struggle lay at the outer wheelhouse below the south side of the priory.",
        "Elsbeth took a cut across the forearm and wrapped it without complaint. Tobin's punt had half stove in against a buried wall during the crossing, leaving him on foot and cursing the whole sainted ruin under his breath. None of it was fatal. All of it was costly.",
        "The marsh was no longer asking whether you had courage. It was asking whether you could spend it where it counted most."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take only the steadiest three and push through the transept crawl to the wheelhouse.",
          "scoreDelta": 1,
          "nextNodeId": "K16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Patch Tobin's craft, bind Elsbeth's arm, and move a little too carefully.",
          "scoreDelta": 0,
          "nextNodeId": "K16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Split your small force between tower and wheelhouse without enough men for either.",
          "failTitle": "Two Weak Blows",
          "failText": "Both pushes fail for want of weight. Corren keeps the deeper works because you tried to touch every danger at once.",
          "death": false
        }
      ]
    },
    {
      "id": "K15C",
      "turn": 15,
      "title": "The Bell Tower Side - Lost Ground",
      "narrative": [
        "Whether from caution or from simple bad timing, you reached the bell tower side with the priory already working against you. The second feeder housing stood there behind a braced tangle of timber, while somewhere below stone the outer wheelhouse hummed with the deep iron note of a mechanism already under strain.",
        "Niall's voice echoed once out of the dark and was gone, either deeper below or farther beyond your easy reach. The water around the tower no longer lapped. It pulled. Even the reeds bent toward the buried works as if curious about their awakening.",
        "You could still regain a little ground by using the enemy's own bracing against him, or waste strength hammering from outside while Corren turned the real matter in safety below."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Force Thorne onto the crumbling causeway to save a few moments.",
          "failTitle": "The Causeway Gives Way",
          "failText": "Stone drops under the horse's forelegs and black water closes over both of you. The priory does the rest.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pry loose one brace and slip through the gap toward the wheelhouse below.",
          "scoreDelta": 1,
          "nextNodeId": "K16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hammer at the feeder housing from outside and trust brute force to solve it.",
          "scoreDelta": 0,
          "nextNodeId": "K16C"
        }
      ]
    },
    {
      "id": "K16A",
      "turn": 16,
      "title": "The Outer Wheelhouse Taken - Clear Lead",
      "narrative": [
        "Your speed and nerve carried you into the outer wheelhouse before Corren expected company. The chamber smelled of old iron, river weed, and lamp smoke ground into stone over years when this place had still belonged to lawful maintenance. Two hired men died fast in the close dark, and a third fled below when he saw you put a hand to the main ratchet.",
        "The wheelhouse itself was not the heart of the matter, only the throat above it. Through a grated floor slit you glimpsed a larger chamber below where a heavier chain moved with the solemn weight of the Black Sluice proper. Yet if the ratchet above could be checked, the lower chamber would lose some of the force Corren counted on.",
        "You had the recovered windlass tooth, the right angle, and perhaps one true chance to make the buried works bite themselves instead of the marsh."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Jam the ratchet with the windlass tooth and drop straight for the lower chamber.",
          "scoreDelta": 1,
          "nextNodeId": "K17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lash the wheelhouse secure first so Corren cannot retake it behind you.",
          "scoreDelta": 0,
          "nextNodeId": "K17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Heave on the wrong lever in haste.",
          "failTitle": "The Room Turns on You",
          "failText": "Chain snaps, water slams through the housing, and the wheelhouse becomes a stone bucket with no way out.",
          "death": true
        }
      ]
    },
    {
      "id": "K16B",
      "turn": 16,
      "title": "The Outer Wheelhouse Contested - Steady Ground",
      "narrative": [
        "You reached the wheelhouse by a harder road and under uglier pressure, but you still gained its narrow iron throat while the fight was undecided. The ratchet was half stripped, the floor slick with bilge and old weed, and Elsbeth had to hold the stair mouth against two men who understood very well what your hands near the wheel might cost them.",
        "The recovered windlass tooth might still fit if seated with care. Senan had once said the old builders believed every mechanism wanted to return to its first intended line if given half a chance. Standing there with water beating under the floor, you almost believed the pious old fool.",
        "One clean adjustment could steal back time. One impatient move could give the whole machine a cleaner bite than Corren had won for it so far."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Barricade the stair and buy time to study the mechanism.",
          "scoreDelta": 0,
          "nextNodeId": "K17C"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Fit the tooth and force one hard reverse turn to blunt the draw.",
          "scoreDelta": 1,
          "nextNodeId": "K17A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Strike sparks in the pitch-dark house where fumes hang thick.",
          "failTitle": "Fire in the Wheelhouse",
          "failText": "The blast is small but final. Flame and pressure finish what the enemy only began.",
          "death": true
        }
      ]
    },
    {
      "id": "K16C",
      "turn": 16,
      "title": "The Outer Wheelhouse Slipping - Lost Ground",
      "narrative": [
        "By the time you gained the outer wheelhouse, Corren's men had already done part of their work and fled below. The wheel ground under your boots with every swell, and the whole chamber listed just enough to make balance a task instead of a gift. Tobin could still hold a lamp, but only by gripping the wall like a man refusing a grave with his fingertips.",
        "It was plain now that the true fight lay beneath, yet the wheel above still mattered. Leave it wholly untended and the lower chamber would be handed force. Wrestle with it too long and Corren would reach the buried gate beyond easy interference.",
        "The best path left to you was not the cleanest. It was merely the least wrong."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ignore the failing outer wheel and follow the chain down at once.",
          "scoreDelta": 1,
          "nextNodeId": "K17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout victory too early and draw the hidden axeman from the dark.",
          "failTitle": "Boast in the Dark",
          "failText": "The ax falls once from behind the gear post. You never hear the second swing.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay and wrestle the outer mechanism though the true fight is already below.",
          "scoreDelta": 0,
          "nextNodeId": "K17C"
        }
      ]
    },
    {
      "id": "K17A",
      "turn": 17,
      "title": "The Undercroft Gate - Clear Lead",
      "narrative": [
        "By jamming the ratchet or forcing a clean reverse turn, you stole back a sliver of time and entered the undercroft with the machine less obedient to Corren than he expected. The stair dropped into a chamber half crypt and half engine room, where thick bars stood before the lower wheel and damp old stones sweated with the cold breath of deep water.",
        "Niall was there with a pry bar, wild-eyed and mud-spattered, trying to free the final lock while Brother Senan hung bound to a pillar nearby. The old priest had been dragged from the chapel for his memory, and his face when he saw you held equal parts relief and shame.",
        "Everything narrowed at once. Niall still had hands on the last useful metal. Senan still had knowledge you might need one minute from now. There was no time to grant both equal care."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush both prisoner and traitor across the slick steps at once.",
          "failTitle": "The Gear Pit",
          "failText": "Your footing goes under you and the machine below takes what the enemy could not. Stone, iron, and water finish the matter together.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Drop Niall with a clean shot and seize the lock before it turns.",
          "scoreDelta": 1,
          "nextNodeId": "K18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Cut Senan loose first and trust Elsbeth to hold Niall for a heartbeat.",
          "scoreDelta": 0,
          "nextNodeId": "K18B"
        }
      ]
    },
    {
      "id": "K17B",
      "turn": 17,
      "title": "The Undercroft Gate - Steady Ground",
      "narrative": [
        "The path down was ugly and narrow, and you reached the undercroft almost shoulder to shoulder with Corren's last working crew. Niall was there with a pry bar and fever in his eyes, while Senan or Tobin hung bound to a pillar precisely where a decent man's gaze would be forced to go first.",
        "Beyond the bars, the lower wheel of the Black Sluice moved with a patience that felt worse than haste. One more unlocking motion and the whole buried gate would take its next command from Corren rather than from the old restraint still clinging to it.",
        "Mercy and necessity had come to quarrel in one wet chamber. Whatever choice you made, the other part of yourself would dislike it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Throw the recovered key ring through the bars to jam the lower cogs before Niall can turn them.",
          "scoreDelta": 1,
          "nextNodeId": "K18A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Free the hostage first and yield the first move below.",
          "scoreDelta": 0,
          "nextNodeId": "K18C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call on Niall to repent and waste the last breath of calm.",
          "failTitle": "Too Late for Conscience",
          "failText": "Niall answers with the pry bar, not with remorse. The lock turns while you speak.",
          "death": false
        }
      ]
    },
    {
      "id": "K17C",
      "turn": 17,
      "title": "The Undercroft Gate - Lost Ground",
      "narrative": [
        "By the time you forced the last stair, the undercroft was already alive with water noise and human panic. Corren had gone deeper, leaving Niall and two tired men to finish what remained, while a wounded ally hung in plain sight to split your purpose at the worst possible instant.",
        "The bars before the lower wheel stood open. Whatever margin you had once owned was gone now, yet not so gone that action meant nothing. Even late, a hard blow in the right place could still change how much of the marsh lived through the dawn.",
        "To save everyone was no longer on offer. To save enough still was."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Put the wounded ally behind you and charge Niall before the chain settles.",
          "scoreDelta": 1,
          "nextNodeId": "K18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Cut the ally free and go after Corren second.",
          "scoreDelta": 0,
          "nextNodeId": "K18C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop to search the chamber for another hidden lever.",
          "failTitle": "The Last Lock Falls",
          "failText": "While you fumble for a cleaner answer, the machine receives the only answer it needs. The surge takes the chamber and you with it.",
          "death": true
        }
      ]
    },
    {
      "id": "K18A",
      "turn": 18,
      "title": "The Black Sluice Chamber - Clear Lead",
      "narrative": [
        "Your quick hand at the lock bought the best footing you had all night. Beyond the bars the Black Sluice chamber sloped down like a stone throat toward a gate slab broader than a barn door, with Corren Vane braced at the main lever in an oilskin coat blackened by years of work rather than vanity. He looked older than the stories and more worn than mad.",
        "Water sheeted down the side walls. Through a vent cut high in the chamber you glimpsed Sallow Mere beginning to draw from its bed, just enough to show a dark line of buried stone beneath the black water. Corren did not deny what he meant. Duke Aldric's house, he said, had buried fen wages with the war stores and left men like him to bear blame when the works failed around them.",
        "Whatever truth lived inside that grievance, he had already yoked it to ruin. The lever still moved under his hands. The question now was whether you would meet him as a man, a mechanism, or both at once."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Close with Corren at once while Elsbeth holds the lever chain.",
          "scoreDelta": 1,
          "nextNodeId": "K19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Answer him long enough to learn how many turns remain before full release.",
          "scoreDelta": 0,
          "nextNodeId": "K19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Try to shoot Corren from too far away through the streaming dark.",
          "failTitle": "A Glancing Shot",
          "failText": "The bolt skitters off wet iron and the lever leaps under the recoil. Distance gives him the moment he needs.",
          "death": true
        }
      ]
    },
    {
      "id": "K18B",
      "turn": 18,
      "title": "The Black Sluice Chamber - Steady Ground",
      "narrative": [
        "Whether by mercy or hard charge, you reached the Black Sluice chamber with less room and more noise than you would have wished. Corren already had one hired man on the chain and the main lever half over, while water pulsed through the hidden channels like a second set of lungs beneath the priory floor.",
        "He spoke as you came on, not boasting, not pleading. Men like him had kept the marsh breathing for lords who remembered them only when the banks failed. If the old cache under the mere paid the debts of the living at the cost of a few lordly fields, so be it. It was the speech of a man who had balanced hurt and arithmetic until mercy no longer seemed rational.",
        "Understanding him did nothing to make him less dangerous. You still had to choose where a finite body and a finite second should go."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Go wide for the side brake wheel and stop the next pull instead of the man.",
          "scoreDelta": 0,
          "nextNodeId": "K19C"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut the chain-man first and make the lever a one-on-one struggle.",
          "scoreDelta": 1,
          "nextNodeId": "K19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Parley over the hidden coin while Corren keeps working.",
          "failTitle": "Words Against Iron",
          "failText": "Corren listens just long enough to take the last useful turn. Talk becomes surrender by another name.",
          "death": false
        }
      ]
    },
    {
      "id": "K18C",
      "turn": 18,
      "title": "The Black Sluice Chamber - Lost Ground",
      "narrative": [
        "You came into the Black Sluice chamber too late for speeches to matter much. Corren had the main lever half over, the stone gate was already moving in its flooded slot, and the air tasted of old silt, oil, and the kind of cold that belongs below rivers rather than beneath churches.",
        "Even now, the mechanism had not fully taken its set. A side brake still stood within reach, and the chain at the main lever still required living hands to master it. Through the vent you could see the mere bed glistening up through falling water and, beyond it, the blunt outline of the buried toll cellar.",
        "The worst temptation lay in sight, which made discipline more valuable than courage. One road led toward treasure and final failure. The other led toward hard labor that might still spare strangers who would never know how near they had come to ruin."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leap for the exposed cellar path instead of the machine.",
          "failTitle": "The Treasure Road",
          "failText": "Greed or desperation draws you the wrong way. The gate takes its final set while you chase stone under falling water.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Dive for the side brake and trust your allies to distract Corren.",
          "scoreDelta": 1,
          "nextNodeId": "K19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Throw your full weight onto the main chain and try to slow what is already moving.",
          "scoreDelta": 0,
          "nextNodeId": "K19C"
        }
      ]
    },
    {
      "id": "K19A",
      "turn": 19,
      "title": "At the Lever - Clear Lead",
      "narrative": [
        "By going straight at Corren, you met him at the lever before the mechanism could bite fully home. He was stronger than rumor suggested, all shoulder and forearm from years of chain and wheel, but you were fresher and fighting on the ground you had chosen. The lever bucked between you while Elsbeth drove her boot against the chain to steal him force.",
        "For an instant the whole chamber hung on muscle, footing, and the old iron reluctance of a machine dragged against its intended line. Corren's face was close enough now for you to see not madness but certainty, which was in some ways the harder thing to defeat.",
        "One clean decision could end the business before dawn. A less clean one would still save the marsh, perhaps, but not without handing the night another cost."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Corren to Elsbeth for a heartbeat and dive for the brake pins.",
          "scoreDelta": 0,
          "nextNodeId": "K20B"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrench the lever into the half-lock and strike Corren down before the crest hits.",
          "scoreDelta": 1,
          "nextNodeId": null,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Try to take him alive with bare hands while the lever still moves.",
          "failTitle": "Under the Chain",
          "failText": "Mercy comes a second too early. Lever, chain, and water drag both of you into the mechanism.",
          "death": true
        }
      ]
    },
    {
      "id": "K19B",
      "turn": 19,
      "title": "At the Lever - Steady Ground",
      "narrative": [
        "The fight went close and ugly. Whether you had cut the chain-man, jammed the lock, or dived for the brake, you now held one hand on the machine and one eye on Corren, who kept forcing the matter with the stubborn patience of a master workman who had mistaken endurance for justice.",
        "The mere outside was drawing down, but not fully. Senan shouted from somewhere behind you that the next hard pull would decide whether the outer banks merely suffered or truly tore. Corren heard it too. His grin was not joy. It was recognition.",
        "You still had enough in hand to choose the shape of the dawn. Not the whole of it, perhaps, but enough."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Demand the cache key from Corren before you finish with the lever.",
          "failTitle": "The Wrong Demand",
          "failText": "Corren answers by driving the lever another notch. The marsh pays for your divided attention.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Kick free the side brake and throw Corren off balance in the same motion.",
          "scoreDelta": 1,
          "nextNodeId": "K20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the brake and let Corren flee deeper if he must while you save the marsh first.",
          "scoreDelta": 0,
          "nextNodeId": "K20C"
        }
      ]
    },
    {
      "id": "K19C",
      "turn": 19,
      "title": "At the Lever - Lost Ground",
      "narrative": [
        "You were reduced now to raw contest with water, iron, and the man who had planned them. Corren kept half a turn of advantage, the brake wheel screamed under your grip, and through the vent the outline of the toll cellar began to show more clearly with every handbreadth the mere gave up.",
        "Even in this narrow defeat there were still different kinds of failure. Catching Corren and saving the banks no longer sat together easily in the same hand. You could still choose which loss you would permit and which one you would deny with whatever strength remained.",
        "The chamber offered no honor except usefulness. If you wanted a better ending than the ground promised, usefulness would have to be enough."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Abandon the chance to seize Corren and hammer the brake pin home with your sword pommel.",
          "scoreDelta": 1,
          "nextNodeId": "K20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leap for the cellar path the instant it clears.",
          "failTitle": "The Cellar Takes You",
          "failText": "The old stone road is slick with first draw. You vanish beneath a fresh rush before your boots find a second step.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the chain and shout for the others to clear the lower farms.",
          "scoreDelta": 0,
          "nextNodeId": "K20C"
        }
      ]
    },
    {
      "id": "K20A",
      "turn": 20,
      "title": "Dawn over Saint Edda - Clear Victory",
      "narrative": [
        "Your clean handling of the brake in the last moments turns the whole struggle just enough. The Black Sluice slams short of full release, and the recoil hurls Corren against the stone lip hard enough to take the fight out of him. Water still tears through the priory works, but not with the ruinous force that would have broken the lower banks beyond quick mending.",
        "By dawn the mere has settled into a harsh new calm. The buried toll cellar stands only half revealed, its old door still sealed under mud and iron bands, while Fenbridge's lower fields lie wet but living. Elsbeth gets men onto the banks before panic takes root again, and Senan's witness will matter when Duke Aldric asks what, if anything, should now be claimed from the old war stores.",
        "The night leaves you cold, sore, and black with priory silt, but the Deep Marshes remain a place that can be repaired rather than mourned. Corren breathes, if barely, and the first gray light finds you standing over a danger kept from becoming a legend."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure Corren, seal the chamber, and call the wardens to witness the unopened cellar.",
          "scoreDelta": 0,
          "nextNodeId": null,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the old cellar seals in secret before Aldric can arrive.",
          "failTitle": "The Vault Collapses",
          "failText": "The half-revealed cellar roof gives under your meddling. Mud, stone, and scandal bury the victory you had already won.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the lever with Senan's witness and ride at first light to warn every lower farm yourself.",
          "scoreDelta": 1,
          "nextNodeId": null,
          "endStory": true,
          "endType": "high"
        }
      ]
    },
    {
      "id": "K20B",
      "turn": 20,
      "title": "Dawn over Saint Edda - Hard-Won Holding",
      "narrative": [
        "The brake pin takes under your blow and the worst of the release dies with a scream of iron rather than a tearing of banks. It is not a perfect saving. One outer embankment slumps, two meadows go under, and the priory works groan like an old beast in pain. But the lower villages are spared the grave you had feared for them.",
        "Corren does not own the ending cleanly either. Perhaps Elsbeth clubs him down in the spray. Perhaps he slips into the reed drains with one shoulder ruined and blood in the water behind him. Either way, the toll cellar remains sealed for the moment, and the marsh has been hurt, not broken.",
        "At dawn the hard work begins instead of the mourning. Men who might have fled now take spades and rope. Tobin curses, Senan prays, and Thorne stands shivering but steady under a sky that has finally spent most of its rain."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Smash the mechanism in fury and trust chance to finish the work.",
          "failTitle": "The Second Surge",
          "failText": "Your rage breaks what little order remains in the chamber. A fresh surge undoes the lives you had just spared.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Put the villages first and leave the sealed cellar untouched until Duke Aldric comes.",
          "scoreDelta": 1,
          "nextNodeId": null,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Corren's trail into the reeds and leave Fenbridge to mend without you.",
          "scoreDelta": 0,
          "nextNodeId": null,
          "endStory": true,
          "endType": "low"
        }
      ]
    },
    {
      "id": "K20C",
      "turn": 20,
      "title": "Dawn over Saint Edda - Bitter Saving",
      "narrative": [
        "You do not stop the Black Sluice cleanly, but you do rob it of its worst appetite. The mere draws farther than you would have allowed, several lower fields drown in cold spring water, and the stone road toward the toll cellar shows itself like an old bone through skin. Yet the villages themselves remain standing, and the great break in the banks never comes.",
        "Corren is gone, or dead where the water took him, or lost in such a way that only rumor will claim certainty. Around you the priory drips and settles into a new ugliness. Men who had wanted a clean ending get instead the familiar labor of hauling survivors, counting damage, and keeping greedy hands away from what disaster has exposed.",
        "It is not the dawn you wanted, but it is still a dawn with living people in it. In Brackenwald that has often been the difference between failure and duty done."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Drive the villagers back from the exposed cellar and hold the embankment until soldiers arrive.",
          "scoreDelta": 1,
          "nextNodeId": null,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Pull survivors clear and abandon the priory ground to flood and scavengers.",
          "scoreDelta": 0,
          "nextNodeId": null,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Run for the first glimpse of coin beneath the cellar door.",
          "failTitle": "A Poor End",
          "failText": "The old stones shift under greedy feet. What the flood spared, the collapse finishes.",
          "death": true
        }
      ]
    }
  ]
});
