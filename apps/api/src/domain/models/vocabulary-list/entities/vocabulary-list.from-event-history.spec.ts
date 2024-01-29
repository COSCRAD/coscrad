import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NotFound } from '../../../../lib/types/not-found';
import { TestEventStream } from '../../../../test-data/events';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import {
    TermAddedToVocabularyList,
    TermInVocabularyListAnalyzed,
    VocabularyListCreated,
    VocabularyListFilterPropertyRegistered,
} from '../commands';
import { VocabularyListNameTranslated } from '../commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event';
import { VocabularyList } from './vocabulary-list.entity';

const vocabularyListNameText = 'The vocabulary name';

const originalLanguageCode = LanguageCode.English;

const translationLanguageCode = LanguageCode.Chilcotin;

const vocabularyListCreated = new TestEventStream().andThen<VocabularyListCreated>({
    type: `VOCABULARY_LIST_CREATED`,
    payload: {
        name: vocabularyListNameText,
        languageCodeForName: originalLanguageCode,
    },
});

const vocabularyListNameTranslationText = "Translation of Vocabulary List's name";

const vocabularyListNameTranslated = vocabularyListCreated.andThen<VocabularyListNameTranslated>({
    type: `VOCABULARY_LIST_NAME_TRANSLATED`,
    payload: {
        text: vocabularyListNameTranslationText,
        languageCode: translationLanguageCode,
    },
});

const termIdForEntry = buildDummyUuid(9);

const termAddedToVocabularyList = vocabularyListNameTranslated.andThen<TermAddedToVocabularyList>({
    type: `TERM_ADDED_TO_VOCABULARY_LIST`,
    payload: {
        termId: termIdForEntry,
    },
});

const filterPropertyName = 'number';

const filterPropertyValuesAndLabels = [
    {
        value: '1',
        label: 'singular',
    },
    {
        value: '2',
        label: 'plural',
    },
];

// The value for number is 1 (which has the label "singular")

const propertyValueForEntry = filterPropertyValuesAndLabels[0].value;

const vocabularyListFilterPropertyRegistered =
    termAddedToVocabularyList.andThen<VocabularyListFilterPropertyRegistered>({
        type: 'VOCABULARY_LIST_FILTER_PROPERTY_REGISTERED',
        payload: {
            name: filterPropertyName,
            allowedValuesAndLabels: filterPropertyValuesAndLabels,
        },
    });

const termInVocabularyListAnalyzed =
    vocabularyListFilterPropertyRegistered.andThen<TermInVocabularyListAnalyzed>({
        type: 'TERM_IN_VOCABULARY_LIST_ANALYZED',
        payload: {
            termId: termIdForEntry,
            propertyValues: {
                [filterPropertyName]: propertyValueForEntry,
            },
        },
    });

const vocabularyListCompositeIdentfier = {
    type: AggregateType.vocabularyList,
    id: buildDummyUuid(23),
} as const;

describe(`VocabularyList.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when there is only a creation event`, () => {
            it(`should create the vocabulary list properly`, () => {
                const result = VocabularyList.fromEventHistory(
                    vocabularyListCreated.as(vocabularyListCompositeIdentfier),
                    vocabularyListCompositeIdentfier.id
                );

                expect(result).toBeInstanceOf(VocabularyList);

                const vocabularyList = result as VocabularyList;

                const { text: foundTitleText, languageCode } = vocabularyList
                    .getName()
                    .getOriginalTextItem();

                expect(foundTitleText).toBe(vocabularyListNameText);

                expect(languageCode).toBe(originalLanguageCode);
            });
        });

        describe(`when the vocabulary list name has been translated`, () => {
            it(`should return a vocabulary list with the translated name`, () => {
                const result = VocabularyList.fromEventHistory(
                    vocabularyListNameTranslated.as(vocabularyListCompositeIdentfier),
                    vocabularyListCompositeIdentfier.id
                );

                expect(result).toBeInstanceOf(VocabularyList);

                const vocabularyList = result as VocabularyList;

                const nameTranslationSearchResult =
                    vocabularyList.name.getTranslation(translationLanguageCode);

                expect(nameTranslationSearchResult).not.toBe(NotFound);

                const { text: foundTranslationText } =
                    nameTranslationSearchResult as MultilingualTextItem;

                expect(foundTranslationText).toBe(vocabularyListNameTranslationText);
            });
        });

        describe(`when a term has been added to a vocabulary list`, () => {
            it(`should build a vocabulary list with the given term as an entry`, () => {
                const result = VocabularyList.fromEventHistory(
                    termAddedToVocabularyList.as(vocabularyListCompositeIdentfier),
                    vocabularyListCompositeIdentfier.id
                );

                expect(result).toBeInstanceOf(VocabularyList);

                const vocabularyList = result as VocabularyList;

                const entrySearchResult = vocabularyList.getEntryForTerm(termIdForEntry);

                expect(entrySearchResult).not.toBe(NotFound);
            });
        });

        describe(`when a filter property has been registered for a vocabulary list`, () => {
            it(`should return a vocabulary list with the given filter property`, () => {
                const result = VocabularyList.fromEventHistory(
                    vocabularyListFilterPropertyRegistered.as(vocabularyListCompositeIdentfier),
                    vocabularyListCompositeIdentfier.id
                );

                expect(result).toBeInstanceOf(VocabularyList);

                const vocabularyList = result as VocabularyList;

                const filterPropertySearchResult =
                    vocabularyList.getFilterPropertyByName(filterPropertyName);

                expect(filterPropertySearchResult).not.toBe(NotFound);

                // TODO we may actually want to do some assertions around filtering
            });
        });

        describe(`when a term in a vocabulary list has been analyzed`, () => {
            it(`should return a vocabulary list that has assigned the given property value to the given entry`, () => {
                const eventHistory = termInVocabularyListAnalyzed
                    .as(vocabularyListCompositeIdentfier)
                    .map((event) => {
                        if (!event.isOfType(`TERM_IN_VOCABULARY_LIST_ANALYZED`)) return event;

                        const eventToFix = event as TermInVocabularyListAnalyzed;

                        /**
                         * Note that record-valued-properties do not play nice
                         * with `clonePlainObjectWithOverrides` in our test
                         * event stream helper, so we have to force the override
                         * on the record-valued `propertyValues` prop on the
                         * following event payload.
                         */
                        return new TermInVocabularyListAnalyzed(
                            {
                                ...eventToFix.payload,
                                propertyValues: {
                                    [filterPropertyName]: propertyValueForEntry,
                                },
                            },
                            event.meta
                        );
                    });

                const result = VocabularyList.fromEventHistory(
                    eventHistory,
                    vocabularyListCompositeIdentfier.id
                );

                expect(result).toBeInstanceOf(VocabularyList);

                const vocabularyList = result as VocabularyList;

                const foundEntries = vocabularyList.findEntries({
                    [filterPropertyName]: propertyValueForEntry,
                });

                expect(foundEntries).toHaveLength(1);

                const unexpectedResults = foundEntries.filter(
                    ({ termId }) => termId !== termIdForEntry
                );

                expect(unexpectedResults).toEqual([]);
            });
        });
    });
});
