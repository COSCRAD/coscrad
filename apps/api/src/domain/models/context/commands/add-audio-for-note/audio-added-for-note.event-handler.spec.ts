import { EdgeConnectionContextType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { MultilingualAudio } from '../../../shared/multilingual-audio/multilingual-audio.entity';
import { EventSourcedNoteViewModel } from '../../event-sourced-note.view-model';
import { ArangoNoteQueryRepository } from '../../repositories/arango-note-query-repository';
import { INoteQueryRepository } from '../../repositories/note-query-repository.interface';
import { AudioAddedForNote } from './audio-added-for-note.event';
import { AudioAddedForNoteEventHandler } from './audio-added-for-note.event-handler';

const noteId = buildDummyUuid(32);

const languageCodeForAudio = LanguageCode.English;

const audioItemId = buildDummyUuid(4);

const existingNoteView = buildTestInstance(EventSourcedNoteViewModel, {
    id: noteId,
    audio: MultilingualAudio.buildEmpty(),
});

const audioAddedForNote = buildTestInstance(AudioAddedForNote, {
    payload: {
        aggregateCompositeIdentifier: { id: noteId },
        audioItemId,
        languageCode: languageCodeForAudio,
    },
});

describe(`AudioAddedForNoteEventHandler`, () => {
    let testQueryRepository: INoteQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let audioAddedForNoteEventHandler: AudioAddedForNoteEventHandler;

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

        testQueryRepository = new ArangoNoteQueryRepository(connectionProvider);

        audioAddedForNoteEventHandler = new AudioAddedForNoteEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.createNoteAbout(
            existingNoteView,
            { type: ResourceType.term, id: buildDummyUuid(135) },
            { type: EdgeConnectionContextType.general }
        );
    });

    describe(`when there is a note with no audio`, () => {
        it(`should add audio to the note`, async () => {
            await audioAddedForNoteEventHandler.handle(audioAddedForNote);

            const updatedView = (await testQueryRepository.fetchById(
                noteId
            )) as EventSourcedNoteViewModel;

            expect(updatedView.audio.hasAudioIn(languageCodeForAudio));

            expect(updatedView.audio.hasAudioItem(audioItemId));
        });
    });
});
