import {
    AggregateType,
    DropboxOrCheckbox,
    IMultilingualText,
    IVocabularyListEntry,
    IVocabularyListEntryTable,
    IVocabularyListViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import {
    buildDummyAggregateCompositeIdentifier,
    buildDummyUuid,
} from '../../../../support/utilities';

const vocabularyListName = 'My List';

const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.vocabularyList,
    1
);

const buildRoute = (id: string) => `/Resources/VocabularyLists/${id}`;

const validVocabularyListDetailRoute = buildRoute(aggregateCompositeIdentifier.id);

const languageCodeForName = LanguageCode.Chilcotin;

// the term has the same original language as the vocabulary list name in this case
const languageCodeForTerms = languageCodeForName;

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
const entries: IVocabularyListEntry<boolean | string>[] = (
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
        text: buildMultilingualTextWithSingleItem(text, languageCodeForTerms),
        id: buildDummyUuid(100 + index),
        isPublished: true,
        // TODO check that these come through as well
        contributions: [],
        tokens: [],
    },
    variableValues: {
        [POSITIVE]: positive.toString(),
        [PERSON]: person.toString(),
        [ASPECT]: aspect.toString(),
        [USITATIVE]: usitative.toString(),
    },
}));

const dynamicColumnHeadings = [
    {
        type: DropboxOrCheckbox.checkbox,
        propertyKey: `filterProperty${POSITIVE}Value`,
        headingLabel: 'Positive',
        allowedValuesAndLabels: [
            {
                value: true,
                label: 'positive',
            },
            {
                value: false,
                label: 'negative',
            },
        ],
    },
];

const table: IVocabularyListEntryTable = {
    // @ts-expect-error dynamic keys destroy static analysis maybe we should give up on the template type
    dynamicColumnHeadings,
    data: entries.map(({ term, variableValues }) => {
        const result = { ...term };

        Object.entries(variableValues).forEach(([k, v]) => {
            const { allowedValuesAndLabels } = dynamicColumnHeadings.find(
                (dch) => dch.propertyKey === k
            );

            result[`filterProperty${k}Value`] = allowedValuesAndLabels[JSON.stringify(v)];
        });

        return result;
    }),
};

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
    // this isn't used for the current test
    form: {
        fields: [],
    },
    isPublished: true,
    contributions: [
        {
            contributorIds: [buildDummyUuid(99)],
            statement: `Vocabulary List Created by: ${contributors.creator.firstName} ${contributors.creator.lastName}`,
            type: 'VOCABULARY_LIST_CREATED',
            date: {
                month: 'January',
                year: 2025,
                day: 1,
            },
            timestamp: 0,
        },
    ],
    // note that we have separate command tests for the actions
    actions: [],
    table: table,
    // what about tags?
};

describe(`the vocabulary list detail page "table view"`, () => {
    before(() => {
        cy.clearDatabase();

        // TODO move this mapping to `cy.seedDatabase()`
        const doc = { ...comprehensiveParadigm, _key: aggregateCompositeIdentifier.id };

        console.log({ doc });

        cy.seedDatabase('vocabularyList__VIEWS', [doc]);
    });

    beforeEach(() => {
        cy.visit(validVocabularyListDetailRoute);

        cy.get('[value="Table"]').click();
    });

    describe(`when the list exists`, () => {
        // before(() => {
        //     cy.clearDatabase();

        //     cy.seedTestUuids(200);
        // });

        it(`should display the entries using a table`, () => {
            cy.getByDataAttribute(`carousel`).should('not.exist');

            cy.getByDataAttribute(`tableview`).should('exist');
        });
    });

    describe(`when the list contains a comprehensive paradigm`, () => {
        beforeEach(() => {
            cy.get('#mui-component-select-pageSize').click();

            cy.get('[data-value="100"]').click();
        });

        it(`should render one row for each entry`, () => {
            entries.forEach(({ term: { id: termIdForEntryForThisRow } }) => {
                cy.getByDataAttribute(`vocabularyListEntryTableRow/${termIdForEntryForThisRow}`);

                // check that there is one result only
            });
        });

        describe(`the entry for "I am singing"`, () => {
            beforeEach(() => {
                cy.get('[data-testid="select_index_search_scope"] > .MuiSelect-select').click();

                // search by term
                cy.get('[data-value="name"]').click();

                cy.getByDataAttribute(`index_search_bar`).click();

                cy.getByDataAttribute(`index_search_bar`).type('I am singing');
            });

            it(`should display the value for positive`, () => {
                cy.contains('positive');
            });
        });
    });
});
