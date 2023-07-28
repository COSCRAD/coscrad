import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyUuid } from '../../../support/utilities';

describe(`term detail view `, () => {
    const termId = buildDummyUuid(2);

    const aggregateCompositeIdentifier = {
        type: AggregateType.term,
        id: termId,
    };

    const createNoteLabel = 'Create Note';

    describe(`note creation`, () => {
        before(() => {
            cy.clearDatabase();

            cy.seedTestUuids(5);

            cy.executeCommandStreamByName('users:create-admin');

            cy.seedDataWithCommand(`CREATE_TERM`, {
                aggregateCompositeIdentifier,
            });

            cy.seedDataWithCommand(`PUBLISH_TERM`, {
                aggregateCompositeIdentifier,
            });
        });

        beforeEach(() => {
            cy.visit(`/Resources/Terms/${termId}`);
        });

        describe(`when the user is not logged in`, () => {
            it(`should not be available`, () => {
                cy.contains(createNoteLabel).should('not.exist');
            });
        });

        //  TODO Add aditional non-admin test users and test this
        // describe(`when the user is logged-in, but not an admin`, () => {
        //     it(`should not display the panel`, () => {
        //         cy.get('woo hooo hooo not found~ test me!');
        //     });
        // });

        describe(`when the user is logged-in as COSCRAD admin`, () => {
            beforeEach(() => {
                cy.login();

                cy.getByDataAttribute('nav-menu-icon').click();

                cy.get('[href="/Resources"] > .MuiButtonBase-root').click();

                cy.getByDataAttribute('term').click();

                cy.get(`[href="/Resources/Terms/${termId}"]`).click();
            });

            it(`should be available`, () => {
                cy.contains(createNoteLabel);
            });

            describe(`when the form is incomplete`, () => {
                beforeEach(() => {
                    cy.contains(createNoteLabel).click();
                });

                describe(`when the entire form is empty`, () => {
                    it(`should be disabled`, () => {
                        cy.getByDataAttribute('submit-dynamic-form').should('be.disabled');
                    });
                });

                describe(`when the language code (select) is empty`, () => {
                    it(`should be disabled`, () => {
                        cy.get('#note_text').click().type('This is an interesting note.');

                        cy.getByDataAttribute('submit-dynamic-form').should('be.disabled');
                    });
                });

                describe(`when the text is empty`, () => {
                    it(`should be disabled`, () => {
                        cy.get('.MuiSelect-select').click().get('[data-value="en"]').click();

                        cy.getByDataAttribute('submit-dynamic-form').should('be.disabled');
                    });
                });
            });

            describe(`when the form is complete`, () => {
                const newNoteText = 'This is an interesting note.';

                beforeEach(() => {
                    cy.contains(createNoteLabel).click();

                    cy.get('#note_text').click().type(newNoteText);

                    cy.get('#note_languageCode').click().get('[data-value="clc"').click();
                });

                it(`should be available`, () => {
                    cy.getByDataAttribute('submit-dynamic-form').should('not.be.disabled');
                });

                it(`should successfully submit the command`, () => {
                    cy.getByDataAttribute('submit-dynamic-form').click();

                    cy.getByDataAttribute('loading').should('not.exist');

                    cy.acknowledgeCommandResult();

                    cy.openPanel('notes');

                    cy.contains(newNoteText);
                });

                it(`should successfully create multiple notes`, () => {
                    cy.getByDataAttribute('submit-dynamic-form').click();

                    // Acknowledge success of the first command
                    cy.getByDataAttribute('command-ack-button').click();

                    // open the form to submit a second command
                    cy.contains(createNoteLabel).click();

                    cy.get('#note_text').click().type('yet another note about this resource');

                    cy.get('#note_languageCode').click().get('[data-value="clc"').click();

                    cy.getByDataAttribute('submit-dynamic-form').click();

                    // wait until the command endpoint responds with an ack
                    cy.getByDataAttribute('loading').should('not.exist');

                    cy.acknowledgeCommandResult();

                    cy.openPanel('notes');

                    cy.contains('yet another note about this resource');
                });
            });
        });
    });
});
