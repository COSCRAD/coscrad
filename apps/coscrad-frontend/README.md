# @coscrad/coscrad-frontend

This project was generated with [Nx](https://nx.dev).

## About

This app serves as the client for COSCRAD `api`. Currently, we use a `content config`
to allow flexible configuration, including

-   configuring index-to-detail flows
    -   creating multiple such flows per resource type using "prefilters"
    -   applying custom labels and routes
-   enabling or disabling the web-of-knowledge
    -   connected resources panel
    -   resource notes panel
    -   category tree (Tree of Knowledge)
-   enabling and populating content for front matter

This allows for each deployment to have a highly customized front-end build. A single
tenant may even have different front-end builds for public (query flow) and admin users
(command-flow).

We anticipate outgrowing this approach fairly soon as the complexity of this config
and its validation become unwieldy. At this point, `coscrad-frontend` will become
a lib that one can import and use to configure and bootstrap the web-of-knowledge client,
building any custom functionality around this in a custom react project.

## Development

### Running for Dev

To run just the front-end, run

> > npx nx serve coscrad-frontend

To run the front-end and back-end concurrently from a single command, run

> > npm run serve:all

Note that you will need to have the backend configured in the `api` application, including a working instance of ArangoDB that is linked in your `.env.` See the [docs for `api`](../api/README.md) for more information.

### Redux DevTools Browser Plugin

To inspect the in-memory front-end state stored in Redux, use Redux DevTools in [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd), [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei), or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/).

See [Redux DevTools](https://github.com/reduxjs/redux-devtools)

### Unit Tests

To run all of the jest tests, run

> > npx nx test coscrad-frontend

To run a single test by name, run

> > npx nx test coscrad-frontend --test-file=<mytest.spec.tsx>

To run a single test by RegExp, run

> > npx nx test coscrad-frontend --test-path-pattern=<PATTERN_TO_MATCH>

In the event that a Jest snapshot fails, first run the single test with a failing snapshot in isolation. To accept the snapshot changes, rerun the test with the -u flag as follows:

> > npx nx test coscrad-frontend -- --test-file=<name-of-test-file> -u

### Cypress end-to-end Tests

Cypress is our platform for automated browser end-to-end and integration testing. Our Cypress tests live in a dedicated application within the monorepo.

To run Cypress for development, run

> > cd apps/coscrad-frontend-e2e
> > npx cypress open

## Architecture

We use Redux for state management. To expose a new aggregate root on the client,
you must first implement a slice for this aggregate using `Redux`, `Redux Toolkit`,
and our custom utilities. You then expose custom hooks that provide a `Loadable`
(set of) resource view model(s).

### Loadables

The `Loadable` interface accommodates an error state, loading state, or a loaded state
(`data !== null` and `error=null`, `isLoading=false`). We also provide the utilities
`displayLoadableSearchResult` and `displayLoadableWithErrorsAndLoading`. You can use
these to wrap a presenter. The abstractions will ensure that the data only hits the
presenter when the state is `loaded`. In case you need to provide a mapping from loaded
data to the presenter's props, there is an extra argument available.

### Presenters and Containers

A container's job is to gather required state from memory (Redux), the config, and the environment (e.g. Location, Date)
and relay this to a presenter via props.

We have set up some infrastructure that allows for a division of labour when adding
new resources. Upon creating the Redux slice and registering custom hooks, it is only
necessary to create and register the

-   full-view presenter
-   detail-presenter
-   index-presenter
    for the given resource. Provided that you have exposed the index-to-detail flow
    for this resource in your content config, the presenters will just "show up".

#### Index Presenters

When defining an index presenter, use the `IndexTable` generic component. Define
headings and labels (`HeadingLabel<ITermViewModel>[]`) and cell renderers
(CellRenderersDefinition<ITermViewModel>) and register your filterable properties.

You may also specify `matchers`, a lookup table that defines for each listed
property how to determine whether some search terms should match the value
in a given cell. This is flexible enough to support, for example, simple query
languages (e.g., '>5' matches any vocabulary list that has `entries.length>5`).

#### Detail Presenters

Currently, detail presenters come in 2 variations:

-   full-view
-   thumbnail

Full-view are typically used in resource detail views (although you can configure the system to use thumbnails for this).

Thumbnail views are typically used in a panel view for

-   connected resource panel (Web of Knowledge)
-   category tree (Tree of Knowledge)
-   notes
-   tags

For consistency, we provide the generic presenters `ResourceDetailThumbnailPresenter` and `ResourceDetailFullviewPresenter`. As an escape hatch, it is possible to register a thumbnail or full-view presenter that doesn't use one of these generic presenters, but this should only be done with consensus.

The standard game is to adapt the resource view model to the generic presenter in the resource detail views. Think of the generic presenters as a design standard similar to a MUI Card, for example.

<!-- TODO Design team- add styling conventions \ best practices -->
