import { InternalError } from '../../../lib/errors/InternalError';
import BookBibliographicReferenceData from '../../models/bibliographic-reference/entities/BookBibliographicReferenceData';
import JournalArticleBibliographicReferenceData from '../../models/bibliographic-reference/entities/JournalArticleBibliographicReferenceData';
import { IBibliographicReference } from '../../models/bibliographic-reference/interfaces/IBibliographicReference';
import { BibliographicReferenceType } from '../../models/bibliographic-reference/types/BibliographicReferenceType';
import { EntityId } from '../../types/ResourceId';
import { resourceTypes } from '../../types/resourceTypes';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import InvalidEntityDTOError from '../errors/InvalidEntityDTOError';
import { DomainModelValidator } from '../types/DomainModelValidator';
import buildSimpleDiscriminatedUnionValidationFunction from '../utilities/buildSimpleDiscriminatedUnionValidationFunction';
import { Valid } from '../Valid';

const buildTopLevelError = (id: EntityId, innerErrors: InternalError[]): InternalError =>
    new InvalidEntityDTOError(resourceTypes.bibliographicReference, id, innerErrors);

const bibliographicReferenceValidator: DomainModelValidator = (
    dto: unknown
): Valid | InternalError => {
    if (isNullOrUndefined(dto))
        return new InvalidEntityDTOError(resourceTypes.bibliographicReference);

    const allErrors: InternalError[] = [];

    const { data, id } = dto as IBibliographicReference;

    const dataValidationFunction = buildSimpleDiscriminatedUnionValidationFunction([
        [BibliographicReferenceType.book, BookBibliographicReferenceData],
        [BibliographicReferenceType.journalArticle, JournalArticleBibliographicReferenceData],
    ]);

    allErrors.push(...dataValidationFunction(data));

    if (allErrors.length > 0) return buildTopLevelError(id, allErrors);

    return Valid;
};

export default bibliographicReferenceValidator;
