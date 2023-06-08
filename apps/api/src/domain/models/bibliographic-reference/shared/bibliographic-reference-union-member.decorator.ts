import { UnionMember } from '@coscrad/data-types';

export const BIBLIOGRAPHIC_REFERENCE_UNION = 'BIBLIOGRAPHIC_REFERENCE_UNION';

export const BibliographicReferenceUnionMember = (discriminantValue: string) =>
    UnionMember(BIBLIOGRAPHIC_REFERENCE_UNION, discriminantValue);
