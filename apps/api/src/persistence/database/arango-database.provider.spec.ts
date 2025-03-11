import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/environment';
import { PersistenceModule } from '../persistence.module';
import generateDatabaseNameForTestSuite from '../repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoDatabaseProvider } from './database.provider';

describe(`ArangoDatabaseProvider`, () => {
    describe(`clearViews`, () => {
        describe(`when the environment is not a test environment`, () => {
            let app: INestApplication;

            const setItUp = async (environment: Environment) => {
                const testModuleRef = await Test.createTestingModule({
                    imports: [PersistenceModule.forRootAsync()],
                    providers: [ConfigService],
                })
                    .overrideProvider(ConfigService)
                    .useValue(
                        buildMockConfigService(
                            {
                                NODE_ENV: environment,
                                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                            },
                            buildConfigFilePath(Environment.test)
                        )
                    )
                    .compile();

                app = testModuleRef.createNestApplication();

                await app.init();
            };

            describe(`production`, () => {
                beforeAll(async () => {
                    await setItUp(Environment.production);
                });

                it(`should throw`, async () => {
                    const tryIt = async () => {
                        await app.get(ArangoDatabaseProvider).clearViews();
                    };

                    expect(tryIt()).rejects;
                });
            });

            describe(`staging`, () => {
                beforeAll(async () => {
                    await setItUp(Environment.staging);
                });

                it(`should throw`, async () => {
                    const tryIt = async () => {
                        await app.get(ArangoDatabaseProvider).clearViews();
                    };

                    expect(tryIt()).rejects;
                });
            });
        });

        describe(`when the environment is test`, () => {
            /**
             * This isn't that important given that we use the happy path
             * in every test. We don't need to test our tests...
             */
            it.todo(`should clear the views`);
        });
    });
});
