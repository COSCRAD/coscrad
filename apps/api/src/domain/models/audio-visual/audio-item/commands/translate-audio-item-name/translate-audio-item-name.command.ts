import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../common/entities/multilingual-text';
import { AudioItemCompositeIdentifier } from '../../entities/audio-item-composite-identifier';
import { TRANSLATE_AUDIO_ITEM_NAME } from '../constants';

@Command({
    type: TRANSLATE_AUDIO_ITEM_NAME,
    label: 'Translate Audio Item Name',
    description: 'Translate the name of a audio item to another language',
})
export class TranslateAudioItemName implements ICommandBase {
    @NestedDataType(AudioItemCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AudioItemCompositeIdentifier;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language in which you are translating the new audio item name',
    })
    readonly languageCode: LanguageCode;

    @NonEmptyString({
        label: 'translation',
        description: 'text for the translation of the name',
    })
    readonly text: string;
}
