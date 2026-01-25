import {
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ConnectionRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../../term/repositories/base-arango-resource-query-builder';
import { NoteAboutResourceCreated } from '../create-note-about-resource/note-about-resource-created.event';
import { ResourceConnectionDenormalizer } from './resource-connection.denormalizer.event-handler';
import { ResourcesConnectedWithNote } from './resources-connected-with-note.event';
import {
    IQueryRepositoryForConnectable,
    IResourceConnectionDto,
} from './resources-connected-with-note.event-handler';

const WIDGET_TYPE = 'widget' as ResourceType;

const WIDGET_COLLECTION = `${WIDGET_TYPE}__VIEWS`;

class Widget {
    readonly type = WIDGET_TYPE;

    id: string;

    name: string;

    connections: Record<string, ConnectionRecordForResourceViewModel>;
}

const targetToWidget: Widget = {
    id: '123',
    type: WIDGET_TYPE,
    name: 'blue widget',
    connections: {},
};

const targetFromWidget: Widget = {
    id: '124',
    type: WIDGET_TYPE,
    name: 'red widget',
    connections: {},
};

@Injectable()
class WidgetRepository implements IQueryRepositoryForConnectable {
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

    async createConnection(id: string, dto: IResourceConnectionDto): Promise<void> {
        await this.database.query(this.queryBuilder.connectResourcesWithNote(id, dto));
    }
}

const noteId = buildDummyUuid(101);

const event = buildTestInstance(ResourcesConnectedWithNote, {
    payload: {
        aggregateCompositeIdentifier: {
            id: noteId,
        },
        toMemberCompositeIdentifier: {
            type: WIDGET_TYPE,
            id: targetToWidget.id,
        },
        toMemberContext: {
            type: EdgeConnectionContextType.general,
        },
        fromMemberCompositeIdentifier: {
            type: WIDGET_TYPE,
            id: targetFromWidget.id,
        },
        fromMemberContext: {
            type: EdgeConnectionContextType.general,
        },
    },
});

describe(`ResourceConnectionDenormalizer`, () => {
    let app: INestApplication;

    let handler: ResourceConnectionDenormalizer;

    let connectionProvider: ArangoConnectionProvider;

    let widgetRepository: WidgetRepository;

    describe(`when the target resource exists`, () => {
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
                    ResourceConnectionDenormalizer,
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

            handler = app.get(ResourceConnectionDenormalizer);
        });

        beforeEach(async () => {
            // this works because of the `__VIEWS` in `WIDGET__VIEWS` (convention over configuration)
            await new ArangoDatabaseProvider(connectionProvider).clearViews();

            await widgetRepository.create(targetToWidget);

            await widgetRepository.create(targetFromWidget);
        });

        afterAll(async () => {
            connectionProvider.getConnection().close();

            await app.close();
        });

        it(`should write the connection record to both resource views`, async () => {
            await handler.handle(event);

            const updatedToMemberView = (await widgetRepository.fetchById(
                targetToWidget.id
            )) as Widget;

            const generalContext = {
                type: EdgeConnectionContextType.general,
            };

            const expectedNoteText = buildMultilingualTextWithSingleItem(
                event.payload.text,
                event.payload.languageCode
            );

            expect(Object.keys(updatedToMemberView.connections)).toHaveLength(1);

            // Validate the to member connection record
            const toMemberConnection =
                updatedToMemberView.connections[event.payload.aggregateCompositeIdentifier.id];

            expect(toMemberConnection.id).toBe(noteId);

            expect(toMemberConnection.note).toEqual({
                original: {
                    text: expectedNoteText.items[0].text,
                    languageCode: expectedNoteText.items[0].languageCode,
                },
                translations: {},
            });

            expect(toMemberConnection.otherCompositeIdentifier).toEqual({
                type: WIDGET_TYPE,
                id: targetFromWidget.id,
            });

            expect(toMemberConnection.otherContext).toEqual(generalContext);

            expect(toMemberConnection.role).toEqual(EdgeConnectionMemberRole.to);

            expect(toMemberConnection.selfContext).toEqual(generalContext);

            const updatedFromMemberView = (await widgetRepository.fetchById(
                targetFromWidget.id
            )) as Widget;

            expect(Object.keys(updatedFromMemberView.connections)).toHaveLength(1);

            // Validate the from member connection record
            const fromMemberConnection =
                updatedFromMemberView.connections[event.payload.aggregateCompositeIdentifier.id];

            expect(fromMemberConnection.id).toBe(noteId);

            expect(fromMemberConnection.note).toEqual({
                original: {
                    text: expectedNoteText.items[0].text,
                    languageCode: expectedNoteText.items[0].languageCode,
                },
                translations: {},
            });

            expect(fromMemberConnection.otherCompositeIdentifier).toEqual({
                type: WIDGET_TYPE,
                id: targetToWidget.id,
            });

            // TODO use a non-trivial context type for one of the members
            expect(fromMemberConnection.otherContext).toEqual(generalContext);

            expect(fromMemberConnection.role).toBe(EdgeConnectionMemberRole.from);

            expect(fromMemberConnection.selfContext).toEqual(generalContext);
        });
    });
});
