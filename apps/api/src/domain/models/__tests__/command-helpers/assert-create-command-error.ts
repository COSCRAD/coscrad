import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';
import { InMemorySnapshot } from '../../../types/ResourceType';
import { CommandAssertionDependencies } from './types/CommandAssertionDependencies';
import { FSAFactoryFunction } from './types/FSAFactoryFunction';

type TestCase = {
    buildCommandFSA: FSAFactoryFunction;
    initialState: InMemorySnapshot;
    systemUserId: AggregateId;
    checkError?: (error: InternalError, id?: AggregateId) => void;
};

export const assertCreateCommandError = async (
    dependencies: CommandAssertionDependencies,
    { buildCommandFSA: buildCommandFSA, initialState: state, checkError, systemUserId }: TestCase
) => {
    const { testRepositoryProvider, commandHandlerService, idManager } = dependencies;

    // Arrange
    await testRepositoryProvider.addFullSnapshot(state);

    const newId = await idManager.generate();

    const commandFSA = await buildCommandFSA(newId);

    // Act
    const result = await commandHandlerService.execute(commandFSA, { userId: systemUserId });

    // Assert
    expect(result).toBeInstanceOf(InternalError);

    if (!isInternalError(result)) {
        throw new InternalError(`Expected the result of command execution to be an Internal Error`);
    }

    if (checkError) checkError(result, newId);
};
