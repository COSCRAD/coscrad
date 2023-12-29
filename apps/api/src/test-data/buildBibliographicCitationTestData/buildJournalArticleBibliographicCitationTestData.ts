import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { IBibliographicCitation } from '../../domain/models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { JournalArticleBibliographicCitation } from '../../domain/models/bibliographic-citation/journal-article-bibliographic-citation/entities/journal-article-bibliographic-citation.entity';
import { BibliographicCitationType } from '../../domain/models/bibliographic-citation/types/bibliographic-citation-type';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const dtos: DTO<JournalArticleBibliographicCitation>[] = [
    {
        type: ResourceType.bibliographicCitation,
        data: {
            type: BibliographicCitationType.journalArticle,
            title: 'Report on the Cariboo Chilcotin Justice inquiry',
            creators: [
                {
                    name: 'Sigurd Purcell',
                    type: BibliographicSubjectCreatorType.author,
                },
            ],
            abstract: 'An analysis of the Cariboo Chilcotin Justice inquiry.',
            issueDate: 'Spring 2013',
            publicationTitle: 'Journal of History',
            url: 'https://coscrad.org/wp-content/uploads/2023/05/Test-Journal-Article-Sample-PDF.pdf',
            // url: 'https://search.proquest.com/docview/1682229477/abstract/7836BCEA06014582PQ/1',
            issn: '00052949',
            doi: '10.14288/bcs.v0i19.784',
        },
        published: true,
        id: '23',
    },
];

export default (): IBibliographicCitation[] =>
    dtos.map((dto) => new JournalArticleBibliographicCitation(dto));
