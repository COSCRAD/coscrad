import { GlobalConfig } from './global.config';
import { validateGlobalConfig } from './validateGlobalConfig';

type Overrides<T extends Record<string, unknown>> = {
    [K in keyof T]?: unknown;
};

type InvalidGlobalConfig = {
    [K in keyof GlobalConfig]: unknown;
};

type InvalidTestCase = {
    description: string;
    invalidConfig: InvalidGlobalConfig;
};

const validFunderInfo = {
    name: 'Daddy Warbucks who owns the Starbucks',
    url: 'https://www.starbucks.com',
    description: 'here you can ask him for money, too!',
    category: 'philanthropists',
};

const validConfig: GlobalConfig = {
    siteTitle: 'Whatchamadiddy',
    funderInfos: [validFunderInfo],
    externalLinks: [
        {
            name: 'A Cool Site',
            url: 'https://www.nba.com',
        },
    ],
};

const buildInvalidConfig = (overrides: Overrides<GlobalConfig>): InvalidGlobalConfig => ({
    ...validConfig,
    ...overrides,
});

// TODO Use FuzzGenerator
const overridesForInvalidConfigs: Overrides<GlobalConfig>[] = [
    {
        siteTitle: 777,
    },
    {
        funderInfos: 484,
    },
    {
        funderInfos: {
            ...validFunderInfo,
            name: undefined,
        },
    },
    {
        funderInfos: {
            ...validFunderInfo,
            url: 217,
        },
    },
    {
        funderInfos: {
            ...validFunderInfo,
            description: null,
        },
    },
    {
        funderInfos: {
            ...validFunderInfo,
            category: [98],
        },
    },
    {
        externalLinks: ['me.com', 'my.com'],
    },
];

const nullAndUndefinedOverrides: Overrides<GlobalConfig>[] = Object.keys(validConfig).flatMap(
    (key: keyof GlobalConfig) => [{ [key]: null }, { [key]: undefined }]
);

const buildInvalidTestCaseDescription = (overrides: Overrides<GlobalConfig>): string =>
    Object.entries(overrides).reduce((acc, [key, value], index) => {
        const msg = `property: ${key} has invalid value: ${value}`;
        return acc.concat(index === 0 ? msg : `\n and ${msg}`);
    }, `With invalid properties:\n`);

const invalidTestCases: InvalidTestCase[] = [
    ...overridesForInvalidConfigs,
    ...nullAndUndefinedOverrides,
].map((overrides) => ({
    description: buildInvalidTestCaseDescription(overrides),
    invalidConfig: buildInvalidConfig(overrides),
}));

describe('validateGlobalConfig', () => {
    describe('when the content is valid', () => {
        const result = validateGlobalConfig(validConfig);

        expect(result).toEqual([]);
    });

    describe('when the content is invalid', () => {
        invalidTestCases.forEach(({ description, invalidConfig }) =>
            describe(description, () => {
                it('should return an error', () => {
                    const errors = validateGlobalConfig(invalidConfig);

                    expect(errors.length).toBe(1);

                    expect(errors[0]).toBeInstanceOf(Error);
                });
            })
        );
    });
});
