import { InternalError } from '../../../../lib/errors/InternalError';
import InvalidCommandPayloadTypeError from '../../../models/shared/common-command-errors/InvalidCommandPayloadTypeError';

export const assertCommandPayloadTypeError = (error: InternalError, propertyKey: string) => {
    expect(error).toBeInstanceOf(InvalidCommandPayloadTypeError);

    expect(error.toString().includes(propertyKey)).toBe(true);
};
