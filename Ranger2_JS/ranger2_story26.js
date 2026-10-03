window.RANGER2_STORIES = window.RANGER2_STORIES || [];
window.RANGER2_STORIES.push({
  "id": "the-wardens-lost-hound",
  "title": "The Warden's Lost Hound",
  "summary": "A warden's tracking hound vanishes across disputed hunting ground in Elderwood. Following a cut lead and a boy's footprints, the ranger must find them both before old grievances turn the search into a woodland feud.",
  "maxTurns": 20,
  "startNodeId": "AA01A",
  "goodScoreThreshold": 14,
  "epilogues": {
    "high": "Rill sleeps beside Tavin's hearth while the boy's knee mends. Sella Dorn and Bram Nett keep the abandoned deer pit fenced, sharing the work without pretending it settles who owns the surrounding wood. Their joint account reaches Duke Aldric before any accusation does, and the disputed paths remain open to ordinary travelers while the claim is heard. When the ranger next rides through on Thorne, a hound answers from one house and a friendly hand rises from the other.",
    "low": "The boy and the hound come home, and no blood is shed over the broken lead. A narrow strip of woodland remains closed to hunting under temporary watch while Duke Aldric hears the rival claims. Bram and Sella honor the peace, though neither yet trusts the other to keep it without witnesses. Rill recovers more quickly than the neighbors do; for weeks, every distant horn still brings people to their doors."
  },
  "nodes": [
    {
      "id": "AA01A",
      "turn": 1,
      "title": "An Empty Lead",
      "narrative": [
        "You find Warden Sella Dorn at Elderwood's boundary oak, holding a whistle she has plainly sounded too often. Her brindled tracking hound, Rill, vanished that morning while following a wounded deer across the disputed North Coppice. The woodcutters have refused to let her search with armed men.",
        "Bram Nett stands beyond the oak with a billhook planted in the earth. His son Tavin went out to clear the common footpath and has not returned either. Sella sees a stolen hound; Bram hears an excuse to bring ducal hunters onto woodland his family has always used.",
        "You dismount from Thorne and name the oath you swore to Duke Aldric: protection for the people of these woods, not a verdict shouted across a ditch. Afternoon rain is gathering. Somewhere beneath the branches, a boy and a dog have both gone quiet."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Keep everyone off the damp verge while you separate Rill's prints from the morning traffic.",
          "nextNodeId": "AA02A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Hear Sella and Bram in turn and secure a pause in their quarrel before searching.",
          "nextNodeId": "AA02B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Give Sella leave to search the woodcutters' homes for her hound.",
          "failTitle": "A Search Becomes a Raid",
          "failText": "The wardens cross the ditch with weapons ready. Bram's neighbors bar their doors, and the first struggle draws every willing hand away from the missing boy and hound.",
          "death": false
        }
      ]
    },
    {
      "id": "AA01B",
      "turn": 1,
      "title": "Two Claims at One Tree",
      "narrative": [
        "Sella Dorn's wardens have stopped at the boundary oak when you bring Thorne along the coppice road. Beyond them, woodcutter Bram Nett demands to know why a missing hunting hound should permit armed men into the North Coppice. Each answer makes the other side less willing to listen.",
        "Rill, Sella's brindled tracking hound, has been absent since morning. Bram's son Tavin has also failed to return from clearing a footpath, but the men around the oak are already treating these absences as proof against one another.",
        "You know this stretch of Elderwood by its old ditch, not by any judgment on who may hunt beyond it. Duke Aldric's seal gives you authority to protect the missing, and a sudden cold wind gives that duty urgency."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Collect a long rope, a spare blanket, and the boy's usual route before entering the coppice.",
          "nextNodeId": "AA02C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Order Bram held at the oak until his son brings the hound back.",
          "failTitle": "A Father Bound",
          "failText": "Bram's kin believe you have taken a hostage. They block the lanes, the search breaks apart, and the disputed wood fills with men looking for enemies.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take Sella and Bram aside separately, then agree on a search they can both witness.",
          "nextNodeId": "AA02B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA01C",
      "turn": 1,
      "title": "The Unanswered Whistle",
      "narrative": [
        "A hound's recall whistles through Elderwood as you lead Thorne toward the North Coppice. Warden Sella Dorn lowers her hand when no dog answers. Her hound Rill crossed the hunting boundary that morning, and every request to follow has become an argument.",
        "Bram Nett, a woodcutter with mud to his knees, says his son Tavin is overdue from work on the common path. He fears Sella will accuse the boy of taking the valuable animal. Sella fears the woodcutters have harmed it to challenge her rights.",
        "Both look to you, the ranger sworn to Duke Aldric, for a decision. Rain freckles your dark brown hair and catches in your stubble. You would rather begin with tracks, a warm blanket, and something stronger than either person's suspicions."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise compensation for Rill before learning whether either missing creature is hurt.",
          "failTitle": "The Price of an Accusation",
          "failText": "Your promise is heard as a finding of guilt against Bram's household. The woodcutters withdraw their help, and Sella's men begin demanding payment instead of searching.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pack search supplies onto Thorne and have both neighbors identify the paths they know.",
          "nextNodeId": "AA02C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Make a small gap in the waiting crowd and examine the road before its prints disappear.",
          "nextNodeId": "AA02A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA02A",
      "turn": 2,
      "title": "Prints Beneath the Hooves",
      "narrative": [
        "Keeping the verge clear gives you a strip of soft earth that the waiting crowd has not spoiled. Rill's broad paw marks run beyond the boundary ditch. Smaller bootprints follow, but there is no churn of feet to suggest a struggle.",
        "Sella crouches beside you and points out the hound's slightly turned rear paw. Bram recognizes a crescent-shaped patch on one heel as Tavin's repair. Neither likes how closely the two trails lie together, though neither can now claim the tracks are imaginary.",
        "At your request, both neighbors tell their people to wait at the oak while they search with you. Beyond a fallen branch, pig prints cover the path like scattered pebbles. The hound may have followed the deer into the coppice or turned at the branch; one hurried guess could cost the last useful light."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Find Rill's turned rear-paw mark again beyond the pigs' rooting ground.",
          "nextNodeId": "AA03A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Gallop through the rooted ground to catch whoever is leading the hound.",
          "failTitle": "Tracks Under Iron",
          "failText": "Thorne's passage destroys the little trail left among the hoofmarks. You follow the broadest track into an occupied swine pasture, where frightened people take your charge for the start of the raid.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Place Sella and Bram within sight of one another and listen for Rill from successive points.",
          "nextNodeId": "AA03B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA02B",
      "turn": 2,
      "title": "A Search Both Can Witness",
      "narrative": [
        "Hearing the two neighbors apart gives them room to admit what they do not know. Sella never saw anyone take Rill. Bram last saw Tavin carrying a pruning hook toward the common path, long before the wardens arrived.",
        "You bring them together on those smaller, firmer truths. Each agrees to accompany you without calling the others forward, and both send word that the people waiting at the oak are to hold their ground.",
        "The arrangement costs daylight but opens the coppice. Wind moves through low hazel, carrying sounds unevenly, while a row of old path notches disappears into thicker trees. Thorne waits patiently beside your shoulder."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Bram to show the path notches Tavin would have followed with his pruning hook.",
          "nextNodeId": "AA03C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Space the searchers along the first ride so you can distinguish a reply from an echo.",
          "nextNodeId": "AA03B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let both parties sound hunting horns to cover more ground quickly.",
          "failTitle": "A Wood Full of Horns",
          "failText": "The rival calls are taken for challenges. Armed searchers hurry across the boundary from both directions, drowning any answer from the missing pair beneath their own shouting.",
          "death": false
        }
      ]
    },
    {
      "id": "AA02C",
      "turn": 2,
      "title": "What the Search Can Carry",
      "narrative": [
        "Gathering the rope and blanket gives the search a useful shape. Sella brings a spare hound lead from her saddle; Bram adds a woodcutting cord and tells you that Tavin was clearing branches along the old common path.",
        "You tie the supplies evenly across Thorne and leave the narrow pruning tools where they will not catch on brush. Bram notices the blanket before anything else. His anger loses some of its force when he understands that you are preparing to bring his son home hurt, if necessary.",
        "Sella and Bram instruct their people to remain at the oak while they accompany you. The first ride divides around a patch of rooted earth. One branch carries old notches at shoulder height; beside the other, a few paw marks survive under the shelter of a fallen limb."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Leave the heavy rope at the oak so the party can move faster.",
          "failTitle": "Empty Hands at the Hollow",
          "failText": "You press deep into the coppice without the means to cross its steep old cuttings. By the time someone returns with rope, darkness has closed the ground and the urgent search has failed.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the sheltered verge for an unbroken stretch of Rill's trail.",
          "nextNodeId": "AA03A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Read the path notches with Bram and find the newest cuts made by Tavin's hook.",
          "nextNodeId": "AA03C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA03A",
      "turn": 3,
      "title": "The Turned Paw",
      "narrative": [
        "Following the turned rear paw carries you around the pigs' ground without mistaking their narrow clefts for Rill's track. At a muddy opening, the hound's marks shorten from a running stride to several close steps.",
        "Tavin's repaired heel appears behind them. His boot turns sideways where the path passes a thorn thicket, and a thin groove crosses the mud between two roots. Nothing here looks like a boy dragging a resisting animal.",
        "Sella reaches toward a strip of leather hanging inside the thorn. You stop her before she pulls it free. Its position may explain more than its mere presence, and Bram has already gone very still."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Examine where the leather caught and which way it was cut before disturbing it.",
          "nextNodeId": "AA04A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Sella show how Rill's collar and trailing lead fit together.",
          "nextNodeId": "AA04B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull the leather out sharply so Bram cannot hide or alter it.",
          "failTitle": "The Only Clear Sign Torn",
          "failText": "Thorns tear the cut end as you wrench it loose. Your accusation turns Bram against you, and the best chance of distinguishing a rescue from a theft is lost in the quarrel.",
          "death": false
        }
      ]
    },
    {
      "id": "AA03B",
      "turn": 3,
      "title": "Listening Between the Trees",
      "narrative": [
        "Spacing the searchers along the ride leaves a quiet interval after each call. Most sounds return from a bare bank, but one faint scrape seems to come from the eastern hollow. You mark the direction without pretending it is an answer.",
        "At the end of the listening line, Bram finds freshly bent thorn and calls you over in a low voice. A strip of leather runs into the bush. Its loose end hangs above the mud rather than lying where a dog would have dropped it.",
        "Sella recognizes the color of her lead and starts forward. Bram puts out a hand to stop her. They have found something neither can bear to let the other explain first."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lift the snag gently on a forked stick so both can see the trapped section.",
          "nextNodeId": "AA04C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare the leather proof that Tavin has stolen the hound.",
          "failTitle": "A Boy Condemned in His Absence",
          "failText": "Bram leaves to warn his kin that you have chosen Sella's accusation. The agreed search collapses, and the two groups begin moving through the wood with different purposes.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ask Sella to explain the lead's fittings while Bram watches the leather in place.",
          "nextNodeId": "AA04B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA03C",
      "turn": 3,
      "title": "The Fresh Cuts",
      "narrative": [
        "Reading the path notches takes you along Tavin's work rather than a guess at the hound's route. Pale cuts stand out against wet bark. Near a thorn thicket, the orderly trimming stops and several thin branches have been pushed aside by hand.",
        "Bram knows his son's habit of cutting low so travelers will not catch a sleeve. These higher breaks were made for something within the thorns. Beneath them, Sella sees a leather strip drawn tight around a fork.",
        "The leather is partly hidden, and forcing a hand through would bend the very branches that hold it. Across the opening, the path remains uncleared. Whatever brought Tavin here interrupted his morning's work."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut out the whole thorn bush to recover the lead at once.",
          "failTitle": "Evidence Under the Axe",
          "failText": "The bush falls across the small tracks and breaks the snag apart. Bram and Sella each claim the ruined arrangement supported their account, and neither will accept your uncertain finding.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Use a forked twig to raise the caught leather without shifting the thorn branches.",
          "nextNodeId": "AA04C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Crouch beneath the snag and inspect the cut end from the direction Tavin approached.",
          "nextNodeId": "AA04A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA04A",
      "turn": 4,
      "title": "The Cut Facing Outward",
      "narrative": [
        "Your inspection leaves the leather where it caught. The cut faces away from the narrow gap through which Rill passed, and the remaining length is pulled hard against the thorn fork. A blade would have freed the dog by cutting there.",
        "Sella explains that the hound sometimes trails a light lead while working a difficult scent. His collar has a separate buckle. Whoever cut this length did not need to remove or even open it.",
        "Bram points to Tavin's heel mark on firm ground outside the bush. For the first time, he and Sella consider the same possibility: the boy stopped to help. You ease the leather free and give it to Sella with the cut end protected before following the tracks toward a shallow brook."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Read the gravel at the brook for the boy's heel and the hound's paired crossings.",
          "nextNodeId": "AA05A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Search Bram's pockets for the knife that must have cut the lead.",
          "failTitle": "The Wrong Man Searched",
          "failText": "You turn a useful finding into a public insult. Bram calls his neighbors forward, and the search becomes a confrontation before you can follow the fresh trail.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take Bram's higher bank path and look for the pair where it rejoins the water.",
          "nextNodeId": "AA05B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA04B",
      "turn": 4,
      "title": "A Collar Is Not a Lead",
      "narrative": [
        "Sella's explanation of the fittings puts the hanging leather in a different light. Rill's collar would still be on him after this trailing length was cut. Bram makes her show the difference on the spare lead before he accepts it.",
        "You both find the severed end caught on the far side of a thorn fork. The leather had been held taut. Tavin's bootmarks stop beside it, then resume in the direction the dog took. Sella lifts the lead free while you protect its cut edge.",
        "The boy may have meant to return Rill, though tracks alone cannot tell you that. Bram says the path meets a brook below the alder bank, and that the nearest shallow crossing has become awkward for horses."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lead Thorne to the broader ford while the others keep the narrow crossing in view.",
          "nextNodeId": "AA05C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Follow Bram along the firm upper bank and inspect the place where the paths meet.",
          "nextNodeId": "AA05B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Have Sella sound the recall continuously until the dog abandons whoever holds him.",
          "failTitle": "A Signal Worn Empty",
          "failText": "The repeated whistle carries your position to every anxious searcher and leaves no quiet in which to hear a reply. People converge on the thicket, trampling the trail while each side blames the other for the silence.",
          "death": false
        }
      ]
    },
    {
      "id": "AA04C",
      "turn": 4,
      "title": "A Snag Lifted into View",
      "narrative": [
        "The forked stick raises the leather enough for both neighbors to see its bend around the thorn. No collar hangs there, only the cut end of a trailing lead. Rill had pulled one way while the snag held the other.",
        "Bram finds where Tavin braced his repaired heel to reach into the bush. Sella says quietly that a boy who wanted to steal the dog could have taken the entire lead. With both neighbors satisfied, you free the leather carefully and return it to her.",
        "The path descends to a brook whose narrow crossing is churned with deer prints. Thorne could negotiate it without the packs, but there is a broad gravel ford a short distance downstream."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Drive Thorne over the narrow crossing without checking its undercut edge.",
          "failTitle": "The Bank Gives Way",
          "failText": "The packed bank crumbles beneath the horse. You spend the remaining daylight getting Thorne and the scattered supplies out of the brook while the missing pair remain beyond reach.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Leave Thorne with Sella briefly and study the small gravel crossing on foot.",
          "nextNodeId": "AA05A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Keep the rescue supplies on Thorne and use the broad ford to reach the opposite bank.",
          "nextNodeId": "AA05C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA05A",
      "turn": 5,
      "title": "Two Trails Through Water",
      "narrative": [
        "Reading the gravel shows where Tavin stepped from one dry stone to the next. Rill crossed beside him, leaving wet paw marks on a flat slab. On the far bank, both trails turn east instead of following the deer farther upstream.",
        "You bring Thorne across by the sounder ford and rejoin Sella and Bram. A dog fleeing a captor would not explain these easy, neighboring tracks. Sella pockets the cut lead at your request, taking care to keep its end intact.",
        "A horn sounds behind you, answered by a woodcutter's call from the ridge. The men left waiting have begun to follow. Through the trees you can see raised spearheads on one path and long-handled tools on the other."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send one messenger from each party back together with the evidence that no theft is yet shown.",
          "nextNodeId": "AA06A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Step onto the ridge and halt the advancing wardens before they meet the woodcutters.",
          "nextNodeId": "AA06B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell Bram to hurry ahead while the wardens clear the woodcutters from your route.",
          "failTitle": "The Search Divided",
          "failText": "Bram hears a threat to his neighbors and turns back to them. The two groups meet across the ridge with no one left whom both will trust, and the search is swallowed by the dispute.",
          "death": false
        }
      ]
    },
    {
      "id": "AA05B",
      "turn": 5,
      "title": "Above the Alder Bank",
      "narrative": [
        "Bram's higher path brings you to a firm shelf above the brook. From there you can see the boy's repaired heel on the eastern landing and Rill's prints close beside it. You call Sella over before either trail is disturbed.",
        "Thorne reaches you by the broad ford, carrying the rope and blanket dry. The hound and Tavin seem to have left the water together. You cannot yet say why neither returned, but you can say there was no visible struggle at the crossing.",
        "Voices climb the western ridge. Sella recognizes her wardens calling for her; Bram hears his kin answering with growing anger. A narrow path ahead will put the parties face to face unless someone stops them."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Stand at the boundary stone with both neighbors and call for a halt under the duke's peace.",
          "nextNodeId": "AA06C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let the parties meet while you follow the freshest footprints alone.",
          "failTitle": "Unwatched Anger",
          "failText": "The first shove at the narrow path becomes a fight. Injured men call you back before you reach the hollow, and the boy and hound lose the searchers who might have brought them home.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Go openly to the ridge with Sella and require her wardens to hold their spears low.",
          "nextNodeId": "AA06B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA05C",
      "turn": 5,
      "title": "The Broad Ford",
      "narrative": [
        "Leading Thorne through the broad ford preserves both the supplies and the steep banks above it. On the eastern side, you walk back to where the narrow footpath meets the water and find Tavin's repaired heel beside Rill's tracks.",
        "Sella and Bram examine the prints with you. They show a boy and a dog moving in the same direction at an ordinary pace. Bram lets out a breath he seems to have held since the oak, though the empty wood beyond the crossing still gives him reason to fear.",
        "Then a hunting horn sounds from the ridge. Searchers from both sides have followed despite the agreement, each group believing it is needed to protect its own. Their paths converge just behind the boundary stone."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Hide the cut lead so neither party can use it to renew the accusation.",
          "failTitle": "A Hidden Finding",
          "failText": "Sella's men demand to know what you concealed, and Bram's kin assume you are protecting the warden. Suspicion transfers to the search itself, leaving you unable to secure either side's help.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Bring Sella and Bram beside you at the stone and make their agreement visible to both groups.",
          "nextNodeId": "AA06C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have each side send a messenger together to explain the paired tracks and request a halt.",
          "nextNodeId": "AA06A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA06A",
      "turn": 6,
      "title": "A Message Carried Together",
      "narrative": [
        "Sending the two messengers together forces each group to hear the same account of the prints. You watch them reach the ridge without interference. The raised tools lower, and the wardens stop where the path is still wide.",
        "Sella and Bram agree that the search will continue with you while their people return to the boundary oak. Nobody gives up a claim to the coppice. For now, they merely agree not to turn uncertainty into an injury.",
        "With the ridge quiet, a short, rough bark reaches you from the east. Rill answers Sella's name with another sound but does not come. Beyond a belt of hazel, the ground drops where an old deer enclosure once stood."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Follow the sound along the upper lip, checking the ground before each step.",
          "nextNodeId": "AA07A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Have the wardens beat the hazel to drive Rill out toward the open ride.",
          "failTitle": "Driven over the Edge",
          "failText": "The beating line enters brush laid over rotten enclosure timbers. Men fall through the concealed hollow, and a search for two becomes a rescue you no longer have enough hands to manage.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Approach by the shallow gully while Sella calls only at measured intervals.",
          "nextNodeId": "AA07B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA06B",
      "turn": 6,
      "title": "Spears Lowered on the Ridge",
      "narrative": [
        "Your arrival beside Sella stops the wardens before their path narrows. She repeats her promise in front of them and orders them back to the boundary oak. Bram steps into view and gives the same instruction to his own people.",
        "The meeting is strained enough that you stay until both groups begin withdrawing. Sella keeps her whistle in her hand; Bram keeps looking east. Neither objects when you remind them that the missing have already paid for this delay.",
        "In the quiet that follows, a faint bark comes from below the hazel belt. Rill's voice sounds rough and close to the ground. There is an old deer enclosure ahead, abandoned so long that only a few leaning posts show above the leaves."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Circle beneath the beeches to look into the enclosure from firm roots.",
          "nextNodeId": "AA07C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Take the shallow gully toward Rill, pausing after each call to fix his position.",
          "nextNodeId": "AA07B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Draw your sword and order the woodcutters to leave first as a show of authority.",
          "failTitle": "A Peace Enforced Unequally",
          "failText": "Bram refuses to abandon his people under drawn steel. The ridge closes around the argument, and Sella can no longer hold her wardens while you seek the distant bark.",
          "death": false
        }
      ]
    },
    {
      "id": "AA06C",
      "turn": 6,
      "title": "The Stone Between Them",
      "narrative": [
        "Standing with both neighbors at the boundary stone gives the approaching searchers something clear to see. Neither Sella nor Bram is a prisoner, and neither is calling for help against the other. You make them say as much aloud.",
        "Their people agree to wait at the common oak. Spearheads and billhooks disappear behind the ridge, leaving only the sound of rain on leaves. Sella looks embarrassed by how nearly a missing dog became a cause for bloodshed.",
        "A bark interrupts her apology. It comes from the abandoned deer enclosure east of the path, followed by a long silence. The direct approach crosses a brown mat of branches; the beeches along its flank grow on firmer ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ride directly toward the bark to reach Rill before the searchers return.",
          "failTitle": "A Roof Made of Branches",
          "failText": "The brown mat covers a rotten span over the old deer pit. Thorne breaks through its edge, and you must turn from Rill to free your own frightened companion.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Stay on the upper lip and probe the hidden edge with a stout branch.",
          "nextNodeId": "AA07A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Work around the beech roots until you can see beneath the enclosure's fallen brush.",
          "nextNodeId": "AA07C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA07A",
      "turn": 7,
      "title": "Looking Down from the Lip",
      "narrative": [
        "Probing the upper lip stops you just before the soil gives under the branch. Below lies a long disused deer pit, its near edge hidden by fallen brush. Rill stands on a narrow shelf beside a boy in a torn work coat.",
        "Tavin lifts a hand when Bram calls his name, then folds it across his knee. He says he can hear you and begs his father not to jump. The shelf is several times a man's height below the rim, with a deeper pocket beyond it.",
        "Rill's collar remains buckled. The dog looks up at Sella, whines, and turns back to Tavin instead of attempting the slippery climb. You leave Thorne on the firm ride while the three of you kneel well clear of the break."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Speak steadily to Tavin and ask what he can move without making him stand.",
          "nextNodeId": "AA08A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Have Sella give Rill one familiar command and observe why he stays beside the boy.",
          "nextNodeId": "AA08B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Drop into the pit immediately so Tavin will not feel abandoned.",
          "failTitle": "A Second Fall",
          "failText": "The hidden side has no sound foothold. You land beyond the shelf in the deeper pocket, and the others can reach neither you nor Tavin before the cold night closes in.",
          "death": true
        }
      ]
    },
    {
      "id": "AA07B",
      "turn": 7,
      "title": "A Voice Under the Bank",
      "narrative": [
        "Following the shallow gully brings the bark into focus before you can see its source. Through an opening beneath tangled roots, Tavin calls that his knee will not hold him. Bram tries to squeeze closer, but you catch his sleeve as loose earth falls away.",
        "You move to a sound part of the rim and see the boy on a shelf within the old deer pit. Rill presses close beside him, still wearing his collar. The gully ends in an overhang; it offers a view, not a safe way down.",
        "Sella leaves Thorne on the broad ride and comes back with the packed rope. Rill lifts his head at her voice but refuses to leave Tavin, who is trembling and trying hard to apologize."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lower a little water and a dry cloth within Tavin's reach while you speak to him.",
          "nextNodeId": "AA08C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Force your way under the overhang to pull Tavin out through the gully.",
          "failTitle": "The Bank Folds In",
          "failText": "Your weight breaks the unsupported roof of the opening. Earth seals the easy view into the pit, and the rescue loses its safest working edge.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Let Sella test Rill's familiar stay and recall signals from the sound rim.",
          "nextNodeId": "AA08B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA07C",
      "turn": 7,
      "title": "Between the Beech Roots",
      "narrative": [
        "Circling beneath the beeches gives you a view that the brush above concealed. Tavin is sitting on a shelf in the old deer pit, with one knee held awkwardly in front of him. Rill stands between him and a deeper drop.",
        "Bram calls down, and the boy answers before his father can leave the roots. He is awake and frightened. He warns you that the branches over the rim broke when he stepped across, and that the dog came down after him.",
        "You bring Sella to the same vantage and settle Thorne on the firm ride behind it. The brindled hound still wears the collar that people were ready to fight over. He hears his mistress but will not abandon the injured boy."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Urge Tavin to scramble toward you while Bram reaches down from the roots.",
          "failTitle": "The Reach Too Far",
          "failText": "Tavin puts weight on his injured knee and slips from his secure seat. The short climb you urged becomes a fall into the deeper part of the pit.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lower water and a dry cloth, keeping the small bundle away from the crumbling side.",
          "nextNodeId": "AA08C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Tavin where he hurts and how the fall happened before choosing a descent.",
          "nextNodeId": "AA08A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA08A",
      "turn": 8,
      "title": "What Tavin Can Tell You",
      "narrative": [
        "Speaking to Tavin without asking him to move steadies his breathing. His knee hurts when he tries to bend it, but he can feel his foot and move his toes. You tell him to keep the leg where it is while you arrange a safe descent.",
        "He freed Rill's lead from the thorns, then tried to take the dog home by the eastern ride. The brush over the pit looked like an ordinary stretch of path. Rill climbed down after the fall and has stayed beside him ever since.",
        "Bram closes his eyes at the account. Sella says Rill was taught to wait beside a fallen person until help came. No theft brought them here, only a rotten crossing in ground that both households claimed and neither had been tending."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Measure the west shelf from safe ground and test where a rescuer could stand.",
          "nextNodeId": "AA09A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell Tavin to test his knee by standing so you can judge whether a rescue is needed.",
          "failTitle": "A Painful Trial",
          "failText": "His knee gives way before he can catch the roots. You have moved him from a sheltered seat onto loose ground, and the injury becomes too serious for the search party to manage.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect the fallen beech above the rim as a possible rope anchor.",
          "nextNodeId": "AA09B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA08B",
      "turn": 8,
      "title": "The Hound's Old Lesson",
      "narrative": [
        "Rill answers Sella's familiar signals with a lifted head and a low whine. At the recall he takes one step, looks back at Tavin, and lies down again. Sella recognizes the lesson she taught him: stay with a fallen person until someone reaches them.",
        "Tavin explains between shivers that he cut the caught lead and meant to bring Rill home by the eastern ride. He stepped onto brush covering rotten timbers and fell. The hound came down after him, then could not climb the steep wet sides.",
        "Bram hears his son ask whether Sella is angry about the lead. She answers that leather can be replaced. The boy's knee cannot bear his weight, and the shelf will grow colder as the light leaves the pit."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Search the side of the enclosure for the old keeper's stone steps.",
          "nextNodeId": "AA09C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Check the fallen beech's sound wood and roots before choosing a rope anchor.",
          "nextNodeId": "AA09B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Keep whistling until Rill obeys and shows Tavin how to climb out.",
          "failTitle": "Obedience at the Edge",
          "failText": "Pressed by the repeated command, the hound scrambles onto a loose face above the boy. The slide that follows drives Tavin from his sheltered seat and leaves the rescue worse than you found it.",
          "death": false
        }
      ]
    },
    {
      "id": "AA08C",
      "turn": 8,
      "title": "A Cup on a Cord",
      "narrative": [
        "The small bundle reaches Tavin without striking the loose side. He drinks slowly and tucks the dry cloth against his chest. Rill sniffs it, recognizes Sella's scent, and settles close enough to share the little warmth.",
        "While Bram holds the cord, the boy tells you how he cut the hound free of the thorn and tried to return him by the eastern ride. The brush-covered crossing broke beneath Tavin; Rill followed him down and stayed. His knee now hurts too much to support him.",
        "Sella explains the hound's habit of waiting with a fallen person. Nobody stole him, and nobody planned this hidden gap. That leaves the more immediate question of how to reach the narrow shelf without breaking its edge."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the water cord down as a climbing rope and have Tavin pull himself up.",
          "failTitle": "A Cord Asked Too Much",
          "failText": "The thin cord parts as the boy tries to rise. He falls back awkwardly, scattering the small supplies and losing the stable position that had protected his injured leg.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Sound the west shelf with a lowered branch and judge its width before committing a rescuer.",
          "nextNodeId": "AA09A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Look for the keeper's old steps along the pit's least overgrown side.",
          "nextNodeId": "AA09C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA09A",
      "turn": 9,
      "title": "The Width of a Footing",
      "narrative": [
        "Measuring the west shelf shows a ledge broad enough for one careful rescuer beside Tavin. The ground above it is less trustworthy: roots hold a lip of earth over open air. You mark a standing line well behind it for Bram and Sella.",
        "Your probing also exposes the first of the keeper's old stone steps along the south side. Several survive, but a gap separates them from the boy. A fallen beech lies across firm ground above the other side of the rim.",
        "Thorne carries the long rope to the standing line and stays with Bram while you lay it out. There are several possible approaches, but none justifies asking an injured boy to attempt them alone."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Secure the rope around sound wood and lower yourself directly onto the measured west shelf.",
          "nextNodeId": "AA10A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Clear the old steps and use a lashed handline to reach the gap beside Tavin.",
          "nextNodeId": "AA10B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tie the rope to a leaning enclosure post because it stands nearest the boy.",
          "failTitle": "An Anchor Already Rotten",
          "failText": "The post snaps at ground level under your weight. You fall past the shelf into the deeper hollow, where Sella and Bram cannot reach you in time.",
          "death": true
        }
      ]
    },
    {
      "id": "AA09B",
      "turn": 9,
      "title": "The Beech That Still Holds",
      "narrative": [
        "Testing the fallen beech finds sound wood behind its broken crown and roots still seated in firm ground. It can carry a rope if the line runs clear of the shattered branches. You move Sella and Bram behind the root mass before they pull on anything.",
        "From that position, you can see old keeper's steps on the south side and a narrow west shelf close to Tavin. The boy watches your movements with tiring attention. Rill rises whenever a pebble falls near him, then lies back down.",
        "You lay out the rope with its whole length visible, checking the worn places by hand. Bram brings Thorne up with the blanket, spare lead, and woodcutting cord. A rescue needs these ordinary things arranged before anyone descends."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Descend below the beech roots with Sella tending the anchored rope from firm ground.",
          "nextNodeId": "AA10C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Use Thorne to drag the fallen tree closer to the rim for an easier reach.",
          "failTitle": "The Root Plate Moves",
          "failText": "The heavy trunk shifts the soil that was holding the rim together. Earth falls across the shelf, and you must stop the descent as the boy and hound retreat into the pit's colder recess.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Fit a secure handline beside the keeper's steps and bridge the short gap with sound planks.",
          "nextNodeId": "AA10B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA09C",
      "turn": 9,
      "title": "The Keeper's Steps",
      "narrative": [
        "Searching the enclosure's side uncovers worn stone steps beneath leaf mold. The upper ones are firm; near the bottom, two have slipped away. You can see the gap before anyone puts a foot into it.",
        "Beyond the steps, a west shelf reaches Tavin. Above the opposite rim, a fallen beech rests with its roots in solid earth. You test that anchor and the ledge, then make Bram and Sella stand back from the loose edge while you decide.",
        "Thorne brings the packed rope and blanket along the clear approach. Bram rubs dirt from a step with his palm. He remembers being warned away from this enclosure as a child, though no fence has warned Tavin's generation."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Send Bram down the broken stair first because he remembers using it as a child.",
          "failTitle": "Memory Over Missing Stone",
          "failText": "Bram steps where a tread used to be. The remaining edge breaks beneath him, leaving Sella alone above a pit that now holds both father and son.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Anchor your descent behind the beech and use the exposed roots to keep clear of loose soil.",
          "nextNodeId": "AA10C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lower yourself on a secured rope onto the west shelf rather than cross the missing steps.",
          "nextNodeId": "AA10A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA10A",
      "turn": 10,
      "title": "Feet on the West Shelf",
      "narrative": [
        "Lowering yourself onto the measured shelf brings you within an arm's length of Tavin without disturbing the broken stair. Sella tends the anchored rope above while Bram keeps its loose coils clear. You wait until both feet are settled before approaching.",
        "Rill places himself between you and the boy, frightened by the rope and the narrow space. You let him smell your hand and speak his name. Tavin strokes his neck until he steps aside.",
        "The boy is cold and needs his knee supported before he can be moved. First, Rill must leave the shelf so you can work without the dog slipping underfoot. Above you, Sella has a spare lead, a blanket, and Bram's stout gathering basket."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Make a broad sling for Rill and let Sella steady him while Bram helps lift.",
          "nextNodeId": "AA11A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Loop the rope through Rill's collar and haul him out quickly.",
          "failTitle": "A Collar Cannot Carry Him",
          "failText": "The frightened hound struggles against the tightening collar and slips against Tavin. You must abandon the lift after both are hurt, losing the chance to move them safely before dark.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Clear a rough stair along the side so Sella can guide Rill up on the spare lead.",
          "nextNodeId": "AA11B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA10B",
      "turn": 10,
      "title": "Across the Missing Treads",
      "narrative": [
        "The secured handline lets you descend the keeper's steps and cross the short gap on sound planks from the old fence. Bram holds the upper line clear while Sella watches your feet. You reach Tavin without asking him to move toward you.",
        "Rill gives a warning growl until the boy says your name. Then he allows you onto the shelf, though he stays pressed to Tavin's good side. You spread a little of the dry blanket over the boy's shoulders.",
        "You need room to support the injured knee. Sella can guide Rill from above if you make a better way for him; Bram has also brought his stout gathering basket from Thorne's pack. None of the loose old timbers should be trusted under a struggling animal."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Lower Bram's gathering basket and let Sella's quiet commands coax Rill into it.",
          "nextNodeId": "AA11C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Pack firm earth between the lowest surviving steps and guide Rill up on Sella's lead.",
          "nextNodeId": "AA11B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Push Rill toward the upper stair while Bram pulls the lead hard.",
          "failTitle": "Panic on the Stair",
          "failText": "Caught between your hands and the pulling lead, Rill lashes out in fear and scrambles across Tavin's injured leg. The small working space becomes too dangerous to attempt the boy's lift.",
          "death": false
        }
      ]
    },
    {
      "id": "AA10C",
      "turn": 10,
      "title": "Below the Beech Roots",
      "narrative": [
        "Descending beneath the beech roots keeps your boots against firm earth rather than the broken face. Sella tends the rope behind its anchor while Bram lowers the blanket. You step onto the shelf and let the line remain secured above.",
        "Tavin apologizes for the trouble before you can ask about his knee. Rill stands in front of him, shivering but ready to resist another stranger. You crouch sideways, speak gently, and wait for the boy's hand on the hound's neck.",
        "The shelf is too crowded to prepare Tavin's support with Rill circling at your feet. Above, Bram offers his broad gathering basket. Sella has the spare lead ready, and the keeper's steps provide another possible route if their lower gaps are packed."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove Rill's collar and let him find his own way out through the loose roots.",
          "failTitle": "A Hound Lost Again",
          "failText": "Rill bolts into the deeper hollow when the collar comes free. Tavin lunges after him, and the stable arrangement you needed for the rescue disappears in a rush of falling soil.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Wrap the blanket into a chest-and-body sling so the hound can be raised without loading his collar.",
          "nextNodeId": "AA11A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have Sella lower the basket, then settle Rill inside with her voice and Tavin's reassurance.",
          "nextNodeId": "AA11C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA11A",
      "turn": 11,
      "title": "The Hound Above",
      "narrative": [
        "The broad sling takes Rill's weight beneath his chest and body while you keep him facing Sella. Bram helps raise him a little at a time. Once the hound's paws reach firm ground, Sella clips on the spare lead and holds him well back from the rim.",
        "The shelf is suddenly quiet. Tavin watches until he hears Rill shake himself above, then allows you to look at his knee. There is swelling, and moving the joint hurts; you have no reason to make him prove it can carry him.",
        "Bram lowers the blanket again with straight pieces of hazel, cord, and two sound fence boards. You can now prepare a support for Tavin without a frightened dog between your hands. The light inside the pit has begun to turn blue."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Pad Tavin's leg where it rests and secure him on a small board litter.",
          "nextNodeId": "AA12A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Shape two smooth hazel supports and bind them over folded cloth without forcing the knee straight.",
          "nextNodeId": "AA12B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull the injured leg straight so Tavin can climb the steps on his own.",
          "failTitle": "A Rescue Turned Rough",
          "failText": "The forced movement leaves Tavin faint with pain and unable to help you at all. You cannot safely lift him with the hastily improvised support before the pit grows dark.",
          "death": false
        }
      ]
    },
    {
      "id": "AA11B",
      "turn": 11,
      "title": "Paws on the Old Stair",
      "narrative": [
        "Packing the lower gaps makes a narrow but usable stair for Rill. You guide his hindquarters over the first rise while Sella keeps the lead slack enough for him to find his feet. He reaches her with his tail low and stays behind the sound rim.",
        "Tavin asks whether the hound will be punished for coming down. Sella answers from above that he did the work he understood. The boy finally lets you inspect his knee, which is swollen and painful but best left in the position he has chosen.",
        "Bram lowers folded cloth, straight hazel, and two boards from the fence's sound upper rails. With Rill clear of the shelf, there is room to prepare Tavin for a supported lift. Nobody needs him to climb."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Fit a broad seated sling beneath Tavin and give his injured leg a separate padded support.",
          "nextNodeId": "AA12C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Bind the knee tightly enough to stop all swelling before moving him.",
          "failTitle": "A Binding Too Tight",
          "failText": "Tavin's foot grows numb under the tight wraps. You must undo the work and spend the remaining light addressing harm caused by the support that should have protected him.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Make padded hazel supports to keep Tavin's knee from shifting during the ascent.",
          "nextNodeId": "AA12B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA11C",
      "turn": 11,
      "title": "A Basket Returned Full",
      "narrative": [
        "Rill hesitates at the gathering basket until Tavin lays a hand on its rim and Sella speaks from above. You support the hound's body as he settles inside, then steady the basket against turning while Bram and Sella raise it together.",
        "Once the dog is safe on the spare lead, the basket comes down carrying cloth, hazel rods, and two sound boards. Tavin's eyes follow every movement. He has been trying not to shiver because he believes shivering will make the work harder.",
        "You put the dry blanket around him and examine the knee without forcing it to bend. He needs to be kept warm, supported, and spared the climb. The open shelf now gives you enough space to arrange that."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Give Tavin your belt and ask him to hang from it while the basket is pulled up.",
          "failTitle": "A Grip That Cannot Last",
          "failText": "Cold fingers lose their hold before the basket reaches the rim. Tavin drops back onto the shelf, and the second fall leaves him beyond the party's ability to move safely.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Settle Tavin into a broad seated sling with a separate rest beneath the injured leg.",
          "nextNodeId": "AA12C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lay padded boards beside him and move him onto them as a small litter.",
          "nextNodeId": "AA12A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA12A",
      "turn": 12,
      "title": "The Padded Boards",
      "narrative": [
        "Padding the boards lets you move Tavin with his leg supported where it hurts least. You bind the little litter so it will carry him rather than squeeze him. Bram leans far enough to see, and you send him back behind the standing line.",
        "Sella brings the spare rope ends into order above. Rill lies at her heels under the beech, watching the opening. You ask Tavin to keep his hands inside the litter and tell him exactly when each small movement will come.",
        "The direct lift passes a rough lip that could catch the boards. The keeper's steps offer a longer route if the litter is guided along a shallow ramp. Both need steady hands, and neither needs anyone pulling without a clear signal."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Cover the rough lip, attach balanced lifting lines, and raise the litter on agreed commands.",
          "nextNodeId": "AA13A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Haul the litter by its front cord alone to keep the operation simple.",
          "failTitle": "A Litter Tips Upright",
          "failText": "The uneven pull tips Tavin toward the open side. You catch the frame but wrench the injured knee, leaving the boy too distressed for another hurried attempt.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Use the sound fence rails as a narrow ramp beside the steps and guide the supported litter up it.",
          "nextNodeId": "AA13B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA12B",
      "turn": 12,
      "title": "Hazel around the Knee",
      "narrative": [
        "The padded hazel holds Tavin's leg against accidental movement while leaving room for swelling. You ask about feeling in his foot and loosen a troublesome wrap before going farther. His shoulders ease when he learns the support need not hurt to be useful.",
        "From above, Bram lowers broad cloth and the sound rails needed to carry the supported leg with the boy. Sella checks the anchored rope and repeats the stopping signal back to you. Rill waits on his lead beyond the beech roots.",
        "The keeper's steps can take a guided frame if their broken gap is bridged. The root face offers a straighter seated lift, provided a separate sling carries Tavin's leg. You explain both so he will know what to expect."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Seat Tavin in the broad sling and lift beside the root face with his leg carried separately.",
          "nextNodeId": "AA13C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Build a supported frame and guide it over the bridged stair gap on a secured handline.",
          "nextNodeId": "AA13B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Have Tavin hop up the steps while you hold his coat from behind.",
          "failTitle": "One Foot on Wet Stone",
          "failText": "The uninjured foot slips on leaf mold. Your grip on the coat cannot protect the supported knee from the fall, and the way out becomes another cause of injury.",
          "death": false
        }
      ]
    },
    {
      "id": "AA12C",
      "turn": 12,
      "title": "A Seat That Does Not Swing",
      "narrative": [
        "Fitting the broad sling beneath Tavin keeps his weight off the injured leg. You add a separate padded support and test the arrangement with only a finger's breadth of lift. The boy tells you where it pulls, and you adjust it before calling upward.",
        "Bram and Sella repeat the same lifting words back to you, slower this time. Above their heads, rain has begun to ease. Rill waits on his lead near Thorne instead of trying to return to the boy.",
        "The root face is clear enough for a seated ascent if you keep the lower line steady. There is also room to transfer Tavin onto padded boards for a level lift. His fear is no longer of being left behind, but of the first moment away from solid ground."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Use Thorne to pull the lifting rope in one uninterrupted walk.",
          "failTitle": "Strength Without a Pause",
          "failText": "The sling catches beneath a root while the horse continues forward. The steady force leaves no chance to ease the snag, and Tavin is hurt before the frightened call to stop reaches Thorne.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Transfer him carefully onto a padded litter and raise it level over the protected rim.",
          "nextNodeId": "AA13A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lift Tavin beside the roots with one line steadying the seat and another supporting his leg.",
          "nextNodeId": "AA13C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA13A",
      "turn": 13,
      "title": "A Boy on Firm Ground",
      "narrative": [
        "Protecting the lip and balancing the lines keeps Tavin's litter level as it leaves the shelf. You guide it from below until Sella and Bram can draw it onto firm ground. Their stopping words remain clear even when Bram's voice breaks.",
        "They settle the boy under the beech with his knee still supported. Rill noses his hand, then lies beside him while Sella checks that the wraps have not tightened. Tavin asks whether you are coming up too.",
        "You are still on the shelf. The anchored descent rope hangs within reach, the keeper's steps remain visible to the south, and the beech roots offer a third way to place your feet. A few grains of earth sift from the disturbed rim."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Check the rope against the rim, then climb with Sella tending it from the sound anchor.",
          "nextNodeId": "AA14A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Return by the keeper's steps, testing each tread while Bram keeps a handline taut.",
          "nextNodeId": "AA14B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Climb the loose face directly beneath Tavin to shorten the return.",
          "failTitle": "The Last Unchecked Face",
          "failText": "The soil that held only because nobody touched it gives way under your hands. You fall into the deeper pit after bringing everyone else to safety.",
          "death": true
        }
      ]
    },
    {
      "id": "AA13B",
      "turn": 13,
      "title": "Over the Bridged Gap",
      "narrative": [
        "Guiding the supported frame up the rail ramp takes longer than a straight lift, but Tavin never has to find a foothold. You keep its lower end from slewing while Bram draws it past the missing treads and Sella tends the safety line.",
        "At the top, they move him to folded cloaks beneath the beech. His knee remains supported. Rill greets him with a single cautious lick and settles beside him, as though the morning's long duty is finally finished.",
        "You wait below until the frame is well clear of the rim. The steps can still carry you if each is checked; the exposed roots offer another supported ascent. Everyone is tired enough that familiar ground could become dangerous through haste."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask Sella to tend the anchor while you work up the firm earth beneath the beech roots.",
          "nextNodeId": "AA14C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Pull the rail ramp down for salvage before leaving the bottom.",
          "failTitle": "The Route Taken Apart",
          "failText": "The moving rails knock the remaining loose tread free and cut across your handline. You are stranded below the break without a usable return before nightfall.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ascend the keeper's stair on the handline, testing the planks over the missing treads.",
          "nextNodeId": "AA14B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA13C",
      "turn": 13,
      "title": "Along the Root Face",
      "narrative": [
        "Steadying Tavin's seat below the roots prevents the turn he feared. The separate leg support stays level while Bram and Sella lift on your commands. When they draw him onto the bank, you hear him laughing weakly at something Rill has done.",
        "They set him on cloaks beneath the beech, with his knee held as you left it. Sella checks the foot and the bindings while Bram keeps a hand on his son's shoulder. No one disputes whose ground the boy is lying on.",
        "You remain below, keeping clear of a small run of loose soil near the rim. The roots and the anchored rope are both available for your own return, but the wood must be tested again after the lift."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Untie the main anchor now that Tavin is out and climb by the loose rope ends.",
          "failTitle": "The Anchor Released Early",
          "failText": "The unfastened rope slides over the edge as soon as you load it. You fall away from the root face and do not reach the bank again.",
          "death": true
        },
        {
          "id": "good",
          "type": "good",
          "label": "Climb under the beech on the secured line, checking each root before putting weight on it.",
          "nextNodeId": "AA14C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Inspect the hanging rope for damage, then ascend with Sella taking in the slack.",
          "nextNodeId": "AA14A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA14A",
      "turn": 14,
      "title": "The Rope Brought Home",
      "narrative": [
        "Checking the line reveals a rubbed patch where it touched the lip. You shift it onto the protective cloth before climbing, and Sella takes in the slack from firm ground. Bram catches your forearm only after you have reached a sound footing.",
        "Tavin lies warm beneath the beech, his knee supported and his hand resting on Rill. You recover the loose equipment and stretch a visible cord between the safe posts, keeping everyone away from the hidden edge. The pit can wait for proper fencing; the boy needs shelter.",
        "Thorne stands ready on the broad ride. You could seat Tavin with his injured leg supported and lead him at a walk, or carry him on a hazel hurdle along the level coppice path. Bram wants to know which will jar the knee less."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Support Tavin securely in Thorne's saddle and lead the horse along the broad ride.",
          "nextNodeId": "AA15A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Bram hurry home carrying Tavin across his shoulders through the nearest brush.",
          "failTitle": "A Burden Out of Balance",
          "failText": "Bram's boots catch in the hidden roots. The fall undoes the careful rescue, and you must stop the journey to deal with an injury made worse by haste.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Make a padded hazel hurdle and carry Tavin by the level coppice path.",
          "nextNodeId": "AA15B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA14B",
      "turn": 14,
      "title": "The Stair behind You",
      "narrative": [
        "Testing each tread brings you up the keeper's stair without shifting its fragile gap. Bram maintains the handline until both your feet are above the broken ground. Sella has Tavin resting on cloaks, and Rill lies against his good leg.",
        "You clear loose gear from the approach and string a warning cord across the unsafe rim. The old crossing must remain closed. Nobody argues for reopening it while the boy who fell through it watches from beneath the beech.",
        "The level coppice path will take a padded hazel hurdle back to the boundary oak. There is also a longer sheltered way if Tavin needs warmth and rest before moving. Thorne can carry the equipment while the adults share the boy's weight."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Warm Tavin beneath the beech, then carry him on a supported hurdle by the sheltered way.",
          "nextNodeId": "AA15C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Lash a broad hazel hurdle and carry Tavin steadily along the level path.",
          "nextNodeId": "AA15B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Put Tavin on his feet to save the time needed for a carrying frame.",
          "failTitle": "The Knee Asked Again",
          "failText": "The first uneven step leaves Tavin unable to continue. The party must improvise a worse carrier in fading light, and the careful rescue ends in another painful collapse.",
          "death": false
        }
      ]
    },
    {
      "id": "AA14C",
      "turn": 14,
      "title": "Past the Beech Roots",
      "narrative": [
        "Working upward on the secured line lets you test each root before trusting it. One thin branch comes away in your hand; the main roots hold. You emerge beside Sella while Bram keeps Tavin warm beyond the standing line.",
        "Rill is resting, still on the spare lead. You gather the tools and rope ends, then mark the hidden rim with a warning cord so no late searcher steps where the boy did. The abandoned pit remains dangerous even with its occupants safe.",
        "Tavin is tiring after the lift. A short rest here would let you warm him before a sheltered carry to the oak. If he is comfortable seated with the knee supported, Thorne and the broad ride offer another way to spare him the walk."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Remove the warning cord to use as packing string and leave the pit unmarked.",
          "failTitle": "Another Searcher at the Rim",
          "failText": "A woodcutter coming to help steps onto the brush-covered edge. His fall turns your departure into a second rescue and brings the waiting parties back to the hollow in anger.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Seat Tavin with his leg supported on Thorne and take the wide ride at a careful walk.",
          "nextNodeId": "AA15A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Give Tavin a quiet rest and warmth, then use a sturdy hurdle along the sheltered route.",
          "nextNodeId": "AA15C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA15A",
      "turn": 15,
      "title": "Out of the Hollow - Thorne's Burden",
      "narrative": [
        "You settle Tavin on Thorne's padded saddle, keeping his injured leg supported while Bram walks beside him. The broad ride allows you to lead the horse at a steady walk. Behind you, Sella keeps Rill close on a shortened lead.",
        "By the boundary oak, wardens and woodcutters wait in separate knots. They fall silent at the sight of the boy, then begin asking questions over one another. One man still carries an arrow against his bow.",
        "You help Tavin down onto folded cloaks. He grips his father's sleeve while Rill noses his muddy hand. Their return has stopped the shouting, but it has not yet settled what people believe happened."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Compare Sella's, Bram's, and Tavin's accounts quietly before addressing the waiting groups.",
          "nextNodeId": "AA16A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Lay out the cut lead and explain the order of events where everyone can hear.",
          "nextNodeId": "AA16B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Let Rill loose to show the woodcutters that the hound means no harm.",
          "failTitle": "A Hound Among Bows",
          "failText": "Rill bounds toward the nearest raised voices. A frightened woodcutter strikes at him, and Sella lunges to protect her hound. The gathering breaks into a fight before your account can be heard.",
          "death": false
        }
      ]
    },
    {
      "id": "AA15B",
      "turn": 15,
      "title": "Out of the Hollow - The Hazel Hurdle",
      "narrative": [
        "The hazel hurdle carries Tavin along the level coppice path with his knee resting on a folded cloak. You and Bram change ends when the branches press against your palms. Thorne follows with the rescued ropes and your equipment.",
        "At the boundary oak, Sella clears a space among the waiting woodcutters and wardens. Rill lies beside the hurdle as soon as you lower it. The hound's wet flank leaves a dark crescent against the boy's blanket.",
        "Someone asks why a woodcutter's knife severed a warden's lead. Bram stiffens before the whole question is spoken. You still have a chance to explain the cut before it becomes an accusation again."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Give Tavin the floor and let him explain why he cut Rill free.",
          "nextNodeId": "AA16C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Hand the severed lead to the loudest woodcutter and ask him to prove there was no theft.",
          "failTitle": "Evidence Becomes a Trophy",
          "failText": "The man waves the lead above his head as proof that Sella cannot control her animals. A warden snatches for it; axes rise between them. Your invitation has made possession of the evidence another grievance.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Show the lead and connect its clean cut to the trapped hound, the boy's fall, and the rescue.",
          "nextNodeId": "AA16B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA15C",
      "turn": 15,
      "title": "Out of the Hollow - The Sheltered Way",
      "narrative": [
        "You give Tavin time to warm beneath a cloak before lifting him onto the sturdy hurdle. The longer sheltered path keeps the wind off his wet clothes, although the detour costs the last bright stretch of afternoon.",
        "Thorne plods behind the bearers, and Sella walks Rill beside Bram without speaking. When the boundary oak comes into view, the waiting men turn toward you. Their weapons have not been put away.",
        "Tavin asks whether anyone thinks he stole the dog. Bram starts to answer, then looks at Sella. She kneels to check Rill's paws while you settle the boy safely beneath the oak."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Promise Tavin that every warden who accused him will be punished before hearing them.",
          "failTitle": "A Promise Against the Peace",
          "failText": "The wardens hear your promise as a judgment already passed. They demand to know whose authority you serve and refuse to stand beside the woodcutters. The boy is safe, but your words end the chance of a shared account.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ask whether Tavin is ready to tell the gathering his account, with pauses whenever he needs them.",
          "nextNodeId": "AA16C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Take the three witnesses aside in turn and compare their accounts before making a public statement.",
          "nextNodeId": "AA16A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA16A",
      "turn": 16,
      "title": "Beneath the Boundary Oak - Separate Voices",
      "narrative": [
        "You hear the accounts separately beside the oak, then bring Sella and Bram together. Neither saw Tavin fall, but their timings fit his account of freeing Rill and crossing the brush. No witness places a thief in the wood.",
        "When you explain this to the gathering, a bow is lowered and men step back from the narrow path. Bram says an abandoned deer pit should never have remained beside a working route. Sella answers that her wardens cannot maintain ground they are driven from.",
        "Rill sleeps against Tavin's blanket while the old dispute returns in quieter voices. The rope around the pit will last a night; keeping another traveler from falling will require people to work together."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Have Sella and Bram each appoint workers to a shared repair party under your supervision.",
          "nextNodeId": "AA17A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Declare the pit proof that Bram's people have neglected land belonging to the wardens.",
          "failTitle": "A Boundary Made of Blame",
          "failText": "Bram demands the grant that supports your judgment. You have none. His people refuse your order and begin pulling their timber from the gathering, turning the rescue into another grievance about stolen ground.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask the woodcutters to consent to wardens guarding the pit while repair terms are discussed.",
          "nextNodeId": "AA17B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA16B",
      "turn": 16,
      "title": "Beneath the Boundary Oak - The Cut Explained",
      "narrative": [
        "You display the severed lead and explain the sequence aloud: thorn held the trailing leather, Tavin cut Rill free, and both went over the hidden edge. You distinguish what the tracks showed from what the boy alone can tell.",
        "Sella confirms that Rill will stay beside someone in distress. Bram acknowledges that his son entered the disputed strip, then asks whether helping an animal makes a child a poacher. Several woodcutters murmur agreement.",
        "The question of theft has fallen away, but hunting rights threaten to replace it. Tavin lies pale beneath his cloak. He needs the adults to make the path safe, not begin another argument over him."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Bring both leaders to inspect the pit together before asking either side to accept repair duties.",
          "nextNodeId": "AA17C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Secure Bram's public consent to a temporary warden guard, expressly without settling ownership.",
          "nextNodeId": "AA17B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Charge Tavin with trespass now so Sella's wardens will accept the account of the rescue.",
          "failTitle": "The Price of Helping",
          "failText": "Bram stands over his injured son and tells the woodcutters what your bargain means. They close ranks around the hurdle. The wardens answer in kind, and the evidence of an accident is lost beneath a fresh accusation.",
          "death": false
        }
      ]
    },
    {
      "id": "AA16C",
      "turn": 16,
      "title": "Beneath the Boundary Oak - Tavin's Account",
      "narrative": [
        "Tavin tells the gathering how the lead caught, where he set his knife, and how he later fell through brush on the eastern ride. You keep interruptions back. His voice grows steadier when he reaches the part where Rill stayed.",
        "Sella crouches beside him and thanks him for freeing her hound. Bram turns his face away for a moment. Beyond them, the woodcutters lower their axe heads until the iron rests against their boots.",
        "The men have heard a child's mistake and a dog's loyalty instead of theft. Yet neither leader volunteers to cross the disputed strip with tools. Both fear that repairing the pit might surrender an older claim."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Ask Tavin to swear before everyone that his father has never hunted across the boundary.",
          "failTitle": "An Oath Too Far",
          "failText": "The boy cannot answer for every day of his father's life. His frightened silence is taken as a confession by one side and an insult by the other. Bram carries him away while angry men reclaim the clearing.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Request volunteers from both groups for a shared repair party and settle its duties on the way.",
          "nextNodeId": "AA17A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Walk Sella and Bram around the pit together, separating the visible danger from their claims to the land.",
          "nextNodeId": "AA17C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA17A",
      "turn": 17,
      "title": "The Work Ahead - Paired Hands",
      "narrative": [
        "The shared repair party follows you to the roped hollow, woodcutters carrying poles beside wardens with cord. Sella and Bram keep their men outside the broken lip. Working shoulder to shoulder proves easier than deciding who should give orders.",
        "You find the remains of an old deer fence among the brambles. Some posts are sound, but others lean toward the pit. A dry strip of higher ground offers a way around the whole dangerous patch.",
        "Tavin rests beneath the boundary oak with two men watching over him, and Rill rests there too. Thorne waits at the approach while you decide what useful work can be finished before dusk."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Mark the firm detour together and agree that its warning stakes make no claim to hunting rights.",
          "nextNodeId": "AA18A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Set a guarded relay bringing posts and rails to the pit while the boundary question waits.",
          "nextNodeId": "AA18B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Clear the whole brush cover at once so the workers can see every edge before starting.",
          "failTitle": "The Edge Goes with the Roots",
          "failText": "The intertwined roots are holding loose earth above the hollow. Pulling them together breaks away another section, carrying a worker down and forcing a second rescue. The frightened crews abandon the repair and blame each other's orders.",
          "death": false
        }
      ]
    },
    {
      "id": "AA17B",
      "turn": 17,
      "title": "The Work Ahead - A Consented Watch",
      "narrative": [
        "With the woodcutters' consent, Sella stations wardens on firm ground beside the temporary ropes. Their bows remain unstrung. Bram leads you along the approach, pointing out where wood is dragged each winter and where children gather kindling.",
        "The guard can turn travelers back tonight, but it cannot watch every path forever. Broken lengths of the abandoned deer fence lie under leaves, and sound poles could be brought down without taking anyone near the weak lip.",
        "At the oak, Tavin and Rill remain under care while Thorne waits clear of the work. Bram asks exactly where his men may carry timber without their help being called surrender."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Ask both crews to repair the abandoned fence as a temporary barrier, leaving its legal meaning unsettled.",
          "nextNodeId": "AA18C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Have the wardens seize the nearest woodcutter's timber to save time finding materials.",
          "failTitle": "Consent Withdrawn",
          "failText": "Bram gave permission for a guard, not a seizure. His men block the timber path, and Sella's wardens reach for their weapons. The limited agreement collapses over the first armful of wood.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Agree on donated timber and run a guarded repair relay with every worker kept beyond the weak lip.",
          "nextNodeId": "AA18B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA17C",
      "turn": 17,
      "title": "The Work Ahead - Two Leaders at the Rim",
      "narrative": [
        "You lead Sella and Bram around the roped pit on firm ground. Seen together, the old post holes and collapsed brush show years of neglect rather than a freshly laid trap. Bram stops arguing long enough to measure the breadth with his eyes.",
        "An abandoned deer fence could be repaired to keep people from wandering toward the hollow. A higher route would also serve, although its first warning stakes would stand in ground both sides claim.",
        "The men tending Tavin remain at the boundary oak with Rill; Thorne waits on the broad approach. Sella offers cord, and Bram offers poles. Neither offer has yet become a plan."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Stand on the remaining brush shelf to show both leaders where the fence ought to run.",
          "failTitle": "A Lesson from the Hollow",
          "failText": "The shelf breaks beneath your demonstration. The rope catches you against the wall, leaving you injured and dependent on the same divided crews for rescue. Work stops, and the leaders send their men home rather than risk another fall.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set both crews to repairing the old fence, testing each post and declaring the barrier no proof of ownership.",
          "nextNodeId": "AA18C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Mark the higher detour as a neutral passage and postpone work closer to the pit.",
          "nextNodeId": "AA18A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA18A",
      "turn": 18,
      "title": "Before the Light Goes - A Way Around",
      "narrative": [
        "Together the crews mark a firm detour around the hollow. You have them point each warning stake toward the safe route, then hear both leaders say that the marks settle no hunting claim. Pale wood catches the fading light between dark trunks.",
        "The pit remains roped off beyond the new passage. Its permanent repair will need another day's labor, but a traveler coming from either side can now recognize the danger before reaching it.",
        "At the boundary oak, Tavin is drinking from Bram's cup while Rill sleeps. The workers arrive talking about tools instead of trespass. You need to preserve what has been agreed before they scatter home."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Write the rescue facts, temporary passage terms, and remaining repair duties for both leaders to confirm.",
          "nextNodeId": "AA19A",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Cut Duke Aldric's boundary mark into the oak to give the detour lasting authority.",
          "failTitle": "The Wrong Mark",
          "failText": "A mark meant to authorize safe passage is recognized as a claim to the ground itself. Bram refuses it, Sella cannot explain the grant behind it, and both parties demand an order you do not possess. Your repair becomes a disputed seizure.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Gather the workers as witnesses and have Sella and Bram repeat the truce aloud.",
          "nextNodeId": "AA19B",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA18B",
      "turn": 18,
      "title": "Before the Light Goes - Posts in Firm Ground",
      "narrative": [
        "The guarded relay brings timber to firm ground beyond the pit's crumbling edge. Wardens hold posts while woodcutters bind rails across them. You keep the approach clear, and nobody has to step onto the brush that concealed the fall.",
        "The new barrier is rough but visible. Sella leaves a guard to direct late travelers around it, and Bram counts the donated poles before thanking the men who carried them. Neither side has conceded its boundary claim.",
        "You return with the workers to Tavin, Rill, and Thorne at the oak. The day's promises now need a form the absent families can understand when they hear about this gathering."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Split a notched hazel tally between the leaders to record the duties they repeat before witnesses.",
          "nextNodeId": "AA19C",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Call witnesses from both crews to hear the leaders name the truce, repairs, and limits of the watch.",
          "nextNodeId": "AA19B",
          "scoreDelta": 1
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Send the wardens home at once because the new rails make their temporary watch unnecessary.",
          "failTitle": "An Empty Post",
          "failText": "The crews depart believing the other side will guide late travelers around the unfinished approach. A returning woodcutter is hurt trying to cross beside the rails. By nightfall each group accuses the other of abandoning its promise.",
          "death": false
        }
      ]
    },
    {
      "id": "AA18C",
      "turn": 18,
      "title": "Before the Light Goes - The Fence Stands Again",
      "narrative": [
        "Both crews repair the abandoned fence, replacing rotten posts and closing gaps that led toward the hollow. You test the rails from the safe side. The revived barrier follows the old line only to keep feet and paws away from danger.",
        "Sella and Bram say this plainly to their workers: fixing a fence does not decide who may hunt beyond it. Their words matter as much as the cord stretched tight between the pale new posts.",
        "Back beneath the oak, Tavin asks if Rill can visit when his knee has healed. Sella says that can be arranged. Bram says nothing against it, but the larger promises still need to be fixed in everyone's memory."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Give Sella sole possession of the repaired fence in return for promising to maintain it.",
          "failTitle": "Repairs Become a Claim",
          "failText": "Bram hears his gift of timber turned into evidence against his neighbors. He orders his men to reclaim the new rails, and wardens move to stop them. The fence divides the crews before it can protect the path.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Make a written account of the rescue and provisional terms, then read it to both sides.",
          "nextNodeId": "AA19A",
          "scoreDelta": 0
        },
        {
          "id": "good",
          "type": "good",
          "label": "Make matching split hazel tallies for the agreed duties, with witnesses confirming they record promises only.",
          "nextNodeId": "AA19C",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA19A",
      "turn": 19,
      "title": "What Will Be Remembered - Ink at the Oak",
      "narrative": [
        "You write the shared account on a spare leaf from your pouch and read every line aloud. Sella corrects the time Rill went missing; Bram corrects the name of the path. Neither disputes how Tavin and the hound came to be trapped.",
        "Below the account you set down the provisional safety terms and the work still required. You leave hunting title for Duke Aldric to hear through lawful claims. Both leaders make their marks after hearing that distinction again.",
        "Tavin's knee must be rested indoors, and Rill needs dry bedding. Beyond those immediate needs lies the question of how today's agreement will reach everyone who was not beneath the oak."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Send a warden and a woodcutter together with the agreed account to request Aldric's hearing.",
          "nextNodeId": "AA20A",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Arrange separate temporary watches and move Tavin and Rill to Sella's lodge for warmth and care.",
          "nextNodeId": "AA20B",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Add that Bram accepts the warden's boundary, trusting he will accept the words after the rescue.",
          "failTitle": "A Line Never Agreed",
          "failText": "Bram asks you to read the account once more and hears the added concession. He tears his mark from the sheet while Sella refuses to defend the alteration. The shared record is destroyed by a claim nobody made.",
          "death": false
        }
      ]
    },
    {
      "id": "AA19B",
      "turn": 19,
      "title": "What Will Be Remembered - Words Before Witnesses",
      "narrative": [
        "Before witnesses from both crews, Sella and Bram repeat the rescue account and the terms of their truce. You ask each witness what was promised. Small differences are corrected while the speakers are still standing together.",
        "The hunting dispute remains open, but no one will pursue it with a drawn bow tonight. Tavin listens from his blankets as his father promises to report a danger before blaming the wardens for it.",
        "Sella promises the same courtesy in return. The workers begin collecting their tools, eager for their own hearths. Tavin and Rill also need shelter, and the new peace must survive being carried beyond this circle."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Have both leaders escort Tavin and Rill home together so their neighbors see the reconciliation.",
          "nextNodeId": "AA20C",
          "scoreDelta": 0
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Make every woodcutter surrender his axe before allowing the gathering to disperse.",
          "failTitle": "Tools Taken as Tribute",
          "failText": "The woodcutters have just promised peace, and their axes are their livelihood. They refuse the unexpected seizure. Sella's men close the path to enforce your command, undoing the truce while its witnesses are still present.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Set clear separate watch limits and bring the boy and hound to Sella's lodge, with Bram beside them.",
          "nextNodeId": "AA20B",
          "scoreDelta": 1
        }
      ]
    },
    {
      "id": "AA19C",
      "turn": 19,
      "title": "What Will Be Remembered - The Two Halves",
      "narrative": [
        "You notch a hazel stick as the leaders repeat the agreed duties, then split it lengthwise before witnesses. Sella and Bram each keep a matching half. The wood records their promises of work and restraint, not possession of Elderwood.",
        "Bram turns his half in callused fingers. Sella names the days when a warden can meet a woodcutter to inspect the hazard. For the first time, their talk concerns a shared visit rather than an unwelcome crossing.",
        "Tavin shifts under his cloak, tired of being brave. Rill raises his head at once. There is enough daylight to get them under a roof and let the waiting households hear what changed here."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Hold both tally halves yourself and keep Bram at the oak until his neighbors accept every duty.",
          "failTitle": "A Guest Turned Hostage",
          "failText": "Bram's companions refuse to leave him behind. Sella objects that no hostage was part of the agreement, and the witnesses withdraw their support. Your demand makes the freely given promises worthless.",
          "death": false
        },
        {
          "id": "good",
          "type": "good",
          "label": "Ask Sella and Bram to bring Tavin and Rill home together and explain the agreement to the waiting neighbors.",
          "nextNodeId": "AA20C",
          "scoreDelta": 1
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Send one messenger from each side to carry the same rescue account to Aldric and seek a hearing.",
          "nextNodeId": "AA20A",
          "scoreDelta": 0
        }
      ]
    },
    {
      "id": "AA20A",
      "turn": 20,
      "title": "The Hound Comes Home - The Road to Aldric",
      "narrative": [
        "The two messengers leave together, carrying the agreed facts toward Duke Aldric's hall. You watch them pass the boundary oak without either claiming the right to go first. Their testimony will concern an accident; the hunting dispute will need its own hearing.",
        "Nearby, Bram settles Tavin for the short journey indoors while Sella wraps dry cloth around Rill. Thorne stands patiently at your shoulder. The boy and the hound are safe, and nobody has been taken away in bonds.",
        "Before the leaders part, there remains one last decision. They can bind themselves to shared care of the dangerous ground, or leave its protection to a temporary watch while they await the duke."
      ],
      "options": [
        {
          "id": "good",
          "type": "good",
          "label": "Fix shared repair days and regular inspections with both leaders, preserving all hunting claims for Aldric's hearing.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Recall the messengers and settle the hunting title yourself to spare everyone a hearing.",
          "failTitle": "Beyond the Ranger's Charge",
          "failText": "Each leader demands the deeds and testimony behind your ruling. You have only the evidence of a rescue. The promised hearing is withdrawn, and the two sides leave preparing to press their claims by force.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Confirm a temporary no-hunt strip under warden guard and leave a lasting maintenance agreement for the hearing.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        }
      ]
    },
    {
      "id": "AA20B",
      "turn": 20,
      "title": "The Hound Comes Home - The Warden's Hearth",
      "narrative": [
        "You set the temporary watches on separate approaches and accompany Bram, Tavin, and Rill to Sella's lodge. Inside, the boy rests his supported knee on dry bedding while the hound settles beside the hearth. Thorne receives water beneath the eaves.",
        "Bram accepts a cup from Sella with both hands. The room smells of damp wool and warming bread, familiar things after the cold hollow. Neither speaks of theft now, although their disagreement over the wood remains.",
        "The separated watches will keep tonight quiet. Tomorrow they could begin watching each other instead of the danger. Before you leave, the leaders must decide whether to keep that uneasy arrangement or accept lasting work together."
      ],
      "options": [
        {
          "id": "normal",
          "type": "normal",
          "label": "Keep wardens over a temporary no-hunt strip with Bram's consent, and postpone shared duties until Aldric hears the dispute.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Turn the separate watches into paired inspections and shared repairs, then agree to present the boundary claims peacefully to Aldric.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        },
        {
          "id": "fail",
          "type": "fail",
          "label": "Tell Sella to keep Tavin at the lodge until Bram formally abandons his claim.",
          "failTitle": "Shelter Made a Prison",
          "failText": "Bram lifts his son from the bedding while Sella steps between you and the door. Neither will accept a rescued child as security for land. They reject your mediation, and the fragile peace ends at the hearth that should have sealed it.",
          "death": false
        }
      ]
    },
    {
      "id": "AA20C",
      "turn": 20,
      "title": "The Hound Comes Home - Through the Same Door",
      "narrative": [
        "Sella and Bram bring Tavin home together, with Rill walking beside the bearers and Thorne following your hand. Neighbors gather at the cottage door. They hear both leaders explain the rescue before any rumor can turn their arrival into a victory procession.",
        "Inside, Tavin settles on his own bedding with the swollen knee supported. Rill puts his chin across the edge until the boy's hand finds him. Sella promises to bring the hound back while Tavin recovers.",
        "Outside, Bram and the warden stand beneath the dripping thatch. Their neighbors have seen peace for an evening. It is still yours to help them choose what will keep it after the gratitude fades."
      ],
      "options": [
        {
          "id": "fail",
          "type": "fail",
          "label": "Announce that Rill will remain Bram's property as compensation for Tavin's injury.",
          "failTitle": "A Rescue Turned into Theft",
          "failText": "Sella takes up the lead and refuses the seizure. Bram, who asked for no payment, is accused again before his own neighbors. The rescued hound becomes the cause of the feud you came to prevent.",
          "death": false
        },
        {
          "id": "normal",
          "type": "normal",
          "label": "Secure consent for wardens to guard a temporary no-hunt strip while all lasting terms await Aldric's hearing.",
          "nextNodeId": null,
          "scoreDelta": 0,
          "endStory": true,
          "endType": "low"
        },
        {
          "id": "good",
          "type": "good",
          "label": "Have both leaders pledge shared hazard repairs and regular meetings before their neighbors, with hunting title reserved for Aldric.",
          "nextNodeId": null,
          "scoreDelta": 1,
          "endStory": true,
          "endType": "high"
        }
      ]
    }
  ]
});
