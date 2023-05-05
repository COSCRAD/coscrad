# @coscrad/validation-constraints

This library was generated with [Nx](https://nx.dev).

## About

This library consists of a set of predicate functions that check whether
an input satisfies a given constraint. These are leveraged for validation by our
`@coscrad/data-types` library by registering constraints for each data-type.

This library is also used for client-side form validation. We send the constraints
for a field "over the wire" and then validate against said constraints via the
helper `isConstraintSatisfied`.

### Usage

Given a `CoscradConstraint` and an `input` value, determine if the `input` satisfies
the constraint via a call to:

```ts
isConstraintSatisfied(
    constraintName: CoscradConstraint,
    value: unknown
)
```

## Workflow

### Contributing

To add a new constraint `foo`, first register this in the enum `CoscradConstraint` in `coscrad-constraint.enum.ts`.
Then add a test `is-foo.spec.ts` (see existing tests for the format)
and the corresponding predicate function `is-foo.ts`. Finally, register your constraint by
its name in the `constraintsLookupTable` in `is-constraint-satisfied`.

### Running unit tests

Run `nx test validation-constraints` to execute the unit tests via [Jest](https://jestjs.io).

### Running lint

Run `nx lint validation-constraints` to execute the lint via [ESLint](https://eslint.org/).
