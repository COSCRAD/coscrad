import { InternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import BaseDomainModel from '../../../models/BaseDomainModel';
import BookBibliographicCitationData from '../../../models/bibliographic-citation/book-bibliographic-citation/entities/book-bibliographic-citation-data.entity';
import { CourtCaseBibliographicCitationData } from '../../../models/bibliographic-citation/court-case-bibliographic-citation/entities/court-case-bibliographic-citation-data.entity';
import { IBibliographicCitationData } from '../../../models/bibliographic-citation/interfaces/bibliographic-citation-data.interface';
import JournalArticleBibliographicCitationData from '../../../models/bibliographic-citation/journal-article-bibliographic-citation/entities/journal-article-bibliographic-citation-data.entity';
import { BibliographicCitationType } from '../../../models/bibliographic-citation/types/bibliogrpahic-citation-type';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';

const BibliographicCitationTypeToDataClass: {
    [K in BibliographicCitationType]: DomainModelCtor<IBibliographicCitationData & BaseDomainModel>;
} = {
    [BibliographicCitationType.book]: BookBibliographicCitationData,
    [BibliographicCitationType.courtCase]: CourtCaseBibliographicCitationData,
    [BibliographicCitationType.journalArticle]: JournalArticleBibliographicCitationData,
};

export const getDataCtorFromBibliographicCitationType = (
    BibliographicCitationType: BibliographicCitationType
) => {
    const lookupResult = BibliographicCitationTypeToDataClass[BibliographicCitationType];

    if (isNullOrUndefined(lookupResult))
        throw new InternalError(
            `Failed to find a data constructor for bibliographic reference type: ${BibliographicCitationType}`
        );

    return lookupResult;
};
