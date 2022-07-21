import { ResourceType } from '../../types/ResourceType';
import { EdgeConnectionContextType } from '../context/types/EdgeConnectionContextType';
import { getAllowedContextsForModel } from './isContextAllowedForGivenResourceType';

describe('getAllowedContextsForModel', () => {
    // Loop over every `ResourceType`
    Object.values(ResourceType).forEach((resourceType) =>
        describe(`resource type: ${resourceType}`, () => {
            const allowedContexts = getAllowedContextsForModel(resourceType);

            it('should have a specified list of allowed context types', () => {
                const numberOfResults = allowedContexts.length;

                expect(numberOfResults).toBeGreaterThan(0);
            });

            it('should allow the general context', () => {
                const isGeneralContextAllowed = allowedContexts.includes(
                    EdgeConnectionContextType.general
                );

                expect(isGeneralContextAllowed).toBe(true);
            });

            describe('the list of allowed contexts', () => {
                it('should contain no duplicates', () => {
                    const lengthOfList = allowedContexts.length;

                    const numberOfUniqueElements = [...new Set(allowedContexts)].length;

                    expect(numberOfUniqueElements).toBe(lengthOfList);
                });
            });
        })
    );

    // Loop over every `EdgeConnectionContextType`
    Object.values(EdgeConnectionContextType).forEach((contextType) =>
        describe(`Edge connection context type: ${contextType}`, () => {
            it(`is registered as the allowed context for at least one resource type`, () => {
                const isContextTypeAllowedForSomeResourceType = Object.values(ResourceType).some(
                    (resourceType) => getAllowedContextsForModel(resourceType).includes(contextType)
                );

                expect(isContextTypeAllowedForSomeResourceType).toBe(true);
            });
        })
    );
});
