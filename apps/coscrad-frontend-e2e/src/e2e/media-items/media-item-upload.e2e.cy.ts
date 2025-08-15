import { HttpStatusCode, ResourceType } from '@coscrad/api-interfaces';

const fileDir = `${__dirname}/files`;

const buildFullMediaPath = (filename: string) => `${fileDir}/${filename}`;

const files = ['station.png', 'desk-593327_640.jpg'];

const filePaths = files.map(buildFullMediaPath);

const fileWithUnsupportedMimeType = 'test.md';

// TODO `fileWithPngContentButWaveExtension`

// TODO `fileWithBogusExtension` foo.xxx

const uploadButtonDataTestId = 'mediaItem:upload:submit';

const clearButtonDataTestId = 'mediaItem:upload:clear';

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

        cy.getLoading().should('not.exist');
    });

    describe(`when the user has selected several files`, () => {
        beforeEach(() => {
            /**
             * TODO We should remove all usages of the `force` flag and ensure
             * that buttons are not disabled in this test. There seems to be an
             * interaction in the Cypress test that doesn't happen when driving
             * the app manually.
             */
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

        describe(`when the user has submitted these files`, () => {
            describe(`when clearing the screen using the "clear all button"`, () => {
                it(`should clear the upload queue`, () => {
                    cy.getByDataAttribute(uploadButtonDataTestId).click({ force: true });

                    cy.getByDataAttribute(clearButtonDataTestId).click({ force: true });

                    cy.getByDataAttribute('uploads-queue').should('not.exist');
                });
            });

            describe(`when clearing the upload queue one item at a time`, () => {
                it(`should clear the upload queue`, () => {
                    cy.getByDataAttribute(uploadButtonDataTestId).click({ force: true });

                    cy.getByDataAttribute(`mediaItem:upload:clear/${files[0]}`).click({
                        force: true,
                    });

                    cy.contains(files[0]).should('not.exist');

                    cy.getByDataAttribute(`mediaItem:upload:clear/${files[1]}`).click({
                        force: true,
                    });

                    cy.getByDataAttribute('uploads-queue').should('not.exist');
                });
            });
        });

        describe(`when clearing the upload queue one item at a time`, () => {
            it(`should clear the upload queue`, () => {
                cy.getByDataAttribute(uploadButtonDataTestId).click({ force: true });

                cy.getByDataAttribute(`mediaItem:upload:clear/${files[0]}`).click({ force: true });

                cy.contains(files[0]).should('not.exist');

                cy.getByDataAttribute(`mediaItem:upload:clear/${files[1]}`).click({ force: true });

                cy.getByDataAttribute('uploads-queue').should('not.exist');
            });
        });
    });

    // TODO Is it possible to attach more than the maximum allowed number of files?

    // TODO pull the supported MIME Types from the back-end and prevent this possibility for better UX
    describe(`when the user has selected a file with an unsupported MIME type`, () => {
        beforeEach(() => {
            cy.get('input[type=file]').selectFile(buildFullMediaPath(fileWithUnsupportedMimeType), {
                force: true,
            });

            cy.getByDataAttribute(uploadButtonDataTestId).should('not.be.disabled');

            cy.getByDataAttribute(uploadButtonDataTestId).click({ force: true });
        });

        it(`should display the expected error message`, () => {
            cy.contains('MIME Type is not allowed');
        });
    });

    describe(`when the back-end has an internal error`, () => {
        const testErrorMessage = 'Cannot destructure property length of undefined.';

        beforeEach(() => {
            cy.intercept('POST', '/api/resources/mediaItems/upload', {
                statusCode: HttpStatusCode.internalError,
                body: {
                    message: testErrorMessage,
                },
            });

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

        it(`should report the issue`, () => {
            cy.getByDataAttribute(uploadButtonDataTestId).should('not.be.disabled');

            cy.getByDataAttribute(uploadButtonDataTestId).click({ force: true });

            cy.getByDataAttribute('error');

            cy.contains(testErrorMessage);
        });
    });

    describe(`when the back-end is unavailable`, () => {
        beforeEach(() => {
            cy.intercept('POST', '/api/resources/mediaItems/upload', {
                forceNetworkError: true,
            });

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

        it(`should report the issue`, () => {
            cy.getByDataAttribute(uploadButtonDataTestId).click({ force: true });

            cy.getByDataAttribute('error');

            cy.contains('try again later', { matchCase: false });
        });
    });
});
