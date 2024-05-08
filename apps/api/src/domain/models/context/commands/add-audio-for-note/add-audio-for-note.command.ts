import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../..//domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../..//domain/types/AggregateId';
import { EdgeConnectionCompositeIdentifier } from '../create-note-about-resource';

@Command({
    type: 'ADD_AUDIO_FOR_NOTE',
    description: 'add audio for note',
    label: 'Add Audio for Note',
})
export class AddAudioForNote implements ICommandBase {
    @NestedDataType(EdgeConnectionCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unqiue identifier',
    })
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    @ReferenceTo(AggregateType.audioItem)
    @UUID({
        label: 'audio item ID',
        description: 'the ID for the audio item being added for note',
    })
    readonly audioItemId: AggregateId;

    @LanguageCodeEnum({
        label: 'language',
        description: 'language for the note',
    })
    readonly languageCode: LanguageCode;
}
