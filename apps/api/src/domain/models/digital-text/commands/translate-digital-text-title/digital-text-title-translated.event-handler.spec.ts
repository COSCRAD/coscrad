import { LanguageCode } from '@coscrad/api-interfaces';
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
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoDigitalTextQueryRepository } from '../../queries/arango-digital-text-query-repository';
import { IDigitalTextQueryRepository } from '../../queries/digital-text-query-repository.interface';
import { DigitalTextTitleTranslated } from './digital-text-title-translated.event';
import { DigitalTextTitleTranslatedEventHandler } from './digital-text-title-translated.event-handler';

const originalLanguageCode = LanguageCode.Chilcotin;

const digitalTextId = buildDummyUuid(45);

const translationLanguageCode = LanguageCode.English;

const translationText = 'text of the translated';

const existingDigitalTextView = buildTestInstance(DigitalTextViewModel, {
    id: digitalTextId,
    name: buildMultilingualTextWithSingleItem('digital text title', originalLanguageCode),
});

const digitalTextTitleTranslated = buildTestInstance(DigitalTextTitleTranslated, {
    payload: {
        aggregateCompositeIdentifier: {
            id: digitalTextId,
        },
        languageCode: translationLanguageCode,
        translation: translationText,
    },
});

describe(`DigitalTextTitleTranslatedEventHandler`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let digitalTextTitleTranslatedEventHandler: DigitalTextTitleTranslatedEventHandler;

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

        testQueryRepository = new ArangoDigitalTextQueryRepository(connectionProvider);

        digitalTextTitleTranslatedEventHandler = new DigitalTextTitleTranslatedEventHandler(
            testQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingDigitalTextView);
    });

    describe(`when there is a digital text with no translation for its title`, () => {
        it(`should translate the digital text title`, async () => {
            await digitalTextTitleTranslatedEventHandler.handle(digitalTextTitleTranslated);

            const updatedView = (await testQueryRepository.fetchById(
                digitalTextId
            )) as DigitalTextViewModel;

            expect(updatedView.name.has(translationLanguageCode)).toBe(true);
        });
    });
});
