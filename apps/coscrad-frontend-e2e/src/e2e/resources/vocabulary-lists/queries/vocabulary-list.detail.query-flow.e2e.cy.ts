import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import {
    buildDummyAggregateCompositeIdentifier,
    buildDummyUuid,
} from '../../../../support/utilities';

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

const term2Text = 'Justin is going to be super tall';

// the term has the same original language as the vocabulary list name in this case
const languageCodeForTerms = languageCodeForName;

const term2CompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.term, 2);

const term3Text = 'Blake is not going to be super tall';

const term3CompositeIdentifier = buildDummyAggregateCompositeIdentifier(AggregateType.term, 3);

const termsAndFilterPropertyValues: { text: string; propertyValues: Record<string, string> }[] = [
    {
        text: term2Text,
        propertyValues: {
            aspect: '3',
            positive: '1',
        },
    },
    {
        text: term3Text,
        propertyValues: {
            aspect: '3',
            positive: '0',
        },
    },
];

const filterPropertiesAndAllowedValues = {
    aspect: [
        {
            value: '3',
            label: 'inceptive-progressive',
        },
    ],
    positive: [
        {
            value: '0',
            label: 'negative',
        },
        {
            value: '1',
            label: 'positive (switch for negative)',
        },
    ],
};

const contributors = {
    creator: {
        id: buildDummyUuid(112),
        firstName: 'Jamethon',
    },
};

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
            cy.visit(validVocabularyListDetailRoute);
        });

        describe(`when the list has a couple of distinct terms with no property filters`, () => {
            before(() => {
                cy.clearDatabase();

                cy.seedTestUuids(200);

                cy.seedDataWithCommand(`CREATE_CONTRIBUTOR`, {
                    aggregateCompositeIdentifier: {
                        type: AggregateType.contributor,
                        id: contributors.creator.id,
                    },
                    shortBio: 'This is a hard-working language champion indeed!',
                    firstName: contributors.creator.firstName,
                    // we don't bother with the last name
                });

                cy.seedDataWithCommand(
                    `CREATE_VOCABULARY_LIST`,
                    {
                        aggregateCompositeIdentifier,
                        name: vocabularyListName,
                        languageCodeForName,
                    },
                    {
                        contributorIds: [contributors.creator.id],
                    }
                );

                cy.seedDataWithCommand(`TRANSLATE_VOCABULARY_LIST_NAME`, {
                    aggregateCompositeIdentifier,
                    languageCode: translationLanguageCode,
                    text: translatedListName,
                });

                cy.seedDataWithCommand(`CREATE_TERM`, {
                    aggregateCompositeIdentifier: term2CompositeIdentifier,
                    text: term2Text,
                    languageCode: languageCodeForTerms,
                });

                cy.seedDataWithCommand(`CREATE_TERM`, {
                    aggregateCompositeIdentifier: term3CompositeIdentifier,
                    text: term3Text,
                    languageCode: languageCodeForTerms,
                });

                /**
                 * The term should be published to show up in the list.
                 *
                 * TODO We might want a test case showing that for an ordinary user
                 * an unpublished term is not visible.
                 */
                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: term2CompositeIdentifier,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier: term3CompositeIdentifier,
                });

                // note the order
                cy.seedDataWithCommand(`ADD_TERM_TO_VOCABULARY_LIST`, {
                    aggregateCompositeIdentifier,
                    termId: term3CompositeIdentifier.id,
                });

                cy.seedDataWithCommand(`ADD_TERM_TO_VOCABULARY_LIST`, {
                    aggregateCompositeIdentifier,
                    termId: term2CompositeIdentifier.id,
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier,
                });
            });

            it(`should display the list's original name`, () => {
                cy.contains(vocabularyListName);
                cy.getByDataAttribute('LanguageIcon').first().trigger('mouseover');
                cy.contains('Chilcotin');
            });

            it(`should display the vocabulary list name's translation`, () => {
                cy.getByDataAttribute('ExpandMoreIcon').click();

                cy.contains(translatedListName);
            });

            it(`should contain the first term`, () => {
                cy.getByDataAttribute('NEXT').click();

                cy.contains(term2Text);
            });

            it(`should contain the second term`, () => {
                cy.getByDataAttribute('NEXT').click();
                cy.getByDataAttribute('PREV').click();

                cy.contains(term3Text);
            });

            it.only(`should display the contributions`, () => {
                cy.contains(contributors.creator.firstName);
            });
        });

        describe(`when the list has several terms with filters specified`, () => {
            before(() => {
                cy.clearDatabase();

                cy.seedTestUuids(100);

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

                Object.entries(filterPropertiesAndAllowedValues).forEach(
                    ([key, labelsAndValues]) => {
                        cy.seedDataWithCommand('REGISTER_VOCABULARY_LIST_FILTER_PROPERTY', {
                            aggregateCompositeIdentifier,
                            name: key,
                            allowedValuesAndLabels: labelsAndValues,
                        });
                    }
                );

                termsAndFilterPropertyValues.forEach(({ text, propertyValues }, index) => {
                    const termCompositeId = buildDummyAggregateCompositeIdentifier(
                        AggregateType.term,
                        index + 10
                    );

                    cy.seedDataWithCommand('CREATE_TERM', {
                        aggregateCompositeIdentifier: termCompositeId,
                        text,
                        languageCode: languageCodeForTerms,
                    });

                    cy.seedDataWithCommand('PUBLISH_RESOURCE', {
                        aggregateCompositeIdentifier: termCompositeId,
                    });

                    cy.seedDataWithCommand('ADD_TERM_TO_VOCABULARY_LIST', {
                        aggregateCompositeIdentifier,
                        termId: termCompositeId.id,
                    });

                    cy.seedDataWithCommand('ANALYZE_TERM_IN_VOCABULARY_LIST', {
                        aggregateCompositeIdentifier,
                        termId: termCompositeId.id,
                        propertyValues: propertyValues,
                    });
                });

                cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                    aggregateCompositeIdentifier,
                });
            });

            it(`should be filterable`, () => {
                /**
                 * These filters should find term 3 but not term 2;
                 */
                cy.get('#mui-component-select-aspect').click();

                cy.get('#mui-component-select-aspect').get(`[data-value="3"`).click();

                cy.get('#mui-component-select-positive').click();

                cy.get('#mui-component-select-positive').get(`[data-value="0"`).click();

                cy.contains(term3Text);

                cy.getByDataAttribute('NEXT').click();

                // no change is expected since there should be only 1 result
                cy.contains(term3Text);
            });
        });
    });
});
