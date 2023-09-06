import { Union } from '@coscrad/data-types';
import { BIBLIOGRAPHIC_REFERENCE_DATA_UNION } from './bibliographic-reference-union-data-member.decorator';

@Union(BIBLIOGRAPHIC_REFERENCE_DATA_UNION, 'type')
export class BibliographicReferenceDataUnion {}
