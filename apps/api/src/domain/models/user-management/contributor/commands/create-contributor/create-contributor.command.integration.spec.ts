import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { IIdManager } from '../../../../../../domain/interfaces/id-manager.interface';
import { AggregateId } from '../../../../../../domain/types/AggregateId';
import buildEmptyInMemorySnapshot from '../../../../../../domain/utilities/buildEmptyInMemorySnapshot';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../../types/DTO';
import { assertCreateCommandError } from '../../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../../__tests__/command-helpers/assert-create-command-success';
import { DummyCommandFsaFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { buildFakeTimersConfig } from '../../../../__tests__/utilities/buildFakeTimersConfig';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { Month } from '../../../utilities';
import { CoscradContributor } from '../../entities/coscrad-contributor.entity';
import { CreateContributor } from './create-contributor.command';

const commandType = 'CREATE_CONTRIBUTOR';

const firstName = "the contributor's first name";

const lastName = "the contributor's last name";

const shortBio = "all about the contributor's life";

const dateOfBirth = '1949-05-12';

const expectedDay = 12;

const expectedMonth = Month.May;

const expectedYear = 1949;

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateContributor>> => ({
    type: commandType,

    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.contributor },
        firstName,
        lastName,
        shortBio,
        dateOfBirth,
    },
});

const initialState = buildEmptyInMemorySnapshot();

const fsaFactory = new DummyCommandFsaFactory<CreateContributor>(buildValidCommandFSA);

describe('CreateContributor', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                },
                { shouldMockIdGenerator: true }
            ));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };

        jest.useFakeTimers(buildFakeTimersConfig());
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    const seedValidInitialState = async () => {
        await testRepositoryProvider.addFullSnapshot(initialState);
    };

    describe(`when the command is valid`, () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                seedInitialState: seedValidInitialState,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreateContributor) => {
                    const contributorSearchResult = await testRepositoryProvider
                        .getContributorRepository()
                        .fetchById(id);

                    expect(contributorSearchResult).toBeInstanceOf(CoscradContributor);

                    const contributor = contributorSearchResult as CoscradContributor;

                    const fullName = contributor.fullName;

                    expect(fullName.firstName).toBe(firstName);

                    expect(fullName.lastName).toBe(lastName);

                    const foundDob = contributor.dateOfBirth;

                    expect(foundDob.day).toBe(expectedDay);

                    expect(foundDob.month).toBe(expectedMonth);

                    expect(foundDob.year).toBe(expectedYear);

                    expect(contributor.shortBio).toBe(shortBio);
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when neither short bio nor date of birth is provided', () => {
            it('should return the expected error', async () => {
                await assertCreateCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (id: AggregateId) =>
                        fsaFactory.build(id, {
                            shortBio: undefined,
                            dateOfBirth: undefined,
                        }),
                    seedInitialState: seedValidInitialState,
                });
            });
        });
    });
});
