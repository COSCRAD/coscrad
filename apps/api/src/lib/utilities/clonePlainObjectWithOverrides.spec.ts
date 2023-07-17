import { isBoolean, isNumber, isString } from '@coscrad/validation-constraints';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { DeepPartial } from '../../types/DeepPartial';
import { clonePlainObjectWithOverrides } from './clonePlainObjectWithOverrides';

type Widget = {
    foo: string;

    bar: number;

    isWorthy: boolean;

    baz: {
        count: number;

        nestedOptional?: string;

        nestedArray: number[];

        deeplyNested: {
            message: string;
        };
    };

    optionalProp?: string;
};

const widgetWithAllProps: Widget = {
    foo: 'foo',
    bar: 5,
    isWorthy: true,
    baz: {
        count: 22,
        nestedOptional: 'I am nested and fortunate to be here',
        nestedArray: [1, 2, 3.55],
        deeplyNested: {
            message: 'I am deeply nested, and proud of it',
        },
    },
    optionalProp: 'I am an optional top-level property',
};

const assertResultIsCorrect = (input: object, overrides: object, expectedResult: object) => {
    const result = clonePlainObjectWithOverrides(input, overrides);

    expect(result).toEqual(expectedResult);

    assertNoReferencesAreShared(input, result);
};

const assertNoReferencesAreShared = (input, output) => {
    if (
        // primitive types cannot share references by definition
        [isNullOrUndefined, isString, isNumber, isBoolean].some((predicate) => predicate(input))
    )
        return false;

    expect(input).not.toBe(output);

    Object.entries(input).forEach(([key, inputValue]) => {
        const correspondingOutputValue = output[key];

        assertNoReferencesAreShared(inputValue, correspondingOutputValue);
    });
};

describe(`clonePlainObjectWithOverrides`, () => {
    describe(`when the overrides are shallow only`, () => {
        const shallowOverrides: Partial<Widget> = {
            foo: 'the new foo',
            bar: 333,
        };

        const expectedResult: Widget = {
            ...widgetWithAllProps,
            ...shallowOverrides,
        };

        it(`should return the expected result`, () => {
            assertResultIsCorrect(widgetWithAllProps, shallowOverrides, expectedResult);
        });
    });

    describe(`when only one nested property on a nested object is overridden`, () => {
        const deepPartialOverrides: DeepPartial<Widget> = {
            baz: {
                count: 304,
            },
        };

        const newBaz = {
            count: 304,
            nestedOptional: 'I am nested and fortunate to be here',
            nestedArray: [1, 2, 3.55],
            deeplyNested: {
                message: 'I am deeply nested, and proud of it',
            },
        };

        const expectedResult = {
            ...widgetWithAllProps,
            baz: newBaz,
        };

        it(`should return the expected result`, () => {
            assertResultIsCorrect(widgetWithAllProps, deepPartialOverrides, expectedResult);
        });
    });

    describe(`when an optional property that is originally missing is overridden`, () => {
        const widgetWithoutOptionalProp: Widget = {
            foo: 'foo',
            bar: 5,
            isWorthy: true,
            baz: {
                count: 22,
                nestedOptional: 'I am nested and fortunate to be here',
                nestedArray: [1, 2, 3.55],
                deeplyNested: {
                    message: 'I am deeply nested, and proud of it',
                },
            },
        };

        const overrides: DeepPartial<Widget> = {
            optionalProp: 'I hope I get born',
        };

        const expectedResult = {
            ...widgetWithoutOptionalProp,
            ...overrides,
        };

        it(`should return the expected result`, () => {
            assertResultIsCorrect(widgetWithoutOptionalProp, overrides, expectedResult);
        });
    });

    describe(`when overriding the entire object`, () => {
        const fullNewWidget: Widget = {
            foo: 'hello world',
            bar: 5.678,
            isWorthy: false,
            baz: {
                count: 22090,
                nestedOptional: 'I am nested and different than my predecessor',
                nestedArray: [],
                deeplyNested: {
                    message: 'Why hello!',
                },
            },
            optionalProp: 'I am a different value than before',
        };

        it(`should return the expected result`, () => {
            assertResultIsCorrect(widgetWithAllProps, fullNewWidget, fullNewWidget);
        });
    });

    describe(`when there is an array property in the overrides`, () => {
        const nestedArray = [0, 5];

        const overrides: DeepPartial<Widget> = {
            baz: {
                nestedArray,
            },
        };

        const expectedResult = {
            foo: 'foo',
            bar: 5,
            isWorthy: true,
            baz: {
                count: 22,
                nestedOptional: 'I am nested and fortunate to be here',
                // this should overwrite the previous value of [1, 2, 3.55],
                nestedArray,
                deeplyNested: {
                    message: 'I am deeply nested, and proud of it',
                },
            },
            optionalProp: 'I am an optional top-level property',
        };

        it(`should override the entire array`, () => {
            assertResultIsCorrect(widgetWithAllProps, overrides, expectedResult);
        });
    });

    describe(`when there are no overrides`, () => {
        it(`should return a clone of the original`, () => {
            assertResultIsCorrect(widgetWithAllProps, {}, widgetWithAllProps);
        });
    });
});
