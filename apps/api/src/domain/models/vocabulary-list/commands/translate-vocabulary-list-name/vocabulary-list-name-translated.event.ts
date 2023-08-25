import { BaseEvent } from '../../../shared/events/base-event.entity';
import { VOCABULARY_LIST_TRANSLATED } from './constants';
export class VocabularyListTranslated extends BaseEvent {
    readonly type = VOCABULARY_LIST_TRANSLATED;
}
