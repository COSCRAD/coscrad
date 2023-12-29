import { lookup } from 'dns';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { BookBibliographicCitation } from '../book-bibliographic-citation/entities/book-bibliographic-citation.entity';
import { CourtCaseBibliographicCitation } from '../court-case-bibliographic-citation/entities/court-case-bibliographic-citation.entity';
import { IBibliographicCitation } from '../interfaces/bibliographic-citation.interface';
import { JournalArticleBibliographicCitation } from '../journal-article-bibliographic-citation/entities/journal-article-bibliographic-citation.entity';
import { BibliographicCitationType } from '../types/bibliographic-citation-type';

// TODO remove this in favor of dynamic annotation
const bibliographicCitationTypeToCtor: {
    [K in BibliographicCitationType]: DomainModelCtor<IBibliographicCitation>;
} = {
    [BibliographicCitationType.book]: BookBibliographicCitation,
    [BibliographicCitationType.courtCase]: CourtCaseBibliographicCitation,
    [BibliographicCitationType.journalArticle]: JournalArticleBibliographicCitation,
};

export const getBibliographicCitationCtorFromSubtype = (
    subtype: BibliographicCitationType
): DomainModelCtor<IBibliographicCitation> => {
    const lookupResult = bibliographicCitationTypeToCtor[subtype];

    if (isNullOrUndefined(lookup))
        throw new InternalError(
            `Failed to find a constructor for bibliographic reference subtype: ${subtype}`
        );

    return lookupResult;
};
