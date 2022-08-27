import { InternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { CtorToInstance } from '../../../../lib/types/InstanceToCtor';
import { BookBibliographicReference } from '../../../models/bibliographic-reference/book-bibliographic-reference/book-bibliographic-reference.entity';
import { CourtCaseBibliographicReference } from '../../../models/bibliographic-reference/court-case-bibliographic-reference/court-case-bibliographic-reference.entity';
import { IBibliographicReference } from '../../../models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { JournalArticleBibliographicReference } from '../../../models/bibliographic-reference/journal-article-bibliographic-reference/journal-article-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../../models/bibliographic-reference/types/BibliographicReferenceType';

const bibliographicReferenceTypeToModel: {
    [K in BibliographicReferenceType]: DomainModelCtor<IBibliographicReference>;
} = {
    [BibliographicReferenceType.book]: BookBibliographicReference,
    [BibliographicReferenceType.journalArticle]: JournalArticleBibliographicReference,
    [BibliographicReferenceType.courtCase]: CourtCaseBibliographicReference,
};

export type BibliographicReferenceTypeToCtor = {
    [K in keyof typeof bibliographicReferenceTypeToModel]: typeof bibliographicReferenceTypeToModel[K];
};

export type BibliographicReferenceTypeToInstance = {
    [K in keyof BibliographicReferenceTypeToCtor]: CtorToInstance<
        BibliographicReferenceTypeToCtor[K]
    >;
};

/**
 * TODO Consolidate this with apps/api/src/domain/models/bibliographic-reference/common/getBibliographicReferenceCtorFromSubtype.ts
 */
export default <TBibliographicReferenceType extends BibliographicReferenceType>(
    bibliographicReferenceType: TBibliographicReferenceType
): BibliographicReferenceTypeToCtor[TBibliographicReferenceType] => {
    const ctor = bibliographicReferenceTypeToModel[bibliographicReferenceType];

    if (!ctor) {
        throw new InternalError(
            `No constructor registered for bibliographic reference model of type: ${bibliographicReferenceType}`
        );
    }

    return ctor;
};
