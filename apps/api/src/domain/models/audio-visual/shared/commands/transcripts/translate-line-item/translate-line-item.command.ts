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
import { TRANSLATE_LINE_ITEM } from './constants';

@Command({
    type: TRANSLATE_LINE_ITEM,
    label: 'Translate Line Item',
    description: `Translate a line item's transcript into another language (typically English)`,
})
export class TranslateLineItem implements ICommandBase {
    @NestedDataType(AudioVisualCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier<
        typeof ResourceType.video | typeof ResourceType.audioItem
    >;

    // The time stamps must line up with an existing line item and server as a "local" identifier (within the aggregate context of the audiovisual item)
    @NonNegativeFiniteNumber({
        label: 'in point (ms)',
        description: 'the opening timestamp in milliseconds',
    })
    readonly inPointMilliseconds: number;

    @NonNegativeFiniteNumber({
        label: 'out point (ms)',
        description: 'the closing timestamp in milliseconds',
    })
    readonly outPointMilliseconds: number;

    @NonEmptyString({
        label: 'translation',
        description: `translation for this line item's text`,
    })
    readonly translation: string;

    @LanguageCodeEnum({
        label: 'language',
        description: `the language in which you are translating this line item's text`,
    })
    readonly languageCode: LanguageCode;
}
