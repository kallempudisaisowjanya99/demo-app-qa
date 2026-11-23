# AI Prompt Log (verbatim)

Every prompt I typed to the AI assistant (Claude Code) during this QA work, copied exactly and in time order, from the first setup question on 18 Nov 2026 to the final review on 23 Nov 2026. 125 prompts in total.

- Typed text is shown exactly as written, including typos.
- Text I pasted into a prompt (terminal output, error logs, the submission checklist) is kept in full, folded under **Pasted text**.
- **[image attached]** marks a prompt that included a screenshot.
- "(sent while the AI was working)" marks a message typed while the AI was still busy with the previous prompt.
- Left out: automatic messages that were not typed by me (tool output, a sub-agent's report, and the summaries the tool writes when a long conversation is shortened).

The cleaned-up, reusable versions of the important prompts, in the RACE format, are in [AI_JOURNAL.md](AI_JOURNAL.md).

---

### P001 · 18 Nov 2026, 12:04 UTC

~~~text
error in trminal
~~~

### P002 · 18 Nov 2026, 12:06 UTC

~~~text
docker compose up --build
~~~

### P003 · 18 Nov 2026, 12:15 UTC

~~~text
check readme file and tell me what to do
~~~

### P004 · 18 Nov 2026, 12:28 UTC

~~~text
Downloading: Windows Subsystem for Linux 3.0.5
Installing: Windows Subsystem for Linux 3.0.5
Catastrophic failure
~~~

### P005 · 18 Nov 2026, 12:41 UTC

<details><summary>Pasted text (104 lines)</summary>

~~~text
Windows PowerShell 5.1
Copyright (C) Microsoft Corporation. All rights reserved.

PS C:\Users\ABCOM> dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

Error: 740

Elevated permissions are required to run DISM.
Use an elevated command prompt to complete these tasks.
PS C:\Users\ABCOM> dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Error: 740

Elevated permissions are required to run DISM.
Use an elevated command prompt to complete these tasks.
PS C:\Users\ABCOM>
PS C:\Users\ABCOM> wsl --install --no-distribution
The requested operation requires elevation.
Downloading: Windows Subsystem for Linux 3.0.5
Installing: Windows Subsystem for Linux 3.0.5
Windows Subsystem for Linux 3.0.5 has been installed.
Installing Windows optional component: VirtualMachinePlatform

Deployment Image Servicing and Management tool
Version: 10.0.26100.9549

Image Version: 10.0.26300.9974

Enabling feature(s)
[==========================100.0%==========================]
The operation completed successfully.
The requested operation is successful. Changes will not be effective until the system is rebooted.
The requested operation is successful. Changes will not be effective until the system is rebooted.
PS C:\Users\ABCOM> [I
At line:1 char:3
+ [I
+   ~
Missing ] at end of attribute or type literal.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : EndSquareBracketExpectedAtEndOfAttribute

PS C:\Users\ABCOM> wsl --version
WSL version: 3.0.5.0
Kernel version: 6.18.58.1-1
WSLg version: 1.0.79
MSRDC version: 1.2.7391
Direct3D version: 1.611.1-81528511
DXCore version: 10.0.26100.1-240331-1435.ge-release
Windows version: 10.0.26300.9974
PS C:\Users\ABCOM> docker info
Client:
 Version:    29.7.2
 Context:    desktop-linux
 Debug Mode: false
 Plugins:
  agent: Docker AI Agent Runner (Docker Inc.)
    Version:  v1.128.0
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-agent.exe
  ai: Docker AI Agent - Ask Gordon (Docker Inc.)
    Version:  v1.30.0
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-ai.exe
  buildx: Docker Buildx (Docker Inc.)
    Version:  v0.36.1-desktop.1
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-buildx.exe
  compose: Docker Compose (Docker Inc.)
    Version:  v5.5.1
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-compose.exe
  debug: Get a shell into any image or container (Docker Inc.)
    Version:  0.0.47
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-debug.exe
  desktop: Docker Desktop commands (Docker Inc.)
    Version:  v0.4.3
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-desktop.exe
  dhi: CLI for managing Docker Hardened Images (Docker Inc.)
    Version:  v0.0.7
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-dhi.exe
  extension: Manages Docker extensions (Docker Inc.)
    Version:  v0.2.31
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-extension.exe
  init: Creates Docker-related starter files for your project (Docker Inc.)
    Version:  v1.4.0
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-init.exe
  mcp: Docker MCP Plugin (Docker Inc.)
    Version:  v0.43.3
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-mcp.exe
  model: Docker Model Runner (Docker Inc.)
    Version:  v1.2.6
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-model.exe
  offload: Docker Offload (Docker Inc.)
    Version:  v0.6.15
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-offload.exe
  pass: Docker Pass Secrets Manager Plugin (beta) (Docker Inc.)
    Version:  v0.2.2
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-pass.exe
  sandbox: "docker sandbox" is deprecated, use Docker Sandboxes instead (Docker Inc.)
    Version:  v0.13.0
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-sandbox.exe
  scout: Docker Scout (Docker Inc.)
    Version:  v1.24.0
    Path:     C:\Users\ABCOM\.docker\cli-plugins\docker-scout.exe

Server:
ERROR: request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.55/info, check if the server supports the requested API version
errors pretty printing info
~~~

</details>

### P006 · 18 Nov 2026, 12:45 UTC

<details><summary>Pasted text (7 lines)</summary>

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~text
PS C:\Users\ABCOM> Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform
Enable-WindowsOptionalFeature : The requested operation requires elevation.
At line:1 char:1
+ Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlat ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [Enable-WindowsOptionalFeature], COMException
    + FullyQualifiedErrorId : Microsoft.Dism.Commands.EnableWindowsOptionalFeatureCommand
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

</details>

### P007 · 18 Nov 2026, 12:51 UTC

~~~text
PS C:\Users\ABCOM> winget install Apache.Maven
No package found matching input criteria.
~~~

### P008 · 18 Nov 2026, 12:54 UTC

<details><summary>Pasted text (5 lines)</summary>

~~~text
ABCOM@DESKTOP-DOD811U MINGW64 ~
$ ./start-infra.sh   # PostgreSQL, Kafka, Redis, Keycloak
./start-app.sh     # builds with Maven and starts Claims Service, BFF, UI
bash: ./start-infra.sh: No such file or directory
bash: ./start-app.sh: No such file or directory
~~~

</details>

### P009 · 18 Nov 2026, 12:55 UTC

<details><summary>Pasted text (8 lines)</summary>

~~~~text
PS C:\Users\ABCOM> mvn -version.
mvn : The term 'mvn' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the
spelling of the name, or if a path was included, verify that the path is correct and try again.
At line:1 char:1
+ mvn -version.
+ ~~~
    + CategoryInfo          : ObjectNotFound: (mvn:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
~~~~

</details>

### P010 · 18 Nov 2026, 13:16 UTC

~~~text
All logins are logged in, and Swagger is also opened. All five URLs are in the open state. Now what to do?
~~~

### P011 · 18 Nov 2026, 13:22 UTC

~~~text
first, tell me: in this project, how many applications are there? For those applications, what do I have to do?
~~~

### P012 · 18 Nov 2026, 13:28 UTC

~~~text
I'm a tester. I don't know anything about the application. Please explain this folder to me. I don't know anything in depth as a fresher. I need to understand the project folder and what it contains.
~~~

### P013 · 18 Nov 2026, 14:01 UTC

~~~text
Keycloak admin (login users)	
Kafka UI (watch the event messages)	 --- where this code written
~~~

### P014 · 18 Nov 2026, 14:03 UTC

~~~text
by these 2 , what QA should do
~~~

### P015 · 18 Nov 2026, 14:20 UTC

<details><summary>Pasted text (5 lines)</summary>

~~~text
here, I have the three apps:
- demo app
- Keycloak administration app
- Kafka app
Are there any dependencies between these three, between the UI, login credentials, and all? Why have they given the three apps for this work?
~~~

</details>

### P016 · 18 Nov 2026, 14:29 UTC

<details><summary>Pasted text (5 lines)</summary>

~~~text
we have three applications. Out of these, give one scenario that links them to each other.

In the Keycloak application, I have created sai@red.gmail.com. I am able to log out of Keycloak and log in with the same Keycloak account. How is the created account in Keycloak useful for the demo app, and how is it linked with Kafka? How are these interlinked?

Give one scenario so that I can perform it and I can understand how it is going to work.
~~~

</details>

### P017 · 18 Nov 2026, 14:39 UTC

~~~text
[image attached]
[image attached]
I submitted claims in the demo application, but I can't see the conversation in Kafka. I have provided you the screenshots. You can check there.
~~~

### P018 · 18 Nov 2026, 14:42 UTC

~~~text
this is a bug, but from the README file, what are they expecting? I need to log the bug. I need to fix it, or what?
~~~

### P019 · 18 Nov 2026, 14:46 UTC

<details><summary>Pasted text (40 lines)</summary>

~~~text
## Real-Time Events — Two Modes

Claim events are pushed to the UI in real time via WebSocket. There are two ways to generate those events — choose one. Running both simultaneously causes duplicate notifications.

### Mode 1: Direct Kafka (default)

The Claims Service publishes events directly to Kafka after each write. No extra setup needed.

`APP_EVENTS_CDC_ENABLED=false` is set by default in `docker-compose.apps.yml`. Just run the normal startup above.

---

### Mode 2: Change Data Capture via Debezium

Debezium monitors the PostgreSQL WAL (write-ahead log) and publishes database changes to Kafka. The BFF consumes these CDC events.

**Step 1** — In `docker-compose.apps.yml`, set:
```yaml
APP_EVENTS_CDC_ENABLED: "true"
```

**Step 2** — Start the app (infra + app must be running first):
```bash
./start-app.sh
```

**Step 3** — Start Debezium after the app is healthy:
```bash
./start-cdc.sh
```

**Verify connector is running:**
```bash
curl http://localhost:8083/connectors/claims-connector/status | python3 -m json.tool
```
You should see `"state": "RUNNING"` for both the connector and its task.

**Stop CDC:**
```bash
./stop-cdc.sh
~~~

</details>

### P020 · 18 Nov 2026, 14:46 UTC

~~~text
Setting: APP_EVENTS_CDC_ENABLED=true, and you must run ./start-cdc.sh to start Debezium.
~~~

### P021 · 18 Nov 2026, 14:51 UTC

<details><summary>Pasted text (7 lines)</summary>

~~~text
The QA work the project asks for
The app ships with unit tests, and you're expected to add more:

Fix the broken unit test. Run mvn test inside code/claims-service and code/bff-service, and npm test inside code/demo-app-ui.
Write Playwright end-to-end tests. They go in code/demo-app-ui and run with npx playwright test. The folder is set up but has no tests yet.
Add integration tests (Testcontainers) and contract tests (Pact). Both are set up but have no tests yet.
Optionally, add load tests (k6 or Gatling), a test strategy document and manual test scripts.
~~~

</details>

### P022 · 18 Nov 2026, 15:20 UTC

~~~text
the changes done in Visual Studio are not reflecting in Git Desktop. Why? What is the reason?
~~~

### P023 · 18 Nov 2026, 16:11 UTC

~~~text
Why are changes not reflecting in Git Desktop?
~~~

### P024 · 18 Nov 2026, 16:15 UTC

~~~text
[image attached]
~~~

### P025 · 19 Nov 2026, 11:11 UTC

<details><summary>Pasted text (11 lines)</summary>

~~~text
First run: ~2–3 min (image downloads). Subsequent starts: ~30 seconds.

### URLs

| What | URL | Credentials |
|------|-----|-------------|
| **Demo App UI** | http://localhost:3001 | See test users below |
| BFF Swagger | http://localhost:8090/swagger-ui.html | — |
| Claims Swagger | http://localhost:8080/swagger-ui.html | — |
| Keycloak Admin | http://localhost:8180 | `admin` / `Admin123!` |
| Kafka UI | http://localhost:9093 | — |
~~~

</details>

~~~text
 run
~~~

### P026 · 19 Nov 2026, 11:15 UTC

~~~text
Understand the whole project and everything about it so that I can understand the test strategy and all.
~~~

### P027 · 19 Nov 2026, 11:16 UTC (sent while the AI was working)

~~~text
Explain to me: नकली अपचा.
~~~

### P028 · 19 Nov 2026, 11:17 UTC (sent while the AI was working)

~~~text
For 33 changes, they are there in Git Desktop. I think those came while doing a Maven build. You can add those in git ignore if it is a Maven build and if it is not required, then only. If it is required, tell me.
~~~

### P029 · 19 Nov 2026, 11:25 UTC

~~~text
option 1
~~~

### P030 · 19 Nov 2026, 11:40 UTC

~~~text
explain R3
~~~

### P031 · 19 Nov 2026, 11:42 UTC

~~~text
can you explain in one line? I do not understand anything about R3.
~~~

### P032 · 19 Nov 2026, 11:51 UTC

~~~text
explain 12th point
~~~

### P033 · 19 Nov 2026, 11:55 UTC

~~~text
give a message to commit.
~~~

### P034 · 19 Nov 2026, 11:57 UTC

~~~text
Test case design - no test case document. The only cases are Playwright tests: some are UI tests, and some are API tests, with one line per file in the table. No IDs, steps, boundaries, or data-driven cases. In UI, it should cover the positive and negative test cases, all kinds of test cases. Around 15 tests, you can write. In API also, follow the same. Security, like that. First, write the document for this.
~~~

### P035 · 19 Nov 2026, 12:02 UTC

<details><summary>Pasted text (7 lines)</summary>

~~~text
don't concentrate on the login test cases. Concentrate on this app. Mainly, as a QA, you have to concentrate on the claim, the things, and the approving-by-admin status maintained by admin: whether that status is approved by admin or not after approving, and whether it is reflecting in the user or not.

You can write login test case 1, but don't concentrate too much on login. You have to concentrate on this for API and for UI, for both.

For security purposes, all the admin claims should not display on the user clients. For admin, all user claims should be displayed. Displayed for user only, the claim he or she raised should be displayed like that.

If required, I know one admin and one user are there. If required, you can create another admin or another user also, so that you can create with both the users and differentiate in terms of security like this, not the username/password.
~~~

</details>

### P036 · 19 Nov 2026, 12:08 UTC

<details><summary>Pasted text (9 lines)</summary>

~~~text
test cases should contain:
- test ID
- description
- prerequisite
- steps
- expected result
- test data for that test
- what test data is required
like that, which would be clear.
~~~

</details>

### P037 · 19 Nov 2026, 12:09 UTC (sent while the AI was working)

~~~text
Write 10 tests for UI and 10 tests for API. Both contain positive, negative, and other kinds of testing test cases. Security
~~~

### P038 · 19 Nov 2026, 12:15 UTC

~~~text
give git commit message
~~~

### P039 · 19 Nov 2026, 12:15 UTC

~~~text
based on the test cases, if you want to update the test strategy, you can update it.
~~~

### P040 · 19 Nov 2026, 12:17 UTC

~~~text
give the commit message now.
~~~

### P041 · 19 Nov 2026, 12:19 UTC

~~~text
[image attached]
now listen correctly. You have to write a Playwright automation test in a good structure. It should be a strict TypeScript config with:
- traces
- screenshots
- video
- page object
It should follow:
- fixture
- semantic locators
- get by role
- get by label
- a few negative paths
For the negative path, it already contains the test cases in test cases.md. Again, it's a self-built app, and validation status.md says tests were never run.-- I will provide you with one screenshot. You have to follow the coding strategy from that screenshot.
~~~

### P042 · 19 Nov 2026, 12:21 UTC (sent while the AI was working)

~~~text
We have not had any Playwright tests until now. You have to structure the frame, and for user credentials, you have to add a .env file in that to maintain the credentials. For what is that? For API, maintain another folder, and for UI, maintain another folder. You should strictly follow the page object model so that you can reuse it. Naming convention should be clear according to the test. Refer to the testcases.md file and accordingly implement each and every test case. Data is there. You can create by an API call, or you can create by a mock folder. If data is needed, then user B is not there, likewise.
~~~

### P043 · 19 Nov 2026, 12:37 UTC (sent while the AI was working)

~~~text
The test is related to create. Then you can write two tests in one file. No need for one test case in a single file, so that the number of files can get decreased.
~~~

### P044 · 19 Nov 2026, 12:49 UTC

~~~text
if you find any defects, you can create one file, defects.md, and you can write ID, type, severity, and screenshots. You can add them there.
~~~

### P045 · 19 Nov 2026, 12:51 UTC

~~~text
BFF Swagger | http://localhost:8090/swagger-ui.html | — |
| Claims Swagger | http://localhost:8080/swagger-ui.html | — |  --For Swagger documentation, if you want, you can refer to this if you want anything related to the API.
~~~

### P046 · 19 Nov 2026, 13:06 UTC

<details><summary>Pasted text (6 lines)</summary>

~~~text
unit test already developed, and it's running in the background. In the meantime, explain to me:
- what changes were done
- in which folders
- why they were done
- how many tests it contains
Like that, explain to me.
~~~

</details>

### P047 · 19 Nov 2026, 13:06 UTC (sent while the AI was working)

~~~text
Not unit test, flayright test
~~~

### P048 · 19 Nov 2026, 13:07 UTC

~~~text
right now, why is the demo app broken?
~~~

### P049 · 19 Nov 2026, 13:21 UTC

~~~text
remove that from git ignore then.
~~~

### P050 · 19 Nov 2026, 13:23 UTC

<details><summary>Pasted text (8 lines)</summary>

~~~text
write 10 API tests and 10 browser tests. Why have you written 73 and 49? I don't want all.
The folder structure should be:
- The commons folder should be there and contain the common methods.
- The page object folder should be there under that.
- Pages and object should be there.
- Under pages, it should contain the page object model structure.
- Under pages, an object like that, follow.
In this, don't follow the structure that it's following currently. What I have told, follow that. Don't write more than 10 tests. This is the strict rule.
~~~

</details>

### P051 · 19 Nov 2026, 13:24 UTC

~~~text
hey, you have uncommented that from the git ignore, but why are there so many changes, other than Playwright test and E2E test changes?
~~~

### P052 · 19 Nov 2026, 13:25 UTC

~~~text
src/lib/api/generated/ (new)-- why are these changes required?
~~~

### P053 · 19 Nov 2026, 13:45 UTC

~~~text
now tell me how many Playwright tests there are.
~~~

### P054 · 19 Nov 2026, 13:46 UTC

~~~text
59 changes are there in GitDesktop. Why? All are not related to Playwright changes. What are the other changes? Why are those required?
~~~

### P055 · 19 Nov 2026, 13:48 UTC

~~~text
Recommendation: restore that ignore rule. That removes these 35 changes and puts the file back exactly as it was.
~~~

### P056 · 19 Nov 2026, 13:48 UTC

~~~text
pageObject folder should be outside the common folder.
~~~

### P057 · 19 Nov 2026, 13:53 UTC

~~~text
test data should be in another folder where it maintains the test data. I think ENB should be outside of the folder, inside the U2E, and outside, I think, and fixtures also. I don't know exactly where it should be. Decide from here and about the fixtures, and again give the structure of the folder.
~~~

### P058 · 19 Nov 2026, 13:58 UTC

~~~text
Why are UI tests not displaying under the testing area?
~~~

### P059 · 19 Nov 2026, 13:59 UTC

~~~text
why, no, no, no, no. 26 file changes are there. In which folder are all the file changes?
~~~

### P060 · 19 Nov 2026, 13:59 UTC

~~~text
execute UI test. I have executed it, but all are failing. Check it and tell the reason why.
~~~

### P061 · 19 Nov 2026, 14:41 UTC

~~~text
give a git commit message.
~~~

### P062 · 19 Nov 2026, 14:43 UTC

~~~text
write the defects.md file. Whatever defects you find, those defects. By ID, step, severity, and screenshot
~~~

### P063 · 19 Nov 2026, 14:47 UTC (sent while the AI was working)

~~~text
Defects, not spec file, defect.md, where you can add screenshots there in the MD file only.
~~~

### P064 · 19 Nov 2026, 14:50 UTC

~~~text
give a commit message.
~~~

### P065 · 19 Nov 2026, 14:51 UTC

~~~text
utils should be another folder so that any other code related to utils, we can add there as a new file.
~~~

### P066 · 19 Nov 2026, 14:52 UTC (sent while the AI was working)

~~~text
Give a commit message for this.
~~~

### P067 · 19 Nov 2026, 14:55 UTC

~~~text
[image attached]
up to now, I have implemented all of these and committed my changes to. Now give me the MD file so that, by using that MD file, I can easily go through the architecture and give the presentation about this.
~~~

### P068 · 19 Nov 2026, 15:00 UTC

~~~text
give me a message to commit.
~~~

### P069 · 19 Nov 2026, 15:02 UTC

~~~text
now create AI general. Whatever prompts, give the nice prompts with the correct description, like race in the form of race full form. You need to 
~~~

<details><summary>Pasted text (9 lines)</summary>

~~~text
you need to give all prompts for different categories for test strategy:
- test strategy prompt
- test case design prompt
- Playwright automation prompt
- structure prompt for writing the code structure
- defect writing prompt
- UI testing prompt
- API testing prompt
For all these, give the prompts.
~~~

</details>

### P070 · 19 Nov 2026, 15:04 UTC

~~~text
give the commit message.
~~~

### P071 · 19 Nov 2026, 15:06 UTC

~~~text
now create the cloud folder for writing the test strategy based on our input. If there is any input we are giving for this and that, based on the input, it should give the .md file output. It should write the test strategy. Make this a skill and add it in the cloud folder. , same: based on the input, it should write the test case design document.md file. This should also be a skill. ,
~~~

### P072 · 19 Nov 2026, 15:07 UTC

~~~text
[image attached]
Write a .md file for this.
~~~

### P073 · 19 Nov 2026, 15:09 UTC

~~~text
Write the agent to write the Playwright test. The user will give the input: what the test case is. Go through the demo app, understand the DOM structure, and get the locators. Based on that, you can write. Strictly, it should follow the POM model.

Test cases should be anything: UI or API. Any test cases, you have to write. Write the agent so that, based on the agent, if I give the input, it should work on it. Also, go through the database, UI, backend, frontend architecture, everything. Understand the structure of the project, and accordingly, you can write your things.
~~~

### P074 · 19 Nov 2026, 15:11 UTC (sent while the AI was working)

~~~text
.claude folder should be inside the project.
~~~

### P075 · 19 Nov 2026, 15:21 UTC

~~~text
[image attached]
mwans what
~~~

### P076 · 19 Nov 2026, 15:23 UTC

~~~text
fix this file error if there is one.
~~~

### P077 · 19 Nov 2026, 15:26 UTC

~~~text
fix
~~~

### P078 · 19 Nov 2026, 15:28 UTC

~~~text
Give the list of defects that you found. I will check manually once and give the steps too.
~~~

### P079 · 20 Nov 2026, 05:34 UTC

~~~text
explain about R3
~~~

### P080 · 20 Nov 2026, 06:10 UTC

~~~text
For this application, there should be one or more than one admin.
~~~

### P081 · 20 Nov 2026, 06:32 UTC

~~~text
what is admin2 passsword
~~~

### P082 · 20 Nov 2026, 06:33 UTC

~~~text
no where admin2 is needed
~~~

### P083 · 20 Nov 2026, 07:18 UTC

~~~text
remove about admin2 in all places that i added before
~~~

### P084 · 20 Nov 2026, 07:21 UTC

~~~text
none of the tests are related to admin2
~~~

### P085 · 20 Nov 2026, 07:22 UTC

~~~text
give commit msg
~~~

### P086 · 20 Nov 2026, 07:30 UTC

<details><summary>Pasted text (7 lines)</summary>

~~~text
explain to me about Playwright automation fully:
- where the username is coming from
- how many test cases there are
- what the expected results are
- what the test case does
- in which folder its data is
Everything.
~~~

</details>

### P087 · 20 Nov 2026, 07:42 UTC

~~~text
why fixtures file having errors
~~~

### P088 · 20 Nov 2026, 07:44 UTC

~~~text
comiit msg
~~~

### P089 · 20 Nov 2026, 07:46 UTC

~~~text
I have selected one test. Explain that test: when the test is open and running the browsers, into which file it will go, and then, after running the browsers, which it will call like that. In depth, explain for the whole testing tool.
~~~

### P090 · 20 Nov 2026, 07:52 UTC

~~~text
forbidden in config file means
~~~

### P091 · 20 Nov 2026, 07:56 UTC

~~~text
explain this line: where it stays, coming from, and how it is using
~~~

### P092 · 20 Nov 2026, 08:06 UTC

~~~text
remove the interface. Why are interfaces returning the fixtures?
~~~

### P093 · 20 Nov 2026, 08:09 UTC

~~~text
About the small interface, only the top is different, like the claimant pages and pages.
~~~

### P094 · 20 Nov 2026, 08:10 UTC

~~~text
tell about the fixtures interface. Why is it required?
~~~

### P095 · 20 Nov 2026, 08:13 UTC

~~~text
[image attached]
[image attached]
Explain about these defects and tell me whether all these defects are in the defects.md file or not.
~~~

### P096 · 20 Nov 2026, 08:17 UTC

~~~text
now, first, give me the defects list that is there in the application, and compare against whether defects.md contains it or not.
~~~

### P097 · 20 Nov 2026, 08:19 UTC

~~~text
give the full list of defects. Only 19 are given, but the rest already have some there, like non-defect 19 already there, 13, 4 missing, 1, 1 missing, like that is there. Give the full list.
~~~

### P098 · 20 Nov 2026, 08:39 UTC

~~~text
give high CVRT bugs with steps so that I will reproduce it.
~~~

### P099 · 20 Nov 2026, 08:40 UTC

<details><summary>Pasted text (4 lines)</summary>

~~~text
```bash
./start-infra.sh   # Start PostgreSQL, Kafka, Redis, Keycloak
./start-app.sh     # Build JARs + start Claims Service, BFF, UI
```
~~~

</details>

### P100 · 20 Nov 2026, 08:42 UTC

~~~text
add critical and high-priority bug defects in the defects.md file. Remove low, medium, and low-medium bugs from there. In that, add required steps and screenshots to understand easily.
~~~

### P101 · 20 Nov 2026, 08:55 UTC

~~~text
out of this, are there any UI defects?
~~~

### P102 · 20 Nov 2026, 08:58 UTC

~~~text
Give a commit message.
~~~

### P103 · 20 Nov 2026, 09:02 UTC

~~~text
how to do step 3?
~~~

### P104 · 20 Nov 2026, 09:07 UTC

~~~text
[image attached]
where can I see from here, like the fourth point in defect 8?
~~~

### P105 · 20 Nov 2026, 09:12 UTC

~~~text
by seeing the logs, how can I differentiate the 50 admin and 50 client that are creating?
~~~

### P106 · 20 Nov 2026, 09:13 UTC

~~~text
Claimant claim creation. Admin is what admin will create.
~~~

### P107 · 20 Nov 2026, 09:15 UTC

~~~text
by creation of claimant, where is the user ID in the Docker? Where can I see it? 6898 something
~~~

### P108 · 20 Nov 2026, 09:24 UTC

~~~text
what is  Actuator
~~~

### P109 · 20 Nov 2026, 09:26 UTC

~~~text
for every defect, add why it is needed and why it is considered as a defect also.
~~~

### P110 · 20 Nov 2026, 09:36 UTC

~~~text
explain to me clearly about the contract testing.md file.
~~~

### P111 · 20 Nov 2026, 11:52 UTC

~~~text
whicn date it will get
~~~

### P112 · 20 Nov 2026, 11:53 UTC

~~~text
date.toISOString().slice(0, 10); - explain
~~~

### P113 · 20 Nov 2026, 11:53 UTC

~~~text
what to ISO string does `slice` do?
~~~

### P114 · 20 Nov 2026, 11:57 UTC

~~~text
execute API test and open the report.
~~~

### P115 · 20 Nov 2026, 11:58 UTC

~~~text
why is one an error?
~~~

### P116 · 20 Nov 2026, 12:00 UTC

~~~text
execute UI test and open the report.
~~~

### P117 · 20 Nov 2026, 12:05 UTC

~~~text
my Playwright test: I'm not having screenshots after the `expect` statement. Can you add? While tracing in the report, I am able to see the screenshot.
~~~

### P118 · 20 Nov 2026, 12:22 UTC

~~~text
trace on and execute, and open the report.
~~~

### P119 · 20 Nov 2026, 12:29 UTC

~~~text
[image attached]
it's showing a red color cap on every step. Is it a failure or what?
~~~

### P120 · 20 Nov 2026, 12:34 UTC

~~~text
give commint message
~~~

### P121 · 20 Nov 2026, 12:36 UTC

~~~text
Don't commit tests/ui/tmp/probe.ui.spec.ts. It's a debug script, not a real test:-- to add in git ignore or
~~~

### P122 · 20 Nov 2026, 12:44 UTC

~~~text
ok
~~~

### P123 · 20 Nov 2026, 12:45 UTC

~~~text
[image attached]
why error
~~~

### P124 · 23 Nov 2026, 07:08 UTC

<details><summary>Pasted text (53 lines)</summary>

~~~text
This checklist requires 7 deliverables, and every item must be completed before submission.

1. AI Journal

Every prompt used is recorded across all deliverables
Prompts are copied exactly as written (not summarized)
2. Architecture

Short architecture diagram included
Main components and connections labeled
3. Test Strategy

Risks listed
Scope defined (in scope / out of scope)
Entry criteria defined
Exit criteria defined
4. Test Cases

Written using the provided test case template
Positive test cases included
Negative test cases included
Test data listed
5. Playwright UI Tests

Tests written for the claims application
5–10 tests covering positive and negative scenarios
Page Object Model (POM) implemented
Fixtures used for setup and shared objects
Assertions present in every test
Screenshots captured
Video recording of test execution captured
Playwright best practices followed:
No fixed sleeps
Stable locators
Clear test names
No hard-coded credentials
6. API Tests

Schema validation included
Validations included:
Status codes
Response fields
Invalid input scenarios
Missing input scenarios
7. Defect Report

Defect logged using the provided template
Every field completed
Screenshot or video evidence attached
Final Submission Check

All 7 sections above are fully completed
All 7 deliverables are included in the submission
~~~

</details>

~~~text
   -- is all are covered .?
~~~

### P125 · 23 Nov 2026, 07:15 UTC

~~~text
Now, missing things and weak spots as a reviewer: fix it.
~~~
