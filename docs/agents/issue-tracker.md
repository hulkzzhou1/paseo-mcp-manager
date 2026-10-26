# Issue tracker: GitHub

Issues and specs live in hulkzzhou1/paseo-mcp-manager on GitHub.
Prefer GitHub plugin tools when available; otherwise use `gh`.
Pass `--repo hulkzzhou1/paseo-mcp-manager` to issue and label commands.

## Conventions

- Publish a spec or ticket: create a GitHub issue.
- Fetch a ticket: read the issue body, labels, and comments.
- Create: `gh issue create --title "..." --body-file <file>`.
- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list --state open --json number,title,body,labels`.
- Comment: `gh issue comment <number> --body-file <file>`.
- Label: `gh issue edit <number> --add-label "<label>"`
  or `--remove-label "<label>"`.
- Close: `gh issue close <number> --comment "..."`.
- Link child tickets using GitHub sub-issues where available.
  Otherwise, add `Part of #<parent>` to the child and link it
  from a task list in the parent.
- Record blockers using GitHub issue dependencies where available.
  Otherwise, add `Blocked by: #<number>` to the ticket.
  A ticket is unblocked when every blocker is closed.

## Pull requests as a triage surface

**PRs as a request surface: no.**
