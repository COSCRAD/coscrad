import { InternalError } from '../../../../lib/errors/InternalError';
import InvalidCommandPayloadTypeError from '../../../models/shared/common-command-errors/InvalidCommandPayloadTypeError';

export const assertCommandPayloadTypeError = (result: unknown, propertyKey: string) => {
    expect(result).toBeInstanceOf(InternalError);

    const error = result as InternalError;

    expect(error).toBeInstanceOf(InvalidCommandPayloadTypeError);

    expect(error.toString().includes(propertyKey)).toBe(true);
};
