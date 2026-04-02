# Agent Instructions

- Only run `git commit` when the user explicitly instructs you to commit.
- Only run `git push` when the user explicitly instructs you to push.
- Do not infer permission to commit or push from context.
- If uncertain, ask the user before any commit/push action.
- Do not create new files unless the user explicitly instructs you to create them.
- Do not run `git add` (or otherwise stage files) unless the user explicitly instructs you to add files.
- If the user's query starts with `Q:` or `Qustion:`, answer the question only and do not implement changes or perform any other actions.
