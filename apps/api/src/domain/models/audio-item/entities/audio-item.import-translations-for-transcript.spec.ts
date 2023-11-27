import { LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateType } from '../../../types/AggregateType';
import { AudioItem } from './audio-item.entity';
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

const translationText = 'this is what was said';

const translationItems: LineItemTranslation[] = [
    {
        inPointMilliseconds: lineItemToTranslate.inPointMilliseconds,
        text: translationText,
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

            const updatedItem = result as unknown as AudioItem;

            const updatedTranscriptItem = updatedItem.transcript.getLineItem(
                lineItemToTranslate.inPointMilliseconds,
                lineItemToTranslate.outPointMilliseconds
            ) as TranscriptItem;

            const translation = updatedTranscriptItem.text.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(translation.languageCode).toBe(translationLanguageCode);

            expect(translation.text).toBe(translationText);
        });
    });

    describe(`when the input is invalid`, () => {
        describe(`when there is no existing item with the given in point`, () => {
            it(`should return the appropriate error`, () => {
                const result =
                    audioItemWithEmptyTranscript.importTranslationsForTranscript(translationItems);

                assertErrorAsExpected(
                    result,
                    new InternalError(`Blake, change me to a custom error class instance!`)
                );
            });
        });

        describe(`when there is already text in the translation langauge`, () => {
            const result = audioItemWithEmptyTranscript
                .clone({
                    transcript: existingTranscriptWithNoItems.clone({
                        items: [lineItemToTranslate],
                    }),
                })
                .importTranslationsForTranscript(
                    translationItems.map((item) => ({
                        ...item,
                        languageCode: originalLanguageCode,
                    }))
                );

            it(`should return the expected error`, () => {
                assertErrorAsExpected(
                    result,
                    new InternalError(`Blake, change me to a custom error class instance!`)
                );
            });
        });

        ['', '   '].forEach((invalidText) => {
            const result = audioItemWithEmptyTranscript
                .clone({
                    transcript: existingTranscriptWithNoItems.clone({
                        items: [lineItemToTranslate],
                    }),
                })
                .importTranslationsForTranscript([
                    {
                        ...translationItems[0],
                        text: invalidText,
                    },
                ]);

            it(`should fail with the expected error`, () => {
                assertErrorAsExpected(
                    result,
                    new InternalError(`Blake, change me to a custom error class instance!`)
                );
            });
        });
    });
});
