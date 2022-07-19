import { ICommand } from '@coscrad/commands';
import { buildSimpleValidationFunction } from '@coscrad/validation';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Valid } from '../../../../domainModelValidators/Valid';
import InvalidCommandPayloadTypeError from '../../common-command-errors/InvalidCommandPayloadTypeError';

export default (command: ICommand, commandType: string): Valid | InternalError => {
    // Validate command type
    const payloadTypeErrors = buildSimpleValidationFunction(
        Object.getPrototypeOf(command).constructor
    )(command).map(
        (simpleError) => new InternalError(`invalid payload type: ${simpleError.toString()}`)
    );

    if (payloadTypeErrors.length > 0) {
        // TODO PAss through the command type
        return new InvalidCommandPayloadTypeError(commandType, payloadTypeErrors);
    }

    return Valid;
};
