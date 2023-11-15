import { BaseEvent } from '../../../shared/events/base-event.entity';
import { ANALYZE_TERM_IN_VOCABULARY_LIST } from './constants';

export class AnalyzeTermInVocabularyList extends BaseEvent {
    type = ANALYZE_TERM_IN_VOCABULARY_LIST;
}
