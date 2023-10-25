import { BaseEvent } from '../../../shared/events/base-event.entity';
import { VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED } from './constants';

export class VocabularyListFilterPropertyRegistered extends BaseEvent {
    type = VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED;
}
