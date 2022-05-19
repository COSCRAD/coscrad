import { InternalError } from '../../../lib/errors/InternalError';
import { BookBibliographicReference } from '../../models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { IBibliographicReference } from '../../models/bibliographic-reference/interfaces/IBibliographicReference';
import { isBibliographicReferenceType } from '../../models/bibliographic-reference/types/BibliographicReferenceType';
import { resourceTypes } from '../../types/resourceTypes';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import InvalidEntityDTOError from '../errors/InvalidEntityDTOError';
import { DomainModelValidator } from '../types/DomainModelValidator';
import validateSimpleInvariants from '../utilities/validateSimpleInvariants';
import { Valid } from '../Valid';

const buildTopLevelError = (innerErrors: InternalError[]): InternalError =>
    new InvalidEntityDTOError(resourceTypes.bibliographicReference, undefined, innerErrors);

const bibliographicReferenceValidator: DomainModelValidator = (
    dto: unknown
): Valid | InternalError => {
    if (isNullOrUndefined(dto)) return new InvalidEntityDTOError(resourceTypes.bibliographicReference);

    const allErrors: InternalError[] = [];

    const { data } = dto as IBibliographicReference;

    allErrors.push(...validateSimpleInvariants(BookBibliographicReference, dto));

    if (!isBibliographicReferenceType(data?.type)) allErrors.push(new InternalError('Boo!'));

    if (allErrors.length > 0) return buildTopLevelError([]);

    return Valid;
};

export default bibliographicReferenceValidator;
