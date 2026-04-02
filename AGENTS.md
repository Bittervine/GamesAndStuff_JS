# Agent Instructions

- Only run `git commit` when the user explicitly instructs you to commit.
- Only run `git push` when the user explicitly instructs you to push.
- Do not infer permission to commit or push from context.
- If uncertain, ask the user before any commit/push action.
- Do not create new files unless the user explicitly instructs you to create them.
- Do not run `git add` (or otherwise stage files) unless the user explicitly instructs you to add files.
- If the user's query starts with `Q:` or `Qustion:`, answer the question only and do not implement changes or perform any other actions.
- This is developed on a slow/old computer. Give all powershell commands etc 5 times a long timeout as normal.
- This project contains many separate minor project. Only work in the sub-directory indicated (one at a time). Exception for when updating GamesAndStuff_JS.html.
