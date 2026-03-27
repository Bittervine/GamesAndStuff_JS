window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "bell-under-blackmere",
  "title": "The Bell Under Blackmere",
  "summary": "A more verbose Deep Marsh story about a stolen relief barge, ghost-bell rumors, forged flood orders, and a smuggling ring that tries to replace lawful ferries with extortion dressed as rescue.",
  "maxTurns": 20,
  "startNodeId": "M01A",
  "goodScoreThreshold": 11,
  "epilogues": {
    "high": "You break Garran Pell's racket, restore lawful ferry traffic across Blackmere, and leave the marsh with both medicine and memory intact. The old bell tower becomes only a landmark again, and the Deep Marshes remember that Brackenwald's law can move even through fog, fear, and floodwater.",
    "low": "You recover enough cargo and expose enough of Pell's scheme to save the villages from the worst outcome, but parts of his network survive in scattered loyalties and half-buried favors. The ferries run again, yet every flood order and every distant bell is heard with a trace of doubt."
  },
  "nodes": [
    {
      "id": "M01A",
      "turn": 1,
      "title": "The Silent Barge - Reed Trail",
      "narrative": [
        "You guide <strong>Thorne</strong> along the soaked margin of <strong>Blackmere Reach</strong>, where a towline has been cut cleanly and the reeds still lean from the weight of a missing barge. Beside you, the marsh scout <strong>Ivo Sedge</strong> is absent, his usual route stake empty in the mud.",
        "The missing vessel, the <strong>Saint Rowan</strong>, carried winter stores too essential to vanish by accident. Someone cut it out of the channel in heavy mist, and whoever did it wanted the marsh villages frightened enough to accept private tolls, private ferries, and private law before dawn.",
        "If the first story to spread is that the marsh itself devoured the barge, then the real thieves gain half their victory without drawing another blade."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the bank, the current, and the pole marks together so the hidden side channel reveals itself at once.",
          "nextNodeId": "M02A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume the barge simply drifted loose in the fog and search the open water first.",
          "failTitle": "The Marsh Takes the Lead",
          "failText": "By the time you realize the towline was cut and the drift was staged, the true track through the side channels is trampled out. The thieves move the cargo while the marsh watches you search the wrong water.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the cut towline into the reeds and see where the barge was first pulled aside.",
          "nextNodeId": "M02B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M01B",
      "turn": 1,
      "title": "The Silent Barge - Lantern Ledger",
      "narrative": [
        "Under the leaking eaves of <strong>Reedwatch Abbey Wharf</strong>, you unroll freight tallies with <strong>Sister Maelin</strong> and mark the hour the relief barge vanished from every expected lantern point. Salt, fever draughts, and lamp oil were all due upriver before nightfall and none of it arrived.",
        "The missing vessel, the <strong>Saint Rowan</strong>, carried winter stores too essential to vanish by accident. Someone cut it out of the channel in heavy mist, and whoever did it wanted the marsh villages frightened enough to accept private tolls, private ferries, and private law before dawn.",
        "If the first story to spread is that the marsh itself devoured the barge, then the real thieves gain half their victory without drawing another blade."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Rebuild the barge's last lawful route from lantern logs and freight timings.",
          "nextNodeId": "M02C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cross-check the wharf ledger against bell times and identify the exact watch point where the route was stolen.",
          "nextNodeId": "M02B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume the barge simply drifted loose in the fog and search the open water first.",
          "failTitle": "The Marsh Takes the Lead",
          "failText": "By the time you realize the towline was cut and the drift was staged, the true track through the side channels is trampled out. The thieves move the cargo while the marsh watches you search the wrong water.",
          "death": false
        }
      ]
    },
    {
      "id": "M01C",
      "turn": 1,
      "title": "The Silent Barge - Ferry Guard",
      "narrative": [
        "At the crowded landing by <strong>Blackmere Reach</strong>, you keep ferrymen, villagers, and abbey novices from collapsing into rumor while <strong>Warden Hester Vale</strong> counts what the marsh just swallowed. Every face there knows the lost cargo was meant for sick hamlets deeper in the reeds.",
        "The missing vessel, the <strong>Saint Rowan</strong>, carried winter stores too essential to vanish by accident. Someone cut it out of the channel in heavy mist, and whoever did it wanted the marsh villages frightened enough to accept private tolls, private ferries, and private law before dawn.",
        "If the first story to spread is that the marsh itself devoured the barge, then the real thieves gain half their victory without drawing another blade."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Assume the barge simply drifted loose in the fog and search the open water first.",
          "failTitle": "The Marsh Takes the Lead",
          "failText": "By the time you realize the towline was cut and the drift was staged, the true track through the side channels is trampled out. The thieves move the cargo while the marsh watches you search the wrong water.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the landing steady and keep the frightened boatmen working while riders spread the alarm carefully.",
          "nextNodeId": "M02A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Stabilize the wharf, protect the abbey stores, and dispatch a split warning so no hamlet thinks it has been abandoned.",
          "nextNodeId": "M02C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M02A",
      "turn": 2,
      "title": "Bells in the Fog - Reed Trail",
      "narrative": [
        "Farther down the mire, you find iron bell marks struck into wet poles and hear from three separate banks the same tale of a bell tolling from water where no ferry should be. The sound was used to turn honest boats away from the main channel just long enough for the stolen barge to pass unseen.",
        "Somebody is weaponizing the marsh's oldest superstition: the bell said to ring when the drowned priory wants another soul. A thief who can make good men believe that old sound has returned can close routes, redirect cargo, and collect silver for the 'safe' crossings he controls.",
        "If the villages accept a haunted marsh as the cause, no one will look hard at the living hands placing bells, poles, and lies in the dark."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Track the false bell line through the reeds and test where the markers were planted from a boat.",
          "nextNodeId": "M03B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Repeat the ghost-bell warning to keep civilians away from the water.",
          "failTitle": "The Fog Serves the Thieves",
          "failText": "The warning does what the smugglers hoped it would do. Honest traffic stops, the side channels empty, and the stolen cargo moves beneath a fear you helped strengthen.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Find the hidden bell pole and use its angle in the mud to trace the exact boat that set it.",
          "nextNodeId": "M03A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M02B",
      "turn": 2,
      "title": "Bells in the Fog - Lantern Ledger",
      "narrative": [
        "With <strong>Sister Maelin</strong> at a lamp table, you compare witness phrases and realize every frightened ferryman repeats the same details in the same order, as if the rumor itself was handed out like a notice. The ghost-bell story was prepared before anyone claimed to hear it.",
        "Somebody is weaponizing the marsh's oldest superstition: the bell said to ring when the drowned priory wants another soul. A thief who can make good men believe that old sound has returned can close routes, redirect cargo, and collect silver for the 'safe' crossings he controls.",
        "If the villages accept a haunted marsh as the cause, no one will look hard at the living hands placing bells, poles, and lies in the dark."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Break the ghost story apart detail by detail until the staged script behind it becomes obvious to every witness.",
          "nextNodeId": "M03B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Interview the ferrymen separately and separate repeated rumor from real observation.",
          "nextNodeId": "M03C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Repeat the ghost-bell warning to keep civilians away from the water.",
          "failTitle": "The Fog Serves the Thieves",
          "failText": "The warning does what the smugglers hoped it would do. Honest traffic stops, the side channels empty, and the stolen cargo moves beneath a fear you helped strengthen.",
          "death": false
        }
      ]
    },
    {
      "id": "M02C",
      "turn": 2,
      "title": "Bells in the Fog - Ferry Guard",
      "narrative": [
        "You move among moored skiffs with <strong>Warden Hester Vale</strong>, keeping crews from cutting free and fleeing to drier ground. Fear is spreading faster than water, and frightened ferrymen are already speaking of closing the night crossings entirely.",
        "Somebody is weaponizing the marsh's oldest superstition: the bell said to ring when the drowned priory wants another soul. A thief who can make good men believe that old sound has returned can close routes, redirect cargo, and collect silver for the 'safe' crossings he controls.",
        "If the villages accept a haunted marsh as the cause, no one will look hard at the living hands placing bells, poles, and lies in the dark."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Repeat the ghost-bell warning to keep civilians away from the water.",
          "failTitle": "The Fog Serves the Thieves",
          "failText": "The warning does what the smugglers hoped it would do. Honest traffic stops, the side channels empty, and the stolen cargo moves beneath a fear you helped strengthen.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use visible patrols to calm the landing while hidden watchers test which bank the rumor runners return to.",
          "nextNodeId": "M03C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the crossings open under guard and stop panic from doing the smugglers' work for them.",
          "nextNodeId": "M03A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M03A",
      "turn": 3,
      "title": "Survivors Among the Reeds - Reed Trail",
      "narrative": [
        "In a pocket of black water behind a reed wall, you find two bargemen clinging to a punt half-full of marsh water and splintered crates. They were beaten, cut loose, and shoved into cover so their stories would emerge only after the cargo had traveled well beyond pursuit.",
        "The bargemen speak of masked men, hooked poles, and a command to 'ring it again' when the first tow went wide. They also describe an official-sounding order to divert the cargo for 'flood quarantine,' a phrase too tidy and too useful to have been improvised on the water.",
        "A false order, spoken in the right voice, can command a marsh lane faster than any drawn steel."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the survivors' drift, pole gouges, and current pull together to recover the ambush point exactly.",
          "nextNodeId": "M04A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force the survivors to name suspects before they can breathe properly.",
          "failTitle": "The Witnesses Break",
          "failText": "You press too hard and get only fear, contradiction, and silence. What could have become a clean thread of testimony collapses into panic and doubt.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the punt drift backward and see where the bargemen were first hidden after the attack.",
          "nextNodeId": "M04B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M03B",
      "turn": 3,
      "title": "Survivors Among the Reeds - Lantern Ledger",
      "narrative": [
        "You shelter the survivors in a reed hut and let <strong>Sister Maelin</strong> steady them with broth while you test each memory against the other. One remembers a toll-captain's voice giving orders from the fog; the other remembers a hand lantern painted blue, not abbey white.",
        "The bargemen speak of masked men, hooked poles, and a command to 'ring it again' when the first tow went wide. They also describe an official-sounding order to divert the cargo for 'flood quarantine,' a phrase too tidy and too useful to have been improvised on the water.",
        "A false order, spoken in the right voice, can command a marsh lane faster than any drawn steel."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take both accounts slowly and build a clear sequence of commands, lantern signals, and voices.",
          "nextNodeId": "M04C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Anchor their testimony to one memorable detail and narrow the false officer's identity immediately.",
          "nextNodeId": "M04B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force the survivors to name suspects before they can breathe properly.",
          "failTitle": "The Witnesses Break",
          "failText": "You press too hard and get only fear, contradiction, and silence. What could have become a clean thread of testimony collapses into panic and doubt.",
          "death": false
        }
      ]
    },
    {
      "id": "M03C",
      "turn": 3,
      "title": "Survivors Among the Reeds - Ferry Guard",
      "narrative": [
        "With <strong>Warden Hester Vale</strong>, you secure the small inlet where the survivors drifted in and keep curious villagers back while the men are treated. The last thing you need is a frightened crowd teaching the witnesses which details to remember.",
        "The bargemen speak of masked men, hooked poles, and a command to 'ring it again' when the first tow went wide. They also describe an official-sounding order to divert the cargo for 'flood quarantine,' a phrase too tidy and too useful to have been improvised on the water.",
        "A false order, spoken in the right voice, can command a marsh lane faster than any drawn steel."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Force the survivors to name suspects before they can breathe properly.",
          "failTitle": "The Witnesses Break",
          "failText": "You press too hard and get only fear, contradiction, and silence. What could have become a clean thread of testimony collapses into panic and doubt.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Protect the inlet and move the survivors somewhere safer before rumor reaches them.",
          "nextNodeId": "M04A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Shield the witnesses in plain sight, then watch who tries to learn whether they are still alive.",
          "nextNodeId": "M04C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M04A",
      "turn": 4,
      "title": "Orders Marked with Flood Ink - Reed Trail",
      "narrative": [
        "At the low post on <strong>Fenwake Cut</strong>, you find a flood order nailed high enough to be seen from a passing boat but low enough to have been fixed in haste. The paper is damp, official at a glance, and wrong the moment you read the river marks against the real tide line.",
        "The forged order closes the north channel for flood damage and reopens a private cut under licensed escort. It is not merely a lie; it is a tool designed to turn public safety into a toll gate owned by whoever printed it.",
        "Once a forged order governs movement, the marsh starts to belong to whoever carries the best imitation of law."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Track the postman who nailed the order and see which bank he used to escape.",
          "nextNodeId": "M05B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept the warrant as genuine until someone from the duke can confirm it.",
          "failTitle": "The False Closure Holds",
          "failText": "By treating the order as possibly lawful, you hand the smugglers the delay they wanted. Boats stay put, the villages wait, and the cargo keeps moving beneath borrowed authority.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the mud, wax flakes, and punt scrape together so the forger cannot change his story later.",
          "nextNodeId": "M05A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M04B",
      "turn": 4,
      "title": "Orders Marked with Flood Ink - Lantern Ledger",
      "narrative": [
        "You lay the supposed flood warrant beside older abbey notices while <strong>Sister Maelin</strong> compares ink, clerk hands, and the stamp cut into its wax. The seal was copied well enough to fool a tired ferryman in rain, but not well enough to survive patient reading.",
        "The forged order closes the north channel for flood damage and reopens a private cut under licensed escort. It is not merely a lie; it is a tool designed to turn public safety into a toll gate owned by whoever printed it.",
        "Once a forged order governs movement, the marsh starts to belong to whoever carries the best imitation of law."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Name the exact copied phrasing and seal defect that proves the warrant was forged.",
          "nextNodeId": "M05B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Catalogue the flaws in the order and prepare to break its authority publicly.",
          "nextNodeId": "M05C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept the warrant as genuine until someone from the duke can confirm it.",
          "failTitle": "The False Closure Holds",
          "failText": "By treating the order as possibly lawful, you hand the smugglers the delay they wanted. Boats stay put, the villages wait, and the cargo keeps moving beneath borrowed authority.",
          "death": false
        }
      ]
    },
    {
      "id": "M04C",
      "turn": 4,
      "title": "Orders Marked with Flood Ink - Ferry Guard",
      "narrative": [
        "You keep the landing from erupting as <strong>Warden Hester Vale</strong> reads the order aloud for the gathered boatmen. Some have already obeyed it, and all of them know how much authority can hide inside a wet sheet of paper tied to a post.",
        "The forged order closes the north channel for flood damage and reopens a private cut under licensed escort. It is not merely a lie; it is a tool designed to turn public safety into a toll gate owned by whoever printed it.",
        "Once a forged order governs movement, the marsh starts to belong to whoever carries the best imitation of law."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accept the warrant as genuine until someone from the duke can confirm it.",
          "failTitle": "The False Closure Holds",
          "failText": "By treating the order as possibly lawful, you hand the smugglers the delay they wanted. Boats stay put, the villages wait, and the cargo keeps moving beneath borrowed authority.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Replace the forged order with your own guarded notice so the smugglers lose both cover and control.",
          "nextNodeId": "M05C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the crossing under ranger authority and keep the route open while you investigate deeper.",
          "nextNodeId": "M05A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M05A",
      "turn": 5,
      "title": "The Abbey Wharf Ledger - Reed Trail",
      "narrative": [
        "Back at <strong>Reedwatch Abbey Wharf</strong>, you inspect the mooring posts, damp rope fibers, and loading scars where the stolen cargo last sat under lawful guard. Too many hands knew the barge's exact contents and departure hour for this to be simple opportunism.",
        "One torn ledger stub suggests an extra pickup at dusk, long before the barge was ever reported missing. The missing page likely named the second delivery point, the one the thieves needed to control if they meant to sell the villages back their own medicine.",
        "The more orderly the theft appears, the more likely it was prepared from inside the route and not merely taken from outside it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use rope wear, plank drag, and boat draft marks to prove how many handlers shifted the extra load.",
          "nextNodeId": "M06A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Search the abbey publicly and accuse the staff before the evidence is sorted.",
          "failTitle": "The Wharf Turns Inward",
          "failText": "Your sweep shatters trust at the one place still keeping records straight. Doors close, memories harden, and the missing ledger trail goes cold under wounded pride.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Check how cargo could have been moved from the wharf without using the main lane.",
          "nextNodeId": "M06B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M05B",
      "turn": 5,
      "title": "The Abbey Wharf Ledger - Lantern Ledger",
      "narrative": [
        "Inside the abbey counting room, you work with <strong>Sister Maelin</strong> over freight books whose neat lines break only where one page has been removed with monkish precision. Whoever cut it knew how to steal information without advertising panic.",
        "One torn ledger stub suggests an extra pickup at dusk, long before the barge was ever reported missing. The missing page likely named the second delivery point, the one the thieves needed to control if they meant to sell the villages back their own medicine.",
        "The more orderly the theft appears, the more likely it was prepared from inside the route and not merely taken from outside it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Reconstruct the missing ledger page from the surviving entries and timing gaps.",
          "nextNodeId": "M06C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the torn stitching and the ink bleed to determine exactly when the page was cut and why.",
          "nextNodeId": "M06B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Search the abbey publicly and accuse the staff before the evidence is sorted.",
          "failTitle": "The Wharf Turns Inward",
          "failText": "Your sweep shatters trust at the one place still keeping records straight. Doors close, memories harden, and the missing ledger trail goes cold under wounded pride.",
          "death": false
        }
      ]
    },
    {
      "id": "M05C",
      "turn": 5,
      "title": "The Abbey Wharf Ledger - Ferry Guard",
      "narrative": [
        "You keep the abbey yard calm while novices move the remaining reserve crates into a watched store under <strong>Warden Hester Vale</strong>. If the thieves learn there is panic at the wharf, they will strike again before the day is out.",
        "One torn ledger stub suggests an extra pickup at dusk, long before the barge was ever reported missing. The missing page likely named the second delivery point, the one the thieves needed to control if they meant to sell the villages back their own medicine.",
        "The more orderly the theft appears, the more likely it was prepared from inside the route and not merely taken from outside it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Search the abbey publicly and accuse the staff before the evidence is sorted.",
          "failTitle": "The Wharf Turns Inward",
          "failText": "Your sweep shatters trust at the one place still keeping records straight. Doors close, memories harden, and the missing ledger trail goes cold under wounded pride.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the reserve crates and keep the abbey functioning while you work the trail.",
          "nextNodeId": "M06A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Protect the abbey openly, then place a discreet watch on anyone who knows the old dusk schedules.",
          "nextNodeId": "M06C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M06A",
      "turn": 6,
      "title": "Stakes in the Side Channel - Reed Trail",
      "narrative": [
        "You pole a narrow skiff into a side run where freshly driven stakes stand just below the waterline, invisible in dim light and perfectly placed to steer a heavy barge toward one concealed bank. The channel itself is not natural; it has been prepared like a snare.",
        "The side channel leads toward the drowned fringe of <strong>Saint Olwen's Mere</strong>, where reed islands and old masonry create natural blind spots. A ring with time, local knowledge, and false paperwork could move whole loads through here while honest boatmen tell themselves the route is cursed or closed.",
        "Every hidden stake is proof that this operation was built patiently, and patient criminals are harder to rattle than desperate ones."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the stake line deeper and see where the barge would have been guided next.",
          "nextNodeId": "M07B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull every stake immediately and assume the route is broken for good.",
          "failTitle": "The Channel Goes Quiet",
          "failText": "You destroy the visible trap and teach the smugglers that their hidden lane is discovered. By nightfall they have shifted to another path, and the side channel yields only spoiled evidence.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Leave the stakes untouched for now and trace the route forward to the receiving bank.",
          "nextNodeId": "M07A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M06B",
      "turn": 6,
      "title": "Stakes in the Side Channel - Lantern Ledger",
      "narrative": [
        "With <strong>Sister Maelin</strong>, you map the stolen route against old flood charts and realize the smugglers are using obsolete water knowledge that only longtime marsh hands or old abbey records would preserve. The theft is running on memory as much as muscle.",
        "The side channel leads toward the drowned fringe of <strong>Saint Olwen's Mere</strong>, where reed islands and old masonry create natural blind spots. A ring with time, local knowledge, and false paperwork could move whole loads through here while honest boatmen tell themselves the route is cursed or closed.",
        "Every hidden stake is proof that this operation was built patiently, and patient criminals are harder to rattle than desperate ones."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the chart mismatch to identify who had access to the forgotten water lanes in the first place.",
          "nextNodeId": "M07B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Map the hidden cut carefully and compare it to the old marsh charts.",
          "nextNodeId": "M07C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull every stake immediately and assume the route is broken for good.",
          "failTitle": "The Channel Goes Quiet",
          "failText": "You destroy the visible trap and teach the smugglers that their hidden lane is discovered. By nightfall they have shifted to another path, and the side channel yields only spoiled evidence.",
          "death": false
        }
      ]
    },
    {
      "id": "M06C",
      "turn": 6,
      "title": "Stakes in the Side Channel - Ferry Guard",
      "narrative": [
        "You place guards at the main junction while <strong>Warden Hester Vale</strong> keeps ferries moving one at a time past the suspected cut. The villagers do not need to understand every stake hidden beneath the water; they only need to know the ranger still controls the lane.",
        "The side channel leads toward the drowned fringe of <strong>Saint Olwen's Mere</strong>, where reed islands and old masonry create natural blind spots. A ring with time, local knowledge, and false paperwork could move whole loads through here while honest boatmen tell themselves the route is cursed or closed.",
        "Every hidden stake is proof that this operation was built patiently, and patient criminals are harder to rattle than desperate ones."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull every stake immediately and assume the route is broken for good.",
          "failTitle": "The Channel Goes Quiet",
          "failText": "You destroy the visible trap and teach the smugglers that their hidden lane is discovered. By nightfall they have shifted to another path, and the side channel yields only spoiled evidence.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep traffic steady above the trap while hidden watchers wait at the bank where the cargo must emerge.",
          "nextNodeId": "M07C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the junction and deny anyone a second chance to move a heavy load through it.",
          "nextNodeId": "M07A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M07A",
      "turn": 7,
      "title": "Villagers Paying Twice - Reed Trail",
      "narrative": [
        "At <strong>Rushfen Landing</strong>, you watch mothers and old ferrymen pass silver through a shuttered window in exchange for tiny packets of herbs already stamped with abbey marks. Someone has turned theft into a market and suffering into a receipt.",
        "The packet sizes are too precise and the prices too steady to be looting. This is controlled extortion, run by people who expect the routes to stay frightened, the ferries to stay divided, and the villages to mistake order for mercy.",
        "Once the sick believe relief arrives only through private hands, every lawful authority in the marsh starts to look weak and late."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Ignore the visible sellers and follow the silver collector who actually links the trade to its masters.",
          "nextNodeId": "M08A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize every packet at once without first replacing the medicine for the sick.",
          "failTitle": "The Landing Turns on You",
          "failText": "The villagers do not see a rescue; they see medicine taken from fever mats while a ranger lectures them about procedure. The smugglers keep their network, and you lose the crowd that should have backed you.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow the packet sellers after dark and find where they restock.",
          "nextNodeId": "M08B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M07B",
      "turn": 7,
      "title": "Villagers Paying Twice - Lantern Ledger",
      "narrative": [
        "You sit with <strong>Sister Maelin</strong> and three marsh families whose payment tokens all bear the same counterfeit flood seal used on the false route closures. The villagers are not buying contraband; they are buying back what should have reached them lawfully yesterday.",
        "The packet sizes are too precise and the prices too steady to be looting. This is controlled extortion, run by people who expect the routes to stay frightened, the ferries to stay divided, and the villages to mistake order for mercy.",
        "Once the sick believe relief arrives only through private hands, every lawful authority in the marsh starts to look weak and late."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take sworn statements and build a payment trail from the stamped packets outward.",
          "nextNodeId": "M08C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the herb batches and seal flaws so no one can deny the packets came from the stolen relief stock.",
          "nextNodeId": "M08B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize every packet at once without first replacing the medicine for the sick.",
          "failTitle": "The Landing Turns on You",
          "failText": "The villagers do not see a rescue; they see medicine taken from fever mats while a ranger lectures them about procedure. The smugglers keep their network, and you lose the crowd that should have backed you.",
          "death": false
        }
      ]
    },
    {
      "id": "M07C",
      "turn": 7,
      "title": "Villagers Paying Twice - Ferry Guard",
      "narrative": [
        "With <strong>Warden Hester Vale</strong>, you hold the square together while frightened people ask whether the abbey has abandoned them. If you move clumsily here, desperate families will see only another authority taking medicine away.",
        "The packet sizes are too precise and the prices too steady to be looting. This is controlled extortion, run by people who expect the routes to stay frightened, the ferries to stay divided, and the villages to mistake order for mercy.",
        "Once the sick believe relief arrives only through private hands, every lawful authority in the marsh starts to look weak and late."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Seize every packet at once without first replacing the medicine for the sick.",
          "failTitle": "The Landing Turns on You",
          "failText": "The villagers do not see a rescue; they see medicine taken from fever mats while a ranger lectures them about procedure. The smugglers keep their network, and you lose the crowd that should have backed you.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stabilize the landing and make sure the sick are treated before you move on the ring.",
          "nextNodeId": "M08A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Distribute emergency doses under your own guard so the smugglers lose their strongest leverage at once.",
          "nextNodeId": "M08C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M08A",
      "turn": 8,
      "title": "The Boatman with Two Messages - Reed Trail",
      "narrative": [
        "You intercept a nervous boatman at a willow cut where he tries to hide one message tube in the mud and keep the other in his sleeve. He expected to carry one order to the villages and another to the smugglers, never imagining both might be read by the same pair of eyes.",
        "The boatman is no mastermind. He is a hired pair of hands paid to trust seals, fear flood warnings, and keep his head down. But the duplicate messages prove the ring is coordinating public fear and private logistics from the same center.",
        "A frightened courier can still point toward a hidden master, but only if you give him reason to believe surviving the truth is possible."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the courier route to locate the next relay hut before the network resets.",
          "nextNodeId": "M09B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten the courier with hanging unless he names his employer immediately.",
          "failTitle": "The Courier Freezes",
          "failText": "You give him terror and nothing else. He locks down, says nothing useful, and by the time he gathers courage the ring has shifted its next move.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Feed the courier a false destination and see which hidden rider moves to answer it.",
          "nextNodeId": "M09A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M08B",
      "turn": 8,
      "title": "The Boatman with Two Messages - Lantern Ledger",
      "narrative": [
        "In a shuttered fish shed, you set the two damp messages beside one another with <strong>Sister Maelin</strong> and watch the contradictions appear line by line. One closes the high ferries for safety; the other schedules a private cargo to pass the same hour under paid escort.",
        "The boatman is no mastermind. He is a hired pair of hands paid to trust seals, fear flood warnings, and keep his head down. But the duplicate messages prove the ring is coordinating public fear and private logistics from the same center.",
        "A frightened courier can still point toward a hidden master, but only if you give him reason to believe surviving the truth is possible."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Offer lawful protection and force him to identify the clerk or captain who supplied the copied seal.",
          "nextNodeId": "M09B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Break apart the wording of both messages until the courier sees how completely he was used.",
          "nextNodeId": "M09C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten the courier with hanging unless he names his employer immediately.",
          "failTitle": "The Courier Freezes",
          "failText": "You give him terror and nothing else. He locks down, says nothing useful, and by the time he gathers courage the ring has shifted its next move.",
          "death": false
        }
      ]
    },
    {
      "id": "M08C",
      "turn": 8,
      "title": "The Boatman with Two Messages - Ferry Guard",
      "narrative": [
        "You keep the courier under firm guard with <strong>Warden Hester Vale</strong> while word spreads that another false order has been caught. The arrest alone matters less than what his panic may teach you about the ring's remaining relay points.",
        "The boatman is no mastermind. He is a hired pair of hands paid to trust seals, fear flood warnings, and keep his head down. But the duplicate messages prove the ring is coordinating public fear and private logistics from the same center.",
        "A frightened courier can still point toward a hidden master, but only if you give him reason to believe surviving the truth is possible."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten the courier with hanging unless he names his employer immediately.",
          "failTitle": "The Courier Freezes",
          "failText": "You give him terror and nothing else. He locks down, says nothing useful, and by the time he gathers courage the ring has shifted its next move.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Move the courier under decoy escort so the ring reveals which watch post still serves it.",
          "nextNodeId": "M09C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the prisoner and keep the ferry routes moving while you prepare a safe transfer.",
          "nextNodeId": "M09A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M09A",
      "turn": 9,
      "title": "Ivo Sedge Found Alive - Reed Trail",
      "narrative": [
        "Near a collapsed duck-blind on a reed island, you finally find <strong>Ivo Sedge</strong> bound, bruised, and furious rather than broken. He was taken not because he fought hardest, but because he knew too many back channels and could have recognized who ordered the diversion by voice.",
        "Ivo also speaks of a deeper figure: a broker who never loads cargo himself, never signs a public order, and yet always seems to own the second stage of every theft. The name that surfaces half-spoken is <strong>Garran Pell</strong>, a marsh merchant who grew rich whenever the lawful ferries faltered.",
        "Once Corin or Pell learns Ivo is alive, the ring will stop trading on caution and start trading on urgency."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Take Ivo with you only as far as the map, then cut off Corin at the precise channel Ivo names.",
          "nextNodeId": "M10A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Ivo hidden on the island while you rush after Corin alone.",
          "failTitle": "The Ferryman Vanishes",
          "failText": "You win a few miles and lose your best witness. By the time you return, the island is empty and the ring has erased the voice most able to name it.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use Ivo's route memory to predict where Corin will next try to shift cargo.",
          "nextNodeId": "M10B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M09B",
      "turn": 9,
      "title": "Ivo Sedge Found Alive - Lantern Ledger",
      "narrative": [
        "With <strong>Sister Maelin</strong> kneeling beside him, you hear Ivo describe the blue lantern, the false flood order, and the man who kept calling for the bell to sound again until the bargemen scattered. He also names <strong>Toll-Captain Corin Sedge</strong> as the officer whose patrol timings vanished from the lawful books exactly when the barge was seized.",
        "Ivo also speaks of a deeper figure: a broker who never loads cargo himself, never signs a public order, and yet always seems to own the second stage of every theft. The name that surfaces half-spoken is <strong>Garran Pell</strong>, a marsh merchant who grew rich whenever the lawful ferries faltered.",
        "Once Corin or Pell learns Ivo is alive, the ring will stop trading on caution and start trading on urgency."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Record Ivo's statement carefully and tie it to the forged orders already in hand.",
          "nextNodeId": "M10C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Anchor Ivo's account to the timings, lantern codes, and cargo marks so it becomes irrefutable.",
          "nextNodeId": "M10B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Ivo hidden on the island while you rush after Corin alone.",
          "failTitle": "The Ferryman Vanishes",
          "failText": "You win a few miles and lose your best witness. By the time you return, the island is empty and the ring has erased the voice most able to name it.",
          "death": false
        }
      ]
    },
    {
      "id": "M09C",
      "turn": 9,
      "title": "Ivo Sedge Found Alive - Ferry Guard",
      "narrative": [
        "You clear the island and place Ivo under <strong>Warden Hester Vale</strong>'s protection before anyone else learns he has been found. A living ferryman who knows the old routes is worth more to the ring dead than frightened.",
        "Ivo also speaks of a deeper figure: a broker who never loads cargo himself, never signs a public order, and yet always seems to own the second stage of every theft. The name that surfaces half-spoken is <strong>Garran Pell</strong>, a marsh merchant who grew rich whenever the lawful ferries faltered.",
        "Once Corin or Pell learns Ivo is alive, the ring will stop trading on caution and start trading on urgency."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave Ivo hidden on the island while you rush after Corin alone.",
          "failTitle": "The Ferryman Vanishes",
          "failText": "You win a few miles and lose your best witness. By the time you return, the island is empty and the ring has erased the voice most able to name it.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Move Ivo somewhere secure and prepare for the ring to lash out when it learns he lives.",
          "nextNodeId": "M10A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Protect Ivo openly while setting a second hidden watch on anyone who comes looking for him.",
          "nextNodeId": "M10C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M10A",
      "turn": 10,
      "title": "The Tollhouse Account Book - Reed Trail",
      "narrative": [
        "At <strong>Fenwake Tollhouse</strong>, you search damp shelves and locked chests until a warped account book turns up where honest books should never be hidden. Whole weeks of private collections are listed there in a hand trying very hard to look less educated than it is.",
        "The account book does not place Garran Pell at every scene, but it circles him all the same: cargo transfers near his reed warehouse, private ferries paid in his token silver, and night lanterns purchased through his factor at suspiciously regular intervals.",
        "You now know the ring is organized, solvent, and practiced, which means exposing it will require more than catching one load in motion."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Follow the private fee trail toward Pell's receiving points deeper in the marsh.",
          "nextNodeId": "M11B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest every tollman whose name appears near a false fee entry.",
          "failTitle": "The Tollhouse Breaks Apart",
          "failText": "Your rush turns partial guilt into total chaos. Honest men resist out of fear, guilty ones vanish in the confusion, and the account book becomes a brawl instead of a case.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the ledger as a movement map and identify the one hidden storehouse feeding the whole operation.",
          "nextNodeId": "M11A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M10B",
      "turn": 10,
      "title": "The Tollhouse Account Book - Lantern Ledger",
      "narrative": [
        "You sit with <strong>Sister Maelin</strong> over the tollhouse ledger and discover that the false flood closures line up neatly with unexplained private escort fees. The pattern is too disciplined to belong to ordinary theft; it belongs to a business pretending to be emergency governance.",
        "The account book does not place Garran Pell at every scene, but it circles him all the same: cargo transfers near his reed warehouse, private ferries paid in his token silver, and night lanterns purchased through his factor at suspiciously regular intervals.",
        "You now know the ring is organized, solvent, and practiced, which means exposing it will require more than catching one load in motion."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Tie the tollhouse book to the courier messages and Ivo's testimony into one clean chain of proof.",
          "nextNodeId": "M11B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Copy the false fees and build the case before naming every corrupt hand involved.",
          "nextNodeId": "M11C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest every tollman whose name appears near a false fee entry.",
          "failTitle": "The Tollhouse Breaks Apart",
          "failText": "Your rush turns partial guilt into total chaos. Honest men resist out of fear, guilty ones vanish in the confusion, and the account book becomes a brawl instead of a case.",
          "death": false
        }
      ]
    },
    {
      "id": "M10C",
      "turn": 10,
      "title": "The Tollhouse Account Book - Ferry Guard",
      "narrative": [
        "You hold the tollhouse yard under <strong>Warden Hester Vale</strong> so no guard burns papers or bolts into the reeds with whatever memory still sits in his head. Men who only yesterday called this routine work are suddenly very aware that routine can become evidence.",
        "The account book does not place Garran Pell at every scene, but it circles him all the same: cargo transfers near his reed warehouse, private ferries paid in his token silver, and night lanterns purchased through his factor at suspiciously regular intervals.",
        "You now know the ring is organized, solvent, and practiced, which means exposing it will require more than catching one load in motion."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Arrest every tollman whose name appears near a false fee entry.",
          "failTitle": "The Tollhouse Breaks Apart",
          "failText": "Your rush turns partial guilt into total chaos. Honest men resist out of fear, guilty ones vanish in the confusion, and the account book becomes a brawl instead of a case.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Stabilize the post, then quietly strip Corin's loyalists of any chance to carry warning ahead.",
          "nextNodeId": "M11C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the tollhouse functioning and separate the uncertain men from the obviously corrupted ones.",
          "nextNodeId": "M11A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M11A",
      "turn": 11,
      "title": "Rain Over the Flats - Reed Trail",
      "narrative": [
        "Cold rain sweeps sideways over <strong>Blackmere Flats</strong>, flattening the reeds until the whole marsh looks like beaten metal. In weather like this, the ring can move a low boat under the horizon of ordinary sight and trust the storm to do half the hiding.",
        "Pell has been using bad weather as a second accomplice. Honest traffic slows, frightened boatmen take shelter, and private ferries with prepared pilots suddenly become the only vessels 'brave enough' to move between isolated homes.",
        "A storm narrows every margin. A clever move in it can break the ring; a clumsy one can hand it the whole evening."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the rain as cover, flank above the flats, and catch the moving load before its pilots realize they have been read.",
          "nextNodeId": "M12A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait out the rain in full shelter and assume the smugglers will do the same.",
          "failTitle": "The Storm Works for Pell",
          "failText": "Pell is not sheltering; he is using the weather exactly as planned. While you wait for clear skies, he moves cargo and rumor together through the darkened flats.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Track the likely storm route carefully and accept slower progress for cleaner footing.",
          "nextNodeId": "M12B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M11B",
      "turn": 11,
      "title": "Rain Over the Flats - Lantern Ledger",
      "narrative": [
        "Sheltered in a watch hut with <strong>Sister Maelin</strong>, you compare route times and realize the storm does not close every channel equally. A careful smuggler would choose the lanes where rain blinds distant eyes but leaves the water still enough for pole work.",
        "Pell has been using bad weather as a second accomplice. Honest traffic slows, frightened boatmen take shelter, and private ferries with prepared pilots suddenly become the only vessels 'brave enough' to move between isolated homes.",
        "A storm narrows every margin. A clever move in it can break the ring; a clumsy one can hand it the whole evening."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Narrow the passable channels by weather, depth, and relay timing.",
          "nextNodeId": "M12C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Predict the one viable storm corridor and set your evidence and riders there in advance.",
          "nextNodeId": "M12B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait out the rain in full shelter and assume the smugglers will do the same.",
          "failTitle": "The Storm Works for Pell",
          "failText": "Pell is not sheltering; he is using the weather exactly as planned. While you wait for clear skies, he moves cargo and rumor together through the darkened flats.",
          "death": false
        }
      ]
    },
    {
      "id": "M11C",
      "turn": 11,
      "title": "Rain Over the Flats - Ferry Guard",
      "narrative": [
        "You keep the relief skiffs moving under <strong>Warden Hester Vale</strong> while lightning flickers behind the reed line and makes every delay feel like surrender. The villagers need to see that weather belongs to no thief, no matter how expertly he exploits it.",
        "Pell has been using bad weather as a second accomplice. Honest traffic slows, frightened boatmen take shelter, and private ferries with prepared pilots suddenly become the only vessels 'brave enough' to move between isolated homes.",
        "A storm narrows every margin. A clever move in it can break the ring; a clumsy one can hand it the whole evening."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Wait out the rain in full shelter and assume the smugglers will do the same.",
          "failTitle": "The Storm Works for Pell",
          "failText": "Pell is not sheltering; he is using the weather exactly as planned. While you wait for clear skies, he moves cargo and rumor together through the darkened flats.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep lawful relief moving through the rain so Pell cannot claim only private ferries can manage it.",
          "nextNodeId": "M12A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use a guarded relief boat as bait and force the smugglers to reveal which channel they still trust.",
          "nextNodeId": "M12C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M12A",
      "turn": 12,
      "title": "Three Hamlets, One Rumor - Reed Trail",
      "narrative": [
        "By dusk you reach the meeting of <strong>Willowmere</strong>, <strong>Sedge Hook</strong>, and <strong>Lantern End</strong>, where each hamlet believes one of the others warned Pell about the missing barge. The rumor was planted with skill: just enough truth in each version to make every grievance feel remembered.",
        "Corin has been feeding each hamlet a tailored version of the same lie: that another village hoarded relief, informed on the ferries, or bought special passage through the closures. It is social sabotage meant to ensure no shared front ever forms against the ring.",
        "If marsh folk start policing one another by rumor, lawful authority becomes merely one more voice in the shouting."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Find the messenger who carried Corin's lie between the hamlets.",
          "nextNodeId": "M13B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Side openly with the loudest hamlet and force the others to accept it.",
          "failTitle": "The Hamlets Divide",
          "failText": "You turn suspicion into a verdict before the proof is complete. Pell no longer needs ghost bells or forged notices; the hamlets will keep one another divided for him.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Expose the rumor runner in front of all three elders before any new version can take hold.",
          "nextNodeId": "M13A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M12B",
      "turn": 12,
      "title": "Three Hamlets, One Rumor - Lantern Ledger",
      "narrative": [
        "With <strong>Sister Maelin</strong>, you set receipts, ferry marks, and witness names on a plank table while elders from all three hamlets glare across the lantern light. The documents show one pattern clearly: all of them were lied to by the same hands, merely in slightly different words.",
        "Corin has been feeding each hamlet a tailored version of the same lie: that another village hoarded relief, informed on the ferries, or bought special passage through the closures. It is social sabotage meant to ensure no shared front ever forms against the ring.",
        "If marsh folk start policing one another by rumor, lawful authority becomes merely one more voice in the shouting."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Turn the three hamlets into joint witnesses by proving they were all deceived by the same design.",
          "nextNodeId": "M13B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lay out the receipts and testimony until the shared pattern becomes impossible to deny.",
          "nextNodeId": "M13C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Side openly with the loudest hamlet and force the others to accept it.",
          "failTitle": "The Hamlets Divide",
          "failText": "You turn suspicion into a verdict before the proof is complete. Pell no longer needs ghost bells or forged notices; the hamlets will keep one another divided for him.",
          "death": false
        }
      ]
    },
    {
      "id": "M12C",
      "turn": 12,
      "title": "Three Hamlets, One Rumor - Ferry Guard",
      "narrative": [
        "You hold the muddy lane with <strong>Warden Hester Vale</strong>, keeping boat hooks low and tempers lower while frightened families watch from behind shutter cracks. If the hamlets split, Pell will not need to command them; he will only need to sell each side safety from the others.",
        "Corin has been feeding each hamlet a tailored version of the same lie: that another village hoarded relief, informed on the ferries, or bought special passage through the closures. It is social sabotage meant to ensure no shared front ever forms against the ring.",
        "If marsh folk start policing one another by rumor, lawful authority becomes merely one more voice in the shouting."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Side openly with the loudest hamlet and force the others to accept it.",
          "failTitle": "The Hamlets Divide",
          "failText": "You turn suspicion into a verdict before the proof is complete. Pell no longer needs ghost bells or forged notices; the hamlets will keep one another divided for him.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Deliver guarded medicine to each hamlet in sight of the others so none believes favor has been sold.",
          "nextNodeId": "M13C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the peace and keep the ferry lanes open while anger cools.",
          "nextNodeId": "M13A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M13A",
      "turn": 13,
      "title": "Corin Sedge Breaks Cover - Reed Trail",
      "narrative": [
        "At a reed checkpoint east of <strong>Mireglass Causeway</strong>, <strong>Corin Sedge</strong> finally stops pretending to be merely overworked and lawful. He bars the lane with hired oarsmen, borrowed toll guards, and the brittle confidence of a man who has said 'flood authority' so often he almost believes it himself.",
        "Corin demands the seized papers, claims the north routes remain under flood restriction, and insists Garran Pell is merely a contractor filling the void left by abbey delay. The lie is broad now, no longer subtle, which means the ring is starting to feel the bank giving way beneath it.",
        "Break Corin cleanly and his men may yield. Mishandle him and every frightened ferryman nearby will think the marsh has entered open civil war."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut Corin off from his boat, his signal horn, and his nearest loyal oarsmen in one move.",
          "nextNodeId": "M14A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Draw steel on Corin before his own men hear the evidence against him.",
          "failTitle": "The Checkpoint Explodes",
          "failText": "The lane erupts into blind violence before truth has time to do its work. Corin escapes through confusion, and even honest guards come away unsure who began the betrayal.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Drive Corin off the lane and pursue only after the checkpoint is secure.",
          "nextNodeId": "M14B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M13B",
      "turn": 13,
      "title": "Corin Sedge Breaks Cover - Lantern Ledger",
      "narrative": [
        "You confront Corin with ledgers, witness accounts, and the forged orders while <strong>Sister Maelin</strong> keeps every contradiction exact. Several of his own men look more frightened than loyal once they hear the papers read out in full.",
        "Corin demands the seized papers, claims the north routes remain under flood restriction, and insists Garran Pell is merely a contractor filling the void left by abbey delay. The lie is broad now, no longer subtle, which means the ring is starting to feel the bank giving way beneath it.",
        "Break Corin cleanly and his men may yield. Mishandle him and every frightened ferryman nearby will think the marsh has entered open civil war."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Read the case publicly and let his men hear every lie come apart.",
          "nextNodeId": "M14C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Break Corin with the exact contradiction between his patrol hours and the forged closure times.",
          "nextNodeId": "M14B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Draw steel on Corin before his own men hear the evidence against him.",
          "failTitle": "The Checkpoint Explodes",
          "failText": "The lane erupts into blind violence before truth has time to do its work. Corin escapes through confusion, and even honest guards come away unsure who began the betrayal.",
          "death": false
        }
      ]
    },
    {
      "id": "M13C",
      "turn": 13,
      "title": "Corin Sedge Breaks Cover - Ferry Guard",
      "narrative": [
        "With <strong>Warden Hester Vale</strong>, you anchor the checkpoint and address the uncertain guards before Corin can turn confusion into a skirmish. Many of them served a captain; not all of them knowingly served a racket.",
        "Corin demands the seized papers, claims the north routes remain under flood restriction, and insists Garran Pell is merely a contractor filling the void left by abbey delay. The lie is broad now, no longer subtle, which means the ring is starting to feel the bank giving way beneath it.",
        "Break Corin cleanly and his men may yield. Mishandle him and every frightened ferryman nearby will think the marsh has entered open civil war."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Draw steel on Corin before his own men hear the evidence against him.",
          "failTitle": "The Checkpoint Explodes",
          "failText": "The lane erupts into blind violence before truth has time to do its work. Corin escapes through confusion, and even honest guards come away unsure who began the betrayal.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the checkpoint steady and keep innocent traffic from paying for Corin's panic.",
          "nextNodeId": "M14A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Win Corin's wavering men first so his authority collapses without a broad fight.",
          "nextNodeId": "M14C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M14A",
      "turn": 14,
      "title": "Cargo Beneath the Chapel Steps - Reed Trail",
      "narrative": [
        "By moonlight you follow wet drag marks to the drowned steps of <strong>Saint Olwen's Chapel</strong>, where crates have been slid under the waterline and hidden beneath hanging roots. The place smells of damp stone, wax smoke, and a confidence born of using sacred ground as cover too often.",
        "This is not the whole cache, but it is the heaviest night transfer yet: enough salt and medicine to keep Pell bargaining with whole hamlets for another week. If he gets it past the chapel and into the deeper reed islands, the marsh will have to be searched a second time under worse conditions.",
        "You are no longer chasing leftovers. You are standing almost directly on the artery that keeps the scheme alive."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow the carriers through the outer water and learn where the full load will surface.",
          "nextNodeId": "M15B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the chapel steps with torches and shout for surrender.",
          "failTitle": "The Water Goes Dark",
          "failText": "The carriers kill the lights, dump the obvious route, and vanish through side water only they know. You are left with churned mud, half a crate, and no clean proof of where the rest went.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Slip past the first handoff, seize the guide, and turn the whole transfer blind from inside the route.",
          "nextNodeId": "M15A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M14B",
      "turn": 14,
      "title": "Cargo Beneath the Chapel Steps - Lantern Ledger",
      "narrative": [
        "You compare burial records and cargo tallies with <strong>Sister Maelin</strong> in the ruined vestry and find the same fraud repeated in two languages: one for the pious, one for the practical. Pell has been disguising relief loads as maintenance stores for the old chapel keepers.",
        "This is not the whole cache, but it is the heaviest night transfer yet: enough salt and medicine to keep Pell bargaining with whole hamlets for another week. If he gets it past the chapel and into the deeper reed islands, the marsh will have to be searched a second time under worse conditions.",
        "You are no longer chasing leftovers. You are standing almost directly on the artery that keeps the scheme alive."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Identify the exact false consignment carrying Pell's main transfer tonight.",
          "nextNodeId": "M15B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the chapel records to prove the cover story before dawn judgment begins.",
          "nextNodeId": "M15C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the chapel steps with torches and shout for surrender.",
          "failTitle": "The Water Goes Dark",
          "failText": "The carriers kill the lights, dump the obvious route, and vanish through side water only they know. You are left with churned mud, half a crate, and no clean proof of where the rest went.",
          "death": false
        }
      ]
    },
    {
      "id": "M14C",
      "turn": 14,
      "title": "Cargo Beneath the Chapel Steps - Ferry Guard",
      "narrative": [
        "You place <strong>Warden Hester Vale</strong> on the chapel path and keep villagers back while men move below the steps in the dark. If the crowd sees only armed figures around a shrine, fear will do the ring's work for free.",
        "This is not the whole cache, but it is the heaviest night transfer yet: enough salt and medicine to keep Pell bargaining with whole hamlets for another week. If he gets it past the chapel and into the deeper reed islands, the marsh will have to be searched a second time under worse conditions.",
        "You are no longer chasing leftovers. You are standing almost directly on the artery that keeps the scheme alive."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush the chapel steps with torches and shout for surrender.",
          "failTitle": "The Water Goes Dark",
          "failText": "The carriers kill the lights, dump the obvious route, and vanish through side water only they know. You are left with churned mud, half a crate, and no clean proof of where the rest went.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the visible exits quietly so the carriers must run into ground you already own.",
          "nextNodeId": "M15C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lock down the chapel road and prevent panic while the transfer lane is watched.",
          "nextNodeId": "M15A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M15A",
      "turn": 15,
      "title": "Fire on Mireglass Causeway - Reed Trail",
      "narrative": [
        "You smell pitch before the first flame shows. On <strong>Mireglass Causeway</strong>, a second team is already stringing tarred reeds beneath the planks, ready to turn the only solid road in miles into smoke and collapse.",
        "The causeway blaze is meant to divide your attention, cut lawful relief from the eastern reeds, and make private passage look indispensable by dawn. It is the first moment Pell's ring stops pretending to manage the marsh and begins openly trying to own it through ruin.",
        "For the first time, the ring is willing to destroy public routes rather than merely profit from them."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cut down the pitch crew from cover, keep the causeway standing, and free one rider to follow the fleeing foreman.",
          "nextNodeId": "M16A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge straight onto the burning causeway to fight the saboteurs hand to hand.",
          "failTitle": "The Causeway Claims You",
          "failText": "A burning plank gives way under your boots and throws you into the marsh beside the falling frame. The causeway burns through, the eastern hamlets are cut off, and Pell's ferries become the only road left.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Drive the saboteurs from the near end first, then save the road before pursuing.",
          "nextNodeId": "M16B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M15B",
      "turn": 15,
      "title": "Fire on Mireglass Causeway - Lantern Ledger",
      "narrative": [
        "You read the arson for what it is and tell <strong>Sister Maelin</strong> that the fire matters because something worse is moving behind it. Pell wants not just hidden cargo, but broken routes, so every rescue after this one will have to pass through his ferries.",
        "The causeway blaze is meant to divide your attention, cut lawful relief from the eastern reeds, and make private passage look indispensable by dawn. It is the first moment Pell's ring stops pretending to manage the marsh and begins openly trying to own it through ruin.",
        "For the first time, the ring is willing to destroy public routes rather than merely profit from them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Treat the fire as a diversion and split your response carefully.",
          "nextNodeId": "M16C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Prove which hidden transfer the fire was meant to shield, then counter both moves in the right order.",
          "nextNodeId": "M16B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge straight onto the burning causeway to fight the saboteurs hand to hand.",
          "failTitle": "The Causeway Claims You",
          "failText": "A burning plank gives way under your boots and throws you into the marsh beside the falling frame. The causeway burns through, the eastern hamlets are cut off, and Pell's ferries become the only road left.",
          "death": true
        }
      ]
    },
    {
      "id": "M15C",
      "turn": 15,
      "title": "Fire on Mireglass Causeway - Ferry Guard",
      "narrative": [
        "With <strong>Warden Hester Vale</strong>, you set bucket lines, archers, and hook poles while sparks whip sideways over black water. People beyond the causeway are already ill; if this bridge fails tonight, even a later victory will feel narrow and bitter.",
        "The causeway blaze is meant to divide your attention, cut lawful relief from the eastern reeds, and make private passage look indispensable by dawn. It is the first moment Pell's ring stops pretending to manage the marsh and begins openly trying to own it through ruin.",
        "For the first time, the ring is willing to destroy public routes rather than merely profit from them."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge straight onto the burning causeway to fight the saboteurs hand to hand.",
          "failTitle": "The Causeway Claims You",
          "failText": "A burning plank gives way under your boots and throws you into the marsh beside the falling frame. The causeway burns through, the eastern hamlets are cut off, and Pell's ferries become the only road left.",
          "death": true
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Save the causeway and keep the relief road alive even if pursuit must wait.",
          "nextNodeId": "M16A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hold the causeway while a hidden reserve circles behind the arson team.",
          "nextNodeId": "M16C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M16A",
      "turn": 16,
      "title": "The Reed-Island Storehouse - Reed Trail",
      "narrative": [
        "Beyond a ring of willow and drowned pilings, you finally find Pell's storehouse on a reed island that does not appear on any recent chart. Crates are stacked beneath sailcloth, bells and forged warrants hang from pegs, and the whole place feels less like a hideout than a private customs house built inside a stolen world.",
        "The storehouse confirms everything. Pell has not merely been diverting relief; he has been building a parallel authority in the marsh, using false flood management, hired ferries, and rationed medicine to train whole settlements into dependence.",
        "The ring is exposed, but Pell still has silver, loyalists, and one final fallback below the old bell tower at Blackmere."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the key ledgers now and pursue Pell's retreat line before he settles again.",
          "nextNodeId": "M17B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the entire storehouse at once before checking whether the retreat route is trapped.",
          "failTitle": "The Proof Breaks Apart",
          "failText": "A prepared collapse and a hidden fire pot destroy half the evidence as you rush the seizure. You save crates, but the cleanest trail to Pell's upper network scatters into smoke and swamp.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use the ledger and the fresh boat sign together to predict exactly which bell-tower route Pell will trust.",
          "nextNodeId": "M17A",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M16B",
      "turn": 16,
      "title": "The Reed-Island Storehouse - Lantern Ledger",
      "narrative": [
        "You spread the ledgers, stamp molds, and token silver beside <strong>Sister Maelin</strong> and feel the case harden into something bigger than scattered theft. Here is the administrative heart of the racket: route closures, payment records, false safety notices, and the schedule by which fear was sold back to the sick.",
        "The storehouse confirms everything. Pell has not merely been diverting relief; he has been building a parallel authority in the marsh, using false flood management, hired ferries, and rationed medicine to train whole settlements into dependence.",
        "The ring is exposed, but Pell still has silver, loyalists, and one final fallback below the old bell tower at Blackmere."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Turn the papers, molds, and token silver into a prosecution chain no ferryman can shrug off as rumor.",
          "nextNodeId": "M17B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Catalogue the storehouse carefully so every seized item strengthens the final case.",
          "nextNodeId": "M17C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the entire storehouse at once before checking whether the retreat route is trapped.",
          "failTitle": "The Proof Breaks Apart",
          "failText": "A prepared collapse and a hidden fire pot destroy half the evidence as you rush the seizure. You save crates, but the cleanest trail to Pell's upper network scatters into smoke and swamp.",
          "death": false
        }
      ]
    },
    {
      "id": "M16C",
      "turn": 16,
      "title": "The Reed-Island Storehouse - Ferry Guard",
      "narrative": [
        "Under <strong>Warden Hester Vale</strong>, you ring the storehouse with disciplined guards so nothing leaves before it is counted. Villagers who were beginning to doubt their own memories can now see the machinery of deceit laid out in wood, wax, and stolen crates.",
        "The storehouse confirms everything. Pell has not merely been diverting relief; he has been building a parallel authority in the marsh, using false flood management, hired ferries, and rationed medicine to train whole settlements into dependence.",
        "The ring is exposed, but Pell still has silver, loyalists, and one final fallback below the old bell tower at Blackmere."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Move the entire storehouse at once before checking whether the retreat route is trapped.",
          "failTitle": "The Proof Breaks Apart",
          "failText": "A prepared collapse and a hidden fire pot destroy half the evidence as you rush the seizure. You save crates, but the cleanest trail to Pell's upper network scatters into smoke and swamp.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Hold the storehouse, feed the hamlets from it at once, and strip Pell of any claim that only he can keep them alive.",
          "nextNodeId": "M17C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guard the storehouse and start moving medicine back to the villages immediately.",
          "nextNodeId": "M17A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M17A",
      "turn": 17,
      "title": "The Marsh Council Gathers - Reed Trail",
      "narrative": [
        "At <strong>Lantern End Dock</strong>, elders, ferrymen, abbey hands, and frightened villagers gather in damp cloaks to hear what has been found and what must happen next. The marsh does not often meet as one body; when it does, it can either become a jury or a mob.",
        "This is the political hinge of the case. If the marsh stands together now, Pell loses his best shield: the claim that he alone can coordinate frightened, isolated villages. If the council fractures, he can still slip into one faction's fear and bargain himself a smaller survival.",
        "Truth is finally strong enough to unite the marsh, but only if it is carried with discipline instead of triumph."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the public meeting as cover and strike Pell before anyone in the crowd can send warning.",
          "nextNodeId": "M18A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise instant justice before the prisoners and evidence are fully secured.",
          "failTitle": "The Dock Erupts",
          "failText": "The crowd surges before the law can speak. Prisoners vanish, witnesses scatter, and the marsh trades one form of extortion for another: the rule of panic.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the crowd back and move on Pell's escape lane with only your most reliable hands.",
          "nextNodeId": "M18B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M17B",
      "turn": 17,
      "title": "The Marsh Council Gathers - Lantern Ledger",
      "narrative": [
        "With <strong>Sister Maelin</strong>, you lay the ledgers, forged notices, token silver, and witness chain in plain order so even the least literate elder can follow the theft from wharf to extortion table. The story grows heavier as it grows clearer.",
        "This is the political hinge of the case. If the marsh stands together now, Pell loses his best shield: the claim that he alone can coordinate frightened, isolated villages. If the council fractures, he can still slip into one faction's fear and bargain himself a smaller survival.",
        "Truth is finally strong enough to unite the marsh, but only if it is carried with discipline instead of triumph."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Win a formal oath from the council to support lawful judgment first.",
          "nextNodeId": "M18C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Bind the hamlets to witness together and break Pell's political shelter in the same breath.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise instant justice before the prisoners and evidence are fully secured.",
          "failTitle": "The Dock Erupts",
          "failText": "The crowd surges before the law can speak. Prisoners vanish, witnesses scatter, and the marsh trades one form of extortion for another: the rule of panic.",
          "death": false
        }
      ]
    },
    {
      "id": "M17C",
      "turn": 17,
      "title": "The Marsh Council Gathers - Ferry Guard",
      "narrative": [
        "You keep the dock steady with <strong>Warden Hester Vale</strong>, making sure grief does not become vengeance before the prisoners and proof are secure. Some want Corin dead now; others care only that medicine moves before another child worsens overnight.",
        "This is the political hinge of the case. If the marsh stands together now, Pell loses his best shield: the claim that he alone can coordinate frightened, isolated villages. If the council fractures, he can still slip into one faction's fear and bargain himself a smaller survival.",
        "Truth is finally strong enough to unite the marsh, but only if it is carried with discipline instead of triumph."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise instant justice before the prisoners and evidence are fully secured.",
          "failTitle": "The Dock Erupts",
          "failText": "The crowd surges before the law can speak. Prisoners vanish, witnesses scatter, and the marsh trades one form of extortion for another: the rule of panic.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Distribute medicine first and keep the dock calm even if Pell gains a little distance.",
          "nextNodeId": "M18A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Deliver the first true relief publicly, then turn grateful villagers into the strongest witness line you could ask for.",
          "nextNodeId": "M18C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M18A",
      "turn": 18,
      "title": "Stone Under the Bell Tower - Reed Trail",
      "narrative": [
        "Below the cracked bell tower of old <strong>Blackmere Priory</strong>, you descend through a half-flooded crypt where each step smells of wax, cold stone, and money hidden too long underground. Pell has chosen his last refuge carefully: somewhere half sacred, half ruined, and entirely suited to a man who profits from inherited fear.",
        "Pell still thinks he can negotiate because he has spent months acting like necessity itself. He believes the marsh would rather keep him half-useful than drag his whole scheme into the daylight and admit how close it came to working.",
        "The next move decides whether this ends in law, in compromise, or in another season of telling children the bell rings on its own."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Press the crypt carefully and keep every exit watched rather than gambling on one rush.",
          "nextNodeId": "M19B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take Pell's offer to speak alone and trust him long enough to hear the bargain.",
          "failTitle": "Pell Slips the Tide Tunnel",
          "failText": "Pell only wanted darkness and distance. By the time you understand the trick, he is gone through the lower passage and the marsh has lost its cleanest chance to take him whole.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Cut through the side vault at once and strike the tunnel Pell still thinks belongs to him.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        }
      ]
    },
    {
      "id": "M18B",
      "turn": 18,
      "title": "Stone Under the Bell Tower - Lantern Ledger",
      "narrative": [
        "You compare the priory burial register, the storehouse ledger, and the tower keys with <strong>Sister Maelin</strong> until the hidden chamber line becomes certain. Pell wants either time to flee through the lower tide tunnel or a narrow deal that lets him keep enough silver to start again elsewhere.",
        "Pell still thinks he can negotiate because he has spent months acting like necessity itself. He believes the marsh would rather keep him half-useful than drag his whole scheme into the daylight and admit how close it came to working.",
        "The next move decides whether this ends in law, in compromise, or in another season of telling children the bell rings on its own."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Turn the ledgers, witness chain, and priory register into a trap Pell cannot argue his way out of.",
          "nextNodeId": "M19B",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the records to deny Pell any lawful excuse for what he built beneath the priory.",
          "nextNodeId": "M19C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Take Pell's offer to speak alone and trust him long enough to hear the bargain.",
          "failTitle": "Pell Slips the Tide Tunnel",
          "failText": "Pell only wanted darkness and distance. By the time you understand the trick, he is gone through the lower passage and the marsh has lost its cleanest chance to take him whole.",
          "death": false
        }
      ]
    },
    {
      "id": "M18C",
      "turn": 18,
      "title": "Stone Under the Bell Tower - Ferry Guard",
      "narrative": [
        "With <strong>Warden Hester Vale</strong>, you hold the priory grounds and keep villagers well back from the old stones while Pell's last men retreat below. One wrong move here and the tower becomes a legend again instead of a solved crime scene.",
        "Pell still thinks he can negotiate because he has spent months acting like necessity itself. He believes the marsh would rather keep him half-useful than drag his whole scheme into the daylight and admit how close it came to working.",
        "The next move decides whether this ends in law, in compromise, or in another season of telling children the bell rings on its own."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Take Pell's offer to speak alone and trust him long enough to hear the bargain.",
          "failTitle": "Pell Slips the Tide Tunnel",
          "failText": "Pell only wanted darkness and distance. By the time you understand the trick, he is gone through the lower passage and the marsh has lost its cleanest chance to take him whole.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Seal the grounds above, protect the crowd, and force Pell into the one exit you already own.",
          "nextNodeId": "M19C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the priory and the relief boats first, even if Pell buys himself a little room.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        }
      ]
    },
    {
      "id": "M19A",
      "turn": 19,
      "title": "Judgment at Hollow Lantern Ferry - Reed Trail",
      "narrative": [
        "Gray dawn gathers over <strong>Hollow Lantern Ferry</strong> as Pell's last escort tries to force a way across the broadest water left to him. The ferry chain groans, villagers crowd the bank, and every person present knows the marsh is about to learn whether this ends in capture, exile, or a costly compromise.",
        "Everyone who still matters has converged on the crossing: the saved ferrymen, the hamlet elders, Corin's shaken men, abbey witnesses, and Pell himself with whatever silver and bravado he still thinks count as power. The marsh has become a courtroom made of planks and wet rope.",
        "This is the last place where order can prevail without feeling weak and mercy can prevail without feeling bought."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use the ferry chain, pin the escort, and take Pell alive before he can force open water.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break formation to chase Pell alone across the ferry deck.",
          "failTitle": "The Ferry Turns to Chaos",
          "failText": "You give Pell the confusion he wanted. The line buckles, the crowd panics, and the broker buys his last chance in the smoke of frightened people moving the wrong way at once.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold the west rail, squeeze Pell's escort back, and accept that he may not fall today.",
          "nextNodeId": "M20B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "M19B",
      "turn": 19,
      "title": "Judgment at Hollow Lantern Ferry - Lantern Ledger",
      "narrative": [
        "You stand above the landing with <strong>Sister Maelin</strong>, the case assembled in your hands and the final choice no longer about discovery but about settlement. The truth is already known; now it must be made durable.",
        "Everyone who still matters has converged on the crossing: the saved ferrymen, the hamlet elders, Corin's shaken men, abbey witnesses, and Pell himself with whatever silver and bravado he still thinks count as power. The marsh has become a courtroom made of planks and wet rope.",
        "This is the last place where order can prevail without feeling weak and mercy can prevail without feeling bought."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Read the charges publicly, then force surrender before fear drives the crowd wild.",
          "nextNodeId": "M20C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Break Pell with the full case in front of the marsh and seize him the instant his own men hesitate.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break formation to chase Pell alone across the ferry deck.",
          "failTitle": "The Ferry Turns to Chaos",
          "failText": "You give Pell the confusion he wanted. The line buckles, the crowd panics, and the broker buys his last chance in the smoke of frightened people moving the wrong way at once.",
          "death": false
        }
      ]
    },
    {
      "id": "M19C",
      "turn": 19,
      "title": "Judgment at Hollow Lantern Ferry - Ferry Guard",
      "narrative": [
        "With <strong>Warden Hester Vale</strong>, you lock both approaches to the ferry and deny Pell the open confusion he has always preferred. If he breaks through here, many will survive the winter, but none will trust the spring.",
        "Everyone who still matters has converged on the crossing: the saved ferrymen, the hamlet elders, Corin's shaken men, abbey witnesses, and Pell himself with whatever silver and bravado he still thinks count as power. The marsh has become a courtroom made of planks and wet rope.",
        "This is the last place where order can prevail without feeling weak and mercy can prevail without feeling bought."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break formation to chase Pell alone across the ferry deck.",
          "failTitle": "The Ferry Turns to Chaos",
          "failText": "You give Pell the confusion he wanted. The line buckles, the crowd panics, and the broker buys his last chance in the smoke of frightened people moving the wrong way at once.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure the ferry and the medicine first, even if Pell slips into exile.",
          "nextNodeId": "M20A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lock both landing points, shield the crowd, and leave Pell nowhere lawful or physical to run.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        }
      ]
    },
    {
      "id": "M20A",
      "turn": 20,
      "title": "Morning Tide - Reed Trail",
      "narrative": [
        "With the tide turning clean beneath a pale sky, you ride the reopened bank road and watch lawful ferries move without bells, ghost stories, or private toll flags. The marsh is still itself, still difficult and half-hidden, but it no longer answers to men who learned to dress extortion as rescue.",
        "Medicine is moving again. The sick have the first honest relief in days, the ferrymen know whose orders to trust, and the old bell tower is only stone now rather than the mouth of an unanswerable tale. What remains is not survival alone but the shape of the peace that follows it.",
        "The final choice is no longer about whether the marsh lives through the week, but about what kind of authority it will recognize when the next crisis comes."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Reopen the routes under heavy watch and let the lesser names be judged in due course.",
          "nextNodeId": null,
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Step away without making the final chain of authority unmistakably clear.",
          "failTitle": "The Story Frays",
          "failText": "Relief still moves, but the settlement is left loose enough for frightened men to retell it badly. The marsh survives without quite feeling restored.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Reopen the ferries, lock the case, and name the chain of command that will keep the marsh honest after you ride on.",
          "nextNodeId": null,
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "M20B",
      "turn": 20,
      "title": "Morning Tide - Lantern Ledger",
      "narrative": [
        "At a long table set between abbey crates and ferry ropes, you order the ledgers, seized tokens, and witness statements one final time with <strong>Sister Maelin</strong> beside you. What was once rumor is now record, and what was once fear is finally being given names.",
        "Medicine is moving again. The sick have the first honest relief in days, the ferrymen know whose orders to trust, and the old bell tower is only stone now rather than the mouth of an unanswerable tale. What remains is not survival alone but the shape of the peace that follows it.",
        "The final choice is no longer about whether the marsh lives through the week, but about what kind of authority it will recognize when the next crisis comes."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Finish the case in full, secure every witness, and force a judgment strong enough to outlast the season.",
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
          "label": "Step away without making the final chain of authority unmistakably clear.",
          "failTitle": "The Story Frays",
          "failText": "Relief still moves, but the settlement is left loose enough for frightened men to retell it badly. The marsh survives without quite feeling restored.",
          "death": false
        }
      ]
    },
    {
      "id": "M20C",
      "turn": 20,
      "title": "Morning Tide - Ferry Guard",
      "narrative": [
        "You stand with <strong>Warden Hester Vale</strong> among reopened skiffs, guarded prisoners, and waiting elders as the villages decide how to remember this season. They will speak of hunger, certainly, and of mist and false bells, but also of the day the marsh ceased mistaking coercion for competence.",
        "Medicine is moving again. The sick have the first honest relief in days, the ferrymen know whose orders to trust, and the old bell tower is only stone now rather than the mouth of an unanswerable tale. What remains is not survival alone but the shape of the peace that follows it.",
        "The final choice is no longer about whether the marsh lives through the week, but about what kind of authority it will recognize when the next crisis comes."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Step away without making the final chain of authority unmistakably clear.",
          "failTitle": "The Story Frays",
          "failText": "Relief still moves, but the settlement is left loose enough for frightened men to retell it badly. The marsh survives without quite feeling restored.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set the ferries, the villages, and the prisoners under one lawful settlement that closes Pell's system for good.",
          "nextNodeId": null,
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Put medicine movement first and let the political reckoning settle with time.",
          "nextNodeId": null,
          "scoreDelta": 0
        }
      ]
    }
  ]
});
