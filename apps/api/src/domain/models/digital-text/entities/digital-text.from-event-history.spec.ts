import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateType,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandFSA } from '../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import { buildTestCommandFsaMap } from '../../../../test-data/commands';
import { TestEventStream } from '../../../../test-data/events';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import {
    GrantResourceReadAccessToUser,
    ResourceReadAccessGrantedToUser,
} from '../../shared/common-commands';
import { BaseEvent } from '../../shared/events/base-event.entity';
import {
    AddAudioForDigitalTextTitle,
    AddPageToDigitalText,
    AudioAddedForDigitalTextPage,
    AudioAddedForDigitalTextTitle,
    CreateDigitalText,
    DigitalTextCreated,
    DigitalTextPageContentTranslated,
    DigitalTextTitleTranslated,
    PageAddedToDigitalText,
} from '../commands';
import {
    AddContentToDigitalTextPage,
    ContentAddedToDigitalTextPage,
} from '../commands/add-content-to-digital-text-page';
import { ADD_PAGE_TO_DIGITAL_TEXT } from '../constants';
import DigitalTextPage from './digital-text-page.entity';
import { DigitalText } from './digital-text.entity';

const id = buildDummyUuid(153);

const testFsaMap = buildTestCommandFsaMap();

const digitalTextTitle = `Foo Bar Baz Text`;

const languageCodeForTitle = LanguageCode.Haida;

const languageCodeForTitleTranslation = LanguageCode.English;

const createDigitalText = clonePlainObjectWithOverrides(
    testFsaMap.get(`CREATE_DIGITAL_TEXT`) as CommandFSA<CreateDigitalText>,
    {
        payload: {
            aggregateCompositeIdentifier: { id },
            title: digitalTextTitle,
            languageCodeForTitle,
        },
    }
);

const dummyDateManager = (() => {
    let currentDate = dummyDateNow;

    return {
        next: () => {
            const date = currentDate;

            currentDate++;

            return date;
        },
    };
})();

const digitalTextCreated = new DigitalTextCreated(createDigitalText.payload, {
    id: buildDummyUuid(154),
    userId: dummySystemUserId,
    dateCreated: dummyDateManager.next(),
});

const dummyPageIdentifier = '21';

const addPageToDigitalText = clonePlainObjectWithOverrides(
    testFsaMap.get(ADD_PAGE_TO_DIGITAL_TEXT) as CommandFSA<AddPageToDigitalText>,
    {
        payload: {
            aggregateCompositeIdentifier: { id },
            identifier: dummyPageIdentifier,
        },
    }
);

const audioItemIdForTitle = buildDummyUuid(2);

const addAudioForDigitalTextOriginalTitle = clonePlainObjectWithOverrides(
    testFsaMap.get(`ADD_AUDIO_FOR_DIGITAL_TEXT_TITLE`) as CommandFSA<AddAudioForDigitalTextTitle>,
    {
        payload: {
            aggregateCompositeIdentifier: { id },
            audioItemId: audioItemIdForTitle,
            languageCode: languageCodeForTitle,
        },
    }
);

const addAudioForDigitalTextTitleTranslation = clonePlainObjectWithOverrides(
    testFsaMap.get(`ADD_AUDIO_FOR_DIGITAL_TEXT_TITLE`) as CommandFSA<AddAudioForDigitalTextTitle>,
    {
        payload: {
            aggregateCompositeIdentifier: { id },
            audioItemId: audioItemIdForTitle,
            languageCode: languageCodeForTitleTranslation,
        },
    }
);

const audioAddedForDigitalTextTitle = new AudioAddedForDigitalTextTitle(
    addAudioForDigitalTextOriginalTitle.payload,
    {
        id: buildDummyUuid(117),
        userId: dummySystemUserId,
        dateCreated: dummyDateManager.next(),
    }
);

const audioAddedForDigitalTextTitleTranslation = new AudioAddedForDigitalTextTitle(
    addAudioForDigitalTextTitleTranslation.payload,
    {
        id: buildDummyUuid(117),
        userId: dummySystemUserId,
        dateCreated: dummyDateManager.next(),
    }
);

const pageAddedForDigitalText = new PageAddedToDigitalText(addPageToDigitalText.payload, {
    id: buildDummyUuid(155),
    userId: dummySystemUserId,
    dateCreated: dummyDateManager.next(),
});

const idForUserWithAccessToDigitalText = buildDummyUuid(45);

const grantReadAccessToUserForDigitalText = clonePlainObjectWithOverrides(
    testFsaMap.get(
        'GRANT_RESOURCE_READ_ACCESS_TO_USER'
    ) as CommandFSA<GrantResourceReadAccessToUser>,
    {
        payload: {
            aggregateCompositeIdentifier: { type: ResourceType.digitalText, id },
            userId: idForUserWithAccessToDigitalText,
        },
    }
);

const digitalTextReadAccessGrantedToUser = new ResourceReadAccessGrantedToUser(
    grantReadAccessToUserForDigitalText.payload,
    { id: buildDummyUuid(579), userId: dummySystemUserId, dateCreated: dummyDateManager.next() }
);

const dummyAddContentFsa = testFsaMap.get(
    'ADD_CONTENT_TO_DIGITAL_TEXT_PAGE'
) as CommandFSA<AddContentToDigitalTextPage>;

const originalTextContent = 'Twas many and many a year ago, in a kingdom by the beach!';

const originalLanguageCodeForContent = LanguageCode.English;

// TODO Use `TestEventStream` helper for this test
// TODO does this use the dummy page identifier?
const addContentCommand = clonePlainObjectWithOverrides(dummyAddContentFsa.payload, {
    aggregateCompositeIdentifier: {
        id,
    },
    text: originalTextContent,
    languageCode: originalLanguageCodeForContent,
});

const contentAddedToDigitalTextPage = new ContentAddedToDigitalTextPage(addContentCommand, {
    id: buildDummyUuid(580),
    userId: dummySystemUserId,
    dateCreated: dummyDateManager.next(),
});

const translationText = `the translation`;

const translationLanguageCodeForContent = LanguageCode.Chilcotin;

const digitalTextPageContentTranslated = new DigitalTextPageContentTranslated(
    {
        aggregateCompositeIdentifier: {
            type: AggregateType.digitalText,
            id,
        },
        pageIdentifier: dummyPageIdentifier,
        translation: translationText,
        languageCode: translationLanguageCodeForContent,
    },
    { id: buildDummyUuid(581), userId: dummySystemUserId, dateCreated: dummyDateManager.next() }
);

const audioItemId = buildDummyUuid(680);

const audioAddedForDigitalTextPage = new TestEventStream()
    .andThen<AudioAddedForDigitalTextPage>({
        type: `AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`,
        payload: {
            pageIdentifier: dummyPageIdentifier,
            languageCode: originalLanguageCodeForContent,
            audioItemId,
        },
    })
    .as({
        type: AggregateType.digitalText,
        id,
    })[0];

const titleTranslationText = 'translation of title';

const digitalTextTitleTranslated = new TestEventStream()
    .andThen<DigitalTextTitleTranslated>({
        type: 'DIGITAL_TEXT_TITLE_TRANSLATED',
        payload: {
            translation: titleTranslationText,
            languageCode: languageCodeForTitleTranslation,
        },
    })
    .as({
        type: AggregateType.digitalText,
        id,
    })[0];

describe(`DigitalText.fromEventHistory`, () => {
    describe(`when there are events for the given aggregate root`, () => {
        describe(`when there is only a creation event`, () => {
            const eventStream = [digitalTextCreated];

            it(`should succeed`, () => {
                const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

                expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

                const digitalText = digitalTextBuildResult as DigitalText;

                const builtDigitalTextTitle =
                    digitalText.title.getTranslation(languageCodeForTitle);

                if (isNotFound(builtDigitalTextTitle)) {
                    throw new Error(`Digital Text title not found!`);
                }

                expect(builtDigitalTextTitle.text).toBe(digitalTextTitle);
            });
        });

        describe(`when the title has been translated`, () => {
            const eventStream = [digitalTextCreated, digitalTextTitleTranslated];

            const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

            expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

            const digitalText = digitalTextBuildResult as DigitalText;

            const titleTranslationSearchResult = digitalText.title.getTranslation(
                languageCodeForTitleTranslation
            );

            expect(titleTranslationSearchResult).toBeInstanceOf(MultilingualTextItem);

            const titleTransation = titleTranslationSearchResult as MultilingualTextItem;

            expect(titleTransation.text).toBe(titleTranslationText);
        });

        describe(`when audio has been added to the title`, () => {
            describe(`when audio has been added in the original language: ${languageCodeForTitle}`, () => {
                it(`should return audio for the title`, () => {
                    // arrange
                    const eventStream = [digitalTextCreated, audioAddedForDigitalTextTitle];

                    // act
                    const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

                    // assert
                    expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

                    const builtDigitalText = digitalTextBuildResult as DigitalText;

                    const audioIdForTitleSearchResult =
                        builtDigitalText.getAudioForTitleInLanguage(languageCodeForTitle);

                    expect(audioIdForTitleSearchResult).toBe(audioItemIdForTitle);
                });
            });

            describe(`when audio has been added in the translation language: ${languageCodeForTitleTranslation}`, () => {
                it(`should return the expected digital text`, () => {
                    const eventHistory = [
                        digitalTextCreated,
                        digitalTextTitleTranslated,
                        audioAddedForDigitalTextTitleTranslation,
                    ];

                    const result = DigitalText.fromEventHistory(eventHistory, id);

                    expect(result).toBeInstanceOf(DigitalText);

                    const updatedDigitalText = result as DigitalText;

                    const audioIdSearchResult = updatedDigitalText.getAudioForTitleInLanguage(
                        languageCodeForTitleTranslation
                    );

                    expect(audioIdSearchResult).toBe(audioItemIdForTitle);
                });
            });
        });

        describe(`when a page has been added`, () => {
            it(`should have the corresponding page`, () => {
                const eventStream = [digitalTextCreated, pageAddedForDigitalText];

                const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

                expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

                const doesDigitalTextHavePageWithDummyIdentifier = (
                    digitalTextBuildResult as DigitalText
                ).hasPage(dummyPageIdentifier);

                expect(doesDigitalTextHavePageWithDummyIdentifier).toBe(true);
            });
        });

        describe(`when content has been added to a page`, () => {
            const eventStream = [
                digitalTextCreated,
                pageAddedForDigitalText,
                contentAddedToDigitalTextPage,
            ];

            const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

            // We should have an assertWithTypeGuard helper!!!
            expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

            const pageSearchResult = (digitalTextBuildResult as DigitalText).getPage(
                pageAddedForDigitalText.payload.identifier
            );

            expect(pageSearchResult).toBeInstanceOf(DigitalTextPage);

            const pageContent = (
                pageSearchResult as DigitalTextPage
            ).getContent() as MultilingualText;

            const { text, languageCode } = pageContent.getOriginalTextItem();

            expect(text).toBe(originalTextContent);

            expect(languageCode).toBe(originalLanguageCodeForContent);
        });

        describe(`when a page's content has been translated`, () => {
            it(`should return a digital text with the translated page`, async () => {
                const eventStream = [
                    digitalTextCreated,
                    pageAddedForDigitalText,
                    contentAddedToDigitalTextPage,
                    digitalTextPageContentTranslated,
                ];

                const result = DigitalText.fromEventHistory(eventStream, id);

                expect(result).toBeInstanceOf(DigitalText);

                const digitalText = result as DigitalText;

                const page = digitalText.getPage(dummyPageIdentifier) as DigitalTextPage;

                const hasTranslation = page.content.has(translationLanguageCodeForContent);

                expect(hasTranslation).toBe(true);
            });
        });

        describe(`when audio has been added for a digital text page`, () => {
            it(`should return a digital text with the given audio for the given page`, () => {
                const eventStream = [
                    digitalTextCreated,
                    pageAddedForDigitalText,
                    contentAddedToDigitalTextPage,
                    digitalTextPageContentTranslated,
                    audioAddedForDigitalTextPage,
                ];

                const result = DigitalText.fromEventHistory(eventStream, id);

                expect(result).toBeInstanceOf(DigitalText);

                const updatedText = result as DigitalText;

                const pageSearchResult = updatedText.getPage(
                    dummyPageIdentifier
                ) as DigitalTextPage;

                const audioSearchResult = pageSearchResult.audio.getIdForAudioIn(
                    originalLanguageCodeForContent
                );

                expect(audioSearchResult).not.toBeInstanceOf(InternalError);

                expect(audioSearchResult).toBe(audioItemId);
            });
        });

        describe(`when a user has not been granted read access to an unpublished digital text`, () => {
            it(`should not allow access to the user`, () => {
                // Note that there is no RESOURCE_PUBLISHED event here
                const eventStream = [digitalTextCreated, pageAddedForDigitalText];

                const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

                expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

                const digitalText = digitalTextBuildResult as DigitalText;

                expect(
                    digitalText.queryAccessControlList.canUser(idForUserWithAccessToDigitalText)
                ).toBe(false);
            });
        });

        describe(`when a user has been granted read access to an unpublished digital text`, () => {
            it(`should allow access to the user`, () => {
                // Note that there is no RESOURCE_PUBLISHED event here
                const eventStream = [
                    digitalTextCreated,
                    pageAddedForDigitalText,
                    digitalTextReadAccessGrantedToUser,
                ];

                const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, id);

                expect(digitalTextBuildResult).toBeInstanceOf(DigitalText);

                const digitalText = digitalTextBuildResult as DigitalText;

                expect(
                    digitalText.queryAccessControlList.canUser(idForUserWithAccessToDigitalText)
                ).toBe(true);
            });
        });
    });

    // Should this describe be moved up to be a part of the first nested describe above?
    describe(`when the first event is not a creation event for the given aggregate root`, () => {
        class WidgetBobbled extends BaseEvent {
            type = 'WIDGET_BOBBLED';
        }

        const widgetBobbled = new WidgetBobbled(
            {
                aggregateCompositeIdentifier:
                    digitalTextCreated.payload[AGGREGATE_COMPOSITE_IDENTIFIER],
            },
            {
                id: buildDummyUuid(777),
                userId: dummySystemUserId,
                dateCreated: dummyDateManager.next(),
            }
        );

        const eventStream = [widgetBobbled];

        const buildDigitalTextFromEventHistory = () => {
            DigitalText.fromEventHistory(eventStream, id);
        };

        // Another command for DigitalText needs to be implemented first
        it(`should throw`, () => {
            expect(buildDigitalTextFromEventHistory).toThrow();
        });
    });

    describe(`when there are no events for the given Digital Text`, () => {
        const eventStream = [digitalTextCreated];

        const bogusId = buildDummyUuid(457);

        it('should return NotFound', () => {
            const digitalTextBuildResult = DigitalText.fromEventHistory(eventStream, bogusId);

            expect(digitalTextBuildResult).toBe(NotFound);
        });
    });
});
