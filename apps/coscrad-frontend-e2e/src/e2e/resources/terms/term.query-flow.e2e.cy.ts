import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateType,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

describe(`Term index-to-detail flow`, () => {
    const basicTermCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
        AggregateType.term,
        513
    );

    const letterThatIsInTheTerm = 'sh';

    const letterThatIsNotInTerm = 'dz';

    const outOfAlphabetSymbolInTerm = '(';

    const textForTerm = `${letterThatIsInTheTerm}e is singing ${outOfAlphabetSymbolInTerm}lang)`;

    const { id: basicTermId } = basicTermCompositeIdentifier;

    const searchTermsForVocabularyListThatMatch = 'survival';

    const vocabularyListName = `${searchTermsForVocabularyListThatMatch} words`;

    const languageCodeForVocabularyListName = LanguageCode.English;

    const vocabularyListCompositeId = buildDummyAggregateCompositeIdentifier(
        AggregateType.vocabularyList,
        901
    );

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(999);

        cy.seedDataWithCommand(`CREATE_TERM`, {
            aggregateCompositeIdentifier: basicTermCompositeIdentifier,
            text: textForTerm,
            languageCode: LanguageCode.Chilcotin,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: basicTermCompositeIdentifier,
        });

        cy.seedDataWithCommand('CREATE_VOCABULARY_LIST', {
            aggregateCompositeIdentifier: vocabularyListCompositeId,
            name: vocabularyListName,
            languageCodeForName: languageCodeForVocabularyListName,
        });

        cy.seedDataWithCommand('ADD_TERM_TO_VOCABULARY_LIST', {
            // TODO Is this safe?
            [AGGREGATE_COMPOSITE_IDENTIFIER]: vocabularyListCompositeId,
            termId: basicTermCompositeIdentifier.id,
        });

        cy.seedDataWithCommand('PUBLISH_RESOURCE', {
            [AGGREGATE_COMPOSITE_IDENTIFIER]: vocabularyListCompositeId,
        });
    });

    describe(`the resource types page`, () => {
        beforeEach(() => {
            cy.visit(`/Resources`);
        });

        it('should have an entry for terms', () => {
            cy.contains('Terms');

            // Ensure this is the link to the Terms and not an occurence of the word terms
            // in the description of another resource
            cy.getByDataAttribute('Term').should('exist');
        });

        it('should have a link to the terms', () => {
            cy.contains('Terms').click();

            cy.contains('Terms');

            cy.location('pathname').should('contain', 'Resources/Terms');
        });
    });

    describe(`the term index page`, () => {
        beforeEach(() => {
            cy.visit(`/Resources/Terms`);
        });

        it('should display the text for term 513', () => {
            cy.contains(textForTerm);
        });

        it('should have a link to the detail view for term 513', () => {
            cy.contains(textForTerm);

            cy.get(`[href="/Resources/Terms/${basicTermId}"]`).click();

            cy.contains(textForTerm);

            cy.location('pathname').should('contain', `/Resources/Terms/${basicTermId}`);
        });

        it(`should display the vocabulary list for the basic term`, () => {
            cy.contains(vocabularyListName);
        });

        describe(`the search filter`, () => {
            const termWithQDash = 'Q-Term';

            const haidaTextToFind = 'Q-';

            const dummyEnglishTranslationOfTerm = `ZZZ Term (English)`;

            const searchScopes = [`allProperties`, `name`];

            before(() => {
                cy.seedDataWithCommand(`CREATE_TERM`, {
                    aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                        AggregateType.term,
                        516
                    ),
                    text: termWithQDash,
                    languageCode: LanguageCode.Chilcotin,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                        AggregateType.term,
                        516
                    ),
                });

                cy.seedDataWithCommand(`TRANSLATE_TERM`, {
                    aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                        AggregateType.term,
                        516
                    ),
                    translation: dummyEnglishTranslationOfTerm,
                    languageCode: LanguageCode.English,
                });
            });

            searchScopes.forEach((searchScope) => {
                describe(`when the search scope is: ${searchScope}`, () => {
                    beforeEach(() => {
                        cy.visit('/Resources/Terms');

                        cy.getByDataAttribute('select_index_search_scope').click();

                        cy.get(`[data-value="${searchScope}"]`).click();
                    });

                    describe(`when the filter should return 1 result (based on default language term)`, () => {
                        it(`should return the correct result`, () => {
                            const searchTerms = haidaTextToFind;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(termWithQDash);

                            cy.contains(textForTerm).should('not.exist');
                        });
                    });

                    // Note that we need to ensure that we use only 1 target Indigenous language code plus English
                    describe(`when the filter should return (with language query) 1 result (based on Chilcotin term)`, () => {
                        it(`should return the correct result`, () => {
                            const searchTerms = `{clc}:${haidaTextToFind}`;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute(`index_search_bar`).type(searchTerms, {
                                parseSpecialCharSequences: false,
                            });

                            cy.getLoading().should(`not.exist`);

                            cy.contains(termWithQDash);

                            cy.contains(textForTerm).should('not.exist');
                        });
                    });

                    describe(`when the filter should return 1 result (based on english term)`, () => {
                        it(`should return the correct result`, () => {
                            const searchTerms = `ZZZ`;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummyEnglishTranslationOfTerm);

                            cy.contains(textForTerm).should('not.exist');
                        });
                    });

                    describe(`when the filter should return no results`, () => {
                        it(`should show no results`, () => {
                            const searchTerms = `BBQ Chicken`;

                            cy.getByDataAttribute(`index_search_bar`).click();

                            cy.getByDataAttribute(`index_search_bar`).type(searchTerms);

                            cy.getLoading().should(`not.exist`);

                            cy.contains(dummyEnglishTranslationOfTerm).should(`not.exist`);

                            cy.contains(textForTerm).should('not.exist');

                            cy.getByDataAttribute(`not-found`);
                        });
                    });
                });
            });

            describe(`when searching the vocabulary lists directly`, () => {
                beforeEach(() => {
                    cy.visit('/Resources/Terms');

                    cy.getByDataAttribute('select_index_search_scope').click();

                    cy.get(`[data-value="vocabularyLists"]`).click();
                });

                describe(`when the search terms are contained in the vocabulary list name`, () => {
                    it(`should return the row for expected term`, () => {
                        cy.getByDataAttribute(`index_search_bar`).click();

                        cy.getByDataAttribute(`index_search_bar`).type(
                            searchTermsForVocabularyListThatMatch
                        );

                        cy.getLoading().should(`not.exist`);

                        cy.contains(textForTerm);

                        cy.contains('Filtered Records: 1');
                    });
                });

                describe(`when the search term does not match any lists`, () => {
                    it(`should display not found`, () => {
                        cy.getByDataAttribute(`index_search_bar`).click();

                        cy.getByDataAttribute(`index_search_bar`).type(
                            `Ain't no way nobody is going to name a vocabulary list this!!!foobarbaz>?`
                        );

                        cy.getLoading().should(`not.exist`);

                        cy.getByDataAttribute('not-found');
                    });
                });
            });

            describe(`when searching the letters in the term`, () => {
                beforeEach(() => {
                    cy.visit('/Resources/Terms');

                    cy.getByDataAttribute('select_index_search_scope').click();

                    cy.get(`[data-value="tokens"]`).click();
                });

                describe(`when the term has the letter`, () => {
                    it.only('should return the list', () => {
                        cy.getByDataAttribute(`index_search_bar`).click();

                        cy.getByDataAttribute(`index_search_bar`).type(letterThatIsInTheTerm);

                        cy.getLoading().should(`not.exist`);

                        cy.contains(textForTerm);

                        cy.contains('Filtered Records: 1');
                    });
                });

                describe(`when the term does not have the letter`, () => {
                    it.only('should return not found', () => {
                        cy.getByDataAttribute(`index_search_bar`).click();

                        cy.getByDataAttribute(`index_search_bar`).type(letterThatIsNotInTerm);

                        cy.getLoading().should(`not.exist`);

                        cy.getByDataAttribute('not-found');
                    });
                });

                describe(`when the term has the letter, but it is out of alphabet`, () => {
                    it.only(`should return not found`, () => {
                        cy.getByDataAttribute(`index_search_bar`).click();

                        cy.getByDataAttribute(`index_search_bar`).type(outOfAlphabetSymbolInTerm);

                        cy.getLoading().should(`not.exist`);

                        cy.getByDataAttribute('not-found');
                    });
                });
            });
        });
    });

    describe(`the term detail page`, () => {
        const compositeIdentifierOfTermToView = buildDummyAggregateCompositeIdentifier(
            AggregateType.term,
            2
        );

        const { id: idForTermToView } = compositeIdentifierOfTermToView;

        const textForTermWithNoCredits = 'I have notes';

        const noteText =
            'This first 4 letters of this term form a syllable that indicates this is a plant ';

        before(() => {
            cy.seedDataWithCommand(`CREATE_TERM`, {
                aggregateCompositeIdentifier: compositeIdentifierOfTermToView,
                text: textForTermWithNoCredits,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier: compositeIdentifierOfTermToView,
            });

            cy.seedDataWithCommand(`CREATE_NOTE_ABOUT_RESOURCE`, {
                aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                    AggregateType.note,
                    801
                ),
                resourceCompositeIdentifier: compositeIdentifierOfTermToView,
                text: noteText,
            });
        });

        describe(`when there are no contributors of record on the event history`, () => {
            beforeEach(() => {
                cy.rehydrateViews();

                cy.visit(`/Resources/Terms/${idForTermToView}`);
            });

            it(`should display the defualt credits`, () => {
                cy.contains(textForTermWithNoCredits);

                cy.contains('created by: admin');
            });
        });

        describe(`when there are no vocabulary lists for the term (2)`, () => {
            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idForTermToView}`);
            });

            it(`should not display vocabulary list info`, () => {
                cy.getByDataAttribute(`vocbulary-lists-for-term-${idForTermToView}`).should(
                    'not.exist'
                );
            });
        });

        describe('when there are notes for the term (2)', () => {
            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idForTermToView}`);
            });

            it(`it should display the note text:\n${noteText}`, () => {
                cy.openPanel('notes');

                cy.contains(noteText);
            });
        });

        describe('when there are no notes for the term (13)', () => {
            // Note that we have yet to add a note for this term
            const { id: idOfTermWithoutNotes } = basicTermCompositeIdentifier;

            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idOfTermWithoutNotes}`);
            });

            it('should display the no notes message', () => {
                cy.contains(textForTerm);

                cy.openPanel('notes');

                cy.contains('No Notes Found');
            });
        });

        describe(`when the term appears in a vocabulary list`, () => {
            beforeEach(() => {
                cy.visit(`/Resources/Terms/${basicTermId}`);

                cy.getByDataAttribute('loading').should('not.exist');
            });

            it(`should display the vocabulary list`, () => {
                cy.contains(vocabularyListName);

                cy.get(
                    `[href="/Resources/VocabularyLists/${vocabularyListCompositeId.id}"]`
                ).click();
            });
        });

        describe('when there are connections for the term (2)', () => {
            const connectedPlayListCompositeId = buildDummyAggregateCompositeIdentifier(
                AggregateType.playlist,
                12
            );

            const { id: connectedPlaylistId } = connectedPlayListCompositeId;

            before(() => {
                cy.seedDataWithCommand(`CREATE_PLAYLIST`, {
                    aggregateCompositeIdentifier: connectedPlayListCompositeId,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: connectedPlayListCompositeId,
                });

                cy.seedDataWithCommand(`CONNECT_RESOURCES_WITH_NOTE`, {
                    aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                        AggregateType.note,
                        402
                    ),
                    toMemberCompositeIdentifier: connectedPlayListCompositeId,
                    fromMemberCompositeIdentifier: basicTermCompositeIdentifier,
                });
            });

            beforeEach(() => {
                cy.visit(`/Resources/Terms/${basicTermId}`);

                cy.getByDataAttribute('loading').should('not.exist');
            });

            it('should display the connected playlist', () => {
                cy.openPanel('connections');

                cy.getAggregateDetailView(AggregateType.playlist, connectedPlaylistId);
            });

            it.skip('should display exactly 2 connected resources', () => {
                // we should have a test here.
            });
        });

        describe('when there are no connections for the term (123)', () => {
            const textForTermWithNoConnections = 'I have no connections';

            const compositeIdForTermWithNoConnections = buildDummyAggregateCompositeIdentifier(
                AggregateType.term,
                123
            );

            const { id: idForTermWithoutConnections } = compositeIdForTermWithNoConnections;

            before(() => {
                cy.seedDataWithCommand(`CREATE_TERM`, {
                    aggregateCompositeIdentifier: compositeIdForTermWithNoConnections,
                    text: textForTermWithNoConnections,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: compositeIdForTermWithNoConnections,
                });
            });

            beforeEach(() => {
                cy.visit(`/Resources/Terms/${idForTermWithoutConnections}`);
            });

            it('should display the no connections message', () => {
                cy.contains(textForTermWithNoConnections);

                cy.openPanel('connections');

                cy.contains('No Connections Found');
            });
        });
    });
});
