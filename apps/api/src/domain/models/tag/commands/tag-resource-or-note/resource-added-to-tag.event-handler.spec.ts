import { AggregateType, CategorizableType, ResourceType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { CommandInfoService } from '../../../../../app/controllers/command/services/command-info-service';
import { TagModule } from '../../../../../app/domain-modules/tag.module';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { EventSourcedTagViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { ArangoTagQueryRepository } from '../../repositories/arango-tag-query-repository';
import { ITagQueryRepository } from '../../repositories/tag-query-repository.interface';
import { ResourceAddedToTagEventHandler } from './resource-added-to-tag.event-handler';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';

const WIDGET = 'WIDGET' as CategorizableType;

const tagId = buildDummyUuid(12);

const label = 'the label for this tag';

class Widget {
    readonly type = WIDGET;

    id: AggregateId;

    name: string;

    constructor(dto: Omit<DTO<Widget>, 'type'>) {
        const { id, name } = dto;

        this.id = id;

        this.name = name;
    }

    public static fromDto(dto: DTO<Widget>) {
        return new Widget(dto);
    }
}

const taggedMemberCompositeIdentifier = { id: tagId, type: WIDGET as CategorizableType };

const resourceAddedToTagEvent = buildTestInstance(ResourceOrNoteTagged, {
    payload: {
        aggregateCompositeIdentifier: { type: AggregateType.tag, id: tagId },
        taggedMemberCompositeIdentifier,
    },
});

const testWidget = new Widget({ id: tagId, name: 'my test widget' });

class WidgetRepository {
    private readonly store = new Map<AggregateId, Widget>();

    fetchById(id: AggregateId) {
        if (!this.store.has(id)) {
            return Promise.resolve(NotFound);
        }

        return Promise.resolve(this.store.get(id));
    }

    create(widget: Widget) {
        this.store.set(widget.id, widget);
    }
}

const widgetRepository = new WidgetRepository();

widgetRepository.create(testWidget);

const mockQueryRepositoryProvider = {
    forResource(categorizableType: CategorizableType) {
        if (categorizableType === WIDGET) {
            return widgetRepository;
        }

        throw new InternalError(
            `Failed to provide a taggable query repo for unknown categorizable type: ${categorizableType}`
        );
    },
};

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
            .overrideProvider(QUERY_REPOSITORY_PROVIDER_TOKEN)
            .useValue(mockQueryRepositoryProvider)
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
    });

    describe(`when handing a resource or note tagged`, () => {
        describe(`when a resource has been tagged`, () => {
            describe(`when the tag has no existing members`, () => {
                const existingTag = buildTestInstance(EventSourcedTagViewModel, {
                    id: tagId,
                    label,
                    members: [],
                });

                beforeEach(async () => {
                    await testQueryRepository.create(existingTag);
                });

                it(`should tag the resource or note`, async () => {
                    await handler.handle(resourceAddedToTagEvent);

                    const updatedTag = (await testQueryRepository.fetchById(
                        existingTag.id
                    )) as EventSourcedTagViewModel;

                    const { members } = updatedTag;

                    expect(members).toHaveLength(1);

                    const firstMember = members[0];

                    // TODO Ensure that all resource views have a type property
                    expect(firstMember).toEqual(testWidget);
                });
            });

            describe(`when the tag has some existing members`, () => {
                const existingMembers = [{ type: ResourceType.term, id: buildDummyUuid(1) }];

                const existingTag = buildTestInstance(EventSourcedTagViewModel, {
                    id: tagId,
                    label,
                    members: existingMembers,
                });

                beforeEach(async () => {
                    await testQueryRepository.create(existingTag);
                });

                it(`should tag the resource or note`, async () => {
                    await handler.handle(resourceAddedToTagEvent);

                    const updatedTag = (await testQueryRepository.fetchById(
                        existingTag.id
                    )) as EventSourcedTagViewModel;

                    const { members } = updatedTag;

                    expect(members).toHaveLength(1 + existingMembers.length);

                    const lastAddedMember = members[existingMembers.length];

                    // TODO Ensure that all resource views have a type property
                    expect(lastAddedMember).toEqual(testWidget);
                });
            });
        });

        // TODO Do this once we support `note__VIEWS`
        describe(`when a note has been tagged`, () => {
            it.todo(`should add the note document as a tag member`);
        });
    });
});
