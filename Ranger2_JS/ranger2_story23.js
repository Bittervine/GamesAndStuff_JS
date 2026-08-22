window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-hollow-stone-measure",
  "title": "The Hollow Stone Measure",
  "summary": "Farmers across Riverland are losing winter grain to a market measure that seems lawful until the ranger and clerk Mira Venn uncover a broker's plan to turn false shortages into debts, seize the valley mills, and starve the villages under cover of honest accounting.",
  "maxTurns": 20,
  "startNodeId": "N01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The true measures are restored in a public weighing, Rusk Pell and Provost Caldus face Duke Aldric's judgment, and the stolen grain returns to the villages before the hard weather. Mira Venn is appointed keeper of Riverland's standards, while Orin Bale rebuilds his mill without owing a grain to the men who tried to own it.",
    "low": "Enough evidence survives to stop the seizure and release much of the hidden grain, though several ledgers and one storehouse are lost in the confusion. Aldric orders a new accounting across Riverland, and the farmers spend a lean winter repairing trust as carefully as they repair their granaries."
  },
  "nodes": [
    {
      "id": "N01A",
      "turn": 1,
      "title": "A Short Measure - First Inspection",
      "narrative": [
        "A cold rain follows you into the Riverland market town of Veycross, where farmers stand beside sacks of grain and argue that the public scales have taken a bushel too many from every load. Mira Venn, the market clerk, has sent the message to Duke Aldric's ranger.",
        "Thorne stamps beneath the awning while you examine the brass beam and the carved stone weights. Nothing is cracked, yet Mira points out that the newest weight leaves a pale grit on the scale pan and that every disputed receipt bears the mark of broker Rusk Pell.",
        "The complaint is larger than a quarrel between a farmer and a clerk. Winter stores are being counted now, and a small falsehood repeated at every market could empty the Riverland granaries before anyone knows where the grain went."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Lift the newest weight, test its balance against the beam, and preserve the grit for Mira's record.",
          "scoreDelta": 1,
          "nextNodeId": "N02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask three farmers to recount their deliveries while Mira keeps the market moving.",
          "scoreDelta": 0,
          "nextNodeId": "N02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare the scale sound and order the waiting farmers to accept their receipts.",
          "failTitle": "The Official Answer",
          "failText": "Your hurried ruling makes the frightened farmers disperse, and Rusk Pell has the disputed weights removed before Mira can secure them.",
          "death": false
        }
      ]
    },
    {
      "id": "N01B",
      "turn": 1,
      "title": "A Short Measure - Voices in the Rain",
      "narrative": [
        "You reach Veycross after the first argument has spread through the market. Farmers cluster beneath the eaves with damp receipts in their hands, saying the public scales have charged them more grain than their own measures ever did.",
        "Mira Venn leads you past the crowd to the brass beam. She names Rusk Pell as the broker who handled most of the disputed loads, then shows you a pale line of grit beneath the newest carved stone weight. Thorne waits near the market gate, ears turned toward the restless horses.",
        "The town is ready to treat the matter as a merchant's quarrel, but the timing makes it dangerous. Riverland is recording its winter reserve, and whoever controls the record can make a full granary appear empty or a stolen store appear lawfully purchased."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take sworn accounts from the waiting farmers before asking who carried their sacks away.",
          "scoreDelta": 0,
          "nextNodeId": "N02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout for Rusk Pell and accuse him before the whole market has heard the evidence.",
          "failTitle": "A Merchant's Outcry",
          "failText": "Rusk turns the crowd against you with a claim of royal harassment, and the town guard seals the scales before Mira can examine them.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Mira close the scale, then compare the suspect weight with an untouched farm stone in private.",
          "scoreDelta": 1,
          "nextNodeId": "N02B"
        }
      ]
    },
    {
      "id": "N01C",
      "turn": 1,
      "title": "A Short Measure - The Last Sacks",
      "narrative": [
        "By dusk the Veycross market is nearly empty. Two farmers remain beside the scale with their carts half unloaded, and Mira Venn is trying to keep their receipts dry beneath a folded market cloth.",
        "You see the same signs she described: a new stone weight, a faint scrape inside its hollowed base, and Rusk Pell's red grain mark pressed into the corner of each receipt. Thorne noses at a cart wheel where damp flour has collected on the rim.",
        "The last light makes delay costly. If the false measure leaves with the broker's carts, tomorrow's farmers will have only their memories against a shortage written into the town's official book."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the final carts leave and promise to inspect the scale when the market opens again.",
          "failTitle": "Gone with the Grain",
          "failText": "The suspect weight disappears into the evening traffic, and the broker's men replace it before dawn with a clean stone that hides the first trail.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the suspect weight, seal the scale shed, and follow the cart whose wheel carries the flour trace.",
          "scoreDelta": 1,
          "nextNodeId": "N02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the farmers beside you and question them about the order in which the broker weighed each load.",
          "scoreDelta": 0,
          "nextNodeId": "N02A"
        }
      ]
    },
    {
      "id": "N02A",
      "turn": 2,
      "title": "The Beam and the Pan - A Careful Test",
      "narrative": [
        "Your private test shows that the newest stone is heavier than the mark carved on it, though its rough face has been made to resemble an old official measure. Mira Venn writes the result in a fresh sheet and keeps the grit in a folded scrap of waxed cloth.",
        "The beam itself has not been altered. The deception lies in the stone, and the number of affected receipts suggests that the false measure has travelled from one market to another rather than being a single careless mistake.",
        "Mira knows the scale shed is opened each morning by a porter named Harn Vey, while Rusk Pell's carts leave through the south lane. Either trail may show who changed the standard and who profits from the extra grain."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question Harn Vey about the shed key and the mornings when the weight first appeared.",
          "scoreDelta": 0,
          "nextNodeId": "N03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chip the false stone open on the public counter before recording its shape.",
          "failTitle": "Broken Evidence",
          "failText": "The stone splits into ordinary pieces, destroying the marks and hollow seam that could have shown where it was made.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Sketch the stone's cuts, then send Mira to copy every receipt bearing Pell's red grain mark.",
          "scoreDelta": 1,
          "nextNodeId": "N03A"
        }
      ]
    },
    {
      "id": "N02B",
      "turn": 2,
      "title": "The Beam and the Pan - Accounts Aligned",
      "narrative": [
        "The farmers' accounts agree on one detail: the shortfall began on the same market day that Rusk Pell brought a new set of marked stones from the west road. Each farmer thought the loss was his own mistake because the receipts carried the town clerk's seal.",
        "Mira Venn compares the names with her books and finds that every disputed load was recorded for a mill outside town, though several farmers say their grain never passed through that mill. The entries were written in a careful hand but with different ink from the rest of the page.",
        "A porter, Harn Vey, admits that the scale shed was unlocked twice before dawn last week. He cannot say who entered, but he remembers a cart wheel packed with pale flour near the door."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Harn's uncertainty and send him away before the broker's men notice the questioning.",
          "failTitle": "The Missing Porter",
          "failText": "Harn vanishes from the market before nightfall, taking the only key history that could place the false stones inside the shed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ask Harn to draw the cart's wheel marks while Mira separates the changed entries from the old book.",
          "scoreDelta": 1,
          "nextNodeId": "N03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the accounts together and ask which farmers saw Pell's wagons after weighing.",
          "scoreDelta": 0,
          "nextNodeId": "N03C"
        }
      ]
    },
    {
      "id": "N02C",
      "turn": 2,
      "title": "The Beam and the Pan - South-Lane Trace",
      "narrative": [
        "The flour packed into the south-lane wheel belongs to the same coarse millstone dust found under the market weight. The trail ends at a shuttered counting house beside the old road, where Rusk Pell's men have left fresh straw in the yard.",
        "Mira Venn reaches you with the farmers' receipts before the rain can blur them. The quantities are all rounded down in the town book, while the private marks on Pell's carts record the original loads in full.",
        "The counting house has no lawful reason to hold grain, yet a guarded door and a new lock say that someone expects questions. You must choose whether to learn more from the market records or approach the building before its contents move."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Return with Mira to compare the rounded entries against the farmers' private tally marks.",
          "scoreDelta": 0,
          "nextNodeId": "N03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force the locked door while the counting house guards are watching from the yard.",
          "failTitle": "The Locked Yard",
          "failText": "The guards raise the town alarm, and the evidence inside is carried away during the disorder while you are forced to answer for breaking a merchant's door.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hide the trail's end from the market crowd and ask Constable Jessa Rowe to watch the counting house until dark.",
          "scoreDelta": 1,
          "nextNodeId": "N03C"
        }
      ]
    },
    {
      "id": "N03A",
      "turn": 3,
      "title": "Marks Beneath the Mark - The Weight's Secret",
      "narrative": [
        "Mira's copied receipts show two measures at work: the public book records a smaller delivery, while Pell's private cart marks preserve the larger amount taken from each farmer. The difference is too regular to be an error.",
        "Under a thin crust of plaster, the suspect stone contains a lead plug and a second mark cut beneath the town seal. It was made to look official from above and to be recognized by someone who knew where to look.",
        "Mira believes the hidden mark belongs to a maker in the west quarter, where masons and stonecutters rent small benches. If the maker can be found, the false measure may lead to the person ordering the work."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the plug and stone separately, then take the hidden mark to the west-quarter stonecutters.",
          "scoreDelta": 1,
          "nextNodeId": "N04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Mira to search the town book for the first entry written in the altered ink.",
          "scoreDelta": 0,
          "nextNodeId": "N04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the opened weight on the market table as a warning to every passing merchant.",
          "failTitle": "A Warning Too Soon",
          "failText": "The crowd closes around the evidence, and a hand lifts the lead plug before anyone can identify its maker or keep the inner mark intact.",
          "death": false
        }
      ]
    },
    {
      "id": "N03B",
      "turn": 3,
      "title": "Marks Beneath the Mark - The Porter Remembers",
      "narrative": [
        "Harn Vey's sketch puts the pre-dawn cart at the counting house rather than the mill. He remembers two men carrying a wrapped stone case, and he remembers that Rusk Pell paid for the shed key in clipped silver instead of a town token.",
        "Mira finds the matching receipt entry in the altered ink. Its writer copied the town seal well but reversed the small hook in the lower corner, a mistake that appears on every page touched by the false measure.",
        "The stone itself bears a concealed maker's mark under its plug. The mark is not a guild sign, but it resembles the cut used by masons who repair old bridge foundations in the west quarter."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Harn repeat his memory to Jessa Rowe while you inspect the bridge-mason benches.",
          "scoreDelta": 0,
          "nextNodeId": "N04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Harn alone to demand his clipped silver back from Pell.",
          "failTitle": "The Wrong Messenger",
          "failText": "Pell's men corner Harn behind the counting house and take the key, the sketch, and his courage to speak openly again.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Place Harn under Jessa's protection and compare the hidden stone mark with the west-quarter workbenches.",
          "scoreDelta": 1,
          "nextNodeId": "N04B"
        }
      ]
    },
    {
      "id": "N03C",
      "turn": 3,
      "title": "Marks Beneath the Mark - A Door Watched",
      "narrative": [
        "Constable Jessa Rowe takes position across from the counting house with a basket of lamp oil, appearing to wait for a delivery. From the shadows you watch Pell's clerk carry a small stone case through the rear door.",
        "Mira arrives with the farmers' records and spots a repeated cut hidden under the false town seal. The sign is a stonecutter's private mark, not a public guild stamp, and the case in the yard may contain more than one altered weight.",
        "The watched door is useful evidence, but it will not tell you who paid for the work. The west-quarter benches are still open, and a maker there might recognize the mark before Pell learns that his house is being observed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Enter the counting house alone while Jessa keeps the front door under watch.",
          "failTitle": "The Rear Door",
          "failText": "A second guard was waiting inside, and your movement gives Pell time to remove both the stone case and the private records through the yard.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave Jessa watching the house and carry the hidden mark to the stonecutters before closing time.",
          "scoreDelta": 1,
          "nextNodeId": "N04C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Mira to file the altered pages while you remain near the counting-house yard.",
          "scoreDelta": 0,
          "nextNodeId": "N04A"
        }
      ]
    },
    {
      "id": "N04A",
      "turn": 4,
      "title": "The Stonecutter's Bench - A Name in Dust",
      "narrative": [
        "The west-quarter stonecutters recognize the hidden mark as that of Darran Holt, an older mason who now repairs mill foundations for Rusk Pell. Holt claims he carved only honest counterweights, but the pale dust on his bench matches the false stone.",
        "Before you can press him, a boy from the market arrives breathless: Mira Venn was followed from the records room and has not returned. Holt's eyes move toward the lane, telling you that the warning is meant for him as well.",
        "The maker may know where the weights were stored, while Mira may already be in danger because she copied the altered pages. Leaving either trail unattended could let Pell erase the other."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Holt to Jessa Rowe and have him describe Pell's last order before searching for Mira.",
          "scoreDelta": 0,
          "nextNodeId": "N05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Bind Holt to his bench and leave him while you chase the boy's first direction.",
          "failTitle": "An Empty Bench",
          "failText": "Holt slips away through the adjoining yard, and the only maker who can identify Pell's order is gone before you return.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Send Holt under guard to Jessa and follow Mira's trail through the rain before it fades.",
          "scoreDelta": 1,
          "nextNodeId": "N05A"
        }
      ]
    },
    {
      "id": "N04B",
      "turn": 4,
      "title": "The Stonecutter's Bench - Ink on the Sleeve",
      "narrative": [
        "Mira's altered pages identify a clerk's sleeve mark used by the provost's office, but the clerk who wrote them has fled. Darran Holt, the stonecutter named by the hidden mark, sits in his workshop with lead dust beneath his nails and a fresh bruise at his temple.",
        "Holt admits that Pell paid him to make stones that balanced against a private iron bar. He did not know the pieces would carry the town seal, and he says Pell threatened to close his son's apprenticeship if he refused.",
        "Mira has not come back from the records room. Holt knows a rear lane that reaches it, but the confession must also be kept safe before Pell's men discover that the mason has spoken."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Holt's confession on the bench while you search the provost's office for the missing clerk.",
          "failTitle": "Dust Without a Witness",
          "failText": "Pell's men find Holt first, scatter his work, and frighten him into denying that he ever saw the broker.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Put Holt in Jessa's care, take his rear-lane route, and look for Mira before confronting the provost's clerk.",
          "scoreDelta": 1,
          "nextNodeId": "N05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Holt to wait with the copied pages while you bring Jessa to the records room.",
          "scoreDelta": 0,
          "nextNodeId": "N05C"
        }
      ]
    },
    {
      "id": "N04C",
      "turn": 4,
      "title": "The Stonecutter's Bench - Rain on the Trail",
      "narrative": [
        "Darran Holt's bench is empty, but a wet apron and fresh lead filings show that he left only minutes ago. The stonecutter next door says Holt was called to the records room by a woman carrying Mira Venn's red ledger.",
        "Jessa Rowe finds Mira's dropped wax tablet in the alley. One side bears a hurried list of receipt numbers; the other holds a sketch of the false stone's inner plug. Someone wanted the evidence carried and someone else wanted it stopped.",
        "Rain is washing the lane toward the old mill road. Holt may be fleeing in fear, while Mira may be held somewhere close enough for her tablet to have been planted."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Give Jessa the tablet and follow Holt's wet tracks toward the records room and mill road junction.",
          "scoreDelta": 1,
          "nextNodeId": "N05B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the tablet dry and ask the neighboring cutter which way the woman carried the ledger.",
          "scoreDelta": 0,
          "nextNodeId": "N05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight to Pell's counting house and demand that he produce both missing people.",
          "failTitle": "The Empty Workshop",
          "failText": "Pell has already heard of the search and clears the records room while your open accusation gives his clerks time to destroy the trail.",
          "death": false
        }
      ]
    },
    {
      "id": "N05A",
      "turn": 5,
      "title": "The Mill with Two Doors - Mira Found",
      "narrative": [
        "Holt's rear lane ends behind Orin Bale's mill, where a side door hangs open and sacks have been stacked to conceal a narrow stair. Mira Venn is inside the mill office, bound at the wrists but still clutching the copied receipt numbers.",
        "Orin Bale insists he did not take her. He says Pell's men used the mill after dark and left two iron bars among the proper weights. The miller kept silent because his own debt note threatened to take his wheel if he spoke.",
        "Mira can identify the altered entries, while Orin can show where the private bars were used. Both are frightened, and the creak of a cart outside says Pell's men may have returned."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Free Mira, hide the private bars beneath sound sacks, and lead Orin and Holt through the mill race exit.",
          "scoreDelta": 1,
          "nextNodeId": "N06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Put Mira with Orin in the office and ask the miller to explain the two iron bars before leaving.",
          "scoreDelta": 0,
          "nextNodeId": "N06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout Pell's name and draw your sword before checking whether the cart outside is occupied.",
          "failTitle": "The Mill Race",
          "failText": "The hidden men seize the office door, and Mira's copied pages are thrown into the racing water before you can secure the witnesses.",
          "death": false
        }
      ]
    },
    {
      "id": "N05B",
      "turn": 5,
      "title": "The Mill with Two Doors - A Frightened Miller",
      "narrative": [
        "Jessa reaches Orin Bale's mill before you do and finds a second set of scale bars hidden behind the flour bins. Mira Venn is missing from the office, but a torn strip of her red ledger is caught on a nail beside the grain chute.",
        "Orin says Pell's men forced him to use the heavier bar whenever a farmer brought grain for milling. He saw Mira brought through the side door, then heard the broker's clerk threaten to burn the town book if the miller raised an alarm.",
        "The torn ledger strip points toward the old counting house, while Orin knows which cart carried Mira away. His fear is genuine, but he may still be hiding the debt note Pell used to control him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Orin beside Jessa and follow the cart path toward the old counting house.",
          "scoreDelta": 0,
          "nextNodeId": "N06C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten Orin until he names every farmer who was cheated at his mill.",
          "failTitle": "The Miller's Silence",
          "failText": "Orin bolts through the flour room, and the confusion lets Pell's clerk collect the hidden bars and the ledger strip.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure the two bars, take Orin as a witness, and have Jessa follow the ledger strip's direction.",
          "scoreDelta": 1,
          "nextNodeId": "N06B"
        }
      ]
    },
    {
      "id": "N05C",
      "turn": 5,
      "title": "The Mill with Two Doors - A Trail in Flour",
      "narrative": [
        "The flour trail leads to Orin Bale's mill, where the main door is bolted from within. Through a crack you see a second scale on the floor, its iron bar longer and heavier than the public beam in Veycross.",
        "Mira Venn is not there, but a red thread from her ledger hangs on the stair rail. Orin finally opens the door after Jessa calls his name and admits that Pell's men carried Mira toward the old counting house when she found the private measure.",
        "The miller's account gives you a direction and a danger. If the false bar remains in the mill, Pell can deny it was ever used; if Mira is being moved, every minute gives the broker a chance to turn a clerk into a missing witness."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the private scale in place and ride after Mira without marking what you found.",
          "failTitle": "The Clean Mill",
          "failText": "Pell's men return before Jessa can guard the room and replace the private bar with an ordinary one, leaving Orin afraid to confirm your discovery.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the private bar in mill cloth, place Orin under Jessa's protection, and follow the ledger thread.",
          "scoreDelta": 1,
          "nextNodeId": "N06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Orin to describe the cart while Mira's red thread remains marked on the stair.",
          "scoreDelta": 0,
          "nextNodeId": "N06A"
        }
      ]
    },
    {
      "id": "N06A",
      "turn": 6,
      "title": "The Cart Without a Receipt - Wheel Marks",
      "narrative": [
        "With Mira, Orin, and Holt sheltered behind the mill race, you study the cart trace in the wet clay. The wheel has a missing outer peg that stamps a crescent into every turn, and the track leads toward the shuttered counting house.",
        "Mira remembers hearing Pell's clerk say that the old house has a cellar deeper than its foundation. Orin adds that grain was never stored there openly; carts arrived light and left heavy after midnight.",
        "The witnesses now form a chain rather than a collection of rumors. You need the hidden records before Pell can claim that the mill bars were an innocent private tool and that Mira fabricated the rest."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Jessa keep the witnesses at the mill while you ask the town clerk about the counting house cellar.",
          "scoreDelta": 0,
          "nextNodeId": "N07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send all three witnesses ahead in the marked cart so Pell's men will chase a visible trail.",
          "failTitle": "A Baited Cart",
          "failText": "The witnesses are intercepted on the road, and the cart's obvious markings reveal both the evidence and the safe place where you left the mill.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the crescent wheel marks with Jessa while Mira secures the wrapped bar and the copied receipts.",
          "scoreDelta": 1,
          "nextNodeId": "N07A"
        }
      ]
    },
    {
      "id": "N06B",
      "turn": 6,
      "title": "The Cart Without a Receipt - A Private Bar",
      "narrative": [
        "The private iron bar weighs nearly a stone more than its painted value. Orin Bale's hands shake as he explains that Pell made him use it only on farmers who could not afford to argue at the mill window.",
        "Mira Venn finds a line of red ledger thread caught in the bar's leather handle. It matches the strip from the office, and beneath it lies a smear of black counting ink used by the provost's clerks.",
        "The cart that carried Mira passed the mill before the rain began. Its tracks are fading, but the heavier bar may let you prove the fraud even if the written records are taken."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Carry the iron bar openly through the market and announce that it proves Pell's guilt.",
          "failTitle": "The Heavy Proof",
          "failText": "Pell's clerk calls the bar a mill tool and has it seized as stolen property before any witness can explain how it was used.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the bar with the ledger thread, record its weight with Mira, and follow the fading cart marks.",
          "scoreDelta": 1,
          "nextNodeId": "N07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave the bar hidden at the mill and ask Orin where Pell kept the private receipts.",
          "scoreDelta": 0,
          "nextNodeId": "N07C"
        }
      ]
    },
    {
      "id": "N06C",
      "turn": 6,
      "title": "The Cart Without a Receipt - The Red Thread",
      "narrative": [
        "The red thread from Mira's ledger leads out of the mill yard and across the old road. Jessa Rowe spots the crescent wheel mark in a patch of soft clay, but the cart has turned toward the counting house instead of following the main lane.",
        "Orin's private bar is still wrapped beneath the mill cloth. He says the same cart once carried grain from his locked store without a receipt, always after Pell had spoken with Provost Caldus.",
        "The path offers a chance to reach Mira and the hidden stock together. It also passes a low drainage culvert where a frightened witness could be held out of sight."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Leave the bar with Jessa, search the culvert first, and keep the crescent track under cover.",
          "scoreDelta": 1,
          "nextNodeId": "N07C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Orin close and follow the cart toward the counting house without entering the culvert.",
          "scoreDelta": 0,
          "nextNodeId": "N07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the witnesses wait at the mill while you chase the cart alone into the dark lane.",
          "failTitle": "The Unwatched Witnesses",
          "failText": "Pell's men return to the mill and remove the bar, Orin, and the only safe evidence before you reach the counting house.",
          "death": false
        }
      ]
    },
    {
      "id": "N07A",
      "turn": 7,
      "title": "Below the Counting House - A Cellar Stair",
      "narrative": [
        "The crescent wheel track ends at the shuttered counting house. Jessa finds a fresh scrape on the cellar threshold, and Mira's copied page shows that no lawful store has ever been entered for the building.",
        "Behind a stack of empty tally boards, you find a stair descending into cool air that smells of grain dust and damp lime. The room below is large enough to hold the missing sacks from several markets.",
        "A lantern burns farther in, and voices discuss moving the next loads before the provost's review. Mira stays above with the witnesses while you decide whether to enter quietly or force the scheme into the open."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Jessa guard the stair and call down that the house is under lawful inspection.",
          "scoreDelta": 0,
          "nextNodeId": "N08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick the lantern into the cellar and rush down before the voices can move.",
          "failTitle": "The Dark Cellar",
          "failText": "The sudden darkness sends men crashing through the stacked grain, and the records burn in spilled oil before you can reach them.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Extinguish your own lamp, leave the witnesses above, and listen long enough to learn how many men are below.",
          "scoreDelta": 1,
          "nextNodeId": "N08A"
        }
      ]
    },
    {
      "id": "N07B",
      "turn": 7,
      "title": "Below the Counting House - The Ledger Room",
      "narrative": [
        "The town clerk's old floor plan confirms a cellar beneath the counting house, though the current public plan omits it. A concealed latch behind the tally boards opens to a room lined with grain sacks and shelves of narrow ledgers.",
        "Mira recognizes the private marks on the sacks as the same figures copied from Pell's carts. Orin finds his mill's name beside a debt amount twice the value of his wheel, dated before the first disputed market.",
        "The room proves the grain was being gathered deliberately, but the ledgers may reveal who authorized the entries. Footsteps sound above, and someone has noticed that the old house is no longer empty."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Take the most important ledger and leave the other shelves untouched without marking the room.",
          "failTitle": "The Unmarked Room",
          "failText": "The shelves are rearranged before Jessa can secure them, allowing Pell to claim the single ledger was planted and the hidden grain belonged to another merchant.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Sketch the shelves, pair each sack mark with its ledger line, and have Jessa hold the upper door.",
          "scoreDelta": 1,
          "nextNodeId": "N08B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Mira to choose the ledger bearing Orin's name while you listen at the stair.",
          "scoreDelta": 0,
          "nextNodeId": "N08C"
        }
      ]
    },
    {
      "id": "N07C",
      "turn": 7,
      "title": "Below the Counting House - The Hidden Sacks",
      "narrative": [
        "The drainage culvert opens behind the counting house cellar. Inside you find three of Mira's missing receipt pages and a row of grain sacks hidden behind a false wall, each marked with a farmer's name and a smaller amount than the sack actually holds.",
        "A narrow stair leads upward into the counting house. From above comes the scrape of a chair and the low voice of Provost Caldus arguing with Rusk Pell about a review scheduled in two days.",
        "The hidden room is proof of deliberate theft, but the voices may reveal the larger plan if you can reach the stair without being seen."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Hide the receipt pages inside your coat and climb until you can hear the whole argument.",
          "scoreDelta": 1,
          "nextNodeId": "N08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Jessa to guard the culvert while you bring Mira down to identify the sacks.",
          "scoreDelta": 0,
          "nextNodeId": "N08A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open every sack at once and call for the town guard from the culvert.",
          "failTitle": "Grain in the Drain",
          "failText": "The shout brings Pell's men to the hidden room, where they scatter the sacks and throw the receipt pages into the running water.",
          "death": false
        }
      ]
    },
    {
      "id": "N08A",
      "turn": 8,
      "title": "A Debt Written Below - The Broker's Argument",
      "narrative": [
        "From the stair you hear Rusk Pell tell Provost Caldus that three more markets will make the mills insolvent. Caldus answers that the duke's review must see signed debts, not merely missing grain, and asks whether the farmers will accept the new valuations.",
        "The exchange reveals the purpose of the false measures. Pell is not merely stealing grain; he is manufacturing debts that will let him claim the mills when winter pressure forces their owners to sell.",
        "A floorboard shifts beneath Jessa's boot above. The argument is about to end, and the men below may still escape through a second passage."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Wait for Caldus to leave, then secure the signed debt pages before confronting Pell.",
          "scoreDelta": 0,
          "nextNodeId": "N09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call both men thieves from the stair before Jessa has blocked the rear passage.",
          "failTitle": "The Second Passage",
          "failText": "Pell and Caldus flee through the rear passage with the signed pages, leaving you with grain but no proof of who ordered the fraud.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Signal Jessa to take the rear door, then step into the light and demand the debt book as evidence.",
          "scoreDelta": 1,
          "nextNodeId": "N09A"
        }
      ]
    },
    {
      "id": "N08B",
      "turn": 8,
      "title": "A Debt Written Below - Names on the Shelves",
      "narrative": [
        "The shelf sketch links each hidden sack to a debt line. Orin Bale's mill is only one of nine properties listed, and the earliest entries begin after Pell supplied farmers with loans against grain they had already delivered.",
        "Mira finds Provost Caldus's seal beside a column titled winter adjustment. The seal is genuine, but the numbers beside it were copied in the same altered ink as the market records.",
        "Jessa hears movement above and warns that Pell's men are searching the front rooms. The evidence is strong enough to expose the scheme, but it must leave the cellar with witnesses who can explain what each mark means."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Take the ledgers upstairs immediately and let the surprised guards see what you have found.",
          "failTitle": "The Seized Ledgers",
          "failText": "The guards claim the books are stolen property and wrest them away while the witnesses are separated in the narrow stair.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Give Mira the debt pages, keep Orin with the sack marks, and have Jessa open a path through the culvert.",
          "scoreDelta": 1,
          "nextNodeId": "N09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the seal and the largest debt entries before moving the witnesses out of the cellar.",
          "scoreDelta": 0,
          "nextNodeId": "N09C"
        }
      ]
    },
    {
      "id": "N08C",
      "turn": 8,
      "title": "A Debt Written Below - The Review Date",
      "narrative": [
        "You hear enough from the stair to learn that the duke's Riverland review will take place in two days. Pell intends to present the altered debts as proof that the mills cannot meet their grain obligations, then request the right to manage them through the winter.",
        "Caldus objects that the review may include a ranger's report. Pell answers that the ranger can be made to look like a meddler if the original standards vanish before the hearing.",
        "The words are a reversal of the first suspicion. The missing grain is only the visible part; the town's lawful measures and records are the true targets."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Memorize the review date and the plan to remove the standards, then withdraw before the voices reach the stair.",
          "scoreDelta": 1,
          "nextNodeId": "N09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Mira copy the review line while Jessa checks whether the upper room has a second exit.",
          "scoreDelta": 0,
          "nextNodeId": "N09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush upstairs to seize the first man who mentions the missing standards.",
          "failTitle": "The Vanished Standards",
          "failText": "Your attack scatters the conspirators, and the town's true measures disappear before anyone learns where Pell has hidden them.",
          "death": false
        }
      ]
    },
    {
      "id": "N09A",
      "turn": 9,
      "title": "The Provost's Seal - A Public Door",
      "narrative": [
        "Pell and Caldus are not in the upper room when you arrive, but their meeting table holds a fresh debt schedule bearing the provost's seal. Jessa catches Pell's clerk at the rear door and takes his ring of keys without drawing a crowd.",
        "Mira compares the schedule with her copied receipts. Every debt begins with grain measured by the false stone, and every property is listed for review after two more deliveries.",
        "The clerk refuses to name Pell, saying the broker will make any accusation look like a ranger's attack on lawful commerce. The schedule must be tied to a living witness before the review can be turned in your favor."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring the clerk to the market court and ask him to identify the seal before the town witnesses.",
          "scoreDelta": 0,
          "nextNodeId": "N10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Lock the clerk in the counting house and leave him while you search for Pell.",
          "failTitle": "The Locked Clerk",
          "failText": "The clerk is taken by a second guard through the cellar, and Pell claims that your prisoner was coerced into signing the schedule.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the clerk beside Mira, seal the schedule with Jessa's mark, and send for the farmers named on it.",
          "scoreDelta": 1,
          "nextNodeId": "N10A"
        }
      ]
    },
    {
      "id": "N09B",
      "turn": 9,
      "title": "The Provost's Seal - A Hidden Schedule",
      "narrative": [
        "The copied debt pages are enough to show a pattern, but the original schedule is still inside the counting house. Orin recognizes six mill names and says Pell used the same promise at each place: accept a short receipt now or lose the mill when the grain account was settled.",
        "Mira notices that one page bears the provost's seal twice, once in ink and once in a faint impression pressed from a blank sheet. Someone prepared space for an official order that has not yet been written.",
        "Jessa can carry the witnesses through the culvert, but the hidden schedule must be recovered before Pell can fill the blank with a lawful-looking claim."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the blank page behind and take only the copies that are already in Mira's hand.",
          "failTitle": "The Blank Order",
          "failText": "Pell fills the prepared page before the review and uses it to turn the missing original into a supposed ranger forgery.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the blank page, carry the witnesses out, and have Jessa return with a lawful search party.",
          "scoreDelta": 1,
          "nextNodeId": "N10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Mira to copy the page's seal impression while Orin lists the mills named in the schedule.",
          "scoreDelta": 0,
          "nextNodeId": "N10C"
        }
      ]
    },
    {
      "id": "N09C",
      "turn": 9,
      "title": "The Provost's Seal - A Witness in the Lane",
      "narrative": [
        "The first witness you find is Harn Vey, waiting beneath a cooper's awning with a split lip and no key ring. He says Pell's clerk searched him for the shed key, then ordered him to tell the ranger that the market stones were never changed.",
        "Mira's copied pages and Harn's account agree on the pre-dawn entry, but Harn is afraid that a public accusation will cost him his work. He points toward the provost's office, where Caldus is preparing a hearing notice.",
        "The threat has moved from hidden rooms into official streets. You need to protect Harn while making his memory useful before Pell presents a cleaner story to the town."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Put Harn under Jessa's guard and take his account with Mira's copies to the hearing clerk.",
          "scoreDelta": 1,
          "nextNodeId": "N10C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Harn concealed and ask Mira to learn when Caldus will announce the review.",
          "scoreDelta": 0,
          "nextNodeId": "N10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Harn back to work so Pell cannot claim that the ranger is hiding a witness.",
          "failTitle": "The Cowed Porter",
          "failText": "Harn is forced to repeat Pell's account in the market, and the hearing clerk rejects the copied pages as hearsay from a frightened man.",
          "death": false
        }
      ]
    },
    {
      "id": "N10A",
      "turn": 10,
      "title": "The Standards Gone - A Reversal",
      "narrative": [
        "At dawn the public scale shed stands open, but the town's true stone standards are gone. In their place lies a note signed with the provost's seal, claiming that you removed them during an unauthorized inspection.",
        "Caldus appears with two guards and calls the note proof that the ranger has interfered with lawful accounting. Pell remains behind him, calm enough to show that the disappearance was part of the plan you overheard.",
        "Mira still has the suspect weight, and Harn has his memory, but the town can now be told that your evidence was made after the standards vanished. The next move must expose the false note without giving Pell a reason to close the market entirely."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Answer Caldus calmly and request that the note be compared with the provost's seal in the debt schedule.",
          "scoreDelta": 0,
          "nextNodeId": "N11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Draw your sword and force Caldus to open the locked standards room.",
          "failTitle": "The Ranger's Charge",
          "failText": "Your threat gives Pell exactly the accusation he needs, and the town guard confines you before the missing standards can be traced.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ask Mira to examine the note's ink while Jessa gathers the farmers whose names appear on Pell's schedule.",
          "scoreDelta": 1,
          "nextNodeId": "N11A"
        }
      ]
    },
    {
      "id": "N10B",
      "turn": 10,
      "title": "The Standards Gone - The Sealed Room",
      "narrative": [
        "Jessa's lawful search party reaches the counting house to find the standards room empty and its lock replaced. The original schedule is gone too, but a clean rectangle in the dust shows where the heavy stone set stood.",
        "Pell claims the standards were taken to Duke Aldric for inspection and says the ranger's hidden cellar proves nothing without them. Mira points out that the provost's seal on his statement has the same reversed hook as the altered receipts.",
        "The reversal leaves the conspiracy exposed in shape but not yet in a form that a hearing can accept. The farmers named in the schedule must bring their own records before Pell can make their losses disappear into the missing standards."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Pell's claim that the standards are with the duke and release the counting house.",
          "failTitle": "A Convenient Absence",
          "failText": "Pell uses the empty room to move the hidden grain and rewrite the schedule while everyone waits for standards that were never sent away.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the empty standards room and send Jessa to summon every miller named in the copied schedule.",
          "scoreDelta": 1,
          "nextNodeId": "N11B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Record the room's dust marks and ask the search party to compare Pell's statement with Mira's seal impression.",
          "scoreDelta": 0,
          "nextNodeId": "N11C"
        }
      ]
    },
    {
      "id": "N10C",
      "turn": 10,
      "title": "The Standards Gone - An Empty Rack",
      "narrative": [
        "The provost's office contains a rack where the true standards should rest. Caldus says they were removed for cleaning, but Harn Vey recognizes the straw packing used by Pell's carts and says the rack was full yesterday.",
        "The hearing clerk will record Harn's statement only if another witness confirms the packing. Mira finds a trace of white stone dust beneath the rack, matching the false weight's concealed plug.",
        "Pell has forced the matter into a contest between missing objects and living memories. The farmers can settle the balance if you reach them before their grain contracts are presented at the review."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take Harn and the dust sample to the mills named in the schedule before Pell's contracts arrive.",
          "scoreDelta": 1,
          "nextNodeId": "N11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Harn with the hearing clerk and ask Mira to compare the rack dust with Holt's stone bench.",
          "scoreDelta": 0,
          "nextNodeId": "N11A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Caldus of hiding the standards and overturn his office desk in front of the clerk.",
          "failTitle": "The Overturned Office",
          "failText": "The clerk records your violence instead of Harn's evidence, and Caldus orders the mills to accept Pell's contracts until the matter is settled.",
          "death": false
        }
      ]
    },
    {
      "id": "N11A",
      "turn": 11,
      "title": "The Market Court - A Narrow Hearing",
      "narrative": [
        "Mira's ink test shows the note was written with the same dark mixture used in Pell's private ledgers, not the blue ink kept in the provost's office. The hearing clerk hesitates, but Caldus demands that the ranger be removed until Duke Aldric can review the accusation.",
        "Jessa keeps the farmers outside the court while Harn waits beside the copied schedule. Orin Bale has brought the private iron bar wrapped in mill cloth, though Pell's clerk insists it is an ordinary repair piece.",
        "The first hearing will not prove every theft, but it can preserve the witnesses and force Pell to answer for the false note. A careful presentation may win time; a rushed one may give Caldus control of the record."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Present the ink difference first and ask the clerk to enter the bar and Harn's account as separate exhibits.",
          "scoreDelta": 0,
          "nextNodeId": "N12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Read the entire hidden ledger aloud before the clerk has accepted any page as evidence.",
          "failTitle": "The Lost Hearing",
          "failText": "Caldus interrupts the confused testimony, and the clerk seals the papers as disputed copies while Pell's men carry the original witnesses away from the court.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ask Mira to show the matching ink, then let Orin demonstrate the bar against a known mill weight.",
          "scoreDelta": 1,
          "nextNodeId": "N12A"
        }
      ]
    },
    {
      "id": "N11B",
      "turn": 11,
      "title": "The Market Court - Farmers at the Gate",
      "narrative": [
        "The millers arrive at the market gate with damp account books and the same story: their receipts were smaller than the grain they surrendered, and Pell offered loans when the shortfall appeared. Caldus refuses to let them enter the hearing until the standards are found.",
        "Mira arranges the books by market day, while Orin marks the entries that passed through his mill. The pattern is plain even without the missing official stones, but Pell's clerk keeps asking which hand actually wrote each line.",
        "Harn Vey sees a cart waiting behind the court wall with straw packing in its bed. It may carry the missing standards, or it may be a decoy meant to draw the witnesses away."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the farmers to inspect the waiting cart while you remain inside the hearing.",
          "failTitle": "The Divided Gate",
          "failText": "The cart is empty, and Pell's men use the distraction to remove the farmers' books from the gate before the clerk can record them.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the farmers together, have Jessa inspect the cart, and enter the books as a single matching record.",
          "scoreDelta": 1,
          "nextNodeId": "N12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask two millers to wait at the gate while Mira presents the remaining account books.",
          "scoreDelta": 0,
          "nextNodeId": "N12C"
        }
      ]
    },
    {
      "id": "N11C",
      "turn": 11,
      "title": "The Market Court - A Roadside Muster",
      "narrative": [
        "At the first mill beyond Veycross, Harn's memory is confirmed by an elderly carter who saw straw-packed standards carried toward the river warehouses. He will speak, but only if his name is not placed in Pell's debt book.",
        "Mira compares his route with the private schedule and finds the warehouse marked with a small red grain hook. Orin says Pell's men use the old weighing yard there when they do not want a town clerk present.",
        "The review is approaching, and the witnesses are scattered along the road. You can build a strong road account by gathering them, or lose time while Pell's warehouse clears itself."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Promise the carter protection, mark the river warehouse, and send Jessa to gather the nearest millers.",
          "scoreDelta": 1,
          "nextNodeId": "N12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the carter's route to the warehouse while Mira keeps the copied schedule with Orin.",
          "scoreDelta": 0,
          "nextNodeId": "N12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell the carter his name must be public before you will trust his account.",
          "failTitle": "The Silent Carter",
          "failText": "The carter withdraws in fear, and the warehouse workers deny that any standards passed their yard.",
          "death": false
        }
      ]
    },
    {
      "id": "N12A",
      "turn": 12,
      "title": "The Millers' Books - Nine Shortfalls",
      "narrative": [
        "Nine mill books now lie beneath Mira's hand, each showing the same widening gap between grain received and grain recorded. Orin Bale's book carries the earliest entry, proving that Pell's plan began before the market complaints reached Veycross.",
        "The millers disagree about the remedy. Some want the hidden grain seized at once; others fear that without a lawful hearing Pell will call the seizure theft and keep their properties tied to his debts.",
        "Mira proposes a public reweighing at the coming market, using ordinary farm stones and the copied figures. The missing standards still matter, but the villages can prove the losses without waiting for Caldus to return them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Set the books in order and ask each miller to bring one farm stone to the public reweighing.",
          "scoreDelta": 0,
          "nextNodeId": "N13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise the millers that their ledgers alone will make Pell surrender every storehouse.",
          "failTitle": "A Promise Unweighed",
          "failText": "The millers act separately, and Pell dismisses their books as private records while moving the hidden grain beyond the valley.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Mira pair each shortfall with a named witness and prepare one common table for the market court.",
          "scoreDelta": 1,
          "nextNodeId": "N13A"
        }
      ]
    },
    {
      "id": "N12B",
      "turn": 12,
      "title": "The Millers' Books - A Shared Account",
      "narrative": [
        "The farmers' books are accepted as a shared account because the dates and quantities match across villages that do not trade with one another. Even without the official standards, the pattern shows that every loss began when Pell's carts appeared.",
        "The hearing clerk agrees to record the evidence but warns that the review will still turn on possession of the true measures. Caldus has ordered the standards brought to his office, though no one can say who carried them there.",
        "Mira wants to use the common account to draw Pell into a public weighing. Orin believes the missing standards are being held at the river warehouse and can be recovered before the market if the approach is quiet."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait for Caldus to produce the standards while Pell's warehouse remains unobserved.",
          "failTitle": "Waiting for the Measure",
          "failText": "The warehouse empties during the delay, and Caldus returns with a clean stone set that cannot be tied to the original shortages.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Mira keep the common account in court and take Orin to watch the river warehouse.",
          "scoreDelta": 1,
          "nextNodeId": "N13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the clerk to copy the account while you question the warehouse carters about the standards.",
          "scoreDelta": 0,
          "nextNodeId": "N13C"
        }
      ]
    },
    {
      "id": "N12C",
      "turn": 12,
      "title": "The Millers' Books - River Warehouse",
      "narrative": [
        "The old river weighing yard is quiet except for a carter repairing a harness. He recognizes the red grain hook on Mira's copied schedule and admits that Pell has rented the warehouse's rear bay for two nights, paying in advance for an empty floor.",
        "Under the loose boards you find straw fibers and a clean rectangle where a heavy case rested. The missing standards were there recently, but the case has gone and the carter does not know whether it left by road or river.",
        "Orin spots a line of grain spilled toward the abandoned ferry road, while Mira finds a warehouse tally that lists the next market as the final delivery. The fraud is moving toward its public conclusion."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark the empty bay, preserve the straw, and follow the grain line toward the abandoned road with Orin.",
          "scoreDelta": 1,
          "nextNodeId": "N13C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Mira question the carter while you copy the warehouse tally and inspect the road gate.",
          "scoreDelta": 0,
          "nextNodeId": "N13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw the loose boards aside and search the whole warehouse without preserving the empty case mark.",
          "failTitle": "The Scattered Bay",
          "failText": "Workers arrive during the search and trample the straw and grain line, leaving Pell free to say the warehouse had never held the standards.",
          "death": false
        }
      ]
    },
    {
      "id": "N13A",
      "turn": 13,
      "title": "Farm Stones and False Numbers - The Valley Test",
      "narrative": [
        "At a hill farm above Veycross, Mira sets nine ordinary stones beside the copied receipts. Each stone has been used by the farmer for years, and each exposes a different amount by which Pell's market weight exceeded the lawful measure.",
        "The figures are persuasive because they come from separate farms, yet Pell can still argue that every household owns an inaccurate stone. Orin says the private iron bar will close that argument if it is weighed against all nine stones in one sitting.",
        "The farmers are ready to stand together at the next market. Before then, someone must keep the records safe and learn where Pell has taken the missing official set."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have the farmers copy their results into separate books and send the originals to the market clerk.",
          "scoreDelta": 0,
          "nextNodeId": "N14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Collect every farm stone in one cart and carry the whole proof to Veycross at once.",
          "failTitle": "The Fallen Cart",
          "failText": "Pell's men stop the cart on the road, scatter the household stones, and claim that the farmers have no independent measures left to compare.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record each stone in its own hand, then use Orin's iron bar only as a controlled comparison at the market.",
          "scoreDelta": 1,
          "nextNodeId": "N14A"
        }
      ]
    },
    {
      "id": "N13B",
      "turn": 13,
      "title": "Farm Stones and False Numbers - The North Road",
      "narrative": [
        "The road north from the river warehouse carries a thin trail of grain toward an abandoned tollhouse. Orin recognizes the route as one used by Pell's night wagons when the town granary was full.",
        "A family at the first farm agrees to compare its stone against the private bar, but they keep looking toward the road. Pell has told them that anyone who refuses the new debt will lose the right to grind grain at the mill.",
        "The threat makes the farmers' cooperation fragile. A public test could give them courage, while a quiet search of the tollhouse might recover the missing standards before the broker moves them again."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell the family that Pell cannot legally touch their mill and leave them to face his clerk alone.",
          "failTitle": "The Unprotected Farm",
          "failText": "Pell's clerk arrives before the promised help and takes the family's grain book as security, leaving the witness too frightened to join the market account.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Measure the family's stone with Orin, record the threat, and ask Jessa to watch the road to the tollhouse.",
          "scoreDelta": 1,
          "nextNodeId": "N14B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave the family a copy of the common account and continue toward the tollhouse before nightfall.",
          "scoreDelta": 0,
          "nextNodeId": "N14C"
        }
      ]
    },
    {
      "id": "N13C",
      "turn": 13,
      "title": "Farm Stones and False Numbers - A Tollhouse Track",
      "narrative": [
        "The grain line ends at the old tollhouse, whose weighing platform has been covered with fresh boards. Beneath them lies a drag mark shaped like the case that once held the town's standards.",
        "Orin finds a torn strip of Pell's delivery tally in the weeds. It lists a final shipment to Veycross market, but the destination line has been scraped away and rewritten as a private store.",
        "The tollhouse offers a chance to recover the standards and catch Pell's next move. Mira remains with the farmers, readying the separate stone tests that can prove the shortfall if you do not return in time."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the drag mark and search the tollhouse cellar before following the rewritten delivery line.",
          "scoreDelta": 1,
          "nextNodeId": "N14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the tally strip to Mira and let the farmers decide whether the next market should be public.",
          "scoreDelta": 0,
          "nextNodeId": "N14A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the rewritten tally so Pell cannot use it to name a private store.",
          "failTitle": "The Burned Route",
          "failText": "The only link to the missing standards is destroyed, and Pell claims the drag mark came from an ordinary grain cart.",
          "death": false
        }
      ]
    },
    {
      "id": "N14A",
      "turn": 14,
      "title": "The Public Reweighing - A Table of Stones",
      "narrative": [
        "The market court grants Mira a table at the next opening, and farmers arrive carrying their own stones in marked cloths. She places each beside the copied receipts without claiming that any one household measure is perfect.",
        "Orin's private bar is kept under the table until the witnesses have spoken. The method matters: the losses are shown by repeated comparisons, not by one dramatic object Pell can dismiss as a miller's tool.",
        "Pell enters with Provost Caldus and a clean set of official-looking stones. He offers to weigh the farmers' stones himself, hoping to turn the demonstration into another controlled market."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the hearing clerk choose the first three stones while Mira reads only the matching receipt lines.",
          "scoreDelta": 0,
          "nextNodeId": "N15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Allow Pell to handle every stone because he offers to make the weighing faster.",
          "failTitle": "The Broker's Table",
          "failText": "Pell exchanges two marked stones during the bustle and declares the farmers' comparisons inconsistent before the clerk notices the change.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep Pell's stones separate, have Jessa guard the table, and begin with the farms named earliest in the debt book.",
          "scoreDelta": 1,
          "nextNodeId": "N15A"
        }
      ]
    },
    {
      "id": "N14B",
      "turn": 14,
      "title": "The Public Reweighing - A Crowd at the Gate",
      "narrative": [
        "The farmers gather outside the market court while Pell's clerks try to keep them in separate groups. Jessa Rowe places herself between the account books and the waiting carts, preventing anyone from carrying a witness away under the pretense of finding a seat.",
        "Mira has arranged the stone tests by village, and each result matches the common account. The crowd begins to understand that the losses are not a handful of private mistakes but a pattern carried along the same road.",
        "Caldus announces that the review will be postponed unless the missing official standards are produced. A carter at the edge of the crowd recognizes the straw packing from the river warehouse and points toward a cart leaving through the north lane."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the departing cart and leave Mira to hold the crowd without the account books.",
          "failTitle": "The Scattered Account",
          "failText": "The cart is a decoy, and Pell's clerks use your absence to seize the books and disperse the farmers before the results are entered.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Jessa stop the cart while you keep Mira's village table intact and let the crowd witness the results.",
          "scoreDelta": 1,
          "nextNodeId": "N15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the carter to describe the packing while Mira finishes the first village comparison.",
          "scoreDelta": 0,
          "nextNodeId": "N15C"
        }
      ]
    },
    {
      "id": "N14C",
      "turn": 14,
      "title": "The Public Reweighing - The Empty Tollhouse",
      "narrative": [
        "The tollhouse cellar contains no standards, only straw fibers, a broken seal, and a board on which Pell's clerk has written the next market's delivery times. The missing set was moved again, but the schedule shows that Pell expects a large night convoy before dawn.",
        "Back in Veycross, Mira has started the public stone comparisons. The farmers are willing to wait, though Caldus keeps saying that no result matters until the official measures are found.",
        "The convoy schedule gives the investigation a new shape. You can protect the public table and let the evidence build, or follow the night movement and try to recover the standards before Pell uses them at the final review."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Copy the convoy times, return to the market table, and place Jessa on the road before the first cart moves.",
          "scoreDelta": 1,
          "nextNodeId": "N15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Tell Mira the tollhouse is empty and ask her to continue the village comparisons without you.",
          "scoreDelta": 0,
          "nextNodeId": "N15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait in the tollhouse cellar for Pell's convoy without warning the market court.",
          "failTitle": "The Empty Watch",
          "failText": "Pell sends the convoy along another road and arrives at the market with the public table already declared invalid by Caldus.",
          "death": false
        }
      ]
    },
    {
      "id": "N15A",
      "turn": 15,
      "title": "The Night Convoy - Under the Grain Sacks",
      "narrative": [
        "The first three village comparisons are entered before sunset, and even Pell's clean stones cannot explain the same difference appearing in every account. Caldus orders the table closed, but the hearing clerk keeps the pages under his seal.",
        "Mira hears from Harn that Pell's night convoy will leave the river warehouse after the moon rises. Orin says the missing standards could be hidden beneath the grain sacks, where a casual search would look only for stolen food.",
        "The public evidence has bought a little time. Now the convoy must be watched without allowing Pell to claim that the ranger is attacking a lawful grain delivery."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the convoy from a distance and let Mira keep the sealed results at the court.",
          "scoreDelta": 0,
          "nextNodeId": "N16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stop the first cart in the open road and order every sack unloaded at once.",
          "failTitle": "The Broken Convoy",
          "failText": "The carts scatter under the alarm, and Pell claims that the ranger caused the loss of lawful winter grain while the standards vanish in the confusion.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark each cart's wheel and load, then wait for the convoy to reach the old weighing yard before intervening.",
          "scoreDelta": 1,
          "nextNodeId": "N16A"
        }
      ]
    },
    {
      "id": "N15B",
      "turn": 15,
      "title": "The Night Convoy - A Sealed Result",
      "narrative": [
        "The hearing clerk seals the village comparisons and refuses Caldus's demand to return them. Pell leaves the court smiling, saying that the missing standards will settle everything at dawn.",
        "Jessa reports that several empty carts have gathered behind the old market wall. Harn recognizes the drivers as men who worked at the counting house, while Mira notices that the convoy schedule copied at the tollhouse matches their departure order.",
        "The evidence is safe for the moment, but the grain and standards are about to move together. If the convoy reaches Pell's private store, the public account may be dismissed as a dispute over paper."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the sealed results with the clerk and confront the empty carts without Jessa or Harn.",
          "failTitle": "The Unwatched Seal",
          "failText": "Pell's men seize the clerk on the road and break the seal, then use the empty carts to claim that no grain or standards were ever moved.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep Mira with the sealed account, take Jessa and Harn to the wall, and identify the convoy's marked lead cart.",
          "scoreDelta": 1,
          "nextNodeId": "N16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Harn to watch the drivers while you bring the sealed results to Orin at the mill.",
          "scoreDelta": 0,
          "nextNodeId": "N16C"
        }
      ]
    },
    {
      "id": "N15C",
      "turn": 15,
      "title": "The Night Convoy - A Lantern on the Road",
      "narrative": [
        "The carter's account confirms that the straw-packed case left the river warehouse beneath a load of barley. He saw Pell's red lantern signal the convoy to turn toward the abandoned weighing yard rather than the town granary.",
        "Mira finishes the first comparisons and asks you not to let Pell move the evidence into a place where the public cannot see it. Orin offers the mill race as a route around the roadblock, but he cannot leave the market table without losing the farmers' trust.",
        "The night convoy is close enough to intercept and organized enough to punish a careless approach. Your companions must be placed where they can preserve both the witnesses and the proof."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send the carter to warn Jessa, take the mill-race path, and wait at the weighing yard's dark side.",
          "scoreDelta": 1,
          "nextNodeId": "N16C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay with Mira until the next comparison is entered, then follow the red lantern from the market.",
          "scoreDelta": 0,
          "nextNodeId": "N16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride straight toward the red lantern and call the convoy to halt before reaching the yard.",
          "failTitle": "The False Lantern",
          "failText": "The lantern is a decoy, and the true convoy takes the river road with the standards while the market witnesses are left without protection.",
          "death": false
        }
      ]
    },
    {
      "id": "N16A",
      "turn": 16,
      "title": "The Old Weighing Yard - The Case Beneath Barley",
      "narrative": [
        "At the abandoned weighing yard, the lead cart settles beside a broken platform. The barley sacks are damp from the river, but one case beneath them is wrapped in the same straw found at the tollhouse.",
        "Jessa and Harn cover the road while you open the case with Orin's small mill knife. Inside lie the town's true stone standards, each carrying the old seal, along with a clean set of false stones prepared for the morning review.",
        "The recovery is decisive, yet Pell is not present. A fresh track leaves the yard toward the old granary, where the broker may be moving the hidden grain before anyone can connect the case to his books."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Wrap the true standards, leave the false set marked, and bring the case back to Mira at the market court.",
          "scoreDelta": 0,
          "nextNodeId": "N17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take the standards and ride after the fresh granary track without telling Jessa what you found.",
          "failTitle": "The Unmarked Case",
          "failText": "Pell's men recover the false stones and claim the true set was planted, while your companions cannot explain where the case came from.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Harn guard the case, send Jessa to Mira, and follow the granary track with Orin before it cools.",
          "scoreDelta": 1,
          "nextNodeId": "N17A"
        }
      ]
    },
    {
      "id": "N16B",
      "turn": 16,
      "title": "The Old Weighing Yard - The Decoy Cart",
      "narrative": [
        "The empty carts lead to the old weighing yard, where one covered wagon waits beside the broken platform. Harn identifies the driver as Pell's clerk, but the wagon holds only straw and a false set of stones polished to look new.",
        "Jessa finds the true convoy's wheel marks leaving by the rear track. Mira's sealed results remain safe at the court, yet the missing standards and the stolen grain are already moving toward the old granary.",
        "The decoy proves that Pell expected pursuit. You can expose it before the clerk, or use the time it bought to reach the true convoy while the road is still open."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest the clerk at once and spend the night demanding that he reveal the true convoy's route.",
          "failTitle": "The Decoy's Hour",
          "failText": "The true convoy reaches the granary during the delay, and Pell uses the empty wagon to claim that no official standards were moved.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Jessa hold the clerk, mark the false stones, and follow the rear track with Harn as your witness.",
          "scoreDelta": 1,
          "nextNodeId": "N17B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave the clerk with the yard keeper and take the rear track toward the old granary.",
          "scoreDelta": 0,
          "nextNodeId": "N17C"
        }
      ]
    },
    {
      "id": "N16C",
      "turn": 16,
      "title": "The Old Weighing Yard - Grain in the Dark",
      "narrative": [
        "The mill-race path brings you behind the old weighing yard just as the red lantern is covered. Orin recognizes the lead cart and whispers that its load sits too high for barley alone.",
        "A board under the wagon shows fresh scratches from a stone case. Jessa arrives from the market with the carter, while Mira keeps the public table open and the farmers gathered under the court awning.",
        "The hidden case can be secured, but the wagon drivers are watching the road toward the granary. If you make the recovery public too soon, Pell may abandon the grain and scatter the standards."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Have Jessa hold the drivers, let Orin identify the load, and remove the stone case without disturbing the sacks.",
          "scoreDelta": 1,
          "nextNodeId": "N17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the carter to keep watch while you follow the wagon's fresh track toward the granary.",
          "scoreDelta": 0,
          "nextNodeId": "N17A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Uncover every sack under the lantern and call the waiting farmers from the market to see the theft.",
          "failTitle": "The Scattered Standards",
          "failText": "The drivers overturn the case in the darkness, and the true stones roll into the weeds while Pell's grain carts escape toward the river.",
          "death": false
        }
      ]
    },
    {
      "id": "N17A",
      "turn": 17,
      "title": "The Old Granary - The Hidden Ledger",
      "narrative": [
        "The granary track ends at a low storehouse built into the riverbank. Orin finds the door barred from inside, but the grain dust beneath it proves that the missing stock has been brought in recently.",
        "Through a roof gap you see Pell's clerk stacking sacks beside the recovered standards case. A ledger lies open on a crate, its last page prepared for the final review and its blank spaces waiting for Caldus's seal.",
        "The storehouse contains the physical theft and the written plan together. A quiet entry could preserve both, while a loud challenge may send the ledger into the river sluice behind the building."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Jessa cover the river sluice and call the clerk out before entering the storehouse.",
          "scoreDelta": 0,
          "nextNodeId": "N18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the main bar with an axe and rush toward the open ledger.",
          "failTitle": "The River Ledger",
          "failText": "The clerk throws the ledger through the rear sluice, and the stored grain blocks the doorway before the witnesses can enter.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Enter through the roof gap, secure the ledger first, and signal Jessa only after the sluice is covered.",
          "scoreDelta": 1,
          "nextNodeId": "N18A"
        }
      ]
    },
    {
      "id": "N17B",
      "turn": 17,
      "title": "The Old Granary - False Stones in Hand",
      "narrative": [
        "The true standards are carried back under Harn's guard while the false set from the decoy cart remains sealed at the weighing yard. Pell's clerk finally admits that both sets were meant for the morning review, but he says the ledger proving the order is at the old granary.",
        "Mira arrives with the sealed village results and sees that the false stones carry the same concealed plug as the first market weight. Orin identifies the granary's side road as the route used for every unrecorded load.",
        "The case and the public account now support one another. The final ledger is still at risk, and Pell may use the grain itself as cover while he destroys the names of the farms."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the false set at the yard and ride directly to the granary without taking the clerk as a witness.",
          "failTitle": "The Unclaimed Stones",
          "failText": "Pell's men remove the decoy set and deny that it belonged to the convoy, while the clerk's confession is dismissed as a frightened servant's story.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Bring the clerk, Harn, and the sealed results together, then approach the granary with Jessa on the sluice.",
          "scoreDelta": 1,
          "nextNodeId": "N18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Mira guard the cases and take Orin to the granary's side road to find the ledger.",
          "scoreDelta": 0,
          "nextNodeId": "N18C"
        }
      ]
    },
    {
      "id": "N17C",
      "turn": 17,
      "title": "The Old Granary - A Door by the Water",
      "narrative": [
        "The rear track reaches the granary's water door, where a rope has been cut and retied to make the building appear locked. Inside, grain sacks fill the lower room, and the true standards case rests on a high shelf beside a ledger.",
        "Orin hears movement above. Pell's clerk is packing papers into a leather satchel, while a second man stands near the sluice gate with a hammer. The hidden grain can be returned, but the records will not survive a struggle near the water.",
        "Mira's public table is still drawing farmers in Veycross. The evidence must leave the granary in a form that the hearing clerk can understand, not merely as objects rescued from a dark room."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send Orin to close the sluice, climb for the standards case, and ask Jessa to secure the satchel.",
          "scoreDelta": 1,
          "nextNodeId": "N18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Call for the clerk to set down the satchel while you keep the water-door passage clear.",
          "scoreDelta": 0,
          "nextNodeId": "N18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Jump onto the grain sacks and seize the satchel before anyone reaches the upper shelf.",
          "failTitle": "The Broken Sluice",
          "failText": "The hammer strikes the gate, water rushes across the lower room, and the standards and ledger are swept into separate dark corners.",
          "death": false
        }
      ]
    },
    {
      "id": "N18A",
      "turn": 18,
      "title": "The Last Ledger - Names Against Grain",
      "narrative": [
        "The ledger is secured before the sluice can be opened. Its pages show the full scheme: false measures increased every delivery, private debts transferred the loss to the millers, and Caldus promised Pell control of the valley stores after the review.",
        "Pell's clerk drops the hammer and says Pell is already riding for Veycross with the clean stones. He will present the broker's set before Mira's village table and claim that the ranger found only abandoned grain.",
        "The ledger names every farm, but a hearing needs the people and the objects together. Jessa can escort the witnesses, while you must decide whether to carry the ledger openly or preserve it until Pell is forced to speak."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the ledger under seal with the witnesses and let Pell present his clean stones first.",
          "scoreDelta": 0,
          "nextNodeId": "N19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Read the ledger aloud to the granary workers and let the crowd decide Pell's guilt before the review.",
          "failTitle": "The Grain Riot",
          "failText": "Anger breaks the orderly evidence chain, and Pell uses the disorder to claim that the hidden grain was attacked by a mob rather than recovered lawfully.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the ledger beside the true standards, take the clerk as witness, and return before Pell reaches the public table.",
          "scoreDelta": 1,
          "nextNodeId": "N19A"
        }
      ]
    },
    {
      "id": "N18B",
      "turn": 18,
      "title": "The Last Ledger - The Witness Chain",
      "narrative": [
        "Jessa secures the river sluice while Harn, Orin, and Pell's clerk stand together beside the standards case. The clerk identifies the straw packing and admits that Pell ordered the case moved before each market review.",
        "Mira opens the ledger only long enough to match the first three farm names with her sealed account. The agreement between the written records, the true stones, and the living witnesses leaves Caldus little room to call the evidence a ranger's invention.",
        "Pell is still in Veycross, where his clean stones are being placed on the public table. The evidence can win if it arrives in order, but the broker may try to make the witnesses contradict one another before the clerk records them."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the witnesses ahead separately while you carry the standards case alone.",
          "failTitle": "The Broken Chain",
          "failText": "Pell's men meet the separated witnesses on different roads, and the hearing receives four partial accounts instead of one chain tied to the ledger.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the witnesses together, place the true standards between them, and have Mira carry the sealed ledger.",
          "scoreDelta": 1,
          "nextNodeId": "N19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Harn lead the clerk toward town while you and Orin bring the case by the mill road.",
          "scoreDelta": 0,
          "nextNodeId": "N19C"
        }
      ]
    },
    {
      "id": "N18C",
      "turn": 18,
      "title": "The Last Ledger - Water Shut Out",
      "narrative": [
        "The sluice is closed and the standards case is safe, though several ledger pages have been splashed and the ink is beginning to run at the edges. Orin saves the pages by laying them flat on flour boards from the upper room.",
        "Pell's clerk points to a delivery column showing that the final grain was meant for Veycross, not for the hidden store. He says Pell intends to make the public shortage appear proof that the mills have failed their duty.",
        "The surviving ledger and the recovered standards are enough to challenge the scheme, but the wet pages must reach Mira before their figures blur."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Separate the damp pages, give the standards to Jessa, and carry the ledger boards at a steady pace to Veycross.",
          "scoreDelta": 1,
          "nextNodeId": "N19C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave the pages drying with Orin and return with the standards before Pell's public weighing.",
          "scoreDelta": 0,
          "nextNodeId": "N19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Stuff the damp ledger into a saddlebag so you can ride to town at full speed.",
          "failTitle": "The Blurred Names",
          "failText": "The pages smear together on the road, erasing the farm names that connected the false measures to Pell's debt plan.",
          "death": false
        }
      ]
    },
    {
      "id": "N19A",
      "turn": 19,
      "title": "The Final Weighing - The True Stone",
      "narrative": [
        "You reach the market court as Pell places his clean stones on Mira's table. Caldus announces that the standards have been found in a storehouse, implying that the ranger planted them there after hiding the first set.",
        "Mira answers with the sealed ledger, Orin's private bar, and the true standards case. Harn identifies the straw packing, while the millers open their books to the matching farm names.",
        "The court has one chance to settle the matter without another argument of seals and signatures. The true stone must be compared with Pell's clean set in front of the people whose grain was taken."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the hearing clerk conduct the comparison while Mira reads the ledger entries in order.",
          "scoreDelta": 0,
          "nextNodeId": "N20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take the clean stones from Pell's table and smash them before the comparison begins.",
          "failTitle": "The Shattered Proof",
          "failText": "The broken stones cannot be compared, and Pell claims the ranger destroyed the only objects that could have cleared his name.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Place the true stone beside Pell's set, keep both hands visible, and have Mira name the first matching receipt.",
          "scoreDelta": 1,
          "nextNodeId": "N20A"
        }
      ]
    },
    {
      "id": "N19B",
      "turn": 19,
      "title": "The Final Weighing - The Farmers' Turn",
      "narrative": [
        "The witnesses enter together, and the market crowd makes room for the standards case. Pell tries to speak over Harn, Orin, and the clerk, but the hearing clerk orders each account entered separately before any conclusion is drawn.",
        "Mira places the common village table beside the true stone. The figures do not depend on one witness: each farmer's private measure shows the same extra grain demanded by Pell's marked stone.",
        "Caldus asks whether the true standards were kept under the ranger's control. Jessa answers that she guarded the case from the old yard onward, and the clerk records her statement beside the ledger's chain of custody."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Interrupt the hearing and accuse Caldus before the farmers have finished their comparisons.",
          "failTitle": "The Interrupted Record",
          "failText": "Caldus turns the interruption into a claim of disorder, and the clerk postpones the weighing until Pell can prepare a cleaner defense.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let each farmer compare one stone, then ask the clerk to read Pell's matching debt line aloud.",
          "scoreDelta": 1,
          "nextNodeId": "N20B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Orin demonstrate the private bar after the first two farmers have spoken.",
          "scoreDelta": 0,
          "nextNodeId": "N20C"
        }
      ]
    },
    {
      "id": "N19C",
      "turn": 19,
      "title": "The Final Weighing - Pages at the Edge",
      "narrative": [
        "The damp ledger reaches the court on flour boards, its edges warped but its farm names still legible. Mira lays the pages beside the true standards while Pell's clerk watches the ink spread in the corners.",
        "Pell claims that water damage proves the ledger cannot be trusted. Orin answers by placing his dry mill book beside the same debt line, and Harn points to the cart mark that carried the standards through the river warehouse.",
        "The proof is less neat than Mira wanted, but every surviving object points in the same direction. The final comparison must make that agreement plain to the crowd and the hearing clerk."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Orin's dry book to read each surviving ledger line, then compare the true stone with Pell's set.",
          "scoreDelta": 1,
          "nextNodeId": "N20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the clerk to record the readable names before the standards are placed on the public beam.",
          "scoreDelta": 0,
          "nextNodeId": "N20A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hide the wet pages and rely on the true stones to speak for the missing names.",
          "failTitle": "The Nameless Loss",
          "failText": "Without the pages, the comparison proves a false stone but not the wider debt plan, allowing Pell to sacrifice one tool and keep the mills under claim.",
          "death": false
        }
      ]
    },
    {
      "id": "N20A",
      "turn": 20,
      "title": "The Hollow Stone Measure - The Account Restored",
      "narrative": [
        "The true standard balances cleanly against the old farm stones, while Pell's polished set demands extra grain from every pan. The crowd sees the difference before the clerk finishes the first entry.",
        "Mira reads the ledger's names, Orin confirms the private bar, and Harn identifies the route by which the standards were hidden. Provost Caldus has no answer for the reversed seal hook or the debts prepared before the losses occurred.",
        "Jessa closes the case and returns the true measures to the town rack. Pell's grain is counted back toward the farms, and the hearing clerk writes that Riverland's shortage was manufactured rather than earned."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Have Jessa seal Pell's stores, return each measured loss to its farm, and enter Caldus's role beside the debt schedule.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the clerk finish the public inventory and accept a cautious settlement for the first lost deliveries.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Allow Pell to remove his grain before the clerk has entered the final balance.",
          "failTitle": "The Unfinished Balance",
          "failText": "Pell takes the uncounted stores beyond the court, leaving the villages with proof of fraud but too little grain recovered for winter.",
          "death": false
        }
      ]
    },
    {
      "id": "N20B",
      "turn": 20,
      "title": "The Hollow Stone Measure - Nine Voices",
      "narrative": [
        "Nine farmers compare their stones, and nine times Pell's marked weight asks for more grain than the true standard. The result does not depend on a single household or a single memory; it is a pattern carried through the whole valley.",
        "Mira joins the results to the ledger, Orin's mill book, and the clerk's account of the hidden case. Pell's polished stones are taken from the table, and Caldus's seal is held beside the altered receipts for the town to see.",
        "The crowd quiets when the clerk names the farms that would have been seized after the next delivery. The market has become a record of the attempted theft, and the grain can now be divided back under lawful witness."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the farmers home before the clerk records the matching debt lines beside their results.",
          "failTitle": "The Separated Voices",
          "failText": "Pell calls the comparisons a collection of private disputes, and the unrecorded debt links remain available for a later claim.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have every farmer sign beside one comparison and ask the clerk to attach the ledger page to the public account.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept the clerk's finding and let the mills negotiate repayment before the stores are divided.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "N20C",
      "turn": 20,
      "title": "The Hollow Stone Measure - What the Water Spared",
      "narrative": [
        "The dry mill book restores the names that the water blurred, and the true standard exposes the false set before Pell can touch either one. The damaged ledger is not perfect, but its surviving figures agree with every comparison Mira recorded.",
        "Harn identifies the straw case, Jessa confirms its custody, and Orin describes the private bar used at his mill. Together they show that the hidden grain was collected through a planned fraud rather than a season of honest shortage.",
        "The hearing clerk orders Pell's stores counted and Caldus's seal held for Duke Aldric's judgment. Riverland will not recover every spilled measure, but the mills remain in their owners' hands and the next winter delivery will use standards no broker controls."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Have Mira preserve the surviving pages, return the true standards to the rack, and seal the recovered grain by farm.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the clerk record the partial recovery and leave the damaged pages with the town archive.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Give the wet ledger to Pell so he can identify which pages still belong to his accounts.",
          "failTitle": "The Broker's Last Page",
          "failText": "Pell tears away the readable names before the clerk can stop him, leaving enough evidence for a warning but not enough to restore every farmer's claim.",
          "death": false
        }
      ]
    }
  ]
});
