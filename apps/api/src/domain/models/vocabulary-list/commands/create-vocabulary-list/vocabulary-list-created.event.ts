import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateVocabularyList } from './create-vocabulary-list.command';

export type VocabularyListCreatedPayload = CreateVocabularyList;

@CoscradEvent(`VOCABULARY_LIST_CREATED`)
export class VocabularyListCreated extends BaseEvent<VocabularyListCreatedPayload> {
    type = 'VOCABULARY_LIST_CREATED';
}
