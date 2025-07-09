import { LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { buildSingleLanguageText } from '../../../../../test-data/buildAudioItemTestData';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    IPhotographQueryRepository,
    PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
} from '../../../photograph/queries';
import { PhotographViewModel } from '../../../photograph/queries/photograph.view-model';
import { ArangoDigitalTextQueryRepository } from '../../queries/arango-digital-text-query-repository';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { CoverPhotographAddedForDigitalText } from './cover-photograph-added-for-digital-text.event';
import { CoverPhotographAddedForDigitalTextEventHandler } from './cover-photograph-added-for-digital-text.event-handler';

const digitalTextId = buildDummyUuid(12);

const languageCodeForTest = LanguageCode.English;

const digitalTextTitle = buildSingleLanguageText('The new book', languageCodeForTest);

const photographId = buildDummyUuid(2);

const photographTitle = buildSingleLanguageText('A photo of a dolphin', languageCodeForTest);

const existingPhotographView = buildTestInstance(PhotographViewModel, {
    id: photographId,
    name: photographTitle,
    photographer: 'Jean Simmons',
});

const existingView = buildTestInstance(DigitalTextViewModel, {
    id: digitalTextId,
    name: digitalTextTitle,
});

const coverPhotographAddedForDigitalText =
    new TestEventStream().buildSingle<CoverPhotographAddedForDigitalText>({
        type: 'COVER_PHOTOGRAPH_ADDED_FOR_DIGITAL_TEXT',
        payload: {
            aggregateCompositeIdentifier: { id: digitalTextId },
            photographId: photographId,
        },
    });

describe(`PhotographAddedToDigitalTextPageEventHandler`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let photographQueryRepository: IPhotographQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let coverPhotographAddedForDigitalTextEventHandler: CoverPhotographAddedForDigitalTextEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
            ],
            providers: [
                {
                    provide: DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
                    useFactory: (connectionProvider: ArangoConnectionProvider) => {
                        return new ArangoDigitalTextQueryRepository(connectionProvider);
                    },
                    inject: [ArangoConnectionProvider],
                },
                CoverPhotographAddedForDigitalTextEventHandler,
            ],
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

        databaseProvider = app.get(ArangoDatabaseProvider);

        testQueryRepository = new ArangoDigitalTextQueryRepository(connectionProvider);

        photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);

        coverPhotographAddedForDigitalTextEventHandler =
            new CoverPhotographAddedForDigitalTextEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingView);
    });

    describe(`when there is an existing digital text`, () => {
        describe(`when there is no valid photograph in 'photograph__VIEWS'`, () => {
            it(`should not throw`, async () => {
                const tryIt = await coverPhotographAddedForDigitalTextEventHandler.handle(
                    coverPhotographAddedForDigitalText
                );

                expect(tryIt).resolves;
            });

            it(`should not add the given photograph for the digital text`, async () => {
                await coverPhotographAddedForDigitalTextEventHandler.handle(
                    coverPhotographAddedForDigitalText
                );

                const updatedView = (await testQueryRepository.fetchById(
                    existingView.id
                )) as DigitalTextViewModel;

                expect(updatedView.coverPhotograph).not.toBeDefined();
            });
        });

        describe(`when there is a valid photograph in 'photograph__VIEWS'`, () => {
            beforeEach(async () => {
                await photographQueryRepository.create(existingPhotographView);
            });

            it(`should add the given photograph for the digital text`, async () => {
                await coverPhotographAddedForDigitalTextEventHandler.handle(
                    coverPhotographAddedForDigitalText
                );

                const updatedView = (await testQueryRepository.fetchById(
                    existingView.id
                )) as DigitalTextViewModel;

                expect(updatedView.coverPhotograph.id).toEqual(photographId);
            });
        });
    });
});
