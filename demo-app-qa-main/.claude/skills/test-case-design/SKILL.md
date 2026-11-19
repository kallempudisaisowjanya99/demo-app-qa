---
name: test-case-design
description: Write a test case design document (Markdown) from the user's input (the feature or app, requirements, rules, number of UI and API cases, test strategy). Use when the user asks to design, write or create test cases, test scenarios or a test case document, or invokes /test-case-design, even if they only give a feature description or a count like "10 UI and 10 API cases".
argument-hint: "[feature or app, requirements or docs, number of UI/API cases, output path]"
---

# Test Case Design Writer

Turn the user's input into a **test case design document** saved as a `.md` file. Each case must be clear enough that someone else can run it, or automate it, without asking questions.

**User input:** $ARGUMENTS

## 1. Collect the input

Read the input and every source it points to: requirements, the test strategy (for example TEST_STRATEGY.md), architecture docs, OpenAPI specs, UI pages and code.

Pull out:
- **Roles and users:** who can do what.
- **Business rules:** field limits, allowed values, status transitions, permissions.
- **Endpoints and pages under test:** each with its expected status codes and error messages.
- **Risks from the strategy:** high-risk areas get more and deeper cases.
- **How many cases:** the user's number is a **hard limit**, for example "10 UI and 10 API". Never write more. If no number is given, cover each high risk with 1–3 cases and say how many you wrote.

**Ask the user only when** the feature under test can't be identified. Otherwise list your assumptions in the document.

## 2. Design the cases

Use these techniques, and name in each case the ones it applies:
- **Boundary value analysis:** min−1, min, max, max+1 for every limit.
- **Equivalence partitioning:** one value per valid and invalid class.
- **State transition:** every allowed and refused transition. Use a matrix when there are many.
- **Data-driven:** one case runs over a table of inputs and expected results.
- **Security:** another user's data (two users of the **same** role), a missing or tampered token, a missing CSRF (Cross-Site Request Forgery) token, script injection in text fields.
- **Negative:** invalid input, a wrong role, a missing resource.

**Rules:**
- Each case mixes positive, negative, boundary and security checks where they fit. Avoid twenty near-identical happy-path cases.
- Expected results are exact and checkable: status code, message, field value, what is visible and what is **not**.
- After every refused action, the expected result also says that nothing changed.
- Where the requirement is unclear, write "Record behaviour – ask the product owner" instead of guessing the rule.
- Each case is independent: it creates its own data, and its preconditions say exactly what must exist.

## 3. Write the document

Follow [template.md](template.md):
- environment and conventions;
- personas;
- seed data;
- the UI cases;
- the API cases;
- a coverage summary;
- an automation plan.

**IDs:** use `UI-<AREA>-NN` and `API-<AREA>-NN`, with the area as a short code such as AUTH, CLM, VIS or ADM. Keep the IDs stable, because automated test titles will carry them.

**Priorities:**
- **P0:** security, data isolation, core business rule.
- **P1:** main flows.
- **P2:** edge cases.
- **P3:** cosmetic.

**Abbreviations:** spell out each one the first time it is used.

## 4. Save and report

- Save to the path the user gave. Otherwise save `TEST_CASES.md` in the project root, and if a file already exists there, ask before overwriting it.
- Then reply with:
  - the file path;
  - the number of UI and API cases;
  - the coverage summary table;
  - the cases marked "ask the product owner";
  - the assumptions you made.

## Quality checklist (check before saving)

- [ ] The case count matches the user's limit exactly, or no limit was given.
- [ ] Every case has an ID, title, priority, technique, preconditions, numbered steps, test data, required test data and expected result.
- [ ] Every limit has boundary values on both sides.
- [ ] Every high-ranked risk from the strategy has at least one P0 case.
- [ ] Isolation is tested with two users of the same role.
- [ ] Refused actions check that nothing changed.
- [ ] The coverage summary counts positive, negative, boundary/data-driven and security cases.
- [ ] No invented endpoints, fields or rules.
