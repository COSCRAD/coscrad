import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';
import { InMemorySnapshot } from '../../../types/ResourceType';
import { CommandAssertionDependencies } from './types/CommandAssertionDependencies';
import { FSAFactoryFunction } from './types/FSAFactoryFunction';

interface BaseTestCase {
    buildCommandFSA: FSAFactoryFunction;
    systemUserId: AggregateId;
    checkError?: (error: InternalError, id?: AggregateId) => void;
}

interface StateBasedTestCase extends BaseTestCase {
    initialState: InMemorySnapshot;
}

/**
 * When we moved from using snapshots in the db to using
 * events as a source of truth, we needed a new way to
 * seed data from events (or else commands- which may fail).
 * We decided at that point to make the API of all command
 * assertion test helpers more robust by using full  inversion-of-control.
 * This version represents that transition.
 */
interface TestCaseV2 extends BaseTestCase {
    seedInitialState: () => Promise<void>;
}

const isTestCaseV2 = (input: StateBasedTestCase | TestCaseV2): input is TestCaseV2 =>
    typeof (input as TestCaseV2).seedInitialState === 'function';

/**
 * @deprecated use `seedInitialState: () => Promise<void>` instead
 */
export async function assertCreateCommandError(
    dependencies: CommandAssertionDependencies,
    testCase: StateBasedTestCase
): Promise<void>;

export async function assertCreateCommandError(
    dependencies: CommandAssertionDependencies,
    testCase: TestCaseV2
): Promise<void>;

export async function assertCreateCommandError(
    dependencies: CommandAssertionDependencies,
    testCase: StateBasedTestCase | TestCaseV2
) {
    const { buildCommandFSA: buildCommandFSA, checkError, systemUserId } = testCase;

    const resolvedSeedInitialState = isTestCaseV2(testCase)
        ? testCase.seedInitialState
        : async () => {
              await testRepositoryProvider.addFullSnapshot(testCase.initialState);
          };

    const { testRepositoryProvider, commandHandlerService, idManager } = dependencies;

    // Arrange
    await resolvedSeedInitialState();

    const newId = await idManager.generate();

    const commandFSA = buildCommandFSA(newId);

    // Act
    const result = await commandHandlerService.execute(commandFSA, { userId: systemUserId });

    // Assert
    expect(result).toBeInstanceOf(InternalError);

    if (!isInternalError(result)) {
        throw new InternalError(`Expected the result of command execution to be an Internal Error`);
    }

    if (checkError) checkError(result, newId);
}
