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
import { NoteReadAccessGrantedToUser } from './note-read-access-granted-to-user.event';
import { NoteReadAccessGrantedToUserEventHandler } from './note-read-access-granted-to-user.event-handler';

const targetEdgeId = buildDummyUuid(101);

const userId = buildDummyUuid(123);

const WIDGET_TYPE = 'widget' as ResourceType;

const readAccessGranted = buildTestInstance(NoteReadAccessGrantedToUser, {
    payload: {
        aggregateCompositeIdentifier: {
            id: targetEdgeId,
        },
        userId,
    },
});

const testFromWidgetDoc = {
    _key: buildDummyUuid(123),
    label: 'my widget',
};

const fromMemberCompositeId = {
    type: WIDGET_TYPE,
    id: testFromWidgetDoc._key,
};

const testToWidgetDoc = {
    _key: buildDummyUuid(124),
    label: 'another widget',
};

const toMemberCompositeId = {
    type: WIDGET_TYPE,
    id: testToWidgetDoc._key,
};

const generalContext = {
    type: 'general',
} as const;

describe(`NoteReadAccessGrantedToUserEventHandler`, () => {
    let handler: NoteReadAccessGrantedToUserEventHandler;

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

        handler = app.get(NoteReadAccessGrantedToUserEventHandler);

        edgeQueryRepository = app.get<INoteQueryRepository>(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN);
    });

    describe(`when the note view exists`, () => {
        describe(`when it is a simple note`, () => {
            beforeEach(async () => {
                await app.get(ArangoDatabaseProvider).clearViews();

                await app
                    .get(ArangoDatabaseProvider)
                    .getDatabaseForCollection('widget__VIEWS')
                    .create(testFromWidgetDoc);

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
                        id: testFromWidgetDoc._key,
                    },
                    {
                        type: EdgeConnectionContextType.general,
                    }
                );
            });

            it(`should add the user to the query ACL`, async () => {
                await handler.handle(readAccessGranted);

                const updatedView = (await edgeQueryRepository.fetchById(
                    targetEdgeId
                )) as EventSourcedNoteViewModel;

                expect(updatedView.accessControlList.canUser(userId)).toBe(true);
            });
        });

        describe(`when it is a connection`, () => {
            beforeEach(async () => {
                await app.get(ArangoDatabaseProvider).clearViews();

                await app
                    .get(ArangoDatabaseProvider)
                    .getDatabaseForCollection('widget__VIEWS')
                    .createMany([testFromWidgetDoc, testToWidgetDoc]);

                await edgeQueryRepository.connectResourcesWithNote(
                    buildTestInstance(EventSourcedNoteViewModel, {
                        id: targetEdgeId,
                        connectionType: EdgeConnectionType.self,
                        connectedResources: {
                            from: {
                                resource: fromMemberCompositeId,
                            },
                            to: {
                                resource: toMemberCompositeId,
                            },
                        },
                    }),
                    fromMemberCompositeId,
                    generalContext,
                    toMemberCompositeId,
                    generalContext
                );
            });

            it(`should add the user to the query ACL`, async () => {
                await handler.handle(readAccessGranted);

                const updatedView = (await edgeQueryRepository.fetchById(
                    targetEdgeId
                )) as EventSourcedNoteViewModel;

                expect(updatedView.accessControlList.canUser(userId)).toBe(true);
            });
        });
    });
});
