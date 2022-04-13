import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { PageRangeContext } from '../../models/context/page-range-context/page-range.context.entity';
import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import DuplicatePageIdentifierError from '../errors/context/DuplicatePageIdentifierError';
import EmptyPageRangeError from '../errors/context/EmptyPageRangeError';
import InvalidEdgeConnectionContextError from '../errors/context/InvalidEdgeConnectionContextError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { Valid } from '../Valid';

type UniqueAndDuplicates<T> = {
    unique: T[];

    duplicates: T[];
};

/**
 * TODO: Generalize this and extract to a higher level.
 */
const buildEmptyUniqueAndDuplicatesInstance = <T>(): UniqueAndDuplicates<T> => ({
    unique: [],
    duplicates: [],
});

const findDuplicatesInArray = (input: string[]): string[] =>
    input.reduce(({ unique, duplicates }: UniqueAndDuplicates<string>, element) => {
        // Repeat duplicate- don't add to the list
        if (duplicates.includes(element))
            return {
                unique,
                duplicates,
            };

        // Newly identified duplicate- add to list
        if (unique.includes(element))
            return {
                unique,
                // TODO use deep clone if taking in non-primitive type of data
                duplicates: [...duplicates, element],
            };

        // the element is unique
        return {
            // TODO use deep clone if taking in non-primitive type of data
            unique: [...unique, element],
            duplicates,
        };
    }, buildEmptyUniqueAndDuplicatesInstance<string>()).duplicates;

export const pageRangeContextValidator = (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedEdgeConnectionContextDTOError(
            EdgeConnectionContextType.pageRange
        );

    const allErrors: InternalError[] = [];

    const { pages } = input as PageRangeContext;

    if (!Array.isArray(pages))
        allErrors.push(new InternalError(`Invalid type for pages property: ${typeof pages}`));

    if (pages.length === 0) allErrors.push(new EmptyPageRangeError());

    const duplicateIdentifiers = findDuplicatesInArray(pages);

    if (duplicateIdentifiers.length > 0)
        allErrors.push(new DuplicatePageIdentifierError(duplicateIdentifiers));

    return allErrors.length > 0
        ? new InvalidEdgeConnectionContextError(EdgeConnectionContextType.pageRange, allErrors)
        : Valid;
};
