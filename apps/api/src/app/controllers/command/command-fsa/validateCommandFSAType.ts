import { buildSimpleValidationFunction } from '@coscrad/validation';
import { Valid } from '../../../../domain/domainModelValidators/Valid';
import { isNullOrUndefined } from '../../../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../types/ResultOrError';
import { CommandFSA } from './command-fsa.entity';
import { InvalidCommandFluxStandardActionType } from './errors/InvalidCommandFluxStandardActionType';

const buildTopLevelError = (innerErrors: InternalError[]): InternalError =>
    new InvalidCommandFluxStandardActionType(innerErrors);

export default (input: unknown): ResultOrError<Valid> => {
    if (isNullOrUndefined(input))
        return buildTopLevelError([
            new InternalError(`Encountered a null or undefined Flux Standard Action`),
        ]);

    const allErrors: InternalError[] = buildSimpleValidationFunction(CommandFSA)(input).map(
        (simpleError) => new InternalError(simpleError.toString())
    );

    if (allErrors.length > 0) return buildTopLevelError(allErrors);

    return Valid;
};
