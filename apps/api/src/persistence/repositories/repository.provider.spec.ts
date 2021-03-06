import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/Environment';
import { PersistenceModule } from '../persistence.module';
import { RepositoryProvider } from './repository.provider';

/**
 * This is just a smoke test to make sure we can compile the module and get
 * an instance of the `RepositoryProvider` (i.e. that the dependency will be
 * available when requested elsewhere). It's mostly helpful for troubleshooting
 * the initial work of setting up the modules.
 */
describe('Repository Provider', () => {
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

        repositoryProvider = moduleRef.get<RepositoryProvider>(RepositoryProvider);
    });

    describe('the constructor', () => {
        it('should be truthy', () => {
            expect(repositoryProvider).toBeTruthy();
        });
    });
});
