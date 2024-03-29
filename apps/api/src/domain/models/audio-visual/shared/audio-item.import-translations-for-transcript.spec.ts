import { LanguageCode } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import { AggregateType } from '../../../types/AggregateType';
import { AudioItem } from '../audio-item/entities/audio-item.entity';
import { InvalidTranscriptError } from './commands/transcripts/errors';
import { TranscriptItem } from './entities/transcript-item.entity';
import { Transcript } from './entities/transcript.entity';
import { LineItemTranslation } from './methods/import-translations-for-transcript';
import {
    CannotOverrideTranslationError,
    CannotTranslateEmptyTranscriptError,
    EmptyTranslationForTranscriptItem,
    FailedToImportTranslationsToTranscriptError,
    LineItemNotFoundForTranslationError,
} from './transcript-errors';

const inPointMilliseconds = 100.5;

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const participantInitials: string[] = ['BS', 'AP', 'JB', 'GH'];

const originalLineItemText = 'original text';

const lineItemToTranslate = new TranscriptItem({
    inPointMilliseconds,
    outPointMilliseconds: inPointMilliseconds * 2,
    text: buildMultilingualTextWithSingleItem(originalLineItemText, originalLanguageCode),
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

const translationItem: LineItemTranslation = {
    inPointMilliseconds: lineItemToTranslate.inPointMilliseconds,
    text: translationText,
    languageCode: translationLanguageCode,
};

const translationItems: LineItemTranslation[] = [translationItem];

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
        describe(`when the transcript doesn't have any items`, () => {
            it(`should return the appropriate error`, () => {
                const result =
                    audioItemWithEmptyTranscript.importTranslationsForTranscript(translationItems);

                assertErrorAsExpected(result, new CannotTranslateEmptyTranscriptError());
            });
        });

        describe(`when there is no existing item with the given in point`, () => {
            it(`should return the appropriate error`, () => {
                const result = audioItemWithEmptyTranscript
                    .clone({
                        transcript: existingTranscriptWithNoItems.clone({
                            items: [
                                lineItemToTranslate.clone({
                                    // does not line up with any translation item
                                    inPointMilliseconds: 123.45678,
                                }),
                            ],
                        }),
                    })
                    .importTranslationsForTranscript(translationItems);

                assertErrorAsExpected(
                    result,
                    new FailedToImportTranslationsToTranscriptError([
                        new LineItemNotFoundForTranslationError(
                            translationItems[0].inPointMilliseconds,
                            translationItems[0].text,
                            translationItems[0].languageCode
                        ),
                    ])
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
                    new FailedToImportTranslationsToTranscriptError([
                        new CannotOverrideTranslationError(
                            translationText,
                            translationLanguageCode,
                            originalLineItemText,
                            originalLanguageCode
                        ),
                    ])
                );
            });
        });

        describe(`when there are multiple translations with the same inPoint`, () => {
            const result = audioItemWithEmptyTranscript
                .clone({
                    transcript: existingTranscriptWithNoItems.clone({
                        items: [lineItemToTranslate],
                    }),
                })
                .importTranslationsForTranscript([translationItem, translationItem]);

            it(`should return the expected error`, () => {
                assertErrorAsExpected(
                    result,
                    new InvariantValidationError(
                        audioItemWithEmptyTranscript.getCompositeIdentifier(),
                        [new InvalidTranscriptError([])]
                    )
                );
            });
        });

        ['', '   '].forEach((invalidText) => {
            describe(`when ever the text has the invalid value "${invalidText}"`, () => {
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
                        new FailedToImportTranslationsToTranscriptError([
                            new EmptyTranslationForTranscriptItem(),
                        ])
                    );
                });
            });
        });
    });
});
