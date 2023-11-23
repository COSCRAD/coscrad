import { LanguageCode } from '@coscrad/api-interfaces';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { AggregateType } from '../../../types/AggregateType';
import { LineItemTranslation } from './transcribable.mixin';
import { TranscriptItem } from './transcript-item.entity';
import { Transcript } from './transcript.entity';

const inPointMilliseconds = 100.5;

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const participantInitials: string[] = ['BS', 'AP', 'JB', 'GH'];

const lineItemToTranslate = new TranscriptItem({
    inPointMilliseconds,
    outPointMilliseconds: inPointMilliseconds * 2,
    text: buildMultilingualTextWithSingleItem('original text', originalLanguageCode),
    speakerInitials: participantInitials[0],
});

const existingTranscriptWithNoItems = new Transcript({
    items: [],
    participants: participantInitials.map((initials) => ({
        initials,
        name: `name of : ${initials}`,
    })),
});

const audioItemWithEmptyTranscript = getValidAggregateInstanceForTest(
    AggregateType.audioItem
).clone({
    transcript: existingTranscriptWithNoItems,
});

const translationItems: LineItemTranslation[] = [
    {
        inPointMilliseconds: lineItemToTranslate.inPointMilliseconds,
        speakerInitials: participantInitials[0],
        text: 'this is what was said',
        languageCode: translationLanguageCode,
    },
];

describe('AudioItem.importTranslationsForTranscript', () => {
    describe(`when the input is valid`, () => {
        it(`should succeed`, () => {
            const result = audioItemWithEmptyTranscript
                .clone({
                    transcript: existingTranscriptWithNoItems.clone({
                        items: [lineItemToTranslate],
                    }),
                })
                .importTranslationsForTranscript(translationItems);

            expect(result).not.toBeInstanceOf(Error);
        });
    });
});
