import {
    EdgeConnectionContextType,
    EdgeConnectionType,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { EdgeConnectionModule } from '../../../../../app/domain-modules/edge-connection.module';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { EventSourcedNoteViewModel } from '../../note.view-model.event-sourced';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/note-query-repository.interface';
import { EdgePublished } from './edge-published.event';
import { EdgePublishedEventHandler } from './edge-published.event-handler';

const targetEdgeId = buildDummyUuid(101);

const edgePublished = buildTestInstance(EdgePublished, {
    payload: {
        aggregateCompositeIdentifier: {
            id: targetEdgeId,
        },
    },
});

describe(`EdgePublished`, () => {
    let handler: EdgePublishedEventHandler;

    let app: INestApplication;

    let edgeQueryRepository: INoteQueryRepository;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                EdgeConnectionModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = module.createNestApplication();

        await app.init();

        handler = app.get(EdgePublishedEventHandler);

        edgeQueryRepository = app.get<INoteQueryRepository>(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN);

        await app.get(ArangoConnectionProvider).createCollectionIfNotExists('widget__VIEWS');

        await app.get(ArangoConnectionProvider).createCollectionIfNotExists('whatsit__VIEWS');
    });

    describe(`when there is an unpublished note in the query database`, () => {
        const testWidgetDoc = {
            _key: buildDummyUuid(123),
            label: 'my widget',
        };

        beforeEach(async () => {
            await app.get(ArangoDatabaseProvider).clearViews();

            await app
                .get(ArangoDatabaseProvider)
                .getDatabaseForCollection('widget__VIEWS')
                .create(testWidgetDoc);

            await edgeQueryRepository.createNoteAbout(
                buildTestInstance(EventSourcedNoteViewModel, {
                    id: targetEdgeId,
                    connectionType: EdgeConnectionType.self,
                    connectedResources: {
                        self: {
                            resource: {
                                type: 'widget' as ResourceType,
                                id: buildDummyUuid(34),
                            },
                        },
                    },
                }),
                {
                    type: 'widget' as ResourceType,
                    id: testWidgetDoc._key,
                },
                {
                    type: EdgeConnectionContextType.general,
                }
            );
        });

        it(`should publish the view`, async () => {
            await handler.handle(edgePublished);

            const updatedView = (await edgeQueryRepository.fetchById(
                targetEdgeId
            )) as EventSourcedNoteViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`when there is an unpublished connection in the query database`, () => {
        const testWidgetDoc = {
            _key: buildDummyUuid(123),
            label: 'my widget',
        };

        const testWhatsitDoc = {
            _key: buildDummyUuid(124),
            label: 'a whatsit',
        };

        beforeEach(async () => {
            await app.get(ArangoDatabaseProvider).clearViews();

            await app
                .get(ArangoDatabaseProvider)
                .getDatabaseForCollection('widget__VIEWS')
                .create(testWidgetDoc);

            await app.get(ArangoConnectionProvider).createCollectionIfNotExists('whatsit__VIEWS');

            await app
                .get(ArangoDatabaseProvider)
                .getDatabaseForCollection('whatsit__VIEWS')
                .create(testWidgetDoc);

            await edgeQueryRepository.connectResourcesWithNote(
                buildTestInstance(EventSourcedNoteViewModel, {
                    id: targetEdgeId,
                    connectionType: EdgeConnectionType.self,
                    connectedResources: {
                        from: {
                            resource: {
                                type: 'widget' as ResourceType,
                                id: testWidgetDoc._key,
                            },
                        },
                        to: {
                            resource: {
                                type: 'whatist' as ResourceType,
                                id: testWhatsitDoc._key,
                            },
                        },
                    },
                }),
                {
                    type: 'widget' as ResourceType,
                    id: testWidgetDoc._key,
                },
                {
                    type: EdgeConnectionContextType.general,
                },
                {
                    type: 'whatsit' as ResourceType,
                    id: testWhatsitDoc._key,
                },
                {
                    type: EdgeConnectionContextType.general,
                }
            );
        });

        it(`should publish the view`, async () => {
            await handler.handle(edgePublished);

            const updatedView = (await edgeQueryRepository.fetchById(
                targetEdgeId
            )) as EventSourcedNoteViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });
});
