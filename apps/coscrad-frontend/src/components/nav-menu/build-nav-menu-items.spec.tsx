import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { ConfigurableContent } from '../../configurable-front-matter/data/configurable-content-schema';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { buildNavMenuItems } from './build-nav-menu-items';
import { NavItemInfo } from './nav-menu-container';

const dummyConfigWithAllProps = getDummyConfigurableContent();

const buildDummyConfig = (userOverrides: Partial<ConfigurableContent> = {}) => {
    const propertiesToRemove = Object.entries(userOverrides)
        .filter(([_key, value]) => isNullOrUndefined(value))
        .map(([key, _value]) => key);

    // Note that this is a shallow clone
    const withUserOverrides = { ...dummyConfigWithAllProps, ...userOverrides };

    /**
     * We remove null or undefined valued properties to fully mimic the
     * behaviour of leaving the property off the config entirely.
     */
    propertiesToRemove.forEach((key) => delete withUserOverrides[key]);

    return withUserOverrides;
};

type TestCase = {
    description: string;
    config: ConfigurableContent;
    /**
     * Within this test, we only confirm that the paths are built as expected.
     * There are separate e2e tests with Cypress that confirm that these paths
     * actually link to properly rendered content.
     */
    expectedResult: NavItemInfo[];
};

const liveRoute = 'Live';

const optionalPropertiesAndRoutesToExclude: [keyof ConfigurableContent, string][] = [
    ['listenLive', liveRoute],
];

const expectedOrder = [
    '/',
    'About',
    'Resources',
    'Notes',
    'TreeOfKnowledge',
    'Tags',
    liveRoute,
    'Credits',
];

const assertExpectedOrder = (info: NavItemInfo[]) => {
    const navInfoOrder = info.map(({ link }) => link);

    // Remove items from the primary list that are missing by virtue of being omitted in the config
    const expectedOrderWithMissingRemoved = expectedOrder.filter((link) =>
        navInfoOrder.includes(link)
    );

    // Now the two arrays should have the same members in the same order
    expect(navInfoOrder).toEqual(expectedOrderWithMissingRemoved);
};

describe(`dynamic navigation menu`, () => {
    describe(`when all properties are provided`, () => {
        const result = buildNavMenuItems(buildDummyConfig());
        it('should return the expected routes', () => {
            expect(result).toMatchSnapshot();
        });

        it('should have the correct order', () => {
            assertExpectedOrder(result);
        });

        it('should have the correct number of items', () => {
            expect(result.length).toBe(expectedOrder.length);
        });

        it('None of the labels should be empty', () => {
            const menuItemsWithEmptyLabels = result.filter(({ label }) => !isNonEmptyString(label));

            expect(menuItemsWithEmptyLabels).toEqual([]);
        });
    });

    optionalPropertiesAndRoutesToExclude.forEach(([key, route]) => {
        describe(`When the optional property: (${key}) is omitted from the content config`, () => {
            it(`should not include the corresponding route (${route})`, () => {
                const contentConfig = buildDummyConfig({
                    [key]: null,
                });

                const result = buildNavMenuItems(contentConfig);

                const isRouteIncluded = result.some(({ link }) => link === route);

                expect(isRouteIncluded).toBe(false);
            });
        });
    });

    describe(`When the Web of Knowledge is disabled`, () => {
        const routesToOmit = ['Notes', 'Tags', 'TreeOfKnowledge'];

        const contentConfig = buildDummyConfig({
            shouldEnableWebOfKnowledgeForResources: false,
        });

        const result = buildNavMenuItems(contentConfig);

        it(`should not include any of: ${routesToOmit.join(',')}`, () => {
            const extraRoutes = result.filter(({ link }) => routesToOmit.includes(link));

            expect(extraRoutes).toEqual([]);
        });

        it(`should have the expected order`, () => {
            assertExpectedOrder(result);
        });
    });

    // testCases.forEach(({ description, config, expectedResult }) => {
    //     describe(description, () => {
    //         const result = buildNavMenuItems(config);

    //         expect(result).toEqual(expectedResult);
    //     });
    // });
});
