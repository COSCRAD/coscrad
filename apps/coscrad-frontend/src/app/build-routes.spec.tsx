import { CategorizableType, ResourceType } from '@coscrad/api-interfaces';
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
});
