# Coscrad Frontend e2e

## Quick Start

2 shell scripts have been provided. Within `apps/coscrad-frontend-e2e`, run

> > bash open.sh
> > To run Cypress in interactive dev mode. You should have Chrome installed on your machine.

Run

> > bash run.sh
> > to run all cypress tests in headless mode.

**Warning**
Note that you need to start the front-end and back-end. Currently
`npm run serve:all` defaults `NODE_ENV` to `development`. You'll need to make sure
you are connecting to the e2e database in development if using this approach.

<!-- TODO fix this! -->

## Philosophy

We use Cypress for end-to-end (e2e) automated browser testing. We have comprehensive
tests on the back-end. It is not our goal to test all functionality of the back-end
with these Cypress tests. Instead, we write sanity checks of all flows. We are
more interested in testing UX concerns, such as:

-   Are error messages displayed when appropriate
-   Is a loading spinner displayed at the appropriate time
-   Does client-side validation prevent submission of incomplete forms?
-   Do updates show up on the screen after a successful command (state update on the back-end)
-   Do the correct user actions (command buttons at this point) show up depending on the state of a resource and the user's identity?

## Kinds of e2e tests

Our system consists of a "big index-to-detail" flow augmented by a web-of-knowledge
(connected resources and notes). Non-admin users traverse this query flow.

We also provide a command system for admin users to create, update, categorize,
and annotate resources within the web-of-knowledge.

Most of our e2e tests are either query flow or command flow tests.

### Query Flow Tests

For query flow tests, we

-   seed the state required to test all user interactions with a single
    -   resource index page
        -   tabulation and search filters (including special chars)
        -   navigation to a detail page
    -   detail page
        -   any interaction with the view (e.g. vocabulary list filtering, page traversal for digital texts)
        -   notes panel
        -   connected resources panel

### Command Flow Tests

E2e tests are known to be slow and sometimes flakey. This is the inherent nature
of automated browser testing as compared to unit testing. So while an ideal situation
would be to test full command scenarios (sequences of several commands to achieve
a full use case), we isolate individual commands one at a time in e2e tests.

The naming convention for command test files is `{resource-type}.${TARGET_COMMAND_TYPE}`, for example
`vocabulary-list.CREATE_VOCABULARY_LIST.e2e.cy.ts`. Such a test will

-   set up the initial state using the CLI helpers via `Cy` commands
-   log in (using credentials is `cypress.env.json`)
-   navigate to the correct admin view and open the corresponding form
-   fill out the form in part or full and assert the correct result
    Note that we also check that the command buttons are not available in the non-admin context.
