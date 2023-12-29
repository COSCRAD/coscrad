import { Union } from '@coscrad/data-types';
import { BIBLIOGRAPHIC_CITATION_DATA_UNION } from './bibliographic-citation-union-data-member.decorator';

@Union(BIBLIOGRAPHIC_CITATION_DATA_UNION, 'type')
export class BibliographicCitationDataUnion {}
