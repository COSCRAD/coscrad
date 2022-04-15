import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { PageRangeContext } from '../../models/context/page-range-context/page-range.context.entity';
import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import findDuplicatesInStringArray from '../../utilities/validation/findDuplicatesInStringArray';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import DuplicatePageIdentifierError from '../errors/context/DuplicatePageIdentifierError';
import EmptyPageRangeError from '../errors/context/EmptyPageRangeError';
import InvalidEdgeConnectionContextError from '../errors/context/InvalidEdgeConnectionContextError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { Valid } from '../Valid';

export const pageRangeContextValidator = (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedEdgeConnectionContextDTOError(
            EdgeConnectionContextType.pageRange
        );

    const allErrors: InternalError[] = [];

    const { pageIdentifiers: pages } = input as PageRangeContext;

    if (!Array.isArray(pages))
        allErrors.push(new InternalError(`Invalid type for pages property: ${typeof pages}`));

    if (pages.length === 0) allErrors.push(new EmptyPageRangeError());

    const duplicateIdentifiers = findDuplicatesInStringArray(pages);

    if (duplicateIdentifiers.length > 0)
        allErrors.push(new DuplicatePageIdentifierError(duplicateIdentifiers));

    return allErrors.length > 0
        ? new InvalidEdgeConnectionContextError(EdgeConnectionContextType.pageRange, allErrors)
        : Valid;
};
