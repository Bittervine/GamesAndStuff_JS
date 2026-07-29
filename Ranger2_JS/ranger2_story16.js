window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-moon-in-the-well",
  "title": "The Moon in the Well",
  "summary": "Silver circles spread across village wells and leave families weak, leading the ranger and well keeper Hessa Wren into an abandoned watercourse where an illicit mirror workshop is poisoning the springs and preparing to empty the land around it.",
  "maxTurns": 20,
  "startNodeId": "D01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "The poisoned channels are sealed, clean water reaches every village, and Dain Vetch's contracts expose the buyers who financed his hidden mirror works. Hessa is appointed keeper of the chalk springs, while the gray silver tabby returns to sleeping on her warm well cover.",
    "low": "The workshop is closed and the villages survive, but several contracts dissolve in the flooded tunnels and the deepest spring remains unsafe. Water must be hauled through winter as Aldric's masons rebuild what greed fouled."
  },
  "nodes": [
    {
      "id": "D01A",
      "turn": 1,
      "title": "Silver on the Water - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into a cluster of chalk villages east of Elderwood as three village wells show bright circles at noon, and those who drink from them suffer trembling hands and heavy sleep.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Well keeper Hessa Wren skims a greasy film that smells faintly of vinegar and metal.",
        "The clearer position reveals the stakes: Fear calls it a moon curse, but the sickness follows connected water rather than phases of the sky."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Bottle water from each depth and close the wells in order.",
          "scoreDelta": 1,
          "nextNodeId": "D02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question households about when the taste changed.",
          "scoreDelta": 0,
          "nextNodeId": "D02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drink from the clearest well to prove there is no curse.",
          "failTitle": "Poison Taken Willingly",
          "failText": "The water leaves you too weak to ride, and panic spreads when even Aldric's ranger falls.",
          "death": true
        }
      ]
    },
    {
      "id": "D01B",
      "turn": 1,
      "title": "Silver on the Water - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: three village wells show bright circles at noon, and those who drink from them suffer trembling hands and heavy sleep.",
        "With Thorne close and local witnesses beside you, you compare every account. Well keeper Hessa Wren skims a greasy film that smells faintly of vinegar and metal.",
        "The evidence now defines the danger: Fear calls it a moon curse, but the sickness follows connected water rather than phases of the sky."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question households about when the taste changed while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drink from the clearest well to prove there is no curse while keeping Hessa Wren informed.",
          "failTitle": "Poison Taken Willingly",
          "failText": "The water leaves you too weak to ride, and panic spreads when even Aldric's ranger falls.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Bottle water from each depth and close the wells in order while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D02B"
        }
      ]
    },
    {
      "id": "D01C",
      "turn": 1,
      "title": "Silver on the Water - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, three village wells show bright circles at noon, and those who drink from them suffer trembling hands and heavy sleep.",
        "Working against the light, you test the few signs that remain. Well keeper Hessa Wren skims a greasy film that smells faintly of vinegar and metal.",
        "Delay has sharpened the danger: Fear calls it a moon curse, but the sickness follows connected water rather than phases of the sky."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drink from the clearest well to prove there is no curse before the remaining light fails.",
          "failTitle": "Poison Taken Willingly",
          "failText": "The water leaves you too weak to ride, and panic spreads when even Aldric's ranger falls.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Bottle water from each depth and close the wells in order before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question households about when the taste changed before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D02A"
        }
      ]
    },
    {
      "id": "D02A",
      "turn": 2,
      "title": "The Chalk Map - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. Hessa's old map shows all three wells fed by a spring beneath a ruined bathhouse.",
        "You circle downwind and let small marks tell their order. Fresh chalk marks add a channel not present when the watercourse was last repaired.",
        "The clearer position reveals the stakes: Someone has altered the hidden flow while villagers watched only their own wells."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Open a clean cistern while planning the search.",
          "scoreDelta": 0,
          "nextNodeId": "D03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the map stone to reveal passages behind it.",
          "failTitle": "The Water Record Lost",
          "failText": "The brittle slab shatters, erasing the only reliable guide through the buried channels.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the new line with surface sinkholes.",
          "scoreDelta": 1,
          "nextNodeId": "D03A"
        }
      ]
    },
    {
      "id": "D02B",
      "turn": 2,
      "title": "The Chalk Map - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. Hessa's old map shows all three wells fed by a spring beneath a ruined bathhouse.",
        "You ask plain questions and watch which answers agree. Fresh chalk marks add a channel not present when the watercourse was last repaired.",
        "The evidence now defines the danger: Someone has altered the hidden flow while villagers watched only their own wells."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the map stone to reveal passages behind it while keeping Hessa Wren informed.",
          "failTitle": "The Water Record Lost",
          "failText": "The brittle slab shatters, erasing the only reliable guide through the buried channels.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Compare the new line with surface sinkholes while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open a clean cistern while planning the search while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D03C"
        }
      ]
    },
    {
      "id": "D02C",
      "turn": 2,
      "title": "The Chalk Map - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. Hessa's old map shows all three wells fed by a spring beneath a ruined bathhouse.",
        "There is no time for elegance, only for separating fresh danger from old damage. Fresh chalk marks add a channel not present when the watercourse was last repaired.",
        "Delay has sharpened the danger: Someone has altered the hidden flow while villagers watched only their own wells."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare the new line with surface sinkholes before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open a clean cistern while planning the search before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break the map stone to reveal passages behind it before the remaining light fails.",
          "failTitle": "The Water Record Lost",
          "failText": "The brittle slab shatters, erasing the only reliable guide through the buried channels.",
          "death": false
        }
      ]
    },
    {
      "id": "D03A",
      "turn": 3,
      "title": "Orren's Burned Hands - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. A young glazier named Orren Pike arrives with red burns and denies entering the bathhouse.",
        "From sheltered ground, you measure tracks, tools, and distances. His sleeves carry white polishing dust and the same sharp smell as the well film.",
        "The clearer position reveals the stakes: Orren knows the source, but shame or fear keeps him from naming it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten to dip his hands in the poisoned well.",
          "failTitle": "A Frightened Apprentice",
          "failText": "Orren bolts into the chalk lanes and warns the hidden workers before collapsing out of sight.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Treat the burns and ask which mixture caused them.",
          "scoreDelta": 1,
          "nextNodeId": "D04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Orren under Hessa's care while checking his workshop.",
          "scoreDelta": 0,
          "nextNodeId": "D04B"
        }
      ]
    },
    {
      "id": "D03B",
      "turn": 3,
      "title": "Orren's Burned Hands - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. A young glazier named Orren Pike arrives with red burns and denies entering the bathhouse.",
        "You keep the scene orderly while your allies search it piece by piece. His sleeves carry white polishing dust and the same sharp smell as the well film.",
        "The evidence now defines the danger: Orren knows the source, but shame or fear keeps him from naming it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Treat the burns and ask which mixture caused them while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Orren under Hessa's care while checking his workshop while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten to dip his hands in the poisoned well while keeping Hessa Wren informed.",
          "failTitle": "A Frightened Apprentice",
          "failText": "Orren bolts into the chalk lanes and warns the hidden workers before collapsing out of sight.",
          "death": false
        }
      ]
    },
    {
      "id": "D03C",
      "turn": 3,
      "title": "Orren's Burned Hands - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. A young glazier named Orren Pike arrives with red burns and denies entering the bathhouse.",
        "Pressed for time, you trust hard evidence and discard rumor. His sleeves carry white polishing dust and the same sharp smell as the well film.",
        "Delay has sharpened the danger: Orren knows the source, but shame or fear keeps him from naming it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Orren under Hessa's care while checking his workshop before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Threaten to dip his hands in the poisoned well before the remaining light fails.",
          "failTitle": "A Frightened Apprentice",
          "failText": "Orren bolts into the chalk lanes and warns the hidden workers before collapsing out of sight.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Treat the burns and ask which mixture caused them before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D04C"
        }
      ]
    },
    {
      "id": "D04A",
      "turn": 4,
      "title": "The Tabby at the Drain - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. A gray silver tabby with green eyes paws at a dry drain behind Orren's workshop, then recoils from its damp edge.",
        "You move quietly enough to hear work and voices ahead. Beneath loose tiles you find gray paste, clipped mirror backing, and tiny cart grooves leading toward the bathhouse.",
        "The clearer position reveals the stakes: The helpful animal has revealed a waste route built low enough to escape casual notice."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cart grooves without touching the paste.",
          "scoreDelta": 1,
          "nextNodeId": "D05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Cover the drain and bring Hessa to witness it.",
          "scoreDelta": 0,
          "nextNodeId": "D05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Reach barehanded into the drain for a sample.",
          "failTitle": "Burned by the Slurry",
          "failText": "The caustic paste scars your hand and ruins the sample under your glove.",
          "death": false
        }
      ]
    },
    {
      "id": "D04B",
      "turn": 4,
      "title": "The Tabby at the Drain - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. A gray silver tabby with green eyes paws at a dry drain behind Orren's workshop, then recoils from its damp edge.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Beneath loose tiles you find gray paste, clipped mirror backing, and tiny cart grooves leading toward the bathhouse.",
        "The evidence now defines the danger: The helpful animal has revealed a waste route built low enough to escape casual notice."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Cover the drain and bring Hessa to witness it while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Reach barehanded into the drain for a sample while keeping Hessa Wren informed.",
          "failTitle": "Burned by the Slurry",
          "failText": "The caustic paste scars your hand and ruins the sample under your glove.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cart grooves without touching the paste while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D05B"
        }
      ]
    },
    {
      "id": "D04C",
      "turn": 4,
      "title": "The Tabby at the Drain - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. A gray silver tabby with green eyes paws at a dry drain behind Orren's workshop, then recoils from its damp edge.",
        "You push through fatigue, knowing the next mistake may close the road. Beneath loose tiles you find gray paste, clipped mirror backing, and tiny cart grooves leading toward the bathhouse.",
        "Delay has sharpened the danger: The helpful animal has revealed a waste route built low enough to escape casual notice."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Reach barehanded into the drain for a sample before the remaining light fails.",
          "failTitle": "Burned by the Slurry",
          "failText": "The caustic paste scars your hand and ruins the sample under your glove.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the cart grooves without touching the paste before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Cover the drain and bring Hessa to witness it before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D05A"
        }
      ]
    },
    {
      "id": "D05A",
      "turn": 5,
      "title": "The Ruined Bathhouse - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. The cart grooves end at a repaired door beneath ivy-covered arches.",
        "A ranger's eye finds the human habit behind the apparent mystery. Warm air escapes around the sill, and Thorne shies from a mineral smell rising through the floor.",
        "The clearer position reveals the stakes: A working furnace lies where every public record says only ruins remain."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Knock and demand to inspect the spring chamber.",
          "scoreDelta": 0,
          "nextNodeId": "D06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick the barred door inward alone.",
          "failTitle": "The Furnace Guard",
          "failText": "Men waiting behind the door drop a timber across the stair and trap you between steam and stone.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Watch the chimney cracks and count workers before entering.",
          "scoreDelta": 1,
          "nextNodeId": "D06A"
        }
      ]
    },
    {
      "id": "D05B",
      "turn": 5,
      "title": "The Ruined Bathhouse - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. The cart grooves end at a repaired door beneath ivy-covered arches.",
        "Together, the small company builds one reliable account from scattered facts. Warm air escapes around the sill, and Thorne shies from a mineral smell rising through the floor.",
        "The evidence now defines the danger: A working furnace lies where every public record says only ruins remain."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick the barred door inward alone while keeping Hessa Wren informed.",
          "failTitle": "The Furnace Guard",
          "failText": "Men waiting behind the door drop a timber across the stair and trap you between steam and stone.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Watch the chimney cracks and count workers before entering while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Knock and demand to inspect the spring chamber while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D06C"
        }
      ]
    },
    {
      "id": "D05C",
      "turn": 5,
      "title": "The Ruined Bathhouse - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. The cart grooves end at a repaired door beneath ivy-covered arches.",
        "You take the shortest safe route and accept that concealment is nearly gone. Warm air escapes around the sill, and Thorne shies from a mineral smell rising through the floor.",
        "Delay has sharpened the danger: A working furnace lies where every public record says only ruins remain."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Watch the chimney cracks and count workers before entering before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Knock and demand to inspect the spring chamber before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Kick the barred door inward alone before the remaining light fails.",
          "failTitle": "The Furnace Guard",
          "failText": "Men waiting behind the door drop a timber across the stair and trap you between steam and stone.",
          "death": true
        }
      ]
    },
    {
      "id": "D06A",
      "turn": 6,
      "title": "Dain Vetch's Claim - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Mirror maker Dain Vetch opens the door and produces a lease for dry storage beneath the bathhouse.",
        "You preserve the most fragile sign before turning to the larger scene. The lease never grants water use, while wet wheel tracks pass behind him toward a lower gallery.",
        "The clearer position reveals the stakes: Dain relies on the difference between what his paper says and what his workshop consumes."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear up the lease and order every worker out.",
          "failTitle": "Authority Squandered",
          "failText": "Dain rallies his workers around a lawful-looking grievance and clears the lower rooms while argument fills the yard.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the lease seal and the lower wheel marks separately.",
          "scoreDelta": 1,
          "nextNodeId": "D07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Hessa read the water rights before witnesses.",
          "scoreDelta": 0,
          "nextNodeId": "D07B"
        }
      ]
    },
    {
      "id": "D06B",
      "turn": 6,
      "title": "Dain Vetch's Claim - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Mirror maker Dain Vetch opens the door and produces a lease for dry storage beneath the bathhouse.",
        "Each person is given one task, and confusion begins to clear. The lease never grants water use, while wet wheel tracks pass behind him toward a lower gallery.",
        "The evidence now defines the danger: Dain relies on the difference between what his paper says and what his workshop consumes."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the lease seal and the lower wheel marks separately while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Hessa read the water rights before witnesses while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear up the lease and order every worker out while keeping Hessa Wren informed.",
          "failTitle": "Authority Squandered",
          "failText": "Dain rallies his workers around a lawful-looking grievance and clears the lower rooms while argument fills the yard.",
          "death": false
        }
      ]
    },
    {
      "id": "D06C",
      "turn": 6,
      "title": "Dain Vetch's Claim - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Mirror maker Dain Vetch opens the door and produces a lease for dry storage beneath the bathhouse.",
        "The enemy has the lead, so you judge every pause against the lives at risk. The lease never grants water use, while wet wheel tracks pass behind him toward a lower gallery.",
        "Delay has sharpened the danger: Dain relies on the difference between what his paper says and what his workshop consumes."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Hessa read the water rights before witnesses before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear up the lease and order every worker out before the remaining light fails.",
          "failTitle": "Authority Squandered",
          "failText": "Dain rallies his workers around a lawful-looking grievance and clears the lower rooms while argument fills the yard.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Inspect the lease seal and the lower wheel marks separately before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D07C"
        }
      ]
    },
    {
      "id": "D07A",
      "turn": 7,
      "title": "The Silvering Room - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. A side vent reveals tables where tin sheets are polished with harsh mineral paste.",
        "You watch before acting and learn who believes themselves unobserved. Waste gutters feed directly into a cracked feeder channel, and workers wear cloths over their mouths.",
        "The clearer position reveals the stakes: The poisoned wells are not an accident hidden from Dain; the room was built around disposing of its waste."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Sketch the gutter path and secure a labeled sample.",
          "scoreDelta": 1,
          "nextNodeId": "D08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring two workers out for questioning.",
          "scoreDelta": 0,
          "nextNodeId": "D08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Smash the finished mirrors to stop production.",
          "failTitle": "Shards and Warning",
          "failText": "Breaking glass injures workers, destroys sale marks, and sends a clear alarm into the tunnels.",
          "death": false
        }
      ]
    },
    {
      "id": "D07B",
      "turn": 7,
      "title": "The Silvering Room - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. A side vent reveals tables where tin sheets are polished with harsh mineral paste.",
        "By keeping tempers cool, you hold the inquiry on facts. Waste gutters feed directly into a cracked feeder channel, and workers wear cloths over their mouths.",
        "The evidence now defines the danger: The poisoned wells are not an accident hidden from Dain; the room was built around disposing of its waste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring two workers out for questioning while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Smash the finished mirrors to stop production while keeping Hessa Wren informed.",
          "failTitle": "Shards and Warning",
          "failText": "Breaking glass injures workers, destroys sale marks, and sends a clear alarm into the tunnels.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Sketch the gutter path and secure a labeled sample while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D08B"
        }
      ]
    },
    {
      "id": "D07C",
      "turn": 7,
      "title": "The Silvering Room - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. A side vent reveals tables where tin sheets are polished with harsh mineral paste.",
        "The narrow margin leaves no room to chase every possibility. Waste gutters feed directly into a cracked feeder channel, and workers wear cloths over their mouths.",
        "Delay has sharpened the danger: The poisoned wells are not an accident hidden from Dain; the room was built around disposing of its waste."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Smash the finished mirrors to stop production before the remaining light fails.",
          "failTitle": "Shards and Warning",
          "failText": "Breaking glass injures workers, destroys sale marks, and sends a clear alarm into the tunnels.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Sketch the gutter path and secure a labeled sample before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring two workers out for questioning before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D08A"
        }
      ]
    },
    {
      "id": "D08A",
      "turn": 8,
      "title": "The Workers' Water - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. The workshop laborers drink from sealed barrels brought from Oakenhurst.",
        "You use ground, wind, and cover to approach on your own terms. Orren admits Dain forbade anyone from touching spring water after a mason became ill.",
        "The clearer position reveals the stakes: The master protected his workforce while allowing nearby families to drink the same poison."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Escort the weakest workers into clean air.",
          "scoreDelta": 0,
          "nextNodeId": "D09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour the barrels into the furnace trough.",
          "failTitle": "Clean Water Wasted",
          "failText": "The only safe water underground vanishes in steam, leaving frightened workers unable to evacuate safely.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record the barrel deliveries and the sick mason's name.",
          "scoreDelta": 1,
          "nextNodeId": "D09A"
        }
      ]
    },
    {
      "id": "D08B",
      "turn": 8,
      "title": "The Workers' Water - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. The workshop laborers drink from sealed barrels brought from Oakenhurst.",
        "Your allies close the easy exits while you examine the heart of the scene. Orren admits Dain forbade anyone from touching spring water after a mason became ill.",
        "The evidence now defines the danger: The master protected his workforce while allowing nearby families to drink the same poison."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour the barrels into the furnace trough while keeping Hessa Wren informed.",
          "failTitle": "Clean Water Wasted",
          "failText": "The only safe water underground vanishes in steam, leaving frightened workers unable to evacuate safely.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record the barrel deliveries and the sick mason's name while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Escort the weakest workers into clean air while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D09C"
        }
      ]
    },
    {
      "id": "D08C",
      "turn": 8,
      "title": "The Workers' Water - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. The workshop laborers drink from sealed barrels brought from Oakenhurst.",
        "You arrive openly and must turn speed into its own kind of protection. Orren admits Dain forbade anyone from touching spring water after a mason became ill.",
        "Delay has sharpened the danger: The master protected his workforce while allowing nearby families to drink the same poison."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Record the barrel deliveries and the sick mason's name before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Escort the weakest workers into clean air before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pour the barrels into the furnace trough before the remaining light fails.",
          "failTitle": "Clean Water Wasted",
          "failText": "The only safe water underground vanishes in steam, leaving frightened workers unable to evacuate safely.",
          "death": false
        }
      ]
    },
    {
      "id": "D09A",
      "turn": 9,
      "title": "A Fourth Channel - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Hessa finds a new stone gate diverting the cleanest spring around the villages into Dain's settling vats.",
        "The cleanest clue survives because you handled it with care. Tool marks show the gate can be opened from a control chamber beyond the workshop.",
        "The clearer position reveals the stakes: Restoring flow without closing the waste gutter would carry a stronger dose into every well."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the spring gate immediately.",
          "failTitle": "Poison in Every Bucket",
          "failText": "The renewed current sweeps concentrated waste into wells that villagers believed were recovering.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace both clean and foul channels before moving any gate.",
          "scoreDelta": 1,
          "nextNodeId": "D10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post Hessa at the gate while you seek the control room.",
          "scoreDelta": 0,
          "nextNodeId": "D10B"
        }
      ]
    },
    {
      "id": "D09B",
      "turn": 9,
      "title": "A Fourth Channel - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Hessa finds a new stone gate diverting the cleanest spring around the villages into Dain's settling vats.",
        "The shared search reveals details no single witness had understood. Tool marks show the gate can be opened from a control chamber beyond the workshop.",
        "The evidence now defines the danger: Restoring flow without closing the waste gutter would carry a stronger dose into every well."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Trace both clean and foul channels before moving any gate while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Post Hessa at the gate while you seek the control room while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the spring gate immediately while keeping Hessa Wren informed.",
          "failTitle": "Poison in Every Bucket",
          "failText": "The renewed current sweeps concentrated waste into wells that villagers believed were recovering.",
          "death": true
        }
      ]
    },
    {
      "id": "D09C",
      "turn": 9,
      "title": "A Fourth Channel - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Hessa finds a new stone gate diverting the cleanest spring around the villages into Dain's settling vats.",
        "What remains is enough, provided you act before it is moved. Tool marks show the gate can be opened from a control chamber beyond the workshop.",
        "Delay has sharpened the danger: Restoring flow without closing the waste gutter would carry a stronger dose into every well."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Post Hessa at the gate while you seek the control room before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the spring gate immediately before the remaining light fails.",
          "failTitle": "Poison in Every Bucket",
          "failText": "The renewed current sweeps concentrated waste into wells that villagers believed were recovering.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Trace both clean and foul channels before moving any gate before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D10C"
        }
      ]
    },
    {
      "id": "D10A",
      "turn": 10,
      "title": "The Emptying Notices - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Orren reveals that Dain paid criers to advise families to abandon the 'cursed' villages.",
        "You pause only long enough to read the danger correctly. Purchase offers already wait for the chalk land, signed by a shell steward who shares Dain's seal cutter.",
        "The clearer position reveals the stakes: The poisoning clears people from land above a valuable, expanding underground works."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Collect the offers and compare their cuts to the lease.",
          "scoreDelta": 1,
          "nextNodeId": "D11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn every household not to sell before Aldric hears the case.",
          "scoreDelta": 0,
          "nextNodeId": "D11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the purchase papers in the village square.",
          "failTitle": "The Scheme Made Invisible",
          "failText": "Without the offers, Dain calls the evacuations charity and denies any plan to acquire the land.",
          "death": false
        }
      ]
    },
    {
      "id": "D10B",
      "turn": 10,
      "title": "The Emptying Notices - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Orren reveals that Dain paid criers to advise families to abandon the 'cursed' villages.",
        "A sober exchange of evidence keeps the group from dividing. Purchase offers already wait for the chalk land, signed by a shell steward who shares Dain's seal cutter.",
        "The evidence now defines the danger: The poisoning clears people from land above a valuable, expanding underground works."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn every household not to sell before Aldric hears the case while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the purchase papers in the village square while keeping Hessa Wren informed.",
          "failTitle": "The Scheme Made Invisible",
          "failText": "Without the offers, Dain calls the evacuations charity and denies any plan to acquire the land.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Collect the offers and compare their cuts to the lease while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D11B"
        }
      ]
    },
    {
      "id": "D10C",
      "turn": 10,
      "title": "The Emptying Notices - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Orren reveals that Dain paid criers to advise families to abandon the 'cursed' villages.",
        "You make up lost ground with a directness that warns everyone nearby. Purchase offers already wait for the chalk land, signed by a shell steward who shares Dain's seal cutter.",
        "Delay has sharpened the danger: The poisoning clears people from land above a valuable, expanding underground works."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Burn the purchase papers in the village square before the remaining light fails.",
          "failTitle": "The Scheme Made Invisible",
          "failText": "Without the offers, Dain calls the evacuations charity and denies any plan to acquire the land.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Collect the offers and compare their cuts to the lease before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Warn every household not to sell before Aldric hears the case before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D11A"
        }
      ]
    },
    {
      "id": "D11A",
      "turn": 11,
      "title": "The Sick Mason - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. The missing mason, Pell Marr, lies hidden in a lime closet below the furnace.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. He helped build the new gate, then tried to warn Hessa after seeing where the waste ran.",
        "The clearer position reveals the stakes: Pell can explain the whole water system if he survives the poisoned air."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry him out with two workers at a steady pace.",
          "scoreDelta": 0,
          "nextNodeId": "D12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force him to walk so the pursuit can continue faster.",
          "failTitle": "A Witness Overdriven",
          "failText": "Pell collapses in the hot gallery and cannot guide anyone to the controls.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use clean water and herbs before moving him along the high passage.",
          "scoreDelta": 1,
          "nextNodeId": "D12A"
        }
      ]
    },
    {
      "id": "D11B",
      "turn": 11,
      "title": "The Sick Mason - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. The missing mason, Pell Marr, lies hidden in a lime closet below the furnace.",
        "With Thorne close and local witnesses beside you, you compare every account. He helped build the new gate, then tried to warn Hessa after seeing where the waste ran.",
        "The evidence now defines the danger: Pell can explain the whole water system if he survives the poisoned air."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Force him to walk so the pursuit can continue faster while keeping Hessa Wren informed.",
          "failTitle": "A Witness Overdriven",
          "failText": "Pell collapses in the hot gallery and cannot guide anyone to the controls.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use clean water and herbs before moving him along the high passage while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry him out with two workers at a steady pace while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D12C"
        }
      ]
    },
    {
      "id": "D11C",
      "turn": 11,
      "title": "The Sick Mason - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. The missing mason, Pell Marr, lies hidden in a lime closet below the furnace.",
        "Working against the light, you test the few signs that remain. He helped build the new gate, then tried to warn Hessa after seeing where the waste ran.",
        "Delay has sharpened the danger: Pell can explain the whole water system if he survives the poisoned air."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Use clean water and herbs before moving him along the high passage before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry him out with two workers at a steady pace before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force him to walk so the pursuit can continue faster before the remaining light fails.",
          "failTitle": "A Witness Overdriven",
          "failText": "Pell collapses in the hot gallery and cannot guide anyone to the controls.",
          "death": true
        }
      ]
    },
    {
      "id": "D12A",
      "turn": 12,
      "title": "The Control Chamber - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. Pell's directions lead to iron levers above a cistern filmed with gray residue.",
        "You circle downwind and let small marks tell their order. Small notches mark the safe sequence, but two have been freshly filed away.",
        "The clearer position reveals the stakes: Dain has prepared the waterworks so an uninformed rescuer can flood evidence or poison the villages."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull all levers upward to shut the works.",
          "failTitle": "The Cistern Released",
          "failText": "The gates open together, sending foul water through the old public channels.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the surviving notch pattern and test pressure at the inspection taps.",
          "scoreDelta": 1,
          "nextNodeId": "D13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold every lever still until Hessa arrives.",
          "scoreDelta": 0,
          "nextNodeId": "D13B"
        }
      ]
    },
    {
      "id": "D12B",
      "turn": 12,
      "title": "The Control Chamber - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. Pell's directions lead to iron levers above a cistern filmed with gray residue.",
        "You ask plain questions and watch which answers agree. Small notches mark the safe sequence, but two have been freshly filed away.",
        "The evidence now defines the danger: Dain has prepared the waterworks so an uninformed rescuer can flood evidence or poison the villages."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Copy the surviving notch pattern and test pressure at the inspection taps while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold every lever still until Hessa arrives while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull all levers upward to shut the works while keeping Hessa Wren informed.",
          "failTitle": "The Cistern Released",
          "failText": "The gates open together, sending foul water through the old public channels.",
          "death": true
        }
      ]
    },
    {
      "id": "D12C",
      "turn": 12,
      "title": "The Control Chamber - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. Pell's directions lead to iron levers above a cistern filmed with gray residue.",
        "There is no time for elegance, only for separating fresh danger from old damage. Small notches mark the safe sequence, but two have been freshly filed away.",
        "Delay has sharpened the danger: Dain has prepared the waterworks so an uninformed rescuer can flood evidence or poison the villages."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Hold every lever still until Hessa arrives before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull all levers upward to shut the works before the remaining light fails.",
          "failTitle": "The Cistern Released",
          "failText": "The gates open together, sending foul water through the old public channels.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the surviving notch pattern and test pressure at the inspection taps before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D13C"
        }
      ]
    },
    {
      "id": "D13A",
      "turn": 13,
      "title": "Mirrors for a Baron - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Crates in the dry gallery bear marks from wealthy houses beyond Brackenwald.",
        "From sheltered ground, you measure tracks, tools, and distances. Invoices describe cheap polished plate as rare silver glass and include payment for secrecy.",
        "The clearer position reveals the stakes: The hidden works are profitable enough that Dain's distant buyers may protect him unless the records survive."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the invoice book and match crate numbers to entries.",
          "scoreDelta": 1,
          "nextNodeId": "D14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the gallery under village guard.",
          "scoreDelta": 0,
          "nextNodeId": "D14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scratch every buyer's crest from the crates.",
          "failTitle": "The Buyers Erased",
          "failText": "Removing the marks protects the patrons who financed the workshop and weakens the case against Dain.",
          "death": false
        }
      ]
    },
    {
      "id": "D13B",
      "turn": 13,
      "title": "Mirrors for a Baron - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Crates in the dry gallery bear marks from wealthy houses beyond Brackenwald.",
        "You keep the scene orderly while your allies search it piece by piece. Invoices describe cheap polished plate as rare silver glass and include payment for secrecy.",
        "The evidence now defines the danger: The hidden works are profitable enough that Dain's distant buyers may protect him unless the records survive."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the gallery under village guard while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Scratch every buyer's crest from the crates while keeping Hessa Wren informed.",
          "failTitle": "The Buyers Erased",
          "failText": "Removing the marks protects the patrons who financed the workshop and weakens the case against Dain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the invoice book and match crate numbers to entries while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D14B"
        }
      ]
    },
    {
      "id": "D13C",
      "turn": 13,
      "title": "Mirrors for a Baron - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Crates in the dry gallery bear marks from wealthy houses beyond Brackenwald.",
        "Pressed for time, you trust hard evidence and discard rumor. Invoices describe cheap polished plate as rare silver glass and include payment for secrecy.",
        "Delay has sharpened the danger: The hidden works are profitable enough that Dain's distant buyers may protect him unless the records survive."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Scratch every buyer's crest from the crates before the remaining light fails.",
          "failTitle": "The Buyers Erased",
          "failText": "Removing the marks protects the patrons who financed the workshop and weakens the case against Dain.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the invoice book and match crate numbers to entries before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seal the gallery under village guard before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D14A"
        }
      ]
    },
    {
      "id": "D14A",
      "turn": 14,
      "title": "Steam in the Tunnels - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Dain orders the furnace quenched, filling the lower watercourse with blinding steam.",
        "You move quietly enough to hear work and voices ahead. Workers flee toward the villages while two guards carry records through an eastern culvert.",
        "The clearer position reveals the stakes: The confusion can become either a safe evacuation or a clean escape for the organizers."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Guide workers out first, then regroup at the culvert.",
          "scoreDelta": 0,
          "nextNodeId": "D15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Close every exit to keep Dain inside.",
          "failTitle": "A Sealed Furnace",
          "failText": "Trapped workers panic in the steam, turning an arrest into a disaster.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the roof vents and follow the record carriers by their wet prints.",
          "scoreDelta": 1,
          "nextNodeId": "D15A"
        }
      ]
    },
    {
      "id": "D14B",
      "turn": 14,
      "title": "Steam in the Tunnels - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Dain orders the furnace quenched, filling the lower watercourse with blinding steam.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. Workers flee toward the villages while two guards carry records through an eastern culvert.",
        "The evidence now defines the danger: The confusion can become either a safe evacuation or a clean escape for the organizers."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Close every exit to keep Dain inside while keeping Hessa Wren informed.",
          "failTitle": "A Sealed Furnace",
          "failText": "Trapped workers panic in the steam, turning an arrest into a disaster.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Open the roof vents and follow the record carriers by their wet prints while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guide workers out first, then regroup at the culvert while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D15C"
        }
      ]
    },
    {
      "id": "D14C",
      "turn": 14,
      "title": "Steam in the Tunnels - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Dain orders the furnace quenched, filling the lower watercourse with blinding steam.",
        "You push through fatigue, knowing the next mistake may close the road. Workers flee toward the villages while two guards carry records through an eastern culvert.",
        "Delay has sharpened the danger: The confusion can become either a safe evacuation or a clean escape for the organizers."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Open the roof vents and follow the record carriers by their wet prints before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Guide workers out first, then regroup at the culvert before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Close every exit to keep Dain inside before the remaining light fails.",
          "failTitle": "A Sealed Furnace",
          "failText": "Trapped workers panic in the steam, turning an arrest into a disaster.",
          "death": true
        }
      ]
    },
    {
      "id": "D15A",
      "turn": 15,
      "title": "The Tabby's Dry Path - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. The gray silver tabby appears on a warm ledge above the steam and slips through a crack toward clean air.",
        "A ranger's eye finds the human habit behind the apparent mystery. The crack opens onto an old service walk that overlooks the eastern culvert without crossing poisoned water.",
        "The clearer position reveals the stakes: A small animal's instinct has found the one route Dain's rebuilding overlooked."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Jump directly into the culvert below.",
          "failTitle": "The Foul Channel",
          "failText": "The current sweeps you against an iron grate while Dain escapes with the records.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the tabby and mark the safe turns for Hessa.",
          "scoreDelta": 1,
          "nextNodeId": "D16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Orren along the ledge while you guard the workers.",
          "scoreDelta": 0,
          "nextNodeId": "D16B"
        }
      ]
    },
    {
      "id": "D15B",
      "turn": 15,
      "title": "The Tabby's Dry Path - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. The gray silver tabby appears on a warm ledge above the steam and slips through a crack toward clean air.",
        "Together, the small company builds one reliable account from scattered facts. The crack opens onto an old service walk that overlooks the eastern culvert without crossing poisoned water.",
        "The evidence now defines the danger: A small animal's instinct has found the one route Dain's rebuilding overlooked."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the tabby and mark the safe turns for Hessa while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Orren along the ledge while you guard the workers while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Jump directly into the culvert below while keeping Hessa Wren informed.",
          "failTitle": "The Foul Channel",
          "failText": "The current sweeps you against an iron grate while Dain escapes with the records.",
          "death": true
        }
      ]
    },
    {
      "id": "D15C",
      "turn": 15,
      "title": "The Tabby's Dry Path - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. The gray silver tabby appears on a warm ledge above the steam and slips through a crack toward clean air.",
        "You take the shortest safe route and accept that concealment is nearly gone. The crack opens onto an old service walk that overlooks the eastern culvert without crossing poisoned water.",
        "Delay has sharpened the danger: A small animal's instinct has found the one route Dain's rebuilding overlooked."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Orren along the ledge while you guard the workers before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Jump directly into the culvert below before the remaining light fails.",
          "failTitle": "The Foul Channel",
          "failText": "The current sweeps you against an iron grate while Dain escapes with the records.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the tabby and mark the safe turns for Hessa before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D16C"
        }
      ]
    },
    {
      "id": "D16A",
      "turn": 16,
      "title": "Dain at the Springhead - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. The service walk reaches Dain as he prepares to collapse the chalk springhead with wedges.",
        "You preserve the most fragile sign before turning to the larger scene. A cave-in would bury the workshop, destroy the records, and cut water to all three villages.",
        "The clearer position reveals the stakes: Stopping him requires care because every blow carries through the cracked roof."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Pin the wedge rope with an arrow and approach along the wall.",
          "scoreDelta": 1,
          "nextNodeId": "D17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Dain talking until Hessa closes the upstream gate.",
          "scoreDelta": 0,
          "nextNodeId": "D17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush across the central chalk shelf.",
          "failTitle": "The Roof Comes Down",
          "failText": "Your weight breaks the shelf; falling chalk seals the springhead and everyone beneath it.",
          "death": true
        }
      ]
    },
    {
      "id": "D16B",
      "turn": 16,
      "title": "Dain at the Springhead - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. The service walk reaches Dain as he prepares to collapse the chalk springhead with wedges.",
        "Each person is given one task, and confusion begins to clear. A cave-in would bury the workshop, destroy the records, and cut water to all three villages.",
        "The evidence now defines the danger: Stopping him requires care because every blow carries through the cracked roof."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Dain talking until Hessa closes the upstream gate while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush across the central chalk shelf while keeping Hessa Wren informed.",
          "failTitle": "The Roof Comes Down",
          "failText": "Your weight breaks the shelf; falling chalk seals the springhead and everyone beneath it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin the wedge rope with an arrow and approach along the wall while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D17B"
        }
      ]
    },
    {
      "id": "D16C",
      "turn": 16,
      "title": "Dain at the Springhead - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. The service walk reaches Dain as he prepares to collapse the chalk springhead with wedges.",
        "The enemy has the lead, so you judge every pause against the lives at risk. A cave-in would bury the workshop, destroy the records, and cut water to all three villages.",
        "Delay has sharpened the danger: Stopping him requires care because every blow carries through the cracked roof."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rush across the central chalk shelf before the remaining light fails.",
          "failTitle": "The Roof Comes Down",
          "failText": "Your weight breaks the shelf; falling chalk seals the springhead and everyone beneath it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pin the wedge rope with an arrow and approach along the wall before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Dain talking until Hessa closes the upstream gate before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D17A"
        }
      ]
    },
    {
      "id": "D17A",
      "turn": 17,
      "title": "The Buyers' Chest - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Dain surrenders the wedge but kicks a small chest toward the open channel.",
        "You watch before acting and learn who believes themselves unobserved. It holds sealed contracts, payments, and letters describing the villages as nearly empty.",
        "The clearer position reveals the stakes: Those papers connect poisoned water to deliberate land purchases rather than careless craft."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Orren retrieve it downstream while you bind Dain.",
          "scoreDelta": 0,
          "nextNodeId": "D18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dive after the chest in the mineral current.",
          "failTitle": "The Price of Proof",
          "failText": "The poisoned water overwhelms you before the chest reaches the grate.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Catch the chest with your bow stave before securing Dain.",
          "scoreDelta": 1,
          "nextNodeId": "D18A"
        }
      ]
    },
    {
      "id": "D17B",
      "turn": 17,
      "title": "The Buyers' Chest - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Dain surrenders the wedge but kicks a small chest toward the open channel.",
        "By keeping tempers cool, you hold the inquiry on facts. It holds sealed contracts, payments, and letters describing the villages as nearly empty.",
        "The evidence now defines the danger: Those papers connect poisoned water to deliberate land purchases rather than careless craft."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Dive after the chest in the mineral current while keeping Hessa Wren informed.",
          "failTitle": "The Price of Proof",
          "failText": "The poisoned water overwhelms you before the chest reaches the grate.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Catch the chest with your bow stave before securing Dain while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Orren retrieve it downstream while you bind Dain while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D18C"
        }
      ]
    },
    {
      "id": "D17C",
      "turn": 17,
      "title": "The Buyers' Chest - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Dain surrenders the wedge but kicks a small chest toward the open channel.",
        "The narrow margin leaves no room to chase every possibility. It holds sealed contracts, payments, and letters describing the villages as nearly empty.",
        "Delay has sharpened the danger: Those papers connect poisoned water to deliberate land purchases rather than careless craft."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Catch the chest with your bow stave before securing Dain before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Orren retrieve it downstream while you bind Dain before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Dive after the chest in the mineral current before the remaining light fails.",
          "failTitle": "The Price of Proof",
          "failText": "The poisoned water overwhelms you before the chest reaches the grate.",
          "death": true
        }
      ]
    },
    {
      "id": "D18A",
      "turn": 18,
      "title": "Clean Water First - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Hessa can reopen the ancient north feeder while Orren blocks the workshop gutter.",
        "You use ground, wind, and cover to approach on your own terms. Pell warns that the weakened masonry will bear only one strong change before repair.",
        "The clearer position reveals the stakes: The villages need water at once, but a mistaken sequence could carry the last settled poison with it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the feeder fully and trust the old channel.",
          "failTitle": "The Last Gray Flood",
          "failText": "The sudden pressure lifts toxic sediment and sends it through every village well.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Flush the gutter into sealed vats before easing open the feeder.",
          "scoreDelta": 1,
          "nextNodeId": "D19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Supply barrels until masons reinforce every gate.",
          "scoreDelta": 0,
          "nextNodeId": "D19B"
        }
      ]
    },
    {
      "id": "D18B",
      "turn": 18,
      "title": "Clean Water First - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Hessa can reopen the ancient north feeder while Orren blocks the workshop gutter.",
        "Your allies close the easy exits while you examine the heart of the scene. Pell warns that the weakened masonry will bear only one strong change before repair.",
        "The evidence now defines the danger: The villages need water at once, but a mistaken sequence could carry the last settled poison with it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Flush the gutter into sealed vats before easing open the feeder while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Supply barrels until masons reinforce every gate while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the feeder fully and trust the old channel while keeping Hessa Wren informed.",
          "failTitle": "The Last Gray Flood",
          "failText": "The sudden pressure lifts toxic sediment and sends it through every village well.",
          "death": true
        }
      ]
    },
    {
      "id": "D18C",
      "turn": 18,
      "title": "Clean Water First - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Hessa can reopen the ancient north feeder while Orren blocks the workshop gutter.",
        "You arrive openly and must turn speed into its own kind of protection. Pell warns that the weakened masonry will bear only one strong change before repair.",
        "Delay has sharpened the danger: The villages need water at once, but a mistaken sequence could carry the last settled poison with it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Supply barrels until masons reinforce every gate before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open the feeder fully and trust the old channel before the remaining light fails.",
          "failTitle": "The Last Gray Flood",
          "failText": "The sudden pressure lifts toxic sediment and sends it through every village well.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Flush the gutter into sealed vats before easing open the feeder before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D19C"
        }
      ]
    },
    {
      "id": "D19A",
      "turn": 19,
      "title": "The Wellside Hearing - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Families gather around the first well to clear, facing Dain and the rescued workers.",
        "The cleanest clue survives because you handled it with care. Some workers acted from poverty, others guarded the tunnels, and Orren asks to testify against his master.",
        "The clearer position reveals the stakes: Justice must distinguish the scheme's maker from people trapped inside his dangerous employment."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Present water samples, maps, offers, invoices, and Pell's account.",
          "scoreDelta": 1,
          "nextNodeId": "D20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send all prisoners to Aldric for separate hearings.",
          "scoreDelta": 0,
          "nextNodeId": "D20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the sick families decide punishments immediately.",
          "failTitle": "Anger at the Well",
          "failText": "The crowd strikes workers before testimony can separate guilt from fear, and Dain's wider network disappears in the disorder.",
          "death": false
        }
      ]
    },
    {
      "id": "D19B",
      "turn": 19,
      "title": "The Wellside Hearing - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Families gather around the first well to clear, facing Dain and the rescued workers.",
        "The shared search reveals details no single witness had understood. Some workers acted from poverty, others guarded the tunnels, and Orren asks to testify against his master.",
        "The evidence now defines the danger: Justice must distinguish the scheme's maker from people trapped inside his dangerous employment."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send all prisoners to Aldric for separate hearings while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "nextNodeId": "D20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the sick families decide punishments immediately while keeping Hessa Wren informed.",
          "failTitle": "Anger at the Well",
          "failText": "The crowd strikes workers before testimony can separate guilt from fear, and Dain's wider network disappears in the disorder.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present water samples, maps, offers, invoices, and Pell's account while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "nextNodeId": "D20B"
        }
      ]
    },
    {
      "id": "D19C",
      "turn": 19,
      "title": "The Wellside Hearing - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Families gather around the first well to clear, facing Dain and the rescued workers.",
        "What remains is enough, provided you act before it is moved. Some workers acted from poverty, others guarded the tunnels, and Orren asks to testify against his master.",
        "Delay has sharpened the danger: Justice must distinguish the scheme's maker from people trapped inside his dangerous employment."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the sick families decide punishments immediately before the remaining light fails.",
          "failTitle": "Anger at the Well",
          "failText": "The crowd strikes workers before testimony can separate guilt from fear, and Dain's wider network disappears in the disorder.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present water samples, maps, offers, invoices, and Pell's account before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "D20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send all prisoners to Aldric for separate hearings before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "D20A"
        }
      ]
    },
    {
      "id": "D20A",
      "turn": 20,
      "title": "The Moon Broken - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. Morning light reaches clear water as Aldric's engineers inspect the buried works.",
        "You pause only long enough to read the danger correctly. Hessa is ready to keep the springs, Orren offers his craft for repairs, and the sealed contracts await judgment.",
        "The clearer position reveals the stakes: The final choice will decide whether the villages merely survive or also expose those who profited from their sickness."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the workshop closed and rebuild the wells before pursuing buyers.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Sell the finished mirrors to pay for repairs.",
          "failTitle": "Poisoned Profit",
          "failText": "Using Dain's goods makes the villages partners in the trade that harmed them and lets the buyers remain hidden.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Submit the complete contracts and appoint Hessa over every feeder gate.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "D20B",
      "turn": 20,
      "title": "The Moon Broken - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. Morning light reaches clear water as Aldric's engineers inspect the buried works.",
        "A sober exchange of evidence keeps the group from dividing. Hessa is ready to keep the springs, Orren offers his craft for repairs, and the sealed contracts await judgment.",
        "The evidence now defines the danger: The final choice will decide whether the villages merely survive or also expose those who profited from their sickness."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Sell the finished mirrors to pay for repairs while keeping Hessa Wren informed.",
          "failTitle": "Poisoned Profit",
          "failText": "Using Dain's goods makes the villages partners in the trade that harmed them and lets the buyers remain hidden.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Submit the complete contracts and appoint Hessa over every feeder gate while keeping Hessa Wren informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the workshop closed and rebuild the wells before pursuing buyers while keeping Hessa Wren informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "D20C",
      "turn": 20,
      "title": "The Moon Broken - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. Morning light reaches clear water as Aldric's engineers inspect the buried works.",
        "You make up lost ground with a directness that warns everyone nearby. Hessa is ready to keep the springs, Orren offers his craft for repairs, and the sealed contracts await judgment.",
        "Delay has sharpened the danger: The final choice will decide whether the villages merely survive or also expose those who profited from their sickness."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Submit the complete contracts and appoint Hessa over every feeder gate before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep the workshop closed and rebuild the wells before pursuing buyers before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Sell the finished mirrors to pay for repairs before the remaining light fails.",
          "failTitle": "Poisoned Profit",
          "failText": "Using Dain's goods makes the villages partners in the trade that harmed them and lets the buyers remain hidden.",
          "death": false
        }
      ]
    }
  ]
});
