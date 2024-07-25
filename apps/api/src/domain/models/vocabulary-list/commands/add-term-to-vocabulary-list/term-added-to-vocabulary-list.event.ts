import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddTermToVocabularyList } from './add-term-to-vocabulary-list.command';

export type TermAddedToVocabularyListPayload = AddTermToVocabularyList;

@CoscradEvent('TERM_ADDED_TO_VOCABULARY_LIST')
export class TermAddedToVocabularyList extends BaseEvent<TermAddedToVocabularyListPayload> {
    readonly type = 'TERM_ADDED_TO_VOCABULARY_LIST';
}
