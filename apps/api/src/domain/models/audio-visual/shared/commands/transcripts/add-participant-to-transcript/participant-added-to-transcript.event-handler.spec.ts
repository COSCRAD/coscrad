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
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { Transcript } from '../../../entities/transcript.entity';
import { ParticipantAddedToTranscript } from './participant-added-to-transcript.event';
import { ParticipantAddedToTranscriptEventHandler } from './participant-added-to-transcript.event-handler';

const audioItemId = buildDummyUuid(50);

const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: audioItemId,
    transcript: Transcript.buildEmpty(),
});

const participantAdded = buildTestInstance(ParticipantAddedToTranscript, {
    payload: {
        aggregateCompositeIdentifier: { id: targetAudioItem.id, type: AggregateType.audioItem },
    },
});

describe('ParticipantAddedToTranscriptEventHandler', () => {
    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let testRepositoryProvider: IQueryRepositoryProvider;

    let participantAddedToTranscriptEventHandler: ParticipantAddedToTranscriptEventHandler;

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

        participantAddedToTranscriptEventHandler = new ParticipantAddedToTranscriptEventHandler(
            // @ts-expect-error We know that the provider will only ever be called with `provider.forResource(audioVisualResourceType)` not a general `ResourceType`
            testRepositoryProvider
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        // await testQueryRepository.create(targetAudioItem);
    });

    describe('when handling a PARTICIPANT_ADDED_TO_TRANSCRIPT', () => {
        describe('when the target is an audio item', () => {
            beforeEach(async () => {
                await testRepositoryProvider
                    .forResource(ResourceType.audioItem)
                    .create(targetAudioItem);
            });

            it('should add a participant to the existing transcript', async () => {
                await participantAddedToTranscriptEventHandler.handle(participantAdded);

                const updatedView = (await testRepositoryProvider
                    .forResource(ResourceType.audioItem)
                    .fetchById(targetAudioItem.id)) as EventSourcedAudioItemViewModel;

                const { name } = updatedView.transcript.findParticipantByInitials(
                    participantAdded.payload.initials
                ) as TranscriptParticipant;

                expect(name).toBe(participantAdded.payload.name);

                expect(updatedView.transcript.participants).toHaveLength(1);
            });
        });

        describe('when the target is a video', () => {
            it.todo('should have a test');
        });
    });
});
