import { ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../lib/errors/InternalError';
import InvalidCommandPayloadTypeError from '../../../models/shared/common-command-errors/InvalidCommandPayloadTypeError';
import { CommandAssertionDependencies } from './types/CommandAssertionDependencies';
import { InvalidFSAFactoryFunction } from './types/InvalidFSAFactoryFunction';

export const assertCommandPayloadTypeError = (result: unknown, propertyKey: string) => {
    expect(result).toBeInstanceOf(InternalError);

    const error = result as InternalError;

    expect(error).toBeInstanceOf(InvalidCommandPayloadTypeError);

    expect(error.toString().includes(propertyKey)).toBe(true);
};

export const assertCommandFailsDueToTypeError = async (
    { idManager, commandHandlerService }: CommandAssertionDependencies,
    propertyName: string,
    invalidValue: unknown,
    buildInvalidFSA: InvalidFSAFactoryFunction<ICommand>
) => {
    const validId = await idManager.generate();

    const result = await commandHandlerService.execute(
        buildInvalidFSA(validId, {
            [propertyName]: invalidValue,
        })
    );

    assertCommandPayloadTypeError(result, propertyName);
};
