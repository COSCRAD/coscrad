import { IBibliographicCitation } from '../../domain/models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { convertAggregatesIdToUuid } from '../utilities/convertSequentialIdToUuid';
import buildBookBibliographicCitationTestData from './buildBookBibliographicCitationTestData';
import buildCourtCaseBibliographicCitationTestData from './buildCourtCaseBibliographicCitationTestData';
import buildJournalArticleBibliographicCitationTestData from './buildJournalArticleBibliographicCitationTestData';

export default (): IBibliographicCitation[] =>
    [
        ...buildBookBibliographicCitationTestData(),
        ...buildJournalArticleBibliographicCitationTestData(),
        ...buildCourtCaseBibliographicCitationTestData(),
    ].map(convertAggregatesIdToUuid);
