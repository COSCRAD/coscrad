import { CategorizableType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { CommandInfoService } from '../../../../../app/controllers/command/services/command-info-service';
import { TagModule } from '../../../../../app/domain-modules/tag.module';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { EventSourcedTagViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoTagQueryRepository } from '../../repositories/arango-tag-query-repository';
import { ITagQueryRepository } from '../../repositories/tag-query-repository.interface';
import { ResourceAddedToTagEventHandler } from './resource-added-to-tag.event-handler';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';

const tagId = buildDummyUuid(12);

const label = 'the label for this tag';

const existingTag = buildTestInstance(EventSourcedTagViewModel, {
    id: tagId,
    label,
});

const resourceAddedToTagEvent = buildTestInstance(ResourceOrNoteTagged, {
    payload: {
        taggedMemberCompositeIdentifier: { id: tagId, type: CategorizableType.term },
    },
});

describe(`ResourceAddedToTagEventHandler`, () => {
    let testQueryRepository: ITagQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let handler: ResourceAddedToTagEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CommandInfoService, ResourceAddedToTagEventHandler],
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

        handler = app.get(ResourceAddedToTagEventHandler);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingTag);
    });

    describe(`when handing a resource or note tagged`, () => {
        it(`should tag the resource or note`, async () => {});
    });
});
