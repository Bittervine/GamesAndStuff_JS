window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "ashes-on-the-beacon-chain",
  "title": "Ashes on the Beacon Chain",
  "summary": "When a false beacon burns above Elderwood, the ranger uncovers a plot by a disgraced signal captain to turn Brackenwald's hill towers into a weapon against Duke Aldric on the eve of a mountain journey.",
  "maxTurns": 20,
  "startNodeId": "K01A",
  "goodScoreThreshold": 11,
  "epilogues": {
    "high": "King's Lantern was reclaimed, Ser Garran Vey's design was broken, and Duke Aldric kept the road. In the months that followed, Brackenwald rebuilt its beacon chain with sterner discipline and better memory, and your name passed from tower to tower as the ranger who understood that a realm may be killed by false signals as surely as by steel.",
    "low": "Brackenwald endured the night, but Stonewake remembered how near the pass came to ruin. The towers were trusted more warily, the dead were counted by sober daylight, and whatever victory was won carried the taste of rain, soot, and the hard work left for dawn."
  },
  "nodes": [
    {
      "id": "K01A",
      "turn": 1,
      "title": "The Wrong Fire - Dawn Summons",
      "narrative": [
        "Rain had passed east before dawn, leaving every roof of Brackenwald Hall black and shining. From the yard you saw the smear of smoke on Widow's Pike, far too early and too thin for the tower's lawful call, and the whole valley below it was already stirring in alarm.",
        "Captain Hester Vale met you by the gate with her cloak unfastened and mud to the knee, which told its own tale of a night gone crooked. Duke Aldric had halted the north riders before they wasted half the morning on a false muster, and he wanted the truth before rumor ran farther than the smoke.",
        "You saddled Thorne while grooms whispered of raiders, ghosts, and border fire, all the old foolish talk that rises with a signal no one understands. Hester only said that Widow's Pike had a careful keeper and that careful men do not light the basin by mistake."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride the main track to Widow's Pike and question whoever remains there.",
          "nextNodeId": "K02B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Turn aside to rouse every nearby hamlet before you know what the fire meant.",
          "failTitle": "Panic Runs Faster Than Truth",
          "failText": "By noon the roads are choked with carts and frightened folk. Whoever lit the false beacon gains half a day while Brackenwald tangles itself in rumor.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the deer path under the ridge and reach the tower before its trail is trampled.",
          "nextNodeId": "K02A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K01B",
      "turn": 1,
      "title": "The Wrong Fire - Marsh Return",
      "narrative": [
        "You came in from the Deep Marshes with reed water on your boots and Thorne flecked with gray foam when the horn sounded from the keep. Above the eastern trees a dirty thread of smoke stood on Widow's Pike where no lawful call should have burned.",
        "Hester caught you before you had both feet on the cobbles and thrust a dry map into your hand. A grain convoy bound for Oakenhurst had turned back in darkness, and two wardens swore the beacon flared only long enough to pull men from their roads.",
        "Duke Aldric had not yet ridden, but news like that could hollow a countryside before breakfast. You smelled lamp pitch under the rain and felt at once that someone had treated the old towers not as warning, but as bait."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the ridge cut at once and inspect Widow's Pike before the rain wipes it clean.",
          "nextNodeId": "K02A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Check the convoy road first and gather the frightened guards' tale before heading to the tower.",
          "nextNodeId": "K02C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Turn aside to sound chapel bells between the marsh and the hall.",
          "failTitle": "The Country Startles Itself",
          "failText": "The bells send wardens and reeves racing in all directions at once. By the time you reach the hill, the real trail has been smothered under everyone else's fear.",
          "death": false
        }
      ]
    },
    {
      "id": "K01C",
      "turn": 1,
      "title": "The Wrong Fire - Market Smoke",
      "narrative": [
        "The market at Oakenhurst had hardly begun when heads tipped upward together and talk thinned to a hush. Far off beyond the wet black line of Elderwood, a plume leaned from Widow's Pike and broke apart in the wind like a bad omen.",
        "By the time you reached the stable yard, the reeves were arguing over whether to shut the road and ring the chapel bell. Hester Vale arrived from the west with three mud-spattered riders and a face set hard enough to quiet them without a word.",
        "She told you the tower should have answered only on the duke's order or at sight of a real border host. Neither was true, which left theft, coercion, or treachery, and none of those would wait politely for noon."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Order the market gates barred and wait for Oakenhurst to muster men.",
          "failTitle": "The Gate Closed on Rumor",
          "failText": "Hours vanish in argument while the false signal does its real work elsewhere. When mounted men finally move, they are chasing an absence across cold hills.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave the market shouting to itself and cut straight for Widow's Pike by the hill path.",
          "nextNodeId": "K02B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the reeves and merchants first, then ride once the rumors have settled a little.",
          "nextNodeId": "K02C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K02A",
      "turn": 2,
      "title": "Widow's Pike - Fresh Signs",
      "narrative": [
        "Widow's Pike stood bare against a pale sky, the basin on its crown still warm though the fire was long gone. The tower door showed no splintering, which meant the men who entered had either been trusted or had come with the right sort of keys.",
        "You found the keeper's iron hook lying neatly beside the steps, not dropped in struggle but placed where another careful eye would notice it. In the ash sat fresh resin cut with lamp oil, a bright quick-burning mix better suited to a short false blaze than a true warning fire.",
        "Thorne lowered his head near the back wall, and there the wet grass told the rest. Three shod horses had waited under the lee, one heavy, one light, and one that dragged a pack with slatted wood across the ground."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the tower room and then ride to Stag's Rest with what you have.",
          "nextNodeId": "K03B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Light the basin again so nearby wardens know you have found trouble.",
          "failTitle": "The Second False Fire",
          "failText": "Your answering blaze sends men scrambling in every wrong direction. The hidden riders slip away under the confusion they wanted all along.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the lee-side tracks at once, then circle to Stag's Rest before the rain closes them.",
          "nextNodeId": "K03A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K02B",
      "turn": 2,
      "title": "Widow's Pike - Keeper in Hiding",
      "narrative": [
        "On Widow's Pike the basin was cold, but the little turf shed behind the tower held a groaning man with his wrists cut raw by rope. Old Halwen, the keeper, had hidden under a feed cloak after his attackers struck him and bound him like a bundle of reeds.",
        "He remembered little clearly beyond the taste of blood and the sound of one man naming other towers as if reading a prayer: Red Tor, Crowsglass, King's Lantern. That was enough to set your thoughts turning in a darker shape than simple robbery.",
        "Halwen also swore the leader knew the signal room well enough to speak of shutter weights and oil measures without looking. A stranger might seize a beacon, but only a trained hand would use it so briefly and leave so little waste behind."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ride straight for Stag's Rest and press Brother Cerdic to read Halwen's names against the old records.",
          "nextNodeId": "K03A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Halwen down to safety before you seek the next clue.",
          "nextNodeId": "K03C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Halwen and gallop blindly for Red Tor on the instant.",
          "failTitle": "A Trail Chosen in Haste",
          "failText": "You ride after the loudest clue and lose the living witness who held the pattern together. By nightfall the enemy has gained two towers for the price of one.",
          "death": false
        }
      ]
    },
    {
      "id": "K02C",
      "turn": 2,
      "title": "Widow's Pike - Cold Stones",
      "narrative": [
        "Rain reached the hill before you did, washing the crown of Widow's Pike clean of all but the thickest signs. The basin had been scraped to iron, the lamp cask was gone, and the keeper was nowhere in sight.",
        "As you crossed the yard a shaft struck the parapet and split, close enough to spray your cheek with wet splinters. Someone had lingered on the scree below to cover the withdrawal, and the shot told you plainly that the work here mattered.",
        "You found only one useful thing before the weather took even that: a tally sliver stamped with a tiny cut crown, the mark once used on beacon stores from the ducal armory. Whoever had moved first through this tower had not been raw bandits."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge straight down the open scree after the hidden bowman.",
          "failTitle": "Stone and Arrow",
          "failText": "The slope gives you no cover and no second chance. A shaft or a fall leaves you broken on the hill while the signal plot runs on without you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Slip down by the gorse, mark where the bowman fled, and carry the tally to Stag's Rest.",
          "nextNodeId": "K03B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Abandon the hill and ride to the chapel with only the stamped sliver.",
          "nextNodeId": "K03C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K03A",
      "turn": 3,
      "title": "Stag's Rest - Reading the Pattern",
      "narrative": [
        "Stag's Rest chapel crouched beneath yews older than any lordship in Brackenwald, its bell mute in the wet air while Brother Cerdic spread signal rolls across the altar rail. Warden Maelin Rusk arrived not long after you, bringing a second scrap of track from the east road and a face that had already put the matter together.",
        "Cerdic matched Halwen's names and your signs against the tower logs with a speed that belied his bent shoulders. Three false fires in six weeks, all brief, all on nights with low cloud, all placed to pull riders off the roads without stirring a full levy.",
        "Red Tor lay next in the chain and nearest the charcoal road that ran toward the Gray foothills. If a man meant to rehearse the beacons rather than merely light one, he would need oil, shutters, spare slats, and men who trusted him enough to climb where a fall would kill them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the chapel road to Red Tor with Maelin and lose no more daylight.",
          "nextNodeId": "K04B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Maelin alone while you wait for fuller reports from Oakenhurst.",
          "failTitle": "The Hour Given Away",
          "failText": "By the time fuller reports come, Red Tor is already stripped and the trail has split beyond easy reading. Caution becomes the very gift your enemy needed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave Maelin to warn the lower farms and ride the shorter charcoal track to Red Tor at once.",
          "nextNodeId": "K04A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K03B",
      "turn": 3,
      "title": "Stag's Rest - Half a Pattern",
      "narrative": [
        "Brother Cerdic listened to your account with one hand pressed against the old signal ledger, as if steadying the book might steady the day. Maelin reached the chapel a little later with news of unfamiliar mules seen north of Red Tor and no good reason for them to be there.",
        "Taken separately, each sign might have passed for theft, private trade, or a rough joke made in bad taste. Laid together, they made something colder: a man testing whether Brackenwald still trusted its own towers enough to obey them without question.",
        "Cerdic could not swear which tower would be touched next, but Red Tor stood out in every likely reading. It watched the road toward Oakenhurst and the shoulder path that climbed into the Gray Mountains, a useful height for any hand that wanted to shape traffic without being seen."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ride for Red Tor before the next basin can be primed.",
          "nextNodeId": "K04A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle first through the farms below Red Tor and ask what has passed there.",
          "nextNodeId": "K04C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stay and search the chapel records for the rest of the morning.",
          "failTitle": "Pages Instead of Footprints",
          "failText": "The records yield history, but no living trail. When you finally mount, the men you seek are already working under another sky.",
          "death": false
        }
      ]
    },
    {
      "id": "K03C",
      "turn": 3,
      "title": "Stag's Rest - Guesswork and Rain",
      "narrative": [
        "The chapel smelled of wet wool and old wax, and Brother Cerdic seemed more troubled by what he could not prove than by what he could. Maelin was somewhere on a northern errand and had not yet returned, which left the table full of maps and only half enough certainty.",
        "Cerdic studied the stamped tally, then stared a long while at King's Lantern written in a faded column from the last border war. He said the mark had once belonged to signal stores overseen by a young officer who knew every basin from Elderwood to Stonewake.",
        "Names came hard after so many years, but one finally surfaced: Ser Garran Vey, dismissed after peace for debts and quarrelsome pride. Whether that memory was useful or merely a ghost from an old ledger, Red Tor remained the likeliest place where the trail might thicken."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride directly for King's Lantern on nothing but Cerdic's old memory.",
          "failTitle": "The Distant Guess",
          "failText": "The mountain road devours the day, and meanwhile the nearer towers fall into enemy hands. A guess stretched too far becomes blindness.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take Cerdic's memory seriously, but test it first by hunting the trail at Red Tor.",
          "nextNodeId": "K04B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride for Red Tor with only the stamped tally and the old name in mind.",
          "nextNodeId": "K04C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K04A",
      "turn": 4,
      "title": "Red Tor - Hidden Cache",
      "narrative": [
        "Red Tor rose out of the pines like a black tooth, and from halfway up you saw the place had already been worked by practiced hands. A tarp of pitch-dark sailcloth hid a niche under the rocks where two spare shutter slats, a small oil cask, and a coil of signal rope waited ready.",
        "None of it belonged to any lawful keeper's store, and all of it had been packed for quick loading. A mule had been led in carefully, its hooves wrapped in sacking, but one careless scrape on stone showed the men carrying this gear were moving south and upward, not back toward the low farms.",
        "From the ridge you caught a glimpse of smoke lower down, not from a beacon but from charcoal pits on the old burners' road. If Vey or whoever led these men was feeding the tower chain by hidden stages, the road beneath Red Tor was his throat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hide the cache, then go down to question the charcoal burners.",
          "nextNodeId": "K05B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait beside the cache in hopes the carriers return before dark.",
          "failTitle": "Stillness on the Tor",
          "failText": "No one comes back before night, and the road below fills with too many passing shadows to sort. The plot keeps moving while you crouch over its cast-off tools.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take one shutter slat for proof and ride straight down to the charcoal road while the tracks are sharp.",
          "nextNodeId": "K05A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K04B",
      "turn": 4,
      "title": "Red Tor - Dusk on the Slope",
      "narrative": [
        "By the time you gained Red Tor the light had gone coppery and long, and every sound below carried strangely in the damp air. The basin showed signs of recent handling, yet nothing useful remained in the tower room beyond a smear of resin on the lip and a cut thong where the keeper had tied his keys.",
        "Outside, fresh wagon ruts curved off the shoulder track into the trees instead of descending openly to the farms. Whoever worked here had used the hour before dusk well, clearing the height and trusting the deep wood to hide the rest.",
        "Maelin knelt by the ruts and said the wheelbase was narrow, more handcart than farm wagon. That suited stolen signal gear better than grain or timber, and it pointed again toward the charcoal road that served men accustomed to moving loads without questions."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the hidden ruts at once before darkness seals them.",
          "nextNodeId": "K05A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the tower top again and only then take the road below.",
          "nextNodeId": "K05C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride openly down to the nearest hamlet and demand answers from everyone at once.",
          "failTitle": "Too Loud Below the Hill",
          "failText": "Word runs ahead of you, and the wrong men hear it first. By the time you reach the burners' road, watchers are already folding the trail away.",
          "death": false
        }
      ]
    },
    {
      "id": "K04C",
      "turn": 4,
      "title": "Red Tor - Ash and Hoofmarks",
      "narrative": [
        "Red Tor greeted you with ash, not evidence. The niche behind the rocks had been burned out, and the basin above wore a crust of soot that told you someone had cleaned it in haste, then spoiled what remained for any hand that came after.",
        "A single iron shoe nail and a scatter of mule droppings were all the hill yielded before the wind turned mean. Down in the trees, though, you caught the far clank of harness and a brief human call, the sound of men moving loads where they should have been tending fires or flocks.",
        "You had lost the fine detail, but not the road. Whoever had touched Red Tor had fed or hidden his party below it, and if luck held, the charcoal burners had seen more than they dared say aloud."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stay on the tor until full dark to see whether another false fire appears.",
          "failTitle": "Watching the Empty Basin",
          "failText": "No second blaze comes, and the men below use the night to melt into country you can no longer read. Delay turns a spoiled trail into a vanished one.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Descend at once and let Thorne choose the freshest scent of mule and oil.",
          "nextNodeId": "K05B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ride down carefully to the charcoal road and begin asking questions.",
          "nextNodeId": "K05C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K05A",
      "turn": 5,
      "title": "The Charcoal Road - A Captured Tally",
      "narrative": [
        "The charcoal road wound between smoking pits and low turf sheds, every trunk blackened by years of soot. Men looked away when they saw your cloak, but one young carrier broke first when you seized his cart and found tally sticks hidden beneath a sack of meal.",
        "The sticks were cut with intervals, not prices: half bell, one bell, two bells, and beside them the small signs of Red Tor, Crowsglass, and King's Lantern. That was not trade. It was timing.",
        "Under sharper questioning the lad admitted he had hauled oil casks marked for the ducal armory, though he swore he never met the master directly. The men paying him wore no badge, but one had a scar across the chin and spoke of an old captain as if the title still mattered."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the tally sticks to Greywash Mill and place them before Captain Hester.",
          "nextNodeId": "K06B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Beat the boy for the master's full name and waste the road on fear.",
          "failTitle": "The Wrong Kind of Pressure",
          "failText": "The boy bolts in panic and the burners close against you like shutters in a gale. What might have been given in fear of law is buried in fear of you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the boy under guard and ride for Greywash Mill with the tally sticks and armory marks.",
          "nextNodeId": "K06A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K05B",
      "turn": 5,
      "title": "The Charcoal Road - Unwilling Witnesses",
      "narrative": [
        "The burners on the road pretended deafness until Maelin held up the shutter slat and named the duke aloud. Then an old charcoal master spat into the ash and said men in half-remembered livery had passed at dawn with a fine bay horse and two wrapped mules.",
        "He had taken them for discharged soldiers working private guard, right up until one of them asked how quickly sound carried from Red Tor to the mill flats. That question chilled him enough to remember every face thereafter.",
        "The old man could not name the leader, but he pointed you toward Greywash Mill, where the convoy road narrowed and where Captain Hester had been seen searching for the grain carts turned by the first false fire. Whatever this plot was, it had begun to touch the duke's roads in earnest."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ride hard to Greywash Mill before Hester loses the same trail.",
          "nextNodeId": "K06A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question every burner along the road before you move on.",
          "nextNodeId": "K06C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the old man's tale and hunt the bay horse into the forest alone.",
          "failTitle": "A Track Too Thin",
          "failText": "The lone horse leads you into miles of broken ground and nowhere else. When you return to the road, the better clue and the better hour are both gone.",
          "death": false
        }
      ]
    },
    {
      "id": "K05C",
      "turn": 5,
      "title": "The Charcoal Road - Hired Blades",
      "narrative": [
        "The ambush came where the road pinched between spoil mounds, three hired blades stepping out with cudgels while an archer loosed from the brush. They fought like men promised silver, not vengeance, and that told you they served a design larger than the road itself.",
        "When the last of them fled, one dropped a leather wallet slick with rain and soot. Inside lay a scrap listing oil measures beside tower names, with a fourth bell marked heavily next to King's Lantern.",
        "That single note made the day narrower and the stakes greater. If King's Lantern mattered, then the business on Widow's Pike and Red Tor was no local prank, but the opening of something aimed toward the Gray Mountain pass and the roads Duke Aldric trusted most."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the fleeing archer into the pits and leave the written scrap unread.",
          "failTitle": "The Vanishing Man",
          "failText": "The archer knows the ash hollows better than you and leads you nowhere. By the time you turn back, the real clue lies soaked and lost in the mud.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the scrap and the dropped wallet to Greywash Mill at once.",
          "nextNodeId": "K06B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the road for more attackers before riding on.",
          "nextNodeId": "K06C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K06A",
      "turn": 6,
      "title": "Greywash Mill - Hester Listens",
      "narrative": [
        "Greywash Mill stood loud with wheel water and louder with anger. Captain Hester Vale had half the turned grain convoy penned in the yard, three wounded men on benches, and not enough soldiers to guard road, mill, and riverbank all at once.",
        "She read the tally sticks without blinking, then looked up with the sharp stillness of a commander who finally sees the whole board. Duke Aldric was due back from a river inspection and onward to Oakenhurst harvest court within two days. A false call on the mountain road could strip his escort to the bone.",
        "Hester trusted hard evidence and harder people, and for the first time that morning you gave her both. She sent runners for Maelin and agreed to split her strength, but only if you kept on the men moving the signal gear instead of waiting behind walls."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Hester to warn Oakenhurst while you search the quarry road.",
          "nextNodeId": "K07B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Urge Hester to pull every road guard back to the mill and wait.",
          "failTitle": "The Roads Left Open",
          "failText": "Your caution gathers soldiers in one safe place and hands the rest of Brackenwald to the men shaping the beacon chain. Vey loses nothing and learns much.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ride with Hester to the old lime quarry where the burners say the gear was stored.",
          "nextNodeId": "K07A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K06B",
      "turn": 6,
      "title": "Greywash Mill - Proof and Doubt",
      "narrative": [
        "Hester listened, but the mill yard was already full of half-truths and frightened men, and she had no leisure for elegant deductions. Two convoy guards swore they had seen lantern shutters flashing from Red Tor before dawn, while a third insisted it was marsh light and rain.",
        "The scrap from the road and the talk of stolen armory oil were enough to hold her where she stood, though not enough to move all her people. Duke Aldric's journey made every rumor more dangerous, because any wrong response would be measured in lives and road miles.",
        "In the end she gave you six men for an hour and no more, with orders to prove the larger design or come back empty. It was not trust, but it was usable."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take Hester's men straight to the old lime quarry and search it before the trail cools.",
          "nextNodeId": "K07A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Spend the hour questioning convoy guards instead of pressing on.",
          "nextNodeId": "K07C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Hester of slowness and ride off without her help.",
          "failTitle": "An Ally Thrown Away",
          "failText": "Pride costs you the one commander able to move men quickly when the truth comes clear. Later, you will need forces you never bothered to keep.",
          "death": false
        }
      ]
    },
    {
      "id": "K06C",
      "turn": 6,
      "title": "Greywash Mill - Lost Time",
      "narrative": [
        "By the time you reached Greywash Mill the place had already paid for the morning's confusion. One cart smoldered in the yard, a wounded mule kicked in panic near the wheel house, and Hester Vale was giving orders with the clipped fury of someone forced to choose what she could not save.",
        "She heard you out, yet every word you brought seemed to arrive one step behind the enemy's work. Too many roads needed watching, too many frightened folk wanted guarding, and Duke Aldric's approach to Oakenhurst made every captain in the district wary of thinning his escort.",
        "Still, the mention of King's Lantern and signal stores pulled her eyes to the mountain map nailed in the mill office. She told you of an abandoned lime quarry on the old service road, once used to keep beacon gear dry in winter, and said that if men were nesting anywhere between towers, it would be there."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stay at the mill to help settle convoy quarrels and wounded men.",
          "failTitle": "Pinned to the Yard",
          "failText": "The work is worthy, but not the work that matters most. While you bind small hurts, the larger wound in the beacon chain widens beyond easy closing.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ride for the old lime quarry with Hester's map and no wasted speech.",
          "nextNodeId": "K07B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle the mill grounds for more clues before taking the quarry road.",
          "nextNodeId": "K07C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K07A",
      "turn": 7,
      "title": "The Lime Quarry - Vey's Ledger",
      "narrative": [
        "The old lime quarry lay white and hollow under the trees, its pits half full of rain and nettles. In the driest shed you found exactly what a lawful beacon tower would keep and no outlaw camp ordinarily would: spare brazier hoops, sealed oil jars, shutter hinges wrapped in waxed cloth, and coils of signal cord.",
        "A ledger sat under a stone as if its owner meant to return within the hour. Most of it was written in careful columns of measures and dates, but one margin note fixed the whole affair with a human hand: Vey says one blink is enough if cloud lies low.",
        "Ser Garran Vey, then, not a rumor from Cerdic's memory but a living captain at work. The later pages listed test nights against tower names and ended with King's Lantern underlined twice, beside the words fourth bell and household road."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the ledger to Hester and plan around what you now know.",
          "nextNodeId": "K08B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait in the quarry to spring on Vey when he returns.",
          "failTitle": "Empty Shadows in the Pit",
          "failText": "Vey is too disciplined to walk back into a watched cache, and dusk in the quarry belongs to every hidden arrow. Your trap closes on nothing.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Memorize the key pages, take the ledger, and ride before Vey learns his store has been found.",
          "nextNodeId": "K08A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K07B",
      "turn": 7,
      "title": "The Lime Quarry - Burned Papers",
      "narrative": [
        "You reached the quarry late enough to smell fresh smoke and nothing else. Someone had burned the office papers in a brazier basket, then stamped the ashes flat with boot heels too tidy for panic.",
        "Even so, char yields what flame cannot wholly eat. A strip of page survived with Red Tor crossed out, Crowsglass marked in the same hand, and the tail of a name ending in -ey.",
        "That and the carefully stored hinges under the shed roof were enough to tell you the quarry had been a working depot for the tower chain. Whoever led it knew exactly what to hide, what to carry, and how little disorder to leave behind."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the surviving strip and the hidden hinges straight to Hester.",
          "nextNodeId": "K08A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the flooded pits for the rest of the papers before moving.",
          "nextNodeId": "K08C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Set the quarry ablaze to deny it to the enemy.",
          "failTitle": "A Beacon for the Wrong Eyes",
          "failText": "The flames call every watcher in the woods and tell them you have found what mattered. Men you might have trailed instead melt neatly away.",
          "death": false
        }
      ]
    },
    {
      "id": "K07C",
      "turn": 7,
      "title": "The Lime Quarry - Fire in the Pit",
      "narrative": [
        "Fire still licked one side of the quarry shed when you arrived, the smoke trapped low by damp air and chalk walls. A drover lay near the cart track with a cracked arm and enough fear left in him to answer before the pain swallowed sense.",
        "He said an old officer had shouted for the priest to be brought up the mountain and for the ledger to be burned. He did not know names until you spoke Vey aloud, and then he flinched as if the sound itself might draw the man back.",
        "By the time the flames were kicked apart, little paper survived. What remained were iron fittings, the reek of armory oil, and one hard fact: Brother Cerdic mattered to this plan almost as much as King's Lantern."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Waste the hour dragging every salvageable fitting from the fire.",
          "failTitle": "Tools Instead of Truth",
          "failText": "You save a handful of iron and lose the living movement of the plot. By the time you ride again, the men ahead have crossed into harder country.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the drover's account and push on before the mountain trail closes.",
          "nextNodeId": "K08B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the burned shed carefully, then ride.",
          "nextNodeId": "K08C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K08A",
      "turn": 8,
      "title": "The Shape of It - The Real Target",
      "narrative": [
        "Hester heard the name Ser Garran Vey and said nothing for several heartbeats. When she did speak, it was to tell you Vey had once drilled half the beacon keepers from Elderwood to Stonewake and had never forgiven Duke Aldric for dismissing him after peace made his office smaller than his pride.",
        "With the ledger spread between you, the design came clean. The false fires were rehearsals, each one meant to prove which roads emptied fastest, which captains overreacted, and how long it took for Oakenhurst to answer a mountain call.",
        "King's Lantern overlooked Stonewake Causeway, the narrow bend Duke Aldric would use when he came back from harvest court. If Vey lit a false border distress there at fourth bell, Hester's nearest men would race uphill, the duke's household guard would be stranded thin on the road below, and the ambush would strike at exactly the moment Brackenwald trusted its own signals most."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Hester to spread the warning while you continue after Vey.",
          "nextNodeId": "K09B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight for Duke Aldric and abandon the tower trail.",
          "failTitle": "The Road Saved, the Chain Lost",
          "failText": "You might reach the duke, but the beacon chain stays in Vey's hands and the countryside remains blind. One danger is postponed only to ripen into the next.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Split the work: let Hester warn Oakenhurst while you and Maelin chase Vey toward Crowsglass.",
          "nextNodeId": "K09A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K08B",
      "turn": 8,
      "title": "The Shape of It - A Narrow Guess",
      "narrative": [
        "You had enough scraps by then to see where the road bent, if not every stone upon it. Vey, whether or not he was indeed the old signal captain, was not stealing lamp oil for coin. He was teaching the beacon chain to lie.",
        "Hester marked King's Lantern with her thumb and said that Duke Aldric's route after harvest court would bring him near Stonewake by late afternoon in two days. That made fourth bell more than a note on paper. It made a blade with an appointed hour.",
        "Yet the ledger strip did not show how many men Vey held or whether the priest had already told him the inner workings of the final tower. You knew the target. You did not yet know whether you were racing one band, or a whole web of small ones."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Trust the target and ride toward Crowsglass before Vey can close the next link.",
          "nextNodeId": "K09A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Spend time reckoning how many men Vey may command before you move.",
          "nextNodeId": "K09C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume the target is Oakenhurst itself and turn all effort toward the town gates.",
          "failTitle": "Walls Against the Wrong Blow",
          "failText": "Oakenhurst braces for a siege that never comes while the real stroke gathers above the causeway. Vey could not have asked for a kinder misunderstanding.",
          "death": false
        }
      ]
    },
    {
      "id": "K08C",
      "turn": 8,
      "title": "The Shape of It - Too Much Hidden",
      "narrative": [
        "The day's clues had weight, but not full shape. A dismissed officer, stolen signal gear, a priest hauled uphill, and King's Lantern named more than once: enough to frighten any careful mind, not enough to command a whole district without risking mockery or worse.",
        "Hester stared at the mountain map so long that the mill wheel seemed to turn around her silence. At last she said only this: if King's Lantern fell to wrong hands on the day Duke Aldric rode home, even a small band in the right place could make a lord look suddenly mortal.",
        "You did not yet know the precise snare, but you knew where the web tightened. Whatever answers remained would lie between Crowsglass, the upper service tracks, and the old approaches to King's Lantern."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stay at the mill until every detail is certain.",
          "failTitle": "Certainty Bought Too Dear",
          "failText": "Complete certainty never comes, and the hour for acting passes while you wait to feel safer than the day allows.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move now toward Crowsglass and trust the mountain to reveal the rest.",
          "nextNodeId": "K09B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the slower road and gather what fragments you can on the way.",
          "nextNodeId": "K09C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K09A",
      "turn": 9,
      "title": "Split Riders - A Clean Warning",
      "narrative": [
        "Maelin rode east beneath the pines with Hester's sealed warning tucked inside her jerkin, taking the forest cut that would bring her to Oakenhurst faster than any road rider. You and Hester turned north on the stonier track, aiming for Crowsglass before Vey's men could touch it cleanly.",
        "The weather held low and colorless, good for concealment and bad for long sight. Twice you found where a small mounted party had crossed the road recently, always keeping to broken ground, always favoring routes that linked tower to tower rather than village to village.",
        "That confirmed what the ledger had already whispered. Vey was thinking like a signal captain still, measuring country not by lordship or tax, but by lines of sight, climbing time, and how quickly fear carried when lit from above."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep pace with Hester on the road to Crowsglass.",
          "nextNodeId": "K10B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call Maelin back so no warning leaves your own sight.",
          "failTitle": "The Message Unsent",
          "failText": "Without Maelin's ride, Oakenhurst learns too late that the beacons are compromised. Your need to control every strand breaks the one that might have saved the whole web.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave Hester a short escort and cut ahead to Crowsglass by the hunters' stair.",
          "nextNodeId": "K10A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K09B",
      "turn": 9,
      "title": "Split Riders - A Risky Message",
      "narrative": [
        "Hester's clerk scratched a warning on damp parchment while you watched the ink struggle against the weather. It would reach Oakenhurst if the courier held nerve and horse, but you knew even then that a message born of partial proof rode more slowly through suspicious hands.",
        "So you kept the stronger labor for yourself and turned toward Crowsglass, where the next tower in Vey's sequence might still yield a living trail. Hester remained behind to steady the road guards and gather men who trusted her judgment more than your conjectures.",
        "The arrangement was sound enough for an ordinary problem. This was no ordinary problem. Every split of force left a gap, and Vey had built his whole scheme on knowing exactly which gap a decent captain would leave."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Push Thorne hard over the hunters' stair and try to reach Crowsglass first.",
          "nextNodeId": "K10A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the safer road to Crowsglass and spare the horse.",
          "nextNodeId": "K10C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride back to Stag's Rest for Brother Cerdic before moving on.",
          "failTitle": "The Wrong Return",
          "failText": "Cerdic is no longer where you left him, and the backward ride costs you the lead entirely. By the time you face the mountain again, Vey owns the initiative.",
          "death": false
        }
      ]
    },
    {
      "id": "K09C",
      "turn": 9,
      "title": "Split Riders - Alone on the Road",
      "narrative": [
        "No messenger seemed good enough, no captain free enough, and no road without watchers. In the end you rode alone toward Crowsglass with the uneasy knowledge that warning and pursuit had become the same burden on one pair of shoulders.",
        "Thorne settled into the work without protest, ears forward and breath even, while the countryside narrowed into wet stone and thorn. A lone rider leaves fewer signs than a troop, but he also has no one to send when the trail forks badly.",
        "You felt the cost of every missing ally as the track climbed. Vey wanted his enemies divided between road and tower, fear and proof. Alone, you began to understand how well he had chosen the ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Turn back and try to raise a village levy to follow you.",
          "failTitle": "Too Many Boots",
          "failText": "A levy cannot move quietly or quickly on mountain tracks, and half the men drift home by dusk. Vey hears of your approach long before you near him.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Stay alone, cut across the heath, and reach Crowsglass by the most secret line.",
          "nextNodeId": "K10B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep to the road and trust speed over secrecy.",
          "nextNodeId": "K10C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K10A",
      "turn": 10,
      "title": "Crowsglass - Blood on the Steps",
      "narrative": [
        "You gained Crowsglass ahead of the road party and found the place in the raw aftermath of a fight. Maelin sat against the tower wall with a bandaged shoulder and a face gone pale under the freckles, while the keeper's room had been turned over with brisk, efficient malice.",
        "She said Vey's men had arrived minutes before dawn with the right challenge words for the tower and knives for the keeper when he hesitated. They had taken token rings, two horn mouthpieces, and Brother Cerdic himself, lifted from the chapel on their way upslope.",
        "The reversal bit deep because it proved Vey was not merely reacting to pursuit. He had been shaping the field ahead of you, pruning witnesses, seizing knowledge, and keeping one step between his own design and anyone who might read it in time."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Bind Maelin, leave her with the keeper, and follow Vey by the upper road.",
          "nextNodeId": "K11B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force Maelin back into the saddle despite the wound.",
          "failTitle": "A Friend Broken Further",
          "failText": "Maelin collapses on the climb and the delay worsens everything. In trying to keep every blade with you, you lose both time and trust.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take Maelin's report, send her safely down, and cut after Vey through the dry aqueduct she marked.",
          "nextNodeId": "K11A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K10B",
      "turn": 10,
      "title": "Crowsglass - The Broken Tower",
      "narrative": [
        "Crowsglass stood open when you reached it, which was worse than finding it barred. The tower keeper had been stripped of keys and left senseless under a cloak, the signal room searched so neatly that only a captain's eye would see the missing pieces.",
        "Hester arrived close behind and grimly read the scene the same way you did. Someone had known exactly what to take: horn fittings, token rings, spare lamp wick, and the small coded tablet used to mark lawful calls on bad-weather days.",
        "There was blood on the outer stair, but not enough to tell whose. Maelin was gone, Brother Cerdic was nowhere to be found, and the men who had done the work had left the narrowest of mountain trails leading toward High Fell."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the narrow trail at once before the blood dries.",
          "nextNodeId": "K11A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the tower for hidden papers and lose precious light.",
          "nextNodeId": "K11C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Hester ahead while you linger to question the senseless keeper.",
          "failTitle": "The Split Too Far",
          "failText": "Hester rides into ground she does not yet know, and you arrive later with answers no longer worth their price. Vey defeats you by fractions of an hour.",
          "death": false
        }
      ]
    },
    {
      "id": "K10C",
      "turn": 10,
      "title": "Crowsglass - One Step Behind",
      "narrative": [
        "By the time you reached Crowsglass the rain had thinned to mist, which made the quiet there feel deliberate. The keeper lay dead beneath his own mantle, not butchered, but strangled quickly and left with the decency of a man killed by soldiers who still remembered rules.",
        "Whatever pity remained in Vey's company had not slowed them. The signal room was emptied of every small thing that made lawful use possible, and the floor bore marks of a dragged body light enough to be a priest and awkward enough to be a struggling one.",
        "You were no longer chasing rumors through tower country. You were behind a disciplined enemy column carrying codes, tokens, and a captive who understood King's Lantern better than most living men."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride down to Oakenhurst at once and abandon the mountain trail.",
          "failTitle": "The Trail Relinquished",
          "failText": "Oakenhurst gains one frightened witness, but Vey keeps the heights and the priest besides. When the real stroke falls, you no longer know from where.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the drag marks and mountain spoor without delay.",
          "nextNodeId": "K11B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the dead keeper and tower floor before you move.",
          "nextNodeId": "K11C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K11A",
      "turn": 11,
      "title": "High Fell Stair - The Dry Aqueduct",
      "narrative": [
        "Maelin's mark led you to a dry aqueduct cut into the hillside during some forgotten winter works, a narrow stone gutter roofed by thorn and broken slate. It let a small party move below the sight lines of both road and tower, which explained how Vey kept appearing where no village had seen him pass.",
        "Inside you found boot scraps, lamp soot, and a broken prayer bead from Brother Cerdic's belt. More troubling still, at a fork in the channel the prints divided cleanly, one group climbing toward King's Lantern and another angling down toward the hidden ledges above Stonewake Causeway.",
        "There was the full structure at last: tower and road, signal and ambush, each wing needing the other. Vey did not mean merely to light a false call. He meant to pull defenders uphill while a second hand cut Duke Aldric's escort below."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay on the upper branch and press toward the tower.",
          "nextNodeId": "K12B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the lower branch alone and leave King's Lantern untended.",
          "failTitle": "The Road Chosen Too Soon",
          "failText": "The ledges show signs of ambush, but the tower above goes unchallenged. Without the beacon itself, every warning you give comes crippled and late.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the prayer bead to judge Cerdic's path and take the branch that may free him first.",
          "nextNodeId": "K12A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K11B",
      "turn": 11,
      "title": "High Fell Stair - Tracks in Rain",
      "narrative": [
        "High Fell stair was little more than a goat path gouged into wet rock, and the rain had made a liar of every shallow print. Even so, enough remained to show a split column: three or four men light of foot toward the upper works, more than that skirting the ledges above the causeway.",
        "That division troubled you more than numbers. A common band breaks when it divides in mountain weather. A drilled one becomes harder to catch because each half knows its share of the plan.",
        "Hester urged the road threat while your own instincts tugged toward the tower and Brother Cerdic. Whatever choice followed, it could not be made as if these were separate dangers. Vey had bound them together from the beginning."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Climb for the upper works and try to save Cerdic before Vey wrings more from him.",
          "nextNodeId": "K12A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow the lower tracks above the causeway and hope the tower can wait.",
          "nextNodeId": "K12C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pause long enough to bring Hester's whole party up the stair in formation.",
          "failTitle": "Men Too Many for the Path",
          "failText": "The column bogs down on the wet climb and sends stones clattering through the fog. Every hidden man above learns exactly where you are.",
          "death": false
        }
      ]
    },
    {
      "id": "K11C",
      "turn": 11,
      "title": "High Fell Stair - Rearguard",
      "narrative": [
        "Vey's rearguard found you before the main trail did, two archers and a spearman using the bends of the stair as if they had walked it all their lives. The fight cost little blood and much time, which may have been exactly the bargain they were sent to make.",
        "When the last man fled, the path above had grown empty and echoing. You found only a strip of priest's cloth snagged on thorn and faint signs that more boots had crossed toward the mountain than toward the road below.",
        "That did not clear the matter, but it narrowed it. Whatever awaited at Stonewake would not ripen unless King's Lantern first told the lie Vey needed. The tower remained the heart, even if the knife would strike lower."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue the rearguard into the fog rather than regain the main trail.",
          "failTitle": "Following the Tail",
          "failText": "The fleeing men lead you across rock and cloud until the mountain itself becomes your enemy. When you recover your bearings, the real fight has already shifted beyond you.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave the dead and climb straight for the upper works.",
          "nextNodeId": "K12B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the fallen for clues before pressing on.",
          "nextNodeId": "K12C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K12A",
      "turn": 12,
      "title": "Shepherd's Bothy - Cerdic Freed",
      "narrative": [
        "The shepherd's bothy stood under a bent rowan at the mouth of the upper track, its door tied shut with signal cord instead of common rope. Inside, Brother Cerdic sat bruised but awake, abandoned with one guard who had grown careless in the weather and paid for it.",
        "Cerdic had yielded little beyond what Vey already knew from old service: where King's Lantern kept its main basin and where the road below could be seen. The thing Vey still lacked, and why the priest still lived, was the counter wheel in the service stair, the one device that could shutter a false call and send a lawful all-clear through the cloud.",
        "Cerdic also told you the tower had a lower cistern passage known only to keepers, too narrow for many men and too damp for fire. If you meant to strike before fourth bell, that passage was worth more than ten swords on the open stair."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Cerdic with you and make for Pilgrim's Gate to join Hester.",
          "nextNodeId": "K13B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Cerdic down the mountain alone while you hurry on.",
          "failTitle": "The Priest Lost Again",
          "failText": "A lone priest on storm paths is easy prey for any watcher Vey left behind. Knowledge you fought to recover vanishes into the weather a second time.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the cistern secret and Cerdic's knowledge to shape a real plan at Pilgrim's Gate.",
          "nextNodeId": "K13A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K12B",
      "turn": 12,
      "title": "Shepherd's Bothy - Notes in Ash",
      "narrative": [
        "You reached the bothy after the men had gone, but Brother Cerdic had not left empty-handed in defeat. Scratched into the hearth stone with a nail were three words and a crude drawing: cistern below stair.",
        "The rest of the room had been tossed hard enough to show Vey's frustration. He had found some answers, not all of them, and that was the first clean mercy the mountain had granted you since dawn.",
        "Under the bedding you also found a small brass wheel tooth wrapped in priest's cloth. Cerdic would not have hidden a worthless thing. Whatever mechanism it belonged to, it mattered enough to deny Vey a full command of King's Lantern."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Pocket the brass tooth and ride for Pilgrim's Gate before Hester commits her men blind.",
          "nextNodeId": "K13A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Spend more time searching the bothy for what else Cerdic may have hidden.",
          "nextNodeId": "K13C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the drag marks onward and ignore the hearth message.",
          "failTitle": "The Warning Overlooked",
          "failText": "You press on without understanding the tower's weakness, and later, when the false fire rises, you discover too late the one means of mastering it was left unread in ash.",
          "death": false
        }
      ]
    },
    {
      "id": "K12C",
      "turn": 12,
      "title": "Shepherd's Bothy - The Missing Priest",
      "narrative": [
        "The bothy had been gutted of anything easy to carry, and the storm had damped every scent before Thorne could sort it. One page, torn from an old chapel notebook, lay trapped under the threshold stone with only part of a sentence intact: below ... wheel ... not above.",
        "It was not much, yet it sang in the mind once King's Lantern and Cerdic were named beside it. Vey wanted the top of the tower because men think towers begin at their crowns. Cerdic was pointing you to what lay under the obvious path.",
        "From the ridge beyond the bothy you could see Pilgrim's Gate ruin standing above the valley like a broken tooth. Hester had promised to rally there if the mountain divided you, and by then you needed more than guesses in your own head."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ignore Pilgrim's Gate and charge straight for King's Lantern alone.",
          "failTitle": "A Lone Blade Against a Tower",
          "failText": "Courage carries you to the gate and no farther. Vey's men hold the approaches too firmly for one ranger to break them head-on.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the half page to Pilgrim's Gate and read it against the mountain with Hester.",
          "nextNodeId": "K13B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle warily toward Pilgrim's Gate, searching for signs as you go.",
          "nextNodeId": "K13C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K13A",
      "turn": 13,
      "title": "Pilgrim's Gate - A Working Plan",
      "narrative": [
        "Pilgrim's Gate was only three standing walls and a chapel arch open to the rain, but Hester made it a command post by the way she stood in it. Maelin, pale yet stubborn, had rejoined with four wardens from the forest cut, and Brother Cerdic laid the brass tooth against a sketched tower plan until the whole business finally fit.",
        "King's Lantern had three vulnerable points: the lower cistern grate, the service stair with its counter wheel, and the lantern chamber where Vey would need a clear hand on the basin at fourth bell. Hester could not storm all three without leaving Stonewake naked, so the plan turned on speed and precision rather than numbers.",
        "She would hold the ledges above the causeway with her best road men. You, Maelin, and Cerdic would take the cistern path, seize the service stair, and either keep the basin dark or send the lawful all-clear first. For the first time since Widow's Pike, the day felt as if it might be bent back."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep to the agreed plan and move on King's Lantern at once.",
          "nextNodeId": "K14B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Mass all forces for a single assault up the main stair.",
          "failTitle": "The Obvious Assault",
          "failText": "Vey expects the main stair and has shaped it accordingly. Your attack breaks under height, stone, and men who prepared for blunt courage.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Tighten the plan further by using the cistern secret and a silent approach under the storm.",
          "nextNodeId": "K14A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K13B",
      "turn": 13,
      "title": "Pilgrim's Gate - Fewer Hands",
      "narrative": [
        "Hester had fewer men than she wanted and more burdens than any clean strategy allowed. Maelin could hold a bow but not a shield arm, Brother Cerdic was winded from captivity, and the valley below still expected the duke's road to remain safe by ordinary means.",
        "Even so, the pieces made enough sense to attempt. Cerdic described the lower cistern, Hester marked where her road men might hide above Stonewake, and you became the narrow bridge between both actions whether you liked the weight of it or not.",
        "A working plan, then, but one with no room for delay and little room for error. If the cistern passage failed or the upper men detected you too early, Hester would be forced to choose between saving the duke below and helping you above."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Trust the cistern approach and move before Vey settles for the night.",
          "nextNodeId": "K14A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take extra time to place every warden exactly, even at the cost of daylight.",
          "nextNodeId": "K14C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Cerdic down the mountain and discard his tower knowledge as too uncertain.",
          "failTitle": "Throwing Away the Key",
          "failText": "Without Cerdic's guidance the inner works become guesswork in stone. Inside a signal tower, guesswork is another name for defeat.",
          "death": false
        }
      ]
    },
    {
      "id": "K13C",
      "turn": 13,
      "title": "Pilgrim's Gate - Thin Trust",
      "narrative": [
        "Pilgrim's Gate gave you shelter from the wind and little else. Hester had only a handful of men, Maelin had not reappeared, and Cerdic's notes were fragments rather than a full design.",
        "Still, Hester was too seasoned to wait for perfection. She fixed two men to the causeway ledges, kept the rest close, and told you the tower must be troubled from within or not at all.",
        "You were tired enough to feel every old bruise beneath your mail, yet the ruin's broken arch framed King's Lantern in the distance like a judgment. Thin trust or not, the next move would either gather the splintered parts of the day or let them fall apart forever."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Refuse to act until Maelin or fuller news arrives.",
          "failTitle": "The Plan That Never Forms",
          "failText": "No fuller news comes in time. By the hour you wanted certainty, Vey is already warming the basin above Stonewake.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take what trust there is and start for King's Lantern before the weather worsens.",
          "nextNodeId": "K14B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Move cautiously toward the tower with too few hands and too much doubt.",
          "nextNodeId": "K14C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K14A",
      "turn": 14,
      "title": "King's Lantern Below - Unseen Approach",
      "narrative": [
        "Night did not fall fully, but the storm made its own darkness as you climbed the shepherd stair beneath King's Lantern. From a cleft in the rock you saw cloaked men in the lower yard, small in number and precise in their labor, carrying oil where ordinary keepers would never move it before the appointed hour.",
        "The tower itself rose from the ridge like a wet black mast. No shouting came from within, no careless laughter, nothing but the sound of chain against iron when the wind dipped low. Vey held disciplined men, and disciplined men could still be surprised.",
        "Cerdic found the cistern grate under thorn and lichen exactly where he swore it would be. It had been checked recently, but not barred from within, which meant Vey trusted secrecy more than absolute security. That trust was the first weakness you had been given all day."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the cistern grate quietly and move as fast as caution allows.",
          "nextNodeId": "K15B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow at the yard guards to begin the fight from outside.",
          "failTitle": "The Tower Awake",
          "failText": "Your shot rouses the whole lower yard before you are inside. Surprise dies at the threshold, and with it your best chance of mastering the signal room.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Slip through the cistern at once and let the storm cover every small sound.",
          "nextNodeId": "K15A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K14B",
      "turn": 14,
      "title": "King's Lantern Below - First Alarm",
      "narrative": [
        "You were close enough to smell hot oil by the time the first alarm truly stirred. A sentry in the lower yard turned at the wrong instant, saw movement where rock should have been empty, and barked a warning that went thin in the wind but far enough.",
        "Steel answered quickly after that, yet the storm still worked partly in your favor. Shapes blurred, torches guttered, and men could hear footsteps without always knowing whose they were.",
        "Cerdic pointed the way to the cistern even while ducking a thrown stone, his courage smaller than a swordsman's and no less real for that. You had lost the full sweetness of surprise, not the passage itself."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Drive for the cistern before the lower yard fully closes around it.",
          "nextNodeId": "K15A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Fight across the yard to the main stair and hope speed makes up the loss.",
          "nextNodeId": "K15C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Fall back to Pilgrim's Gate and wait for a clearer chance.",
          "failTitle": "The Chance Abandoned",
          "failText": "King's Lantern does not grow less dangerous while you wait. Every moment you withdraw is another moment for Vey to lock the tower to his design.",
          "death": false
        }
      ]
    },
    {
      "id": "K14C",
      "turn": 14,
      "title": "King's Lantern Below - The Long Circle",
      "narrative": [
        "The long circle under the cliff cost more than you could spare. By the time you came up near the lower yard, the enemy had already posted lookouts on the outer wall and set a hooded lamp beside the tower door.",
        "You could still hear the storm and the distant wash of Stonewake below, but nearer sounds had changed. Men were moving with settled purpose now, not the restless uncertainty of a camp still arranging itself.",
        "Cerdic's directions led you to the cistern mouth nonetheless, though every step there felt stolen from a clock already running against you. The good ground was gone. Only usable ground remained."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Try to climb the outer wall where the lookouts can see the whole face.",
          "failTitle": "Seen on the Stone",
          "failText": "A shout, a slipping foothold, and the fall decides the matter more quickly than any sword. King's Lantern keeps its secrets while you break beneath it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the cistern despite the late hour and trust speed over perfection.",
          "nextNodeId": "K15B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Skirt the yard and force the main stair before they are fully ready.",
          "nextNodeId": "K15C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K15A",
      "turn": 15,
      "title": "Lower Works - Keeper Unbound",
      "narrative": [
        "The cistern passage stank of old damp and iron, but it carried you into the lower works unseen. In a side cell you found the tower keeper bound beside Maelin's missing pack, alive, furious, and eager enough to curse through the gag before you cut it free.",
        "He told you Vey had climbed to the upper chamber with only his closest men, leaving the lower yard to hired hands and one lieutenant who knew just enough tower work to be dangerous. Better still, the main pitch line had not yet been lit. One knife in the right place could keep the basin starved when the hour came.",
        "You cut that line, armed the keeper with his own cudgel, and sent him to bar the postern from within. For the first time, Vey's careful machine began to lose pieces faster than he expected."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Move up at once, leaving the keeper to steady the lower works.",
          "nextNodeId": "K16B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Free every bound man in the cells before you climb.",
          "failTitle": "Mercy at the Wrong Hour",
          "failText": "The freed captives help, but not fast enough. Noise spreads, locks jam, and the critical minutes bleed away while the basin above is made ready.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the keeper's guidance and go straight for the service stair and counter wheel.",
          "nextNodeId": "K16A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K15B",
      "turn": 15,
      "title": "Lower Works - Steel in the Passage",
      "narrative": [
        "You forced the cistern grate and spilled into the lower works amid shouting from above and below alike. A short brutal struggle in the passage ended with one yard guard dead and another running, which was better than silence but worse than stealth.",
        "Behind a wood bin you found the tower keeper, wrists bloodied yet breathing. He gasped that Vey had sent the priest upward and that the service stair remained open, though not for long.",
        "There was no time to do anything neatly. Every choice now had to be measured against one thing only: whether King's Lantern would speak Vey's lie before you could choke it in the throat."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the keeper's word and drive straight for the service stair.",
          "nextNodeId": "K16A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Fight upward by the broader passage where more men can follow.",
          "nextNodeId": "K16C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send half your strength back to clear the yard before you tackle the tower.",
          "failTitle": "The Battle Divided",
          "failText": "The yard devours men and gives nothing decisive in return. Above, the signal work continues while your strength leaks away in the wrong place.",
          "death": false
        }
      ]
    },
    {
      "id": "K15C",
      "turn": 15,
      "title": "Lower Works - Pitch Already Warm",
      "narrative": [
        "The main stair cost you dearly before it gave anything back. Stones rolled underfoot, narrow turns favored the men above, and hot oil scent drifted downward with a promise you did not care to test.",
        "At the first landing you found no bound keeper, only empty rope ends and a thrown blanket where someone had been kept earlier. That meant the enemy had moved captives or done with them, and neither thought made the climb kinder.",
        "Still, the tower was not yet entirely lost. The smell of warmed pitch told you preparation, not completion. If you reached the right chamber in time, there might still be a handhold left in the machinery of the lie."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the stair headlong before the men above can set themselves.",
          "failTitle": "Broken on the Turn",
          "failText": "The defenders need only one good push on the narrow stair. Steel rings, boots slide, and you vanish into the dark below the landing.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Climb hard but watch every corner, looking for the service passage Cerdic described.",
          "nextNodeId": "K16B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep up the direct climb and trust force to beat the clock.",
          "nextNodeId": "K16C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K16A",
      "turn": 16,
      "title": "Service Stair - The Counter Wheel",
      "narrative": [
        "The service stair lay behind a plain plank door any stranger would have missed in poor light. Cerdic found it by touch more than sight, then led you upward to a cramped chamber where the counter wheel sat behind a brass casing older than Duke Aldric's line.",
        "The missing tooth from the bothy belonged there. When you fitted it back into place the mechanism caught with a tired click, and the shutter rods along the lantern throat answered as if waking from sleep.",
        "That single sound changed the nature of the fight. So long as you held the wheel room, Vey could light pitch above and still fail to show a clean signal beyond the storm. Better yet, a lawful all-clear could be forced through if you reached the bell line in time."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Set Maelin on the wheel and push up toward the lantern chamber.",
          "nextNodeId": "K17B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Test the wheel at once with a full bell stroke before the chamber is secure.",
          "failTitle": "The Premature Signal",
          "failText": "The bell gives your position away to every man in the tower before you hold the rods. Vey closes on you through smoke and iron with surprise now entirely his.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set the wheel, keep silent, and climb toward the bell line and lantern throat together.",
          "nextNodeId": "K17A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K16B",
      "turn": 16,
      "title": "Service Stair - Half the Mechanism",
      "narrative": [
        "You found only part of what Cerdic promised. The service passage existed, but one rod had been removed and the wheel housing cracked open, leaving the mechanism half obedient and half dead.",
        "Even crippled, it could still do useful work. A strong hand on the casing could jam the shutters from full display, or free them just long enough for a broken lawful sign, though not both at once.",
        "It was the sort of ugly compromise hard days offer honest people. You could not command King's Lantern cleanly anymore. You might still keep Vey from doing so."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Jam the damaged mechanism against a false display and climb.",
          "nextNodeId": "K17A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave the half wheel and race straight for the lantern chamber.",
          "nextNodeId": "K17C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Spend precious minutes trying to repair every broken rod.",
          "failTitle": "Mending While the Hour Strikes",
          "failText": "The mechanism yields piece by piece while the clock does not. Above you, the men with fire need far less patience than the men with tools.",
          "death": false
        }
      ]
    },
    {
      "id": "K16C",
      "turn": 16,
      "title": "Service Stair - The Direct Climb",
      "narrative": [
        "No hidden mercy waited in the stair this time, only the direct climb and the hard knowledge that subtlety was nearly spent. Smoke seeped downward in thin threads, and somewhere above, a chain rasped as the lantern shutters were tested by practiced hands.",
        "Cerdic shouted once that the wheel must lie below the chamber, but the answer came too late to act on cleanly. Enemy feet were already hammering on the boards above, choosing violence where craft had begun to fail them.",
        "You kept climbing because there was nothing else left that still counted as action. On such nights, a ranger's trade narrows to breath, footing, steel, and the hope that one bold interruption can still scatter a careful plot."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Turn back now in search of the missing wheel chamber.",
          "failTitle": "The Descent That Ends It",
          "failText": "You abandon the height at the last possible moment and never regain it. By the time you find the hidden door, the false signal has already gone out over Stonewake.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Force the last turns of the stair with all speed and discipline you have left.",
          "nextNodeId": "K17B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep climbing the direct way and brace for a frontal fight.",
          "nextNodeId": "K17C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K17A",
      "turn": 17,
      "title": "Signal Room - The True Fire",
      "narrative": [
        "The signal room opened above you in a wash of smoke and lamp glare, smaller than the stories and more dangerous for it. Through a slit window you saw Stonewake Causeway far below, Duke Aldric's road dim in the storm, a moving thread of pale cloaks and horse heads.",
        "Vey's lieutenant was there with torch in hand, but he had expected obedience from the tower and not resistance rising through its throat. When Maelin set the damaged rods and you cut the man down across the wrist, the prepared blaze faltered and coughed instead of climbing clean.",
        "The bell line hung within reach, the lawful wheel answered below, and the tower had not yet spoken. You stood in the one breath between the making and the breaking of Vey's design."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Seize the bell line first and trust Hester to read an imperfect signal.",
          "nextNodeId": "K18B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pause to question the wounded lieutenant before you act.",
          "failTitle": "Questions Asked at Fourth Bell",
          "failText": "The man spends your time instead of your blade. By the moment you turn back to the lantern throat, fire and hour have already overtaken you.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the torch, bar the lieutenant away, and master both bell line and shutter before Vey arrives.",
          "nextNodeId": "K18A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K17B",
      "turn": 17,
      "title": "Signal Room - Smoke and Shouting",
      "narrative": [
        "You burst into the signal room at the edge of disorder. Smoke rolled low, one shutter banged uselessly in the wind, and two of Vey's men were wrestling the bell rope away from a half-conscious keeper who had found courage too late and paid for it.",
        "Below, through rain and distance, you could see only hints of the causeway and moving lanterns. Hester might already be in place over the road, or she might still be waiting on a sign that would never come cleanly unless you forced it.",
        "The chamber had become a knot rather than a machine. Cut it in the right place and everything below might still unravel in Brackenwald's favor. Strike the wrong knot and all would tighten at once."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Throw yourself at the rope and shutters together, making room for a true signal.",
          "nextNodeId": "K18A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Drive for the nearest torch hand and settle the chamber by steel alone.",
          "nextNodeId": "K18C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Retreat to the stair and try to hold the room from outside.",
          "failTitle": "The Doorway Lost",
          "failText": "The men inside need only one heartbeat of space to light what they prepared. From the threshold you watch the signal room decide against you.",
          "death": true
        }
      ]
    },
    {
      "id": "K17C",
      "turn": 17,
      "title": "Signal Room - Hands at the Brazier",
      "narrative": [
        "The last landing emptied almost straight into the lantern chamber, and there was no room left for finesse. Men grappled around the brazier, one hand on chain, another on torch, the whole upper room shaking with wind that wanted every spark either dead or dangerously alive.",
        "You caught only a glimpse of the causeway before a shoulder slammed you sideways. The duke's column was still on the road, still exposed, and still close enough that a clean false call would drain defenders uphill before reason could catch them.",
        "The fight at the brazier had its own savage clarity. The beacon must not show as Vey intended. Whether you mastered it, spoiled it, or dragged the whole chamber into darkness mattered less than stopping the lie in its proper hour."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick the full oil jar into the brazier to smother it by force.",
          "failTitle": "The Chamber in Flames",
          "failText": "The jar bursts hot and wrong. Fire takes wood, cloth, and men alike, and the tower becomes a death trap before any signal can be trusted again.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Drive for the chain and spoil the display before the flame can rise cleanly.",
          "nextNodeId": "K18B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Fight where you stand and trust sheer force to delay the signal.",
          "nextNodeId": "K18C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K18A",
      "turn": 18,
      "title": "Lantern Gallery - Vey at Bay",
      "narrative": [
        "Ser Garran Vey came into the chamber through a side door with rain on his shoulders and more composure than the hour should have allowed. He looked older than Cerdic's memories and harder than Hester's anger, a man weathered into sharpness by years spent nursing the same grievance.",
        "He glanced once at the damaged setup and understood at once how much of his plan had already slipped. Even then he did not rant. He said Duke Aldric had cast aside the men who kept Brackenwald awake, had trimmed towers, pay, and honor alike, and that a lord who forgets the watch deserves to learn fear from it.",
        "Whatever truth hid inside that bitterness had long since been bent into murder. Vey still had steel in hand, men on the ledges below, and perhaps one remaining chance to light the basin clean enough to pull Hester from the causeway. You had the nearer claim on the room, but not yet the final word."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Break for the bell rope first, even if Vey slips out onto the gallery.",
          "nextNodeId": "K19B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Vey's grievance and bargain with him for Duke Aldric's life.",
          "failTitle": "A Bargain in Bad Faith",
          "failText": "Vey did not build this design to stop on a promise. While you parley, his remaining men seize the chamber and the road below pays the price.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Press him hard, seize the rope, and force the issue before his men below can react.",
          "nextNodeId": "K19A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "K18B",
      "turn": 18,
      "title": "Lantern Gallery - Between Levels",
      "narrative": [
        "Vey stayed maddeningly half seen, slipping between chamber and gallery while his men tried to buy him breaths with their bodies. The tower had become vertical ground now, every landing a small battlefield, every chain and wheel another prize.",
        "From below came the faintest horn, which might have been Hester on the ledges or might have been wind in stone. Uncertainty had always been Vey's ally. He had built the whole plot on making decent captains move before they fully knew why.",
        "You could end his cleverness only by taking one of two things from him: the signal itself or his own freedom of movement. The trouble was that both seemed to require the same shrinking span of time."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Break for the rope and shutters, trusting someone else to hold Vey for a moment.",
          "nextNodeId": "K19A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Pursue Vey onto the gallery and settle the matter blade to blade.",
          "nextNodeId": "K19B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop back to gather every friendly man before acting again.",
          "failTitle": "The Lost Minute",
          "failText": "A single minute is all the tower needed, and it is the one you surrendered. The false call blooms over Stonewake before your strength can mass.",
          "death": false
        }
      ]
    },
    {
      "id": "K18C",
      "turn": 18,
      "title": "Lantern Gallery - Torch in Hand",
      "narrative": [
        "Vey stood on the outer gallery with torch aloft, the storm flattening his cloak against the rails while the drop beyond him went black and sheer. He no longer needed a perfect display. At this distance even a ragged flare might be enough to jerk watchful men uphill.",
        "Below, the causeway was a smudge of moving lights and pale water. Somewhere in that narrow darkness rode Duke Aldric, and somewhere above it waited the ledge party Vey had placed like a knife under a sleeve.",
        "There was no speech left worth having. The gallery had reduced the whole business to feet on wet boards, hand on steel, and who could own the next heartbeat."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Loose an arrow through the storm at Vey's torch hand.",
          "failTitle": "A Shot the Wind Steals",
          "failText": "The gust takes the shaft aside, and the miss gives Vey exactly the breath he needed. The flare leaps before you can close.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Rush the gallery and seize the torch arm before it can rise.",
          "nextNodeId": "K19B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the doorway, trying only to delay what you cannot fully stop.",
          "nextNodeId": "K19C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K19A",
      "turn": 19,
      "title": "The Choice of the Bell - Clean Shot",
      "narrative": [
        "Your charge broke the last neatness out of the chamber. Vey hit the rail hard, the torch went skidding, and Maelin's voice below the floor shouted that the wheel was still holding against a full display.",
        "You had one clean chance now. The bell rope swung within reach, and through the slit window you could just make out movement on the ledges above Stonewake, shapes that might be Hester's hidden men or Vey's ambushers waiting on the call.",
        "Whatever happened in the next breath would not simply win a room. It would decide whether the road below received clear warning, partial warning, or the confusion Vey had labored so patiently to breed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Sound the lawful all-clear first, then finish Vey before he recovers.",
          "nextNodeId": "K20A",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw yourself wholly into killing Vey and forget the road for a moment.",
          "failTitle": "The Wrong Victory",
          "failText": "Vey dies, but the road below never receives the signal it needed. Stonewake becomes a butcher's corridor while you stand over the right corpse at the wrong time.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Drive Vey down, seize rope and shutter together, and send the true signal in one motion.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        }
      ]
    },
    {
      "id": "K19B",
      "turn": 19,
      "title": "The Choice of the Bell - Hard Balance",
      "narrative": [
        "On the gallery Vey gave ground only when the wind itself took some of it from him. He fought with the economy of an old drill master, every cut meant to buy one more step toward the torch and one more moment of uncertainty for the road below.",
        "Inside the chamber the bell rope lashed against the floorboards, close enough to matter and far enough to cost. You could chase the man who built the lie or master the instrument of it, but not perfectly do both in the same heartbeat.",
        "From far below rose a sound like antlers striking wood, Hester's signal if fortune held. She was in place then, or near enough. The question left to you was whether to give her clean truth, rough warning, or merely the chance to fight without it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut across to the bell rope and send warning, leaving Vey to Hester's ambush below.",
          "nextNodeId": "K20A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay on Vey and drive him down the gallery, hoping the tower's half-spoiled signal is enough.",
          "nextNodeId": "K20B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Retreat from the gallery and try to regroup.",
          "failTitle": "The Lost Minute",
          "failText": "A single minute is all the tower needed, and it is the one you surrender. The false call blooms over Stonewake before your strength can form around it.",
          "death": false
        }
      ]
    },
    {
      "id": "K19C",
      "turn": 19,
      "title": "The Choice of the Bell - Broken Timing",
      "narrative": [
        "From the doorway you could do only ugly work. Each time Vey feinted toward the torch you forced him back a pace, but each pace cost ground elsewhere, and the chamber behind you was still not properly yours.",
        "A ragged flare licked once at the basin lip and died under rain. Even that brief ugly light might send men on the ledges into motion, yet it lacked the clean certainty of a true call. Confusion, then, not command, and perhaps that was all Brackenwald could hope from this height now.",
        "You knew the full victory had slipped, but smaller salvations remained. The duke might still be warned by noise and broken light. Hester might still read the mess correctly. Vey himself might still be denied the orderly triumph he had built toward since Widow's Pike."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break off and dive for the stair while Vey keeps the gallery.",
          "failTitle": "The Tower Given Back",
          "failText": "Your retreat hands the height to the one man who understood it best. The flare that follows is messy, but more than enough for the ambush below.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Kick the torch and basin apart, ruin the signal completely, and let the road below sort itself by its own eyes.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the doorway and call whatever warning you can to the road below.",
          "nextNodeId": "K20C",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "K20A",
      "turn": 20,
      "title": "Stonewake Saved - Last Measure",
      "narrative": [
        "The lawful bell note carried strangely through storm, thin at first and then firm as the counter wheel bit where it should. On the ledges above Stonewake, hidden figures moved with sudden purpose, and the answering horn below told you Hester had understood.",
        "Vey, whether wounded or gone to ground, no longer owned the pace of the night. The false call had been denied him, and the road below had received something cleaner than panic: a command from the very tower he meant to corrupt.",
        "Yet the final measure still rested in your hands. King's Lantern had to be secured, the duke either shielded or brought through, and whatever remained of Vey's company had to be answered before dawn turned rumor into history."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the tower and let Vey vanish into the storm if the duke's road is safe.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the tower unsecured and race blindly after the first fleeing shadow.",
          "failTitle": "The Height Unkept",
          "failText": "Without a master at King's Lantern, panic and counterorders spread faster than truth. A saved moment becomes a squandered night.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Press the true signal, then hunt Vey down the service stair and deliver tower and captain both to Hester.",
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
      "title": "Storm After Fire - No Easy Victory",
      "narrative": [
        "By the time the worst of the fighting ended, the storm had thinned enough to show scattered lights on the causeway and men moving where Hester had set them. Duke Aldric's column was not destroyed, but the road below had paid in blood for every blurred signal and delayed choice.",
        "Vey was no longer in plain view. He had either gone over the far stair or vanished among the lower works while the chamber changed hands too many times to count. That left you holding a half-won tower and a night that would be judged less by clean triumph than by what losses could still be prevented.",
        "The beacon chain itself seemed to listen in the rain, waiting to learn whether it would wake tomorrow as a trusted servant of Brackenwald again or as a thing every captain now feared to obey."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ride the upper ledge signal through to Hester, then lead the counterstroke that traps Vey's men below the tower.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the tower, tend the wounded, and let the surviving raiders flee into the weather.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue Vey alone into the dark service passages.",
          "failTitle": "Lost Under the Hill",
          "failText": "The passages fork, flood, and swallow sound. While you hunt one man in darkness, the survivors above and below go leaderless.",
          "death": true
        }
      ]
    },
    {
      "id": "K20C",
      "turn": 20,
      "title": "Dawn Over the Pass - What Can Be Kept",
      "narrative": [
        "Dawn found Stonewake under a colorless sky, the rain spent and every rock smelling of wet soot. The duke lived, though the road below bore the plain signs of how close the night had come to going another way.",
        "King's Lantern did not speak cleanly again before morning. Whatever warning reached the causeway came by broken bell, shouted voice, half-seen flare, and the stubborn good sense of captains who refused to trust any single sign entirely.",
        "Vey had not won the perfect stroke he wanted, but neither had Brackenwald escaped untouched. What remained now was to decide whether the night's wreck would harden into mere grief or be shaped into a lesson strong enough to keep the heights honest again."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue the last raiders down the wet cliffs while the pass is still unsecured.",
          "failTitle": "One Fall Too Many",
          "failText": "The cliff gives way under haste and grief alike. By the time they haul you up or find only your cloak below, the last work of the night has gone undone.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Put the tower back in lawful hands before sunrise and give Duke Aldric the truth with no varnish.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "See the duke safely through the pass and leave the tower for others to reckon with later.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        }
      ]
    }
  ]
});
