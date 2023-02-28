import { ICommandBase, ResourceCompositeIdentifier, ResourceType } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    CoscradMultilingualText,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
} from '@coscrad/data-types';
import { MultilingualText } from '../../../../../common/entities/multilingual-text';
import { AudioVisualCompositeIdentifier } from '../../../entities/audio-item-composite-identifier';
import { ADD_LINE_ITEM_TO_TRANSCRIPT } from '../constants';

@Command({
    type: ADD_LINE_ITEM_TO_TRANSCRIPT,
    description: `Add another time-stamped text item for this transcript`,
    label: `Add line item to transcript`,
})
export class AddLineItemToTranscript implements ICommandBase {
    @NestedDataType(AudioVisualCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier<
        typeof ResourceType.video | typeof ResourceType.audioItem
    >;

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

    @CoscradMultilingualText({
        label: 'text',
        description: 'multi-lingual text transcription  translation',
    })
    readonly text: MultilingualText;

    @NonEmptyString({
        label: 'speaker initials',
        description: 'the initials of the speaker whose words you are transcribing \\ translating',
    })
    readonly speakerInitials: string;
}
