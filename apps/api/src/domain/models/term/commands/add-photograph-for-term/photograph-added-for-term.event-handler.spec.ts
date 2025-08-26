import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { TermModule } from '../../../../../app/domain-modules/term.module';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    IPhotographQueryRepository,
    PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
} from '../../../photograph/queries';
import { PhotographViewModel } from '../../../photograph/queries/photograph.view-model';
import { ArangoPhotographQueryRepository } from '../../../photograph/repositories';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories';
import { PhotographAddedForTerm } from './photograph-added-for-term.event';
import { PhotographAddedForTermEventHandler } from './photograph-added-for-term.event-handler';

const termId = buildDummyUuid(56);

const photographId = buildDummyUuid(65);

const existingTermView = buildTestInstance(TermViewModel, {
    id: termId,
    mediaItemIdForPhotograph: photographId,
});

const photographAddedForTerm = buildTestInstance(PhotographAddedForTerm, {
    payload: {
        aggregateCompositeIdentifier: { id: termId },
        photographId,
    },
});

describe(`PhotographAddedForTermEventHandler`, () => {
    describe(`when handling a PHOTOGRAPH_ADDED_FOR_TERM event`, () => {
        let testQueryRepository: ITermQueryRepository;

        let photographRepository: IPhotographQueryRepository;

        let databaseProvider: ArangoDatabaseProvider;

        let app: INestApplication;

        let photographAddedForTermEventHandler: PhotographAddedForTermEventHandler;

        beforeAll(async () => {
            const moduleRef = await Test.createTestingModule({
                imports: [PersistenceModule.forRootAsync(), TermModule],
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

            photographRepository = new ArangoPhotographQueryRepository(connectionProvider);

            photographRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);

            testQueryRepository = new ArangoTermQueryRepository(
                connectionProvider,
                new ConsoleCoscradCliLogger()
            );

            photographAddedForTermEventHandler = app.get(PhotographAddedForTermEventHandler);
        });

        afterAll(async () => {
            databaseProvider.close();
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(existingTermView);

            await photographRepository.create(
                buildTestInstance(PhotographViewModel, {
                    id: photographId,
                })
            );
        });

        describe(`when there is an existing term`, () => {
            it(`should update the datebase appropriately`, async () => {
                await photographAddedForTermEventHandler.handle(
                    photographAddedForTerm as PhotographAddedForTerm
                );

                const result = await testQueryRepository.fetchById(termId);

                expect(result).not.toBe(NotFound);

                const updatedTerm = result as TermViewModel;

                expect(updatedTerm.mediaItemIdForPhotograph).toBe(photographId);
            });
        });
    });
});
