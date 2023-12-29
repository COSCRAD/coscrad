import { UnionMember } from '@coscrad/data-types';

export const BIBLIOGRAPHIC_CITATION_UNION = 'BIBLIOGRAPHIC_CITATION_UNION';

export const BibliographicCitationUnionMember = (discriminantValue: string) =>
    UnionMember(BIBLIOGRAPHIC_CITATION_UNION, discriminantValue);
