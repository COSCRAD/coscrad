import { BaseEvent } from '../../../shared/events/base-event.entity';
import { VOCABULARY_LIST_REGISTERED_PROPERTY_FILTER } from './constants';

export class VocabularyListRegisteredPropertyFilter extends BaseEvent {
    readonly type = VOCABULARY_LIST_REGISTERED_PROPERTY_FILTER;
}
