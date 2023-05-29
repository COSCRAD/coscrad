import { CourtCaseBibliographicReference } from '../../domain/models/bibliographic-reference/court-case-bibliographic-reference/entities/court-case-bibliographic-reference.entity';
import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { BibliographicReferenceType } from '../../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const dtos: DTO<CourtCaseBibliographicReference>[] = [
    {
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.courtCase,
            caseName: '2002-07-08_NationTitleCase',
            abstract:
                'Doe, Jane\n- Large Valley\n- Qualifying as an expert in the written language',
            dateDecided: 'Recorded 2002-07-08',
            court: 'Supreme Court of British Columbia',
            url: 'https://coscrad.org/wp-content/uploads/2023/05/mock-court-case-bibliographic-reference-3_title-case.pdf',
            pages: 'Pages 1-6',
        },
        published: true,
        id: '3',
    },
];

export default (): IBibliographicReference[] =>
    dtos.map((dto) => new CourtCaseBibliographicReference(dto));
