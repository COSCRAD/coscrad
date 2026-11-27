import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { EdgeConnectionModule } from '../../../../../app/domain-modules/edge-connection.module';
import { SpatialFeatureModule } from '../../../../../app/domain-modules/spatial-feature.module';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { ResourceConnectionDenormalizer } from '../../../context/commands/connect-resources-with-note/resource-connection.denormalizer.event-handler';
import { ResourcesConnectedWithNote } from '../../../context/commands/connect-resources-with-note/resources-connected-with-note.event';
import { ResourcesConnectedWithNoteEventHandler } from '../../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { NoteAboutResourceCreated } from '../../../context/commands/create-note-about-resource/note-about-resource-created.event';
import { NoteAboutResourceCreatedEventHandler } from '../../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { ResourceNoteDenormalizer } from '../../../context/commands/create-note-about-resource/resource-note.denormalizer.event-handler';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../../queries/spatial-feature-query-repository.interface';
import { EventSourcedSpatialFeatureViewModel } from '../../queries/spatial-feature.view-model.event-sourced';

const toPoint = buildTestInstance(EventSourcedSpatialFeatureViewModel, {
    id: buildDummyUuid(12),
    notes: {},
    connections: {},
});

const fromPoint = buildTestInstance(EventSourcedSpatialFeatureViewModel, {
    id: buildDummyUuid(13),
    notes: {},
    connections: {},
});

const noteText = 'This is where Happy Guy Geoff used to hang out.';

const noteId = buildDummyUuid(111);

const noteCompositeIdentifier = {
    id: noteId,
    type: AggregateType.note,
};

const langaugeCodeForNote = LanguageCode.English;

const noteCreated = new TestEventStream().andThen<NoteAboutResourceCreated>(
    {
        type: 'NOTE_ABOUT_RESOURCE_CREATED',
        payload: {
            text: noteText,
            languageCode: langaugeCodeForNote,
            resourceCompositeIdentifier: toPoint.getCompositeIdentifier(),
        },
    },
    NoteAboutResourceCreated
);

const resourcesConnected = new TestEventStream().andThen<ResourcesConnectedWithNote>(
    {
        type: 'RESOURCES_CONNECTED_WITH_NOTE',
        payload: {
            text: noteText,
            languageCode: langaugeCodeForNote,
            toMemberCompositeIdentifier: toPoint.getCompositeIdentifier(),
            fromMemberCompositeIdentifier: fromPoint.getCompositeIdentifier(),
        },
    },
    ResourcesConnectedWithNote
);

/**
 * This is a generic event. It's important to prove that the handler works
 * for this specific feature.
 *
 * In the future, it would save some setup if we just had a set of "scenario"
 * tests that run several generic commands and show that the corresponding
 * event consumers write the correct views.
 */
describe(`when handling a "NOTE_CREATED" event for a point`, () => {
    let testQueryRepository: ISpatialFeatureQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let noteCreatedHandler: NoteAboutResourceCreatedEventHandler;

    let noteDenormalizer: ResourceNoteDenormalizer;

    let resourcesConnectedHandler: ResourcesConnectedWithNoteEventHandler;

    let connectionDenormalizer: ResourceConnectionDenormalizer;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [],
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                CommandModule,
                EdgeConnectionModule,
                SpatialFeatureModule,
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
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        await app.init();

        databaseProvider = app.get(ArangoDatabaseProvider);

        testQueryRepository = app.get(SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN);

        noteCreatedHandler = app.get(NoteAboutResourceCreatedEventHandler);

        noteDenormalizer = app.get(ResourceNoteDenormalizer);

        resourcesConnectedHandler = app.get(ResourcesConnectedWithNoteEventHandler);

        connectionDenormalizer = app.get(ResourceConnectionDenormalizer);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(toPoint);
    });

    describe(`when a note about a spatial feature has been created`, () => {
        it(`should add the note for the target point`, async () => {
            const event = noteCreated.as(noteCompositeIdentifier)[0] as NoteAboutResourceCreated;

            await noteCreatedHandler.handle(event);

            await noteDenormalizer.handle(event);

            const updatedView = (await testQueryRepository.fetchById(
                toPoint.id
            )) as EventSourcedSpatialFeatureViewModel;

            const { notes } = updatedView;

            expect(Object.values(notes)).toHaveLength(1);

            const note = Array.from(Object.values(notes))[0];

            expect(note.note.original.text).toBe(noteText);

            expect(note.note.original.languageCode).toBe(langaugeCodeForNote);
        });
    });

    describe(`when a spatial feature has been connected to another spatial feature`, () => {
        it(`should add the connection info to each member`, async () => {
            const event = resourcesConnected.as(
                noteCompositeIdentifier
            )[0] as ResourcesConnectedWithNote;

            await resourcesConnectedHandler.handle(event);

            await connectionDenormalizer.handle(event);

            const updatedView = (await testQueryRepository.fetchById(
                toPoint.id
            )) as EventSourcedSpatialFeatureViewModel;

            const { connections } = updatedView;

            expect(Object.values(connections)).toHaveLength(1);

            const connection = Array.from(Object.values(connections))[0];

            expect(connection.note.original.text).toBe(noteText);

            expect(connection.note.original.languageCode).toBe(langaugeCodeForNote);
        });
    });
});
