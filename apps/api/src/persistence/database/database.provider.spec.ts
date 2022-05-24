import { ConfigService } from '@nestjs/config';
import createTestModule from '../../app/controllers/__tests__/createTestModule';
import generateRandomTestDatabaseName from '../repositories/__tests__/generateRandomTestDatabaseName';
import { ArangoConnectionProvider } from './arango-connection.provider';
import { ArangoDatabase } from './arango-database';
import { DatabaseProvider } from './database.provider';

// TODO unskip!
describe('Database Provider', () => {
    let databaseProvider: DatabaseProvider;
    let configService: ConfigService;
    const testDatabaseName = generateRandomTestDatabaseName();

    beforeAll(async () => {
        const moduleRef = await createTestModule({
            ARANGO_DB_NAME: testDatabaseName,
        });

        configService = moduleRef.get<ConfigService>(ConfigService);
        if (!configService) throw new Error('Config service not injected.');

        const arangoConnectionProvider =
            moduleRef.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        if (!arangoConnectionProvider) throw new Error('Connection provider not injected');

        databaseProvider = new DatabaseProvider(arangoConnectionProvider);
        if (!databaseProvider) throw new Error('Connection provider not injected');
    });

    describe('get database instance', () => {
        describe('the returned instance', () => {
            let arangoInstance;

            beforeAll(async () => {
                arangoInstance = await databaseProvider.getDBInstance();
            });

            it('should not be null or undefined', () => {
                expect(arangoInstance).toBeTruthy();
            });

            it('should be an instance of ArangoDatabase', () => {
                expect(arangoInstance).toBeInstanceOf(ArangoDatabase);
            });
        });
    });
});
