import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

describe(`open self notes panel for resource`, () => {
    const termsBaseRoute = `/Resources/Terms/`;

    const termCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
        AggregateType.photograph,
        2
    );

    const { id: termId } = termCompositeIdentifier;

    before(() => {
        cy.seedDataWithCommand(`CREATE_TERM`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: termCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_NOTE_ABOUT_RESOURCE`, {
            aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                AggregateType.note,
                3
            ),
        });
    });

    describe(`when the photograph detail full view has loaded`, () => {
        beforeEach(() => {
            cy.visit(`${termsBaseRoute}${termId}`);
        });

        it(`should expose the open note panel button`, () => {
            cy.getByDataAttribute('open-notes-panel-button').should('exist');
        });

        describe(`the notes panel for a resource`, () => {
            it(`should not be open initially`, () => {
                cy.getByDataAttribute('notes-panel').should('not.exist');
            });

            describe(`when the notes panel button is clicked`, () => {
                beforeEach(() => {
                    cy.getByDataAttribute('open-notes-panel-button').click();
                });

                it(`should open the notes panel`, () => {
                    cy.getByDataAttribute('notes-panel').should('exist');
                });

                it(`should expose the notes panel close button`, () => {
                    cy.getByDataAttribute('close-notes-panel-button').should('be.visible');
                });

                it(`should expose the notes panel expand button`, () => {
                    cy.getByDataAttribute('expand-notes-panel-button').should('be.visible');
                });

                /**
                 * Note 1: the expand/contract panel tests may fail with different viewport heights, need to explore further.
                 *
                 * Note 2: testing the MUI  note drawer expansion/contraction is dependent/coupled to MUI's implementation of the
                 *          drawer because it's `.MuiPaper-root` that actually changes size
                 */
                describe(`when the expand panel button is clicked`, () => {
                    const minExpandedPanelHeight = Cypress.config().viewportHeight * 0.8;

                    it(`should expand the notes panel`, () => {
                        cy.getByDataAttribute('expand-notes-panel-button').click();

                        cy.get('[data-testid="notes-panel"] > .MuiPaper-root')
                            .invoke('outerHeight')
                            .should('be.gte', minExpandedPanelHeight);
                    });
                });

                describe(`when the expand panel button is clicked a second time to contract the panel`, () => {
                    const minExpandedPanelHeight = Cypress.config().viewportHeight * 0.8;

                    it(`should contract the notes panel`, () => {
                        cy.getByDataAttribute('expand-notes-panel-button').click();
                        cy.getByDataAttribute('expand-notes-panel-button').click();

                        cy.get('[data-testid="notes-panel"] > .MuiPaper-root')
                            .invoke('outerHeight')
                            .should('be.lt', minExpandedPanelHeight);
                    });
                });

                describe(`when the close panel button is clicked`, () => {
                    it(`should close the notes panel`, () => {
                        cy.getByDataAttribute('close-notes-panel-button').click();

                        cy.getByDataAttribute('notes-panel').should('not.exist');
                    });
                });
            });
        });
    });
});
