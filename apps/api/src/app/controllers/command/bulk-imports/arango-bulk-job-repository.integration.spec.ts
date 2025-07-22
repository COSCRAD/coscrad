import { ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildDummyUuid from '../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import buildMockConfigService from '../../../config/__tests__/utilities/buildMockConfigService';
import { CommandFSA } from '../command-fsa/command-fsa.entity';
import {
    ARANGO_BULK_JOB_COLLECTION_NAME,
    ArangoBulkJobRepository,
} from './arango-bulk-job-repository';
import { CoscradBulkImportJob } from './bulk-import-job.entity';
import { IBulkJobRepository } from './bulk-job-repository.interface';

const WIDGET_RESOURCE_TYPE = 'widget' as ResourceType;

describe(`ArangoBulkJobRepository`, () => {
    let app: INestApplication;

    let testRepo: IBulkJobRepository;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
            providers: [ArangoBulkJobRepository],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = module.createNestApplication();

        await app.init();

        testRepo = app.get(ArangoBulkJobRepository);
    });

    beforeEach(async () => {
        await new ArangoDatabase(app.get(ArangoConnectionProvider).getConnection()).deleteAll(
            ARANGO_BULK_JOB_COLLECTION_NAME
        );
    });

    afterAll(async () => {
        await app.close();

        //    TODO close db connection
    });

    describe(`fetchById`, () => {
        describe(`when there is a bulk job with the given ID`, () => {
            const testJob = buildTestInstance(CoscradBulkImportJob);

            beforeEach(async () => {
                await testRepo.create(testJob);
            });

            it(`should return the expected job`, async () => {
                const searchResult = await testRepo.fetchById(testJob.id);

                expect(searchResult).not.toBe(NotFound);

                const job = searchResult as CoscradBulkImportJob;

                expect(job).toBeInstanceOf(CoscradBulkImportJob);

                // TODO check the state of the created document
            });
        });

        describe(`when there is no bulk job with the given ID`, () => {
            it('should return not found', async () => {
                const searchResult = await testRepo.fetchById(buildDummyUuid(99));

                expect(searchResult).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        const testJobNumbers = [1, 2, 3];

        const testJobs = testJobNumbers.map((n) =>
            buildTestInstance(CoscradBulkImportJob, {
                id: buildDummyUuid(n),
                name: `test bulk job #${n}`,
            })
        );

        beforeEach(async () => {
            // TODO Use `createMany` once it has been implemented
            for (const testJob of testJobs) {
                await testRepo.create(testJob);
            }
        });

        it(`should return the expected bulk jobs`, async () => {
            const result = await testRepo.fetchMany();

            expect(result).toHaveLength(testJobs.length);

            const missingJobs = result.filter(
                ({ id, name }) =>
                    !testJobNumbers.some(
                        (n) => id.includes(n.toString()) && name.includes(n.toString())
                    )
            );

            expect(missingJobs).toEqual([]);
        });
    });

    describe(`append`, () => {
        describe(`when the with the given ID job exists`, () => {
            describe(`when there are no existing FSAs for this job`, () => {
                describe(`when the existing property is an empty array`, () => {
                    const existingJob = buildTestInstance(CoscradBulkImportJob, {
                        id: buildDummyUuid(1),
                        stream: [],
                    });

                    const additionalCommands: CommandFSA[] = [
                        {
                            type: 'WIDGET_CREATED',
                            payload: {
                                aggregateCompositeIdentifier: {
                                    type: WIDGET_RESOURCE_TYPE,
                                    id: buildDummyUuid(101),
                                },
                            },
                        },
                        {
                            type: 'WIDGET_TRANSPORTED',
                            payload: {
                                aggregateCompositeIdentifier: {
                                    type: WIDGET_RESOURCE_TYPE,
                                    id: buildDummyUuid(102),
                                },
                            },
                        },
                    ];

                    beforeEach(async () => {
                        await testRepo.create(existingJob);
                    });

                    it(`should update the job as expected`, async () => {
                        // TODO do we want this rest params API?
                        await testRepo.append(existingJob.id, ...additionalCommands);
                    });
                });

                describe(`when the existing property is null`, () => {
                    it.todo(`should have a test`);
                });
            });

            describe(`when there are existing FSAs for this job`, () => {
                it.todo(`should append additional FSAs`);
            });
        });

        describe(`when there is no job with the given ID`, () => {
            it.todo(`should return not found`);
        });
    });
});
