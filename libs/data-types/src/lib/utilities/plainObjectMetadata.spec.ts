import 'reflect-metadata';
import { getMetadata, setMetadata } from './plainObjectMetadata';

const dummyMetadata = {
    propertyType: 'WIDGET',
};

const dummyMetadataKey = 'MY_METADATA';

const targetsAndLabels: [unknown, string][] = [
    [
        {
            foo: 5,
            bar: 'hello',
            baz: [1, 2, 3],
        },
        'data object',
    ],
    [
        (value: number) => ({
            getCount: () => value,
            increment: () => value++,
            decrement: () => value--,
        }),
        'arrow function',
    ],
    [
        {
            name: 'John Doe',
            getGreeting: () => 'Hello World',
        },
        'object with attributes and methods',
    ],
];

/**
 * This provides a proof of concept for using the Reflect API without
 * (class-based) OOP.
 */
describe('plain object metadata', () => {
    describe('when no metadata has been set', () => {
        describe('getMetadata', () => {
            it('should return undefined', () => {
                const result = getMetadata(dummyMetadataKey, { foo: 5 });

                expect(result).toBeUndefined();
            });
        });
    });

    targetsAndLabels.forEach(([target, targetType]) =>
        describe(`when the target is a ${targetType}`, () => {
            setMetadata(dummyMetadataKey, dummyMetadata, target);

            it('should be possible to set and retrieve the metadata', () => {
                const result = getMetadata(dummyMetadataKey, target);

                expect(result).toEqual(dummyMetadata);
            });
        })
    );

    describe('when overwriting existing metadata', () => {
        it('should return the most recent value', () => {
            const dummyTarget = {
                foo: 5,
                bob: () => 'hi',
            };

            const firstMetadata = { bar: 12 };

            const secondMetadata = { baz: 13 };

            setMetadata(dummyMetadataKey, firstMetadata, dummyTarget);

            setMetadata(dummyMetadataKey, secondMetadata, dummyTarget);

            const result = getMetadata(dummyMetadataKey, dummyTarget);

            expect(result).toEqual(secondMetadata);
        });
    });
});
