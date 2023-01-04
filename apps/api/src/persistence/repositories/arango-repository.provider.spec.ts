import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/Environment';
import { REPOSITORY_PROVIDER } from '../constants/persistenceConstants';
import { PersistenceModule } from '../persistence.module';
import { ArangoRepositoryProvider } from './arango-repository.provider';

/**
 * This is just a smoke test to make sure we can compile the module and get
 * an instance of the `RepositoryProvider` (i.e. that the dependency will be
 * available when requested elsewhere). It's mostly helpful for troubleshooting
 * the initial work of setting up the modules.
 */
describe('ArangoRepositoryProvider', () => {
    let repositoryProvider;

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

        repositoryProvider = moduleRef.get<ArangoRepositoryProvider>(REPOSITORY_PROVIDER);
    });

    describe('the constructor', () => {
        it('should be truthy', () => {
            expect(repositoryProvider).toBeTruthy();
        });
    });
});
