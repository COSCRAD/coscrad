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
import { NoteAboutResourceCreated } from '../../../context/commands/create-note-about-resource/note-about-resource-created.event';
import { NoteAboutResourceCreatedEventHandler } from '../../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { ResourceNoteDenormalizer } from '../../../context/commands/create-note-about-resource/resource-note.denormalizer.event-handler';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../../queries/spatial-feature-query-repository.interface';
import { EventSourcedSpatialFeatureViewModel } from '../../queries/spatial-feature.view-model.event-sourced';

const existingPoint = buildTestInstance(EventSourcedSpatialFeatureViewModel, {
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
            resourceCompositeIdentifier: existingPoint.getCompositeIdentifier(),
        },
    },
    NoteAboutResourceCreated
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

    let denormalizer: ResourceNoteDenormalizer;

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

        denormalizer = app.get(ResourceNoteDenormalizer);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingPoint);
    });

    it(`should add the note for the target point`, async () => {
        const event = noteCreated.as(noteCompositeIdentifier)[0] as NoteAboutResourceCreated;

        await noteCreatedHandler.handle(event);

        await denormalizer.handle(event);

        const updatedView = (await testQueryRepository.fetchById(
            existingPoint.id
        )) as EventSourcedSpatialFeatureViewModel;

        const { notes } = updatedView;

        expect(Object.values(notes)).toHaveLength(1);

        const note = Array.from(Object.values(notes))[0];

        expect(note.note.original.text).toBe(noteText);

        expect(note.note.original.languageCode).toBe(langaugeCodeForNote);
    });
});
