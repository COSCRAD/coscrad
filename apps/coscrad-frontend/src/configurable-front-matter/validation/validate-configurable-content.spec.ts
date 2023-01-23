import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { ConfigurableContent } from '../data/configurable-content-schema';
import { InvalidConfigurationPropertyError } from '../errorHandling/errors/invalid-configuration-property.error';
import { validateConfigurableContent } from './validate-configurable-content';

// Reads the sample config, which will also be validated here
const validContentConfig = getDummyConfigurableContent();

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
 * Ideally, we would use our fuzz generator here. However, we do not want to
 * introduce the @coscrad/data-types lib to the front-end until we have sorted
 * out tree-shaking or supporting decorators in the front-end build.
 */
const invalidProps = [];
// const invalidProps: [keyof ConfigurableContent, unknown, CoscradDataType][] = Object.entries(
//     configurableContentSchema
// ).flatMap(([propertyName, coscradDataType]) =>
//     new FuzzGenerator({
//         coscradDataType,
//         isOptional: false,
//         isArray: false,
//         // TODO Consider hiding these 2 props from the `FuzzGenerator`
//         label: 'dummy prop label',
//         description: 'dummy prop description',
//     })
//         .generateInvalidValues()
//         .map(
//             (invalidValue: unknown) =>
//                 [propertyName, invalidValue, coscradDataType] as [
//                     keyof ConfigurableContentSchema,
//                     unknown,
//                     CoscradDataType
//                 ]
//         )
// );

const invalidConfigsAndExpectedErrors: [Overrides<ConfigurableContent>, Error[]][] = invalidProps
    .filter(([propertyName, _]) => !['songIdToCredits', 'videoIdToCredits'].includes(propertyName))
    .map(([propertyName, invalidValue, coscradDataType]) => [
        buildInvalidContentConfig({ [propertyName]: invalidValue }),
        [
            new InvalidConfigurationPropertyError({
                propertyName,
                propertyType: coscradDataType,
                invalidReceivedValue: invalidValue,
            }),
        ],
    ]);

describe('validateFrontMatterData', () => {
    describe('when the content config is valid (using the sample  config)', () => {
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
