import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TERM_ADDED_TO_VOCABULARY_LIST } from './constants';

export class TermAddedToVocabularyList extends BaseEvent {
    type = TERM_ADDED_TO_VOCABULARY_LIST;
}
