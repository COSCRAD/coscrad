import AppInfo from '../AppInfo';
import AppLink from '../AppLink';
import { AppPlatform } from '../AppPlatform';
import validateAppInfo from './validateAppInfo';

type InvalidTestCase = {
    invalidPropertyKey: keyof AppInfo;
    invalidPropertyValue: unknown;
    additionalKeywordsExpectedInErrorMessage?: string[];
};

const validGoogleLink: AppLink = {
    platform: AppPlatform.google,
    url: 'www.myapplink.com',
};

const validWebLink: AppLink = {
    platform: AppPlatform.web,
    url: 'www.mywebapps.com/memory',
};

const validAppInfo: AppInfo = {
    name: 'memory match',
    image: 'https://www.myimagesforreal.com/123.png',
    meta: 'this is the best app ever!',
    description: 'play 12 rounds of memory match with audio',
    links: [validGoogleLink, validWebLink],
};

const missingPropertyTestCases: InvalidTestCase[] = Object.keys(validAppInfo).map(
    (key: keyof AppInfo) => ({
        invalidPropertyKey: key,
        invalidPropertyValue: undefined,
    })
);

const invalidTestCasesWithTruthyValues: InvalidTestCase[] = [
    {
        invalidPropertyKey: 'description',
        invalidPropertyValue: 77,
    },
    {
        invalidPropertyKey: 'image',
        invalidPropertyValue: 'opd://badurl..',
    },
    {
        invalidPropertyKey: 'links',
        invalidPropertyValue: 'not an array',
    },
    {
        invalidPropertyKey: 'links',
        invalidPropertyValue: [
            88, // not an object
        ],
    },
    {
        invalidPropertyKey: 'links',
        invalidPropertyValue: [
            {
                platform: AppPlatform.google,
                url: 'ba:--d.url.fooey',
            },
        ],
        // TODO add 'ba:--d.url.fooey'
        additionalKeywordsExpectedInErrorMessage: ['url'],
    },
    {
        invalidPropertyKey: 'links',
        invalidPropertyValue: [
            {
                platform: AppPlatform.google,
                url: 999,
            },
        ],
        // TODO add '999'
        additionalKeywordsExpectedInErrorMessage: ['url'],
    },
    {
        invalidPropertyKey: 'links',
        invalidPropertyValue: [
            {
                ...validWebLink,
                platform: 'Blackberry',
            },
        ],
        // TODO add 'Blackberry'
        additionalKeywordsExpectedInErrorMessage: ['platform'],
    },
    {
        invalidPropertyKey: 'meta',
        invalidPropertyValue: [],
    },
    {
        invalidPropertyKey: 'name',
        invalidPropertyValue: 12345,
    },
];

const invalidTestCases = [...invalidTestCasesWithTruthyValues, ...missingPropertyTestCases];

describe('validateAppInfo', () => {
    describe('when the input is valid', () => {
        it('should return the expected result', () => {
            // TODO change the API so that `[]` is returned instead.
            const expectedValidResult = validAppInfo;

            const result = validateAppInfo(validAppInfo);

            expect(result).toEqual(expectedValidResult);
        });
    });

    describe('when the input is invalid', () => {
        invalidTestCases.forEach(
            ({
                invalidPropertyKey,
                invalidPropertyValue,
                additionalKeywordsExpectedInErrorMessage,
            }) =>
                describe(`when the property: ${invalidPropertyKey} has the invalid value: ${JSON.stringify(
                    invalidPropertyValue
                )}`, () => {
                    it('should return an appropriate error', () => {
                        const invalidInput = {
                            ...validAppInfo,
                            [invalidPropertyKey]: invalidPropertyValue,
                        };

                        const result = validateAppInfo(invalidInput);

                        expect(result).not.toEqual(validAppInfo);

                        expect(Array.isArray(result)).toBe(true);

                        expect((result as unknown as Error[]).length).toBeGreaterThan(0);

                        (result as Error[]).forEach((item) => {
                            expect(item).toBeInstanceOf(Error);

                            const error = item as Error;

                            [
                                invalidPropertyKey,
                                // TODO Comment this back in
                                // invalidPropertyValue,
                                ...(additionalKeywordsExpectedInErrorMessage || []),
                            ].forEach((expectedKeyword) => {
                                const doesErrorMEssageIncludeKeyword =
                                    error.message.includes(expectedKeyword);

                                expect(doesErrorMEssageIncludeKeyword).toBe(true);
                            });
                        });
                    });
                })
        );
    });
});
