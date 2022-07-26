import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import buildBookBibliographicReferenceTestData from './buildBookBibliographicReferenceTestData';
import buildJournalArticleBibliographicReferenceTestData from './buildJournalArticleBibliographicReferenceTestData';

export default (): IBibliographicReference[] => [
    ...buildBookBibliographicReferenceTestData(),
    ...buildJournalArticleBibliographicReferenceTestData(),
];
