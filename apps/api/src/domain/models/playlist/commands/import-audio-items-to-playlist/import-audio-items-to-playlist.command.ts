import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { PlayListCompositeId } from '../create-playlist.command';

@Command({
    type: 'IMPORT_AUDIO_ITEMS_TO_PLAYLIST',
    label: 'import audio items to playlist',
    description: 'importing audio items to playlist',
})
export class ImportAudioItemsToPlaylist implements ICommandBase {
    @NestedDataType(PlayListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: PlayListCompositeId;

    @ReferenceTo(AggregateType.audioItem)
    @UUID({
        label: 'audio item IDs',
        description: 'the IDs of the audio items being added to this playlist',
        isArray: true,
    })
    readonly audioItemIds: AggregateId[];
}
