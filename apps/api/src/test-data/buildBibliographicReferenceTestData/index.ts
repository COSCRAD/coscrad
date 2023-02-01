import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { convertAggregatesIdToUuid } from '../utilities/convertSequentialIdToUuid';
import buildBookBibliographicReferenceTestData from './buildBookBibliographicReferenceTestData';
import buildCourtCaseBibliographicReferenceTestData from './buildCourtCaseBibliographicReferenceTestData';
import buildJournalArticleBibliographicReferenceTestData from './buildJournalArticleBibliographicReferenceTestData';

export default (): IBibliographicReference[] =>
    [
        ...buildBookBibliographicReferenceTestData(),
        ...buildJournalArticleBibliographicReferenceTestData(),
        ...buildCourtCaseBibliographicReferenceTestData(),
    ].map(convertAggregatesIdToUuid);
