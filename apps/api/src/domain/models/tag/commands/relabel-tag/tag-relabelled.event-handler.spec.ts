import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { CommandInfoService } from '../../../../../app/controllers/command/services/command-info-service';
import { TagModule } from '../../../../../app/domain-modules/tag.module';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { EventSourcedTagViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoTagQueryRepository } from '../../repositories/arango-tag-query-repository';
import { ITagQueryRepository } from '../../repositories/tag-query-repository.interface';
import { TagRelabelled } from './tag-relabelled.event';
import { TagRelabelledEventHandler } from './tag-relabelled.event-handler';

const tagId = buildDummyUuid(34);

const oldLabel = 'old label';

const existingTag = buildTestInstance(EventSourcedTagViewModel, {
    id: tagId,
    label: oldLabel,
    name: buildMultilingualTextWithSingleItem(oldLabel),
});

const newTaggedLabel = 'new label';

const tagrelabelledEvent = buildTestInstance(TagRelabelled, {
    payload: {
        aggregateCompositeIdentifier: { id: tagId },
        newLabel: newTaggedLabel,
    },
});

describe(`TagRelabelledEventHandler`, () => {
    let testQueryRepository: ITagQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let handler: TagRelabelledEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CommandInfoService, TagRelabelledEventHandler],
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                CommandModule,
                TagModule,
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

        await app.init();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoTagQueryRepository(connectionProvider);

        handler = app.get(TagRelabelledEventHandler);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingTag);
    });

    describe(`when handling a tag relabelled`, () => {
        it(`should relabel the tag`, async () => {
            await handler.handle(tagrelabelledEvent);

            const searchResult = await testQueryRepository.fetchById(existingTag.id);

            expect(searchResult).not.toBe(NotFound);

            const { label } = searchResult as EventSourcedTagViewModel;

            expect(label).toBe(newTaggedLabel);
        });

        /**
         * Currently, cascading updates to the resource view is the job of the `TagRelabelled` event consumer.
         * We are working to establish an extensible and reliable approach
         * to cascading updates, so this may change.
         *
         * We have test coverage for this behaviour in the concrete `ArangoTagQueryRepository`
         * implementation. We will also cover this with scenario \ e2e tests.
         *
         * If we add this test coverage here, we should use a toy `Widget` resource
         * model to ensure this test remains decoupled from the concrete
         * resource view models for easy maintenance.
         */
        it.todo(`should cascade updates to the corresponding resource documents`);
    });
});
