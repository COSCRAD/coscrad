import {
    AggregateType,
    FormFieldType,
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
        lastName: 'Jones',
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

const POSITIVE = 'positive';

const ASPECT = 'aspect';

const USITATIVE = 'usitative';

// positive, person, aspect, usitative, text
const entries = (
    [
        // 1. present (imperfective)
        [1, 11, 1, 0, 'I am singing'],
        [1, 21, 1, 0, 'You are singing'],
        [1, 31, 1, 0, 'He or she is singing'],
        [1, 12, 1, 0, 'We are singing'],
        [1, 22, 1, 0, 'You (2 or more) are singing'],
        [1, 32, 1, 0, 'They are singing'],
        [1, 0, 1, 0, 'Someone is singing'],
        // -- negative
        [0, 11, 1, 0, 'I am not singing'],
        [0, 21, 1, 0, 'You are not singing'],
        [0, 31, 1, 0, 'He or she is not singing'],
        [0, 12, 1, 0, 'We are not singing'],
        [0, 22, 1, 0, 'You (2 or more) are not singing'],
        [0, 32, 1, 0, 'They are not singing'],
        [0, 1, 1, 0, 'Someone is not singing'],
        // 2. past (perfective)
        [1, 11, 2, 0, 'I sang'],
        [1, 21, 2, 0, 'You sang'],
        [1, 31, 2, 0, 'He or she sang'],
        [1, 12, 2, 0, 'We sang'],
        [1, 22, 2, 0, 'You (2 or more) sang'],
        [1, 32, 2, 0, 'They sang'],
        [1, 0, 2, 0, 'Someone sang'],
        // -- negative
        [0, 11, 2, 0, 'I did not sing'],
        [0, 21, 2, 0, 'You did not sing'],
        [0, 31, 2, 0, 'He or she did not sing'],
        [0, 12, 2, 0, 'We did not sing'],
        [0, 22, 2, 0, 'You (2 or more) did not sing'],
        [0, 32, 2, 0, 'They did not sing'],
        [0, 0, 2, 0, 'Someone did not sing'],
        // 3. future (inceptive-progressive)
        [1, 11, 3, 0, 'I am going to sing'],
        [1, 21, 3, 0, 'You are going to sing'],
        [1, 31, 3, 0, 'He or she is going to sing'],
        [1, 12, 3, 0, 'We are going to sing'],
        [1, 22, 3, 0, 'You (2 or more) are going to sing'],
        [1, 32, 3, 0, 'They are going to sing'],
        [1, 0, 3, 0, 'Someone is going to sing'],
        // -- negative
        [0, 11, 3, 0, 'I am not going to sing'],
        [0, 21, 3, 0, 'You am not going to sing'],
        [0, 31, 3, 0, 'He or she am not going to sing'],
        [0, 12, 3, 0, 'We am not going to sing'],
        [0, 22, 3, 0, 'You (2 or more) am not going to sing'],
        [0, 32, 3, 0, 'They am not going to sing'],
        [0, 0, 3, 0, 'Someone am not going to sing'],
        // 4. should (optative)
        [1, 11, 4, 0, 'I should sing'],
        [1, 21, 4, 0, 'You should sing'],
        [1, 31, 4, 0, 'He or she should sing'],
        [1, 12, 4, 0, 'We should sing'],
        [1, 22, 4, 0, 'You (2 or more) should sing'],
        [1, 32, 4, 0, 'They should sing'],
        [1, 0, 4, 0, 'Someone should sing'],
        // -- negative
        [0, 11, 4, 0, 'I should not sing'],
        [0, 21, 4, 0, 'You should not sing'],
        [0, 31, 4, 0, 'He or she should not sing'],
        [0, 12, 4, 0, 'We should not sing'],
        [0, 22, 4, 0, 'You (2 or more) should not sing'],
        [0, 32, 4, 0, 'They should not sing'],
        [0, 0, 4, 0, 'Someone should not sing'],
        // 5. started to (inceptive-progressive)
        [1, 11, 5, 0, 'I started to sing'],
        [1, 21, 5, 0, 'You started to sing'],
        [1, 31, 5, 0, 'He or she started to sing'],
        [1, 12, 5, 0, 'We started to sing'],
        [1, 22, 5, 0, 'You (2 or more) started to sing'],
        [1, 32, 5, 0, 'They started to sing'],
        [1, 0, 5, 0, 'Someone started to sing'],
        // -- negative
        [0, 11, 5, 0, 'I did not start to sing'],
        [0, 21, 5, 0, 'You did not start to sing'],
        [0, 31, 5, 0, 'He or she did not start to sing'],
        [0, 12, 5, 0, 'We did not start to sing'],
        [0, 22, 5, 0, 'You (2 or more) did not start to sing'],
        [0, 32, 5, 0, 'They did not start to sing'],
        [0, 0, 5, 0, 'Someone did not start to sing'],
        // 11. usually (usitative) - imperfective
        [1, 11, 1, 1, 'I usually sing'],
        [1, 21, 1, 1, 'You usually sing'],
        [1, 31, 1, 1, 'He usually sings'],
        [1, 21, 1, 1, 'We usually sing'],
        [1, 22, 1, 1, 'You (2 or more) usually sing'],
        [1, 32, 1, 1, 'They usually sing'],
        [1, 0, 1, 1, 'Someone usually sings'],
        // -- negative
        [0, 11, 1, 1, 'I do not usually sing'],
        [0, 21, 1, 1, 'You do not usually sing'],
        [0, 31, 1, 1, 'He or she does not usually sing'],
        [0, 12, 1, 1, 'We do not usually sing'],
        // intentionally missing
        // [0, 22, 1, 1, 'You (2 or more) do not usually sing'],
        [0, 1, 1, 1, 'They do not usually sing'],
        [0, 0, 1, 1, 'Someone does not usually sing'],
    ] as const
).map(([positive, person, aspect, usitative, text], index) => ({
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
            {
                //TODO make this a switch!
                type: FormFieldType.staticSelect,
                name: POSITIVE,
                label: POSITIVE,
                description: 'Positive or negative (lha) form?',
                constraints: [],
                options: [
                    {
                        value: '1',
                        display: 'positive',
                    },
                    {
                        value: '0',
                        display: 'not (lha)',
                    },
                ],
            },
            {
                type: FormFieldType.staticSelect,
                name: PERSON,
                label: PERSON,
                description: 'Who dunnit?',
                constraints: [],
                options: [
                    {
                        value: '11',
                        display: 'I',
                    },
                    {
                        value: '21',
                        display: 'you',
                    },
                    {
                        value: '31',
                        display: 'He or she',
                    },
                    {
                        value: '12',
                        display: 'we',
                    },
                    {
                        value: '22',
                        display: 'you (2 or more)',
                    },
                    {
                        value: '32',
                        display: 'they',
                    },
                    {
                        value: '0',
                        display: 'someone',
                    },
                ],
            },
            {
                type: FormFieldType.staticSelect,
                name: ASPECT,
                label: ASPECT,
                description: 'Similar to (but technically different from) tense in English.',
                constraints: [],
                options: [
                    {
                        value: '1',
                        display: 'imperfective (now)',
                    },
                    {
                        value: '2',
                        display: 'perfective (already)',
                    },
                    {
                        value: '3',
                        display: 'inceptive-progressive (going to)',
                    },
                    {
                        value: '4',
                        display: 'optative (should)',
                    },
                    {
                        value: '5',
                        display: 'inceptive perfective (started to)',
                    },
                ],
            },
            {
                type: FormFieldType.staticSelect,
                name: USITATIVE,
                label: USITATIVE,
                description: 'The usitative form indicates a habitual or customary action',
                constraints: [],
                options: [
                    {
                        value: '1',
                        display: 'usually',
                    },
                    {
                        value: '0',
                        display: 'ordinary form',
                    },
                ],
            },
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
                    lastName: contributors.creator.lastName,
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

                cy.get('#mui-component-select-aspect').get(`[data-value="3"]`).click();

                cy.get('#mui-component-select-positive').click();

                cy.get('#mui-component-select-positive').get(`[data-value="0"]`).click();

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
                it(`should display the list`, () => {
                    /**
                     * TODO make a cypress command for the next two steps:
                     * cy.fillStaticSelect('positive','0');
                     */
                    cy.get('#mui-component-select-positive').click();

                    cy.get('#mui-component-select-positive').get(`[data-value="0"]`).click();

                    cy.get(`#mui-component-select-person`).click();

                    cy.get(`#mui-component-select-person`).get(`[data-value="31"]`).click();

                    cy.get(`#mui-component-select-aspect`).click();

                    cy.get(`#mui-component-select-aspect`).get(`[data-value="2"]`).click();

                    cy.get(`#mui-component-select-usitative`).click();

                    cy.get(`#mui-component-select-usitative`).get(`[data-value="0"]`).click();

                    cy.contains('He or she did not sing');

                    /**
                     * This is an ad-hoc way to verify that there is only one
                     * result given that the list is displayed as a carousel.
                     *
                     * Consider presenting the number of results to the user:
                     * `1 Result Found`
                     */
                    cy.getByDataAttribute('NEXT').click();

                    cy.contains('He or she did not sing');
                });
            });

            describe(`when filters match multiple terms`, () => {
                it.only(`should display the list`, () => {
                    /**
                     * TODO make a cypress command for the next two steps:
                     * cy.fillStaticSelect('positive','0');
                     */
                    cy.get('#mui-component-select-positive').click();

                    cy.get('#mui-component-select-positive').get(`[data-value="1"]`).click();

                    cy.get(`#mui-component-select-person`).click();

                    cy.get(`#mui-component-select-person`).get(`[data-value="11"]`).click();

                    cy.get(`#mui-component-select-usitative`).click();

                    cy.get(`#mui-component-select-usitative`).get(`[data-value="0"]`).click();

                    cy.contains('I am singing');

                    cy.getByDataAttribute('NEXT').click();

                    cy.contains('I sang');

                    cy.getByDataAttribute('NEXT').click();

                    cy.contains('I am going to sing');

                    cy.getByDataAttribute('NEXT').click();

                    cy.contains('I should sing');

                    cy.getByDataAttribute('NEXT').click();

                    cy.contains('I started to sing');

                    cy.getByDataAttribute('NEXT').click();

                    // it should roll over at this point
                    cy.contains('I am singing');
                });
            });

            describe(`when filters match exactly one term`, () => {
                it(`should display the list`, () => {
                    /**
                     * TODO make a cypress command for the next two steps:
                     * cy.fillStaticSelect('positive','0');
                     */
                    cy.get('#mui-component-select-positive').click();

                    cy.get('#mui-component-select-positive').get(`[data-value="0"]`).click();

                    cy.get(`#mui-component-select-person`).click();

                    cy.get(`#mui-component-select-person`).get(`[data-value="22"]`).click();

                    cy.get(`#mui-component-select-aspect`).click();

                    cy.get(`#mui-component-select-aspect`).get(`[data-value="1"]`).click();

                    cy.get(`#mui-component-select-usitative`).click();

                    cy.get(`#mui-component-select-usitative`).get(`[data-value="1"]`).click();

                    cy.contains('No result found');
                });
            });
        });
    });
});
