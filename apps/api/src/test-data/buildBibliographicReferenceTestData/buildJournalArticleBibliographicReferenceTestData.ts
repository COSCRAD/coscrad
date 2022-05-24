import { JournalArticleBibliographicReference } from '../../domain/models/bibliographic-reference/entities/journalArticle-bibliographic-reference.entity';
import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import { BibliographicReferenceType } from '../../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { CreatorType } from '../../domain/models/bibliographic-reference/types/CreatorType';
import { resourceTypes } from '../../domain/types/resourceTypes';
import { DTO } from '../../types/DTO';

const dtos: DTO<JournalArticleBibliographicReference>[] = [
    {
        type: resourceTypes.bibliographicReference,
        data: {
            type: BibliographicReferenceType.journalArticle,
            title: 'Report on the Cariboo Chilcotin Justice inquiry',
            creators: [
                {
                    name: 'Sigurd Purcell',
                    type: CreatorType.author,
                },
            ],
            abstract: 'An analysis of the Cariboo Chilcotin Justice inquiry.',
            issueDate: 'Spring 2013',
            publicationTitle: 'Journal of History',
            url: 'https://search.proquest.com/docview/1682229477/abstract/7836BCEA06014582PQ/1',
            pages: '109-113,115-136,240',
            issn: '00052949',
            doi: '10.14288/bcs.v0i19.784',
        },
        published: true,
        id: '23',
    },
];

export default (): IBibliographicReference[] =>
    dtos.map((dto) => new JournalArticleBibliographicReference(dto));
