import { InternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import BaseDomainModel from '../../../models/BaseDomainModel';
import BookBibliographicReferenceData from '../../../models/bibliographic-reference/book-bibliographic-reference/entities/book-bibliographic-reference-data.entity';
import { CourtCaseBibliographicReferenceData } from '../../../models/bibliographic-reference/court-case-bibliographic-reference/entities/court-case-bibliographic-reference-data.entity';
import { IBibliographicReferenceData } from '../../../models/bibliographic-reference/interfaces/bibliographic-reference-data.interface';
import JournalArticleBibliographicReferenceData from '../../../models/bibliographic-reference/journal-article-bibliographic-reference/entities/journal-article-bibliographic-reference-data.entity';
import { BibliographicReferenceType } from '../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';

const bibliographicReferenceTypeToDataClass: {
    [K in BibliographicReferenceType]: DomainModelCtor<
        IBibliographicReferenceData & BaseDomainModel
    >;
} = {
    [BibliographicReferenceType.book]: BookBibliographicReferenceData,
    [BibliographicReferenceType.courtCase]: CourtCaseBibliographicReferenceData,
    [BibliographicReferenceType.journalArticle]: JournalArticleBibliographicReferenceData,
};

export const getDataCtorFromBibliographicReferenceType = (
    bibliographicReferenceType: BibliographicReferenceType
) => {
    const lookupResult = bibliographicReferenceTypeToDataClass[bibliographicReferenceType];

    if (isNullOrUndefined(lookupResult))
        throw new InternalError(
            `Failed to find a data constructor for bibliographic reference type: ${bibliographicReferenceType}`
        );

    return lookupResult;
};
