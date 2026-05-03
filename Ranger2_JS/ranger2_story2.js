window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "winter-herb-road",
  "title": "The Winter Herb Road",
  "summary": "A fully written mountain intrigue story in which forged quarantine orders and stolen fever medicine threaten the Gray Mountains. The graph branches by approach but converges cleanly so each path remains coherent.",
  "maxTurns": 20,
  "startNodeId": "W01A",
  "goodScoreThreshold": 11,
  "epilogues": {
    "high": "You break Vey Norrell's extortion ring, reopen the herb road under Duke Aldric's law, and get real medicine to the camps before the fever crests. The Gray Mountains remember the winter as the season Brackenwald held together under pressure.",
    "low": "You recover enough medicine to avert disaster, but Norrell's wider network survives in fragments and some guilty men escape a full reckoning. The camps live through the winter, yet every seal and quarantine order is met with fresh distrust."
  },
  "nodes": [
    {
      "id": "W01A",
      "turn": 1,
      "title": "The Missing Cart - Trail Hunt",
      "narrative": [
        "You ride above the sled ruts below <strong>Frostbell Outpost</strong>, reading snow and hoof cuts with <strong>Rhun Tal</strong> beside you.",
        "The abbey medicine cart should have reached the mining camps by dawn, but only one mule returned, cut loose and shaking. The crates held frostwort, willowbark, and lamp oil for fever wards beyond <strong>Goatspur Shelf</strong>.",
        "If the convoy stays lost, sick camps will either turn on one another or submit to whoever claims to control the pass."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Thorne to circle above the slope, trap the false trail, and identify where the cart was actually turned.",
          "nextNodeId": "W02A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride after the first set of tracks without checking whether they were planted.",
          "failTitle": "The Cart Is Lost",
          "failText": "The tracks were laid as bait. By the time you realize the mistake, the true convoy route is cold and the pass has fallen into rumor.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow the surviving mule route and mark each fork before committing the patrol.",
          "nextNodeId": "W02B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W01B",
      "turn": 1,
      "title": "The Missing Cart - Witness Ledger",
      "narrative": [
        "In the frozen office at <strong>Frostbell Outpost</strong>, you spread manifests with <strong>Brother Cadan</strong> and mark where the herb cart vanished from the books.",
        "The abbey medicine cart should have reached the mining camps by dawn, but only one mule returned, cut loose and shaking. The crates held frostwort, willowbark, and lamp oil for fever wards beyond <strong>Goatspur Shelf</strong>.",
        "If the convoy stays lost, sick camps will either turn on one another or submit to whoever claims to control the pass."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Verify the manifest, question the drovers one by one, and dispatch guards only after the timings align.",
          "nextNodeId": "W02C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cross-check seal marks against the abbey register and name the exact checkpoint where the cart was diverted.",
          "nextNodeId": "W02B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride after the first set of tracks without checking whether they were planted.",
          "failTitle": "The Cart Is Lost",
          "failText": "The tracks were laid as bait. By the time you realize the mistake, the true convoy route is cold and the pass has fallen into rumor.",
          "death": false
        }
      ]
    },
    {
      "id": "W01C",
      "turn": 1,
      "title": "The Missing Cart - Shield Road",
      "narrative": [
        "At the outpost gate, you steady frightened drovers with <strong>Marshal Elira Stone</strong> and keep the road clear while word of the missing cart spreads.",
        "The abbey medicine cart should have reached the mining camps by dawn, but only one mule returned, cut loose and shaking. The crates held frostwort, willowbark, and lamp oil for fever wards beyond <strong>Goatspur Shelf</strong>.",
        "If the convoy stays lost, sick camps will either turn on one another or submit to whoever claims to control the pass."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride after the first set of tracks without checking whether they were planted.",
          "failTitle": "The Cart Is Lost",
          "failText": "The tracks were laid as bait. By the time you realize the mistake, the true convoy route is cold and the pass has fallen into rumor.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post a disciplined escort on the gate and reopen traffic while riders search the main road.",
          "nextNodeId": "W02A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hold the outpost steady, then send a split escort that protects the camps and cuts off the lower pass together.",
          "nextNodeId": "W02C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W02A",
      "turn": 2,
      "title": "False Wolf Sign - Trail Hunt",
      "narrative": [
        "You kneel beside the wrecked sled near <strong>Goatspur Shelf</strong>, where claw marks look theatrical rather than wild.",
        "The cart was wrecked on purpose. Carved wolf marks and blood smeared high on the rock wall were meant to sell a beast attack, but the harness cuts are clean blade work.",
        "Someone wants the camps to fear the mountain itself instead of looking for organized theft."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the drag marks downhill and test whether the wreck served as a handoff point.",
          "nextNodeId": "W03B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Spread the wolf story to clear the road faster.",
          "failTitle": "Fear Takes the Road",
          "failText": "The lie outruns you. Teamsters abandon the pass, militia chase shadows, and the thieves gain a clear day to move the stolen medicine.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Climb above the wreck, trap the false wolf trail, and locate the hidden loading shelf.",
          "nextNodeId": "W03A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W02B",
      "turn": 2,
      "title": "False Wolf Sign - Witness Ledger",
      "narrative": [
        "At a sheltered bend beneath <strong>Goatspur Shelf</strong>, you compare torn cloth, axle splinters, and witness notes with <strong>Brother Cadan</strong>.",
        "The cart was wrecked on purpose. Carved wolf marks and blood smeared high on the rock wall were meant to sell a beast attack, but the harness cuts are clean blade work.",
        "Someone wants the camps to fear the mountain itself instead of looking for organized theft."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Match the carved claw pattern to a wagon tool and prove the beast story was staged.",
          "nextNodeId": "W03B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Record the blade cuts, question the teamsters, and separate panic from fact.",
          "nextNodeId": "W03C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Spread the wolf story to clear the road faster.",
          "failTitle": "Fear Takes the Road",
          "failText": "The lie outruns you. Teamsters abandon the pass, militia chase shadows, and the thieves gain a clear day to move the stolen medicine.",
          "death": false
        }
      ]
    },
    {
      "id": "W02C",
      "turn": 2,
      "title": "False Wolf Sign - Shield Road",
      "narrative": [
        "You keep frightened teamsters moving past the wreck at <strong>Goatspur Shelf</strong> while <strong>Marshal Elira Stone</strong> prevents a full panic on the road.",
        "The cart was wrecked on purpose. Carved wolf marks and blood smeared high on the rock wall were meant to sell a beast attack, but the harness cuts are clean blade work.",
        "Someone wants the camps to fear the mountain itself instead of looking for organized theft."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Spread the wolf story to clear the road faster.",
          "failTitle": "Fear Takes the Road",
          "failText": "The lie outruns you. Teamsters abandon the pass, militia chase shadows, and the thieves gain a clear day to move the stolen medicine.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Stage guards in plain sight at the wreck, then send a hidden team after the real haulers.",
          "nextNodeId": "W03C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the road open past the wreck and move civilians through under escort.",
          "nextNodeId": "W03A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W03A",
      "turn": 3,
      "title": "Wounded at the Rope Bridge - Trail Hunt",
      "narrative": [
        "Below <strong>North Rope Bridge</strong>, you find two wounded drovers where someone cut them loose after the ambush.",
        "The drovers speak of masked men flashing a quarantine seal, lowering crates by rope, and driving the cart mules apart to scatter pursuit. One of them remembers a guard voice he had heard before.",
        "If the seal is false, whoever carries it can close whole roads with a single order."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the hidden descent path now and identify the rider who supervised the lift.",
          "nextNodeId": "W04A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Press the wounded for names before they have even stopped shaking.",
          "failTitle": "Witnesses Collapse",
          "failText": "You push too hard, lose the only steady testimony from the bridge, and hand the extortion ring another layer of doubt to hide behind.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Trace the lowered crates from the bridge base and see where the rope team escaped.",
          "nextNodeId": "W04B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W03B",
      "turn": 3,
      "title": "Wounded at the Rope Bridge - Witness Ledger",
      "narrative": [
        "You shelter the survivors beneath the bridge tower while <strong>Brother Cadan</strong> steadies their breathing and you test each account against the other.",
        "The drovers speak of masked men flashing a quarantine seal, lowering crates by rope, and driving the cart mules apart to scatter pursuit. One of them remembers a guard voice he had heard before.",
        "If the seal is false, whoever carries it can close whole roads with a single order."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Brother Cadan treat the survivors, then build a clean sequence from both accounts.",
          "nextNodeId": "W04C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the remembered guard voice to duty rosters and narrow the inside traitor list at once.",
          "nextNodeId": "W04B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Press the wounded for names before they have even stopped shaking.",
          "failTitle": "Witnesses Collapse",
          "failText": "You push too hard, lose the only steady testimony from the bridge, and hand the extortion ring another layer of doubt to hide behind.",
          "death": false
        }
      ]
    },
    {
      "id": "W03C",
      "turn": 3,
      "title": "Wounded at the Rope Bridge - Shield Road",
      "narrative": [
        "You secure the bridgehead with <strong>Marshal Elira Stone</strong>, turning back panic while the wounded are carried under cover.",
        "The drovers speak of masked men flashing a quarantine seal, lowering crates by rope, and driving the cart mules apart to scatter pursuit. One of them remembers a guard voice he had heard before.",
        "If the seal is false, whoever carries it can close whole roads with a single order."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Press the wounded for names before they have even stopped shaking.",
          "failTitle": "Witnesses Collapse",
          "failText": "You push too hard, lose the only steady testimony from the bridge, and hand the extortion ring another layer of doubt to hide behind.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Reinforce the bridge and move the survivors to safety before reopening the pass.",
          "nextNodeId": "W04A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the bridge secure, then quietly track who tries to watch the wounded from a distance.",
          "nextNodeId": "W04C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W04A",
      "turn": 4,
      "title": "Sealed Gates Without Warrant - Trail Hunt",
      "narrative": [
        "You reach <strong>Shivergate Tunnel</strong> before sunrise and find a quarantine writ hanging where a scout can see it from half a mile away.",
        "The closure order bears Duke Aldric's format but not his chancery hand. The signature line was copied from an older fever decree, and the seal wax contains grit from a cheap travel mold.",
        "Once miners believe the writ, extortion becomes law in everything but name."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Track who posted the writ and follow the retreat route away from the tunnel.",
          "nextNodeId": "W05B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Honor the writ as genuine until someone from the duke arrives to confirm it.",
          "failTitle": "The Broker Becomes the Law",
          "failText": "By treating the forgery as real, you give the ring legal cover. Whole camps are sealed off under false authority before you can recover.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Mark the boots, the wax crumbs, and the horse sign together so the forger cannot swap identities later.",
          "nextNodeId": "W05A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W04B",
      "turn": 4,
      "title": "Sealed Gates Without Warrant - Witness Ledger",
      "narrative": [
        "At the tunnel post, you place the writ beside older winter decrees and let <strong>Brother Cadan</strong> compare wax, phrasing, and clerk marks.",
        "The closure order bears Duke Aldric's format but not his chancery hand. The signature line was copied from an older fever decree, and the seal wax contains grit from a cheap travel mold.",
        "Once miners believe the writ, extortion becomes law in everything but name."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Break the forgery publicly by naming the copied signature source and the exact flaw in the seal.",
          "nextNodeId": "W05B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Catalogue every flaw in the decree and copy it for the camp elders before the rumor hardens.",
          "nextNodeId": "W05C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Honor the writ as genuine until someone from the duke arrives to confirm it.",
          "failTitle": "The Broker Becomes the Law",
          "failText": "By treating the forgery as real, you give the ring legal cover. Whole camps are sealed off under false authority before you can recover.",
          "death": false
        }
      ]
    },
    {
      "id": "W04C",
      "turn": 4,
      "title": "Sealed Gates Without Warrant - Shield Road",
      "narrative": [
        "You keep miners from breaking the tunnel barricade while <strong>Marshal Elira Stone</strong> reads the order aloud and holds tempers down.",
        "The closure order bears Duke Aldric's format but not his chancery hand. The signature line was copied from an older fever decree, and the seal wax contains grit from a cheap travel mold.",
        "Once miners believe the writ, extortion becomes law in everything but name."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Honor the writ as genuine until someone from the duke arrives to confirm it.",
          "failTitle": "The Broker Becomes the Law",
          "failText": "By treating the forgery as real, you give the ring legal cover. Whole camps are sealed off under false authority before you can recover.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Replace the false barrier with your own guarded checkpoint so the ring loses both cover and access.",
          "nextNodeId": "W05C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the tunnel under ranger authority and keep the road usable while you investigate deeper.",
          "nextNodeId": "W05A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W05A",
      "turn": 5,
      "title": "The Abbey Cellar - Trail Hunt",
      "narrative": [
        "At <strong>Stonewold Abbey</strong>, you descend past frost-lined barrels and inspect the one reserve crate left untouched in the cellar.",
        "One reserve crate remains, but the ledger page naming its twin has been cut away so neatly that only an insider could have known where to slice. <strong>Mira Voss</strong>, the abbey apothecary, has also gone missing.",
        "The ring has help from someone who understood schedules, seals, and storage long before the cart vanished."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the ash, dust, and boot turn in the cellar passage to identify the exact number of handlers.",
          "nextNodeId": "W06A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Search the whole abbey in public and treat every novice as a suspect.",
          "failTitle": "The Abbey Shuts Its Doors",
          "failText": "Your sweep destroys trust inside the abbey. By the time calmer voices prevail, the useful records are hidden and Mira's trail is gone.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Check the cellar access points and trace who could have moved crates without opening the main doors.",
          "nextNodeId": "W06B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W05B",
      "turn": 5,
      "title": "The Abbey Cellar - Witness Ledger",
      "narrative": [
        "You sit with <strong>Brother Cadan</strong> and the abbey bursar over torn ledger leaves, testing where one missing page should have sat.",
        "One reserve crate remains, but the ledger page naming its twin has been cut away so neatly that only an insider could have known where to slice. <strong>Mira Voss</strong>, the abbey apothecary, has also gone missing.",
        "The ring has help from someone who understood schedules, seals, and storage long before the cart vanished."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Reconstruct the missing ledger page from the remaining entries and the storekeeper memory.",
          "nextNodeId": "W06C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the torn binding threads to prove when the page was cut and who last had lawful access to it.",
          "nextNodeId": "W06B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Search the whole abbey in public and treat every novice as a suspect.",
          "failTitle": "The Abbey Shuts Its Doors",
          "failText": "Your sweep destroys trust inside the abbey. By the time calmer voices prevail, the useful records are hidden and Mira's trail is gone.",
          "death": false
        }
      ]
    },
    {
      "id": "W05C",
      "turn": 5,
      "title": "The Abbey Cellar - Shield Road",
      "narrative": [
        "You keep the abbey calm while frightened novices carry the reserve stock into a guarded room under <strong>Marshal Elira Stone</strong>.",
        "One reserve crate remains, but the ledger page naming its twin has been cut away so neatly that only an insider could have known where to slice. <strong>Mira Voss</strong>, the abbey apothecary, has also gone missing.",
        "The ring has help from someone who understood schedules, seals, and storage long before the cart vanished."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Search the whole abbey in public and treat every novice as a suspect.",
          "failTitle": "The Abbey Shuts Its Doors",
          "failText": "Your sweep destroys trust inside the abbey. By the time calmer voices prevail, the useful records are hidden and Mira's trail is gone.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the reserve stock, calm the abbey, and keep anyone from removing more medicine.",
          "nextNodeId": "W06A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Stabilize the abbey, then place a discreet watch on the cellars and the infirmary at the same time.",
          "nextNodeId": "W06C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W06A",
      "turn": 6,
      "title": "Tracks Above the Scree - Trail Hunt",
      "narrative": [
        "You climb the narrow mule path above <strong>Avalanche Stair</strong>, where crate edges have shaved pale grooves through old snow.",
        "The stolen cargo was broken into smaller loads and hauled over a mule track no legitimate cart should ever use. Signal braziers were lit along the ridge to move the loads between hidden hands.",
        "This is no desperate theft now. It is a working supply chain built to sell medicine back to the sick."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the crate scrapes one station at a time and see where the braziers handed the loads off.",
          "nextNodeId": "W07B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the high path with a full patrol and announce that the smugglers have been found.",
          "failTitle": "The Ridge Empties",
          "failText": "Your noise reaches every signal point before your men do. The loads vanish into blind cuts in the rock and the ridge gives you only cold ash.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Circle above the signal line and catch the ridge watcher before he can warn the next post.",
          "nextNodeId": "W07A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W06B",
      "turn": 6,
      "title": "Tracks Above the Scree - Witness Ledger",
      "narrative": [
        "At a windbreak above the scree, you lay out route notes with <strong>Brother Cadan</strong> and compare them to the abbey schedule.",
        "The stolen cargo was broken into smaller loads and hauled over a mule track no legitimate cart should ever use. Signal braziers were lit along the ridge to move the loads between hidden hands.",
        "This is no desperate theft now. It is a working supply chain built to sell medicine back to the sick."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the sequence of brazier ash to reconstruct the whole transfer chain in the correct order.",
          "nextNodeId": "W07B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Match the mule path to abbey timings and determine which loads were moved first.",
          "nextNodeId": "W07C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the high path with a full patrol and announce that the smugglers have been found.",
          "failTitle": "The Ridge Empties",
          "failText": "Your noise reaches every signal point before your men do. The loads vanish into blind cuts in the rock and the ridge gives you only cold ash.",
          "death": false
        }
      ]
    },
    {
      "id": "W06C",
      "turn": 6,
      "title": "Tracks Above the Scree - Shield Road",
      "narrative": [
        "You keep the main road open below the slope while <strong>Marshal Elira Stone</strong> shifts guards to cover any return move from the high path.",
        "The stolen cargo was broken into smaller loads and hauled over a mule track no legitimate cart should ever use. Signal braziers were lit along the ridge to move the loads between hidden hands.",
        "This is no desperate theft now. It is a working supply chain built to sell medicine back to the sick."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the high path with a full patrol and announce that the smugglers have been found.",
          "failTitle": "The Ridge Empties",
          "failText": "Your noise reaches every signal point before your men do. The loads vanish into blind cuts in the rock and the ridge gives you only cold ash.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the lower exits quietly so anything flushed from the ridge runs into your own hands.",
          "nextNodeId": "W07C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the main road and keep civilians away from the scree while scouts work the high path.",
          "nextNodeId": "W07A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W07A",
      "turn": 7,
      "title": "Silver for Medicine - Trail Hunt",
      "narrative": [
        "You reach <strong>Iron Hollow Camp</strong> before the noon bell and watch miners queue beneath armed men to buy back what was already theirs.",
        "The medicine is genuine, but it is being sold in little stamped packets for silver and obedience. The camp reeve swears he was told no lawful relief would arrive unless he cooperated.",
        "If the camps pay once in fear, the broker will own every gate in the pass."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark the handoff point, then tail the silver collector instead of the visible peddlers.",
          "nextNodeId": "W08A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize the medicine packets on the spot without offering the camp any immediate relief.",
          "failTitle": "The Camp Turns Against You",
          "failText": "Desperate families see only another authority taking medicine from the sick. The broker slips away behind their anger and your case grows weaker.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow the sellers after dark and find where they restock the packets.",
          "nextNodeId": "W08B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W07B",
      "turn": 7,
      "title": "Silver for Medicine - Witness Ledger",
      "narrative": [
        "At the camp chapel, you sit with <strong>Brother Cadan</strong> and three fever families whose receipts bear the same copied seal.",
        "The medicine is genuine, but it is being sold in little stamped packets for silver and obedience. The camp reeve swears he was told no lawful relief would arrive unless he cooperated.",
        "If the camps pay once in fear, the broker will own every gate in the pass."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take sworn copies of the stamped receipts and build a payment trail from the camp outward.",
          "nextNodeId": "W08C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Prove that the packets came from abbey stock by matching herb batches and seal flaws together.",
          "nextNodeId": "W08B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize the medicine packets on the spot without offering the camp any immediate relief.",
          "failTitle": "The Camp Turns Against You",
          "failText": "Desperate families see only another authority taking medicine from the sick. The broker slips away behind their anger and your case grows weaker.",
          "death": false
        }
      ]
    },
    {
      "id": "W07C",
      "turn": 7,
      "title": "Silver for Medicine - Shield Road",
      "narrative": [
        "You arrive with <strong>Marshal Elira Stone</strong> to keep the camp from erupting while sick children and armed foremen crowd the same square.",
        "The medicine is genuine, but it is being sold in little stamped packets for silver and obedience. The camp reeve swears he was told no lawful relief would arrive unless he cooperated.",
        "If the camps pay once in fear, the broker will own every gate in the pass."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize the medicine packets on the spot without offering the camp any immediate relief.",
          "failTitle": "The Camp Turns Against You",
          "failText": "Desperate families see only another authority taking medicine from the sick. The broker slips away behind their anger and your case grows weaker.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stabilize the camp, keep the sick treated, and hold the square without bloodshed.",
          "nextNodeId": "W08A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Distribute emergency doses under guard so the broker loses his strongest hold over the camp.",
          "nextNodeId": "W08C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W08A",
      "turn": 8,
      "title": "The Courier with Two Seals - Trail Hunt",
      "narrative": [
        "You catch the courier below <strong>Windcut Ridge</strong>, where he tries to bury one message tube in the snow and ride on with the other.",
        "One order closes the east road for fever control. The other reopens the same road for a private convoy under hired escort. Both carry the copied pass seal, and both are signed within the same hour.",
        "The courier can identify the broker, but only if he believes you can keep him alive longer than the ring can reach him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the courier route to find the next relay point before the network resets.",
          "nextNodeId": "W09B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten to hang the courier unless he names the broker immediately.",
          "failTitle": "The Courier Clams Up",
          "failText": "You give him only terror and no reason to trust your protection. He tells you nothing useful, and his silence buys the broker another full move.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Feed the courier a false destination and watch which relay rider moves to intercept it.",
          "nextNodeId": "W09A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W08B",
      "turn": 8,
      "title": "The Courier with Two Seals - Witness Ledger",
      "narrative": [
        "In a watch hut at the ridge foot, you spread two sealed orders beside <strong>Brother Cadan</strong> and force the contradictions into daylight.",
        "One order closes the east road for fever control. The other reopens the same road for a private convoy under hired escort. Both carry the copied pass seal, and both are signed within the same hour.",
        "The courier can identify the broker, but only if he believes you can keep him alive longer than the ring can reach him."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Offer lawful protection, then force the courier to identify the clerk who supplied the duplicate seal.",
          "nextNodeId": "W09B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Break down the wording of both orders and show the courier exactly how he was used.",
          "nextNodeId": "W09C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten to hang the courier unless he names the broker immediately.",
          "failTitle": "The Courier Clams Up",
          "failText": "You give him only terror and no reason to trust your protection. He tells you nothing useful, and his silence buys the broker another full move.",
          "death": false
        }
      ]
    },
    {
      "id": "W08C",
      "turn": 8,
      "title": "The Courier with Two Seals - Shield Road",
      "narrative": [
        "You hold the courier under guard with <strong>Marshal Elira Stone</strong>, keeping curious camp men away until the evidence is read cleanly.",
        "One order closes the east road for fever control. The other reopens the same road for a private convoy under hired escort. Both carry the copied pass seal, and both are signed within the same hour.",
        "The courier can identify the broker, but only if he believes you can keep him alive longer than the ring can reach him."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten to hang the courier unless he names the broker immediately.",
          "failTitle": "The Courier Clams Up",
          "failText": "You give him only terror and no reason to trust your protection. He tells you nothing useful, and his silence buys the broker another full move.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move the courier under decoy escort so the ring exposes which post still answers to it.",
          "nextNodeId": "W09C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the prisoner and keep the roads open while you prepare a safe transfer.",
          "nextNodeId": "W09A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W09A",
      "turn": 9,
      "title": "A Prisoner in the Signal Hut - Trail Hunt",
      "narrative": [
        "You force open the signal hut above <strong>Windcut Ridge</strong> and find <strong>Mira Voss</strong> half-frozen but still angry enough to stand.",
        "Mira says she was taken after refusing to alter fever doses for the broker's men. She also names <strong>Serjeant Oren Pike</strong> as the officer who sold guard routes and made the forged quarantines believable.",
        "Once Pike knows Mira is free, he will either run or hit the camps before testimony reaches them."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use Mira's route memory to predict Pike's next post and cut him off before he learns how much she said.",
          "nextNodeId": "W10A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Mira in the hut while you hurry after Pike alone.",
          "failTitle": "The Witness Is Silenced",
          "failText": "Pike never needed more than a few minutes. When you return, the hut is empty, the witness is gone, and your cleanest link to the conspiracy dies with her trail.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Pursue Pike's most likely escape route while Mira is moved under guard.",
          "nextNodeId": "W10B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W09B",
      "turn": 9,
      "title": "A Prisoner in the Signal Hut - Witness Ledger",
      "narrative": [
        "With <strong>Brother Cadan</strong> at her side, you hear Mira's account while the cut signal cord still swings beside the hut window.",
        "Mira says she was taken after refusing to alter fever doses for the broker's men. She also names <strong>Serjeant Oren Pike</strong> as the officer who sold guard routes and made the forged quarantines believable.",
        "Once Pike knows Mira is free, he will either run or hit the camps before testimony reaches them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Mira's statement in full and tie it to the forged orders before the details blur.",
          "nextNodeId": "W10C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Anchor Mira's testimony with abbey records and the courier evidence so Pike cannot call it panic.",
          "nextNodeId": "W10B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Mira in the hut while you hurry after Pike alone.",
          "failTitle": "The Witness Is Silenced",
          "failText": "Pike never needed more than a few minutes. When you return, the hut is empty, the witness is gone, and your cleanest link to the conspiracy dies with her trail.",
          "death": false
        }
      ]
    },
    {
      "id": "W09C",
      "turn": 9,
      "title": "A Prisoner in the Signal Hut - Shield Road",
      "narrative": [
        "You bring Mira under <strong>Marshal Elira Stone</strong>'s protection and clear the ridge before any loyalist can strike at the witness.",
        "Mira says she was taken after refusing to alter fever doses for the broker's men. She also names <strong>Serjeant Oren Pike</strong> as the officer who sold guard routes and made the forged quarantines believable.",
        "Once Pike knows Mira is free, he will either run or hit the camps before testimony reaches them."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Mira in the hut while you hurry after Pike alone.",
          "failTitle": "The Witness Is Silenced",
          "failText": "Pike never needed more than a few minutes. When you return, the hut is empty, the witness is gone, and your cleanest link to the conspiracy dies with her trail.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Move Mira to a safe ward and prepare the pass for Pike to lash out in anger.",
          "nextNodeId": "W10A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Protect Mira openly, then set a second hidden guard line where Pike will expect weakness.",
          "nextNodeId": "W10C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W10A",
      "turn": 10,
      "title": "The Bastion Ledger - Trail Hunt",
      "narrative": [
        "Inside <strong>Stonewold Bastion</strong>, you search the ration vault while Pike's loyal men pretend not to watch you.",
        "The ration ledger matches the dates on the false quarantine orders. <strong>Vey Norrell</strong> appears only in margin notes, always as a broker who never signs directly yet somehow receives every useful consignment.",
        "You now know the ring's shape, but not the single page or witness that will break it cleanly before a magistrate."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the margin notes outward and find where Norrell receives the diverted loads.",
          "nextNodeId": "W11B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest every guard whose name appears near a missing ration entry.",
          "failTitle": "The Bastion Shatters",
          "failText": "You turn suspicion into chaos. Loyal guards draw on frightened ones, the ledger room is wrecked, and Norrell slips away behind the confusion.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the ledger as a movement map and identify the hidden cache that feeds the whole ring.",
          "nextNodeId": "W11A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W10B",
      "turn": 10,
      "title": "The Bastion Ledger - Witness Ledger",
      "narrative": [
        "You sit at the bastion clerk table with <strong>Brother Cadan</strong> and turn missing ration entries into a map of the thefts.",
        "The ration ledger matches the dates on the false quarantine orders. <strong>Vey Norrell</strong> appears only in margin notes, always as a broker who never signs directly yet somehow receives every useful consignment.",
        "You now know the ring's shape, but not the single page or witness that will break it cleanly before a magistrate."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Tie the bastion ledger to the courier orders and Mira's testimony into one chain no clerk can deny.",
          "nextNodeId": "W11B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the missing ration pattern and prepare it as evidence instead of accusation.",
          "nextNodeId": "W11C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest every guard whose name appears near a missing ration entry.",
          "failTitle": "The Bastion Shatters",
          "failText": "You turn suspicion into chaos. Loyal guards draw on frightened ones, the ledger room is wrecked, and Norrell slips away behind the confusion.",
          "death": false
        }
      ]
    },
    {
      "id": "W10C",
      "turn": 10,
      "title": "The Bastion Ledger - Shield Road",
      "narrative": [
        "You keep the bastion yard calm with <strong>Marshal Elira Stone</strong>, making sure no guard burns the records before they are read.",
        "The ration ledger matches the dates on the false quarantine orders. <strong>Vey Norrell</strong> appears only in margin notes, always as a broker who never signs directly yet somehow receives every useful consignment.",
        "You now know the ring's shape, but not the single page or witness that will break it cleanly before a magistrate."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest every guard whose name appears near a missing ration entry.",
          "failTitle": "The Bastion Shatters",
          "failText": "You turn suspicion into chaos. Loyal guards draw on frightened ones, the ledger room is wrecked, and Norrell slips away behind the confusion.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the bastion under control, then quietly separate Pike's men from everyone else before he can give a false order.",
          "nextNodeId": "W11C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the yard, disarm only the men who force the issue, and preserve the records first.",
          "nextNodeId": "W11A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W11A",
      "turn": 11,
      "title": "Storm on Windcut Ridge - Trail Hunt",
      "narrative": [
        "Snow lashes sideways across <strong>Windcut Ridge</strong> as you move through drifts where every fresh print may vanish in minutes.",
        "Norrell uses storm cover because honest patrols slow while hunger and sickness do not. In weather like this, one hidden load can become a whole town's ransom.",
        "Bad weather hides you too, but it shortens every margin for error."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the storm as cover, flank above the ridge line, and catch the load while its guards are blind.",
          "nextNodeId": "W12A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait out the storm in full shelter and assume Norrell will do the same.",
          "failTitle": "The Storm Belongs to Norrell",
          "failText": "The broker does not stop just because the snow turns mean. He moves under the weather while you stand still and the camps pay for it.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Track the storm route carefully and accept slower progress in exchange for certainty.",
          "nextNodeId": "W12B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W11B",
      "turn": 11,
      "title": "Storm on Windcut Ridge - Witness Ledger",
      "narrative": [
        "In a shuttered relay hut, you compare route times with <strong>Brother Cadan</strong> while the storm muffles every outside sound.",
        "Norrell uses storm cover because honest patrols slow while hunger and sickness do not. In weather like this, one hidden load can become a whole town's ransom.",
        "Bad weather hides you too, but it shortens every margin for error."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Map which routes remain possible in this weather and narrow the likely transfer lane.",
          "nextNodeId": "W12C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Predict the only viable storm corridor and set your evidence and riders there before Norrell arrives.",
          "nextNodeId": "W12B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait out the storm in full shelter and assume Norrell will do the same.",
          "failTitle": "The Storm Belongs to Norrell",
          "failText": "The broker does not stop just because the snow turns mean. He moves under the weather while you stand still and the camps pay for it.",
          "death": false
        }
      ]
    },
    {
      "id": "W11C",
      "turn": 11,
      "title": "Storm on Windcut Ridge - Shield Road",
      "narrative": [
        "You keep wagons and fever litters moving through the whiteout under <strong>Marshal Elira Stone</strong> so the camps do not lose hope entirely.",
        "Norrell uses storm cover because honest patrols slow while hunger and sickness do not. In weather like this, one hidden load can become a whole town's ransom.",
        "Bad weather hides you too, but it shortens every margin for error."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait out the storm in full shelter and assume Norrell will do the same.",
          "failTitle": "The Storm Belongs to Norrell",
          "failText": "The broker does not stop just because the snow turns mean. He moves under the weather while you stand still and the camps pay for it.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the relief road alive through the storm and deny the broker easy leverage over the camps.",
          "nextNodeId": "W12A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use protected convoy movement as bait and force the smugglers to reveal which road they still trust.",
          "nextNodeId": "W12C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W12A",
      "turn": 12,
      "title": "Camps on the Edge - Trail Hunt",
      "narrative": [
        "You reach the line between <strong>Red Slate Camp</strong> and <strong>Iron Hollow</strong> as both sides gather with tools in hand and blame on their tongues.",
        "One camp thinks the other informed on the convoy. Pike has been feeding both stories. Another hour of rumor and they will fight each other rather than the broker draining them both.",
        "If the camps split now, Norrell becomes the only supplier either side will still obey."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Find the messenger who carried Pike's lie between the camps and break the rumor chain.",
          "nextNodeId": "W13B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take one camp side and demand the other submit until the truth is sorted out.",
          "failTitle": "The Camps Break",
          "failText": "By choosing a side before proving anything, you turn fear into faction. Norrell no longer needs forged law when he can rule through the quarrel you leave behind.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Expose the rumor carrier in front of both camp leaders before anyone can twist the story again.",
          "nextNodeId": "W13A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W12B",
      "turn": 12,
      "title": "Camps on the Edge - Witness Ledger",
      "narrative": [
        "You work between the two camp elders with <strong>Brother Cadan</strong>, laying receipts, names, and timelines on a crate between them.",
        "One camp thinks the other informed on the convoy. Pike has been feeding both stories. Another hour of rumor and they will fight each other rather than the broker draining them both.",
        "If the camps split now, Norrell becomes the only supplier either side will still obey."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Force a shared testimony from both camps and turn their anger upward toward Norrell, not sideways.",
          "nextNodeId": "W13B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lay out the receipts and timelines until both sides see the same hand behind their losses.",
          "nextNodeId": "W13C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take one camp side and demand the other submit until the truth is sorted out.",
          "failTitle": "The Camps Break",
          "failText": "By choosing a side before proving anything, you turn fear into faction. Norrell no longer needs forged law when he can rule through the quarrel you leave behind.",
          "death": false
        }
      ]
    },
    {
      "id": "W12C",
      "turn": 12,
      "title": "Camps on the Edge - Shield Road",
      "narrative": [
        "With <strong>Marshal Elira Stone</strong>, you hold the lane between the camps and keep frightened families behind the wagons instead of in the argument.",
        "One camp thinks the other informed on the convoy. Pike has been feeding both stories. Another hour of rumor and they will fight each other rather than the broker draining them both.",
        "If the camps split now, Norrell becomes the only supplier either side will still obey."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Take one camp side and demand the other submit until the truth is sorted out.",
          "failTitle": "The Camps Break",
          "failText": "By choosing a side before proving anything, you turn fear into faction. Norrell no longer needs forged law when he can rule through the quarrel you leave behind.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Deliver guarded medicine to both camps at once so neither believes the other has been favored.",
          "nextNodeId": "W13C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the peace line, keep the fever wards supplied, and stop the first blow before it lands.",
          "nextNodeId": "W13A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W13A",
      "turn": 13,
      "title": "Oren Pike Shows His Hand - Trail Hunt",
      "narrative": [
        "At the lower checkpoint, <strong>Serjeant Oren Pike</strong> finally drops the mask and bars the road with men who still think they serve the duke.",
        "Pike orders all recovered crates turned over for inspection and claims only he can enforce the quarantine law. Some of his men hesitate when they see Mira alive and the forged orders in your hand.",
        "Break Pike cleanly and his men may yield. Mishandle him and the whole pass will think the duke's officers are at war with each other."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut Pike off from his horse and signal line before he can turn retreat into command.",
          "nextNodeId": "W14A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Draw steel on Pike before his own men hear the evidence against him.",
          "failTitle": "The Checkpoint Erupts",
          "failText": "The line collapses into blind fighting. Pike escapes in the confusion and every honest guard is left wondering who betrayed whom.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Force Pike back from the road and chase him only once the checkpoint is safe.",
          "nextNodeId": "W14B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W13B",
      "turn": 13,
      "title": "Oren Pike Shows His Hand - Witness Ledger",
      "narrative": [
        "You confront Pike with ledgers and witness names while <strong>Brother Cadan</strong> stands beside you to keep every word exact.",
        "Pike orders all recovered crates turned over for inspection and claims only he can enforce the quarantine law. Some of his men hesitate when they see Mira alive and the forged orders in your hand.",
        "Break Pike cleanly and his men may yield. Mishandle him and the whole pass will think the duke's officers are at war with each other."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Read the case against Pike in full and let his own men hear the lies unravel.",
          "nextNodeId": "W14C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Break Pike with the exact contradiction between his duty roster and the forged quarantine hour.",
          "nextNodeId": "W14B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Draw steel on Pike before his own men hear the evidence against him.",
          "failTitle": "The Checkpoint Erupts",
          "failText": "The line collapses into blind fighting. Pike escapes in the confusion and every honest guard is left wondering who betrayed whom.",
          "death": false
        }
      ]
    },
    {
      "id": "W13C",
      "turn": 13,
      "title": "Oren Pike Shows His Hand - Shield Road",
      "narrative": [
        "Under <strong>Marshal Elira Stone</strong>, you face a line of armed guards who are not yet traitors, only trapped beneath a corrupt command.",
        "Pike orders all recovered crates turned over for inspection and claims only he can enforce the quarantine law. Some of his men hesitate when they see Mira alive and the forged orders in your hand.",
        "Break Pike cleanly and his men may yield. Mishandle him and the whole pass will think the duke's officers are at war with each other."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Draw steel on Pike before his own men hear the evidence against him.",
          "failTitle": "The Checkpoint Erupts",
          "failText": "The line collapses into blind fighting. Pike escapes in the confusion and every honest guard is left wondering who betrayed whom.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the checkpoint steady, disarm only the men who push forward, and keep the road alive.",
          "nextNodeId": "W14A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Win Pike's wavering guards first so his line collapses without a broad fight.",
          "nextNodeId": "W14C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W14A",
      "turn": 14,
      "title": "The Night Transfer - Trail Hunt",
      "narrative": [
        "By moonlight you follow fresh runners toward the abandoned lime tunnels below <strong>Saint Brannoc Chapel</strong>.",
        "Norrell is moving the largest remaining cache through the lime tunnels under cover of burial supplies and plague cloth. If he gets it through the chapel undercroft, he keeps enough medicine to control the pass for another month.",
        "This is the first moment when one clean blow could break the ring's supply instead of merely harrying its edges."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow the carriers through the outer tunnel and learn where the full load will surface.",
          "nextNodeId": "W15B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Storm the tunnel mouth with torches and shout for surrender.",
          "failTitle": "The Tunnels Go Dark",
          "failText": "The carriers kill the lights, crush the obvious route, and vanish through passages only their guide knows. You lose the cache and the advantage with it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Slip past the first handoff, seize the tunnel guide, and turn the whole transfer blind from the inside.",
          "nextNodeId": "W15A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W14B",
      "turn": 14,
      "title": "The Night Transfer - Witness Ledger",
      "narrative": [
        "In the chapel vestry, you compare burial salt records with <strong>Brother Cadan</strong> and find that half the listed loads never belonged there.",
        "Norrell is moving the largest remaining cache through the lime tunnels under cover of burial supplies and plague cloth. If he gets it through the chapel undercroft, he keeps enough medicine to control the pass for another month.",
        "This is the first moment when one clean blow could break the ring's supply instead of merely harrying its edges."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the chapel register to identify the exact false consignment carrying Norrell's main cache tonight.",
          "nextNodeId": "W15B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Prove the burial cargo lie on paper and keep the chapel records ready for dawn judgment.",
          "nextNodeId": "W15C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Storm the tunnel mouth with torches and shout for surrender.",
          "failTitle": "The Tunnels Go Dark",
          "failText": "The carriers kill the lights, crush the obvious route, and vanish through passages only their guide knows. You lose the cache and the advantage with it.",
          "death": false
        }
      ]
    },
    {
      "id": "W14C",
      "turn": 14,
      "title": "The Night Transfer - Shield Road",
      "narrative": [
        "You place <strong>Marshal Elira Stone</strong> on the chapel road, keeping villagers clear while the hidden transfer starts below them.",
        "Norrell is moving the largest remaining cache through the lime tunnels under cover of burial supplies and plague cloth. If he gets it through the chapel undercroft, he keeps enough medicine to control the pass for another month.",
        "This is the first moment when one clean blow could break the ring's supply instead of merely harrying its edges."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Storm the tunnel mouth with torches and shout for surrender.",
          "failTitle": "The Tunnels Go Dark",
          "failText": "The carriers kill the lights, crush the obvious route, and vanish through passages only their guide knows. You lose the cache and the advantage with it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal every visible exit quietly so the carriers have to run into your prepared ground.",
          "nextNodeId": "W15C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lock down the chapel road and prevent the transfer from spilling into the village.",
          "nextNodeId": "W15A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W15A",
      "turn": 15,
      "title": "Fire at the Rope Bridge - Trail Hunt",
      "narrative": [
        "You smell pitch before you see it. At <strong>North Rope Bridge</strong>, a second ring team is already setting the planks for fire.",
        "The bridge fire is meant to cover the chapel transfer and cut relief to the eastern camps in the same stroke. If the bridge goes, even victory elsewhere will feel thin to the sick beyond it.",
        "For the first time, the ring is willing to burn routes rather than merely tax them."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut down the pitch crew from cover, save the bridge, and keep one rider free to follow the fleeing leader.",
          "nextNodeId": "W16A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge straight onto the burning bridge to fight the saboteurs hand to hand.",
          "failTitle": "The Ranger Falls",
          "failText": "The tarred rope gives under your weight. You vanish into smoke and gorge water, and the bridge burns with the pass still in Norrell's hands.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Drive the saboteurs off the bridgehead first, then secure the span before pursuit.",
          "nextNodeId": "W16B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W15B",
      "turn": 15,
      "title": "Fire at the Rope Bridge - Witness Ledger",
      "narrative": [
        "You read the diversion for what it is and tell <strong>Brother Cadan</strong> that the blaze matters because the tunnel fight matters more.",
        "The bridge fire is meant to cover the chapel transfer and cut relief to the eastern camps in the same stroke. If the bridge goes, even victory elsewhere will feel thin to the sick beyond it.",
        "For the first time, the ring is willing to burn routes rather than merely tax them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Read the bridge attack as a timed diversion and split your response with discipline.",
          "nextNodeId": "W16C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Prove which tunnel move the fire was meant to hide, then counter both halves in the right order.",
          "nextNodeId": "W16B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge straight onto the burning bridge to fight the saboteurs hand to hand.",
          "failTitle": "The Ranger Falls",
          "failText": "The tarred rope gives under your weight. You vanish into smoke and gorge water, and the bridge burns with the pass still in Norrell's hands.",
          "death": true
        }
      ]
    },
    {
      "id": "W15C",
      "turn": 15,
      "title": "Fire at the Rope Bridge - Shield Road",
      "narrative": [
        "With <strong>Marshal Elira Stone</strong>, you get bucket lines and crossbows into place while the wind whips sparks over the gorge.",
        "The bridge fire is meant to cover the chapel transfer and cut relief to the eastern camps in the same stroke. If the bridge goes, even victory elsewhere will feel thin to the sick beyond it.",
        "For the first time, the ring is willing to burn routes rather than merely tax them."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge straight onto the burning bridge to fight the saboteurs hand to hand.",
          "failTitle": "The Ranger Falls",
          "failText": "The tarred rope gives under your weight. You vanish into smoke and gorge water, and the bridge burns with the pass still in Norrell's hands.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Save the bridge and hold the relief line even if the tunnel strike must wait a little.",
          "nextNodeId": "W16A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the bridge standing while a hidden reserve circles toward the tunnel rear.",
          "nextNodeId": "W16C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W16A",
      "turn": 16,
      "title": "The Hidden Cache - Trail Hunt",
      "narrative": [
        "Behind a collapsed quarry shrine, you find the cache at last: stacked herb crates, seal molds, copied writ blanks, and a winter ledger in <strong>Vey Norrell</strong>'s own hand.",
        "This is the spine of the extortion scheme. The ledger names camp payments, guard bribes, delivery dates, and the stock Norrell still hopes to move through the lower chapel crypt.",
        "The ring is exposed, but Norrell still has silver, frightened men, and one last route through the stone below the chapel."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the ledger and let the cache sit under guard while you pursue Norrell's escape lane.",
          "nextNodeId": "W17B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the entire cache at once before checking whether Norrell left a rear trap on it.",
          "failTitle": "The Cache Scatters",
          "failText": "The rear passage collapses under a prepared charge. You save some crates, but the proof breaks apart and Norrell escapes with the cleanest names still hidden.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the ledger and fresh tracks together to predict the exact crypt route Norrell will trust.",
          "nextNodeId": "W17A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W16B",
      "turn": 16,
      "title": "The Hidden Cache - Witness Ledger",
      "narrative": [
        "You spread the ledger beside the forged molds with <strong>Brother Cadan</strong> and feel the whole ring finally take solid shape.",
        "This is the spine of the extortion scheme. The ledger names camp payments, guard bribes, delivery dates, and the stock Norrell still hopes to move through the lower chapel crypt.",
        "The ring is exposed, but Norrell still has silver, frightened men, and one last route through the stone below the chapel."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Turn the ledger into a complete prosecution chain before Norrell can offer any lesser lie.",
          "nextNodeId": "W17B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Catalogue the cache carefully so every seized item strengthens the case instead of muddying it.",
          "nextNodeId": "W17C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the entire cache at once before checking whether Norrell left a rear trap on it.",
          "failTitle": "The Cache Scatters",
          "failText": "The rear passage collapses under a prepared charge. You save some crates, but the proof breaks apart and Norrell escapes with the cleanest names still hidden.",
          "death": false
        }
      ]
    },
    {
      "id": "W16C",
      "turn": 16,
      "title": "The Hidden Cache - Shield Road",
      "narrative": [
        "You ring the quarry shrine with guards under <strong>Marshal Elira Stone</strong> so nothing leaves before it is counted and seen.",
        "This is the spine of the extortion scheme. The ledger names camp payments, guard bribes, delivery dates, and the stock Norrell still hopes to move through the lower chapel crypt.",
        "The ring is exposed, but Norrell still has silver, frightened men, and one last route through the stone below the chapel."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the entire cache at once before checking whether Norrell left a rear trap on it.",
          "failTitle": "The Cache Scatters",
          "failText": "The rear passage collapses under a prepared charge. You save some crates, but the proof breaks apart and Norrell escapes with the cleanest names still hidden.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hold the cache, feed the camps from it at once, and deny Norrell any claim that only he can keep people alive.",
          "nextNodeId": "W17C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the cache and start moving medicine to the camps before someone tries to burn the stock.",
          "nextNodeId": "W17A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W17A",
      "turn": 17,
      "title": "The Camps Choose - Trail Hunt",
      "narrative": [
        "At <strong>Red Slate Yard</strong>, you stand before miners, teamsters, and fever warders who now know the ring was real but still differ on what justice should cost.",
        "Some want immediate vengeance on every named guard. Others care only that the medicine moves now. The truth is finally strong enough to unite the camps or split them for good.",
        "If the camps stand together, Norrell loses his shield. If they splinter, he can still bargain his way into a smaller escape."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the public gathering as cover and move on Norrell before anyone inside the crowd can warn him.",
          "nextNodeId": "W18A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise the crowd instant justice before the prisoners and proof are fully secured.",
          "failTitle": "Justice Turns to Fury",
          "failText": "The crowd surges before you can direct it. Prisoners vanish, good witnesses hide, and the pass trades law for rage at the very edge of victory.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the crowd back, then strike at Norrell's escape with only your most reliable riders.",
          "nextNodeId": "W18B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W17B",
      "turn": 17,
      "title": "The Camps Choose - Witness Ledger",
      "narrative": [
        "With <strong>Brother Cadan</strong>, you lay the cache ledger beside the receipts and force the camps to hear the whole theft in plain sequence.",
        "Some want immediate vengeance on every named guard. Others care only that the medicine moves now. The truth is finally strong enough to unite the camps or split them for good.",
        "If the camps stand together, Norrell loses his shield. If they splinter, he can still bargain his way into a smaller escape."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Win a formal camp oath to support lawful judgment, then close the net one step later.",
          "nextNodeId": "W18C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the ledger aloud, bind both camps to witness together, and break Norrell's political shelter on the spot.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise the crowd instant justice before the prisoners and proof are fully secured.",
          "failTitle": "Justice Turns to Fury",
          "failText": "The crowd surges before you can direct it. Prisoners vanish, good witnesses hide, and the pass trades law for rage at the very edge of victory.",
          "death": false
        }
      ]
    },
    {
      "id": "W17C",
      "turn": 17,
      "title": "The Camps Choose - Shield Road",
      "narrative": [
        "Under <strong>Marshal Elira Stone</strong>, you keep armed grief from turning into mob rule while the recovered medicine is counted out openly.",
        "Some want immediate vengeance on every named guard. Others care only that the medicine moves now. The truth is finally strong enough to unite the camps or split them for good.",
        "If the camps stand together, Norrell loses his shield. If they splinter, he can still bargain his way into a smaller escape."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise the crowd instant justice before the prisoners and proof are fully secured.",
          "failTitle": "Justice Turns to Fury",
          "failText": "The crowd surges before you can direct it. Prisoners vanish, good witnesses hide, and the pass trades law for rage at the very edge of victory.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Distribute medicine first and keep the camps calm even if Norrell gains a little distance.",
          "nextNodeId": "W18A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Deliver the first relief doses publicly, then turn the grateful camps into your strongest witness line.",
          "nextNodeId": "W18C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W18A",
      "turn": 18,
      "title": "Stone Beneath the Chapel - Trail Hunt",
      "narrative": [
        "Below <strong>Saint Brannoc Chapel</strong>, you enter the undercroft where lime dust, candle smoke, and boot prints all run toward the same narrow crypt door.",
        "Norrell has withdrawn into the undercroft with what silver he can still carry. He wants either time to flee or a narrow deal that lets him keep enough wealth to rebuild the ring elsewhere.",
        "The next move decides whether this ends in law, compromise, or one last hard chase through stone and snow."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Press the undercroft carefully and keep the exit routes watched rather than gambling on one rush.",
          "nextNodeId": "W19B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take Norrell's offer to talk alone and trust his word long enough to hear it out.",
          "failTitle": "The Broker Slips the Stone",
          "failText": "Norrell only wanted distance and darkness. By the time you see the trick, he is gone through the burial passage and your best moment with him has passed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut through the side crypt at once and strike where Norrell thinks the stone still hides him.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        }
      ]
    },
    {
      "id": "W18B",
      "turn": 18,
      "title": "Stone Beneath the Chapel - Witness Ledger",
      "narrative": [
        "By chapel light, you compare the crypt register with <strong>Brother Cadan</strong> and identify which passage Norrell disguised as a burial route.",
        "Norrell has withdrawn into the undercroft with what silver he can still carry. He wants either time to flee or a narrow deal that lets him keep enough wealth to rebuild the ring elsewhere.",
        "The next move decides whether this ends in law, compromise, or one last hard chase through stone and snow."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Turn the crypt register, cache ledger, and witness chain into a complete trap Norrell cannot argue his way out of.",
          "nextNodeId": "W19B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the chapel record to deny Norrell any lawful excuse for his last hiding place.",
          "nextNodeId": "W19C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take Norrell's offer to talk alone and trust his word long enough to hear it out.",
          "failTitle": "The Broker Slips the Stone",
          "failText": "Norrell only wanted distance and darkness. By the time you see the trick, he is gone through the burial passage and your best moment with him has passed.",
          "death": false
        }
      ]
    },
    {
      "id": "W18C",
      "turn": 18,
      "title": "Stone Beneath the Chapel - Shield Road",
      "narrative": [
        "You hold the chapel close with <strong>Marshal Elira Stone</strong>, keeping villagers clear while the last loyal smugglers retreat below the floor stones.",
        "Norrell has withdrawn into the undercroft with what silver he can still carry. He wants either time to flee or a narrow deal that lets him keep enough wealth to rebuild the ring elsewhere.",
        "The next move decides whether this ends in law, compromise, or one last hard chase through stone and snow."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Take Norrell's offer to talk alone and trust his word long enough to hear it out.",
          "failTitle": "The Broker Slips the Stone",
          "failText": "Norrell only wanted distance and darkness. By the time you see the trick, he is gone through the burial passage and your best moment with him has passed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the chapel above, protect the village, and force Norrell into the one exit you already own.",
          "nextNodeId": "W19C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the chapel and the relief wagons first, even if Norrell may buy himself a little room.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        }
      ]
    },
    {
      "id": "W19A",
      "turn": 19,
      "title": "The Bridge of Verdict - Trail Hunt",
      "narrative": [
        "Snowmelt hammers the pilings at <strong>Frostbell Bridge</strong> while Norrell's last escort tries to force a westbound path across the span.",
        "Everyone who still matters has converged on the crossing: camp elders, surviving guards, Mira, Pike's prisoners, and Norrell himself with what little silver and steel he can still command.",
        "There is no wider board left to play. One clean command wins the pass, one bad one lets the broker vanish into the low country."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the bridge geometry, pin the escort, and take Norrell alive before he can break west.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Norrell's escort head-on and trust force to settle the bridge.",
          "failTitle": "The Ranger Falls",
          "failText": "The bridge narrows your line and hands the broker the exact kill lane he wanted. Steel closes around you before the others can follow, and the pass loses its one steady hand.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the west rail, squeeze the escort back, and accept that Norrell may not fall today.",
          "nextNodeId": "W20B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "W19B",
      "turn": 19,
      "title": "The Bridge of Verdict - Witness Ledger",
      "narrative": [
        "You stand on the bridge rise with <strong>Brother Cadan</strong>, ledger case in hand, knowing the final words must be backed by final control.",
        "Everyone who still matters has converged on the crossing: camp elders, surviving guards, Mira, Pike's prisoners, and Norrell himself with what little silver and steel he can still command.",
        "There is no wider board left to play. One clean command wins the pass, one bad one lets the broker vanish into the low country."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Read the charges publicly, then force surrender before blood drives the crowd mad.",
          "nextNodeId": "W20C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Break Norrell with the full case in front of both camps and seize him the instant his own men hesitate.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Norrell's escort head-on and trust force to settle the bridge.",
          "failTitle": "The Ranger Falls",
          "failText": "The bridge narrows your line and hands the broker the exact kill lane he wanted. Steel closes around you before the others can follow, and the pass loses its one steady hand.",
          "death": true
        }
      ]
    },
    {
      "id": "W19C",
      "turn": 19,
      "title": "The Bridge of Verdict - Shield Road",
      "narrative": [
        "With <strong>Marshal Elira Stone</strong>, you anchor both approaches to <strong>Frostbell Bridge</strong> and deny the broker open ground for panic.",
        "Everyone who still matters has converged on the crossing: camp elders, surviving guards, Mira, Pike's prisoners, and Norrell himself with what little silver and steel he can still command.",
        "There is no wider board left to play. One clean command wins the pass, one bad one lets the broker vanish into the low country."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Norrell's escort head-on and trust force to settle the bridge.",
          "failTitle": "The Ranger Falls",
          "failText": "The bridge narrows your line and hands the broker the exact kill lane he wanted. Steel closes around you before the others can follow, and the pass loses its one steady hand.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the bridge and the medicine first, even if the broker slips away into exile.",
          "nextNodeId": "W20A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lock both bridgeheads, shield the crowd, and leave Norrell nowhere lawful or physical to run.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        }
      ]
    },
    {
      "id": "W20A",
      "turn": 20,
      "title": "The Pass Opens - Trail Hunt",
      "narrative": [
        "Dawn washes the ridge as you ride the reclaimed herb road one last time, checking that no hidden post still answers to the old ring.",
        "Medicine wagons stand ready, the sick already have the first true relief in days, and every camp is listening for your final order on what happens to the prisoners, the evidence, and the road itself.",
        "The last choice is about shape rather than survival: whether Brackenwald remembers this as restoration, compromise, or one more hard winter barely averted."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Order the road reopened under heavy watch and let the lesser names be judged in due course.",
          "nextNodeId": null,
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hand the whole matter off without giving any clear final order of your own.",
          "failTitle": "The Verdict Dissolves",
          "failText": "Without a firm close, frightened factions reclaim the story for themselves. Relief still moves, but the pass leaves the crisis unsure who truly restored it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reopen the road, lock the case, and name the chain of command that will keep the pass honest after you ride on.",
          "nextNodeId": null,
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "W20B",
      "turn": 20,
      "title": "The Pass Opens - Witness Ledger",
      "narrative": [
        "At the long table outside <strong>Stonewold Bastion</strong>, you set the ledgers, seals, and witness marks in final order with <strong>Brother Cadan</strong> beside you.",
        "Medicine wagons stand ready, the sick already have the first true relief in days, and every camp is listening for your final order on what happens to the prisoners, the evidence, and the road itself.",
        "The last choice is about shape rather than survival: whether Brackenwald remembers this as restoration, compromise, or one more hard winter barely averted."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Finish the case in full, secure every witness, and force a judgment strong enough to outlive the winter.",
          "nextNodeId": null,
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Deliver the evidence cleanly and accept a practical settlement if it keeps relief moving.",
          "nextNodeId": null,
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hand the whole matter off without giving any clear final order of your own.",
          "failTitle": "The Verdict Dissolves",
          "failText": "Without a firm close, frightened factions reclaim the story for themselves. Relief still moves, but the pass leaves the crisis unsure who truly restored it.",
          "death": false
        }
      ]
    },
    {
      "id": "W20C",
      "turn": 20,
      "title": "The Pass Opens - Shield Road",
      "narrative": [
        "You stand with <strong>Marshal Elira Stone</strong> among reopened wagons, guarded prisoners, and waiting camp elders as the pass prepares to breathe again.",
        "Medicine wagons stand ready, the sick already have the first true relief in days, and every camp is listening for your final order on what happens to the prisoners, the evidence, and the road itself.",
        "The last choice is about shape rather than survival: whether Brackenwald remembers this as restoration, compromise, or one more hard winter barely averted."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Hand the whole matter off without giving any clear final order of your own.",
          "failTitle": "The Verdict Dissolves",
          "failText": "Without a firm close, frightened factions reclaim the story for themselves. Relief still moves, but the pass leaves the crisis unsure who truly restored it.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set the camps, the road, and the prisoners under one lawful settlement that closes the ring for good.",
          "nextNodeId": null,
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Put medicine movement first and let the political reckoning come with time.",
          "nextNodeId": null,
          "scoreDelta": 0
        }
      ]
    }
  ]
});
