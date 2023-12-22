import { InternalError } from '../../../../lib/errors/InternalError';
import { CtorToInstance } from '../../../../lib/types/InstanceToCtor';
import { BookBibliographicCitation } from '../../../models/bibliographic-citation/book-bibliographic-citation/entities/book-bibliographic-citation.entity';
import { CourtCaseBibliographicCitation } from '../../../models/bibliographic-citation/court-case-bibliographic-citation/entities/court-case-bibliographic-citation.entity';
import { JournalArticleBibliographicCitation } from '../../../models/bibliographic-citation/journal-article-bibliographic-citation/entities/journal-article-bibliographic-citation.entity';
import { BibliographicCitationType } from '../../../models/bibliographic-citation/types/bibliogrpahic-citation-type';

/**
 * TODO Can we use dynamic registration instead of lookup tables for these
 * subtypes?
 */
const BibliographicCitationTypeToModel = {
    [BibliographicCitationType.book]: BookBibliographicCitation,
    [BibliographicCitationType.journalArticle]: JournalArticleBibliographicCitation,
    [BibliographicCitationType.courtCase]: CourtCaseBibliographicCitation,
} as const;

export type BibliographicCitationTypeToCtor = {
    [K in keyof typeof BibliographicCitationTypeToModel]: typeof BibliographicCitationTypeToModel[K];
};

export type BibliographicCitationTypeToInstance = {
    [K in keyof BibliographicCitationTypeToCtor]: CtorToInstance<
        BibliographicCitationTypeToCtor[K]
    >;
};

/**
 * TODO Consolidate this with apps/api/src/domain/models/bibliographic-citation/common/getBibliographicCitationCtorFromSubtype.ts
 */
export default <TBibliographicCitationType extends BibliographicCitationType>(
    BibliographicCitationType: TBibliographicCitationType
): BibliographicCitationTypeToCtor[TBibliographicCitationType] => {
    const ctor = BibliographicCitationTypeToModel[BibliographicCitationType];

    if (!ctor) {
        throw new InternalError(
            `No constructor registered for bibliographic reference model of type: ${BibliographicCitationType}`
        );
    }

    return ctor;
};
