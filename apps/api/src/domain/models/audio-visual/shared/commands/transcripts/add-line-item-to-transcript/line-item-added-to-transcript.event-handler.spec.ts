import { AggregateType } from '@coscrad/api-interfaces';
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
import { Transcript } from '../../../entities/transcript.entity';
import { LineItemAddedToTranscript } from './line-item-added-to-transcript.event';
import { LineItemAddedToTranscriptEventHandler } from './line-item-added-to-transcript.event-handler';

const audioItemId = buildDummyUuid(49);

const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: audioItemId,
    transcript: Transcript.buildEmpty(),
});

const lineItemAdded = buildTestInstance(LineItemAddedToTranscript, {
    payload: {
        aggregateCompositeIdentifier: { id: targetAudioItem.id, type: AggregateType.audioItem },
    },
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
            // @ts-expect-error TODO find a better way to sidestep this type issue
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
        it(`should have a test`, async () => {
            await lineItemAddedToTranscriptEventHandler.handle(lineItemAdded);
        });
    });
});
