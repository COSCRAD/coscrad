# @coscrad/data-types

## About

This library was generated with [Nx](https://nx.dev).

The purpose of this library within our COSCRAD monorepo is to define our own
custom set of data types. These types (and even their validation logic) can be
shared with the client, and also can be used to generate API documentation. We
achieve this by providing a set of `Custom Data Type` decorator factory functions,
along with a utility function `getCoscradDataSchema`, which allows one to retrieve
the custom data type via Reflection by leveraging
[reflect-metadata](https://www.npmjs.com/package/reflect-metadata).

One use of this library is to simplify the management of payload schemas for commands.
We translate these schemas to a form specification and share these with the client
for dynamic form rendering.

## Usage

This library is based on decorators (specifically property decorators) and hence
it works with classes. To define a schema for a class,
decorate each property using the appropriate `Custom Data Type` decorator factory
function. Provide a label and description for each property.

Use the `isOptional` and `isArray` options as needed. Note that these affect
validation. Keep in mind that whenver `isArray` is true, setting `isOptional` to
false indicates that the array may not be empty. This is consistent with our
coding convention of requiring empty arrays for properties that are unspecified
so to avoid two different representations of emptiness.

```ts
class Foo {
    @NonEmptyString({
        label: `title`,
        description: `the title of the foo`,
    })
    readonly title: string;

    @NonEmptyString({
        label: `aliases`,
        description: `alternative nicknames for the foo`,
        isOptional: true, \
        isArray: true
    })
    readonly aliases?: string[];

    // The schema for `bars` will be built from that of the `Bar` class
    @NestedDataType(Bar, {
        label: `bars`,
        description: `the foo's bars`,
        isArray: true,

    })
    readonly bars: Bar[];

    @NonEmptyString({
        label: `link`,
        description: `a link to the foo's specification sheet`,
        isOptional: true
    })
    readonly lyrics?: string;

    @URL({
        label: `link`,
        description: `a link to a demo video for this foo`,
    })
    readonly link: string;

    @NonNegativeFiniteNumber({
        label: `clip length`,
        description: `the length of the demo video`,
    })
    readonly clipLength: number;
}
```

Note that in the above example, we leverage the `@NestedDataType` decorator factory
function, passing it a reference to a class, `Bar`, from which we would like to pull
the schema for the nested property `bars`.

### Obtaining a Schema

To retrieve the data schema of a class, `Foo`, at run-time, call

```ts
getCoscradDataSchema(Foo);
```

Note that if you call `getCoscradDataSchema` with a class that has not been
decorated, you will receive an empty object (i.e. `{}`) as the schema. This
allows you to "opt-in" to defining your custom schema gradually.

### Validating an Object against the Schema

Validate an object against the schema for a class as follows:

```ts
const errors = validateCoscradModelInstance(getCoscradDataSchema(Foo), input, {
    forbidUnknownValues: true,
});
```

Note that when validating external data (e.g. a creation Data Transfer Object (DTO) from
the client), you should always set the `forbidUnknownValues` option to true. Also note
that the validation does not require the input object to be an instance of your class.
Finally, note that this logic is encapsulated in the domain model factories within
the COSCRAD back-end.

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
