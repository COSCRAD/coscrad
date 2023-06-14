import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../types/ResourceType';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { GeneralContext } from '../../general-context/general-context.entity';

const commandType = `CONNECT_RESOURCES_WITH_NOTE`;

const buildValidPayload = (id: AggregateId) => ({
    aggregateCompositeIdentifier: {
        type: AggregateType.note,
        id,
    },
    toMemberCompositeIdentifier: {
        type: ResourceType.term,
        id: buildDummyUuid(1),
    },
    toMemberContext: new GeneralContext(),
    fromMemberCompositeIdentifier: {
        type: ResourceType.book,
        id: buildDummyUuid(2),
    },
    fromMemberContext: new GeneralContext(),
});

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
        it(`should succeed with the expected database updates`, async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                buildValidCommandFSA: (id) => ({
                    type: commandType,
                    payload: buildValidPayload(id),
                }),
                initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                systemUserId: dummySystemUserId,
            });
        });
    });
});
