import {
    AggregateType,
    IDetailQueryResult,
    IVideoViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { isNotFound, NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../../shared/access-control/access-control-list.entity';
import { TranscriptLineItemDto, TranslationItem } from '../../shared/commands';
import { TranscriptItem } from '../../shared/entities/transcript-item.entity';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { Transcript } from '../../shared/entities/transcript.entity';
import { VideoCreated } from '../commands';
import { EventSourcedVideoViewModel, IVideoQueryRepository } from '../queries';
import { ArangoVideoQueryRepository } from './arango-video-query-repository';

const targetVideo = buildTestInstance(EventSourcedVideoViewModel, {});

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const participant = new TranscriptParticipant({
    initials: 'WW',
    name: 'William Who',
});

const speakerInitials = participant.initials;

const lineItems = [1, 2, 3, 4, 5].map((i) =>
    buildTestInstance(TranscriptLineItemDto, {
        inPointMilliseconds: 100 * i,
        outPointMilliseconds: 100 * i + 50,
        speakerInitials,
        text: `text for line item #${i}`,
        languageCode: originalLanguageCode,
    })
);

describe(`ArangoVideoQueryRepository`, () => {
    let testQueryRepository: IVideoQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoVideoQueryRepository(connectionProvider);
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('video__VIEWS').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    const additionalVideos = [10, 11, 12].map((sequenceNumber) => {
        const creationEvent = new TestEventStream().buildSingle<VideoCreated>({
            type: 'VIDEO_CREATED',
            payload: {
                aggregateCompositeIdentifier: {
                    type: AggregateType.mediaItem,
                    id: buildDummyUuid(sequenceNumber),
                },
                name: `video name: ${sequenceNumber}`,
                languageCodeForName: originalLanguageCode,
            },
        });

        return EventSourcedVideoViewModel.fromVideoCreated(creationEvent);
    });

    describe(`fetchById`, () => {
        describe(`when the video exists`, () => {
            beforeEach(async () => {
                await testQueryRepository.create(targetVideo);
            });

            it(`should return the video`, async () => {
                const searchResult = await testQueryRepository.fetchById(targetVideo.id);

                expect(searchResult).not.toBe(NotFound);

                const {
                    name: foundName,
                    mediaItemId: foundMediaItemId,
                    isPublished: foundPublicationStatus,
                    mimeType: foundMimeType,
                    lengthMilliseconds: foundLength,
                } = searchResult as EventSourcedVideoViewModel;

                expect(foundName.toString()).toEqual(targetVideo.name.toString());

                expect(foundMediaItemId).toEqual(targetVideo.mediaItemId);

                expect(foundPublicationStatus).toEqual(targetVideo.isPublished);

                expect(foundMimeType).toEqual(targetVideo.mimeType);

                expect(foundLength).toEqual(targetVideo.lengthMilliseconds);
            });
        });

        describe(`when the video does not exist`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('bogusID');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`publish`, () => {
        const targetAudioItem = additionalVideos[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should publish the video`, async () => {
            await testQueryRepository.publish(targetAudioItem.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedVideoViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`allowuser`, () => {
        const targetAudioItem = buildTestInstance(EventSourcedVideoViewModel, {
            accessControlList: new AccessControlList(),
        });

        const testUserId = buildDummyUuid(209);

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the user the the query ACL`, async () => {
            await testQueryRepository.allowUser(targetAudioItem.id, testUserId);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedVideoViewModel;

            expect(updatedView.accessControlList.canUser(testUserId)).toBe(true);
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalVideos);
        });
        it('should return the expected video views', async () => {
            await testQueryRepository.fetchMany();

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(additionalVideos.length);
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalVideos);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(additionalVideos.length);
        });
    });

    describe(`delete`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(additionalVideos);
        });

        it(`should delete the expected video`, async () => {
            const targetAudioItemId = additionalVideos[0].id;

            await testQueryRepository.delete(targetAudioItemId);

            const newCount = await testQueryRepository.count();

            expect(newCount).toBe(2);

            const searchResult = await testQueryRepository.fetchById(targetAudioItemId);

            expect(searchResult).toBe(NotFound);
        });
    });

    describe(`translateName`, () => {
        const targetAudioItem = additionalVideos[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should update the video's name`, async () => {
            const translationOfName = 'translation of video name';

            const role = MultilingualTextItemRole.freeTranslation;

            await testQueryRepository.translateName(targetAudioItem.id, {
                text: translationOfName,
                languageCode: translationLanguageCode,
                role,
            });

            const searchResult = await testQueryRepository.fetchById(targetAudioItem.id);

            expect(searchResult).not.toBe(NotFound);

            const updatedView = searchResult as unknown as IDetailQueryResult<IVideoViewModel>;

            const name = new MultilingualText(updatedView.name);

            const { role: foundTextRole, text: foundText } = name.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(foundTextRole).toBe(role);

            expect(foundText).toBe(translationOfName);
        });
    });

    /**
     * TRANSCRIPTION
     * Note that we copy-and-pasted with tweaks the following test cases
     * from the ArangoAudioItemQueryRepository test. Ideally, we would
     * have shared test data setup and assertion helpers, but we don't anticipate
     * a third resource type being transcribable, so it's not worth the effort.
     */

    describe(`create transcript`, () => {
        const targetVideo = additionalVideos[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetVideo);
        });

        it(`should append an empty transcript to the existing audio item`, async () => {
            await testQueryRepository.createTranscript(targetVideo.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetVideo.id
            )) as EventSourcedVideoViewModel;

            expect(updatedView.transcript).toBeTruthy();
        });
    });

    describe(`add participant`, () => {
        const targetAudioItem = buildTestInstance(EventSourcedVideoViewModel, {
            transcript: Transcript.buildEmpty(),
        });

        const participant = buildTestInstance(TranscriptParticipant, {});

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the participant`, async () => {
            await testQueryRepository.addParticipant(targetAudioItem.id, participant);

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedVideoViewModel;

            const { name } = updatedView.transcript.findParticipantByInitials(
                participant.initials
            ) as TranscriptParticipant;

            expect(name).toBe(participant.name);
        });
    });

    describe(`add line item`, () => {
        const participant = new TranscriptParticipant({
            initials: 'JB',
            name: 'Johnny Blaze',
        });

        const targetAudioItem = buildTestInstance(EventSourcedVideoViewModel, {
            transcript: new Transcript({
                participants: [participant],
                items: [],
            }),
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should add the line item to an existing transcript`, async () => {
            const inPointMs = 100;

            const outPointMs = inPointMs + 300;

            const text = 'this is what was said';

            const languageCode = LanguageCode.English;

            await testQueryRepository.addLineItem(targetAudioItem.id, {
                inPointMilliseconds: inPointMs,
                outPointMilliseconds: outPointMs,
                text,
                languageCode,
                speakerInitials: participant.initials,
            });

            const updatedView = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedVideoViewModel;

            const numberOfItems = updatedView.transcript.countLineItems();

            expect(numberOfItems).toBe(1);
        });
    });

    describe(`import line items`, () => {
        beforeEach(async () => {
            await testQueryRepository.create(targetVideo);
        });

        it('should import the line items', async () => {
            await testQueryRepository.importLineItems(targetVideo.id, lineItems);

            const updatedView = (await testQueryRepository.fetchById(
                targetVideo.id
            )) as EventSourcedVideoViewModel;

            const numberOfItems = updatedView.transcript.countLineItems();

            expect(numberOfItems).toBe(lineItems.length);

            const missingLineItems = lineItems.filter(
                ({ inPointMilliseconds, outPointMilliseconds }) =>
                    !updatedView.transcript.hasLineItem(inPointMilliseconds, outPointMilliseconds)
            );

            expect(missingLineItems).toEqual([]);
        });
    });

    describe(`translate line item`, () => {
        const originalLanguageCode = LanguageCode.Chilcotin;

        const translationLanguageCode = LanguageCode.English;

        const translationText = 'this is how to translate what was said to English';

        const inPointMilliseconds = 100;

        const outPointMilliseconds = 200;

        const participant = buildTestInstance(TranscriptParticipant);

        const targetLineItem = buildTestInstance(TranscriptItem, {
            inPointMilliseconds,
            outPointMilliseconds,
            speakerInitials: participant.initials,
            text: buildMultilingualTextWithSingleItem('original text', originalLanguageCode),
        });

        const existingTranscript = buildTestInstance(Transcript, {
            participants: [participant],
            items: [targetLineItem],
        });

        const targetAudioItem = buildTestInstance(EventSourcedVideoViewModel, {
            transcript: existingTranscript,
            lengthMilliseconds: outPointMilliseconds * 10,
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it('should translate the line item', async () => {
            await testQueryRepository.translateLineItem(targetAudioItem.id, {
                inPointMilliseconds,
                outPointMilliseconds,
                text: translationText,
                languageCode: translationLanguageCode,
            });

            const { transcript } = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedVideoViewModel;

            const lineItemSearchResult = transcript.getLineItem(
                inPointMilliseconds,
                outPointMilliseconds
            );

            expect(lineItemSearchResult).not.toBe(NotFound);

            const { text } = lineItemSearchResult as TranscriptItem;

            expect(text.hasTranslation()).toEqual(true);

            const { text: foundTranslationText, role } = text.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(foundTranslationText).toEqual(translationText);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`import line item translations`, () => {
        const translations = lineItems.map(
            ({ inPointMilliseconds }, index): TranslationItem => ({
                inPointMilliseconds,
                translation: `translation for lineitem #${index}`,
                languageCode: translationLanguageCode,
            })
        );

        const translationItems = lineItems.map(
            ({ inPointMilliseconds, outPointMilliseconds, text, languageCode }) =>
                TranscriptItem.fromDto({
                    inPointMilliseconds,
                    outPointMilliseconds,
                    text: buildMultilingualTextWithSingleItem(text, languageCode),
                    speakerInitials: participant.initials,
                })
        );

        const targetAudioItem = buildTestInstance(EventSourcedVideoViewModel, {
            transcript: buildTestInstance(Transcript, {
                items: translationItems,
            }),
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetAudioItem);
        });

        it(`should import the translations`, async () => {
            await testQueryRepository.importTranslationsForTranscript(
                targetAudioItem.id,
                translations
            );

            const { transcript: updatedTranscript } = (await testQueryRepository.fetchById(
                targetAudioItem.id
            )) as EventSourcedVideoViewModel;

            const invalidOrMissingTranslations = translations.filter(
                ({ inPointMilliseconds, translation: text, languageCode }) => {
                    const translationLineItem = updatedTranscript.items.find(
                        (updatedItem) => updatedItem.inPointMilliseconds === inPointMilliseconds
                    );

                    if (isNotFound(translationLineItem)) {
                        return true;
                    }

                    const foundTranslationItem =
                        translationLineItem.text.getTranslation(languageCode);

                    if (isNotFound(foundTranslationItem)) {
                        return true;
                    }

                    if (foundTranslationItem.text !== text) {
                        return true;
                    }

                    if (foundTranslationItem.role !== MultilingualTextItemRole.freeTranslation) {
                        return true;
                    }

                    return false;
                }
            );

            expect(invalidOrMissingTranslations).toEqual([]);
        });
    });
});
