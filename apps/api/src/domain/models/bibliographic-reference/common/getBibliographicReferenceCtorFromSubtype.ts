import { lookup } from 'dns';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { BookBibliographicReference } from '../book-bibliographic-reference/entities/book-bibliographic-reference.entity';
import { CourtCaseBibliographicReference } from '../court-case-bibliographic-reference/court-case-bibliographic-reference.entity';
import { IBibliographicReference } from '../interfaces/bibliographic-reference.interface';
import { JournalArticleBibliographicReference } from '../journal-article-bibliographic-reference/entities/journal-article-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../types/BibliographicReferenceType';

const bibliographicReferenceTypeToCtor: {
    [K in BibliographicReferenceType]: DomainModelCtor<IBibliographicReference>;
} = {
    [BibliographicReferenceType.book]: BookBibliographicReference,
    [BibliographicReferenceType.courtCase]: CourtCaseBibliographicReference,
    [BibliographicReferenceType.journalArticle]: JournalArticleBibliographicReference,
};

export const getBibliographicReferenceCtorFromSubtype = (
    subtype: BibliographicReferenceType
): DomainModelCtor<IBibliographicReference> => {
    const lookupResult = bibliographicReferenceTypeToCtor[subtype];

    if (isNullOrUndefined(lookup))
        throw new InternalError(
            `Failed to find a constructor for bibliographic reference subtype: ${subtype}`
        );

    return lookupResult;
};
