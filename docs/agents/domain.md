# Domain docs

## Layout

This repo uses a single context:

- `GLOSSARY.md` at the repo root defines domain vocabulary.
- `docs/adr/` holds architectural decisions.

## Consumer rules

Before exploring the codebase, read `GLOSSARY.md` and ADRs relevant
to the area being changed.

If these documents do not exist, proceed silently.
The domain-modeling skill creates them when terms or decisions
are resolved.

Use glossary terms consistently in issues, proposals, and tests.
If a needed concept is missing, reconsider the wording or note
the gap for domain-modeling.

Explicitly flag proposals that contradict an existing ADR,
identify the ADR, and explain why it should be reconsidered.
