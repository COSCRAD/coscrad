import { UnionMember, UnionType } from '@coscrad/data-types';

export const BIBLIOGRAPHIC_CITATION_DATA_UNION = `BIBLIOGRAPHIC_CITATION_DATA_UNION`;

export const BibliographicCitationDataUnionMember = (discriminantValue: string) =>
    UnionMember(BIBLIOGRAPHIC_CITATION_DATA_UNION, discriminantValue);

export const BibliographicCitationDataUnionType = ({
    label,
    description,
}: {
    label: string;
    description: string;
}) => UnionType(BIBLIOGRAPHIC_CITATION_DATA_UNION, { label, description });
