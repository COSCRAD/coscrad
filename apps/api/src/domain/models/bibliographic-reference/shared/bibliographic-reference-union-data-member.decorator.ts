import { UnionMember, UnionType } from '@coscrad/data-types';

export const BIBLIOGRAPHIC_REFERENCE_DATA_UNION = `BIBLIOGRAPHIC_REFERENCE_DATA_UNION`;

export const BibliographicReferenceDataUnionMember = (discriminantValue: string) =>
    UnionMember(BIBLIOGRAPHIC_REFERENCE_DATA_UNION, discriminantValue);

export const BibliographicReferenceDataUnionType = ({
    label,
    description,
}: {
    label: string;
    description: string;
}) => UnionType(BIBLIOGRAPHIC_REFERENCE_DATA_UNION, { label, description });
