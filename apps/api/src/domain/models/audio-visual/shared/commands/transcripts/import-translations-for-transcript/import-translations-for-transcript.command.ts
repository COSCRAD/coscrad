import {
    ICommandBase,
    LanguageCode,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../../common/entities/multilingual-text';
import { AudioVisualCompositeIdentifier } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { IMPORT_TRANSLATIONS_FOR_TRANSCRIPT } from './constants';

export class TranslationItem {
    @NonNegativeFiniteNumber({
        label: 'in point (ms)',
        description: 'the opening timestamp in milliseconds',
    })
    readonly inPointMilliseconds: number;

    @NonEmptyString({
        label: 'translation',
        description: 'translation for the transcript',
    })
    readonly translation: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language for this text item',
    })
    readonly languageCode: LanguageCode;
}

@Command({
    type: IMPORT_TRANSLATIONS_FOR_TRANSCRIPT,
    description: 'import translations for the transcript',
    label: 'Import Translations For Transcript',
})
export class ImportTranslationsForTranscript implements ICommandBase {
    @NestedDataType(AudioVisualCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier<
        typeof ResourceType.video | typeof ResourceType.audioItem
    >;

    @NestedDataType(TranslationItem, {
        label: 'translation items',
        description: 'translations for the items',
        isArray: true,
        isOptional: false,
    })
    readonly translationItems: TranslationItem[];
}
