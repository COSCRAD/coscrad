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
import { TranscriptLineItemDto } from './import-line-items-to-transcript.command';
import { LineItemsImportedToTranscript } from './line-items-imported-to-transcript.event';
import { LineItemsImportedToTranscriptEventHandler } from './line-items-imported-to-transcript.event-handler';

const audioItemId = buildDummyUuid(1);

const participant = buildTestInstance(TranscriptParticipant, {});

const transcript = Transcript.buildEmpty().addParticipant(participant) as Transcript;

const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: audioItemId,
    transcript,
});

const lineItemsImported = buildTestInstance(LineItemsImportedToTranscript, {
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: audioItemId,
        },
        lineItems: (
            [
                [100, 200],
                [500, 900],
                [1100, 3200],
            ] as [number, number][]
        ).map(([i, o]) =>
            buildTestInstance(TranscriptLineItemDto, {
                inPointMilliseconds: i,
                outPointMilliseconds: o,
                speakerInitials: participant.initials,
            })
        ),
    },
});

describe('LineItemsImportedToTranscriptEventHandler', () => {
    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let testRepositoryProvider: IQueryRepositoryProvider;

    let lineItemsImportedToTranscriptEventHandler: LineItemsImportedToTranscriptEventHandler;

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

        lineItemsImportedToTranscriptEventHandler = new LineItemsImportedToTranscriptEventHandler(
            // @ts-expect-error TODO  a better way to sidestep this type issue
            testRepositoryProvider
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    describe(`when handling a LINE_ITEMS_IMPORTED_TO_TRANSCRIPT`, () => {
        describe(`for an audio item`, () => {
            describe(`when the target audio item view exists`, () => {
                beforeEach(async () => {
                    await testRepositoryProvider
                        .forResource(ResourceType.audioItem)
                        .create(targetAudioItem);
                });

                it(`should import the line items`, async () => {
                    await lineItemsImportedToTranscriptEventHandler.handle(lineItemsImported);

                    const updatedView = (await testRepositoryProvider
                        .forResource(ResourceType.audioItem)
                        .fetchById(targetAudioItem.id)) as EventSourcedAudioItemViewModel;

                    const { transcript } = updatedView;

                    expect(transcript.countLineItems()).toBe(
                        lineItemsImported.payload.lineItems.length
                    );
                });
            });
        });

        describe(`for a video`, () => {
            it.todo('should have a test');
        });
    });
});
