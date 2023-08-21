import { BaseEvent } from '../../../shared/events/base-event.entity';

export class VocabularyListTranslated extends BaseEvent {
    readonly type = 'VOCABULARY_LIST_TRANSLATED';
}
