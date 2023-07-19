import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { CreatePoint } from './create-point.command';

const commandType = `POINT_CREATED`;

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<CreatePoint>;

const commandFsaFactory = new DummyCommandFsaFactory((id) =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: { aggregateCompositeIdentifier: { id } },
    })
);

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates to the database`, async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                buildValidCommandFSA: (id: AggregateType) => commandFsaFactory.build(id),
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when there is already another spatial feature with the given name`, () => {
            it.todo(`should have a test`);
        });

        describe(`when the ID was not generated with our system`, () => {
            it.todo(`should have a test`);
        });

        describe(`when the command payload type is invalid`, () => {
            it.todo(`should have a test`);
        });
    });
});
