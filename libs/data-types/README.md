# @coscrad/data-types

## About

This library was generated with [Nx](https://nx.dev).

The purpose of this library within our Coscrad monorepo is to define our own
custom set of data types. These types (and even their validation logic) can be
shared with the client, and also can be used to generate API documentation. We
achieve this by providing a set of `Custom Data Type` decorator factory functions,
along with a utility function `getCoscradDataSchema`, which allows one to retrieve
the custom data type via Reflection by leveraging
[reflect-metadata](https://www.npmjs.com/package/reflect-metadata).

Further, we encapsulate validation rules for said data
types using our own validation library (@coscrad/validation), which includes
a set of validation decorators and validation functions.

One use of this library is to simplify the management of payload schemas for commands.

## Usage

This library is based on decorators (specifically property decorators) and hence
it works with classes. To define a schema for a class,
decorate each property using the appropriate `Custom Data Type` decorator factory
function. Use the `isOptional` and `isArray` options as needed.

```ts
class Foo {
    @NonEmptyString()
    readonly title: string;

    @NonEmptyString({ isOptional: true, isArray: true })
    readonly aliases?: string[];

    @NestedDataType(Bar, { isArray: true })
    readonly bars: Bar[];

    @NonEmptyString({ isOptional: true })
    readonly lyrics?: string;

    @URL()
    readonly link: string;

    @NonNegativeFiniteNumber()
    readonly clipLength: number;
}
```

Note that in the above example, we leverage the `@NestedDataType` decorator factory
function, passing it a reference to a class, `Bar`, from which we would like to pull
the schema for the nested property `bars`.

To retrieve the data schema of a class, `Foo`, at run-time, call

```ts
getCoscradDataSchema(Foo);
```

Note that if you call `getCoscradDataSchema` with a class that has not been
decorated, you will receive an empty object (i.e. `{}`) as the schema. This
allows you to "opt-in" to defining your custom schema gradually.

## Contributing

To contribute, simply add an additional decorator factory under
`/libs/data-types/src/lib/decorators`. Be sure to update the test suite at
`/libs/data-types/src/test/custom-data-schema.spec.ts`. You should add additional
properties to the test class that are decorated with your new decorator and ensure
that the resulting snapshot captures the schema correctly.

### Building

Run `nx build data-types` to build the library.

### Running unit tests

Run `nx test data-types` to execute the unit tests via [Jest](https://jestjs.io).
