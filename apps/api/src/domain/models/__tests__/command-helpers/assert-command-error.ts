import { InMemorySnapshot } from '../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';
import { CommandAssertionDependencies } from '../command-helpers/types/CommandAssertionDependencies';
import { FSAFactoryFunction } from '../command-helpers/types/FSAFactoryFunction';

type TestCase = {
    buildCommandFSA: FSAFactoryFunction;
    initialState: InMemorySnapshot;
    checkError?: (error: InternalError, id?: AggregateId) => void;
};

export const assertCommandError = async (
    dependencies: CommandAssertionDependencies,
    { buildCommandFSA: buildCommandFSA, initialState: state, checkError }: TestCase
) => {
    const { testRepositoryProvider, commandHandlerService, idManager } = dependencies;

    // Arrange
    await testRepositoryProvider.addFullSnapshot(state);

    const newId = await idManager.generate();

    const commandFSA = await buildCommandFSA(newId);

    // Act
    const result = await commandHandlerService.execute(commandFSA);

    // Assert
    expect(result).toBeInstanceOf(InternalError);

    if (!isInternalError(result)) {
        throw new InternalError(`Expected the result of command execution to be an Internal Error`);
    }

    if (checkError) checkError(result, newId);
};
