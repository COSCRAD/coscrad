import { CourtCaseBibliographicCitation } from '../../domain/models/bibliographic-citation/court-case-bibliographic-citation/entities/court-case-bibliographic-citation.entity';
import { IBibliographicCitation } from '../../domain/models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { BibliographicCitationType } from '../../domain/models/bibliographic-citation/types/bibliographic-citation-type';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const dtos: DTO<CourtCaseBibliographicCitation>[] = [
    {
        type: ResourceType.bibliographicCitation,
        data: {
            type: BibliographicCitationType.courtCase,
            caseName: '2002-07-08_NationTitleCase',
            abstract:
                'Doe, Jane\n- Large Valley\n- Qualifying as an expert in the written language',
            dateDecided: 'Recorded 2002-07-08',
            court: 'Supreme Court of British Columbia',
            url: 'https://coscrad.org/wp-content/uploads/2023/05/mock-court-case-bibliographic-citation-3_title-case.pdf',
            pages: 'Pages 1-6',
        },
        published: true,
        id: '3',
    },
];

export default (): IBibliographicCitation[] =>
    dtos.map((dto) => new CourtCaseBibliographicCitation(dto));
