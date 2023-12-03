import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TERM_IN_VOCABULARY_LIST_ANALYZED } from './constants';

export class TermInVocabularyListAnalyzed extends BaseEvent {
    type = TERM_IN_VOCABULARY_LIST_ANALYZED;
}
