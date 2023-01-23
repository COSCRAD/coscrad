import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { ConfigurableContent } from '../data/configurable-content-schema';
import { validateConfigurableContent } from './validate-configurable-content';

// Reads the sample config, which will also be validated here
const validContentConfig = getDummyConfigurableContent();

// TODO Break this into utility types lib
type Overrides<T> = {
    [K in keyof T]?: unknown;
};

type InvalidProps = {
    propertyName: string;
    invalidValue: unknown;
    description: string;
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
const invalidProps: InvalidProps[] = [
    {
        propertyName: 'siteTitle',
        invalidValue: 88,
        description: 'number',
    },
    {
        propertyName: 'subTitle',
        invalidValue: '',
        description: 'empty string',
    },
    {
        propertyName: 'about',
        invalidValue: ['foo'],
        description: 'string array',
    },
    {
        propertyName: 'siteDescription',
        invalidValue: 900,
        description: 'number',
    },
    {
        propertyName: 'siteHomeImageUrl',
        invalidValue: 'totally awesome picture',
        description: 'plain string',
    },
    {
        propertyName: 'copyrightHolder',
        invalidValue: [900, 100, 300],
        description: 'numeric array',
    },
    {
        propertyName: 'organizationLogoUrl',
        invalidValue: { foo: 9 },
        description: 'object',
    },
    {
        propertyName: 'songIdToCredits',
        invalidValue: ['I did this one'],
        description: 'string array',
    },
    {
        propertyName: 'videoIdToCredits',
        invalidValue: 909,
        description: 'number',
    },
    // TODO test \ tighten up validation around index-to-detail flows
];

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

        invalidProps.forEach(({ propertyName, description, invalidValue }) => {
            describe(`when ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                const invalidConfig = {
                    ...validContentConfig,
                    [propertyName]: invalidValue,
                };

                it('should return the expected errors', () => {
                    const result = validateConfigurableContent(invalidConfig);

                    expect(result.length).toBe(1);

                    expect(result[0]).toBeInstanceOf(Error);

                    const actualError = result[0];

                    expect(actualError.toString().includes(propertyName)).toBe(true);
                });
            });
        });
    });
});
