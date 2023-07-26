import { ResourceType } from '@coscrad/api-interfaces';

describe('Resource Info Page (Big Index)', () => {
    beforeEach(() => {
        cy.visit('/Resources');
    });

    const resourceTypes = Object.values(ResourceType);

    resourceTypes.forEach((resourceType) => {
        describe(`for resource type: ${resourceType}`, () => {
            it('should populate the page with entity data', () => {
                cy.get(`[data-testid='${resourceType}']`);
            });
        });
    });
});
