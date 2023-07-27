import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

describe(`the video flow`, () => {
    before(() => {
        cy.clearDatabase();

        cy.executeCommandStreamByName('users:create-admin');
    });

    const baseRoute = `/Resources/Videos/`;

    describe(`when the user is not logged in`, () => {
        it(`should not display the create commands`, () => {
            cy.visit(baseRoute);

            // sanity check
            cy.contains('Videos');

            cy.getByDataAttribute('loading').should('not.exist');

            cy.getByDataAttribute('command-selection-area').should('not.exist');
        });
    });

    describe(`when the user is logged in as an admin-user`, () => {
        beforeEach(() => {
            cy.visit(baseRoute);

            cy.login();

            cy.getByDataAttribute('nav-menu-icon').click();

            cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

            cy.getByDataAttribute('video').click();
        });

        it(`should display the commands`, () => {
            cy.contains('Videos');

            cy.getByDataAttribute('loading').should('not.exist');

            cy.getByDataAttribute('command-selection-area');
        });

        describe(`CREATE_VIDEO`, () => {
            it(`should have a button`, () => {
                cy.contains(`Create Video`);
            });

            describe.only(`when the command is valid`, () => {
                const videoNameText = 'Haida text for video name';

                const mediaItemAggregateCompositeIdentifier =
                    buildDummyAggregateCompositeIdentifier(AggregateType.mediaItem, 2);

                const { id: mediaItemId } = mediaItemAggregateCompositeIdentifier;

                before(() => {
                    cy.seedTestUuids(5);

                    cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
                        aggregateCompositeIdentifier: mediaItemAggregateCompositeIdentifier,
                    });

                    cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                        aggregateCompositeIdentifier: mediaItemAggregateCompositeIdentifier,
                    });
                });

                beforeEach(() => {
                    cy.contains(`Create Video`).click();

                    cy.getByDataAttribute('languageCodeForName_select')
                        .click()
                        .get('[data-value="hai"')
                        .click();

                    cy.getByDataAttribute('text_name').click().type(videoNameText);

                    cy.get('#mui-component-select-mediaItemId')
                        .click()
                        .get(`[data-value="${mediaItemId}"]`)
                        .click();

                    cy.get(`input[name=lengthMilliseconds]`).click().type('30000');

                    cy.getByDataAttribute('submit-dynamic-form').click();

                    cy.acknowledgeCommandResult();
                });

                it(`should succeed`, () => {
                    cy.getByDataAttribute('loading').should('not.exist');

                    cy.contains(videoNameText);
                });

                it(`should not yet be publicly visible`, () => {
                    cy.visit(`/Resources/Videos/`);

                    cy.contains(videoNameText).should('not.exist');
                });
            });
        });

        // TODO test that 400 errors are displayed appropriately
        // TODO test that form submission is blocked when the payload type is invalid
    });
});
