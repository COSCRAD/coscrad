import { Ack, ICommand } from '@coscrad/commands';
import { InMemorySnapshot } from '../../../../domain/types/ResourceType';
import { AggregateId } from '../../../types/AggregateId';
import { CommandAssertionDependencies } from '../command-helpers/types/CommandAssertionDependencies';
import { FSAFactoryFunction } from '../command-helpers/types/FSAFactoryFunction';

interface BaseTestCase {
    buildValidCommandFSA: FSAFactoryFunction;

    systemUserId: AggregateId;
    /**
     * This allows us to run additional checks after the command succeeds. E.g.
     * we may want to check that the instance was persisted or that a newly used
     * ID is marked as such.
     */
    checkStateOnSuccess?: (command: ICommand) => Promise<void>;
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
 * @deprecated Use `seedInitialState` instead of `initialState`
 */
export async function assertCreateCommandSuccess(
    dependencies: CommandAssertionDependencies,
    testCase: StateBasedTestCase
): Promise<void>;

export async function assertCreateCommandSuccess(
    dependencies: CommandAssertionDependencies,
    testCase: TestCaseV2
): Promise<void>;

export async function assertCreateCommandSuccess(
    dependencies: CommandAssertionDependencies,
    testCase: StateBasedTestCase | TestCaseV2
): Promise<void> {
    const { buildValidCommandFSA: buildCommandFSA, checkStateOnSuccess, systemUserId } = testCase;

    const { testRepositoryProvider, commandHandlerService, idManager } = dependencies;

    const resolvedSeedInitialState = isTestCaseV2(testCase)
        ? testCase.seedInitialState
        : async () => {
              await testRepositoryProvider.addFullSnapshot(testCase.initialState);
          };

    // Arrange
    await resolvedSeedInitialState();

    const newId = await idManager.generate();

    const commandFSA = buildCommandFSA(newId);

    // Act
    const result = await commandHandlerService.execute(commandFSA, { userId: systemUserId });

    // Assert
    expect(result).toBe(Ack);

    if (checkStateOnSuccess) await checkStateOnSuccess(commandFSA.payload);
}
