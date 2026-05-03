window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "hollow-bell-road",
  "title": "The Hollow Bell Road",
  "summary": "When stolen bells begin tolling from empty hollows in Elderwood, the ranger uncovers Oren Keld's covert labor to reopen Widow's Notch and bring raiders through Brackenwald by a forgotten mountain road.",
  "maxTurns": 20,
  "startNodeId": "K01A",
  "goodScoreThreshold": 12,
  "epilogues": {
    "high": "You break Keld's machine at Widow's Notch, expose Hadrin Pike's betrayal, and leave the hidden road buried under its own treason. Duke Aldric seals the pass, rewards the villages that held fast, and Elderwood remembers that steady hands kept war outside its trees.",
    "low": "You prevent the pass from fully opening, but Keld's work leaves scars in stone and trust alike. Some plotters escape, the outer lanes recover slowly, and Brackenwald wins safety only by accepting how near the danger came."
  },
  "nodes": [
    {
      "id": "K01A",
      "turn": 1,
      "title": "Night Bell in Elderwood - Fresh Track",
      "narrative": [
        "The first false bell reaches you at dusk, a bronze note rolling out of Elderwood from a place where no chapel stands. You swing into Thorne's saddle from Duke Aldric's road-house and meet Warden Maelin Crow at the ash lane above Oakenhurst, where a lime cart has vanished.",
        "The ground is still kind. One wheel rut bites deep near the ditch, a bell rope has scored fresh bark, and boot prints show men stepping off the road in a practiced file rather than a panicked scramble.",
        "Farm folk whisper about an antlered guardian angered by woodcutters, but the trail smells of tar, horse sweat, and clean planning. If someone is ringing the forest on purpose, tonight is only the opening stroke."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Set Maelin to hold the witnesses, then take Thorne along the freshest sign before rain can blur it.",
          "nextNodeId": "K02A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight toward the tolling and let the witnesses sort themselves out.",
          "failTitle": "Lost in the Hollow",
          "failText": "The bell lures you into dark brush while the real trail is trampled away behind you. By dawn the cart is gone and the first solid lead with it.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle the lane, mark the rut, and follow at a cautious pace before full dark.",
          "nextNodeId": "K02B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K01B",
      "turn": 1,
      "title": "Night Bell in Elderwood - Frayed Rumor",
      "narrative": [
        "The bell reaches St. Briar at the same hour the last light goes gray, and half the lane turns toward the sound before you arrive. Thorne blows mist into the cold while Sister Elswyth argues with frightened orchard hands who swear they saw lanterns moving between the ash trunks.",
        "Their stories do not match cleanly, yet every man points west and every woman mentions a cart that should have reached the ridge before noon. Maelin finds cut bracken near the ditch, but too many boots have already crossed the place.",
        "The fear itself is useful to someone. Even before you know what was taken, you can feel a hand trying to teach the countryside to run where it is told."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the strongest witness first and work forward slowly, even if the trail cools.",
          "nextNodeId": "K02C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Separate the witnesses, strip the rumors away, and move on the one track they all describe.",
          "nextNodeId": "K02A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Confirm the tale of a forest spirit and send everyone home before checking the ground.",
          "failTitle": "Rumor Takes Root",
          "failText": "Your careless word hardens fear into truth. By morning the woods are full of stories and empty of evidence.",
          "death": false
        }
      ]
    },
    {
      "id": "K01C",
      "turn": 1,
      "title": "Night Bell in Elderwood - Wind Panic",
      "narrative": [
        "By the time you reach the ash lane, the false bell has done its work. Men are shouting over one another, two boys have run for the village, and the missing cart matters less to the crowd than the thought that the old woods have found a voice.",
        "Thorne sidesteps spilled lime near the ditch. Maelin stoops under a hanging branch and shows you where a heavy rope wore through moss only an hour ago, but the rest of the sign has been kicked raw by panic.",
        "The first move has gone against order and toward confusion, which tells you much about the hands behind it. Whoever rang the hollow wanted people frightened faster than they wanted them harmed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send everyone into the trees with torches to hunt the bell at once.",
          "failTitle": "A Hundred Feet, No Trail",
          "failText": "Your search party tears the lane to pieces. The bell rig is found, but every useful sign is destroyed under panic and smoke.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Clear the lane, calm the loudest voices, and accept that the best sign is already fading.",
          "nextNodeId": "K02C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the spilled lime and rope mark as your guide and move before the frightened crowd spreads wider.",
          "nextNodeId": "K02B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K02A",
      "turn": 2,
      "title": "Bell in the Ash Hollow - Clean Sign",
      "narrative": [
        "Maelin leads you to a hollow ash where a small chapel bell hangs from new rope high between two forks. Wool has been packed inside the mouth to deaden it until the clapper is jerked by a side line, a clever trick meant to make the ringing seem born from the wind.",
        "At the roots lie survey pegs, chalk string, and a dusting of lime that has nothing to do with prayer. Someone measured this ground with the calm care of a road gang, then dressed the place as a haunting.",
        "The vanished cart makes better sense now. Bells frightened the lane while tools and stone passed elsewhere, and the line being marked runs toward the old northern rises."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the line, keep the bell where it is, and follow the measured ground carefully.",
          "nextNodeId": "K03B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the bell down at once and shout for the hidden men to show themselves.",
          "failTitle": "The Woods Go Silent",
          "failText": "Your noise sends every watcher slipping away. The signal site is abandoned before you can read how it worked.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the pegs, the rope, and the lime together, then move on the road line before dawn.",
          "nextNodeId": "K03A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K02B",
      "turn": 2,
      "title": "Bell in the Ash Hollow - Partial Read",
      "narrative": [
        "You find the false bell after more circling than you would like, hung in a tangle of ash and alder above a trickle of black water. The rope work is good, but the men who set it had less time than they wanted and left one peg half buried near the roots.",
        "Maelin scrapes lime from the bark with a thumbnail while you kneel over twine marks that run in a straight line through the ferns. This is no shrine prank. It is a measured path, and measured paths are built for weight.",
        "The forest still keeps some of its answer from you, yet the shape of the thing has begun to show. Whoever rings these hollows is laying out more than fear."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the surviving peg and twine marks to reconstruct the route and move before the trail cools further.",
          "nextNodeId": "K03A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the likely line and advance in short, guarded stages through the fern beds.",
          "nextNodeId": "K03C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the pegs and march back, assuming the road line is too old to matter.",
          "failTitle": "The Old Road Wakes",
          "failText": "By scorning the signs, you hand Keld another night. The hidden line continues upward while you look in the wrong century.",
          "death": false
        }
      ]
    },
    {
      "id": "K02C",
      "turn": 2,
      "title": "Bell in the Ash Hollow - Sign Scattered",
      "narrative": [
        "It takes the better part of the night to separate true ground from trampled panic, but at last you find the hollow where the bell stood. The rig has been partly stripped, leaving only frayed wool, bark bruises, and a bronze smear where metal swung against wood.",
        "One thing remains clear: a row of shallow peg holes heading north through the fern beds. Even disturbed, the spacing is too even for hunters and too bold for poachers.",
        "You are a step late, not blind. The men who cleared this place moved with discipline, and disciplined men do not leave such work behind unless more of it waits ahead."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Call the matter a prank and ride back to Oakenhurst before dawn.",
          "failTitle": "A False Peace",
          "failText": "The next night's bells ring farther uphill, and by then the hidden crews have doubled their lead.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Treat the torn rig as proof of a hasty withdrawal and press toward the next likely staging ground.",
          "nextNodeId": "K03B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the damaged peg line as far as it remains trustworthy, even if it leads slowly.",
          "nextNodeId": "K03C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K03A",
      "turn": 3,
      "title": "Charcoal Clearing - Warm Camp",
      "narrative": [
        "The pegged line leads to an abandoned charcoal burn beneath a ring of beeches, where someone has recently cut brush, leveled sleeping ground, and dragged stones off an old shelf. The ash is warm under the crust, and one banked fire still breathes when the wind touches it.",
        "Sister Elswyth arrives from St. Briar with bread and a blunt warning: an injured laborer crawled to her porch before dawn, talking of culverts, retaining walls, and a master who kept his face in shadow. The camp sign agrees with him, down to the stone chips and mule droppings.",
        "Bandits would take the food and leave the rest. These men are reshaping land, keeping to schedule, and hiding under superstition because time matters more to them than plunder."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the camp quickly, then go straight to St. Briar while the laborer's memory still holds.",
          "nextNodeId": "K04A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rouse the nearest cottagers and sweep the clearing noisily before the ground is read.",
          "failTitle": "Fresh Sign Ruined",
          "failText": "Your own helpers trample the camp. What might have pointed uphill turns into churned mud and ash.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Track the camp outward with care and let Elswyth tend the wounded man first.",
          "nextNodeId": "K04B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K03B",
      "turn": 3,
      "title": "Charcoal Clearing - Cooling Ash",
      "narrative": [
        "By the time you reach the charcoal clearing, the camp has been struck, but not long enough ago for the forest to forget it. The cut brush still reeks green, and the round bed of a cookfire glows red under a careful skin of dirt.",
        "Sister Elswyth kneels beside a strip of bloody cloth caught on bramble and tells you the same hand cut from the same weave was on the shoulder of the laborer she treated. He asked for water, named no lord, and begged her not to let them reach the high stone.",
        "The hidden work is climbing, and its wounded are already falling behind it. Whatever waits above has become important enough to spend men for."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the edges one more time before returning to the chapel witness.",
          "nextNodeId": "K04C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trust the chapel report, leave the cooling camp, and take the wounded laborer's words while they are fresh.",
          "nextNodeId": "K04A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the first downhill prints and assume the crew has broken apart.",
          "failTitle": "The Camp Goes Cold",
          "failText": "You chase stragglers while the real gang keeps to the marked line and gains another march.",
          "death": false
        }
      ]
    },
    {
      "id": "K03C",
      "turn": 3,
      "title": "Charcoal Clearing - Late Smoke",
      "narrative": [
        "Dawn finds you in the charcoal clearing with the smoke already thinned to a bitter ribbon. Whoever camped here left in order, not flight, and even their midden has been covered with ash and turf.",
        "A single broken maul handle and fresh stone flakes tell the story more clearly than the trampled edges. These were laborers guarded by men who knew how to erase a camp without wasting time.",
        "Sister Elswyth's report of a wounded mason keeps the line alive. Without that, the clearing would look like a memory instead of a road being born under your nose."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the clearing and call it done.",
          "failTitle": "Ash on the Wind",
          "failText": "Flame destroys the few signs you had, and the hidden road climbs on while you stare at your own smoke.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept the thin evidence and go to St. Briar for the living part of the trail.",
          "nextNodeId": "K04C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the erased camp itself as proof of discipline and question the wounded mason before the crews move farther ahead.",
          "nextNodeId": "K04B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K04A",
      "turn": 4,
      "title": "St. Briar Chapel - The Mason Speaks",
      "narrative": [
        "At St. Briar you find the wounded mason awake for a narrow stretch between fever and sleep. His hands are lime-burned, his boots are cut by quarry scree, and he flinches when the bell above the chapel door stirs in the wind.",
        "He says he was hired through middlemen to mend culverts on an old survey line, paid in clipped silver, and warned never to look uphill when the master came. Yet he heard the guards use one name in fear rather than respect: Keld.",
        "Before weariness takes him, he whispers the real destination. Widow's Notch, he says, and then grips your sleeve hard enough to hurt, as if the mountains themselves were closing over him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the name and the place, then verify them against the road line before moving on.",
          "nextNodeId": "K05B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Press the mason until he collapses and the last of his memory goes with him.",
          "failTitle": "The Witness Breaks",
          "failText": "Your haste silences the only living laborer willing to speak. The trail remains real, but its purpose blurs again.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pair the mason's warning with the measured ground and move at once for the supply source below the climb.",
          "nextNodeId": "K05A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K04B",
      "turn": 4,
      "title": "St. Briar Chapel - Fevered Fragments",
      "narrative": [
        "The mason drifts in and out while Sister Elswyth cools his brow with vinegar cloths and tells you to ask only what matters. Even half senseless, he grips at invisible rope and mutters measurements under his breath.",
        "Between those fragments you draw a working picture: culverts first, then cut banks, then retaining walls where the climb bites into stone. One word comes clearly enough to freeze the room, and it is Keld.",
        "He does not know whether Keld serves another lord or only his own grievance. He does know the crews fear missing a date more than they fear dying in the work."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the name seriously, hold only the facts, and move for the quartermaster trail beneath the climb.",
          "nextNodeId": "K05A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Treat the fragments as a warning, but spend time confirming the crew's route and stores.",
          "nextNodeId": "K05C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the rambling as fever talk and search the chapel for hidden relics instead.",
          "failTitle": "The Wrong Mystery",
          "failText": "You waste precious hours on superstition while Keld's very earthly road keeps rising.",
          "death": false
        }
      ]
    },
    {
      "id": "K04C",
      "turn": 4,
      "title": "St. Briar Chapel - Breath Against Time",
      "narrative": [
        "When you reach St. Briar, the mason is close to slipping past questions entirely. Sister Elswyth stands over him like a gatekeeper and makes you cut away rumor until only the needed words remain.",
        "Those words are enough. He helped face a slope above a place called Widow's Notch, he was paid by men who carried no badges, and their master marked boards with an angular K before each night march.",
        "The tale is thinner than you would like, but it holds. Someone named Keld is pushing skilled work toward a forgotten pass, and the bells are buying him empty roads below."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce the name aloud in the chapel yard and trust fear to flush the traitors out.",
          "failTitle": "Echoes Carry",
          "failText": "A listener slips away before your men can close the lane. By sunset the crews have changed routes and every ally is a mark.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the name, the mark, and the mention of Widow's Notch to cut straight toward the supply chain.",
          "nextNodeId": "K05B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Work from the few hard facts and search for the stores feeding the hidden line.",
          "nextNodeId": "K05C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K05A",
      "turn": 5,
      "title": "Bee Shed Cache - Ordered Stores",
      "narrative": [
        "Following the survey line east, you and Maelin uncover a bee shed whose hives have been cleared out and replaced with sorted stores. Grain sacks sit on planks above damp, nails are wrapped in oilskin, and spare shoes hang by size from pegs as neat as any armory.",
        "Captain Ivo Merrow arrives with six road guards just as Reeve Hadrin Pike rides up from Oakenhurst wearing worry too smoothly. Pike speaks eagerly of poachers and marsh thieves, but his gaze lingers on the tally marks cut into the shed post.",
        "A hidden road this large does not live by theft alone. Someone nearby is counting for it, feeding it, and listening hard for any hint that the duke's ranger is close."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the cache like a quartermaster and start breaking the hidden chain where supply and signal meet.",
          "nextNodeId": "K06A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take Pike at his word and send Captain Ivo hunting poachers in the wrong valley.",
          "failTitle": "Fed by the Village",
          "failText": "Your patrols scatter while the real supply line stays hidden in plain sight.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Watch Pike closely, but spend the next hours tracing how the stores are signaled onward.",
          "nextNodeId": "K06B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K05B",
      "turn": 5,
      "title": "Bee Shed Cache - Uneasy Company",
      "narrative": [
        "The bee shed lies tucked under fir boughs, its hives cold and empty, its floor crowded with tar jars, grain, nails, and mule tack. Nothing in it is random. Whoever stocked the place plans weeks ahead and counts every load.",
        "Captain Ivo Merrow studies the stacks with a soldier's eye while Hadrin Pike offers too much help and too few answers. The reeve knows which lanes wash out in rain, which barns stand half empty, and exactly how much each missing cart could carry.",
        "That knowledge may be innocent, but it sits badly beside the cache. The hidden road is being provisioned by someone who understands village routine as well as any steward."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold back, preserve the scene, and follow the next movement rather than forcing a break.",
          "nextNodeId": "K06C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the cache, Pike's knowledge, and Ivo's eye together to identify the road's hidden messenger posts.",
          "nextNodeId": "K06A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the cache untouched so you can watch it later, even though the watchers already know you found it.",
          "failTitle": "Cleaned Before Dawn",
          "failText": "By morning the shed is bare and the chance to read the supply chain is gone.",
          "death": false
        }
      ]
    },
    {
      "id": "K05C",
      "turn": 5,
      "title": "Bee Shed Cache - Trail Through Common Hands",
      "narrative": [
        "You come on the cache only after tracing scattered sacks, broken twine, and mule droppings through two farm lanes and a thicket. The detour is maddening, but it reveals as much as the store itself.",
        "The bee shed holds less than it should, which means loads are still moving upward, not waiting here. Captain Ivo notes fresh wheel grease on a cart peg, and Hadrin Pike arrives with excuses prepared before anyone accuses him.",
        "If Pike is merely frightened, he is useless. If he is involved, he is dangerous, because he can drape treason in the ordinary language of harvest and loss."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Publicly seize Pike without proof and let the villages decide whether to riot.",
          "failTitle": "The Villages Turn",
          "failText": "Your rash arrest splits the countryside and drives the real quartermasters deeper into the trees.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow Pike from a distance and accept slower work for the sake of order below.",
          "nextNodeId": "K06C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Treat Pike as a likely hinge in the plot and follow the signs that link the cache to the signal chain.",
          "nextNodeId": "K06B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K06A",
      "turn": 6,
      "title": "Signal Wood - Speaking Forest",
      "narrative": [
        "Above the bee shed, the pines reveal the trick that made the bells so effective. Branches have been trimmed into sight lanes, shale outcrops carry lamp soot in narrow slits, and horn stations overlook every bend where a cart might be seen from below.",
        "Maelin maps the signals in his head with quick, irritated precision. Sister Elswyth recognizes chapel wax pressed into the shutter seams, proof that sacred stores were stolen for a very practical war of silence and noise.",
        "Keld has turned woodland craft into a messenger chain. Break it properly and his road crews become men again; miss a link and the forest keeps warning him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Disable a few outer posts and press on before the full network adapts.",
          "nextNodeId": "K07B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light the signal posts yourself to lure the crews out all at once.",
          "failTitle": "A Chain of Alarms",
          "failText": "The false pattern warns every watcher that you understand the system. Keld cuts his losses and vanishes uphill.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the signal chain to its heart and move on the road line only after the watchers have been blinded in order.",
          "nextNodeId": "K07A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K06B",
      "turn": 6,
      "title": "Signal Wood - Half Seen Pattern",
      "narrative": [
        "The signal network appears by degrees rather than revelation: a soot mark on stone, a clipped branch aimed at a ridge, a horn scrap tucked under roots near a game trail. Each piece alone is small. Together they speak like officers passing orders.",
        "Captain Ivo grudgingly admires the discipline behind it. Maelin only spits and says a forester taught them part of this, because town men do not read a slope so well on their own.",
        "You are close enough now to damage the speaking chain, but not yet close enough to know where its heart lies. Keld still has more eyes than you do."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the half seen pattern to predict where the next watchers stand and cut toward the climb before they can report.",
          "nextNodeId": "K07A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Clip what warnings you can and accept that some lookouts will remain active above you.",
          "nextNodeId": "K07C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore the signal posts and trust speed to outrun warning.",
          "failTitle": "Seen Too Soon",
          "failText": "By the time you reach the next rise, the camps ahead are cold and the sentries have folded into stone and brush.",
          "death": false
        }
      ]
    },
    {
      "id": "K06C",
      "turn": 6,
      "title": "Signal Wood - Warnings on Every Ridge",
      "narrative": [
        "Once you know to look, the woods turn hostile with meaning. Every trimmed spray, every bit of soot, every tucked horn cup says the same thing: men above are watching men below, and they have been at it for some time.",
        "The network is broader than you hoped and sloppier than you feared, a sign that Keld is hurrying fresh hands into trained places. That helps him move faster, but it also means he has started to strain.",
        "You are still behind the rhythm of the road. Unless you cut into the pattern soon, each step upward will be announced before your boots leave the ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Split your small party to strike every signal point at once.",
          "failTitle": "Thin on the Ground",
          "failText": "Isolated in the trees, your men are picked off, misled, or simply lost while the road crew marches on.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Strike the most important links first and use the brief silence to recover the line uphill.",
          "nextNodeId": "K07B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept partial warning and keep enough strength together to survive the climb.",
          "nextNodeId": "K07C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K07A",
      "turn": 7,
      "title": "Stagrise Cut - Old Stone, New Hands",
      "narrative": [
        "The marked line steepens into Stagrise Cut, an old military shelf road half buried under fir roots and foxglove. Fresh drainage ditches glitter with new water, and the cut bank has been faced in recent stone where winter slides once bit it away.",
        "Captain Ivo kneels beside a culvert mouth and measures the spacing with two fingers. This is not a drover's track or charcoal path, he says. It is a load road built to keep heavy wheels moving at speed.",
        "That changes the danger. A gang of thieves can hurt a village. A reopened pass can expose half Brackenwald before anyone in the low fields knows war has crossed the mountains."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use side cover, Maelin's eye, and the fresh drainage work to move on the road without being offered to it.",
          "nextNodeId": "K08A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride the visible shelf road in daylight and give every hidden archer a clean look at you.",
          "failTitle": "Pinned on the Cut",
          "failText": "The slopes answer with arrows and rolling stone. You survive, but Keld gains the time he wanted.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Advance on the shelf with shields up and patience, keeping casualties low but losing pace.",
          "nextNodeId": "K08B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K07B",
      "turn": 7,
      "title": "Stagrise Cut - The Hard Climb",
      "narrative": [
        "You reach Stagrise Cut by a narrower line, seeing the old road first as an absence in the trees and only then as workmanship. Soil has been pared back from the bank, roots severed, and water led under the shelf by new-laid stone that still smells of fresh chisel.",
        "Captain Ivo needs little convincing. Anyone spending this labor on the climb intends wagons, draft, and return traffic, not a one-night raid. The build is permanent even if the men behind it hope to vanish.",
        "The higher you go, the less room there is for mistakes. A hidden road on this slope is more valuable than gold to whoever plans to use it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the climb deliberate and preserve strength for whatever waits above the cut.",
          "nextNodeId": "K08C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let the workmanship tell you where Keld must commit next and move to that point before dark.",
          "nextNodeId": "K08A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pause to map every stone instead of keeping pace with the men who laid them.",
          "failTitle": "Measured and Too Late",
          "failText": "Your notes grow exact while the enemy reaches the heights first.",
          "death": false
        }
      ]
    },
    {
      "id": "K07C",
      "turn": 7,
      "title": "Stagrise Cut - Lost Ground on the Shelf",
      "narrative": [
        "By the time you stand over Stagrise Cut, the work on it is no longer fresh enough to shock. Water has already found the new ditches, and boot prints overlap so thickly that counting men becomes guesswork.",
        "Still, the craft is undeniable. Someone has reopened a road forgotten since the border wars, and reopened it with the sort of skill that spends labor only where it earns a future.",
        "You are no longer trying to prove a suspicion. You are climbing inside a completed design, and designs are hardest to stop when they near their last line."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Captain Ivo back for a larger force and wait on the shelf.",
          "failTitle": "The Pass Draws Breath",
          "failText": "Reinforcements come too slowly for mountain work. When they arrive, the hidden road is already beyond the point of simple closure.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold together and keep climbing even though the enemy already owns the rhythm of the slope.",
          "nextNodeId": "K08C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the thickened sign to estimate crew size and regain a little time by striking for the next choke point.",
          "nextNodeId": "K08B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K08A",
      "turn": 8,
      "title": "Broken Toll Arch - Keld's Mark",
      "narrative": [
        "Under the broken toll arch at the head of the cut, you find fresh mortar sheltered from rain and, beneath it, a chisel mark no common mason would bother to hide. It is an angular K cut where only another builder would think to look.",
        "Captain Ivo sees it and swears softly. Oren Keld marked Duke Aldric's roads that way before Aldric cast him out for working levies to death in spring floods and winter stone.",
        "A name turns the whole affair harder. This is not lawless opportunity any longer, but revenge shaped into infrastructure, the most patient kind of treason."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the proof and move on, assuming the sponsor behind Keld will show itself later.",
          "nextNodeId": "K09B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout Keld's name across the arch in hope he answers his vanity.",
          "failTitle": "The Builder Hears You",
          "failText": "Echo carries farther than courage. The sentries above close ranks while Keld changes the next stage of his march.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Treat Keld's mark as the center of the plot and hunt for the quartermaster who keeps him fed below.",
          "nextNodeId": "K09A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K08B",
      "turn": 8,
      "title": "Broken Toll Arch - The Craftsman's Signature",
      "narrative": [
        "Rain has washed most of the arch clean, but not the sheltered seam on its inner face. There, under new patchwork, lies the kind of small signature only a proud engineer would risk cutting.",
        "Maelin does not know it, yet Captain Ivo does. Oren Keld, the dismissed road-master, used that angular mark on culverts, bridge feet, and mile stones when Duke Aldric still tolerated him.",
        "The hidden road now has a mind behind it, and a history. Keld is not building for coin alone. He is reopening something Brackenwald denied him the first time."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Keld's vanity against him and look for the village hand that has been feeding his design.",
          "nextNodeId": "K09A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep climbing first and leave the question of supply and backing for later.",
          "nextNodeId": "K09C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume Keld works alone and stop looking for a sponsor beyond the hills.",
          "failTitle": "Only Half the Plot",
          "failText": "You fix on the builder and miss the men waiting to use what he builds.",
          "death": false
        }
      ]
    },
    {
      "id": "K08C",
      "turn": 8,
      "title": "Broken Toll Arch - A Name in Mortar",
      "narrative": [
        "The arch yields its answer only after Maelin notices a fresh patch where ivy was torn away and reapplied. Beneath the leaves, shielded from the weather, an angular K sits scratched into damp mortar like a private oath.",
        "Captain Ivo's face hardens at once. Oren Keld, he says, and the name carries old contempt. Keld was once trusted with roads, then banished when dead levies and missing pay could no longer be hidden.",
        "The revelation comes late, but it still steadies the hunt. A man like Keld does not labor this hard for a prank, and he never builds without an end use in mind."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Turn back to gather papers on Keld's past before pressing on.",
          "failTitle": "History Overtakes You",
          "failText": "By the time old records reach your hand, Keld is already at work where no clerk can stop him.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Keld's identity to read where his supplies must be hidden and cut back toward the quartermaster trail.",
          "nextNodeId": "K09B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the name as enough and keep climbing, even if the wider shape of the plot stays uncertain.",
          "nextNodeId": "K09C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K09A",
      "turn": 9,
      "title": "Pike's Outer Barn - Hidden Accounts",
      "narrative": [
        "The road sign bends back toward common land before climbing again, and it leads you straight to Hadrin Pike's outer barn. Under loose floorboards lie rope invoices, tar jars, and mountain shoe nails packed beside grain that should have gone to Oakenhurst's winter store.",
        "A torn letter wedged in a crack gives the rest: Lord Noll's men will cross when the notch is opened, and Pike is to keep carts moving until the bells ring together. His treason is organized, literate, and fed through ordinary village trade.",
        "A reeve with keys, tallies, and neighbors' trust is worth ten masked raiders. The countryside itself has been lending Keld its hands without knowing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the papers, leave the trap half shut, and prepare for the open stroke Pike must make next.",
          "nextNodeId": "K10A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Pike in the open yard before securing the papers.",
          "failTitle": "Fire in the Barn",
          "failText": "Pike's men torch the evidence and the village sees only smoke, not guilt.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure what proof you can and watch for Pike's answer rather than forcing it at once.",
          "nextNodeId": "K10B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K09B",
      "turn": 9,
      "title": "Pike's Outer Barn - Supplies in the Tithe Grain",
      "narrative": [
        "Pike's barn does not betray him at first glance. It smells of hay and damp oak like any reeve's storehouse. Only when you lift the false plank behind the grain bins do the hidden tar jars and rope accounts come to light.",
        "The letter fragment you find is singed at one edge, yet its meaning survives. Men beyond the Gray Mountains are waiting for a road, and Pike has been tasked with feeding the work until the bells call them through.",
        "What looked like scattered theft now stands revealed as quartermaster's labor. Every missing sack and mule shoe belonged to a campaign, not a hungry winter."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Gather the proof and tighten watches, even if Pike likely moves before you can seize him cleanly.",
          "nextNodeId": "K10C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Turn the hidden accounts into a snare and force Pike or Keld to expose their hand at the ford.",
          "nextNodeId": "K10A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Pike unwatched while you search the fields for more hidden stores.",
          "failTitle": "The Reeve Slips the Net",
          "failText": "He flees ahead of your return and spends the night burning what else might have proved the plot.",
          "death": false
        }
      ]
    },
    {
      "id": "K09C",
      "turn": 9,
      "title": "Pike's Outer Barn - Suspicion Made Solid",
      "narrative": [
        "The path to Pike's guilt is indirect, as such paths often are. A branded grain sack turns up beside a cut bank, then a tar jar in a ditch, then finally a barn floor whose dust has been swept too often in the wrong places.",
        "Under the boards you find enough to damn him in any honest hall: supply tallies, spare bell clappers, and a letter naming men beyond the mountains who wait for the road to open. The reeve has been feeding invasion through the customs of harvest.",
        "The knowledge comes with danger. If Pike sees he is exposed, he will burn the countryside rather than stand alone under blame."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Show the letter to every villager you pass and trust outrage to do your work for you.",
          "failTitle": "Mob Law",
          "failText": "Panic and vengeance tear through Oakenhurst while Keld keeps the higher ground and Pike disappears.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the proof quiet and brace for Pike's retaliation rather than risking a village stampede.",
          "nextNodeId": "K10C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the hidden papers to predict Pike's next move and meet it where the countryside is weakest.",
          "nextNodeId": "K10B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K10A",
      "turn": 10,
      "title": "Blackwater Ford - Fire and Splintered Boards",
      "narrative": [
        "Before dawn the bells sound from two hollows at once, and smoke climbs from the ford barn in a straight dark column. Men run with buckets, women drag children clear of the lane, and someone hacks the plank bridge while the crowd is turned toward flame.",
        "Captain Ivo keeps the panic from becoming a rout, but only just. Pike has chosen open disruption now that secrecy is failing, and Keld's watchers are bold enough to use common people as cover.",
        "Part of the letter chest goes toward the current before you can seize it. The plot is not lost, yet from this point onward the enemy knows you can name him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the villagers first, even if that means Keld's men escape the smoke.",
          "nextNodeId": "K11B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the fleeing torchbearers and leave the villagers to sort the fire themselves.",
          "failTitle": "The Ford Collapses",
          "failText": "Flame, current, and fear finish what Pike began. The crossing fails and the countryside turns against your absence.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Divide the work cleanly: Ivo secures the bridge, you salvage proof, and panic is denied its full harvest.",
          "nextNodeId": "K11A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K10B",
      "turn": 10,
      "title": "Blackwater Ford - Confusion by Design",
      "narrative": [
        "The attack at Blackwater Ford is built for confusion rather than destruction, which makes it more dangerous. One barn burns hot enough to draw every eye while men in the smoke work at the bridge pegs with axes and hooks.",
        "You save what papers you can, yet much of the proof is waterlogged or trampled. Captain Ivo swears Pike had help from trained hands, because common farm boys do not cut a crossing so fast under pressure.",
        "Keld is stripping away the easy ground now. He wants you busy with rescue and rumor while his road crews keep their pace above the trees."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Save what proof matters most, fix the crossing, and deny Pike the full collapse he meant to cause.",
          "nextNodeId": "K11A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stabilize the ford and accept that the enemy has bought itself time through disorder.",
          "nextNodeId": "K11C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order every villager into a hunt for hidden saboteurs before the fire is out.",
          "failTitle": "Panic Runs Ahead",
          "failText": "The mob finds no saboteurs, only shadows, and the true raiders depart behind the smoke they made for you.",
          "death": false
        }
      ]
    },
    {
      "id": "K10C",
      "turn": 10,
      "title": "Blackwater Ford - The First Open Blow",
      "narrative": [
        "By the time you reach Blackwater Ford, the first flames are already through the barn roof and the bridge is half chopped apart. Whoever struck here timed the bells, the smoke, and the crowd with a cold understanding of how villages move.",
        "You salvage little besides a scorched ledger board and the certainty that Pike has gone from covert traitor to active enemy. Captain Ivo's men hold the lane, but anger is spreading faster than command.",
        "The hidden road has defended itself. Keld no longer means merely to finish his work; he means to leave the country below too frightened and divided to close it afterward."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Blame Pike alone from the saddle and threaten anyone who questions you.",
          "failTitle": "Authority Frays",
          "failText": "Your harshness gives frightened folk a new target. While you fight your own people, Keld keeps the mountain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Put out the worst of the fire, save who can be saved, and rebuild enough trust to keep climbing.",
          "nextNodeId": "K11B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the lane by force of presence and postpone the larger answer until order returns.",
          "nextNodeId": "K11C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K11A",
      "turn": 11,
      "title": "Oakenhurst Lane - Holding the Fields",
      "narrative": [
        "The morning after the ford fire is colder than the night before, and fear lies over the orchards like frost. Families near the outer lanes speak of abandoning their holdings, which would leave Keld a clear run through empty ground.",
        "You set watches where they can be seen, not merely where they do most good. Captain Ivo places his road guards at lane mouths, and Sister Elswyth turns St. Briar yard into a place of bread, bandages, and plain facts instead of rumor.",
        "Among the salvage near the ford, you find deep axle scoring and iron dust from something far heavier than farm carts. Keld is dragging a machine uphill, and it was worth burning a crossing to cover."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Stabilize the villages with visible order and then follow the axle sign before the mountain swallows it.",
          "nextNodeId": "K12A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Concentrate every guard at the chapel and leave the farms to their own fear.",
          "failTitle": "An Empty Country",
          "failText": "The outer holdings empty by noon, and the road gangs gain the clear corridor they wanted from the start.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the lanes calm first, even if the heavy machine gains more height while you do it.",
          "nextNodeId": "K12B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K11B",
      "turn": 11,
      "title": "Oakenhurst Lane - A Narrow Calm",
      "narrative": [
        "Panic does not quite become flight, but only because you spend half the morning putting yourself in every place rumor says you cannot be. Thorne carries you lane to lane until sweat darkens his neck and the farmers begin to steady.",
        "Captain Ivo's men are too few for comfort, yet enough for example. Sister Elswyth shames the worst talkers into helping the burned families, and Maelin quietly marks which hedges have been cut for messenger paths.",
        "The ground near the ford shows axle ruts deeper than any grain cart should cut in spring soil. Whatever Keld hauled past there, it is meant to move stone, not food."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept a brittle calm below and take the heavy trail uphill once order barely holds.",
          "nextNodeId": "K12C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use your brief calm to fix watches, close messenger gaps, and then move on the machine's line without losing the country behind you.",
          "nextNodeId": "K12A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Maelin to manage the villages while you press on at once.",
          "failTitle": "Fear Does the Enemy's Work",
          "failText": "Without your presence the lanes unravel into suspicion, and Keld gains both time and empty road.",
          "death": false
        }
      ]
    },
    {
      "id": "K11C",
      "turn": 11,
      "title": "Oakenhurst Lane - Fear on Every Doorstep",
      "narrative": [
        "The ford fire leaves the outer lanes raw and suspicious. Men who would trust you in the forest do not trust one another in the yard, and every missing chicken becomes another sign that the old woods have turned against them.",
        "You and your allies manage only a brittle order. Captain Ivo holds the road, Sister Elswyth keeps the frightened from bolting, and Maelin traces messenger cuts through the hedges while muttering that the enemy knows farm life too well.",
        "Even in disorder, the clues point upward. Deep wheel scoring and iron grit show that a great drum or wheel has already gone ahead toward the high ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the villagers arm themselves and settle old grudges while you climb.",
          "failTitle": "Civil Strife",
          "failText": "The lanes erupt in accusations and small violence. Keld's road becomes the lesser danger only because you allowed a worse one below.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the minimum peace you can and follow the heavy sign before it is gone.",
          "nextNodeId": "K12C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use Ivo, Elswyth, and Maelin in concert to stop a full flight and recover the line of the machine uphill.",
          "nextNodeId": "K12B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K12A",
      "turn": 12,
      "title": "Beech Ridge Quarry - The Great Drum",
      "narrative": [
        "The axle grooves lead to an abandoned quarry under Beech Ridge, where hides have been thrown over a great oak drum as if weather might still keep the secret. Fresh iron pins, greased journals, and coils of tarred rope name it plainly: a winch built for mountain stone.",
        "Maelin returns from the spoil heaps with word of draft teams sheltered upslope under brush screens. Captain Ivo runs a hand over the fittings and says the machine could peel open a blocked pass if it finds good anchors.",
        "Now the shape of Keld's plan is whole. He does not mean merely to reach Widow's Notch. He means to rip it open."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the quarry's lesson and climb for the notch before the upper frame is finished.",
          "nextNodeId": "K13B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set fire to the rope in place and stand admiring the blaze.",
          "failTitle": "Smoke Above the Quarry",
          "failText": "The fire warns the crews above, ruins little that cannot be replaced, and gives away your approach.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the machine, the rope, and the missing parts together, then cut straight toward Widow's Notch with the plan fully understood.",
          "nextNodeId": "K13A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K12B",
      "turn": 12,
      "title": "Beech Ridge Quarry - Siege Craft in Hiding",
      "narrative": [
        "The quarry gives up its secret piece by piece: first the rope smell, then the iron filings, then the oak drum itself under hides stiff with frost. It is too large for any mill and too stout for hauling timber.",
        "Captain Ivo does not need long to judge it. A machine like this is built to move fallen stone or drag a weighted gate, the sort of tool armies use when they intend a road to outlive a season.",
        "Keld has brought siege thinking into the forest, and done it without banners. That is what makes him dangerous. Men see banditry where a campaign is already underway."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take from the quarry exactly what the upper works must still be missing and use that to predict the path ahead.",
          "nextNodeId": "K13A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave the quarry and chase the upper works before the final assembly is complete.",
          "nextNodeId": "K13C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order the drum broken apart where it stands, giving the guards above hours of warning.",
          "failTitle": "The Quarry Empties",
          "failText": "You damage wood, not intent. By the time you climb, the crews have shifted the important pieces ahead.",
          "death": false
        }
      ]
    },
    {
      "id": "K12C",
      "turn": 12,
      "title": "Beech Ridge Quarry - Too Close to Completion",
      "narrative": [
        "At the quarry you arrive just late enough to see how near the hidden work has come to completion. The winch drum is already fitted to its axle bed, and the rope teams have hauled part of the frame onward.",
        "What remains is still enough to teach you the plan. Greased bearings, iron dog spikes, and anchor chains point to one purpose only: levering some great obstruction aside at height.",
        "The discovery should be heartening because it confirms everything. Instead it feels like hearing an enemy breathe just beyond a door you have not reached in time."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Take the machine as proof enough and ride back to warn Oakenhurst instead of pressing the climb.",
          "failTitle": "Warning Without Action",
          "failText": "The warning arrives true and useless. Everyone below knows danger is coming, and no one above is stopped.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let the near-complete frame tell you the final target and climb before Keld can marry tool to stone.",
          "nextNodeId": "K13B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Push on despite lost time and accept that the machine is already partly ahead of you.",
          "nextNodeId": "K13C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K13A",
      "turn": 13,
      "title": "Ward Line Posts - Widow's Notch",
      "narrative": [
        "Above the quarry the forest thins into stone gullies and bent fir, and there on a row of weathered posts you find the name the mason whispered. Widow's Notch. The old ward line still remembers what the low country forgot.",
        "From a shoulder of rock you glimpse the blocked gap itself, a jam of fallen stone sealing a narrow descent into broken land beyond Brackenwald. Clear that wound and hard riders could come through the duke's back country in two days.",
        "Keld did not choose the notch for romance or legend. He chose it because neglect made it invisible and engineering can turn invisibility into surprise."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the measure of the blocked gap quickly and leave before the heights can answer you.",
          "nextNodeId": "K14A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stand on the open shoulder studying the gap while the heights study you back.",
          "failTitle": "Eyes from the Scree",
          "failText": "Hidden archers mark your position and force you downslope while the crews above tighten their hold.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Withdraw from the exposed shoulder and plan the next climb from safer ground.",
          "nextNodeId": "K14B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K13B",
      "turn": 13,
      "title": "Ward Line Posts - The Forgotten Wound",
      "narrative": [
        "The climb from the quarry ends at old ward posts cut with names so worn that only one survives in full. Widow's Notch. The place sounds like a tale told by winter fire, yet the blocked gap beyond it is painfully real.",
        "You do not get the cleanest view before arrows whisper from higher stone, but even the short glimpse is enough. Once cleared, the shelf beyond would carry riders and pack beasts into Elderwood's flank faster than any alarm below could answer.",
        "Here at last the bells, the caches, the signals, and the labor line together. Keld has been building a surprise invasion route under the habits of everyday life."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the mountain in mind and fall back into a slower pursuit of the upper crews.",
          "nextNodeId": "K14C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the short, dangerous look you need and let the true scale of the threat sharpen every step after it.",
          "nextNodeId": "K14A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Treat the gap as too narrow for serious use and turn your men toward the lower camps instead.",
          "failTitle": "The Wrong Scale",
          "failText": "You misjudge mountain work, and Keld wins because he understood what a narrow road can mean in hard country.",
          "death": false
        }
      ]
    },
    {
      "id": "K13C",
      "turn": 13,
      "title": "Ward Line Posts - Hard Proof at Last",
      "narrative": [
        "Widow's Notch reveals itself grudgingly through sleet and branch shadow, more rumor made stone than landmark. Yet once you see the blocked gap and the cut ledges near it, no honest mind can call this a minor scheme.",
        "The road Keld is building does not need width to be deadly. It needs secrecy, speed, and just enough room for disciplined men to descend where Brackenwald expects no one.",
        "You have reached the point where doubt is over. Only time remains, and time now favors whichever side can bear hardship without breaking."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Maelin to Oakenhurst with the news and weaken the climb for the sake of certainty.",
          "failTitle": "Proof Without Strength",
          "failText": "The message goes true, but your line goes thin, and Keld needs only that.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep everyone together and accept that you are closing late on a nearly finished design.",
          "nextNodeId": "K14C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the hard proof to strip away hesitation and recover some pace on the climb.",
          "nextNodeId": "K14B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K14A",
      "turn": 14,
      "title": "Hard Frost - Keld in Daylight",
      "narrative": [
        "The weather changes in Keld's favor and yours alike. Frost hardens the mud, the sky clears, and the cut banks stop sliding. For the first time the hidden crews can work some stretches in daylight under brush screens rather than waiting for dark.",
        "That new boldness helps you as well, because Maelin can mark their movement from a distance and Captain Ivo can guess which teams guard the real load. Yet it means Keld has decided he is close enough to risk being seen.",
        "The bells sound different now. Less like haunting, more like orders. The road no longer hides what it is from those near enough to hear it honestly."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Track the daylight movement cautiously and save strength for the last loads.",
          "nextNodeId": "K15B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the heights the moment you spot movement, abandoning cover and patience.",
          "failTitle": "Broken on the Slope",
          "failText": "The climb becomes a scramble under prepared fire, and Keld buys the full day he needed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the clear air to identify the essential load and intercept where Keld must commit it.",
          "nextNodeId": "K15A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K14B",
      "turn": 14,
      "title": "Hard Frost - A Race in Clear Air",
      "narrative": [
        "When the frost sets, the whole mountain seems to sharpen. Tracks keep longer, voices carry farther, and the hidden crews begin to trust the clear air enough to move by gray day as well as dusk.",
        "You gain better sight lines, but so do Keld's watchers. The contest turns from mystery into pace, each side trying to decide where the other must commit before the notch is reached.",
        "What was once an investigation has become a race. The one mercy is that the road gang is now too far committed to vanish cleanly."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Match Keld's pace with your own discipline and cut toward the final haul while the weather still favors movement.",
          "nextNodeId": "K15A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Preserve your line and accept that the last intercept may come later and harsher.",
          "nextNodeId": "K15C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Spend the clear day resting your men while Keld uses it to haul.",
          "failTitle": "Daylight Given Away",
          "failText": "The mountain does not forgive lost hours. By dusk the winch parts are farther up than you guessed possible.",
          "death": false
        }
      ]
    },
    {
      "id": "K14C",
      "turn": 14,
      "title": "Hard Frost - Time Narrowing",
      "narrative": [
        "The break in weather should help, yet from where you stand it chiefly helps the enemy. Frost firms every cut path and turns each difficult stretch into something a desperate crew can force a loaded sledge across.",
        "Maelin still finds you movement to read, but he reads it from behind rather than beside. Captain Ivo warns that once the winch reaches the upper anchors, numbers below will matter very little.",
        "Keld is no longer merely ahead. He is nearing the point where good engineering outruns even brave men on foot."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Turn back downslope for fresh horses and lose the frost day entirely.",
          "failTitle": "The Window Closes",
          "failText": "By the time you return, the clear weather that might have saved you has already done its work for Keld.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the hardened tracks to recover the path of the essential load and force one last intercept below the notch.",
          "nextNodeId": "K15B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep climbing under poor odds and hope to contest the final assembly on bad ground.",
          "nextNodeId": "K15C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K15A",
      "turn": 15,
      "title": "Pine Cover Train - Cutting the Load",
      "narrative": [
        "Under the pines below the notch, the final supply train crawls upward with ox teams, tarred rope, iron dogs, and long handled bars wrapped in sacking. The handlers have muffled their bells, but not enough to hide the creak of the sledges.",
        "Captain Ivo argues for a clean strike on the escort. Maelin would rather cut the lead team free and turn the slope against the rest. Both plans have merit because the load itself is the true prize.",
        "If Keld loses rope or draft at this height, his timetable cracks. If he keeps them, the notch may open before sunset tomorrow."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Break the train by discipline rather than noise, denying Keld rope, pace, and confidence at once.",
          "nextNodeId": "K16A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose arrows at the first team you see and let the whole column scatter uncontrolled.",
          "failTitle": "Load in Motion",
          "failText": "The panicked teams plunge where you cannot follow, taking proof and opportunity with them.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take what material you safely can and let the rest crawl on in worse order.",
          "nextNodeId": "K16B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K15B",
      "turn": 15,
      "title": "Pine Cover Train - A Costly Intercept",
      "narrative": [
        "You catch the supply train in broken pine shadow, close enough to smell ox hide and hot tar. The load is exactly what the quarry promised: anchor spikes, heavy rope, and the last bars needed to make the winch useful.",
        "The escort is tighter than you hoped and more tired than you feared. Men who know they are near the end of dangerous work cling hard to discipline.",
        "This is the last easy chance to thin Keld's strength before the upper works. Lose too much time here and the final fight begins on ground of his choosing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the safer skirmish and accept that the most important gear may still reach the heights.",
          "nextNodeId": "K16C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Strike the handlers, the lead teams, and the anchor gear in one tight blow before the escort can recover.",
          "nextNodeId": "K16A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Attack the rear guards and leave the rope teams untouched.",
          "failTitle": "The Essential Load Passes",
          "failText": "You spill blood for noise while the real strength of the road keeps moving above you.",
          "death": false
        }
      ]
    },
    {
      "id": "K15C",
      "turn": 15,
      "title": "Pine Cover Train - Too Many Moving Parts",
      "narrative": [
        "The supply train is already stretched along the slope when you find it, rope sledges above, ox teams below, guards between, each part of the column close enough to aid the next. Keld has built the climb to reward order and punish hesitation.",
        "You may not be able to stop the whole train, but you can still choose what hurts it most. Tarred rope can burn, draft teams can be scattered, and tired men can be forced to move without rhythm.",
        "From here on, small losses matter. A broken harness or missed hour may weigh more than three dead guards once the winch reaches the rockfall."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive the oxen downslope in full panic and hope they break the rest for you.",
          "failTitle": "Chaos on the Mountain",
          "failText": "The teams smash apart where you cannot exploit it, and Keld salvages enough of the load while your own line loses cohesion.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Damage what you can and keep enough strength to survive the climb to the upper works.",
          "nextNodeId": "K16C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the train apart by its necessities and recover one layer of control before the final hours.",
          "nextNodeId": "K16B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K16A",
      "turn": 16,
      "title": "Forester's Hut - Pike Cornered",
      "narrative": [
        "Hadrin Pike tries to hide in a forester's hut above the lower springs, but quarry dust on his boots and seal wax in his sleeve betray him before he speaks. Thorne stamps outside in the cold while Captain Ivo posts men at the only two ways down.",
        "Confronted with his own tallies and the letter scrap, Pike breaks quickly. Keld promised him the outer holdings as a petty lord once riders from Lord Noll's country crossed through the opened notch.",
        "The stolen bells were never just cover. When the road stood ready, they were to ring together as the signal for men waiting beyond the Gray Mountains to begin their descent."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the confession, bind Pike, and climb without risking another hour on him.",
          "nextNodeId": "K17B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kill Pike in anger before he gives the last of what he knows.",
          "failTitle": "Silenced Too Soon",
          "failText": "His death satisfies nothing and costs the final shape of Keld's timing.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pull every last useful detail from Pike, then leave him in sure hands while you race for the notch.",
          "nextNodeId": "K17A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K16B",
      "turn": 16,
      "title": "Forester's Hut - Confession Under Pressure",
      "narrative": [
        "Pike runs only far enough to prove he knows he is guilty. You take him in a forester's hut with damp ledgers under the floor and a second cloak laid out for a climb he will never finish.",
        "He is frightened enough to bargain and vain enough to boast. Keld, he says, will open Widow's Notch tonight if he can, tomorrow if he must, and every stolen bell will sound as the summons to the men waiting beyond the border.",
        "Pike wanted rank more than coin and safety more than honor. He is too small a man to have made this plot, yet exactly the right size to help it live among ordinary people."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Pike's vanity against him, strip out the timing and signal plan, and climb with the last uncertainty removed.",
          "nextNodeId": "K17A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the confession and go, even if some of Pike's useful details remain untested.",
          "nextNodeId": "K17C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "March Pike openly through Oakenhurst so every gossip can question him on the way.",
          "failTitle": "A Mouth Too Public",
          "failText": "Word outruns you again. Keld learns his reeve is taken and accelerates before you can reach the heights.",
          "death": false
        }
      ]
    },
    {
      "id": "K16C",
      "turn": 16,
      "title": "Forester's Hut - Truth at the Last Edge",
      "narrative": [
        "You catch Pike with less ceremony than you wanted and more desperation than he deserves. He has packed food, spare gloves, and a small seal press, as if he meant to carry village authority up the mountain until the very end.",
        "Once cornered, he gives you the core of it. Men from beyond the Gray Mountains are gathered to the far side of Widow's Notch, and Keld intends to call them with the ringing of every stolen bell once the stone barrier is dragged clear.",
        "The confession arrives almost too late to matter. Still, it strips away the last hope that this could be solved by arrests below. The answer now lies only at the pass."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Pike bound in the hut without guard and trust the cold to keep him.",
          "failTitle": "The Reeve Escapes Again",
          "failText": "He slips free, carrying panic and false orders into the lanes behind you while you climb.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the confession cleanly, secure Pike with trusted hands, and climb with the signal plan in mind.",
          "nextNodeId": "K17B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bind Pike quickly and choose speed over the comfort of a complete reckoning.",
          "nextNodeId": "K17C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K17A",
      "turn": 17,
      "title": "Lower Spring - Leaving Thorne",
      "narrative": [
        "The climb above the lower spring begins in sleet that needles the face and turns the cut road silver. You leave Thorne with Sister Elswyth's small relief party, take bow and sword, and go on foot with Maelin, Captain Ivo, and the hardest of the road guards.",
        "Hill archers worry the flanks from black spruce while work crews drag the winch frame upward a few straining yards at a time. The whole slope smells of mule sweat, wet rope, and the raw mineral breath of freshly broken stone.",
        "By now every decision takes payment immediately. A misstep can cost a man, a minute, or the line between the notch and the valley below."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Let Maelin read the flank, let Ivo hold the center, and climb with enough order to reach the upper works ready to strike.",
          "nextNodeId": "K18A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive the whole party straight up the road without flank watch.",
          "failTitle": "Arrow Alley",
          "failText": "Hidden archers cut your climb apart and the upper works gain the precious hour they needed.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Advance under cover and accept a slower climb in exchange for keeping your line intact.",
          "nextNodeId": "K18B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K17B",
      "turn": 17,
      "title": "Lower Spring - Sleet and Strain",
      "narrative": [
        "Sleet turns the climb mean and close. Thorne must stay at the lower spring while you continue on foot, and the parting feels heavier than you care to admit because the ground ahead will accept no horse and little mercy.",
        "Captain Ivo keeps the patrol together under scattered archery, while Maelin threads you through spruce shadow whenever the road itself grows too exposed. Far above, the winch teams grunt and curse like men dragging a church uphill.",
        "You are still in the hunt, but the mountain now decides the pace as much as any human will. Every yard gained must be held against weather, stone, and determined men."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep formation and absorb the climb's cost, even if the upper works gain a little more time.",
          "nextNodeId": "K18C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the archers' rhythm against them and regain the direct line to the notch without breaking formation.",
          "nextNodeId": "K18A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pause to return fire at every unseen archer call.",
          "failTitle": "Pinned by Shadows",
          "failText": "The flank skirmish drags on until the main works are beyond practical reach.",
          "death": false
        }
      ]
    },
    {
      "id": "K17C",
      "turn": 17,
      "title": "Lower Spring - The Mountain Has the Measure",
      "narrative": [
        "By the time you reach the lower spring, the mountain already seems to know you are late. Sleet slicks the cut road, the trees close hard on both sides, and even leaving Thorne below feels like yielding more ground than a horse length.",
        "The climb becomes a grim labor of short rushes and careful breaths. Captain Ivo holds the men together, but the archers above choose when to bite and when to vanish.",
        "Keld has achieved the worst kind of advantage: not invulnerability, only the right to make you spend dearly for each chance to close with him."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Order a retreat to regroup in daylight.",
          "failTitle": "Night Given to Keld",
          "failText": "There is no second daylight to spare. By morning the upper works have done what they were built to do.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep climbing through bad odds and trust endurance more than elegance.",
          "nextNodeId": "K18C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use every fold in the slope, every dark spruce, and every mistake by the archers to recover one last layer of ground.",
          "nextNodeId": "K18B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K18A",
      "turn": 18,
      "title": "Upper Earthworks - The Raw Palisade",
      "narrative": [
        "Near the mouth of Widow's Notch, the hidden road broadens into raw earthworks, log screens, and a new palisade built just high enough to shield the winch teams. Beyond it, the stolen bells hang on a tall frame over the ravine, their bronze mouths turned toward Brackenwald like instruments of judgment.",
        "Keld's men are exhausted, which makes them dangerous rather than weak. They can see the end of their labor from where they stand, and desperate workers defend the last hour harder than paid soldiers defend a season.",
        "The inquiry that began in quiet hollows ends here in open force. What remains is judgment: where to cut, whom to spare, and what risk the valley can bear."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Break the works methodically and accept that the bell frame fight may come in worse light.",
          "nextNodeId": "K19B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Spend your strength battering the front of the palisade head on.",
          "failTitle": "Held at the Outer Works",
          "failText": "The logs hold long enough for the winch crew to keep hauling, and the mountain answers your bravery with delay.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hit the weak join, turn the screen line, and crack the outer works before Keld can settle his crews again.",
          "nextNodeId": "K19A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K18B",
      "turn": 18,
      "title": "Upper Earthworks - Narrow Breach",
      "narrative": [
        "You reach the outer works in broken order but not too late to matter. The palisade is rough, the firing slits crude, and the brush screens half torn by weather, yet it is enough to make a direct rush expensive.",
        "The bell frame beyond sways in the wind, and each dull knock of bronze on rope feels like time measured in blows. Captain Ivo points out the weak join in the left screen while Maelin spots a drainage cut that might take a single man under the defense.",
        "Keld has built just enough fortification to turn indecision into defeat. If you linger between plans, the winch crews will finish the work for him."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the drainage cut and the weak join together and open the works before the winch crew can complete another full pull.",
          "nextNodeId": "K19A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Press the breach with care and accept a harder final fight on the ledge beyond.",
          "nextNodeId": "K19C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call for terms from beyond bowshot and give the works a pause.",
          "failTitle": "Talk Bought Dear",
          "failText": "Keld answers with delay and uses every moment you grant him to tighten anchors and shift men.",
          "death": false
        }
      ]
    },
    {
      "id": "K18C",
      "turn": 18,
      "title": "Upper Earthworks - Too Much Ground to Take",
      "narrative": [
        "The outer works are cruder than a true fort and still worse than you need them to be. Fresh logs, muddy ditches, and brush screens make every approach awkward, especially for tired men coming uphill in sleet.",
        "The bells are visible now, and so is the winch frame beyond the palisade. Work continues behind cover whether you strike or not, and the crews' confidence says Keld believes you cannot break them in time.",
        "That belief may be his greatest weakness, but only if you can turn it quickly. A slow fight here is almost the same as losing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Spread your men all along the works and test every wall at once.",
          "failTitle": "Strength Squandered",
          "failText": "Your line thins across the whole defense, and Keld needs only one stout point to hold until the notch begins to move.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Exploit Keld's confidence, cut through where he thinks you are weakest, and reach the ledge before the machine settles.",
          "nextNodeId": "K19B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the most workable approach and accept that the bell frame fight may begin with little order left.",
          "nextNodeId": "K19C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K19A",
      "turn": 19,
      "title": "Bell Frame Ledge - Keld in Sight",
      "narrative": [
        "Once the outer works crack, the final ground is suddenly close. The bell frame stands on a narrow ledge above the jammed rockfall, and beneath it chains bite into wedges driven under the blocking stone while the winch crew heaves in desperate rhythm.",
        "Oren Keld is there in plain sight at last, gray cloaked against the weather, one hand on the survey rod with which he once marked Duke Aldric's roads. He looks more like a master builder than an outlaw, and perhaps that is the ugliest part of him.",
        "Keld does not waste breath on threats. He offers bargains, delays, and the bitter argument that roads outlive the men who curse them, hoping to keep you talking while the mountain answers his machine."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Keld's need to talk against him, strike the anchor sequence, and force the last fight on your terms.",
          "nextNodeId": "K20A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Keld's parley and step within reach before the ropes are checked.",
          "failTitle": "One Breath Too Long",
          "failText": "Keld buys the heartbeat he needed. The stone shifts, the bells thunder, and the far slope wakes to invasion.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ignore Keld's tongue, drive the crew off the drum, and contest the machine in brute order.",
          "nextNodeId": "K20B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K19B",
      "turn": 19,
      "title": "Bell Frame Ledge - The Builder's Last Measure",
      "narrative": [
        "The ledge beyond the works is a place made for bad endings: one side cliff, one side ravine, the middle crowded with bells, chains, and men too tired to stop. The rockfall at Widow's Notch groans under new pressure with each turn of the drum.",
        "Keld stands where he can see both the crew and the slope below, measuring disaster like a survey problem. He knows you have reached him, yet he also knows the mountain may still do his work if he can keep order for a little longer.",
        "There is no mystery left now, only competing forms of will. The question is whether his careful cruelty can outlast your cleaner sort of resolve."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Break the crew's rhythm first, even if Keld himself keeps room to flee.",
          "nextNodeId": "K20C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Force the crew off balance, deny the drum a clean pull, and close on Keld only when the machine is failing.",
          "nextNodeId": "K20A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Try to duel Keld in the open while the crew keeps hauling behind you.",
          "failTitle": "The Mountain Keeps Turning",
          "failText": "Your courage fixes on the wrong man. By the time steel settles the question, stone has already answered it.",
          "death": true
        }
      ]
    },
    {
      "id": "K19C",
      "turn": 19,
      "title": "Bell Frame Ledge - Between Stone and Wind",
      "narrative": [
        "You reach the bell frame with less order than you wanted and barely enough time to matter. The ropes hum, the wedges creak, and the bronze bells strike one another in the wind like nervous teeth.",
        "Keld stays out of sword reach, directing his men with the short cold phrases of a foreman who has spent years learning exactly how much fear a crew can carry. He is not trying to win glory now. He is trying to finish.",
        "The ledge offers almost no margin for heroics. What matters is not display but where the next few steps fall, and whether you can force Keld's labor to break before the mountain does."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut wildly at the nearest rope without securing your footing or the crew.",
          "failTitle": "The Ledge Gives Way",
          "failText": "A snapped line lashes men and stone into chaos, and you go with it before the notch can be truly denied.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the ledge, spoil what parts of the machine you can reach, and survive into the last exchange.",
          "nextNodeId": "K20C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Turn the crew's own strain against them and create one clean opening in the main line before Keld can settle them.",
          "nextNodeId": "K20B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K20A",
      "turn": 20,
      "title": "Widow's Notch - Clean Break",
      "narrative": [
        "Last light bleeds along the Gray Mountains as you force the last distance between Keld and the loaded machine. The ropes sing, the bells answer the wind, and flakes of stone patter into the ravine from a barrier already under murderous strain.",
        "Because you kept the trail, the villages, and your allies from breaking, the ledge is not wholly Keld's. Maelin has a shot on the far anchor, Captain Ivo can drive the crew off the drum, and Keld at last has no screen between his design and judgment.",
        "Brackenwald does not need magic to be lost here. It needs only a road opened at the wrong hour, by the wrong man, under the cover of fear. The end depends on whether you ruin the work thoroughly enough that the country below can breathe again."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Drive the crew back, cut what ropes you safely can, and settle for sealing the ledge in the dark.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Lunge for Keld alone and leave the live anchors under tension.",
          "failTitle": "The Notch Opens",
          "failText": "Your strike misses the true danger. The loaded system runs one breath longer, the barrier shifts, and the pass opens under a storm of ringing bronze.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Break the anchors in order, bring Keld down, and bury the road mouth under its own failed machine.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        }
      ]
    },
    {
      "id": "K20B",
      "turn": 20,
      "title": "Widow's Notch - Bitter Ground",
      "narrative": [
        "The final struggle plays out in failing light, every shape on the ledge half bronze, half shadow. The winch still holds enough tension to move stone, but the crew is shaken and the rhythm Keld needs has been broken more than once.",
        "Captain Ivo bleeds from the arm and Maelin is breathing hard, yet both remain in the fight. Keld still has options, though fewer now, and the mountain is balanced between human will and the weight of old collapse.",
        "You can still save Brackenwald from the worst of this plot. The harder question is how much proof, how much justice, and how much of the road itself you can preserve or destroy before night closes."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seize the drum, cut the master line, and take Keld before he can flee into the dark.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Force Keld's men off the winch and block the notch with fallen gear before they can reset.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge the drum headlong and trust mass to beat leverage.",
          "failTitle": "Under the Drum",
          "failText": "The drum kicks loose under strain and flings men from the ledge. In the confusion, the barrier breaks where you could not stop it.",
          "death": true
        }
      ]
    },
    {
      "id": "K20C",
      "turn": 20,
      "title": "Widow's Notch - Survival at the Edge",
      "narrative": [
        "Night comes fast at Widow's Notch. Sleet hisses on the ropes, the bells sway blind in the darkening wind, and the rock barrier complains with the deep cracked voice of weight beginning to choose a side.",
        "You have less room and fewer hands than you wanted, but not none. Even now the crew can be broken, the machine spoiled, and the descent denied if you act with more discipline than the men who built this treason.",
        "The finest outcome has grown harder, not impossible. Whatever happens in the next moments will decide whether Brackenwald wins a clean reprieve or only a costly survival."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Hack at the nearest bell support and hope falling bronze ends the fight.",
          "failTitle": "Bronze and Stone",
          "failText": "The frame collapses the wrong way, throws the ledge into ruin, and gives the loaded rockfall the violent push it needed.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Turn the crew, snap the main line at the right moment, and finish Keld before the pass can answer him.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ruin the machine, hold the ledge, and accept that some enemies will escape into the mountains.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        }
      ]
    }
  ]
});
