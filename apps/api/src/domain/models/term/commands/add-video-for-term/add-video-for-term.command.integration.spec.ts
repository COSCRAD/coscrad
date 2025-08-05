import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { TermModule } from '../../../../../app/domain-modules/term.module';
import { CoscradEventFactory } from '../../../../../domain/common';
import { ID_MANAGER_TOKEN } from '../../../../../domain/interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../../../validation';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { AudioVisualModule } from '../../../audio-visual/application/audio-visual.module';
import { VideoCreated } from '../../../audio-visual/video';
import { Video } from '../../../audio-visual/video/entities/video.entity';
import { Term } from '../../entities/term.entity';
import { TermCreated } from '../create-term';
import { AddVideoForTerm } from './add-video-for-term.command';

const commandType = 'ADD_VIDEO_FOR_TERM';

const termId = buildDummyUuid(45);

const existingTermWithoutVideo = Term.fromEventHistory(
    new TestEventStream()
        .andThen<TermCreated>({
            type: 'TERM_CREATED',
            payload: {
                text: 'original term text',
                languageCode: LanguageCode.Chilcotin,
            },
        })
        .as({
            type: AggregateType.term,
            id: termId,
        }),
    termId
) as Term;

const videoId = buildDummyUuid(54);

const existingVideo = Video.fromEventHistory(
    [
        new TestEventStream().buildSingle<VideoCreated>({
            type: 'VIDEO_CREATED',
            payload: {
                aggregateCompositeIdentifier: { id: videoId },
            },
        }),
    ],
    videoId
) as Video;

const validCommandFsa = {
    type: commandType,
    payload: buildTestInstance(AddVideoForTerm, {
        aggregateCompositeIdentifier: existingTermWithoutVideo.getCompositeIdentifier(),
        videoId,
    }),
};

describe(commandType, () => {
    let testAssertionDependencies: CommandAssertionDependencies;

    let termRepository: IRepositoryForAggregate<Term>;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                    // validate,
                }),
                PersistenceModule.forRootAsync(),
                DynamicDataTypeModule,
                AudioVisualModule,
                TermModule,
            ],
            providers: [
                {
                    provide: TestRepositoryProvider,
                    useFactory: (
                        databaseProvider: ArangoDatabaseProvider,
                        dynamicDataTypeFinderService: DynamicDataTypeFinderService
                    ) =>
                        new TestRepositoryProvider(
                            databaseProvider,
                            new CoscradEventFactory(dynamicDataTypeFinderService),
                            dynamicDataTypeFinderService
                        ),
                    inject: [ArangoDatabaseProvider, DynamicDataTypeFinderService],
                },
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        testAssertionDependencies = {
            testRepositoryProvider: app.get(TestRepositoryProvider),
            commandHandlerService: app.get(CommandHandlerService),
            idManager: app.get(ID_MANAGER_TOKEN),
        };

        termRepository = testAssertionDependencies.testRepositoryProvider.forResource(
            ResourceType.term
        );

        databaseProvider = app.get(ArangoDatabaseProvider);
    });

    beforeEach(async () => {
        await testAssertionDependencies.testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates`, async () => {
            await assertCommandSuccess(testAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await termRepository.create(existingTermWithoutVideo);

                    await testAssertionDependencies.testRepositoryProvider
                        .forResource(existingVideo.type)
                        .create(existingVideo);
                },
                buildValidCommandFSA: () => validCommandFsa,
                checkStateOnSuccess: async () => {
                    const updatedTerm = (await termRepository.fetchById(termId)) as Term;

                    expect(updatedTerm.videoId).toBe(existingVideo.id);
                },
            });
        });
    });
});
