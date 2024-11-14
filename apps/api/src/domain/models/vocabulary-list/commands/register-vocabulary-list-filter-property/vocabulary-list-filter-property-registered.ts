import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { RegisterVocabularyListFilterProperty } from './register-vocabulary-list-filter-property.command';

export type VocabularyListFilterPropertyRegisteredPayload = RegisterVocabularyListFilterProperty;

@CoscradEvent('VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED')
export class VocabularyListFilterPropertyRegistered extends BaseEvent<VocabularyListFilterPropertyRegisteredPayload> {
    readonly type = 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED';
}
