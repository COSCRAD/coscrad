import {
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    IEdgeConnectionContext,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ConnectionRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import { TestEventStream } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ResourcesConnectedWithNote } from './resources-connected-with-note.event';
import {
    IQueryRepositoryForConnectable,
    IResourceConnectionDto,
    ResourcesConnectedWithNoteEventHandler,
} from './resources-connected-with-note.event-handler';

const WIDGET_COLLECTION = 'widgets';

const WIDGET_RESOURCE_TYPE = 'widget' as ResourceType;

class WidgetViewModel {
    id: string;
    connections: ConnectionRecordForResourceViewModel[];

    constructor({ id, connections }: DTO<WidgetViewModel>) {
        this.id = id;

        this.connections = connections.map((dto) =>
            ConnectionRecordForResourceViewModel.fromDto(dto)
        );
    }
}

const existingWidgetViewForToMember = new WidgetViewModel({
    id: buildDummyUuid(9),
    connections: [],
});

const existingWidgetViewForFromMember = new WidgetViewModel({
    id: buildDummyUuid(10),
    connections: [],
});

interface IWidgetQueryRepository extends IQueryRepositoryForConnectable {
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
        const searchResult = await this.arangoDb.fetchById(id);

        if (isNotFound(searchResult)) {
            return searchResult;
        }

        return new WidgetViewModel(mapDatabaseDocumentToAggregateDTO(searchResult));
    }

    async create(w: WidgetViewModel): Promise<void> {
        await this.arangoDb.create(mapEntityDTOToDatabaseDocument(w));
    }

    async update(id: AggregateId, w: DeepPartial<DTO<WidgetViewModel>>): Promise<void> {
        await this.arangoDb.update(id, w);
    }

    async createConnection(
        id: string,
        {
            noteId,
            otherCompositeIdentifier: compositeIdentifier,
            selfContext,
            otherContext,
            text,
            role,
        }: IResourceConnectionDto
    ): Promise<void> {
        const targetWidget = await this.fetchById(id);

        if (isNotFound(targetWidget)) return;

        targetWidget.connections.push(
            ConnectionRecordForResourceViewModel.fromDto({
                id: noteId,
                selfContext,
                otherCompositeIdentifier: compositeIdentifier,
                otherContext,
                note: new MultilingualText(text),
                role,
            })
        );

        await this.update(id, targetWidget);
    }
}

const generalContext: IEdgeConnectionContext = {
    type: EdgeConnectionContextType.general,
};

const textForConnectionNote = 'This is why the widgets are related';

const languageCodeForNote = LanguageCode.English;

const resourcesConnected = new TestEventStream().buildSingle<ResourcesConnectedWithNote>({
    type: 'RESOURCES_CONNECTED_WITH_NOTE',
    payload: {
        toMemberCompositeIdentifier: {
            type: WIDGET_RESOURCE_TYPE,
            id: existingWidgetViewForToMember.id,
        },
        toMemberContext: generalContext,
        fromMemberCompositeIdentifier: {
            type: WIDGET_RESOURCE_TYPE,
            id: existingWidgetViewForFromMember.id,
        },
        fromMemberContext: generalContext,
        text: textForConnectionNote,
        languageCode: languageCodeForNote,
    },
});

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

        await testQueryRepository.create(existingWidgetViewForToMember);

        await testQueryRepository.create(existingWidgetViewForFromMember);
    });

    describe(`when there is an existing resource with no connections`, () => {
        it(`should add the connection`, async () => {
            await resourcesConnectedWithNoteEventHandler.handle(resourcesConnected);

            // check the to member
            const updatedToMember = (await testQueryRepository.fetchById(
                existingWidgetViewForToMember.id
            )) as WidgetViewModel;

            expect(updatedToMember.connections).toHaveLength(1);

            const newConnectionForToMember = updatedToMember.connections[0];

            expect(newConnectionForToMember.otherCompositeIdentifier).toEqual({
                type: WIDGET_RESOURCE_TYPE,
                id: existingWidgetViewForFromMember.id,
            });

            expect(newConnectionForToMember.otherContext).toEqual(generalContext);

            expect(newConnectionForToMember.role).toBe(EdgeConnectionMemberRole.to);

            const expectedNote = // this looks too much like the implementation
                buildMultilingualTextWithSingleItem(
                    resourcesConnected.payload.text,
                    resourcesConnected.payload.languageCode
                );

            expect(newConnectionForToMember.note.toDTO()).toEqual(expectedNote.toDTO());

            expect(newConnectionForToMember.id).toBe(
                resourcesConnected.payload.aggregateCompositeIdentifier.id
            );

            // check the from member
            const updatedFromMember = (await testQueryRepository.fetchById(
                existingWidgetViewForFromMember.id
            )) as WidgetViewModel;

            expect(updatedFromMember.connections).toHaveLength(1);

            const {
                id: connectionId,
                selfContext,
                otherCompositeIdentifier,
                otherContext,
                note,
            } = updatedFromMember.connections[0];

            expect(selfContext).toEqual(generalContext);

            expect(otherContext).toEqual(generalContext);

            expect(note.toDTO()).toEqual(expectedNote.toDTO());

            expect(connectionId).toBe(resourcesConnected.payload.aggregateCompositeIdentifier.id);

            expect(otherCompositeIdentifier).toEqual(
                resourcesConnected.payload.toMemberCompositeIdentifier
            );
        });
    });
});
