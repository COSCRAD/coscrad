import { InternalError } from '../../../../lib/errors/InternalError';
import { BookBibliographicReference } from '../../../models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../../models/bibliographic-reference/types/BibliographicReferenceType';

const bibliographicReferenceTypeToModel = {
    [BibliographicReferenceType.book]: BookBibliographicReference,
};

export default (bibliographicReferenceType: BibliographicReferenceType) => {
    const ctor = bibliographicReferenceTypeToModel[bibliographicReferenceType];

    if (!ctor) {
        throw new InternalError(
            `No constructor registered for bibliographic reference model of type: ${bibliographicReferenceType}`
        );
    }

    return ctor;
};
