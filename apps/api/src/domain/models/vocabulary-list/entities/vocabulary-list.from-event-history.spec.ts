import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { TestEventStream } from '../../../../test-data/events';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { VocabularyListCreated } from '../commands';
import { VocabularyList } from './vocabulary-list.entity';

const vocabularyListNameText = 'The vocabulary name';

const originalLanguageCode = LanguageCode.English;

const vocabularyListCreated = new TestEventStream().andThen<VocabularyListCreated>({
    type: `VOCABULARY_LIST_CREATED`,
    payload: {
        name: vocabularyListNameText,
        languageCodeForName: originalLanguageCode,
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
    });
});
