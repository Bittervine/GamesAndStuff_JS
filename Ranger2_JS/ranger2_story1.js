window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "false-fires-of-saint-werran",
  "title": "The False Fires of Saint Werran",
  "summary": "When dead beacon-keepers and midnight signal fires throw Oakenhurst into fear, the ranger of Brackenwald must uncover who is calling an old war code back to life before winter grain, river roads, and the people gathered at Saint Werran fall into the hands of a disciplined outlaw band.",
  "maxTurns": 20,
  "startNodeId": "K01A",
  "goodScoreThreshold": 12,
  "epilogues": {
    "high": "Rorik Vane's line of false fires breaks at Saint Werran, and the winter grain reaches the villages it was meant to feed. Captain Elswyth keeps the roads, Brother Ansel seals away the old beacon rolls, and Duke Aldric hears that his ranger held Brackenwald together not by sorcery or luck, but by hard riding, clear judgment, and a steady hand when panic would have ruined all.",
    "low": "The fires are put out at last, but not before fear, smoke, and hurried bloodshed leave their mark on Saint Werran. Oakenhurst stands and the roads remain the duke's, yet winter settles over Brackenwald with fewer stores, quieter bells, and too many people remembering how close one clever, bitter man came to turning the whole border against itself."
  },
  "nodes": [
    {
      "id": "K01A",
      "turn": 1,
      "title": "Oakenhurst Gate - First Alarm",
      "narrative": [
        "You reached Oakenhurst at dusk with Thorne lathered from the long road, and before the stable boy had your reins in hand Captain Elswyth Marek was already crossing the yard toward you with rain on her cloak and urgency in her face.",
        "A beacon had burned on Fox Tor in the last dark hour before dawn, though no levy had been called and no enemy banner had been seen on any border road. The keeper, Hadrin, was found dead below the stair, and a second fire had answered from farther west before the sky went pale.",
        "Brother Ansel of Saint Werran had old signal rolls spread on a table in the gatehouse. He said the pattern was wrong for war and wrong for flood, yet it had been made by someone who knew the code well enough to frighten half the district and pull every eye away from whatever mattered most.",
        "The duke was days away in Riverland, the winter grain convoy was due through Saint Werran, and frightened folk were already loading carts by torchlight. Whatever this was, it had been planned by patient hands."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ride Thorne straight to Fox Tor before dawn can wash the signs away.",
          "nextNodeId": "K02A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Treat the beacon as peasant fear and turn in for the night.",
          "failTitle": "Night of Panic",
          "failText": "By morning three more false signals have burned, the roads clog with fleeing carts, and the real strike falls on Saint Werran while you sleep under a safe roof. Brackenwald does not forgive that kind of delay.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question Captain Elswyth and the witnesses before you leave the town.",
          "nextNodeId": "K02B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K01B",
      "turn": 1,
      "title": "Saint Werran Chapel - Old Code",
      "narrative": [
        "You stood in the side room of Saint Werran chapel with wet gloves on the table and Brother Ansel bent over a bundle of cracked parchment that smelled of smoke, wax, and old dust.",
        "Captain Elswyth had ridden down from Oakenhurst herself because she trusted neither rumor nor luck. Hadrin lay dead on Fox Tor, a western beacon had answered him, and no one could say whether the night had announced raiders, fools, or something worse than either.",
        "The old priest tapped the signal columns with a yellow nail and said that whoever lit those fires knew the wartime books, or had once served under a man who did. That narrowed the danger in one sense and widened it in every other.",
        "Outside, bells were being rung to calm the town, though the sound did little good. Fear had already taken hold, and fear moved faster than horseflesh."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question Captain Elswyth and the witnesses before you leave the town.",
          "nextNodeId": "K02B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search Hadrin's hut and gear before climbing the tor.",
          "nextNodeId": "K02C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order the chapel bell rung for a levy before you know the truth.",
          "failTitle": "The Wrong Muster",
          "failText": "The fields empty, the roads knot with panic, and the men you needed in the right places are drawn into the wrong one. The enemy you never even saw takes his prize behind the noise you made for him.",
          "death": false
        }
      ]
    },
    {
      "id": "K01C",
      "turn": 1,
      "title": "East Road - Rain Before Night",
      "narrative": [
        "You came in from the east road under a low sky that pressed the whole vale flat and gray, and before you had even dismounted a frightened warden at the gate was telling you about fire on Fox Tor.",
        "The tale sharpened once Captain Elswyth arrived. Hadrin was dead, a second beacon had answered from beyond the ridge, and every farmer between Oakenhurst and Saint Werran was now watching the hills instead of the roads beneath them.",
        "Brother Ansel arrived with his books wrapped in oilcloth and said the sign was no blunder made by boys. Someone had reached back into the old defenses of Brackenwald and pulled on a line that most living men had forgotten was still there.",
        "The kind of mind that did that would not stop at fear alone. If there was a purpose beneath the signal, you meant to find it before midnight found another hilltop."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send every available rider north on the strength of the beacon alone.",
          "failTitle": "Roads Left Bare",
          "failText": "You strip the wrong roads empty, and the hidden blow lands exactly where no one remains to meet it. The trick was meant for a man in a hurry, and you oblige it perfectly.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride Thorne straight to Fox Tor before dawn can wash the signs away.",
          "nextNodeId": "K02A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search Hadrin's hut and gear before climbing the tor.",
          "nextNodeId": "K02C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K02A",
      "turn": 2,
      "title": "Fox Tor - Fresh Smoke",
      "narrative": [
        "You rode straight to Fox Tor and reached the beacon while the stones still gave off a little warmth. The wind had thinned the smoke, but not enough to hide how recently the fire had been fed.",
        "Hadrin lay where he had fallen below the stair, not butchered, but struck down fast and efficiently. His hands were black with soot, which told you he had tried to smother the blaze after it was lit.",
        "There were two clear tracks beyond the platform. One belonged to Hadrin's boots, the other to a man in hobnailed soles who had come up the south path and left in company with a mule. A strip had been torn from the code board inside the shelter, and the lamp oil cask had been used, not the beacon pitch.",
        "The trail was fresh, Brother Ansel's rolls might explain the missing strip, and Oakenhurst was already filling with talk. Each road promised something, though not all of them promised it in time."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Light Fox Tor again and answer the unknown signal with one of your own.",
          "failTitle": "Answered Fire",
          "failText": "Your blaze tells the hidden men their work has succeeded and sends a second wave of panic through the district. By the time you ride down, Saint Werran has already been marked for the true assault.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the signs to Brother Ansel and read the old beacon rolls.",
          "nextNodeId": "K03B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the fresh hobnailed trail down the lime road.",
          "nextNodeId": "K03A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K02B",
      "turn": 2,
      "title": "Fox Tor - Cold Questions",
      "narrative": [
        "You spent precious minutes with Elswyth, the gate wardens, and the two farmers who first saw the flare, and the delay gave you better words even as it cost you better tracks. By the time you reached Fox Tor, the smoke was colder and the wind had begun to scatter the story written in mud.",
        "From the witnesses you had one useful thing that the ground could not give you. Hadrin had stumbled into the gatehouse yard the previous evening to ask whether the Saint Werran road had been moved, as if some talk of wagon times and signal orders had already reached his ear.",
        "At the tower you found the same torn code board, the same used lamp oil, and the print of a mule wheel where no supply cart belonged. The murder had been quick, and it had been done by men who came to work rather than rage.",
        "You could still take the dead keeper's warning to Brother Ansel, or you could go after the human side of the matter and see who in Oakenhurst had been listening too closely to the road."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Carry the signs to Brother Ansel and read the old beacon rolls.",
          "nextNodeId": "K03B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Spread the tale of invasion at once so the town will be ready.",
          "failTitle": "A Town Turned by Fear",
          "failText": "The rumor outpaces any truth you might have found. Families clog the road to Saint Werran, wardens are dragged into calming the crowd, and the unknown enemy gains every hour he was hoping to buy.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Work the inn yard and stables for rumor before you chase shadows.",
          "nextNodeId": "K03C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K02C",
      "turn": 2,
      "title": "Hadrin's Hut - Hidden Tallies",
      "narrative": [
        "You searched Hadrin's hut and gear before climbing to the beacon, and the choice cost you the freshest edge of the trail while giving you a different kind of sign. Tucked beneath a loose board in the bunk was a tally stick marked with wagon days and river barges, not hill patrols.",
        "In a peg by the door hung a waxed cord with three knots in it and a smear of red clay from no field on Fox Tor. Hadrin had also scratched one hurried line into the wall beside his table, a half-finished note that ended with the words Saint Werran road.",
        "When you went up to the platform the rest matched what you expected by then. Lamp oil, torn code strip, mule sign, and a killing done by capable men who knew how to leave only what could not be helped.",
        "You now had proof that the signal touched the roads below, but not yet how. The answer might lie with the old rolls, the fresh trail, or the loose tongues in Oakenhurst."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the fresh hobnailed trail down the lime road.",
          "nextNodeId": "K03A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Work the inn yard and stables for rumor before you chase shadows.",
          "nextNodeId": "K03C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep Hadrin's tally to yourself and ride alone without warning anyone.",
          "failTitle": "One Man Against a Net",
          "failText": "You keep too much in your own head, and the men you might have used never know what road to guard. When the strike comes, you are brave, alone, and in the wrong place.",
          "death": true
        }
      ]
    },
    {
      "id": "K03A",
      "turn": 3,
      "title": "Lime Road - The Fresh Trail",
      "narrative": [
        "You followed the hobnailed trail down the old lime road and found it made by men who kept pace even after murder. The prints were clean, the mule was well burdened, and no one had wasted motion on panic or drink.",
        "Thorne picked his way through broken chalk and fern while the land dropped toward Saint Werran. Here and there you found a smear of lamp oil on bark, as if shutters or signal hoods had been loaded and checked on the move.",
        "Near a fallen kiln you met Tavin Pike, one of Elswyth's young scouts, who had been sent to look for cart tracks and instead found disciplined boot marks heading west. He said a mule cart had also slipped out of Oakenhurst by the south gate shortly after dusk.",
        "The men on the road were moving with purpose, but purpose toward what remained uncertain. Dunsill Ridge, Saint Werran causeway, and the disappearing cart all pulled at the same knot from different sides."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn Elswyth quietly and set watchers on Saint Werran causeway.",
          "nextNodeId": "K04B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ride for Dunsill Ridge and catch the next beacon before moonrise.",
          "nextNodeId": "K04A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Press on alone into the trees and leave the mule cart for later.",
          "failTitle": "Trail Into Darkness",
          "failText": "The road turns into pine breaks and hidden men let you come just far enough. A weighted cord catches your throat from behind, and the next fire burns over a ranger who never made it back with the truth.",
          "death": true
        }
      ]
    },
    {
      "id": "K03B",
      "turn": 3,
      "title": "Saint Werran Chapel - Meaning in the Ashes",
      "narrative": [
        "You carried Hadrin's signs to Brother Ansel, and the old priest read them with more speed than his age suggested. The missing strip, the use of lamp oil, and the order of the fires forced him to pull down a set of wartime rolls no one had opened in years.",
        "He found the nearest match before the candles had guttered. Fox Tor followed by a western answer was not the sign for invasion at all. It was a draw signal, meant to turn watchers toward the hills and leave the Saint Werran road thin at the exact hour when wagons would be most exposed.",
        "Captain Elswyth swore softly and sent only two quiet riders instead of a trumpet call, which was wise. If someone inside Oakenhurst was feeding times to the enemy, noise would help him more than it helped you.",
        "You could now move to Dunsill and try to break the next part of the chain, strengthen the causeway without showing your hand, or take hold of the mule-cart lead before it vanished into the night."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send every bell and horn to Saint Werran so no one can miss the warning.",
          "failTitle": "Too Loud by Half",
          "failText": "The hidden men hear your answer as plainly as the villagers do. By the time the watch gathers at the causeway, the enemy has already changed roads and doubled back beyond your sight.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn Elswyth quietly and set watchers on Saint Werran causeway.",
          "nextNodeId": "K04B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Shadow the mule cart that slipped out of Oakenhurst at dusk.",
          "nextNodeId": "K04C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K03C",
      "turn": 3,
      "title": "Inn Yard - Loose Tongues",
      "narrative": [
        "You worked the inn yard, the smith's lean-to, and the stables where men talked more freely around horses than around captains. The choice paid quickly, though not cleanly.",
        "A drayman remembered a mule cart buying lamp oil after dark and taking the south gate instead of the chapel road. Another swore he saw the ostler Joss Weller speaking with a hooded stranger near the hitching rail and looking over his shoulder like a man with a debt collector in the shadows.",
        "Joss denied everything when you first looked his way, but fear sat on him too plainly to mistake. He flinched at the name Saint Werran and at the thought of the old quarry track west of town.",
        "You had rumor instead of proof, but rumor of the right sort can be worth a mile of footprints. The next step would need to be chosen with care."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Shadow the mule cart that slipped out of Oakenhurst at dusk.",
          "nextNodeId": "K04C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize Joss in the yard and beat a confession out of him in public.",
          "failTitle": "The Wrong Kind of Fear",
          "failText": "Joss breaks only enough to panic and bolt, the real conspirators vanish into the dark, and the town learns of the danger before the watch can place a single careful guard.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride for Dunsill Ridge and catch the next beacon before moonrise.",
          "nextNodeId": "K04A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K04A",
      "turn": 4,
      "title": "Dunsill Ride - Beating the Moon",
      "narrative": [
        "You rode for Dunsill Ridge with Tavin at your stirrup until the scout fell back to save his horse, and by the time you reached the lower slope the moon had lifted only a pale hand above the trees.",
        "The climb was steep and the wind on the ridge carried sounds farther than daylight ever did. From that height you could see Saint Werran as a scatter of lanterns near the road and the dark belt of the marsh beyond it.",
        "If another beacon was meant to burn, this was the place to stop it. Yet a fire is only the visible end of a plan, and plans often hide their true body lower down where wagons move and people gather.",
        "You slowed and weighed the ridge against the road beneath it, knowing a clever enemy would be delighted if you chose what looked most dramatic and ignored what was merely useful."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Climb Dunsill Ridge and watch the beacon platform from cover.",
          "nextNodeId": "K05A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Gallop openly to the beacon top and challenge whoever is there.",
          "failTitle": "Seen Too Soon",
          "failText": "An archer waiting below the crest puts a shaft through your shoulder before you even clear the last rocks. The men you came to catch scatter into the dark while you bleed on bare stone.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn Elswyth quietly and set watchers on Saint Werran causeway.",
          "nextNodeId": "K05B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K04B",
      "turn": 4,
      "title": "Saint Werran Causeway - Quiet Preparations",
      "narrative": [
        "You warned Elswyth quietly and put watchers on the Saint Werran causeway without letting the village know why. It was the sort of work that felt small while it was being done and mattered greatly if done well.",
        "The grain yards, barges, and bridge approaches all lay within a short hard run of one another. Too many families had already begun drifting toward the chapel for safety, which meant that any strike here would find both stores and frightened people in the same narrow ground.",
        "You noticed fresh scuffs on the mill yard wall, missing lamp oil from a shed, and marks in the mud where someone had stood long enough to count wheels. That was not bandit work. That was preparation.",
        "Dunsill still hung over the whole affair, but the road itself now looked like the center of the board. Somewhere nearby, someone meant to turn the next signal into movement."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect the causeway storehouses and mill yard yourself.",
          "nextNodeId": "K05B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the mule cart to the abandoned charcoal pits.",
          "nextNodeId": "K05C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Post every warden in plain sight and dare the attackers to come.",
          "failTitle": "An Empty Hook",
          "failText": "The enemy sees the road bristling with watch and simply chooses another lane and another hour. Your visible strength buys only invisible defeat.",
          "death": false
        }
      ]
    },
    {
      "id": "K04C",
      "turn": 4,
      "title": "South Gate Track - The Mule Cart",
      "narrative": [
        "You shadowed the mule cart out of Oakenhurst at a long distance and let dark ground do the work for you. The driver knew how to keep to hedges, side tracks, and hollows that hid him from casual eyes.",
        "He did not take the chapel road. Instead he bent west along a neglected lane used by charcoal burners and lime men, the sort of route that led nowhere worth visiting unless someone had made it worth using again.",
        "Twice the driver gave a low whistle and twice he was answered from farther off in the trees. The second answer came from the direction of the abandoned pits, where old kilns and spoil heaps gave plenty of cover to careful men.",
        "You could keep on his heels, or break off to where the true strike seemed likelier to fall. Either way, the cart had done one good thing for you already. It had turned rumor into shape."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop the cart in the lane and force the matter before you know what waits nearby.",
          "failTitle": "Men in the Dark Banks",
          "failText": "The driver was bait and the banks were full. A cudgel blows you from the saddle, Thorne bolts into the night, and the cart rolls on to finish its work without you.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Climb Dunsill Ridge and watch the beacon platform from cover.",
          "nextNodeId": "K05A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the mule cart to the abandoned charcoal pits.",
          "nextNodeId": "K05C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K05A",
      "turn": 5,
      "title": "Dunsill Platform - Men Who Know the Code",
      "narrative": [
        "You climbed Dunsill Ridge under cover and reached the last rise before the beacon platform with enough time to lie flat among the heather. From there you watched three men come up by the back path with a shuttered lantern and a mule load of oil.",
        "They moved like former soldiers, not hedge thieves. One checked the horizon, one measured the wick, and the third spoke only once, telling the others that Master Vane wanted the hill bright and brief so the road below would draw its own fools.",
        "They lit the fire, hooded it at the right count, and left as efficiently as they had come. In their haste one of them dragged a bound wagoner from the rocks where he had been hidden and cursed him for slowing the descent.",
        "Now you had men to chase, a living witness to question, and proof that the signal served a mind still working farther down the line."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow at the three of them and trust the dark to finish the rest.",
          "failTitle": "One Shot Too Few",
          "failText": "You kill one man and lose the other two, who vanish with the code, the mule, and the truth you needed. The beacon has already burned, and your boldness buys only a grave and a guessing game.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the rescued wagoner about the men who took him.",
          "nextNodeId": "K06B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pursue the signalmen into the pine breaks before they scatter.",
          "nextNodeId": "K06A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K05B",
      "turn": 5,
      "title": "Mill Yard - Counting the Prize",
      "narrative": [
        "You inspected the causeway storehouses and mill yard yourself and quickly saw why the false fires had been aimed at this road. Winter grain stood under guard, river barges were due at first light, and half the frightened valley was already drifting toward nearby shelter.",
        "Under the mill platform you found a wagoner bound at the wrists with a clean soldier's knot. He had been struck but not robbed, which was telling. His captors wanted his wagon schedule and the measure of the guards, not the small coins in his purse.",
        "The man remembered one name spoken in anger while they moved him from cart to cart. Vane. He also heard talk of a second signal and a mule train heading back toward the charcoal pits with spare oil and ropes.",
        "The board was clearing now. Someone had built a net from old signals, careful timings, and a few good roads. You meant to tear it, but you still had to choose where first."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Question the rescued wagoner about the men who took him.",
          "nextNodeId": "K06B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the grain openly at once and hope speed is enough.",
          "failTitle": "Wheels in the Open",
          "failText": "The road is watched more closely than you knew. The first wagon never clears the willows before hidden men cut the team loose and panic does the rest for them.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the outlaw cache for maps, cords, and names.",
          "nextNodeId": "K06C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K05C",
      "turn": 5,
      "title": "Charcoal Pits - The Hidden Cache",
      "narrative": [
        "You followed the mule cart to the abandoned charcoal pits and found more order there than any burned-out work site should have held. Beneath tarps and spoil heaps sat oil jars, spare signal hoods, rope bundles, and a careful line of feed sacks for animals expected to return.",
        "The cart driver met two men and spoke in low, clipped phrases. You caught Saint Werran, second fire, and one other useful thing when one of them asked whether Weller had sent the proper hour from town.",
        "After they moved off you searched the place and found a rough map of the causeway, a list of watch changes, and the name Joss marked beside the stable sign for Oakenhurst. No magic, no monsters, only discipline and betrayal, which was often worse.",
        "The enemy's shape was plain enough now to hurt. You could run one branch of it to ground, question a witness, or strip the cache for whatever it still hid."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Pursue the signalmen into the pine breaks before they scatter.",
          "nextNodeId": "K06A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search the outlaw cache for maps, cords, and names.",
          "nextNodeId": "K06C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the entire cache and ride away satisfied.",
          "failTitle": "Proof in Ashes",
          "failText": "The smoke destroys the clues you needed more than the stores the enemy can replace elsewhere. You leave with a warm feeling and a colder trail.",
          "death": false
        }
      ]
    },
    {
      "id": "K06A",
      "turn": 6,
      "title": "Pine Breaks - Hard Chase",
      "narrative": [
        "You pursued the signalmen into the pine breaks and nearly had them. The ground there was tight with roots and old needles, good for fast feet and poor for horses, yet Thorne still carried you close enough to hear them cursing one another by name.",
        "You did not catch Rorik Vane, but you took something almost as useful. One rider dropped a signal hook and a waxed cord marked for Blackthorn and Saint Werran, and that cord told you the fires were part of a wider line rather than one night's trick.",
        "Before the men vanished between the trunks, one shouted that Oakenhurst would give the proper hour soon enough. That single sentence confirmed what the cache had only suggested. Someone in town was feeding them road times.",
        "A field chase had won you momentum but not certainty. To use what you had, you now needed either the town, the priest, or the frightened man whose name sat too plainly on the enemy's list."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the matter quiet and test who in town is passing wagon times.",
          "nextNodeId": "K07B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Return hard to Oakenhurst and force an immediate muster.",
          "nextNodeId": "K07A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride after the fleeing men all the way through the dark forest.",
          "failTitle": "The Hidden Snare",
          "failText": "They lead you exactly where they mean to, and a low wire between two trees takes you from the saddle at a full run. The forest keeps the rest of the story without your help.",
          "death": true
        }
      ]
    },
    {
      "id": "K06B",
      "turn": 6,
      "title": "Wagoner's Tale - The Name of Vane",
      "narrative": [
        "You questioned the rescued wagoner while Elswyth's men gave him water and cut his wrists free. Fear made him shake, but not so badly that he could not remember what mattered.",
        "Their leader had been called Vane, or Master Vane by the younger men. He spoke like someone accustomed to obedience and knew the road measures, bridge spans, and watch changes better than many wardens who actually served the duke.",
        "The wagoner also heard them say that a man in Oakenhurst would give the grain hour when the time came. That turned the whole affair from an external raid into something more dangerous, because it meant the enemy had a hand already inside the lock.",
        "You left the man with Elswyth and weighed the three obvious roads before you. None were comfortable, which was often a good sign that at least one of them would be right."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell the wagoner to spread the name of Vane so the town will harden itself.",
          "failTitle": "A Name in the Wrong Mouths",
          "failText": "The rumor reaches the informer before it reaches the men you trust. By the time you return to Oakenhurst, the leak has fled and the next signal plan has already changed.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the matter quiet and test who in town is passing wagon times.",
          "nextNodeId": "K07B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Go straight to Joss Weller before fear drives him to run.",
          "nextNodeId": "K07C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K06C",
      "turn": 6,
      "title": "The Cache Records - A Town Connection",
      "narrative": [
        "You searched the cache thoroughly and found that Vane's men kept records with a quartermaster's mind. Feed weights, lamp measures, watch estimates, and alternate lanes had all been marked in rough but orderly script.",
        "One map ringed Saint Werran in charcoal and noted three times beside the grain road. Another scrap named Weller's stable sign and the old quarry west of Oakenhurst. That tied the town leak to a second place of leverage, though whether the quarry held goods or a hostage you could not yet tell.",
        "Brother Ansel, when shown the cord and marks, said only one kind of man would think to revive a beacon chain this way: a former signal officer or a soldier who had served close to one. Vane was no hedge bandit. He was building campaign logic out of small civilian roads.",
        "That meant every next move had to do more than answer the last fire. It had to break his confidence that Oakenhurst still belonged partly to him."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Go straight to Joss Weller before fear drives him to run.",
          "nextNodeId": "K07C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Joss unwatched while you prepare a broad search of the district.",
          "failTitle": "The Missing Ostler",
          "failText": "By the time the search begins, Joss, the quarry lead, and every useful scrap in his room are gone. Vane loses nothing except the weak link you might have turned.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Return hard to Oakenhurst and force an immediate muster.",
          "nextNodeId": "K07A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K07A",
      "turn": 7,
      "title": "Oakenhurst Watchhouse - Proof on the Table",
      "narrative": [
        "You returned hard to Oakenhurst and laid the hook, cords, and marked map before Captain Elswyth in the watchhouse. She looked at them once, swore, and began calling trusted wardens in by name rather than by bell.",
        "The room filled with wet cloaks, low voices, and controlled urgency. Brother Ansel confirmed that Blackthorn and Saint Werran stood further down the old beacon line, which meant Vane could still pull more men out of position if he chose his hours well.",
        "Joss Weller had not yet fled, but every sign pointed toward him or toward someone holding a knife against something he loved. Elswyth wanted to seize him at once. You were less certain, because a frightened informer can be more useful before he knows he is caught.",
        "The question was no longer whether a strike was coming. The question was whether you wanted to use the leak, cut it free, or wait and watch what it touched."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Stage false wagon times with Joss under guard and use the leak.",
          "nextNodeId": "K08A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Have Joss hanged at once as a warning to anyone else involved.",
          "failTitle": "Justice Without Sense",
          "failText": "Joss dies before he can tell you who held him, where they held his leverage, or what signal still waits to be sent. Vane loses a pawn and keeps the whole board.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the matter quiet and test who in town is passing wagon times.",
          "nextNodeId": "K08B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K07B",
      "turn": 7,
      "title": "Stable Yard Test - The Leak Tightens",
      "narrative": [
        "You kept the matter quiet and tested the town leak instead of seizing the nearest suspect. Three different wagon hours were quietly spoken in three different corners of Oakenhurst, and you waited to see which one would move.",
        "By dusk only one false hour had traveled beyond the walls. A hooded youth left by the south gate, and Joss Weller turned white when Captain Elswyth asked him, in passing, whether his younger brother still worked stone west of town.",
        "That was enough. Joss was not the mind behind the plot, merely one of its handles. He had been bent, not made. Men like Vane prefer that sort of weakness because it can be tugged again and again without breaking until the last moment.",
        "You could now work the leak as bait, go to the quarry where its weight seemed to lie, or watch the gate for the next hand that reached in to take hold of it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Scout the old quarry and reach Niall Weller before dawn.",
          "nextNodeId": "K08B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hide by the south gate and wait for the informer to move.",
          "nextNodeId": "K08C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce to the whole yard that Joss is under suspicion.",
          "failTitle": "Handle Torn Away",
          "failText": "Joss bolts, the gate contact vanishes, and whatever was held over him is either moved or killed before you can reach it. Your care ends in noise after all.",
          "death": false
        }
      ]
    },
    {
      "id": "K07C",
      "turn": 7,
      "title": "Joss Weller - Fear Given a Name",
      "narrative": [
        "You went straight to Joss Weller and found him in the stable loft trying and failing to pack for flight. He crumpled quicker than a hardened man would have, which made you more certain he was not the true danger.",
        "His younger brother Niall had been taken to the old quarry road three nights earlier by men who knew exactly where and when to find him. Since then Joss had passed wagon hours and watch talk under threat, hoping each small betrayal would be the last one demanded of him.",
        "He swore he had never seen Vane himself, only a scarred lieutenant and a hooded youth who collected the messages at the south gate. He also said the next hour would be asked for before dawn, which meant you had one night to turn weakness into leverage.",
        "Joss was sick with shame and fear, but he was useful still. The only question was whether you meant to use him openly, save his brother first, or watch the hand that came to collect from him."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Trust Joss to carry one more message alone while you prepare elsewhere.",
          "failTitle": "A Bent Reed Snaps",
          "failText": "Joss never makes the meeting. Whether he ran, was taken, or was silenced on the lane, you lose both your witness and your chance to steer the next move.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stage false wagon times with Joss under guard and use the leak.",
          "nextNodeId": "K08A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hide by the south gate and wait for the informer to move.",
          "nextNodeId": "K08C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K08A",
      "turn": 8,
      "title": "False Hour - Bait on the Road",
      "narrative": [
        "You staged false wagon times with Joss under guard, speaking just loudly enough in the stable yard and grain office for the lie to travel. Joss played his part with a trembling mouth and did not need to feign it.",
        "The chosen tale was simple. The first grain wagons would leave Saint Werran before dawn instead of after sunrise. If Vane's men still trusted the leak, someone would move on that bait before the sky turned.",
        "They did. Near midnight a light rider slipped from Oakenhurst by the south gate and headed west at a measured pace, too controlled for panic and too direct for ordinary business. Elswyth wanted to seize him at once. You preferred to see where the line ended.",
        "One false hour had started the board moving again. Now you could follow the courier, press the quarry lead while the enemy was distracted, or keep to the gate trail and see who else came out to meet it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride the baited road yourself with a handful of visible men.",
          "failTitle": "Hooked by Your Own Trick",
          "failText": "Vane's watchers see through the performance before you are halfway to Saint Werran. The courier changes course, the quarry is emptied, and you are left escorting a lie into empty darkness.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Strike the old quarry with Tavin and free the captive.",
          "nextNodeId": "K09B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trail the courier who carries the false times out of town.",
          "nextNodeId": "K09A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K08B",
      "turn": 8,
      "title": "Old Quarry - A Prison in the Dark",
      "narrative": [
        "You rode for the old quarry before dawn and reached its broken lip while the night was still black enough to hide movement. The place had been abandoned for years, but not by every kind of use.",
        "Below, in a cut sheltered from the wind, you saw a small watch fire, two armed men, and a shed door barred from the outside. When the fire shifted you caught sight of Niall Weller through a crack in the planks, alive but not likely to remain so if the alarm rose badly.",
        "You also saw what mattered almost as much as the hostage himself. One horse already saddled, ready to carry news from the quarry back to whichever road Vane meant to use next. The prison and the message line were part of one design.",
        "You had enough to strike at dawn with help, enough to follow the courier first, or enough to stay with the moving contact and see whether the quarry connected straight to the dike camp."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Strike the old quarry with Tavin and free the captive.",
          "nextNodeId": "K09B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Go down the quarry path alone and hope surprise is enough.",
          "failTitle": "Stone Walls and Crossbows",
          "failText": "The first guard never even sees you. The second does, and his bolt takes you low under the ribs while the alarm rises. Niall dies behind a barred door that you never reach.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hide by the south gate and wait for the informer to move.",
          "nextNodeId": "K09C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K08C",
      "turn": 8,
      "title": "South Gate Vigil - The Collecting Hand",
      "narrative": [
        "You hid by the south gate and let the cold settle into your knees while Oakenhurst slowly went to sleep around you. Patience is less praised than boldness and often worth more.",
        "Near midnight the hooded youth came again, received a whispered word from a shadow at the stable lane, and moved west without ever stepping into open torchlight. He was practiced, but not so practiced that he stopped checking whether anyone might be behind him.",
        "His course matched the charcoal lane for a time, then bent toward the river dikes rather than the quarry. That told you Vane kept separate knots in his rope and did not trust any one hiding place with the whole of his plan.",
        "You could stay on the moving contact, break away to the quarry while the lane was thinner, or follow the courier farther and hope he would lead you to a place worth more than one frightened youth."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Trail the courier who carries the false times out of town.",
          "nextNodeId": "K09A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Shadow the south-gate contact to the dike camp.",
          "nextNodeId": "K09C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize the youth at the gate and end the matter there.",
          "failTitle": "Small Catch, Lost Line",
          "failText": "You catch a runner who knows little and lose the road to everyone above him. Vane's real work continues unseen while you question a frightened boy with nothing worth the time.",
          "death": false
        }
      ]
    },
    {
      "id": "K09A",
      "turn": 9,
      "title": "The Courier Road - A Line Drawn West",
      "narrative": [
        "You trailed the courier out of town and kept him in sight by rhythm more than by shape, reading him in the pauses of his horse rather than in the dark itself. He rode toward the river dikes with the confidence of a man carrying expected news.",
        "At a willow cut near the old embankment he met two armed men and passed along the false wagon hour. The older one frowned, spat, and said Vane would still want the real count from Saint Werran before dawn. That gave you both timing and hierarchy.",
        "You took the courier quietly when he broke away from the others and found a waxed marker in his sleeve, notched for the Blackthorn line. He knew little beyond routes and phrases, but a little is enough when it is the right little.",
        "The board had narrowed now to code, target, and route. You could squeeze the courier for signal truth, race the warning to Saint Werran, or search the dike camp before the whole line shifted again."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride to Saint Werran at once with Niall's warning.",
          "nextNodeId": "K10B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Interrogate the captive and learn how Vane means to signal.",
          "nextNodeId": "K10A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kill the courier where he kneels and trust the camp to wait for you.",
          "failTitle": "A Dead Mouth",
          "failText": "His silence helps Vane more than you. Without the signal phrases and route marks, you ride on with guesses while the real chain keeps moving beyond your reach.",
          "death": false
        }
      ]
    },
    {
      "id": "K09B",
      "turn": 9,
      "title": "Quarry Strike - Niall Freed",
      "narrative": [
        "You struck the old quarry with Tavin Pike at first gray light and did it fast enough that one guard was still fumbling for his bow when your knife reached him. The second ran for the saddled horse and found Tavin's arrow before he found the reins.",
        "Niall Weller came out of the shed cold, hungry, and angry enough to stand on his own feet the moment you cut the binding from him. He had heard more than his captors guessed, because frightened prisoners become invisible to men who think only of their own work.",
        "Vane meant to use one more run of beacon code to draw attention north and then strike Saint Werran at the hour when grain, refugees, and most of the watch would be tied in one cramped place. Niall also spoke of spare oil and a dike camp kept ready in case the main road turned bad.",
        "With the hostage safe, the matter became broader and more urgent. You could wring signal knowledge from the surviving guard, ride your warning hard, or strip the dike camp before Vane changed shape again."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Take time to search every ruin and wagon around the quarry.",
          "failTitle": "Morning Given Away",
          "failText": "By the time you finish pawing through rubble, the useful men are gone, the signal line has shifted, and Saint Werran has less warning than it should have had.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride to Saint Werran at once with Niall's warning.",
          "nextNodeId": "K10B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Search the dike camp for alternate routes and spare beacon oil.",
          "nextNodeId": "K10C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K09C",
      "turn": 9,
      "title": "Dike Camp - A Soldier's Reserve",
      "narrative": [
        "You shadowed the south-gate contact to the dike camp and found it tucked behind willow screens where the old embankment turned the ground dry enough for a disciplined bivouac. Vane's men had chosen the place well.",
        "There were spare oil skins, reserve bows, feed for horses, and route pegs cut to mark distances in the dark. No plunder, no drunkenness, and no waste. Whoever commanded this band intended to survive winter by acting less like robbers than a stripped-down company.",
        "Among the gear you found another road sketch showing Saint Werran, Blackthorn, and the tower by the causeway in one line. The enemy had planned for failure on one road by preparing two others, which meant he still had room to improvise if pushed.",
        "You could take what the camp gave you and turn it into understanding, warning, or sabotage. Time, for once, had not yet entirely run ahead of you."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Search the dike camp for alternate routes and spare beacon oil.",
          "nextNodeId": "K10C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set the camp ablaze before you know who is due to return to it.",
          "failTitle": "A Fire That Warns the Wrong Men",
          "failText": "The smoke tells every hidden runner that their reserve is found, and Vane changes his line before you can predict where he will bend it. You ruin supplies and lose the pattern at the same time.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Interrogate the captive and learn how Vane means to signal.",
          "nextNodeId": "K10A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K10A",
      "turn": 10,
      "title": "Signal Phrases - Reading the Line",
      "narrative": [
        "You pressed the captive for signal truth and got it, not by cruelty, but by knowing more than he thought you should. Once he understood that the quarry, the courier, and the dike camp were already known, his fear turned practical.",
        "The fires were not calling an army. They were relaying readiness. Road clear. Watch moved. Bridge thin. Tower taken. Vane had taken an old defensive language and pared it down to the few meanings a hungry outlaw band needed in the field.",
        "That also meant one thing you had suspected but not yet proved. Saint Werran's tower mattered as much as the grain itself, because from there Vane could signal success, summon reserves, and make every frightened villager believe a larger force stood behind him.",
        "To break a signal line cleanly, you could either learn it whole, ambush the next tower, or outrun it and force the true target to harden before the code arrived."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Study the full beacon ledger with Brother Ansel through the night.",
          "nextNodeId": "K11A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Feed the captive false mercy and release him to carry lies back to Vane.",
          "failTitle": "A Lie Too Thin",
          "failText": "Vane reads through the falsehood at once and knows you are closer to him than before. The next movement comes from a road you were not watching.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place hidden archers at Blackthorn Beacon and wait.",
          "nextNodeId": "K11B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K10B",
      "turn": 10,
      "title": "Riding Warning - Saint Werran Named",
      "narrative": [
        "You rode to Saint Werran with Niall's warning before the day had fully opened, and the hard run mattered. Elswyth's men were already shifting grain and refugees closer together, exactly the kind of crowded order Vane had hoped to exploit.",
        "Niall told Brother Ansel what he heard at the quarry, and the old priest went pale at one phrase in particular. Tower taken. That was an old success signal from the beacon books, rarely used even in war because it meant both visibility and command of nearby roads.",
        "Saint Werran's grain mattered, yes, but the tower beside the causeway mattered more than most people in the yard yet understood. Whoever held it could turn fear into belief and belief into movement. One bright flame above that crowded ground might break the whole district's nerve.",
        "You could sit with the old books and learn the code completely, set an ambush at Blackthorn before the line advanced, or cut cross-country for Thornwatch and the spare strip Hadrin may have hidden away."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Place hidden archers at Blackthorn Beacon and wait.",
          "nextNodeId": "K11B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut through Elderwood to Thornwatch and beat Vane to the ruins.",
          "nextNodeId": "K11C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order the villagers to crowd inside the tower until the danger passes.",
          "failTitle": "A Trap Built by Good Intentions",
          "failText": "You pack fear, grain, and civilians into one place and do Vane's work for him. When his men come, they find a hostage heap instead of a defense.",
          "death": false
        }
      ]
    },
    {
      "id": "K10C",
      "turn": 10,
      "title": "The Reserve Routes - Vane's Second Board",
      "narrative": [
        "You searched the dike camp and came away with more than spare oil. Beneath a tarp of rush matting you found route pegs cut with symbols matching the old beacon books, which meant Vane's men could navigate and relay by count alone even in fog or darkness.",
        "There was also a rough sketch of Thornwatch ruins with a mark beside the old records room. Brother Ansel, when you showed it to him, said Hadrin once mentioned a spare code strip hidden there in case Fox Tor's board ever burned or rotted.",
        "That changed the shape of the pursuit. If Vane wanted the spare strip, he still feared losing flexibility. If you reached Thornwatch first, you might learn the rest of his sequence before he committed his last move.",
        "The next stage would either be knowledge, ambush, or a race through the wood. None of them promised sleep."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the pegs and maps at once without learning their full use.",
          "failTitle": "Blind Victory",
          "failText": "You break what the enemy prepared and still fail to understand how he meant to use it. Vane loses tools and keeps the advantage of surprise.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Study the full beacon ledger with Brother Ansel through the night.",
          "nextNodeId": "K11A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut through Elderwood to Thornwatch and beat Vane to the ruins.",
          "nextNodeId": "K11C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K11A",
      "turn": 11,
      "title": "The Ledger Night - Signal Made Plain",
      "narrative": [
        "You studied the full beacon ledger with Brother Ansel through the night while rain tapped the chapel shutters and the rest of Saint Werran tried to pretend sleep was still possible. The old priest was tired, but his mind stayed sharp once the code began to open.",
        "Piece by piece the false fires arranged themselves into a campaign stripped to the bone. Fox Tor had drawn attention. Dunsill had confirmed movement. Blackthorn, if taken or convincingly signaled, would tell Vane's scattered men that Saint Werran was ripe for the main blow.",
        "The spare strip from Thornwatch still mattered, but not as much as it had before. You now knew enough to predict where the line would move next, and that knowledge was the kind that had to be spent quickly or not at all.",
        "Dawn would make the next choice visible, but only barely. You could seize Blackthorn ahead of the enemy, track the decoy fires if they came, or ride for Thornwatch in case Vane still meant to recover the spare strip."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stay with the books until every mark is understood beyond doubt.",
          "failTitle": "Perfect Knowledge, Late Hand",
          "failText": "By the time the last uncertainty is gone, the next beacon has already spoken. Vane does not need you to be ignorant, only slow.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place hidden archers at Blackthorn Beacon and wait.",
          "nextNodeId": "K12B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ride for Blackthorn before dawn and seize the tower stairs.",
          "nextNodeId": "K12A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K11B",
      "turn": 11,
      "title": "Blackthorn Ambush - Waiting on the Wind",
      "narrative": [
        "You placed hidden archers at Blackthorn Beacon and waited in the thin cold before dawn. It was a hard kind of work, made harder by the knowledge that waiting in one place always leaves another place unwatched.",
        "The hill gave a broad view of the causeway lands, and in that gray hour you finally felt the reach of Vane's design. A few fires, a few good riders, a few stolen hours, and half the district could be made to look the wrong way at the wrong time.",
        "No men came at first. Instead, a brief flare far to the north winked through the trees and died again, too small to be a full beacon and too neat to be an accident. A decoy, perhaps, or the opening of one.",
        "You could cling to the hill and trust your archers, follow the false movement while keeping the true line in mind, or abandon the wait and race for Thornwatch where the missing strip might still decide the last turn."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the decoy fires but keep sight of the true line.",
          "nextNodeId": "K12B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send every archer north after the first false flare.",
          "failTitle": "Pulled by a Spark",
          "failText": "The decoy does what it was meant to do. Blackthorn thins, the true runners slip through, and the next signal reaches Saint Werran before your men even understand where they were tricked.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle to Thornwatch ruins for Hadrin's missing spare strip.",
          "nextNodeId": "K12C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K11C",
      "turn": 11,
      "title": "Elderwood Cut - Beating Them to Thornwatch",
      "narrative": [
        "You cut through Elderwood toward Thornwatch and trusted old ranger paths over the wider road. The trees there kept the dawn darker than it should have been, and every wet branch seemed to carry away sound.",
        "Thorne knew the narrow deer lanes well enough to save you time, though not comfort. More than once you crossed fresh sign of men on foot moving the same direction with less speed and more caution, which meant you had indeed guessed one of Vane's remaining needs.",
        "Thornwatch itself rose out of the wood as a broken tooth of stone with half its upper rooms collapsed. If Hadrin had hidden a spare strip there, he had chosen a place abandoned enough that only someone who knew the old signal service would think to look for it.",
        "You were ahead, but not by much. What you did in the ruins would decide whether knowledge or position mattered more by full morning."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride for Blackthorn before dawn and seize the tower stairs.",
          "nextNodeId": "K12A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Circle to Thornwatch ruins for Hadrin's missing spare strip.",
          "nextNodeId": "K12C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call out into the ruins and demand that anyone hiding there show himself.",
          "failTitle": "The Wrong Echo",
          "failText": "The only answer is a crossbow quarrel from a broken window and boot steps withdrawing deeper into the ruin. You have given away the one advantage you had, which was silence.",
          "death": true
        }
      ]
    },
    {
      "id": "K12A",
      "turn": 12,
      "title": "Blackthorn Stairs - Seized Before Dawn",
      "narrative": [
        "You rode for Blackthorn before dawn and reached the tower stairs before the first of Vane's men came up the back slope. That one fast decision turned the hill from a risk into a position worth holding.",
        "The clash itself was quick and ugly in the dark. One runner went down with your arrow in him, another fled into the bracken, and the third left behind a coil of wick and a pouch of iron pegs before vanishing downslope.",
        "From the platform you could see Saint Werran dim in the morning mist and knew now that the tower below would be the real hinge. Blackthorn mattered only so long as it could speak to the next hill. Silenced, it became merely stone.",
        "You could hold the place and count what Vane had prepared here, hunt the fleeing lieutenant before he reached his master, or turn aside for Thornwatch to gather the last piece of code while the line was broken."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold Blackthorn after the skirmish and count the signal ropes.",
          "nextNodeId": "K13A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hunt the retreating lieutenant across the ridge and take him alive.",
          "nextNodeId": "K13B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the hill at once without checking what the runners brought.",
          "failTitle": "What Was Left Behind",
          "failText": "You win the skirmish and lose the meaning of it. The gear on the tower would have told you what kind of signal Vane still expected to use next, but you are already gone when the answer mattered.",
          "death": false
        }
      ]
    },
    {
      "id": "K12B",
      "turn": 12,
      "title": "Decoy Line - Following the False Movement",
      "narrative": [
        "You followed the decoy fires without fully surrendering to them, which was the only reason the move did not become a fool's chase. The flares came too neat and too brief, exactly spaced to suggest urgency rather than real work.",
        "By shadowing the line instead of obeying it, you learned something Vane would have hated to lose. He had runners enough to create confusion in three places at once, but not enough to hold ground everywhere. That meant Saint Werran still had to carry the real weight.",
        "Near a narrow saddle of land you found signs of a lieutenant splitting off toward Blackthorn with two men and a pack mule. Thornwatch lay farther south. The band was dividing its needs between position and knowledge, and you finally understood just how tight Vane's numbers really were.",
        "You could now commit to Blackthorn, run down the lieutenant, or go for the spare strip at Thornwatch while the enemy remained stretched between too many wants."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Commit wholly to the decoy and chase the northern flares into the hills.",
          "failTitle": "Gone North for Nothing",
          "failText": "By midday you understand the truth, but too late. The real chain has already moved south and the tower at Saint Werran is one signal nearer to falling.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hunt the retreating lieutenant across the ridge and take him alive.",
          "nextNodeId": "K13B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the spare strip at Thornwatch and break the final code.",
          "nextNodeId": "K13C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K12C",
      "turn": 12,
      "title": "Thornwatch Ruins - The Spare Strip",
      "narrative": [
        "You circled to Thornwatch ruins and found the place entered only moments before you. Fresh grit lay on the stair, and one broken hinge still swayed where a careful hand had failed to keep it from making sound.",
        "Hadrin's spare strip was hidden in a cracked records chest beneath a lid that had once held tax rolls. Vane's men had not reached it first, though they had searched close enough to disturb half the room in frustration.",
        "The strip filled the last gap in Brother Ansel's reading. Blackthorn was the hinge, but Saint Werran tower was the prize. If that tower burned bright under hostile hands, Vane's scattered crews would converge believing success already won.",
        "The code was yours now. You could carry it to Blackthorn and hold the line there, hunt one of Vane's lieutenants before he could report, or read the strip through at once and use knowledge as your main weapon from here on."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the spare strip at Thornwatch and break the final code.",
          "nextNodeId": "K13C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Destroy the strip immediately so no one can ever use it again.",
          "failTitle": "A Victory Against Tomorrow",
          "failText": "You deny Vane the strip and deny yourself the knowledge inside it. The enemy still moves with a plan, while you ride on with only instinct and half a map of his intent.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold Blackthorn after the skirmish and count the signal ropes.",
          "nextNodeId": "K13A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K13A",
      "turn": 13,
      "title": "Blackthorn Held - Counting What Remains",
      "narrative": [
        "You held Blackthorn after the skirmish and took stock with a soldier's eye. The signal ropes, wick lengths, and prepared oil were enough for only one more clean message, which told you Vane meant to spend his remaining reach on a single decisive move.",
        "Tavin arrived by noon with word from Elswyth that Saint Werran was growing crowded. Grain wagons, villagers, and chapel folk had all drifted closer together under the pressure of rumor, making the causeway tighter and more dangerous by the hour.",
        "Blackthorn could not be the end. At most it could be the denial of one tongue in a larger mouth. The real struggle would be on the road and around the tower below, where fear and supplies stood too close together for comfort.",
        "You sent Tavin to water his horse and considered how best to spend the next strip of daylight. Every road from here led toward Saint Werran, but not by the same edge."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send Tavin to Elswyth and ride yourself to Saint Werran bridge.",
          "nextNodeId": "K14A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep your whole strength on Blackthorn and trust Saint Werran to fend for itself.",
          "failTitle": "The Wrong Hill to Die On",
          "failText": "Blackthorn stays dark, but Saint Werran falls into chaos below it. You saved the lesser stone and lost the living road it was meant to guard.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "March with the chapel villagers and reinforce the granary.",
          "nextNodeId": "K14B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K13B",
      "turn": 13,
      "title": "Ridge Pursuit - A Lieutenant Taken",
      "narrative": [
        "You hunted the retreating lieutenant across the ridge and brought him down where the heather gave way to bare stone. He fought like a trained man with little hope left, which often made men talk sooner once they were tied and breathing hard.",
        "His name was Oren Holt, once a sergeant under a border captain long dead. He admitted enough to matter. Vane had no army, only scattered veterans, hungry laborers, and a plan to seize grain and tower together so the district would feed him through winter out of fear.",
        "Holt also confirmed what the code had hinted. If Saint Werran tower showed success, men hidden on the road, dike, and marsh edge would all converge, believing the hard part already done. Vane's greatest weapon was not numbers, but the appearance of settled victory.",
        "You left Holt under Tavin's watch and turned your mind south. The last stage would be decided by who reached the causeway first and how well that first arrival used the minutes bought."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "March with the chapel villagers and reinforce the granary.",
          "nextNodeId": "K14B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move by the marsh edge and cut the rope bridge Vane means to use.",
          "nextNodeId": "K14C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kill Holt where he kneels and ride on without wringing out the rest.",
          "failTitle": "A Waste of a Live Tongue",
          "failText": "His death settles nothing that a few more questions would not have sharpened. You lose route, timing, and the comfort of hearing how thin Vane's numbers truly are.",
          "death": false
        }
      ]
    },
    {
      "id": "K13C",
      "turn": 13,
      "title": "The Final Code - Saint Werran Revealed",
      "narrative": [
        "You read the spare strip at Thornwatch and finally broke the last of Vane's sequence. The old marks were plain once you understood his changes. He was not signaling conquest. He was signaling progress toward a very narrow objective.",
        "Blackthorn ready. Bridge thinned. Tower taken. Road drawn. It was all there, stripped of flourish and built for men who knew their task in advance. Saint Werran was the hinge, and the tower beside the causeway was the visible crown of the whole design.",
        "Brother Ansel, when you repeated the terms back to him later, said Vane must once have stood close to a real signal table. Only such a man would know how little needed to be said once everyone in the line understood the same end.",
        "That kind of enemy could still be beaten, but not by reacting to each spark as it came. You needed to move toward the decisive ground now and shape it before he arrived."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase every remaining runner instead of preparing the ground ahead.",
          "failTitle": "A Hunt Without an End",
          "failText": "You spend yourself on fragments while the whole shape goes unchallenged. By the time you turn back toward Saint Werran, Vane is already where he most wanted to be.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Tavin to Elswyth and ride yourself to Saint Werran bridge.",
          "nextNodeId": "K14A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move by the marsh edge and cut the rope bridge Vane means to use.",
          "nextNodeId": "K14C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K14A",
      "turn": 14,
      "title": "Toward the Bridge - Fast Orders",
      "narrative": [
        "You sent Tavin to Elswyth with the latest truth and rode yourself to Saint Werran bridge, trusting speed over comfort and a young scout's memory over safer redundancies. The gamble bought you time where time still mattered most.",
        "By the hour you arrived, the causeway was under strain. Villagers, barges, carts, and watchmen all pressed the same narrow ground, and every anxious face on it made the place easier to break if fear took hold all at once.",
        "Brother Ansel met you near the chapel wall and said the tower keys were accounted for, but only just. Even that small uncertainty sharpened your temper, because Vane's whole design depended on small things being left half secure by tired honest men.",
        "The tower, the grain yard, and the marsh edge all demanded attention. You could not stand in three places, but perhaps you could choose the one from which the others might yet be saved."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Order the whole crowd to move at once and clear the bridge by force.",
          "failTitle": "Panic on the Causeway",
          "failText": "Your urgency breaks discipline instead of creating it. Carts jam, children are knocked down, and Vane's first push meets a crowd already doing half his work for him.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "March with the chapel villagers and reinforce the granary.",
          "nextNodeId": "K15B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Fortify the beacon tower beside Saint Werran.",
          "nextNodeId": "K15A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K14B",
      "turn": 14,
      "title": "Granary Road - Gathering the Living Wall",
      "narrative": [
        "You marched with the chapel villagers and reinforced the granary instead of the tower first. It was not the dramatic choice, but it stiffened the one place where fear and hunger could be turned against you together.",
        "Men who had never held a line in their lives took up poles, hooks, and grain shovels with better grace than you expected. Elswyth's wardens set them in ranks between wagon tongues and low stone walls while women and children were moved farther back toward the chapel yard.",
        "From that lower ground the tower looked both near and strangely separate, as important in symbol as any keep and far more vulnerable in fact. If Vane took it, you would see the result immediately. If he failed, the grain yard might never even know how close it had come.",
        "The bridge, the barges, and the reedbeds all remained exposed in their own ways. You had bought structure for one part of the field and now had to decide where next to spend yourself."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Secure the grain barges and wagon yard below.",
          "nextNodeId": "K15B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull every able hand into the granary and bar the doors.",
          "failTitle": "Defended Like a Tomb",
          "failText": "You turn a storehouse into a trap. Fire, smoke, and panic take hold faster than any sword could have, and the road outside is left open to whoever wants it.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stalk Vane's scouts in the reedbeds before the main blow.",
          "nextNodeId": "K15C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K14C",
      "turn": 14,
      "title": "Marsh Edge - Cutting the Quiet Road",
      "narrative": [
        "You moved by the marsh edge and found the rope bridge Holt had described stretched low over a black side channel where reeds stood tall enough to hide ten men at a time. It was exactly the sort of path an outnumbered commander would keep in reserve.",
        "The bridge was meant for speed rather than weight, enough to bring a strike team behind the tower or into the yard if the main approach grew too costly. Vane had arranged not only one blow, but a second one for the moment his first met resistance.",
        "Cutting the ropes was simple. Doing it without warning the scouts hidden somewhere nearby took a better hand. You worked fast with your knife while Thorne stood silent in mud that would have made lesser horses fret and snort.",
        "When the bridge sagged into the water you felt the field narrow in your favor for the first time. Now you had to decide whether to claim the tower, the yard, or the reedbeds themselves."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Fortify the beacon tower beside Saint Werran.",
          "nextNodeId": "K15A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Stalk Vane's scouts in the reedbeds before the main blow.",
          "nextNodeId": "K15C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait by the cut bridge for Vane's whole force to arrive.",
          "failTitle": "Guarding the Lesser Door",
          "failText": "You secure a path the enemy no longer needs and abandon the ground he was always going to strike first. The tower and yard pay for your stubbornness.",
          "death": false
        }
      ]
    },
    {
      "id": "K15A",
      "turn": 15,
      "title": "Saint Werran Tower - Stone Before Fire",
      "narrative": [
        "You fortified the beacon tower beside Saint Werran and found it stronger than it looked and weaker than it should have been. The door was good oak, the stairs were narrow, and the platform held a clean view of the road. The lock, however, had been tested recently.",
        "Brother Ansel brought the true key himself and swore he had not let it out of hand, which meant either an old copy existed or someone had measured the wards with time enough to prepare for this day. Vane's plan had roots deeper than one week's fear.",
        "You set men at the stair, moved sand and wet hides near the brazier, and looked down over the yard where carts, barges, and people made a dense shifting patchwork. If the tower fell, the sight of flame above that crowd might do more harm than the enemy's blades.",
        "Holding the stone was only the beginning. The attack would still need to be met on stair, bridge, or flanking road, and each kind of defense demanded a different hand."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the bridge mouth with Elswyth's wardens.",
          "nextNodeId": "K16B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Climb to the upper platform and deny the beacon fire.",
          "nextNodeId": "K16A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the brazier stocked and ready so your own men can use it quickly.",
          "failTitle": "Fuel for the Wrong Hands",
          "failText": "When the first rush reaches the top, the fire you prepared becomes their easiest weapon. One careless convenience gives Vane exactly the image he came for.",
          "death": false
        }
      ]
    },
    {
      "id": "K15B",
      "turn": 15,
      "title": "Yard and Barges - Guarding the Stores",
      "narrative": [
        "You secured the grain barges and wagon yard below the tower, spreading the watch so that no one lane offered easy success. It was a broad practical defense, and it steadied the ordinary people enough to keep them from feeding panic with their own feet.",
        "Elswyth approved at once, though she warned that the bridge mouth could not hold forever if Vane struck with discipline. The barges were half unloaded, teams stood hitched in rows, and every one of those wagons could become either a shield or a wall depending on who moved first.",
        "From the yard you could also see how badly the tower's fall would hurt morale. Men will stand beside grain. They do not always stand beneath a hostile signal flame. The visible and the useful were knotted together here more tightly than you liked.",
        "You could go up and deny the beacon itself, stay low and harden the bridge line, or break away toward the mill sluice where a reserve force might yet be hiding out of sight."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the barges out immediately with skeleton crews before the enemy arrives.",
          "failTitle": "Panic on Water",
          "failText": "The boats push off in confusion, collide in the narrow channel, and become floating obstacles instead of saved stores. The river takes your order and makes mockery of it.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Strike the reserve by the old mill sluice.",
          "nextNodeId": "K16C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hold the bridge mouth with Elswyth's wardens.",
          "nextNodeId": "K16B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K15C",
      "turn": 15,
      "title": "Reedbeds - Waiting on the Flank",
      "narrative": [
        "You stalked Vane's scouts in the reedbeds and found them exactly where a cautious commander would hide them, low by the wet ground with a view of both the tower lane and the old mill. They were not many, but they were placed well.",
        "Their work was not to win the field alone. It was to open the right path at the right moment, cut a messenger, loose panic, or make the first success seem larger than it was. Men like that can ruin a defense even when they never touch its center.",
        "You took one quietly and watched the others long enough to spot where the reserve force lay farther back near the sluice. That reserve, once moving, could hit either the bridge line or the tower lane depending on which looked softer.",
        "The attack had not fully broken yet, but the ground was tightening. Your next decision would shape which part of Vane's force reached the main fight with strength still in it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Strike the reserve by the old mill sluice.",
          "nextNodeId": "K16C",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose arrows into the reeds and start the whole flank fight too soon.",
          "failTitle": "The Mud Wakes Early",
          "failText": "The scouts melt away exactly as trained, the reserve shifts before you can close, and the first advantage you held turns into a warning flare for every hidden man on the marsh edge.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Climb to the upper platform and deny the beacon fire.",
          "nextNodeId": "K16A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K16A",
      "turn": 16,
      "title": "Upper Platform - Fire Denied",
      "narrative": [
        "You climbed to the upper platform and made the beacon itself your charge. Sand buckets, wet hides, and two steady wardens gave you a fighting chance against the one image Vane most needed to create.",
        "The first rush came not from the main stair but from a side door below, opened by a copied key or a lock worked beforehand. That told you how long Vane had been thinking about this tower and how close someone had once stood to its daily use.",
        "Oil bearers began moving through the yard under cover of the larger struggle, each carrying only enough to matter if even one of them reached the brazier. The fight below turned noisy and confused, but up here the work stayed brutally simple. Stop the fire, and the rest might still be mended.",
        "You could pick off the oil men from above, trust Elswyth to hold the bridge line without you, or drop from the platform and strike the hidden reserve before it fed the assault from another angle."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Shoot the oil bearers before they reach the tower stairs.",
          "nextNodeId": "K17A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light a warning flame of your own so the villages will know the danger.",
          "failTitle": "The Image He Wanted",
          "failText": "From the ground no one can tell whose hands raised the fire. Panic swells exactly as Vane planned, and his scattered men move in believing success has already been won.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the bridge mouth with Elswyth's wardens.",
          "nextNodeId": "K17B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K16B",
      "turn": 16,
      "title": "Bridge Mouth - The Narrow Place",
      "narrative": [
        "You held the bridge mouth with Elswyth's wardens and found the battle there exactly as such fights always are. Close, loud, and decided as much by nerve as by blade.",
        "Vane's first men came in with shields and hooks, not wild raider fury. They wanted the line opened just enough for the rest to spill through toward the tower lane. Elswyth fought with economical anger, wasting no motion and no breath on shouting.",
        "From the corner of your eye you saw movement toward the stairs and beyond it flickers in the reedbeds. The whole field was now alive, each pressure point leaning on the others. If one failed, the rest would feel it almost at once.",
        "You could drive deeper into the melee and keep the bridge closed, break away for the oil bearers before flame rose above you, or strike the reserve by the mill before it joined the press in full."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Strike the reserve by the old mill sluice.",
          "nextNodeId": "K17C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Drive into the bridge melee and keep the line closed.",
          "nextNodeId": "K17B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order the bridge abandoned so the yard can be defended farther back.",
          "failTitle": "The Wrong Yielding",
          "failText": "Once the bridge is given, it cannot be half retaken. Vane's men flood the causeway, and every defense behind it is forced to fight while already falling apart.",
          "death": false
        }
      ]
    },
    {
      "id": "K16C",
      "turn": 16,
      "title": "Mill Sluice - The Hidden Reserve",
      "narrative": [
        "You struck the reserve by the old mill sluice and caught them still waiting on the shape of the main fight. For a few heartbeats the advantage was entirely yours.",
        "The sluice channel was low from autumn and thick with black mud. Vane's reserve had chosen it because it hid men well and allowed a quick rush toward either bridge or tower once one of those fronts looked ready to crack.",
        "By hitting them there you denied the battle the weight Vane had kept in his back hand. Yet reserves exist because commanders expect friction. Even disordered, some of those men would still reach the fight unless the ground itself was turned against them.",
        "You could run back toward the tower and the oil men, throw yourself into the bridge struggle, or use the sluice gate to make the mud and water do what your numbers alone could not."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase every fleeing reserve man across the marsh edge.",
          "failTitle": "Scattered, Not Stopped",
          "failText": "You spend your strength on men already half broken while the main assault still lives. By the time you return, the decisive ground has gone without you.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shoot the oil bearers before they reach the tower stairs.",
          "nextNodeId": "K17A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the mill sluice and strand the reserve in mud.",
          "nextNodeId": "K17C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K17A",
      "turn": 17,
      "title": "Oil Bearers - Fire Checked in Time",
      "narrative": [
        "You shot the oil bearers before they reached the tower stairs, and that small cruel work may have saved every larger one around it. The first man pitched forward with his skin bursting black across the stones. The second dropped his load and ran. The third tried to climb anyway and died on the lower landing.",
        "With the fire denied, Vane lost the image he needed most. Men below still fought hard, but without a hostile blaze crowning the tower they could no longer believe success had already turned in their favor.",
        "That was the moment the battle changed from a scheme into a simple struggle of nerve and position. You saw a tall figure in a dark cloak push toward the tower steps with three men around him, moving not like a common attacker but like a commander who understood the need to take the point himself.",
        "Rorik Vane had finally come within reach. You could go after him, break away to rescue those trapped in the yard, or sweep behind the tower and close the retreat that still remained open to his men."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Rescue Brother Ansel and the refugees in the granary yard.",
          "nextNodeId": "K18B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Chase Rorik Vane up the tower steps himself.",
          "nextNodeId": "K18A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stay on the platform and wait for Vane to come to you.",
          "failTitle": "A Commander Slips the Net",
          "failText": "Vane sees caution in your stance and refuses the stair. He vanishes back into the smoke, leaving his men to buy the moments he needs to escape and try again on another road.",
          "death": false
        }
      ]
    },
    {
      "id": "K17B",
      "turn": 17,
      "title": "Bridge Melee - The Line Holds",
      "narrative": [
        "You drove into the bridge melee and kept the line closed by inches rather than yards. The work was brutal and close enough that there was scarcely room to draw a full breath between one swing and the next.",
        "Elswyth saw what you were doing and shifted with you without a word. Together you turned the narrow place into a grinder where discipline mattered more than numbers. Twice Vane's men almost broke through, and twice they were forced back on one another in the crush.",
        "From the yard came shouting that the granary side was threatened and from the tower lane came word that a dark-cloaked leader had been seen near the stairs. The fight was being held together by separate acts of will, any one of which might still fail if left too long.",
        "You could keep hunting the enemy commander, save the people trapped by the grain carts, or cut off the back path before retreat turned into escape."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Rescue Brother Ansel and the refugees in the granary yard.",
          "nextNodeId": "K18B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break formation and pursue the nearest fleeing men across the bridge.",
          "failTitle": "Line Lost for Glory",
          "failText": "The moment your front opens, hooks and shields pour through the gap. What looked like pursuit becomes a ruinous collapse, and Saint Werran pays for your hunger to finish too quickly.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Cut off the retreat behind the tower.",
          "nextNodeId": "K18C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K17C",
      "turn": 17,
      "title": "Flooded Reserve - The Back Hand Broken",
      "narrative": [
        "You opened the mill sluice and turned the reserve lane into sucking black mud. Men who had been half a minute from joining the main attack found themselves thigh-deep, cursing, slipping, and dragging at one another with dead weight on every boot.",
        "The sudden ruin of that flank spread confusion faster than fear ever could. Orders had to be shouted twice. Timings were lost. Signals were missed. Vane's neat design finally began to suffer the one thing neat designs cannot survive for long, which is disorder at the wrong moment.",
        "With the reserve spoiled, you had room to act instead of merely react. The enemy commander would either press upward for the tower in desperation, turn toward the yard to salvage something tangible, or try to cut away while enough men still covered him.",
        "It was a narrow but precious freedom. You meant to spend it where Vane would feel it most sharply."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stand by the sluice to admire the damage while the main fight continues.",
          "failTitle": "Winning the Lesser Thing",
          "failText": "The reserve is mired, yes, but Vane still has enough men on the main ground to force a costly success. You solve a side problem and lose the center for want of urgency.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Chase Rorik Vane up the tower steps himself.",
          "nextNodeId": "K18A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut off the retreat behind the tower.",
          "nextNodeId": "K18C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K18A",
      "turn": 18,
      "title": "Tower Steps - Close on Vane",
      "narrative": [
        "You chased Rorik Vane up the tower steps while the fight below blurred into one hard roar. He was older than you expected, lean, gray at the temples, and still quick in the way of men who have spent long years trusting skill to make up for dwindling strength.",
        "He looked back once and measured you with a kind of cold annoyance rather than surprise. That told you as much as any confession could have. In his mind this whole day had been an argument with weaker men, and you were the first reply he had not already arranged for.",
        "One of his guards fell at the turn of the stair, another tried to hold you on the landing and failed, and then it was only Vane a few steps above with the brazier's cold iron waiting on the platform beyond him. The tower had narrowed the whole campaign to one short climb.",
        "You could meet him on the platform itself, break away and save those threatened in the yard if the lower cries proved worse than you feared, or send yourself around the back of the tower to cut off any last descent before he chose flight over pride."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Corner Vane below the tower among the grain wagons.",
          "nextNodeId": "K19B",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Face Vane on the beacon platform before he reaches the brazier.",
          "nextNodeId": "K19A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call for him to surrender and slow your own climb to hear his answer.",
          "failTitle": "A Courtesy Returned With Steel",
          "failText": "Vane answers by hurling a knife down the stair. It catches you high in the chest, and the rest of the tower belongs to him for the few fatal moments he still needs.",
          "death": true
        }
      ]
    },
    {
      "id": "K18B",
      "turn": 18,
      "title": "Granary Yard - Saving the Living",
      "narrative": [
        "You went to the granary yard where Brother Ansel and a knot of villagers had been trapped behind two stalled wagons. It was the right sort of danger, the sort that looks less grand than a tower and matters more if neglected.",
        "A handful of Vane's men had pushed through by the side lane and were trying to turn panic into collapse. They wanted the crowd running, because running people break lines better than axes do. You put down the nearest of them and drove the rest back with the flat urgency of a man who has no room left for speeches.",
        "Brother Ansel kept the old women and children from bolting while Elswyth's wardens reformed around the wagons. In the middle of that mess someone shouted that Vane himself had been seen below the tower, where the lanes between carts and walls made escape easier than ascent.",
        "You could go for him there, swing around the back path and trap his retreat, or hold the yard until the danger to civilians had fully passed and let the enemy commander take whatever time that bought him."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Corner Vane below the tower among the grain wagons.",
          "nextNodeId": "K19B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Lead the whole frightened crowd toward the chapel in one rush.",
          "failTitle": "A Mob Instead of a Withdrawal",
          "failText": "The movement breaks into running before it becomes order. People fall, carts jam, and Vane's men recover all the confusion they had been losing only moments before.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Surround the last of his men at the marsh path and force surrender.",
          "nextNodeId": "K19C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K18C",
      "turn": 18,
      "title": "Behind the Tower - Closing the Door",
      "narrative": [
        "You cut off the retreat behind the tower and reached the narrow service path just before the first of Vane's men thought to use it. That path had served for wood, pitch, and maintenance in easier years. Tonight it served as the last quiet line between ambition and escape.",
        "The men you met there were the sober sort who knew when a plan had gone wrong. They fought to make room for withdrawal rather than victory, which is always a dangerous thing to meet because desperation can sharpen even tired hands.",
        "When you beat them back down the path you saw the wider truth of the field at last. The reserve was spoiled, the bridge still contested, the yard holding, and Vane with fewer doors left than he had counted on when the first false fire burned days ago.",
        "You could press upward and face him on the platform, go lower and catch him among the wagons if he chose ground over height, or use your position to ring the last of his men at the marsh path and end the matter by collapse rather than duel."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the path open and return to the main fight, trusting the enemy to break on his own.",
          "failTitle": "The Road Still Open",
          "failText": "Vane is too practiced to ignore an unguarded exit. He slips away with enough men to begin again elsewhere, and Saint Werran is left bloodied for no final answer at all.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Face Vane on the beacon platform before he reaches the brazier.",
          "nextNodeId": "K19A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Surround the last of his men at the marsh path and force surrender.",
          "nextNodeId": "K19C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K19A",
      "turn": 19,
      "title": "Beacon Platform - The Signal-Master's End",
      "narrative": [
        "You faced Vane on the beacon platform before he could lay hands on the brazier. Wind tore at both your cloaks and the whole of Saint Werran seemed to lean beneath the tower, waiting without knowing it had reached the last hinge of the struggle.",
        "Vane fought with old training and an economy you respected in spite of yourself. He was not mad, not drunken, and not proud in any foolish way. He simply believed that hungry men with discipline had as much right to take winter from the weakly guarded as any duke had to store it.",
        "You answered him steel for steel while he tried between blows to edge toward the brazier. Every step he took that way mattered more than any wound. Below, Elswyth's line held just long enough for the tower to remain the only thing worth deciding first.",
        "This could end in capture, in a bloodier victory, or in a final failure if you misjudged how much room remained between the brazier, the stair, and the man in front of you."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Smother the brazier and take Vane alive.",
          "nextNodeId": "K20A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Lock blades with him at the edge and trust strength alone.",
          "failTitle": "Flame at Your Back",
          "failText": "Vane gives ground exactly as he means to, kicks the brazier into spark and pitch, and the tower bursts into the image he came to create. Whatever happens to him after that no longer matters enough.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Win the bridge gate and drive his men apart.",
          "nextNodeId": "K20B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K19B",
      "turn": 19,
      "title": "Grain Wagons - Vane Among His Men",
      "narrative": [
        "You cornered Vane below the tower among the grain wagons where lantern light, wagon tongues, and drifting smoke made every angle uncertain. He had chosen lower ground because lower ground still offered routes, hostages, and confusion.",
        "Here he looked less like a signal-master and more like the captain of a stripped company trying to salvage from defeat enough substance to keep his followers bound to him. He called once for the men near him to rally on the bridge gate and leave the tower as lost.",
        "That order told you he was done thinking in symbols and had turned back to practical survival. If the gate broke, some of his band might still escape with him. If it held, he would be trapped among stores he had never truly managed to claim.",
        "You could finish this by steady pressure and capture, by a harder push that broke the gate fight first, or by making the night run on until dawn and letting collapse do what steel had not yet finished."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold till dawn and gather the scattered survivors.",
          "nextNodeId": "K20C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Win the bridge gate and drive his men apart.",
          "nextNodeId": "K20B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge through the wagons alone and end him in one rush.",
          "failTitle": "Lost in the Cart Lanes",
          "failText": "A hook catches your leg, a team rears, and Vane's men swallow you in the narrow lanes between wagons. Boldness without space is only a quicker road to death.",
          "death": true
        }
      ]
    },
    {
      "id": "K19C",
      "turn": 19,
      "title": "Marsh Path - The Last Ring",
      "narrative": [
        "You surrounded the last of Vane's men at the marsh path and forced the night to narrow around them. Mud, broken reeds, and the flooded reserve lane gave them little room to run and less room to fight in good order.",
        "Some threw down their weapons at once once they understood the tower had not flamed and the bridge had not fallen. Others looked from one dark stretch of water to another and realized too late that the commander who relied on signal and timing had lost both.",
        "Vane himself was still somewhere nearer the causeway, but his band no longer moved as one. That mattered almost as much as taking him. A broken company cannot pretend to be an army for long, no matter how clever its fires once were.",
        "You could push the surrender into a full high-handed end, turn back toward the bridge gate where the last hard fight still lived, or simply hold and gather everyone left breathing until dawn settled truth over rumor."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Offer easy mercy and let the armed men keep their blades while they consider it.",
          "failTitle": "The Last Knife",
          "failText": "One desperate outlaw lunges while you are still speaking, and the brief disorder opens a gap big enough for the remnants to bolt through. The clean ending goes with them into the marsh dark.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Smother the brazier and take Vane alive.",
          "nextNodeId": "K20A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hold till dawn and gather the scattered survivors.",
          "nextNodeId": "K20C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K20A",
      "turn": 20,
      "title": "Cold Brazier - Vane Taken",
      "narrative": [
        "You smothered the brazier and took Vane alive, and that was the cleanest possible answer to the whole hard business. Without flame above him and without road left beneath him, the old signal-master finally had to live with a failure he could neither relabel nor outrun.",
        "Captain Elswyth came up the stair with blood on one sleeve and relief she did not bother hiding. Brother Ansel remained below among the rescued villagers, and word began spreading through the yard not as panic this time, but as the slower steadier thing people call certainty when they have earned it back.",
        "Vane said little once bound. Only that Duke Aldric had wasted veterans after the Red Winter and that empty bellies would always learn discipline faster than well-fed magistrates. You had no answer worth giving him in that moment beyond the rope on his wrists and the tower he had failed to claim.",
        "Dawn edged the marshes pale beyond Saint Werran while the last of his scattered men were taken in, disarmed, or driven into the reeds. Brackenwald had held, and held without needing any lie of magic to do it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut Vane loose and force him to fight you to the death for honor.",
          "failTitle": "Honor Misplaced",
          "failText": "The foolish gesture buys him one last chance. He flings himself into the brazier, sparks take the dry pitch, and the signal you denied for days is finally born from vanity in the final minute.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave the judgment to Duke Aldric and see Saint Werran counted and steadied.",
          "endStory": true,
          "endType": "low",
          "nextNodeId": null,
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hand Vane to Elswyth, clear the tower, and put the roads back in honest order before sunrise.",
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
      "title": "Bridge Gate - Victory in the Crush",
      "narrative": [
        "You won the bridge gate and drove Vane's men apart before they could rally into one last dangerous knot. The fighting there was not elegant and would never make a singer's favorite tale, but it saved the practical heart of Saint Werran all the same.",
        "Once the gate held, the band's discipline finally broke. A few tried to flee, a few cast down arms, and a few fought on from sheer habit until Elswyth's wardens and the villagers with pikes and hooks pushed them into surrender or mud.",
        "Vane did not vanish, though whether he fell, yielded, or was dragged down in the cart lanes changed from mouth to mouth before the hour was done. What mattered more was that the tower never shone for him and the grain road did not become his winter kingdom.",
        "The dawn that followed was tired rather than triumphant. Men counted wounded, women gathered children, and Brother Ansel had the chapel doors opened wide for anyone who needed shelter from the long shaking after a near disaster."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Put the surviving band in irons and have Saint Werran fed and counted before the duke arrives.",
          "endStory": true,
          "endType": "high",
          "nextNodeId": null,
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue the fleeing remnants deep into the marsh before the field is secured.",
          "failTitle": "A Victory Thrown After Shadows",
          "failText": "The field you won is left untended while you chase men who know every wet lane better than you do. What should have been a hard victory curdles into needless fresh loss.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the surviving outlaws scatter so long as Saint Werran itself is safe.",
          "endStory": true,
          "endType": "low",
          "nextNodeId": null,
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K20C",
      "turn": 20,
      "title": "Dawn on the Marsh - The Broken Company",
      "narrative": [
        "You held till dawn and gathered the scattered survivors rather than forcing one last dramatic finish in the dark. It was a sober choice and, in its own way, a merciful one for Saint Werran.",
        "As the light came up, the truth of the night became impossible to deny. The tower had not burned for Vane, the bridge had not fallen, and the men who followed him were no longer a company but a string of exhausted fugitives and prisoners with mud on their boots and no command left to obey.",
        "Joss Weller found Niall alive and broke down in the chapel yard where no one much judged him for it. Brother Ansel closed the old beacon rolls with both hands and said that perhaps some books should remain known only to men who understand how fear can be made to travel faster than truth.",
        "Brackenwald was still bruised, still frightened, and still facing winter. Yet it would face winter under Duke Aldric's law rather than under the false certainty of a tower fire and a bitter captain's borrowed signals."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Report the night plainly and leave the district to mend with what stores remain.",
          "endStory": true,
          "endType": "low",
          "nextNodeId": null,
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Gather the prisoners, seal the beacon books, and restore the road under a steady watch before the sun stands high.",
          "endStory": true,
          "endType": "high",
          "nextNodeId": null,
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the prisoners and wounded where they lie and ride after rumor of Vane into the reeds alone.",
          "failTitle": "One Last Folly",
          "failText": "The marsh swallows certainty faster than blood. Whether Vane lives or not, you leave the living field behind for a ghost hunt and lose the victory you had already earned.",
          "death": true
        }
      ]
    }
  ]
});