window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-empty-mews",
  "title": "The Empty Mews",
  "summary": "When Duke Aldric's prized hunting hawks vanish before they are due to seal a mountain alliance, the ranger and junior falconer Ysra Pell follow cut jesses, false feathers, and cliff paths toward a sale designed to disgrace Brackenwald and provoke a border feud.",
  "maxTurns": 20,
  "startNodeId": "C01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "Every surviving hawk returns to the ducal mews, and Garran Holt's sale book proves that the theft was meant to humiliate Aldric before Lord Senric's envoys. Ysra becomes master of the restored mews, where the birds answer patient hands rather than fear.",
    "low": "The alliance gift is recovered and the border meeting proceeds, but several hawks are lost and Garran's buyers escape unnamed. Aldric strengthens the mountain watch while Ysra rebuilds the mews one perch at a time."
  },
  "nodes": [
    {
      "id": "C01A",
      "turn": 1,
      "title": "Feathers Without Blood - Quiet Advantage",
      "narrative": [
        "At Duke Aldric's order, you ride Thorne into the high farms below the Gray Mountains as Duke Aldric's mountain mews stand open and twelve hunting hawks are gone, though scattered feathers show no blood.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. Junior falconer Ysra Pell finds every door bar intact and one leather jess sliced from the inside.",
        "The clearer position reveals the stakes: The finest bird was intended as tomorrow's alliance gift to Lord Senric, so its loss could be read as a deliberate insult."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the cut jess and inspect each empty perch.",
          "scoreDelta": 1,
          "nextNodeId": "C02A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question every handler before tracks fade.",
          "scoreDelta": 0,
          "nextNodeId": "C02B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release the remaining birds to search for the flock.",
          "failTitle": "The Last Birds Lost",
          "failText": "The frightened hawks scatter across the valley, leaving the mews empty and the thieves warned by familiar cries.",
          "death": false
        }
      ]
    },
    {
      "id": "C01B",
      "turn": 1,
      "title": "Feathers Without Blood - Public Trail",
      "narrative": [
        "A second report reaches you on the same road: Duke Aldric's mountain mews stand open and twelve hunting hawks are gone, though scattered feathers show no blood.",
        "With Thorne close and local witnesses beside you, you compare every account. Junior falconer Ysra Pell finds every door bar intact and one leather jess sliced from the inside.",
        "The evidence now defines the danger: The finest bird was intended as tomorrow's alliance gift to Lord Senric, so its loss could be read as a deliberate insult."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Question every handler before tracks fade while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C02C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Release the remaining birds to search for the flock while keeping Ysra Pell informed.",
          "failTitle": "The Last Birds Lost",
          "failText": "The frightened hawks scatter across the valley, leaving the mews empty and the thieves warned by familiar cries.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the cut jess and inspect each empty perch while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C02B"
        }
      ]
    },
    {
      "id": "C01C",
      "turn": 1,
      "title": "Feathers Without Blood - Fading Lead",
      "narrative": [
        "By the time you reach the troubled ground, Duke Aldric's mountain mews stand open and twelve hunting hawks are gone, though scattered feathers show no blood.",
        "Working against the light, you test the few signs that remain. Junior falconer Ysra Pell finds every door bar intact and one leather jess sliced from the inside.",
        "Delay has sharpened the danger: The finest bird was intended as tomorrow's alliance gift to Lord Senric, so its loss could be read as a deliberate insult."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Release the remaining birds to search for the flock before the remaining light fails.",
          "failTitle": "The Last Birds Lost",
          "failText": "The frightened hawks scatter across the valley, leaving the mews empty and the thieves warned by familiar cries.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Preserve the cut jess and inspect each empty perch before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C02C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Question every handler before tracks fade before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C02A"
        }
      ]
    },
    {
      "id": "C02A",
      "turn": 2,
      "title": "The Bitter Lure - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. Scraps of goat meat beneath the windows smell of bitterroot used to calm injured animals.",
        "You circle downwind and let small marks tell their order. The dose would make a hawk quiet but not helpless, and Ysra knows only three handlers who keep the herb.",
        "The clearer position reveals the stakes: Whoever emptied the mews understood birds well enough to move them without a struggle."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Visit the handlers in order of access.",
          "scoreDelta": 0,
          "nextNodeId": "C03B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Feed a scrap to a hound to judge its strength.",
          "failTitle": "Another Animal Poisoned",
          "failText": "The hound collapses, and the commotion gives a watching accomplice time to clear the nearest herb shed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the lure for comparison with the herb stores.",
          "scoreDelta": 1,
          "nextNodeId": "C03A"
        }
      ]
    },
    {
      "id": "C02B",
      "turn": 2,
      "title": "The Bitter Lure - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. Scraps of goat meat beneath the windows smell of bitterroot used to calm injured animals.",
        "You ask plain questions and watch which answers agree. The dose would make a hawk quiet but not helpless, and Ysra knows only three handlers who keep the herb.",
        "The evidence now defines the danger: Whoever emptied the mews understood birds well enough to move them without a struggle."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Feed a scrap to a hound to judge its strength while keeping Ysra Pell informed.",
          "failTitle": "Another Animal Poisoned",
          "failText": "The hound collapses, and the commotion gives a watching accomplice time to clear the nearest herb shed.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the lure for comparison with the herb stores while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C03B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Visit the handlers in order of access while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C03C"
        }
      ]
    },
    {
      "id": "C02C",
      "turn": 2,
      "title": "The Bitter Lure - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. Scraps of goat meat beneath the windows smell of bitterroot used to calm injured animals.",
        "There is no time for elegance, only for separating fresh danger from old damage. The dose would make a hawk quiet but not helpless, and Ysra knows only three handlers who keep the herb.",
        "Delay has sharpened the danger: Whoever emptied the mews understood birds well enough to move them without a struggle."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Wrap the lure for comparison with the herb stores before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C03C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Visit the handlers in order of access before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C03A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Feed a scrap to a hound to judge its strength before the remaining light fails.",
          "failTitle": "Another Animal Poisoned",
          "failText": "The hound collapses, and the commotion gives a watching accomplice time to clear the nearest herb shed.",
          "death": false
        }
      ]
    },
    {
      "id": "C03A",
      "turn": 3,
      "title": "Garran's Locked Loft - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Senior falconer Garran Holt has vanished from his loft above the feed room.",
        "From sheltered ground, you measure tracks, tools, and distances. His chest holds travel clothes but no winter cloak, while a clean rectangle in dust marks a removed account book.",
        "The clearer position reveals the stakes: Garran may be captive, fugitive, or the only person prepared for a planned journey."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Break every chest in search of the account book.",
          "failTitle": "Trust Broken at the Mews",
          "failText": "The handlers see their belongings treated as plunder and close ranks around whatever they know.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the roof dust and the prints around his ladder.",
          "scoreDelta": 1,
          "nextNodeId": "C04A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the loft before witnesses and list what is missing.",
          "scoreDelta": 0,
          "nextNodeId": "C04B"
        }
      ]
    },
    {
      "id": "C03B",
      "turn": 3,
      "title": "Garran's Locked Loft - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Senior falconer Garran Holt has vanished from his loft above the feed room.",
        "You keep the scene orderly while your allies search it piece by piece. His chest holds travel clothes but no winter cloak, while a clean rectangle in dust marks a removed account book.",
        "The evidence now defines the danger: Garran may be captive, fugitive, or the only person prepared for a planned journey."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the roof dust and the prints around his ladder while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C04B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the loft before witnesses and list what is missing while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C04C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break every chest in search of the account book while keeping Ysra Pell informed.",
          "failTitle": "Trust Broken at the Mews",
          "failText": "The handlers see their belongings treated as plunder and close ranks around whatever they know.",
          "death": false
        }
      ]
    },
    {
      "id": "C03C",
      "turn": 3,
      "title": "Garran's Locked Loft - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Senior falconer Garran Holt has vanished from his loft above the feed room.",
        "Pressed for time, you trust hard evidence and discard rumor. His chest holds travel clothes but no winter cloak, while a clean rectangle in dust marks a removed account book.",
        "Delay has sharpened the danger: Garran may be captive, fugitive, or the only person prepared for a planned journey."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Open the loft before witnesses and list what is missing before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C04A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Break every chest in search of the account book before the remaining light fails.",
          "failTitle": "Trust Broken at the Mews",
          "failText": "The handlers see their belongings treated as plunder and close ranks around whatever they know.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the roof dust and the prints around his ladder before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C04C"
        }
      ]
    },
    {
      "id": "C04A",
      "turn": 4,
      "title": "Talons on Slate - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Fresh scratches cross the bakehouse roof below the mews.",
        "You move quietly enough to hear work and voices ahead. A hood pin and a strand of blue wool lie where a carrying cage was lowered to a cart in the alley.",
        "The clearer position reveals the stakes: The thieves avoided the gate entirely and had a wagon waiting beneath a blind wall."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Match the wool to blankets in nearby carts.",
          "scoreDelta": 1,
          "nextNodeId": "C05A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask bakers who heard wheels before dawn.",
          "scoreDelta": 0,
          "nextNodeId": "C05B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the rain-slick roof at a run.",
          "failTitle": "A Fall from the Slate",
          "failText": "Loose slate gives way beneath you, ending the pursuit before the cart trail is found.",
          "death": true
        }
      ]
    },
    {
      "id": "C04B",
      "turn": 4,
      "title": "Talons on Slate - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Fresh scratches cross the bakehouse roof below the mews.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. A hood pin and a strand of blue wool lie where a carrying cage was lowered to a cart in the alley.",
        "The evidence now defines the danger: The thieves avoided the gate entirely and had a wagon waiting beneath a blind wall."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask bakers who heard wheels before dawn while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C05C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the rain-slick roof at a run while keeping Ysra Pell informed.",
          "failTitle": "A Fall from the Slate",
          "failText": "Loose slate gives way beneath you, ending the pursuit before the cart trail is found.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the wool to blankets in nearby carts while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C05B"
        }
      ]
    },
    {
      "id": "C04C",
      "turn": 4,
      "title": "Talons on Slate - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Fresh scratches cross the bakehouse roof below the mews.",
        "You push through fatigue, knowing the next mistake may close the road. A hood pin and a strand of blue wool lie where a carrying cage was lowered to a cart in the alley.",
        "Delay has sharpened the danger: The thieves avoided the gate entirely and had a wagon waiting beneath a blind wall."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the rain-slick roof at a run before the remaining light fails.",
          "failTitle": "A Fall from the Slate",
          "failText": "Loose slate gives way beneath you, ending the pursuit before the cart trail is found.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Match the wool to blankets in nearby carts before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C05C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask bakers who heard wheels before dawn before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C05A"
        }
      ]
    },
    {
      "id": "C05A",
      "turn": 5,
      "title": "The Cart with No Cargo - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. Wheel marks lead to an abandoned feather merchant's cart beside a mountain track.",
        "A ranger's eye finds the human habit behind the apparent mystery. Its floor is warm under loose straw, and twelve round stains show where hooded cages stood.",
        "The clearer position reveals the stakes: The birds have been divided from the obvious vehicle and are moving toward harsher country."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the nearby farms for borrowed mules.",
          "scoreDelta": 0,
          "nextNodeId": "C06B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive the cart noisily up the mountain road as bait.",
          "failTitle": "Bait Seen Too Clearly",
          "failText": "Scouts recognize the empty cart and move the hawks to a route no wagon can follow.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Identify the pack-animal hairs caught in the tailboard.",
          "scoreDelta": 1,
          "nextNodeId": "C06A"
        }
      ]
    },
    {
      "id": "C05B",
      "turn": 5,
      "title": "The Cart with No Cargo - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. Wheel marks lead to an abandoned feather merchant's cart beside a mountain track.",
        "Together, the small company builds one reliable account from scattered facts. Its floor is warm under loose straw, and twelve round stains show where hooded cages stood.",
        "The evidence now defines the danger: The birds have been divided from the obvious vehicle and are moving toward harsher country."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive the cart noisily up the mountain road as bait while keeping Ysra Pell informed.",
          "failTitle": "Bait Seen Too Clearly",
          "failText": "Scouts recognize the empty cart and move the hawks to a route no wagon can follow.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Identify the pack-animal hairs caught in the tailboard while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C06B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the nearby farms for borrowed mules while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C06C"
        }
      ]
    },
    {
      "id": "C05C",
      "turn": 5,
      "title": "The Cart with No Cargo - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. Wheel marks lead to an abandoned feather merchant's cart beside a mountain track.",
        "You take the shortest safe route and accept that concealment is nearly gone. Its floor is warm under loose straw, and twelve round stains show where hooded cages stood.",
        "Delay has sharpened the danger: The birds have been divided from the obvious vehicle and are moving toward harsher country."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Identify the pack-animal hairs caught in the tailboard before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C06C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the nearby farms for borrowed mules before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C06A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive the cart noisily up the mountain road as bait before the remaining light fails.",
          "failTitle": "Bait Seen Too Clearly",
          "failText": "Scouts recognize the empty cart and move the hawks to a route no wagon can follow.",
          "death": false
        }
      ]
    },
    {
      "id": "C06A",
      "turn": 6,
      "title": "The Groom's Account - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. A stable groom named Bel admits lending four mules to Garran after receiving a signed mews tally.",
        "You preserve the most fragile sign before turning to the larger scene. The signature is Garran's, but the wax carries grit from the old cliff quarry rather than the mews yard.",
        "The clearer position reveals the stakes: The theft had paperwork enough to pass servants and a prepared staging place beyond them."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Bel of selling the hawks and bind him.",
          "failTitle": "A Witness Silenced",
          "failText": "Fear turns Bel stubborn, while the true thieves learn that their useful servant can no longer be questioned.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the tally dry and have Bel describe every rider.",
          "scoreDelta": 1,
          "nextNodeId": "C07A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Bel to identify the quarry path.",
          "scoreDelta": 0,
          "nextNodeId": "C07B"
        }
      ]
    },
    {
      "id": "C06B",
      "turn": 6,
      "title": "The Groom's Account - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. A stable groom named Bel admits lending four mules to Garran after receiving a signed mews tally.",
        "Each person is given one task, and confusion begins to clear. The signature is Garran's, but the wax carries grit from the old cliff quarry rather than the mews yard.",
        "The evidence now defines the danger: The theft had paperwork enough to pass servants and a prepared staging place beyond them."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Keep the tally dry and have Bel describe every rider while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C07B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Bel to identify the quarry path while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C07C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Bel of selling the hawks and bind him while keeping Ysra Pell informed.",
          "failTitle": "A Witness Silenced",
          "failText": "Fear turns Bel stubborn, while the true thieves learn that their useful servant can no longer be questioned.",
          "death": false
        }
      ]
    },
    {
      "id": "C06C",
      "turn": 6,
      "title": "The Groom's Account - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. A stable groom named Bel admits lending four mules to Garran after receiving a signed mews tally.",
        "The enemy has the lead, so you judge every pause against the lives at risk. The signature is Garran's, but the wax carries grit from the old cliff quarry rather than the mews yard.",
        "Delay has sharpened the danger: The theft had paperwork enough to pass servants and a prepared staging place beyond them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Bel to identify the quarry path before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C07A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Accuse Bel of selling the hawks and bind him before the remaining light fails.",
          "failTitle": "A Witness Silenced",
          "failText": "Fear turns Bel stubborn, while the true thieves learn that their useful servant can no longer be questioned.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the tally dry and have Bel describe every rider before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C07C"
        }
      ]
    },
    {
      "id": "C07A",
      "turn": 7,
      "title": "Cages at the Quarry - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. The disused cliff quarry contains fresh droppings, hood feathers, and circles where cages rested.",
        "You watch before acting and learn who believes themselves unobserved. A pulley over the east face has new rope, suggesting the birds were lowered to a ledge hidden from the road.",
        "The clearer position reveals the stakes: The trail now leaves ordinary ground and enters a route chosen by someone who knows every hawk's tolerance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Test the pulley and descend beside the rock face.",
          "scoreDelta": 1,
          "nextNodeId": "C08A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Ysra around to find the ledge from above.",
          "scoreDelta": 0,
          "nextNodeId": "C08B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the rope to prevent the thieves returning.",
          "failTitle": "The Only Descent Cut",
          "failText": "The rope falls beyond reach, closing the quickest path to both birds and captives.",
          "death": false
        }
      ]
    },
    {
      "id": "C07B",
      "turn": 7,
      "title": "Cages at the Quarry - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. The disused cliff quarry contains fresh droppings, hood feathers, and circles where cages rested.",
        "By keeping tempers cool, you hold the inquiry on facts. A pulley over the east face has new rope, suggesting the birds were lowered to a ledge hidden from the road.",
        "The evidence now defines the danger: The trail now leaves ordinary ground and enters a route chosen by someone who knows every hawk's tolerance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Ysra around to find the ledge from above while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C08C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the rope to prevent the thieves returning while keeping Ysra Pell informed.",
          "failTitle": "The Only Descent Cut",
          "failText": "The rope falls beyond reach, closing the quickest path to both birds and captives.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test the pulley and descend beside the rock face while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C08B"
        }
      ]
    },
    {
      "id": "C07C",
      "turn": 7,
      "title": "Cages at the Quarry - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. The disused cliff quarry contains fresh droppings, hood feathers, and circles where cages rested.",
        "The narrow margin leaves no room to chase every possibility. A pulley over the east face has new rope, suggesting the birds were lowered to a ledge hidden from the road.",
        "Delay has sharpened the danger: The trail now leaves ordinary ground and enters a route chosen by someone who knows every hawk's tolerance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the rope to prevent the thieves returning before the remaining light fails.",
          "failTitle": "The Only Descent Cut",
          "failText": "The rope falls beyond reach, closing the quickest path to both birds and captives.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Test the pulley and descend beside the rock face before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C08C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Ysra around to find the ledge from above before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C08A"
        }
      ]
    },
    {
      "id": "C08A",
      "turn": 8,
      "title": "The Hooded Tiercel - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. One escaped tiercel crouches on the hidden ledge with a merchant's blue thread tied around its jess.",
        "You use ground, wind, and cover to approach on your own terms. The bird is hungry, not wild, and the thread carries a tiny lead bead stamped with a northern trading house.",
        "The clearer position reveals the stakes: The planned sale reaches beyond Garran and may already have a buyer waiting near the border."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave food and watch to see who retrieves the bird.",
          "scoreDelta": 0,
          "nextNodeId": "C09B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Grab the bird barehanded before it flies.",
          "failTitle": "Talons and Empty Sky",
          "failText": "The tiercel tears free, injures your hand, and carries the only buyer's mark into the mountains.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Calm the tiercel with Ysra's glove and preserve the bead.",
          "scoreDelta": 1,
          "nextNodeId": "C09A"
        }
      ]
    },
    {
      "id": "C08B",
      "turn": 8,
      "title": "The Hooded Tiercel - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. One escaped tiercel crouches on the hidden ledge with a merchant's blue thread tied around its jess.",
        "Your allies close the easy exits while you examine the heart of the scene. The bird is hungry, not wild, and the thread carries a tiny lead bead stamped with a northern trading house.",
        "The evidence now defines the danger: The planned sale reaches beyond Garran and may already have a buyer waiting near the border."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Grab the bird barehanded before it flies while keeping Ysra Pell informed.",
          "failTitle": "Talons and Empty Sky",
          "failText": "The tiercel tears free, injures your hand, and carries the only buyer's mark into the mountains.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Calm the tiercel with Ysra's glove and preserve the bead while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C09B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave food and watch to see who retrieves the bird while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C09C"
        }
      ]
    },
    {
      "id": "C08C",
      "turn": 8,
      "title": "The Hooded Tiercel - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. One escaped tiercel crouches on the hidden ledge with a merchant's blue thread tied around its jess.",
        "You arrive openly and must turn speed into its own kind of protection. The bird is hungry, not wild, and the thread carries a tiny lead bead stamped with a northern trading house.",
        "Delay has sharpened the danger: The planned sale reaches beyond Garran and may already have a buyer waiting near the border."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Calm the tiercel with Ysra's glove and preserve the bead before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C09C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave food and watch to see who retrieves the bird before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C09A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Grab the bird barehanded before it flies before the remaining light fails.",
          "failTitle": "Talons and Empty Sky",
          "failText": "The tiercel tears free, injures your hand, and carries the only buyer's mark into the mountains.",
          "death": false
        }
      ]
    },
    {
      "id": "C09A",
      "turn": 9,
      "title": "A Name in the Rock - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Ysra finds Garran's account book sealed in a quarry crack.",
        "The cleanest clue survives because you handled it with care. It lists payments from factor Otho Venn and a delivery named 'the white queen' at Cold Ladder Pass.",
        "The clearer position reveals the stakes: The white gyrfalcon meant for Lord Senric is the center of a sale timed to poison Aldric's alliance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear out the page naming Otho and discard the rest.",
          "failTitle": "A Case Reduced to One Page",
          "failText": "Without the surrounding accounts, Otho calls the page a planted scrap and Garran's earlier thefts vanish from the case.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the buyer's marks and return the book to its hiding place.",
          "scoreDelta": 1,
          "nextNodeId": "C10A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the book openly to the mountain warden.",
          "scoreDelta": 0,
          "nextNodeId": "C10B"
        }
      ]
    },
    {
      "id": "C09B",
      "turn": 9,
      "title": "A Name in the Rock - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Ysra finds Garran's account book sealed in a quarry crack.",
        "The shared search reveals details no single witness had understood. It lists payments from factor Otho Venn and a delivery named 'the white queen' at Cold Ladder Pass.",
        "The evidence now defines the danger: The white gyrfalcon meant for Lord Senric is the center of a sale timed to poison Aldric's alliance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Copy the buyer's marks and return the book to its hiding place while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C10B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the book openly to the mountain warden while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C10C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear out the page naming Otho and discard the rest while keeping Ysra Pell informed.",
          "failTitle": "A Case Reduced to One Page",
          "failText": "Without the surrounding accounts, Otho calls the page a planted scrap and Garran's earlier thefts vanish from the case.",
          "death": false
        }
      ]
    },
    {
      "id": "C09C",
      "turn": 9,
      "title": "A Name in the Rock - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Ysra finds Garran's account book sealed in a quarry crack.",
        "What remains is enough, provided you act before it is moved. It lists payments from factor Otho Venn and a delivery named 'the white queen' at Cold Ladder Pass.",
        "Delay has sharpened the danger: The white gyrfalcon meant for Lord Senric is the center of a sale timed to poison Aldric's alliance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Carry the book openly to the mountain warden before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C10A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tear out the page naming Otho and discard the rest before the remaining light fails.",
          "failTitle": "A Case Reduced to One Page",
          "failText": "Without the surrounding accounts, Otho calls the page a planted scrap and Garran's earlier thefts vanish from the case.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Copy the buyer's marks and return the book to its hiding place before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C10C"
        }
      ]
    },
    {
      "id": "C10A",
      "turn": 10,
      "title": "Ysra's Father's Debt - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. The book records old payments to Ysra's father, Pell, who once mastered the mews.",
        "You pause only long enough to read the danger correctly. Ysra admits Pell disappeared after refusing to sell breeding notes and fears Garran has held that debt over her family.",
        "The clearer position reveals the stakes: The inquiry now touches the ally guiding you, exactly where Garran can use doubt to divide it."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Let Ysra explain the entries and compare their ink and dates.",
          "scoreDelta": 1,
          "nextNodeId": "C11A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Ysra beside you while a warden checks Pell's cottage.",
          "scoreDelta": 0,
          "nextNodeId": "C11B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Ysra away as a suspected accomplice.",
          "failTitle": "The Falconer Cast Out",
          "failText": "Without Ysra's skill, the recovered tiercel cannot guide you, and Garran gains a wounded ally to manipulate.",
          "death": false
        }
      ]
    },
    {
      "id": "C10B",
      "turn": 10,
      "title": "Ysra's Father's Debt - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. The book records old payments to Ysra's father, Pell, who once mastered the mews.",
        "A sober exchange of evidence keeps the group from dividing. Ysra admits Pell disappeared after refusing to sell breeding notes and fears Garran has held that debt over her family.",
        "The evidence now defines the danger: The inquiry now touches the ally guiding you, exactly where Garran can use doubt to divide it."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Ysra beside you while a warden checks Pell's cottage while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C11C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Ysra away as a suspected accomplice while keeping Ysra Pell informed.",
          "failTitle": "The Falconer Cast Out",
          "failText": "Without Ysra's skill, the recovered tiercel cannot guide you, and Garran gains a wounded ally to manipulate.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Ysra explain the entries and compare their ink and dates while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C11B"
        }
      ]
    },
    {
      "id": "C10C",
      "turn": 10,
      "title": "Ysra's Father's Debt - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. The book records old payments to Ysra's father, Pell, who once mastered the mews.",
        "You make up lost ground with a directness that warns everyone nearby. Ysra admits Pell disappeared after refusing to sell breeding notes and fears Garran has held that debt over her family.",
        "Delay has sharpened the danger: The inquiry now touches the ally guiding you, exactly where Garran can use doubt to divide it."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Ysra away as a suspected accomplice before the remaining light fails.",
          "failTitle": "The Falconer Cast Out",
          "failText": "Without Ysra's skill, the recovered tiercel cannot guide you, and Garran gains a wounded ally to manipulate.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Ysra explain the entries and compare their ink and dates before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C11C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Ysra beside you while a warden checks Pell's cottage before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C11A"
        }
      ]
    },
    {
      "id": "C11A",
      "turn": 11,
      "title": "The Call from the Fir - Quiet Advantage",
      "narrative": [
        "Your reading of the last scene proves true. The recovered tiercel answers a faint whistle from a fir slope above the quarry.",
        "Leaving Thorne under cover, you study the place before anyone can disturb it. A captive man hidden there repeats the mews call between guarded breaths; Ysra recognizes her father.",
        "The clearer position reveals the stakes: Pell is alive and being used to keep the stolen birds calm during the mountain crossing."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle the fir slope with Ysra before showing yourselves.",
          "scoreDelta": 0,
          "nextNodeId": "C12B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout Pell's name and charge uphill.",
          "failTitle": "The Guard's Warning",
          "failText": "The guard sounds a shrill lure call, and handlers farther up the pass move every cage before you reach Pell.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Approach downwind and remove the lone guard without alarming the birds.",
          "scoreDelta": 1,
          "nextNodeId": "C12A"
        }
      ]
    },
    {
      "id": "C11B",
      "turn": 11,
      "title": "The Call from the Fir - Public Trail",
      "narrative": [
        "The public trail is slower, but no one can deny it. The recovered tiercel answers a faint whistle from a fir slope above the quarry.",
        "With Thorne close and local witnesses beside you, you compare every account. A captive man hidden there repeats the mews call between guarded breaths; Ysra recognizes her father.",
        "The evidence now defines the danger: Pell is alive and being used to keep the stolen birds calm during the mountain crossing."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout Pell's name and charge uphill while keeping Ysra Pell informed.",
          "failTitle": "The Guard's Warning",
          "failText": "The guard sounds a shrill lure call, and handlers farther up the pass move every cage before you reach Pell.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Approach downwind and remove the lone guard without alarming the birds while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C12B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle the fir slope with Ysra before showing yourselves while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C12C"
        }
      ]
    },
    {
      "id": "C11C",
      "turn": 11,
      "title": "The Call from the Fir - Fading Lead",
      "narrative": [
        "Only persistence keeps the damaged lead from vanishing. The recovered tiercel answers a faint whistle from a fir slope above the quarry.",
        "Working against the light, you test the few signs that remain. A captive man hidden there repeats the mews call between guarded breaths; Ysra recognizes her father.",
        "Delay has sharpened the danger: Pell is alive and being used to keep the stolen birds calm during the mountain crossing."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Approach downwind and remove the lone guard without alarming the birds before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C12C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle the fir slope with Ysra before showing yourselves before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C12A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Shout Pell's name and charge uphill before the remaining light fails.",
          "failTitle": "The Guard's Warning",
          "failText": "The guard sounds a shrill lure call, and handlers farther up the pass move every cage before you reach Pell.",
          "death": false
        }
      ]
    },
    {
      "id": "C12A",
      "turn": 12,
      "title": "Pell's Breeding Notes - Quiet Advantage",
      "narrative": [
        "Your last decision leaves a clean thread to follow. Once freed, Pell reveals that Garran stole records identifying the gyrfalcon's lineage.",
        "You circle downwind and let small marks tell their order. The notes make the bird worth a small estate to foreign breeders, far more than a simple ransom.",
        "The clearer position reveals the stakes: Garran's profit and the diplomatic insult are bound together in the same living prize."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue immediately and leave the exhausted man alone.",
          "failTitle": "A Witness Left Behind",
          "failText": "Garran's rear guard finds Pell, recaptures him, and learns exactly how closely you follow.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Pell reconstruct the identifying marks from memory.",
          "scoreDelta": 1,
          "nextNodeId": "C13A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Pell and Ysra back with the rescued tiercel.",
          "scoreDelta": 0,
          "nextNodeId": "C13B"
        }
      ]
    },
    {
      "id": "C12B",
      "turn": 12,
      "title": "Pell's Breeding Notes - Public Trail",
      "narrative": [
        "The measured course keeps witnesses and evidence together. Once freed, Pell reveals that Garran stole records identifying the gyrfalcon's lineage.",
        "You ask plain questions and watch which answers agree. The notes make the bird worth a small estate to foreign breeders, far more than a simple ransom.",
        "The evidence now defines the danger: Garran's profit and the diplomatic insult are bound together in the same living prize."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Have Pell reconstruct the identifying marks from memory while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C13B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Pell and Ysra back with the rescued tiercel while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C13C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue immediately and leave the exhausted man alone while keeping Ysra Pell informed.",
          "failTitle": "A Witness Left Behind",
          "failText": "Garran's rear guard finds Pell, recaptures him, and learns exactly how closely you follow.",
          "death": false
        }
      ]
    },
    {
      "id": "C12C",
      "turn": 12,
      "title": "Pell's Breeding Notes - Fading Lead",
      "narrative": [
        "The rougher approach costs time, but the trail remains alive. Once freed, Pell reveals that Garran stole records identifying the gyrfalcon's lineage.",
        "There is no time for elegance, only for separating fresh danger from old damage. The notes make the bird worth a small estate to foreign breeders, far more than a simple ransom.",
        "Delay has sharpened the danger: Garran's profit and the diplomatic insult are bound together in the same living prize."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Pell and Ysra back with the rescued tiercel before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C13A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pursue immediately and leave the exhausted man alone before the remaining light fails.",
          "failTitle": "A Witness Left Behind",
          "failText": "Garran's rear guard finds Pell, recaptures him, and learns exactly how closely you follow.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Pell reconstruct the identifying marks from memory before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C13C"
        }
      ]
    },
    {
      "id": "C13A",
      "turn": 13,
      "title": "The Cliff Cotes - Quiet Advantage",
      "narrative": [
        "The advantage earned at the previous scene carries forward. Old pigeon cotes beside Cold Ladder Pass have been fitted with hawk perches.",
        "From sheltered ground, you measure tracks, tools, and distances. Six birds remain there under hood, and empty rings show the rest have gone ahead with Garran.",
        "The clearer position reveals the stakes: A rescue made too loudly will scatter valuable birds into a winter sky and alert the sale party."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Block the cote openings with netting before cutting the hoods.",
          "scoreDelta": 1,
          "nextNodeId": "C14A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Pell calm the birds while you watch the pass.",
          "scoreDelta": 0,
          "nextNodeId": "C14B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open every hood so the hawks can defend themselves.",
          "failTitle": "Wings in the Storm",
          "failText": "The panicked birds strike one another and vanish into cloud, while Garran sees the flock rise behind him.",
          "death": false
        }
      ]
    },
    {
      "id": "C13B",
      "turn": 13,
      "title": "The Cliff Cotes - Public Trail",
      "narrative": [
        "Your open-handed approach brings help as well as scrutiny. Old pigeon cotes beside Cold Ladder Pass have been fitted with hawk perches.",
        "You keep the scene orderly while your allies search it piece by piece. Six birds remain there under hood, and empty rings show the rest have gone ahead with Garran.",
        "The evidence now defines the danger: A rescue made too loudly will scatter valuable birds into a winter sky and alert the sale party."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Pell calm the birds while you watch the pass while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C14C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Open every hood so the hawks can defend themselves while keeping Ysra Pell informed.",
          "failTitle": "Wings in the Storm",
          "failText": "The panicked birds strike one another and vanish into cloud, while Garran sees the flock rise behind him.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Block the cote openings with netting before cutting the hoods while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C14B"
        }
      ]
    },
    {
      "id": "C13C",
      "turn": 13,
      "title": "The Cliff Cotes - Fading Lead",
      "narrative": [
        "You recover from the delay with little daylight to spare. Old pigeon cotes beside Cold Ladder Pass have been fitted with hawk perches.",
        "Pressed for time, you trust hard evidence and discard rumor. Six birds remain there under hood, and empty rings show the rest have gone ahead with Garran.",
        "Delay has sharpened the danger: A rescue made too loudly will scatter valuable birds into a winter sky and alert the sale party."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Open every hood so the hawks can defend themselves before the remaining light fails.",
          "failTitle": "Wings in the Storm",
          "failText": "The panicked birds strike one another and vanish into cloud, while Garran sees the flock rise behind him.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Block the cote openings with netting before cutting the hoods before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C14C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Let Pell calm the birds while you watch the pass before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C14A"
        }
      ]
    },
    {
      "id": "C14A",
      "turn": 14,
      "title": "Otho's Safe Conduct - Quiet Advantage",
      "narrative": [
        "Care at the last turning reveals what haste would have missed. Factor Otho Venn approaches under a merchant banner and claims the birds were lawfully sold by Garran.",
        "You move quietly enough to hear work and voices ahead. His safe-conduct covers wool and salt, not live hunting birds, and its date was altered with a scraped numeral.",
        "The clearer position reveals the stakes: Otho expects rank and paper to make pursuit hesitate until he crosses the border."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow Otho while sending the document to a warden.",
          "scoreDelta": 0,
          "nextNodeId": "C15B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rip the safe-conduct apart in front of his guards.",
          "failTitle": "The Merchant's Grievance",
          "failText": "Otho turns a clear limit in his papers into an attack on lawful trade and rides under armed escort.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record the scraped date and detain only the unlisted cages.",
          "scoreDelta": 1,
          "nextNodeId": "C15A"
        }
      ]
    },
    {
      "id": "C14B",
      "turn": 14,
      "title": "Otho's Safe Conduct - Public Trail",
      "narrative": [
        "The inquiry advances steadily under watchful local eyes. Factor Otho Venn approaches under a merchant banner and claims the birds were lawfully sold by Garran.",
        "The presence of witnesses steadies frightened people and loosens guarded tongues. His safe-conduct covers wool and salt, not live hunting birds, and its date was altered with a scraped numeral.",
        "The evidence now defines the danger: Otho expects rank and paper to make pursuit hesitate until he crosses the border."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Rip the safe-conduct apart in front of his guards while keeping Ysra Pell informed.",
          "failTitle": "The Merchant's Grievance",
          "failText": "Otho turns a clear limit in his papers into an attack on lawful trade and rides under armed escort.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Record the scraped date and detain only the unlisted cages while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C15B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow Otho while sending the document to a warden while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C15C"
        }
      ]
    },
    {
      "id": "C14C",
      "turn": 14,
      "title": "Otho's Safe Conduct - Fading Lead",
      "narrative": [
        "The weaker trail bends, yet it still points toward the truth. Factor Otho Venn approaches under a merchant banner and claims the birds were lawfully sold by Garran.",
        "You push through fatigue, knowing the next mistake may close the road. His safe-conduct covers wool and salt, not live hunting birds, and its date was altered with a scraped numeral.",
        "Delay has sharpened the danger: Otho expects rank and paper to make pursuit hesitate until he crosses the border."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Record the scraped date and detain only the unlisted cages before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C15C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shadow Otho while sending the document to a warden before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C15A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Rip the safe-conduct apart in front of his guards before the remaining light fails.",
          "failTitle": "The Merchant's Grievance",
          "failText": "Otho turns a clear limit in his papers into an attack on lawful trade and rides under armed escort.",
          "death": false
        }
      ]
    },
    {
      "id": "C15A",
      "turn": 15,
      "title": "The White Queen's Bell - Quiet Advantage",
      "narrative": [
        "Your earlier judgment wins a quiet approach. The gyrfalcon's distinctive silver bell sounds above a ravine rather than from Otho's convoy.",
        "A ranger's eye finds the human habit behind the apparent mystery. Garran has split from the buyers and climbs toward an abandoned watch hut with the alliance bird.",
        "The clearer position reveals the stakes: He intends to keep the prize if the sale fails, while leaving Otho to carry blame."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Fire an arrow toward the sound to force Garran down.",
          "failTitle": "The Prize Driven Away",
          "failText": "The arrow startles the gyrfalcon; Garran cuts its jesses, and the rare bird disappears into cloud.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the bell through the lee side of the ravine.",
          "scoreDelta": 1,
          "nextNodeId": "C16A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Ysra along the ridge while you hold Otho.",
          "scoreDelta": 0,
          "nextNodeId": "C16B"
        }
      ]
    },
    {
      "id": "C15B",
      "turn": 15,
      "title": "The White Queen's Bell - Public Trail",
      "narrative": [
        "Patience keeps the small company moving as one. The gyrfalcon's distinctive silver bell sounds above a ravine rather than from Otho's convoy.",
        "Together, the small company builds one reliable account from scattered facts. Garran has split from the buyers and climbs toward an abandoned watch hut with the alliance bird.",
        "The evidence now defines the danger: He intends to keep the prize if the sale fails, while leaving Otho to carry blame."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the bell through the lee side of the ravine while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C16B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Ysra along the ridge while you hold Otho while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C16C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Fire an arrow toward the sound to force Garran down while keeping Ysra Pell informed.",
          "failTitle": "The Prize Driven Away",
          "failText": "The arrow startles the gyrfalcon; Garran cuts its jesses, and the rare bird disappears into cloud.",
          "death": false
        }
      ]
    },
    {
      "id": "C15C",
      "turn": 15,
      "title": "The White Queen's Bell - Fading Lead",
      "narrative": [
        "The pursuit has grown urgent by the time you arrive. The gyrfalcon's distinctive silver bell sounds above a ravine rather than from Otho's convoy.",
        "You take the shortest safe route and accept that concealment is nearly gone. Garran has split from the buyers and climbs toward an abandoned watch hut with the alliance bird.",
        "Delay has sharpened the danger: He intends to keep the prize if the sale fails, while leaving Otho to carry blame."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Send Ysra along the ridge while you hold Otho before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C16A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Fire an arrow toward the sound to force Garran down before the remaining light fails.",
          "failTitle": "The Prize Driven Away",
          "failText": "The arrow startles the gyrfalcon; Garran cuts its jesses, and the rare bird disappears into cloud.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow the bell through the lee side of the ravine before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C16C"
        }
      ]
    },
    {
      "id": "C16A",
      "turn": 16,
      "title": "The Watch Hut - Quiet Advantage",
      "narrative": [
        "A well-preserved clue opens the next part of the trail. Garran has barred the hut and hung three cages outside over the ravine.",
        "You preserve the most fragile sign before turning to the larger scene. Ropes run from the door bar to the cages, turning any direct breach into a deadly fall.",
        "The clearer position reveals the stakes: His defense depends on rescuers acting faster than they think."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Anchor each cage rope before touching the door.",
          "scoreDelta": 1,
          "nextNodeId": "C17A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Garran talking while Pell climbs behind the hut.",
          "scoreDelta": 0,
          "nextNodeId": "C17B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hack through the door with your sword.",
          "failTitle": "Cages Over the Edge",
          "failText": "The first blow jerks the rig; cages fall beyond reach before anyone can secure them.",
          "death": true
        }
      ]
    },
    {
      "id": "C16B",
      "turn": 16,
      "title": "The Watch Hut - Public Trail",
      "narrative": [
        "The cautious route brings you onward without losing trust. Garran has barred the hut and hung three cages outside over the ravine.",
        "Each person is given one task, and confusion begins to clear. Ropes run from the door bar to the cages, turning any direct breach into a deadly fall.",
        "The evidence now defines the danger: His defense depends on rescuers acting faster than they think."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Garran talking while Pell climbs behind the hut while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C17C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hack through the door with your sword while keeping Ysra Pell informed.",
          "failTitle": "Cages Over the Edge",
          "failText": "The first blow jerks the rig; cages fall beyond reach before anyone can secure them.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Anchor each cage rope before touching the door while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C17B"
        }
      ]
    },
    {
      "id": "C16C",
      "turn": 16,
      "title": "The Watch Hut - Fading Lead",
      "narrative": [
        "You reach the next ground tired, late, and still determined. Garran has barred the hut and hung three cages outside over the ravine.",
        "The enemy has the lead, so you judge every pause against the lives at risk. Ropes run from the door bar to the cages, turning any direct breach into a deadly fall.",
        "Delay has sharpened the danger: His defense depends on rescuers acting faster than they think."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Hack through the door with your sword before the remaining light fails.",
          "failTitle": "Cages Over the Edge",
          "failText": "The first blow jerks the rig; cages fall beyond reach before anyone can secure them.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Anchor each cage rope before touching the door before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C17C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep Garran talking while Pell climbs behind the hut before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C17A"
        }
      ]
    },
    {
      "id": "C17A",
      "turn": 17,
      "title": "Garran's Last Offer - Quiet Advantage",
      "narrative": [
        "The stronger line of inquiry pays off before dawn. Cornered inside, Garran offers the gyrfalcon for safe passage and names Otho as the sole thief.",
        "You watch before acting and learn who believes themselves unobserved. His cloak contains the missing account page and keys to every cage.",
        "The clearer position reveals the stakes: Accepting his division of guilt would recover one bird while abandoning the structure of the theft."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Agree to safe passage until every hanging cage is raised.",
          "scoreDelta": 0,
          "nextNodeId": "C18B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Garran walk away after handing over the gyrfalcon.",
          "failTitle": "A Falconer's Escape",
          "failText": "Garran vanishes with the records and later sells the same knowledge to another buyer.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Ysra take the bird while you secure Garran and his cloak.",
          "scoreDelta": 1,
          "nextNodeId": "C18A"
        }
      ]
    },
    {
      "id": "C17B",
      "turn": 17,
      "title": "Garran's Last Offer - Public Trail",
      "narrative": [
        "Your deliberate progress gives every witness a voice. Cornered inside, Garran offers the gyrfalcon for safe passage and names Otho as the sole thief.",
        "By keeping tempers cool, you hold the inquiry on facts. His cloak contains the missing account page and keys to every cage.",
        "The evidence now defines the danger: Accepting his division of guilt would recover one bird while abandoning the structure of the theft."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Garran walk away after handing over the gyrfalcon while keeping Ysra Pell informed.",
          "failTitle": "A Falconer's Escape",
          "failText": "Garran vanishes with the records and later sells the same knowledge to another buyer.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Ysra take the bird while you secure Garran and his cloak while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C18B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Agree to safe passage until every hanging cage is raised while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C18C"
        }
      ]
    },
    {
      "id": "C17C",
      "turn": 17,
      "title": "Garran's Last Offer - Fading Lead",
      "narrative": [
        "A lost hour forces you to work with sharper risks. Cornered inside, Garran offers the gyrfalcon for safe passage and names Otho as the sole thief.",
        "The narrow margin leaves no room to chase every possibility. His cloak contains the missing account page and keys to every cage.",
        "Delay has sharpened the danger: Accepting his division of guilt would recover one bird while abandoning the structure of the theft."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Have Ysra take the bird while you secure Garran and his cloak before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C18C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Agree to safe passage until every hanging cage is raised before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C18A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Garran walk away after handing over the gyrfalcon before the remaining light fails.",
          "failTitle": "A Falconer's Escape",
          "failText": "Garran vanishes with the records and later sells the same knowledge to another buyer.",
          "death": false
        }
      ]
    },
    {
      "id": "C18A",
      "turn": 18,
      "title": "Otho at the Border Stone - Quiet Advantage",
      "narrative": [
        "The last choice gives you room to observe unseen. Otho's guards form around the remaining pack cages beside the border marker.",
        "You use ground, wind, and cover to approach on your own terms. Mountain wardens approach from Brackenwald, but a fight could kill birds and men under disputed jurisdiction.",
        "The clearer position reveals the stakes: The stolen hawks must be separated from the trade convoy without beginning the feud Garran hoped to provoke."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the mule tethers and scatter the convoy.",
          "failTitle": "Chaos at the Border",
          "failText": "Loose mules plunge among guards, and the clash crosses the boundary before either side understands it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Display the stamped bead and altered safe-conduct to Otho's own witnesses.",
          "scoreDelta": 1,
          "nextNodeId": "C19A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Negotiate the return of the cages pending Aldric's hearing.",
          "scoreDelta": 0,
          "nextNodeId": "C19B"
        }
      ]
    },
    {
      "id": "C18B",
      "turn": 18,
      "title": "Otho at the Border Stone - Public Trail",
      "narrative": [
        "The steadier path keeps fear from outrunning fact. Otho's guards form around the remaining pack cages beside the border marker.",
        "Your allies close the easy exits while you examine the heart of the scene. Mountain wardens approach from Brackenwald, but a fight could kill birds and men under disputed jurisdiction.",
        "The evidence now defines the danger: The stolen hawks must be separated from the trade convoy without beginning the feud Garran hoped to provoke."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Display the stamped bead and altered safe-conduct to Otho's own witnesses while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C19B"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Negotiate the return of the cages pending Aldric's hearing while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C19C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the mule tethers and scatter the convoy while keeping Ysra Pell informed.",
          "failTitle": "Chaos at the Border",
          "failText": "Loose mules plunge among guards, and the clash crosses the boundary before either side understands it.",
          "death": true
        }
      ]
    },
    {
      "id": "C18C",
      "turn": 18,
      "title": "Otho at the Border Stone - Fading Lead",
      "narrative": [
        "The trail nearly closes before you force it open again. Otho's guards form around the remaining pack cages beside the border marker.",
        "You arrive openly and must turn speed into its own kind of protection. Mountain wardens approach from Brackenwald, but a fight could kill birds and men under disputed jurisdiction.",
        "Delay has sharpened the danger: The stolen hawks must be separated from the trade convoy without beginning the feud Garran hoped to provoke."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Negotiate the return of the cages pending Aldric's hearing before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C19A"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut the mule tethers and scatter the convoy before the remaining light fails.",
          "failTitle": "Chaos at the Border",
          "failText": "Loose mules plunge among guards, and the clash crosses the boundary before either side understands it.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Display the stamped bead and altered safe-conduct to Otho's own witnesses before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C19C"
        }
      ]
    },
    {
      "id": "C19A",
      "turn": 19,
      "title": "The Envoys Arrive - Quiet Advantage",
      "narrative": [
        "Sound fieldcraft turns the previous danger into an advantage. Lord Senric's envoys reach the pass expecting Aldric's gyrfalcon.",
        "The cleanest clue survives because you handled it with care. They find recovered birds, prisoners, and competing claims from Otho and the wardens.",
        "The clearer position reveals the stakes: A clear account can turn intended humiliation into proof that Brackenwald protected the alliance."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Present the bird, account book, safe-conduct, and witnesses in sequence.",
          "scoreDelta": 1,
          "nextNodeId": "C20A"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the envoys to hold the border while Aldric judges the theft.",
          "scoreDelta": 0,
          "nextNodeId": "C20B"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hide the missing birds and claim the mews suffered no loss.",
          "failTitle": "A Lie Before Allies",
          "failText": "The envoys recognize numbered bells on Otho's cages, and the concealment damages the alliance more than the theft.",
          "death": false
        }
      ]
    },
    {
      "id": "C19B",
      "turn": 19,
      "title": "The Envoys Arrive - Public Trail",
      "narrative": [
        "Your companions remain close as the inquiry deepens. Lord Senric's envoys reach the pass expecting Aldric's gyrfalcon.",
        "The shared search reveals details no single witness had understood. They find recovered birds, prisoners, and competing claims from Otho and the wardens.",
        "The evidence now defines the danger: A clear account can turn intended humiliation into proof that Brackenwald protected the alliance."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the envoys to hold the border while Aldric judges the theft while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "nextNodeId": "C20C"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hide the missing birds and claim the mews suffered no loss while keeping Ysra Pell informed.",
          "failTitle": "A Lie Before Allies",
          "failText": "The envoys recognize numbered bells on Otho's cages, and the concealment damages the alliance more than the theft.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the bird, account book, safe-conduct, and witnesses in sequence while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "nextNodeId": "C20B"
        }
      ]
    },
    {
      "id": "C19C",
      "turn": 19,
      "title": "The Envoys Arrive - Fading Lead",
      "narrative": [
        "You arrive under pressure, with the enemy already moving. Lord Senric's envoys reach the pass expecting Aldric's gyrfalcon.",
        "What remains is enough, provided you act before it is moved. They find recovered birds, prisoners, and competing claims from Otho and the wardens.",
        "Delay has sharpened the danger: A clear account can turn intended humiliation into proof that Brackenwald protected the alliance."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Hide the missing birds and claim the mews suffered no loss before the remaining light fails.",
          "failTitle": "A Lie Before Allies",
          "failText": "The envoys recognize numbered bells on Otho's cages, and the concealment damages the alliance more than the theft.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Present the bird, account book, safe-conduct, and witnesses in sequence before the remaining light fails.",
          "scoreDelta": 1,
          "nextNodeId": "C20C"
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the envoys to hold the border while Aldric judges the theft before the remaining light fails.",
          "scoreDelta": 0,
          "nextNodeId": "C20A"
        }
      ]
    },
    {
      "id": "C20A",
      "turn": 20,
      "title": "Wings Over Brackenwald - Quiet Advantage",
      "narrative": [
        "The evidence you protected now points one way. The restored mews receives the surviving hawks as Aldric hears the case.",
        "You pause only long enough to read the danger correctly. Pell can retire free of Garran's hold, Ysra can take the master's glove, and Otho's trading house awaits judgment.",
        "The clearer position reveals the stakes: The settlement will decide whether patient proof or wounded pride governs the mountain border."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Return the hawks while continuing the buyer inquiry under truce.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Demand Lord Senric pay ransom for the gyrfalcon.",
          "failTitle": "The Insult Completed",
          "failText": "The ransom demand fulfills Garran's design by making Aldric appear to profit from a stolen diplomatic gift.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Give the alliance bird openly and submit the complete sale record.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "C20B",
      "turn": 20,
      "title": "Wings Over Brackenwald - Public Trail",
      "narrative": [
        "A careful pace carries the inquiry onto firmer ground. The restored mews receives the surviving hawks as Aldric hears the case.",
        "A sober exchange of evidence keeps the group from dividing. Pell can retire free of Garran's hold, Ysra can take the master's glove, and Otho's trading house awaits judgment.",
        "The evidence now defines the danger: The settlement will decide whether patient proof or wounded pride governs the mountain border."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Demand Lord Senric pay ransom for the gyrfalcon while keeping Ysra Pell informed.",
          "failTitle": "The Insult Completed",
          "failText": "The ransom demand fulfills Garran's design by making Aldric appear to profit from a stolen diplomatic gift.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Give the alliance bird openly and submit the complete sale record while keeping Ysra Pell informed.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Return the hawks while continuing the buyer inquiry under truce while keeping Ysra Pell informed.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        }
      ]
    },
    {
      "id": "C20C",
      "turn": 20,
      "title": "Wings Over Brackenwald - Fading Lead",
      "narrative": [
        "The delayed pursuit reaches the scene at the edge of failure. The restored mews receives the surviving hawks as Aldric hears the case.",
        "You make up lost ground with a directness that warns everyone nearby. Pell can retire free of Garran's hold, Ysra can take the master's glove, and Otho's trading house awaits judgment.",
        "Delay has sharpened the danger: The settlement will decide whether patient proof or wounded pride governs the mountain border."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Give the alliance bird openly and submit the complete sale record before the remaining light fails.",
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high",
          "nextNodeId": null
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Return the hawks while continuing the buyer inquiry under truce before the remaining light fails.",
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low",
          "nextNodeId": null
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Demand Lord Senric pay ransom for the gyrfalcon before the remaining light fails.",
          "failTitle": "The Insult Completed",
          "failText": "The ransom demand fulfills Garran's design by making Aldric appear to profit from a stolen diplomatic gift.",
          "death": false
        }
      ]
    }
  ]
});
