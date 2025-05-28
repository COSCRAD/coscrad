import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
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
import mapEntityDTOToDatabaseDocument, {
    ArangoDatabaseDocument,
} from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { EventSourcedTagRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { TestEventStream } from '../../../../../test-data/events';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';
import { ResourceOrNoteTaggedEventHandler } from './resource-or-note-tagged.event-handler';

const WIDGET_COLLECTION = 'widgets';

class WidgetViewModel {
    id: string;
    name: MultilingualText;
    tags: EventSourcedTagRecordForResourceViewModel[];

    constructor({ id, name, tags }: DTO<WidgetViewModel>) {
        this.id = id;

        this.name = new MultilingualText(name);

        this.tags = tags.map((t) => new EventSourcedTagRecordForResourceViewModel(t));
    }
}

interface IWidgetQueryRepository {
    fetchById(id: string): Promise<Maybe<WidgetViewModel>>;
    create(w: WidgetViewModel): Promise<void>;
    tag(id: string, tagId: string): Promise<void>;
}

const targetTagLabel = 'car parts';

const targetTagId = buildDummyUuid(2);

const knownTags: EventSourcedTagRecordForResourceViewModel[] = [
    {
        type: AggregateType.tag,
        id: targetTagId,
        label: targetTagLabel,
        members: [],
        name: buildMultilingualTextWithSingleItem(targetTagLabel),
    },
].map((t) => new EventSourcedTagRecordForResourceViewModel(t));

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

describe(`ResourceOrNoteTaggedEventHandler`, () => {
    let testQueryRepository: IWidgetQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let resourceOrNoteTaggedEventHandler: ResourceOrNoteTaggedEventHandler;

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

        resourceOrNoteTaggedEventHandler = new ResourceOrNoteTaggedEventHandler({
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

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        await testQueryRepository.create(existingWidgetView);
    });

    describe(`when the target is a resource`, () => {
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
});
