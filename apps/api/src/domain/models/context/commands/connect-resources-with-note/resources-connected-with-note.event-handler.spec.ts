import { ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { NoteRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { DTO } from '../../../../../types/DTO';
import {
    INoteConnectedDto,
    IQueryRepositoryForConnection,
    ResourcesConnectedWithNoteEventHandler,
} from './resources-connected-with-note.event-handler';

const WIDGET_COLLECTION = 'widgets';

class WidgetViewModel {
    id: string;
    note: NoteRecordForResourceViewModel[];

    constructor({ id, note }: DTO<WidgetViewModel>) {
        this.id = id;

        this.note = note.map((n) => {
            return NoteRecordForResourceViewModel.fromDto(n);
        });
    }
}

interface IWidgetQueryRepository extends IQueryRepositoryForConnection {
    fetchById(id: string): Promise<Maybe<WidgetViewModel>>;
    create(w: WidgetViewModel): Promise<void>;
}

class WidgetQueryRepository implements IWidgetQueryRepository {
    private readonly arangoDb: ArangoDatabaseForCollection<WidgetViewModel>;

    constructor(connectionProvider: ArangoConnectionProvider) {
        this.arangoDb = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            WIDGET_COLLECTION
        );
    }

    async fetchById(id: string): Promise<Maybe<WidgetViewModel>> {
        throw new Error('Method not implemented.');
    }

    async create(w: WidgetViewModel): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async connectResourcesWith(id: string, dto: INoteConnectedDto): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

describe(`ResourcesConnectedWithNoteEventHandler`, () => {
    let testQueryRepository: IWidgetQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let resourcesConnectedWithNoteEventHandler: ResourcesConnectedWithNoteEventHandler;

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

        testQueryRepository = new WidgetQueryRepository(connectionProvider);

        resourcesConnectedWithNoteEventHandler = new ResourcesConnectedWithNoteEventHandler({
            forResource: (resourceType) => {
                if (resourceType !== ('widget' as ResourceType)) {
                    throw new InternalError(`this test only supports resources of type 'widget'`);
                }

                return testQueryRepository;
            },
        });

        await connectionProvider.createCollectionIfNotExists(WIDGET_COLLECTION);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION).clear();

        await testQueryRepository.create(existingWidgetView);
    });
});
