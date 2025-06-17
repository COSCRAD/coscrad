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

    const cappedConsonants = {
        s: { lower: String.fromCodePoint(0x015d), upper: String.fromCodePoint(0x015c) },
        w: { lower: String.fromCodePoint(0x0175), upper: String.fromCodePoint(0x0174) },
        z: { lower: String.fromCodePoint(0x1e90), upper: String.fromCodePoint(0x1e91) },
    };

    const textForTerm = `${letterThatIsInTheTerm}e is singing ${outOfAlphabetSymbolInTerm}lang) ${Object.values(
        cappedConsonants
    )
        .reduce((acc: string[], { lower }) => {
            acc.push(lower);

            return acc;
        }, [])
        .join('')}`;

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

            /**
             * TODO If we allow searching other properties by letter for other
             * resources (or in a full-text search), we may want to move the following
             * to a component test or Jest test. This is a lot of extra logic to think
             * about when trying to read the main index-to-detail flow.
             */
            describe(`when searching the letters in the term`, () => {
                beforeEach(() => {
                    cy.visit('/Resources/Terms');

                    cy.getByDataAttribute('select_index_search_scope').click();

                    /**
                     * We can only share this step with all test cases below
                     * if we avoid an abstraction like "search index table".
                     */
                    cy.get(`[data-value="tokens"]`).click();
                });

                describe(`when the term has the letter`, () => {
                    /**
                     * This is probably not worth making a general helper
                     * unless we decide to allow and test searching by letter
                     * for every multilingual text property in the index view
                     * for every resource type.
                     */
                    const expectToFindOne = (keystrokes: string[], textForTerm: string) => {
                        cy.getByDataAttribute(`index_search_bar`).click();

                        keystrokes.forEach((keystroke) => {
                            cy.getByDataAttribute(`index_search_bar`).type(keystroke);
                        });

                        cy.getLoading().should(`not.exist`);

                        cy.contains(textForTerm);

                        cy.contains('Filtered Records: 1');
                    };

                    describe(`when the letter is a standard Latin character`, () => {
                        it('should return the term', () => {
                            expectToFindOne([letterThatIsInTheTerm], textForTerm);
                        });
                    });

                    describe(`when the letter contains a diacritic`, () => {
                        // TODO use the unicode keypoint for this?
                        const orphanedCap = '̂'; // === String.fromCodePoint(0x0302) === String.fromCodePoint(770)

                        describe(`when the user uses the simulated keyboard for data entry`, () => {
                            describe(cappedConsonants.s.lower, () => {
                                describe(`when typing s + cap (lone surrogate)`, () => {
                                    it('should return the term', () => {
                                        expectToFindOne(['s', orphanedCap], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the multi-part unicode s + cap (lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        /**
                                         * Note the distinction that the two (combining)
                                         * characters are pasted together atomically, not entered
                                         * one at a time. This targets a different
                                         * behaviour of the simulated keyboard.
                                         */
                                        // TODO named constants for all unicode keypoints, including orphaned caps and latin letters here
                                        expectToFindOne([`${'\u0073'}${`\u0302`}`], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the atomic unicode (no lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        expectToFindOne([cappedConsonants.s.lower], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.s.upper, () => {
                                describe(`when typing S + cap (lone surrogate)`, () => {
                                    it('should return the term', () => {
                                        expectToFindOne(['S', orphanedCap], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the multi-part unicode S + cap (lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        /**
                                         * Note the distinction that the two (combining)
                                         * characters are pasted together atomically, not entered
                                         * one at a time. This targets a different
                                         * behaviour of the simulated keyboard.
                                         */
                                        // TODO named constants for all unicode keypoints, including orphaned caps and latin letters here
                                        expectToFindOne([`S${orphanedCap}`], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the atomic unicode Ŝ (no lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        expectToFindOne([cappedConsonants.s.upper], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.w.lower, () => {
                                describe(`when typing w + cap (lone surrogate)`, () => {
                                    it('should return the term', () => {
                                        expectToFindOne(['w', orphanedCap], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the multi-part unicode w + cap (lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        /**
                                         * Note the distinction that the two (combining)
                                         * characters are pasted together atomically, not entered
                                         * one at a time. This targets a different
                                         * behaviour of the simulated keyboard.
                                         */
                                        // TODO named constants for all unicode keypoints, including orphaned caps and latin letters here
                                        expectToFindOne([`w${`\u0302`}`], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the atomic unicode (no lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        expectToFindOne([cappedConsonants.w.lower], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.w.upper, () => {
                                describe(`when typing W + cap (lone surrogate)`, () => {
                                    it('should return the term', () => {
                                        expectToFindOne(['W', orphanedCap], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the multi-part unicode W + cap (lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        /**
                                         * Note the distinction that the two (combining)
                                         * characters are pasted together atomically, not entered
                                         * one at a time. This targets a different
                                         * behaviour of the simulated keyboard.
                                         */
                                        // TODO named constants for all unicode keypoints, including orphaned caps and latin letters here
                                        expectToFindOne([`S${orphanedCap}`], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the atomic unicode Ŵ (no lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        expectToFindOne([cappedConsonants.w.upper], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.z.lower, () => {
                                describe(`when typing z + cap (lone surrogate)`, () => {
                                    it('should return the term', () => {
                                        expectToFindOne(['z', orphanedCap], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the multi-part unicode z + cap (lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        /**
                                         * Note the distinction that the two (combining)
                                         * characters are pasted together atomically, not entered
                                         * one at a time. This targets a different
                                         * behaviour of the simulated keyboard.
                                         */
                                        // TODO named constants for all unicode keypoints, including orphaned caps and latin letters here
                                        expectToFindOne([`z${`\u0302`}`], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the atomic unicode (no lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        expectToFindOne([cappedConsonants.z.lower], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.z.upper, () => {
                                describe(`when typing Z + cap (lone surrogate)`, () => {
                                    it('should return the term', () => {
                                        expectToFindOne(['Z', orphanedCap], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the multi-part unicode Z + cap (lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        /**
                                         * Note the distinction that the two (combining)
                                         * characters are pasted together atomically, not entered
                                         * one at a time. This targets a different
                                         * behaviour of the simulated keyboard.
                                         */
                                        // TODO named constants for all unicode keypoints, including orphaned caps and latin letters here
                                        expectToFindOne([`Z${orphanedCap}`], textForTerm);
                                    });
                                });

                                // this also may apply when using system keyboards
                                describe(`when pasting the atomic unicode Ẑ (no lone surrogate) from elsewhere`, () => {
                                    it(`should return the target term`, () => {
                                        expectToFindOne([cappedConsonants.z.upper], textForTerm);
                                    });
                                });
                            });
                        });

                        describe(`when the user disables the simulated keyboard and types the text directly`, () => {
                            beforeEach(() => {
                                cy.toggleSimulatedKeyboard();
                            });

                            describe(cappedConsonants.s.lower, () => {
                                describe('s + cap - pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([`s${orphanedCap}`], textForTerm);
                                    });
                                });

                                describe('full ŝ from unicode pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([cappedConsonants.s.lower], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.s.upper, () => {
                                describe('S + cap - pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([`S${orphanedCap}`], textForTerm);
                                    });
                                });

                                describe('full Ŝ from unicode pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([cappedConsonants.s.upper], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.w.lower, () => {
                                describe('w + cap - pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([`w${orphanedCap}`], textForTerm);
                                    });
                                });

                                describe('full ŵ from unicode pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([cappedConsonants.w.lower], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.w.upper, () => {
                                describe('W + cap - pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([`W${orphanedCap}`], textForTerm);
                                    });
                                });

                                describe('full Ŵ from unicode pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([cappedConsonants.w.upper], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.z.lower, () => {
                                describe('z + cap - pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([`w${orphanedCap}`], textForTerm);
                                    });
                                });

                                describe('full ẑ from unicode pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([cappedConsonants.z.lower], textForTerm);
                                    });
                                });
                            });

                            describe(cappedConsonants.z.upper, () => {
                                describe('Z + cap - pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([`W${orphanedCap}`], textForTerm);
                                    });
                                });

                                describe('full Ẑ from unicode pasted', () => {
                                    it('should return the term', () => {
                                        expectToFindOne([cappedConsonants.z.upper], textForTerm);
                                    });
                                });
                            });
                        });

                        /**
                         * TODO Test vowels with marked high tone. Currently, we
                         * don't have these in the database, but there are some
                         * data sets on-deck that have marked tone.
                         */
                    });
                });

                describe(`when the term does not have the letter`, () => {
                    it('should return not found', () => {
                        cy.getByDataAttribute(`index_search_bar`).click();

                        cy.getByDataAttribute(`index_search_bar`).type(letterThatIsNotInTerm);

                        cy.getLoading().should(`not.exist`);

                        cy.getByDataAttribute('not-found');
                    });
                });

                describe(`when the term has the letter, but it is out of alphabet`, () => {
                    it(`should return not found`, () => {
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

                cy.contains('created by: (data entry) admin');
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
