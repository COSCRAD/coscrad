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
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoConnectionProvider } from '../../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../../../test-data/utilities';
import { EventSourcedAudioItemViewModel } from '../../../../audio-item/queries';
import { EventSourcedVideoViewModel } from '../../../../video/queries';
import { TranscriptCreated } from './transcript-created.event';
import { TranscriptCreatedEventHandler } from './transcript-created.event-handler';

const resourceId = buildDummyUuid(543);

const transcriptCreated = buildTestInstance(TranscriptCreated, {
    payload: {
        aggregateCompositeIdentifier: { type: AggregateType.audioItem, id: resourceId },
    },
});

const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: resourceId,
    transcript: null,
});

describe(`TranscriptCreatedEventHandler.handle`, () => {
    let testQueryRepositoryProvider: IQueryRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let transcriptCreatedEventHandler: TranscriptCreatedEventHandler;

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

        testQueryRepositoryProvider = app.get(QUERY_REPOSITORY_PROVIDER_TOKEN);

        transcriptCreatedEventHandler = new TranscriptCreatedEventHandler(
            // @ts-expect-error We know that `forResource` will only be called for an `audioItem` or `video` here
            testQueryRepositoryProvider
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    describe('when transcribing an audio item', () => {
        beforeEach(async () => {
            await testQueryRepositoryProvider
                .forResource(ResourceType.audioItem)
                .create(targetAudioItem);
        });

        it(`should create an empty transcript`, async () => {
            await transcriptCreatedEventHandler.handle(transcriptCreated);

            const { transcript } = (await testQueryRepositoryProvider
                .forResource(ResourceType.audioItem)
                .fetchById(resourceId)) as EventSourcedAudioItemViewModel;

            expect(transcript).toBeTruthy();
        });
    });

    describe('when transcribing a video', () => {
        beforeEach(async () => {
            await testQueryRepositoryProvider.forResource(ResourceType.video).create(
                buildTestInstance(EventSourcedVideoViewModel, {
                    id: resourceId,
                    transcript: null,
                })
            );
        });

        it(`should create an empty transcript`, async () => {
            await transcriptCreatedEventHandler.handle(
                clonePlainObjectWithOverrides(transcriptCreated, {
                    payload: {
                        aggregateCompositeIdentifier: {
                            type: ResourceType.video,
                            id: resourceId,
                        },
                    },
                })
            );

            const { transcript } = (await testQueryRepositoryProvider
                .forResource(ResourceType.video)
                .fetchById(resourceId)) as EventSourcedAudioItemViewModel;

            expect(transcript).toBeTruthy();
        });
    });
});
