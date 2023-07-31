import { AggregateType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

describe(`open connected resources panel for resource`, () => {
    const transcribedAudioCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.audioItem,110)

    const {id: transcribedAudioId} = transcribedAudioCompositeIdentifier;

    
    before(
        () =>{
            cy.clearDatabase();

            cy.seedTestUuids(10);

            cy.seedDataWithCommand(`CREATE_AUDIO_ITEM`,{
                aggregateCompositeIdentifier: transcribedAudioCompositeIdentifier
            })
        }
    )

    const transcribedAudioBaseRoute = `/Resources/AudioItems/`;


    describe(`when the transcribed audio detail full view has loaded`, () => {
        beforeEach(() => {
            cy.visit(`${transcribedAudioBaseRoute}${transcribedAudioId}`);
        });

        it(`should expose the open connected resources panel button`, () => {
            cy.getByDataAttribute('open-connected-resources-panel-button').should('exist');
        });

        describe(`the connected resources panel`, () => {
            it(`should not be open initially`, () => {
                cy.getByDataAttribute('connected-resources-panel').should('not.exist');
            });

            describe(`when the connected resources panel button is clicked`, () => {
                beforeEach(() => {
                    cy.getByDataAttribute('open-connected-resource-panel-button').click();
                });

                it(`should open the connected resources panel`, () => {
                    cy.getByDataAttribute('connected-resources-panel').should('exist');
                });

                describe(`when the close panel button is clicked`, () => {
                    it(`should close the connected resources panel`, () => {
                        cy.getByDataAttribute('close-connected-resources-panel-button').click();

                        cy.getByDataAttribute('connected-resources-panel').should('not.exist');
                    });
                });
            });
        });
    });
});
