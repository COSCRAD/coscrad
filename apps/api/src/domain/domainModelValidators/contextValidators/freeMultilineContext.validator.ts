import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import { FreeMultilineContext } from '../../models/context/free-multiline-context/free-multiline-context.entity';
import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import NullOrUndefinedEdgeConnectionContextDTOError from '../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { Valid } from '../Valid';

export const freeMultilineContextValidator = (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedEdgeConnectionContextDTOError(
            EdgeConnectionContextType.freeMultiline
        );

    return new FreeMultilineContext(input as DTO<FreeMultilineContext>).validateInvariants();

    // const allErrors: InternalError[] = [];

    // const { lines } = input as FreeMultilineContext;

    // if (isNullOrUndefined(lines) || lines.length === 0)
    //     return new InvalidEdgeConnectionContextError(
    //         EdgeConnectionContextType.freeMultiline,
    //         allErrors.concat(new MissingLineContextError())
    //     );

    // // It is important that this comes after the null-check
    // if (!Array.isArray(lines))
    //     return new InvalidEdgeConnectionContextError(
    //         EdgeConnectionContextType.freeMultiline,
    //         allErrors.concat(new InvalidLineTypeError(lines))
    //     );

    // const lineErrors = lines.reduce((accumulatedErrors: InternalError[], line, index) => {
    //     const validationResult = validateAllCoordinatesInLinearStructure(line);

    //     if (validationResult.length === 0) return accumulatedErrors;

    //     return accumulatedErrors.concat(new InvalidLineInFreeMultilineError(index));
    // }, []);

    // if (lineErrors.length > 0) allErrors.push(...lineErrors);

    // return allErrors.length > 0
    //     ? new InvalidEdgeConnectionContextError(EdgeConnectionContextType.freeMultiline, allErrors)
    //     : Valid;
};
