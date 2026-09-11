# Repository Review Prompt

Hand this to an agent with `{owner}/{repo}` filled in. It writes the body of one issue.

## Budget

Read only: repository metadata (`gh api repos/{owner}/{repo}`), topics, languages, the file tree,
the README, the head of `index.html` or the main manifest, the first 40 lines of the CHANGELOG,
the workflow files, and releases and tags. At most 200 KB of text. Grep the code only to confirm
a single claim (for example, whether a file is referenced). Do not review the code itself.

## What To Look For

What a visitor sees before reading any code, judged against what the project actually is:

- Can it be tried in one click (Pages, demo, release download)?
- Topics a person searching for this kind of project would use.
- A description in the README's language.
- Screenshots, a GIF or a diagram where the project is visual.
- A README that matches the project today (languages, files, controls, platforms).
- Install conveniences that fit the stack (a shortcut, a one-line installer).
- CI badge, releases matching the CHANGELOG, link previews, favicon.
- Dead weight: duplicate or unreferenced large files.

Every point must be confirmed from the files above. No guesses.

## How To Write It

- The owner's language (look at their existing issues).
- First line: `<!-- repowarden:review -->`. Then one sentence on what was read and that the code was not reviewed.
- One sentence naming what the project already has. No praise words, no judging.
- Numbered items `### n/N · Title`, most useful first, only as many as were found.
- Each item: why it helps the visitor in one or two sentences, then a ready command or snippet.
- No grades, no "critical", no offer of help, no sentence the owner gains nothing from.
- Last line: `<sub>[RepoWarden](https://github.com/Teknesyum/RepoWarden) önerisi.</sub>` in the owner's language.
