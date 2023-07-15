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
});
