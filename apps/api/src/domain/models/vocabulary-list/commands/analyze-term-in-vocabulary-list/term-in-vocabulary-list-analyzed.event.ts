import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AnalyzeTermInVocabularyList } from './analyze-term-in-vocabulary-list.command';

export type TermInVocabularyListAnalyzedPayload = AnalyzeTermInVocabularyList;

@CoscradEvent('TERM_IN_VOCABULARY_LIST_ANALYZED')
export class TermInVocabularyListAnalyzed extends BaseEvent<TermInVocabularyListAnalyzedPayload> {
    readonly type = 'TERM_IN_VOCABULARY_LIST_ANALYZED';
}
