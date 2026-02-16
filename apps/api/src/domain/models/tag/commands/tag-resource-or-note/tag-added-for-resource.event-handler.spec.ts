import {
    AggregateType,
    CoscradUserRole,
    EdgeConnectionContextType,
    EdgeConnectionType,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument, {
    ArangoDatabaseDocument,
} from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { EventSourcedTagViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { EventSourcedNoteViewModel } from '../../../context/note.view-model.event-sourced';
import { ArangoNoteQueryRepository } from '../../../context/repositories/arango-note-query-repository';
import { INoteQueryRepository } from '../../../context/repositories/note-query-repository.interface';
import { CoscradUserWithGroups } from '../../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import { ArangoTagQueryRepository } from '../../repositories/arango-tag-query-repository';
import { ITagQueryRepository } from '../../repositories/tag-query-repository.interface';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';
import { TagAddedForResourceOrNoteEventHandler } from './tag-added-for-resource.event-handler';

const WIDGET_COLLECTION = 'widgets';

class WidgetViewModel {
    id: string;
    name: MultilingualText;
    tags: EventSourcedTagViewModel[];

    constructor({ id, name, tags }: DTO<WidgetViewModel>) {
        this.id = id;

        this.name = new MultilingualText(name);

        this.tags = tags.map((t) => new EventSourcedTagViewModel(t));
    }
}

interface IWidgetQueryRepository {
    fetchById(id: string): Promise<Maybe<WidgetViewModel>>;
    create(w: WidgetViewModel): Promise<void>;
    tag(id: string, tagId: string): Promise<void>;
}

const targetTagLabel = 'car parts';

const targetTagId = buildDummyUuid(2);

const knownTags: EventSourcedTagViewModel[] = [
    {
        type: AggregateType.tag,
        id: targetTagId,
        label: targetTagLabel,
        members: [],
        name: buildMultilingualTextWithSingleItem(targetTagLabel),
    },
].map((t) => new EventSourcedTagViewModel(t));

/**
 * We do not want to couple this test to the domain, which is bound to shift
 * for unrelated reasons along the way. Instead, we build a test Resource and
 * a dummy query repository implementation. The individual resource query repository
 * tests should have a test case for `tag`. End-to-end tests apply tags as part
 * of their test setup, providing "scenario" tests that ensure that the events
 * are being applied at the top level.
 *
 * This could have been an in-memory repository for the purposes of this test.
 */
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

    async tag(id: string, tagId: string): Promise<void> {
        const widget = (await this.arangoDb.fetchById(
            id
        )) as ArangoDatabaseDocument<WidgetViewModel>;

        const { tags: existingTagsForWidget } = widget;

        if (existingTagsForWidget.some(({ id }) => id === tagId)) {
            // system error- this tag has already been added
            return;
        }

        const targetTag = knownTags.find(({ id }) => id === tagId);

        if (!targetTag) {
            // system error- the tag is missing
            return;
        }

        existingTagsForWidget.push(targetTag);

        await this.arangoDb.update(id, {
            tags: existingTagsForWidget,
        });
    }
}

const existingWidgetView = new WidgetViewModel({
    id: buildDummyUuid(5),
    name: buildMultilingualTextWithSingleItem('important car part'),
    // none to start
    tags: [],
});

const adminUser = buildTestInstance(CoscradUser, {
    roles: [CoscradUserRole.projectAdmin],
});

const adminUserWithGroups = new CoscradUserWithGroups(adminUser, []);

describe(`TagAddedForResourceEventHandler`, () => {
    let testQueryRepository: IWidgetQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let resourceOrNoteTaggedEventHandler: TagAddedForResourceOrNoteEventHandler;

    let noteQueryRepository: INoteQueryRepository;

    let tagQueryRepository: ITagQueryRepository;

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

        resourceOrNoteTaggedEventHandler = new TagAddedForResourceOrNoteEventHandler({
            forResource: (resourceType) => {
                if (resourceType !== ('widget' as ResourceType)) {
                    throw new InternalError(`this test only supports resources of type 'widget'`);
                }

                return testQueryRepository;
            },
            getNoteRepository: () => {
                return new ArangoNoteQueryRepository(connectionProvider);
            },
        });

        await connectionProvider.createCollectionIfNotExists(WIDGET_COLLECTION);

        noteQueryRepository = new ArangoNoteQueryRepository(connectionProvider);

        tagQueryRepository = new ArangoTagQueryRepository(connectionProvider);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when the target is a resource`, () => {
        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION).clear();

            /**
             * We attempted to use "handle" on a creation event for the test
             * setup, but it failed due to an apparent race condition.
             *
             * We should investigate this further.
             */
            await testQueryRepository.create(existingWidgetView);
        });

        describe(`when the target resource exists and does not yet have any tags`, () => {
            const widgetTagged = new TestEventStream().buildSingle<ResourceOrNoteTagged>({
                type: 'RESOURCE_OR_NOTE_TAGGED',
                payload: {
                    aggregateCompositeIdentifier: {
                        id: targetTagId,
                    },
                    taggedMemberCompositeIdentifier: {
                        type: 'widget' as ResourceType,
                        id: existingWidgetView.id,
                    },
                },
            });

            it(`should tag the resource`, async () => {
                await resourceOrNoteTaggedEventHandler.handle(widgetTagged);

                const updatedView = (await testQueryRepository.fetchById(
                    existingWidgetView.id
                )) as WidgetViewModel;

                expect(updatedView.tags).toHaveLength(1);

                expect(updatedView.tags[0].label).toBe(targetTagLabel);
            });
        });
    });

    describe(`when the target is a note`, () => {
        const existingNoteView = buildTestInstance(EventSourcedNoteViewModel, {
            id: buildDummyUuid(101),
            connectionType: EdgeConnectionType.self,
            connectedResources: {
                self: {
                    resource: {
                        type: ResourceType.term,
                        id: buildDummyUuid(22),
                    },
                },
            },
        });

        const noteTagged = new TestEventStream().buildSingle<ResourceOrNoteTagged>({
            type: 'RESOURCE_OR_NOTE_TAGGED',
            payload: {
                aggregateCompositeIdentifier: {
                    id: targetTagId,
                },
                taggedMemberCompositeIdentifier: existingNoteView.getCompositeIdentifier(),
            },
        });

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection('note__VIEWS').clear();

            await noteQueryRepository.createNoteAbout(
                existingNoteView,
                existingNoteView.connectedResources.self.resource,
                { type: EdgeConnectionContextType.general }
            );

            await databaseProvider.getDatabaseForCollection('tag__VIEWS').clear();

            await tagQueryRepository.createMany(knownTags);
        });

        it(`should add the tags to the note view`, async () => {
            await resourceOrNoteTaggedEventHandler.handle(noteTagged);

            const updatedNote = (await noteQueryRepository.fetchById(
                existingNoteView.id,
                adminUserWithGroups
            )) as EventSourcedNoteViewModel;

            const tagSearchResult = updatedNote.tags.find(({ id }) => id === targetTagId);

            expect(tagSearchResult).toBeTruthy();

            const { label } = tagSearchResult;

            expect(label).toEqual(targetTagLabel);
        });
    });
});
