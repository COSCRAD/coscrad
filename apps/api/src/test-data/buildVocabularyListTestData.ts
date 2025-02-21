import {
    AggregateType,
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    LanguageCode,
} from '@coscrad/api-interfaces';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { EdgeConnectionMember } from '../domain/models/context/edge-connection.entity';
import { GeneralContext } from '../domain/models/context/general-context/general-context.entity';
import { TextFieldContext } from '../domain/models/context/text-field-context/text-field-context.entity';
import { ResourcePublished } from '../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { validAggregateOrThrow } from '../domain/models/shared/functional';
import { Term } from '../domain/models/term/entities/term.entity';
import {
    FilterPropertyType,
    TermAddedToVocabularyList,
    TermInVocabularyListAnalyzed,
    VocabularyListCreated,
    VocabularyListFilterPropertyRegistered,
} from '../domain/models/vocabulary-list/commands';
import { VocabularyListNameTranslated } from '../domain/models/vocabulary-list/commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event';
import { VocabularyList } from '../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { VocabularyListEntry } from '../domain/models/vocabulary-list/vocabulary-list-entry.entity';
import { isNotFound } from '../lib/types/not-found';
import { buildTermsForVocabularyList } from './buildTermTestData';
import { TestEventStream } from './events';
import { convertSequenceNumberToUuid } from './utilities/convertSequentialIdToUuid';

/**
 * TODO Let's use a different approach. This feels like too much magic at this point.
 */
const terms = buildTermsForVocabularyList();

const buildEntryForTerm = (term: Term): VocabularyListEntry => {
    const { id } = term;

    // 1 positive = true, 2 positive = false (negative form)
    const positive = id.slice(-2) === '1';

    // 1 - first person, etc.
    const person = id.slice(-1);

    return new VocabularyListEntry({
        termId: id,
        variableValues: {
            positive,
            person,
        },
    });
};

const entries = terms.map(buildEntryForTerm);

const detailedVocabularyListId = buildDummyUuid(4567);

/**
 * TODO We may want to consider exposing a helper
 * `buildEventHistoryForVocabularyList(...)`
 * so that outside of this test we can use state-based setup.
 *
 * Another way to do this would be to wrap this behaviour into
 * `getValidAggregateForTest` so we don't have to rewrite lots of command test
 * setup.
 */
const eventHistoryForDetailedVocabularyList = entries
    .reduce(
        (acc, { termId, variableValues }) =>
            acc
                .andThen<TermAddedToVocabularyList>({
                    type: 'TERM_ADDED_TO_VOCABULARY_LIST',
                    payload: {
                        termId,
                    },
                })

                .andThen<TermInVocabularyListAnalyzed>({
                    type: 'TERM_IN_VOCABULARY_LIST_ANALYZED',
                    payload: {
                        termId,
                        propertyValues: variableValues,
                    },
                }),
        new TestEventStream()
            .andThen<VocabularyListCreated>({
                type: 'VOCABULARY_LIST_CREATED',
                payload: {
                    name: 'To Sing (lang)',
                    languageCodeForName: LanguageCode.Chilcotin,
                },
            })
            .andThen<VocabularyListNameTranslated>({
                type: 'VOCABULARY_LIST_NAME_TRANSLATED',
                payload: {
                    text: 'To Sing (Engl)',
                    languageCode: LanguageCode.English,
                },
            })
            .andThen<VocabularyListFilterPropertyRegistered>({
                type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
                payload: {
                    type: FilterPropertyType.selection,
                    name: 'person',
                    allowedValuesAndLabels: [
                        {
                            value: '1',
                            label: 'I',
                        },
                        {
                            value: '2',
                            label: 'You',
                        },
                        {
                            value: '3',
                            label: 'She',
                        },
                    ],
                },
            })
            .andThen<VocabularyListFilterPropertyRegistered>({
                type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
                payload: {
                    type: FilterPropertyType.checkbox,
                    name: 'positive',
                    allowedValuesAndLabels: [
                        {
                            value: false,
                            label: 'negative (lha)',
                        },
                        {
                            value: true,
                            label: 'positive form (switch for negative)',
                        },
                    ],
                },
            })
    )
    .andThen<ResourcePublished>({
        type: 'RESOURCE_PUBLISHED',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.vocabularyList,
            },
        },
    })
    .as({
        type: AggregateType.vocabularyList,
        id: detailedVocabularyListId,
    });

const eventHistoryForVocabularyListWithBilingualName = new TestEventStream()
    .andThen<VocabularyListCreated>({
        type: 'VOCABULARY_LIST_CREATED',
        payload: {
            name: 'text VL 1 chil',
            languageCodeForName: LanguageCode.Chilcotin,
        },
    })
    .andThen<VocabularyListNameTranslated>({
        type: 'VOCABULARY_LIST_NAME_TRANSLATED',
        payload: {
            text: 'test VL 1 engl',
            languageCode: LanguageCode.English,
        },
    })
    .andThen<VocabularyListFilterPropertyRegistered>({
        type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
        payload: {
            type: FilterPropertyType.selection,
            name: 'person',
            allowedValuesAndLabels: [
                {
                    value: '11',
                    label: 'I',
                },
                {
                    value: '21',
                    label: 'You',
                },
            ],
        },
    })
    .andThen<TermAddedToVocabularyList>({
        type: 'TERM_ADDED_TO_VOCABULARY_LIST',
        payload: {
            termId: convertSequenceNumberToUuid(1),
        },
    })
    .andThen<TermInVocabularyListAnalyzed>({
        type: 'TERM_IN_VOCABULARY_LIST_ANALYZED',
        payload: {
            termId: convertSequenceNumberToUuid(1),
            propertyValues: {
                person: '11',
            },
        },
    })
    .andThen<TermAddedToVocabularyList>({
        type: 'TERM_ADDED_TO_VOCABULARY_LIST',
        payload: {
            termId: convertSequenceNumberToUuid(2),
        },
    })
    .andThen<TermInVocabularyListAnalyzed>({
        type: 'TERM_IN_VOCABULARY_LIST_ANALYZED',
        payload: {
            termId: convertSequenceNumberToUuid(2),
            propertyValues: {
                person: '21',
            },
        },
    })
    .andThen<ResourcePublished>({
        type: 'RESOURCE_PUBLISHED',
        payload: {
            aggregateCompositeIdentifier: { type: AggregateType.vocabularyList },
        },
    })
    .as({
        type: AggregateType.vocabularyList,
        id: convertSequenceNumberToUuid(1),
    });

const eventHistoryForVocabularyListWithMonolingualName = new TestEventStream()
    .andThen<VocabularyListCreated>({
        type: 'VOCABULARY_LIST_CREATED',
        payload: {
            name: 'test VL 2 CHIL- no engl name',
        },
    })
    .andThen<VocabularyListFilterPropertyRegistered>({
        type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
        payload: {
            type: FilterPropertyType.checkbox,
            name: 'his',
            allowedValuesAndLabels: [
                {
                    value: true,
                    label: 'his',
                },
                {
                    value: false,
                    label: 'hers',
                },
            ],
        },
    })
    .andThen<TermAddedToVocabularyList>({
        type: 'TERM_ADDED_TO_VOCABULARY_LIST',
        payload: {
            termId: convertSequenceNumberToUuid(2),
        },
    })
    .andThen<TermInVocabularyListAnalyzed>({
        type: 'TERM_IN_VOCABULARY_LIST_ANALYZED',
        payload: {
            termId: convertSequenceNumberToUuid(2),
            propertyValues: {
                his: false,
            },
        },
    })
    .andThen<TermAddedToVocabularyList>({
        type: 'TERM_ADDED_TO_VOCABULARY_LIST',
        payload: {
            termId: convertSequenceNumberToUuid(1),
        },
    })
    .andThen<TermInVocabularyListAnalyzed>({
        type: 'TERM_IN_VOCABULARY_LIST_ANALYZED',
        payload: {
            termId: convertSequenceNumberToUuid(1),
            propertyValues: {
                his: true,
            },
        },
    })
    .as({
        type: AggregateType.vocabularyList,
        id: convertSequenceNumberToUuid(2),
    });

const vocabularyLists = [
    eventHistoryForDetailedVocabularyList,
    eventHistoryForVocabularyListWithBilingualName,
    eventHistoryForVocabularyListWithMonolingualName,
]
    .map((eventHistory) =>
        VocabularyList.fromEventHistory(
            eventHistory,
            eventHistory[0].payload.aggregateCompositeIdentifier.id
        )
    )
    // fail fast if something is wrong with our test setup
    .filter(
        (result): result is VocabularyList => !isNotFound(result) && validAggregateOrThrow(result)
    );

export const buildTestVocabularyListEdgeConnectionMember = (
    contextType: EdgeConnectionContextType,
    role: EdgeConnectionMemberRole
) => {
    const vocabularyListWithBilingualName = vocabularyLists[1];

    if (contextType === EdgeConnectionContextType.textField) {
        return new EdgeConnectionMember({
            role,
            compositeIdentifier: vocabularyListWithBilingualName.getCompositeIdentifier(),
            context: new TextFieldContext({
                target: 'name',
                charRange: [5, 7],
                languageCode:
                    vocabularyListWithBilingualName.name.getOriginalTextItem().languageCode,
            }),
        });
    }

    if (contextType === EdgeConnectionContextType.general) {
        return new EdgeConnectionMember({
            role,
            compositeIdentifier: vocabularyLists[0].getCompositeIdentifier(),
            context: new GeneralContext(),
        });
    }
};

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): VocabularyList[] => {
    return vocabularyLists;
};
