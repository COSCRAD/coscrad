import { Ack, ICommand } from '@coscrad/commands';
import { InMemorySnapshot } from '../../../../domain/types/ResourceType';
import { CommandAssertionDependencies } from '../command-helpers/types/CommandAssertionDependencies';
import { FSAFactoryFunction } from '../command-helpers/types/FSAFactoryFunction';

type TestCase = {
    buildValidCommandFSA: FSAFactoryFunction;
    initialState: InMemorySnapshot;
    /**
     * This allows us to run additional checks after the command succeeds. E.g.
     * we may want to check that the instance was persisted or that a newly used
     * ID is marked as such.
     */
    checkStateOnSuccess?: (command: ICommand) => Promise<void>;
};

export const assertCreateCommandSuccess = async (
    dependencies: CommandAssertionDependencies,
    { buildValidCommandFSA: buildCommandFSA, initialState: state, checkStateOnSuccess }: TestCase
) => {
    const { testRepositoryProvider, commandHandlerService, idManager } = dependencies;

    // Arrange
    await testRepositoryProvider.addFullSnapshot(state);

    const newId = await idManager.generate();

    const commandFSA = buildCommandFSA(newId);

    // Act
    const result = await commandHandlerService.execute(commandFSA);

    // Assert
    expect(result).toBe(Ack);

    if (checkStateOnSuccess) await checkStateOnSuccess(commandFSA.payload);
};
