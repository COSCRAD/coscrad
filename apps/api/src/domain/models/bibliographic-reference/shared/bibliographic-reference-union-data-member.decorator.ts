import { Union, UnionMember } from '@coscrad/data-types';

export const BIBLIOGRAPHIC_REFERENCE_DATA_UNION = `BIBLIOGRAPHIC_REFERENCE_DATA_UNION`;

export const BibliographicReferenceDataUnionMember = (discriminantValue: string) =>
    UnionMember(BIBLIOGRAPHIC_REFERENCE_DATA_UNION, discriminantValue);

export const BibliographicReferenceDataUnion = ({
    label,
    description,
}: {
    label: string;
    description: string;
}) => Union(BIBLIOGRAPHIC_REFERENCE_DATA_UNION, 'type', { label, description });
