import { ResourceType } from '@coscrad/api-interfaces';
import { INestApplication, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { NoteRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../../term/repositories/base-arango-resource-query-builder';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';
import {
    INoteCreationDto,
    IQueryRepositoryForAnnotatable,
} from './note-about-resource-created.event-handler';
import { ResourceNoteDenormalizer } from './resource-note.denormalizer.event-handler';

const WIDGET_TYPE = 'widget' as ResourceType;

const WIDGET_COLLECTION = `${WIDGET_TYPE}__VIEWS`;

class Widget {
    readonly type = WIDGET_TYPE;

    id: string;

    name: string;

    notes: Record<string, NoteRecordForResourceViewModel>;
}

const targetWidget: Widget = {
    id: '123',
    type: WIDGET_TYPE,
    name: 'blue widget',
    notes: {},
};

@Injectable()
class WidgetRepository implements IQueryRepositoryForAnnotatable {
    private queryBuilder = new BaseArangoResourceViewQueryBuilder(WIDGET_COLLECTION);

    private readonly database: ArangoDatabaseForCollection<Widget>;

    constructor(databseProvider: ArangoDatabaseProvider) {
        this.database = new ArangoDatabaseForCollection(
            databseProvider.getDBInstance(),
            WIDGET_COLLECTION
        );
    }

    async create(widget: Widget) {
        await this.database.create(mapEntityDTOToDatabaseDocument(widget));
    }

    async fetchById(id: string) {
        const doc = await this.database.fetchById(id);

        if (isNotFound(doc)) {
            return doc;
        }

        return mapDatabaseDocumentToAggregateDTO(doc);
    }

    async createNoteAbout(id: string, dto: INoteCreationDto): Promise<void> {
        await this.database.query(this.queryBuilder.createNoteAbout(id, dto));
    }
}

const event = buildTestInstance(NoteAboutResourceCreated, {
    payload: {
        aggregateCompositeIdentifier: {
            id: buildDummyUuid(8),
        },
        resourceCompositeIdentifier: {
            id: targetWidget.id,
            type: targetWidget.type,
        },
    },
});

describe(`ResourceNoteDenormalizer`, () => {
    let app: INestApplication;

    let handler: ResourceNoteDenormalizer;

    let connectionProvider: ArangoConnectionProvider;

    let widgetRepository: WidgetRepository;

    beforeAll(async () => {
        const testModule = Test.createTestingModule({
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
                    provide: NoteAboutResourceCreated,
                    useValue: NoteAboutResourceCreated,
                },
                ResourceNoteDenormalizer,
                WidgetRepository,
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
            .overrideProvider(QUERY_REPOSITORY_PROVIDER_TOKEN)
            .useValue({
                forResource(type: string) {
                    if (type !== WIDGET_TYPE) {
                        throw new InternalError(
                            `${WIDGET_TYPE} is the only supported resource type for this test`
                        );
                    }

                    return new WidgetRepository(new ArangoDatabaseProvider(connectionProvider));
                },
            })
            .compile();

        app = (await testModule).createNestApplication();

        await app.init();

        connectionProvider = app.get(ArangoConnectionProvider);

        await connectionProvider.createCollectionIfNotExists(WIDGET_COLLECTION);

        widgetRepository = app.get(WidgetRepository);

        handler = app.get(ResourceNoteDenormalizer);
    });

    beforeEach(async () => {
        // this works because of the `__VIEWS` in `WIDGET__VIEWS` (convention over configuration)
        await new ArangoDatabaseProvider(connectionProvider).clearViews();

        await widgetRepository.create(targetWidget);
    });

    afterAll(async () => {
        connectionProvider.getConnection().close();

        await app.close();
    });

    describe(`when the target resource exists`, () => {
        it(`should write a note record to the resource view`, async () => {
            await handler.handle(event);

            const updatedResourceView = (await widgetRepository.fetchById(
                targetWidget.id
            )) as Widget;

            expect(Object.keys(updatedResourceView.notes)).toHaveLength(1);
        });
    });
});
