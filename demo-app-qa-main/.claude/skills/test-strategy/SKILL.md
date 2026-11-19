---
name: test-strategy
description: Write a risk-based test strategy as a Markdown file from the user's input (the app, its architecture, risks, scope, tools, constraints). Use when the user asks to write, create, draft or update a test strategy, test plan strategy or QA strategy, or invokes /test-strategy, even if they only paste an app description or point to a repo folder.
argument-hint: "[app description, docs to read, risks, scope, tools, output path]"
---

# Test Strategy Writer

Turn the user's input into a complete, risk-based **test strategy** saved as a `.md` file.

**User input:** $ARGUMENTS

## 1. Collect the input

Read everything the user gave, plus every source they point to: architecture docs, README, OpenAPI or AsyncAPI specs, existing tests, docker-compose files, and code. If the input names a repo or folder, explore it before writing.

Pull these facts out. Each one becomes part of the strategy:

| Fact | Where it is used |
|---|---|
| What the app does and who uses it (roles) | Objectives, personas |
| Components, ports and how they talk (REST, events, WebSocket) | Scope, test levels, environments |
| Business rules (statuses and transitions, field limits, permissions) | Risks, traceability |
| Security model (auth, tokens, CSRF, roles) | Risks, security testing |
| Existing tests and tools | Test pyramid "status today" column |
| Constraints the user states (deadline, number of tests, tools, CI) | Scope, CI/CD plan, exit criteria |

**Ask the user only when** the app or its main features can't be found anywhere. Ask for that one thing, then continue. For anything else that is missing, make a sensible assumption and list it under "Assumptions" in the document.

## 2. Rank the risks

- Base every risk on something real in this app: a rule, a file, a config value or a known weak spot. Don't use textbook risks that could apply to any app.
- Rank by impact × likelihood. Security and data isolation, and the core business rules, usually come first.
- Give each risk an ID (R1, R2 …), and say why it ranks where it does and which tests cover it.

## 3. Write the document

Follow the structure in [template.md](template.md). Keep every section, and fill each one with app-specific content. If a section truly doesn't apply, write one line saying why.

**Rules:**
- Put each check at the **lowest test level** that can prove it. End-to-end tests cover only what needs the whole stack.
- In the traceability matrix, every high-ranked risk has at least one automated test at some level.
- Entry and exit criteria must be measurable (numbers, pass rates, coverage %, defect counts by severity).
- The CI/CD plan names the stage, trigger, what runs and whether it **blocks** the change.
- Spell out each abbreviation the first time it is used, for example "CSRF (Cross-Site Request Forgery)".
- Use plain language, tables where they help and no filler. Aim for about 120–200 lines.
- Use only facts from the input or the code. Never invent features, endpoints or tools.

## 4. Save and report

- Save to the path the user gave. Otherwise save `TEST_STRATEGY.md` in the project root, and if a file already exists there, ask before overwriting it.
- Then reply with:
  - the file path;
  - the top 3 risks, one line each;
  - the assumptions you made;
  - anything you couldn't find and that the user should confirm.

## Quality checklist (check before saving)

- [ ] Every risk points to something real in this app.
- [ ] In-scope and out-of-scope lists are both present.
- [ ] The pyramid table has tool, target and "status today" for each level.
- [ ] The traceability matrix covers every high-ranked risk.
- [ ] The test data strategy covers users, how data is created, isolation and cleanup.
- [ ] Entry, exit and suspension criteria are measurable.
- [ ] The CI/CD plan says which stages block.
- [ ] Defect severities are defined.
- [ ] No invented facts, and every abbreviation is spelled out once.
