# Ranger3_JS Authoring and Development Guide

This file is the living specification for Ranger3_JS. Read it completely before changing the project or writing a story.

## Project philosophy

Ranger3_JS is deliberately simple. A story is a complete, self-contained HTML file with its own CSS and JavaScript. Use ordinary HTML, CSS, and JavaScript directly.

There is no requirement for backwards compatibility with old story formats or older revisions. All stories that matter are shipped in the current revision. If a project-wide convention changes, update the bundled stories rather than preserving legacy code paths.

## Repository layout

The normal project contains:

- `index.html` — the story shelf. It contains a link/card for every bundled story.
- `story_000.html` — the first playable Ranger3 story and the presentation reference for later stories.
- `story_NNN.html` — later self-contained stories, numbered sequentially with three digits.
- `AGENTS.md` — this file.
- `RangersQuest3-Map.png` — the canonical map for major geography, place-name spelling, and broad spatial relationships.
- `RangersQuest3-Info.txt` — the campaign/world continuity record: established events, characters, unresolved threads, uncertainties, and canon status.

Keep the project small. Do not add dependencies, package managers, frameworks, build systems, external libraries, or network requirements unless they provide a clear benefit requested by the user.


## Canon and reference authority

The project ships two authoring references and they serve different purposes:

1. `RangersQuest3-Map.png` is authoritative for major geographic names, spelling, and broad spatial relationships. If an older story or handoff wording conflicts with the map on a major mapped place, use the map. Small local places may exist without appearing on the map.
2. `RangersQuest3-Info.txt` is authoritative for campaign history, established characters, prior decisions, unresolved plots, political/social consequences, supernatural facts, and explicitly recorded uncertainty. Do not silently resolve uncertainty.
3. A newly authored story is a playable scenario, not automatically campaign history. Its possible outcomes become canon only when the user actually plays them or explicitly declares them canon. Do not update the handoff as though an unplayed branch happened.

When continuity sources appear to disagree in a way these rules do not resolve, preserve the ambiguity and avoid building a plot that depends on choosing one unsupported version.

## Adding a new story

When asked to write a new story:

1. Read this entire file.
2. Read `RangersQuest3-Info.txt` completely before inventing the plot, so established consequences and unfinished threads are not accidentally overwritten.
3. Inspect `RangersQuest3-Map.png` and use its major names/spelling and geography.
4. Inspect `story_000.html` and at least one recent story for presentation and interaction conventions.
5. Find the highest existing `story_NNN.html` number.
6. Copy `story_000.html` to the next free number as the starting shell, then replace the story itself completely. Do not merely reskin the example plot.
7. Keep all story-specific HTML, CSS, JavaScript, state, prose, and logic inside that one story file.
8. Update `index.html` with a new story card/link using the same number, title, length, estimated play time, and a short spoiler-light description.
9. Test representative branches, all endings, failure handling, restart, and the return-to-index link.
10. Update this file if development introduced a new project-wide rule or convention. Do not rewrite campaign history merely because a newly authored story contains possible future events.

Do not create a generic abstraction merely because two stories share some code. Duplication is acceptable here when it keeps each story independent and transparent.

## Required story metadata

Near the top of each story's JavaScript, keep a small object named `STORY_INFO` with at least:

```js
const STORY_INFO = {
    number: 0,
    title: "Example title",
    length: "Medium",
    estimatedMinutes: 20,
    description: "Short spoiler-light description."
};
```

The index is static and must be updated manually. Do not make `index.html` execute story files to discover metadata.

## Presentation conventions

The presentation may evolve, but unless the user asks for a redesign, new stories should remain recognizably part of Ranger3:

- A restrained medieval woodland palette.
- Readable serif narrative text.
- A compact header showing `Ranger 3`, story title, and current scene/progress information.
- Narrative prose above clearly separated choice buttons.
- A visible link back to `index.html`.
- A restart control.
- Failure results shown clearly, preferably with both `Undo Choice` and `Accept Fate` where undo is meaningful.
- A completed ending should give the player a way to restart or return to the story index.
- The UI must work at ordinary desktop widths and remain usable on a narrow/mobile viewport.
- When a story viewport is wide enough to preserve the normal story width, show `RangersQuest3-Map.png` in a secondary side panel so place names have geographic context. Hide the map entirely on narrower screens rather than shrinking the reading area to make room for it. The map image should link to the full-size source. Keep the map frame suitable for future story-specific location markers, but do not require a marker unless the story implements one.
- Choices must not be visually color-coded as good/bad/fail. The player should judge them by content.

A story may improve the UI, but if the change is intended as a new project-wide convention, update the other bundled stories as well. There is no backwards-compatibility obligation.

## Technical rules

- Use ordinary modern browser JavaScript.
- Keep each story playable by opening its HTML file directly or serving the folder through a simple static web server.
- No external JavaScript or CSS libraries.
- No network calls required for gameplay.
- Do not use `eval`, `new Function`, generated executable source, or remote code.
- Do not read or manipulate another story file at runtime.
- Avoid browser persistence such as cookies or localStorage unless the user explicitly asks for save games or persistence.
- Prefer clear state such as `state.bridgeSaved = true` over clever indirection.
- Meaningful state may use booleans, numbers, strings, arrays, sets, objects, or other normal JavaScript structures as appropriate.
- Do not create variables for facts that never affect anything later.
- A story does not need to follow the internal JavaScript structure used by `story_000.html`. That file is an example, not an API.

## The Ranger world

The player is the Ranger of Brackenwald, serving Duke Aldric. Thorne, the Ranger's horse, is a recurring companion and should appear naturally where travel, pursuit, rescue, or fieldcraft makes that sensible.

The setting is grounded medieval fantasy. Supernatural elements may exist, but they should be uncommon enough to retain weight. Most problems should arise from people, weather, terrain, animals, craft, law, shortages, accidents, old obligations, or believable conflict rather than from constant magic.

The Ranger is competent but not omniscient. Good decisions should arise from observation, judgment, patience, fieldcraft, courage, empathy, knowledge of land and people, or careful use of evidence. Do not turn the Ranger into a superhero or a stat-sheet RPG character unless the user asks for that.

Recurring characters, places, and motifs are welcome, but do not force them into every story. Returns should feel like continuity, not a checklist.

## Silver tabby rule

Before writing each new story, make a genuine random 1-in-5 roll.

- On a result of 1, the silver tabby with grey eyes may appear.
- On results 2 through 5, the tabby must not appear unless the user explicitly overrides the roll.
- A successful roll permits an appearance; it does not require the cat to become important.
- When present, normally use the tabby at only one or two story moments.
- Do not make the tabby a mascot, universal clue dispenser, or inevitable companion.

Record the roll in a brief HTML/JS comment inside the new story, for example `Tabby roll: 4/5 - absent.` This keeps the randomness auditable without showing it to the player.

## Story structure: use programs, not a fixed tree

Ranger3 intentionally imposes no fixed node count, no fixed branch width, and no mandatory story schema. Use JavaScript as a program to remember consequences and present scenes.

For example:

```js
const state = {
    bridgeSaved: false,
    villagersWarned: false,
    trust: 0
};

state.bridgeSaved = true;
state.trust += 1;

if (state.bridgeSaved) {
    // Earlier work can matter again much later.
}
```

Branches may diverge, reconverge, remain separate for several scenes, or alter only part of a later scene. A reconvergence must not erase facts that should still matter.

Do not chase a huge theoretical path count. The goal is meaningful consequence, not combinatorial vanity.

## Choice design

Ranger2 forced one failure choice at every node. Ranger3 must not do that.

- A scene may have two, three, four, or occasionally more choices when justified.
- It is perfectly valid for every choice in a scene to continue the story.
- Some choices may create setbacks without ending the story.
- Terminal failure should occur only when the selected action plausibly warrants it.
- Avoid obvious joke-suicide options whose only purpose is to be the wrong button.
- Do not silently label choices as good, neutral, bad, optimal, or failure in the visible UI.
- Different choices should change something: route, information, resources, relationships, risk, timing, injuries, who is present, later options, prose, or ending conditions.
- Not every small choice needs to echo forever. Preserve consequences that are narratively meaningful.
- Let important earlier choices resurface later, sometimes after routes have reconverged.
- A costly choice can still be wise. A safe-looking choice can create later difficulty. Avoid making the moral or tactical ranking mechanically obvious.

## Story quality

Aim for a complete adventure with a satisfying beginning, escalation, development, reversal or complication, climax, and resolution.

Prefer concrete scenes and specific people over generic fantasy filler. Keep casts manageable enough that earlier characters and facts remain coherent.

Do not reuse the same plot with nouns changed. Vary the kinds of Ranger problems: investigations, rescues, travel, weather, disputes, craft failures, missing people, animals, local politics, logistics, ecological problems, crimes, dangerous folklore, and occasional genuinely strange events.

Use failures and violence without graphic excess. Maintain a serious but readable adventure tone.

## Length guidance

There is no hard turn count. Use the story's natural shape.

Useful rough labels for the index are:

- `Short`: roughly 10-15 minutes.
- `Medium`: roughly 15-30 minutes.
- `Long`: roughly 30-50 minutes.
- `Epic`: longer than that and justified by substantial variation.

The estimate is approximate. Branches may make play time vary.

## Testing expectations

Before delivering a revision that changes stories or UI:

- Check HTML/JavaScript syntax.
- Open `index.html` and verify every listed story link exists.
- Open each changed story and verify it starts correctly.
- Exercise representative divergent paths and reconvergences.
- Verify important state set early in the story is correctly remembered later.
- Reach every authored ending at least once when practical.
- Trigger representative failure paths and verify Undo/Accept behavior.
- Verify restart resets all story state.
- Verify the return-to-index link works.
- Check a narrow viewport for obvious layout breakage.
- Search for accidental references to old story titles, state variables, or characters copied from a template.

Automated test utilities may be written temporarily during development without being shipped in the revision if they are not useful to the user.

## Minimal authoring prompt

Once the project conventions are established, a sufficient normal request to a capable coding/writing agent is:

> Read `AGENTS.md` completely and write the next Ranger story.

The agent is expected to determine the next story number, perform the tabby roll, create the self-contained HTML story, update `index.html`, test the result, and update `AGENTS.md` only if a new project-wide convention was introduced.

## Revision packaging

Ranger3 revision archives are named `Ranger3_JS_REV_NNN.zip`.

For every delivered revision, update the HTML document titles (`<title>`) of `index.html` and every bundled `story_NNN.html` to include the current `REV NNN`. This makes the running copy identifiable without changing the story prose.

Until the user establishes a separate immutable baseline, deliver a complete standalone Ranger3 project archive for each revision. Do not require the user to layer an abandoned revision underneath it.

When a baseline is later declared, follow the project's cumulative-delta rules from that point onward.

Do not include unnecessary generated files, caches, executables, or editor debris in revision archives.
