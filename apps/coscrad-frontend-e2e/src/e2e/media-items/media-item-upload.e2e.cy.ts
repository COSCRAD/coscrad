import { ResourceType } from '@coscrad/api-interfaces';

const fileDir = `${__dirname}/files`;

const files = ['station.png', 'desk-593327_640.jpg'];

const filePaths = files.map((file) => `${fileDir}/${file}`);

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

    it.only(`should allow the user to select files to upload and add them to the uploads list`, () => {
        cy.get('input[type=file]').selectFile(filePaths, { force: true });

        cy.getByDataAttribute('uploads-queue').children().should('have.length', 2);

        cy.getByDataAttribute('uploads-queue')
            .children()
            .each(($fileItem, index) => {
                cy.wrap($fileItem).within(() => {
                    cy.getByDataAttribute('file-name').contains(files[index]);
                });
            });
    });
});
