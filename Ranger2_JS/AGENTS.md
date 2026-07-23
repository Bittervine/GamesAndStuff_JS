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
- Every node must have exactly three narrative paragraphs because that is what the current game validator accepts.
- Every node must have exactly three options: one `good`, one `normal`, and one `fail`.
- A good option has `scoreDelta: 1`; a normal option has `scoreDelta: 0`; a fail option has `failTitle`, `failText`, and `death`.
- Every continuing good or normal option must point to an existing node on the next turn. Turn-20 good and normal options must end the story correctly.
- Vary option order evenly. Across 60 nodes, each type should appear first about 20 times.

## Branching

- Choices must create real branches, not merely change the node letter while presenting identical text.
- Make all nodes from turns 2 through 20 reachable from `startNodeId`. The unused `B` and `C` alternatives on turn 1 are the only expected unreachable nodes.
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
- All nodes from turns 2 through 20 are reachable.
- Option-first positions are evenly mixed.
- Option labels and narrative paragraphs have no accidental exact duplicates.
- Story IDs, node IDs, titles, and prefix letters do not collide with existing stories.
- Cat appearances obey the rarity and frequency rule.
- `git diff --check` passes.

Do not add, commit, or push files unless the user explicitly requests it.
