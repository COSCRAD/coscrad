import { CommandFSA } from '../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { InMemorySnapshot } from '../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';
import { CommandAssertionDependencies } from '../command-helpers/types/CommandAssertionDependencies';

interface BaseTestCase {
    buildCommandFSA: () => CommandFSA;
    systemUserId: AggregateId;
    checkError?: (error: InternalError) => void;
}

type AssertionDependencies = Omit<CommandAssertionDependencies, 'idManager'>;

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
export async function assertCommandError(
    dependencies: AssertionDependencies,
    testCase: TestCaseV2
): Promise<void>;

/**
 * @deprecated Use `seedInitialState` instead of `initialState`
 */
export async function assertCommandError(
    dependencies: AssertionDependencies,
    testCase: StateBasedTestCase
): Promise<void>;

export async function assertCommandError(
    dependencies: AssertionDependencies,
    testCase: StateBasedTestCase | TestCaseV2
): Promise<void> {
    const { testRepositoryProvider, commandHandlerService } = dependencies;

    const { buildCommandFSA: buildCommandFSA, checkError, systemUserId } = testCase;

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
    expect(result).toBeInstanceOf(InternalError);

    if (!isInternalError(result)) {
        throw new InternalError(`Expected the result of command execution to be an Internal Error`);
    }

    if (checkError) checkError(result);
}
