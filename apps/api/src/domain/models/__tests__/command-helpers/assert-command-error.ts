import { CommandFSA } from '../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { InMemorySnapshot } from '../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';
import { CommandAssertionDependencies } from '../command-helpers/types/CommandAssertionDependencies';

type TestCase = {
    buildCommandFSA: () => CommandFSA;
    initialState: InMemorySnapshot;
    systemUserId: AggregateId;
    checkError?: (error: InternalError) => void;
};

/**
 * This helper is not to be used with `CREATE_X` commands. Use `assertCreateCommandError`,
 * which allows for ID generation.
 */
export const assertCommandError = async (
    dependencies: Omit<CommandAssertionDependencies, 'idManager'>,
    { buildCommandFSA: buildCommandFSA, initialState: state, checkError, systemUserId }: TestCase
) => {
    const { testRepositoryProvider, commandHandlerService } = dependencies;

    // Arrange
    await testRepositoryProvider.addFullSnapshot(state);

    const commandFSA = buildCommandFSA();

    // Act
    const result = await commandHandlerService.execute(commandFSA, { userId: systemUserId });

    // Assert
    expect(result).toBeInstanceOf(InternalError);

    if (!isInternalError(result)) {
        throw new InternalError(`Expected the result of command execution to be an Internal Error`);
    }

    if (checkError) checkError(result);
};
