import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@Command({
    type: `ADD_AUDIO_FOR_DIGITAL_TEXT_TITLE`,
    description: `add audio for a digital text title`,
    label: `Add Audio for Digital Text Title`,
})
export class AddAudioForDigitalTextTitle implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: `Composite Identifier`,
        description: `system-wide unique identifier`,
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @ReferenceTo(AggregateType.audioItem)
    @UUID({
        label: `audio item ID`,
        description: `the ID of the audio item being added for digital text title`,
    })
    readonly audioItemId: AggregateId;

    @LanguageCodeEnum({
        label: `language`,
        description: `language for the text title`,
    })
    readonly languageCode: LanguageCode;
}
