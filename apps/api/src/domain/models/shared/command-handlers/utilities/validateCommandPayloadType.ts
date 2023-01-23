import { ICommand } from '@coscrad/commands';
import { getCoscradDataSchema, validateCoscradModelInstance } from '@coscrad/data-types';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Valid } from '../../../../domainModelValidators/Valid';
import InvalidCommandPayloadTypeError from '../../common-command-errors/InvalidCommandPayloadTypeError';

export default (command: ICommand, commandType: string): Valid | InternalError => {
    const commandCtor = Object.getPrototypeOf(command).constructor;

    // Validate command type
    const payloadTypeErrors = validateCoscradModelInstance(
        getCoscradDataSchema(commandCtor),
        command,
        { forbidUnknownValues: true }
    ).map((simpleError) => new InternalError(`invalid payload type: ${simpleError.toString()}`));

    if (payloadTypeErrors.length > 0) {
        // TODO PAss through the command type
        return new InvalidCommandPayloadTypeError(commandType, payloadTypeErrors);
    }

    return Valid;
};
