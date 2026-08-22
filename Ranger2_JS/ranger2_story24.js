window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-cold-coin",
  "title": "The Cold Coin",
  "summary": "Silver pennies paid to Brackenwald's soldiers turn black in the hand, while merchants refuse the duke's money and winter trade falters. The ranger and money changer Leda Marr uncover a scheme of debased coin, stolen tax silver, and official records meant to make a private fortune look like a royal shortage.",
  "maxTurns": 20,
  "startNodeId": "O01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The false dies, stolen silver, and altered assay books are placed before Duke Aldric's judges. Soldiers receive sound pay, merchants reopen their shutters, and Leda Marr is named keeper of Oakenhurst's exchange tables under Tobin Vale's careful instruction. Garren Voss and Reeve Nella Quist answer for turning the duke's coin into a weapon against his own people.",
    "low": "The worst of the false coin is withdrawn and enough silver is recovered to keep the winter muster supplied, though the hidden records are incomplete. Aldric orders every market in Brackenwald to reweigh its money, and Oakenhurst spends a long season learning which promises can still be trusted."
  },
  "nodes": [
    {
      "id": "O01A",
      "turn": 1,
      "title": "Black Marks at the Muster - A Coin in the Palm",
      "narrative": [
        "You arrive at Oakenhurst beneath a hard gray sky as soldiers from the western watch crowd outside the pay hall. Their silver pennies have left dark smears across their palms, and the market sellers refuse to take the coins for bread or lamp oil.",
        "Leda Marr, a money changer with a brass balance, has sent for Duke Aldric's ranger. She shows you three pennies that look sound at the edge but flake black when rubbed against wool, each bearing the same tiny crescent cut beside the duke's face.",
        "The trouble is not a merchant's insult. If the garrison's pay cannot buy food, soldiers will blame the duke, while false coin moving through the markets can empty honest purses before winter closes the roads."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test the three pennies against Leda's balance and preserve the black flakes in separate paper folds.",
          "scoreDelta": 1,
          "nextNodeId": "O02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the soldiers which stalls rejected their pay while Leda records each coin's mark.",
          "scoreDelta": 0,
          "nextNodeId": "O02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order the merchants to accept the duke's pennies until the matter is investigated.",
          "failTitle": "The Forced Market",
          "failText": "The merchants close their shutters and hide their silver, while the soldiers decide that the ranger has chosen authority over proof.",
          "death": false
        }
      ]
    },
    {
      "id": "O01B",
      "turn": 1,
      "title": "Black Marks at the Muster - Voices by the Pay Hall",
      "narrative": [
        "By the time you reach Oakenhurst's pay hall, the dispute has spilled into the street. Soldiers hold out darkened pennies, and merchants answer that the duke's seal cannot make worthless metal buy a loaf.",
        "Leda Marr keeps the crowd from trampling her balance. She says every bad coin carries a small crescent beside the duke's face, though the mark is hidden until the thin silver skin begins to peel.",
        "The town needs a clear answer before rumor becomes a riot. Someone is putting false money into official hands, and the first task is to learn whether the coins came from one purse or many."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take separate accounts from a baker, a saddler, and a soldier before examining their pennies.",
          "scoreDelta": 0,
          "nextNodeId": "O02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Call Garren Voss, the town's largest metal dealer, a counterfeiter before the crowd.",
          "failTitle": "An Accusation in the Street",
          "failText": "Garren turns the crowd against you with his reputation for supplying the garrison, and Leda's coins are seized as evidence of a ranger's insult.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Close Leda's exchange table, separate the darkened pennies, and ask Sergeant Bram Hale to hold the soldiers back.",
          "scoreDelta": 1,
          "nextNodeId": "O02B"
        }
      ]
    },
    {
      "id": "O01C",
      "turn": 1,
      "title": "Black Marks at the Muster - The Last Exchange",
      "narrative": [
        "You reach the exchange after dusk, when only Leda Marr and a tired sergeant remain under the pay hall's awning. A rejected penny lies on the counter beside a smear as dark as stove soot.",
        "Leda says the coin was offered by a soldier who had received it that morning. Its edge is too smooth for a clipped piece, yet the surface has a faint gray skin that catches on her cloth and exposes a copper color beneath.",
        "The last light makes every detail valuable. If the coin leaves with the next patrol, the source may be carried beyond Oakenhurst before anyone has a chance to trace the crescent mark."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the patrol take the rejected penny while you return in the morning with better light.",
          "failTitle": "Gone with the Patrol",
          "failText": "The coin disappears along the western road, and the men who paid it out replace their purses before a second examination can begin.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the rejected penny in waxed cloth and follow the patrol's route to the pay hall storeroom.",
          "scoreDelta": 1,
          "nextNodeId": "O02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the sergeant about the pay chest while Leda writes down the coin's crescent cut.",
          "scoreDelta": 0,
          "nextNodeId": "O02A"
        }
      ]
    },
    {
      "id": "O02A",
      "turn": 2,
      "title": "A Skin of Silver - The Balance Test",
      "narrative": [
        "Leda's balance shows that the blackened pennies are too light for their marks. When warmed beside a lamp, one releases a sharp metal smell and a dull copper line appears beneath its silver-colored skin.",
        "The crescent is not a mint sign. Tobin Vale, a retired assayer whom Leda remembers from the old counting house, once used a similar notch to mark test pieces that were never meant for trade.",
        "The coins have been made to survive a quick glance and fail only after they have travelled through many hands. A maker must be preparing them in quantity, not striking a few desperate copies in a back room."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Leda to find Tobin Vale while you question the pay hall porter about sealed chests.",
          "scoreDelta": 0,
          "nextNodeId": "O03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scrape the silver skin from every coin before recording how the surface was applied.",
          "failTitle": "Ruined Samples",
          "failText": "The thin skins tear away with the evidence of their joining, leaving only damaged pennies that Garren can dismiss as badly handled money.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Weigh each penny, sketch its crescent, and send Leda to bring Tobin before the coins cool.",
          "scoreDelta": 1,
          "nextNodeId": "O03A"
        }
      ]
    },
    {
      "id": "O02B",
      "turn": 2,
      "title": "A Skin of Silver - Market Accounts",
      "narrative": [
        "The baker, saddler, and sergeant all describe the same change: the pennies were accepted at one stall, then refused when someone rubbed them against a cloth. Each bad coin came through a different purse but carried the tiny crescent.",
        "Leda compares their dates with her exchange book and finds that the false money first appeared after a tax chest was counted at the pay hall. The entries were signed by Reeve Nella Quist, whose office controls Oakenhurst's local coin tables.",
        "The accounts show distribution, not origin. A public chest may have been tampered with, or the false pennies may be entering through merchants who have no idea what they carry."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the three witnesses home after taking only their spoken word.",
          "failTitle": "Loose Accounts",
          "failText": "The witnesses are questioned separately by the reeve's men and later remember different details, allowing the false coin to be called a market rumor.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Leda copy the exchange dates while you ask Sergeant Bram Hale who opened the tax chest.",
          "scoreDelta": 1,
          "nextNodeId": "O03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the witnesses together and ask which merchant first accepted their darkened pennies.",
          "scoreDelta": 0,
          "nextNodeId": "O03C"
        }
      ]
    },
    {
      "id": "O02C",
      "turn": 2,
      "title": "A Skin of Silver - The Pay Chest",
      "narrative": [
        "Sergeant Bram Hale leads you to the pay hall storeroom, where the morning chest was opened. The lock is sound, but gray powder lies in the hinge and a few darkened pennies are wedged beneath the empty lining.",
        "The storeroom porter says Garren Voss's men delivered the chest under Reeve Nella Quist's seal. He remembers one smaller box that was carried away before the soldiers were paid, though he cannot say what it contained.",
        "The false coin may have been mixed with official pay at the last moment. The missing box offers a trail, while the powder may tell Tobin Vale how the silver skin was made."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the hinge powder, mark the missing box's shelf, and send Bram for Tobin Vale.",
          "scoreDelta": 1,
          "nextNodeId": "O03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the porter to describe Garren's delivery cart while Leda records the chest's seal.",
          "scoreDelta": 0,
          "nextNodeId": "O03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the storeroom lock to search for a second hidden chest.",
          "failTitle": "The Broken Seal",
          "failText": "Reeve Quist declares the room contaminated by your search, and the hinge powder is swept away before Tobin can inspect it.",
          "death": false
        }
      ]
    },
    {
      "id": "O03A",
      "turn": 3,
      "title": "The Assayer's Mark - Copper Beneath Silver",
      "narrative": [
        "Tobin Vale examines the flakes through a small lens and confirms that the pennies are copper blanks washed with a thin silver alloy. The coating was applied in heat, not painted on, which requires a controlled furnace and a skilled hand.",
        "He recognizes the crescent as his old test mark. Years ago, he used it to reject trial pieces at Oakenhurst's mint store, but the official dies and ledgers were supposed to have been sealed when the store closed.",
        "Someone has reopened a process that only a trained assayer would understand. Tobin can identify the metal, while the pay hall trail may reveal who gained access to the old mint records."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Have Tobin preserve the coating sample and take him to the sealed mint store before its records are moved.",
          "scoreDelta": 1,
          "nextNodeId": "O04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Bram to learn who last carried a key to the old mint while Leda copies Tobin's notes.",
          "scoreDelta": 0,
          "nextNodeId": "O04B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare Tobin's old mark proof that he made the false pennies himself.",
          "failTitle": "The Retired Assayer",
          "failText": "Tobin is taken into custody before he can explain the furnace method, and the only man who can distinguish the false coating from honest silver is silenced.",
          "death": false
        }
      ]
    },
    {
      "id": "O03B",
      "turn": 3,
      "title": "The Assayer's Mark - The Reeve's Ledger",
      "narrative": [
        "Reeve Nella Quist's ledger shows that the tax chest was counted twice on the same morning. The first count lists honest silver; the second adds a number of pennies described only as emergency pieces.",
        "Tobin Vale confirms that Oakenhurst has no lawful emergency coin. The phrase came from an old mint form used during a famine long ago, and someone copied it from a record rather than inventing it.",
        "Garren Voss supplied the metal for the second count, but the reeve's seal made the entry appear official. The ledger may prove permission, while Tobin's test may prove what that permission concealed."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Leda copy the emergency entry while you ask Tobin where the old form was stored.",
          "scoreDelta": 0,
          "nextNodeId": "O04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear the emergency entry from the reeve's ledger and carry it away.",
          "failTitle": "The Missing Page",
          "failText": "Quist calls the page stolen and replaces it with a cleaner copy, leaving no proof that the false phrase came from the mint records.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the ledger intact and have Tobin compare the emergency phrase with the old mint forms.",
          "scoreDelta": 1,
          "nextNodeId": "O04B"
        }
      ]
    },
    {
      "id": "O03C",
      "turn": 3,
      "title": "The Assayer's Mark - A Delivery Trail",
      "narrative": [
        "The porter remembers Garren Voss's cart by its cracked rear axle and a smell of hot vinegar from the covered box. The cart left the pay hall toward the abandoned dye road rather than toward Garren's metal yard.",
        "Tobin Vale identifies the gray powder as a residue from silver washing. He says the work needs a warm room, a bath of acid, and a die that can give a false coin the proper weight and face.",
        "Leda finds that the delivery was recorded under the emergency phrase from the reeve's ledger. The trail now joins a secret workshop to an official entry, but the cart marks are fading in the damp lane."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the porter alone to identify Garren's cart at the abandoned dye road.",
          "failTitle": "The Exposed Porter",
          "failText": "Garren's men find the porter first and force him to deny the cart, while the cracked axle is repaired before you reach the road.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cracked axle marks with Bram while Tobin wraps the powder and Leda guards the ledger copy.",
          "scoreDelta": 1,
          "nextNodeId": "O04C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question the dye-road watchman about hot vinegar while Tobin prepares a second coin test.",
          "scoreDelta": 0,
          "nextNodeId": "O04A"
        }
      ]
    },
    {
      "id": "O04A",
      "turn": 4,
      "title": "The Empty Exchange - Leda's Trail",
      "narrative": [
        "The dye-road watchman points to an abandoned bathhouse where the cracked axle marks vanish beside a blocked arch. Leda Marr was there moments earlier, following a man who carried a ledger page from the reeve's office.",
        "A gray silver tabby with green eyes slips from the bathhouse's broken wall and darts across the yard. The movement draws Bram's attention to a loose shutter, behind which Leda's brass balance has been hidden with a smear of fresh blood on its pan.",
        "Leda is missing, but the balance shows she was examining a coin when she was taken. Tobin warns that the bathhouse may be a workshop entrance, and the person who carried the page may know the route beneath it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Bram at the shutter and search the bathhouse's public rooms for Leda's footprints.",
          "scoreDelta": 0,
          "nextNodeId": "O05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the tabby through the broken wall and leave the bathhouse entrance unguarded.",
          "failTitle": "The False Chase",
          "failText": "The cat vanishes into the yard, while Garren's men use the open entrance to remove Leda and the hidden coin work before you return.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the loose shutter, follow the blood-flecked balance trail, and have Bram cover the blocked arch.",
          "scoreDelta": 1,
          "nextNodeId": "O05A"
        }
      ]
    },
    {
      "id": "O04B",
      "turn": 4,
      "title": "The Empty Exchange - A Page Torn Free",
      "narrative": [
        "Tobin's comparison proves that the emergency phrase was copied from a mint form sealed in the old bathhouse archives. When you return to Leda's exchange, her stool is overturned and one page of her book has been torn away.",
        "The missing page listed every soldier who brought a darkened penny to her table. A brass balance lies under the counter, its pan stained with a small red smear and its chain bent as if someone pulled it in haste.",
        "Leda may have been taken because she could connect the false coins to the official pay chest. Tobin knows the bathhouse archive has a service passage, while Bram can search the market lanes for witnesses."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the exchange open and ask the next customers whether Leda has gone home.",
          "failTitle": "The Unwatched Exchange",
          "failText": "Garren's clerk returns for the balance and remaining books, leaving you with a room full of ordinary customers who saw nothing useful.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the exchange, send Bram through the market lanes, and take Tobin to the bathhouse service passage.",
          "scoreDelta": 1,
          "nextNodeId": "O05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Bram to find the torn page while you inspect the bent balance for the coin Leda was testing.",
          "scoreDelta": 0,
          "nextNodeId": "O05C"
        }
      ]
    },
    {
      "id": "O04C",
      "turn": 4,
      "title": "The Empty Exchange - The Bathhouse Road",
      "narrative": [
        "The cracked axle marks end at the old bathhouse, where the dye road meets a line of disused store rooms. Leda Marr's exchange book lies open on a barrel, but Leda herself is gone.",
        "Tobin finds the emergency mint phrase copied in the margin beside a list of silver quantities. The page has been torn from a larger ledger, and a fresh smear of copper-colored paste runs toward a blocked arch.",
        "Someone has used the bathhouse as more than a storage place. The blocked arch may hide a service tunnel, while the open book may tell you whether Leda came here willingly or was lured by the coin records."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the paste mark, have Bram guard the open book, and clear only the arch stones that bear fresh dust.",
          "scoreDelta": 1,
          "nextNodeId": "O05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Read the open page beside Tobin while Bram checks the store rooms for a second door.",
          "scoreDelta": 0,
          "nextNodeId": "O05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Smash the blocked arch apart before examining the dust around its stones.",
          "failTitle": "The Buried Passage",
          "failText": "The collapse seals the service tunnel and buries the coin dies beneath rubble, while Leda's trail is lost in the dust.",
          "death": false
        }
      ]
    },
    {
      "id": "O05A",
      "turn": 5,
      "title": "The Old Bathhouse - A Living Witness",
      "narrative": [
        "The service passage leads to a warm chamber below the bathhouse. Leda Marr is tied beside a dry cistern, shaken but able to speak, and a young metalworker lies nearby with a bruised shoulder.",
        "Leda says she followed the emergency phrase because it appeared in the reeve's book. The metalworker, Pellin Rusk, was forced to plate coin blanks and knows that Garren Voss visited the chamber with a key bearing Nella Quist's seal.",
        "The chamber contains no finished money, only copper blanks and a broken die wrapped in cloth. Leda can identify the stolen page, while Pellin can explain the furnace route if he is kept from the men who brought him here."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Free Leda and Pellin, preserve the broken die, and lead both witnesses through the service passage.",
          "scoreDelta": 1,
          "nextNodeId": "O06A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the witnesses in the chamber while Pellin describes the furnace and Leda checks the torn page.",
          "scoreDelta": 0,
          "nextNodeId": "O06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Question Pellin at sword point before freeing Leda from the cistern wall.",
          "failTitle": "The Frightened Metalworker",
          "failText": "Pellin panics and kicks the broken die into the cistern, while Leda is left exposed when Garren's men enter from the furnace side.",
          "death": false
        }
      ]
    },
    {
      "id": "O05B",
      "turn": 5,
      "title": "The Old Bathhouse - A Clean Chamber",
      "narrative": [
        "The public rooms reveal a hidden stair but no Leda. In the lower chamber you find copper blanks, silver-washing bowls, and a cot with a torn sleeve caught beneath it.",
        "Tobin identifies the sleeve as a metalworker's, not Leda's. A broken die lies near the cold furnace, and its face carries the duke's profile with the left eye cut slightly too deep.",
        "The workshop was cleared in haste. The torn sleeve may belong to a living worker who can name the furnace owner, while the die can prove that the false coins were made here rather than merely stored."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Tobin sketch the broken die while Bram searches the bathhouse roof for a way out.",
          "scoreDelta": 0,
          "nextNodeId": "O06C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour water over the bowls to remove the silver residue before collecting it.",
          "failTitle": "Washed Evidence",
          "failText": "The residue runs into the floor cracks, and the workshop can be described as an ordinary bathhouse with abandoned tools.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the die and bowls, then follow the torn sleeve's thread through the hidden stair.",
          "scoreDelta": 1,
          "nextNodeId": "O06B"
        }
      ]
    },
    {
      "id": "O05C",
      "turn": 5,
      "title": "The Old Bathhouse - A Voice Behind Stone",
      "narrative": [
        "The careful clearing opens a narrow service passage, and a voice answers from beyond a barred room. Leda Marr is inside with a young metalworker, Pellin Rusk, who has refused to tell Garren where the silver bath was hidden.",
        "Leda says Garren took the exchange page and promised to blame the false money on foreign traders. Pellin saw the reeve's sealed key on Garren's belt but never saw Nella Quist enter the workshop.",
        "A broken coin die and several copper blanks lie between the bars. The witnesses can leave if the room is opened carefully, but the furnace chamber beyond still holds the records of every batch."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut through the bars without checking whether the furnace room is watched.",
          "failTitle": "The Watched Passage",
          "failText": "Garren's men hear the metal strike and carry the batch records into the furnace room before the witnesses can be freed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Bram cover the furnace turn, open the barred room, and keep Pellin beside the broken die.",
          "scoreDelta": 1,
          "nextNodeId": "O06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Leda to describe the stolen page while you search the bars for a safe release point.",
          "scoreDelta": 0,
          "nextNodeId": "O06A"
        }
      ]
    },
    {
      "id": "O06A",
      "turn": 6,
      "title": "The Furnace Road - Tracks in Ash",
      "narrative": [
        "With Leda and Pellin out of the bathhouse, Tobin studies the broken die and finds a fresh copper burr on its edge. Pellin says the main furnace was moved to an old limeworks beyond the north road, where Garren could work without neighbors hearing hammers.",
        "Bram finds cart tracks in the ash behind the bathhouse. They carry empty sacks toward the limeworks and return with a heavier load, though no finished coins were left in the chamber.",
        "Leda keeps the torn exchange page inside her coat. It names a delivery of silver scrap due at the limeworks before dawn, giving the party a chance to reach the workshop before another batch is plated."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Bram guard the witnesses while you ask the bathhouse watchman about the north-road carts.",
          "scoreDelta": 0,
          "nextNodeId": "O07B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Leda and Pellin ahead in the marked cart to make Garren reveal his guards.",
          "failTitle": "The Baited Witnesses",
          "failText": "Garren's men seize both witnesses at the limeworks road, taking the broken die and leaving your account dependent on a torn page.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hide the witnesses at the pay hall, mark the ash tracks, and ride for the limeworks with Tobin and Bram.",
          "scoreDelta": 1,
          "nextNodeId": "O07A"
        }
      ]
    },
    {
      "id": "O06B",
      "turn": 6,
      "title": "The Furnace Road - Pellin's Knowledge",
      "narrative": [
        "Pellin explains that the silver bath was never meant to make coins fully silver. It only had to last through a soldier's first purchase, after which the darkened copper could be blamed on careless merchants.",
        "He names the old limeworks as the place where blanks were stamped and heated. Garren brought copper by cart, while a clerk from Oakenhurst's tax office brought bags of clipped silver to feed the washing bath.",
        "The scheme needs both metal and official records. Leda can guard the exchange page, but the limeworks may hold the batch lists that connect the furnace to the reeve's emergency entry."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Pellin at the bathhouse and ride for the limeworks without letting him repeat his account to Bram.",
          "failTitle": "The Unheard Witness",
          "failText": "Pellin is frightened into silence before the party returns, and Garren claims the metalworker was invented to support a ranger's story.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take Pellin under Bram's protection, preserve his words with Leda's page, and follow the north road.",
          "scoreDelta": 1,
          "nextNodeId": "O07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Pellin to draw the limeworks furnace while Tobin compares the die with old mint pieces.",
          "scoreDelta": 0,
          "nextNodeId": "O07C"
        }
      ]
    },
    {
      "id": "O06C",
      "turn": 6,
      "title": "The Furnace Road - A Cart in the Ash",
      "narrative": [
        "The hidden stair opens behind the bathhouse, where a cart has left a track through gray ash. Pellin recognizes the cracked axle and says Garren used it to carry copper blanks to the old limeworks.",
        "Leda has recovered the exchange page, though one corner bearing a delivery mark is missing. Tobin says the broken die was made from a harder metal than the bathhouse tools and may have been struck against a master kept elsewhere.",
        "The road north offers two trails: the cart can be followed toward the furnace, or the missing delivery mark can be traced through Oakenhurst's tax office before the next batch moves."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cracked axle track with Pellin while Leda keeps the page and Tobin protects the die.",
          "scoreDelta": 1,
          "nextNodeId": "O07C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Leda to search the tax office for the missing delivery mark while you ride north with Bram.",
          "scoreDelta": 0,
          "nextNodeId": "O07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scatter the ash track so Garren cannot know which way you followed him.",
          "failTitle": "The Erased Road",
          "failText": "The cart leaves by a second lane while you destroy the only trail leading from the bathhouse to the furnace.",
          "death": false
        }
      ]
    },
    {
      "id": "O07A",
      "turn": 7,
      "title": "The Old Limeworks - A Warm Wall",
      "narrative": [
        "The old limeworks stands among white hills of dead dust. A warm wall and the smell of vinegar mark a working chamber beneath the abandoned kiln, while Garren's guards watch the road instead of the rear slope.",
        "Pellin points to a narrow vent where silver vapor escapes. Tobin warns that the chamber contains acid baths and stacked copper blanks, so a careless entrance could destroy both the workers and the evidence.",
        "Leda stays with Bram above the road, holding the exchange page. The hidden furnace is close enough to hear, and someone inside is reading aloud from a list of coin batches."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Call down from the vent and demand that the workers come out under the duke's protection.",
          "scoreDelta": 0,
          "nextNodeId": "O08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour earth into the vent to choke the furnace before entering.",
          "failTitle": "The Choked Kiln",
          "failText": "The blocked fumes drive the workers into panic, and the batch lists are thrown into the acid bath before you can reach the chamber.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Circle the rear slope, cover the vent, and listen until Tobin can identify how many people work below.",
          "scoreDelta": 1,
          "nextNodeId": "O08A"
        }
      ]
    },
    {
      "id": "O07B",
      "turn": 7,
      "title": "The Old Limeworks - The Batch List",
      "narrative": [
        "Pellin's drawing leads you to a side door hidden behind stacked lime boards. Inside, the furnace is cold but a slate lists batches of pennies by date, weight, and the number of soldiers meant to receive them.",
        "Leda recognizes the first three dates as the same mornings recorded in her exchange book. Tobin sees a line marked with the reeve's emergency phrase, followed by a quantity of clipped silver far larger than any Oakenhurst tax should contain.",
        "The list is proof of planning, but footsteps approach from the upper kiln. The workers may be frightened victims, or they may be waiting to destroy the slate when they hear the door open."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Carry the slate outside before anyone inside sees that you found it.",
          "failTitle": "The Stolen Slate",
          "failText": "The slate cracks on the doorway, and the batch dates disappear before Leda can compare them with her exchange book.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the slate in place, keep Pellin beside the doorway, and have Bram cover the upper kiln.",
          "scoreDelta": 1,
          "nextNodeId": "O08B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tobin to read the silver quantities while Leda checks the side room for the workers.",
          "scoreDelta": 0,
          "nextNodeId": "O08C"
        }
      ]
    },
    {
      "id": "O07C",
      "turn": 7,
      "title": "The Old Limeworks - A Guarded Slope",
      "narrative": [
        "The cracked axle cart has reached the limeworks before you. Its fresh tracks circle the kiln, and a man carries a wrapped die toward the warm wall while two others watch the north road.",
        "Pellin identifies the man as Garren Voss's foreman. The foreman does not know that Pellin survived the bathhouse, and he has not yet seen the broken die in Tobin's pack.",
        "A direct approach could expose the workshop, but a hidden route through the rear vent may reveal whether the foreman is acting alone or following an order from Oakenhurst."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Hide Pellin below the slope, follow the foreman to the warm wall, and keep the rear vent unguarded for retreat.",
          "scoreDelta": 1,
          "nextNodeId": "O08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Bram watch the guards while you and Tobin approach the foreman's cart from the north.",
          "scoreDelta": 0,
          "nextNodeId": "O08A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the foreman before Pellin can identify the men guarding the kiln.",
          "failTitle": "The Sealed Kiln",
          "failText": "The guards close the furnace doors and roll the wrapped die into the hot chamber, leaving only ordinary copper tools behind.",
          "death": false
        }
      ]
    },
    {
      "id": "O08A",
      "turn": 8,
      "title": "The False Mint - A Room of Blanks",
      "narrative": [
        "The rear vent opens above a chamber full of copper blanks, silver-washing bowls, and three frightened workers. None wears a guild mark, but each has a cloth tied over the mouth against the sharp fumes.",
        "Tobin finds the master die hidden in a grain jar. Its face is copied from the duke's coin, while the edge carries an old mint notch that should have been destroyed years ago.",
        "The workers say Garren brought the copper and Reeve Nella Quist's clerk brought the clipped silver. They do not know whether Quist approved the false money or merely believed it was an emergency alloy."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Separate the workers, record their accounts, and ask Tobin to wrap the master die.",
          "scoreDelta": 0,
          "nextNodeId": "O09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw the master die into the furnace so no one can use it again.",
          "failTitle": "The Destroyed Die",
          "failText": "The die melts among the blanks, removing the strongest link between the false coins and the old mint store.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Vent the fumes, keep the workers together, and preserve the die beside the batch slate.",
          "scoreDelta": 1,
          "nextNodeId": "O09A"
        }
      ]
    },
    {
      "id": "O08B",
      "turn": 8,
      "title": "The False Mint - The Emergency Alloy",
      "narrative": [
        "The workers come out with their hands raised, and the copied batch slate confirms that false pennies were prepared for the western garrison. The emergency phrase appears beside each delivery, not just in the reeve's book.",
        "Tobin finds the master die in the foreman's coat. Its edge is made from an old mint die, while the face has been altered to hide a small flaw in the duke's eye.",
        "The evidence changes the shape of the crime. Garren supplied the furnace, but someone with access to official language and old mint tools made the plan look lawful."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the workers away before the foreman's statement is entered beside the batch slate.",
          "failTitle": "The Unnamed Furnace",
          "failText": "The foreman claims the workers acted alone, and the missing witness leaves Garren free to blame a handful of desperate metalworkers.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Bram guard the workers, let Tobin preserve the die, and send Leda for the reeve's emergency ledger.",
          "scoreDelta": 1,
          "nextNodeId": "O09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the foreman who delivered the old die while Leda copies the batch dates.",
          "scoreDelta": 0,
          "nextNodeId": "O09C"
        }
      ]
    },
    {
      "id": "O08C",
      "turn": 8,
      "title": "The False Mint - The Hidden Ledger",
      "narrative": [
        "The foreman's wrapped die opens a false panel in the limeworks wall. Behind it sits a narrow ledger of deliveries, including copper from Garren Voss and clipped silver collected from old tax chests.",
        "One entry bears Nella Quist's initials beside the phrase emergency alloy. Another says that the true pay chest must be mixed with the false pennies before the next western muster.",
        "The discovery is a reversal: the scheme is not meant merely to cheat merchants. It is meant to make soldiers distrust Duke Aldric's pay, then use the resulting shortage to seize control of the town's exchange."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Copy the ledger in place, preserve the panel, and have Bram keep the foreman away from the furnace.",
          "scoreDelta": 1,
          "nextNodeId": "O09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the narrow ledger to Leda and ask Tobin to confirm the old die's metal.",
          "scoreDelta": 0,
          "nextNodeId": "O09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Confront Nella Quist at once with the hidden ledger while the limeworks remains unsecured.",
          "failTitle": "The Unsecured Furnace",
          "failText": "Garren's men burn the workshop and scatter the workers before the ledger can be tied to the physical dies and coin blanks.",
          "death": false
        }
      ]
    },
    {
      "id": "O09A",
      "turn": 9,
      "title": "The Reeve's Hand - A Claim of Mercy",
      "narrative": [
        "Nella Quist admits that she approved an emergency alloy for the garrison after Garren warned that silver stores were low. She says she believed the pennies contained enough silver to pass a proper assay and never ordered them used as full coin.",
        "Leda lays the bathhouse page beside the limeworks batch list. The quantities are too large for a temporary measure, and every delivery was timed for soldiers who could not choose another paymaster.",
        "Quist's mistake may be real, but her seal gave the scheme its lawful face. She asks for one day to inspect Garren's accounts, while the western pay convoy is already expected at Oakenhurst."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Quist open her office ledger under Bram's guard while Tobin compares the emergency alloy wording.",
          "scoreDelta": 0,
          "nextNodeId": "O10B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept Quist's promise and release her before the western pay convoy arrives.",
          "failTitle": "The Reeve's Day",
          "failText": "Quist and Garren reach the pay hall first, where they replace the sound coins and close the records room to every witness.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep Quist under lawful escort, seal her ledger, and send Leda to warn the western pay convoy.",
          "scoreDelta": 1,
          "nextNodeId": "O10A"
        }
      ]
    },
    {
      "id": "O09B",
      "turn": 9,
      "title": "The Reeve's Hand - Pages from the Office",
      "narrative": [
        "Leda returns from the reeve's office with a copied emergency entry and a witness who served as Quist's clerk. The clerk says Quist signed the phrase but Garren dictated the silver quantities.",
        "Tobin compares the old mint form with the copied entry and finds two words changed: the form once required a public assay, while Quist's version required only a private count.",
        "The alteration gives Garren room to pass false pennies without the town seeing the test. The clerk is willing to speak, but only if the pay hall and the original ledger are protected from the men who employed him."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the clerk back to Quist with a demand for the original ledger.",
          "failTitle": "The Returned Clerk",
          "failText": "The clerk is threatened into silence, and the original ledger is rewritten before anyone can compare its altered wording.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Place the clerk with Bram, seal the copied page, and take Tobin to the pay hall before the convoy arrives.",
          "scoreDelta": 1,
          "nextNodeId": "O10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Leda to keep the clerk hidden while you learn which road carries the western pay chest.",
          "scoreDelta": 0,
          "nextNodeId": "O10C"
        }
      ]
    },
    {
      "id": "O09C",
      "turn": 9,
      "title": "The Reeve's Hand - The First Reversal",
      "narrative": [
        "The foreman names Quist's deputy as the man who delivered the old die, but the deputy is found dead drunk in a stable with no memory of the visit. A fresh official seal rests in his pocket beside a copper shaving.",
        "The hidden ledger does not prove that Quist knew the full plan. It does prove that her office supplied the words and the seal that allowed Garren to move false money through a military pay chest.",
        "Tobin warns that the western convoy will arrive before the deputy can remember anything. The ranger must protect the soldiers from a second payment while preserving the deputy's seal as evidence."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal the deputy's pocket evidence, place him under Bram's watch, and warn the convoy at the north gate.",
          "scoreDelta": 1,
          "nextNodeId": "O10C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tobin to examine the copper shaving while Leda copies the hidden ledger's delivery line.",
          "scoreDelta": 0,
          "nextNodeId": "O10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wake the deputy by force and demand that he name every person who handled the die.",
          "failTitle": "The Broken Memory",
          "failText": "The deputy remembers only the ranger's violence, and Garren uses his confused statement to deny that the official seal ever left the office.",
          "death": false
        }
      ]
    },
    {
      "id": "O10A",
      "turn": 10,
      "title": "The Western Pay Chest - A Convoy in Fog",
      "narrative": [
        "The western pay convoy reaches Oakenhurst in morning fog. Sergeant Bram Hale stops the first chest before it enters the pay hall, and Tobin hears the same faint rattle from inside that the false pennies made in Leda's balance.",
        "Leda's warning has reached the soldiers, but not the merchants. Garren Voss arrives with a clean letter from Reeve Quist saying the emergency alloy is lawful and that the ranger has no authority to delay payment.",
        "The chest may contain both sound and false coin. Opening it in the road could scatter the soldiers, while allowing it into the hall could place a second bad batch directly into their hands."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the convoy captain to hold the chest while Tobin performs one sealed sample assay.",
          "scoreDelta": 0,
          "nextNodeId": "O11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Garren carry the chest inside because his letter bears the reeve's seal.",
          "failTitle": "The Second Payment",
          "failText": "The false pennies reach the soldiers, and the resulting anger makes every later assay look like an attack on their lawful pay.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the chest sealed, place Garren's letter beside Quist's ledger, and have Tobin test the rattle under witness.",
          "scoreDelta": 1,
          "nextNodeId": "O11A"
        }
      ]
    },
    {
      "id": "O10B",
      "turn": 10,
      "title": "The Western Pay Chest - The Clerk's Warning",
      "narrative": [
        "The reeve's clerk tells Bram that Garren's convoy has taken the long road to the western barracks and will arrive before sunset. He identifies the chest seals from Quist's office but cannot tell whether the coins were counted at Oakenhurst or at the limeworks.",
        "Tobin finds that the copied emergency entry promised a public assay after the first payment, yet no assay was scheduled. Leda says Garren is relying on soldiers spending the pennies before their dark coating is noticed.",
        "The western chest is now the center of the scheme. It can be stopped with a sealed test, but the convoy captain may obey Quist's letter unless the evidence is presented without threatening the soldiers' pay."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Confiscate the chest without explaining the missing public assay to the convoy captain.",
          "failTitle": "The Seized Pay",
          "failText": "The soldiers believe the ranger has taken their winter wages, and Garren uses the outrage to hide the false coins among the confusion.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Show the captain the copied assay clause, keep the clerk beside the seal, and request one witnessed sample.",
          "scoreDelta": 1,
          "nextNodeId": "O11B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Leda to meet the convoy while you bring Tobin and Bram to the western gate.",
          "scoreDelta": 0,
          "nextNodeId": "O11C"
        }
      ]
    },
    {
      "id": "O10C",
      "turn": 10,
      "title": "The Western Pay Chest - Tracks to the Gate",
      "narrative": [
        "The deputy's official seal points to a cart waiting near the western gate. Its chest is smaller than the convoy's main pay box but heavy with coin, and Garren's foreman is watching it from a stable yard.",
        "Bram keeps the deputy behind cover while Leda copies the hidden ledger's delivery line. Tobin says the small chest may hold the silver clipped from honest coins, not just the false pennies, making it the link between the tax office and the limeworks.",
        "The convoy bell sounds beyond the gate. If the small chest moves first, Garren can claim the western pay was never touched; if the main chest enters, soldiers may be paid with metal that has already been proven false."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Secure the small chest with the deputy's seal intact, then warn the convoy captain before the gate opens.",
          "scoreDelta": 1,
          "nextNodeId": "O11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Bram watch the stable yard while Leda carries the delivery line to the captain.",
          "scoreDelta": 0,
          "nextNodeId": "O11A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the foreman through the stable before preserving the small chest and seal.",
          "failTitle": "The Open Gate",
          "failText": "The foreman escapes into the convoy, and the small chest is exchanged for an ordinary box before its clipped silver can be identified.",
          "death": false
        }
      ]
    },
    {
      "id": "O11A",
      "turn": 11,
      "title": "A Soldier's Pay - The First Assay",
      "narrative": [
        "Tobin opens one coin from the western chest under the convoy captain's eye. The penny is sound, but the second carries a copper core and the same crescent hidden beneath the silver skin.",
        "The captain is furious at Garren's letter, yet he refuses to let the soldiers go unpaid. Leda proposes separating the chest into sound and doubtful piles while the clerk records each seal and count.",
        "Garren claims the false coin must have entered after he signed the chest. The copied emergency clause and the limeworks batch list can challenge him, but only if the witnesses remain together while the chest is secured."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the captain choose ten coins for a second assay while the clerk notes the first result.",
          "scoreDelta": 0,
          "nextNodeId": "O12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour the doubtful coins onto the road and let the soldiers decide which are trustworthy.",
          "failTitle": "The Scattered Pay",
          "failText": "The soldiers mix sound and false pennies in anger, destroying the count that could have tied the batch to Garren's sealed chest.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Separate the chest by assay, preserve the seals, and have the captain hear Garren's claim beside the batch list.",
          "scoreDelta": 1,
          "nextNodeId": "O12A"
        }
      ]
    },
    {
      "id": "O11B",
      "turn": 11,
      "title": "A Soldier's Pay - The Captain's Condition",
      "narrative": [
        "The convoy captain agrees to a sealed test but sets one condition: the soldiers must receive honest pay before sunset. Tobin chooses a coin from each wrapped bundle, while Leda marks the order in which the bundles are opened.",
        "Two bundles are sound, and a third contains the thin silver skins. Garren insists the bad bundle was added at the limeworks by a worker who has already fled, but Pellin's account names Garren as the man who carried the copper blanks.",
        "The captain now has reason to listen, but the soldiers are watching every delay. The evidence must protect their wages as well as the duke's name."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Refuse all payment until Duke Aldric can send a new chest from Brackenwald.",
          "failTitle": "Unpaid at the Gate",
          "failText": "The soldiers blame the ranger for leaving them without food money, and Garren uses their anger to make the false coin appear less important than the delay.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Release the sound bundles under the captain's mark and keep the doubtful one sealed beside Pellin's account.",
          "scoreDelta": 1,
          "nextNodeId": "O12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Leda to exchange sound bundles for the soldiers while Tobin records the doubtful coins.",
          "scoreDelta": 0,
          "nextNodeId": "O12C"
        }
      ]
    },
    {
      "id": "O11C",
      "turn": 11,
      "title": "A Soldier's Pay - The Small Chest",
      "narrative": [
        "The small chest contains clipped silver, copper blanks, and a folded list of payments marked with Garren Voss's private hook. It was never meant to reach the soldiers, but it shows how honest coin was being stripped to plate the false pieces.",
        "The convoy captain sees the list and agrees to halt the main chest until Tobin can test it. Leda finds a second seal pressed into the small chest's wax, made with the same official stamp as the reeve's emergency entry.",
        "The scheme has a supply chain: silver taken from tax and pay chests feeds a furnace that creates false pennies, which are then sent back through the same official routes. The captain wants a clear division between his men's pay and the evidence."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Keep the small chest sealed as evidence, have Tobin sample the main chest, and let sound coin reach the soldiers.",
          "scoreDelta": 1,
          "nextNodeId": "O12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the captain to hold the main chest while Leda copies the private payment list.",
          "scoreDelta": 0,
          "nextNodeId": "O12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the small chest in front of every soldier and accuse the convoy captain of carrying stolen silver.",
          "failTitle": "The Accused Convoy",
          "failText": "The captain closes ranks around his men, and Garren removes the small chest during the dispute before the second seal is recorded.",
          "death": false
        }
      ]
    },
    {
      "id": "O12A",
      "turn": 12,
      "title": "The Counting Room - A Clean Bundle",
      "narrative": [
        "The sound bundles are paid to the soldiers under the captain's mark, while the doubtful pennies remain on Leda's cloth. The captain's confidence gives the ranger a little time, but Garren has left the gate and returned toward Oakenhurst.",
        "Tobin finds that every false bundle contains one genuine coin at its center, placed to make a quick handful feel honest. The trick explains why the first merchants accepted the pay and why the soldiers did not notice the shortage immediately.",
        "Leda's exchange records can show where those bundles first entered the market. The private payment list may show who received the clipped silver before the next batch was struck."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Compare Leda's exchange book with the captain's bundle order before following Garren into town.",
          "scoreDelta": 0,
          "nextNodeId": "O13B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the captain divide the doubtful pennies among the soldiers for private testing.",
          "failTitle": "The Private Test",
          "failText": "The coins scatter through the garrison, and Garren claims that no single batch can be identified once the soldiers have spent them.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the doubtful bundle, pair its center coins with Leda's first exchange dates, and take the list to Tobin.",
          "scoreDelta": 1,
          "nextNodeId": "O13A"
        }
      ]
    },
    {
      "id": "O12B",
      "turn": 12,
      "title": "The Counting Room - The Soldiers Paid",
      "narrative": [
        "The sound bundles reach the soldiers before noon, and the captain keeps the doubtful bundle under lock. The men remain uneasy, but they can buy food while Tobin examines the marked pennies.",
        "Pellin identifies the false bundle's edge marks as a limeworks batch prepared after the bathhouse rescue. Someone knew the workshop had been found and hurried a final payment through the western convoy.",
        "Garren's letter still hangs beside the pay chest. Leda believes its wax came from the reeve's office, while Bram has found a clerk who saw Garren receive a replacement seal at dawn."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the clerk away until the doubtful bundle has been fully counted.",
          "failTitle": "The Missing Seal",
          "failText": "Garren's men follow the clerk and take the replacement-seal evidence before the captain can record his account.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Place the clerk beside Garren's letter, seal the doubtful bundle, and ask Tobin to inspect its edge marks.",
          "scoreDelta": 1,
          "nextNodeId": "O13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Bram keep the clerk at the gate while Leda copies the bundle's order of payment.",
          "scoreDelta": 0,
          "nextNodeId": "O13C"
        }
      ]
    },
    {
      "id": "O12C",
      "turn": 12,
      "title": "The Counting Room - Silver in the Chest",
      "narrative": [
        "The small chest's clipped silver is weighed beside the doubtful pennies. Tobin shows that the amount removed from honest coins is enough to plate every false piece found in the western bundle and several more besides.",
        "Leda recognizes private hooks on the list beside old tax days. Garren did not collect the silver from one source; he bought it from clerks who believed they were changing worn coin for the reeve's emergency reserve.",
        "The evidence points back toward the Oakenhurst counting room, where Nella Quist's records and Garren's private books may meet. The soldiers wait with sound pay, while the doubtful chest must not disappear."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal the silver chest under the captain's mark and take Leda and Tobin to the Oakenhurst counting room.",
          "scoreDelta": 1,
          "nextNodeId": "O13C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Bram to guard the chest while you bring the private payment list to Quist's office.",
          "scoreDelta": 0,
          "nextNodeId": "O13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Return the clipped silver to the tax office without recording the private hooks beside it.",
          "failTitle": "The Returned Silver",
          "failText": "Quist's clerk melts the evidence into ordinary reserve metal, leaving no way to connect the stripped coins with Garren's false batches.",
          "death": false
        }
      ]
    },
    {
      "id": "O13A",
      "turn": 13,
      "title": "The Counting Room - Two Ledgers",
      "narrative": [
        "Oakenhurst's counting room contains Quist's official ledger and a private notebook hidden under the scale table. The official book lists worn silver as reserve metal, while the private notebook assigns each piece to Garren's furnace deliveries.",
        "Leda compares the dates with the exchange book and sees the same pennies returning as false pay. Tobin finds that the private notebook uses the limeworks batch numbers, making it the clearest link between stolen silver and counterfeit coin.",
        "The room is still under Quist's seal, and Garren's clerk waits outside with a demand for the private book. A careful record can preserve both ledgers; a public accusation may cause the reeve to choose Garren openly."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Leda copy the two matching entries while you ask Quist to witness the private notebook's seal.",
          "scoreDelta": 0,
          "nextNodeId": "O14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Carry the private notebook into the street and read Garren's deliveries to the waiting crowd.",
          "failTitle": "The Street Ledger",
          "failText": "Garren's men seize the book in the crowd, and the pages tear before the matching batch numbers can be entered into the official record.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep both ledgers on the table, mark their matching dates, and have Bram secure the counting-room doors.",
          "scoreDelta": 1,
          "nextNodeId": "O14A"
        }
      ]
    },
    {
      "id": "O13B",
      "turn": 13,
      "title": "The Counting Room - The Clerk's Mark",
      "narrative": [
        "The clerk identifies his mark beside several silver transfers in Quist's official book. He says Garren told him the metal was being melted into proper reserve, not washed onto copper blanks.",
        "Tobin finds the private batch numbers copied in the margins, proving that someone moved figures between the official and private books. Leda sees that the first false pennies entered through the same days the clerk signed.",
        "The clerk is not the architect, but his testimony can show how ordinary paperwork hid the theft. Garren's replacement seal is still missing, and Quist may claim that the clerk acted without her knowledge."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the clerk in the counting room while you pursue Garren's replacement seal alone.",
          "failTitle": "The Rewritten Book",
          "failText": "The clerk is forced to alter his own entries, and the original marks disappear beneath a fresh layer of official ink.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Place the clerk under Bram's guard, copy his mark beside the batch numbers, and question Quist with both books present.",
          "scoreDelta": 1,
          "nextNodeId": "O14B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Leda to keep the clerk's statement while you search the reeve's desk for the replacement seal.",
          "scoreDelta": 0,
          "nextNodeId": "O14C"
        }
      ]
    },
    {
      "id": "O13C",
      "turn": 13,
      "title": "The Counting Room - The Private Hook",
      "narrative": [
        "The private payment list leads to a locked drawer in Garren's rented counting room. Inside are silver transfer slips with a small hooked mark, each paired with a limeworks batch number and a date from Quist's official ledger.",
        "Tobin says the mark belongs to Garren's metal yard, not the reeve. Leda finds one slip signed by a clerk who has already left town, while Bram hears carts moving in the rear court.",
        "The drawer proves that Garren kept a second account, but the carts may be carrying the remaining coin dies. The counting room can be secured, or the fleeing carts can be followed before their load reaches the river road."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal the drawer, send Bram after the rear carts, and have Leda copy each hooked transfer slip.",
          "scoreDelta": 1,
          "nextNodeId": "O14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tobin to identify the metal yard mark while you inspect the rear court from the window.",
          "scoreDelta": 0,
          "nextNodeId": "O14A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take the slips and leave the drawer open so Garren knows his accounts have been found.",
          "failTitle": "The Open Drawer",
          "failText": "Garren's clerk returns and removes the matching ledger before the counting room can be sealed, leaving only loose slips without their source.",
          "death": false
        }
      ]
    },
    {
      "id": "O14A",
      "turn": 14,
      "title": "The Metal Yard - A Cat in the Coal",
      "narrative": [
        "Bram follows the rear carts to Garren Voss's metal yard, where a coal shed stands open and freshly swept. A gray silver tabby with green eyes slips beneath the stacked fuel and sends a small coal slide rattling down the slope.",
        "The distraction makes a hidden worker glance toward a loose floorboard. Beneath it lies a pouch of clipped silver and a set of edge punches matching the hooked marks in Garren's private slips.",
        "Garren is not in the yard, but his foreman is moving a locked box toward the river road. The box may hold the replacement seal or the dies used to finish the false pennies."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Bram watching the foreman while Tobin records the clipped silver beneath the coal shed.",
          "scoreDelta": 0,
          "nextNodeId": "O15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Chase the tabby through the coal shed to find where it disappeared.",
          "failTitle": "The Coal Shed",
          "failText": "The cat slips away, while the foreman carries the locked box through the open yard and the clipped silver is swept into the coal dust.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the floorboard, let Bram stop the foreman, and preserve the edge punches beside the hooked slips.",
          "scoreDelta": 1,
          "nextNodeId": "O15A"
        }
      ]
    },
    {
      "id": "O14B",
      "turn": 14,
      "title": "The Metal Yard - Quist's Doubt",
      "narrative": [
        "Nella Quist reads the two ledgers in silence and admits that she saw only the official book. The altered emergency wording carries her seal, but the private batch numbers were hidden from her and signed by Garren's clerk.",
        "The reeve says Garren promised to preserve the garrison's silver during a shortage. She now understands that her signature allowed him to remove honest coin and replace it with false pay, though she still insists she never ordered a counterfeit.",
        "Quist offers to lead you to Garren's metal yard, where she believes the replacement seal and the final dies are kept. Her knowledge can open the yard lawfully, but it may also give Garren time to move the evidence if he has a watcher in her office."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Quist go ahead alone and order Garren to surrender the yard before you arrive.",
          "failTitle": "The Forewarned Yard",
          "failText": "Garren clears the metal yard before the search begins, and Quist returns with a clean story about a misunderstanding over reserve silver.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep Quist under Bram's escort, take her lawful key, and search Garren's yard with Tobin and Leda.",
          "scoreDelta": 1,
          "nextNodeId": "O15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Quist to describe the yard's rear doors while you and Bram approach its public gate.",
          "scoreDelta": 0,
          "nextNodeId": "O15C"
        }
      ]
    },
    {
      "id": "O14C",
      "turn": 14,
      "title": "The Metal Yard - A Locked Box",
      "narrative": [
        "The rear carts carry Garren's locked box toward the metal yard, but the foreman abandons it when Bram calls from the lane. Inside are edge punches, a replacement seal, and a small packet of silver filings.",
        "Tobin matches the punches to the false pennies. Leda recognizes the replacement seal as the one used to close the western pay chest, while the counting-room slips show that Garren planned to use it again at the final Oakenhurst muster.",
        "The box gives proof of intent, but the metal yard still holds the remaining workers and coin blanks. Garren may burn the furnace or take the final batch toward the muster if the search is announced too loudly."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Seal the box, keep the replacement stamp wrapped, and enter the metal yard through its rear gate.",
          "scoreDelta": 1,
          "nextNodeId": "O15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Bram guard the box while Leda asks the yard workers which furnace Garren uses at night.",
          "scoreDelta": 0,
          "nextNodeId": "O15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the replacement box in the middle of the street and call every passerby to see it.",
          "failTitle": "The Stolen Box",
          "failText": "The crowd blocks the lane, and Garren's men recover the box during the confusion before the stamp and filings are recorded.",
          "death": false
        }
      ]
    },
    {
      "id": "O15A",
      "turn": 15,
      "title": "The Metal Yard - Fire in the Furnace",
      "narrative": [
        "The metal yard furnace is lit when you arrive, though no workers remain near it. A pile of false pennies has been placed beside the heat, and the air carries the same sharp smell as the bathhouse silver wash.",
        "Tobin warns that the fire is set to ruin the die and filings, not to make another batch. Leda finds a torn order for the final muster tucked under a coal rake, bearing Garren's private hook.",
        "The yard workers are trapped in a shed at the far wall. Their voices say the furnace keeper locked them in when he saw Bram at the gate. The evidence and the people are both in danger of being lost to the heat."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the workers' shed first while Tobin watches the furnace and Leda keeps the torn order dry.",
          "scoreDelta": 0,
          "nextNodeId": "O16B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw water into the furnace before securing the order and the locked workers.",
          "failTitle": "The Burst Furnace",
          "failText": "The sudden steam scatters the false pennies and tears the final muster order, while the trapped workers are left behind the locked shed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Bram free the workers, remove the torn order from the coal, and let Tobin smother the furnace slowly.",
          "scoreDelta": 1,
          "nextNodeId": "O16A"
        }
      ]
    },
    {
      "id": "O15B",
      "turn": 15,
      "title": "The Metal Yard - A Hidden Workbench",
      "narrative": [
        "The lawful search reaches Garren's rear workbench, where edge punches, copper blanks, and a half-finished silver wash are arranged beneath a canvas. A ledger page names the final muster but not the soldiers who will receive the coins.",
        "The foreman claims Garren ordered only reserve metal, yet the hooked slips and Tobin's preserved die show that the workbench made pieces for circulation. Quist sees her own seal on the replacement stamp and stops defending the arrangement.",
        "A bell rings from the far yard. The furnace keeper is moving the last batch, and a locked shed contains workers who may know whether Garren went toward the muster or the river road."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the foreman with the workbench while you chase the bell toward the far yard.",
          "failTitle": "The Cleared Bench",
          "failText": "The foreman burns the workbench page and carries the replacement stamp through a rear gate before the yard can be sealed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the workbench, put the foreman beside Quist, and have Bram open the far shed before following the bell.",
          "scoreDelta": 1,
          "nextNodeId": "O16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tobin to list the workbench tools while Leda checks whether the shed door bears a fresh seal.",
          "scoreDelta": 0,
          "nextNodeId": "O16C"
        }
      ]
    },
    {
      "id": "O15C",
      "turn": 15,
      "title": "The Metal Yard - The Workers' Door",
      "narrative": [
        "The rear gate opens into a yard of cold anvils and stacked copper. A locked shed stands against the wall, and fresh silver flakes lie beneath its door. Garren's furnace keeper has fled toward the main road.",
        "Quist identifies the shed as the place where hired workers slept between batches. Leda finds a final muster order pinned inside the gate, while Tobin sees that the replacement seal has been used on its wax.",
        "The workers may still be inside, and the furnace keeper may lead you to Garren. The yard is quiet enough for a careful rescue, but the final order cannot be left exposed to the rain beginning over Oakenhurst."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the sealed order, open the workers' shed, and send Bram after the furnace keeper.",
          "scoreDelta": 1,
          "nextNodeId": "O16C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Quist to keep the order dry while you and Tobin test the silver flakes at the shed door.",
          "scoreDelta": 0,
          "nextNodeId": "O16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Follow the furnace keeper immediately and leave the sealed yard unattended.",
          "failTitle": "The Open Yard",
          "failText": "Garren's men return to collect the final order and free the workers into the rain, leaving the strongest evidence outside your protection.",
          "death": false
        }
      ]
    },
    {
      "id": "O16A",
      "turn": 16,
      "title": "The Last Batch - Workers Under Guard",
      "narrative": [
        "The workers are freed from the shed and identify the final batch as coins meant for Oakenhurst's evening muster. They say Garren took the replacement seal toward the old mint store, where the official pay tables would make the false money appear genuine.",
        "Tobin recognizes the route: the store lies behind the closed mint court, and its records can be altered from a narrow clerk's room. Leda keeps the sealed order beside the copied batch list.",
        "The workers are willing to speak, but they fear Garren's foreman. Bram can take them to the pay hall, while the ranger must decide whether to follow Garren or secure the old mint records first."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send the workers to the pay hall and follow Garren's route to the closed mint court.",
          "scoreDelta": 0,
          "nextNodeId": "O17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the workers in the yard while you chase Garren through the mint court.",
          "failTitle": "The Abandoned Workers",
          "failText": "The foreman returns and frightens the workers into denying the final batch, weakening the account just as Garren reaches the mint records.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Place the workers with Bram, carry the sealed order, and enter the old mint court before Garren reaches its clerk's room.",
          "scoreDelta": 1,
          "nextNodeId": "O17A"
        }
      ]
    },
    {
      "id": "O16B",
      "turn": 16,
      "title": "The Last Batch - A Route in Wax",
      "narrative": [
        "The torn muster order and the workers' accounts agree that Garren planned one final delivery through the old mint court. The replacement seal was used to close the order, but the wax still carries a thread of copper from the metal yard.",
        "Quist admits the mint court was never meant to remain open after the old store closed. Its clerk's room still holds official tables, and a false batch could be entered there as if it had passed a public assay.",
        "The workers can guide you to the court by a service lane. The sealed order must stay dry, and the foreman may try to reach the mint before the ranger's party."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Give the sealed order to Quist and send the workers ahead to open the mint court.",
          "failTitle": "The Unwatched Seal",
          "failText": "Garren reaches the court first, removes the copper-threaded wax, and leaves Quist with a clean order that no longer links the mint to the metal yard.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the order beside Tobin, let Bram guide the workers, and take the service lane to the mint court.",
          "scoreDelta": 1,
          "nextNodeId": "O17B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Leda to carry the order while you follow the workers' route from the yard.",
          "scoreDelta": 0,
          "nextNodeId": "O17C"
        }
      ]
    },
    {
      "id": "O16C",
      "turn": 16,
      "title": "The Last Batch - The Mint Court Road",
      "narrative": [
        "The silver flakes prove that the shed held the final coated coins, not merely reserve metal. The workers say Garren's foreman rode toward the old mint court with a leather satchel and the replacement seal.",
        "Bram returns with the furnace keeper, who says Garren planned to enter the court before dusk and record the batch under Quist's emergency phrase. Leda keeps the sealed order, while Tobin carries the master die in a wrapped bundle.",
        "The mint court is close, but the road divides at a ruined arch. One path reaches the clerk's room; the other reaches a side gate where Garren may try to escape if the official record is blocked."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take the clerk's path with Tobin and the workers while Bram circles to the mint court side gate.",
          "scoreDelta": 1,
          "nextNodeId": "O17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Bram lead the workers to the side gate while you bring Leda and the order to the clerk's room.",
          "scoreDelta": 0,
          "nextNodeId": "O17A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Run for the side gate alone before the furnace keeper can repeat Garren's route.",
          "failTitle": "The Divided Court",
          "failText": "Garren slips through the clerk's room and rewrites the batch record while the party is separated at the two gates.",
          "death": false
        }
      ]
    },
    {
      "id": "O17A",
      "turn": 17,
      "title": "The Closed Mint - Tables of Weight",
      "narrative": [
        "The old mint clerk's room contains official weight tables and a register of every lawful coin tested in Oakenhurst. Garren has opened the register to the final batch, but the entry is still blank beside the emergency phrase.",
        "Tobin places the master die and a false penny on the table. The die's old edge notch matches the sealed mint record, while the coin fails the weight table by enough to expose every coated piece in the batch.",
        "Garren stands at the court door with Reeve Quist's replacement seal. He says the ranger is too late and offers to complete the public assay himself, knowing that the soldiers are waiting outside for their evening pay."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the mint clerk to enter the die's old notch before Garren touches the blank register.",
          "scoreDelta": 0,
          "nextNodeId": "O18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Allow Garren to complete the register so the false batch becomes an official record.",
          "failTitle": "The Official Falsehood",
          "failText": "Garren writes the coated pennies into the mint register, and the soldiers accept a lawful-looking record in place of the missing public assay.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the register open, place the false coin on the weight table, and have Tobin identify the old die before the clerk.",
          "scoreDelta": 1,
          "nextNodeId": "O18A"
        }
      ]
    },
    {
      "id": "O17B",
      "turn": 17,
      "title": "The Closed Mint - Witnesses at the Door",
      "narrative": [
        "The workers enter the mint court with Bram, and the clerk recognizes the furnace keeper's account before Garren can close the gate. Leda sets the sealed order beside the copied batch list, while Quist sees her emergency phrase waiting in the blank register.",
        "Garren says the workers are criminals who stole copper from his yard. Pellin answers that he was forced to plate the coins and identifies the master die wrapped in Tobin's cloth.",
        "The court has become a contest between a public record and the people who made it. The final muster is gathering outside, and the false batch must be exposed without turning the soldiers against the witnesses."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the workers outside before the clerk records their names beside the sealed order.",
          "failTitle": "The Nameless Workers",
          "failText": "Garren calls the workers hired thieves, and the blank register remains open for him to fill after the witnesses have been removed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the workers and Pellin together, have the clerk enter the sealed order, and ask Tobin to test the first coin.",
          "scoreDelta": 1,
          "nextNodeId": "O18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Quist explain the emergency phrase while Leda keeps the master die beside the register.",
          "scoreDelta": 0,
          "nextNodeId": "O18C"
        }
      ]
    },
    {
      "id": "O17C",
      "turn": 17,
      "title": "The Closed Mint - The Side Gate",
      "narrative": [
        "Bram reaches the mint court side gate as Garren's foreman tries to carry the satchel away. Inside the satchel are coated pennies, a private batch list, and the replacement seal wrapped in the metal yard's cloth.",
        "The clerk's room remains occupied by Garren and Quist. Leda's sealed order can expose the final delivery, while Tobin's master die can show that the satchel's coins were struck from the old mint pattern.",
        "The side gate gives you physical control of the evidence, but the public muster outside still needs a clear assay. The witnesses must be brought through the court without allowing Garren to make the moment look like a private arrest."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Secure the satchel, keep the replacement seal wrapped, and bring the foreman through the clerk's room as a witness.",
          "scoreDelta": 1,
          "nextNodeId": "O18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Bram hold the side gate while you take the sealed order and master die to the mint clerk.",
          "scoreDelta": 0,
          "nextNodeId": "O18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Throw the satchel into the court well before the foreman can reach the gate.",
          "failTitle": "The Sunken Satchel",
          "failText": "The private batch list and replacement seal sink beyond recovery, leaving the final muster dependent on testimony alone.",
          "death": false
        }
      ]
    },
    {
      "id": "O18A",
      "turn": 18,
      "title": "The Public Assay - A Coin on the Table",
      "narrative": [
        "The mint clerk places a true penny and one of Garren's coated pieces on the official table. Tobin weighs them in front of the soldiers, then scratches the darkened coin at its edge to reveal copper beneath the thin silver skin.",
        "Leda reads the batch list and names the western bundles that carried the same crescent. Pellin identifies the furnace method, while Quist admits that her emergency wording should have required this public test before any soldier was paid.",
        "Garren insists the coated piece was an experiment, not a coin meant for circulation. The sealed order, the false die, and the soldiers' darkened pennies now give the clerk enough material to test whether that claim can stand."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the clerk test three more pieces before asking the soldiers to compare the batch marks.",
          "scoreDelta": 0,
          "nextNodeId": "O19B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Strike Garren before he can finish calling the coated coins experiments.",
          "failTitle": "The Ranger's Blow",
          "failText": "The soldiers see only an assault during their pay hearing, and Garren's claim of a private experiment survives while the court descends into disorder.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep Garren behind the table, have Tobin test the marked batch, and ask Leda to read the matching delivery line.",
          "scoreDelta": 1,
          "nextNodeId": "O19A"
        }
      ]
    },
    {
      "id": "O18B",
      "turn": 18,
      "title": "The Public Assay - The Witnessed Register",
      "narrative": [
        "The mint clerk enters the old die notch and the false coin's weight before Garren can touch the register. The record now shows that the coated pieces copied a lawful pattern but failed the lawful measure.",
        "The workers give their names, Pellin describes the bath, and Quist signs that the emergency phrase was hers even though the private quantities were not. Leda attaches the western pay bundle to the same batch date.",
        "The soldiers begin to understand that their pay was not stolen by a distant foreign mint. It was weakened inside Oakenhurst by people who expected fear to conceal the shortage."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Close the register before the workers' names and the western bundle are entered beside the assay.",
          "failTitle": "The Incomplete Register",
          "failText": "Garren argues that the coated coin was an isolated piece, and the missing witness names prevent the clerk from tying it to the limeworks batches.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have the clerk enter every witness, then compare the western bundle with the registered false die.",
          "scoreDelta": 1,
          "nextNodeId": "O19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Quist state her part while Tobin keeps the master die visible beside the register.",
          "scoreDelta": 0,
          "nextNodeId": "O19C"
        }
      ]
    },
    {
      "id": "O18C",
      "turn": 18,
      "title": "The Public Assay - The Satchel Opened",
      "narrative": [
        "The satchel's contents are laid on the mint table: coated pennies, the private batch list, the replacement seal, and Garren's metal-yard cloth. The clerk recognizes the seal as a copy of the one used on the final muster order.",
        "Tobin compares the satchel coins with the master die, while Leda matches the private list to the western pay bundles. The foreman admits that Garren ordered the final batch delivered before the ranger could speak to the soldiers.",
        "Garren now faces physical evidence from the yard and official evidence from the mint. He tries to make Quist bear all blame, but the replacement seal shows that he prepared to continue the scheme without her permission."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Keep the satchel contents together, have the clerk record each item, and ask Tobin to test its marked coins.",
          "scoreDelta": 1,
          "nextNodeId": "O19C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the foreman identify the metal-yard cloth while Leda copies the satchel's private batch numbers.",
          "scoreDelta": 0,
          "nextNodeId": "O19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Allow Garren to take the replacement seal so he can explain why it bears Quist's mark.",
          "failTitle": "The Passed Seal",
          "failText": "Garren pockets the seal and claims the satchel was assembled by Quist's office, weakening the link between his metal yard and the final batch.",
          "death": false
        }
      ]
    },
    {
      "id": "O19A",
      "turn": 19,
      "title": "The Cold Coin - A Public Count",
      "narrative": [
        "The public count begins with the western bundle. Soldiers place their pennies on the mint table, and Tobin separates sound silver from coated copper without asking anyone to trust a merchant's eye.",
        "Leda reads the matching batch numbers, Pellin names the furnace process, and the clerk records the replacement seal beside the final muster order. Quist stands under Bram's guard and does not deny that her wording opened the door.",
        "Garren says the false coins were meant only as emergency pieces, but the count shows that they were mixed into soldiers' pay and sent through the markets. The final ruling depends on whether the stolen silver and the false dies are entered together."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the clerk finish the count before deciding how much of the recovered silver returns to each soldier.",
          "scoreDelta": 0,
          "nextNodeId": "O20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Garren carry the uncounted bundles away while the soldiers argue over the first pile.",
          "failTitle": "The Missing Count",
          "failText": "Garren removes enough silver to preserve his fortune, leaving the court with proof of false coin but too little sound pay to repair the garrison's trust.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the false bundles, return sound silver by the recorded count, and enter the metal-yard slips with the mint register.",
          "scoreDelta": 1,
          "nextNodeId": "O20A"
        }
      ]
    },
    {
      "id": "O19B",
      "turn": 19,
      "title": "The Cold Coin - The Soldiers' Test",
      "narrative": [
        "The soldiers test the registered batch one handful at a time. Every marked penny fails the weight table, while the sound coins from the convoy balance cleanly against the mint standard.",
        "The workers' names and the private batch list stand beside the register. Garren's story of a lone experiment cannot explain why the same false coins were placed in pay bundles dated before the ranger reached the limeworks.",
        "Quist asks whether her seal will be treated as a mistake or a crime. Leda answers that the town can judge the difference after the soldiers receive the silver that was taken from their pay."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Dismiss the workers before the clerk records which batch each one prepared.",
          "failTitle": "The Unlinked Batch",
          "failText": "Garren claims the marked coins came from an unknown furnace, and the court loses the chain connecting the workers to his private list.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have each worker confirm one batch number, then attach the soldiers' failed coins to the same register page.",
          "scoreDelta": 1,
          "nextNodeId": "O20B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept the clerk's count and allow the soldiers to exchange doubtful pennies over the next week.",
          "scoreDelta": 0,
          "nextNodeId": "O20C"
        }
      ]
    },
    {
      "id": "O19C",
      "turn": 19,
      "title": "The Cold Coin - The Last Ledger Line",
      "narrative": [
        "The satchel coins match the master die and the private batch list, while the replacement seal bears a copper thread from Garren's yard. The clerk enters the objects in a chain that begins with stolen silver and ends with soldiers' false pay.",
        "Tobin shows the crowd that the coated pennies can look sound until rubbed, explaining why merchants and soldiers were deceived. Leda places the first darkened coin beside the final one and finds the same crescent cut.",
        "Garren has no answer left except to say that Quist should have known better. The court must decide whether to return the recovered metal carefully or seize every coin at once and risk leaving the soldiers without usable pay."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Separate sound pay from false pieces under the clerk's eye and enter Garren's seal beside the final ledger line.",
          "scoreDelta": 1,
          "nextNodeId": "O20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the clerk record the chain and distribute the recovered silver after a second morning assay.",
          "scoreDelta": 0,
          "nextNodeId": "O20A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Give the private ledger to Garren so he can point out which lines he claims were misunderstood.",
          "failTitle": "The Last Misunderstanding",
          "failText": "Garren tears away the batch lines before the clerk can stop him, leaving the court with coins and seals but no complete account of the stolen silver.",
          "death": false
        }
      ]
    },
    {
      "id": "O20A",
      "turn": 20,
      "title": "The Cold Coin - Sound Silver",
      "narrative": [
        "The final count separates every coated penny from the sound silver, and the soldiers receive usable pay before the evening market closes. Merchants accept the restored coins after Tobin demonstrates the public test at the exchange table.",
        "Leda's records, the mint register, and the metal-yard slips show the whole route from clipped tax silver to false military pay. Quist's seal made the scheme possible, but Garren's private batches prove that he shaped it for profit and control.",
        "Bram seals the false dies and the remaining coin under Duke Aldric's authority. Oakenhurst's people have lost trust in a simple piece of metal, yet they have also gained a method for testing it together."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Have Leda reopen the exchange under public assay rules and return each soldier's proven silver before nightfall.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Tobin oversee a second count and accept a cautious settlement for the first disputed payments.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Allow Garren to collect the untested silver while the court prepares its written judgment.",
          "failTitle": "The Unsealed Silver",
          "failText": "Garren removes the remaining metal through a side court, leaving the town with a proven fraud but too little sound coin to repair the soldiers' losses.",
          "death": false
        }
      ]
    },
    {
      "id": "O20B",
      "turn": 20,
      "title": "The Cold Coin - The Public Register",
      "narrative": [
        "The mint clerk completes the register with every false batch, each worker's name, and the number of soldiers who received the coated pennies. The record is longer than anyone expected, but it leaves no room for Garren's claim of a single failed experiment.",
        "Leda and Tobin establish a public exchange table where each doubtful coin can be tested before it is accepted. Quist signs that her emergency phrase was misused, while Bram carries the sealed dies toward Duke Aldric's court.",
        "The soldiers are paid from the sound bundles, though some silver remains missing in the confusion. Oakenhurst keeps its trade, but the town will remember how quickly official ink made bad metal look trustworthy."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Accept the register's partial recovery and let each market replace doubtful coins during the coming week.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release the sealed dies before Duke Aldric's court has taken custody of them.",
          "failTitle": "The Unsealed Dies",
          "failText": "Garren's remaining men recover one die from the evidence cart, leaving the town vulnerable to another false batch after the soldiers depart.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Attach the workers' testimony to the register and have Tobin test every recovered bundle before distribution.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "O20C",
      "turn": 20,
      "title": "The Cold Coin - What the Fire Spared",
      "narrative": [
        "The surviving mint pages and the workers' accounts are enough to identify the false die, the stolen silver, and the western pay bundle. The furnace destroyed some batch lists, but it did not erase the repeated crescent cut or the copper beneath the silver skin.",
        "Leda keeps the public exchange open while Tobin teaches merchants the simple edge test. Quist waits for Duke Aldric's judgment, and Bram seals Garren's yard under the same lawful authority that once protected it.",
        "Not every lost penny can be returned, but the soldiers leave with sound pay and the town knows why the metal failed. The false coin will not quietly become a second shortage."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Garren keep the surviving private slips so the town can avoid another public quarrel.",
          "failTitle": "The Quiet Settlement",
          "failText": "The missing slips leave enough uncertainty for Garren to protect part of his fortune and blame the fire for the rest of the false coin.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the surviving pages with the master die and return every identifiable payment before closing the exchange.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let the clerk record the partial chain and distribute the remaining sound silver under Tobin's watch.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    }
  ]
});
