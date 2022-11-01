import { CoscradDataType } from '@coscrad/api-interfaces';
import { FuzzGenerator } from '@coscrad/data-types';
import {
    ConfigurableContent,
    ConfigurableContentSchema,
    configurableContentSchema,
} from '../data/configurableContentSchema';
import { InvalidConfigurationPropertyError } from '../errorHandling/errors/InvalidConfigurationPropertyError';
import { validateConfigurableContent } from './validateConfigurableContent';

const propertyType = CoscradDataType.NonEmptyString;

const validContentConfig: ConfigurableContent = {
    siteTitle: 'My Site',

    subTitle: 'Where it all Happens',

    about: 'Just a Test',

    siteDescription: 'This is my testing site',

    siteHomeImageUrl: 'https://mysite.com/image.png',

    copyrightHolder: 'ME',

    organizationLogoUrl: 'https://mysite.com/logo.png',
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

const invalidProps: [keyof ConfigurableContent, unknown][] = Object.entries(
    configurableContentSchema
).flatMap(([propertyName, coscradDataType]) =>
    new FuzzGenerator({
        coscradDataType,
        isOptional: false,
        isArray: false,
    })
        .generateInvalidValues()
        .map(
            (invalidValue: unknown) =>
                [propertyName, invalidValue] as [keyof ConfigurableContentSchema, unknown]
        )
);

const invalidConfigsAndExpectedErrors: [Overrides<ConfigurableContent>, Error[]][] =
    invalidProps.map(([propertyName, invalidValue]) => [
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
