import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { FreeMultilineContext } from '../../models/context/free-multiline-context/free-multiline-context.entity';
import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import InvalidEdgeConnectionContextError from '../errors/context/InvalidEdgeConnectionContextError';
import InvalidLineInFreeMultilineError from '../errors/context/InvalidLineInFreeMultilineError';
import MissingLineContextError from '../errors/context/MissingLineContextError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import validateAllCoordinatesInLinearStructure from '../spatialFeatureValidator/geometricFeatureValidator/buildGeometricFeatureValidatorChain/utilities/validateAllCoordinatesInLinearStructure';
import { isValid, Valid } from '../Valid';

export const freeMultilineContextValidator = (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedEdgeConnectionContextDTOError(
            EdgeConnectionContextType.freeMultiline
        );

    const allErrors: InternalError[] = [];

    const { lines } = input as FreeMultilineContext;

    if (isNullOrUndefined(lines) || !Array.isArray(lines) || lines.length === 0)
        return new InvalidEdgeConnectionContextError(
            EdgeConnectionContextType.freeMultiline,
            allErrors.concat(new MissingLineContextError())
        );

    const lineErrors = lines.reduce((accumulatedErrors: InternalError[], line, index) => {
        const validationResult = validateAllCoordinatesInLinearStructure(line);

        if (isValid(validationResult)) return accumulatedErrors;

        return accumulatedErrors.concat(new InvalidLineInFreeMultilineError(index));
    }, []);

    if (lineErrors.length > 0) allErrors.push(...lineErrors);

    return allErrors.length > 0
        ? new InvalidEdgeConnectionContextError(EdgeConnectionContextType.freeMultiline, allErrors)
        : Valid;
};
