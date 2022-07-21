import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import buildBookBibliographicReferenceTestData from './buildBookBibliographicReferenceTestData';
import buildJournalArticleBibliographicReferenceTestData from './buildJournalArticleBibliographicReferenceTestData';

export default (): IBibliographicReference[] => [
    ...buildBookBibliographicReferenceTestData(),
    ...buildJournalArticleBibliographicReferenceTestData(),
];
