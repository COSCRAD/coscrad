import { CoscradDataType } from '@coscrad/data-types';
import { ConfigurableContent } from '../data/configSchema';
import { InvalidConfigurationPropertyError } from '../errorHandling/errors/InvalidConfigurationPropertyError';
import { validateConfigurableContent } from './validateConfigurableContent';

const propertyType = CoscradDataType.NonEmptyString;

const validContentConfig: ConfigurableContent = {
    siteTitle: 'My Site',

    subTitle: 'Where it all Happens',

    about: 'Just a Test',

    siteDescription: 'This is my testing site',

    copyrightHolder: 'ME',
};

// TODO Break this into utility types lib
type Overrides<T> = {
    [K in keyof T]?: unknown;
};

const buildInvalidContentConfig = (
    overrides: Overrides<ConfigurableContent>
): Overrides<ConfigurableContent> => ({
    ...validContentConfig,
    ...overrides,
});

/**
 * TODO Refactor to use our fuzz-generator lib for this.
 */
const invalidProps: [keyof ConfigurableContent, unknown][] = [
    ['siteTitle', 77],
    ['about', []],
    ['copyrightHolder', { foo: 65 }],
    ['siteDescription', false],
    ['siteTitle', [999]],
    ['subTitle', [{}]],
];

const buildMissingProps = (valueToUse: null | undefined): [keyof ConfigurableContent, unknown][] =>
    Object.keys(validContentConfig).reduce(
        // The extra set of [] are required for concat to concate a tuple-valued element
        (acc, nextKey) => acc.concat([[nextKey, valueToUse]]),
        []
    );

const undefinedProps: [keyof ConfigurableContent, unknown][] = buildMissingProps(null);

const nullProps: [keyof ConfigurableContent, unknown][] = buildMissingProps(undefined);

const invalidConfigsAndExpectedErrors: [Overrides<ConfigurableContent>, Error[]][] = [
    ...invalidProps,
    ...undefinedProps,
    ...nullProps,
].map(([propertyName, invalidValue]) => [
    buildInvalidContentConfig({ [propertyName]: invalidValue }),
    [
        new InvalidConfigurationPropertyError({
            propertyName,
            propertyType,
            invalidReceivedValue: invalidValue,
        }),
    ],
]);

describe('validateFrontMatterData', () => {
    describe('when the content config is valid', () => {
        it('should return no errors', () => {
            const result = validateConfigurableContent(validContentConfig);

            expect(result).toEqual([]);
        });
    });

    describe('when the content config is invalid', () => {
        (
            [
                [null, 'null'],
                [undefined, 'undefined'],
            ] as const
        ).map(([missingValue, label]) =>
            describe(`When the config is ${label}`, () => {
                it('should return an error', () => {
                    const result = validateConfigurableContent(missingValue);

                    expect(result.length).toBe(1);

                    expect(result[0]).toBeInstanceOf(Error);
                });
            })
        );

        invalidConfigsAndExpectedErrors.forEach(([invalidConfig, expectedErrors]) => {
            it('should return the expected errors', () => {
                const result = validateConfigurableContent(invalidConfig);

                if (expectedErrors.length === 0) {
                    throw new Error(
                        `You must specify at least one expected error for an invalid case.`
                    );
                }

                expectedErrors.forEach((expectedError, index) =>
                    expect(result[index]).toEqual(expectedError)
                );

                // just in case there are additional errors in the result
                expect(result.length).toBe(expectedErrors.length);
            });
        });
    });
});
