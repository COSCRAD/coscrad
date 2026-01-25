import { EdgeConnectionContextType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../../lib/types/not-found';
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
import { DeepPartial } from '../../../../../types/DeepPartial';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { BaseArangoResourceViewQueryBuilder } from '../../../term/repositories/base-arango-resource-query-builder';
import { EventSourcedNoteViewModel } from '../../note.view-model.event-sourced';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/note-query-repository.interface';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';
import {
    INoteCreationDto,
    IQueryRepositoryForAnnotatable,
    NoteAboutResourceCreatedEventHandler,
} from './note-about-resource-created.event-handler';

const WIDGET_COLLECTION = 'widget__VIEWS';

const WIDGET = 'widget' as ResourceType;

class WidgetViewModel {
    id: string;
    readonly type = WIDGET;
    name: MultilingualText;
    notes: NoteRecordForResourceViewModel[];

    constructor({
        id,
        name,
        notes,
    }: {
        id: string;
        name: DTO<MultilingualText>;
        notes: NoteRecordForResourceViewModel[];
    }) {
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
        note: {
            original: {
                text: noteText,
                languageCode: LanguageCode.English,
            },
            translations: {},
        },
        context: { type: EdgeConnectionContextType.general },
    },
];

const existingWidgetView = new WidgetViewModel({
    id: buildDummyUuid(4),
    name: buildMultilingualTextWithSingleItem('weather widget'),
    notes: [],
});

class WidgetQueryRepository implements IQueryRepositoryForAnnotatable {
    private readonly arangoDb: ArangoDatabaseForCollection<WidgetViewModel>;

    private readonly baseQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(connectionProvider: ArangoConnectionProvider) {
        this.arangoDb = new ArangoDatabaseForCollection<WidgetViewModel>(
            new ArangoDatabase(connectionProvider.getConnection()),
            WIDGET_COLLECTION
        );

        this.baseQueryBuilder = new BaseArangoResourceViewQueryBuilder(WIDGET_COLLECTION);
    }

    async fetchById(id: string): Promise<Maybe<WidgetViewModel>> {
        const doc = await this.arangoDb.fetchById(id);

        if (isNotFound(doc)) {
            return doc;
        }

        const widgetViewDto = mapDatabaseDocumentToAggregateDTO(doc);

        return new WidgetViewModel(widgetViewDto);
    }

    async create(w: WidgetViewModel): Promise<void> {
        await this.arangoDb.create(mapEntityDTOToDatabaseDocument(w)).catch((e) => {
            throw e;
        });
    }

    async update(id: AggregateId, w: DeepPartial<DTO<WidgetViewModel>>): Promise<void> {
        await this.arangoDb.update(id, w);
    }

    async createNoteAbout(id: string, dto: INoteCreationDto): Promise<void> {
        await this.arangoDb.query(this.baseQueryBuilder.createNoteAbout(id, dto));
    }
}

describe(`NoteAboutResourceCreatedEventHandler`, () => {
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
            text: noteText,
        },
    });

    let testQueryRepository: WidgetQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let noteAboutResourceCreatedEventHandler: NoteAboutResourceCreatedEventHandler;

    let noteQueryRepository: INoteQueryRepository;

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

        noteAboutResourceCreatedEventHandler = new NoteAboutResourceCreatedEventHandler(
            app.get(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        );

        await connectionProvider.createCollectionIfNotExists(WIDGET_COLLECTION);

        noteQueryRepository = app.get(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION).clear();

        await databaseProvider.clearViews();

        await testQueryRepository.create(existingWidgetView);
    });

    describe(`when the target resource exists and has no notes`, () => {
        it(`should create the note`, async () => {
            await noteAboutResourceCreatedEventHandler.handle(noteCreated);

            const updatedView = await noteQueryRepository.fetchById(
                noteCreated.payload.aggregateCompositeIdentifier.id
            );

            expect(updatedView).not.toBe(NotFound);

            const {
                text: textForUpdatedView,
                connectedResources: { to, from, self },
            } = updatedView as EventSourcedNoteViewModel;

            const originalText = textForUpdatedView.getOriginalTextItem();

            expect(originalText.languageCode).toEqual(noteCreated.payload.languageCode);

            expect(originalText.text).toEqual(noteCreated.payload.text);

            expect(updatedView);

            expect(to).toBeFalsy();

            expect(from).toBeFalsy();

            expect(self.resource.id).toBe(noteCreated.payload.resourceCompositeIdentifier.id);

            expect(self.resource.type).toBe(noteCreated.payload.resourceCompositeIdentifier.type);
        });
    });
});
