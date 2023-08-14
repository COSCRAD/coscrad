import { BaseEvent } from '../../../shared/events/base-event.entity';
import { VOCABULARY_LIST_CREATED } from './constants';

export class vocabularyListCreated extends BaseEvent {
    type = VOCABULARY_LIST_CREATED;
}
