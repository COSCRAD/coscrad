import { ResourceType } from '@coscrad/api-interfaces';
import { Ack } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildDummyUuid from '../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../domain/models/__tests__/utilities/dummyDateNow';
import CommandExecutionError from '../../../../domain/models/shared/common-command-errors/CommandExecutionError';
import { InternalError } from '../../../../lib/errors/InternalError';
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
import { BulkCommandExecutionResult, CoscradBulkImportJob } from './bulk-import-job.entity';
import { IBulkJobRepository } from './bulk-job-repository.interface';

const WIDGET_RESOURCE_TYPE = 'widget' as ResourceType;

const existingCommands: Omit<CommandFSA, 'meta'>[] = [
    {
        type: 'WIDGET_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                type: WIDGET_RESOURCE_TYPE,
                id: buildDummyUuid(201),
            },
        },
    },
    {
        type: 'WIDGET_TRANSPORTED',
        payload: {
            aggregateCompositeIdentifier: {
                type: WIDGET_RESOURCE_TYPE,
                id: buildDummyUuid(202),
            },
        },
    },
];

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

        describe(`when the with the given ID job exists`, () => {
            describe(`when there are no existing FSAs for this job`, () => {
                describe(`when the existing property is an empty array`, () => {
                    const existingJob = buildTestInstance(CoscradBulkImportJob, {
                        id: buildDummyUuid(1),
                        stream: [],
                    });

                    beforeEach(async () => {
                        await testRepo.create(existingJob);
                    });

                    it(`should update the job as expected`, async () => {
                        // TODO do we want this rest params API?
                        await testRepo.append(existingJob.id, ...additionalCommands);

                        const updatedJob = (await testRepo.fetchById(
                            existingJob.id
                        )) as CoscradBulkImportJob;

                        expect(updatedJob.stream).toHaveLength(additionalCommands.length);
                    });
                });

                describe(`when the existing property is null`, () => {
                    const existingJob = buildTestInstance(CoscradBulkImportJob, {
                        id: buildDummyUuid(1),
                        stream: null,
                    });

                    beforeEach(async () => {
                        await testRepo.create(existingJob);
                    });

                    it(`should append additional FSAs`, async () => {
                        await testRepo.append(existingJob.id, ...additionalCommands);

                        const updatedJob = (await testRepo.fetchById(
                            existingJob.id
                        )) as CoscradBulkImportJob;

                        expect(updatedJob.stream).toHaveLength(additionalCommands.length);
                    });
                });
            });

            describe(`when there are existing FSAs for this job`, () => {
                const existingJob = buildTestInstance(CoscradBulkImportJob, {
                    id: buildDummyUuid(1),
                    stream: existingCommands,
                });

                beforeEach(async () => {
                    await testRepo.create(existingJob);
                });

                it(`should append additional FSAs`, async () => {
                    await testRepo.append(existingJob.id, ...additionalCommands);

                    const updatedJob = (await testRepo.fetchById(
                        existingJob.id
                    )) as CoscradBulkImportJob;

                    expect(updatedJob.stream).toHaveLength(
                        existingCommands.length + additionalCommands.length
                    );
                });
            });
        });

        describe(`when there is no job with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testRepo.append(buildDummyUuid(99), ...additionalCommands);

                expect((result as InternalError).toString().toLowerCase()).toContain(
                    'there is no bulk job with id: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b100099'
                );
            });
        });
    });

    describe(`registerResults`, () => {
        const dummyError = new CommandExecutionError([
            new InternalError(`You didn't ask politely!`),
        ]).toString();

        const results: BulkCommandExecutionResult[] = [
            {
                fsa: existingCommands[0],
                result: Ack,
            },
            {
                fsa: existingCommands[1],
                result: dummyError,
            },
        ];

        describe(`when there is a job with the given ID`, () => {
            describe(`when there are no existing results`, () => {
                const existingJob = buildTestInstance(CoscradBulkImportJob, {
                    id: buildDummyUuid(1),
                    results: null,
                    dateCreated: undefined,
                });

                beforeEach(async () => {
                    await testRepo.create(existingJob);
                });

                it(`should add the results for the given job`, async () => {
                    await testRepo.registerResults(existingJob.id, results, dummyDateNow);

                    const updatedDoc = (await testRepo.fetchById(
                        existingJob.id
                    )) as CoscradBulkImportJob;

                    expect(updatedDoc.results).toHaveLength(results.length);

                    expect(updatedDoc.results).toEqual(results);
                });
            });

            describe(`when there are already results`, () => {
                const existingJob = buildTestInstance(CoscradBulkImportJob, {
                    id: buildDummyUuid(1),
                    results,
                    dateCreated: undefined,
                });

                beforeEach(async () => {
                    await testRepo.create(existingJob);
                });

                // TODO Do we want to just keep appending? Should we prevent this at a higher level instead?
                it(`should not update the results`, async () => {
                    // we want to ensure that we add a different number of new results so our assertion makes sense below
                    await testRepo.registerResults(existingJob.id, [results[0]], dummyDateNow);

                    const updatedJob = (await testRepo.fetchById(
                        existingJob.id
                    )) as CoscradBulkImportJob;

                    expect(updatedJob.results).toHaveLength(existingJob.results.length);
                });
            });
        });

        describe(`when there is no job with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testRepo.registerResults(
                    buildDummyUuid(123),
                    results,
                    dummyDateNow
                );

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });
});
