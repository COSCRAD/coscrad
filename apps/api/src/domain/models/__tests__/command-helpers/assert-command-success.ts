import { Ack, ICommand } from '@coscrad/commands';
import { CommandFSA } from '../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { InMemorySnapshot } from '../../../../domain/types/ResourceType';
import { CommandAssertionDependencies } from '../command-helpers/types/CommandAssertionDependencies';

type TestCase = {
    buildValidCommandFSA: () => CommandFSA;
    initialState: InMemorySnapshot;
    /**
     * This allows us to run additional checks after the command succeeds. E.g.
     * we may want to check that the instance was persisted or that a newly used
     * ID is marked as such.
     */
    checkStateOnSuccess?: (command: ICommand) => Promise<void>;
};

/**
 * This helper is not to be used with `CREATE_X` commands. Use `assertCreateCommandError`,
 * which allows for ID generation.
 */
export const assertCommandSuccess = async (
    dependencies: Omit<CommandAssertionDependencies, 'idManager'>,
    { buildValidCommandFSA: buildCommandFSA, initialState: state, checkStateOnSuccess }: TestCase
) => {
    const { testRepositoryProvider, commandHandlerService } = dependencies;

    // Arrange
    await testRepositoryProvider.addFullSnapshot(state);

    const commandFSA = buildCommandFSA();

    // Act
    const result = await commandHandlerService.execute(commandFSA);

    // Assert
    expect(result).toBe(Ack);

    if (checkStateOnSuccess) await checkStateOnSuccess(commandFSA.payload);
};
