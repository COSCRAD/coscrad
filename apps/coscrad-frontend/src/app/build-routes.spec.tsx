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
    propertiesToInclude: ('label' | 'route')[] = []
): IndexToDetailFlowDefinition<T> => ({
    categorizableType: categorizableType,
    label: propertiesToInclude.includes('label') ? `labelFor-${categorizableType}` : null,
    route: propertiesToInclude.includes('route') ? `routeFor-${categorizableType}` : null,
    detailViewType: DetailViewType.fullView,
});

describe(`dynamic routes`, () => {
    describe(`routes for index-to-detail flows`, () => {
        Object.values(ResourceType)
            // TODO troubleshoot this one- exceptional route name
            .filter((rt) => rt !== ResourceType.spatialFeature)
            // TODO rebase and make sure the playlist index presenter is registered
            .filter((rt) => rt !== ResourceType.playlist)
            .forEach((resourceType) => {
                describe(`for resource type: ${resourceType}`, () => {
                    describe(`when no custom label or route is defined`, () => {
                        const contentConfig = buildDummyConfig({
                            indexToDetailFlows: [buildIndexToDetailConfig(resourceType)],
                        });

                        const result = buildRoutes(contentConfig);

                        it('should include the default route', () => {
                            const exceptions = {
                                [ResourceType.spatialFeature]: 'Map',
                            } as const;

                            const defaultPath =
                                exceptions[resourceType] ||
                                `Resources/${capitalizeFirstLetter(resourceType)}s`;

                            const matchingPaths = result.filter(({ path }) => path === defaultPath);

                            expect(matchingPaths.length).toBe(1);
                        });
                    });

                    describe(`when a custom route is provided`, () => {
                        const indexToDetailFlowConfig = buildIndexToDetailConfig(resourceType, [
                            'route',
                        ]);

                        const contentConfig = buildDummyConfig({
                            indexToDetailFlows: [indexToDetailFlowConfig],
                        });

                        const result = buildRoutes(contentConfig);

                        it('should include the custom route', () => {
                            console.log(contentConfig);

                            const customPath = `Resources/${indexToDetailFlowConfig.route}`;

                            const matchingPaths = result.filter(({ path }) => path === customPath);

                            expect(matchingPaths.length).toBe(1);
                        });
                    });
                });
            });
    });
});
