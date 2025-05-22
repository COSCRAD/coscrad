import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../support/utilities';

const buildByLetterQuery = (letter: string) => `|${letter}|`;

describe(`The term index view`, () => {
    describe(`search by letter`, () => {
        // TODO support tokenization \ parsing letters for other languages
        describe(`when the text is in Chilcotin`, () => {
            const textForTerm = 'Dechen detŝ’en diẑtan';

            const singleCharacterLetterThatIsInTerm = 'd';

            const singleCharacterLetterThatIsNotInTerm = 'q';

            const multiCharacterLetterThatIsInTerm = 'tŝ’';

            const multiCharacterLetterThatIsNotInTerm = 'tl';

            const basicTermCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
                AggregateType.term,
                1
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
            });

            describe(`when searching for a letter that is in the term`, () => {
                describe(`when that letter has multiple characters: ${multiCharacterLetterThatIsInTerm}`, () => {
                    before(() => {
                        cy.navigateToResourceIndex(ResourceType.term);
                    });
                    it(`should find the term`, () => {
                        cy.getByDataAttribute(`index_search_bar`).click();

                        cy.getByDataAttribute(`index_search_bar`).type(
                            buildByLetterQuery(singleCharacterLetterThatIsInTerm)
                        );

                        cy.getLoading().should(`not.exist`);

                        cy.contains(textForTerm);
                    });
                });
            });
        });
    });
});
