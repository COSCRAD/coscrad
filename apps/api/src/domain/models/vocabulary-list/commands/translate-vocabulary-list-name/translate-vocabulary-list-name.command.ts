import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { VocabularyListCompositeId } from '../create-vocabulary-list';
import { TRANSLATE_VOCABULARY_LIST_NAME } from './constants';

@Command({
    type: TRANSLATE_VOCABULARY_LIST_NAME,
    label: 'translate vocabulary list name',
    description: 'translating vocabulary list name',
})
export class TranslateVocabularyListName implements ICommandBase {
    @NestedDataType(VocabularyListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: VocabularyListCompositeId;

    @LanguageCodeEnum({
        label: 'language code',
        description: 'the language in which you are naming the new vocabulary list name',
    })
    readonly languageCode: LanguageCode;

    @NonEmptyString({
        label: 'translation',
        description: 'text for the translation of the name',
    })
    readonly text: string;
}
