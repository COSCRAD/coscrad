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
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { CoscradUserWithGroups } from '../../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import { EventSourcedNoteViewModel } from '../../note.view-model.event-sourced';
import { ArangoNoteQueryRepository } from '../../repositories/arango-note-query-repository';
import { INoteQueryRepository } from '../../repositories/note-query-repository.interface';
import { NoteTranslated } from './note-translated.event';
import { NoteTranslatedEventHandler } from './note-translated.event-handler';

const noteId = buildDummyUuid(23);

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationText = 'translation for the note';

const existingNoteView = buildTestInstance(EventSourcedNoteViewModel, {
    id: noteId,
    text: buildMultilingualTextWithSingleItem('note text', originalLanguageCode),
});

const noteTranslated = buildTestInstance(NoteTranslated, {
    payload: {
        aggregateCompositeIdentifier: { id: noteId },
        languageCode: translationLanguageCode,
        text: translationText,
    },
});

const adminUser = buildTestInstance(CoscradUser, {
    roles: [CoscradUserRole.projectAdmin],
});

const adminUserWithGroups = new CoscradUserWithGroups(adminUser, []);

describe(`NoteTranslatedEventHandler`, () => {
    let testQueryRepository: INoteQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let noteTranslatedEventHandler: NoteTranslatedEventHandler;

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

        await app.init();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoNoteQueryRepository(connectionProvider);

        noteTranslatedEventHandler = new NoteTranslatedEventHandler(testQueryRepository);
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

    describe(`when there is a note with no translation`, () => {
        it(`should translate the note`, async () => {
            await noteTranslatedEventHandler.handle(noteTranslated);

            const updatedView = (await testQueryRepository.fetchById(
                noteId,
                adminUserWithGroups
            )) as EventSourcedNoteViewModel;

            expect(updatedView.text.has(translationLanguageCode)).toBe(true);
        });
    });
});
