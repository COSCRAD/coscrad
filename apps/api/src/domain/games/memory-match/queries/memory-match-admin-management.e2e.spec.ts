import { HttpStatusCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { MemoryMatchModule } from '../memory-match.module';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchRoundCreationDto } from '../models/dtos/memory-match-round-creation.dto';

const endpointUnderTest = '/games/memory-match';

const testMediaItemId = buildDummyUuid(123);

const validCreationDto = buildTestInstance(MemoryMatchRoundCreationDto, {
    cardBackImageId: testMediaItemId,
});

describe(`when using the REST API to create a memory match round`, () => {
    let app: INestApplication;

    let memoryMatchRepository: IMemoryMatchRepository;

    describe(`when the user is a COSCRAD admin`, () => {
        beforeAll(async () => {
            const testModule = await Test.createTestingModule({
                imports: [
                    ConfigModule.forRoot({
                        isGlobal: true,
                        envFilePath: buildConfigFilePath(Environment.test),
                        cache: false,
                    }),
                    PersistenceModule.forRootAsync(),
                    MemoryMatchModule,
                ],
            })
                // TODO inject admin user on request scope
                .overrideProvider(ConfigService)
                .useValue(
                    buildMockConfigService({
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                        // is this necessary?
                        BASE_URL: 'http://localhost',
                        NODE_PORT: 1234,
                        GLOBAL_PREFIX: 'awesome-api',
                    })
                )
                .compile();

            app = testModule.createNestApplication();

            memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);

            await app.init();
        });

        describe(`when creating a memory match round`, () => {
            describe(`when the memory round is valid`, () => {
                it(`should create the round`, async () => {
                    const res = await request(app.getHttpServer())
                        .post(endpointUnderTest)
                        .send(validCreationDto);

                    expect(res.status).toBe(HttpStatusCode.createdResource);

                    const { id } = res.body;

                    // TODO test like this once we support privileged admin queries
                    // const updatedMemoryRound = (
                    //     await request(app.getHttpServer()).get(`${endpointUnderTest}/${id}`)
                    // ).body;

                    const updatedMemoryRound = memoryMatchRepository.fetchById(id);

                    expect(updatedMemoryRound).not.toBe(NotFound);
                });
            });

            describe(`when the memory round is valid`, () => {
                describe(`when there is already a memory round with the same name`, () => {
                    it.todo(`should fail with the expected error`);
                });

                describe(`when the memory match round is ill-formed`, () => {
                    describe(`when the name is an empty string`, () => {
                        it(`should return the expected error`, async () => {
                            const invalidDto = buildTestInstance(MemoryMatchRoundCreationDto, {
                                name: '',
                            });

                            const res = await request(app.getHttpServer())
                                .post(endpointUnderTest)
                                .send(invalidDto);

                            expect(res.status).toBe(HttpStatusCode.badRequest);

                            const { message } = res.body;

                            // TODO make the error messages more human readable
                            expect(message).toContain('Property name has failed');
                        });
                    });

                    describe(`fuzz test`, () => {
                        it.todo(`should have a test`);
                    });
                });
            });
        });
    });
});
