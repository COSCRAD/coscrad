import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AnalyzeTermInVocabularyList } from './analyze-term-in-vocabulary-list.command';
import { TERM_IN_VOCABULARY_LIST_ANALYZED } from './constants';

export type TermInVocabularyListAnalyzedPayload = AnalyzeTermInVocabularyList;

@CoscradEvent(TERM_IN_VOCABULARY_LIST_ANALYZED)
export class TermInVocabularyListAnalyzed extends BaseEvent<TermInVocabularyListAnalyzedPayload> {
    type = TERM_IN_VOCABULARY_LIST_ANALYZED;
}
