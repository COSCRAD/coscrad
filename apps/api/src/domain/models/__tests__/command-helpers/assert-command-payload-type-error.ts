import { FluxStandardAction, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../lib/errors/InternalError';
import InvalidCommandPayloadTypeError from '../../../models/shared/common-command-errors/InvalidCommandPayloadTypeError';
import { DummyCommandFsaFactory } from './dummy-command-fsa-factory';
import { CommandAssertionDependencies } from './types/CommandAssertionDependencies';

export const assertCommandPayloadTypeError = (result: unknown, propertyKey: string) => {
    expect(result).toBeInstanceOf(InternalError);

    const error = result as InternalError;

    expect(error).toBeInstanceOf(InvalidCommandPayloadTypeError);

    expect(error.toString().includes(propertyKey)).toBe(true);
};

type PropertyNameAndInvalidValue = {
    propertyName: string;
    invalidValue: unknown;
};

export const assertCommandFailsDueToTypeError = async (
    { idManager, commandHandlerService }: CommandAssertionDependencies,
    { propertyName, invalidValue }: PropertyNameAndInvalidValue,
    validCommandFSA: FluxStandardAction<ICommand>
) => {
    const dummyAdminUserId = 'adminb4d-3b7d-4bad-9bdd-2b0d7b3admin';

    const validId = await idManager.generate();

    const buildInvalidFSA = (id, payloadOverrides) =>
        new DummyCommandFsaFactory(() => validCommandFSA).build(id, payloadOverrides);

    const result = await commandHandlerService.execute(
        buildInvalidFSA(validId, {
            [propertyName]: invalidValue,
        }),
        {
            userId: dummyAdminUserId,
        }
    );

    assertCommandPayloadTypeError(result, propertyName);
};
