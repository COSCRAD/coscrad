import {
    CoscradUserRole,
    EdgeConnectionContextType,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextFromBilingualText } from '../../../../../domain/common/build-multilingual-text-from-bilingual-text';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { EventSourcedAudioItemViewModel } from '../../../audio-visual/audio-item/queries';
import { ArangoAudioItemQueryRepository } from '../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { MultilingualAudio } from '../../../shared/multilingual-audio/multilingual-audio.entity';
import { CoscradUserWithGroups } from '../../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import { EventSourcedNoteViewModel } from '../../note.view-model.event-sourced';
import { ArangoNoteQueryRepository } from '../../repositories/arango-note-query-repository';
import { INoteQueryRepository } from '../../repositories/note-query-repository.interface';
import { AudioAddedForNote } from './audio-added-for-note.event';
import { AudioAddedForNoteEventHandler } from './audio-added-for-note.event-handler';

const generalContext = {
    type: EdgeConnectionContextType.general,
};

const originalLanguageCode = LanguageCode.English;

const translationLanguageCode = LanguageCode.Chilcotin;

const noteId = buildDummyUuid(32);

const audioItemIdToAdd = buildDummyUuid(4);

const audioItemToAdd = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: audioItemIdToAdd,
});

const existingNoteView = buildTestInstance(EventSourcedNoteViewModel, {
    id: noteId,
    audio: MultilingualAudio.buildEmpty(),
});

const existingAudioItemId = buildDummyUuid(123);

const existingAudio = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: existingAudioItemId,
});

const adminUser = buildTestInstance(CoscradUser, {
    roles: [CoscradUserRole.projectAdmin],
});

const adminUserWithGroups = new CoscradUserWithGroups(adminUser, []);

describe(`AudioAddedForNoteEventHandler`, () => {
    let testQueryRepository: INoteQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let connectionProvider: ArangoConnectionProvider;

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

        connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoNoteQueryRepository(connectionProvider);

        audioAddedForNoteEventHandler = new AudioAddedForNoteEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await new ArangoAudioItemQueryRepository(connectionProvider).createMany([
            existingAudio,
            audioItemToAdd,
        ]);
    });

    describe(`when there is a self-note with no audio`, () => {
        const audioAddedForNote = buildTestInstance(AudioAddedForNote, {
            payload: {
                aggregateCompositeIdentifier: { id: noteId },
                audioItemId: audioItemIdToAdd,
                languageCode: originalLanguageCode,
            },
        });

        beforeEach(async () => {
            await testQueryRepository.createNoteAbout(
                existingNoteView,
                { type: ResourceType.term, id: buildDummyUuid(135) },
                { type: EdgeConnectionContextType.general }
            );
        });

        it(`should add audio to the note`, async () => {
            await audioAddedForNoteEventHandler.handle(audioAddedForNote);

            const updatedView = (await testQueryRepository.fetchById(
                noteId,
                adminUserWithGroups
            )) as EventSourcedNoteViewModel;

            expect(updatedView.audio.hasAudioIn(originalLanguageCode));

            expect(updatedView.audio.hasAudioItem(audioItemIdToAdd));
        });
    });

    describe(`when there is a connecting note with existing original audio`, () => {
        const connectingNote = buildTestInstance(EventSourcedNoteViewModel, {
            id: noteId,
            text: buildMultilingualTextFromBilingualText(
                {
                    text: 'original text',
                    languageCode: originalLanguageCode,
                },
                {
                    text: 'translation into language',
                    languageCode: translationLanguageCode,
                }
            ),

            audio: MultilingualAudio.buildEmpty(),
        });

        const audioAddedForNote = buildTestInstance(AudioAddedForNote, {
            payload: {
                aggregateCompositeIdentifier: { id: noteId },
                audioItemId: audioItemIdToAdd,
                languageCode: translationLanguageCode,
            },
        });

        beforeEach(async () => {
            await testQueryRepository.connectResourcesWithNote(
                connectingNote,
                { type: ResourceType.term, id: buildDummyUuid(135) },
                generalContext,
                { type: ResourceType.song, id: buildDummyUuid(199) },
                generalContext
            );
        });

        it(`should add audio to the note and keep the existing audio`, async () => {
            await testQueryRepository.addAudio(
                connectingNote.id,
                existingAudioItemId,
                originalLanguageCode
            );

            await audioAddedForNoteEventHandler.handle(audioAddedForNote);

            const updatedView = (await testQueryRepository.fetchById(
                noteId,
                adminUserWithGroups
            )) as EventSourcedNoteViewModel;

            expect(updatedView.audio.hasAudioIn(originalLanguageCode)).toBe(true);

            expect(updatedView.audio.getIdForAudioIn(originalLanguageCode)).toBe(
                existingAudioItemId
            );

            expect(updatedView.audio.hasAudioIn(translationLanguageCode)).toBe(true);

            expect(updatedView.audio.getIdForAudioIn(translationLanguageCode)).toBe(
                audioItemIdToAdd
            );
        });
    });
});
