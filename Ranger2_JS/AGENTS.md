# Ranger2 Story Instructions

These instructions apply to all story work inside `Ranger2_JS`.

## Before writing

- Read `ranger2_story_prompt.txt` completely.
- Inspect `ranger2_game.js` for the current runtime validator. If the prompt and validator disagree, make the story work with the validator and report the disagreement.
- Review existing story titles, premises, casts, and node prefixes so the new story is genuinely different.
- Never copy an existing story and rename or lightly rewrite it.

## File and data format

- Name new files sequentially: `ranger2_storyX.js`.
- Begin exactly with `window.RANGER2_STORIES = window.RANGER2_STORIES || [];` followed by one `window.RANGER2_STORIES.push({...});` call.
- Use ES5-compatible JavaScript and a plain object literal. Do not use modules, imports, comments, `const`, `let`, `async`, or `await`.
- Each story must contain exactly 60 nodes: three nodes (`A`, `B`, and `C`) for each turn from 1 through 20.
- Set `maxTurns` to `20` and point `startNodeId` to the `A` node of turn 1.
- Use a node-prefix letter not already used by another story and not forbidden by the prompt.
- New stories must give every node exactly three narrative paragraphs. The runtime also accepts four paragraphs so legacy story 1 remains playable, but do not use four in new work.
- Every node must have exactly three options: one `good`, one `normal`, and one `fail`.
- A good option has `scoreDelta: 1`; a normal option has `scoreDelta: 0`; a fail option has `failTitle`, `failText`, and `death`.
- Every continuing good or normal option must point to an existing node on the next turn. Turn-20 good and normal options must end the story correctly.
- Vary option order evenly. Across 60 nodes, each type should appear first about 20 times.

## Branching

- Choices must create real branches, not merely change the node letter while presenting identical text.
- Make all nodes from turns 3 through 20 reachable from `startNodeId`. With only two continuing choices from the single turn-1 start node, exactly one turn-2 alternative is necessarily unreachable; the unused `B` and `C` alternatives on turn 1 are also expected unreachable nodes.
- A reliable pattern is:
  - `A good -> next A`, `A normal -> next B`
  - `B good -> next B`, `B normal -> next C`
  - `C good -> next C`, `C normal -> next A`
- Each destination narrative must acknowledge the approach or decision that led there and remain coherent from every incoming path.
- Branches may merge, but they must not contradict earlier events, repeat discoveries, revive captured characters, or forget established evidence.

## Writing quality

- Build a grounded medieval-fantasy investigation or adventure with a clear opening problem, escalation, discovery, reversal, and resolution.
- Use a small, stable cast and ordinary occupations. The ranger has no magic and remains accompanied by Thorne where practical.
- Make every narrative paragraph specific to its node. Do not repeat boilerplate paragraphs across turns or paths.
- Write every option as a concrete action tied to the current scene and evidence.
- Do not reuse the same three choice labels throughout a story, even with a place name substituted. A player should encounter meaningfully different decisions each turn.
- Good choices should show ranger skills, sound judgment, protection of others, or preservation of evidence.
- Normal choices should be plausible and cautious but less effective.
- Fail choices should be tempting or understandable mistakes with consequences specific to the scene.
- Keep prose natural, atmospheric, serious, and easy to read. Avoid modern language, game-mechanic references, generic filler, and repetitive sentence patterns.
- Keep fail outcomes and violence non-graphic.

## Gray silver tabby rule

- For each new story, make a genuine random 1-in-5 roll before writing.
- Include the gray silver tabby with green eyes only when the result is 1, unless the user explicitly overrides the roll for that story.
- When included, use the tabby at only one or two story points, such as causing a distraction or drawing attention to a clue.
- Do not mention the tabby in every node, force it into unrelated choices, or add it without a successful roll or explicit instruction.

## Required validation

Before handing off a story, verify all of the following:

- The script parses and registers exactly one story.
- There are exactly 60 nodes and exactly three nodes per turn.
- Every node has three narrative paragraphs and one option of each type.
- All non-ending links exist and lead to the next turn.
- All nodes from turns 3 through 20 are reachable, and exactly two turn-2 nodes are reachable from the single start node.
- Option-first positions are evenly mixed.
- Option labels and narrative paragraphs have no accidental exact duplicates.
- Story IDs, node IDs, titles, and prefix letters do not collide with existing stories.
- Cat appearances obey the rarity and frequency rule.
- `git diff --check` passes.

Do not add, commit, or push files unless the user explicitly requests it.

## Planned story variety, 25-99

- 25. The Last Orchard Wall — Stabilize storm-damaged terraces and rescue families before the hillside gives way; no villain required.
- 26. The Warden's Lost Hound — Track a missing trained hound through disputed hunting ground and prevent a feud.
- 27. Snow at Midsummer — Explain a freak cold spell, protect crops, and guide isolated shepherds home.
- 28. The Stone Singer — Investigate dangerous echoes and cracking rock in a working quarry with practical engineering.
- 29. The Candle Tax — Mediate a civic dispute over winter lighting before anger closes Oakenhurst after dark.
- 30. The Broken Pilgrimage — Escort injured pilgrims, identify deliberate trail hazards, and preserve a fragile peace.
- 31. The Sleeping Ford — Restore a river crossing after the channel shifts and strands two communities.
- 32. The Bread of Oakenhurst — Trace a sickness to spoiled grain and organize safe food before panic spreads.
- 33. The Duke's Empty Chair — Keep a local council from collapsing into factional violence during Aldric's absence.
- 34. The Red Kite's Shadow — Follow unusual raptor behavior to a threatened upland nesting ground and a missing child.
- 35. The Shepherd of No Flock — Find an entire vanished flock and uncover a natural danger beneath the grazing land.
- 36. The Green Knight's Grave — Resolve competing claims over ancient armor without turning folklore into easy proof.
- 37. Seven Days at Crow Tower — Survive an isolated watchtower crisis with limited food, wounded guards, and uncertain signals.
- 38. The Honey Road — Move precious hives through bad weather while rival villages argue over pollination rights.
- 39. The Tanner's Winter — Solve a dangerous workshop illness and keep apprentices from being blamed for their master's neglect.
- 40. The Guest at Bracken Hall — Protect a difficult diplomatic visit where etiquette matters as much as tracking.
- 41. The Oak That Split — A storm reveals an old weapons cache that several families claim as inheritance.
- 42. The River Horse — Recover a valuable escaped warhorse without letting hunters mistake it for a monster.
- 43. The Widow's Tournament — Guard an archery contest and expose subtle sabotage without ruining a lawful rivalry.
- 44. The Saltless Feast — Save a winter gathering after the preserved food supply fails unexpectedly.
- 45. The Children of the Causeway — Rescue stranded pupils and their teacher as marsh water cuts every familiar route.
- 46. The Wolf with a Rope — A snared wolf leads the ranger through an illegal trap line and a hard conservation choice.
- 47. The Summer Avalanche — Lead a mountain rescue after a thaw releases rock and old snow above a mining camp.
- 48. The Three Midwives — Reconcile competing healers during a difficult birth crisis across scattered farms.
- 49. The Quiet Drummer — A mute military messenger carries incomplete warning signs that must be interpreted without panic.
- 50. The Painted Cave — Rescue trapped explorers while protecting rare old paintings from frightened treasure seekers.
- 51. The Longest Night Watch — Investigate a missing sentry during a sleepless border vigil with no obvious enemy.
- 52. The Reed Boat Race — A festival contest becomes a marsh rescue requiring local knowledge instead of combat.
- 53. The Glassmaker's Breath — Trace workshop accidents to unsafe craft practice while preserving a valuable trade.
- 54. A Bridge for Thorne — Rebuild a dangerous crossing during an evacuation, with the ranger's horse central to the rescue.
- 55. The Black Ram — Recover a prized breeding ram before its disappearance starts a clan feud.
- 56. The Lantern Without Flame — Explain glowing marsh fungus and use the truth to find a lost gathering party.
- 57. The Mason's Oath — Prevent a chapel collapse while an old promise divides the builders responsible for it.
- 58. The Last Apple Seed — Escort rare seed stock through famine country without turning the journey into a convoy-heist plot.
- 59. The Quarry Feast — Diagnose a feast-day poisoning and keep frightened workers from accusing the wrong cook.
- 60. The Raven Census — Unusual raven movements reveal a missing veteran and abandoned battlefield hazards.
- 61. The Winter Wedding Road — Escort two feuding families through mountain weather to a politically important marriage.
- 62. The Empty Fish Weirs — Investigate an ecological collapse in the river without defaulting to poison or smugglers.
- 63. The Squire Who Ran — Find a young noble who fled an unwanted duty and decide what protection truly requires.
- 64. The Clay Army — Strange figures appearing in fields lead to a potters' ritual, a land dispute, and a real approaching danger.
- 65. The Fox in the Granary — Follow animal behavior to hidden rot and save a village food store without inventing a mastermind.
- 66. The Red Water Wheel — Determine whether a mill disaster was accident, negligence, or murder while the river keeps rising.
- 67. The Hermit's Map — Rescue a lost cartographer whose unfinished work is more dangerous than any treasure.
- 68. The Frostbitten Banner — Recover a stranded patrol and its wounded standard-bearer from a closed mountain path.
- 69. The Unfinished Song — A missing minstrel's half-written ballad encodes a personal plea rather than a conspiracy.
- 70. The Birchbark Letters — Family letters guide the ranger toward an isolated woodland camp in need of help.
- 71. The Moorland Firebreak — Organize rival settlements against wildfire and make difficult choices about what can be saved.
- 72. The Silent Smithy — Find a vanished master smith while apprentices struggle to complete a vital repair.
- 73. The Broken Oathstone — Mediate a legal custom dispute after a village monument is shattered by weather.
- 74. The White Boar — Protect a rare animal from competing hunters while solving why it approaches farms.
- 75. The Monastery Garden — Save medicinal plants from disease and settle who should control the surviving stock.
- 76. The Ropewalker's Fall — Investigate a fairground accident among performers, riggers, and frightened witnesses.
- 77. The Tower Bees — Remove a great swarm from a watchtower without losing the warning post or the hives.
- 78. The Black Ice Road — Guide a trapped supply train across treacherous ground through skill and coordination.
- 79. The Midwife's Lantern — Find a missing mother and healer during a storm without relying on supernatural answers.
- 80. The Falcon and the Plow — Mediate hunting rights between a noble household and farmers protecting new fields.
- 81. The Bone Flute — Strange calls draw livestock into danger; trace the sound through weather, terrain, and human grief.
- 82. The Moonless Hunt — Find a missing hunting party whose members disagree about what happened in the dark.
- 83. The Saint's Old Kitchen — Restore communal ovens after contamination threatens a crowded holy day.
- 84. The Windmill War — Resolve two villages' dispute over wind, water, and shared milling during harvest.
- 85. The Deep Marsh Funeral — Escort a funeral procession whose family secrets threaten to split the route apart.
- 86. The Cartwright's Challenge — Build and protect evacuation wagons while floodwater approaches faster than expected.
- 87. The Thief Who Returned Everything — Learn why stolen goods are reappearing and decide whether mercy serves justice.
- 88. The House Beneath the Roots — A sinkhole reveals an old refuge while people remain trapped in the collapsing ground.
- 89. The Icebound Abbey — Help a sealed-in community survive winter illness, rationing, and internal distrust.
- 90. The Wounded Giant — Treat a rare giant as a frightened living being while armed locals demand an easy answer.
- 91. The Crows of Red Field — Battlefield scavengers reveal that a missing veteran may still be alive among old hazards.
- 92. The Baker's Seven Fires — Repeated oven fires require craft knowledge, evacuation, and a careful look at ventilation.
- 93. The Tournament of Reeds — A marsh-skills contest becomes a real emergency that tests rivals in public.
- 94. The Road of Falling Stars — A meteor shower starts fires and superstition while remote farms need immediate aid.
- 95. The Empty Watchfires — Discover why a chain of patrol posts has gone dark without reusing a false-signal captain.
- 96. The Green Lady of Fen — Use one genuinely rare mythical encounter to resolve a human boundary crisis cautiously.
- 97. The Duke's Smallest Village — Find why an isolated hamlet was abandoned and whether its people can safely return.
- 98. The Winter Wolf Pact — Broker a survival agreement among shepherds, hunters, and wardens during a brutal season.
- 99. The Ranger's Long Ride — A multi-region disaster-relief finale with returning ordinary allies and no single mastermind.
