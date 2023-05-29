import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../types/AggregateId';
import { PlayListCompositeId } from '../create-playlist.command';

@Command({
    type: 'ADD_AUDIO_ITEM_TO_PLAYLIST',
    label: 'Add item to Playlist',
    description: 'add item to an existing playlist',
})
export class AddAudioItemToPlaylist implements ICommandBase {
    @NestedDataType(PlayListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: PlayListCompositeId;

    @ReferenceTo(AggregateType.audioItem)
    @UUID({
        label: 'audio item ID',
        description: 'the ID of the audio item being added to this playlist',
    })
    readonly audioItemId: AggregateId;
}
