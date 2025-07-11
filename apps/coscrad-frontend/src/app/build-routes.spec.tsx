import { CategorizableType, ResourceType } from '@coscrad/api-interfaces';
import { Home } from '../components/home/home';
import { ListenLivePage } from '../components/listen-live-page/listen-live-page';
import { ResourceInfoContainer } from '../components/resource-info/resource-info.container';
import {
    DetailViewType,
    IndexToDetailFlowDefinition,
} from '../configurable-front-matter/data/configurable-content-schema';
import { buildDummyConfig } from '../utils/test-utils/build-dummy-content-config';
import { buildRoutes } from './build-routes';

// TODO Breakout string utils lib?
const capitalizeFirstLetter = (inputString: string): string =>
    inputString.length === 0
        ? inputString
        : inputString.charAt(0).toUpperCase() + inputString.slice(1);

const buildIndexToDetailConfig = <T extends CategorizableType>(
    categorizableType: T,
    { includeLabelOverrides }: { includeLabelOverrides: boolean }
): IndexToDetailFlowDefinition<T> => ({
    categorizableType: categorizableType,
    labelOverrides: includeLabelOverrides
        ? {
              label: `labelFor-${categorizableType}`,
              pluralLabel: `pluralLabelFor-${categorizableType}`,
              route: `routeFor-${categorizableType}`,
          }
        : null,
    detailViewType: DetailViewType.fullView,
});

describe(`dynamic routes`, () => {
    describe(`the label for the resource index page`, () => {
        it(`should use the custom label from the config`, () => {
            const dummyLabel = 'Boo Yah';

            const contentConfig = buildDummyConfig({
                resourceIndexLabel: dummyLabel,
            });

            const result = buildRoutes(contentConfig);

            const resourcesLabel = result.find(({ path }) => path === `Resources`).label;

            expect(resourcesLabel).toBe(dummyLabel);
        });
    });

    describe(`routes for index-to-detail flows`, () => {
        Object.values(ResourceType).forEach((resourceType) => {
            describe(`for resource type: ${resourceType}`, () => {
                describe(`when no custom label or route is defined`, () => {
                    const contentConfig = buildDummyConfig({
                        indexToDetailFlows: [
                            buildIndexToDetailConfig(resourceType, {
                                includeLabelOverrides: false,
                            }),
                        ],
                    });

                    const result = buildRoutes(contentConfig);

                    it('should include the default route', () => {
                        const exceptions = {
                            [ResourceType.spatialFeature]: 'Resources/Map',
                        } as const;

                        const defaultPath =
                            exceptions[resourceType] ||
                            `Resources/${capitalizeFirstLetter(resourceType)}s`;

                        const matchingPaths = result.filter(({ path }) => path === defaultPath);

                        expect(matchingPaths.length).toBe(1);
                    });
                });

                describe(`when a custom route is provided`, () => {
                    const indexToDetailFlowConfig = buildIndexToDetailConfig(resourceType, {
                        includeLabelOverrides: true,
                    });

                    const contentConfig = buildDummyConfig({
                        indexToDetailFlows: [indexToDetailFlowConfig],
                    });

                    const result = buildRoutes(contentConfig);

                    it('should include the custom route', () => {
                        const customPath = `Resources/${indexToDetailFlowConfig.labelOverrides.route}`;

                        const matchingPaths = result.filter(({ path }) => path === customPath);

                        expect(matchingPaths.length).toBe(1);
                    });
                });
            });
        });
    });

    describe(`the landing page`, () => {
        describe(`when no landing page is specified in the config`, () => {
            it(`should render the home page at the base route`, () => {
                const contentConfig = buildDummyConfig({
                    landingPage: undefined,
                });

                const result = buildRoutes(contentConfig);

                const baseRoute = result.find(({ path }) => path === `/`);

                expect(baseRoute.element).toEqual(<Home />);
            });
        });

        describe(`when listen live is configured as the landing page`, () => {
            it(`should return the listen live page`, () => {
                const liveRoute = 'LiveMetal';

                const contentConfig = buildDummyConfig({
                    listenLive: {
                        title: 'Listen to our Station',
                        logoUrl: 'https:/www.coscrad.org/logo.png',
                        iceCastLink: 'https://www.coscrad.org/dummystream',
                        playingMessage: 'We are live!',
                        missionStatement:
                            'We play awesome jams all day long and infomercials at night.',
                        route: liveRoute,
                        label: 'Listen Live',
                    },
                    landingPage: liveRoute,
                });

                const result = buildRoutes(contentConfig);

                const baseRoute = result.find(({ path }) => path === `/`);

                expect(baseRoute.element).toEqual(<ListenLivePage />);
            });
        });

        describe(`when the big resource index page is configured as the landing page`, () => {
            it(`should render the resources page as root`, () => {
                const contentConfig = buildDummyConfig({
                    shouldEnableWebOfKnowledgeForResources: true,
                    landingPage: 'Resources',
                });

                const result = buildRoutes(contentConfig);

                const baseRoute = result.find(({ path }) => path === `/`);

                expect(baseRoute.element).toEqual(<ResourceInfoContainer />);
            });
        });

        describe(`when a the landing page is configured to a route that does not exist`, () => {
            it(`should fall back to Home`, () => {
                const contentConfig = buildDummyConfig({
                    landingPage: 'DoesNotExist',
                });

                const result = buildRoutes(contentConfig);

                const baseRoute = result.find(({ path }) => path === '/');

                expect(baseRoute.element).toEqual(<Home />);
            });
        });
    });
});
