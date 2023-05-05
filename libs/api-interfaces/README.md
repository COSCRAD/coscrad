# api-interfaces

This library was generated with [Nx](https://nx.dev).

## About

This library enables us to share core types and interfaces between the back-end via the API (`api`) and the front-end (`coscrad-frontend`). This
gives us a static representation of our contract between the API and client.

## Use Cases

### Sharing view-model interfaces

View-models are represented by classes in the back-end. We constrain
each view-model class to implement a view model interface. This view-modle
interface is then used to build query response types, which are used
for type-safety when building front-end views.

## Relationship to tests

Note that the type safety provided by this approach is independent of and
in addition to the a set of contract tests of the `api`. If the actual
response returned from a query endpoint in one of these tests changes, a
snapshot will break, allerting the developer that the contract with the client
has changed and hence `coscrad-frontend` should be updated to accommodate this.
