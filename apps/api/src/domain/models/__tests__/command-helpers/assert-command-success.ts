import { Ack, ICommand } from '@coscrad/commands';
import { CommandFSA } from '../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { InMemorySnapshot } from '../../../../domain/types/ResourceType';
import { AggregateId } from '../../../types/AggregateId';
import { CommandAssertionDependencies } from '../command-helpers/types/CommandAssertionDependencies';

interface BaseTestCase {
    buildValidCommandFSA: () => CommandFSA;
    /**
     * This allows us to run additional checks after the command succeeds. E.g.
     * we may want to check that the instance was persisted or that a newly used
     * ID is marked as such.
     */
    checkStateOnSuccess?: (command: ICommand) => Promise<void>;

    systemUserId: AggregateId;
}

interface StateBasedTestCase extends BaseTestCase {
    initialState: InMemorySnapshot;
}

interface TestCaseV2 extends BaseTestCase {
    seedInitialState: () => Promise<void>;
}

const isTestCaseV2 = (input: StateBasedTestCase | TestCaseV2): input is TestCaseV2 =>
    typeof (input as TestCaseV2).seedInitialState === 'function';

/**
 * This helper is not to be used with `CREATE_X` commands. Use `assertCreateCommandError`,
 * which allows for ID generation.
 */
export const assertCommandSuccess = async (
    dependencies: Omit<CommandAssertionDependencies, 'idManager'>,
    testCase: StateBasedTestCase | TestCaseV2
) => {
    const { buildValidCommandFSA: buildCommandFSA, checkStateOnSuccess, systemUserId } = testCase;

    const { testRepositoryProvider, commandHandlerService } = dependencies;

    const resolvedSeedInitialState = isTestCaseV2(testCase)
        ? testCase.seedInitialState
        : async () => {
              await testRepositoryProvider.addFullSnapshot(testCase.initialState);
          };

    // Arrange
    await resolvedSeedInitialState();

    const commandFSA = buildCommandFSA();

    // Act
    const result = await commandHandlerService.execute(commandFSA, { userId: systemUserId });

    // Assert
    expect(result).toBe(Ack);

    if (checkStateOnSuccess) await checkStateOnSuccess(commandFSA.payload);
};
