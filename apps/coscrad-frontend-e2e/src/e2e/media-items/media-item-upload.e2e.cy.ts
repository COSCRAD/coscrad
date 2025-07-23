import { ResourceType } from '@coscrad/api-interfaces';

describe(`when the user is not logged in and the media item index page is loaded`, () => {
    beforeEach(() => {
        cy.visit('/');

        cy.navigateToResourceIndex(ResourceType.mediaItem);
    });

    it(`should not display the file upload form element`, () => {
        cy.contains('Media');

        cy.get('input[type=file]').should('not.exist');
    });
});

describe(`when the user is logged in and the media item index page is loaded`, () => {
    beforeEach(() => {
        cy.visit('/');

        cy.login();

        cy.navigateToResourceIndex(ResourceType.mediaItem);
    });

    it(`should display the file upload form element `, () => {
        cy.contains('Media');

        cy.get('input[type=file]').should('be.visible');
    });
});
