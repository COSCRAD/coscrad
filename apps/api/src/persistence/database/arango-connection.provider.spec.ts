import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/Environment';
import { PersistenceModule } from '../persistence.module';
import { ArangoConnectionProvider } from './arango-connection.provider';

/**
 * This is just a smoke test to make sure we can compile the module and get
 * an instance of the `RepositoryProvider` (i.e. that the dependency will be
 * available when requested elsewhere). It's mostly helpful for troubleshooting
 * the initial work of setting up the modules.
 */
describe('Arango Connection Provider', () => {
    let arangoConnectionProvider: ArangoConnectionProvider;

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
        }).compile();

        arangoConnectionProvider =
            moduleRef.get<ArangoConnectionProvider>(ArangoConnectionProvider);
    });

    describe('the constructor', () => {
        it('should be truthy', () => {
            expect(arangoConnectionProvider).toBeTruthy();
        });
    });
});
