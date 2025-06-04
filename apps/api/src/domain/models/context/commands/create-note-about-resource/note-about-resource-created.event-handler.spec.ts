import { EdgeConnectionContextType, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
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
import { NoteRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';
import {
    INoteCreationDto,
    IQueryRepositoryForAnnotatable,
    NoteAboutResourceCreatedEventHandler,
} from './note-about-resource-created.event-handler';

const WIDGET_COLLECTION = 'widgets';

class WidgetViewModel {
    id: string;
    name: MultilingualText;
    notes: NoteRecordForResourceViewModel[];

    constructor({ id, name, notes }: DTO<WidgetViewModel>) {
        this.id = id;

        this.name = new MultilingualText(name);

        this.notes = notes.map((n) => {
            return NoteRecordForResourceViewModel.fromDto(n);
        });
    }
}

const noteText = 'my note';

const knownNotes: NoteRecordForResourceViewModel[] = [
    {
        id: buildDummyUuid(55),
        note: buildMultilingualTextWithSingleItem(noteText),
        context: { type: EdgeConnectionContextType.general },
    },
];

interface IWidgetQueryRepository extends IQueryRepositoryForAnnotatable {
    fetchById(id: string): Promise<Maybe<WidgetViewModel>>;
    create(w: WidgetViewModel): Promise<void>;
}

const existingWidgetView = new WidgetViewModel({
    id: buildDummyUuid(4),
    name: buildMultilingualTextWithSingleItem('weather widget'),
    notes: [],
});

class WidgetQueryRepository implements IWidgetQueryRepository {
    private readonly arangoDb: ArangoDatabaseForCollection<WidgetViewModel>;

    constructor(connectionProvider: ArangoConnectionProvider) {
        this.arangoDb = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            WIDGET_COLLECTION
        );
    }

    async createNoteAbout(resourceId: string, { noteId }: INoteCreationDto): Promise<void> {
        const searchResult = knownNotes.find(({ id }) => id === noteId);

        if (!searchResult) return;

        const widget = await this.fetchById(resourceId);

        if (isNotFound(widget)) return;

        widget.notes.push(searchResult);

        await this.arangoDb.update(resourceId, { notes: widget.notes });
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
}

describe(`NoteAboutResourceCreatedEventHandler`, () => {
    let testQueryRepository: IWidgetQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let noteAboutResourceCreatedEventHandler: NoteAboutResourceCreatedEventHandler;

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

        noteAboutResourceCreatedEventHandler = new NoteAboutResourceCreatedEventHandler({
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

    describe(`when the target resource exists and has no notes`, () => {
        const noteCreated = new TestEventStream().buildSingle<NoteAboutResourceCreated>({
            type: 'NOTE_ABOUT_RESOURCE_CREATED',
            payload: {
                aggregateCompositeIdentifier: {
                    id: knownNotes[0].id,
                },
                resourceCompositeIdentifier: {
                    type: 'widget' as ResourceType,
                    id: existingWidgetView.id,
                },
            },
        });

        it(`should create the note`, async () => {
            await noteAboutResourceCreatedEventHandler.handle(noteCreated);

            const updatedView = (await testQueryRepository.fetchById(
                existingWidgetView.id
            )) as WidgetViewModel;

            expect(updatedView.notes).toHaveLength(1);

            expect(updatedView.notes[0].note.getOriginalTextItem().text).toBe(noteText);
        });
    });
});
