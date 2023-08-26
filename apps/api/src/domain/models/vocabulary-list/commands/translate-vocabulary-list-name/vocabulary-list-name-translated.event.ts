import { BaseEvent } from '../../../shared/events/base-event.entity';
import { VOCABULARY_LIST_NAME_TRANSLATED } from './constants';
export class VocabularyListNameTranslated extends BaseEvent {
    readonly type = VOCABULARY_LIST_NAME_TRANSLATED;
}
