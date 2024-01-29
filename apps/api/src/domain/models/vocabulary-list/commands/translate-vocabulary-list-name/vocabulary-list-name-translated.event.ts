import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslateVocabularyListName } from './translate-vocabulary-list-name.command';

export type VocabularyListNameTranslatedPayload = TranslateVocabularyListName;

@CoscradEvent('VOCABULARY_LIST_NAME_TRANSLATED')
export class VocabularyListNameTranslated extends BaseEvent<VocabularyListNameTranslatedPayload> {
    readonly type = 'VOCABULARY_LIST_NAME_TRANSLATED';
}
