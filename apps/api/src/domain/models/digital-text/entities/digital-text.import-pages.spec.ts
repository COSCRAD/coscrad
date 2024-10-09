import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { DigitalText, DigitalTextPageImport } from '.';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { MultilingualAudio } from '../../shared/multilingual-audio/multilingual-audio.entity';
import {
    CannotImportPagesToNonEmptyDigitalTextError,
    EmptyPageImportError,
    FailedToImportPagesToDigitalTextError,
    MissingOriginalTextItemInPageImportError,
} from '../errors';
import DigitalTextPage from './digital-text-page.entity';

const pageIdentifier = '6v';

const textContent = 'Hello world';

const translation = 'hello world translated';

const audioItemIdForOriginalLanguage = buildDummyUuid(1);

const audioItemIdForTranslationLanguage = buildDummyUuid(3);

const photographId = buildDummyUuid(2);

const originalLanguageCode = LanguageCode.Chinook;

const translationLanguageCode = LanguageCode.Chilcotin;

const existingDigitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone({
    pages: [],
});

const additionalPagesToImport = [11, 12, 13].map((pageNumber): DigitalTextPageImport => {
    const pageIdentifier = pageNumber.toString();

    return {
        pageIdentifier,
        audioAndTextContent: [
            {
                text: `text for page: ${pageIdentifier}`,
                languageCode: originalLanguageCode,
                isOriginalLanguage: true,
            },
            {
                text: `translation for page: ${pageIdentifier}`,
                languageCode: translationLanguageCode,
                isOriginalLanguage: false,
            },
        ],
    };
});

const validPagesToImport = [
    {
        pageIdentifier,
        audioAndTextContent: [
            {
                text: textContent,
                languageCode: originalLanguageCode,
                isOriginalLanguage: true,
                audioItemId: audioItemIdForOriginalLanguage,
            },
            {
                text: translation,
                languageCode: translationLanguageCode,
                isOriginalLanguage: false,
                audioItemId: audioItemIdForTranslationLanguage,
            },
        ],
        photographId,
    },
    ...additionalPagesToImport,
];

describe(`DigitalText.ImportPages`, () => {
    describe(`when the import is valid`, () => {
        describe(`when all optional properties are specified`, () => {
            it(`should succeed`, () => {
                const result = existingDigitalText.importPages(validPagesToImport);

                expect(result).toBeInstanceOf(DigitalText);

                const updatedText = result as DigitalText;

                const pageSearch = updatedText.getPage(pageIdentifier);

                expect(pageSearch).toBeInstanceOf(DigitalTextPage);

                const targetPage = pageSearch as DigitalTextPage;

                const pageContent = targetPage.getContent() as MultilingualText;

                const originalTextSearch = pageContent.getOriginalTextItem();

                expect(originalTextSearch.text).toBe(textContent);

                expect(originalTextSearch.languageCode).toBe(originalLanguageCode);

                const translationTextSearch = pageContent.getTranslation(translationLanguageCode);

                expect(translationTextSearch).toBeInstanceOf(MultilingualTextItem);

                const { text: foundTranslationText, languageCode: foundTranslationLanguageCode } =
                    translationTextSearch as MultilingualTextItem;

                expect(foundTranslationText).toBe(translation);

                expect(foundTranslationLanguageCode).toBe(translationLanguageCode);

                expect(targetPage.getAudioIn(originalLanguageCode)).toBe(
                    audioItemIdForOriginalLanguage
                );

                expect(targetPage.getAudioIn(translationLanguageCode)).toBe(
                    audioItemIdForTranslationLanguage
                );

                expect(targetPage.photographId).toBe(photographId);
            });
        });

        describe(`when no optional properties are specified`, () => {
            const result = existingDigitalText.importPages([
                {
                    pageIdentifier,
                    audioAndTextContent: [
                        {
                            text: textContent,
                            languageCode: originalLanguageCode,
                            isOriginalLanguage: true,
                            // audioItemId: audioItemIdForOriginalLanguage,
                        },
                        {
                            text: translation,
                            languageCode: translationLanguageCode,
                            isOriginalLanguage: false,
                            // audioItemId: audioItemIdForTranslationLanguage,
                        },
                    ],
                    // photographId,
                },
            ]);

            expect(result).toBeInstanceOf(DigitalText);

            const updatedText = result as DigitalText;

            const pageSearch = updatedText.getPage(pageIdentifier);

            expect(pageSearch).toBeInstanceOf(DigitalTextPage);

            const targetPage = pageSearch as DigitalTextPage;

            const pageContent = targetPage.getContent() as MultilingualText;

            const originalTextSearch = pageContent.getOriginalTextItem();

            expect(originalTextSearch.text).toBe(textContent);

            expect(originalTextSearch.languageCode).toBe(originalLanguageCode);

            const translationTextSearch = pageContent.getTranslation(translationLanguageCode);

            expect(translationTextSearch).toBeInstanceOf(MultilingualTextItem);

            const { text: foundTranslationText, languageCode: foundTranslationLanguageCode } =
                translationTextSearch as MultilingualTextItem;

            expect(foundTranslationText).toBe(translation);

            expect(foundTranslationLanguageCode).toBe(translationLanguageCode);

            expect(targetPage.hasAudioIn(originalLanguageCode)).toBe(false);

            expect(targetPage.hasAudioIn(translationLanguageCode)).toBe(false);

            expect(targetPage.photographId).toBeFalsy();
        });
    });

    describe(`when the import is invalid`, () => {
        describe(`when no pages are provided`, () => {
            it(`should fail with the expected error`, () => {
                const result = existingDigitalText.importPages([]);

                assertErrorAsExpected(result, new EmptyPageImportError());
            });
        });

        describe(`when the digital text already has pages`, () => {
            it(`should fail with the expected error`, () => {
                const existingPages = [
                    new DigitalTextPage({
                        identifier: 'Me first!',
                        audio: MultilingualAudio.buildEmpty(),
                    }),
                ];

                const result = existingDigitalText
                    .clone({
                        pages: existingPages,
                    })
                    .importPages(validPagesToImport);

                assertErrorAsExpected(
                    result,
                    new CannotImportPagesToNonEmptyDigitalTextError(existingPages)
                );
            });
        });

        describe(`when no original text item is specified`, () => {
            const pagesWithNoOriginal = [
                {
                    pageIdentifier,
                    audioAndTextContent: [
                        {
                            text: textContent,
                            languageCode: originalLanguageCode,
                            isOriginalLanguage: false,
                            audioItemId: audioItemIdForOriginalLanguage,
                        },
                        {
                            text: translation,
                            languageCode: translationLanguageCode,
                            isOriginalLanguage: false,
                            audioItemId: audioItemIdForTranslationLanguage,
                        },
                    ],
                    photographId,
                },
            ];

            it(`should fail`, () => {
                const result = existingDigitalText.importPages(pagesWithNoOriginal);

                assertErrorAsExpected(
                    result,
                    new FailedToImportPagesToDigitalTextError(
                        existingDigitalText.id,

                        [new MissingOriginalTextItemInPageImportError()]
                    )
                );
            });
        });

        describe(`when multiple original text items are specified`, () => {
            const pagesWithMultipleOriginals = [
                {
                    pageIdentifier,
                    audioAndTextContent: [
                        {
                            text: textContent,
                            languageCode: originalLanguageCode,
                            isOriginalLanguage: true,
                            audioItemId: audioItemIdForOriginalLanguage,
                        },
                        {
                            text: translation,
                            languageCode: translationLanguageCode,
                            isOriginalLanguage: true,
                            audioItemId: audioItemIdForTranslationLanguage,
                        },
                    ],
                    photographId,
                },
            ];

            it(`should fail`, () => {
                const result = existingDigitalText.importPages(pagesWithMultipleOriginals);

                assertErrorAsExpected(
                    result,
                    new FailedToImportPagesToDigitalTextError(existingDigitalText.id, [])
                );
            });
        });

        describe(`when multiple items have the same language`, () => {
            it(`should fail`, () => {
                const repeatedLanguageCode = LanguageCode.English;

                const result = existingDigitalText.importPages([
                    {
                        pageIdentifier,
                        audioAndTextContent: [
                            {
                                text: textContent,
                                languageCode: repeatedLanguageCode,
                                isOriginalLanguage: true,
                                audioItemId: audioItemIdForOriginalLanguage,
                            },
                            {
                                text: translation,
                                languageCode: repeatedLanguageCode,
                                isOriginalLanguage: true,
                                audioItemId: audioItemIdForTranslationLanguage,
                            },
                        ],
                        photographId,
                    },
                ]);

                assertErrorAsExpected(
                    result,
                    new FailedToImportPagesToDigitalTextError(existingDigitalText.id, [])
                );
            });
        });

        describe(`when one of the text items is an empty string`, () => {
            it(`should fail`, () => {
                const result = existingDigitalText.importPages([
                    {
                        pageIdentifier,
                        audioAndTextContent: [
                            {
                                text: '', // not allowed
                                languageCode: originalLanguageCode,
                                isOriginalLanguage: true,
                                audioItemId: audioItemIdForOriginalLanguage,
                            },
                            {
                                text: translation,
                                languageCode: translationLanguageCode,
                                isOriginalLanguage: true,
                                audioItemId: audioItemIdForTranslationLanguage,
                            },
                        ],
                        photographId,
                    },
                ]);

                assertErrorAsExpected(
                    result,
                    new FailedToImportPagesToDigitalTextError(existingDigitalText.id, [])
                );
            });
        });

        describe(`when one of the audio item IDs is an empty string`, () => {
            it(`should fail with the expected errors`, () => {
                const result = existingDigitalText.importPages([
                    {
                        pageIdentifier,
                        audioAndTextContent: [
                            {
                                text: textContent,
                                languageCode: originalLanguageCode,
                                isOriginalLanguage: true,
                                audioItemId: audioItemIdForOriginalLanguage,
                            },
                            {
                                text: translation,
                                languageCode: translationLanguageCode,
                                isOriginalLanguage: true,
                                audioItemId: '', // not allowed
                            },
                        ],
                        photographId,
                    },
                ]);

                assertErrorAsExpected(
                    result,
                    new FailedToImportPagesToDigitalTextError(existingDigitalText.id, [])
                );
            });
        });

        describe(`when the photograph ID is an empty string`, () => {
            it(`should fail with the expected errors`, () => {
                const result = existingDigitalText.importPages([
                    {
                        pageIdentifier,
                        audioAndTextContent: [
                            {
                                text: textContent,
                                languageCode: originalLanguageCode,
                                isOriginalLanguage: true,
                                audioItemId: audioItemIdForOriginalLanguage,
                            },
                            {
                                text: translation,
                                languageCode: translationLanguageCode,
                                isOriginalLanguage: true,
                                audioItemId: audioItemIdForTranslationLanguage,
                            },
                        ],
                        photographId: '', // not allowed
                    },
                    ...additionalPagesToImport,
                ]);

                assertErrorAsExpected(
                    result,
                    new FailedToImportPagesToDigitalTextError(existingDigitalText.id, [])
                );
            });
        });
    });
});
