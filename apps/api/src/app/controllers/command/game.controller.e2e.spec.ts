import { HttpStatusCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildMockConfigService from '../../config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import { GameController } from './game.controller';

const endpointUnderTest = '/games';

const targetName = 'alphabet';

const dummyDocument = {
    _key: buildDummyUuid(44),
    name: targetName,
    data: {
        foo: 2,
        bar: {
            baz: 'I am test data. My structure is irrelevant to this test.',
        },
    },
};

describe(`/games`, () => {
    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const mockConfigService = buildMockConfigService(
            {
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            },
            buildConfigFilePath(Environment.test)
        );

        const testAppModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
            imports: [PersistenceModule.forRootAsync()],
            controllers: [GameController],
        })
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .compile();

        app = testAppModule.createNestApplication();

        await app.init();

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        process.env.NODE_ENV = 'e2e';
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('games').clear();

        await databaseProvider.getDatabaseForCollection('games').create(dummyDocument);
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when there is a document with the given name`, () => {
        it('should return a 200', async () => {
            const res = await request(app.getHttpServer()).get(
                `${endpointUnderTest}/${targetName}`
            );

            expect(res.statusCode).toBe(HttpStatusCode.ok);
        });
    });

    describe(`when there is no document with the given name`, () => {
        const bogusName = 'foobarbaz';

        it(`should return a 404`, async () => {
            const res = await request(app.getHttpServer()).get(`${endpointUnderTest}/${bogusName}`);

            expect(res.statusCode).toBe(HttpStatusCode.notFound);
        });
    });
});
