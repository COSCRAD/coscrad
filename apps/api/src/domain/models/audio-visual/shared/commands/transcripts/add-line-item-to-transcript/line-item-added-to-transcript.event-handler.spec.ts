import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../../app/config/constants/environment';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { ArangoConnectionProvider } from '../../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../../../test-data/utilities';
import { EventSourcedAudioItemViewModel } from '../../../../audio-item/queries';
import { IAudioItemQueryRepository } from '../../../../audio-item/queries/audio-item-query-repository.interface';
import { EventSourcedVideoViewModel } from '../../../../video/queries';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { Transcript } from '../../../entities/transcript.entity';
import { LineItemAddedToTranscript } from './line-item-added-to-transcript.event';
import { LineItemAddedToTranscriptEventHandler } from './line-item-added-to-transcript.event-handler';

const resourceId = buildDummyUuid(49);

const participant = new TranscriptParticipant({
    initials: 'BS',
    name: 'Bob Smith',
});

describe(`LineItemAddedToTranscriptEventHandler`, () => {
    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let testRepositoryProvider: IQueryRepositoryProvider;

    let lineItemAddedToTranscriptEventHandler: LineItemAddedToTranscriptEventHandler;

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

        testRepositoryProvider = app.get(QUERY_REPOSITORY_PROVIDER_TOKEN);

        lineItemAddedToTranscriptEventHandler = new LineItemAddedToTranscriptEventHandler(
            // @ts-expect-error We know that the provider will only ever be called with `provider.forResource(audioVisualResourceType)` not a general `ResourceType`
            testRepositoryProvider
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    describe(`when handling a LINE_ITEM_ADDED_TO_TRANSCRIPT`, () => {
        describe(`for an audio item`, () => {
            const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
                id: resourceId,
                transcript: Transcript.buildEmpty().addParticipant(participant) as Transcript,
            });

            const lineItemAdded = buildTestInstance(LineItemAddedToTranscript, {
                payload: {
                    aggregateCompositeIdentifier: {
                        id: targetAudioItem.id,
                        type: AggregateType.audioItem,
                    },
                    speakerInitials: participant.initials,
                },
            });

            beforeEach(async () => {
                await testRepositoryProvider
                    .forResource(ResourceType.audioItem)
                    .create(targetAudioItem);
            });

            it(`should add the expected line item`, async () => {
                await lineItemAddedToTranscriptEventHandler.handle(lineItemAdded);

                const { transcript } = (await testRepositoryProvider
                    .forResource<IAudioItemQueryRepository>(ResourceType.audioItem)
                    .fetchById(targetAudioItem.id)) as EventSourcedAudioItemViewModel;

                expect(transcript.countLineItems()).toBe(1);

                const {
                    payload: {
                        inPointMilliseconds,
                        outPointMilliseconds,
                        speakerInitials,
                        languageCode,
                        text: textFromPayload,
                    },
                } = lineItemAdded;

                const {
                    text: multilingualTextFoundForLineItem,
                    speakerInitials: foundSpeakerInitials,
                } = transcript.getLineItem(
                    inPointMilliseconds,
                    outPointMilliseconds
                ) as TranscriptItem;

                expect(foundSpeakerInitials).toBe(speakerInitials);

                const { languageCode: foundOriginalLanguageCode, text: foundText } =
                    multilingualTextFoundForLineItem.getOriginalTextItem();

                expect(foundOriginalLanguageCode).toBe(languageCode);

                expect(foundText).toBe(textFromPayload);
            });
        });

        describe(`for a video`, () => {
            const targetVideo = buildTestInstance(EventSourcedVideoViewModel, {
                id: resourceId,
                transcript: Transcript.buildEmpty().addParticipant(participant) as Transcript,
            });

            const lineItemAdded = buildTestInstance(LineItemAddedToTranscript, {
                payload: {
                    aggregateCompositeIdentifier: {
                        id: targetVideo.id,
                        type: AggregateType.video,
                    },
                    speakerInitials: participant.initials,
                },
            });

            beforeEach(async () => {
                await testRepositoryProvider.forResource(ResourceType.video).create(targetVideo);
            });

            it(`should add the expected line item`, async () => {
                await lineItemAddedToTranscriptEventHandler.handle(lineItemAdded);

                const { transcript } = (await testRepositoryProvider
                    .forResource<IAudioItemQueryRepository>(ResourceType.video)
                    .fetchById(targetVideo.id)) as EventSourcedVideoViewModel;

                expect(transcript.countLineItems()).toBe(1);

                const {
                    payload: {
                        inPointMilliseconds,
                        outPointMilliseconds,
                        speakerInitials,
                        languageCode,
                        text: textFromPayload,
                    },
                } = lineItemAdded;

                const {
                    text: multilingualTextFoundForLineItem,
                    speakerInitials: foundSpeakerInitials,
                } = transcript.getLineItem(
                    inPointMilliseconds,
                    outPointMilliseconds
                ) as TranscriptItem;

                expect(foundSpeakerInitials).toBe(speakerInitials);

                const { languageCode: foundOriginalLanguageCode, text: foundText } =
                    multilingualTextFoundForLineItem.getOriginalTextItem();

                expect(foundOriginalLanguageCode).toBe(languageCode);

                expect(foundText).toBe(textFromPayload);
            });
        });
    });
});
