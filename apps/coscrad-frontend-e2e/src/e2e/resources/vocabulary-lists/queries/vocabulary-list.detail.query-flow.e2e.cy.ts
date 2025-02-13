import {
    AggregateType,
    IMultilingualText,
    IVocabularyListViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
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

// TODO put this in a lib that we can share with the back-end?
const buildMultilingualTextWithSingleItem = (
    text: string,
    languageCode: LanguageCode
): IMultilingualText => ({
    items: [
        {
            text,
            languageCode,
            role: MultilingualTextItemRole.original,
        },
    ],
});

const PERSON = 'person';

const NUMBER = 'number';

const POSITIVE = 'positive';

const ASPECT = 'aspect';

const USITATIVE = 'usitative';

const entries = (
    [
        // 1. present (imperfective)
        [1, 1, 1, 1, 0, 'I am singing'],
        [1, 2, 1, 1, 0, 'You are singing'],
        [1, 3, 1, 1, 0, 'He or she is singing'],
        [1, 1, 2, 1, 0, 'We are singing'],
        [1, 1, 2, 1, 0, 'You (2 or more) are singing'],
        [1, 1, 2, 1, 0, 'They are singing'],
        [1, 0, 1, 1, 0, 'Someone is singing'],
        // -- negative
        [0, 1, 1, 1, 0, 'I am not singing'],
        [0, 2, 1, 1, 0, 'You are not singing'],
        [0, 3, 1, 1, 0, 'He or she is not singing'],
        [0, 1, 2, 1, 0, 'We are not singing'],
        [0, 1, 2, 1, 0, 'You (2 or more) are not singing'],
        [0, 1, 2, 1, 0, 'They are not singing'],
        [0, 0, 1, 1, 0, 'Someone is not singing'],
        // 2. past (perfective)
        [1, 1, 1, 2, 0, 'I sang'],
        [1, 2, 1, 2, 0, 'You sang'],
        [1, 3, 1, 2, 0, 'He or she sang'],
        [1, 1, 2, 2, 0, 'We sang'],
        [1, 1, 2, 2, 0, 'You (2 or more) sang'],
        [1, 1, 2, 2, 0, 'They sang'],
        [1, 0, 1, 2, 0, 'Someone sang'],
        // -- negative
        [0, 1, 1, 2, 0, 'I did not sing'],
        [0, 2, 1, 2, 0, 'You did not sing'],
        [0, 3, 1, 2, 0, 'He or she did not sing'],
        [0, 1, 2, 2, 0, 'We did not sing'],
        [0, 1, 2, 2, 0, 'You (2 or more) did not sing'],
        [0, 1, 2, 2, 0, 'They did not sing'],
        [0, 0, 1, 2, 0, 'Someone did not sing'],
        // 3. future (inceptive-progressive)
        [1, 1, 1, 3, 0, 'I am going to sing'],
        [1, 2, 1, 3, 0, 'You are going to sing'],
        [1, 3, 1, 3, 0, 'He or she is going to sing'],
        [1, 1, 2, 3, 0, 'We are going to sing'],
        [1, 1, 2, 3, 0, 'You (2 or more) are going to sing'],
        [1, 1, 2, 3, 0, 'They are going to sing'],
        [1, 0, 1, 3, 0, 'Someone is going to sing'],
        // -- negative
        [0, 1, 1, 3, 0, 'I am not going to sing'],
        [0, 2, 1, 3, 0, 'You am not going to sing'],
        [0, 3, 1, 3, 0, 'He or she am not going to sing'],
        [0, 1, 2, 3, 0, 'We am not going to sing'],
        [0, 1, 2, 3, 0, 'You (2 or more) am not going to sing'],
        [0, 1, 2, 3, 0, 'They am not going to sing'],
        [0, 0, 1, 3, 0, 'Someone am not going to sing'],
        // 4. should (optative)
        [1, 1, 1, 4, 0, 'I should sing'],
        [1, 2, 1, 4, 0, 'You should sing'],
        [1, 3, 1, 4, 0, 'He or she should sing'],
        [1, 1, 2, 4, 0, 'We should sing'],
        [1, 1, 2, 4, 0, 'You (2 or more) should sing'],
        [1, 1, 2, 4, 0, 'They should sing'],
        [1, 0, 1, 4, 0, 'Someone should sing'],
        // -- negative
        [0, 1, 1, 4, 0, 'I should not sing'],
        [0, 2, 1, 4, 0, 'You should not sing'],
        [0, 3, 1, 4, 0, 'He or she should not sing'],
        [0, 1, 2, 4, 0, 'We should not sing'],
        [0, 1, 2, 4, 0, 'You (2 or more) should not sing'],
        [0, 1, 2, 4, 0, 'They should not sing'],
        [0, 0, 1, 4, 0, 'Someone should not sing'],
        // 5. started to (inceptive-progressive)
        [1, 1, 1, 5, 0, 'I started to sing'],
        [1, 2, 1, 5, 0, 'You started to sing'],
        [1, 3, 1, 5, 0, 'He or she started to sing'],
        [1, 1, 2, 5, 0, 'We started to sing'],
        [1, 1, 2, 5, 0, 'You (2 or more) started to sing'],
        [1, 1, 2, 5, 0, 'They started to sing'],
        [1, 0, 1, 5, 0, 'Someone started to sing'],
        // -- negative
        [0, 1, 1, 5, 0, 'I did not start to sing'],
        [0, 2, 1, 5, 0, 'You did not start to sing'],
        [0, 3, 1, 5, 0, 'He or she did not start to sing'],
        [0, 1, 2, 5, 0, 'We did not start to sing'],
        [0, 1, 2, 5, 0, 'You (2 or more) did not start to sing'],
        [0, 1, 2, 5, 0, 'They did not start to sing'],
        [0, 0, 1, 5, 0, 'Someone did not start to sing'],
        // 11. usually (usitative) - imperfective
        [1, 1, 1, 1, 1, 'I usually sing'],
        [1, 2, 1, 1, 1, 'You usually sing'],
        [1, 3, 1, 1, 1, 'He usually sings'],
        [1, 1, 2, 1, 1, 'We usually sing'],
        [1, 1, 2, 1, 1, 'You (2 or more) usually sing'],
        [1, 1, 2, 1, 1, 'They usually sing'],
        [1, 0, 1, 1, 1, 'Someone usually sings'],
        // -- negative
        [0, 1, 1, 1, 1, 'I do not usually sing'],
        [0, 2, 1, 1, 1, 'You do not usually sing'],
        [0, 3, 1, 1, 1, 'He or she does not usually sing'],
        [0, 1, 2, 1, 1, 'We do not usually sing'],
        // intentionally missing
        // [0, 1, 2, 1, 1, 'You (2 or more) do not usually sing'],
        [0, 1, 2, 1, 1, 'They do not usually sing'],
        [0, 0, 1, 1, 1, 'Someone does not usually sing'],
    ] as const
).map(([positive, person, number, aspect, usitative, text], index) => ({
    term: {
        name: buildMultilingualTextWithSingleItem(text, languageCodeForTerms),
        id: buildDummyUuid(100 + index),
        isPublished: true,
        // TODO check that these come through as well
        contributions: [],
    },
    variableValues: {
        [POSITIVE]: positive.toString(),
        [PERSON]: person.toString(),
        [NUMBER]: number.toString(),
        [ASPECT]: aspect.toString(),
        [USITATIVE]: usitative.toString(),
    },
}));

const comprehensiveParadigm: IVocabularyListViewModel = {
    id: aggregateCompositeIdentifier.id,
    name: {
        items: [
            {
                text: vocabularyListName,
                languageCode: languageCodeForName,
                role: MultilingualTextItemRole.original,
            },
        ],
    },
    entries,
    form: {
        fields: [
            // TODO build form for the above list
        ],
    },
    isPublished: true,
    // we have other test cases for the contributions
    contributions: [],
    // note that we have separate command tests for the actions
    actions: [],
    // what about tags?
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

            it(`should display the contributions`, () => {
                cy.contains(contributors.creator.firstName);
            });
        });

        describe(`when the list has a couple terms with filters specified`, () => {
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

        describe(`when the list contains a comprehensive paradigm`, () => {
            before(() => {
                cy.clearDatabase();

                cy.seedDatabase('vocabularyList__VIEWS', [comprehensiveParadigm]);
            });

            describe(`when filters match exactly one term`, () => {
                it.only(`should display the list`, () => {
                    cy.contains(vocabularyListName);
                });
            });

            // describe - match many terms
            // describe - match no terms
        });
    });
});
