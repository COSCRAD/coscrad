import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.vocabularyList,
    1
);

const vocabularyListName = 'My List';

const languageCodeForName = LanguageCode.Chilcotin;

const translatedListName = 'My RRRRist (translation)';

const translationLanguageCode = LanguageCode.English;

const buildRoute = (id: string) => `/Resources/VocabularyLists/${id}`;

const validVocabularyListDetailRoute = buildRoute(aggregateCompositeIdentifier.id);

const publicTermText = 'Justin is going to be super tall';

// the term has the same original language as the vocabulary list name in this case
const languageCodeForTerm = languageCodeForName;

const termCompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.term, 2);

describe(`the vocabulary list detail page`, () => {
    describe(`when list with the given ID (123) does not exist`, () => {
        beforeEach(() => {
            cy.visit(buildRoute(`123`));
        });

        it(`should display the not found page`, () => {
            cy.getByDataAttribute('not-found');
        });
    });

    describe(`when the list exists`, () => {
        beforeEach(() => {
            cy.clearDatabase();

            cy.seedTestUuids(10);

            cy.seedDataWithCommand(`CREATE_VOCABULARY_LIST`, {
                aggregateCompositeIdentifier,
                name: vocabularyListName,
                languageCodeForName,
            });

            cy.seedDataWithCommand(`TRANSLATE_VOCABULARY_LIST_NAME`, {
                aggregateCompositeIdentifier,
                languageCode: translationLanguageCode,
                text: translatedListName,
            });

            cy.seedDataWithCommand(`CREATE_TERM`, {
                aggregateCompositeIdentifier: termCompositeIdentifier,
                text: publicTermText,
                languageCode: languageCodeForTerm,
            });

            /**
             * The term should be published to show up in the list.
             *
             * TODO We might want a test case showing that for an ordinary user
             * an unpublished term is not visible.
             */
            cy.seedDataWithCommand(`PUBLISH_TERM`, {
                aggregateCompositeIdentifier: termCompositeIdentifier,
            });

            cy.seedDataWithCommand(`ADD_TERM_TO_VOCABULARY_LIST`, {
                aggregateCompositeIdentifier,
                termId: termCompositeIdentifier.id,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier,
            });

            cy.visit(validVocabularyListDetailRoute);
        });

        it.only(`should display the list's original name`, () => {
            cy.contains(vocabularyListName);
        });
    });
});
