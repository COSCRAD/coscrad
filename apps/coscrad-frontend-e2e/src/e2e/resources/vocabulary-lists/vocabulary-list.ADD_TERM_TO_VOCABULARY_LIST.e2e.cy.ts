import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

const commandLabel = 'Add Term to Vocabulary List';

const existingVocabularyListName = 'birds';

const languageCodeForVocabularyListName = LanguageCode.English;

const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.vocabularyList,
    1
);

const textForTermToAdd = 'hello universe';

const languageCodeForTerm = LanguageCode.English;

const termAggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.term,
    2
);

const buildDetailRoute = (id: string) => `/Resources/VocabularyLists/${id}`;

describe(`ADD_TERM_TO_VOCABULARY_LIST`, () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(20);

        cy.seedDataWithCommand('CREATE_PROMPT_TERM', {
            aggregateCompositeIdentifier: termAggregateCompositeIdentifier,
            text: textForTermToAdd,
            // note that all prompt terms are in English so there's no language code here
        });

        cy.seedDataWithCommand('CREATE_VOCABULARY_LIST', {
            aggregateCompositeIdentifier,
            name: existingVocabularyListName,
            languageCodeForName: languageCodeForVocabularyListName,
        });

        // note that we should not expose "Publish Resource" at this point
    });

    describe(`when the user is not logged in`, () => {
        beforeEach(() => {
            cy.visit('/');

            cy.navigateToResourceIndex(ResourceType.vocabularyList);
        });

        it(`should not expose the command`, () => {
            cy.contains(commandLabel).should('not.exist');
        });
    });

    describe(`when the user is logged in`, () => {
        before(() => {
            cy.executeCommandStreamByName('users:create-admin');
        });

        beforeEach(() => {
            cy.visit('/');

            cy.login();

            cy.navigateToResourceIndex(ResourceType.vocabularyList);

            cy.get(`[href="${buildDetailRoute(aggregateCompositeIdentifier.id)}"]`).click();
        });

        beforeEach(() => {
            cy.getLoading().should('not.exist');

            cy.contains(commandLabel).click();
        });

        describe(`when the form is complete`, () => {
            beforeEach(() => {
                cy.get('booyah').click();
            });

            it.only(`should succeed`, () => {
                cy.contains(textForTermToAdd);
            });
        });
    });
});
