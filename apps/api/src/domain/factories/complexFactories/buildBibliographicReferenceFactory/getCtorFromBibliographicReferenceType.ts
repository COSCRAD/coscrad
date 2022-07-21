import { InternalError } from '../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { BookBibliographicReference } from '../../../models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { JournalArticleBibliographicReference } from '../../../models/bibliographic-reference/entities/journal-article-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../../models/bibliographic-reference/types/BibliographicReferenceType';

const bibliographicReferenceTypeToModel = {
    [BibliographicReferenceType.book]: BookBibliographicReference,
    [BibliographicReferenceType.journalArticle]: JournalArticleBibliographicReference,
};

export type BibliographicReferenceTypeToInstance = {
    [BibliographicReferenceType.book]: BookBibliographicReference;
    [BibliographicReferenceType.journalArticle]: JournalArticleBibliographicReference;
};

export type BibliographicReferenceTypeToCtor = {
    [BibliographicReferenceType.book]: DomainModelCtor<BookBibliographicReference>;
    [BibliographicReferenceType.journalArticle]: DomainModelCtor<JournalArticleBibliographicReference>;
};

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
