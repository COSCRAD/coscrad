import { ICommand } from '@coscrad/commands';
import { buildSimpleValidationFunction } from '@coscrad/validation';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Valid } from '../../../../domainModelValidators/Valid';
import InvalidCommandPayloadTypeError from '../../common-command-errors/InvalidCommandPayloadTypeError';

export default (command: ICommand, commandType: string): Valid | InternalError => {
    /**
     * TODO [https://www.pivotaltracker.com/story/show/182840154]
     * Remove this hack that has to do with the 'whitelist' failing for
     * `CompositeIdentifier` payload prop.
     */
    const forbidUnknownValues = commandType === 'GRANT_RESOURCE_READ_ACCESS_TO_USER' ? false : true;

    // Validate command type
    const payloadTypeErrors = buildSimpleValidationFunction(
        Object.getPrototypeOf(command).constructor,
        { forbidUnknownValues }
    )(command).map(
        (simpleError) => new InternalError(`invalid payload type: ${simpleError.toString()}`)
    );

    if (payloadTypeErrors.length > 0) {
        // TODO PAss through the command type
        return new InvalidCommandPayloadTypeError(commandType, payloadTypeErrors);
    }

    return Valid;
};
