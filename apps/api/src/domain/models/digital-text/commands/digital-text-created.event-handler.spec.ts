import { LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DigitalTextViewModel } from '../../../../queries/digital-text';
import { buildTestInstance } from '../../../../test-data/utilities';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { ArangoDigitalTextQueryRepository } from '../queries/arango-digital-text-query-repository';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../queries/digital-text-query-repository.interface';
import { DigitalTextCreated } from './digital-text-created.event';
import { DigitalTextCreatedEventHandler } from './digital-text-created.event-handler';

const digitalTextTitle = 'title of the text';

const languageCodeForTitle = LanguageCode.Chilcotin;

const digitalTextId = buildDummyUuid(12);

const digitalTextCreatedEvent = buildTestInstance(DigitalTextCreated, {
    payload: {
        title: digitalTextTitle,
        languageCodeForTitle: languageCodeForTitle,
        aggregateCompositeIdentifier: {
            id: digitalTextId,
        },
    },
});

describe(`DigitalTextCreatedEventHandler`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
            ],
            providers: [
                {
                    provide: DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
                    useFactory: (connectionProvider: ArangoConnectionProvider) => {
                        return new ArangoDigitalTextQueryRepository(connectionProvider);
                    },
                    inject: [ArangoConnectionProvider],
                },
                DigitalTextCreatedEventHandler,
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

        databaseProvider = app.get(ArangoDatabaseProvider);

        testQueryRepository = app.get(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    describe(`when handling a DIGITAL_TEXT_CREATED event`, () => {
        it(`should create the expected view in the database`, async () => {
            const handler = app.get(DigitalTextCreatedEventHandler);

            await handler.handle(digitalTextCreatedEvent);

            const searchResult = await testQueryRepository.fetchById(digitalTextId);

            expect(searchResult).not.toBe(NotFound);

            const {
                title,
                name,
                tags,
                notes,
                connections,
                pages,
                contributions,
                isPublished,
                accessControlList,
            } = searchResult as DigitalTextViewModel;

            expect(title.toDTO()).toEqual(name.toDTO());

            const { languageCode: foundLanguageCode, text: foundText } =
                title.getOriginalTextItem();

            expect(foundLanguageCode).toBe(languageCodeForTitle);

            expect(foundText).toBe(digitalTextTitle);

            expect(tags).toEqual([]);

            expect(notes).toEqual([]);

            expect(connections).toEqual([]);

            expect(pages).toEqual([]);

            expect(contributions).toEqual([]);

            expect(isPublished).toBe(false);

            expect(accessControlList.toDTO()).toEqual(
                new AccessControlList().allowUser(digitalTextCreatedEvent.meta.userId).toDTO()
            );
        });
    });
});
