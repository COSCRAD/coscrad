import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, ReferenceTo, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { PageIdentifier } from '../../entities';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@Command({
    type: `ADD_AUDIO_FOR_DIGITAL_TEXT_PAGE`,
    description: `add audio for a digital text page`,
    label: `Add Audio for Digital Text Page`,
})
export class AddAudioForDigitalTextPage implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: `Composite Identifier`,
        description: `system-wide unique identifier`,
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @NonEmptyString({
        label: `page identifier`,
        description: `the identifier for the page`,
    })
    readonly pageIdentifier: PageIdentifier;

    @ReferenceTo(AggregateType.audioItem)
    @UUID({
        label: `audio item ID`,
        description: `the ID of the audio item being added for digital text page`,
    })
    readonly audioItemId: AggregateId;

    @LanguageCodeEnum({
        label: `language`,
        description: `language for the text page`,
    })
    readonly languageCode: LanguageCode;
}
